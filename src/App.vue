<template>
  <div class="board">
    <Tabs>
      <template #tab-content-0>
        <Store />
      </template>
      <template #tab-content-1>
        <Settings />
      </template>
      <template #tab-content-2>
        <Dev />
      </template>
    </Tabs>
    <Messages />
    <footer class="footer-message">
      <span>version {{ version }}</span>
      <span v-if="$store.hasAvailableUpdate" class="update-pill">
        nova: {{ $store.update.latestVersion }}
      </span>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

import Tabs from './components/tabs.vue';
import Store from './pages/store.vue';
import Dev from './pages/dev.vue';
import Settings from './pages/settings.vue';
import Messages from './components/messages.vue';
import packageJson from '../package.json';
import { useStoreDataStore } from './store/storeDataStore';
import useBrowserAction from './composables/useBrowserAction';
import configs from './config';
import useExtensionUpdate from './composables/useExtensionUpdate';

const version = ref(packageJson.version);
const $store = useStoreDataStore();
const { getStoreData, getStoreIntegrations, getStoreHistory } =
  useBrowserAction();
const { checkForUpdates } = useExtensionUpdate();

onMounted(async () => {
  $store.setConfigs(configs);
  $store.setUpdate({ currentVersion: version.value });
  $store.setStoreData(await getStoreData());
  $store.setIntegrations(await getStoreIntegrations());
  $store.setStoreHistory(await getStoreHistory());
  await checkForUpdates({ silent: true });
});
</script>

<style scoped>
.board {
  background: #0d1117;
  max-width: 302px;
  width: 450px;
  height: 480px;
  overflow-y: hidden;
  padding: 16px;
  position: relative;
}

.footer-message {
  display: flex;
  gap: 8px;
  align-items: center;
  text-align: center;
  font-size: 10px;
  bottom: 5px;
  left: 50%;
  transform: translate(-50%, -50%);
  position: absolute;
}

.update-pill {
  background: rgba(35, 134, 54, 0.18);
  border: 1px solid rgba(35, 134, 54, 0.4);
  border-radius: 999px;
  color: #7ee787;
  padding: 2px 6px;
}
</style>
