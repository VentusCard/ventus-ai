import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import StepFlow from "@/components/solutions/StepFlow";
import SolutionsCTA from "@/components/solutions/SolutionsCTA";
import { useSectionReveal, revealStyle } from "@/hooks/useSectionReveal";

const lifeEvents = [
  {
    color: "#22C55E",
    name: "New Parent",
    confidence: "95%",
    evidence: [
      { merchant: "Buy Buy Baby", amount: "$234.50" },
      { merchant: "Pottery Barn Kids", amount: "$189.00" },
      { merchant: "Carter's", amount: "$124.50" },
    ],
    products: ["Family Rewards Card", "Life Insurance Review", "529 Plan"],
  },
  {
    color: "#F59E0B",
    name: "College-Bound Child",
    confidence: "91%",
    evidence: [
      { merchant: "Princeton Review", amount: "$1,299.00" },
      { merchant: "Yale Admissions", amount: "$32.00" },
      { merchant: "College Essay Advisor", amount: "$850.00" },
    ],
    products: ["529 College Savings Plan", "Student Loan Planning"],
  },
  {
    color: "#3B82F6",
    name: "Home Purchase",
    confidence: "87%",
    evidence: [
      { merchant: "Chicago Title Company", amount: "$1,200" },
      { merchant: "Home Depot", amount: "$847" },
      { merchant: "Lowe's", amount: "$623" },
    ],
    products: ["Home Equity Line", "Homeowners Insurance", "Mortgage Review"],
  },
  {
    color: "#8B5CF6",
    name: "Retirement Planning",
    confidence: "84%",
    evidence: [
      { merchant: "Fidelity", amount: "$2,400" },
      { merchant: "AARP", amount: "$45" },
      { merchant: "Estate Attorney", amount: "$800" },
    ],
    products: ["IRA Rollover", "Wealth Management Consultation"],
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
  const events = useSectionReveal();
  const flow = useSectionReveal();
  const statsSection = useSectionReveal();

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section ref={hero.ref} className="pt-40 pb-20 px-6 min-h-screen flex items-center">
        <div className="max-w-3xl mx-auto text-center">
          <p style={revealStyle(hero.visible, 0)} className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">Next Product</p>
          <h1 style={{ ...revealStyle(hero.visible, 100), fontSize: 56 }} className="font-bold text-gray-900 leading-tight mb-6">
            Know what your customer needs before they ask.
          </h1>
          <p style={{ ...revealStyle(hero.visible, 200), fontSize: 18 }} className="text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            Life event detection surfaces the right product at the right moment — automatically. No surveys, no guesswork, just transaction signals.
          </p>
          <div style={revealStyle(hero.visible, 300)}>
            <Link to="/contact">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Schedule a Demo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Life events */}
      <section ref={events.ref} className="bg-white px-6" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-7xl mx-auto">
          <h2 style={{ ...revealStyle(events.visible, 0), fontSize: 36 }} className="font-bold text-gray-900 mb-3 text-center">
            Every life event is a product opportunity.
          </h2>
          <p style={{ ...revealStyle(events.visible, 100), fontSize: 18 }} className="text-gray-500 text-center mb-12">
            20+ life events detected from transaction patterns alone.
          </p>
          <div className="grid md:grid-cols-2 gap-6">
            {lifeEvents.map((evt, i) => (
              <div key={evt.name} className="rounded-lg p-5 bg-white" style={{ ...revealStyle(events.visible, 200 + i * 150), borderLeft: `3px solid ${evt.color}` }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: evt.color }} />
                  <p className="font-bold text-gray-900 text-sm">{evt.name}</p>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${evt.color}15`, color: evt.color }}>
                    {evt.confidence} confidence
                  </span>
                </div>
                <div className="space-y-1 mb-4">
                  {evt.evidence.map((e) => (
                    <p key={e.merchant} className="text-xs font-mono text-gray-500">
                      {e.merchant} <span className="text-gray-900 font-semibold">{e.amount}</span>
                    </p>
                  ))}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {evt.products.map((p) => (
                    <span key={p} className="text-xs text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                      → {p}
                    </span>
                  ))}
                </div>
              </div>
            ))}
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

export default NextProductPage;
