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
