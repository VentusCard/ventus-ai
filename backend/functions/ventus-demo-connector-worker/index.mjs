import { createSecretsProvider } from '../../shared/secrets.mjs';
import { createDemoConnectorService } from '../../shared/demo-connectors.mjs';

let connector;

export const handler = async (event = {}) => {
  if (event.operation !== 'pullPlaidScenario') throw new Error('unsupported demo connector operation');
  return demoConnector().pullPlaidScenario(event.input || {});
};

function demoConnector() {
  if (!connector) {
    if (!process.env.VENTUS_DEMO_CONNECTOR_SECRET_ID) throw new Error('demo connector secret is not configured');
    connector = createDemoConnectorService({
      getSecrets: createSecretsProvider({
        secretId: process.env.VENTUS_DEMO_CONNECTOR_SECRET_ID,
        region: process.env.AWS_REGION || 'us-east-2',
      }),
    });
  }
  return connector;
}
