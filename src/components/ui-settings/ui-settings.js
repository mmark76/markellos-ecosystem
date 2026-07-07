import './ui-settings.css';
import { getCircleLayout, resetCircleLayout } from '../../services/circle-layout-service.js';
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
    type: 'select',
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
    type: 'select',
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
    type: 'select',
    options: [
      ['extra-small', 'Extra small'],
      ['small', 'Small'],
      ['default', 'Default'],
      ['large', 'Large'],
    ],
  },
  {
    key: 'titleLayout',
    label: 'Title layout',
    type: 'select',
    options: [
      ['one-line', 'One line'],
      ['two-lines', 'Two lines'],
    ],
  },
  {
    key: 'circleScale',
    label: 'Circle size',
    type: 'range',
    min: 70,
    max: 135,
    step: 5,
    suffix: '%',
  },
  {
    key: 'positionMode',
    label: 'Circle positions',
    type: 'select',
    options: [
      ['locked', 'Locked'],
      ['editable', 'Move circles'],
    ],
  },
  {
    key: 'density',
    label: 'Layout spacing',
    type: 'select',
    options: [
      ['compact', 'Compact'],
      ['comfortable', 'Comfortable'],
      ['spacious', 'Spacious'],
    ],
  },
  {
    key: 'font',
    label: 'Font style',
    type: 'select',
    options: [
      ['classic', 'Classic serif'],
      ['readable', 'Modern sans'],
      ['humanist', 'Humanist sans'],
      ['book', 'Book serif'],
      ['high-legibility', 'High legibility'],
    ],
  },
  {
    key: 'background',
    label: 'Background detail',
    type: 'select',
    options: [
      ['decorative', 'Decorative'],
      ['minimal', 'Minimal'],
      ['plain', 'Plain'],
    ],
  },
  {
    key: 'motion',
    label: 'Motion',
    type: 'select',
    options: [
      ['standard', 'Standard'],
      ['reduced', 'Reduced'],
    ],
  },
];

function createSelectControl(definition, currentValue) {
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

  return { input: select };
}

function createRangeControl(definition, currentValue) {
  const group = createElement('div', {
    classNames: ['ui-settings__range-group'],
  });

  const output = createElement('output', {
    classNames: ['ui-settings__range-value'],
    text: `${currentValue}${definition.suffix}`,
  });

  const range = createElement('input', {
    classNames: ['ui-settings__range'],
    attributes: {
      type: 'range',
      name: definition.key,
      min: definition.min,
      max: definition.max,
      step: definition.step,
      value: currentValue,
      'aria-label': definition.label,
    },
  });

  range.addEventListener('input', () => {
    output.textContent = `${range.value}${definition.suffix}`;
  });

  group.append(range, output);
  return { input: range, element: group, output };
}

function createControl(definition, currentValue) {
  const field = createElement('label', {
    classNames: ['ui-settings__field'],
  });

  const label = createElement('span', {
    classNames: ['ui-settings__label'],
    text: definition.label,
  });

  const control =
    definition.type === 'range'
      ? createRangeControl(definition, currentValue)
      : createSelectControl(definition, currentValue);

  field.append(label, control.element ?? control.input);
  return { field, ...control };
}

function downloadSettings() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    uiSettings: getUiSettings(),
    circleLayout: getCircleLayout(),
  };
  const blob = new globalThis.Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json',
  });
  const url = globalThis.URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'markellos-ecosystem-settings.json';
  document.body.append(link);
  link.click();
  link.remove();
  globalThis.URL.revokeObjectURL(url);
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
    text: 'Adjust the page appearance and circle positions.',
  });

  const controls = new Map();
  const controlsContainer = createElement('div', {
    classNames: ['ui-settings__controls'],
  });

  CONTROL_DEFINITIONS.forEach((definition) => {
    const control = createControl(definition, currentSettings[definition.key]);
    controls.set(definition.key, control);
    controlsContainer.append(control.field);
  });

  const actions = createElement('div', {
    classNames: ['ui-settings__actions'],
  });

  const downloadButton = createElement('button', {
    classNames: ['ui-settings__reset'],
    text: 'Download Settings',
    attributes: { type: 'button' },
  });

  const resetPositionsButton = createElement('button', {
    classNames: ['ui-settings__reset'],
    text: 'Reset circle positions',
    attributes: { type: 'button' },
  });

  const resetButton = createElement('button', {
    classNames: ['ui-settings__reset'],
    text: 'Reset all settings',
    attributes: { type: 'button' },
  });

  actions.append(downloadButton, resetPositionsButton, resetButton);
  dialog.append(header, description, controlsContainer, actions);
  wrapper.append(launcher, dialog);

  function readControls() {
    return Object.fromEntries(
      [...controls.entries()].map(([key, control]) => [key, control.input.value]),
    );
  }

  function updateControls(settings) {
    controls.forEach((control, key) => {
      control.input.value = settings[key];

      if (control.output) {
        control.output.textContent = `${settings[key]}%`;
      }
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

  controls.forEach((control) => {
    const eventName = control.input.type === 'range' ? 'input' : 'change';
    control.input.addEventListener(eventName, () => {
      saveUiSettings(readControls());
    });
  });

  downloadButton.addEventListener('click', downloadSettings);

  resetPositionsButton.addEventListener('click', () => {
    resetCircleLayout();
  });

  resetButton.addEventListener('click', () => {
    const defaults = resetUiSettings();
    resetCircleLayout();
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
