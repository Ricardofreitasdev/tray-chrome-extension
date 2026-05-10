<template>
  <div>
    <app-build-cpf />
    <template v-if="$store.settings.cardGenerator">
      <hr />
      <app-card-generator />
    </template>
    <template v-if="$store.settings.screenshot">
      <hr />
      <app-screenshot />
    </template>
    <hr />
    <app-external-links />
  </div>
</template>

<script setup>
import { useStoreDataStore } from '../store/storeDataStore';
import AppCardGenerator from '../components/tools/card.vue';
import AppBuildCpf from '../components/tools/cpf.vue';
import AppExternalLinks from '../components/tools/external-links.vue';
import AppScreenshot from '../components/tools/screenshot.vue';

const $store = useStoreDataStore();
</script>

<style></style>
