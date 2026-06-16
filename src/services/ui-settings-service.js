import { readStorage, writeStorage } from '../utils/storage.js';

const SETTINGS_KEY = 'markellos-ecosystem:ui-settings';

export const DEFAULT_UI_SETTINGS = Object.freeze({
  theme: 'natural',
  textSize: 'default',
  density: 'comfortable',
  motion: 'standard',
});

const VALID_OPTIONS = Object.freeze({
  theme: ['natural', 'light', 'contrast'],
  textSize: ['small', 'default', 'large'],
  density: ['comfortable', 'compact'],
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
  root.dataset.uiDensity = normalizedSettings.density;
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
