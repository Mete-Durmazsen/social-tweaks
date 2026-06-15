// assets/logo.png kaynağından 16/48/128 px ikonları üretir ve src/icons altına yazar.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const source = join(root, 'assets', 'logo.png');
const outDir = join(root, 'src', 'icons');
mkdirSync(outDir, { recursive: true });

// Logo etrafındaki şeffaf boşluğu kırp, böylece simge küçük boyutlarda
// (örn. araç çubuğunda 16px) daha büyük ve görünür olsun. Kırpılan görüntü
// kare olmadığı için resize sırasında "contain" kullanılır; aksi halde
// sharp'ın varsayılan "cover" davranışı kenarlardan kırpar.
const trimmed = await sharp(source).trim().toBuffer();

for (const size of [16, 48, 128]) {
  const outPath = join(outDir, `icon${size}.png`);
  await sharp(trimmed)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toFile(outPath);
  console.log(`icon${size}.png yazıldı`);
}
