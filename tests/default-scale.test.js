import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('default scale and exemptions are present', async () => {
  const css = await read('src/styles/default-scale.css');

  assert.ok(css.includes("html[data-ui-text-size='default']"));
  assert.ok(css.includes('font-size: 120%'));
  assert.ok(css.includes('.hero__title'));
  assert.ok(css.includes('.legal-page__title'));
  assert.ok(css.includes('.site-footer'));
});

test('home and legal pages load the scale stylesheet', async () => {
  const [main, legal] = await Promise.all([read('src/main.js'), read('src/pages/legal-page.js')]);

  assert.ok(main.includes('./styles/default-scale.css'));
  assert.ok(legal.includes('../styles/default-scale.css'));
});
