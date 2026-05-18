import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const infraRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  'iam/github-oidc-trust-policy.json',
  'iam/github-staging-deploy-policy.json',
];

for (const file of files) {
  const policy = JSON.parse(readFileSync(resolve(infraRoot, file), 'utf8'));

  if (policy.Version !== '2012-10-17') {
    throw new Error(`${file} has unexpected Version`);
  }

  if (!Array.isArray(policy.Statement) || policy.Statement.length === 0) {
    throw new Error(`${file} must include at least one Statement`);
  }
}

console.log(`Validated ${files.length} IAM policy file(s)`);
