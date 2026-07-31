import { createRemoteJWKSet, jwtVerify } from 'jose';
import pg from 'pg';
import { createConsoleApiHandler } from '../../shared/console-api.mjs';
import { createConsoleJourneyRepository } from '../../shared/console-journey.mjs';
import { createConnectorDeliveryRepository } from '../../shared/connector-delivery.mjs';
import { createDecisionLedgerRepository } from '../../shared/decision-ledger.mjs';
import { createEnterpriseControlPlane } from '../../shared/enterprise-control-plane.mjs';
import { createGrowthPlayRegistry } from '../../shared/growth-play-registry.mjs';
import { executeHostedDecision } from '../../shared/hosted-decision-runtime.mjs';
import { createSecretsProvider } from '../../shared/secrets.mjs';
import { createCoworkerDeliveryService } from '../../shared/coworker-delivery.mjs';
import {
  createProductSalesforceConnector,
  ProductSalesforceConnectorError,
} from '../../shared/product-salesforce-connector.mjs';

const { Client } = pg;
const OPAQUE_ID = /^[A-Za-z0-9][A-Za-z0-9:_-]{1,255}$/;
const TENANT_ID = /^[A-Za-z0-9][A-Za-z0-9_-]{1,127}$/;
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ALLOWED_ENTITLEMENTS = new Set([
  'consumer_demo',
  'wealth_demo',
  'growth_console',
  'live_connectors',
]);
const jwksByIssuer = new Map();
let getDatabaseCredentials;
let getProductConnectorCredentials;
let productSalesforceConnector;
let journeyRepository;
let controlPlaneRepository;
let growthPlayRegistry;
let coworkerDeliveryService;
let getCoworkerConnectorCredentials;
let ledgerRepository;

export const handler = createConsoleApiHandler({
  verifyIdentity: verifyCognitoAccessToken,
  resolveMembership: resolveCognitoMembership,
  executeDecision: executeHostedDecision,
  appendDecision: persistDecision,
  journey: consoleJourney(),
  deliverReserved: deliverReservedSalesforce,
  controlPlane: enterpriseControlPlane(),
  growthPlayRegistry: consoleGrowthPlayRegistry(),
  deliverCoworkerBriefing,
  readSalesforceOutcome,
});

async function verifyCognitoAccessToken(token) {
  const issuer = process.env.COGNITO_ISSUER?.trim().replace(/\/$/, '') || '';
  const clientId = process.env.COGNITO_CLIENT_ID?.trim() || '';
  if (!issuer || !clientId) return null;
  try {
    let jwks = jwksByIssuer.get(issuer);
    if (!jwks) {
      jwks = createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));
      jwksByIssuer.set(issuer, jwks);
    }
    const { payload } = await jwtVerify(token, jwks, {
      issuer,
      algorithms: ['RS256'],
    });
    const subject = typeof payload.sub === 'string' ? payload.sub : '';
    const tenantHint = typeof payload.tenant_id === 'string' ? payload.tenant_id : '';
    if (
      payload.token_use !== 'access'
      || payload.client_id !== clientId
      || !OPAQUE_ID.test(subject)
      || !TENANT_ID.test(tenantHint)
    ) {
      return null;
    }
    return { subject, tenantHint, issuer };
  } catch {
    return null;
  }
}

