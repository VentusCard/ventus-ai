import { TabHeader } from "./TabHeader";
import { Layers, CreditCard, ArrowLeftRight, FileText, Send, Smartphone, Gauge, Gift, Package, Wallet, Bot, ShieldAlert, Users, CalendarHeart, Activity, DollarSign, UserCircle, AlertTriangle, CheckCircle2, Presentation, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";
import ventusLogoTransparent from "@/assets/ventus-logo-transparent.png";
import ExecDemoPage from "@/pages/ExecDemoPage";
import { Button } from "@/components/ui/button";

const INPUTS = [
  { label: "KYC", icon: UserCircle, source: "Core" },
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

function VentusPill({ label, Icon }: { label: string; Icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 rounded-lg border border-indigo-700 border-l-2 border-l-indigo-300 bg-gradient-to-br from-blue-900 to-indigo-900 shadow-sm hover:border-indigo-400 hover:shadow-[0_0_0_3px_rgba(99,102,241,0.25)] transition-all">
      <div className="flex items-center justify-center w-7 h-7 rounded-md bg-white/10 shrink-0">
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>
      <span className="text-sm font-medium text-white">{label}</span>
    </div>
  );
}

function Brace({ direction = "right" }: { direction?: "right" | "left" }) {
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

function CoreConnectors({ count }: { count: number }) {
  // 6 curves from a single left anchor to evenly spaced right anchors.
  const lines = Array.from({ length: count }, (_, i) => {
    const y = ((i + 0.5) / count) * 100;
    return { y, delay: (i * 0.4).toFixed(2) };
  });
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="w-full h-full"
      fill="none"
    >
      <defs>
        <linearGradient id="ventusFlow" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#c7d2fe" />
          <stop offset="50%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#a5b4fc" />
        </linearGradient>
        <style>{`
          @keyframes ventusDash {
            from { stroke-dashoffset: 0; }
            to { stroke-dashoffset: -24; }
          }
          .ventus-flow {
            stroke-dasharray: 4 8;
            animation: ventusDash 3s linear infinite;
          }
        `}</style>
      </defs>
      {lines.map((l, i) => (
        <path
          key={i}
          d={`M 0 50 C 35 50, 65 ${l.y}, 100 ${l.y}`}
          stroke="url(#ventusFlow)"
          strokeWidth="1.2"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          className="ventus-flow"
          style={{ animationDelay: `${l.delay}s` }}
        />
      ))}
    </svg>
  );
}

export function CapabilitiesView() {
  return (
    <div className="space-y-6">
      <TabHeader
        icon={<Layers className="w-4 h-4" />}
        title="System"
        subtitle="How Ventus turns raw bank data into signals and downstream actions"
        howItWorks="Ventus ingests bank-native data streams, classifies and enriches them into five signal families inside the Behavioral Intelligence Core, then powers every downstream personalization, targeting, and risk product."
        whyItMatters="One intelligence layer replaces siloed point solutions — every product reads from the same enriched signal foundation."
      />

      <div className="bg-white border border-slate-200 rounded-xl p-6 lg:p-8">
        <div className="grid grid-cols-[1fr_auto_1.2fr_72px_1fr] gap-4 items-stretch">
          {/* INPUTS */}
          <div className="flex flex-col">
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-xs font-bold uppercase tracking-wider text-slate-700">Data Inputs · {INPUTS.length} connected</p>
            </div>
            <div className="flex flex-col gap-2.5 flex-1 justify-center">
              {INPUTS.map((i) => {
                const Icon = i.icon;
                return (
                  <div key={i.label} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white shadow-sm hover:border-emerald-300 transition-colors">
                    <div className="flex items-center justify-center w-7 h-7 rounded-md bg-slate-100 shrink-0">
                      <Icon className="w-3.5 h-3.5 text-slate-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-800 truncate">{i.label}</span>
                    <div className="flex items-center gap-1.5 ml-auto shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      <span className="text-[11px] font-medium text-slate-600 whitespace-nowrap">{i.source}</span>
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
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 text-center">VENTUS AI SYSTEM</p>
            <div className="flex-1 flex flex-col rounded-2xl border-2 border-blue-900 bg-gradient-to-br from-blue-900 to-indigo-900 p-5 shadow-lg">
              <div className="flex flex-col items-center text-center pb-4 border-b border-white/15">
                <img src={ventusLogoTransparent} alt="Ventus" className="h-6 w-auto brightness-0 invert opacity-95" />
                <p className="text-base font-bold text-white mt-2">Behavioral Intelligence Core</p>
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-blue-200/80 mt-4 mb-2.5 text-center">DYNAMIC UNDERSTANDING OF EVERY CUSTOMER</p>
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

          {/* ANIMATED CONNECTORS */}
          <div className="flex items-stretch pt-8">
            <CoreConnectors count={DOWNSTREAM.length} />
          </div>

          {/* DOWNSTREAM */}
          <div className="flex flex-col">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-1 text-center">PERSONALIZED BANKING</p>
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
              <p className="text-[10px] font-medium text-indigo-600">Powered by Ventus</p>
            </div>
            <div className="flex flex-col gap-2.5 flex-1 justify-center">
              {DOWNSTREAM.map((d) => (
                <VentusPill key={d.label} label={d.label} Icon={d.icon} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 pt-2">
        <p className="text-sm text-slate-600">See the system in action with a live executive walkthrough.</p>
        <Button
          size="lg"
          className="gap-2 bg-blue-900 hover:bg-blue-800 text-white"
          onClick={() => {
            document.getElementById('exec-demo-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        >
          <Presentation className="w-4 h-4" />
          Launch interactive demo
          <ArrowDown className="w-4 h-4" />
        </Button>
      </div>

      <section
        id="exec-demo-section"
        className="bg-white border border-slate-200 rounded-xl overflow-hidden"
      >
        <div className="h-[calc(100vh-8rem)] min-h-[640px] w-full bg-white">
          <ExecDemoPage
            embedded
            onBack={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      </section>
    </div>
  );
}
