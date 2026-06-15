// Bağımlılıksız basit ikon üretici.
// Kırmızı zemin üzerine beyaz "sonraki" (aşağı çift ok benzeri) üçgen çizer.
// 16/48/128 px PNG dosyalarını src/icons altına yazar.
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'src', 'icons');
mkdirSync(outDir, { recursive: true });

const BG = [204, 0, 0, 255]; // YouTube kırmızısı
const FG = [255, 255, 255, 255];

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crc]);
}

function encodePng(size, pixels) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  // 10,11,12 = 0 (deflate, adaptive filter, no interlace)

  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter type 0
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = deflateSync(raw);
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdr),
    chunk('IDAT', idat),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function drawIcon(size) {
  const px = Buffer.alloc(size * size * 4);
  const set = (x, y, [r, g, b, a]) => {
    const i = (y * size + x) * 4;
    px[i] = r;
    px[i + 1] = g;
    px[i + 2] = b;
    px[i + 3] = a;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      set(x, y, BG);
    }
  }

  // Aşağı bakan beyaz üçgen ("sonraki short").
  const cx = size / 2;
  const top = size * 0.3;
  const bottom = size * 0.7;
  const halfW = size * 0.22;
  for (let y = Math.floor(top); y <= Math.ceil(bottom); y++) {
    const t = (y - top) / (bottom - top); // 0..1
    const w = halfW * (1 - t);
    for (let x = Math.floor(cx - w); x <= Math.ceil(cx + w); x++) {
      if (x >= 0 && x < size && y >= 0 && y < size) set(x, y, FG);
    }
  }

  return encodePng(size, px);
}

for (const size of [16, 48, 128]) {
  const png = drawIcon(size);
  writeFileSync(join(outDir, `icon${size}.png`), png);
  console.log(`icon${size}.png yazıldı (${png.length} bayt)`);
}
