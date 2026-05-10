<template>
  <div v-if="$store.isTray">
    <p v-for="link in externalLinks" :key="link.label" class="item">
      <a :href="link.url" target="_blank">{{ link.label }}</a>
    </p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useStoreDataStore } from '../../store/storeDataStore';

const $store = useStoreDataStore();

const externalLinks = computed(() => {
  return [
    {
      label: 'Documentação API',
      url: 'https://developers.tray.com.br',
    },
    {
      label: 'Documentação Temas',
      url: 'https://partners.tray.com.br/v/themes/comece-por-aqui/temas-tray',
    },
  ];
});
</script>
