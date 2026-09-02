import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cwActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { SnsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as ses from 'aws-cdk-lib/aws-ses';
import * as sesActions from 'aws-cdk-lib/aws-ses-actions';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

/**
 * AI Coworker subsystem.
 *
 * IMPORTANT: SES inbound email receiving is only available in a subset of
 * regions (us-east-1, us-west-2, eu-west-1, ...). The production pipeline lives
 * in us-east-2, which does NOT support SES inbound. The Coworker is an isolated
 * subsystem (its own DynamoDB table, its own Lambdas, no VPC/Aurora dependency),
 * so deploy THIS stack to a SES-inbound-capable region (default us-east-1).
 *
 * Ownership split: this file provisions the resources. Deploys and the manual
 * SES steps (verify the domain, publish MX + DKIM DNS, move out of the SES
 * sandbox) are handled by the operator / CI.
 */
export interface VentusCoworkerStackProps extends cdk.StackProps {
  /** Email domain the Coworker receives on and sends from. */
  emailDomain?: string;
  /** Mailbox local-part, e.g. "coworker" -> coworker@<domain>. */
  mailboxLocalPart?: string;
  /**
   * Override the outbound "From" address, decoupling it from the receive domain.
   * Lets the coworker RECEIVE on a demo subdomain (SES MX) while REPLYING from
   * the real root address (e.g. receive coworker@demo.ventusai.com, reply
   * coworker@ventusai.com). Requires the From domain verified for sending in SES.
   * Defaults to `${mailbox}@${emailDomain}`.
   */
  fromAddress?: string;
  /** Secrets Manager id holding model provider API keys. */
  modelProviderSecretId?: string;
  /** Provision the SES receipt rule set (requires a SES-inbound region + verified domain). */
  enableSesInbound?: boolean;
  /** Cron/rate for the proactive digest. Defaults to daily at 12:00 UTC. */
  digestSchedule?: events.Schedule;
  /** Email address to notify when the inbound Lambda errors or the DLQ fills. */
  alertEmail?: string;
}

export class VentusCoworkerStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: VentusCoworkerStackProps = {}) {
    super(scope, id, props);

    const emailDomain = props.emailDomain ?? 'ventusai.com';
    const mailbox = props.mailboxLocalPart ?? 'coworker';
    // The address SES receives on (drives the receipt rule + MX expectation).
    const recipientAddress = `${mailbox}@${emailDomain}`;
    // The address the coworker replies from. Defaults to the recipient, but can
    // be overridden to reply from a verified root address while receiving on a
    // subdomain (see `fromAddress` prop).
    const fromAddress = props.fromAddress ?? recipientAddress;
    // SES configuration set: all outbound goes through it so bounces/complaints
    // are tracked and routed (required now that the account is out of the sandbox).
    const configSetName = 'ventus-coworker';
    const modelProviderSecretId =
      props.modelProviderSecretId ??
      (this.node.tryGetContext('modelProviderSecretId') as string | undefined) ??
      'ventus/model-providers/gemini';
    const enableSesInbound =
      props.enableSesInbound ?? booleanContext(this, 'enableCoworkerSesInbound', true);
    // Daily, not weekly. The digest carries an outreach window ("next 14
    // days"), and a window recalculated once a week is stale for six of them.
    // 12:00 UTC lands early morning across US business hours, which is when an
    // advisor plans their day. The row-quality rules in buildAdvisorDigest are
    // what make a daily cadence survivable: on a day with nothing worth saying
    // it sends nothing rather than padding the table.
    const digestSchedule =
      props.digestSchedule ?? events.Schedule.cron({ hour: '12', minute: '0' });

