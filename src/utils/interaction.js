export function shouldPreventCircleLinkClick(positionMode, hasMoved) {
  return positionMode === 'editable' && hasMoved;
}
