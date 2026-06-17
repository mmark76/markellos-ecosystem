import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const LEGAL_ENTRY = '/src/pages/legal-page.js';

async function readRepositoryFile(relativePath) {
  return readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8');
}

test('privacy and cookies pages use the shared legal page entry', async () => {
  const [privacyPage, cookiesPage] = await Promise.all([
    readRepositoryFile('privacy/index.html'),
    readRepositoryFile('cookies/index.html'),
  ]);

  assert.ok(privacyPage.includes(`src="${LEGAL_ENTRY}"`));
  assert.ok(cookiesPage.includes(`src="${LEGAL_ENTRY}"`));
});

test('legal page entry applies saved UI settings and their CSS rules', async () => {
  const legalEntry = await readRepositoryFile('src/pages/legal-page.js');

  assert.match(legalEntry, /import '\.\.\/components\/ui-settings\/ui-settings\.css';/);
  assert.match(
    legalEntry,
    /import \{ applyUiSettings \} from '\.\.\/services\/ui-settings-service\.js';/,
  );
  assert.match(legalEntry, /applyUiSettings\(\);/);
});

test('readable font setting covers legal page content and headings', async () => {
  const legalStyles = await readRepositoryFile('src/pages/legal-page.css');

  assert.match(legalStyles, /html\[data-ui-font='readable'\] \.legal-page,/);
  assert.match(legalStyles, /html\[data-ui-font='readable'\] \.legal-page__title,/);
  assert.match(legalStyles, /html\[data-ui-font='readable'\] \.legal-page__section h2/);
});
