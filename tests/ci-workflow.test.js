import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const CHECKOUT_SHA = '11bd71901bbe5b1630ceea73d27597364c9af683';
const SETUP_NODE_SHA = '49933ea5288caeca8642d1e84afbd3f7d6820020';

async function readWorkflow() {
  return readFile(new URL('../.github/workflows/quality.yml', import.meta.url), 'utf8');
}

test('quality workflow cancels superseded runs and has a timeout', async () => {
  const workflow = await readWorkflow();

  assert.match(workflow, /concurrency:\s+[\s\S]*cancel-in-progress: true/);
  assert.match(workflow, /timeout-minutes: 10/);
});

test('quality workflow pins official actions to immutable commit SHAs', async () => {
  const workflow = await readWorkflow();

  assert.ok(workflow.includes(`actions/checkout@${CHECKOUT_SHA}`));
  assert.ok(workflow.includes(`actions/setup-node@${SETUP_NODE_SHA}`));
});

test('quality workflow caches npm dependencies from the lockfile', async () => {
  const workflow = await readWorkflow();

  assert.match(workflow, /cache: npm/);
  assert.match(workflow, /cache-dependency-path: package-lock\.json/);
});

test('quality workflow fails on high or critical dependency vulnerabilities', async () => {
  const workflow = await readWorkflow();

  assert.match(workflow, /npm audit --audit-level=high/);
});
