import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TabHeader } from "@/components/tepilot/insights/TabHeader";
import { AutonomousActivityFeed } from "./AutonomousActivityFeed";
import {
  PRODUCT_FLOWS,
  SIGNAL_FAMILIES,
  SIGNAL_FAMILY_COLOR,
  SIGNAL_FAMILY_LABEL,
  getSignalFamily,
  type FlowCategory,
  type ProductFlow,
  type SignalType,
} from "@/lib/productAutomatedFlows";
import { FLOW_MICROSEGMENTS, type FlowMicrosegment } from "@/lib/productMicrosegments";
import { Zap, Play, Sparkles, ChevronDown } from "lucide-react";
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

function MicrosegmentCard({
  signal,
  segment,
  subAudience,
}: {
  signal: ProductFlow["signals"][number];
  segment: FlowMicrosegment | undefined;
  subAudience: number;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 flex flex-col gap-2.5 min-w-0">
      <div className="flex flex-col gap-1">
        <span
          className={cn(
            "self-start text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border",
            SIGNAL_FAMILY_COLOR[getSignalFamily(signal)],
          )}
        >
          {SIGNAL_FAMILY_LABEL[getSignalFamily(signal)]}
        </span>
        <p className="text-[12px] font-semibold text-slate-900 leading-tight">{signal.label}</p>
        <p className="text-[10.5px] text-slate-500 leading-snug">{signal.evidence}</p>
      </div>

      <div className="border-t border-slate-100 pt-2 flex items-start justify-between gap-2">
        <p className="text-[11px] font-semibold text-slate-900 leading-tight flex-1 min-w-0">
          {segment?.title ?? "Microsegment"}
        </p>
        <div className="text-right shrink-0">
          <p className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold leading-none">Audience</p>
          <p className="text-[11px] font-bold text-slate-900 mt-0.5">{formatAudience(subAudience)}</p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <p className="text-[11.5px] font-semibold text-slate-900 leading-snug">{segment?.subject}</p>
        <p className="text-[11px] text-slate-600 leading-snug whitespace-pre-line">{segment?.body}</p>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="h-7 text-[11px] font-medium border-slate-300 text-slate-700 hover:bg-slate-50 mt-auto"
      >
        {segment?.cta ?? "Learn more"}
      </Button>
    </div>
  );
}

