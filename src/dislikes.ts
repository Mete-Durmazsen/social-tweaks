import { DEFAULT_SETTINGS, getSettings, onSettingsChanged, type Settings } from './settings';
import type { FetchDislikesMessage } from './messages';

/**
 * YouTube'un gizlediği dislike sayısını returnyoutubedislikeapi.com üzerinden
 * alıp dislike butonunun yanına etiket olarak ekler.
 *
 * Sayfa, izole bir SPA olduğu için video değişimleri `yt-navigate-finish`
 * olayıyla; buton ise asenkron render edildiği için periyodik yoklama ile
 * yakalanır.
 */

// --- Sabitler -------------------------------------------------------------

const POLL_INTERVAL_MS = 500;

const BADGE_CLASS = 'social-tweaks-dislike-count';

/** Shorts'ta dislike butonunun altındaki "Beğenme" etiketinin yer aldığı seçici. */
const SHORTS_LABEL_SELECTOR = '.ytSpecButtonShapeWithLabelLabel span';

/** Shorts etiketinin orijinal metnini saklamak için kullanılan attribute. */
const ORIGINAL_LABEL_ATTR = 'data-social-tweaks-original-label';

/** Dayanıklılık amaçlı yedek seçiciler: YouTube'un dislike buton sarmalayıcısı. */
const DISLIKE_CONTAINER_SELECTORS = [
  'ytd-watch-metadata dislike-button-view-model',
  '#actions dislike-button-view-model',
  'ytd-reel-video-renderer[is-active] dislike-button-view-model',
  'dislike-button-view-model',
];

// --- Durum ----------------------------------------------------------------

let settings: Settings = DEFAULT_SETTINGS;

/** videoId -> dislike sayısı (null = bilinmiyor/başarısız). */
const cache = new Map<string, number | null>();

// --- Yardımcılar ------------------------------------------------------------

function getVideoId(): string | null {
  const fromQuery = new URLSearchParams(location.search).get('v');
  if (fromQuery) return fromQuery;

  const shortsMatch = location.pathname.match(/^\/shorts\/([^/?]+)/);
  return shortsMatch?.[1] ?? null;
}

function formatCount(n: number): string {
  const abs = Math.abs(n);
  const units: Array<[number, string]> = [
    [1_000_000_000, 'B'],
    [1_000_000, 'M'],
    [1_000, 'K'],
  ];
  for (const [threshold, suffix] of units) {
    if (abs >= threshold) {
      const value = n / threshold;
      const formatted = value >= 100 ? Math.round(value).toString() : value.toFixed(1).replace(/\.0$/, '');
      return `${formatted}${suffix}`;
    }
  }
  return String(n);
}

function findDislikeContainer(): HTMLElement | null {
  for (const selector of DISLIKE_CONTAINER_SELECTORS) {
    const el = document.querySelector<HTMLElement>(selector);
    if (el) return el;
  }
  return null;
}

async function fetchDislikes(videoId: string): Promise<number | null> {
  if (cache.has(videoId)) return cache.get(videoId) ?? null;

  const message: FetchDislikesMessage = { type: 'fetchDislikes', videoId };
  const count = (await chrome.runtime.sendMessage(message)) as number | null;
  cache.set(videoId, count);
  return count;
}

/**
 * Shorts'ta dislike sayısı, like sayısının da gösterildiği butonun altındaki
 * etikette ("Beğenme" yazısının yerinde) gösterilir.
 */
function renderShortsLabel(container: HTMLElement, count: number | null): void {
  const label = container.querySelector<HTMLElement>(SHORTS_LABEL_SELECTOR);
  if (!label) return;

  if (!label.hasAttribute(ORIGINAL_LABEL_ATTR)) {
    label.setAttribute(ORIGINAL_LABEL_ATTR, label.textContent ?? '');
  }

  label.textContent = count === null ? label.getAttribute(ORIGINAL_LABEL_ATTR) ?? '' : formatCount(count);
}

/** Video sayfasında dislike sayısı, dislike butonunun yanına ayrı bir etiket olarak eklenir. */
function renderWatchBadge(container: HTMLElement, count: number | null): void {
  const button = container.querySelector<HTMLElement>('button') ?? container;
  let badge = button.querySelector<HTMLElement>(`.${BADGE_CLASS}`);

  if (count === null) {
    badge?.remove();
    return;
  }

  if (!badge) {
    badge = document.createElement('span');
    badge.className = BADGE_CLASS;
    badge.style.marginInlineStart = '8px';
    badge.style.fontSize = 'inherit';
    badge.style.fontFamily = 'inherit';
    badge.style.fontWeight = 'inherit';
    badge.style.color = 'var(--yt-spec-text-primary, inherit)';
    badge.style.whiteSpace = 'nowrap';
    badge.style.pointerEvents = 'none';
    button.appendChild(badge);
  }

  badge.textContent = formatCount(count);

  // YouTube, pill genişliğini badge eklenmeden önce hesapladığı için sayı
  // basamak sayısı değişince (örn. "1" -> "242") metin pill dışına taşabilir.
  button.style.width = 'auto';
  button.style.minWidth = 'fit-content';
}

function renderBadge(container: HTMLElement, count: number | null): void {
  if (location.pathname.startsWith('/shorts/')) {
    renderShortsLabel(container, count);
    return;
  }

  renderWatchBadge(container, count);
}

// --- Ana döngü --------------------------------------------------------------

async function update(): Promise<void> {
  const container = findDislikeContainer();
  if (!container) return;

  if (!settings.showDislikes) {
    renderBadge(container, null);
    return;
  }

  const videoId = getVideoId();
  if (!videoId) {
    renderBadge(container, null);
    return;
  }

  const count = await fetchDislikes(videoId);
  renderBadge(container, count);
}

// --- Başlatma -------------------------------------------------------------

async function init(): Promise<void> {
  settings = await getSettings();
  onSettingsChanged((next) => {
    settings = next;
    void update();
  });

  window.addEventListener('yt-navigate-finish', () => void update());
  setInterval(() => void update(), POLL_INTERVAL_MS);
  void update();
}

void init();
