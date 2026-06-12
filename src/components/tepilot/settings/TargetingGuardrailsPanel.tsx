import { useState } from "react";
import { ShieldCheck, Clock, Moon, RefreshCw, Layers, MessageSquare, Bot } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const CHANNELS = ["In-app", "Email", "SMS", "Push"];

const PRODUCTS = [
  { name: "HYSA", auto: true },
  { name: "Travel Card", auto: true },
  { name: "529 College Savings", auto: true },
  { name: "Personal Loan", auto: true },
  { name: "Auto Loan", auto: true },
  { name: "HELOC", auto: false },
  { name: "Mortgage", auto: false },
  { name: "Wealth Management", auto: false },
  { name: "Term Life", auto: true },
  { name: "SBL", auto: false },
];

export function TargetingGuardrailsPanel() {
  const [frequency, setFrequency] = useState([2]);
  const [coolingOff, setCoolingOff] = useState([30]);
  const [autonomy, setAutonomy] = useState([65]);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-blue-200 bg-blue-50/50 px-4 py-3 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <div>
          <div className="text-[13px] font-semibold text-slate-900">Targeting Guardrails</div>
          <div className="text-[12px] text-slate-600">
            Ventus operates inside these rails. Everything else runs autonomously.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Frequency cap */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-4 h-4 text-slate-500" />
            <h4 className="text-[13px] font-semibold text-slate-900">Frequency cap</h4>
          </div>
          <p className="text-[11.5px] text-slate-500 mb-3">
            Max messages per customer per week.
          </p>
          <Slider value={frequency} onValueChange={setFrequency} min={1} max={7} step={1} />
          <div className="mt-2 text-[12px] text-slate-700">
            <span className="font-semibold">{frequency[0]}</span> message{frequency[0] > 1 ? "s" : ""} / week
          </div>
        </div>

        {/* Channel priority */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <Layers className="w-4 h-4 text-slate-500" />
            <h4 className="text-[13px] font-semibold text-slate-900">Channel priority</h4>
          </div>
          <p className="text-[11.5px] text-slate-500 mb-3">
            Ventus prefers higher-ranked channels when both are available.
          </p>
          <div className="space-y-1.5">
            {CHANNELS.map((c, i) => (
              <div
                key={c}
                className="flex items-center justify-between px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50/60"
              >
                <span className="text-[12px] text-slate-700">{i + 1}. {c}</span>
                <span className="text-[10.5px] text-slate-400">drag to reorder</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quiet hours */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <Moon className="w-4 h-4 text-slate-500" />
            <h4 className="text-[13px] font-semibold text-slate-900">Quiet hours</h4>
          </div>
          <p className="text-[11.5px] text-slate-500 mb-3">
            No outbound fires during this window (customer local time).
          </p>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-[12px] text-slate-700 font-mono">9:00 PM</span>
            <span className="text-slate-400 text-[11px]">to</span>
            <span className="px-2.5 py-1 rounded-md border border-slate-200 bg-white text-[12px] text-slate-700 font-mono">8:00 AM</span>
          </div>
        </div>

        {/* Cooling off */}
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-2 mb-1">
            <RefreshCw className="w-4 h-4 text-slate-500" />
            <h4 className="text-[13px] font-semibold text-slate-900">Cooling-off period</h4>
          </div>
          <p className="text-[11.5px] text-slate-500 mb-3">
            Days of silence after conversion before re-targeting.
          </p>
          <Slider value={coolingOff} onValueChange={setCoolingOff} min={7} max={90} step={1} />
          <div className="mt-2 text-[12px] text-slate-700">
            <span className="font-semibold">{coolingOff[0]}</span> days
          </div>
        </div>
      </div>

      {/* Product eligibility */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-1">
          <Bot className="w-4 h-4 text-slate-500" />
          <h4 className="text-[13px] font-semibold text-slate-900">Product eligibility</h4>
        </div>
        <p className="text-[11.5px] text-slate-500 mb-3">
          Which products may Ventus autonomously enroll customers into? Unchecked products require human approval.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {PRODUCTS.map((p) => (
            <ProductToggle key={p.name} name={p.name} initial={p.auto} />
          ))}
        </div>
      </div>

      {/* Tone & disclaimers */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-1">
          <MessageSquare className="w-4 h-4 text-slate-500" />
          <h4 className="text-[13px] font-semibold text-slate-900">Tone & disclaimers</h4>
        </div>
        <p className="text-[11.5px] text-slate-500 mb-3">
          Brand voice and compliance footer applied to all generated outreach.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Voice</div>
            <div className="text-[12.5px] text-slate-700 px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50/60">
              Warm, opportunity-framed, no risk language
            </div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wider text-slate-400 mb-1">Footer</div>
            <div className="text-[12.5px] text-slate-700 px-2.5 py-1.5 rounded-md border border-slate-200 bg-slate-50/60 font-mono">
              Member FDIC. Equal Housing Lender.
            </div>
          </div>
        </div>
      </div>

      {/* Autonomy threshold */}
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-2 mb-1">
          <Clock className="w-4 h-4 text-slate-500" />
          <h4 className="text-[13px] font-semibold text-slate-900">Autonomy threshold</h4>
        </div>
        <p className="text-[11.5px] text-slate-500 mb-3">
          How much Ventus runs without explicit banker approval.
        </p>
        <Slider value={autonomy} onValueChange={setAutonomy} min={0} max={100} step={5} />
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
          <span>Banker approves everything</span>
          <span className="font-semibold text-slate-700">{autonomy[0]}% autonomous</span>
          <span>Fully autonomous</span>
        </div>
      </div>
    </div>
  );
}

function ProductToggle({ name, initial }: { name: string; initial: boolean }) {
  const [on, setOn] = useState(initial);
  return (
    <div
      className={cn(
        "flex items-center justify-between px-2.5 py-1.5 rounded-md border transition-colors",
        on ? "border-blue-200 bg-blue-50/40" : "border-slate-200 bg-white",
      )}
    >
      <span className="text-[12px] text-slate-700">{name}</span>
      <Switch checked={on} onCheckedChange={setOn} />
    </div>
  );
}
