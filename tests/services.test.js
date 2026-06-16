import assert from 'node:assert/strict';
import test from 'node:test';
import {
  CONSENT_LEVELS,
  getConsent,
  saveConsent,
} from '../src/services/consent-service.js';
import {
  DEFAULT_CIRCLE_LAYOUT,
  getCircleLayout,
  resetCircleLayout,
  saveCirclePosition,
} from '../src/services/circle-layout-service.js';
import {
  DEFAULT_UI_SETTINGS,
  applyUiSettings,
  getUiSettings,
  resetUiSettings,
} from '../src/services/ui-settings-service.js';
import { readStorage, writeStorage } from '../src/utils/storage.js';

const CONSENT_KEY = 'markellos-ecosystem:consent';
const SETTINGS_KEY = 'markellos-ecosystem:ui-settings';
const CIRCLE_LAYOUT_KEY = 'markellos-ecosystem:circle-layout';

function createMemoryStorage(initialValues = {}) {
  const values = new Map(Object.entries(initialValues));

  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, String(value));
    },
  };
}

test('storage helpers read and write browser values', (t) => {
  globalThis.localStorage = createMemoryStorage();
  t.after(() => delete globalThis.localStorage);

  assert.equal(writeStorage('example', 'value'), true);
  assert.equal(readStorage('example'), 'value');
});

test('storage helpers fail safely when browser storage throws', (t) => {
  globalThis.localStorage = {
    getItem() {
      throw new Error('blocked');
    },
    setItem() {
      throw new Error('blocked');
    },
  };
  t.after(() => delete globalThis.localStorage);

  assert.equal(readStorage('example'), null);
  assert.equal(writeStorage('example', 'value'), false);
});

test('consent service saves and restores supported preferences', (t) => {
  globalThis.localStorage = createMemoryStorage();
  t.after(() => delete globalThis.localStorage);

  assert.equal(saveConsent(CONSENT_LEVELS.NECESSARY), true);
  assert.equal(getConsent(), CONSENT_LEVELS.NECESSARY);
});

test('consent service ignores unknown stored values', (t) => {
  globalThis.localStorage = createMemoryStorage({ [CONSENT_KEY]: 'unknown' });
  t.after(() => delete globalThis.localStorage);

  assert.equal(getConsent(), null);
});

test('consent service rejects unsupported preferences', () => {
  assert.throws(() => saveConsent('marketing'), TypeError);
});

test('UI settings default to locked circle positions', (t) => {
  globalThis.localStorage = createMemoryStorage();
  t.after(() => delete globalThis.localStorage);

  assert.deepEqual(getUiSettings(), DEFAULT_UI_SETTINGS);
});

test('stored editable mode is forced to locked and invalid values are normalized', (t) => {
  globalThis.localStorage = createMemoryStorage({
    [SETTINGS_KEY]: JSON.stringify({
      theme: 'invalid',
      circleScale: 137,
      positionMode: 'editable',
    }),
  });
  t.after(() => delete globalThis.localStorage);

  const settings = getUiSettings();
  assert.equal(settings.theme, DEFAULT_UI_SETTINGS.theme);
  assert.equal(settings.circleScale, 135);
  assert.equal(settings.positionMode, 'locked');
});

test('UI settings are applied to the document root', (t) => {
  const properties = new Map();
  globalThis.document = {
    documentElement: {
      dataset: {},
      style: {
        setProperty(key, value) {
          properties.set(key, value);
        },
      },
    },
  };
  t.after(() => delete globalThis.document);

  const settings = applyUiSettings({
    ...DEFAULT_UI_SETTINGS,
    theme: 'dark',
    circleScale: 110,
  });

  assert.equal(globalThis.document.documentElement.dataset.uiTheme, 'dark');
  assert.equal(globalThis.document.documentElement.dataset.uiPositionMode, 'locked');
  assert.equal(properties.get('--ui-circle-scale'), '1.1');
  assert.equal(settings.circleScale, 110);
});

