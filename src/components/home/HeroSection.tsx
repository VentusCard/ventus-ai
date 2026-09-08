import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const SIGNAL_PILLS = [
  { label: "College-Bound Child", confidence: "Strong", tone: "amber" },
  { label: "Frequent Traveler", confidence: null, tone: "sky" },
  { label: "Young Parent", confidence: null, tone: "emerald" },
];

const TONE: Record<string, string> = {
  amber: "border-amber-400/40 bg-amber-400/10 text-amber-200",
  sky: "border-sky-400/40 bg-sky-400/10 text-sky-200",
  emerald: "border-emerald-400/40 bg-emerald-400/10 text-emerald-200",
};

const NEXT_ACTIONS = [
  { kind: "PRODUCT", text: "529 college savings consultation" },
  { kind: "OFFER", text: "Student loan pre-approval" },
  { kind: "ALERT", text: "Advisor briefing compiled" },
];

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section
      id="hero"
      className="relative overflow-hidden bg-[#08111F] scroll-mt-24"
      style={{ paddingTop: 152, paddingBottom: 96 }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(ellipse 70% 60% at 78% 10%, rgba(59,130,246,0.22), transparent 70%), radial-gradient(ellipse 50% 50% at 8% 80%, rgba(139,92,246,0.16), transparent 70%)",
        }}
      />
      <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 md:px-8 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-400">
            Customer intelligence for banks
          </p>
          <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-white md:text-5xl xl:text-[56px]">
            Your bank knows what a customer spent.{" "}
            <span className="text-white/40">Not why.</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">
            Ventus turns the data you already hold into named customer signals your teams can act
            on, then surfaces the next best product for every household.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              className="h-12 gap-2 bg-blue-600 px-8 text-base text-white hover:bg-blue-700"
              onClick={() => navigate("/contact")}
            >
              Schedule Demo
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-12 border-white/25 bg-transparent px-8 text-base text-white hover:bg-white/10 hover:text-white"
              onClick={() =>
                document.getElementById("one-customer")?.scrollIntoView({ behavior: "smooth" })
              }
            >
              See the platform
            </Button>
          </div>
        </div>

        {/* Customer signal panel */}
        <div className="w-full">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#0D1B30] to-[#0A1628] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3">
              <span className="font-mono text-[12px] tracking-wide text-white/70">cust_013</span>
              <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/45">
                4 signals
              </span>
            </div>

            <div className="flex flex-wrap gap-2 px-5 py-5">
              {SIGNAL_PILLS.map((p) => (
                <span
                  key={p.label}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium ${TONE[p.tone]}`}
                >
                  {p.label}
                  {p.confidence && (
                    <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/70">
                      {p.confidence}
                    </span>
                  )}
                </span>
              ))}
            </div>

            <div className="border-t border-white/10 px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/45">
                Next actions
              </p>
              <div className="mt-3 space-y-2">
                {NEXT_ACTIONS.map((a) => (
                  <div
                    key={a.kind}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2.5"
                  >
                    <span className="w-[62px] shrink-0 text-[9px] font-semibold uppercase tracking-wider text-blue-300">
                      {a.kind}
                    </span>
                    <span className="text-sm text-white/80">{a.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
