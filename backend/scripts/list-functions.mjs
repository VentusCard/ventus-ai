import { readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const functionsDir = join(scriptDir, '..', 'functions');

const names = readdirSync(functionsDir)
  .filter((name) => statSync(join(functionsDir, name)).isDirectory())
  .sort();

for (const name of names) {
  console.log(name);
}
