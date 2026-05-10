<template>
  <div>
    <div class="tab-buttons">
      <button
        v-for="(tab, index) in tabs"
        :key="tab.key"
        :class="{ active: activeTab === index }"
        :title="tab.label"
        :aria-label="tab.label"
        type="button"
        @click="activeTab = index"
      >
        <span class="tab-icon" v-html="tab.icon" />
      </button>
    </div>
    <div class="tab-area">
      <div
        v-for="(tab, index) in tabs"
        :key="tab.key"
        :class="['tab-content', { 'tab-active': activeTab === index }]"
        class="tab-content"
      >
        <slot v-if="activeTab === index" :name="tab.key" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import environments from '../config';
import { useStoreDataStore } from '../store/storeDataStore';

const activeTab = ref(0);
const $store = useStoreDataStore();
const TAB_ITEMS = {
  store: {
    key: 'store',
    label: 'Loja',
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2Zm10 0c-1.1 0-1.99.9-1.99 2S15.9 22 17 22s2-.9 2-2-.9-2-2-2ZM1 2v2h2l3.6 7.59-1.35 2.45A2 2 0 0 0 7 17h12v-2H7.42a.25.25 0 0 1-.22-.37l.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03L21 5H5.21l-.94-2H1Z"
        />
      </svg>
    `,
  },
  tools: {
    key: 'tools',
    label: 'Ferramentas',
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="m22.61 18.99-9.08-9.08c.93-2.34.45-5.1-1.44-6.99A6.495 6.495 0 0 0 4.7 1.48L9 5.78 6.18 8.6l-4.3-4.3a6.505 6.505 0 0 0 1.43 7.4c1.9 1.9 4.65 2.38 6.99 1.45l9.08 9.08a1 1 0 0 0 1.41 0l1.82-1.82a.997.997 0 0 0 0-1.42Z"
        />
      </svg>
    `,
  },
  clipboard: {
    key: 'clipboard',
    label: 'Clipboard',
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M19 3h-4.18C14.4 1.84 13.3 1 12 1s-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2Zm-7-1c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1Zm7 17H5V5h14v14Z"
        />
      </svg>
    `,
  },
  settings: {
    key: 'settings',
    label: 'Config',
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M19.14 12.94c.04-.31.06-.63.06-.94s-.02-.63-.06-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.92-3.32a.5.5 0 0 0-.6-.22l-2.39.96a7.14 7.14 0 0 0-1.63-.94l-.36-2.54a.49.49 0 0 0-.49-.42h-3.84a.49.49 0 0 0-.49.42l-.36 2.54c-.58.23-1.12.54-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.71 8.84a.5.5 0 0 0 .12.64L4.86 11c-.04.31-.06.64-.06.96s.02.65.06.96l-2.03 1.52a.5.5 0 0 0-.12.64l1.92 3.32a.5.5 0 0 0 .6.22l2.39-.96c.5.39 1.05.71 1.63.94l.36 2.54c.05.24.25.42.49.42h3.84c.24 0 .44-.18.49-.42l.36-2.54c.58-.23 1.13-.55 1.63-.94l2.39.96a.5.5 0 0 0 .6-.22l1.92-3.32a.5.5 0 0 0-.12-.64l-2.03-1.52ZM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z"
        />
      </svg>
    `,
  },
  dev: {
    key: 'dev',
    label: 'Dev',
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="m9.4 16.6-4.6-4.6 4.6-4.6L8 6l-6 6 6 6 1.4-1.4Zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4Z"
        />
      </svg>
    `,
  },
};

const tabs = computed(() => {
  const items = [TAB_ITEMS.store, TAB_ITEMS.tools];

  if ($store.settings.clipboardHistory) {
    items.push(TAB_ITEMS.clipboard);
  }

  items.push(TAB_ITEMS.settings);

  const hasEnvs = environments.easy || environments.central;
  if (hasEnvs) {
    items.push(TAB_ITEMS.dev);
  }

  return items;
});

watch(
  () => tabs.value.length,
  (length) => {
    if (activeTab.value >= length) {
      activeTab.value = Math.max(length - 1, 0);
    }
  }
);
</script>

<style lang="scss">
.tab-buttons {
  display: flex;
  gap: 8px;
}

.tab-buttons button {
  display: grid;
  place-items: center;
  background-color: var(--surface-3);
  color: var(--text-dim);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  flex: 1;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    transform 0.18s ease,
    color 0.18s ease;
}

.tab-buttons button:hover {
  background: var(--surface-4);
  border-color: var(--accent-border);
  color: var(--text-hover);
}

.tab-buttons button.active {
  background: var(--accent-soft);
  border-color: var(--accent-border-strong);
  color: var(--accent);
  transform: translateY(-1px);
}

.tab-icon {
  display: inline-flex;
  width: 20px;
  height: 20px;
}

.tab-icon :deep(svg) {
  width: 20px;
  height: 20px;
  display: block;
}

.tab-area {
  position: relative;
}

.tab-content {
  position: absolute;
  top: 15px;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.2s,
    transform 0.5s;
  transform: translateX(-50px);
}

.tab-content.tab-active {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0%);
}
</style>
