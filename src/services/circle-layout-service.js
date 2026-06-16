import { readStorage, writeStorage } from '../utils/storage.js';

const CIRCLE_LAYOUT_KEY = 'markellos-ecosystem:circle-layout';

export const DEFAULT_CIRCLE_LAYOUT = Object.freeze({
  'apps:chessmnemonics-forum': { left: 98.9, top: 82.08 },
  'apps:chessmnemonics': { left: 77.32, top: 57.24 },
  'apps:chessmnemonics-app': { left: 106.21, top: 51.91 },
  'apps:chess-pgn-audio-player': { left: 36.56, top: 82.41 },
  'blogs:mnemonic-techniques': { left: 82.29, top: 43.08 },
  'blogs:chess-reflections': { left: 3.31, top: 38.74 },
  'blogs:markellos-chess-mnemonic-system': { left: 51.21, top: 83.58 },
  'blogs:personal-thoughts-and-writings': { left: 44.42, top: 6.41 },
  'blogs:core': { left: 43.23, top: 45.91 },
  'apps:memory-palaces': { left: 49.3, top: 4.08 },
  'apps:organize-your-pc': { left: 6.84, top: 18.58 },
  'apps:relaxing-sounds': { left: 82.59, top: 18.41 },
  'apps:chessmnemonics-flashcards': { left: 66.45, top: 88.08 },
  'apps:chess-flashcards': { left: 6.33, top: 58.24 },
  'apps:core': { left: 42.68, top: 40.58 },
});

function cloneLayout(layout) {
  return Object.fromEntries(
    Object.entries(layout).map(([circleId, position]) => [circleId, { ...position }]),
  );
}

export function getCircleLayout() {
  const storedValue = readStorage(CIRCLE_LAYOUT_KEY);

  if (!storedValue) {
    return cloneLayout(DEFAULT_CIRCLE_LAYOUT);
  }

  try {
    const parsedValue = JSON.parse(storedValue);
    return parsedValue && typeof parsedValue === 'object'
      ? parsedValue
      : cloneLayout(DEFAULT_CIRCLE_LAYOUT);
  } catch {
    return cloneLayout(DEFAULT_CIRCLE_LAYOUT);
  }
}

export function saveCirclePosition(circleId, position) {
  const layout = getCircleLayout();
  layout[circleId] = {
    left: Number(position.left.toFixed(2)),
    top: Number(position.top.toFixed(2)),
  };
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
