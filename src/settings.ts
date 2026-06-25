export interface Settings {
  /** YouTube Shorts'ta otomatik geçiş açık mı? */
  enabled: boolean;
  /** Video sayfalarında gizlenen dislike sayısı gösterilsin mi? */
  showDislikes: boolean;
  /** YouTube video sayfalarında pop-out butonu gösterilsin mi? */
  youtubePopoutButtonEnabled: boolean;
  /** Instagram Reels'te otomatik geçiş açık mı? */
  instagramEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  enabled: true,
  showDislikes: true,
  youtubePopoutButtonEnabled: true,
  instagramEnabled: true,
};

const STORAGE_KEY = 'settings';

/** Kayıtlı ayarları (yoksa varsayılanları) döndürür. */
export async function getSettings(): Promise<Settings> {
  const stored = await chrome.storage.sync.get(STORAGE_KEY);
  return { ...DEFAULT_SETTINGS, ...(stored[STORAGE_KEY] as Partial<Settings> | undefined) };
}

/** Ayarları kaydeder. */
export async function saveSettings(settings: Settings): Promise<void> {
  await chrome.storage.sync.set({ [STORAGE_KEY]: settings });
}

/**
 * Ayar değişikliklerini dinler. Geri çağrı, güncel tam Settings nesnesiyle çağrılır.
 * Dinlemeyi durdurmak için döndürülen fonksiyonu çağır.
 */
export function onSettingsChanged(
  callback: (settings: Settings) => void,
): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    areaName: string,
  ) => {
    if (areaName !== 'sync' || !changes[STORAGE_KEY]) return;
    const next = changes[STORAGE_KEY].newValue as Partial<Settings> | undefined;
    callback({ ...DEFAULT_SETTINGS, ...next });
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
