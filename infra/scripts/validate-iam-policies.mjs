import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const infraRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  'iam/github-oidc-trust-policy.json',
  'iam/github-staging-deploy-policy.json',
  'iam/secrets-kms-deploy-policy-proposal.json',
  'iam/secrets-kms-key-policy-template.json',
];

for (const file of files) {
  const policy = JSON.parse(readFileSync(resolve(infraRoot, file), 'utf8'));

  if (policy.Version !== '2012-10-17') {
    throw new Error(`${file} has unexpected Version`);
  }

  if (!Array.isArray(policy.Statement) || policy.Statement.length === 0) {
    throw new Error(`${file} must include at least one Statement`);
  }

  if (file === 'iam/github-oidc-trust-policy.json') {
    const subjects = policy.Statement[0]?.Condition?.StringLike?.[
      'token.actions.githubusercontent.com:sub'
    ];
    if (!Array.isArray(subjects) || !subjects.includes(
      'repo:VentusCard/ventus-ai:ref:refs/heads/dev'
    )) {
      throw new Error(`${file} must allow reviewed dev-branch workflow dispatches`);
    }
  }

  if (file === 'iam/github-staging-deploy-policy.json') {
    const stackStatement = policy.Statement.find(
      (statement) => statement.Sid === 'CloudFormationVentusStack'
    );
    const resources = Array.isArray(stackStatement?.Resource)
      ? stackStatement.Resource
      : [stackStatement?.Resource].filter(Boolean);
    const identityStackArn =
      'arn:aws:cloudformation:us-east-2:373633008995:stack/VentusIdentityStack/*';
    const consoleApiStackArn =
      'arn:aws:cloudformation:us-east-2:373633008995:stack/VentusConsoleApiStack/*';
    if (!resources.includes(identityStackArn)) {
      throw new Error(`${file} must allow the reviewed Ventus identity stack`);
    }
    if (!resources.includes(consoleApiStackArn)) {
      throw new Error(`${file} must allow the reviewed Ventus Console API stack`);
    }
    const userProvisioning = policy.Statement.find(
      (statement) => statement.Sid === 'ProvisionStagingConsoleUsers'
    );
    const provisioningActions = Array.isArray(userProvisioning?.Action)
      ? userProvisioning.Action
      : [];
    if (
      userProvisioning?.Resource
        !== 'arn:aws:cognito-idp:us-east-2:373633008995:userpool/us-east-2_M9Ipbusin'
      || provisioningActions.some((action) => ![
        'cognito-idp:AdminAddUserToGroup',
        'cognito-idp:AdminCreateUser',
        'cognito-idp:AdminGetUser',
      ].includes(action))
    ) {
      throw new Error(`${file} Console user provisioning must remain scoped to the staging pool`);
    }
  }

  if (file.includes('secrets-kms-key-policy')) {
    for (const statement of policy.Statement) {
      const principals = statement.Principal?.AWS;
      const principalValues = Array.isArray(principals)
        ? principals
        : principals
          ? [principals]
          : [];
      for (const principal of principalValues) {
        if (principal !== 'arn:aws:iam::373633008995:root' && principal.includes('*')) {
          throw new Error(`${file} must not use wildcard runtime principals: ${principal}`);
        }
      }

      const actions = Array.isArray(statement.Action) ? statement.Action : [statement.Action];
      if (actions.some((action) => String(action).startsWith('kms:')) && statement.Sid !== 'AllowAccountAdmin') {
        const viaService = statement.Condition?.StringEquals?.['kms:ViaService'];
        const callerAccount = statement.Condition?.StringEquals?.['kms:CallerAccount'];
        if (viaService !== 'secretsmanager.us-east-2.amazonaws.com') {
          throw new Error(`${file} KMS runtime statements must constrain kms:ViaService`);
        }
        if (callerAccount !== '373633008995') {
          throw new Error(`${file} KMS runtime statements must constrain kms:CallerAccount`);
        }
      }
    }
  }
}

console.log(`Validated ${files.length} IAM policy file(s)`);
