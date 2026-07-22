import * as cdk from 'aws-cdk-lib';
import { VentusDemoConnectorsStack } from '../lib/ventus-demo-connectors-stack.ts';
import { VentusEvidenceStoreStack } from '../lib/ventus-evidence-store-stack.ts';
import { VentusExistingInfraStack } from '../lib/ventus-existing-infra-stack.ts';

const app = new cdk.App();
const env = {
  account: app.node.tryGetContext('account'),
  region: app.node.tryGetContext('region'),
};

new VentusExistingInfraStack(app, 'VentusExistingInfraStack', {
  env,
});

const evidenceStoreEnabled = ['true', '1', 'yes'].includes(
  String(app.node.tryGetContext('enableEvidenceStoreMigrator') ?? '').toLowerCase(),
);
if (evidenceStoreEnabled) {
  new VentusEvidenceStoreStack(app, 'VentusEvidenceStoreStack', { env });
}

const demoConnectorsEnabled = ['true', '1', 'yes'].includes(
  String(app.node.tryGetContext('enableDemoConnectors') ?? '').toLowerCase(),
);
if (demoConnectorsEnabled) {
  new VentusDemoConnectorsStack(app, 'VentusDemoConnectorsStack', { env });
}
