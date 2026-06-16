import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const out = join(root, 'store-assets');
const logoPath = join(root, 'assets', 'logo.png');

// ---- palette ----
const C = {
  bg: '#07070b',
  surface: '#121219',
  surface2: '#16161f',
  border: '#262630',
  borderSoft: '#1d1d26',
  text: '#f5f5f8',
  muted: '#a0a0b0',
  faint: '#70707f',
  yt: '#ff3b3b',
};

const FONT = 'Helvetica, Arial, sans-serif';

// ---- shared svg defs (gradients + glow) ----
function defs() {
  return `
    <defs>
      <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#3aa8e0"/>
        <stop offset="1" stop-color="#6a4fe8"/>
      </linearGradient>
      <linearGradient id="ig" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#f5a623"/>
        <stop offset="0.55" stop-color="#e0395e"/>
        <stop offset="1" stop-color="#8134af"/>
      </linearGradient>
      <radialGradient id="glowA" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#3aa8e0" stop-opacity="0.28"/>
        <stop offset="1" stop-color="#3aa8e0" stop-opacity="0"/>
      </radialGradient>
      <radialGradient id="glowB" cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#6a4fe8" stop-opacity="0.32"/>
        <stop offset="1" stop-color="#6a4fe8" stop-opacity="0"/>
      </radialGradient>
    </defs>`;
}

function bg(w, h, glows = []) {
  const g = glows
    .map(
      ([cx, cy, rx, ry, id]) =>
        `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${id})"/>`
    )
    .join('');
  return `<rect width="${w}" height="${h}" fill="${C.bg}"/>${g}`;
}

// ---- on toggle pill ----
function toggle(x, y) {
  return `
    <rect x="${x}" y="${y}" width="44" height="24" rx="12" fill="url(#brand)"/>
    <circle cx="${x + 32}" cy="${y + 12}" r="9" fill="#ffffff"/>`;
}

// ---- platform mini icons ----
function ytIcon(x, y, s = 24) {
  return `
    <rect x="${x}" y="${y}" width="${s}" height="${s * 0.74}" rx="${s * 0.26}" fill="${C.yt}"/>
    <path d="M${x + s * 0.37} ${y + s * 0.2} V${y + s * 0.54} L${x + s * 0.66} ${y + s * 0.37} Z" fill="#fff"/>`;
}
function igIcon(x, y, s = 24) {
  const r = s * 0.16;
  return `
    <rect x="${x}" y="${y}" width="${s}" height="${s}" rx="${s * 0.28}" fill="url(#ig)"/>
    <rect x="${x + s * 0.26}" y="${y + s * 0.26}" width="${s * 0.48}" height="${s * 0.48}" rx="${s * 0.18}" fill="none" stroke="#fff" stroke-width="${s * 0.085}"/>
    <circle cx="${x + s * 0.72}" cy="${y + s * 0.28}" r="${s * 0.055}" fill="#fff"/>`;
}

// ---- popup mockup group, origin px,py, width 400 ----
function popup(px, py) {
  const w = 400;
  return `
    <ellipse cx="${px + w / 2}" cy="${py + 200}" rx="280" ry="240" fill="url(#glowB)"/>
    <rect x="${px}" y="${py}" width="${w}" height="392" rx="26" fill="${C.surface}" stroke="${C.border}" stroke-width="1.5"/>

    <!-- header -->
    <text x="${px + 70}" y="${py + 48}" font-family="${FONT}" font-size="22" font-weight="800" fill="url(#brand)">Social Tweaks</text>

    <!-- youtube card -->
    <rect x="${px + 20}" y="${py + 78}" width="360" height="150" rx="16" fill="${C.surface2}" stroke="${C.borderSoft}" stroke-width="1.5"/>
    ${ytIcon(px + 40, py + 100, 22)}
    <text x="${px + 72}" y="${py + 118}" font-family="${FONT}" font-size="13" font-weight="700" letter-spacing="2" fill="${C.faint}">YOUTUBE</text>
    <text x="${px + 40}" y="${py + 160}" font-family="${FONT}" font-size="17" fill="${C.text}">Shorts'ta otomatik geçiş</text>
    ${toggle(px + 296, py + 148)}
    <line x1="${px + 40}" y1="${py + 184}" x2="${px + 360}" y2="${py + 184}" stroke="${C.borderSoft}" stroke-width="1.5"/>
    <text x="${px + 40}" y="${py + 210}" font-family="${FONT}" font-size="17" fill="${C.text}">Dislike sayısını göster</text>
    ${toggle(px + 296, py + 198)}

    <!-- instagram card -->
    <rect x="${px + 20}" y="${py + 244}" width="360" height="118" rx="16" fill="${C.surface2}" stroke="${C.borderSoft}" stroke-width="1.5"/>
    ${igIcon(px + 40, py + 266, 22)}
    <text x="${px + 72}" y="${py + 284}" font-family="${FONT}" font-size="13" font-weight="700" letter-spacing="2" fill="${C.faint}">INSTAGRAM</text>
    <text x="${px + 40}" y="${py + 330}" font-family="${FONT}" font-size="17" fill="${C.text}">Reels'te otomatik geçiş</text>
    ${toggle(px + 296, py + 318)}`;
}

