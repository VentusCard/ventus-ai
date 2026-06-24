// Tiny ShopifyQL-style DSL.
// Grammar (line-based, case-insensitive keywords):
//   FROM <table>
//   SHOW <metric>[, <metric>...]            -- count | sum(col) | avg(col) | min(col) | max(col) | <col>
//   TIMESERIES <day|week|month> [WITH TOTALS, PERCENT_CHANGE]
//   GROUP BY <col>[, <col>...]              -- mutually exclusive w/ TIMESERIES
//   WHERE <col> <op> <value> [AND ...]      -- op: = != > >= < <= IN
//   SINCE <expr>                            -- startOfDay(-30d) | today | YYYY-MM-DD
//   UNTIL <expr>
//   COMPARE TO previous_period
//   ORDER BY <col> [ASC|DESC]
//   LIMIT <n>
//   VISUALIZE <metric> TYPE <line|bar|area>

import { getDataset, type Row, SCHEMA } from "./queryDataset";

export type MetricSpec = { raw: string; alias: string; fn: "count" | "sum" | "avg" | "min" | "max" | "raw"; col?: string };
export type Filter = { col: string; op: "=" | "!=" | ">" | ">=" | "<" | "<=" | "in"; value: string | string[] | number };

export interface ParsedQuery {
  from: string;
  metrics: MetricSpec[];
  timeseries?: "day" | "week" | "month";
  withTotals?: boolean;
  withPercentChange?: boolean;
  groupBy: string[];
  where: Filter[];
  since?: string;
  until?: string;
  compareTo?: "previous_period";
  orderBy?: { col: string; dir: "ASC" | "DESC" };
  limit: number;
  visualize?: { metric: string; type: "line" | "bar" | "area" };
}

export interface QueryResult {
  query: ParsedQuery;
  columns: string[];                // first column is the dimension (day / group key)
  rows: Row[];
  totalsRow?: Row;
  comparisonRow?: Row;
  pctChangeRow?: Row;
  resolvedRange: { since: string; until: string };
  comparisonRange?: { since: string; until: string };
}

