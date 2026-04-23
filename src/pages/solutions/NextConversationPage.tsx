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
  const segments = useSectionReveal();
  const phone = useSectionReveal();
  const flow = useSectionReveal();
  const statsSection = useSectionReveal();

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section ref={hero.ref} className="pt-32 sm:pt-40 pb-16 sm:pb-20 px-6 min-h-[70vh] sm:min-h-screen flex items-center">
        <div className="max-w-3xl mx-auto text-center">
          <p style={revealStyle(hero.visible, 0)} className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">Next Conversation</p>
          <h1 style={revealStyle(hero.visible, 100)} className="font-bold text-gray-900 leading-tight mb-6 text-3xl sm:text-[56px]">
            Give every advisor a warm lead every morning.
          </h1>
          <p style={revealStyle(hero.visible, 200)} className="text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed text-base sm:text-lg">
            Ventus detects life events in your customers' transaction data and alerts advisors instantly — who to call, why it matters, and exactly what to say.
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

      {/* Section 1 — Regular vs Wealth Client */}
      <section ref={segments.ref} className="bg-gray-50 px-6" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-7xl mx-auto">
          <h2 style={{ ...revealStyle(segments.visible, 0), fontSize: 36 }} className="font-bold text-gray-900 mb-3 text-center">
            Tailored to every relationship.
          </h2>
          <p style={{ ...revealStyle(segments.visible, 100), fontSize: 18 }} className="text-gray-500 text-center mb-12">
            The same signal triggers different journeys based on customer tier.
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Regular Client column */}
            <div style={revealStyle(segments.visible, 200)} className="space-y-4">
              <p className="text-xs font-bold tracking-widest uppercase text-blue-600">Regular Client</p>

              <div className="rounded-xl bg-white p-5" style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                <p className="text-sm font-bold text-gray-900 mb-1">Email flow · A personalized recommendation for you</p>
                <p className="text-xs text-gray-500 mb-4">Signal detected → 24h delay → send</p>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>1. Educational nudge</p>
                  <p>2. Product spotlight</p>
                  <p>3. Soft conversion CTA</p>
                </div>
              </div>

              <div className="rounded-xl bg-white p-5" style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                <p className="text-sm font-bold text-gray-900 mb-4">AI Chatbot context</p>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">Knows</p>
                <div className="space-y-1 text-sm text-gray-700 mb-4">
                  <p>● Recent spending pattern</p>
                  <p>● Account holdings</p>
                  <p>● Recent product interactions</p>
                </div>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">Can answer</p>
                <div className="space-y-1.5">
                  <p className="text-sm italic text-gray-700">"What products fit my situation?"</p>
                  <p className="text-sm italic text-gray-700">"Show me relevant offers"</p>
                </div>
              </div>
            </div>

            {/* Wealth Client column */}
            <div style={revealStyle(segments.visible, 300)} className="space-y-4">
              <p className="text-xs font-bold tracking-widest uppercase text-green-600">Wealth Client</p>

              <div className="rounded-xl bg-white p-5" style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                <p className="text-sm font-bold text-gray-900 mb-1">Advisor notification + prep brief</p>
                <p className="text-xs text-gray-500 mb-4">Sent to: Assigned relationship manager</p>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">Personalized prep brief includes</p>
                <div className="space-y-1 text-sm text-gray-700 mb-4">
                  <p>● Suggested talking points based on detected signal</p>
                  <p>● Cross-sell opportunities aligned to behavior</p>
                  <p>● Recent activity summary</p>
                </div>
                <p className="text-sm font-semibold" style={{ color: "#D97706" }}>Suggested outreach: Within 5 business days</p>
              </div>

              <div className="rounded-xl bg-white p-5" style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
                <p className="text-sm font-bold text-gray-900 mb-4">Concierge Touch</p>
                <div className="flex flex-wrap gap-2">
                  <button className="text-xs font-semibold px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors">
                    Schedule private review
                  </button>
                  <button className="text-xs font-semibold px-4 py-2 rounded-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors">
                    Send curated insights
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Full-width CTAs */}
          <div style={revealStyle(segments.visible, 400)} className="grid md:grid-cols-2 gap-4">
            <button className="w-full text-sm font-semibold text-white px-6 py-3.5 rounded-xl transition-colors" style={{ backgroundColor: "#2563EB" }}>
              Open AI Banking Assistant
            </button>
            <button className="w-full text-sm font-semibold text-white px-6 py-3.5 rounded-xl transition-colors" style={{ backgroundColor: "#8B5CF6" }}>
              Open WM CoPilot
            </button>
          </div>
        </div>
      </section>

      {/* Section 2 — Phone mockup AI chat */}
      <section ref={phone.ref} className="bg-white px-6" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 style={{ ...revealStyle(phone.visible, 0), fontSize: 36 }} className="font-bold text-gray-900 mb-3">
            A conversation, not a campaign.
          </h2>
          <p style={{ ...revealStyle(phone.visible, 100), fontSize: 18 }} className="text-gray-500 mb-12">
            The AI assistant turns detected signals into a real-time dialogue.
          </p>

          <div style={revealStyle(phone.visible, 200)} className="flex justify-center">
            <div
              className="relative bg-gray-50 overflow-hidden"
              style={{
                width: 280,
                height: 560,
                borderRadius: 36,
                border: "8px solid #1F2937",
                boxShadow: "0 20px 50px rgba(0,0,0,0.18)",
              }}
            >
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-900 rounded-b-2xl z-10" />

              <div className="h-full overflow-y-auto px-3 pt-10 pb-4 space-y-3 text-left">
                {/* User bubble */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-tr-sm text-xs text-white" style={{ backgroundColor: "#2563EB" }}>
                    What products fit my situation?
                  </div>
                </div>

                {/* AI bubble */}
                <div className="flex items-start gap-1.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: "#2563EB" }}>V</div>
                  <div className="max-w-[85%] bg-white px-3 py-2 rounded-2xl rounded-tl-sm text-xs text-gray-800 shadow-sm border border-gray-100 leading-relaxed">
                    Based on your spending, you have strong fitness habits and travel regularly. You might benefit from a travel rewards card — you have 8 Delta purchases this year with no travel card detected. Want me to show you options?
                  </div>
                </div>

                {/* User bubble */}
                <div className="flex justify-end">
                  <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-tr-sm text-xs text-white" style={{ backgroundColor: "#2563EB" }}>
                    Yes show me
                  </div>
                </div>

                {/* AI bubble */}
                <div className="flex items-start gap-1.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: "#2563EB" }}>V</div>
                  <div className="max-w-[85%] bg-white px-3 py-2 rounded-2xl rounded-tl-sm text-xs text-gray-800 shadow-sm border border-gray-100 leading-relaxed">
                    Here are 3 cards matched to your profile...
                  </div>
                </div>

                {/* Card pills */}
                <div className="flex flex-col gap-1.5 pl-7">
                  {["Delta SkyMiles · 60k bonus miles", "Chase Sapphire · 3x travel pts", "Amex Gold · 4x dining"].map((c) => (
                    <div key={c} className="bg-white px-2.5 py-2 rounded-lg border border-gray-200 text-[10px] font-semibold text-gray-800 shadow-sm">
                      {c}
                    </div>
                  ))}
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
