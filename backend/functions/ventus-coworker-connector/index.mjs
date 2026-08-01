import pg from 'pg';
import { createSecretsProvider } from '../../shared/secrets.mjs';
import { createConnectorDeliveryRepository } from '../../shared/connector-delivery.mjs';
import { createCoworkerDeliveryService } from '../../shared/coworker-delivery.mjs';

const { Client } = pg;
let connector;
let getDatabaseCredentials;

export const handler = async (event = {}) => {
  const service = coworkerConnector();
  if (event.operation === 'test') return service.testConnection(event.input || {});
  if (event.operation === 'deliver') return service.deliver(event.input || {});
  throw new Error('unsupported coworker connector operation');
};

function coworkerConnector() {
  if (!connector) {
    if (!process.env.VENTUS_COWORKER_CONNECTOR_SECRET_ID) throw new Error('coworker connector secret is not configured');
    connector = createCoworkerDeliveryService({
      getSecrets: createSecretsProvider({
        secretId: process.env.VENTUS_COWORKER_CONNECTOR_SECRET_ID,
        region: process.env.AWS_REGION || 'us-east-2',
      }),
      deliveryRepository: createConnectorDeliveryRepository({ getDB: runtimeDatabase }),
      consoleBaseUrl: process.env.VENTUS_CONSOLE_PUBLIC_URL,
    });
  }
  return connector;
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
