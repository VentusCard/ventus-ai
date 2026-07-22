import { ArrowLeft, FlaskConical, LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";
import SimplePasswordGate from "@/components/demo/SimplePasswordGate";
import EnterpriseGrowthDemoPage from "@/pages/EnterpriseGrowthDemoPage";

const NAVY = "#012169";

function InternalGrowthDeskContent() {
  const evaluationEnabled = import.meta.env.VITE_ENABLE_INTERNAL_EVAL === "true";

  if (!evaluationEnabled) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6" style={{ fontFamily: "Manrope, sans-serif" }}>
        <section className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-7 text-center shadow-sm">
          <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
            <LockKeyhole className="h-5 w-5 text-slate-600" />
          </span>
          <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-slate-400">Internal evaluation</p>
          <h1 className="mt-2 text-2xl font-semibold" style={{ color: NAVY }}>Growth Desk evaluation is locked</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Enable this workspace only after the pilot sponsor approves the evaluation plan and data boundary.
          </p>
          <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3 text-left">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">Required client flag</p>
            <code className="mt-1 block text-xs font-semibold text-slate-700">VITE_ENABLE_INTERNAL_EVAL=true</code>
          </div>
          <Link
            to="/internal/capabilities"
            className="mt-5 inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back to capability register
          </Link>
        </section>
      </main>
    );
  }

  return (
    <div className="h-screen w-screen bg-white">
      <div className="pointer-events-none fixed left-1/2 top-2 z-[60] -translate-x-1/2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-800 shadow-sm">
          <FlaskConical className="h-3 w-3" /> Internal evaluation only · simulated evidence
        </span>
      </div>
      <EnterpriseGrowthDemoPage audience="internal" evaluationEnabled />
    </div>
  );
}

export default function InternalGrowthDeskPage() {
  return (
    <SimplePasswordGate tagline="Internal evaluation" allowDemoBypass={false}>
      <InternalGrowthDeskContent />
    </SimplePasswordGate>
  );
}
