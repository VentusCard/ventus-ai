import SEO from "@/components/SEO";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import StepFlow from "@/components/solutions/StepFlow";
import SolutionsCTA from "@/components/solutions/SolutionsCTA";
import { useSectionReveal, revealStyle } from "@/hooks/useSectionReveal";

type Product = {
  title: string;
  reason: string;
  cta: string;
  ctaColor: string;
};

type EventData = {
  id: string;
  color: string;
  name: string;
  confidence: string;
  txnCount: string;
  topSignals: string;
  evidence: { merchant: string; amount: string }[];
  products: Product[];
};

const events: EventData[] = [
  {
    id: "new-parent",
    color: "#22C55E",
    name: "New Parent",
    confidence: "95%",
    txnCount: "8 transactions detected",
    topSignals: "Buy Buy Baby, Pottery Barn Kids, Carter's",
    evidence: [
      { merchant: "Buy Buy Baby", amount: "$234.50" },
      { merchant: "Pottery Barn Kids", amount: "$189.00" },
      { merchant: "Carter's", amount: "$124.50" },
    ],
    products: [
      {
        title: "Family Rewards Card",
        reason: "Earn 3% on baby essentials · Based on 8 purchases at baby retailers",
        cta: "Apply Now →",
        ctaColor: "#16A34A",
      },
      {
        title: "529 College Plan",
        reason: "Start saving from day one · $2,450 detected in baby spend suggests planning mindset",
        cta: "Open Plan →",
        ctaColor: "#2563EB",
      },
      {
        title: "Life Insurance Review",
        reason: "Protect what matters most",
        cta: "Schedule Review →",
        ctaColor: "#6B7280",
      },
    ],
  },
  {
    id: "college",
    color: "#F59E0B",
    name: "College-Bound Child",
    confidence: "91%",
    txnCount: "6 transactions detected",
    topSignals: "Princeton Review, Yale Admissions, College Essay Advisor",
    evidence: [
      { merchant: "Princeton Review", amount: "$1,299.00" },
      { merchant: "Yale Admissions", amount: "$32.00" },
      { merchant: "College Essay Advisor", amount: "$850.00" },
    ],
    products: [
      {
        title: "529 College Savings Plan",
        reason: "Tax-advantaged growth · $3,000+ already invested in admissions prep",
        cta: "Open Plan →",
        ctaColor: "#16A34A",
      },
      {
        title: "Student Loan Planning",
        reason: "Compare federal and private options before tuition is due",
        cta: "Get Started →",
        ctaColor: "#2563EB",
      },
      {
        title: "Tuition Payment Strategy",
        reason: "Optimize cash flow across four years",
        cta: "Schedule Review →",
        ctaColor: "#6B7280",
      },
    ],
  },
  {
    id: "home",
    color: "#3B82F6",
    name: "Home Purchase",
    confidence: "87%",
    txnCount: "9 transactions detected",
    topSignals: "Chicago Title, Home Depot, Lowe's",
    evidence: [
      { merchant: "Chicago Title Company", amount: "$1,200" },
      { merchant: "Home Depot", amount: "$847" },
      { merchant: "Lowe's", amount: "$623" },
    ],
    products: [
      {
        title: "Home Equity Line",
        reason: "Tap into new equity for renovations · $2,670 in home improvement spend detected",
        cta: "Apply Now →",
        ctaColor: "#16A34A",
      },
      {
        title: "Homeowners Insurance",
        reason: "Protect your largest asset with bundled coverage",
        cta: "Get Quote →",
        ctaColor: "#2563EB",
      },
      {
        title: "Mortgage Review",
        reason: "Refinance options when rates move",
        cta: "Schedule Review →",
        ctaColor: "#6B7280",
      },
    ],
  },
];

const flowSteps = [
  { label: "Detect", desc: "Identify spending signals" },
  { label: "Confirm", desc: "Validate life event" },
  { label: "Recommend", desc: "Surface the right product" },
];

