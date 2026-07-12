import { useMemo, useState } from "react";
import { ArrowRight, CheckCircle2, ChevronRight, FlaskConical, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import SimplePasswordGate from "@/components/demo/SimplePasswordGate";
import { CAPABILITIES, capabilityStatusLabel, type CapabilityDefinition } from "@/lib/capabilities";

const NAVY = "#012169";
const GREEN = "#0B6B43";

function StatusBadge({ capability }: { capability: CapabilityDefinition }) {
  const locked = capability.status === "evaluation-locked";
  const color = locked ? "#64748b" : capability.status === "pilot-scope" ? GREEN : "#b45309";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: `${color}12`, color }}
    >
      {locked ? <LockKeyhole className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
      {capabilityStatusLabel(capability.status)}
    </span>
  );
}

function InternalCapabilitiesContent() {
  const evaluationEnabled = import.meta.env.VITE_ENABLE_INTERNAL_EVAL === "true";
  const [selectedId, setSelectedId] = useState(CAPABILITIES[0].id);
  const selected = useMemo(
    () => CAPABILITIES.find((capability) => capability.id === selectedId) ?? CAPABILITIES[0],
    [selectedId],
  );

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950" style={{ fontFamily: "Manrope, sans-serif" }}>
      <header className="border-b border-slate-200 bg-white px-6 py-4 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" style={{ color: NAVY }} />
              <p className="text-sm font-bold" style={{ color: NAVY }}>Ventus internal capability review</p>
            </div>
            <p className="mt-1 text-xs text-slate-500">Implementation truth, evidence gates, and pilot readiness.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {evaluationEnabled ? <CheckCircle2 className="h-3.5 w-3.5" style={{ color: GREEN }} /> : <LockKeyhole className="h-3.5 w-3.5" />}
              {evaluationEnabled ? "Evaluation approved" : "Awaiting sponsor approval"}
            </span>
            <Link
              to="/internal/growth-desk"
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
              style={{ backgroundColor: NAVY }}
            >
              {evaluationEnabled ? "Open Growth Desk" : "View locked workspace"} <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-6 py-6 lg:grid-cols-[360px_minmax(0,1fr)] lg:px-10">
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Capability register</p>
          </div>
          <div className="divide-y divide-slate-100">
            {CAPABILITIES.map((capability) => {
              const active = capability.id === selected.id;
              return (
                <button
                  key={capability.id}
                  onClick={() => setSelectedId(capability.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
                  style={{ backgroundColor: active ? `${NAVY}08` : undefined }}
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{capability.title}</p>
                    <p className="mt-1 text-[11px] text-slate-500">{capabilityStatusLabel(capability.status)}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 flex-none text-slate-300" />
                </button>
              );
            })}
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white p-5 lg:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">Selected capability</p>
              <h1 className="mt-1 text-2xl font-semibold" style={{ color: NAVY }}>{selected.title}</h1>
            </div>
            <StatusBadge capability={selected} />
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-blue-700">Leadership demo promise</p>
              <p className="mt-2 text-sm leading-6 text-slate-800">{selected.leadershipPromise}</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">Current implementation</p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{selected.internalReality}</p>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" style={{ color: GREEN }} />
              <p className="text-sm font-bold text-slate-900">Evidence required before advancement</p>
            </div>
            <div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-200">
              {selected.evidenceGate.map((gate) => (
                <div key={gate} className="flex items-center gap-3 px-4 py-3">
                  <span className="h-2 w-2 flex-none rounded-full bg-slate-300" />
                  <p className="text-sm text-slate-700">{gate}</p>
                </div>
              ))}
            </div>
          </div>

          {selected.status === "evaluation-locked" && !evaluationEnabled && (
            <div className="mt-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <LockKeyhole className="mt-0.5 h-4 w-4 flex-none text-amber-700" />
              <div>
                <p className="text-sm font-bold text-amber-900">No runtime evaluation</p>
                <p className="mt-1 text-xs leading-5 text-amber-800">
                  This capability remains disabled until the first audience approves the pilot and the evidence plan is accepted.
                </p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default function InternalCapabilitiesPage() {
  return (
    <SimplePasswordGate tagline="Internal evaluation" allowDemoBypass={false}>
      <InternalCapabilitiesContent />
    </SimplePasswordGate>
  );
}
