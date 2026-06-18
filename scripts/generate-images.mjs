// Marketing images for both languages, built from a single source of truth.
//   site/assets/og.png        (TR, 1200x630)  · link-preview / OG
//   site/assets/og-en.png     (EN, 1200x630)
//   docs/images/banner.png    (TR, 1400x560)  · GitHub README banner
//   docs/images/banner-en.png (EN, 1400x560)
//
// Layout: framed logo + wordmark, headline, subline, and a popup mockup —
// the framed tile keeps the speech-bubble logo balanced (the bare tail looks crooked).
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const logoPath = join(root, 'assets', 'logo.png');

const FONT = 'Helvetica, Arial, sans-serif';

const C = {
  bg: '#07070b',
  surface: '#121219',
  surface2: '#16161f',
  border: '#262630',
  borderSoft: '#1d1d26',
  tile: '#16161f',
  tileBorder: '#2a2a36',
  text: '#f5f5f8',
  muted: '#a0a0b0',
  faint: '#8a8a98',
  yt: '#ff3b3b',
};

const STR = {
  tr: {
    h1: 'Kaydırmayı bırak,',
    h2: 'izlemeye devam et.',
    ogSub: 'YouTube Shorts + Instagram Reels otomatik geçiş',
    ogFeat: 'Açık kaynak · Veri toplamaz · Ücretsiz',
    bannerSub: "Shorts &amp; Reels'te otomatik geçiş · YouTube dislike sayıları · Açık kaynak",
    yt: 'YOUTUBE',
    ig: 'INSTAGRAM',
    rowYtAuto: "Shorts'ta otomatik geçiş",
    rowYtDislike: 'Dislike sayısını göster',
    rowIgAuto: "Reels'te otomatik geçiş",
  },
  en: {
    h1: 'Stop scrolling,',
    h2: 'keep watching.',
    ogSub: 'Auto-advance YouTube Shorts &amp; Instagram Reels',
    ogFeat: 'Open source · No tracking · Free',
    bannerSub: 'Auto-advance on Shorts &amp; Reels · YouTube dislike counts · Open source',
    yt: 'YOUTUBE',
    ig: 'INSTAGRAM',
    rowYtAuto: 'Auto-advance on Shorts',
    rowYtDislike: 'Show dislike count',
    rowIgAuto: 'Auto-advance on Reels',
  },
};

function defs() {
  return `
    <defs>
      <linearGradient id="brand" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#3aa8e0"/>
        <stop offset="1" stop-color="#6a4fe8"/>
      </linearGradient>
      <linearGradient id="ig" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f5a623"/>
        <stop offset="0.55" stop-color="#e0395e"/>
        <stop offset="1" stop-color="#8134af"/>
      </linearGradient>
      <radialGradient id="glowA" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#3aa8e0" stop-opacity="0.20"/>
        <stop offset="1" stop-color="#3aa8e0" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glowB" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#6a4fe8" stop-opacity="0.30"/>
        <stop offset="1" stop-color="#6a4fe8" stop-opacity="0"/>
      </radialGradient>
    </defs>`;
}

function toggle(x, y) {
  return `
    <rect x="${x}" y="${y}" width="44" height="24" rx="12" fill="url(#brand)"/>
    <circle cx="${x + 32}" cy="${y + 12}" r="9" fill="#ffffff"/>`;
}

function ytIcon(x, y, s = 22) {
  return `
    <rect x="${x}" y="${y}" width="${s}" height="${s * 0.74}" rx="${s * 0.26}" fill="${C.yt}"/>
    <path d="M${x + s * 0.37} ${y + s * 0.2} V${y + s * 0.54} L${x + s * 0.66} ${y + s * 0.37} Z" fill="#fff"/>`;
}

function igIcon(x, y, s = 22) {
  return `
    <rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * 0.28}" fill="url(#ig)"/>
    <rect x="${x + s * 0.26}" y="${y + s * 0.26}" width="${s * 0.48}" height="${s * 0.48}" rx="${s * 0.18}" fill="none" stroke="#fff" stroke-width="${s * 0.085}"/>
    <circle cx="${x + s * 0.72}" cy="${y + s * 0.28}" r="${s * 0.055}" fill="#fff"/>`;
}

// Popup mockup (width 400, height 392). Logo composited separately at header.
function popup(px, py, t) {
  const w = 400;
  return `
    <ellipse cx="${px + w / 2}" cy="${py + 200}" rx="280" ry="240" fill="url(#glowB)"/>
    <rect x="${px}" y="${py}" width="${w}" height="392" rx="26" fill="${C.surface}" stroke="${C.border}" stroke-width="1.5"/>
    <text x="${px + 70}" y="${py + 48}" font-family="${FONT}" font-size="22" font-weight="800" fill="url(#brand)">Social Tweaks</text>

    <rect x="${px + 20}" y="${py + 78}" width="360" height="150" rx="16" fill="${C.surface2}" stroke="${C.borderSoft}" stroke-width="1.5"/>
    ${ytIcon(px + 40, py + 100, 22)}
    <text x="${px + 72}" y="${py + 118}" font-family="${FONT}" font-size="13" font-weight="700" letter-spacing="2" fill="${C.faint}">${t.yt}</text>
    <text x="${px + 40}" y="${py + 160}" font-family="${FONT}" font-size="17" fill="${C.text}">${t.rowYtAuto}</text>
    ${toggle(px + 296, py + 148)}
    <line x1="${px + 40}" y1="${py + 184}" x2="${px + 360}" y2="${py + 184}" stroke="${C.borderSoft}" stroke-width="1.5"/>
    <text x="${px + 40}" y="${py + 210}" font-family="${FONT}" font-size="17" fill="${C.text}">${t.rowYtDislike}</text>
    ${toggle(px + 296, py + 198)}

    <rect x="${px + 20}" y="${py + 244}" width="360" height="118" rx="16" fill="${C.surface2}" stroke="${C.borderSoft}" stroke-width="1.5"/>
    ${igIcon(px + 40, py + 266, 22)}
    <text x="${px + 72}" y="${py + 284}" font-family="${FONT}" font-size="13" font-weight="700" letter-spacing="2" fill="${C.faint}">${t.ig}</text>
    <text x="${px + 40}" y="${py + 330}" font-family="${FONT}" font-size="17" fill="${C.text}">${t.rowIgAuto}</text>
    ${toggle(px + 296, py + 318)}`;
}

