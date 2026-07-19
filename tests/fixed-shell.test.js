import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { updateFixedShellHeights } from '../src/services/fixed-shell-service.js';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('fixed shell measurements publish rounded header and footer heights', () => {
  const properties = new Map();
  const root = {
    style: {
      setProperty(name, value) {
        properties.set(name, value);
      },
    },
  };
  const header = { getBoundingClientRect: () => ({ height: 123.2 }) };
  const footer = { getBoundingClientRect: () => ({ height: 87.01 }) };

  updateFixedShellHeights({ header, footer, root });

  assert.equal(properties.get('--fixed-header-height'), '124px');
  assert.equal(properties.get('--fixed-footer-height'), '88px');
});

test('homepage uses measured fixed regions with accessible scrolling offsets', async () => {
  const [main, hero, footer, layout, settings, globalStyles] = await Promise.all([
    read('src/main.js'),
    read('src/components/hero/hero.css'),
    read('src/components/footer/footer.css'),
    read('src/styles/layout.css'),
    read('src/components/ui-settings/ui-settings.css'),
    read('src/styles/global.css'),
  ]);

  assert.match(main, /observeFixedShell\(\{ header, footer \}\)/);
  assert.match(main, /header\.append\(createUiSettings\(\)\)/);
  assert.match(hero, /\.hero \{[\s\S]*position: fixed;/);
  assert.match(hero, /\.hero \{[\s\S]*z-index: 30;/);
  assert.match(hero, /\.hero \{[\s\S]*top: 0;/);
  assert.match(footer, /\.site-footer \{[\s\S]*position: fixed;[\s\S]*bottom: 0/);
  assert.match(layout, /padding: calc\(var\(--fixed-header-height\)/);
  assert.match(layout, /var\(--fixed-footer-height\)/);
  assert.match(layout, /scroll-padding-top/);
  assert.match(layout, /scroll-padding-bottom/);
  assert.match(settings, /\.ui-settings__dialog \{[\s\S]*z-index: 100/);
  assert.doesNotMatch(globalStyles, /\.site-footer \{\s*position: static/);
});

test('fixed footer links keep touch targets and mobile wrapping safeguards', async () => {
  const [footer, defaultScale] = await Promise.all([
    read('src/components/footer/footer.css'),
    read('src/styles/default-scale.css'),
  ]);

  assert.match(footer, /\.site-footer__navigation \{[\s\S]*flex-wrap: wrap/);
  assert.match(footer, /\.site-footer__link \{[\s\S]*min-height: 44px/);
  assert.match(
    footer,
    /@media \(max-width: 45rem\)[\s\S]*\.site-footer__link \+ \.site-footer__link \{[\s\S]*margin-left: 0/,
  );
  assert.match(defaultScale, /padding: 7px/);
});

test('no-JavaScript fallback reserves space for its fixed header and footer', async () => {
  const styles = await read('src/styles/noscript.css');

  assert.match(styles, /--fixed-header-height/);
  assert.match(styles, /--fixed-footer-height/);
  assert.match(styles, /\.no-script-page__header \{[\s\S]*position: fixed/);
  assert.match(styles, /\.no-script-page__footer \{[\s\S]*position: fixed/);
  assert.match(styles, /padding: calc\(var\(--fixed-header-height\)/);
  assert.match(styles, /calc\(var\(--fixed-footer-height\)/);
});

test('skip link targets the focusable project category region', async () => {
  const [hero, ecosystem] = await Promise.all([
    read('src/components/hero/hero.js'),
    read('src/components/ecosystem/ecosystem.js'),
  ]);

  assert.match(hero, /href: '#ecosystem-links'/);
  assert.match(ecosystem, /id: 'ecosystem-links'/);
  assert.match(ecosystem, /tabindex: '-1'/);
});
