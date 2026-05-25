#!/usr/bin/env node
/**
 * Bulk import Ventus pilot roadmap issues into Linear.
 *
 * Usage:
 *   export LINEAR_API_KEY="lin_api_..."
 *   npm run dry-run
 *   npm run import
 *   npm run import:repo-org
 *   node ./import-issues.mjs --file issues-repo-organization.json --dry-run
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { LinearClient } from '@linear/sdk';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const fileArgIndex = process.argv.indexOf('--file');
const issuesFileName =
  fileArgIndex >= 0
    ? process.argv[fileArgIndex + 1]
    : process.env.LINEAR_ISSUES_FILE || 'issues.json';
const issuesPath = resolve(scriptDir, issuesFileName);
const dryRun = process.argv.includes('--dry-run');
const defaultImportLabel = issuesFileName.includes('repo-organization')
  ? 'repo-organization'
  : 'star-pilot-may-2026';
const importLabel = process.env.LINEAR_IMPORT_LABEL || defaultImportLabel;
const teamKeyHint = process.env.LINEAR_TEAM_KEY || '';

const PRIORITY_MAP = {
  1: 1, // Urgent
  2: 2, // High
  3: 3, // Medium
  4: 4, // Low
};

function loadConfig() {
  return JSON.parse(readFileSync(issuesPath, 'utf8'));
}

async function getTeam(client) {
  const teams = await client.teams();
  const nodes = teams.nodes;
  const preferredKey = teamKeyHint || process.env.LINEAR_TEAM_KEY || 'ENG';

  const byKey = nodes.find((t) => t.key.toLowerCase() === preferredKey.toLowerCase());
  if (byKey) return byKey;

  const byExactName = nodes.find((t) => t.name.toLowerCase() === 'engineering');
  if (byExactName) return byExactName;

  const byVentusName = nodes.find((t) => t.name.toLowerCase() === 'ventus ai');
  if (byVentusName) return byVentusName;

  const byName = nodes.find((t) => t.name.toLowerCase().includes('ventus'));
  if (byName) return byName;

  if (nodes.length === 1) return nodes[0];

  throw new Error(
    `Could not detect team. Set LINEAR_TEAM_KEY (default ZOH). Available: ${nodes.map((t) => `${t.name} (${t.key})`).join(', ')}`
  );
}

async function ensureLabel(client, teamId, name) {
  const existing = await client.issueLabels({
    filter: { team: { id: { eq: teamId } }, name: { eq: name } },
  });
  if (existing.nodes.length > 0) {
    return existing.nodes[0];
  }
  if (dryRun) {
    return { id: `dry-run-label-${name}`, name };
  }
  const created = await client.createIssueLabel({
    teamId,
    name,
    color: labelColor(name),
  });
  return created.issueLabel;
}

function labelColor(name) {
  const colors = {
    infra: '#5E6AD2',
    backend: '#26B5CE',
    frontend: '#F2C94C',
    gtm: '#95A2B3',
    p0: '#EB5757',
    p1: '#F2994A',
    p2: '#BB87FC',
    'blocked-external': '#848484',
    'repo-organization': '#4EA7FC',
  };
  return colors[name] || '#95A2B3';
}

async function ensureProject(client, teamId, projectDef, projectCache) {
  if (projectCache.has(projectDef.name)) {
    return projectCache.get(projectDef.name);
  }

  const existing = await client.projects({
    filter: {
      name: { eq: projectDef.name },
      accessibleTeams: { some: { id: { eq: teamId } } },
    },
  });

  if (existing.nodes.length > 0) {
    projectCache.set(projectDef.name, existing.nodes[0]);
    return existing.nodes[0];
  }

  if (dryRun) {
    const fake = { id: `dry-run-project-${projectDef.name}`, name: projectDef.name };
    projectCache.set(projectDef.name, fake);
    return fake;
  }

  const created = await client.createProject({
    name: projectDef.name,
    description: projectDef.description,
    teamIds: [teamId],
  });
  projectCache.set(projectDef.name, created.project);
  return created.project;
}

async function issueExists(client, teamId, projectId, title) {
  const found = await client.issues({
    filter: {
      team: { id: { eq: teamId } },
      title: { eq: title },
      project: { id: { eq: projectId } },
    },
  });
  return found.nodes.length > 0;
}

async function main() {
  const apiKey = process.env.LINEAR_API_KEY;
  if (!apiKey && !dryRun) {
    console.error('Missing LINEAR_API_KEY. Create one at Linear → Settings → Security & access → Personal API keys');
    console.error('See docs/linear-setup.md');
    process.exit(1);
  }

  const config = loadConfig();
  console.log(`Issues file: ${issuesPath}`);
  const client = apiKey ? new LinearClient({ apiKey }) : null;

  let team;
  if (client) {
    team = await getTeam(client);
    console.log(`Team: ${team.name} (${team.key})`);
  } else {
    team = { id: 'dry-run-team', name: 'Ventus AI', key: 'ZOH' };
    console.log('Dry run without API key — counts only');
  }

  const projectCache = new Map();
  const labelCache = new Map();

  // Ensure import batch label
  if (client) {
    const batchLabel = await ensureLabel(client, team.id, importLabel);
    labelCache.set(importLabel, batchLabel);
  }

  let created = 0;
  let skipped = 0;

  for (const projectDef of config.projects) {
    if (client) {
      await ensureProject(client, team.id, projectDef, projectCache);
    }
  }

  for (const issue of config.issues) {
    const projectDef = config.projects.find((p) => p.name === issue.project);
    if (!projectDef) {
      throw new Error(`Unknown project "${issue.project}" for issue "${issue.title}"`);
    }

    let project;
    if (client) {
      project = await ensureProject(client, team.id, projectDef, projectCache);
      if (await issueExists(client, team.id, project.id, issue.title)) {
        console.log(`skip  ${issue.title}`);
        skipped += 1;
        continue;
      }
    }

    const labelNames = [...new Set([importLabel, ...(issue.labels || [])])];

    if (dryRun) {
      console.log(`create [P${issue.priority}] ${issue.project} → ${issue.title}`);
      created += 1;
      continue;
    }

    const labelIds = [];
    for (const name of labelNames) {
      if (!labelCache.has(name)) {
        labelCache.set(name, await ensureLabel(client, team.id, name));
      }
      labelIds.push(labelCache.get(name).id);
    }

    const result = await client.createIssue({
      teamId: team.id,
      projectId: project.id,
      title: issue.title,
      description: issue.description,
      priority: PRIORITY_MAP[issue.priority] ?? 3,
      labelIds,
    });

    console.log(`added ${result.issue?.identifier || ''} ${issue.title}`);
    created += 1;
  }

  console.log('');
  console.log(dryRun ? 'Dry run complete.' : 'Import complete.');
  console.log(`${created} would create / created, ${skipped} skipped (duplicates)`);
  console.log('');
  console.log('Next: invite Yusheng at Linear → Settings → Workspace → Members');
  console.log('Docs: docs/linear-setup.md');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
