import { DEFAULT_SETTINGS, getSettings, onSettingsChanged, type Settings } from './settings';

/**
 * YouTube video sayfalarına native Picture-in-Picture butonu ekler.
 *
 * Content script tüm YouTube üzerinde yüklenir; YouTube SPA geçişlerinde ana
 * sayfadan videoya gidildiğinde de çalışması için render kararı runtime'da
 * `location.pathname === "/watch"` kontrolüyle verilir.
 */

// --- Sabitler -------------------------------------------------------------

const WATCH_PATH = '/watch';
const POLL_INTERVAL_MS = 1000;
const RENDER_DEBOUNCE_MS = 100;

const STYLE_ID = 'social-tweaks-popout-style';
const HOST_CLASS = 'social-tweaks-popout-host';
const BUTTON_CLASS = 'social-tweaks-popout-button';
const BUTTON_SELECTOR = `.${BUTTON_CLASS}`;

const PLAYER_CONTAINER_SELECTORS = [
  '#movie_player',
  '.html5-video-player',
];

const VIDEO_SELECTORS = [
  '#movie_player video.html5-main-video',
  'video.html5-main-video',
  '#player video',
  'video',
];

// --- Durum ----------------------------------------------------------------

let settings: Settings = DEFAULT_SETTINGS;
let renderTimer: number | null = null;

/** PiP durum değişiklikleri için event bağlanmış video'ları izler. */
const handledVideos = new WeakSet<HTMLVideoElement>();

// --- Yardımcılar ----------------------------------------------------------

function isWatchPage(): boolean {
  return location.pathname === WATCH_PATH;
}

function getButtonLabel(): string {
  return chrome.i18n.getMessage('youtubePopoutButton') || 'Video pop-out button';
}

function warn(message: string, error?: unknown): void {
  if (error === undefined) {
    console.warn(`[Social Tweaks] ${message}`);
    return;
  }

  console.warn(`[Social Tweaks] ${message}`, error);
}

function findPlayerContainer(): HTMLElement | null {
  for (const selector of PLAYER_CONTAINER_SELECTORS) {
    const player = document.querySelector<HTMLElement>(selector);
    if (player) return player;
  }
  return null;
}

function findWatchVideo(): HTMLVideoElement | null {
  for (const selector of VIDEO_SELECTORS) {
    const video = document.querySelector<HTMLVideoElement>(selector);
    if (video) return video;
  }
  return null;
}

