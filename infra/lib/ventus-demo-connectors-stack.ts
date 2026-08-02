import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

const DEFAULT_COGNITO_USER_POOL_ID = 'us-east-2_M9Ipbusin';
const DEFAULT_DEMO_TENANT_ID = 'ventus';
const DEFAULT_ORIGINS = [
  'https://demo.ventusai.com',
  'https://dev.d1gaewa028qzng.amplifyapp.com',
  'https://staging.d1gaewa028qzng.amplifyapp.com',
];

export class VentusDemoConnectorsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const allowedOrigins = parseOrigins(this.node.tryGetContext('demoAllowedOrigins'));
    const cognitoUserPoolId = String(
      this.node.tryGetContext('demoCognitoUserPoolId') ?? DEFAULT_COGNITO_USER_POOL_ID,
    ).trim();
    if (!/^us-east-2_[A-Za-z0-9]+$/.test(cognitoUserPoolId)) {
      throw new Error('demoCognitoUserPoolId must be a valid us-east-2 Cognito user pool ID');
    }
    const demoTenantId = String(
      this.node.tryGetContext('demoTenantId') ?? DEFAULT_DEMO_TENANT_ID,
    ).trim();
    if (!/^[A-Za-z0-9][A-Za-z0-9_-]{1,127}$/.test(demoTenantId)) {
      throw new Error('demoTenantId must be a valid tenant identifier');
    }
    const userPool = cognito.UserPool.fromUserPoolId(
      this,
      'GrowthConsoleUserPool',
      cognitoUserPoolId,
    );
    const sessionAuthorizer = new apigateway.CognitoUserPoolsAuthorizer(
      this,
      'VentusDemoSessionAuthorizer',
      { cognitoUserPools: [userPool] },
    );
    const connectorSecret = new secretsmanager.Secret(this, 'VentusDemoConnectorSecret', {
      secretName: 'ventus/staging/demo-connectors',
      description: 'Sandbox-only Plaid and Salesforce credentials for the protected Ventus live demo.',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          plaidClientId: 'CONFIGURE_PLAID_CLIENT_ID',
          plaidSecret: 'CONFIGURE_PLAID_SECRET',
          salesforceLoginUrl: 'CONFIGURE_SALESFORCE_LOGIN_URL',
          salesforceClientId: 'CONFIGURE_SALESFORCE_CLIENT_ID',
          salesforceClientSecret: 'CONFIGURE_SALESFORCE_CLIENT_SECRET',
        }),
        generateStringKey: 'sessionSigningSecret',
        passwordLength: 48,
        excludePunctuation: true,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const connectorLogGroup = new logs.LogGroup(this, 'VentusDemoConnectorLogGroup', {
      logGroupName: '/aws/lambda/ventus-demo-connectors',
      retention: logs.RetentionDays.THREE_MONTHS,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const connectorFunction = new lambda.Function(this, 'VentusDemoConnectorFunction', {
      functionName: 'ventus-demo-connectors',
      description: 'Sandbox-only Plaid and Salesforce FSC workflow connector for the protected executive demo.',
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../backend/dist/lambda/ventus-demo-connectors.zip'),
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      logGroup: connectorLogGroup,
      reservedConcurrentExecutions: 2,
      environment: {
        ENABLE_LIVE_CONNECTORS: 'true',
        VENTUS_ENABLE_DEMO_CONNECTOR_SESSION: 'true',
        VENTUS_DEMO_CONNECTOR_SECRET_ID: connectorSecret.secretArn,
        VENTUS_DEMO_TENANT_ID: demoTenantId,
        VENTUS_ALLOWED_ORIGINS: allowedOrigins.join(','),
        PLAID_ENV: 'sandbox',
      },
    });
    connectorSecret.grantRead(connectorFunction);

    const api = new apigateway.RestApi(this, 'VentusDemoConnectorApi', {
      restApiName: 'ventus-demo-connectors',
      description: 'Protected sandbox connector surface for Ventus executive demonstrations.',
      endpointTypes: [apigateway.EndpointType.REGIONAL],
      cloudWatchRole: false,
      deployOptions: {
        stageName: 'demo',
        metricsEnabled: true,
        tracingEnabled: true,
        throttlingRateLimit: 2,
        throttlingBurstLimit: 4,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: allowedOrigins,
        allowMethods: ['POST', 'OPTIONS'],
        allowHeaders: ['Authorization', 'Content-Type'],
        maxAge: cdk.Duration.hours(1),
      },
    });

    const integration = new apigateway.LambdaIntegration(connectorFunction, { proxy: true });
    const demo = api.root.addResource('v1').addResource('demo');
    demo.addResource('session').addMethod('POST', integration, {
      authorizer: sessionAuthorizer,
      authorizationType: apigateway.AuthorizationType.COGNITO,
      authorizationScopes: ['openid'],
    });
    demo.addResource('plaid-transactions').addMethod('POST', integration);
    demo.addResource('salesforce-task').addMethod('POST', integration);
    demo.addResource('salesforce-onboarding').addMethod('POST', integration);
    demo.addResource('salesforce-deliver').addMethod('POST', integration);
    demo.addResource('salesforce-outcomes').addMethod('POST', integration);

    new cloudwatch.Alarm(this, 'VentusDemoConnectorErrorsAlarm', {
      alarmName: 'ventus-demo-connectors-errors',
      alarmDescription: 'The sandbox demo connector Lambda returned execution errors.',
      metric: connectorFunction.metricErrors({ period: cdk.Duration.minutes(5), statistic: 'Sum' }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    new cloudwatch.Alarm(this, 'VentusDemoConnectorThrottlesAlarm', {
      alarmName: 'ventus-demo-connectors-throttles',
      alarmDescription: 'The sandbox demo connector Lambda was throttled.',
      metric: connectorFunction.metricThrottles({ period: cdk.Duration.minutes(5), statistic: 'Sum' }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    new cloudwatch.Alarm(this, 'VentusDemoConnectorApiErrorsAlarm', {
      alarmName: 'ventus-demo-connectors-api-5xx',
      alarmDescription: 'The sandbox demo connector API returned server errors.',
      metric: api.metricServerError({ period: cdk.Duration.minutes(5), statistic: 'Sum' }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    new cdk.CfnOutput(this, 'DemoConnectorApiBaseUrl', {
      value: `${api.url}v1/demo`,
      description: 'Set this value as VITE_DEMO_CONNECTOR_API_BASE_URL in the protected Amplify branch.',
    });
    new cdk.CfnOutput(this, 'DemoConnectorSecretArn', {
      value: connectorSecret.secretArn,
      description: 'Update this secret with Plaid and Salesforce sandbox credentials after deployment.',
    });
  }
}

function parseOrigins(value: unknown): string[] {
  if (typeof value !== 'string' || !value.trim()) return DEFAULT_ORIGINS;
  const origins = value.split(',').map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean);
  if (!origins.every((origin) => /^https:\/\/[A-Za-z0-9.-]+$/.test(origin))) {
    throw new Error('demoAllowedOrigins must contain comma-separated HTTPS origins');
  }
  return [...new Set(origins)];
}