const stats = [
  { value: "20+", label: "Life events detected" },
  { value: "95%", label: "Average detection confidence" },
  { value: "Zero PII", label: "Transaction signals only" },
];

const NextProductPage = () => {
  const hero = useSectionReveal();
  const tabs = useSectionReveal();
  const flow = useSectionReveal();
  const statsSection = useSectionReveal();
  const [activeId, setActiveId] = useState(events[0].id);
  const active = events.find((e) => e.id === activeId)!;

  // Auto-rotate tabs every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveId((current) => {
        const idx = events.findIndex((e) => e.id === current);
        return events[(idx + 1) % events.length].id;
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="bg-white min-h-screen">
      <SEO title="Product Intelligence — Ventus AI" description="Recommend the next-best banking product for each customer based on behavioral triggers and life events." path="/solutions/product-intelligence" />
      {/* Hero */}
      <section ref={hero.ref} className="pt-40 sm:pt-40 pb-16 sm:pb-20 px-6 min-h-[80vh] sm:min-h-screen flex items-center">
        <div className="max-w-3xl mx-auto text-center">
          <p style={revealStyle(hero.visible, 0)} className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">NEXT PRODUCT</p>
          <h1 style={revealStyle(hero.visible, 100)} className="font-bold text-gray-900 leading-tight mb-6 text-3xl sm:text-[56px]">
            Know what your customer needs before they ask.
          </h1>
          <p style={revealStyle(hero.visible, 200)} className="text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed text-base sm:text-lg">
            Ventus detects life events from transaction patterns and surfaces the intelligence your teams need to recommend the right product.
          </p>
          <div style={revealStyle(hero.visible, 300)}>
            <Link to="/contact">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Schedule a Demo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Tabbed life events */}
      <section ref={tabs.ref} className="bg-white px-6" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-6xl mx-auto">
          <p style={{ ...revealStyle(tabs.visible, 0), color: "#16A34A" }} className="text-xs font-bold tracking-widest uppercase mb-3">GROWTH</p>
          <h2 style={revealStyle(tabs.visible, 0)} className="font-bold text-gray-900 mb-3 text-3xl md:text-4xl">
            Ventus surfaces the signal. Your team acts on it.
          </h2>
          <p style={{ ...revealStyle(tabs.visible, 100), fontSize: 18 }} className="text-gray-500 text-center mb-8">
            20+ life events detected from transaction patterns alone.
          </p>

          {/* Tab pills */}
          <div style={revealStyle(tabs.visible, 200)} className="flex justify-center flex-wrap gap-3 mb-10">
            {events.map((e) => {
              const isActive = e.id === activeId;
              return (
                <button
                  key={e.id}
                  onClick={() => setActiveId(e.id)}
                  className="text-sm font-semibold px-5 py-2.5 rounded-full transition-all"
                  style={
                    isActive
                      ? { backgroundColor: "#2563EB", color: "#FFFFFF", border: "1px solid #2563EB" }
                      : { backgroundColor: "transparent", color: "#374151", border: "1px solid #D1D5DB" }
                  }
                >
                  {e.name}
                </button>
              );
            })}
          </div>

          {/* Two column: detection card + recommended products */}
          <div key={active.id} className="grid md:grid-cols-2 gap-8 items-start animate-fade-in">
            {/* Left — detection card */}
            <div
              className="rounded-xl p-7 bg-white"
              style={{
                border: "1.5px solid #E5E7EB",
                borderLeft: `4px solid ${active.color}`,
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                transition: "border-left-color 300ms ease",
              }}
            >
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: active.color }} />
                <p className="font-bold text-gray-900 text-base">{active.name}</p>
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{ background: `${active.color}15`, color: active.color }}
                >
                  {active.confidence} confidence
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {active.txnCount}
                </span>
              </div>

              <p className="text-xs text-gray-500 mb-4">
                <span className="font-semibold text-gray-700">Top signals:</span> {active.topSignals}
              </p>

              <div className="space-y-1 mb-2">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">Evidence transactions</p>
                {active.evidence.map((e) => (
                  <p key={e.merchant} className="text-xs font-mono text-gray-500">
                    {e.merchant} · <span className="text-gray-900 font-semibold">{e.amount}</span>
                  </p>
                ))}
              </div>
            </div>

            {/* Right — Recommended products (compact) */}
            <div className="space-y-3">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-blue-600 mb-1">
                Recommended Products
              </p>
              {active.products.map((p, i) => (
                <div
                  key={p.title}
                  className="rounded-xl bg-white"
                  style={{
                    padding: 16,
                    border: "1.5px solid #E5E7EB",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    animation: `fade-in 0.35s ease-out both`,
                    animationDelay: `${i * 70}ms`,
                  }}
                >
                  <p className="text-sm font-bold text-gray-900 mb-1">{p.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">{p.reason}</p>
                  <button
                    className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors"
                    style={{ backgroundColor: p.ctaColor }}
                  >
                    {p.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* PROTECTION — Suppression example */}
      <section className="bg-white px-6" style={{ paddingTop: 40, paddingBottom: 80 }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-xs font-bold tracking-widest uppercase mb-3" style={{ color: "#DC2626" }}>PROTECTION</p>
          <h2 className="font-bold text-gray-900 mb-3 text-3xl md:text-4xl">
            Know when not to sell.
          </h2>
          <p className="text-gray-500 mb-10 max-w-3xl" style={{ fontSize: 18 }}>
            When Ventus detects financial stress or risk signals it automatically suppresses irrelevant product offers and surfaces the right tools instead — spending controls, wellness resources, and alerts. Your bank shows up with empathy not a sales pitch.
          </p>

          <div className="grid md:grid-cols-2 gap-8 items-start">
            <div
              className="rounded-xl p-7"
              style={{
                border: "1.5px solid #FCA5A5",
                borderLeft: "4px solid #DC2626",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                background: "#FEF2F2",
              }}
            >
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#DC2626" }} />
                <p className="font-bold text-gray-900 text-base">Financial Stress Signal</p>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: "#DC262615", color: "#DC2626" }}>
                  Detected
                </span>
              </div>
              <p className="text-sm font-semibold text-gray-900 mb-3">
                Credit card offer suppressed — financial stress signal detected
              </p>
              <p className="text-xs text-gray-600 leading-relaxed mb-4">
                Recurring overdraft fees, cash advances, and elevated discretionary spend detected over the last 60 days. Standard credit card promotions paused.
              </p>
              <div className="border-t border-red-200 pt-3">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">Suppressed offers</p>
                <div className="space-y-1 text-xs text-gray-600">
                  <p>● Premium Travel Card</p>
                  <p>● Personal Loan Pre-approval</p>
                  <p>● Investment Account Upsell</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: "#DC2626" }}>
                Surfaced Instead
              </p>
              {[
                { title: "Merchant Category Controls", reason: "Help the customer set guardrails on discretionary categories.", cta: "Enable Controls →" },
                { title: "Daily Spending Limits", reason: "Soft caps with friendly notifications — no judgement, just awareness.", cta: "Set Limits →" },
                { title: "Financial Wellness Consultation", reason: "Free 30-minute session with a certified financial coach.", cta: "Schedule Session →" },
              ].map((p) => (
                <div
                  key={p.title}
                  className="rounded-xl bg-white"
                  style={{
                    padding: 16,
                    border: "1.5px solid #E5E7EB",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                >
                  <p className="text-sm font-bold text-gray-900 mb-1">{p.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3">{p.reason}</p>
                  <button
                    className="text-xs font-semibold text-white px-3 py-1.5 rounded-lg transition-colors"
                    style={{ backgroundColor: "#0F172A" }}
                  >
                    {p.cta}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Detection flow */}
      <section ref={flow.ref} className="bg-white px-6" style={{ paddingTop: 48, paddingBottom: 48 }}>
        <div style={revealStyle(flow.visible, 0)}>
          <StepFlow steps={flowSteps} title="From raw transaction to product recommendation." />
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

export default NextProductPage;
