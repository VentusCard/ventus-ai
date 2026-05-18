import { existsSync, readdirSync, statSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const backendRoot = resolve(scriptDir, '..');
const searchRoots = [join(backendRoot, 'functions'), join(backendRoot, 'shared')];
const importPattern = /\bimport\s+(?:[^'"]+\s+from\s+)?['"](\.{1,2}\/[^'"]+)['"]/g;

function listMjsFiles(dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) files.push(...listMjsFiles(fullPath));
    else if (extname(fullPath) === '.mjs') files.push(fullPath);
  }
  return files;
}

const missingImports = [];

for (const root of searchRoots) {
  if (!existsSync(root)) continue;

  for (const filePath of listMjsFiles(root)) {
    const source = readFileSync(filePath, 'utf8');
    for (const match of source.matchAll(importPattern)) {
      const importPath = match[1];
      const resolvedPath = resolve(dirname(filePath), importPath);
      if (!existsSync(resolvedPath)) {
        missingImports.push(`${filePath.replace(`${backendRoot}/`, '')} -> ${importPath}`);
      }
    }
  }
}

if (missingImports.length > 0) {
  console.error('Missing relative imports:');
  for (const missingImport of missingImports) console.error(`- ${missingImport}`);
  process.exit(1);
}

console.log('Relative imports resolve');
