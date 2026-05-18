import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const DEFAULT_REGION = 'us-east-2';

export function createSecretsProvider({ secretId, region = DEFAULT_REGION }) {
  if (!secretId) throw new Error('secretId is required');

  const client = new SecretsManagerClient({ region });
  let cachedSecrets = null;

  return async function getSecrets() {
    if (cachedSecrets) return cachedSecrets;

    const response = await client.send(
      new GetSecretValueCommand({ SecretId: secretId })
    );

    cachedSecrets = JSON.parse(response.SecretString);
    return cachedSecrets;
  };
}
