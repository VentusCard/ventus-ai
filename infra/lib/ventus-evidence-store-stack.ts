import * as cdk from 'aws-cdk-lib';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';

/**
 * Retirement shell for the Evidence Store migrator.
 *
 * The existing runtime secret and migrator log group retain their construct and
 * physical names for a reviewed rollback. No migration Lambda or database
 * access policy remains, so this shell cannot mutate the evidence database.
 */
export class VentusEvidenceStoreStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const databaseSecretsKey = kms.Alias.fromAliasName(
      this,
      'ExistingDatabaseSecretsKey',
      'alias/ventus/database-secrets',
    );

    const runtimeSecret = new secretsmanager.Secret(this, 'VentusEvidenceAppV1Secret', {
      secretName: 'ventus/evidence-store/app-v1',
      description: 'Generated credentials for the non-bypass Ventus evidence-store runtime role.',
      encryptionKey: databaseSecretsKey,
      generateSecretString: {
        secretStringTemplate: JSON.stringify({ username: 'ventus_evidence_app_v1' }),
        generateStringKey: 'password',
        passwordLength: 40,
        excludePunctuation: true,
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    cdk.Tags.of(runtimeSecret).add('System', 'Ventus');
    cdk.Tags.of(runtimeSecret).add('SecretClass', 'database_credentials');
    cdk.Tags.of(runtimeSecret).add('Environment', 'staging');

    new logs.LogGroup(this, 'VentusEvidenceStoreMigratorLogGroup', {
      logGroupName: '/aws/lambda/ventus-evidence-store-migrator',
      retention: logs.RetentionDays.SIX_MONTHS,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    new cdk.CfnOutput(this, 'EvidenceStoreRuntimeSecretName', {
      value: runtimeSecret.secretName,
    });
    new cdk.CfnOutput(this, 'EvidenceStoreSchemaName', {
      value: 'ventus_evidence',
    });
  }
}
