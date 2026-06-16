export const DRAG_THRESHOLD_PX = 6;

export function hasExceededDragThreshold(
  startX,
  startY,
  currentX,
  currentY,
  threshold = DRAG_THRESHOLD_PX,
) {
  if (
    !Number.isFinite(startX) ||
    !Number.isFinite(startY) ||
    !Number.isFinite(currentX) ||
    !Number.isFinite(currentY) ||
    !Number.isFinite(threshold) ||
    threshold < 0
  ) {
    return false;
  }

  return Math.hypot(currentX - startX, currentY - startY) >= threshold;
}

export function shouldPreventCircleLinkClick(positionMode, hasMoved) {
  return positionMode === 'editable' && hasMoved;
}
