import { DEMO_CUSTOMERS, type DemoCustomer } from "@/lib/demoData";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface Props {
  customerA: DemoCustomer;
  customerB: DemoCustomer;
  onSelectA: (c: DemoCustomer) => void;
  onSelectB: (c: DemoCustomer) => void;
  onEnrich: () => void;
  isProcessing: boolean;
  statusMessage: string;
  currentPhase: "idle" | "classification" | "travel" | "complete";
}

export default function DemoCustomerPanel({
  customerA, customerB, onSelectA, onSelectB,
  onEnrich, isProcessing, statusMessage, currentPhase,
}: Props) {
  return (
    <div className="h-full flex flex-col p-5 overflow-y-auto">
      {/* Logo */}
      <div className="mb-6">
        <h2 className="text-lg font-bold text-slate-900 tracking-tight" style={{ fontFamily: "Manrope, sans-serif" }}>
          Ventus AI
        </h2>
        <p className="text-[11px] text-slate-500 mt-0.5">Conference Demo</p>
      </div>

      {/* Customer A */}
      <CustomerSlot
        label="Customer A"
        color="#3b82f6"
        selected={customerA}
        onSelect={onSelectA}
        excludeId={customerB.id}
      />

      <div className="my-4 border-t border-slate-200" />

      {/* Customer B */}
      <CustomerSlot
        label="Customer B"
        color="#10b981"
        selected={customerB}
        onSelect={onSelectB}
        excludeId={customerA.id}
      />

      {/* Enrich button */}
      <div className="mt-auto pt-6 space-y-3">
        <Button
          onClick={onEnrich}
          disabled={isProcessing}
          variant="ai"
          size="sm"
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Enriching…
            </>
          ) : currentPhase === "complete" ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              Re-Enrich Both
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Enrich Both Customers
            </>
          )}
        </Button>

        {/* Status line */}
        {(isProcessing || currentPhase === "complete") && (
          <div className="text-center">
            <p className="text-[10px] text-slate-500 truncate">{statusMessage}</p>
            {isProcessing && (
              <div className="mt-1.5 flex gap-1 justify-center">
                <PhaseDot label="Classify" active={currentPhase === "classification"} done={currentPhase === "travel" || currentPhase === "complete"} />
                <PhaseDot label="Travel" active={currentPhase === "travel"} done={currentPhase === "complete"} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PhaseDot({ label, active, done }: { label: string; active: boolean; done: boolean }) {
  return (
    <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${
      done ? "bg-emerald-100 text-emerald-700" :
      active ? "bg-blue-100 text-blue-700 animate-pulse" :
      "bg-slate-100 text-slate-400"
    }`}>
      {done ? "✓ " : ""}{label}
    </span>
  );
}

function CustomerSlot({
  label,
  color,
  selected,
  onSelect,
  excludeId,
}: {
  label: string;
  color: string;
  selected: DemoCustomer;
  onSelect: (c: DemoCustomer) => void;
  excludeId: string;
}) {
  const p = selected.profile;
  const initials = p.name.split(" ").map((w) => w[0]).join("");

  return (
    <div>
      <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color }}>{label}</p>

      <select
        className="w-full bg-white text-slate-900 text-sm rounded-lg px-3 py-2 border border-slate-200 focus:outline-none focus:border-blue-500 mb-3"
        value={selected.id}
        onChange={(e) => {
          const c = DEMO_CUSTOMERS.find((d) => d.id === e.target.value);
          if (c) onSelect(c);
        }}
      >
        {DEMO_CUSTOMERS.filter((d) => d.id !== excludeId).map((d) => (
          <option key={d.id} value={d.id}>{d.profile.name}</option>
        ))}
      </select>

      {/* Mini profile card */}
      <div className="rounded-lg p-3 border border-slate-200 bg-white">
        <div className="flex items-center gap-2.5 mb-2">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
            style={{ background: `${color}30`, border: `1px solid ${color}60` }}
          >
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{p.name}</p>
            <p className="text-[10px] text-slate-500">{p.segment} · {p.aum}</p>
          </div>
        </div>

        <div className="space-y-1 text-[11px] text-slate-500">
          <div className="flex justify-between">
            <span>Age</span>
            <span className="text-slate-700">{p.demographics.age}</span>
          </div>
          <div className="flex justify-between">
            <span>Occupation</span>
            <span className="text-slate-700">{p.demographics.occupation}</span>
          </div>
          <div className="flex justify-between">
            <span>Family</span>
            <span className="text-slate-700">{p.demographics.familyStatus}</span>
          </div>
        </div>

        {/* Lifestyle type */}
        <div className="mt-2.5 rounded px-2 py-1.5" style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
          <p className="text-[10px] font-semibold" style={{ color }}>{selected.lifestyleType}</p>
          <div className="flex gap-1 mt-1">
            {selected.topPillars.slice(0, 3).map((pil) => (
              <span key={pil.name} className="text-[9px] text-slate-600 bg-slate-100 rounded px-1.5 py-0.5">
                {pil.icon} {pil.name}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
