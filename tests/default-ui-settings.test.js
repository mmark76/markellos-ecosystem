import assert from 'node:assert/strict';
import test from 'node:test';
import { DEFAULT_UI_SETTINGS } from '../src/services/ui-settings-service.js';

test('exported UI preferences are the application defaults', () => {
  assert.deepEqual(DEFAULT_UI_SETTINGS, {
    theme: 'natural',
    textSize: 'default',
    titleSize: 'default',
    titleLayout: 'one-line',
    circleScale: 110,
    density: 'compact',
    font: 'book',
    background: 'decorative',
    positionMode: 'editable',
    motion: 'standard',
  });
});
