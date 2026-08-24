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

const G = FLOW_GOVERNANCE;

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
    detail: `${G.signals.avgPerProduct} avg / product`,
    chip: "Auto",
    state: "complete",
  },
  {
    key: "marketing",
    label: "Marketing approval",
    icon: Megaphone,
    value: G.marketing.pending.toString(),
    detail: `${G.marketing.approved} approved · reviewed 2h ago`,
    chip: "Pending",
    state: "pending",
  },
  {
    key: "owner",
    label: "Product owner approval",
    icon: UserCheck,
    value: G.owner.pending.toString(),
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

function StageTile({ stage, index }: { stage: Stage; index: number }) {
  const Icon = stage.icon;
  return (
    <div className="flex flex-1 items-stretch min-w-0">
      <div className="flex-1 px-3 py-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-50 shrink-0">
              <Icon className="w-4 h-4 text-slate-500" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-700 leading-tight line-clamp-2">
                {stage.label}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0",
              CHIP_TONE[stage.state],
            )}
          >
            {stage.chip}
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span
            className={cn(
              "text-[26px] font-bold tabular-nums leading-none",
              VALUE_TONE[stage.state],
            )}
          >
            {stage.value}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            stage {index + 1}
          </span>
        </div>

        <p className="mt-1.5 text-[11px] text-slate-500 leading-snug line-clamp-2">
          {stage.detail}
        </p>
      </div>
      <div className="flex items-center pr-1">
        <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
      </div>
    </div>
  );
}

function ChannelTile() {
  return (
    <div className="flex flex-1 items-stretch min-w-0">
      <div className="flex-1 px-3 py-3 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-blue-50 shrink-0">
              <Smartphone className="w-4 h-4 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-slate-700 truncate">
                Channels assigned
              </p>
            </div>
          </div>
          <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded-full border shrink-0 bg-blue-50 text-blue-700 border-blue-200">
            Executing
          </span>
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[26px] font-bold tabular-nums leading-none text-slate-900">
            {CHANNEL_STATS.reduce((n, c) => n + c.flows, 0)}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            stage 5
          </span>
        </div>

        <div className="mt-2 flex flex-col gap-1.5">
          {CHANNEL_STATS.map((c) => {
            const Icon = CHANNEL_ICON[c.id];
            return (
              <div key={c.id} className="flex items-center gap-2 min-w-0">
                <Icon className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span className="text-[11px] font-medium text-slate-700 truncate min-w-0">
                  {c.label}
                </span>
                <span className="text-[11px] font-semibold text-slate-900 tabular-nums shrink-0">
                  {c.flows}
                </span>
                <span
                  className={cn("w-1.5 h-1.5 rounded-full shrink-0", CHANNEL_STATUS_DOT[c.status])}
                />
                <span className="text-[10px] text-slate-400 truncate ml-auto pl-2">
                  {c.reach}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function FlowGovernanceCard() {
  const livePct = Math.round((G.live / Math.max(G.products.total, 1)) * 100);

  return (
    <div className="rounded-lg border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-200">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative flex items-center justify-center w-5 h-5">
            <span className="absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-60 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[14px] font-semibold text-slate-900">
            Flow governance
          </span>
          <span className="text-[12px] text-slate-500 truncate hidden md:inline">
            how automated flows reach customers
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[12px] font-semibold text-slate-900 tabular-nums">
            {G.live} of {G.products.total} products live
          </span>
          <span className="text-[11px] text-slate-500">
            {livePct}%
          </span>
        </div>
      </div>

      <div className="flex items-stretch divide-x divide-slate-100">
        {STAGES.map((s, i) => (
          <StageTile key={s.key} stage={s} index={i} />
        ))}
        <ChannelTile />
      </div>

      <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center gap-3">
        <div className="h-2 flex-1 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${livePct}%` }}
          />
        </div>
        <span className="text-[11px] text-slate-500 tabular-nums shrink-0">
          {livePct}% of mapped products are live on at least one channel
        </span>
      </div>
    </div>
  );
}