// Trimmed, centered bubble (sits balanced inside the tile / popup header).
async function bubble(size) {
  return sharp(logoPath)
    .trim()
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
}

// ---- OG layout (1200x630) ----
function ogSvg(t) {
  const W = 1200, H = 630;
  const TILE = 60, TLX = 80, TLY = 78, POPX = 748, POPY = 119;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    ${defs()}
    <rect width="${W}" height="${H}" fill="${C.bg}"/>
    <ellipse cx="200" cy="40" rx="560" ry="440" fill="url(#glowA)"/>
    <ellipse cx="1080" cy="600" rx="600" ry="500" fill="url(#glowB)"/>
    <rect x="${TLX}" y="${TLY}" width="${TILE}" height="${TILE}" rx="16" ry="16" fill="${C.tile}" stroke="${C.tileBorder}" stroke-width="1.5"/>
    <text x="${TLX + TILE + 18}" y="${TLY + 40}" font-family="${FONT}" font-size="30" font-weight="800" fill="${C.text}">Social Tweaks</text>
    <text x="${TLX}" y="262" font-family="${FONT}" font-size="62" font-weight="800" letter-spacing="-2" fill="${C.text}">${t.h1}</text>
    <text x="${TLX}" y="334" font-family="${FONT}" font-size="62" font-weight="800" letter-spacing="-2" fill="url(#brand)">${t.h2}</text>
    <text x="${TLX + 2}" y="408" font-family="${FONT}" font-size="22" fill="${C.muted}">${t.ogSub}</text>
    <text x="${TLX + 2}" y="486" font-family="${FONT}" font-size="20" font-weight="700" fill="${C.faint}">${t.ogFeat}</text>
    ${popup(POPX, POPY, t)}
  </svg>`;
  return { TILE, TLX, TLY, LOGO: 46, POPX, POPY, svg };
}

// ---- Banner layout (1400x560) ----
function bannerSvg(t) {
  const W = 1400, H = 560;
  const TILE = 56, TLX = 110, TLY = 92, POPX = 900, POPY = 84;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    ${defs()}
    <rect width="${W}" height="${H}" fill="${C.bg}"/>
    <ellipse cx="250" cy="80" rx="620" ry="480" fill="url(#glowA)"/>
    <ellipse cx="1200" cy="480" rx="640" ry="520" fill="url(#glowB)"/>
    <rect x="${TLX}" y="${TLY}" width="${TILE}" height="${TILE}" rx="15" ry="15" fill="${C.tile}" stroke="${C.tileBorder}" stroke-width="1.5"/>
    <text x="${TLX + TILE + 16}" y="${TLY + 38}" font-family="${FONT}" font-size="28" font-weight="800" fill="${C.text}">Social Tweaks</text>
    <text x="${TLX}" y="272" font-family="${FONT}" font-size="58" font-weight="800" letter-spacing="-2" fill="${C.text}">${t.h1}</text>
    <text x="${TLX}" y="342" font-family="${FONT}" font-size="58" font-weight="800" letter-spacing="-2" fill="url(#brand)">${t.h2}</text>
    <text x="${TLX + 2}" y="408" font-family="${FONT}" font-size="20" fill="${C.muted}">${t.bannerSub}</text>
    ${popup(POPX, POPY, t)}
  </svg>`;
  return { TILE, TLX, TLY, LOGO: 42, POPX, POPY, svg };
}

async function render(layout, file) {
  const { TILE, TLX, TLY, LOGO, POPX, POPY, svg } = layout;
  const tileLogo = await bubble(LOGO);
  const popupLogo = await bubble(34);
  const tileLeft = TLX + Math.round((TILE - LOGO) / 2);
  const tileTop = TLY + Math.round((TILE - LOGO) / 2);

  await sharp(Buffer.from(svg))
    .composite([
      { input: tileLogo, left: tileLeft, top: tileTop },
      { input: popupLogo, left: POPX + 24, top: POPY + 22 },
    ])
    .flatten({ background: C.bg })
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toFile(file);
  console.log('✓', file.replace(root + '/', ''));
}

await render(ogSvg(STR.tr), join(root, 'site', 'assets', 'og.png'));
await render(ogSvg(STR.en), join(root, 'site', 'assets', 'og-en.png'));
await render(bannerSvg(STR.tr), join(root, 'docs', 'images', 'banner.png'));
await render(bannerSvg(STR.en), join(root, 'docs', 'images', 'banner-en.png'));
console.log('\nTüm görseller üretildi.');
