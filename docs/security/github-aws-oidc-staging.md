# GitHub AWS OIDC For Staging

This guide wires GitHub Actions to AWS without long-lived access keys. The workflow is review-first: it runs `cdk diff` automatically and only deploys when manually dispatched with the `staging` environment approval.

## GitHub Settings

Create a repository variable:

- Name: `AWS_STAGING_DEPLOY_ROLE_ARN`
- Value: the IAM role ARN GitHub should assume for staging CDK work, for example `arn:aws:iam::373633008995:role/monitor`

Create a GitHub environment named `staging` and add required reviewers before deployment is allowed.

## IAM Trust Policy

Use this trust policy for the AWS role that GitHub Actions will assume. It allows this repository to request short-lived credentials for pull request diffs, branch diffs, and the protected `staging` environment.

The machine-readable copy lives at `infra/iam/github-oidc-trust-policy.json`.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::373633008995:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": [
            "repo:VentusCard/ventus-ai:pull_request",
            "repo:VentusCard/ventus-ai:ref:refs/heads/main",
            "repo:VentusCard/ventus-ai:ref:refs/heads/dev",
            "repo:VentusCard/ventus-ai:ref:refs/heads/staging",
            "repo:VentusCard/ventus-ai:environment:staging"
          ]
        }
      }
    }
  ]
}
```

If the OIDC provider does not exist yet, create it in IAM:

- Provider URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`

## Minimum Role Shape

The staging role needs enough permission to synthesize, diff, and deploy the reviewed isolated stacks. In practice that means permissions for:

- CloudFormation stack read/write for `VentusExistingInfraStack`,
  `VentusEvidenceStoreStack`, `VentusDemoConnectorsStack`, and
  `VentusIdentityStack`
- CDK bootstrap asset bucket read/write
- Lambda create/update for `ventus-stuck-job-monitor`
- IAM role/policy creation for the monitor Lambda execution role
- EventBridge rule/target creation for the monitor schedule
- SNS topic/subscription management for backend alerts
- CloudWatch alarm and metric filter management
- EC2 describe calls for VPC/subnet/security group references
- SSM read for CDK bootstrap version metadata

Before production use, tighten the policy to exact resource ARNs where AWS supports it. Keep this role separate from any human admin role.

## Starting Inline Policy

Use this as a starting point for the staging GitHub role. It is intentionally scoped to the current CDK stack, CDK asset bucket, monitor Lambda, alert topic, EventBridge rule, CloudWatch alarms, and existing Ventus Lambda log groups.

