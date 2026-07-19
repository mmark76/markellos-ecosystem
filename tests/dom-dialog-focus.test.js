import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  closeModalDialog,
  createElement,
  focusFirstInteractive,
  openModalDialog,
  restoreFocusWhenDialogCloses,
} from '../src/utils/dom.js';

class FakeClassList {
  constructor() {
    this.values = new Set();
  }

  add(...classNames) {
    classNames.forEach((className) => this.values.add(className));
  }

  contains(className) {
    return this.values.has(className);
  }
}

class FakeElement {
  constructor(tagName = 'div') {
    this.tagName = tagName.toUpperCase();
    this.classList = new FakeClassList();
    this.attributes = new Map();
    this.listeners = new Map();
    this.textContent = '';
    this.focused = false;
    this.firstInteractive = null;
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  removeAttribute(name) {
    this.attributes.delete(name);
  }

  hasAttribute(name) {
    return this.attributes.has(name);
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatchEvent(event) {
    event.target ??= this;
    for (const listener of this.listeners.get(event.type) ?? []) {
      listener(event);
    }
  }

  focus() {
    this.focused = true;
  }

  querySelector() {
    return this.firstInteractive;
  }
}

test('createElement applies classes, text and accessible attributes', (t) => {
  globalThis.document = {
    createElement(tagName) {
      return new FakeElement(tagName);
    },
  };
  t.after(() => delete globalThis.document);

  const button = createElement('button', {
    classNames: ['control', 'control--primary'],
    text: 'Open settings',
    attributes: {
      type: 'button',
      'aria-haspopup': 'dialog',
      'aria-controls': 'settings-dialog',
    },
  });

  assert.equal(button.tagName, 'BUTTON');
  assert.equal(button.classList.contains('control'), true);
  assert.equal(button.classList.contains('control--primary'), true);
  assert.equal(button.textContent, 'Open settings');
  assert.equal(button.getAttribute('type'), 'button');
  assert.equal(button.getAttribute('aria-haspopup'), 'dialog');
  assert.equal(button.getAttribute('aria-controls'), 'settings-dialog');
});

test('openModalDialog uses the native dialog API when available', () => {
  const dialog = new FakeElement('dialog');
  let opened = false;
  dialog.showModal = () => {
    opened = true;
  };

  openModalDialog(dialog);

  assert.equal(opened, true);
  assert.equal(dialog.hasAttribute('open'), false);
});

test('dialog helpers support fallback opening, closing and focus restoration', () => {
  const dialog = new FakeElement('dialog');
  const launcher = new FakeElement('button');

  openModalDialog(dialog);
  assert.equal(dialog.hasAttribute('open'), true);

  closeModalDialog(dialog, launcher);
  assert.equal(dialog.hasAttribute('open'), false);
  assert.equal(launcher.focused, true);
});

test('native dialog close events restore focus to the launcher', () => {
  const dialog = new FakeElement('dialog');
  const launcher = new FakeElement('button');

  restoreFocusWhenDialogCloses(dialog, launcher);
  dialog.close = () => dialog.dispatchEvent({ type: 'close' });
  closeModalDialog(dialog, launcher);

  assert.equal(launcher.focused, true);
});

test('focusFirstInteractive moves focus to the first available control', () => {
  const container = new FakeElement('aside');
  const button = new FakeElement('button');
  container.firstInteractive = button;

  assert.equal(focusFirstInteractive(container), button);
  assert.equal(button.focused, true);
});

test('settings markup retains dialog relationships and focus restoration', async () => {
  const source = await readFile(
    new URL('../src/components/ui-settings/ui-settings.js', import.meta.url),
    'utf8',
  );

  assert.match(source, /'aria-haspopup': 'dialog'/);
  assert.match(source, /'aria-controls': 'ui-settings-dialog'/);
  assert.match(source, /'aria-labelledby': 'ui-settings-title'/);
  assert.match(source, /dialog\.addEventListener\('close', \(\) => launcher\.focus\(\)\)/);
});

test('settings exposes circle editing, reset, and layout export controls', async () => {
  const source = await readFile(
    new URL('../src/components/ui-settings/ui-settings.js', import.meta.url),
    'utf8',
  );

  assert.match(source, /label: 'Circle positions'/);
  assert.match(source, /\['locked', 'Locked'\]/);
  assert.match(source, /\['editable', 'Move circles'\]/);
  assert.match(source, /text: 'Reset circle positions'/);
  assert.match(source, /resetPositionsButton\.addEventListener\('click'/);
  assert.match(source, /circleLayout: getCircleLayout\(\)/);
  assert.match(source, /text: 'Reset all settings and positions'/);
});

test('circle layout uses pointer dragging and a non-draggable small-screen fallback', async () => {
  const [source, styles] = await Promise.all([
    readFile(new URL('../src/components/ecosystem/ecosystem.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/ecosystem/ecosystem.css', import.meta.url), 'utf8'),
  ]);

  assert.match(source, /addEventListener\('pointerdown'/);
  assert.match(source, /addEventListener\('pointermove'/);
  assert.match(source, /addEventListener\('pointerup'/);
  assert.match(source, /saveCirclePosition\(circle\.dataset\.circleId/);
  assert.match(source, /matchMedia\?\.\('\(max-width: 45rem\)'\)/);
  assert.match(styles, /@media \(max-width: 45rem\)[\s\S]*position: static/);
});
