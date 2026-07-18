import { ArrowRight, CheckCircle2, Database, ShieldCheck, Workflow } from "lucide-react";
import { Link } from "react-router-dom";
import ventusLogo from "@/assets/ventus-logo-transparent.png";

const evidence = [
  { source: "ACH", label: "Payroll income", value: "+$6,240" },
  { source: "WIRE", label: "External transfer", value: "-$4,800" },
  { source: "CORE", label: "30-day balance", value: "-18%" },
];

const ScrollDrivenHeroV2 = () => {
  return (
    <section
      data-hero-scroll
      className="v2-ruled flex min-h-[calc(100svh-64px)] items-center"
      style={{ backgroundColor: "var(--v2-paper)" }}
    >
      <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 py-16 md:px-8 md:py-20 xl:grid-cols-[0.82fr_1.18fr] xl:items-center xl:gap-16">
        <div className="max-w-2xl">
          <h1 className="v2-display text-[44px] leading-[1.02] sm:text-5xl md:text-6xl xl:text-[68px]">
            Turn transactions into{" "}
            <span style={{ color: "var(--v2-blue)" }}>measured growth</span>
          </h1>
          <p className="v2-body mt-6 max-w-xl text-base leading-7 md:text-lg">
            Ventus finds the moment, applies bank policy, and puts the next action
            inside the workflow your team already uses.
          </p>
          <div className="mt-8">
            <Link to="/contact" className="v2-btn">
              Schedule a demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border bg-white shadow-[0_24px_70px_rgba(15,23,42,0.12)]" style={{ borderColor: "var(--v2-rule)" }}>
          <div className="flex min-h-14 flex-wrap items-center justify-between gap-3 border-b px-5 py-3" style={{ borderColor: "var(--v2-rule)" }}>
            <div className="flex items-center gap-3">
              <img src={ventusLogo} alt="Ventus AI" className="h-4 w-auto" />
              <span className="h-4 w-px" style={{ backgroundColor: "var(--v2-rule)" }} />
              <span className="text-[11px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>
                Decision workspace
              </span>
            </div>
            <span className="v2-mono text-[8px]" style={{ color: "var(--v2-ink-faint)" }}>
              DEPOSIT GROWTH
            </span>
          </div>

          <div className="grid md:grid-cols-[0.82fr_1.18fr]">
            <div className="border-b p-5 md:border-b-0 md:border-r md:p-6" style={{ borderColor: "var(--v2-rule)" }}>
              <div className="flex items-center gap-2">
                <Database className="h-3.5 w-3.5" style={{ color: "var(--v2-blue)" }} />
                <p className="v2-mono text-[8px] font-semibold uppercase" style={{ color: "var(--v2-ink-faint)" }}>
                  Evidence
                </p>
              </div>
              <div className="mt-4 border-y" style={{ borderColor: "var(--v2-rule)" }}>
                {evidence.map((item) => (
                  <div
                    key={item.label}
                    className="grid grid-cols-[44px_1fr_auto] items-center gap-3 border-b py-3 last:border-b-0"
                    style={{ borderColor: "var(--v2-rule)" }}
                  >
                    <span className="v2-mono text-[8px]" style={{ color: "var(--v2-ink-faint)" }}>{item.source}</span>
                    <span className="text-[10px] font-semibold" style={{ color: "var(--v2-ink-soft)" }}>{item.label}</span>
                    <span className="v2-mono text-[9px] font-semibold" style={{ color: "var(--v2-ink)" }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-[10px] leading-4" style={{ color: "var(--v2-ink-faint)" }}>
                Three permitted signals were sufficient to qualify this moment.
              </p>
            </div>

            <div className="bg-[#F8FAFC] p-5 md:p-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <Workflow className="h-3.5 w-3.5" style={{ color: "var(--v2-blue)" }} />
                  <p className="v2-mono text-[8px] font-semibold uppercase" style={{ color: "var(--v2-ink-faint)" }}>
                    Qualified moment
                  </p>
                </div>
                <span className="rounded-full border bg-white px-2 py-1 v2-mono text-[8px] font-semibold" style={{ borderColor: "var(--v2-rule)", color: "var(--v2-blue)" }}>
                  91% confidence
                </span>
              </div>

              <h2 className="mt-5 text-2xl font-semibold leading-tight" style={{ color: "var(--v2-ink)" }}>
                Deposit primacy at risk
              </h2>
              <p className="mt-2 text-[11px] leading-5" style={{ color: "var(--v2-ink-soft)" }}>
                Payroll remains, but accelerating external transfers indicate a
                relationship at risk.
              </p>

              <div className="mt-6 rounded-md border bg-white p-4" style={{ borderColor: "var(--v2-rule)" }}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="v2-mono text-[8px] uppercase" style={{ color: "var(--v2-ink-faint)" }}>Recommended play</p>
                    <p className="mt-1 text-[13px] font-semibold" style={{ color: "var(--v2-ink)" }}>Banker retention review</p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 flex-none" style={{ color: "var(--v2-verified)" }} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded border px-2 py-1 text-[8px] font-semibold" style={{ borderColor: "var(--v2-rule)", color: "var(--v2-ink-soft)" }}>Policy passed</span>
                  <span className="rounded border px-2 py-1 text-[8px] font-semibold" style={{ borderColor: "var(--v2-rule)", color: "var(--v2-ink-soft)" }}>10% holdout</span>
                  <span className="rounded border px-2 py-1 text-[8px] font-semibold" style={{ borderColor: "var(--v2-rule)", color: "var(--v2-ink-soft)" }}>Receipt attached</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-[9px] font-semibold" style={{ color: "var(--v2-verified)" }}>
                <ShieldCheck className="h-3.5 w-3.5" />
                Ready for the bank workflow
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollDrivenHeroV2;