function pad(n: number) { return n < 10 ? `0${n}` : `${n}`; }
function isoDay(d: Date) { return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

function parseDate(expr: string, now: Date): Date {
  const t = expr.trim();
  if (/^today$/i.test(t)) return new Date(now);
  const startOf = t.match(/^startOfDay\(\s*(-?\d+)d\s*\)$/i);
  if (startOf) {
    const d = new Date(now);
    d.setDate(d.getDate() + parseInt(startOf[1], 10));
    return d;
  }
  const iso = new Date(t);
  if (!isNaN(iso.getTime())) return iso;
  throw new Error(`Unrecognized date expression: ${expr}`);
}

function parseMetric(token: string): MetricSpec {
  const m = token.trim().match(/^(count|sum|avg|min|max)\s*\(\s*([\w*]+)\s*\)$/i);
  if (m) {
    const fn = m[1].toLowerCase() as MetricSpec["fn"];
    const col = m[2] === "*" ? undefined : m[2];
    return { raw: token.trim(), alias: `${fn}_${m[2]}`, fn, col };
  }
  if (/^count$/i.test(token.trim())) return { raw: "count", alias: "count", fn: "count" };
  return { raw: token.trim(), alias: token.trim(), fn: "raw", col: token.trim() };
}

function tokenizeLines(src: string): string[] {
  return src
    .split(/\r?\n/)
    .map((l) => l.replace(/--.*$/, "").trim())
    .filter(Boolean)
    .reduce<string[]>((acc, line) => {
      // join continuation lines (lines that start with a non-keyword) into prev
      const KW = /^(FROM|SHOW|TIMESERIES|GROUP|WHERE|SINCE|UNTIL|COMPARE|ORDER|LIMIT|VISUALIZE)\b/i;
      if (acc.length && !KW.test(line)) acc[acc.length - 1] += " " + line;
      else acc.push(line);
      return acc;
    }, []);
}

export function parseQuery(src: string): ParsedQuery {
  const lines = tokenizeLines(src);
  const q: ParsedQuery = { from: "", metrics: [], groupBy: [], where: [], limit: 1000 };

  for (const line of lines) {
    if (/^FROM\b/i.test(line)) q.from = line.replace(/^FROM\s+/i, "").trim();
    else if (/^SHOW\b/i.test(line)) q.metrics = line.replace(/^SHOW\s+/i, "").split(",").map(parseMetric);
    else if (/^TIMESERIES\b/i.test(line)) {
      const m = line.match(/^TIMESERIES\s+(day|week|month)(?:\s+WITH\s+(.+))?$/i);
      if (!m) throw new Error("Invalid TIMESERIES clause");
      q.timeseries = m[1].toLowerCase() as ParsedQuery["timeseries"];
      if (m[2]) {
        const opts = m[2].split(",").map((s) => s.trim().toUpperCase());
        if (opts.includes("TOTALS")) q.withTotals = true;
        if (opts.includes("PERCENT_CHANGE")) q.withPercentChange = true;
      }
    }
    else if (/^GROUP\s+BY\b/i.test(line)) q.groupBy = line.replace(/^GROUP\s+BY\s+/i, "").split(",").map((s) => s.trim());
    else if (/^WHERE\b/i.test(line)) {
      const body = line.replace(/^WHERE\s+/i, "");
      for (const clause of body.split(/\s+AND\s+/i)) {
        const m = clause.match(/^(\w+)\s*(=|!=|>=|<=|>|<|IN)\s*(.+)$/i);
        if (!m) throw new Error(`Invalid WHERE clause: ${clause}`);
        const op = m[2].toLowerCase() as Filter["op"];
        let value: Filter["value"];
        if (op === "in") {
          value = m[3].replace(/^\(|\)$/g, "").split(",").map((s) => s.trim().replace(/^['"]|['"]$/g, ""));
        } else {
          const v = m[3].trim().replace(/^['"]|['"]$/g, "");
          value = isNaN(Number(v)) ? v : Number(v);
        }
        q.where.push({ col: m[1], op, value });
      }
    }
    else if (/^SINCE\b/i.test(line)) q.since = line.replace(/^SINCE\s+/i, "").trim();
    else if (/^UNTIL\b/i.test(line)) q.until = line.replace(/^UNTIL\s+/i, "").trim();
    else if (/^COMPARE\s+TO\b/i.test(line)) q.compareTo = line.replace(/^COMPARE\s+TO\s+/i, "").trim() as "previous_period";
    else if (/^ORDER\s+BY\b/i.test(line)) {
      const m = line.match(/^ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?$/i);
      if (!m) throw new Error("Invalid ORDER BY");
      q.orderBy = { col: m[1], dir: (m[2] || "ASC").toUpperCase() as "ASC" | "DESC" };
    }
    else if (/^LIMIT\b/i.test(line)) q.limit = parseInt(line.replace(/^LIMIT\s+/i, "").trim(), 10) || 1000;
    else if (/^VISUALIZE\b/i.test(line)) {
      const m = line.match(/^VISUALIZE\s+(\w+(?:_\w+)*|\w+\([^)]+\))\s+TYPE\s+(line|bar|area)$/i);
      if (!m) throw new Error("Invalid VISUALIZE");
      const metric = parseMetric(m[1]);
      q.visualize = { metric: metric.alias, type: m[2].toLowerCase() as "line" | "bar" | "area" };
    }
    else throw new Error(`Unknown clause: ${line.split(/\s+/)[0]}`);
  }

  if (!q.from) throw new Error("Missing FROM");
  if (!q.metrics.length) throw new Error("Missing SHOW");
  if (!(q.from in SCHEMA)) throw new Error(`Unknown table: ${q.from}. Allowed: ${Object.keys(SCHEMA).join(", ")}`);
  return q;
}

function passWhere(row: Row, where: Filter[]): boolean {
  for (const f of where) {
    const v = row[f.col];
    if (f.op === "in") {
      if (!(Array.isArray(f.value) && f.value.map(String).includes(String(v)))) return false;
    } else {
      const a = typeof v === "number" ? v : isNaN(Number(v)) ? String(v) : Number(v);
      const b = f.value as number | string;
      switch (f.op) {
        case "=": if (a !== b) return false; break;
        case "!=": if (a === b) return false; break;
        case ">": if (!(a > b)) return false; break;
        case ">=": if (!(a >= b)) return false; break;
        case "<": if (!(a < b)) return false; break;
        case "<=": if (!(a <= b)) return false; break;
      }
    }
  }
  return true;
}

function bucketKey(day: string, grain: "day" | "week" | "month"): string {
  if (grain === "day") return day;
  const d = new Date(day + "T00:00:00");
  if (grain === "month") return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
  // week (ISO-ish, Monday start)
  const dayNum = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - dayNum);
  return `Week of ${isoDay(d)}`;
}

function aggregate(rows: Row[], metrics: MetricSpec[]): Row {
  const out: Row = {};
  for (const m of metrics) {
    if (m.fn === "count") out[m.alias] = rows.length;
    else if (m.fn === "raw") out[m.alias] = rows.length ? (rows[0][m.col!] ?? "") : "";
    else {
      const vals = rows.map((r) => Number(r[m.col!]) || 0);
      if (m.fn === "sum") out[m.alias] = Math.round(vals.reduce((a, b) => a + b, 0) * 100) / 100;
      else if (m.fn === "avg") out[m.alias] = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : 0;
      else if (m.fn === "min") out[m.alias] = vals.length ? Math.min(...vals) : 0;
      else if (m.fn === "max") out[m.alias] = vals.length ? Math.max(...vals) : 0;
    }
  }
  return out;
}

function runOnce(q: ParsedQuery, since: Date, until: Date): { rows: Row[]; columns: string[] } {
  const data = getDataset();
  const tableRows = data[q.from] || [];
  const dayCol = q.from === "transactions" || q.from === "life_events" ? "day" : null;

  const filtered = tableRows.filter((r) => {
    if (dayCol) {
      const d = String(r[dayCol]);
      if (d < isoDay(since) || d > isoDay(until)) return false;
    }
    return passWhere(r, q.where);
  });

  if (q.timeseries && dayCol) {
    const buckets = new Map<string, Row[]>();
    for (const r of filtered) {
      const k = bucketKey(String(r[dayCol]), q.timeseries);
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k)!.push(r);
    }
    const dim = q.timeseries;
    const rows: Row[] = [...buckets.entries()].map(([k, rs]) => ({ [dim]: k, ...aggregate(rs, q.metrics) }));
    rows.sort((a, b) => String(a[dim]).localeCompare(String(b[dim])));
    return { rows, columns: [dim, ...q.metrics.map((m) => m.alias)] };
  }

  if (q.groupBy.length) {
    const buckets = new Map<string, Row[]>();
    for (const r of filtered) {
      const k = q.groupBy.map((c) => String(r[c])).join("|");
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k)!.push(r);
    }
    const rows: Row[] = [...buckets.entries()].map(([k, rs]) => {
      const parts = k.split("|");
      const out: Row = {};
      q.groupBy.forEach((c, i) => { out[c] = parts[i]; });
      return { ...out, ...aggregate(rs, q.metrics) };
    });
    return { rows, columns: [...q.groupBy, ...q.metrics.map((m) => m.alias)] };
  }

  // No grouping → single aggregate row
  return { rows: [aggregate(filtered, q.metrics)], columns: q.metrics.map((m) => m.alias) };
}

export function executeQuery(src: string): QueryResult {
  const q = parseQuery(src);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const since = q.since ? parseDate(q.since, now) : (() => { const d = new Date(now); d.setDate(d.getDate() - 29); return d; })();
  const until = q.until ? parseDate(q.until, now) : now;

  const primary = runOnce(q, since, until);

  let comparisonRow: Row | undefined;
  let comparisonRange: { since: string; until: string } | undefined;
  let pctChangeRow: Row | undefined;
  let totalsRow: Row | undefined;

  const dimCol = primary.columns[0];

  if (q.timeseries && (q.withTotals || q.withPercentChange || q.compareTo)) {
    const totals: Row = { [dimCol]: "Total" };
    for (const m of q.metrics) {
      const vals = primary.rows.map((r) => Number(r[m.alias]) || 0);
      if (m.fn === "avg") {
        totals[m.alias] = vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : 0;
      } else if (m.fn === "min") totals[m.alias] = vals.length ? Math.min(...vals) : 0;
      else if (m.fn === "max") totals[m.alias] = vals.length ? Math.max(...vals) : 0;
      else totals[m.alias] = Math.round(vals.reduce((a, b) => a + b, 0) * 100) / 100;
    }
    totalsRow = totals;
  }

  if (q.compareTo === "previous_period") {
    const spanMs = until.getTime() - since.getTime();
    const compUntil = new Date(since.getTime() - 24 * 3600 * 1000);
    const compSince = new Date(compUntil.getTime() - spanMs);
    const compRes = runOnce(q, compSince, compUntil);
    const compTotals: Row = { [dimCol]: "Previous period" };
    for (const m of q.metrics) {
      const vals = compRes.rows.map((r) => Number(r[m.alias]) || 0);
      compTotals[m.alias] = m.fn === "avg"
        ? (vals.length ? Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100 : 0)
        : Math.round(vals.reduce((a, b) => a + b, 0) * 100) / 100;
    }
    comparisonRow = compTotals;
    comparisonRange = { since: isoDay(compSince), until: isoDay(compUntil) };

    if (q.withPercentChange && totalsRow) {
      const pct: Row = { [dimCol]: "% Change" };
      for (const m of q.metrics) {
        const cur = Number(totalsRow[m.alias]) || 0;
        const prev = Number(compTotals[m.alias]) || 0;
        pct[m.alias] = prev === 0 ? "—" : `${(((cur - prev) / prev) * 100).toFixed(1)}%`;
      }
      pctChangeRow = pct;
    }
  }

  // ORDER + LIMIT
  let rows = primary.rows;
  if (q.orderBy) {
    rows = [...rows].sort((a, b) => {
      const av = a[q.orderBy!.col]; const bv = b[q.orderBy!.col];
      if (typeof av === "number" && typeof bv === "number") return q.orderBy!.dir === "ASC" ? av - bv : bv - av;
      return q.orderBy!.dir === "ASC" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
  }
  rows = rows.slice(0, q.limit);

  return {
    query: q,
    columns: primary.columns,
    rows,
    totalsRow,
    comparisonRow,
    pctChangeRow,
    resolvedRange: { since: isoDay(since), until: isoDay(until) },
    comparisonRange,
  };
}
