import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as logs from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';

/**
 * Retirement shell for the Growth Console API.
 *
 * The public API and Lambda log group intentionally retain their exact
 * logical and physical identities, allowing a later reviewed rollback without
 * replacing either retained resource. The shell has no route, Lambda,
 * connector, alarm, or database-accessing resource.
 */
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

    const api = new apigateway.CfnRestApi(this, 'ConsoleApiRetirementShell', {
      name: 'ventus-console-api',
      description: 'Authenticated institution-scoped API for the Ventus Growth Console.',
      endpointConfiguration: {
        types: ['REGIONAL'],
      },
    });
    api.overrideLogicalId('ConsoleApi6AEC8E69');

    new cdk.CfnOutput(this, 'ConsoleApiBaseUrl', {
      value: cdk.Fn.join('', [
        'https://',
        api.ref,
        '.execute-api.',
        this.region,
        '.',
        this.urlSuffix,
        '/staging/v1/console',
      ]),
      description: 'Non-production server-side API base URL for the Growth Console.',
    });
  }
}
