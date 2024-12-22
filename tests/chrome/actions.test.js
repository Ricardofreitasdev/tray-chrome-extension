import { describe, expect, test } from 'vitest';

import Actions from '../../src/chrome/actions';
import environmentMock from '../mocks/environment';

describe('createEnvironmentMapping', () => {
  const { createEnvironmentMapping } = Actions;
  const { ENVS_MOCK, CHECKOUT_PREFIX, URL, OUTPUT } = environmentMock;

  test('Deve realizar o replace na url de acordo com o ambiente', () => {
    const environmentMapping = createEnvironmentMapping(
      ENVS_MOCK,
      CHECKOUT_PREFIX
    );

    OUTPUT.forEach(({ environment, url }) => {
      expect(environmentMapping[environment](`${URL}`)).toBe(url);
    });
  });
});
