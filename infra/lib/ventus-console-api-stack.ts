import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import { VENTUS_DATABASE_KMS_KEY_ARN } from './ventus-existing-infra-stack.ts';

const COGNITO_ISSUER =
  'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_M9Ipbusin';
const COGNITO_CLIENT_ID = '7p8ii113apn8s99t9khf0n4uib';
const EVIDENCE_RUNTIME_SECRET_ID = 'ventus/evidence-store/app-v1';
const PRODUCT_CONNECTOR_SECRET_NAME = 'ventus/staging/product-connectors';
const COWORKER_CONNECTOR_SECRET_NAME = 'ventus/staging/coworker-connectors';
const RDS_HOST =
  'ventus-bofa-cluster.cluster-chm2goicq5dx.us-east-2.rds.amazonaws.com';
const DEFAULT_ORIGINS = [
  'http://127.0.0.1:5173',
  'http://localhost:5173',
  'https://dev.d1gaewa028qzng.amplifyapp.com',
  'https://staging.d1gaewa028qzng.amplifyapp.com',
];

/** Additive authenticated API boundary for the Growth Console. */
export class VentusConsoleApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {
      ...props,
      terminationProtection: true,
    });

    const allowedOrigins = contextOrigins(this, 'consoleAllowedOrigins', DEFAULT_ORIGINS);
    const vpc = ec2.Vpc.fromVpcAttributes(this, 'ExistingVentusVpc', {
      vpcId: 'vpc-0d4cf689a4fed7f31',
      availabilityZones: ['us-east-2a', 'us-east-2b'],
      privateSubnetIds: ['subnet-057aa09eef4545099', 'subnet-00958cfa806e7e363'],
    });
    const lambdaSubnets = [
      ec2.Subnet.fromSubnetId(this, 'ConsoleApiSubnetA', 'subnet-057aa09eef4545099'),
      ec2.Subnet.fromSubnetId(this, 'ConsoleApiSubnetB', 'subnet-00958cfa806e7e363'),
    ];
    const databaseSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      'ExistingDatabaseSecurityGroup',
      'sg-08836ed15d778ecd6',
      { mutable: false },
    );

    const logGroup = new logs.LogGroup(this, 'ConsoleApiLogGroup', {
      logGroupName: '/aws/lambda/ventus-console-api',
      retention: logs.RetentionDays.SIX_MONTHS,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    // Product connector credentials are intentionally distinct from the
    // presenter/demo connector. The Console Lambda is the sole reader.
    const productConnectorSecret = new secretsmanager.Secret(this, 'ProductConnectorSecret', {
      secretName: PRODUCT_CONNECTOR_SECRET_NAME,
      description: 'Server-only Salesforce/FSC credentials for authenticated Ventus product delivery.',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          salesforceLoginUrl: 'CONFIGURE_SALESFORCE_LOGIN_URL',
          salesforceClientId: 'CONFIGURE_SALESFORCE_CLIENT_ID',
          salesforceClientSecret: 'CONFIGURE_SALESFORCE_CLIENT_SECRET',
          salesforceDefaultAccountId: 'CONFIGURE_SALESFORCE_DEFAULT_ACCOUNT_ID',
          salesforceReferralRecordTypeId: 'CONFIGURE_SALESFORCE_REFERRAL_RECORD_TYPE_ID',
          salesforceCreateReferral: false,
        }),
        generateStringKey: 'placeholder',
        excludePunctuation: true,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    const coworkerConnectorSecret = new secretsmanager.Secret(this, 'CoworkerConnectorSecret', {
      secretName: COWORKER_CONNECTOR_SECRET_NAME,
      description: 'Server-only Outlook and Slack credentials for authenticated Ventus Coworker delivery.',
      generateSecretString: {
        secretStringTemplate: JSON.stringify({
          microsoftTenantId: 'CONFIGURE_MICROSOFT_TENANT_ID',
          microsoftClientId: 'CONFIGURE_MICROSOFT_CLIENT_ID',
          microsoftClientSecret: 'CONFIGURE_MICROSOFT_CLIENT_SECRET',
          microsoftSenderUserId: 'CONFIGURE_MICROSOFT_SENDER_USER_ID',
          slackBotToken: 'CONFIGURE_SLACK_BOT_TOKEN',
        }),
        generateStringKey: 'placeholder',
        excludePunctuation: true,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    const consoleFunction = new lambda.Function(this, 'ConsoleApiFunction', {
      functionName: 'ventus-console-api',
      description: 'Cognito and institution-membership boundary for the Ventus Growth Console.',
      runtime: lambda.Runtime.NODEJS_22_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../backend/dist/lambda/ventus-console-api.zip'),
      vpc,
      vpcSubnets: { subnets: lambdaSubnets },
      securityGroups: [databaseSecurityGroup],
      memorySize: 512,
      // API Gateway REST integrations allow roughly 29 seconds. Leave room
      // for a cold start plus Salesforce auth and bounded FSC record writes.
      timeout: cdk.Duration.seconds(25),
      reservedConcurrentExecutions: 5,
      logGroup,
      environment: {
        COGNITO_ISSUER,
        COGNITO_CLIENT_ID,
        EVIDENCE_RUNTIME_SECRET_ID,
        VENTUS_PRODUCT_CONNECTOR_SECRET_ID: productConnectorSecret.secretArn,
        VENTUS_COWORKER_CONNECTOR_SECRET_ID: coworkerConnectorSecret.secretArn,
        VENTUS_CONSOLE_PUBLIC_URL: 'https://dev.d1gaewa028qzng.amplifyapp.com',
        RDS_HOST,
        RDS_PORT: '5432',
        RDS_DATABASE: 'ventus_bofa',
        VENTUS_ALLOWED_ORIGINS: allowedOrigins.join(','),
      },
    });
    const runtimeSecretArn = this.formatArn({
      service: 'secretsmanager',
      resource: 'secret',
      resourceName: `${EVIDENCE_RUNTIME_SECRET_ID}-*`,
      arnFormat: cdk.ArnFormat.COLON_RESOURCE_NAME,
    });
    consoleFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['secretsmanager:GetSecretValue'],
      resources: [runtimeSecretArn],
    }));
    productConnectorSecret.grantRead(consoleFunction);
    coworkerConnectorSecret.grantRead(consoleFunction);
    consoleFunction.addToRolePolicy(new iam.PolicyStatement({
      actions: ['kms:Decrypt', 'kms:DescribeKey'],
      resources: [VENTUS_DATABASE_KMS_KEY_ARN],
      conditions: {
        StringEquals: {
          'kms:ViaService': 'secretsmanager.us-east-2.amazonaws.com',
          'kms:CallerAccount': this.account,
        },
      },
    }));

    const api = new apigateway.RestApi(this, 'ConsoleApi', {
      restApiName: 'ventus-console-api',
      description: 'Authenticated institution-scoped API for the Ventus Growth Console.',
      endpointTypes: [apigateway.EndpointType.REGIONAL],
      cloudWatchRole: false,
      deployOptions: {
        stageName: 'staging',
        metricsEnabled: true,
        tracingEnabled: true,
        throttlingRateLimit: 20,
        throttlingBurstLimit: 40,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: allowedOrigins,
        allowMethods: ['GET', 'POST', 'OPTIONS'],
        allowHeaders: ['Authorization', 'Content-Type', 'Idempotency-Key'],
        maxAge: cdk.Duration.hours(1),
      },
    });
    const integration = new apigateway.LambdaIntegration(consoleFunction, { proxy: true });
    const consoleApi = api.root.addResource('v1').addResource('console');
    consoleApi.addResource('access').addMethod('POST', integration);
    consoleApi.addResource('decision-run').addMethod('POST', integration);
    consoleApi.addResource('today').addMethod('GET', integration);
    consoleApi.addResource('results').addMethod('GET', integration);
    consoleApi.addResource('governance').addMethod('GET', integration);
    const skills = consoleApi.addResource('skills').addResource('shadows');
    skills.addMethod('GET', integration);
    skills.addMethod('POST', integration);
    const growthPlays = consoleApi.addResource('growth-plays');
    growthPlays.addMethod('GET', integration);
    growthPlays.addResource('drafts').addMethod('POST', integration);
    growthPlays.addResource('register').addMethod('POST', integration);
    growthPlays.addResource('protocols').addResource('{decision_protocol_id}').addResource('approvals').addMethod('POST', integration);
    const connections = consoleApi.addResource('connections');
    connections.addMethod('GET', integration);
    connections.addMethod('POST', integration);
    const connection = connections.addResource('{mapping_id}');
    connection.addResource('test').addMethod('POST', integration);
    connection.addResource('approve').addMethod('POST', integration);
    connection.addResource('activate').addMethod('POST', integration);
    connection.addResource('revoke').addMethod('POST', integration);
    consoleApi.addResource('onboarding').addResource('readiness').addMethod('GET', integration);
    consoleApi.addResource('briefings').addResource('deliveries').addMethod('POST', integration);
    consoleApi.addResource('outcomes').addResource('salesforce-sync').addMethod('POST', integration);
    const moments = consoleApi.addResource('moments');
    moments.addMethod('GET', integration);
    const moment = moments.addResource('{decision_id}');
    moment.addMethod('GET', integration);
    moment.addResource('responses').addMethod('POST', integration);
    moment.addResource('deliveries').addMethod('POST', integration);

    new cloudwatch.Alarm(this, 'ConsoleApiLambdaErrors', {
      alarmName: 'ventus-console-api-errors',
      metric: consoleFunction.metricErrors({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 1,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    new cloudwatch.Alarm(this, 'ConsoleApiGatewayErrors', {
      alarmName: 'ventus-console-api-5xx',
      metric: api.metricServerError({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 1,
      evaluationPeriods: 1,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    new cdk.CfnOutput(this, 'ConsoleApiBaseUrl', {
      value: `${api.url}v1/console`,
      description: 'Non-production server-side API base URL for the Growth Console.',
    });
  }
}

function contextOrigins(stack: cdk.Stack, name: string, fallback: string[]): string[] {
  const value = stack.node.tryGetContext(name);
  const origins = typeof value === 'string' && value.trim()
    ? value.split(',').map((origin) => origin.trim().replace(/\/$/, '')).filter(Boolean)
    : fallback;
  if (!origins.every((origin) => /^https?:\/\/[A-Za-z0-9.:-]+$/.test(origin))) {
    throw new Error(`${name} must contain comma-separated HTTP(S) origins`);
  }
  return [...new Set(origins)];
}
