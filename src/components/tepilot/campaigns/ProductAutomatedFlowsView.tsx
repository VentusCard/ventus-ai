import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { TabHeader } from "@/components/tepilot/insights/TabHeader";
import { PRODUCT_FLOWS, type FlowCategory, type ProductFlow } from "@/lib/productAutomatedFlows";
import { Zap, Play, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES: (FlowCategory | "All")[] = ["All", "Lending", "Wealth", "Deposits", "Cards", "Insurance"];

const CATEGORY_COLOR: Record<FlowCategory, string> = {
  Lending: "bg-blue-50 text-blue-700 border-blue-200",
  Wealth: "bg-violet-50 text-violet-700 border-violet-200",
  Deposits: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cards: "bg-amber-50 text-amber-700 border-amber-200",
  Insurance: "bg-rose-50 text-rose-700 border-rose-200",
};

function formatAudience(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toString();
}

function FlowRow({
  flow,
  active,
  onToggle,
}: {
  flow: ProductFlow;
  active: boolean;
  onToggle: () => void;
}) {
  const Icon = flow.icon;
  return (
    <div className="flex items-center gap-4 px-4 py-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors">
      <div className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-900 shrink-0">
        <Icon className="w-4 h-4 text-white" />
      </div>

      <div className="flex items-center gap-2 w-64 shrink-0 min-w-0">
        <span className="text-sm font-semibold text-slate-900 truncate">{flow.name}</span>
        <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full border shrink-0", CATEGORY_COLOR[flow.category])}>
          {flow.category}
        </span>
      </div>

      <div className="flex-1 min-w-0 flex items-center gap-3">
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 shrink-0">
          <Sparkles className="w-3 h-3" />
          {flow.signals.length} {flow.signals.length === 1 ? "signal" : "signals"}
        </span>
        <span className="text-xs text-slate-500 truncate">{flow.positioning}</span>
      </div>

      <div className="text-right shrink-0 w-28">
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold leading-none">Audience</p>
        <p className="text-sm font-bold text-slate-900 mt-0.5">{formatAudience(flow.estimatedAudience)}</p>
      </div>

      <Badge
        variant="outline"
        className={cn(
          "text-[10px] gap-1 border shrink-0 w-16 justify-center",
          active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500"
        )}
      >
        {active ? <Play className="w-2.5 h-2.5" /> : null}
        {active ? "Active" : "Paused"}
      </Badge>

      <Switch checked={active} onCheckedChange={onToggle} className="shrink-0" />
    </div>
  );
}

export function ProductAutomatedFlowsView() {
  const [category, setCategory] = useState<FlowCategory | "All">("All");
  const [active, setActive] = useState<Set<string>>(
    () => new Set(PRODUCT_FLOWS.filter((p) => p.defaultActive).map((p) => p.id))
  );

  const filtered = category === "All" ? PRODUCT_FLOWS : PRODUCT_FLOWS.filter((p) => p.category === category);

  const toggle = (id: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <TabHeader
        icon={<Zap className="w-4 h-4" />}
        title="Automated Flows"
        subtitle="Always-on, product-first detection — Ventus enrolls customers when behavioral signals fire"
        howItWorks="Each bank product runs as an always-on flow. Ventus watches transaction, lifecycle, and engagement signals; when a customer crosses the threshold for a product, they are enrolled into that flow's personalized outreach."
        whyItMatters="Replaces calendar-driven campaigns with continuous, signal-driven enrollment so every product is offered when it is most relevant to the customer."
      />

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                category === cat
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              )}
            >
              {cat}
              <span className="ml-1.5 opacity-60">
                {cat === "All" ? PRODUCT_FLOWS.length : PRODUCT_FLOWS.filter((p) => p.category === cat).length}
              </span>
            </button>
          ))}
        </div>
        <Badge variant="outline" className="text-xs border-slate-200 bg-white">
          <Play className="w-3 h-3 mr-1 text-emerald-600" />
          {active.size} active of {PRODUCT_FLOWS.length}
        </Badge>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((flow) => (
          <FlowRow key={flow.id} flow={flow} active={active.has(flow.id)} onToggle={() => toggle(flow.id)} />
        ))}
      </div>
    </div>
  );
}
