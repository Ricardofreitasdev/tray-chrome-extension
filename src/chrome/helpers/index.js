import environments from '../../config.js';

const Helpers = {
  getConfigs() {
    return environments || {};
  },

  addParam(url, param) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}${param}`;
  },

  async awaitForTabUpdate(tabId, status = 'complete') {
    return new Promise((resolve) => {
      chrome.tabs.onUpdated.addListener(
        function listener(updatedTabId, changeInfo) {
          if (updatedTabId === tabId && changeInfo.status === status) {
            chrome.tabs.onUpdated.removeListener(listener);
            resolve();
          }
        }
      );
    });
  },

  async focusTab(tabId) {
    await chrome.tabs.update(tabId, { active: true });
  },

  isValidStoreId(selectionText) {
    return /^[0-9]+$/.test(selectionText);
  },
};

export default Helpers;