function ensureStyle(): void {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .${BUTTON_CLASS} {
      position: absolute;
      top: 14px;
      right: 14px;
      z-index: 2147483647;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      padding: 0;
      border: 1px solid rgba(255, 255, 255, 0.22);
      border-radius: 50%;
      background: rgba(0, 0, 0, 0.72);
      color: #fff;
      cursor: pointer;
      opacity: 0;
      pointer-events: none;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
      transform: scale(0.96);
      transition:
        background 0.15s ease,
        opacity 0.15s ease,
        transform 0.15s ease;
    }

    .${HOST_CLASS}:hover > .${BUTTON_CLASS},
    .${HOST_CLASS}:not(.ytp-autohide) > .${BUTTON_CLASS},
    .${BUTTON_CLASS}:focus-visible {
      opacity: 0.88;
      pointer-events: auto;
      transform: scale(1);
    }

    .${BUTTON_CLASS}:hover,
    .${BUTTON_CLASS}:focus-visible {
      background: rgba(0, 0, 0, 0.86);
      opacity: 1;
      transform: scale(1.04);
      outline: none;
    }

    .${BUTTON_CLASS}[data-social-tweaks-active="true"] {
      background: #3ea6ff;
      border-color: rgba(255, 255, 255, 0.35);
      color: #fff;
    }

    .${BUTTON_CLASS} svg {
      display: block;
      width: 24px;
      height: 24px;
      margin: auto;
      fill: currentColor;
      pointer-events: none;
    }
  `;
  document.documentElement.appendChild(style);
}

function removeInjectedUi(): void {
  document.querySelectorAll(BUTTON_SELECTOR).forEach((button) => button.remove());
  document.querySelectorAll(`.${HOST_CLASS}`).forEach((host) => host.classList.remove(HOST_CLASS));
  document.getElementById(STYLE_ID)?.remove();
}

function attachVideoStateListeners(video: HTMLVideoElement): void {
  if (handledVideos.has(video)) return;
  handledVideos.add(video);

  video.addEventListener('enterpictureinpicture', scheduleRender);
  video.addEventListener('leavepictureinpicture', scheduleRender);
}

function updateButtonState(button: HTMLButtonElement): void {
  const video = findWatchVideo();
  const isActive = Boolean(video && document.pictureInPictureElement === video);
  const label = getButtonLabel();

  button.dataset.socialTweaksActive = String(isActive);
  button.title = label;
  button.setAttribute('aria-label', label);
}

function createButton(): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = BUTTON_CLASS;
  button.innerHTML = `
    <svg viewBox="0 0 36 36" aria-hidden="true" focusable="false">
      <path d="M27 9H9c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V11c0-1.1-.9-2-2-2ZM9 25V11h18v14H9Z"></path>
      <path d="M18 17h7v6h-7z"></path>
    </svg>
  `;
  updateButtonState(button);

  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    void togglePictureInPicture();
  });

  return button;
}

async function togglePictureInPicture(): Promise<void> {
  try {
    if (!isWatchPage()) {
      warn('Picture-in-Picture skipped because this is not a watch page.');
      return;
    }

    if (!document.pictureInPictureEnabled) {
      warn('Picture-in-Picture is not enabled in this document.');
      return;
    }

    const video = findWatchVideo();
    if (!video) {
      warn('Picture-in-Picture skipped because no YouTube video element was found.');
      return;
    }

    if (video.readyState <= video.HAVE_NOTHING) {
      warn('Picture-in-Picture skipped because the video is not ready yet.');
      return;
    }

    if (video.disablePictureInPicture) {
      warn('Picture-in-Picture is disabled on this video element.');
      return;
    }

    const activeElement = document.pictureInPictureElement;
    if (activeElement === video) {
      await document.exitPictureInPicture();
      scheduleRender();
      return;
    }

    if (activeElement) {
      await document.exitPictureInPicture();
    }

    await video.requestPictureInPicture();
    attachVideoStateListeners(video);
    scheduleRender();
  } catch (error) {
    warn('Picture-in-Picture request failed.', error);
  }
}

// --- Render ---------------------------------------------------------------

function render(): void {
  renderTimer = null;

  if (!settings.youtubePopoutButtonEnabled || !isWatchPage()) {
    removeInjectedUi();
    return;
  }

  const player = findPlayerContainer();
  if (!player) return;

  ensureStyle();
  player.classList.add(HOST_CLASS);

  const existingButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(BUTTON_SELECTOR));
  let button = existingButtons.find((candidate) => candidate.parentElement === player) ?? null;

  for (const candidate of existingButtons) {
    if (candidate !== button) candidate.remove();
  }

  if (!button) {
    button = createButton();
    player.appendChild(button);
  }

  const video = findWatchVideo();
  if (video) attachVideoStateListeners(video);
  updateButtonState(button);
}

function scheduleRender(): void {
  if (renderTimer !== null) return;
  renderTimer = window.setTimeout(render, RENDER_DEBOUNCE_MS);
}

// --- Başlatma -------------------------------------------------------------

async function init(): Promise<void> {
  settings = await getSettings();
  onSettingsChanged((next) => {
    settings = next;
    scheduleRender();
  });

  window.addEventListener('yt-navigate-finish', scheduleRender);
  window.addEventListener('yt-page-data-updated', scheduleRender);
  setInterval(scheduleRender, POLL_INTERVAL_MS);
  scheduleRender();
}

void init();
