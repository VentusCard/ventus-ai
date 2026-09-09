import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { collectSharedModules } from './lib/collect-shared-modules.mjs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const monitorsRoot = join(backendRoot, 'monitors');
const sharedRoot = join(backendRoot, 'shared');
const sqlRoot = join(backendRoot, 'sql');
const distRoot = join(backendRoot, 'dist', 'monitors');
const buildRoot = join(backendRoot, 'dist', 'monitor-build');

/**
 * Same rule as package-functions.mjs: bundle only the shared subfolders this
 * monitor transitively imports (whole subfolders minus *.test.mjs).
 */
function copySharedIntoBuild(buildDir, sourceDir) {
  if (!existsSync(sharedRoot)) return;
  const entryFiles = readdirSync(sourceDir)
    .filter((name) => name.endsWith('.mjs') && !name.endsWith('.test.mjs'))
    .map((name) => join(sourceDir, name));
  const { subdirs, rootFiles } = collectSharedModules(entryFiles, sharedRoot);
  for (const subdir of subdirs) {
    cpSync(join(sharedRoot, subdir), join(buildDir, 'shared', subdir), {
      recursive: true,
      filter: (src) => !src.endsWith('.test.mjs'),
    });
  }
  for (const rel of rootFiles) {
    cpSync(join(sharedRoot, rel), join(buildDir, 'shared', rel));
  }
}

function run(command, args, cwd) {
  const npmCacheDir = join(backendRoot, 'dist', 'npm-cache');
  const npmLogsDir = join(npmCacheDir, '_logs');
  mkdirSync(npmLogsDir, { recursive: true });

  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    env: {
      ...process.env,
      npm_config_cache: npmCacheDir,
      npm_config_logs_dir: npmLogsDir,
      npm_config_audit: 'false',
      npm_config_fund: 'false',
    },
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed in ${cwd}`);
  }
}

rmSync(buildRoot, { recursive: true, force: true });
mkdirSync(distRoot, { recursive: true });
mkdirSync(buildRoot, { recursive: true });

const monitors = readdirSync(monitorsRoot)
  .filter((name) => statSync(join(monitorsRoot, name)).isDirectory())
  .sort();

for (const monitorName of monitors) {
  const sourceDir = join(monitorsRoot, monitorName);
  const buildDir = join(buildRoot, monitorName);
  const zipPath = join(distRoot, `${monitorName}.zip`);

  console.log(`Packaging ${monitorName}`);
  rmSync(zipPath, { force: true });
  mkdirSync(buildDir, { recursive: true });

  for (const sourceFile of readdirSync(sourceDir).filter((name) => name.endsWith('.mjs') && !name.endsWith('.test.mjs'))) {
    cpSync(join(sourceDir, sourceFile), join(buildDir, sourceFile));
  }
  cpSync(join(sourceDir, 'package.json'), join(buildDir, 'package.json'));
  const packageDefinition = JSON.parse(readFileSync(join(sourceDir, 'package.json'), 'utf8'));
  if (packageDefinition.ventus?.includeEvidenceSql === true) {
    cpSync(sqlRoot, join(buildDir, 'sql'), { recursive: true });
  }
  copySharedIntoBuild(buildDir, sourceDir);

  if (existsSync(join(sourceDir, 'package-lock.json'))) {
    cpSync(join(sourceDir, 'package-lock.json'), join(buildDir, 'package-lock.json'));
    run('npm', ['ci', '--omit=dev'], buildDir);
  } else {
    run('npm', ['install', '--omit=dev'], buildDir);
  }

  run('zip', ['-qr', zipPath, '.'], buildDir);
}

console.log(`Wrote ${monitors.length} monitor package(s) to ${distRoot}`);
