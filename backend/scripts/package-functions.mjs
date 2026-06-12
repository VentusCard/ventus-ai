import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const functionsRoot = join(backendRoot, 'functions');
const sharedRoot = join(backendRoot, 'shared');
const distRoot = join(backendRoot, 'dist', 'lambda');
const buildRoot = join(backendRoot, 'dist', 'build');

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

const functions = readdirSync(functionsRoot)
  .filter((name) => statSync(join(functionsRoot, name)).isDirectory())
  .sort();

for (const functionName of functions) {
  const sourceDir = join(functionsRoot, functionName);
  const buildDir = join(buildRoot, functionName);
  const zipPath = join(distRoot, `${functionName}.zip`);

  console.log(`Packaging ${functionName}`);
  rmSync(zipPath, { force: true });
  mkdirSync(buildDir, { recursive: true });

  const indexSource = readFileSync(join(sourceDir, 'index.mjs'), 'utf8').replaceAll(
    '../../shared/',
    './shared/'
  );
  writeFileSync(join(buildDir, 'index.mjs'), indexSource);
  cpSync(join(sourceDir, 'package.json'), join(buildDir, 'package.json'));
  for (const fileName of readdirSync(sourceDir)) {
    const sourceFile = join(sourceDir, fileName);
    if (fileName !== 'index.mjs' && statSync(sourceFile).isFile() && fileName.endsWith('.mjs')) {
      cpSync(sourceFile, join(buildDir, fileName));
    }
  }
  if (existsSync(sharedRoot)) {
    cpSync(sharedRoot, join(buildDir, 'shared'), {
      recursive: true,
      filter: (src) => !src.endsWith('.test.mjs'),
    });
  }
  const configRoot = join(backendRoot, 'config');
  if (existsSync(configRoot)) {
    cpSync(configRoot, join(buildDir, 'config'), { recursive: true });
  }

  if (existsSync(join(sourceDir, 'package-lock.json'))) {
    cpSync(join(sourceDir, 'package-lock.json'), join(buildDir, 'package-lock.json'));
    run('npm', ['ci', '--omit=dev'], buildDir);
  } else {
    run('npm', ['install', '--omit=dev'], buildDir);
  }

  run('zip', ['-qr', zipPath, '.'], buildDir);
}

console.log(`Wrote ${functions.length} package(s) to ${distRoot}`);
