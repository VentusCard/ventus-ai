import { useMemo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TabHeader } from "@/components/tepilot/insights/TabHeader";
import { AutonomousActivityFeed } from "./AutonomousActivityFeed";
import { PRODUCT_FLOWS, type FlowCategory, type ProductFlow } from "@/lib/productAutomatedFlows";
import {
  expandFlowSignals,
  enabledAudience,
  signalAudience,
  SIGNAL_FAMILY_CLASS,
  SIGNAL_FAMILY_LABEL,
  type ExpandedSignal,
} from "@/lib/flowSignalFamilies";
import { Zap, Play, Sparkles, ChevronDown, ChevronRight, Mail } from "lucide-react";
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

function SignalDetail({ signal, audience }: { signal: ExpandedSignal; audience: number }) {
  const msg = signal.message;
  return (
    <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3 grid gap-3 md:grid-cols-2">
      <div className="space-y-2 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border",
              SIGNAL_FAMILY_CLASS[signal.family],
            )}
          >
            {SIGNAL_FAMILY_LABEL[signal.family]}
          </span>
          <p className="text-[11px] font-semibold text-slate-900 truncate">{msg.title}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Why this fires</p>
          <p className="text-[11px] text-slate-600 leading-snug mt-0.5">{signal.evidence}</p>
        </div>
        <div className="flex items-center gap-4">
          <div>
            <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Microsegment</p>
            <p className="text-[11px] font-bold text-slate-900">{formatAudience(audience)} customers</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {signal.channels.map((c) => (
              <span
                key={c}
                className="text-[9.5px] font-medium px-1.5 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600"
              >
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50/70 p-2.5 flex flex-col gap-1.5 min-w-0">
        <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-wider text-slate-400 font-semibold">
          <Mail className="w-3 h-3" />
          Personalized message
        </div>
        <p className="text-[11.5px] font-semibold text-slate-900 leading-snug">{msg.subject}</p>
        <p className="text-[11px] text-slate-600 leading-snug whitespace-pre-line">{msg.body}</p>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[11px] font-medium border-slate-300 text-slate-700 hover:bg-slate-50 mt-auto self-start"
        >
          {msg.cta}
        </Button>
      </div>
    </div>
  );
}

function SignalRow({
  signal,
  audience,
  enabled,
  open,
  onToggle,
  onOpen,
}: {
  signal: ExpandedSignal;
  audience: number;
  enabled: boolean;
  open: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className={cn("flex items-center gap-3 px-3 py-2", !enabled && "opacity-50")}>
        <button type="button" onClick={onOpen} className="flex-1 min-w-0 text-left flex items-center gap-3">
          <div className="flex-1 min-w-0 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={cn(
                  "text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0",
                  SIGNAL_FAMILY_CLASS[signal.family],
                )}
              >
                {SIGNAL_FAMILY_LABEL[signal.family]}
              </span>
              <p className="text-[12px] font-semibold text-slate-900 leading-tight truncate">{signal.label}</p>
            </div>
            <p className="text-[10.5px] text-slate-500 leading-snug truncate">{signal.evidence}</p>
          </div>
          <div className="text-right shrink-0 w-20">
            <p className="text-[8px] uppercase tracking-wider text-slate-400 font-semibold leading-none">Audience</p>
            <p className="text-[11px] font-bold text-slate-900 mt-0.5">{formatAudience(audience)}</p>
          </div>
          <ChevronRight className={cn("w-4 h-4 text-slate-400 shrink-0 transition-transform", open && "rotate-90")} />
        </button>
        <div onClick={(e) => e.stopPropagation()} className="shrink-0 flex items-center">
          <Switch checked={enabled} onCheckedChange={onToggle} />
        </div>
      </div>
      {open && (
        <div className="px-3 pb-3">
          <SignalDetail signal={signal} audience={audience} />
        </div>
      )}
    </div>
  );
}

