import { useEffect, useMemo, useState } from "react";
import { Play, Sparkles, Loader2, Terminal, AlertCircle, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TabHeader } from "./TabHeader";
import { QueryEditor } from "./query/QueryEditor";
import { QueryChart, pickChartSpec, type ChartSpec } from "./query/QueryChart";
import { ReportDataTable, type Column } from "./reports/ReportDataTable";
import { executeSql, SCHEMA, SCHEMA_HINTS, type SqlResult } from "./query/sqlEngine";
import { getDateRange } from "./query/queryDataset";
import { ResultActionsBar } from "./query/ResultActionsBar";
import { TakeawayPanel } from "./query/TakeawayPanel";
import { EmailResultDialog } from "./query/EmailResultDialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const DEFAULT_QUERY = `-- Daily transaction volume and revenue, last 30 days
-- @chart line:total_spend
SELECT day,
       COUNT(*)           AS orders,
       ROUND(SUM(amount)) AS total_spend
FROM   transactions
GROUP BY day
ORDER BY day ASC`;

const EXAMPLES: { label: string; query: string }[] = [
  { label: "Volume over time", query: DEFAULT_QUERY },
  {
    label: "Top pillars",
    query: `-- Spend and order volume by lifestyle pillar
SELECT pillar,
       COUNT(*)           AS orders,
       ROUND(SUM(amount)) AS spend,
       ROUND(AVG(amount)) AS avg_ticket
FROM   transactions
GROUP BY pillar
ORDER BY spend DESC`,
  },
  {
    label: "Life events by type",
    query: `-- Detected life events with average confidence
SELECT event_type,
       COUNT(*)            AS events,
       ROUND(AVG(confidence), 2) AS avg_confidence,
       SUM(evidence_count) AS evidence_signals
FROM   life_events
GROUP BY event_type
ORDER BY events DESC`,
  },
  {
    label: "Premium shoppers × pillar",
    query: `-- Premium/Luxury shoppers per lifestyle pillar
SELECT pillar,
       spending_tier,
       COUNT(*)                AS customers,
       ROUND(AVG(avg_ticket))  AS typical_ticket
FROM   shopping_habits
WHERE  spending_tier IN ('Premium','Luxury')
GROUP BY pillar, spending_tier
ORDER BY customers DESC`,
  },
  {
    label: "Wallet-share leakage",
    query: `-- Where customers are sending money outside the bank
SELECT competitor_merchant,
       category,
       COUNT(DISTINCT customer_id) AS customers,
       ROUND(SUM(outflow_amount))  AS leaked_dollars
FROM   wallet_share
GROUP BY competitor_merchant, category
ORDER BY leaked_dollars DESC`,
  },
  {
    label: "Deal redemptions × segment",
    query: `-- Deal performance by customer segment
SELECT c.segment,
       d.brand,
       COUNT(*)                    AS redemptions,
       ROUND(SUM(r.redeemed_amount)) AS revenue
FROM   deal_redemptions r
JOIN   customers c ON c.customer_id = r.customer_id
JOIN   deals     d ON d.deal_id     = r.deal_id
GROUP BY c.segment, d.brand
ORDER BY revenue DESC
LIMIT 20`,
  },
  {
    label: "Life events × spend",
    query: `-- Average pillar spend for customers with each life event
SELECT le.event_type,
       sh.pillar,
       COUNT(DISTINCT sh.customer_id) AS customers,
       ROUND(AVG(sh.total_spend))     AS avg_pillar_spend
