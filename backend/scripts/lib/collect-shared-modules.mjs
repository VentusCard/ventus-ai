import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';

// Matches a shared module reference in an entry file, e.g.
//   import x from '../../shared/platform/db.mjs'
//   import { y } from './shared/pilot/decision-ledger.mjs'   (monitor zip-relative)
//   await import('../../shared/coworker/store.mjs')
const ENTRY_SHARED_RE = /(?:from|import|require)\s*\(?\s*['"][^'"]*\/shared\/([^'"]+\.mjs)['"]/g;

// Matches a relative specifier inside a shared module ('./x.mjs' or '../cat/x.mjs').
const REL_SPEC_RE = /(?:from|import|require)\s*\(?\s*['"](\.\.?\/[^'"]+\.mjs)['"]/g;

/**
 * Statically trace every shared module reachable from the given entry files.
 * Returns { files: Set<absPath>, subdirs: Set<string> } where subdirs are the
 * first-level folders under sharedRoot that must be bundled (whole, so runtime
 * assets such as coworker/fixtures travel with the code).
 */
export function collectSharedModules(entryFiles, sharedRoot) {
  const reachable = new Set();
  const queue = [];

  const enqueue = (absPath) => {
    if (!absPath.endsWith('.mjs')) return;
    if (reachable.has(absPath)) return;
    if (!existsSync(absPath)) return;
    reachable.add(absPath);
    queue.push(absPath);
  };

  for (const entry of entryFiles) {
    if (!existsSync(entry)) continue;
    const src = readFileSync(entry, 'utf8');
    for (const m of src.matchAll(ENTRY_SHARED_RE)) {
      enqueue(join(sharedRoot, m[1]));
    }
  }

  while (queue.length > 0) {
    const file = queue.shift();
    const src = readFileSync(file, 'utf8');
    const fileDir = dirname(file);
    for (const m of src.matchAll(REL_SPEC_RE)) {
      const target = resolve(fileDir, m[1]);
      const rel = relative(sharedRoot, target);
      if (rel.startsWith('..')) continue; // outside shared/, not our concern here
      enqueue(target);
    }
  }

  const subdirs = new Set();
  const rootFiles = new Set();
  for (const abs of reachable) {
    const rel = relative(sharedRoot, abs);
    const parts = rel.split(sep);
    if (parts.length > 1) subdirs.add(parts[0]);
    else rootFiles.add(rel); // file directly under shared/ (none today, handled defensively)
  }

  return { files: reachable, subdirs, rootFiles };
}
