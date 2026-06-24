// Thin wrapper around alasql that registers Ventus demo tables once
// and runs arbitrary SELECT (or WITH … SELECT) statements safely.
import alasql from "alasql";
import { getDataset, SCHEMA, SCHEMA_HINTS } from "./queryDataset";

export interface SqlResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  truncated: boolean;
}

const ROW_CAP = 5000;

let initialized = false;

function init() {
  if (initialized) return;
  const data = getDataset();
  for (const [name, rows] of Object.entries(data)) {
    try { alasql(`DROP TABLE IF EXISTS ${name}`); } catch { /* ignore */ }
    alasql(`CREATE TABLE ${name}`);
    (alasql.tables as Record<string, { data: unknown[] }>)[name].data = rows;
  }
  initialized = true;
}

const FORBIDDEN = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|ATTACH|DETACH|EXEC|MERGE|REPLACE|GRANT|REVOKE)\b/i;

/**
 * Strip string literals and SQL comments so safety scans never see
 * user-supplied content (e.g. `WHERE name LIKE '%delete%'`).
 */
function stripLiteralsAndComments(sql: string): string {
  let out = "";
  let i = 0;
  while (i < sql.length) {
    const ch = sql[i];
    const next = sql[i + 1];
    // line comment
    if (ch === "-" && next === "-") {
      const nl = sql.indexOf("\n", i);
      i = nl === -1 ? sql.length : nl;
      continue;
    }
    // block comment
    if (ch === "/" && next === "*") {
      const end = sql.indexOf("*/", i + 2);
      i = end === -1 ? sql.length : end + 2;
      continue;
    }
    // single-quoted string (with '' escape)
    if (ch === "'") {
      i++;
      while (i < sql.length) {
        if (sql[i] === "'" && sql[i + 1] === "'") { i += 2; continue; }
        if (sql[i] === "'") { i++; break; }
        i++;
      }
      out += "''";
      continue;
    }
    // double-quoted identifier — keep contents (identifiers aren't a safety risk)
    if (ch === '"') {
      out += ch; i++;
      while (i < sql.length && sql[i] !== '"') { out += sql[i++]; }
      if (i < sql.length) { out += sql[i++]; }
      continue;
    }
    // backtick identifier
    if (ch === "`") {
      out += ch; i++;
      while (i < sql.length && sql[i] !== "`") { out += sql[i++]; }
      if (i < sql.length) { out += sql[i++]; }
      continue;
    }
    out += ch;
    i++;
  }
  return out;
}

export function executeSql(sql: string): SqlResult {
  init();
  if (sql.length > 8000) throw new Error("Query is too long (8 KB max).");
  let clean = sql.trim().replace(/;+\s*$/g, "");
  if (!clean) throw new Error("Empty query");

  const scan = stripLiteralsAndComments(clean);

  if (FORBIDDEN.test(scan)) throw new Error("Only SELECT statements are allowed.");
  if (scan.includes(";")) throw new Error("Only a single statement is allowed per query.");

  const head = scan.replace(/^(?:\s*--[^\n]*\n)+/g, "").trimStart();
  if (!/^(SELECT|WITH)\b/i.test(head)) {
    throw new Error("Query must start with SELECT or WITH.");
  }

  // Inject a safety LIMIT only when none is present at the statement tail.
  if (!/\bLIMIT\s+\d+\b\s*$/i.test(scan)) {
    clean = `${clean}\nLIMIT ${ROW_CAP}`;
  }

  let raw: unknown;
  try {
    raw = alasql(clean);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(msg.replace(/^Error:\s*/, ""));
  }

  const allRows = Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
  const truncated = allRows.length > ROW_CAP;
  const rows = truncated ? allRows.slice(0, ROW_CAP) : allRows;
  const columns = rows.length
    ? Object.keys(rows[0])
    : extractSelectedColumns(clean);
  return { columns, rows, rowCount: rows.length, truncated };
}

/**
 * Paren-aware extraction of the final SELECT clause's output column names.
 * Handles `COUNT(a, b)`, `CASE WHEN … END AS x`, nested functions, etc.
 */
function extractSelectedColumns(sql: string): string[] {
  // Find the final SELECT … FROM (works for plain SELECT and the tail of a CTE)
  const re = /\bSELECT\b([\s\S]+?)\bFROM\b/gi;
  let lastMatch: RegExpExecArray | null = null;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql)) !== null) lastMatch = m;
  if (!lastMatch) return [];

  const list = lastMatch[1].trim().replace(/^DISTINCT\s+/i, "");
  if (list === "*") return [];

  const parts: string[] = [];
  let depth = 0;
  let buf = "";
  for (let i = 0; i < list.length; i++) {
    const ch = list[i];
    if (ch === "(") depth++;
    else if (ch === ")") depth = Math.max(0, depth - 1);
    if (ch === "," && depth === 0) { parts.push(buf); buf = ""; continue; }
    buf += ch;
  }
  if (buf.trim()) parts.push(buf);

  return parts.map((raw) => {
    const c = raw.trim();
    const asMatch = c.match(/\bAS\s+(["`]?)([\w]+)\1\s*$/i);
    if (asMatch) return asMatch[2];
    // Fallback: last whitespace-delimited token, strip table qualifier
    const tail = c.split(/\s+/).pop() || c;
    return tail.replace(/^.*\./, "").replace(/["`]/g, "");
  });
}

export { SCHEMA, SCHEMA_HINTS };