function FlowRow({
  flow,
  active,
  expanded,
  onToggle,
  onExpand,
}: {
  flow: ProductFlow;
  active: boolean;
  expanded: boolean;
  onToggle: () => void;
  onExpand: () => void;
}) {
  const Icon = flow.icon;
  const subAudience = Math.round(flow.estimatedAudience / Math.max(1, flow.signals.length));
  const microsegments = FLOW_MICROSEGMENTS[flow.id] ?? [];

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={onExpand}
        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
      >
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
            active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500",
          )}
        >
          {active ? <Play className="w-2.5 h-2.5" /> : null}
          {active ? "Active" : "Paused"}
        </Badge>

        <div onClick={(e) => e.stopPropagation()} className="shrink-0 flex items-center">
          <Switch checked={active} onCheckedChange={onToggle} />
        </div>

        <ChevronDown className={cn("w-4 h-4 text-slate-400 shrink-0 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-3 h-3 text-blue-500" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Microsegments Ventus is enrolling
            </p>
          </div>

          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
            {flow.signals.map((sig, idx) => (
              <MicrosegmentCard
                key={sig.label}
                signal={sig}
                segment={microsegments[idx]}
                subAudience={subAudience}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const FAMILY_DOT: Record<SignalType, string> = {
  behavioral: "bg-blue-500",
  "life-event": "bg-amber-500",
  financial: "bg-emerald-500",
  demographic: "bg-violet-500",
  risk: "bg-rose-500",
};

function SignalRow({
  signal,
  activeIds,
  expanded,
  onExpand,
  onToggleSignal,
  onToggleFlow,
}: {
  signal: TaxonomySignal;
  activeIds: Set<string>;
  expanded: boolean;
  onExpand: () => void;
  onToggleSignal: (on: boolean) => void;
  onToggleFlow: (id: string) => void;
}) {
  const flows = flowsForSignal(signal);
  const activeCount = flows.filter((f) => activeIds.has(f.id)).length;
  const on = activeCount > 0;

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <button
        type="button"
        onClick={onExpand}
        className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
      >
        <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", FAMILY_DOT[signal.family])} />

        <div className="flex items-center gap-2 w-72 shrink-0 min-w-0">
          <span className="text-sm font-semibold text-slate-900 truncate">{signal.label}</span>
          <span
            className={cn(
              "text-[10px] font-medium px-1.5 py-0.5 rounded-full border shrink-0",
              SIGNAL_FAMILY_COLOR[signal.family],
            )}
          >
            {SIGNAL_FAMILY_LABEL[signal.family]}
          </span>
          {signal.weight ? (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-rose-200 bg-rose-50 text-rose-700 shrink-0">
              W{signal.weight}
            </span>
          ) : null}
        </div>

        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 shrink-0">
            <Zap className="w-3 h-3" />
            {flows.length} {flows.length === 1 ? "flow" : "flows"}
          </span>
          <span className="text-xs text-slate-500 truncate">{signal.detection}</span>
        </div>

        <div className="text-right shrink-0 w-28">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold leading-none">Audience</p>
          <p className="text-sm font-bold text-slate-900 mt-0.5">{formatAudience(signalAudience(signal))}</p>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "text-[10px] gap-1 border shrink-0 w-24 justify-center",
            on ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500",
          )}
        >
          {on ? <Play className="w-2.5 h-2.5" /> : null}
          {flows.length === 0 ? "Monitor only" : `${activeCount}/${flows.length} on`}
        </Badge>

        <div onClick={(e) => e.stopPropagation()} className="shrink-0 flex items-center">
          <Switch checked={on} disabled={flows.length === 0} onCheckedChange={(v) => onToggleSignal(v)} />
        </div>

        <ChevronDown className={cn("w-4 h-4 text-slate-400 shrink-0 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Sparkles className="w-3 h-3 text-blue-500" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              {flows.length === 0
                ? "Surveillance signal — routed to risk review, no product enrollment"
                : "Product flows this signal enrolls into"}
            </p>
          </div>

          {flows.length > 0 && (
            <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
              {flows.map((flow) => {
                const FlowIcon = flow.icon;
                return (
                  <div
                    key={flow.id}
                    className="rounded-lg border border-slate-200 bg-white p-2.5 flex items-center gap-2.5 min-w-0"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-900 shrink-0">
                      <FlowIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12px] font-semibold text-slate-900 truncate">{flow.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={cn(
                            "text-[9px] font-medium px-1.5 py-0.5 rounded-full border",
                            CATEGORY_COLOR[flow.category],
                          )}
                        >
                          {flow.category}
                        </span>
                        <span className="text-[10px] text-slate-500">{formatAudience(flow.estimatedAudience)}</span>
                      </div>
                    </div>
                    <Switch
                      checked={activeIds.has(flow.id)}
                      onCheckedChange={() => onToggleFlow(flow.id)}
                      className="shrink-0"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


export function ProductAutomatedFlowsView() {
  const [mode, setMode] = useState<"products" | "signals">("products");
  const [category, setCategory] = useState<FlowCategory | "All">("All");
  const [family, setFamily] = useState<SignalType | "All">("All");
  const [active, setActive] = useState<Set<string>>(
    () => new Set(PRODUCT_FLOWS.filter((p) => p.defaultActive).map((p) => p.id)),
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const byAudience = (a: ProductFlow, b: ProductFlow) => b.estimatedAudience - a.estimatedAudience;

  const flowHasFamily = (flow: ProductFlow, fam: SignalType) =>
    flow.signals.some((s) => getSignalFamily(s) === fam);

  const filtered =
    mode === "signals"
      ? (family === "All" ? [...PRODUCT_FLOWS] : PRODUCT_FLOWS.filter((p) => flowHasFamily(p, family))).sort(byAudience)
      : category === "All"
        ? [...PRODUCT_FLOWS].sort(byAudience)
        : PRODUCT_FLOWS.filter((p) => p.category === category);

  const switchMode = (next: "products" | "signals") => {
    setMode(next);
    setCategory("All");
    setFamily("All");
    setExpandedId(null);
  };

  const toggle = (id: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const pillClass = (selected: boolean) =>
    cn(
      "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
      selected
        ? "bg-slate-900 text-white border-slate-900"
        : "bg-white text-slate-600 border-slate-200 hover:border-slate-400",
    );

  return (
    <div className="space-y-4">
      <TabHeader
        icon={<Zap className="w-4 h-4" />}
        title="Automated Flows"
        subtitle="Always-on per product — Ventus auto-enrolls customers the moment behavioral signals fire"
        howItWorks="Each bank product runs as an always-on flow. Ventus watches transaction, lifecycle, and engagement signals; when a customer crosses the threshold for a product, they are enrolled into that flow's personalized outreach."
        whyItMatters="Replaces calendar-driven campaigns with continuous, signal-driven enrollment so every product is offered when it is most relevant to the customer."
      />

      <AutonomousActivityFeed />

      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5">
            {(["products", "signals"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className={cn(
                  "px-3 py-1 rounded-full text-[11px] font-semibold capitalize transition-all",
                  mode === m ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-700",
                )}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {mode === "products"
              ? CATEGORIES.map((cat) => (
                  <button key={cat} onClick={() => setCategory(cat)} className={pillClass(category === cat)}>
                    {cat}
                    <span className="ml-1.5 opacity-60">
                      {cat === "All" ? PRODUCT_FLOWS.length : PRODUCT_FLOWS.filter((p) => p.category === cat).length}
                    </span>
                  </button>
                ))
              : (["All", ...SIGNAL_FAMILIES] as const).map((fam) => (
                  <button
                    key={fam}
                    onClick={() => setFamily(fam as SignalType | "All")}
                    className={pillClass(family === fam)}
                  >
                    {fam === "All" ? "All" : SIGNAL_FAMILY_LABEL[fam as SignalType]}
                    <span className="ml-1.5 opacity-60">
                      {fam === "All"
                        ? PRODUCT_FLOWS.length
                        : PRODUCT_FLOWS.filter((p) => flowHasFamily(p, fam as SignalType)).length}
                    </span>
                  </button>
                ))}
          </div>
        </div>
        <Badge variant="outline" className="text-xs border-slate-200 bg-white">
          <Play className="w-3 h-3 mr-1 text-emerald-600" />
          {active.size} active of {PRODUCT_FLOWS.length}
        </Badge>
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((flow) => (
          <FlowRow
            key={flow.id}
            flow={flow}
            active={active.has(flow.id)}
            expanded={expandedId === flow.id}
            onToggle={() => toggle(flow.id)}
            onExpand={() => setExpandedId(expandedId === flow.id ? null : flow.id)}
          />
        ))}
      </div>
    </div>
  );
}
