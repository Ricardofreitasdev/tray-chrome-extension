import { useToastStore } from '../store/toastStore';

const browser = {
  getCurrentTab: async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    return tab;
  },

  sendMessage: async (action, data) => {
    const { id: tabId, url: tabUrl } = await browser.getCurrentTab();
    return await chrome.runtime.sendMessage({ tabId, tabUrl, action, data });
  },
};

export default function useBrowserAction() {
  const $toast = useToastStore();

  const actions = {
    removeTheme: async () => {
      const response = await browser.sendMessage('layoutOff');
      $toast.push(response);
    },

    removeExternalScripts: async () => {
      const response = await browser.sendMessage('jsOff');
      $toast.push(response);
    },

    facebookConversions: async () => {
      const response = await browser.sendMessage('fbDebug');
      $toast.push(response);
    },

    goToDashboard: async ({ id }) => {
      const response = await browser.sendMessage('goToDashboard', { id });
      $toast.push(response);
    },

    changeUrl: async (env, { currentUrl }) => {
      const response = await browser.sendMessage('changeEnvironment', {
        currentUrl: currentUrl,
        environment: env,
      });
      $toast.push(response);
    },

    clear: async () => {
      const response = await browser.sendMessage('clearCache');
      $toast.push(response);
    },

    verifyInlineScript: async ({ hasCSP, id }) => {
      const { inlineScripts, totalBlockedScripts } =
        await browser.sendMessage('getInlineScripts');

      if (!hasCSP) {
        $toast.push(`A loja ${id} não esta com CSP ativo`);
        return;
      }

      if (totalBlockedScripts > 0) {
        actions.createCSPReport(inlineScripts, totalBlockedScripts, id);

        $toast.push(`Acesse os seus downloads para verificar os scripts
            bloqueado na loja ${id}`);
        return;
      }

      $toast.push(`A loja ${id} não tem scripts inlines`);
    },

    createCSPReport: (data, total, id) => {
      let scriptReport = `Total de Scripts Bloqueados: ${total}\n\n`;

      data.forEach((script, index) => {
        scriptReport += `Script ${index + 1}:\n`;
        scriptReport += '-------------------------------------------\n';
        scriptReport += `${script}\n\n`;
      });

      const blob = new Blob([scriptReport], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `scripts_inline_sem_nonce_loja-${id}.txt`;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    },
  };

  const getters = {
    getStoreData: async () => await browser.sendMessage('getStoreData'),

    getStoreIntegrations: async () =>
      await browser.sendMessage('getStoreIntegrations'),

    getStoreHistory: async () => await browser.sendMessage('getStoreHistory'),
  };

  return {
    ...actions,
    ...getters,
  };
}
