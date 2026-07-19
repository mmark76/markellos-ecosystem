import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { URL } from 'node:url';
import { ecosystemGroups } from '../src/data/projects.js';

const EXPECTED_GROUP_IDS = [
  'blogs',
  'chess',
  'memory-learning',
  'productivity-tools',
  'entertainment',
  'well-being',
];

const EXPECTED_PROJECT_URLS = Object.freeze({
  'personal-thoughts-and-writings': 'https://personal-thoughts-and-writings.blogspot.com/',
  'chess-reflections': 'https://chess-reflections.blogspot.com/',
  'mnemonic-techniques': 'https://mnemonic-techniques.blogspot.com/',
  'chess-flashcards': 'https://chessflashcards.net/',
  'chess-pgn-audio-player': 'https://chessmnemonics.net/chess_games_tts_app/index.html',
  chessmnemonics: 'https://chessmnemonics.net/index.html',
  'chessmnemonics-app': 'https://chessmnemonics.net/app.html',
  'chessmnemonics-flashcards': 'https://chessmnemonics.net/flashcards/index.html',
  'chessmnemonics-forum': 'https://forum.chessmnemonics.net/',
  'memory-palaces': 'https://memory-palaces.net/',
  'study-app': 'https://studyapp.markellosecosystem.com/',
  'organize-your-pc': 'https://organizeyourpc.com/',
  'animals-within': 'https://animalswithin.markellosecosystem.com/',
  'relaxing-sounds': 'https://relaxing-sounds.net/',
});

test('ecosystem data contains the six requested categories in display order', () => {
  assert.deepEqual(
    ecosystemGroups.map(({ id }) => id),
    EXPECTED_GROUP_IDS,
  );
});

test('ecosystem data contains unique categories and all 14 unique projects', () => {
  const groupIds = ecosystemGroups.map(({ id }) => id);
  const projectIds = ecosystemGroups.flatMap(({ projects }) => projects.map(({ id }) => id));

  assert.equal(new Set(groupIds).size, groupIds.length);
  assert.equal(new Set(projectIds).size, projectIds.length);
  assert.equal(projectIds.length, 14);
});

test('every existing project URL remains unchanged', () => {
  const actualUrls = Object.fromEntries(
    ecosystemGroups.flatMap(({ projects }) => projects.map(({ id, url }) => [id, url])),
  );

  assert.deepEqual(actualUrls, EXPECTED_PROJECT_URLS);
});

test('Animals Within remains the Entertainment project', () => {
  const entertainment = ecosystemGroups.find(({ id }) => id === 'entertainment');

  assert.deepEqual(entertainment.projects, [
    {
      id: 'animals-within',
      title: 'Animals Within',
      url: 'https://animalswithin.markellosecosystem.com/',
    },
  ]);
});

test('every category and project has complete display data', () => {
  for (const group of ecosystemGroups) {
    assert.ok(group.title.trim().length > 0);
    assert.ok(group.description.trim().length > 0);
    assert.ok(group.icon.trim().length > 0);
    assert.ok(group.theme.trim().length > 0);
    assert.ok(group.projects.length > 0);

    for (const project of group.projects) {
      const url = new URL(project.url);
      assert.equal(url.protocol, 'https:');
      assert.ok(project.title.trim().length > 0);
    }
  }
});

test('the no-JavaScript fallback includes every category and project link', async () => {
  const homePage = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const noScriptContent = homePage.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1];

  assert.ok(noScriptContent);
  assert.ok(homePage.includes('href="/src/styles/noscript.css"'));

  for (const group of ecosystemGroups) {
    assert.ok(noScriptContent.includes(group.title.replace('&', '&amp;')));

    for (const project of group.projects) {
      assert.ok(noScriptContent.includes(`href="${project.url}"`));
      assert.ok(noScriptContent.includes(project.title));
    }
  }
});
