import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const monitorsRoot = join(backendRoot, 'monitors');
const distRoot = join(backendRoot, 'dist', 'monitors');
const buildRoot = join(backendRoot, 'dist', 'monitor-build');

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

  cpSync(join(sourceDir, 'index.mjs'), join(buildDir, 'index.mjs'));
  cpSync(join(sourceDir, 'package.json'), join(buildDir, 'package.json'));

  const sharedCopies = {
    'stuck-job-monitor': ['batch-stuck.mjs', 'webhooks.mjs'],
  };
  const sharedFiles = sharedCopies[monitorName] ?? [];
  if (sharedFiles.length > 0) {
    mkdirSync(join(buildDir, 'shared'), { recursive: true });
    for (const sharedFile of sharedFiles) {
      cpSync(join(backendRoot, 'shared', sharedFile), join(buildDir, 'shared', sharedFile));
    }
  }

  if (existsSync(join(sourceDir, 'package-lock.json'))) {
    cpSync(join(sourceDir, 'package-lock.json'), join(buildDir, 'package-lock.json'));
    run('npm', ['ci', '--omit=dev'], buildDir);
  } else {
    run('npm', ['install', '--omit=dev'], buildDir);
  }

  run('zip', ['-qr', zipPath, '.'], buildDir);
}

console.log(`Wrote ${monitors.length} monitor package(s) to ${distRoot}`);