function chip(x, y, text) {
  const wbox = 16 + text.length * 8.3 + 22;
  return `
    <rect x="${x}" y="${y}" width="${wbox}" height="38" rx="19" fill="#ffffff" fill-opacity="0.04" stroke="${C.border}" stroke-width="1.5"/>
    <circle cx="${x + 19}" cy="${y + 19}" r="4.5" fill="#36d27a"/>
    <text x="${x + 32}" y="${y + 24}" font-family="${FONT}" font-size="14.5" fill="${C.muted}">${text}</text>`;
}

function check(x, y) {
  return `<path d="M${x} ${y} l4 4 l8 -9" fill="none" stroke="#3aa8e0" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>`;
}

// =========================================================
//  ASSETS
// =========================================================

// Screenshot 1 — hero
function screenshot1() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800">
    ${defs()}
    ${bg(1280, 800, [[150, 60, 560, 420, 'glowA'], [1150, 40, 560, 460, 'glowB']])}

    <text x="146" y="98" font-family="${FONT}" font-size="24" font-weight="800" fill="${C.text}">Social Tweaks</text>

    ${chip(96, 246, 'Açık kaynak · Chrome eklentisi')}

    <text x="92" y="372" font-family="${FONT}" font-size="62" font-weight="800" fill="${C.text}" letter-spacing="-2">Kaydırmayı bırak,</text>
    <text x="92" y="444" font-family="${FONT}" font-size="62" font-weight="800" fill="url(#brand)" letter-spacing="-2">izlemeye devam et.</text>

    <text x="94" y="520" font-family="${FONT}" font-size="21" fill="${C.muted}">YouTube Shorts ve Instagram Reels bittiğinde</text>
    <text x="94" y="552" font-family="${FONT}" font-size="21" fill="${C.muted}">otomatik olarak sıradakine geçer. Bir de YouTube'un</text>
    <text x="94" y="584" font-family="${FONT}" font-size="21" fill="${C.muted}">gizlediği dislike sayılarını geri getirir.</text>

    ${check(96, 648)}
    <text x="120" y="658" font-family="${FONT}" font-size="16.5" fill="${C.faint}">Veri toplamaz</text>
    ${check(264, 648)}
    <text x="288" y="658" font-family="${FONT}" font-size="16.5" fill="${C.faint}">Reklamsız</text>
    ${check(408, 648)}
    <text x="432" y="658" font-family="${FONT}" font-size="16.5" fill="${C.faint}">Ücretsiz</text>

    ${popup(770, 200)}
  </svg>`;
}

// Screenshot 2 — three feature cards
function fcard(x, title1, title2, descLines, iconSvg, accent) {
  const w = 348;
  return `
    <rect x="${x}" y="250" width="${w}" height="300" rx="20" fill="${C.surface}" stroke="${C.border}" stroke-width="1.5"/>
    <rect x="${x}" y="250" width="${w}" height="4" rx="2" fill="${accent}"/>
    <rect x="${x + 32}" y="290" width="56" height="56" rx="15" fill="#ffffff" fill-opacity="0.05" stroke="${C.border}" stroke-width="1.5"/>
    ${iconSvg(x + 48, 306, 24)}
    <text x="${x + 32}" y="406" font-family="${FONT}" font-size="22" font-weight="700" fill="${C.text}">${title1}</text>
    <text x="${x + 32}" y="434" font-family="${FONT}" font-size="22" font-weight="700" fill="${C.text}">${title2}</text>
    ${descLines
      .map(
        (l, i) =>
          `<text x="${x + 32}" y="${478 + i * 26}" font-family="${FONT}" font-size="15.5" fill="${C.muted}">${l}</text>`
      )
      .join('')}`;
}

function thumbsDown(x, y, s = 24) {
  // simple filled thumbs-down
  return `<g transform="translate(${x},${y}) scale(${s / 24})" fill="${C.yt}">
    <path d="M3 2 h9 a2 2 0 0 1 2 2 v8 a2 2 0 0 1 -0.6 1.4 l-5 5 a1.2 1.2 0 0 1 -2 -0.9 V14 H2.5 a2 2 0 0 1 -2 -2.3 l1 -7 A2 2 0 0 1 3.4 3 Z"/>
    <rect x="16.5" y="2" width="5" height="11" rx="1.5"/>
  </g>`;
}

function screenshot2() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="800">
    ${defs()}
    ${bg(1280, 800, [[300, 80, 520, 420, 'glowA'], [1000, 760, 560, 460, 'glowB']])}

    <text x="640" y="120" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="700" letter-spacing="4" fill="url(#brand)">NE YAPAR</text>
    <text x="640" y="175" text-anchor="middle" font-family="${FONT}" font-size="44" font-weight="800" fill="${C.text}" letter-spacing="-1.5">Üç küçük dokunuş, büyük rahatlık</text>

    ${fcard(96, 'Shorts kendiliğinden', 'aksın', ['Bir Short biter, diğeri başlar.', 'Parmağını kıpırdatmadan izle.'], ytIcon, C.yt)}
    ${fcard(466, "Dislike'lar geri", 'döndü', ['YouTube sakladı, biz geri', 'getirdik. Gerçeği yine gör.'], thumbsDown, '#e0395e')}
    ${fcard(836, "Reels'te de otomatik", 'geçiş', ['Reels de aynı konforu hak', 'eder. Akış hiç durmaz.'], igIcon, '#8134af')}
  </svg>`;
}

