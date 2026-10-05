// Reports how the root package.json dependency set differs from a base ref, and
// fails when packages were added.
//
// Runs before `npm ci`, so it must stay dependency-free: plain node, no imports
// beyond the standard library.
//
// Lovable edits package.json as a side effect of unrelated UI work and has added
// well over a hundred transitive packages to a PR that only removed a panel.
// Additions are therefore treated as deliberate acts that need a human to say
// yes, via the `deps-approved` label.

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const BASE_REF = process.argv[2];
const APPROVED = process.argv[3] === 'approved';

if (!BASE_REF) {
  console.error('usage: check-frontend-deps.mjs <base-ref> [approved]');
  process.exit(2);
}

const FIELDS = ['dependencies', 'devDependencies'];

function flatten(pkg) {
  const out = new Map();
  for (const field of FIELDS) {
    for (const [name, range] of Object.entries(pkg[field] || {})) {
      out.set(name, { range, field });
    }
  }
  return out;
}

let base;
try {
  base = flatten(JSON.parse(execFileSync('git', ['show', `${BASE_REF}:package.json`], {
    encoding: 'utf8',
    maxBuffer: 10 * 1024 * 1024,
  })));
} catch (err) {
  // A missing base ref means the comparison is impossible, not that the branch
  // is clean. Fail loudly rather than waving the change through.
  console.error(`could not read package.json at ${BASE_REF}: ${err.message}`);
  process.exit(2);
}

const head = flatten(JSON.parse(readFileSync('package.json', 'utf8')));

const added = [];
const removed = [];
const changed = [];

for (const [name, { range, field }] of head) {
  const before = base.get(name);
  if (!before) added.push(`${name}@${range} (${field})`);
  else if (before.range !== range) changed.push(`${name}: ${before.range} -> ${range}`);
}
for (const [name, { range, field }] of base) {
  if (!head.has(name)) removed.push(`${name}@${range} (${field})`);
}

function list(title, items) {
  if (!items.length) return;
  console.log(`\n${title} (${items.length}):`);
  for (const item of items.sort()) console.log(`  ${item}`);
}

if (!added.length && !removed.length && !changed.length) {
  console.log(`No dependency changes vs ${BASE_REF}.`);
  process.exit(0);
}

console.log(`Dependency changes vs ${BASE_REF}:`);
list('Added', added);
list('Removed', removed);
list('Version changed', changed);

if (!added.length) {
  console.log('\nNo packages added. Passing.');
  process.exit(0);
}

if (APPROVED) {
  console.log('\nPackages were added, but the PR carries the deps-approved label. Passing.');
  process.exit(0);
}

console.error(
  '\nThis PR adds frontend dependencies.\n' +
  'If they are intentional, add the `deps-approved` label to the PR.\n' +
  'If a tool added them as a side effect, drop them with:\n' +
  `  git checkout ${BASE_REF.replace(/^origin\//, '')} -- package.json\n` +
  '  npm install --package-lock-only\n'
);
process.exit(1);
