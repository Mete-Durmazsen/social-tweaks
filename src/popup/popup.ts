import { getSettings, saveSettings, type Settings } from '../settings';

const enabledInput = document.getElementById('enabled') as HTMLInputElement;
const delayInput = document.getElementById('delay') as HTMLInputElement;

let current: Settings;

function render(settings: Settings): void {
  enabledInput.checked = settings.enabled;
  delayInput.value = String(settings.delaySeconds);
}

async function persist(): Promise<void> {
  const delay = Number.parseFloat(delayInput.value);
  current = {
    enabled: enabledInput.checked,
    delaySeconds: Number.isFinite(delay) && delay >= 0 ? delay : 0,
  };
  await saveSettings(current);
}

async function init(): Promise<void> {
  current = await getSettings();
  render(current);

  enabledInput.addEventListener('change', persist);
  delayInput.addEventListener('change', persist);
}

void init();
