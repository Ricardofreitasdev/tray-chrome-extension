<template>
  <section class="update-card" :class="statusClass">
    <div class="header">
      <div class="copy">
        <strong>Atualizações</strong>
        <p v-if="showMessage">{{ statusMessage }}</p>
      </div>
      <button class="secondary" :disabled="isChecking" @click="emit('check')">
        {{ isChecking ? 'Verificando...' : 'Verificar' }}
      </button>
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

const emit = defineEmits(['check']);

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
  background: linear-gradient(
    135deg,
    rgba(47, 129, 247, 0.14),
    rgba(22, 27, 34, 0.96)
  );
  border: 1px solid rgba(47, 129, 247, 0.25);
  border-radius: 4px;
  padding: 8px;
  margin-bottom: 8px;
}

.header {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;

  .copy {
    min-width: 0;
  }

  strong {
    color: #f0f6fc;
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
  margin-top: 10px;
  font-size: 11px;
  color: #93a1b3;
}

.actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 12px;
}

button {
  border: 1px solid rgba(240, 246, 252, 0.16);
  background: rgba(255, 255, 255, 0.06);
  color: #f0f6fc;
  border-radius: 8px;
  padding: 7px 10px;
  font-size: 12px;
  white-space: nowrap;
  cursor: pointer;
}

button:disabled {
  opacity: 0.6;
  cursor: wait;
}

.is-update-available {
  border-color: rgba(35, 134, 54, 0.55);
  background: linear-gradient(
    135deg,
    rgba(35, 134, 54, 0.2),
    rgba(22, 27, 34, 0.96)
  );
}

.is-error {
  border-color: rgba(248, 81, 73, 0.45);
  background: linear-gradient(
    135deg,
    rgba(248, 81, 73, 0.14),
    rgba(22, 27, 34, 0.96)
  );
}

.is-compact {
  padding: 8px 10px;
  background: rgba(255, 255, 255, 0.03);
  border-color: rgba(255, 255, 255, 0.08);

  .header strong {
    margin-bottom: 0;
  }

  .meta {
    margin-top: 6px;
  }
}
</style>
