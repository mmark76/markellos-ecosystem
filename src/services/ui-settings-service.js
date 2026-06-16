import { readStorage, writeStorage } from '../utils/storage.js';

const SETTINGS_KEY = 'markellos-ecosystem:ui-settings';

export const DEFAULT_UI_SETTINGS = Object.freeze({
  theme: 'natural',
  textSize: 'default',
  titleSize: 'default',
  nodeSize: 'default',
  density: 'comfortable',
  font: 'classic',
  background: 'decorative',
  motion: 'standard',
});

const VALID_OPTIONS = Object.freeze({
  theme: ['natural', 'light', 'sepia', 'dark', 'contrast'],
  textSize: ['small', 'default', 'large', 'extra-large'],
  titleSize: ['small', 'default', 'large'],
  nodeSize: ['small', 'default', 'large'],
  density: ['compact', 'comfortable', 'spacious'],
  font: ['classic', 'readable'],
  background: ['decorative', 'minimal', 'plain'],
  motion: ['standard', 'reduced'],
});

function normalizeSettings(settings = {}) {
  return Object.fromEntries(
    Object.entries(DEFAULT_UI_SETTINGS).map(([key, fallback]) => {
      const value = settings[key];
      return [key, VALID_OPTIONS[key].includes(value) ? value : fallback];
    }),
  );
}

export function getUiSettings() {
  const storedValue = readStorage(SETTINGS_KEY);

  if (!storedValue) {
    return { ...DEFAULT_UI_SETTINGS };
  }

  try {
    return normalizeSettings(JSON.parse(storedValue));
  } catch {
    return { ...DEFAULT_UI_SETTINGS };
  }
}

export function applyUiSettings(settings = getUiSettings()) {
  const normalizedSettings = normalizeSettings(settings);
  const root = globalThis.document?.documentElement;

  if (!root) {
    return normalizedSettings;
  }

  root.dataset.uiTheme = normalizedSettings.theme;
  root.dataset.uiTextSize = normalizedSettings.textSize;
  root.dataset.uiTitleSize = normalizedSettings.titleSize;
  root.dataset.uiNodeSize = normalizedSettings.nodeSize;
  root.dataset.uiDensity = normalizedSettings.density;
  root.dataset.uiFont = normalizedSettings.font;
  root.dataset.uiBackground = normalizedSettings.background;
  root.dataset.uiMotion = normalizedSettings.motion;

  return normalizedSettings;
}

export function saveUiSettings(settings) {
  const normalizedSettings = normalizeSettings(settings);
  writeStorage(SETTINGS_KEY, JSON.stringify(normalizedSettings));
  applyUiSettings(normalizedSettings);

  globalThis.dispatchEvent?.(
    new globalThis.CustomEvent('markellos:ui-settings-changed', {
      detail: normalizedSettings,
    }),
  );

  return normalizedSettings;
}

export function resetUiSettings() {
  return saveUiSettings(DEFAULT_UI_SETTINGS);
}
