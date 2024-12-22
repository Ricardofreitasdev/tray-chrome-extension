import Messages from '../messages/index.js';
import Actions from '../actions/index.js';
import Scripts from '../scripts/index.js';
import Helpers from '../helpers/index.js';

const ActionsController = {
  async getStoreData({ tabId }) {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: Scripts.storeDataByHtml,
    });

    if (result.isTray) {
      await Actions.setHistory(result);
    }

    return result;
  },

  async getStoreIntegrations({ tabId }) {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: Scripts.storeIntegrationsByHtml,
    });

    return result;
  },

  async getInlineScripts({ tabId }) {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: Scripts.getInlineScriptsWithoutNonce,
    });

    return result;
  },

  async layoutOff({ tabId, tabUrl }) {
    const { message, newUrl } = Actions.removeLayoutByParam(tabUrl);
    chrome.tabs.update(tabId, { url: newUrl });
    return message;
  },

  async fbDebug({ tabId, tabUrl }) {
    const { message, newUrl } = Actions.addFbDebugParam(tabUrl);
    chrome.tabs.update(tabId, { url: newUrl });
    return message;
  },

  async goToDashboard({ data }) {
    await ActionsController.handleDashboardLogin(data.id);
    return Messages;
  },

  async jsOff({ tabId, tabUrl }) {
    const { message, newUrl } = Actions.removeExternalJsFromUrl(tabUrl);
    chrome.tabs.update(tabId, { url: newUrl });
    return message;
  },

  async getStoreHistory() {
    return await Actions.getHistory();
  },

  async changeEnvironment({ tabId, data }) {
    const { message, newUrl } = Actions.changeUrl(data);
    chrome.tabs.update(tabId, { url: newUrl });
    return message;
  },

  async clearCache() {
    await chrome.browsingData.remove(
      {
        originTypes: {
          protectedWeb: true,
          unprotectedWeb: true,
          extension: true,
        },
      },
      {
        cacheStorage: false,
        cookies: false,
        fileSystems: false,
        indexedDB: false,
        localStorage: true,
      }
    );
    return Messages.success('STORAGE');
  },

  async handleDashboardLogin(storeId) {
    const configs = Helpers.getConfigs();

    const getUserIdTab = await chrome.tabs.create({
      url: configs?.dashboard?.userId,
      active: false,
    });

    await Helpers.awaitForTabUpdate(getUserIdTab.id);

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId: getUserIdTab.id },
      func: Scripts.getUserId,
    });

    await chrome.tabs.update(getUserIdTab.id, {
      url: configs?.dashboard?.url + storeId + '|' + result,
    });

    await Helpers.awaitForTabUpdate(getUserIdTab.id);

    await chrome.scripting.executeScript({
      target: { tabId: getUserIdTab.id },
      func: Scripts.goToDashboard,
    });

    await Helpers.focusTab(getUserIdTab.id);
  },
};

export default ActionsController;
