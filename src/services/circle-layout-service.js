import { writeStorage } from '../utils/storage.js';

const CIRCLE_LAYOUT_KEY = 'markellos-ecosystem:circle-layout';

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

export function getCircleLayout() {
  return cloneLayout(DEFAULT_CIRCLE_LAYOUT);
}

export function saveCirclePosition(circleId) {
  if (!Object.hasOwn(DEFAULT_CIRCLE_LAYOUT, circleId)) {
    throw new TypeError(`Unknown circle identifier: ${circleId}`);
  }

  return { ...DEFAULT_CIRCLE_LAYOUT[circleId] };
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
