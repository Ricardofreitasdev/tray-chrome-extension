<template>
  <div>
    <app-update-status
      :current-version="$store.update.currentVersion"
      :latest-version="$store.update.latestVersion"
      :status="$store.update.status"
      :message="$store.update.message"
      :download-url="$store.update.downloadUrl"
      :release-notes-url="$store.update.releaseNotesUrl"
      @check="checkForUpdates"
    />
    <hr />
    <app-build-cpf />
    <hr />
    <app-external-links />
  </div>
</template>

<script setup>
import AppBuildCpf from '../components/tools/cpf.vue';
import AppExternalLinks from '../components/tools/external-links.vue';
import AppUpdateStatus from '../components/update-status.vue';
import { useStoreDataStore } from '../store/storeDataStore';
import useExtensionUpdate from '../composables/useExtensionUpdate';

const $store = useStoreDataStore();
const { checkForUpdates } = useExtensionUpdate();
</script>

<style></style>