async function resolveCognitoMembership(identity) {
  const client = await runtimeDatabase();
  await client.connect();
  try {
    await client.query('BEGIN READ ONLY');
    await client.query("SELECT set_config('app.current_tenant_id', $1, true)", [identity.tenantHint]);
    const result = await client.query(
      `SELECT m.email, m.role, m.status, m.entitlements, m.business_lines, m.queue_scopes
         FROM ventus_evidence.institution_memberships m
         JOIN ventus_evidence.institutions i
           ON i.tenant_id = m.tenant_id
         JOIN ventus_evidence.institution_identity_providers p
           ON p.tenant_id = m.tenant_id
          AND p.provider_key = m.identity_provider_key
        WHERE m.tenant_id = $1
          AND m.identity_provider_key = 'cognito'
          AND m.identity_subject = $2
          AND m.status IN ('invited', 'active', 'suspended')
          AND i.status IN ('pilot', 'active')
          AND p.status IN ('testing', 'active')
          AND p.issuer = $3
        LIMIT 1`,
      [identity.tenantHint, identity.subject, identity.issuer],
    );
    await client.query('COMMIT');
    const row = result.rows[0];
    if (!row || !EMAIL.test(row.email)) return null;
    return {
      email: row.email.toLowerCase(),
      role: row.role,
      status: row.status === 'active' ? 'active' : row.status === 'suspended' ? 'suspended' : 'pending',
      entitlements: safeStringArray(row.entitlements).filter((item) => ALLOWED_ENTITLEMENTS.has(item)),
      businessLines: safeStringArray(row.business_lines),
      queueScopes: safeStringArray(row.queue_scopes),
    };
  } catch (error) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw error;
  } finally {
    await client.end();
  }
}

async function persistDecision({ decision, requestId }) {
  return consoleJourney().recordDecision({ decision, requestId });
}

function consoleJourney() {
  if (!journeyRepository) {
    journeyRepository = createConsoleJourneyRepository({
      getDB: runtimeDatabase,
      ledgerRepository: decisionLedger(),
      deliveryRepository: createConnectorDeliveryRepository({ getDB: runtimeDatabase }),
    });
  }
  return journeyRepository;
}

function consoleGrowthPlayRegistry() {
  if (!growthPlayRegistry) growthPlayRegistry = createGrowthPlayRegistry({ getDB: runtimeDatabase });
  return growthPlayRegistry;
}

function enterpriseControlPlane() {
  if (!controlPlaneRepository) {
    controlPlaneRepository = createEnterpriseControlPlane({
      getDB: runtimeDatabase,
      growthPlayRegistry: consoleGrowthPlayRegistry(),
      ledgerRepository: decisionLedger(),
      connectionTester: testConnectorConnection,
    });
  }
  return controlPlaneRepository;
}

async function testConnectorConnection({ connector, mapping }) {
  if (connector === 'salesforce-fsc') return productConnector().testConnection();
  if (connector === 'microsoft-outlook') return coworkerDelivery().testConnection({ channel: 'outlook', mapping });
  if (connector === 'slack') return coworkerDelivery().testConnection({ channel: 'slack', mapping });
  throw new ProductSalesforceConnectorError('The selected connector is unsupported.', {
    code: 'connector_unsupported', terminalFailure: true,
  });
}

function decisionLedger() {
  if (!ledgerRepository) ledgerRepository = createDecisionLedgerRepository({ getDB: runtimeDatabase });
  return ledgerRepository;
}

async function deliverCoworkerBriefing(input) {
  return coworkerDelivery().deliver(input);
}

async function readSalesforceOutcome(input) {
  return productConnector().readOutcome(input);
}

function coworkerDelivery() {
  if (!coworkerDeliveryService) {
    if (!process.env.VENTUS_COWORKER_CONNECTOR_SECRET_ID) {
      throw new ProductSalesforceConnectorError(
        'The Coworker connector secret is not configured for this environment.',
        { code: 'coworker_connector_secret_missing', terminalFailure: true },
      );
    }
    coworkerDeliveryService = createCoworkerDeliveryService({
      getSecrets: coworkerConnectorCredentialsProvider(),
      deliveryRepository: createConnectorDeliveryRepository({ getDB: runtimeDatabase }),
      consoleBaseUrl: process.env.VENTUS_CONSOLE_PUBLIC_URL,
    });
  }
  return coworkerDeliveryService;
}

