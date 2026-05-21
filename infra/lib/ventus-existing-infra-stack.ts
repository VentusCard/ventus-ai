import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as ce from 'aws-cdk-lib/aws-ce';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as cloudwatchActions from 'aws-cdk-lib/aws-cloudwatch-actions';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as events from 'aws-cdk-lib/aws-events';
import * as targets from 'aws-cdk-lib/aws-events-targets';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import { Construct } from 'constructs';

/**
 * CDK skeleton for documenting/importing existing production resources.
 *
 * This stack imports existing production-adjacent resources by identifier and
 * adds non-invasive readiness monitoring around them.
 */
export class VentusExistingInfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    this.templateOptions.transforms = ['AWS::Serverless-2016-10-31'];

    const resources = {
      apiGatewayRestApiId: '97rgw0xjbj',
      apiGatewayName: 'ventus-api',
      apiGatewayStage: 'prod',
      customDomain: 'api.ventusai.com',
      databaseClusterIdentifier: 'ventus-bofa-cluster',
      databaseName: 'ventus_bofa',
      databaseKmsAliasName: 'alias/ventus/database-secrets',
      databaseSecretId:
        'rds-db-credentials/cluster-YOWTEC3WNTPF6ARWDMCUJGSOL4/ventusadmin/1771815186022',
      databaseSecretRotationFunctionName: 'ventus-db-credential-rotation',
      databaseSecretRotationApplicationId:
        'arn:aws:serverlessrepo:us-east-1:297356227824:applications/SecretsManagerRDSPostgreSQLRotationSingleUser',
      vpcId: 'vpc-0d4cf689a4fed7f31',
      vpcAvailabilityZones: ['us-east-2a', 'us-east-2b'],
      lambdaSubnetIds: ['subnet-057aa09eef4545099', 'subnet-00958cfa806e7e363'],
      databaseSubnetIds: [
        'subnet-00958cfa806e7e363',
        'subnet-05619f8f94e7ecea4',
        'subnet-0cf2868a82643d032',
        'subnet-057aa09eef4545099',
      ],
      databaseSecurityGroupId: 'sg-08836ed15d778ecd6',
      s3UploadBucket: 'ventus-te-pilot',
      lambdaFunctions: [
        'ventus-api',
        'ventus-ingest-transactions',
        'ventus-classify-transactions',
        'ventus-analyze-pillar-transactions',
        'ventus-analyze-lifestyle-signals',
        'ventus-risk-detection',
        'ventus-travel-detection',
      ],
      queues: [
        'ventus-classify-queue',
        'ventus-pillar-queue',
        'ventus-lifestyle-queue',
        'ventus-risk-queue',
        'ventus-travel-queue',
      ],
    };

    const alertTopic = new sns.Topic(this, 'VentusBackendAlertsTopic', {
      topicName: 'ventus-backend-alerts',
      displayName: 'Ventus Backend Alerts',
    });
    const alertEmail = this.node.tryGetContext('alertEmail');
    if (typeof alertEmail === 'string' && alertEmail.length > 0) {
      alertTopic.addSubscription(new subscriptions.EmailSubscription(alertEmail));
    }
    const anomalyImpactThresholdUsd = positiveNumberContext(this, 'anomalyImpactThresholdUsd', 50);
    const enableDbRotationLambda = booleanContext(this, 'enableDbRotationLambda', false);
    const backendLogRetention = logs.RetentionDays.SIX_MONTHS;
    const alertAction = new cloudwatchActions.SnsAction(alertTopic);
    const withAlertAction = (alarm: cloudwatch.Alarm) => {
      alarm.addAlarmAction(alertAction);
      return alarm;
    };

    const existingVpc = ec2.Vpc.fromVpcAttributes(this, 'ExistingVentusVpc', {
      vpcId: resources.vpcId,
      availabilityZones: resources.vpcAvailabilityZones,
      privateSubnetIds: resources.databaseSubnetIds,
    });
    const monitorSubnets = resources.lambdaSubnetIds.map((subnetId) =>
      ec2.Subnet.fromSubnetId(this, `${toId(subnetId)}Subnet`, subnetId)
    );
    const databaseSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      'ExistingDatabaseSecurityGroup',
      resources.databaseSecurityGroupId,
      {
        mutable: false,
      }
    );

    new cdk.CfnOutput(this, 'CurrentApiGatewayRestApiId', {
      value: resources.apiGatewayRestApiId,
    });

    new cdk.CfnOutput(this, 'CurrentApiGatewayName', {
      value: resources.apiGatewayName,
    });

    new cdk.CfnOutput(this, 'CurrentApiGatewayStage', {
      value: resources.apiGatewayStage,
    });

    new cdk.CfnOutput(this, 'CurrentCustomDomain', {
      value: resources.customDomain,
    });

    new cdk.CfnOutput(this, 'CurrentDatabaseClusterIdentifier', {
      value: resources.databaseClusterIdentifier,
    });

    new cdk.CfnOutput(this, 'CurrentDatabaseName', {
      value: resources.databaseName,
    });

    new cdk.CfnOutput(this, 'CurrentDatabaseSecretId', {
      value: resources.databaseSecretId,
    });

    new cdk.CfnOutput(this, 'CurrentDatabaseSecretRotationFunctionName', {
      value: resources.databaseSecretRotationFunctionName,
    });

    new cdk.CfnOutput(this, 'CurrentVpcId', {
      value: resources.vpcId,
    });

    new cdk.CfnOutput(this, 'CurrentLambdaSubnetIds', {
      value: resources.lambdaSubnetIds.join(','),
    });

    new cdk.CfnOutput(this, 'CurrentDatabaseSecurityGroupId', {
      value: resources.databaseSecurityGroupId,
    });

    new cdk.CfnOutput(this, 'CurrentS3UploadBucket', {
      value: resources.s3UploadBucket,
    });

    new cdk.CfnOutput(this, 'CurrentLambdaFunctions', {
      value: resources.lambdaFunctions.join(','),
    });

    new cdk.CfnOutput(this, 'CurrentQueues', {
      value: resources.queues.join(','),
    });

    new cdk.CfnOutput(this, 'BackendAlertsTopicArn', {
      value: alertTopic.topicArn,
    });

    const costAnomalyEmailSubscribers =
      typeof alertEmail === 'string' && alertEmail.length > 0
        ? [
            {
              type: 'EMAIL',
              address: alertEmail,
            },
          ]
        : [];

    const costAnomalyMonitor = new ce.CfnAnomalyMonitor(this, 'VentusServiceCostAnomalyMonitor', {
      monitorName: 'ventus-service-cost-anomaly-monitor',
      monitorType: 'DIMENSIONAL',
      monitorDimension: 'SERVICE',
      resourceTags: [
        {
          key: 'Application',
          value: 'Ventus',
        },
        {
          key: 'Control',
          value: 'CostGuardrail',
        },
      ],
    });

    if (costAnomalyEmailSubscribers.length > 0) {
      new ce.CfnAnomalySubscription(this, 'VentusCostAnomalySubscription', {
        subscriptionName: 'ventus-cost-anomaly-alerts',
        frequency: 'DAILY',
        monitorArnList: [costAnomalyMonitor.ref],
        thresholdExpression: JSON.stringify({
          Dimensions: {
            Key: 'ANOMALY_TOTAL_IMPACT_ABSOLUTE',
            MatchOptions: ['GREATER_THAN_OR_EQUAL'],
            Values: [String(anomalyImpactThresholdUsd)],
          },
        }),
        subscribers: costAnomalyEmailSubscribers,
        resourceTags: [
          {
            key: 'Application',
            value: 'Ventus',
          },
          {
            key: 'Control',
            value: 'CostGuardrail',
          },
        ],
      });
    }

    new cdk.CfnOutput(this, 'ServiceCostAnomalyMonitorArn', {
      value: costAnomalyMonitor.attrMonitorArn,
    });

    if (enableDbRotationLambda) {
      const databaseKmsKeyArn = cdk.Stack.of(this).formatArn({
        service: 'kms',
        resource: 'alias',
        resourceName: resources.databaseKmsAliasName.slice('alias/'.length),
        arnFormat: cdk.ArnFormat.SLASH_RESOURCE_NAME,
      });

      new cdk.CfnResource(this, 'VentusDatabaseSecretRotationLambda', {
        type: 'AWS::Serverless::Application',
        properties: {
          Location: {
            ApplicationId: resources.databaseSecretRotationApplicationId,
            SemanticVersion: '1.1.667',
          },
          Parameters: {
            endpoint: `https://secretsmanager.${cdk.Stack.of(this).region}.amazonaws.com`,
            functionName: resources.databaseSecretRotationFunctionName,
            kmsKeyArn: databaseKmsKeyArn,
            vpcSecurityGroupIds: resources.databaseSecurityGroupId,
            vpcSubnetIds: resources.lambdaSubnetIds.join(','),
            excludeCharacters: ':/@"\'\\',
            passwordLength: '32',
            requireEachIncludedType: 'true',
          },
          Tags: {
            Application: 'Ventus',
            Control: 'SecretsRotation',
            Owner: 'platform',
          },
        },
      });
    }

    for (const functionName of resources.lambdaFunctions) {
      new logs.LogRetention(this, `${toId(functionName)}LogRetention`, {
        logGroupName: `/aws/lambda/${functionName}`,
        retention: backendLogRetention,
        removalPolicy: cdk.RemovalPolicy.RETAIN,
      });

      const errorMetric = new cloudwatch.Metric({
        namespace: 'AWS/Lambda',
        metricName: 'Errors',
        dimensionsMap: {
          FunctionName: functionName,
        },
        statistic: 'Sum',
        period: cdk.Duration.minutes(5),
      });

      withAlertAction(new cloudwatch.Alarm(this, `${toId(functionName)}ErrorsAlarm`, {
        alarmName: readinessAlarmName(functionName, 'errors'),
        alarmDescription: `Ventus backend Lambda ${functionName} reported errors.`,
        metric: errorMetric,
        threshold: 1,
        evaluationPeriods: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }));

      const durationMetric = new cloudwatch.Metric({
        namespace: 'AWS/Lambda',
        metricName: 'Duration',
        dimensionsMap: {
          FunctionName: functionName,
        },
        statistic: 'Maximum',
        period: cdk.Duration.minutes(5),
      });

      withAlertAction(new cloudwatch.Alarm(this, `${toId(functionName)}DurationAlarm`, {
        alarmName: readinessAlarmName(functionName, 'duration-near-timeout'),
        alarmDescription: `Ventus backend Lambda ${functionName} is approaching timeout behavior.`,
        metric: durationMetric,
        threshold: functionName === 'ventus-api' ? 25000 : 270000,
        evaluationPeriods: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }));

      withAlertAction(new cloudwatch.Alarm(this, `${toId(functionName)}ThrottlesAlarm`, {
        alarmName: readinessAlarmName(functionName, 'throttles'),
        alarmDescription: `Ventus backend Lambda ${functionName} reported throttles.`,
        metric: new cloudwatch.Metric({
          namespace: 'AWS/Lambda',
          metricName: 'Throttles',
          dimensionsMap: {
            FunctionName: functionName,
          },
          statistic: 'Sum',
          period: cdk.Duration.minutes(5),
        }),
        threshold: 1,
        evaluationPeriods: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }));
    }

    for (const queueName of resources.queues) {
      const queueAgeMetric = new cloudwatch.Metric({
        namespace: 'AWS/SQS',
        metricName: 'ApproximateAgeOfOldestMessage',
        dimensionsMap: {
          QueueName: queueName,
        },
        statistic: 'Maximum',
        period: cdk.Duration.minutes(5),
      });

      withAlertAction(new cloudwatch.Alarm(this, `${toId(queueName)}OldestMessageAgeAlarm`, {
        alarmName: readinessAlarmName(queueName, 'oldest-message-age'),
        alarmDescription: `Ventus backend queue ${queueName} has an old message and may be stuck.`,
        metric: queueAgeMetric,
        threshold: 600,
        evaluationPeriods: 2,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }));

      const dlqName = `${queueName}-dlq`;
      const dlqDepthMetric = new cloudwatch.Metric({
        namespace: 'AWS/SQS',
        metricName: 'ApproximateNumberOfMessagesVisible',
        dimensionsMap: {
          QueueName: dlqName,
        },
        statistic: 'Maximum',
        period: cdk.Duration.minutes(5),
      });

      withAlertAction(new cloudwatch.Alarm(this, `${toId(dlqName)}DepthAlarm`, {
        alarmName: readinessAlarmName(dlqName, 'visible-messages'),
        alarmDescription: `Ventus backend DLQ ${dlqName} has messages requiring triage.`,
        metric: dlqDepthMetric,
        threshold: 1,
        evaluationPeriods: 1,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      }));
    }

    const apiMetricDimensions = {
      ApiName: resources.apiGatewayName,
      Stage: resources.apiGatewayStage,
    };
    const databaseMetricDimensions = {
      DBClusterIdentifier: resources.databaseClusterIdentifier,
    };

    withAlertAction(new cloudwatch.Alarm(this, 'VentusApi5xxAlarm', {
      alarmName: readinessAlarmName('ventus-api', '5xx'),
      alarmDescription: 'Ventus API Gateway returned 5xx responses.',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ApiGateway',
        metricName: '5XXError',
        dimensionsMap: apiMetricDimensions,
        statistic: 'Sum',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }));

    withAlertAction(new cloudwatch.Alarm(this, 'VentusApiLatencyAlarm', {
      alarmName: readinessAlarmName('ventus-api', 'latency-p95'),
      alarmDescription: 'Ventus API Gateway p95 latency breached the pilot-readiness threshold.',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/ApiGateway',
        metricName: 'Latency',
        dimensionsMap: apiMetricDimensions,
        statistic: 'p95',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 3000,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }));

    new apigateway.CfnUsagePlan(this, 'VentusPilotUsagePlan', {
      usagePlanName: 'ventus-api-pilot-readiness-plan',
      description:
        'Pilot readiness usage plan for approved Ventus API clients. API keys can be associated after client onboarding approval.',
      apiStages: [
        {
          apiId: resources.apiGatewayRestApiId,
          stage: resources.apiGatewayStage,
        },
      ],
      throttle: {
        rateLimit: 25,
        burstLimit: 50,
      },
      quota: {
        limit: 100000,
        period: 'MONTH',
      },
      tags: [
        {
          key: 'Application',
          value: 'Ventus',
        },
        {
          key: 'Control',
          value: 'ApiThrottling',
        },
      ],
    });

    withAlertAction(new cloudwatch.Alarm(this, 'VentusDatabaseCpuAlarm', {
      alarmName: readinessAlarmName(resources.databaseClusterIdentifier, 'cpu-high'),
      alarmDescription: 'Ventus Aurora cluster CPU utilization is high.',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/RDS',
        metricName: 'CPUUtilization',
        dimensionsMap: databaseMetricDimensions,
        statistic: 'Average',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 80,
      evaluationPeriods: 3,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }));

    withAlertAction(new cloudwatch.Alarm(this, 'VentusDatabaseConnectionsAlarm', {
      alarmName: readinessAlarmName(resources.databaseClusterIdentifier, 'connections-high'),
      alarmDescription: 'Ventus Aurora cluster database connections are elevated.',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/RDS',
        metricName: 'DatabaseConnections',
        dimensionsMap: databaseMetricDimensions,
        statistic: 'Maximum',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 80,
      evaluationPeriods: 3,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }));

    withAlertAction(new cloudwatch.Alarm(this, 'VentusDatabaseFreeLocalStorageAlarm', {
      alarmName: readinessAlarmName(resources.databaseClusterIdentifier, 'free-local-storage-low'),
      alarmDescription: 'Ventus Aurora cluster free local storage is low.',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/RDS',
        metricName: 'FreeLocalStorage',
        dimensionsMap: databaseMetricDimensions,
        statistic: 'Minimum',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 5 * 1024 * 1024 * 1024,
      evaluationPeriods: 3,
      comparisonOperator: cloudwatch.ComparisonOperator.LESS_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }));

    withAlertAction(new cloudwatch.Alarm(this, 'VentusDatabaseReplicaLagAlarm', {
      alarmName: readinessAlarmName(resources.databaseClusterIdentifier, 'replica-lag-high'),
      alarmDescription: 'Ventus Aurora cluster replica lag is elevated.',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/RDS',
        metricName: 'AuroraReplicaLagMaximum',
        dimensionsMap: databaseMetricDimensions,
        statistic: 'Maximum',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 30000,
      evaluationPeriods: 2,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }));

    withAlertAction(new cloudwatch.Alarm(this, 'VentusDatabaseVolumeBytesUsedAlarm', {
      alarmName: readinessAlarmName(resources.databaseClusterIdentifier, 'volume-bytes-used-high'),
      alarmDescription: 'Ventus Aurora cluster volume bytes used crossed the pilot-readiness threshold.',
      metric: new cloudwatch.Metric({
        namespace: 'AWS/RDS',
        metricName: 'VolumeBytesUsed',
        dimensionsMap: databaseMetricDimensions,
        statistic: 'Maximum',
        period: cdk.Duration.hours(1),
      }),
      threshold: 80 * 1024 * 1024 * 1024,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }));

    const workerLogGroups = resources.lambdaFunctions
      .filter((functionName) => functionName !== 'ventus-api')
      .map((functionName) =>
        logs.LogGroup.fromLogGroupName(
          this,
          `${toId(functionName)}LogGroup`,
          `/aws/lambda/${functionName}`
        )
      );

    for (const logGroup of workerLogGroups) {
      new logs.MetricFilter(this, `${toId(logGroup.logGroupName)}WebhookFailureMetric`, {
        logGroup,
        metricNamespace: 'Ventus/Pipeline',
        metricName: 'WebhookDeliveryFailures',
        filterPattern: logs.FilterPattern.literal('"[WEBHOOK] Failed after"'),
        metricValue: '1',
      });
    }

    withAlertAction(new cloudwatch.Alarm(this, 'VentusWebhookFailuresAlarm', {
      alarmName: readinessAlarmName('ventus-webhook', 'delivery-failures'),
      alarmDescription: 'Ventus webhook delivery failures appeared in worker logs.',
      metric: new cloudwatch.Metric({
        namespace: 'Ventus/Pipeline',
        metricName: 'WebhookDeliveryFailures',
        statistic: 'Sum',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }));

    const stuckJobMonitor = new lambda.Function(this, 'VentusStuckJobMonitor', {
      functionName: 'ventus-stuck-job-monitor',
      description: 'Scheduled monitor for Ventus pipeline runs that exceed the stuck-job SLA.',
      runtime: lambda.Runtime.NODEJS_20_X,
      architecture: lambda.Architecture.ARM_64,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('../backend/dist/monitors/stuck-job-monitor.zip'),
      vpc: existingVpc,
      vpcSubnets: {
        subnets: monitorSubnets,
      },
      securityGroups: [databaseSecurityGroup],
      memorySize: 256,
      timeout: cdk.Duration.minutes(1),
      environment: {
        VENTUS_ENVIRONMENT: 'staging',
        RDS_SECRET_ID: resources.databaseSecretId,
        RDS_DATABASE: resources.databaseName,
        SNS_TOPIC_ARN: alertTopic.topicArn,
        STUCK_JOB_SLA_MINUTES: '20',
      },
    });
    new logs.LogRetention(this, 'VentusStuckJobMonitorLogRetention', {
      logGroupName: '/aws/lambda/ventus-stuck-job-monitor',
      retention: backendLogRetention,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
    const databaseSecretArn = cdk.Stack.of(this).formatArn({
      service: 'secretsmanager',
      resource: 'secret',
      resourceName: `${resources.databaseSecretId}*`,
      arnFormat: cdk.ArnFormat.COLON_RESOURCE_NAME,
    });

    stuckJobMonitor.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['secretsmanager:GetSecretValue'],
        resources: [databaseSecretArn],
      })
    );
    stuckJobMonitor.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ['cloudwatch:PutMetricData'],
        resources: ['*'],
        conditions: {
          StringEquals: {
            'cloudwatch:namespace': 'Ventus/Pipeline',
          },
        },
      })
    );
    alertTopic.grantPublish(stuckJobMonitor);

    new events.Rule(this, 'VentusStuckJobMonitorSchedule', {
      ruleName: 'ventus-stuck-job-monitor-every-5-minutes',
      description: 'Runs the Ventus stuck-job monitor every five minutes.',
      schedule: events.Schedule.rate(cdk.Duration.minutes(5)),
      targets: [new targets.LambdaFunction(stuckJobMonitor)],
    });

    withAlertAction(new cloudwatch.Alarm(this, 'VentusStuckPipelineRunsAlarm', {
      alarmName: readinessAlarmName('ventus-stuck-pipeline', 'runs'),
      alarmDescription: 'Ventus pipeline runs exceeded the stuck-job SLA.',
      metric: new cloudwatch.Metric({
        namespace: 'Ventus/Pipeline',
        metricName: 'StuckPipelineRuns',
        dimensionsMap: {
          Environment: 'staging',
        },
        statistic: 'Maximum',
        period: cdk.Duration.minutes(5),
      }),
      threshold: 1,
      evaluationPeriods: 1,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    }));
  }
}

function toId(value: string): string {
  return value
    .split(/[^A-Za-z0-9]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function readinessAlarmName(resourceName: string, signalName: string): string {
  return `${resourceName}-readiness-${signalName}`;
}

function positiveNumberContext(scope: Construct, key: string, defaultValue: number): number {
  const value = scope.node.tryGetContext(key);
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${key} must be a positive number`);
  }

  return parsed;
}

function booleanContext(scope: Construct, key: string, defaultValue: boolean): boolean {
  const value = scope.node.tryGetContext(key);
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }
  if (value === true || value === 'true') {
    return true;
  }
  if (value === false || value === 'false') {
    return false;
  }

  throw new Error(`${key} must be true or false`);
}
