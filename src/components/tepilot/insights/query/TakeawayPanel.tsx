import { useEffect, useState } from "react";
import { Sparkles, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getDateRange } from "./queryDataset";

interface TakeawayPanelProps {
  sql: string;
  columns: string[];
  rows: Record<string, unknown>[];
  cacheKey: string;
  onClose: () => void;
}

const cache = new Map<string, string>();

export function TakeawayPanel({ sql, columns, rows, cacheKey, onClose }: TakeawayPanelProps) {
  const [text, setText] = useState<string | null>(cache.get(cacheKey) ?? null);
  const [loading, setLoading] = useState(!cache.has(cacheKey));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache.has(cacheKey)) { setText(cache.get(cacheKey)!); setLoading(false); return; }
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data, error: fnErr } = await supabase.functions.invoke("summarize-query-result", {
          body: { sql, columns, rows: rows.slice(0, 100), dateContext: getDateRange() },
        });
        if (fnErr) throw fnErr;
        if (!data?.takeaway) throw new Error(data?.error || "No takeaway returned");
        if (cancelled) return;
        cache.set(cacheKey, data.takeaway);
        setText(data.takeaway);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Couldn't summarize this result.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey]);

  return (
    <div className="rounded-md border border-blue-200 bg-blue-50/60 px-3.5 py-3 text-[13px] text-slate-800">
      <div className="flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div className="flex-1 leading-relaxed">
          <div className="text-[11px] uppercase tracking-wider font-semibold text-blue-700 mb-1">AI takeaway</div>
          {loading && (
            <div className="flex items-center gap-2 text-slate-500"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Reading the result…</div>
          )}
          {error && <div className="text-rose-600">{error}</div>}
          {text && <div className="whitespace-pre-wrap">{text}</div>}
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-blue-100 text-slate-500" aria-label="Close takeaway">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
