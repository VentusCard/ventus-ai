import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

/** Retained Wave A shell for the retired Growth Console API. */
export class VentusConsoleApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {
      ...props,
      terminationProtection: true,
    });

    new logs.LogGroup(this, 'ConsoleApiLogGroup', {
      logGroupName: '/aws/lambda/ventus-console-api',
      retention: logs.RetentionDays.SIX_MONTHS,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const api = new apigateway.CfnRestApi(this, 'ConsoleApi', {
      name: 'ventus-console-api',
      description: 'Authenticated institution-scoped API for the Ventus Growth Console.',
      endpointConfiguration: { types: ['REGIONAL'] },
    });
    // Preserve the existing physical API while emitting no Method, Deployment,
    // or Stage resources in the Wave A retirement shell.
    api.overrideLogicalId('ConsoleApi6AEC8E69');
  }
}
