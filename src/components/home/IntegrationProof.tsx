import ScrollReveal from "@/components/ScrollReveal";
import { ArrowRight, Database, Landmark, Network, ShieldCheck } from "lucide-react";

const sourceSystems = ["FIS", "Fiserv", "Jack Henry", "Snowflake"];
const destinationSystems = ["Salesforce FSC", "Banker workbench", "Digital channels"];
const ventusSteps = ["Normalize", "Detect", "Govern", "Measure"];

const IntegrationProof = () => {
  return (
    <section id="integration" className="v2-rule-t bg-white py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <ScrollReveal>
          <div className="mb-10 max-w-3xl">
            <p className="v2-label mb-4">Integration</p>
            <h2 className="v2-display text-3xl md:text-5xl">Fits the stack you already run.</h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="grid overflow-hidden rounded-lg border bg-white lg:grid-cols-[1fr_auto_1.15fr_auto_1fr]" style={{ borderColor: "var(--v2-rule)" }}>
            <div className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Database className="h-4 w-4" style={{ color: "var(--v2-blue)" }} />
                <p className="v2-mono text-[10px] font-semibold uppercase" style={{ color: "var(--v2-ink-faint)" }}>Bank data</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {sourceSystems.map((system) => (
                  <span key={system} className="rounded border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[11px] font-semibold text-gray-700">{system}</span>
                ))}
              </div>
            </div>

            <div className="hidden items-center justify-center px-2 text-gray-300 lg:flex">
              <ArrowRight className="h-5 w-5" />
            </div>

            <div className="border-y p-6 lg:border-x lg:border-y-0" style={{ borderColor: "var(--v2-rule)", backgroundColor: "var(--v2-console)" }}>
              <div className="mb-4 flex items-center gap-2 text-white">
                <Network className="h-4 w-4 text-blue-300" />
                <p className="v2-mono text-[10px] font-semibold uppercase text-white/60">Ventus decision loop</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {ventusSteps.map((step, index) => (
                  <div key={step} className="flex items-center gap-2">
                    <span className="rounded border border-white/15 bg-white/5 px-2.5 py-1.5 text-[11px] font-semibold text-white">{step}</span>
                    {index < ventusSteps.length - 1 && <ArrowRight className="h-3 w-3 text-white/25" />}
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden items-center justify-center px-2 text-gray-300 lg:flex">
              <ArrowRight className="h-5 w-5" />
            </div>

            <div className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Landmark className="h-4 w-4" style={{ color: "var(--v2-blue)" }} />
                <p className="v2-mono text-[10px] font-semibold uppercase" style={{ color: "var(--v2-ink-faint)" }}>Bank workflows</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {destinationSystems.map((system) => (
                  <span key={system} className="rounded border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-[11px] font-semibold text-gray-700">{system}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2 v2-mono text-[9px] sm:flex-row sm:items-center sm:justify-between" style={{ color: "var(--v2-ink-faint)" }}>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" style={{ color: "var(--v2-verified)" }} />
              Plaid sandbox ingestion and Salesforce sandbox delivery demonstrated
            </span>
            <span>Core and warehouse adapters are configured and validated per institution</span>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default IntegrationProof;
