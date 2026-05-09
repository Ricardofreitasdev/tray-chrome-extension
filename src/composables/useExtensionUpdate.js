import packageJson from '../../package.json';
import { useStoreDataStore } from '../store/storeDataStore';
import { useToastStore } from '../store/toastStore';
import {
  compareVersions,
  fetchLatestVersion,
  getDefaultUpdateUrl,
} from '../utils/updateClient';

export default function useExtensionUpdate() {
  const $store = useStoreDataStore();
  const $toast = useToastStore();

  const checkForUpdates = async ({ silent = false } = {}) => {
    $store.setUpdate({
      status: 'checking',
      currentVersion: packageJson.version,
      message: 'Verificando atualizações...',
    });

    try {
      const updatePayload = await fetchLatestVersion(getDefaultUpdateUrl());
      const comparison = compareVersions(packageJson.version, updatePayload.version);
      const hasUpdate = comparison === 1;

      $store.setUpdate({
        status: hasUpdate ? 'update-available' : 'up-to-date',
        currentVersion: packageJson.version,
        latestVersion: updatePayload.version,
        downloadUrl: updatePayload.downloadUrl || '',
        releaseNotesUrl: updatePayload.releaseNotesUrl || '',
        checkedAt: new Date().toISOString(),
        message: hasUpdate
          ? 'Uma nova versão está disponível para download.'
          : 'Você já está na versão mais recente.',
      });

      if (hasUpdate) {
        $toast.push(`Nova versão disponível: ${updatePayload.version}`);
      } else if (!silent) {
        $toast.push('Extensão já está atualizada');
      }
    } catch (error) {
      $store.setUpdate({
        status: 'error',
        currentVersion: packageJson.version,
        checkedAt: new Date().toISOString(),
        message: error.message || 'Não foi possível verificar atualizações.',
      });

      if (!silent) {
        $toast.push('Falha ao verificar atualizações');
      }
    }
  };

  return {
    checkForUpdates,
  };
}
