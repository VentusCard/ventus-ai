import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

const DATABASE_SECRET_ID =
  'rds-db-credentials/cluster-YOWTEC3WNTPF6ARWDMCUJGSOL4/ventusadmin/1771815186022';

/**
 * Isolated, additive stack for the durable Ventus decision/outcome evidence store.
 * It imports the existing private network and Aurora credentials but cannot replace or
 * remove the application, monitoring, rotation, alerting, or billing resources.
 */
export class VentusEvidenceStoreStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromVpcAttributes(this, 'ExistingVentusVpc', {
      vpcId: 'vpc-0d4cf689a4fed7f31',
      availabilityZones: ['us-east-2a', 'us-east-2b'],
      privateSubnetIds: ['subnet-057aa09eef4545099', 'subnet-00958cfa806e7e363'],
    });
    const lambdaSubnets = [
      ec2.Subnet.fromSubnetId(this, 'EvidenceLambdaSubnetA', 'subnet-057aa09eef4545099'),
      ec2.Subnet.fromSubnetId(this, 'EvidenceLambdaSubnetB', 'subnet-00958cfa806e7e363'),
    ];
    const databaseSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      'ExistingDatabaseSecurityGroup',
      'sg-08836ed15d778ecd6',
      { mutable: false },
    );
    const databaseSecretsKey = kms.Alias.fromAliasName(
      this,
      'ExistingDatabaseSecretsKey',
      'alias/ventus/database-secrets',
    );

    const runtimeSecret = new secretsmanager.Secret(this, 'VentusEvidenceRuntimeSecret', {
      secretName: 'ventus/evidence-store/runtime',
      description: 'Generated credentials for the non-bypass Ventus evidence-store runtime role.',
      encryptionKey: databaseSecretsKey,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'ventus_evidence_runtime' }),
        generateStringKey: 'password',
        passwordLength: 40,
        excludePunctuation: true,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    cdk.Tags.of(runtimeSecret).add('System', 'Ventus');
    cdk.Tags.of(runtimeSecret).add('SecretClass', 'database_credentials');
    cdk.Tags.of(runtimeSecret).add('Environment', 'staging');

    const migratorLogGroup = new logs.LogGroup(this, 'VentusEvidenceStoreMigratorLogGroup', {
      logGroupName: '/aws/lambda/ventus-evidence-store-migrator',
      retention: logs.RetentionDays.SIX_MONTHS,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    const migrator = new lambda.Function(this, 'VentusEvidenceStoreMigrator', {
      functionName: 'ventus-evidence-store-migrator',
      description: 'Manual, confirmation-gated migration and RLS verifier for the Ventus evidence store.',
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../backend/dist/monitors/evidence-store-migrator.zip'),
      vpc,
      vpcSubnets: { subnets: lambdaSubnets },
      securityGroups: [databaseSecurityGroup],
      memorySize: 512,
      timeout: cdk.Duration.minutes(5),
      logGroup: migratorLogGroup,
      environment: {
        VENTUS_ENVIRONMENT: 'staging',
        RDS_SECRET_ID: DATABASE_SECRET_ID,
        RDS_DATABASE: 'ventus_bofa',
        EVIDENCE_RUNTIME_SECRET_ID: runtimeSecret.secretName,
        EVIDENCE_SCHEMA: 'ventus_evidence',
      },
    });
    const databaseSecretArn = this.formatArn({
      service: 'secretsmanager',
      resource: 'secret',
      resourceName: `${DATABASE_SECRET_ID}*`,
      arnFormat: cdk.ArnFormat.COLON_RESOURCE_NAME,
    });
    migrator.addToRolePolicy(new iam.PolicyStatement({
      actions: ['secretsmanager:GetSecretValue'],
      resources: [databaseSecretArn],
    }));
    runtimeSecret.grantRead(migrator);
    migrator.addToRolePolicy(new iam.PolicyStatement({
      actions: ['kms:Decrypt', 'kms:DescribeKey'],
      resources: [databaseSecretsKey.keyArn],
      conditions: {
        StringEquals: {
          'kms:ViaService': 'secretsmanager.us-east-2.amazonaws.com',
          'kms:CallerAccount': this.account,
        },
      },
    }));

    new cdk.CfnOutput(this, 'EvidenceStoreMigratorFunctionName', {
      value: migrator.functionName,
    });
    new cdk.CfnOutput(this, 'EvidenceStoreRuntimeSecretName', {
      value: runtimeSecret.secretName,
    });
    new cdk.CfnOutput(this, 'EvidenceStoreSchemaName', {
      value: 'ventus_evidence',
    });
  }
}
