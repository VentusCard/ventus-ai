import { createSecretsProvider } from '../../shared/platform/secrets.mjs';
import { createDemoConnectorService, DemoConnectorError } from '../../shared/demo/demo-connectors.mjs';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://demo.ventusai.com',
];

const secretId = process.env.VENTUS_DEMO_CONNECTOR_SECRET_ID;
const getSecrets = secretId
  ? createSecretsProvider({ secretId, region: process.env.AWS_REGION || 'us-east-2' })
  : async () => ({
      sessionSigningSecret: process.env.VENTUS_CONNECTOR_SESSION_SECRET,
      plaidClientId: process.env.PLAID_CLIENT_ID,
      plaidSecret: process.env.PLAID_SECRET,
      salesforceLoginUrl: process.env.SF_LOGIN_URL,
      salesforceClientId: process.env.SF_CLIENT_ID,
      salesforceClientSecret: process.env.SF_CLIENT_SECRET,
    });

const service = createDemoConnectorService({ getSecrets });

export function createHandler({ connectorService = service } = {}) {
  return async function handler(event = {}) {
    const origin = header(event, 'origin');
    const allowedOrigins = parseAllowedOrigins(process.env.VENTUS_ALLOWED_ORIGINS);
    const responseHeaders = corsHeaders(origin, allowedOrigins);
    const method = event.httpMethod || event.requestContext?.http?.method || 'GET';
    if (method === 'OPTIONS') return response(204, null, responseHeaders);
    if (method !== 'POST') return response(405, { error: 'method not allowed' }, responseHeaders);

    const path = normalizePath(event.path || event.rawPath || event.resource || '/');
    if (!origin || !allowedOrigins.includes(origin)) {
      return response(403, { error: 'origin is not allowed' }, responseHeaders);
    }
    if (process.env.ENABLE_LIVE_CONNECTORS !== 'true') {
      return response(404, { error: 'live connectors are disabled' }, responseHeaders);
    }

    try {
      if (path.endsWith('/v1/demo/session')) {
        if (process.env.VENTUS_ENABLE_DEMO_CONNECTOR_SESSION !== 'true') {
          return response(404, { error: 'live connector session is disabled' }, responseHeaders);
        }
        const result = await connectorService.issueSession({
          tenantId: process.env.VENTUS_DEMO_TENANT_ID || 'demo_bank',
        });
        return response(200, result, responseHeaders);
      }

      if (path.endsWith('/v1/demo/plaid-transactions')) {
        const body = parseBody(event.body);
        const result = await connectorService.pullPlaidTransactions({
          authorization: header(event, 'authorization'),
          scenario: body.scenario,
        });
        return response(200, result, responseHeaders);
      }

      if (path.endsWith('/v1/demo/salesforce-task')) {
        const result = await connectorService.createSalesforceTask({
          authorization: header(event, 'authorization'),
          body: parseBody(event.body),
        });
        return response(200, result, responseHeaders);
      }

      return response(404, { error: 'route not found' }, responseHeaders);
    } catch (error) {
      const status = error instanceof DemoConnectorError ? error.status : 500;
      const message = status >= 500 && !(error instanceof DemoConnectorError)
        ? 'connector service failed'
        : String(error?.message || error).slice(0, 180);
      console.error(JSON.stringify({
        event: 'demo_connector_error',
        path,
        status,
        message,
        requestId: event.requestContext?.requestId,
      }));
      return response(status, { error: message }, responseHeaders);
    }
  };
}

export const handler = createHandler();

function parseAllowedOrigins(value) {
  if (typeof value !== 'string' || !value.trim()) return DEFAULT_ALLOWED_ORIGINS;
  return value.split(',').map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean);
}

function corsHeaders(origin, allowedOrigins) {
  return {
    ...(origin && allowedOrigins.includes(origin) ? { 'Access-Control-Allow-Origin': origin } : {}),
    'Access-Control-Allow-Headers': 'Authorization,Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json',
    Vary: 'Origin',
  };
}

function response(statusCode, body, headers) {
  return {
    statusCode,
    headers,
    body: body === null ? '' : JSON.stringify(body),
  };
}

function parseBody(value) {
  if (!value) return {};
  try {
    return typeof value === 'string' ? JSON.parse(value) : value;
  } catch {
    throw new DemoConnectorError('invalid JSON', 400);
  }
}

function header(event, name) {
  const entries = Object.entries(event.headers || {});
  return entries.find(([key]) => key.toLowerCase() === name.toLowerCase())?.[1] || '';
}

function normalizePath(path) {
  return String(path).replace(/\/$/, '');
}