// Small promo tile 440x280
function smallPromo() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="440" height="280">
    ${defs()}
    ${bg(440, 280, [[80, 40, 320, 260, 'glowA'], [380, 250, 320, 260, 'glowB']])}
    <text x="220" y="150" text-anchor="middle" font-family="${FONT}" font-size="30" font-weight="800" fill="${C.text}">Social Tweaks</text>
    <text x="220" y="186" text-anchor="middle" font-family="${FONT}" font-size="15.5" fill="${C.muted}">Shorts &amp; Reels'te otomatik geçiş</text>
    <text x="220" y="210" text-anchor="middle" font-family="${FONT}" font-size="15.5" fill="url(#brand)" font-weight="600">+ YouTube dislike sayıları</text>
  </svg>`;
}

// Marquee promo 1400x560
function marquee() {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="560">
    ${defs()}
    ${bg(1400, 560, [[250, 80, 620, 480, 'glowA'], [1200, 480, 640, 520, 'glowB']])}
    <text x="170" y="170" font-family="${FONT}" font-size="26" font-weight="800" fill="${C.text}">Social Tweaks</text>
    <text x="118" y="300" font-family="${FONT}" font-size="58" font-weight="800" fill="${C.text}" letter-spacing="-2">Kaydırmayı bırak,</text>
    <text x="118" y="370" font-family="${FONT}" font-size="58" font-weight="800" fill="url(#brand)" letter-spacing="-2">izlemeye devam et.</text>
    <text x="120" y="430" font-family="${FONT}" font-size="20" fill="${C.muted}">Shorts &amp; Reels'te otomatik geçiş · YouTube dislike sayıları · Açık kaynak</text>
    ${popup(900, 84)}
  </svg>`;
}

// =========================================================
//  RENDER
// =========================================================
async function render(name, svg, w, h, logos) {
  const composites = [];
  for (const [size, left, top] of logos) {
    const buf = await sharp(logoPath).resize(size, size).png().toBuffer();
    composites.push({ input: buf, left, top });
  }
  await sharp(Buffer.from(svg))
    .resize(w, h)
    .composite(composites)
    .flatten({ background: C.bg })
    .removeAlpha()
    .png({ compressionLevel: 9 })
    .toFile(join(out, name));
  console.log('✓', name);
}

// store icon 128 (alpha allowed) — just a clean resize
await sharp(logoPath).resize(128, 128).png().toFile(join(out, 'icon-128.png'));
console.log('✓ icon-128.png');

// logos: [size, left, top]
await render('screenshot-1-hero.png', screenshot1(), 1280, 800, [
  [38, 96, 70], // header logo
  [34, 794, 222], // popup header logo
]);

await render('screenshot-2-features.png', screenshot2(), 1280, 800, []);

await render('promo-small-440x280.png', smallPromo(), 440, 280, [[56, 192, 60]]);

await render('promo-marquee-1400x560.png', marquee(), 1400, 560, [
  [40, 110, 138], // header logo
  [34, 924, 106], // popup header logo
]);

console.log('\nTüm görseller store-assets/ klasöründe.');