async function deliverReservedSalesforce({ tenantId, decisionId, sessionId, reservation, moment }) {
  if (!reservation?.shouldDeliver || reservation.record?.status !== 'pending') {
    return { receipt: deliveryReceipt(reservation?.record), moment };
  }
  try {
    const result = await productConnector().deliver({
      tenantId,
      decisionPackage: moment.decisionPackage,
      decisionPackageV12: moment.decisionPackageV12,
    });
    return consoleJourney().completeDelivery({
      tenantId,
      decisionId,
      sessionId,
      deliveryId: reservation.record.delivery_id,
      status: 'delivered',
      externalReceiptId: result.id,
      externalReceiptUrl: result.url,
      records: result.records,
      warnings: result.warnings,
      completedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof ProductSalesforceConnectorError && error.terminalFailure) {
      return consoleJourney().completeDelivery({
        tenantId,
        decisionId,
        sessionId,
        deliveryId: reservation.record.delivery_id,
        status: 'failed',
        errorCode: error.code,
        completedAt: new Date().toISOString(),
      });
    }
    // A timeout or downstream 5xx may occur after Salesforce accepted the
    // write. Leave the durable reservation pending for reconciliation.
    console.error(JSON.stringify({
      event: 'product_salesforce_delivery_pending_reconciliation',
      tenantId,
      decisionId,
      deliveryId: reservation.record.delivery_id,
      message: String(error?.message || error).slice(0, 180),
    }));
    return {
      receipt: deliveryReceipt(reservation.record),
      moment,
      reservation: { reconciliationRequired: true },
    };
  }
}

function productConnector() {
  if (!productSalesforceConnector) {
    if (!process.env.VENTUS_PRODUCT_CONNECTOR_SECRET_ID) {
      throw new ProductSalesforceConnectorError(
        'The product Salesforce connector secret is not configured for this environment.',
        { code: 'salesforce_connector_secret_missing', terminalFailure: true },
      );
    }
    productSalesforceConnector = createProductSalesforceConnector({
      getSecrets: productConnectorCredentialsProvider(),
    });
  }
  return productSalesforceConnector;
}

function productConnectorCredentialsProvider() {
  if (!getProductConnectorCredentials) {
    getProductConnectorCredentials = createSecretsProvider({
      secretId: process.env.VENTUS_PRODUCT_CONNECTOR_SECRET_ID,
      region: process.env.AWS_REGION || 'us-east-2',
    });
  }
  return getProductConnectorCredentials;
}

function coworkerConnectorCredentialsProvider() {
  if (!getCoworkerConnectorCredentials) {
    getCoworkerConnectorCredentials = createSecretsProvider({
      secretId: process.env.VENTUS_COWORKER_CONNECTOR_SECRET_ID,
      region: process.env.AWS_REGION || 'us-east-2',
    });
  }
  return getCoworkerConnectorCredentials;
}

function deliveryReceipt(record) {
  return {
    deliveryId: record?.delivery_id ?? null,
    status: record?.status ?? 'pending',
    externalReceiptId: record?.external_receipt_id ?? null,
    externalReceiptUrl: record?.external_receipt_url ?? null,
  };
}

async function runtimeDatabase() {
  const credentials = await databaseCredentialsProvider()();
  return new Client({
    host: process.env.RDS_HOST,
    port: Number(process.env.RDS_PORT || 5432),
    database: process.env.RDS_DATABASE || 'ventus_bofa',
    user: credentials.username,
    password: credentials.password,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5_000,
    statement_timeout: 5_000,
    options: '-c search_path=ventus_evidence,public',
  });
}

function databaseCredentialsProvider() {
  if (!getDatabaseCredentials) {
    getDatabaseCredentials = createSecretsProvider({
      secretId: process.env.EVIDENCE_RUNTIME_SECRET_ID,
      region: process.env.AWS_REGION || 'us-east-2',
    });
  }
  return getDatabaseCredentials;
}

function safeStringArray(value) {
  return Array.isArray(value)
    ? [...new Set(value.filter((item) => typeof item === 'string'))]
    : [];
}
