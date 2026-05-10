<template>
  <div class="settings-page">
    <section class="settings-card">
      <div class="settings-header">
        <div>
          <strong>Versao e atualizacoes</strong>
          <p>Atual: {{ $store.update.currentVersion || 'indisponivel' }}</p>
        </div>
        <span v-if="$store.update.latestVersion" class="version-pill">
          Ultima: {{ $store.update.latestVersion }}
        </span>
      </div>

      <app-update-status
        v-if="$store.hasAvailableUpdate"
        :current-version="$store.update.currentVersion"
        :latest-version="$store.update.latestVersion"
        :status="$store.update.status"
        :message="$store.update.message"
        :download-url="$store.update.downloadUrl"
        :release-notes-url="$store.update.releaseNotesUrl"
      />

      <div class="theme-section">
        <p>Ative ou desative os recursos da extensao.</p>
        <label class="setting-row">
          <span>
            <strong>Tema dark</strong>
            <small>Quando desligado, a extensao usa o tema light.</small>
          </span>
          <span class="switch">
            <input
              :checked="$store.settings.darkTheme"
              type="checkbox"
              @change="handleThemeToggle"
            />
            <span class="switch-ui" aria-hidden="true" />
          </span>
        </label>
        <label class="setting-row">
          <span>
            <strong>Feature de historico de copias</strong>
            <small>Controla a exibicao da aba Clipboard.</small>
          </span>
          <span class="switch">
            <input
              :checked="$store.settings.clipboardHistory"
              type="checkbox"
              @change="handleSettingToggle('clipboardHistory', $event)"
            />
            <span class="switch-ui" aria-hidden="true" />
          </span>
        </label>
        <label class="setting-row">
          <span>
            <strong>Feature de print</strong>
            <small>Mostra a captura de print na aba Ferramentas.</small>
          </span>
          <span class="switch">
            <input
              :checked="$store.settings.screenshot"
              type="checkbox"
              @change="handleSettingToggle('screenshot', $event)"
            />
            <span class="switch-ui" aria-hidden="true" />
          </span>
        </label>
        <label class="setting-row">
          <span>
            <strong>Gerador de cartoes</strong>
            <small>Mostra o gerador Visa e Mastercard para testes.</small>
          </span>
          <span class="switch">
            <input
              :checked="$store.settings.cardGenerator"
              type="checkbox"
              @change="handleSettingToggle('cardGenerator', $event)"
            />
            <span class="switch-ui" aria-hidden="true" />
          </span>
        </label>
      </div>
    </section>
  </div>
</template>

<script setup>
import AppUpdateStatus from '../components/update-status.vue';
import useExtensionSettings from '../composables/useExtensionSettings';
import { useStoreDataStore } from '../store/storeDataStore';
import useTheme from '../composables/useTheme';

const $store = useStoreDataStore();
const { setTheme } = useTheme();
const { setExtensionSetting } = useExtensionSettings();

const handleThemeToggle = async (event) => {
  const isDarkTheme = event.target.checked;
  await setExtensionSetting('darkTheme', isDarkTheme);
  await setTheme(isDarkTheme ? 'dark' : 'light');
};

const handleSettingToggle = async (key, event) => {
  await setExtensionSetting(key, event.target.checked);
};
</script>

<style lang="scss" scoped>
.settings-page {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-card {
  background: var(--surface-soft);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  padding: 12px;

  strong {
    display: block;
    color: var(--text-primary);
    margin-bottom: 4px;
  }

  p {
    font-size: 12px;
    line-height: 1.5;
  }
}

.settings-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.version-pill {
  background: var(--surface-4);
  border: 1px solid var(--border-soft);
  border-radius: 999px;
  color: var(--text-muted);
  font-size: 11px;
  padding: 4px 8px;
  white-space: nowrap;
}

.theme-section {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--border-soft);

  p {
    margin-bottom: 10px;
  }
}

.setting-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid var(--border-soft);
  cursor: pointer;

  &:first-of-type {
    border-top: none;
  }

  span {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  strong {
    margin-bottom: 0;
  }

  small {
    color: var(--text-muted);
    font-size: 11px;
    line-height: 1.4;
  }
}

.switch {
  position: relative;
  width: 46px;
  height: 28px;
  flex-shrink: 0;
}

.switch input {
  position: absolute;
  inset: 0;
  opacity: 0;
  margin: 0;
  cursor: pointer;
}

.switch-ui {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--surface-4);
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease;
  pointer-events: none;
}

.switch-ui::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--app-bg);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.28);
  transition:
    transform 0.18s ease,
    background-color 0.18s ease;
}

.switch input:checked + .switch-ui {
  background: var(--accent-soft);
  border-color: var(--accent-border-strong);
}

.switch input:checked + .switch-ui::after {
  transform: translateX(18px);
  background: var(--accent);
}

.switch input:focus-visible + .switch-ui {
  outline: 2px solid var(--accent-border-strong);
  outline-offset: 2px;
}
</style>
