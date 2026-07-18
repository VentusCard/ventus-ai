import { CheckCircle2, Database, FileCheck2, Split, Workflow } from "lucide-react";

const proofs = [
  { label: "Sandbox input", detail: "Plaid records received", Icon: Database },
  { label: "Workflow activation", detail: "Salesforce task created", Icon: Workflow },
  { label: "Measurement control", detail: "Holdout preserved", Icon: Split },
  { label: "Decision evidence", detail: "Receipt recorded", Icon: FileCheck2 },
];

const CapabilityProofStrip = () => {
  return (
    <section aria-label="Demonstrated pilot capabilities" className="v2-rule-t v2-rule-b bg-white">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="flex flex-col md:flex-row">
          <div className="flex items-center gap-2 border-b py-5 md:w-[210px] md:border-b-0 md:border-r md:pr-6" style={{ borderColor: "var(--v2-rule)" }}>
            <CheckCircle2 className="h-4 w-4 flex-none" style={{ color: "var(--v2-verified)" }} />
            <span className="v2-mono text-[11px] font-semibold uppercase" style={{ color: "var(--v2-ink-faint)" }}>
              Proven in sandbox
            </span>
          </div>
          <div className="grid flex-1 grid-cols-2 md:grid-cols-4">
            {proofs.map(({ label, detail, Icon }, index) => (
              <div
                key={label}
                className={[
                  "min-w-0 px-3 py-4 md:border-t-0 md:px-5",
                  index % 2 === 1 ? "border-l" : "",
                  index > 1 ? "border-t" : "",
                  index > 0 ? "md:border-l" : "md:border-l-0",
                ].join(" ")}
                style={{ borderColor: "var(--v2-rule)" }}
              >
                <div className="flex min-h-7 items-start gap-2">
                  <Icon className="mt-0.5 h-3.5 w-3.5 flex-none" style={{ color: "var(--v2-blue)" }} />
                  <span className="text-[10px] font-semibold leading-tight md:text-[11px]" style={{ color: "var(--v2-ink)" }}>{label}</span>
                </div>
                <p className="v2-mono mt-1 text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>{detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CapabilityProofStrip;
