import * as cdk from 'aws-cdk-lib';
import { VentusConsoleApiStack } from '../lib/ventus-console-api-stack.ts';
import { VentusCoworkerStack } from '../lib/ventus-coworker-stack.ts';
import { VentusDemoConnectorsStack } from '../lib/ventus-demo-connectors-stack.ts';
import { VentusEvidenceStoreStack } from '../lib/ventus-evidence-store-stack.ts';
import { VentusExistingInfraStack } from '../lib/ventus-existing-infra-stack.ts';
import { VentusIdentityStack } from '../lib/ventus-identity-stack.ts';

const app = new cdk.App();
const env = {
  account: app.node.tryGetContext('account'),
  region: app.node.tryGetContext('region'),
};

new VentusExistingInfraStack(app, 'VentusExistingInfraStack', {
  env,
});

// The Coworker is an isolated subsystem. It defaults to us-east-2 so it sits in
// the same region as the model-provider secret (and future Aurora access). SES
// inbound receiving is NOT available in us-east-2, so the inbound receipt rule is
// disabled by default here; email is received via a separate us-east-1 front door
// (added later). Override the region with -c coworkerRegion=...
new VentusCoworkerStack(app, 'VentusCoworkerStack', {
  env: {
    account: env.account,
    region: app.node.tryGetContext('coworkerRegion') ?? 'us-east-2',
  },
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

const identityFoundationEnabled = ['true', '1', 'yes'].includes(
  String(app.node.tryGetContext('enableIdentityFoundation') ?? '').toLowerCase(),
);
if (identityFoundationEnabled) {
  new VentusIdentityStack(app, 'VentusIdentityStack', { env });
}

const consoleApiEnabled = ['true', '1', 'yes'].includes(
  String(app.node.tryGetContext('enableConsoleApi') ?? '').toLowerCase(),
);
if (consoleApiEnabled) {
  new VentusConsoleApiStack(app, 'VentusConsoleApiStack', { env });
}
