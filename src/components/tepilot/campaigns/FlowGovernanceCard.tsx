import { Boxes, Radar, Megaphone, UserCheck, ChevronRight, Smartphone, Mail, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { FLOW_GOVERNANCE, CHANNEL_STATS } from "./data/flowGovernance";

type StageState = "complete" | "pending" | "neutral";

interface Stage {
  key: string;
  label: string;
  icon: React.ElementType;
  value: string;
  detail: string;
  chip: string;
  state: StageState;
}

const G = FLOW_GOVERNANCE;

const STAGES: Stage[] = [
  {
    key: "products",
    label: "Products mapped",
    icon: Boxes,
    value: G.products.total.toString(),
    detail: `${G.products.active} active · ${G.products.draft} draft`,
    chip: "Auto",
    state: "complete",
  },
  {
    key: "signals",
    label: "Signals assigned",
    icon: Radar,
    value: G.signals.total.toString(),
    detail: `${G.signals.avgPerProduct} avg / product · ${G.signals.custom} custom`,
    chip: "Auto",
    state: "complete",
  },
  {
    key: "marketing",
    label: "Marketing approval",
    icon: Megaphone,
    value: `${G.marketing.pending}`,
    detail: `${G.marketing.approved} approved · ${G.marketing.lastReviewed}`,
    chip: "Pending",
    state: "pending",
  },
  {
    key: "owner",
    label: "Product owner approval",
    icon: UserCheck,
    value: `${G.owner.pending}`,
    detail: `${G.owner.approved} signed off · oldest: ${G.owner.oldestOwner}`,
    chip: "Pending",
    state: "pending",
  },
];

const CHIP_TONE: Record<StageState, string> = {
  complete: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  neutral: "bg-slate-50 text-slate-600 border-slate-200",
};

const CHANNEL_ICON = { digital: Smartphone, email: Mail, sms: MessageSquare } as const;

const CHANNEL_TONE: Record<string, string> = {
  Live: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Capped: "bg-amber-50 text-amber-700 border-amber-200",
  Held: "bg-slate-50 text-slate-600 border-slate-200",
};

export function FlowGovernanceCard() {
  const livePct = Math.round((G.live / Math.max(G.products.total, 1)) * 100);

  return (
    <div className="rounded-lg border border-slate-200 bg-white">
      <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-slate-200">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="relative flex items-center justify-center w-5 h-5">
            <span className="absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-60 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[12px] font-semibold text-slate-800">
            Flow governance — how automated flows reach customers
          </span>
          <span className="text-[11px] text-slate-400 truncate hidden md:inline">
            every stage runs inside your guardrails
          </span>
        </div>
        <span className="text-[11px] font-medium text-slate-500 shrink-0 tabular-nums">
          {G.live} of {G.products.total} live
        </span>
      </div>

      <div className="p-3">
        <div className="flex flex-col xl:flex-row items-stretch gap-2">
          {STAGES.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={s.key} className="flex items-stretch gap-2 flex-1 min-w-0">
                <div className="flex-1 min-w-0 rounded-md border border-slate-200 bg-white px-3 py-2.5 hover:border-slate-300 hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500 truncate">
                        {s.label}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-[9.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0",
                        CHIP_TONE[s.state],
                      )}
                    >
                      {s.chip}
                    </span>
                  </div>
                  <p
                    className={cn(
                      "mt-1 text-[20px] font-bold tabular-nums leading-none",
                      s.state === "pending" ? "text-amber-600" : "text-slate-900",
                    )}
                  >
                    {s.value}
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500 truncate">{s.detail}</p>
                </div>
                {i < STAGES.length - 1 && (
                  <div className="hidden xl:flex items-center shrink-0">
                    <ChevronRight className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            );
          })}

          <div className="hidden xl:flex items-center shrink-0">
            <ChevronRight className="w-4 h-4 text-slate-300" />
          </div>

          {/* Channels stage */}
          <div className="xl:w-[300px] shrink-0 rounded-md border border-slate-200 bg-slate-50/70 px-3 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-500">
                Channels assigned
              </span>
              <span className="text-[9.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                Executing
              </span>
            </div>
            <div className="mt-1.5 space-y-1">
              {CHANNEL_STATS.map((c) => {
                const Icon = CHANNEL_ICON[c.id];
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2 py-1.5"
                  >
                    <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[11.5px] font-semibold text-slate-800 leading-tight truncate">
                        {c.label}
                      </p>
                      <p className="text-[10.5px] text-slate-500 truncate">{c.reach}</p>
                    </div>
                    <span className="text-[12px] font-bold text-slate-900 tabular-nums shrink-0">
                      {c.flows}
                    </span>
                    <span
                      className={cn(
                        "text-[9.5px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0",
                        CHANNEL_TONE[c.status],
                      )}
                    >
                      {c.status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-2.5 flex items-center gap-2">
          <div className="h-1 flex-1 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${livePct}%` }}
            />
          </div>
          <span className="text-[10.5px] text-slate-500 tabular-nums shrink-0">
            {livePct}% of mapped products cleared both approvals and are live on a channel
          </span>
        </div>
      </div>
    </div>
  );
}