FROM   life_events le
JOIN   shopping_habits sh ON sh.customer_id = le.customer_id
GROUP BY le.event_type, sh.pillar
ORDER BY avg_pillar_spend DESC
LIMIT 25`,
  },
];

function fmtCell(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "number") return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
  return String(v);
}

interface QueryConsoleViewProps {
  initialQuery?: string;
}

export function QueryConsoleView({ initialQuery }: QueryConsoleViewProps = {}) {
  const [query, setQuery] = useState(initialQuery || DEFAULT_QUERY);
  const [result, setResult] = useState<SqlResult | null>(null);
  const [chartSpec, setChartSpec] = useState<ChartSpec | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [takeawayOpen, setTakeawayOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [runId, setRunId] = useState(0);

  const run = (src: string = query) => {
    try {
      const r = executeSql(src);
      setResult(r);
      setChartSpec(pickChartSpec(src, r.columns, r.rows));
      setError(null);
      setLastRun(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      setTakeawayOpen(false);
      setRunId((n) => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Query failed");
      setResult(null);
      setChartSpec(null);
      setTakeawayOpen(false);
    }
  };

  useEffect(() => { run(initialQuery || DEFAULT_QUERY); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  // React to a new initialQuery from the parent (e.g. opening a report into the console)
  useEffect(() => {
    if (initialQuery && initialQuery !== query) {
      setQuery(initialQuery);
      run(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery]);

  const generate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke("generate-analytics-query", {
        body: { prompt, currentQuery: query, schema: SCHEMA, schemaHints: SCHEMA_HINTS, dateContext: getDateRange() },
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

  return (
    <div className="space-y-4">
      <TabHeader
        icon={<Terminal className="w-4 h-4" />}
        title="Query"
        subtitle="Standard SQL over Ventus tables — transactions, customers, life events, shopping habits, wallet share, deals."
        howItWorks="The console runs SELECT statements (with JOINs, GROUP BY, aggregates) against an in-memory copy of the bank's Ventus-enriched data. Use the AI box to translate plain English into SQL."
        whyItMatters="Analysts can answer ad-hoc questions across transactions and behavioral signals without filing a ticket."
      />

      {/* Toolbar */}
      <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2">
        <div className="flex items-center gap-2 text-[12px] text-slate-600">
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 px-2 py-1 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100">
                <Database className="w-3.5 h-3.5 text-slate-500" />
                Schema · {Object.keys(SCHEMA).length} tables
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-[420px] p-0 bg-white border-slate-200" align="start">
              <div className="px-3 py-2 border-b border-slate-100 text-[11px] uppercase tracking-wider font-semibold text-slate-400">Tables</div>
              <div className="max-h-[360px] overflow-auto divide-y divide-slate-100">
                {Object.entries(SCHEMA).map(([table, cols]) => (
                  <div key={table} className="px-3 py-2">
                    <div className="text-[12.5px] font-medium text-slate-800 font-mono">{table}</div>
                    <div className="text-[11.5px] text-slate-500 mt-0.5 leading-relaxed">{cols.join(", ")}</div>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <span className="text-slate-400">SELECT only · joins + aggregates supported</span>
        </div>
        <div className="flex items-center gap-3">
          {lastRun && <span className="text-[11px] text-slate-400">Last run · {lastRun}</span>}
          <Button onClick={() => run()} size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Play className="w-3.5 h-3.5 mr-1.5" /> Run
          </Button>
        </div>
      </div>

      {/* Refine */}
      <div className="rounded-md border border-slate-200 bg-white p-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-blue-500 shrink-0" />
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !generating) generate(); }}
          placeholder="Describe what you want, e.g. 'top 5 brands redeemed by Affluent customers in the last 60 days'"
          className="flex-1 bg-transparent outline-none text-[13px] text-slate-700 placeholder:text-slate-400"
        />
        <Button onClick={generate} disabled={generating || !prompt.trim()} size="sm" variant="outline">
          {generating ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 mr-1.5" />}
          {generating ? "Generating…" : "Generate"}
        </Button>
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

      {error && (
        <div className="rounded-md border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-[12.5px] flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <div className="font-medium">Query error</div>
            <div className="text-rose-600/90 font-mono">{error}</div>
          </div>
        </div>
      )}

      {result && (
        <>
          {chartSpec && <QueryChart rows={result.rows} spec={chartSpec} />}
          <ReportDataTable
            columns={columns}
            rows={result.rows}
            rowKey={(_r, i) => `r-${i}`}
            caption={`${result.rowCount} row${result.rowCount === 1 ? "" : "s"}`}
            emptyLabel="No matching rows"
          />
        </>
      )}
    </div>
  );
}
