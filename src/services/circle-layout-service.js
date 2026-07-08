import { readStorage, writeStorage } from '../utils/storage.js';

const CIRCLE_LAYOUT_KEY = 'markellos-ecosystem:circle-layout';
const MIN_POSITION_PERCENT = -200;
const MAX_POSITION_PERCENT = 300;

export const DEFAULT_CIRCLE_LAYOUT = Object.freeze({
  'apps:chessmnemonics-forum': { left: 98.9, top: 82.08 },
  'apps:chessmnemonics': { left: 77.32, top: 57.24 },
  'apps:chessmnemonics-app': { left: 106.21, top: 51.91 },
  'apps:chess-pgn-audio-player': { left: 39.04, top: 79.01 },
  'blogs:mnemonic-techniques': { left: 82.29, top: 43.08 },
  'blogs:chess-reflections': { left: 3.31, top: 38.74 },
  'blogs:personal-thoughts-and-writings': { left: 44.42, top: 6.41 },
  'blogs:core': { left: 43.23, top: 45.91 },
  'apps:memory-palaces': { left: 62.02, top: 4.68 },
  'apps:organize-your-pc': { left: 8.71, top: 26.4 },
  'apps:study-app': { left: 31, top: 9 },
  'apps:relaxing-sounds': { left: 85.41, top: 23.75 },
  'apps:chessmnemonics-flashcards': { left: 66.45, top: 88.08 },
  'apps:chess-flashcards': { left: 11.84, top: 60.3 },
  'apps:core': { left: 42.68, top: 40.58 },
});

function cloneLayout(layout) {
  return Object.fromEntries(
    Object.entries(layout).map(([circleId, position]) => [circleId, { ...position }]),
  );
}

function isValidCoordinate(value) {
  return Number.isFinite(value) && value >= MIN_POSITION_PERCENT && value <= MAX_POSITION_PERCENT;
}

function normalizePosition(position, fallback) {
  if (!position || typeof position !== 'object' || Array.isArray(position)) {
    return { ...fallback };
  }

  if (!isValidCoordinate(position.left) || !isValidCoordinate(position.top)) {
    return { ...fallback };
  }

  return {
    left: Number(position.left.toFixed(2)),
    top: Number(position.top.toFixed(2)),
  };
}

function normalizeLayout(layout) {
  if (!layout || typeof layout !== 'object' || Array.isArray(layout)) {
    return cloneLayout(DEFAULT_CIRCLE_LAYOUT);
  }

  return Object.fromEntries(
    Object.entries(DEFAULT_CIRCLE_LAYOUT).map(([circleId, fallback]) => [
      circleId,
      normalizePosition(layout[circleId], fallback),
    ]),
  );
}

function validatePosition(circleId, position) {
  if (!Object.hasOwn(DEFAULT_CIRCLE_LAYOUT, circleId)) {
    throw new TypeError(`Unknown circle identifier: ${circleId}`);
  }

  if (!position || typeof position !== 'object' || Array.isArray(position)) {
    throw new TypeError('Circle position must be an object.');
  }

  if (!Number.isFinite(position.left) || !Number.isFinite(position.top)) {
    throw new TypeError('Circle coordinates must be finite numbers.');
  }

  if (!isValidCoordinate(position.left) || !isValidCoordinate(position.top)) {
    throw new RangeError(
      `Circle coordinates must be between ${MIN_POSITION_PERCENT}% and ${MAX_POSITION_PERCENT}%.`,
    );
  }

  return {
    left: Number(position.left.toFixed(2)),
    top: Number(position.top.toFixed(2)),
  };
}

export function getCircleLayout() {
  const storedValue = readStorage(CIRCLE_LAYOUT_KEY);

  if (!storedValue) {
    return cloneLayout(DEFAULT_CIRCLE_LAYOUT);
  }

  try {
    return normalizeLayout(JSON.parse(storedValue));
  } catch {
    return cloneLayout(DEFAULT_CIRCLE_LAYOUT);
  }
}

export function saveCirclePosition(circleId, position) {
  const layout = getCircleLayout();
  layout[circleId] = validatePosition(circleId, position);
  writeStorage(CIRCLE_LAYOUT_KEY, JSON.stringify(layout));
  return layout[circleId];
}

export function resetCircleLayout() {
  const layout = cloneLayout(DEFAULT_CIRCLE_LAYOUT);
  writeStorage(CIRCLE_LAYOUT_KEY, JSON.stringify(layout));
  globalThis.dispatchEvent?.(
    new globalThis.CustomEvent('markellos:circle-layout-reset', {
      detail: layout,
    }),
  );
  return layout;
}
