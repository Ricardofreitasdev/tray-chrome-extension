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
        <slot v-if="activeTab === index" :name="tabName(index)" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import environments from '../config';

const activeTab = ref(0);
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
  dev: {
    key: 'dev',
    label: 'Dev',
    icon: `
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M20 3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2ZM9.29 15.29 8 16.59 3.41 12 8 7.41l1.29 1.3L6 12l3.29 3.29ZM12 17h-2l2-10h2l-2 10Zm3.71-1.71L14.41 14 17.7 10.71 21 14l-1.29 1.29L16.41 12l-.7-.71-.71.71 3.29 3.29Z"
        />
      </svg>
    `,
  },
};

const tabs = ref([TAB_ITEMS.store, TAB_ITEMS.tools, TAB_ITEMS.clipboard]);

onMounted(() => {
  setDevEnvironment();
});

const setDevEnvironment = () => {
  const hasEnvs = environments.easy || environments.central;
  if (hasEnvs) {
    tabs.value.push(TAB_ITEMS.dev);
  }
};

const tabName = (index) => {
  return `tab-content-${index}`;
};
</script>

<style lang="scss">
.tab-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tab-buttons button {
  display: grid;
  place-items: center;
  background-color: rgba(255, 255, 255, 0.03);
  color: #8b949e;
  border: 1px solid rgba(255, 255, 255, 0.08);
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
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(88, 166, 255, 0.26);
  color: #c9d1d9;
}

.tab-buttons button.active {
  background: rgba(88, 166, 255, 0.08);
  border-color: rgba(88, 166, 255, 0.42);
  color: #58a6ff;
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
