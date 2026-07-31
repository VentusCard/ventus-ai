import { ProductSalesforceConnectorError } from './product-salesforce-connector.mjs';

export async function testConfiguredConnector({ connector, mapping, testSalesforce, testCoworker }) {
  const selectedConnector = connector || mapping?.connector;
  if (selectedConnector === 'salesforce-fsc') return testSalesforce({ mapping });
  if (selectedConnector === 'microsoft-outlook') return testCoworker({ channel: 'outlook', mapping });
  if (selectedConnector === 'slack') return testCoworker({ channel: 'slack', mapping });
  throw new ProductSalesforceConnectorError('The selected connector is unsupported.', {
    code: 'connector_unsupported', terminalFailure: true,
  });
}
