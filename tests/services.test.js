import assert from 'node:assert/strict';
import test from 'node:test';
import { CONSENT_LEVELS, getConsent, saveConsent } from '../src/services/consent-service.js';
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

test('stored editable mode persists and invalid values are normalized', (t) => {
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
  assert.equal(settings.positionMode, 'editable');
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

  assert.equal(getCircleLayout()['apps:core'].left, DEFAULT_CIRCLE_LAYOUT['apps:core'].left);
});

test('stored valid circle positions load and unknown positions are ignored', (t) => {
  globalThis.localStorage = createMemoryStorage({
    [CIRCLE_LAYOUT_KEY]: JSON.stringify({
      'apps:core': { left: 12.345, top: 67.899 },
      'apps:study-app': { left: 60.5, top: 36.5 },
      'unknown:circle': { left: 10, top: 10 },
    }),
  });
  t.after(() => delete globalThis.localStorage);

  const layout = getCircleLayout();
  assert.deepEqual(layout['apps:core'], { left: 12.35, top: 67.9 });
  assert.deepEqual(layout['apps:study-app'], { left: 60.5, top: 36.5 });
  assert.equal(Object.hasOwn(layout, 'unknown:circle'), false);
});

test('circle position saving normalizes and persists valid coordinates', (t) => {
  const storage = createMemoryStorage();
  globalThis.localStorage = storage;
  t.after(() => delete globalThis.localStorage);

  assert.deepEqual(saveCirclePosition('apps:core', { left: 12.345, top: 67.899 }), {
    left: 12.35,
    top: 67.9,
  });
  assert.deepEqual(JSON.parse(storage.getItem(CIRCLE_LAYOUT_KEY))['apps:core'], {
    left: 12.35,
    top: 67.9,
  });
});

test('circle position saving rejects unknown identifiers', (t) => {
  globalThis.localStorage = createMemoryStorage();
  t.after(() => delete globalThis.localStorage);

  assert.throws(() => saveCirclePosition('unknown:circle', { left: 10, top: 10 }), TypeError);
});

test('circle position saving rejects invalid coordinates', (t) => {
  globalThis.localStorage = createMemoryStorage();
  t.after(() => delete globalThis.localStorage);

  assert.throws(() => saveCirclePosition('apps:core', { left: Number.NaN, top: 10 }), TypeError);
  assert.throws(() => saveCirclePosition('apps:core', { left: -201, top: 10 }), RangeError);
  assert.throws(() => saveCirclePosition('apps:core', null), TypeError);
});

test('invalid stored positions fall back without discarding valid positions', (t) => {
  globalThis.localStorage = createMemoryStorage({
    [CIRCLE_LAYOUT_KEY]: JSON.stringify({
      'apps:core': { left: '12', top: 30 },
      'blogs:core': { left: 20.126, top: 40.994 },
    }),
  });
  t.after(() => delete globalThis.localStorage);

  const layout = getCircleLayout();
  assert.deepEqual(layout['apps:core'], DEFAULT_CIRCLE_LAYOUT['apps:core']);
  assert.deepEqual(layout['blogs:core'], { left: 20.13, top: 40.99 });
});

test('stored layouts missing Animals Within receive its default position', (t) => {
  globalThis.localStorage = createMemoryStorage({
    [CIRCLE_LAYOUT_KEY]: JSON.stringify({
      'apps:core': { left: 30, top: 40 },
    }),
  });
  t.after(() => delete globalThis.localStorage);

  assert.deepEqual(
    getCircleLayout()['apps:animals-within'],
    DEFAULT_CIRCLE_LAYOUT['apps:animals-within'],
  );
});

test('reset circle layout persists and returns defaults', (t) => {
  const storage = createMemoryStorage();
  globalThis.localStorage = storage;
  t.after(() => delete globalThis.localStorage);

  assert.deepEqual(resetCircleLayout(), DEFAULT_CIRCLE_LAYOUT);
  assert.deepEqual(JSON.parse(storage.getItem(CIRCLE_LAYOUT_KEY)), DEFAULT_CIRCLE_LAYOUT);
});

test('resetting circle positions does not reset unrelated UI settings', (t) => {
  const storedSettings = { ...DEFAULT_UI_SETTINGS, theme: 'dark', positionMode: 'editable' };
  const storage = createMemoryStorage({ [SETTINGS_KEY]: JSON.stringify(storedSettings) });
  globalThis.localStorage = storage;
  t.after(() => delete globalThis.localStorage);

  resetCircleLayout();

  assert.deepEqual(JSON.parse(storage.getItem(SETTINGS_KEY)), storedSettings);
});
