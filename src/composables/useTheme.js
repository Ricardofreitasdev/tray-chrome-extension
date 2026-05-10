import { useStoreDataStore } from '../store/storeDataStore';

const THEME_STORAGE_KEY = 'extensionTheme';
const DEFAULT_THEME = 'dark';

const normalizeTheme = (theme) => (theme === 'light' ? 'light' : 'dark');

const applyTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', normalizeTheme(theme));
};

const loadThemePreference = async () => {
  try {
    const data = await new Promise((resolve, reject) => {
      chrome.storage.local.get(THEME_STORAGE_KEY, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        resolve(result);
      });
    });

    return normalizeTheme(data?.[THEME_STORAGE_KEY] || DEFAULT_THEME);
  } catch {
    return DEFAULT_THEME;
  }
};

const saveThemePreference = async (theme) => {
  const normalizedTheme = normalizeTheme(theme);

  try {
    await new Promise((resolve, reject) => {
      chrome.storage.local.set({ [THEME_STORAGE_KEY]: normalizedTheme }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        resolve();
      });
    });
  } catch {
    // Ignore persistence failures and keep the current theme applied.
  }
};

export default function useTheme() {
  const $store = useStoreDataStore();

  const setTheme = async (theme) => {
    const normalizedTheme = normalizeTheme(theme);
    $store.setTheme(normalizedTheme);
    applyTheme(normalizedTheme);
    await saveThemePreference(normalizedTheme);
  };

  return {
    applyTheme,
    loadThemePreference,
    setTheme,
  };
}
