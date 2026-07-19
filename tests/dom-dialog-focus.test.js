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

test('settings keeps appearance controls and backward-compatible layout exports', async () => {
  const source = await readFile(
    new URL('../src/components/ui-settings/ui-settings.js', import.meta.url),
    'utf8',
  );

  assert.match(source, /label: 'Colour theme'/);
  assert.match(source, /label: 'Text size'/);
  assert.match(source, /label: 'Font style'/);
  assert.match(source, /circleLayout: getCircleLayout\(\)/);
  assert.match(source, /text: 'Reset all settings'/);
  assert.doesNotMatch(source, /label: 'Circle positions'/);
});

test('category layout renders data-driven cards and responsive grid breakpoints', async () => {
  const [source, styles, projectSource] = await Promise.all([
    readFile(new URL('../src/components/ecosystem/ecosystem.js', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/ecosystem/ecosystem.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/project-node/project-node.js', import.meta.url), 'utf8'),
  ]);

  assert.match(source, /groups\.map\(createCategoryCard\)/);
  assert.match(source, /createElement\('article'/);
  assert.match(source, /createElement\('h2'/);
  assert.match(source, /createElement\('ul'/);
  assert.doesNotMatch(source, /category-card__description/);
  assert.match(source, /createElementNS\(SVG_NAMESPACE, 'svg'\)/);
  assert.match(source, /svg\.setAttribute\('aria-hidden', 'true'\)/);
  assert.match(projectSource, /createElement\('a'/);
  assert.match(projectSource, /text: '›'/);
  assert.match(styles, /grid-template-columns: repeat\(3, minmax\(0, 1fr\)\)/);
  assert.match(styles, /@media \(max-width: 67\.5rem\)[\s\S]*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(styles, /@media \(max-width: 45rem\)[\s\S]*grid-template-columns: 1fr/);
});

test('card links retain focus, touch-target, reduced-motion, and overflow safeguards', async () => {
  const [projectStyles, ecosystemStyles, globalStyles] = await Promise.all([
    readFile(new URL('../src/components/project-node/project-node.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/components/ecosystem/ecosystem.css', import.meta.url), 'utf8'),
    readFile(new URL('../src/styles/global.css', import.meta.url), 'utf8'),
  ]);

  assert.match(projectStyles, /min-height: 2\.75rem/);
  assert.match(projectStyles, /\.project-node:focus-visible/);
  assert.match(projectStyles, /outline: 2px solid/);
  assert.match(projectStyles, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(ecosystemStyles, /min-width: 0/);
  assert.doesNotMatch(ecosystemStyles, /grid-auto-rows: 1fr/);
  assert.doesNotMatch(ecosystemStyles, /min-height: 26rem/);
  assert.match(ecosystemStyles, /@media \(max-width: 24rem\)[\s\S]*overflow-wrap: anywhere/);
  assert.match(globalStyles, /overflow-x: hidden/);
  assert.match(globalStyles, /body::before,[\s\S]*pointer-events: none/);
});

test('home footer retains all navigation, consent, copyright, and version content', async () => {
  const source = await readFile(
    new URL('../src/components/footer/footer.js', import.meta.url),
    'utf8',
  );

  for (const text of [
    'Markellos Markides. All rights reserved.',
    'About Markellos',
    'Privacy',
    'Cookies',
    'Feedback',
    'Cookie preferences',
    'SITE_VERSION',
  ]) {
    assert.ok(source.includes(text));
  }
});
