import Messages from '../messages/index.js';
import Actions from '../actions/index.js';
import Scripts from '../scripts/index.js';
import Helpers from '../helpers/index.js';

const ActionsController = {
  async captureScreenshotForTab(tabId) {
    const tab = await chrome.tabs.get(tabId);

    if (!tab?.windowId || !tab?.url || Helpers.isRestrictedChromeUrl(tab.url)) {
      throw new Error(Messages.error('SCREENSHOT_CAPTURE'));
    }

    const image = await chrome.tabs.captureVisibleTab(tab.windowId, {
      format: 'png',
    });

    await chrome.tabs.sendMessage(tabId, {
      action: 'openScreenshotEditor',
      data: {
        image,
      },
    });
  },

  async getStoreData({ tabId }) {
    const tab = await chrome.tabs.get(tabId);
    if (Helpers.isRestrictedChromeUrl(tab?.url)) {
      return {
        id: '',
        session: '',
        title: tab?.title || '',
        url: tab?.url || '',
        currentUrl: tab?.url || '',
        isTray: false,
        hasCSP: false,
        server: '',
      };
    }

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
    const tab = await chrome.tabs.get(tabId);
    if (Helpers.isRestrictedChromeUrl(tab?.url)) {
      return {
        gtm: '',
        analyticsGa4: '',
        analyticsUa: '',
        facebookPixel: '',
      };
    }

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: Scripts.storeIntegrationsByHtml,
    });

    return result;
  },

  async getInlineScripts({ tabId }) {
    const tab = await chrome.tabs.get(tabId);
    if (Helpers.isRestrictedChromeUrl(tab?.url)) {
      return { inlineScripts: [], totalBlockedScripts: 0 };
    }

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: Scripts.getInlineScriptsWithoutNonce,
    });

    return result;
  },

  async getExternalScripts({ tabId }) {
    const tab = await chrome.tabs.get(tabId);
    if (Helpers.isRestrictedChromeUrl(tab?.url)) {
      return { externalScripts: [], totalExternalScripts: 0 };
    }

    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: Scripts.getExternalScripts,
    });

    return result;
  },

  async getClipboardHistory() {
    return await Actions.getClipboardHistory();
  },

  async saveClipboardEntry({ data }) {
    return await Actions.saveClipboardEntry(data);
  },

  async clearClipboardHistory() {
    return await Actions.clearClipboardHistory();
  },

  async captureScreenshot({ tabId }) {
    await ActionsController.captureScreenshotForTab(tabId);
    return Messages.success('SCREENSHOT_CAPTURED');
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
