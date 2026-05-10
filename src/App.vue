<template>
  <div class="board">
    <Tabs>
      <template #store>
        <Store />
      </template>
      <template #tools>
        <Tools />
      </template>
      <template #clipboard>
        <Clipboard />
      </template>
      <template #settings>
        <Settings />
      </template>
      <template #dev>
        <Dev />
      </template>
    </Tabs>
    <Messages />
    <footer class="board-footer">
      <span>Desenvolvido por</span>
      <a
        href="https://www.linkedin.com/in/ricardo-freitas-desenvolvedor/"
        target="_blank"
        rel="noreferrer"
      >
        Ricardo Freitas
      </a>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

import Tabs from './components/tabs.vue';
import Store from './pages/store.vue';
import Tools from './pages/tools.vue';
import Clipboard from './pages/clipboard.vue';
import Dev from './pages/dev.vue';
import Settings from './pages/settings.vue';
import Messages from './components/messages.vue';
import packageJson from '../package.json';
import { useStoreDataStore } from './store/storeDataStore';
import useBrowserAction from './composables/useBrowserAction';
import configs from './config';
import useExtensionUpdate from './composables/useExtensionUpdate';
import useExtensionSettings from './composables/useExtensionSettings';
import useTheme from './composables/useTheme';

const version = ref(packageJson.version);
const $store = useStoreDataStore();
const {
  getStoreData,
  getStoreIntegrations,
  getStoreHistory,
  getClipboardHistory,
} =
  useBrowserAction();
const { checkForUpdates } = useExtensionUpdate();
const { loadSettings } = useExtensionSettings();
const { applyTheme } = useTheme();

onMounted(async () => {
  const settings = await loadSettings();
  const resolvedTheme = settings.darkTheme ? 'dark' : 'light';
  $store.setTheme(resolvedTheme);
  applyTheme(resolvedTheme);
  $store.setConfigs(configs);
  $store.setUpdate({ currentVersion: version.value });
  $store.setStoreData(await getStoreData());
  $store.setIntegrations(await getStoreIntegrations());
  $store.setStoreHistory(await getStoreHistory());
  $store.setClipboardHistory(await getClipboardHistory());
  await checkForUpdates({ silent: true });
});
</script>

<style lang="scss" scoped>
.board {
  background: var(--app-bg);
  max-width: 302px;
  width: 450px;
  height: 480px;
  overflow-y: auto;
  padding: 16px 16px 30px;
  position: relative;
}

.board-footer {
  position: absolute;
  left: 16px;
  right: 16px;
  bottom: 8px;
  display: flex;
  justify-content: center;
  gap: 4px;
  font-size: 10px;
  color: var(--text-secondary);
  opacity: 0.85;
}

.board-footer a {
  color: var(--text-secondary);
  text-decoration: none;
}

.board-footer a:hover {
  color: var(--text-hover);
  text-decoration: underline;
}
</style>
