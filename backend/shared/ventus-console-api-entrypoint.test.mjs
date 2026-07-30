import assert from 'node:assert/strict';
import test from 'node:test';

test('console Lambda entrypoint initializes without a temporal dead zone error', async () => {
  const { handler } = await import('../functions/ventus-console-api/index.mjs');

  assert.equal(typeof handler, 'function');
});
