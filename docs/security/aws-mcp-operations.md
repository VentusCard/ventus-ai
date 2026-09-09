# AWS MCP operations

Ventus uses the AWS-managed MCP Server for controlled operational visibility. It does not give the model administrator access and it never permits the model to read a Secrets Manager value.

## Local setup

The official `aws-core` Agent Toolkit plugin and its `uvx` runtime are installed locally. The plugin connects to the managed AWS MCP endpoint and signs requests with an existing AWS profile.

After the IAM role below exists, add this named profile to `~/.aws/config`:

```ini
[profile ventus-mcp]
role_arn = arn:aws:iam::373633008995:role/VentusMcpOperatorRole
source_profile = ventus-base
region = us-east-2
output = json
role_session_name = ventus-codex-mcp
duration_seconds = 3600
```

Set `AWS_PROFILE=ventus-mcp` for the Codex desktop app and restart Codex so the plugin is reloaded. Verify the first authenticated MCP call with `sts:GetCallerIdentity`; it must return account `373633008995` and role `VentusMcpOperatorRole`.

## One-time AWS administrator action

1. Create `VentusMcpOperatorRole` with a maximum session duration of one hour.
2. Use `infra/iam/ventus-mcp-operator-trust-policy.json` as its trust policy.
3. Attach `infra/iam/ventus-mcp-operator-policy.json` as an inline policy.
4. Confirm CloudTrail is recording the role's calls.

The policy only authorizes calls forwarded by the AWS-managed MCP Server. It can inspect the isolated demo stack, Lambda/API health, secret metadata, Amplify deployment jobs, logs, alarms, and costs. It can start an existing `dev` or `staging` deployment for the canonical Amplify app `d1gaewa028qzng` in `us-east-1`, but not `main`. It cannot create Amplify branches, read Amplify environment variables or secret values, administer IAM, alter DNS, or delete infrastructure.

## Operating split

Once the role is active, Codex can:

- trigger and review the protected GitHub CDK diff/deploy workflow;
- inspect `VentusDemoConnectorsStack` and capture its API output;
- verify Lambda, API Gateway, CloudWatch alarms, and logs;
- check that the demo secret exists and has a current version without reading it;
- inspect deployment jobs or restart an existing Amplify branch deployment without reading its environment variables;
- invoke the private evidence-store migrator in read-only status mode or with its
  exact confirmation-gated migration payload;
- run the Plaid-to-Salesforce smoke test and report evidence;
- monitor AWS spend and anomalies.

AWS Budgets uses the IAM permission `budgets:ViewBudget` for budget read APIs, with `billing:GetBillingViewData` as its documented dependent permission. The policy intentionally grants neither budget modification nor budget-action execution.

An administrator still owns these intentional control points:

- creating or changing IAM roles and policies;
- entering Plaid and Salesforce credential values directly in Secrets Manager;
- approving the protected GitHub `staging` environment when required;
- creating the one-time Amplify `dev` branch connection and configuring its non-secret build variables;
- creating or changing `demo.ventusai.com` DNS and certificate ownership.

These are one-time or high-impact actions, not recurring engineering work. After they are complete, routine deployment, verification, troubleshooting, and billing checks can be led through Codex.

## Current identity gap

The local `ventus-base` profile resolves to `arn:aws:iam::373633008995:user/yusheng_chen`, but that user currently has only `IAMUserChangePassword`. The existing `ventus-monitor` profile fails because the `monitor` role does not trust or otherwise permit this user to call `sts:AssumeRole`. Do not broaden the IAM user directly; create the scoped role above instead.

Longer term, replace the long-lived source profile with AWS IAM Identity Center or `aws login` temporary credentials. The MCP role and its service-scoped policy can remain unchanged.
