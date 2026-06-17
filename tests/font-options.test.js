import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('font settings expose and accept all supported choices', async () => {
  const [component, service] = await Promise.all([
    read('src/components/ui-settings/ui-settings.js'),
    read('src/services/ui-settings-service.js'),
  ]);

  for (const font of ['classic', 'readable', 'humanist', 'book', 'high-legibility']) {
    assert.ok(component.includes(`['${font}'`));
    assert.ok(service.includes(`'${font}'`));
  }
});

test('font option styles are loaded on home and legal pages', async () => {
  const [css, main, legal] = await Promise.all([
    read('src/styles/font-options.css'),
    read('src/main.js'),
    read('src/pages/legal-page.js'),
  ]);

  assert.ok(css.includes("html[data-ui-font='humanist']"));
  assert.ok(css.includes("html[data-ui-font='book']"));
  assert.ok(css.includes("html[data-ui-font='high-legibility']"));
  assert.ok(main.includes('./styles/font-options.css'));
  assert.ok(legal.includes('../styles/font-options.css'));
});
