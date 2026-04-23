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
  const conversation = useSectionReveal();
  const segments = useSectionReveal();
  const flow = useSectionReveal();
  const statsSection = useSectionReveal();

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section ref={hero.ref} className="pt-32 sm:pt-40 pb-16 sm:pb-20 px-6 min-h-[70vh] sm:min-h-screen flex items-center">
        <div className="max-w-3xl mx-auto text-center">
          <p style={revealStyle(hero.visible, 0)} className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">Next Conversation</p>
          <h1 style={revealStyle(hero.visible, 100)} className="font-bold text-gray-900 leading-tight mb-6 text-3xl sm:text-[56px]">
            Every signal becomes the right conversation.
          </h1>
          <p style={revealStyle(hero.visible, 200)} className="text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed text-base sm:text-lg">
            Ventus detects life events in transaction data and triggers the right response — whether that's an advisor prep brief, a personalized email, or an AI-powered chat.
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

      {/* Regular vs Wealth Client */}
      <section ref={segments.ref} className="bg-white px-6" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div className="max-w-7xl mx-auto">
          <h2 style={{ ...revealStyle(segments.visible, 0), fontSize: 36 }} className="font-bold text-gray-900 mb-3 text-center">
            Tailored to every relationship.
          </h2>
          <p style={{ ...revealStyle(segments.visible, 100), fontSize: 18 }} className="text-gray-500 text-center mb-12">
            The same signal triggers different journeys based on customer tier.
          </p>

          <div className="grid md:grid-cols-2 gap-6 items-stretch">
            {/* Regular Client card */}
            <div
              style={{
                ...revealStyle(segments.visible, 200),
                border: "1px solid #E5E7EB",
                borderLeft: "4px solid #2563EB",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}
              className="rounded-xl bg-white p-7 flex flex-col"
            >
              <p className="text-xs font-bold tracking-widest uppercase text-blue-600 mb-4">Regular Client</p>

              <p className="text-base font-bold text-gray-900 mb-1">Automated email flow</p>
              <p className="text-xs text-gray-500 mb-5">Signal detected → 24h delay → delivered</p>

              <div className="space-y-3 mb-6">
                {[
                  { n: "1", label: "Educational nudge about the life event" },
                  { n: "2", label: "Personalized product spotlight" },
                  { n: "3", label: "Soft conversion CTA" },
                ].map((s) => (
                  <div key={s.n} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                      {s.n}
                    </span>
                    <p className="text-sm text-gray-700 leading-relaxed pt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 pt-5 mt-auto">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-3">AI Assistant Context</p>
                <div className="space-y-1.5 text-sm text-gray-600">
                  <p>● Knows recent spending pattern</p>
                  <p>● Knows account holdings</p>
                  <p>● Can answer product questions in real time</p>
                </div>
              </div>
            </div>

            {/* Wealth Client card */}
            <div
              style={{
                ...revealStyle(segments.visible, 350),
                border: "1px solid #E5E7EB",
                borderLeft: "4px solid #16A34A",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
              }}
              className="rounded-xl bg-white p-7 flex flex-col"
            >
              <p className="text-xs font-bold tracking-widest uppercase text-green-600 mb-4">Wealth Client</p>

              <p className="text-base font-bold text-gray-900 mb-1">Advisor prep brief</p>
              <p className="text-xs text-gray-500 mb-5">Sent to assigned relationship manager within 24h</p>

              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <p>● Suggested talking points based on signal</p>
                <p>● Cross-sell opportunities aligned to behavior</p>
                <p>● Recent activity summary</p>
              </div>

              <p className="text-sm font-semibold mb-6" style={{ color: "#D97706" }}>
                Suggested outreach: Within 5 business days
              </p>

              <div className="border-t border-gray-200 pt-5 mt-auto">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-3">Concierge Options</p>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs font-semibold px-4 py-2 rounded-full bg-white text-green-700 border border-green-200">
                    Schedule private review
                  </span>
                  <span className="text-xs font-semibold px-4 py-2 rounded-full bg-white text-green-700 border border-green-200">
                    Send curated insights
                  </span>
                </div>
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
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={s.label} style={revealStyle(statsSection.visible, i * 100)}>
              <p className="font-bold text-gray-900 text-3xl sm:text-[52px]">{s.value}</p>
              <p className="text-gray-500 mt-1 text-sm sm:text-lg">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <SolutionsCTA />
    </main>
  );
};

export default NextConversationPage;
