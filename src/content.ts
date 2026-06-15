import { DEFAULT_SETTINGS, getSettings, onSettingsChanged, type Settings } from './settings';

/**
 * YouTube Shorts otomatik geçiş içerik scripti.
 *
 * Sorun: Shorts videoları `video.loop = true` ile sonsuz döner; bu yüzden
 * normal `ended` olayı tetiklenmez. Çözüm iki katmanlı:
 *   1. Aktif video bulunup `loop = false` yapılır ve `ended` dinlenir.
 *   2. Yedek olarak `timeupdate` ile videonun sonuna gelinip gelinmediği izlenir
 *      (YouTube `loop`'u yeniden açarsa diye).
 * Geçiş, YouTube'un dinlediği `ArrowDown` klavye olayıyla; o işe yaramazsa
 * aşağı yön navigasyon butonuna tıklanarak yapılır.
 */

// --- Sabitler -------------------------------------------------------------

/** Videonun "bitti" sayılması için süre sonuna kalan eşik (saniye). */
const END_THRESHOLD = 0.3;

/** Bir geçişten sonra mükerrer tetiklemeyi engelleyen kilit süresi (ms). */
const ADVANCE_LOCK_MS = 1200;

/** Aktif video'yu yoklama aralığı (ms). */
const POLL_INTERVAL_MS = 500;

/** Aşağı yön navigasyon butonu için dayanıklılık amaçlı yedek seçiciler. */
const NEXT_BUTTON_SELECTORS = [
  '#navigation-button-down button',
  'ytd-shorts #navigation-button-down button',
  'button[aria-label="Next video"]',
  'button[aria-label="Sonraki video"]',
];

// --- Durum ----------------------------------------------------------------

let settings: Settings = DEFAULT_SETTINGS;
let lastAdvanceAt = 0;
let pendingAdvance: ReturnType<typeof setTimeout> | null = null;

/** Handler'ı zaten bağlanmış video öğelerini izler (çift bağlamayı önler). */
const handledVideos = new WeakSet<HTMLVideoElement>();

// --- Geçiş mantığı --------------------------------------------------------

function goToNextShort(): void {
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
    document.documentElement.dispatchEvent(event);
  };
  dispatchArrowDown('keydown');
  dispatchArrowDown('keyup');

  // 2) Yedek: aşağı yön navigasyon butonuna tıkla.
  for (const selector of NEXT_BUTTON_SELECTORS) {
    const button = document.querySelector<HTMLButtonElement>(selector);
    if (button) {
      button.click();
      break;
    }
  }
}

/** Geçişi (varsa gecikmeyle) tetikler; kilitliyse yok sayar. */
function requestAdvance(): void {
  if (!settings.enabled) return;

  const now = Date.now();
  if (now - lastAdvanceAt < ADVANCE_LOCK_MS) return;
  if (pendingAdvance !== null) return;

  lastAdvanceAt = now;

  const delayMs = Math.max(0, settings.delaySeconds) * 1000;
  pendingAdvance = setTimeout(() => {
    pendingAdvance = null;
    lastAdvanceAt = Date.now();
    goToNextShort();
  }, delayMs);
}

// --- Video tespiti & olay bağlama ----------------------------------------

/** O an oynayan/aktif Shorts video öğesini döndürür. */
function findActiveVideo(): HTMLVideoElement | null {
  // Aktif reel renderer içindeki video en güvenilir göstergedir.
  const active = document.querySelector<HTMLVideoElement>(
    'ytd-reel-video-renderer[is-active] video',
  );
  if (active) return active;

  // Yedek: oynayan (duraklatılmamış, süresi olan) ilk video.
  const videos = Array.from(document.querySelectorAll<HTMLVideoElement>('video'));
  return videos.find((v) => !v.paused && v.duration > 0) ?? videos[0] ?? null;
}

function handleEnded(event: Event): void {
  const video = event.target as HTMLVideoElement;
  // Video tekrar başa sarmasın diye loop'u kapalı tutmaya çalışıyoruz,
  // ancak ended sonrası YouTube'un başa sarmasını da engelleyelim.
  if (video.currentTime < END_THRESHOLD) {
    // (loop kaynaklı sahte ended olabilir) yine de geçiş isteyelim.
  }
  requestAdvance();
}

function handleTimeUpdate(event: Event): void {
  const video = event.target as HTMLVideoElement;
  if (!video.duration || Number.isNaN(video.duration)) return;
  if (video.duration - video.currentTime <= END_THRESHOLD) {
    requestAdvance();
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
  if (!settings.enabled) return;
  const video = findActiveVideo();
  if (video) {
    // YouTube loop'u yeniden açabilir; her turda tekrar kapat.
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
