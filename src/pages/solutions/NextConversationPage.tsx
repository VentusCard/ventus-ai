import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import StepFlow from "@/components/solutions/StepFlow";
import SolutionsCTA from "@/components/solutions/SolutionsCTA";
import { useSectionReveal, revealStyle } from "@/hooks/useSectionReveal";

const stats = [
  { value: "20+", label: "Life events that trigger alerts" },
  { value: "Event-driven", label: "Alerts triggered in real time" },
  { value: "Zero PII", label: "Transaction signals only" },
];

const flowSteps = [
  { label: "Detect", desc: "Signal identified." },
  { label: "Compile", desc: "Intelligence prepared." },
  { label: "Deliver", desc: "Right conversation triggered." },
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
      <section ref={hero.ref} className="pt-40 sm:pt-40 pb-16 sm:pb-20 px-6 min-h-[80vh] sm:min-h-screen flex items-center">
        <div className="max-w-3xl mx-auto text-center">
          <p style={revealStyle(hero.visible, 0)} className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">NEXT CONVERSATION</p>
          <h1 style={revealStyle(hero.visible, 100)} className="font-bold text-gray-900 leading-tight mb-6 text-3xl sm:text-[56px]">
            Every signal becomes the right conversation.
          </h1>
          <p style={revealStyle(hero.visible, 200)} className="text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed text-base sm:text-lg">
            Ventus detects life events in your customers' transaction data and delivers structured intelligence to your advisors and digital channels — so every customer gets the right conversation at exactly the right moment.
          </p>
          <div style={revealStyle(hero.visible, 300)}>
            <Link to="/contact">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Schedule a Demo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Regular vs Wealth Client */}
      <section ref={segments.ref} className="bg-white px-6" style={{ paddingTop: 60, paddingBottom: 80 }}>
        <div className="max-w-7xl mx-auto">
          <h2 style={revealStyle(segments.visible, 0)} className="font-bold text-gray-900 mb-3 text-3xl md:text-4xl">
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

      {/* Advisor alert */}
      <section ref={alert.ref} className="bg-white px-6" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-7xl mx-auto">
          <h2 style={revealStyle(alert.visible, 0)} className="font-bold text-gray-900 mb-12 text-3xl md:text-4xl">
            What an advisor sees.
          </h2>
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div style={revealStyle(alert.visible, 100)}>
              <p className="text-gray-500 leading-relaxed mb-6" style={{ fontSize: 18 }}>
                When Ventus detects a life event, your CRM receives a structured intelligence payload — talking points, evidence transactions, and recommended next steps included.
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
                  CRM Intelligence Payload · <span className="font-semibold">cust_013</span>
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px]" style={{ color: "#9CA3AF" }}>Powered by Ventus</span>
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

      {/* RISK SIGNAL — Handle With Care advisor brief */}
      <section className="bg-white px-6" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#DC2626" }}>RISK SIGNAL</p>
          <h2 className="font-bold text-gray-900 mb-3 text-3xl md:text-4xl">
            The right conversation at the right moment — even when it's not about a product.
          </h2>
          <p className="text-gray-500 mb-12 max-w-3xl" style={{ fontSize: 18 }}>
            When risk signals are detected your advisor gets a completely different brief. Not a sales script — a wellness conversation guide. Talking points focused on empathy, resources for support, and clear instructions to suppress product offers until the customer is in a better place.
          </p>

          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div className="space-y-3 text-gray-600" style={{ fontSize: 18 }}>
              <p>● Empathy-first opening framed as a check-in, not a pitch</p>
              <p>● Curated wellness resources and support pathways</p>
              <p>● Clear flag: pause product upsells until next signal change</p>
              <p>● Optional escalation to a financial coach or hardship team</p>
            </div>

            {/* Handle With Care brief */}
            <div
              style={{
                border: "1px solid #FCA5A5",
                boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                borderRadius: 12,
              }}
              className="p-6 bg-white"
            >
              <div
                className="-mx-6 -mt-6 px-6 py-3 mb-4 flex items-center justify-between"
                style={{ background: "#FEF2F2", borderTopLeftRadius: 12, borderTopRightRadius: 12, borderBottom: "1px solid #FCA5A5" }}
              >
                <p className="text-sm font-bold tracking-wide" style={{ color: "#B91C1C" }}>
                  Handle With Care
                </p>
                <span className="text-[10px] font-mono" style={{ color: "#9CA3AF" }}>cust_207</span>
              </div>

              <span
                className="text-sm font-semibold px-3 py-1 rounded-full inline-block"
                style={{ backgroundColor: "#FEF3C7", color: "#D97706" }}
              >
                Financial Stress — 88% confidence
              </span>

              <div className="mt-5 pt-4" style={{ borderTop: "1px solid #E5E7EB" }}>
                <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: "#DC2626" }}>Talking Points</p>
                <div className="space-y-2">
                  {[
                    "Open with a check-in — not a product. Ask how things are going.",
                    "Acknowledge that life has ups and downs. We're here to help.",
                    "Offer the financial wellness consultation — free, no commitment.",
                    "Mention spending controls only if the customer raises concerns.",
                  ].map((p, i) => (
                    <p key={i} className="text-sm" style={{ color: "#374151" }}>● {p}</p>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4" style={{ borderTop: "1px solid #E5E7EB" }}>
                <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: "#DC2626" }}>Resources to Offer</p>
                <div className="flex flex-wrap gap-2">
                  {["Financial Wellness Coach", "Hardship Program", "Spending Controls"].map((r) => (
                    <span key={r} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: "#F3F4F6", color: "#374151" }}>
                      {r}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4" style={{ borderTop: "1px solid #E5E7EB", background: "#FEF2F2", margin: "16px -24px -24px", padding: "16px 24px", borderBottomLeftRadius: 12, borderBottomRightRadius: 12 }}>
                <p className="text-xs font-semibold" style={{ color: "#B91C1C" }}>
                  ⓘ Product offers suppressed: Travel Card, Personal Loan, Investment Upsell. Re-evaluated on next signal change.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Conversation block — text + phone */}
      <section ref={conversation.ref} className="bg-white px-6" style={{ paddingTop: 40, paddingBottom: 60 }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div style={revealStyle(conversation.visible, 0)}>
            <h2 className="font-bold text-gray-900 mb-4 text-3xl md:text-4xl">
              A conversation, not a campaign.
            </h2>
            <p className="text-gray-500 leading-relaxed mb-3" style={{ fontSize: 18 }}>
              Ventus surfaces the signal. Your bank's AI assistant turns it into a real-time dialogue with your customer.
            </p>
            <p className="text-gray-500 leading-relaxed" style={{ fontSize: 16 }}>
              Powered by Ventus intelligence, your bank's assistant can surface the customer's spending pattern, holdings, and recent product interactions — so every reply feels personal, not promotional. Customers ask, your assistant answers, and the right product surfaces in the moment.
            </p>
          </div>

          <div style={revealStyle(conversation.visible, 150)} className="flex justify-center w-full">
            {/* iPhone frame */}
            <div
              className="phone-mockup-frame relative rounded-[40px] bg-white shadow-2xl border-[6px] border-slate-200 overflow-hidden flex flex-col"
              style={{ width: 320, height: 640 }}
            >
              {/* Notch */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-200 rounded-b-2xl z-10" />

              {/* Status bar */}
              <div className="h-8 bg-white flex items-end justify-between px-6 pb-1 text-[9px] text-slate-400 font-medium shrink-0">
                <span>9:41</span>
                <span>●●●</span>
              </div>

              {/* Header */}
              <div className="px-4 py-2 bg-white border-b border-gray-200 shrink-0">
                <p className="text-sm font-bold text-gray-900 leading-tight">Your Bank AI Assistant</p>
                <p className="text-[11px] leading-tight mt-0.5" style={{ color: "#9CA3AF" }}>Powered by Ventus</p>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 text-left bg-[#F9FAFB]">
                <div className="flex justify-end">
                  <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-tr-sm text-xs text-white" style={{ backgroundColor: "#2563EB" }}>
                    What products fit my situation?
                  </div>
                </div>

                <div className="flex items-start gap-1.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: "#2563EB" }}>AI</div>
                  <div className="max-w-[85%] bg-white px-3 py-2 rounded-2xl rounded-tl-sm text-xs text-gray-800 shadow-sm border border-gray-100 leading-relaxed">
                    Based on your spending, you have strong fitness habits and travel regularly. You might benefit from a travel rewards card — you have 8 Delta purchases this year with no travel card detected. Want me to show you options?
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="max-w-[85%] px-3 py-2 rounded-2xl rounded-tr-sm text-xs text-white" style={{ backgroundColor: "#2563EB" }}>
                    Yes show me
                  </div>
                </div>

                <div className="flex items-start gap-1.5">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: "#2563EB" }}>AI</div>
                  <div className="max-w-[85%] bg-white px-3 py-2 rounded-2xl rounded-tl-sm text-xs text-gray-800 shadow-sm border border-gray-100 leading-relaxed">
                    Here are 3 cards matched to your profile...
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 pl-7">
                  {["Delta SkyMiles · 60k bonus miles", "Chase Sapphire · 3x travel pts", "Amex Gold · 4x dining"].map((c) => (
                    <div key={c} className="bg-white px-2.5 py-2 rounded-lg border border-gray-200 text-[10px] font-semibold text-gray-800 shadow-sm">
                      {c}
                    </div>
                  ))}
                </div>
              </div>

              {/* Home indicator */}
              <div className="h-5 flex items-center justify-center shrink-0 bg-white">
                <div className="w-24 h-1 rounded-full bg-slate-200" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flow steps */}
      <section ref={flow.ref} className="bg-white px-6" style={{ paddingTop: 48, paddingBottom: 48 }}>
        <div style={revealStyle(flow.visible, 0)}>
          <StepFlow steps={flowSteps} title="Works inside the tools your advisors and digital teams already use." />
        </div>
      </section>

      {/* Stats */}
      <section ref={statsSection.ref} className="bg-white px-6" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((s, i) => {
            const isLong = s.value.length > 6;
            return (
              <div key={s.label} style={revealStyle(statsSection.visible, i * 100)}>
                <p className={`font-bold text-gray-900 whitespace-nowrap ${isLong ? "text-2xl sm:text-[32px]" : "text-3xl sm:text-[52px]"}`}>{s.value}</p>
                <p className="text-gray-500 mt-1 text-sm sm:text-lg">{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      <SolutionsCTA />
    </main>
  );
};

export default NextConversationPage;
