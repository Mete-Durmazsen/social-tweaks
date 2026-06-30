import { DEFAULT_SETTINGS, getSettings, onSettingsChanged, type Settings } from './settings';

/**
 * Instagram Reels otomatik geçiş içerik scripti.
 *
 * YouTube Shorts'taki gibi Reels videoları da `loop` ile sonsuz döner; bu
 * yüzden `loop` kapatılıp `ended` ve `timeupdate` ile video sonu yakalanır.
 * Geçiş, Reels'in dinlediği `ArrowDown` klavye olayıyla; o işe yaramazsa
 * videoyu içeren kaydırılabilir alanın bir ekran yüksekliği kaydırılmasıyla
 * yapılır.
 */

// --- Sabitler -------------------------------------------------------------

/** Videonun "bitti" sayılması için süre sonuna kalan eşik (saniye). */
const END_THRESHOLD = 0.3;

/** Bir geçişten sonra mükerrer tetiklemeyi engelleyen kilit süresi (ms). */
const ADVANCE_LOCK_MS = 1200;

/** Aktif video'yu yoklama aralığı (ms). */
const POLL_INTERVAL_MS = 500;

// --- Durum ----------------------------------------------------------------

let settings: Settings = DEFAULT_SETTINGS;
let lastAdvanceAt = 0;

/** Handler'ı zaten bağlanmış video öğelerini izler (çift bağlamayı önler). */
const handledVideos = new WeakSet<HTMLVideoElement>();

// --- Video tespiti ----------------------------------------------------------

function isReelsPage(): boolean {
  return (
    location.pathname === '/reels' ||
    location.pathname.startsWith('/reels/') ||
    location.pathname.startsWith('/reel/')
  );
}

/** Elemanın görünür alanın yarısından fazlasının ekranda olup olmadığı. */
function isMostlyInViewport(el: Element): boolean {
  const rect = el.getBoundingClientRect();
  if (rect.height === 0) return false;
  const visibleHeight = Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0);
  return visibleHeight / rect.height > 0.5;
}

/** O an ekranda görünen Reel video öğesini döndürür. */
function findActiveVideo(): HTMLVideoElement | null {
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('video'));
  return videos.find((v) => v.duration > 0 && isMostlyInViewport(v)) ?? null;
}

// --- Geçiş mantığı --------------------------------------------------------

/** Videoyu içeren en yakın dikey kaydırılabilir elemanı bulur. */
function findScrollableAncestor(el: Element): Element | null {
  let node: Element | null = el;
  while (node && node !== document.body) {
    const style = getComputedStyle(node);
    const canScroll = style.overflowY === 'auto' || style.overflowY === 'scroll';
    if (canScroll && node.scrollHeight > node.clientHeight + 1) return node;
    node = node.parentElement;
  }
  return null;
}

function goToNextReel(video: HTMLVideoElement): void {
  // 1) Tercih edilen yöntem: ArrowDown klavye olayı.
  const dispatchArrowDown = (type: 'keydown' | 'keyup') => {
    const event = new KeyboardEvent(type, {
      key: 'ArrowDown',
      code: 'ArrowDown',
      keyCode: 40,
      which: 40,
      bubbles: true,
      cancelable: true,
    });
    document.dispatchEvent(event);
  };
  dispatchArrowDown('keydown');
  dispatchArrowDown('keyup');

  // 2) Yedek: videoyu içeren kaydırılabilir alanı bir ekran yüksekliği kaydır.
  const scrollable = findScrollableAncestor(video) ?? document.scrollingElement;
  scrollable?.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
}

/** Geçişi tetikler; kilitliyse yok sayar. */
function requestAdvance(video: HTMLVideoElement): void {
  if (!settings.instagramEnabled || !isReelsPage()) return;

  const now = Date.now();
  if (now - lastAdvanceAt < ADVANCE_LOCK_MS) return;
  lastAdvanceAt = now;

  goToNextReel(video);
}

// --- Olay bağlama -----------------------------------------------------------

function handleEnded(event: Event): void {
  requestAdvance(event.target as HTMLVideoElement);
}

function handleTimeUpdate(event: Event): void {
  const video = event.target as HTMLVideoElement;
  if (!video.duration || Number.isNaN(video.duration)) return;
  if (video.duration - video.currentTime <= END_THRESHOLD) {
    requestAdvance(video);
  }
}

function attachToVideo(video: HTMLVideoElement): void {
  if (handledVideos.has(video)) return;
  handledVideos.add(video);

  // Sonsuz döngüyü kapat ki `ended` tetiklenebilsin.
  video.loop = false;
  video.addEventListener('ended', handleEnded);
  video.addEventListener('timeupdate', handleTimeUpdate);
}

/** Periyodik denetleyici: aktif video'ya handler'ların bağlı olmasını sağlar. */
function tick(): void {
  if (!settings.instagramEnabled || !isReelsPage()) return;
  const video = findActiveVideo();
  if (video) {
    // Instagram loop'u yeniden açabilir; her turda tekrar kapat.
    video.loop = false;
    attachToVideo(video);
  }
}

// --- Başlatma -------------------------------------------------------------

async function init(): Promise<void> {
  settings = await getSettings();
  onSettingsChanged((next) => {
    settings = next;
  });
  setInterval(tick, POLL_INTERVAL_MS);
  tick();
}

void init();
