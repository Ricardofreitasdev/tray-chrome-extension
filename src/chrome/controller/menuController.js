import Helpers from '../helpers/index.js';
import Messages from '../messages/index.js';
import ActionsController from './actionsController.js';

const MenuController = {
  async openSecureDomain(info) {
    const codigo = encodeURIComponent(info.selectionText);

    if (!Helpers.isValidStoreId(codigo)) {
      throw new Error(Messages.error('INVALID_STORE_ID'));
    }

    const data = await fetch(
      `https://${codigo}.commercesuite.com.br/web_api/info`
    );
    const { secure_uri } = await data.json();

    if (!secure_uri) {
      throw new Error(Messages.error('INVALID_STORE_ID'));
    }

    chrome.tabs.create({ url: secure_uri });
  },

  async openCommerceSuite(info) {
    const codigo = encodeURIComponent(info.selectionText);

    if (!Helpers.isValidStoreId(codigo)) {
      throw new Error(Messages.error('INVALID_STORE_ID'));
    }

    try {
      chrome.tabs.create({ url: `https://${codigo}.commercesuite.com.br` });
    } catch (error) {
      throw new Error(Messages.error('INVALID_STORE_ID'));
    }
  },

  async openDashboard(info) {
    const codigo = encodeURIComponent(info.selectionText);

    if (!Helpers.isValidStoreId(codigo)) {
      throw new Error(Messages.error('INVALID_STORE_ID'));
    }

    await ActionsController.handleDashboardLogin(codigo);
  },
};

export default MenuController;
