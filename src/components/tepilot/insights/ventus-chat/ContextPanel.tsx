import { ArrowUpRight, Database, Flame } from "lucide-react";

interface ContextPanelProps {
  metrics: Record<string, string | number>;
  hotTrends: string[];
  onNavigate?: (tab: string) => void;
}

const METRIC_LABELS: { key: string; label: string }[] = [
  { key: "totalAccounts", label: "Accounts" },
  { key: "totalUsers", label: "Customers" },
  { key: "totalAnnualSpend", label: "Annual spend" },
  { key: "crossSellRate", label: "Cross-sell" },
];

const JUMP_LINKS: { tab: string; label: string }[] = [
  { tab: "wallet-share", label: "Wallet Share & Win-Back" },
  { tab: "life-events", label: "Life Event Intelligence" },
  { tab: "targeting-campaign-builder", label: "Campaign Builder" },
];

export function ContextPanel({ metrics, hotTrends, onNavigate }: ContextPanelProps) {
  return (
    <aside className="hidden 2xl:flex w-72 shrink-0 flex-col gap-7 overflow-y-auto border-l border-slate-200/70 bg-white px-4 py-6">
      <div>
        <div className="mb-2.5 flex items-center gap-1.5">
          <Database className="h-3 w-3 text-slate-300" />
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Data scope
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {METRIC_LABELS.map(({ key, label }) => (
            <div key={key} className="rounded-lg bg-indigo-50/70 px-2.5 py-2">
              <p className="text-[9.5px] uppercase tracking-[0.1em] text-slate-400">{label}</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-800">{String(metrics[key] ?? "—")}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center gap-1.5">
          <Flame className="h-3 w-3 text-amber-400" />
          <span className="text-[9.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Hot trends
          </span>
        </div>
        <ul className="divide-y divide-slate-100">
          {hotTrends.map((trend) => (
            <li key={trend} className="py-2 text-[11px] leading-snug text-slate-500">
              {trend}
            </li>
          ))}
        </ul>
      </div>

      {onNavigate && (
        <div>
          <p className="mb-2 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">
            Jump to
          </p>
          <div className="space-y-0.5">
            {JUMP_LINKS.map((link) => (
              <button
                key={link.tab}
                onClick={() => onNavigate(link.tab)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[11.5px] text-slate-500 transition-colors hover:bg-indigo-50 hover:text-indigo-700"
              >
                {link.label}
                <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
              </button>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
}
