import { Client } from 'pg';
import { createSecretsProvider } from './secrets.mjs';

const DEFAULT_DATABASE = 'ventus_bofa';

export function createDbFactory({
  secretId,
  getSecrets,
  region,
  databaseEnvVar = 'RDS_DATABASE',
  databaseFallback = DEFAULT_DATABASE,
}) {
  const getDbSecrets =
    getSecrets || createSecretsProvider({ secretId, region });

  return async function getDB() {
    const secrets = await getDbSecrets();

    return new Client({
      host: secrets.host,
      port: secrets.port || 5432,
      database: process.env[databaseEnvVar] || databaseFallback,
      user: secrets.username,
      password: secrets.password,
      ssl: { rejectUnauthorized: false },
    });
  };
}
