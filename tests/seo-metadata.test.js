import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const pages = [
  ['index.html', 'https://markellosecosystem.com/'],
  ['privacy/index.html', 'https://markellosecosystem.com/privacy/'],
  ['cookies/index.html', 'https://markellosecosystem.com/cookies/'],
];

async function readRepositoryFile(relativePath) {
  return readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8');
}

test('all public pages expose canonical and social metadata', async () => {
  for (const [relativePath, canonicalUrl] of pages) {
    const page = await readRepositoryFile(relativePath);

    assert.ok(page.includes(`<link rel="canonical" href="${canonicalUrl}"`));
    assert.ok(page.includes('<link rel="icon" href="/favicon.svg" type="image/svg+xml"'));
    assert.ok(page.includes('<meta property="og:type" content="website"'));
    assert.ok(page.includes(`<meta property="og:url" content="${canonicalUrl}"`));
    assert.ok(page.includes('content="https://markellosecosystem.com/social-card.svg"'));
    assert.ok(page.includes('<meta name="twitter:card" content="summary_large_image"'));
    assert.ok(page.includes('<meta name="robots" content="index, follow"'));
  }
});

test('home page exposes WebSite structured-data microdata', async () => {
  const page = await readRepositoryFile('index.html');

  assert.ok(page.includes('itemscope itemtype="https://schema.org/WebSite"'));
  assert.ok(page.includes('<meta itemprop="name" content="Markellos Ecosystem"'));
  assert.ok(page.includes('<meta itemprop="url" content="https://markellosecosystem.com/"'));
});

test('favicon and social sharing card are included in the production assets', async () => {
  const [favicon, socialCard] = await Promise.all([
    readRepositoryFile('public/favicon.svg'),
    readRepositoryFile('public/social-card.svg'),
  ]);

  assert.match(favicon, /<svg[\s\S]*viewBox="0 0 64 64"/);
  assert.match(socialCard, /<svg[\s\S]*viewBox="0 0 1200 630"/);
  assert.match(socialCard, /Markellos Ecosystem/);
});
