import { readStorage, writeStorage } from '../utils/storage.js';

const CONSENT_KEY = 'markellos-ecosystem:consent';

export const CONSENT_LEVELS = Object.freeze({
  NECESSARY: 'necessary',
  ALL: 'all',
});

export function getConsent() {
  const storedConsent = readStorage(CONSENT_KEY);
  return Object.values(CONSENT_LEVELS).includes(storedConsent) ? storedConsent : null;
}

export function saveConsent(level) {
  if (!Object.values(CONSENT_LEVELS).includes(level)) {
    throw new TypeError(`Unsupported consent level: ${level}`);
  }

  const saved = writeStorage(CONSENT_KEY, level);

  globalThis.dispatchEvent?.(
    new globalThis.CustomEvent('markellos:consent-changed', {
      detail: { level, saved },
    }),
  );

  return saved;
}
