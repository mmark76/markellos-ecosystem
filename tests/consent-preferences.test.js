import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CONSENT_LEVELS,
  clearConsent,
  getConsent,
  saveConsent,
} from '../src/services/consent-service.js';
import { removeStorage } from '../src/utils/storage.js';

function createMemoryStorage(initialValues = {}) {
  const values = new Map(Object.entries(initialValues));

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  };
}

test('stored consent can be withdrawn', (t) => {
  globalThis.localStorage = createMemoryStorage();
  t.after(() => delete globalThis.localStorage);

  assert.equal(saveConsent(CONSENT_LEVELS.ALL), true);
  assert.equal(getConsent(), CONSENT_LEVELS.ALL);
  assert.equal(clearConsent(), true);
  assert.equal(getConsent(), null);
});

test('storage removal fails safely when browser storage is blocked', (t) => {
  globalThis.localStorage = {
    removeItem() {
      throw new Error('blocked');
    },
  };
  t.after(() => delete globalThis.localStorage);

  assert.equal(removeStorage('example'), false);
});
