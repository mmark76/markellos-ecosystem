import { readStorage, writeStorage } from '../utils/storage.js';

const SETTINGS_KEY = 'markellos-ecosystem:ui-settings';

export const DEFAULT_UI_SETTINGS = Object.freeze({
  theme: 'natural',
  textSize: 'default',
  titleSize: 'extra-small',
  titleLayout: 'one-line',
  circleScale: 125,
  density: 'comfortable',
  font: 'classic',
  background: 'decorative',
  positionMode: 'locked',
  motion: 'standard',
});

const VALID_OPTIONS = Object.freeze({
  theme: ['natural', 'light', 'sepia', 'dark', 'contrast'],
  textSize: ['small', 'default', 'large', 'extra-large'],
  titleSize: ['extra-small', 'small', 'default', 'large'],
  titleLayout: ['one-line', 'two-lines'],
  density: ['compact', 'comfortable', 'spacious'],
  font: ['classic', 'readable'],
  background: ['decorative', 'minimal', 'plain'],
  positionMode: ['locked', 'editable'],
  motion: ['standard', 'reduced'],
});

function normalizeCircleScale(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return DEFAULT_UI_SETTINGS.circleScale;
  }

  return Math.min(135, Math.max(70, Math.round(numericValue / 5) * 5));
}

function normalizeSettings(settings = {}) {
  return Object.fromEntries(
    Object.entries(DEFAULT_UI_SETTINGS).map(([key, fallback]) => {
      if (key === 'circleScale') {
        return [key, normalizeCircleScale(settings[key])];
      }

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
  root.dataset.uiTitleLayout = normalizedSettings.titleLayout;
  root.dataset.uiDensity = normalizedSettings.density;
  root.dataset.uiFont = normalizedSettings.font;
  root.dataset.uiBackground = normalizedSettings.background;
  root.dataset.uiPositionMode = normalizedSettings.positionMode;
  root.dataset.uiMotion = normalizedSettings.motion;
  root.style.setProperty('--ui-circle-scale', String(normalizedSettings.circleScale / 100));

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
