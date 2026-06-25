import { getSettings, saveSettings, type Settings } from '../settings';

const enabledInput = document.getElementById('enabled') as HTMLInputElement;
const showDislikesInput = document.getElementById('showDislikes') as HTMLInputElement;
const youtubePopoutButtonEnabledInput = document.getElementById(
  'youtubePopoutButtonEnabled',
) as HTMLInputElement;
const instagramEnabledInput = document.getElementById('instagramEnabled') as HTMLInputElement;

let current: Settings;

// Replace [data-i18n] text with the message for the browser's UI language.
// Locales live in _locales/; Chrome picks tr/en automatically (en is the fallback).
function localize(): void {
  document.documentElement.lang = chrome.i18n.getUILanguage();
  document.querySelectorAll<HTMLElement>('[data-i18n]').forEach((el) => {
    const key = el.dataset.i18n;
    if (!key) return;
    const message = chrome.i18n.getMessage(key);
    if (message) el.textContent = message;
  });
}

function render(settings: Settings): void {
  enabledInput.checked = settings.enabled;
  showDislikesInput.checked = settings.showDislikes;
  youtubePopoutButtonEnabledInput.checked = settings.youtubePopoutButtonEnabled;
  instagramEnabledInput.checked = settings.instagramEnabled;
}

async function persist(): Promise<void> {
  current = {
    enabled: enabledInput.checked,
    showDislikes: showDislikesInput.checked,
    youtubePopoutButtonEnabled: youtubePopoutButtonEnabledInput.checked,
    instagramEnabled: instagramEnabledInput.checked,
  };
  await saveSettings(current);
}

async function init(): Promise<void> {
  localize();
  current = await getSettings();
  render(current);

  enabledInput.addEventListener('change', persist);
  showDislikesInput.addEventListener('change', persist);
  youtubePopoutButtonEnabledInput.addEventListener('change', persist);
  instagramEnabledInput.addEventListener('change', persist);
}

void init();
