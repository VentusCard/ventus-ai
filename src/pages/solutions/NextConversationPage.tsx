import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import StepFlow from "@/components/solutions/StepFlow";
import SolutionsCTA from "@/components/solutions/SolutionsCTA";
import { useSectionReveal, revealStyle } from "@/hooks/useSectionReveal";

const stats = [
  { value: "Daily", label: "Advisor briefings generated" },
  { value: "20+", label: "Life events that trigger alerts" },
  { value: "Zero PII", label: "Transaction signals only" },
];

const flowSteps = [
  { label: "Detect", desc: "Life event identified" },
  { label: "Compile", desc: "Briefing generated" },
  { label: "Alert", desc: "Pushed to advisor CRM" },
];

const NextConversationPage = () => {
  const hero = useSectionReveal();
  const alert = useSectionReveal();
  const pii = useSectionReveal();
  const flow = useSectionReveal();
  const statsSection = useSectionReveal();

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section ref={hero.ref} className="pt-40 pb-20 px-6 min-h-screen flex items-center">
        <div className="max-w-3xl mx-auto text-center">
          <p style={revealStyle(hero.visible, 0)} className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">Next Conversation</p>
          <h1 style={{ ...revealStyle(hero.visible, 100), fontSize: 56 }} className="font-bold text-gray-900 leading-tight mb-6">
            Give every advisor a warm lead every morning.
          </h1>
          <p style={{ ...revealStyle(hero.visible, 200), fontSize: 18 }} className="text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            Ventus sends advisors a daily briefing — who to call, why to call them, and what to say. Built entirely from transaction signals, zero manual research required.
          </p>
          <div style={revealStyle(hero.visible, 300)}>
            <Link to="/contact">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Schedule a Demo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Advisor alert */}
      <section ref={alert.ref} className="bg-white px-6" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-7xl mx-auto">
          <h2 style={{ ...revealStyle(alert.visible, 0), fontSize: 36 }} className="font-bold text-gray-900 mb-12 text-center">
            What an advisor sees.
          </h2>
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div style={revealStyle(alert.visible, 100)}>
              <p className="text-gray-500 leading-relaxed mb-6" style={{ fontSize: 18 }}>
                Every alert includes everything an advisor needs to have a meaningful conversation — before they pick up the phone.
              </p>
              <div className="space-y-3 text-gray-600" style={{ fontSize: 18 }}>
                <p>● Life event detected with confidence score and evidence</p>
                <p>● Pre-written talking points tailored to the customer</p>
                <p>● Recommended products and next steps</p>
                <p>● Financial projections if relevant</p>
              </div>
            </div>
            {/* Light advisor alert card */}
            <div
              style={{
                ...revealStyle(alert.visible, 200),
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                borderRadius: 12,
              }}
              className="p-6 bg-white"
            >
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-mono" style={{ color: "#111827" }}>
                  Advisor Alert · <span className="font-semibold">cust_013</span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: "#9CA3AF" }}>Powered by Ventus AI</span>
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                  </span>
                </div>
              </div>
              <span
                className="text-sm font-semibold px-3 py-1 rounded-full inline-block"
                style={{ backgroundColor: "#FEF3C7", color: "#D97706" }}
              >
                College-Bound Child — 91% confidence
              </span>

              <div className="mt-5 pt-4" style={{ borderTop: "1px solid #E5E7EB" }}>
                <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: "#2563EB" }}>Talking Points</p>
                <div className="space-y-2">
                  {[
                    "Significant college application spending detected Jan–Feb 2026",
                    "Child applying to Harvard, MIT, Yale, Stanford",
                    "Over $3,000 in test prep, essays, and campus visits",
                  ].map((p, i) => (
                    <p key={i} className="text-sm" style={{ color: "#374151" }}>● {p}</p>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4" style={{ borderTop: "1px solid #E5E7EB" }}>
                <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: "#2563EB" }}>Recommended Action</p>
                <button
                  className="text-sm font-semibold text-white px-4 py-2 rounded-lg transition-colors"
                  style={{ backgroundColor: "#16A34A" }}
                >
                  Schedule college savings consultation →
                </button>
                <p className="text-xs mt-3" style={{ color: "#6B7280" }}>
                  Estimated cost: $240,000 over 4 years · Suggested monthly contribution: $2,500
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Zero PII */}
      <section ref={pii.ref} className="bg-white px-6" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-start">
          <div style={revealStyle(pii.visible, 0)}>
            <p className="text-7xl md:text-8xl font-bold text-gray-900 leading-none">0</p>
            <p className="text-gray-500 mt-2 mb-6" style={{ fontSize: 18 }}>pieces of personally identifiable information stored</p>
            <p className="text-gray-500 leading-relaxed" style={{ fontSize: 18 }}>
              We never see names, addresses, social security numbers, or account numbers. Every insight Ventus surfaces comes from transaction signals alone — what customers spend, where they spend it, and when.
            </p>
          </div>
          <div style={revealStyle(pii.visible, 200)} className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-green-600 mb-3">We see</p>
              <div className="space-y-2 text-gray-700" style={{ fontSize: 18 }}>
                <p>Merchant name</p>
                <p>Amount</p>
                <p>Date</p>
                <p>MCC code</p>
                <p>ZIP code</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-red-500 mb-3">We never see</p>
              <div className="space-y-2 text-gray-700" style={{ fontSize: 18 }}>
                <p>Customer name</p>
                <p>Address</p>
                <p>SSN</p>
                <p>Account number</p>
                <p>Date of birth</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flow steps */}
      <section ref={flow.ref} className="bg-white px-6" style={{ paddingTop: 48, paddingBottom: 48 }}>
        <div style={revealStyle(flow.visible, 0)}>
          <StepFlow steps={flowSteps} title="Works inside the tools advisors already use." />
        </div>
      </section>

      {/* Stats */}
      <section ref={statsSection.ref} className="bg-white px-6" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={s.label} style={revealStyle(statsSection.visible, i * 100)}>
              <p className="font-bold text-gray-900" style={{ fontSize: 64 }}>{s.value}</p>
              <p className="text-gray-500 mt-1" style={{ fontSize: 18 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <SolutionsCTA />
    </main>
  );
};

export default NextConversationPage;
