<template>
  <section class="update-card" :class="statusClass">
    <div class="header">
      <div class="copy">
        <strong>Atualizações</strong>
        <p v-if="showMessage">{{ statusMessage }}</p>
      </div>
    </div>

    <div class="meta">
      <span>{{ compactMeta }}</span>
      <span v-if="showLatestVersion">Ultima: {{ latestVersion }}</span>
    </div>

    <div v-if="hasUpdate" class="actions">
      <a :href="downloadUrl" target="_blank" rel="noreferrer">
        Baixar atualização
      </a>
      <a
        v-if="releaseNotesUrl"
        :href="releaseNotesUrl"
        target="_blank"
        rel="noreferrer"
      >
        Ver release
      </a>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentVersion: {
    type: String,
    required: true,
  },
  latestVersion: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    default: 'idle',
  },
  message: {
    type: String,
    default: '',
  },
  downloadUrl: {
    type: String,
    default: '',
  },
  releaseNotesUrl: {
    type: String,
    default: '',
  },
});

const hasUpdate = computed(() => props.status === 'update-available');
const isChecking = computed(() => props.status === 'checking');
const hasError = computed(() => props.status === 'error');
const isCompact = computed(
  () => !hasUpdate.value && !hasError.value && !isChecking.value
);
const statusClass = computed(() => ({
  [`is-${props.status}`]: true,
  'is-compact': isCompact.value,
}));
const showMessage = computed(() => !isCompact.value);
const showLatestVersion = computed(
  () => !!props.latestVersion && props.latestVersion !== props.currentVersion
);
const compactMeta = computed(() => {
  if (isChecking.value) {
    return 'Verificando versao...';
  }

  if (hasUpdate.value) {
    return `Atual: ${props.currentVersion}`;
  }

  if (hasError.value) {
    return 'Nao foi possivel validar agora';
  }

  return `Versao atual: ${props.currentVersion}`;
});

const statusMessage = computed(() => {
  if (props.message) {
    return props.message;
  }

  return 'Verifique se existe uma nova versão disponível.';
});
</script>

<style lang="scss" scoped>
.update-card {
  background: transparent;
  border: 1px solid var(--border-soft);
  border-radius: 10px;
  padding: 10px;
}

.header {
  display: flex;
  gap: 12px;

  .copy {
    min-width: 0;
  }

  strong {
    color: var(--text-primary);
    display: block;
    margin-bottom: 4px;
    font-size: 13px;
  }

  p {
    font-size: 12px;
    line-height: 1.4;
  }
}

.meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
  font-size: 11px;
  color: var(--text-muted);
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 10px;
}

.is-update-available {
  border-color: var(--success-border);
  background: var(--success-soft);
}

.is-error {
  border-color: var(--error-border);
  background: var(--error-soft);
}

.is-compact {
  padding: 10px;
  background: var(--surface-5);
  border-color: var(--border-soft);

  .header strong {
    margin-bottom: 0;
  }

  .meta {
    margin-top: 6px;
  }
}
</style>
