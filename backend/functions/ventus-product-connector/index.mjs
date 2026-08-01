import { createSecretsProvider } from '../../shared/secrets.mjs';
import { createProductSalesforceConnector } from '../../shared/product-salesforce-connector.mjs';

let connector;

export const handler = async (event = {}) => {
  const service = productConnector();
  switch (event.operation) {
    case 'test':
      return service.testConnection(event.input || {});
    case 'deliver':
      return service.deliver(event.input || {});
    case 'readOutcome':
      return service.readOutcome(event.input || {});
    default:
      throw new Error('unsupported product connector operation');
  }
};

function productConnector() {
  if (!connector) {
    if (!process.env.VENTUS_PRODUCT_CONNECTOR_SECRET_ID) throw new Error('product connector secret is not configured');
    connector = createProductSalesforceConnector({
      getSecrets: createSecretsProvider({
        secretId: process.env.VENTUS_PRODUCT_CONNECTOR_SECRET_ID,
        region: process.env.AWS_REGION || 'us-east-2',
      }),
    });
  }
  return connector;
}