The machine-readable copy lives at `infra/iam/github-staging-deploy-policy.json`.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "CloudFormationVentusStack",
      "Effect": "Allow",
      "Action": [
        "cloudformation:CreateChangeSet",
        "cloudformation:CreateStack",
        "cloudformation:DeleteChangeSet",
        "cloudformation:DeleteStack",
        "cloudformation:DescribeChangeSet",
        "cloudformation:DescribeStackEvents",
        "cloudformation:DescribeStacks",
        "cloudformation:ExecuteChangeSet",
        "cloudformation:GetTemplate",
        "cloudformation:GetTemplateSummary",
        "cloudformation:UpdateStack"
      ],
      "Resource": [
        "arn:aws:cloudformation:us-east-2:373633008995:stack/VentusExistingInfraStack/*",
        "arn:aws:cloudformation:us-east-2:373633008995:stack/VentusEvidenceStoreStack/*",
        "arn:aws:cloudformation:us-east-2:373633008995:stack/VentusDemoConnectorsStack/*",
        "arn:aws:cloudformation:us-east-2:373633008995:stack/VentusIdentityStack/*"
      ]
    },
    {
      "Sid": "CdkBootstrapAssets",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::cdk-hnb659fds-assets-373633008995-us-east-2",
        "arn:aws:s3:::cdk-hnb659fds-assets-373633008995-us-east-2/*"
      ]
    },
    {
      "Sid": "CdkBootstrapMetadata",
      "Effect": "Allow",
      "Action": "ssm:GetParameter",
      "Resource": "arn:aws:ssm:us-east-2:373633008995:parameter/cdk-bootstrap/hnb659fds/version"
    },
    {
      "Sid": "MonitorLambda",
      "Effect": "Allow",
      "Action": [
        "lambda:AddPermission",
        "lambda:CreateFunction",
        "lambda:DeleteFunction",
        "lambda:GetFunction",
        "lambda:GetFunctionConfiguration",
        "lambda:RemovePermission",
        "lambda:TagResource",
        "lambda:UntagResource",
        "lambda:UpdateFunctionCode",
        "lambda:UpdateFunctionConfiguration"
      ],
      "Resource": "arn:aws:lambda:us-east-2:373633008995:function:ventus-stuck-job-monitor"
    },
    {
      "Sid": "MonitorExecutionRole",
      "Effect": "Allow",
      "Action": [
        "iam:AttachRolePolicy",
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:DeleteRolePolicy",
        "iam:DetachRolePolicy",
        "iam:GetRole",
        "iam:GetRolePolicy",
        "iam:ListRolePolicies",
        "iam:PassRole",
        "iam:PutRolePolicy",
        "iam:TagRole",
        "iam:UntagRole"
      ],
      "Resource": "arn:aws:iam::373633008995:role/VentusExistingInfraStack-*"
    },
    {
      "Sid": "AlertTopic",
      "Effect": "Allow",
      "Action": [
        "sns:CreateTopic",
        "sns:DeleteTopic",
        "sns:GetTopicAttributes",
        "sns:SetTopicAttributes",
        "sns:Subscribe",
        "sns:TagResource",
        "sns:Unsubscribe",
        "sns:UntagResource"
      ],
      "Resource": "arn:aws:sns:us-east-2:373633008995:ventus-backend-alerts"
    },
    {
      "Sid": "EventBridgeMonitorSchedule",
      "Effect": "Allow",
      "Action": [
        "events:DeleteRule",
        "events:DescribeRule",
        "events:PutRule",
        "events:PutTargets",
        "events:RemoveTargets",
        "events:TagResource",
        "events:UntagResource"
      ],
      "Resource": "arn:aws:events:us-east-2:373633008995:rule/ventus-stuck-job-monitor-every-5-minutes"
    },
    {
      "Sid": "CloudWatchAlarms",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:DeleteAlarms",
        "cloudwatch:DescribeAlarms",
        "cloudwatch:PutMetricAlarm",
        "cloudwatch:TagResource",
        "cloudwatch:UntagResource"
      ],
      "Resource": "arn:aws:cloudwatch:us-east-2:373633008995:alarm:ventus-*-readiness-*"
    },
    {
      "Sid": "CostGuardrails",
      "Effect": "Allow",
      "Action": [
        "ce:CreateAnomalyMonitor",
        "ce:CreateAnomalySubscription",
        "ce:DeleteAnomalyMonitor",
        "ce:DeleteAnomalySubscription",
        "ce:GetAnomalyMonitors",
        "ce:GetAnomalySubscriptions",
        "ce:ListTagsForResource",
        "ce:TagResource",
        "ce:UntagResource",
        "ce:UpdateAnomalyMonitor",
        "ce:UpdateAnomalySubscription"
      ],
      "Resource": "*"
    },
    {
      "Sid": "VentusLambdaLogMetricFilters",
      "Effect": "Allow",
      "Action": [
        "logs:DeleteMetricFilter",
        "logs:DescribeMetricFilters",
        "logs:PutMetricFilter"
      ],
      "Resource": "arn:aws:logs:us-east-2:373633008995:log-group:/aws/lambda/ventus-*"
    },
    {
      "Sid": "NetworkReadOnly",
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeSecurityGroups",
        "ec2:DescribeSubnets",
        "ec2:DescribeVpcs"
      ],
      "Resource": "*"
    }
  ]
}
```

If the first `cdk diff` reports a missing permission, add only the specific action/resource required by that diff and keep the role staging-only.

## Workflow Controls

The workflow lives at `.github/workflows/infra-staging.yml`.

It can:

- Run `cdk diff` on relevant pull requests.
- Run `cdk diff` manually through `workflow_dispatch`.
- Use a template-only diff for an undeployed stack so review does not create an empty
  `REVIEW_IN_PROGRESS` CloudFormation stack.
- Deploy only when manually dispatched with:
  - `action`: `deploy`
  - `confirm_deploy`: `deploy-staging`
  - approval from the `staging` GitHub environment

Use `docs/runbooks/cdk-deployment-review-checklist.md` before approving any deployment.
