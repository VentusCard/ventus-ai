import { TabHeader } from "./TabHeader";
import { Layers, CreditCard, ArrowLeftRight, FileText, Send, Smartphone, Gauge, Gift, Package, Wallet, Bot, ShieldAlert, Users, CalendarHeart, Activity, DollarSign, UserCircle, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const INPUTS = [
  { label: "Card Transactions", icon: CreditCard, source: "Card Processor" },
  { label: "ACH & Wires", icon: ArrowLeftRight, source: "Core" },
  { label: "Checks", icon: FileText, source: "Core" },
  { label: "Zelle", icon: Send, source: "EWS" },
  { label: "Digital Telemetry", icon: Smartphone, source: "Digital Banking" },
  { label: "Credit Score", icon: Gauge, source: "Credit Bureau" },
];

const SIGNALS = [
  { label: "Life Event Signals", icon: CalendarHeart, color: "bg-amber-500", tint: "bg-amber-50 text-amber-700 border-amber-200" },
  { label: "Behavioral Signals", icon: Activity, color: "bg-blue-500", tint: "bg-blue-50 text-blue-700 border-blue-200" },
  { label: "Financial Signals", icon: DollarSign, color: "bg-emerald-500", tint: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  { label: "Demographic Signals", icon: UserCircle, color: "bg-violet-500", tint: "bg-violet-50 text-violet-700 border-violet-200" },
  { label: "Risk Signals", icon: AlertTriangle, color: "bg-rose-500", tint: "bg-rose-50 text-rose-700 border-rose-200" },
];

const DOWNSTREAM = [
  { label: "Personalized Rewards", icon: Gift },
  { label: "Next-Product Intelligence", icon: Package },
  { label: "Semantic Budgeting", icon: Wallet },
  { label: "AI Banking Assistant", icon: Bot },
  { label: "Risk & Vulnerability", icon: ShieldAlert },
  { label: "Segmentation & Targeting", icon: Users },
];

function Pill({ label, Icon }: { label: string; Icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-colors">
      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 shrink-0">
        <Icon className="w-3.5 h-3.5 text-slate-600" />
      </div>
      <span className="text-sm font-medium text-slate-800">{label}</span>
    </div>
  );
}

function Brace({ direction = "right" }: { direction?: "right" | "left" }) {
  // simple curly-brace SVG
  return (
    <svg viewBox="0 0 40 320" className="w-6 h-full text-slate-300" preserveAspectRatio="none" fill="none" stroke="currentColor" strokeWidth="1.5">
      {direction === "right" ? (
        <path d="M5 5 C 25 5, 25 150, 35 160 C 25 170, 25 315, 5 315" strokeLinecap="round" />
      ) : (
        <path d="M35 5 C 15 5, 15 150, 5 160 C 15 170, 15 315, 35 315" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function CapabilitiesView() {
  return (
    <div className="space-y-6">
      <TabHeader
        icon={<Layers className="w-4 h-4" />}
        title="Platform Capabilities"
        subtitle="How Ventus turns raw bank data into signals and downstream actions"
        howItWorks="Ventus ingests bank-native data streams, classifies and enriches them into five signal families inside the Behavioral Intelligence Core, then powers every downstream personalization, targeting, and risk product."
        whyItMatters="One intelligence layer replaces siloed point solutions — every product reads from the same enriched signal foundation."
      />

      <div className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8">
        <div className="grid grid-cols-[1fr_auto_1.2fr_auto_1fr] gap-4 items-stretch">
          {/* INPUTS */}
          <div className="flex flex-col">
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Data Inputs · {INPUTS.length} connected</p>
            </div>
            <div className="flex flex-col gap-2.5 flex-1 justify-center">
              {INPUTS.map((i) => {
                const Icon = i.icon;
                return (
                  <div key={i.label} className="px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white shadow-sm hover:border-emerald-300 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 shrink-0">
                        <Icon className="w-3.5 h-3.5 text-slate-600" />
                      </div>
                      <span className="text-sm font-semibold text-slate-800 flex-1 truncate">{i.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mt-1.5 pl-[38px]">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="text-[11px] font-medium text-slate-600 truncate">{i.source}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-stretch">
            <Brace direction="right" />
          </div>

          {/* CORE */}
          <div className="flex flex-col">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3 text-center">Behavioral Intelligence Core</p>
            <div className="flex-1 flex flex-col rounded-2xl border-2 border-slate-900 bg-gradient-to-br from-slate-900 to-slate-800 p-5 shadow-lg">
              <div className="text-center pb-4 border-b border-white/10">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-blue-300">Ventus</p>
                <p className="text-base font-bold text-white mt-0.5">Behavioral Intelligence Core</p>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-4 mb-2.5 text-center">What the core produces</p>
              <div className="flex flex-col gap-2 flex-1 justify-center">
                {SIGNALS.map((s) => {
                  const Icon = s.icon;
                  return (
                    <div key={s.label} className={cn("flex items-center gap-2.5 px-3 py-2.5 rounded-lg border bg-white", s.tint)}>
                      <div className={cn("flex items-center justify-center w-6 h-6 rounded-md shrink-0", s.color)}>
                        <Icon className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-sm font-semibold">{s.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-stretch">
            <Brace direction="left" />
          </div>

          {/* DOWNSTREAM */}
          <div className="flex flex-col">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-3 text-center">Downstream Capabilities</p>
            <div className="flex flex-col gap-2.5 flex-1 justify-center">
              {DOWNSTREAM.map((d) => (
                <Pill key={d.label} label={d.label} Icon={d.icon} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
