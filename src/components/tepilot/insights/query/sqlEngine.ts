// Thin wrapper around alasql that registers Ventus demo tables once
// and runs arbitrary SELECT statements.
import alasql from "alasql";
import { getDataset, SCHEMA } from "./queryDataset";

export interface SqlResult {
  columns: string[];
  rows: Record<string, unknown>[];
  rowCount: number;
}

let initialized = false;

function init() {
  if (initialized) return;
  const data = getDataset();
  for (const [name, rows] of Object.entries(data)) {
    // Drop if it exists, then re-create as an in-memory table.
    try { alasql(`DROP TABLE IF EXISTS ${name}`); } catch { /* ignore */ }
    alasql(`CREATE TABLE ${name}`);
    (alasql.tables as Record<string, { data: unknown[] }>)[name].data = rows;
  }
  initialized = true;
}

const FORBIDDEN = /\b(INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE|ATTACH|DETACH|EXEC)\b/i;

export function executeSql(sql: string): SqlResult {
  init();
  let clean = sql.trim().replace(/;+\s*$/g, "");
  if (!clean) throw new Error("Empty query");
  if (FORBIDDEN.test(clean)) throw new Error("Only SELECT statements are allowed.");
  // Strip leading line comments to check for SELECT, but keep them in the executed text
  const withoutLeadingComments = clean.replace(/^(?:\s*--[^\n]*\n)+/g, "").trimStart();
  if (!/^SELECT\b/i.test(withoutLeadingComments)) throw new Error("Query must start with SELECT.");
  // Inject a safety LIMIT if none provided
  if (!/\bLIMIT\s+\d+/i.test(clean)) clean = `${clean} LIMIT 5000`;


  let raw: unknown;
  try {
    raw = alasql(clean);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(msg.replace(/^Error:\s*/, ""));
  }

  const rows = Array.isArray(raw) ? (raw as Record<string, unknown>[]) : [];
  const columns = rows.length
    ? Object.keys(rows[0])
    : extractSelectedColumns(clean);
  return { columns, rows, rowCount: rows.length };
}

function extractSelectedColumns(sql: string): string[] {
  const m = sql.match(/^\s*SELECT\s+([\s\S]+?)\s+FROM\b/i);
  if (!m) return [];
  const list = m[1].trim();
  if (list === "*") return [];
  return list.split(",").map((c) => {
    const asMatch = c.match(/\bAS\s+(["`]?)([\w]+)\1\s*$/i);
    if (asMatch) return asMatch[2];
    return c.trim().split(/\s+/).pop()!.replace(/^.*\./, "");
  });
}

export { SCHEMA };