    // ── State: single DynamoDB table ─────────────────────────────────────────
    const table = new dynamodb.Table(this, 'CoworkerTable', {
      tableName: 'ventus-coworker',
      partitionKey: { name: 'PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SK', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    // GSI for "all tasks of type X in status Y" queries (flag queue, metrics).
    table.addGlobalSecondaryIndex({
      indexName: 'GSI1',
      partitionKey: { name: 'GSI1PK', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'GSI1SK', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    // ── Inbound MIME storage + notification fan-out ──────────────────────────
    const inboundBucket = new s3.Bucket(this, 'CoworkerInboundBucket', {
      // Region-scoped so the same account can host the stack in more than one
      // region (S3 bucket names are globally unique). Inbound lives in us-east-1.
      bucketName: `ventus-coworker-inbound-${this.account}-${this.region}`,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      lifecycleRules: [{ expiration: cdk.Duration.days(90) }],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    const inboundPrefix = 'inbound/';

    const inboundTopic = new sns.Topic(this, 'CoworkerInboundTopic', {
      topicName: 'ventus-coworker-inbound',
      displayName: 'Ventus Coworker Inbound Mail',
    });

    const inboundDlq = new sqs.Queue(this, 'CoworkerInboundDlq', {
      queueName: 'ventus-coworker-inbound-dlq',
      retentionPeriod: cdk.Duration.days(14),
    });

    // ── Lambdas ──────────────────────────────────────────────────────────────
    const commonEnv = {
      COWORKER_TABLE: table.tableName,
      COWORKER_FROM: fromAddress,
      COWORKER_CONFIG_SET: configSetName,
      MODEL_PROVIDER_SECRET_ID: modelProviderSecretId,
    };

    const inboundFn = new lambda.Function(this, 'CoworkerInboundFn', {
      functionName: 'ventus-coworker-inbound',
      description: 'Inbound AI Coworker: SES receipt -> agent turn -> SES reply.',
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../backend/dist/lambda/ventus-coworker-inbound.zip'),
      memorySize: 512,
      timeout: cdk.Duration.seconds(60),
      environment: {
        ...commonEnv,
        COWORKER_INBOUND_BUCKET: inboundBucket.bucketName,
        COWORKER_INBOUND_PREFIX: inboundPrefix,
        // Smoke-test mode: skip SES send and return the rendered reply. Defaults
        // on until a SES sending identity is verified; disable with
        // -c coworkerDryRun=false.
        COWORKER_DRY_RUN: String(booleanContext(this, 'coworkerDryRun', true)),
        // Demo mode: reply to any sender (not just allowlisted advisors) as a
        // synthetic advisor over the full demo book. Off by default; enable for a
        // public-facing demo with -c coworkerDemoOpen=true.
        COWORKER_DEMO_OPEN: String(booleanContext(this, 'coworkerDemoOpen', false)),
      },
      deadLetterQueue: inboundDlq,
      retryAttempts: 2,
    });
    inboundFn.addEventSource(new SnsEventSource(inboundTopic));

    const digestFn = new lambda.Function(this, 'CoworkerDigestFn', {
      functionName: 'ventus-coworker-digest',
      description: 'Scheduled AI Coworker digest: proactive per-advisor opportunity emails.',
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../backend/dist/lambda/ventus-coworker-digest.zip'),
      memorySize: 512,
      timeout: cdk.Duration.minutes(2),
      environment: { ...commonEnv, COWORKER_DIGEST_MAX_ITEMS: '5' },
    });

    for (const fn of [inboundFn, digestFn]) {
      new logs.LogRetention(this, `${fn.node.id}LogRetention`, {
        logGroupName: `/aws/lambda/${fn.functionName}`,
        retention: logs.RetentionDays.SIX_MONTHS,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
      });
    }

    // ── IAM (least privilege) ────────────────────────────────────────────────
    table.grantReadWriteData(inboundFn);
    table.grantReadWriteData(digestFn);
    inboundBucket.grantRead(inboundFn);

    const modelSecretArn = cdk.Stack.of(this).formatArn({
      service: 'secretsmanager',
      resource: 'secret',
      resourceName: `${modelProviderSecretId}*`,
      arnFormat: cdk.ArnFormat.COLON_RESOURCE_NAME,
    });
    inboundFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [modelSecretArn],
      })
    );
    // The model-provider secret is encrypted with a customer-managed KMS key
    // (alias/ventus/model-provider-secrets). Reading it requires kms:Decrypt.
    // Scope by ViaService so this only permits decryption through Secrets Manager
    // in this region, avoiding a hard dependency on the key ARN.
    inboundFn.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['kms:Decrypt'],
        resources: ['*'],
        conditions: {
          StringEquals: {
            'kms:ViaService': `secretsmanager.${cdk.Stack.of(this).region}.amazonaws.com`,
          },
        },
      })
    );

    // SES send, scoped to our verified From identity.
    const sesSendPolicy = new iam.PolicyStatement({
      actions: ['ses:SendEmail', 'ses:SendRawEmail'],
      resources: ['*'],
      conditions: { StringEquals: { 'ses:FromAddress': fromAddress } },
    });
    inboundFn.addToRolePolicy(sesSendPolicy);
    digestFn.addToRolePolicy(sesSendPolicy);

    // ── Alerting: DLQ depth + Lambda errors ──────────────────────────────────
    // The inbound function already retries then dead-letters to inboundDlq, but a
    // silent DLQ is a silent outage. Alarm on any dead-lettered message and on
    // function errors so a failing open inbox is noticed during the demo window.
    const alertEmail =
      props.alertEmail ?? (this.node.tryGetContext('coworkerAlertEmail') as string | undefined);
    const alarmTopic = new sns.Topic(this, 'CoworkerAlarmTopic', {
      topicName: 'ventus-coworker-alarms',
      displayName: 'Ventus Coworker Alarms',
    });
    if (alertEmail) {
      alarmTopic.addSubscription(new subscriptions.EmailSubscription(alertEmail));
    }
    const alarmAction = new cwActions.SnsAction(alarmTopic);

    const dlqAlarm = new cloudwatch.Alarm(this, 'CoworkerInboundDlqAlarm', {
      alarmName: 'ventus-coworker-inbound-dlq-not-empty',
      alarmDescription: 'Inbound Coworker messages are dead-lettering (processing failures).',
      metric: inboundDlq.metricApproximateNumberOfMessagesVisible({
        period: cdk.Duration.minutes(5),
        statistic: 'Maximum',
      }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    dlqAlarm.addAlarmAction(alarmAction);

    const errorAlarm = new cloudwatch.Alarm(this, 'CoworkerInboundErrorAlarm', {
      alarmName: 'ventus-coworker-inbound-errors',
      alarmDescription: 'Inbound Coworker Lambda is throwing errors.',
      metric: inboundFn.metricErrors({
        period: cdk.Duration.minutes(5),
        statistic: 'Sum',
      }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    errorAlarm.addAlarmAction(alarmAction);

    // ── SES bounce / complaint handling (required out of the SES sandbox) ─────
    // AWS expects a real process for bounces + complaints once you leave the
    // sandbox. Route every bounce/complaint/reject to a dedicated topic (so we
    // see the actual failing recipients), enable reputation metrics on the
    // configuration set, and alarm before bounce/complaint rates hit the AWS
    // enforcement thresholds. All outbound is sent through this config set.
    const sesEventTopic = new sns.Topic(this, 'CoworkerSesEventsTopic', {
      topicName: 'ventus-coworker-ses-events',
      displayName: 'Ventus Coworker SES Bounces/Complaints',
    });
    if (alertEmail) {
      sesEventTopic.addSubscription(new subscriptions.EmailSubscription(alertEmail));
    }

    const configSet = new ses.ConfigurationSet(this, 'CoworkerConfigSet', {
      configurationSetName: configSetName,
      reputationMetrics: true,
    });
    configSet.addEventDestination('BounceComplaint', {
      destination: ses.EventDestination.snsTopic(sesEventTopic),
      events: [
        ses.EmailSendingEvent.BOUNCE,
        ses.EmailSendingEvent.COMPLAINT,
        ses.EmailSendingEvent.REJECT,
        ses.EmailSendingEvent.DELIVERY_DELAY,
      ],
      enabled: true,
    });

    const bounceRateAlarm = new cloudwatch.Alarm(this, 'CoworkerSesBounceRateAlarm', {
      alarmName: 'ventus-coworker-ses-bounce-rate',
      alarmDescription: 'SES bounce rate for the coworker config set is approaching the AWS limit.',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/SES',
        metricName: 'Reputation.BounceRate',
        dimensionsMap: { 'ses:configuration-set': configSetName },
        period: cdk.Duration.hours(1),
        statistic: 'Maximum',
      }),
      // AWS reviews accounts at 5% and enforces at 10%; alert at 5%.
      threshold: 0.05,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    bounceRateAlarm.addAlarmAction(alarmAction);

    const complaintRateAlarm = new cloudwatch.Alarm(this, 'CoworkerSesComplaintRateAlarm', {
      alarmName: 'ventus-coworker-ses-complaint-rate',
      alarmDescription: 'SES complaint rate for the coworker config set is approaching the AWS limit.',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/SES',
        metricName: 'Reputation.ComplaintRate',
        dimensionsMap: { 'ses:configuration-set': configSetName },
        period: cdk.Duration.hours(1),
        statistic: 'Maximum',
      }),
      // AWS enforces at 0.5%; alert early at 0.1%.
      threshold: 0.001,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });
    complaintRateAlarm.addAlarmAction(alarmAction);

    // ── Schedule the digest ──────────────────────────────────────────────────
    new events.Rule(this, 'CoworkerDigestSchedule', {
      ruleName: 'ventus-coworker-digest-schedule',
      description: 'Triggers the AI Coworker proactive digest, daily at 12:00 UTC.',
      schedule: digestSchedule,
      targets: [new targets.LambdaFunction(digestFn)],
    });

    // ── SES inbound receipt (region-gated) ───────────────────────────────────
    if (enableSesInbound) {
      const ruleSet = new ses.ReceiptRuleSet(this, 'CoworkerReceiptRuleSet', {
        receiptRuleSetName: 'ventus-coworker-rules',
      });
      ruleSet.addRule('CoworkerReceiptRule', {
        recipients: [recipientAddress],
        enabled: true,
        scanEnabled: true,
        actions: [
          new sesActions.S3({ bucket: inboundBucket, objectKeyPrefix: inboundPrefix }),
          new sesActions.Sns({ topic: inboundTopic }),
        ],
      });
      // NOTE: the rule set must be activated and the domain/MX verified out of
      // band. `aws ses set-active-receipt-rule-set --rule-set-name ventus-coworker-rules`.
      new cdk.CfnOutput(this, 'CoworkerReceiptRuleSetName', { value: 'ventus-coworker-rules' });
    }

    // ── Outputs ──────────────────────────────────────────────────────────────
    new cdk.CfnOutput(this, 'CoworkerTableName', { value: table.tableName });
    new cdk.CfnOutput(this, 'CoworkerInboundBucketName', { value: inboundBucket.bucketName });
    new cdk.CfnOutput(this, 'CoworkerInboundTopicArn', { value: inboundTopic.topicArn });
    new cdk.CfnOutput(this, 'CoworkerFromAddress', { value: fromAddress });
    new cdk.CfnOutput(this, 'CoworkerInboundDlqUrl', { value: inboundDlq.queueUrl });
    new cdk.CfnOutput(this, 'CoworkerAlarmTopicArn', { value: alarmTopic.topicArn });
    new cdk.CfnOutput(this, 'CoworkerSesEventsTopicArn', { value: sesEventTopic.topicArn });
    new cdk.CfnOutput(this, 'CoworkerConfigSetName', { value: configSetName });
  }
}

function booleanContext(scope: Construct, key: string, defaultValue: boolean): boolean {
  const value = scope.node.tryGetContext(key);
  if (value === undefined || value === null || value === '') return defaultValue;
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  throw new Error(`${key} must be true or false`);
}
