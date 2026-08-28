import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const backendRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const repoRoot = resolve(backendRoot, '..');

const apiSource = readFileSync(
  resolve(backendRoot, 'functions/ventus-api/index.mjs'),
  'utf8'
);
const openApiDraft = readFileSync(resolve(repoRoot, 'docs/api/openapi-draft.yaml'), 'utf8');
const postmanCollectionText = readFileSync(
  resolve(repoRoot, 'docs/api/ventus-api.postman_collection.json'),
  'utf8'
);
const postmanCollection = JSON.parse(postmanCollectionText);

test('life-event evidence transaction joins are bank scoped', () => {
  const bankScopedJoinCount = [
    ...apiSource.matchAll(
      /LEFT JOIN transactions_enriched te\s+ON lee\.transaction_id = te\.transaction_id\s+AND te\.bank_id = \$2/g
    ),
  ].length;

  assert.equal(bankScopedJoinCount, 2);
  assert.equal(
    [...apiSource.matchAll(/fetchLifeEventEvidenceRows\(db, row\.id, req\.bankId\)/g)].length,
    2
  );
});

test('new paginated customer endpoints return empty pages without treating them as missing resources', () => {
  assert.match(apiSource, /allEvents\.rows\.length === 0 && offset === 0/);
  assert.match(apiSource, /life_events: \[\]/);
  assert.match(apiSource, /behavioral_signals: \[\]/);

  assert.match(apiSource, /trips\.rows\.length === 0 && offset === 0/);
  assert.match(apiSource, /trips: \[\]/);

  assert.match(apiSource, /result\.rows\.length === 0 && offset === 0/);
  assert.match(apiSource, /risk_factors: \[\]/);
});

test('OpenAPI documents pagination on customer list endpoints', () => {
  for (const path of [
    '/v1/customers/{customer_id}/life-events:',
    '/v1/customers/{customer_id}/trips:',
    '/v1/customers/{customer_id}/risk-factors:',
  ]) {
    const sectionStart = openApiDraft.indexOf(`  ${path}`);
    assert.notEqual(sectionStart, -1, `${path} should be documented`);
    const nextPath = openApiDraft.indexOf('\n  /', sectionStart + 1);
    const section = openApiDraft.slice(sectionStart, nextPath === -1 ? undefined : nextPath);

    assert.match(section, /name: limit/);
    assert.match(section, /name: offset/);
  }
});

test('Postman collection uses variables for all path parameters', () => {
  const renderedUrls = [];

  function collectRenderedUrls(items = []) {
    for (const item of items) {
      if (item.request?.url) {
        renderedUrls.push(item.request.url.raw);
        renderedUrls.push(...(item.request.url.path ?? []));
      }
      collectRenderedUrls(item.item);
    }
  }

  collectRenderedUrls(postmanCollection.item);
  const renderedUrlText = renderedUrls.join('\n');

  for (const rawParameter of [
    '{life_event_id}',
    '{behavioral_signal_id}',
    '{trip_id}',
    '{risk_factor_id}',
  ]) {
    assert.doesNotMatch(renderedUrlText, new RegExp(rawParameter.replace(/[{}]/g, '\\$&')));
  }

  for (const variable of [
    '{{lifeEventId}}',
    '{{behavioralSignalId}}',
    '{{tripId}}',
    '{{riskFactorId}}',
  ]) {
    assert.match(renderedUrlText, new RegExp(variable.replace(/[{}]/g, '\\$&')));
    assert.ok(
      postmanCollection.variable.some((entry) => entry.key === variable.replace(/[{}]/g, '')),
      `${variable} should have a collection variable default`
    );
  }
});
