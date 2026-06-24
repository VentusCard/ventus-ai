import { useEffect, useMemo, useState } from "react";
import { Play, Sparkles, Loader2, Terminal, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TabHeader } from "./TabHeader";
import { QueryEditor } from "./query/QueryEditor";
import { QueryChart } from "./query/QueryChart";
import { ReportDataTable, type Column } from "./reports/ReportDataTable";
import { executeQuery, type QueryResult } from "./query/queryDslEngine";
import { SCHEMA } from "./query/queryDataset";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DEFAULT_QUERY = `FROM transactions
SHOW count, sum(amount), avg(amount)
TIMESERIES day WITH TOTALS, PERCENT_CHANGE
SINCE startOfDay(-30d) UNTIL today
COMPARE TO previous_period
ORDER BY day ASC
LIMIT 1000
VISUALIZE count TYPE line`;

const EXAMPLES: { label: string; query: string }[] = [
  { label: "Transactions over time", query: DEFAULT_QUERY },
  {
    label: "Top pillars last 30d",
    query: `FROM transactions
SHOW count, sum(amount)
GROUP BY pillar
SINCE startOfDay(-30d) UNTIL today
ORDER BY sum_amount DESC
LIMIT 20
VISUALIZE sum_amount TYPE bar`,
  },
  {
    label: "Daily spend by region",
    query: `FROM transactions
SHOW sum(amount)
GROUP BY region
SINCE startOfDay(-14d) UNTIL today
ORDER BY sum_amount DESC
LIMIT 20
VISUALIZE sum_amount TYPE bar`,
  },
  {
    label: "Life events last 7 days",
    query: `FROM life_events
SHOW count
GROUP BY event_type
SINCE startOfDay(-7d) UNTIL today
ORDER BY count DESC
LIMIT 20
VISUALIZE count TYPE bar`,
  },
  {
    label: "Affluent customers AUM",
    query: `FROM customers
SHOW count, avg(aum), sum(aum)
GROUP BY segment
ORDER BY sum_aum DESC
LIMIT 10
VISUALIZE sum_aum TYPE bar`,
  },
];

function fmtCell(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "number") return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return String(v);
}

export function QueryConsoleView() {
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [result, setResult] = useState<QueryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);

  const run = (src: string = query) => {
    try {
      const r = executeQuery(src);
      setResult(r);
      setError(null);
      setLastRun(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Query failed");
      setResult(null);
    }
  };

  useEffect(() => { run(DEFAULT_QUERY); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const generate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("generate-analytics-query", {
        body: { prompt, currentQuery: query, schema: SCHEMA },
      });
      if (fnErr) throw fnErr;
      if (!data?.query) throw new Error(data?.error || "No query returned");
      setQuery(data.query);
      run(data.query);
      setPrompt("");
      if (data.explanation) toast({ title: "Query generated", description: data.explanation });
    } catch (e) {
      toast({
        variant: "destructive",
        title: "Generation failed",
        description: e instanceof Error ? e.message : "Try a simpler prompt.",
      });
    } finally {
      setGenerating(false);
    }
  };

  const columns: Column<Record<string, unknown>>[] = useMemo(() => {
    if (!result) return [];
    return result.columns.map((c, i) => ({
      key: c,
      header: c,
      align: i === 0 ? "left" : "right",
      render: (row) => fmtCell(row[c]),
    }));
  }, [result]);

  const summaryRows: Record<string, unknown>[] = useMemo(() => {
    if (!result) return [];
    const out: Record<string, unknown>[] = [];
    if (result.totalsRow) out.push(result.totalsRow as Record<string, unknown>);
    if (result.comparisonRow) out.push(result.comparisonRow as Record<string, unknown>);
    if (result.pctChangeRow) out.push(result.pctChangeRow as Record<string, unknown>);
    return out;
  }, [result]);

  return (
    <div className="space-y-4">
      <TabHeader
        icon={<Terminal className="w-4 h-4" />}
        title="Query"
        subtitle="Ask in plain English or write ShopifyQL-style SQL against the bank's demo tables."
        howItWorks="The console runs a small SQL dialect over an in-memory copy of the demo transactions, customers, life events and deals. Use the AI box to translate plain English into the dialect."
        whyItMatters="Analysts can answer one-off questions in seconds without filing a ticket or learning a new BI tool."
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2">
        <div className="flex items-center gap-2 text-[12px] text-slate-600">
          <span className="px-2 py-1 rounded border border-slate-200 bg-slate-50">Last 30 days</span>
          <span className="px-2 py-1 rounded border border-slate-200 bg-slate-50">Currency: USD</span>
          <span className="text-slate-400">Tables: {Object.keys(SCHEMA).join(", ")}</span>
        </div>
        <div className="flex items-center gap-3">
          {lastRun && <span className="text-[11px] text-slate-400">Last run · {lastRun}</span>}
          <Button onClick={() => run()} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Play className="w-3.5 h-3.5 mr-1.5" /> Run
          </Button>
        </div>
      </div>

      {/* Examples */}
      <div className="flex flex-wrap gap-1.5">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.label}
            onClick={() => { setQuery(ex.query); run(ex.query); }}
            className={cn(
              "px-2.5 py-1 rounded-full border text-[11.5px] transition-colors",
              ex.query === query
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50",
            )}
          >
            {ex.label}
          </button>
        ))}
      </div>

      {/* Editor */}
      <QueryEditor value={query} onChange={setQuery} />

      {/* Refine */}
      <div className="rounded-md border border-slate-200 bg-white p-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !generating) generate(); }}
          placeholder="Describe what you want, e.g. 'wellness spend per region for the last 60 days'"
          className="flex-1 bg-transparent outline-none text-[13px] text-slate-700 placeholder:text-slate-400"
        />
        <Button onClick={generate} disabled={generating || !prompt.trim()} size="sm" variant="outline">
          {generating ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
          {generating ? "Generating…" : "Generate"}
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-[12.5px] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <div className="font-medium">Query error</div>
            <div className="text-rose-600/90">{error}</div>
          </div>
        </div>
      )}

      {result && (
        <>
          {result.query.visualize && <QueryChart result={result} />}

          {summaryRows.length > 0 && (
            <ReportDataTable
              columns={columns}
              rows={summaryRows}
              rowKey={(_r, i) => `s-${i}`}
              caption={`Summary · ${result.resolvedRange.since} → ${result.resolvedRange.until}${result.comparisonRange ? ` vs ${result.comparisonRange.since} → ${result.comparisonRange.until}` : ""}`}
            />
          )}

          <ReportDataTable
            columns={columns}
            rows={result.rows as Record<string, unknown>[]}
            rowKey={(_r, i) => `r-${i}`}
            caption={`${result.query.from} · ${result.rows.length} row${result.rows.length === 1 ? "" : "s"}`}
            emptyLabel="No matching rows"
          />
        </>
      )}
    </div>
  );
}
