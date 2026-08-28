import assert from 'node:assert/strict';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const sourcePath = resolve('../docs/api/openapi-draft.yaml');
const outputPath = resolve('../docs/api/ventus-api.postman_collection.json');
const yaml = readFileSync(sourcePath, 'utf8');
const lines = yaml.split('\n');

const methods = new Set(['get', 'post', 'put', 'patch', 'delete']);
const bodyExamples = new Map([
  [
    'POST /v1/enrich',
    {
      transactions: [
        {
          transaction_id: 'txn_demo_001',
          customer_id: 'cust_demo_001',
          merchant_name: 'United Airlines',
          amount: 438.72,
          date: '2026-05-21',
          mcc_code: '3000',
          zip_code: '94105',
          home_zip: '10001',
        },
      ],
    },
  ],
  [
    'POST /v1/webhooks',
    {
      url: 'https://partner.example.com/ventus/webhooks',
      events: ['batch_complete', 'risk_detected'],
      secret: 'replace-with-shared-secret',
    },
  ],
]);

function parseOperations() {
  const operations = [];
  let currentPath = null;
  let currentMethod = null;
  let operationLines = [];

  function closeOperation() {
    if (!currentPath || !currentMethod) {
      return;
    }

    operations.push(parseOperation(currentPath, currentMethod, operationLines));
    currentMethod = null;
    operationLines = [];
  }

  for (const line of lines) {
    const pathMatch = line.match(/^  (\/[^:]+):$/);
    if (pathMatch) {
      closeOperation();
      currentPath = pathMatch[1];
      continue;
    }

    const methodMatch = line.match(/^    ([a-z]+):$/);
    if (methodMatch && methods.has(methodMatch[1])) {
      closeOperation();
      currentMethod = methodMatch[1];
      operationLines = [];
      continue;
    }

    if (currentPath && currentMethod) {
      operationLines.push(line);
    }
  }

  closeOperation();
  return operations;
}

function parseOperation(path, method, operationLines) {
  const summary =
    operationLines.find((line) => line.trim().startsWith('summary:'))?.trim().replace(/^summary:\s*/, '') ??
    `${method.toUpperCase()} ${path}`;
  const parameters = parseParameters(operationLines);

  return {
    method: method.toUpperCase(),
    path,
    summary,
    parameters,
    hasRequestBody: operationLines.some((line) => line.trim() === 'requestBody:'),
  };
}

function parseParameters(operationLines) {
  const parameters = [];
  let current = null;

  function closeParameter() {
    if (current?.name && current?.in) {
      parameters.push(current);
    }
    current = null;
  }

  for (const line of operationLines) {
    if (/^        - /.test(line)) {
      closeParameter();
      current = {};
      applyParameterLine(current, line.replace(/^        - /, ''));
      continue;
    }

    if (current && /^          [a-zA-Z_]+:/.test(line)) {
      applyParameterLine(current, line.trim());
    }
  }

  closeParameter();
  return parameters;
}

function applyParameterLine(parameter, text) {
  const [key, ...valueParts] = text.split(':');
  const value = valueParts.join(':').trim();

  if (key === 'name') {
    parameter.name = value;
  }
  if (key === 'in') {
    parameter.in = value;
  }
  if (key === 'required') {
    parameter.required = value === 'true';
  }
}

function folderNameForPath(path) {
  if (path === '/health') return 'Health';
  if (path.includes('/webhook')) return 'Webhooks';
  if (path.includes('/analytics')) return 'Analytics';
  if (path.includes('/customers')) return 'Customers';
  if (path.includes('/jobs')) return 'Jobs';
  if (path.includes('/enrich')) return 'Enrichment';
  return 'Other';
}

function variableName(openApiName) {
  return openApiName.replace(/_([a-z])/g, (_, char) => char.toUpperCase());
}

function postmanPath(path) {
  return path.replace(/\{([^}]+)\}/g, (_, name) => `{{${variableName(name)}}}`);
}

