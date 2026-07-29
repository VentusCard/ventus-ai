import assert from 'node:assert/strict';
import test from 'node:test';
import { createConsoleApiHandler } from './console-api.mjs';

const identity = {
  subject: 'cognito_subject_123',
  tenantHint: 'ventus',
  issuer: 'https://issuer.example.com/pool',
};
const membership = {
  email: 'operator@ventusai.com',
  role: 'institution_admin',
  entitlements: ['growth_console', 'wealth_demo'],
  businessLines: ['wealth'],
};

test('Console API returns the institution-scoped principal', async () => {
  const handler = createConsoleApiHandler({
    verifyIdentity: async (token) => token === 'valid-token' ? identity : null,
    resolveMembership: async () => membership,
  });
  const result = await handler(request());
  const body = JSON.parse(result.body);

  assert.equal(result.statusCode, 200);
  assert.equal(body.tenantId, 'ventus');
  assert.equal(body.role, 'admin');
  assert.deepEqual(body.entitlements, ['growth_console', 'wealth_demo']);
  assert.deepEqual(body.businessLines, ['wealth']);
  assert.equal(body.authProvider, 'cognito');
  assert.equal(result.headers['Cache-Control'], 'no-store');
});

test('Console API fails closed for invalid tokens and inactive memberships', async () => {
  const invalidToken = createConsoleApiHandler({
    verifyIdentity: async () => null,
    resolveMembership: async () => membership,
  });
  assert.equal((await invalidToken(request())).statusCode, 401);

  const inactiveMembership = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => null,
  });
  assert.equal((await inactiveMembership(request())).statusCode, 403);
});

test('Console API rejects unapproved browser origins', async () => {
  process.env.VENTUS_ALLOWED_ORIGINS = 'https://dev.example.com';
  const handler = createConsoleApiHandler({
    verifyIdentity: async () => identity,
    resolveMembership: async () => membership,
  });
  const result = await handler(request('https://unapproved.example.com'));
  assert.equal(result.statusCode, 403);
});

function request(origin = 'https://dev.example.com') {
  process.env.VENTUS_ALLOWED_ORIGINS = 'https://dev.example.com';
  return {
    httpMethod: 'POST',
    headers: {
      authorization: 'Bearer valid-token',
      origin,
    },
    requestContext: { requestId: 'test-request' },
  };
}
