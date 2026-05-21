const DEFAULT_REGION = 'us-east-2';
const DEFAULT_CACHE_TTL_MS = 60_000;
export const LEGACY_COMBINED_SECRET_ID =
  'rds-db-credentials/cluster-YOWTEC3WNTPF6ARWDMCUJGSOL4/ventusadmin/1771815186022';

export function resolveSecretId({
  envVar,
  fallback = LEGACY_COMBINED_SECRET_ID,
}) {
  return process.env[envVar] || fallback;
}

export function createSecretsProvider({
  secretId,
  region = DEFAULT_REGION,
  client,
}) {
  if (!secretId) throw new Error('secretId is required');

  let secretsClient = client;
  let cachedSecrets = null;
  let cachedAtMs = 0;
  const cacheTtlMs = resolveCacheTtlMs();

  return async function getSecrets() {
    const now = Date.now();
    if (cachedSecrets && now - cachedAtMs < cacheTtlMs) return cachedSecrets;

    const { resolvedClient, command } = await createGetSecretValueCommand({
      client: secretsClient,
      region,
      secretId,
    });
    secretsClient = resolvedClient;

    const response = await secretsClient.send(command);

    cachedSecrets = JSON.parse(response.SecretString);
    cachedAtMs = now;
    return cachedSecrets;
  };
}

function resolveCacheTtlMs() {
  const rawValue = process.env.SECRETS_CACHE_TTL_MS;
  if (!rawValue) return DEFAULT_CACHE_TTL_MS;

  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed) || parsed < 0) return DEFAULT_CACHE_TTL_MS;

  return parsed;
}

async function createGetSecretValueCommand({ client, region, secretId }) {
  if (client) {
    return {
      resolvedClient: client,
      command: { SecretId: secretId },
    };
  }

  const {
    SecretsManagerClient,
    GetSecretValueCommand,
  } = await import('@aws-sdk/client-secrets-manager');

  return {
    resolvedClient: new SecretsManagerClient({ region }),
    command: new GetSecretValueCommand({ SecretId: secretId }),
  };
}
