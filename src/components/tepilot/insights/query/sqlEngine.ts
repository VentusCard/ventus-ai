// Thin wrapper around alasql that registers Ventus demo tables once
// and runs arbitrary SELECT (or WITH … SELECT) statements safely.
import alasql from "alasql";
import { getDataset, SCHEMA, SCHEMA_HINTS } from "./queryDataset";

export interface SqlResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
  truncated: boolean;
  groupByCols: string[];
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
  return { columns, rows, rowCount: rows.length, truncated, groupByCols: extractGroupByCols(scan) };
}

/** Tables in the dataset that expose a customer_id column. */
const TABLES_WITH_CUSTOMER = new Set([
  "transactions",
  "customers",
  "life_events",
  "shopping_habits",
  "wallet_share",
  "deal_redemptions",
]);

/**
 * Rewrite the user's SQL to return a deduped list of customer_ids matching the
 * same FROM/JOIN/WHERE graph. Optional `segmentFilters` add equality predicates
 * (e.g. {pillar: 'Travel'}) for per-row segment exports.
 *
 * Throws when no joined table exposes customer_id (e.g. pure `deals` aggregate).
 */
export function buildCohortQuery(
  sql: string,
  segmentFilters: Record<string, unknown> = {},
): string {
  const origFromIdx = sql.search(/\bFROM\b/i);
  if (origFromIdx === -1) throw new Error("Cohort export requires a FROM clause.");
  const origAfterFrom = sql.slice(origFromIdx);
  const endRe = /\b(GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|WINDOW|FETCH)\b/i;
  const endMatchOrig = origAfterFrom.match(endRe);
  const origEndOffset = endMatchOrig ? origAfterFrom.search(endRe) : origAfterFrom.length;
  let fromBlock = origAfterFrom.slice(0, origEndOffset).trim();

  // Identify the first table in FROM/JOIN that has customer_id, capture its alias.
  const tableRe = /\b(transactions|customers|life_events|shopping_habits|wallet_share|deal_redemptions|deals)\b(?:\s+(?:AS\s+)?([A-Za-z_][\w]*))?/gi;
  let chosenAlias: string | null = null;
  let mm: RegExpExecArray | null;
  while ((mm = tableRe.exec(fromBlock)) !== null) {
    const table = mm[1].toLowerCase();
    const alias = mm[2] || table;
    // Skip aliases that collide with SQL keywords following the table name.
    if (/^(WHERE|ON|JOIN|INNER|LEFT|RIGHT|FULL|CROSS|GROUP|ORDER|HAVING|LIMIT|AS)$/i.test(alias)) {
      if (TABLES_WITH_CUSTOMER.has(table)) { chosenAlias = table; break; }
      continue;
    }
    if (TABLES_WITH_CUSTOMER.has(table)) { chosenAlias = alias; break; }
  }
  if (!chosenAlias) {
    throw new Error("This query doesn't reach a table with customer_id — cohort export isn't available.");
  }

  const extra = Object.entries(segmentFilters).map(([col, val]) => {
    const v = typeof val === "number" ? String(val) : `'${String(val).replace(/'/g, "''")}'`;
    return `${col} = ${v}`;
  });

  if (extra.length) {
    if (/\bWHERE\b/i.test(fromBlock)) {
      fromBlock = `${fromBlock} AND ${extra.join(" AND ")}`;
    } else {
      fromBlock = `${fromBlock} WHERE ${extra.join(" AND ")}`;
    }
  }

  return `SELECT DISTINCT ${chosenAlias}.customer_id AS customer_id\n${fromBlock}\nORDER BY customer_id ASC`;
}

/** Extract column expressions from a GROUP BY clause for per-segment exports. */
function extractGroupByCols(scrubbed: string): string[] {
  const m = scrubbed.match(/\bGROUP\s+BY\b([\s\S]+?)(?:\bORDER\s+BY\b|\bHAVING\b|\bLIMIT\b|$)/i);
  if (!m) return [];
  return m[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => s.replace(/^.*\./, ""));
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
