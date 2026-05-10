<template>
  <div class="clipboard-page">
    <div class="clipboard-header">
      <div>
        <strong>Historico de copias</strong>
        <p>Atalho na pagina: <code>Alt + Shift + V</code></p>
      </div>
      <button
        v-if="visibleClipboardHistory.length"
        class="button secondary"
        @click="handleClearHistory"
      >
        Limpar
      </button>
    </div>

    <p v-if="!visibleClipboardHistory.length" class="empty">
      Copie algum texto no navegador para salvar aqui.
    </p>

    <div
      v-for="item in visibleClipboardHistory"
      :key="item.id"
      class="clipboard-item"
      @click="copy(item.text)"
    >
      <div class="clipboard-text">{{ limitText(item.text) }}</div>
      <div class="clipboard-meta">
        <span>{{ formatDate(item.createdAt) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import useCopy from '../composables/useCopy';
import { useStoreDataStore } from '../store/storeDataStore';
import useBrowserAction from '../composables/useBrowserAction';

const $store = useStoreDataStore();
const { copy } = useCopy();
const { clearClipboardHistory, getClipboardHistory } = useBrowserAction();
const visibleClipboardHistory = computed(() =>
  $store.clipboardHistory.slice(0, 5)
);

const limitText = (text) => {
  const limit = 120;
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
};

const formatDate = (dateValue) => {
  try {
    return new Date(dateValue).toLocaleString('pt-BR');
  } catch {
    return '';
  }
};

const handleClearHistory = async () => {
  await clearClipboardHistory();
  $store.setClipboardHistory(await getClipboardHistory());
};

onMounted(async () => {
  $store.setClipboardHistory(await getClipboardHistory());
});
</script>

<style lang="scss" scoped>
.clipboard-page {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.clipboard-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;

  strong {
    color: var(--text-primary);
    display: block;
    margin-bottom: 3px;
  }

  p {
    font-size: 11px;
    color: $text-color;
  }

  code {
    font-size: 9px;
  }
}

.clipboard-item {
  background: var(--surface-3);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
  padding: 10px 12px;
  cursor: pointer;
}

.clipboard-item:hover {
  border-color: var(--accent-border);
  background: var(--accent-soft);
}

.clipboard-text {
  color: var(--text-primary);
  word-break: break-word;
}

.clipboard-meta {
  margin-top: 4px;
  font-size: 11px;
  color: $text-color;
}

.empty {
  font-size: 12px;
  color: $text-color;
}

.button.secondary {
  background: var(--surface-4);
  border: 1px solid var(--border-strong);
  padding: 8px 10px;
  border-radius: 8px;
  color: var(--text-primary);
  cursor: pointer;
}

code {
  background: var(--surface-4);
  border-radius: 4px;
  padding: 1px 4px;
}
</style>
