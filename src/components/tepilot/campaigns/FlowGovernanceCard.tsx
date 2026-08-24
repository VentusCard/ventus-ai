import {
  Boxes,
  Radar,
  Megaphone,
  UserCheck,
  ChevronRight,
  Smartphone,
  Mail,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FLOW_GOVERNANCE, CHANNEL_STATS } from "./data/flowGovernance";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type StageState = "complete" | "pending" | "neutral";

interface Stage {
  key: string;
  label: string;
  shortLabel: string;
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
    shortLabel: "Products",
    icon: Boxes,
    value: G.products.total.toString(),
    detail: `${G.products.active} active · ${G.products.draft} draft`,
    chip: "Auto",
    state: "complete",
  },
  {
    key: "signals",
    label: "Signals assigned",
    shortLabel: "Signals",
    icon: Radar,
    value: G.signals.total.toString(),
    detail: `${G.signals.avgPerProduct} avg / product · ${G.signals.custom} custom`,
    chip: "Auto",
    state: "complete",
  },
  {
    key: "marketing",
    label: "Marketing approval",
    shortLabel: "Marketing",
    icon: Megaphone,
    value: `${G.marketing.pending}`,
    detail: `${G.marketing.approved} approved · ${G.marketing.lastReviewed}`,
    chip: "Pending",
    state: "pending",
  },
  {
    key: "owner",
    label: "Product owner approval",
    shortLabel: "Owner sign-off",
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

const VALUE_TONE: Record<StageState, string> = {
  complete: "text-slate-900",
  pending: "text-amber-600",
  neutral: "text-slate-900",
};

const CHANNEL_ICON = { digital: Smartphone, email: Mail, sms: MessageSquare } as const;

const CHANNEL_STATUS_DOT: Record<string, string> = {
  Live: "bg-emerald-500",
  Capped: "bg-amber-500",
  Held: "bg-slate-400",
};

const CHANNEL_STATUS_TONE: Record<string, string> = {
  Live: "text-emerald-700 bg-emerald-50 border-emerald-200",
  Capped: "text-amber-700 bg-amber-50 border-amber-200",
  Held: "text-slate-600 bg-slate-50 border-slate-200",
};

function StageTile({ stage, isLast }: { stage: Stage; isLast: boolean }) {
  const Icon = stage.icon;
  return (
    <div className="flex items-center gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 hover:border-slate-300 hover:shadow-sm transition-all cursor-default min-w-0">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-slate-50 shrink-0">
              <Icon className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold text-slate-700 truncate">
                  {stage.shortLabel}
                </span>
                <span
                  className={cn(
                    "text-[9px] font-semibold uppercase tracking-wider px-1 py-0 rounded-full border shrink-0",
                    CHIP_TONE[stage.state],
                  )}
                >
                  {stage.chip}
                </span>
              </div>
              <p
                className={cn(
                  "text-[17px] font-bold tabular-nums leading-tight mt-0.5",
                  VALUE_TONE[stage.state],
                )}
              >
                {stage.value}
              </p>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-1">
            <p className="text-[12px] font-semibold text-slate-900">{stage.label}</p>
            <p className="text-[11px] text-slate-500">{stage.detail}</p>
          </div>
        </TooltipContent>
      </Tooltip>
      {!isLast && <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />}
    </div>
  );
}

function ChannelCluster() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 hover:border-slate-300 hover:shadow-sm transition-all cursor-default min-w-0">
          <div className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-50 shrink-0">
            <Smartphone className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-700 truncate">Channels</span>
              <span className="text-[9px] font-semibold uppercase tracking-wider px-1 py-0 rounded-full border bg-blue-50 text-blue-700 border-blue-200 shrink-0">
                Executing
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {CHANNEL_STATS.map((c) => {
                const Icon = CHANNEL_ICON[c.id];
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50/70 pl-1.5 pr-2 py-0.5"
                  >
                    <Icon className="w-3 h-3 text-slate-500" />
                    <span className="text-[11px] font-semibold text-slate-800 tabular-nums">
                      {c.flows}
                    </span>
                    <span
                      className={cn("w-1.5 h-1.5 rounded-full", CHANNEL_STATUS_DOT[c.status])}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-xs">
        <div className="space-y-2">
          <p className="text-[12px] font-semibold text-slate-900">Channels assigned</p>
          {CHANNEL_STATS.map((c) => {
            const Icon = CHANNEL_ICON[c.id];
            return (
              <div key={c.id} className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 text-slate-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-slate-800">{c.label}</p>
                  <p className="text-[10px] text-slate-500">{c.reach}</p>
                </div>
                <span
                  className={cn(
                    "text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0",
                    CHANNEL_STATUS_TONE[c.status],
                  )}
                >
                  {c.status}
                </span>
              </div>
            );
          })}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

export function FlowGovernanceCard() {
  const livePct = Math.round((G.live / Math.max(G.products.total, 1)) * 100);

  return (
    <TooltipProvider delayDuration={150}>
      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between gap-3 px-3 py-2 border-b border-slate-200">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="relative flex items-center justify-center w-5 h-5">
              <span className="absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-60 animate-ping" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
            </div>
            <span className="text-[12px] font-semibold text-slate-800">
              Flow governance
            </span>
            <span className="text-[11px] text-slate-400 truncate hidden md:inline">
              how automated flows reach customers
            </span>
          </div>
        </div>

        <div className="px-3 py-2.5">
          <div className="flex flex-wrap items-center gap-x-1 gap-y-2">
            {STAGES.map((s, i) => (
              <StageTile key={s.key} stage={s} isLast={i === STAGES.length - 1} />
            ))}
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <ChannelCluster />
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all"
                style={{ width: `${livePct}%` }}
              />
            </div>
            <span className="text-[10.5px] text-slate-500 tabular-nums shrink-0">
              {livePct}% live · {G.live} of {G.products.total} products
            </span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
