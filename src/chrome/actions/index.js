import Messages from '../messages/index.js';
import Helpers from '../helpers/index.js';

const FB_CONVERSIONS = 'fbConversionsDebug=1';
const REMOVE_THEME_PARAM = 'layoutOff=1';
const REMOVE_JS_CHECKOUT_PARAM = 'js=0';
const REMOVE_JS_FRONT_PARAM = 'jsOff=1';
const CENTRAL_PREFIX = 'my-account';
const CHECKOUT_PREFIX = 'checkout';

const Actions = {
  removeLayoutByParam(url) {
    const message = Messages.success('THEME_REMOVED');

    if (url.includes(CENTRAL_PREFIX) || url.includes(CHECKOUT_PREFIX)) {
      throw new Error(Messages.error('INVALID_PAGE'));
    }

    if (url.includes(REMOVE_THEME_PARAM)) {
      throw new Error(Messages.error('THEME_ALREADY_REMOVED'));
    }

    const newUrl = Helpers.addParam(url, REMOVE_THEME_PARAM);

    return { newUrl, message };
  },

  addFbDebugParam(url) {
    const message = Messages.success('FB_CONVERSIONS_SUCCESS');

    if (url.includes(FB_CONVERSIONS)) {
      throw new Error(Messages.error('FB_CONVERSIONS_ERROR'));
    }

    const newUrl = Helpers.addParam(url, FB_CONVERSIONS);

    return { newUrl, message };
  },

  removeExternalJsFromUrl(url) {
    let param = REMOVE_JS_FRONT_PARAM;

    const message = Messages.success('JS_REMOVED');

    if (url.includes(CENTRAL_PREFIX) || url.includes(CHECKOUT_PREFIX)) {
      param = REMOVE_JS_CHECKOUT_PARAM;
    }

    if (url.includes(param)) {
      throw new Error(Messages.error('JS_ALREADY_REMOVED'));
    }

    const hashIndex = url.indexOf('#');
    const urlWithoutHash = hashIndex >= 0 ? url.substring(0, hashIndex) : url;

    let newUrl = Helpers.addParam(urlWithoutHash, param);

    if (hashIndex >= 0) {
      newUrl = `${newUrl}${url.substring(hashIndex)}`;
    }

    return { newUrl, message };
  },

  async getHistory() {
    const { history } = await new Promise((resolve, reject) => {
      chrome.storage.local.get('history', (data) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(data);
        }
      });
    });
    return history;
  },

  async setHistory(data) {
    const storageData = {
      id: data.id,
      url: data.url,
    };

    let currentHistory = await this.getHistory();

    if (!currentHistory) {
      currentHistory = [];
    }

    if (currentHistory.some((item) => item.url === storageData.url)) {
      return;
    }

    currentHistory.push(storageData);

    if (currentHistory.length > 4) {
      currentHistory.shift();
    }

    chrome.storage.local.set({ history: currentHistory });
  },

  changeUrl({ currentUrl, environment }) {
    const config = Helpers.getConfigs();
    const checkoutEnvironments = this.createEnvironmentMapping(
      config.easy,
      CHECKOUT_PREFIX
    );
    const centralEnvironments = this.createEnvironmentMapping(
      config.central,
      CENTRAL_PREFIX
    );

    const message = Messages.success('CHANGE_URL');

    let newUrl = currentUrl;

    if (currentUrl.includes(CHECKOUT_PREFIX)) {
      const urlMappingFunction = checkoutEnvironments[environment];
      newUrl = urlMappingFunction(currentUrl);

      return { newUrl, message };
    }

    if (currentUrl.includes(CENTRAL_PREFIX)) {
      const urlMappingFunction = centralEnvironments[environment];
      newUrl = urlMappingFunction(currentUrl);

      return { newUrl, message };
    }

    throw new Error(Messages.error('CHANGE_URL_ERROR'));
  },

  createEnvironmentMapping(items, replaceText) {
    const mapping = {};

    const replaceDomainRegex = /^https?:\/\/[^/]+/;
    const replaceDomainAndFirstPathRegex = /^https?:\/\/[^/]+\/[^/]+/;

    items.forEach(({ environment, url }) => {
      mapping[environment] = (domain) => {
        const isReplaceDomainEnv =
          environment === 'dev' || environment === 'tmk';

        if (isReplaceDomainEnv) {
          return domain.replace(replaceDomainRegex, url);
        }

        const isReplaceDomainAndFirstPathEnv = [
          'com1',
          'com2',
          'exc2',
          'exc1',
        ].includes(environment);

        if (isReplaceDomainAndFirstPathEnv) {
          return domain.replace(replaceDomainAndFirstPathRegex, url);
        }

        return domain.replace(replaceText, url);
      };
    });

    return mapping;
  },
};

export default Actions;
