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

function FlowCard({
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
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="flex items-start gap-3 p-4 border-b border-slate-100">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-slate-900 shrink-0">
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-slate-900 leading-tight">{flow.name}</h3>
            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-full border", CATEGORY_COLOR[flow.category])}>
              {flow.category}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1 leading-snug">{flow.positioning}</p>
        </div>
        <Switch checked={active} onCheckedChange={onToggle} className="shrink-0 mt-1" />
      </div>

      <div className="p-4 flex-1">
        <div className="flex items-center gap-1.5 mb-2">
          <Sparkles className="w-3 h-3 text-blue-500" />
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            Signals Ventus is detecting
          </p>
        </div>
        <ul className="space-y-2">
          {flow.signals.map((sig) => (
            <li key={sig.label} className="text-xs">
              <div className="flex items-start gap-2">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 leading-tight">{sig.label}</p>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{sig.evidence}</p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60 rounded-b-xl flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Triggered audience</p>
          <p className="text-sm font-bold text-slate-900">{formatAudience(flow.estimatedAudience)}</p>
        </div>
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] gap-1 border",
            active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500"
          )}
        >
          {active ? <Play className="w-2.5 h-2.5" /> : null}
          {active ? "Active" : "Paused"}
        </Badge>
      </div>
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((flow) => (
          <FlowCard key={flow.id} flow={flow} active={active.has(flow.id)} onToggle={() => toggle(flow.id)} />
        ))}
      </div>
    </div>
  );
}