function requestForOperation(operation) {
  const path = postmanPath(operation.path);
  const query = operation.parameters
    .filter((parameter) => parameter.in === 'query')
    .map((parameter) => ({
      key: parameter.name,
      value: `{{${variableName(parameter.name)}}}`,
      disabled: !parameter.required,
    }));

  const headers = [];
  const operationKey = `${operation.method} ${operation.path}`;
  const bodyExample = bodyExamples.get(operationKey);

  if (bodyExample) {
    headers.push({ key: 'Content-Type', value: 'application/json' });
  }

  const request = {
    name: operation.summary,
    request: {
      method: operation.method,
      header: headers,
      url: {
        raw: `{{baseUrl}}${path}${query.length ? `?${query.map((item) => `${item.key}=${item.value}`).join('&')}` : ''}`,
        host: ['{{baseUrl}}'],
        path: path.split('/').filter(Boolean),
        query,
      },
      description: `${operation.method} ${operation.path}`,
    },
  };

  if (bodyExample) {
    request.request.body = {
      mode: 'raw',
      raw: JSON.stringify(bodyExample, null, 2),
      options: {
        raw: {
          language: 'json',
        },
      },
    };
  }

  return request;
}

function buildCollection(operations) {
  const folders = new Map();

  for (const operation of operations) {
    const folderName = folderNameForPath(operation.path);
    const folder = folders.get(folderName) ?? { name: folderName, item: [] };
    folder.item.push(requestForOperation(operation));
    folders.set(folderName, folder);
  }

  return {
    info: {
      name: 'Ventus AI API',
      description:
        'Generated from docs/api/openapi-draft.yaml. Use this for pilot onboarding, API smoke checks, and partner webhook integration testing.',
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
    },
    auth: {
      type: 'apikey',
      apikey: [
        { key: 'key', value: 'x-api-key', type: 'string' },
        { key: 'value', value: '{{apiKey}}', type: 'string' },
        { key: 'in', value: 'header', type: 'string' },
      ],
    },
    event: [
      {
        listen: 'prerequest',
        script: {
          type: 'text/javascript',
          exec: [
            'if (!pm.collectionVariables.get("apiKey")) {',
            '  console.warn("Set the apiKey collection variable before calling authenticated endpoints.");',
            '}',
          ],
        },
      },
    ],
    variable: [
      { key: 'baseUrl', value: 'https://api.ventusai.com', type: 'string' },
      { key: 'apiKey', value: '', type: 'secret' },
      { key: 'jobId', value: 'job_demo_001', type: 'string' },
      { key: 'customerId', value: 'cust_demo_001', type: 'string' },
      { key: 'lifeEventId', value: 'life_event_demo_001', type: 'string' },
      { key: 'behavioralSignalId', value: 'behavioral_signal_demo_001', type: 'string' },
      { key: 'tripId', value: 'trip_demo_001', type: 'string' },
      { key: 'riskFactorId', value: 'risk_factor_demo_001', type: 'string' },
      { key: 'webhookId', value: 'wh_bank_demo_1770000000000', type: 'string' },
      { key: 'deliveryId', value: '00000000-0000-4000-8000-000000000000', type: 'string' },
      { key: 'webhookIdFilter', value: 'wh_bank_demo_1770000000000', type: 'string' },
      { key: 'status', value: 'failed', type: 'string' },
      { key: 'limit', value: '20', type: 'string' },
      { key: 'offset', value: '0', type: 'string' },
    ],
    item: [...folders.values()],
  };
}

const operations = parseOperations();
assert(operations.length > 0, 'No OpenAPI operations found');
assert(
  operations.some((operation) => operation.method === 'POST' && operation.path === '/v1/webhooks'),
  'Postman collection missing webhook registration endpoint'
);
assert(
  operations.some((operation) => operation.method === 'POST' && operation.path === '/v1/webhook-deliveries/{delivery_id}/replay'),
  'Postman collection missing webhook replay endpoint'
);

const collection = buildCollection(operations);

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(collection, null, 2)}\n`);
console.log(`Wrote ${outputPath}`);
