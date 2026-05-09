<template>
  <div>
    <div v-if="$store.isTray" class="container">
      <div v-for="(prop, key) in store" :key="key" class="item">
        <p v-if="prop.value">
          {{ prop.label }}:
          <copy-area :text="prop.value" />
        </p>
      </div>
      <hr />
      <p v-if="$store.hasDashboardConfig" class="item">
        <a @click="goToDashboard($store.store)">Acessar Painel da Loja</a>
      </p>
      <p class="item">
        <a @click="facebookConversions">Ativar Debug do Facebook</a>
      </p>
      <p class="item">
        <a @click="removeTheme">Remover Tema</a>
      </p>
      <p class="item">
        <a @click="removeExternalScripts">Remover Scripts Externos</a>
      </p>
      <p v-show="$store.isEasy" class="item">
        <a @click="verifyInlineScript($store.store)">
          [CSP] Report de scripts inline sem nonce
        </a>
      </p>
      <p class="item">
        <a @click="exportExternalScriptsReport($store.store)">
          [Scripts] Exportar relatorio de scripts externos
        </a>
      </p>
      <hr />
      <app-history />
    </div>
    <div v-else>Não parece ser uma loja tray</div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import AppHistory from '../components/tools/history.vue';
import CopyArea from '../components/copy-area.vue';
import { useStoreDataStore } from '../store/storeDataStore';
import useBrowserAction from '../composables/useBrowserAction';

const $store = useStoreDataStore();

const {
  removeTheme,
  removeExternalScripts,
  facebookConversions,
  verifyInlineScript,
  goToDashboard,
  exportExternalScriptsReport,
} = useBrowserAction();

const store = computed(() => ({
  id: { value: $store.store.id, label: 'Loja' },
  session: { value: $store.store.session, label: 'Sessão' },
  server: { value: $store.store.server, label: 'Server' },
  gtm: { value: $store.integrations.gtm, label: 'Gtm' },
  ga4: { value: $store.integrations.analyticsGa4, label: 'Ga4' },
  ua: { value: $store.integrations.analyticsUa, label: 'UA' },
  pixel: { value: $store.integrations.facebookPixel, label: 'Pixel' },
}));
</script>

<style lang="scss">
code {
  font-family: monospace;
  font-size: 14px;
  margin: 10px;
}

.item {
  margin-bottom: 5px;
  font-size: 14px;
}
hr {
  border: 1px solid $bg-color-2;
  margin: 10px 0;
}

b {
  cursor: copy;
}
</style>
