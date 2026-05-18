import * as cdk from 'aws-cdk-lib';
import { VentusExistingInfraStack } from '../lib/ventus-existing-infra-stack.ts';

const app = new cdk.App();

new VentusExistingInfraStack(app, 'VentusExistingInfraStack', {
  env: {
    account: app.node.tryGetContext('account'),
    region: app.node.tryGetContext('region'),
  },
});
