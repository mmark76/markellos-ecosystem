import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { URL } from 'node:url';
import { ecosystemGroups } from '../src/data/projects.js';

const EXPECTED_GROUP_IDS = [
  'blogs',
  'chess',
  'tools-productivity',
  'entertainment',
  'meditation',
  'learning-memory',
];

test('ecosystem data contains the six expected categories', () => {
  assert.deepEqual(
    ecosystemGroups.map(({ id }) => id),
    EXPECTED_GROUP_IDS,
  );
});

test('ecosystem data contains unique group and project identifiers', () => {
  const groupIds = ecosystemGroups.map(({ id }) => id);
  const projectIds = ecosystemGroups.flatMap(({ projects }) => projects.map(({ id }) => id));

  assert.equal(new Set(groupIds).size, groupIds.length);
  assert.equal(new Set(projectIds).size, projectIds.length);
  assert.equal(projectIds.length, 14);
});

test('every project uses a valid HTTPS URL and complete display data', () => {
  for (const group of ecosystemGroups) {
    assert.ok(group.title.trim().length > 0);
    assert.ok(group.description.trim().length > 0);
    assert.ok(group.icon.trim().length > 0);
    assert.ok(group.projects.length > 0);

    for (const project of group.projects) {
      const url = new URL(project.url);
      assert.equal(url.protocol, 'https:');
      assert.ok(project.title.trim().length > 0);
      assert.ok(project.icon.trim().length > 0);
    }
  }
});

test('the no-JavaScript fallback includes every category and project link', async () => {
  const homePage = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const noScriptContent = homePage.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1];

  assert.ok(noScriptContent);

  for (const group of ecosystemGroups) {
    assert.ok(noScriptContent.includes(group.title.replace('&', '&amp;')));

    for (const project of group.projects) {
      assert.ok(noScriptContent.includes(`href="${project.url}"`));
      assert.ok(noScriptContent.includes(project.title));
    }
  }
});
