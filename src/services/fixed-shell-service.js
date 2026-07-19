const HEADER_HEIGHT_PROPERTY = '--fixed-header-height';
const FOOTER_HEIGHT_PROPERTY = '--fixed-footer-height';

function readHeight(element) {
  return Math.ceil(element.getBoundingClientRect().height);
}

export function updateFixedShellHeights({ header, footer, root = document.documentElement }) {
  root.style.setProperty(HEADER_HEIGHT_PROPERTY, `${readHeight(header)}px`);
  root.style.setProperty(FOOTER_HEIGHT_PROPERTY, `${readHeight(footer)}px`);
}

export function observeFixedShell({ header, footer, root = document.documentElement }) {
  let animationFrameId = null;

  const update = () => {
    animationFrameId = null;
    updateFixedShellHeights({ header, footer, root });
  };

  const scheduleUpdate = () => {
    if (animationFrameId !== null) {
      return;
    }

    if (typeof globalThis.requestAnimationFrame === 'function') {
      animationFrameId = globalThis.requestAnimationFrame(update);
    } else {
      update();
    }
  };

  const ResizeObserverConstructor = globalThis.ResizeObserver;
  const observer = ResizeObserverConstructor ? new ResizeObserverConstructor(scheduleUpdate) : null;

  observer?.observe(header);
  observer?.observe(footer);
  globalThis.addEventListener?.('resize', scheduleUpdate);
  globalThis.addEventListener?.('markellos:ui-settings-changed', scheduleUpdate);
  globalThis.document?.fonts?.ready?.then(scheduleUpdate);
  scheduleUpdate();

  return () => {
    observer?.disconnect();
    globalThis.removeEventListener?.('resize', scheduleUpdate);
    globalThis.removeEventListener?.('markellos:ui-settings-changed', scheduleUpdate);

    if (animationFrameId !== null) {
      globalThis.cancelAnimationFrame?.(animationFrameId);
    }
  };
}
