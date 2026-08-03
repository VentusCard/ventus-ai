import * as cdk from 'aws-cdk-lib';
import { VentusCoworkerStack } from '../lib/ventus-coworker-stack.ts';
import { VentusExistingInfraStack } from '../lib/ventus-existing-infra-stack.ts';

const app = new cdk.App();

const account = app.node.tryGetContext('account');
const region = app.node.tryGetContext('region');

new VentusExistingInfraStack(app, 'VentusExistingInfraStack', {
  env: { account, region },
});

// The Coworker is an isolated subsystem. It defaults to us-east-2 so it sits in
// the same region as the model-provider secret (and future Aurora access). SES
// inbound receiving is NOT available in us-east-2, so the inbound receipt rule is
// disabled by default here; email is received via a separate us-east-1 front door
// (added later). Override the region with -c coworkerRegion=...
new VentusCoworkerStack(app, 'VentusCoworkerStack', {
  env: {
    account,
    region: app.node.tryGetContext('coworkerRegion') ?? 'us-east-2',
  },
});
