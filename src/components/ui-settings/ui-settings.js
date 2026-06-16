import './ui-settings.css';
import {
  DEFAULT_UI_SETTINGS,
  getUiSettings,
  resetUiSettings,
  saveUiSettings,
} from '../../services/ui-settings-service.js';
import { createElement } from '../../utils/dom.js';

const CONTROL_DEFINITIONS = [
  {
    key: 'theme',
    label: 'Colour theme',
    options: [
      ['natural', 'Natural'],
      ['light', 'Light'],
      ['sepia', 'Sepia'],
      ['dark', 'Dark'],
      ['contrast', 'High contrast'],
    ],
  },
  {
    key: 'textSize',
    label: 'Text size',
    options: [
      ['small', 'Small'],
      ['default', 'Default'],
      ['large', 'Large'],
      ['extra-large', 'Extra large'],
    ],
  },
  {
    key: 'titleSize',
    label: 'Title size',
    options: [
      ['small', 'Small'],
      ['default', 'Default'],
      ['large', 'Large'],
    ],
  },
  {
    key: 'nodeSize',
    label: 'Circle size',
    options: [
      ['small', 'Small'],
      ['default', 'Default'],
      ['large', 'Large'],
    ],
  },
  {
    key: 'density',
    label: 'Layout spacing',
    options: [
      ['compact', 'Compact'],
      ['comfortable', 'Comfortable'],
      ['spacious', 'Spacious'],
    ],
  },
  {
    key: 'font',
    label: 'Font style',
    options: [
      ['classic', 'Classic'],
      ['readable', 'Readable'],
    ],
  },
  {
    key: 'background',
    label: 'Background detail',
    options: [
      ['decorative', 'Decorative'],
      ['minimal', 'Minimal'],
      ['plain', 'Plain'],
    ],
  },
  {
    key: 'motion',
    label: 'Motion',
    options: [
      ['standard', 'Standard'],
      ['reduced', 'Reduced'],
    ],
  },
];

function createControl(definition, currentValue) {
  const field = createElement('label', {
    classNames: ['ui-settings__field'],
  });

  const label = createElement('span', {
    classNames: ['ui-settings__label'],
    text: definition.label,
  });

  const select = createElement('select', {
    classNames: ['ui-settings__select'],
    attributes: {
      name: definition.key,
      'aria-label': definition.label,
    },
  });

  definition.options.forEach(([value, text]) => {
    const option = createElement('option', {
      text,
      attributes: { value },
    });
    option.selected = value === currentValue;
    select.append(option);
  });

  field.append(label, select);
  return { field, select };
}

export function createUiSettings() {
  const currentSettings = getUiSettings();
  const wrapper = createElement('div', {
    classNames: ['ui-settings'],
  });

  const launcher = createElement('button', {
    classNames: ['ui-settings__launcher'],
    text: 'Settings',
    attributes: {
      type: 'button',
      'aria-haspopup': 'dialog',
      'aria-controls': 'ui-settings-dialog',
    },
  });

  const dialog = createElement('dialog', {
    classNames: ['ui-settings__dialog'],
    attributes: {
      id: 'ui-settings-dialog',
      'aria-labelledby': 'ui-settings-title',
    },
  });

  const header = createElement('div', {
    classNames: ['ui-settings__header'],
  });

  const title = createElement('h2', {
    classNames: ['ui-settings__title'],
    text: 'Interface settings',
    attributes: { id: 'ui-settings-title' },
  });

  const closeButton = createElement('button', {
    classNames: ['ui-settings__close'],
    text: '×',
    attributes: {
      type: 'button',
      'aria-label': 'Close settings',
    },
  });

  header.append(title, closeButton);

  const description = createElement('p', {
    classNames: ['ui-settings__description'],
    text: 'Adjust the appearance and behaviour of the page. Preferences are saved on this device.',
  });

  const controls = new Map();
  const controlsContainer = createElement('div', {
    classNames: ['ui-settings__controls'],
  });

  CONTROL_DEFINITIONS.forEach((definition) => {
    const control = createControl(definition, currentSettings[definition.key]);
    controls.set(definition.key, control.select);
    controlsContainer.append(control.field);
  });

  const actions = createElement('div', {
    classNames: ['ui-settings__actions'],
  });

  const resetButton = createElement('button', {
    classNames: ['ui-settings__reset'],
    text: 'Reset defaults',
    attributes: { type: 'button' },
  });

  actions.append(resetButton);
  dialog.append(header, description, controlsContainer, actions);
  wrapper.append(launcher, dialog);

  function readControls() {
    return Object.fromEntries(
      [...controls.entries()].map(([key, select]) => [key, select.value]),
    );
  }

  function updateControls(settings) {
    controls.forEach((select, key) => {
      select.value = settings[key];
    });
  }

  function openDialog() {
    if (typeof dialog.showModal === 'function') {
      dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
  }

  function closeDialog() {
    if (typeof dialog.close === 'function') {
      dialog.close();
    } else {
      dialog.removeAttribute('open');
      launcher.focus();
    }
  }

  launcher.addEventListener('click', openDialog);
  closeButton.addEventListener('click', closeDialog);

  controls.forEach((select) => {
    select.addEventListener('change', () => {
      saveUiSettings(readControls());
    });
  });

  resetButton.addEventListener('click', () => {
    const defaults = resetUiSettings();
    updateControls(defaults);
  });

  dialog.addEventListener('close', () => launcher.focus());
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) {
      closeDialog();
    }
  });

  globalThis.addEventListener?.('markellos:ui-settings-changed', (event) => {
    updateControls(event.detail ?? DEFAULT_UI_SETTINGS);
  });

  return wrapper;
}
