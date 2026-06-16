import { readStorage, writeStorage } from '../utils/storage.js';

const CIRCLE_LAYOUT_KEY = 'markellos-ecosystem:circle-layout';

export function getCircleLayout() {
  const storedValue = readStorage(CIRCLE_LAYOUT_KEY);

  if (!storedValue) {
    return {};
  }

  try {
    const parsedValue = JSON.parse(storedValue);
    return parsedValue && typeof parsedValue === 'object' ? parsedValue : {};
  } catch {
    return {};
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
  writeStorage(CIRCLE_LAYOUT_KEY, JSON.stringify({}));
  globalThis.dispatchEvent?.(new globalThis.CustomEvent('markellos:circle-layout-reset'));
}