function FlowRow({
  flow,
  active,
  expanded,
  enabledSignals,
  onSetEnabled,
  onToggle,
  onExpand,
}: {
  flow: ProductFlow;
  active: boolean;
  expanded: boolean;
  enabledSignals: Set<string>;
  onSetEnabled: (next: Set<string>) => void;
  onToggle: () => void;
  onExpand: () => void;
}) {
  const Icon = flow.icon;
  const signals = useMemo(() => expandFlowSignals(flow), [flow]);
  const [openSignal, setOpenSignal] = useState<string | null>(null);

  const enabledCount = signals.filter((s) => enabledSignals.has(s.id)).length;
  const liveAudience = enabledAudience(flow, signals, enabledSignals);
  const isActive = active && enabledCount > 0;

  const toggleSignal = (id: string) => {
    const next = new Set(enabledSignals);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSetEnabled(next);
  };

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
            {enabledCount} of {signals.length} signals
          </span>
          <span className="text-xs text-slate-500 truncate">{flow.positioning}</span>
        </div>

        <div className="text-right shrink-0 w-28">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold leading-none">Audience</p>
          <p className="text-sm font-bold text-slate-900 mt-0.5">{formatAudience(liveAudience)}</p>
        </div>

        <Badge
          variant="outline"
          className={cn(
            "text-[10px] gap-1 border shrink-0 w-16 justify-center",
            isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500",
          )}
        >
          {isActive ? <Play className="w-2.5 h-2.5" /> : null}
          {isActive ? "Active" : "Paused"}
        </Badge>

        <div onClick={(e) => e.stopPropagation()} className="shrink-0 flex items-center">
          <Switch checked={active} onCheckedChange={onToggle} />
        </div>

        <ChevronDown className={cn("w-4 h-4 text-slate-400 shrink-0 transition-transform", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60 space-y-2">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-blue-500" />
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
              Signals this flow acts on — toggle any off, click to see the personalization
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            {signals.map((sig) => (
              <SignalRow
                key={sig.id}
                signal={sig}
                audience={signalAudience(flow, signals, enabledSignals, sig)}
                enabled={enabledSignals.has(sig.id)}
                open={openSignal === sig.id}
                onToggle={() => toggleSignal(sig.id)}
                onOpen={() => setOpenSignal(openSignal === sig.id ? null : sig.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}


export function ProductAutomatedFlowsView() {
  const [category, setCategory] = useState<FlowCategory | "All">("All");
  const [active, setActive] = useState<Set<string>>(
    () => new Set(PRODUCT_FLOWS.filter((p) => p.defaultActive).map((p) => p.id)),
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [signalState, setSignalState] = useState<Record<string, Set<string>>>({});

  const enabledFor = (flow: ProductFlow) =>
    signalState[flow.id] ?? new Set(expandFlowSignals(flow).map((s) => s.id));

  const setEnabledFor = (flowId: string, next: Set<string>) =>
    setSignalState((prev) => ({ ...prev, [flowId]: next }));

  const filtered =
    category === "All"
      ? [...PRODUCT_FLOWS].sort((a, b) => b.estimatedAudience - a.estimatedAudience)
      : PRODUCT_FLOWS.filter((p) => p.category === category);

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
        subtitle="Always-on per product — Ventus auto-enrolls customers the moment behavioral signals fire"
        howItWorks="Each bank product runs as an always-on flow. Ventus watches transaction, lifecycle, and engagement signals; when a customer crosses the threshold for a product, they are enrolled into that flow's personalized outreach."
        whyItMatters="Replaces calendar-driven campaigns with continuous, signal-driven enrollment so every product is offered when it is most relevant to the customer."
      />

      <AutonomousActivityFeed />

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
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400",
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
          <FlowRow
            key={flow.id}
            flow={flow}
            active={active.has(flow.id)}
            expanded={expandedId === flow.id}
            enabledSignals={enabledFor(flow)}
            onSetEnabled={(next) => setEnabledFor(flow.id, next)}
            onToggle={() => toggle(flow.id)}

            onExpand={() => setExpandedId(expandedId === flow.id ? null : flow.id)}
          />
        ))}
      </div>
    </div>
  );
}
