import ScrollReveal from "@/components/ScrollReveal";
import { ArrowRight, CheckCircle2, CircleDashed } from "lucide-react";
import salesforceLogo from "@/assets/salesforce-logo.png";
import snowflakeLogo from "@/assets/snowflake-logo.png";
import databricksLogo from "@/assets/databricks-logo.png";
import fiservLogo from "@/assets/fiserv-logo.png";
import jackHenryLogo from "@/assets/jack-henry-logo.png";
import fisLogo from "@/assets/fis-logo.svg";

type Partner = {
  name: string;
  logo?: string;
  status: "proven" | "roadmap";
};

const activationPartners: Partner[] = [
  { name: "Salesforce FSC", logo: salesforceLogo, status: "proven" },
  { name: "Adobe Journey Optimizer", status: "roadmap" },
  { name: "Microsoft Dynamics 365", status: "roadmap" },
  { name: "Braze", status: "roadmap" },
];

const dataPartners: Partner[] = [
  { name: "Snowflake", logo: snowflakeLogo, status: "roadmap" },
  { name: "Databricks", logo: databricksLogo, status: "roadmap" },
  { name: "AWS data services", status: "roadmap" },
  { name: "Microsoft Fabric", status: "roadmap" },
];

const corePartners: Partner[] = [
  { name: "FIS", logo: fisLogo, status: "roadmap" },
  { name: "Fiserv", logo: fiservLogo, status: "roadmap" },
  { name: "Jack Henry", logo: jackHenryLogo, status: "roadmap" },
  { name: "Plaid", status: "proven" },
];

const PartnerRow = ({ partner }: { partner: Partner }) => (
  <div className="flex min-h-14 items-center justify-between gap-4 border-t px-4 py-3 first:border-t-0" style={{ borderColor: "var(--v2-rule)" }}>
    <div className="flex min-w-0 items-center gap-3">
      {partner.logo ? (
        <img src={partner.logo} alt="" className="h-5 w-9 flex-none object-contain object-left" />
      ) : (
        <span className="flex h-5 w-9 flex-none items-center justify-center rounded border text-[8px] font-bold" style={{ borderColor: "var(--v2-rule)", color: "var(--v2-ink-faint)" }}>
          {partner.name.slice(0, 2).toUpperCase()}
        </span>
      )}
      <span className="text-[11px] font-semibold leading-4" style={{ color: "var(--v2-ink)" }}>{partner.name}</span>
    </div>
    <span className="flex flex-none items-center gap-1.5 v2-mono text-[8px]" style={{ color: partner.status === "proven" ? "var(--v2-verified)" : "var(--v2-ink-faint)" }}>
      {partner.status === "proven" ? <CheckCircle2 className="h-3 w-3" /> : <CircleDashed className="h-3 w-3" />}
      {partner.status === "proven" ? "SANDBOX PROVEN" : "ROADMAP"}
    </span>
  </div>
);

const IntegrationProof = () => {
  return (
    <section id="integration" className="v2-rule-t bg-white py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <ScrollReveal>
          <div className="mb-10 max-w-4xl">
            <p className="v2-label mb-4">Integration</p>
            <h2 className="v2-display text-3xl md:text-5xl">Connect the systems that already run the bank.</h2>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.08}>
          <div className="grid overflow-hidden rounded-lg border bg-white lg:grid-cols-[1.2fr_0.8fr_0.9fr]" style={{ borderColor: "var(--v2-rule)" }}>
            <div>
              <div className="border-b px-4 py-3" style={{ borderColor: "var(--v2-rule)", backgroundColor: "var(--v2-paper-raised)" }}>
                <p className="v2-mono text-[9px] font-semibold uppercase" style={{ color: "var(--v2-ink-faint)" }}>Activate & engage</p>
              </div>
              {activationPartners.map((partner) => <PartnerRow key={partner.name} partner={partner} />)}
            </div>

            <div className="border-t lg:border-l lg:border-t-0" style={{ borderColor: "var(--v2-rule)" }}>
              <div className="border-b px-4 py-3" style={{ borderColor: "var(--v2-rule)", backgroundColor: "var(--v2-paper-raised)" }}>
                <p className="v2-mono text-[9px] font-semibold uppercase" style={{ color: "var(--v2-ink-faint)" }}>Data platforms</p>
              </div>
              {dataPartners.map((partner) => <PartnerRow key={partner.name} partner={partner} />)}
            </div>

            <div className="border-t lg:border-l lg:border-t-0" style={{ borderColor: "var(--v2-rule)" }}>
              <div className="border-b px-4 py-3" style={{ borderColor: "var(--v2-rule)", backgroundColor: "var(--v2-paper-raised)" }}>
                <p className="v2-mono text-[9px] font-semibold uppercase" style={{ color: "var(--v2-ink-faint)" }}>Core & transaction data</p>
              </div>
              {corePartners.map((partner) => <PartnerRow key={partner.name} partner={partner} />)}
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 v2-mono text-[9px]" style={{ color: "var(--v2-ink-faint)" }}>
            {["Signals in", "Governed decision", "Action delivered", "Outcome returned"].map((step, index, steps) => (
              <div key={step} className="flex items-center gap-3">
                <span>{step}</span>
                {index < steps.length - 1 && <ArrowRight className="h-3 w-3" />}
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default IntegrationProof;
