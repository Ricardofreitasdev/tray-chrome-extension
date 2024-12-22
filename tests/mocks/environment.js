const DEV = 'http://url.dev.com.br';
const TMK = 'https://tmk.com.br';
const DOMAIN = 'https://loja.com';
const STAGING = 'https://staging.com';
const URL_SUFFIX = '/cart?store_id=123456';

const CHECKOUT_PREFIX = '/checkout';
const URL = `${DOMAIN}${CHECKOUT_PREFIX}${URL_SUFFIX}`;

const ENVS_MOCK = [
  {
    environment: 'dev',
    text: 'Desenvolvimento',
    url: DEV,
  },
  {
    environment: 'tmk',
    text: 'TMK',
    url: TMK,
  },
  {
    environment: 'com1',
    text: 'Commerce 1',
    url: `${STAGING}/com1-checkout`,
  },
  {
    environment: 'com2',
    text: 'Commerce 2',
    url: `${STAGING}/com2-checkout`,
  },
  {
    environment: 'exc2',
    text: 'Exclusive',
    url: `${STAGING}/exc2-checkout`,
  },
];

const OUTPUT = [
  {
    environment: 'dev',
    url: `${DEV}${CHECKOUT_PREFIX}${URL_SUFFIX}`,
  },
  {
    environment: 'tmk',
    url: `${TMK}${CHECKOUT_PREFIX}${URL_SUFFIX}`,
  },
  {
    environment: 'com1',
    url: `${STAGING}/com1-checkout${URL_SUFFIX}`,
  },
  {
    environment: 'com2',
    url: `${STAGING}/com2-checkout${URL_SUFFIX}`,
  },
  {
    environment: 'exc2',
    url: `${STAGING}/exc2-checkout${URL_SUFFIX}`,
  },
];

export default {
  ENVS_MOCK,
  CHECKOUT_PREFIX,
  URL,
  OUTPUT,
};
