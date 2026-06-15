import { getSettings, saveSettings, type Settings } from '../settings';

const enabledInput = document.getElementById('enabled') as HTMLInputElement;
const showDislikesInput = document.getElementById('showDislikes') as HTMLInputElement;
const instagramEnabledInput = document.getElementById('instagramEnabled') as HTMLInputElement;

let current: Settings;

function render(settings: Settings): void {
  enabledInput.checked = settings.enabled;
  showDislikesInput.checked = settings.showDislikes;
  instagramEnabledInput.checked = settings.instagramEnabled;
}

async function persist(): Promise<void> {
  current = {
    enabled: enabledInput.checked,
    showDislikes: showDislikesInput.checked,
    instagramEnabled: instagramEnabledInput.checked,
  };
  await saveSettings(current);
}

async function init(): Promise<void> {
  current = await getSettings();
  render(current);

  enabledInput.addEventListener('change', persist);
  showDislikesInput.addEventListener('change', persist);
  instagramEnabledInput.addEventListener('change', persist);
}

void init();
