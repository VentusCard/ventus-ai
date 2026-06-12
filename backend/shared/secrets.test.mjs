import assert from 'node:assert/strict';
import { afterEach, test } from 'node:test';
import { createSecretsProvider } from './secrets.mjs';

afterEach(() => {
  delete process.env.SECRETS_CACHE_TTL_MS;
});

function createFakeClient(values) {
  const calls = [];

  return {
    calls,
    async send(command) {
      calls.push(command);
      assert.equal(typeof command.resolveMiddleware, 'function');
      assert.equal(command.input.SecretId, 'test-secret');
      const value = values[Math.min(calls.length - 1, values.length - 1)];
      return { SecretString: JSON.stringify(value) };
    },
  };
}

function createFakeCommand(input) {
  return {
    input,
    resolveMiddleware() {},
  };
}

test('createSecretsProvider caches secret values within the TTL', async () => {
  process.env.SECRETS_CACHE_TTL_MS = '60000';
  const client = createFakeClient([
    { username: 'ventusadmin', password: 'first-password' },
    { username: 'ventusadmin', password: 'second-password' },
  ]);
  const getSecrets = createSecretsProvider({
    secretId: 'test-secret',
    client,
    commandFactory: createFakeCommand,
  });

  const first = await getSecrets();
  const second = await getSecrets();

  assert.deepEqual(first, { username: 'ventusadmin', password: 'first-password' });
  assert.equal(second, first);
  assert.equal(client.calls.length, 1);
});

test('createSecretsProvider refreshes secret values after the TTL expires', async () => {
  process.env.SECRETS_CACHE_TTL_MS = '0';
  const client = createFakeClient([
    { username: 'ventusadmin', password: 'first-password' },
    { username: 'ventusadmin', password: 'second-password' },
  ]);
  const getSecrets = createSecretsProvider({
    secretId: 'test-secret',
    client,
    commandFactory: createFakeCommand,
  });

  const first = await getSecrets();
  const second = await getSecrets();

  assert.deepEqual(first, { username: 'ventusadmin', password: 'first-password' });
  assert.deepEqual(second, { username: 'ventusadmin', password: 'second-password' });
  assert.equal(client.calls.length, 2);
});

test('createSecretsProvider refreshes with SDK command objects when reusing the client', async () => {
  process.env.SECRETS_CACHE_TTL_MS = '0';
  const client = createFakeClient([
    { username: 'ventusadmin', password: 'first-password' },
    { username: 'ventusadmin', password: 'second-password' },
  ]);
  const getSecrets = createSecretsProvider({
    secretId: 'test-secret',
    client,
    commandFactory: createFakeCommand,
  });

  await getSecrets();
  await getSecrets();

  assert.equal(client.calls.length, 2);
  assert.equal(typeof client.calls[0].resolveMiddleware, 'function');
  assert.equal(typeof client.calls[1].resolveMiddleware, 'function');
});
