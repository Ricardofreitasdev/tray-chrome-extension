import { useStoreDataStore } from '../store/storeDataStore';

const SETTINGS_STORAGE_KEY = 'extensionSettings';

const DEFAULT_SETTINGS = {
  darkTheme: true,
  clipboardHistory: true,
  screenshot: true,
  cardGenerator: true,
};

const normalizeSettings = (settings = {}) => ({
  ...DEFAULT_SETTINGS,
  ...settings,
});

const readStoredSettings = async () => {
  try {
    const data = await new Promise((resolve, reject) => {
      chrome.storage.local.get(SETTINGS_STORAGE_KEY, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        resolve(result);
      });
    });

    return normalizeSettings(data?.[SETTINGS_STORAGE_KEY]);
  } catch {
    return DEFAULT_SETTINGS;
  }
};

const persistSettings = async (settings) => {
  try {
    await new Promise((resolve, reject) => {
      chrome.storage.local.set(
        { [SETTINGS_STORAGE_KEY]: normalizeSettings(settings) },
        () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
            return;
          }

          resolve();
        }
      );
    });
  } catch {
    // Ignore persistence failures and keep the current in-memory state.
  }
};

export default function useExtensionSettings() {
  const $store = useStoreDataStore();

  const loadSettings = async () => {
    const settings = await readStoredSettings();
    $store.setExtensionSettings(settings);
    return settings;
  };

  const setExtensionSetting = async (key, value) => {
    const nextSettings = {
      ...$store.extensionSettings,
      [key]: value,
    };

    $store.setExtensionSettings(nextSettings);
    await persistSettings(nextSettings);
  };

  return {
    DEFAULT_SETTINGS,
    loadSettings,
    setExtensionSetting,
  };
}