test('reset UI settings persists and returns all defaults', (t) => {
  const storage = createMemoryStorage();
  globalThis.localStorage = storage;
  t.after(() => delete globalThis.localStorage);

  assert.deepEqual(resetUiSettings(), DEFAULT_UI_SETTINGS);
  assert.deepEqual(JSON.parse(storage.getItem(SETTINGS_KEY)), DEFAULT_UI_SETTINGS);
});

test('default circle layouts are returned as independent copies', (t) => {
  globalThis.localStorage = createMemoryStorage();
  t.after(() => delete globalThis.localStorage);

  const first = getCircleLayout();
  first['apps:core'].left = 0;

  assert.equal(
    getCircleLayout()['apps:core'].left,
    DEFAULT_CIRCLE_LAYOUT['apps:core'].left,
  );
});

test('malformed stored circle layout falls back to defaults', (t) => {
  globalThis.localStorage = createMemoryStorage({
    [CIRCLE_LAYOUT_KEY]: '{broken',
  });
  t.after(() => delete globalThis.localStorage);

  assert.deepEqual(getCircleLayout(), DEFAULT_CIRCLE_LAYOUT);
});

test('stored circle layout keeps only valid known positions', (t) => {
  globalThis.localStorage = createMemoryStorage({
    [CIRCLE_LAYOUT_KEY]: JSON.stringify({
      'apps:core': { left: 12.345, top: 67.899 },
      'blogs:core': { left: '10', top: 20 },
      'apps:memory-palaces': { left: 999, top: 20 },
      'unknown:circle': { left: 10, top: 10 },
    }),
  });
  t.after(() => delete globalThis.localStorage);

  const layout = getCircleLayout();

  assert.deepEqual(layout['apps:core'], { left: 12.35, top: 67.9 });
  assert.deepEqual(layout['blogs:core'], DEFAULT_CIRCLE_LAYOUT['blogs:core']);
  assert.deepEqual(
    layout['apps:memory-palaces'],
    DEFAULT_CIRCLE_LAYOUT['apps:memory-palaces'],
  );
  assert.equal(Object.hasOwn(layout, 'unknown:circle'), false);
  assert.equal(
    Object.keys(layout).length,
    Object.keys(DEFAULT_CIRCLE_LAYOUT).length,
  );
});

test('circle positions are rounded and persisted', (t) => {
  const storage = createMemoryStorage();
  globalThis.localStorage = storage;
  t.after(() => delete globalThis.localStorage);

  assert.deepEqual(
    saveCirclePosition('apps:core', { left: 12.345, top: 67.899 }),
    { left: 12.35, top: 67.9 },
  );
  assert.deepEqual(
    JSON.parse(storage.getItem(CIRCLE_LAYOUT_KEY))['apps:core'],
    { left: 12.35, top: 67.9 },
  );
});

test('circle position saving rejects unknown identifiers', (t) => {
  globalThis.localStorage = createMemoryStorage();
  t.after(() => delete globalThis.localStorage);

  assert.throws(
    () => saveCirclePosition('unknown:circle', { left: 10, top: 10 }),
    TypeError,
  );
});

test('circle position saving rejects invalid coordinates', (t) => {
  globalThis.localStorage = createMemoryStorage();
  t.after(() => delete globalThis.localStorage);

  assert.throws(
    () => saveCirclePosition('apps:core', { left: Number.NaN, top: 10 }),
    TypeError,
  );
  assert.throws(
    () => saveCirclePosition('apps:core', { left: 301, top: 10 }),
    RangeError,
  );
  assert.throws(
    () => saveCirclePosition('apps:core', { left: 10, top: -201 }),
    RangeError,
  );
});

test('reset circle layout persists and returns defaults', (t) => {
  const storage = createMemoryStorage();
  globalThis.localStorage = storage;
  t.after(() => delete globalThis.localStorage);

  assert.deepEqual(resetCircleLayout(), DEFAULT_CIRCLE_LAYOUT);
  assert.deepEqual(
    JSON.parse(storage.getItem(CIRCLE_LAYOUT_KEY)),
    DEFAULT_CIRCLE_LAYOUT,
  );
});
