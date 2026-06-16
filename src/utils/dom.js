export function createElement(tagName, options = {}) {
  const element = document.createElement(tagName);
  const { classNames = [], text, attributes = {} } = options;

  if (classNames.length > 0) {
    element.classList.add(...classNames);
  }

  if (text !== undefined) {
    element.textContent = text;
  }

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });

  return element;
}

export function openModalDialog(dialog) {
  if (typeof dialog.showModal === 'function') {
    dialog.showModal();
  } else {
    dialog.setAttribute('open', '');
  }
}

export function closeModalDialog(dialog, returnFocusTo) {
  if (typeof dialog.close === 'function') {
    dialog.close();
  } else {
    dialog.removeAttribute('open');
    returnFocusTo?.focus();
  }
}

export function restoreFocusWhenDialogCloses(dialog, returnFocusTo) {
  const restoreFocus = () => returnFocusTo?.focus();
  dialog.addEventListener('close', restoreFocus);
  return restoreFocus;
}

export function focusFirstInteractive(container) {
  const firstInteractive = container.querySelector(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
  );
  firstInteractive?.focus();
  return firstInteractive ?? null;
}
