import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { URL } from 'node:url';
import { ecosystemGroups } from '../src/data/projects.js';

test('ecosystem data contains unique group and project identifiers', () => {
  const groupIds = ecosystemGroups.map(({ id }) => id);
  const projectIds = ecosystemGroups.flatMap(({ projects }) => projects.map(({ id }) => id));

  assert.equal(new Set(groupIds).size, groupIds.length);
  assert.equal(new Set(projectIds).size, projectIds.length);
});

test('every project uses a valid HTTPS URL', () => {
  for (const group of ecosystemGroups) {
    assert.ok(group.projects.length > 0);

    for (const project of group.projects) {
      const url = new URL(project.url);
      assert.equal(url.protocol, 'https:');
      assert.ok(project.title.trim().length > 0);
      assert.ok(project.position.trim().length > 0);
    }
  }
});

test('the no-JavaScript fallback includes every project link', async () => {
  const homePage = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const noScriptContent = homePage.match(/<noscript>([\s\S]*?)<\/noscript>/)?.[1];

  assert.ok(noScriptContent);

  for (const group of ecosystemGroups) {
    for (const project of group.projects) {
      assert.ok(noScriptContent.includes(`href="${project.url}"`));
      assert.ok(noScriptContent.includes(project.title));
    }
  }
});
