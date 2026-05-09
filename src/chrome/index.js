import ActionsController from './controller/actionsController.js';
import MenuController from './controller/menuController.js';
import Helpers from './helpers/index.js';
import Messages from './messages/index.js';
import Scripts from './scripts/index.js';

const injectClipboardManager = async (tabId, url = '') => {
  if (!tabId || Helpers.isRestrictedChromeUrl(url)) {
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ['src/chrome/content/clipboard.js'],
    });
  } catch {
    // Ignore tabs where Chrome blocks script injection.
  }
};

const injectClipboardManagerInOpenTabs = async () => {
  const tabs = await chrome.tabs.query({});

  await Promise.all(
    tabs.map((tab) => injectClipboardManager(tab.id, tab.url || ''))
  );
};

const commandListener = async (command) => {
  if (command !== 'capture-screenshot') {
    return;
  }

  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  if (!tab?.id || Helpers.isRestrictedChromeUrl(tab?.url || '')) {
    return;
  }

  try {
    await ActionsController.captureScreenshotForTab(tab.id);
  } catch {
    // Ignore command failures in restricted or non-capturable tabs.
  }
};

const browserController = (message) => {
  const action = ActionsController[message.action];

  if (typeof action !== 'function') {
    throw new Error(`Ação inválida: "${message.action}"`);
  }

  return action(message);
};

const menuController = async (info, tab) => {
  const action = MenuController[info.menuItemId];

  if (typeof action !== 'function') {
    throw new Error(`Ação inválida: "${info.action}"`);
  }

  return action(info, tab);
};

const messageListener = (message, _, sendResponse) => {
  browserController(message)
    .then((response) => sendResponse(response))
    .catch((error) => {
      sendResponse(error?.message || Messages.error('DEFAULT'));
    });

  return true;
};

const menuListener = async (info, tab) => {
  menuController(info, tab)
    .then(() => {})
    .catch(async (error) => {
      if (Helpers.isRestrictedChromeUrl(tab?.url)) {
        return;
      }

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: Scripts.injectMessageInScreen,
        args: [error.message],
      });
    });

  return true;
};

const contextMenus = {
  async create() {
    await chrome.contextMenus.removeAll();

    const createMenu = ({ id, title, contexts }) => {
      chrome.contextMenus.create({ id, title, contexts });
    };

    createMenu({
      id: 'openSecureDomain',
      title: 'Abrir domínio seguro',
      contexts: ['selection'],
    });

    const configs = Helpers.getConfigs();
    if (configs?.dashboard?.userId) {
      createMenu({
        id: 'openDashboard',
        title: 'Abrir Dashboard',
        contexts: ['selection'],
      });
    }
  },
};

chrome.runtime.onInstalled.addListener(() => contextMenus.create());
chrome.runtime.onInstalled.addListener(() =>
  injectClipboardManagerInOpenTabs()
);
chrome.runtime.onStartup.addListener(() => injectClipboardManagerInOpenTabs());
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    injectClipboardManager(tabId, tab?.url || '');
  }
});
chrome.commands.onCommand.addListener(commandListener);
chrome.contextMenus.onClicked.addListener(menuListener);
chrome.runtime.onMessage.addListener(messageListener);
