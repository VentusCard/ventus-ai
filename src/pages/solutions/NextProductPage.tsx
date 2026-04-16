import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import SolutionsIntegration from "@/components/solutions/SolutionsIntegration";
import SolutionsCTA from "@/components/solutions/SolutionsCTA";

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
  { label: "Raw transactions", desc: "Messy merchant strings" },
  { label: "Pattern detection", desc: "Grouped by category" },
  { label: "Life event confirmed", desc: "Confidence score" },
  { label: "Product matched", desc: "Recommendation ready" },
  { label: "Advisor alerted", desc: "Push notification" },
];

const stats = [
  { value: "20+", label: "Life events detected" },
  { value: "95%", label: "Average detection confidence" },
  { value: "Zero PII", label: "Transaction signals only" },
];

const NextProductPage = () => (
  <main className="bg-white min-h-screen">
    {/* Hero */}
    <section className="pt-40 pb-20 px-6 min-h-screen flex items-center">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">Next Product</p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          Know what your customer needs before they ask.
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
          Life event detection surfaces the right product at the right moment — automatically. No surveys, no guesswork, just transaction signals.
        </p>
        <Link to="/contact">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Schedule a Demo</Button>
        </Link>
      </div>
    </section>

    {/* Life events */}
    <section className="bg-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 text-center">
          Every life event is a product opportunity.
        </h2>
        <p className="text-sm text-gray-500 text-center mb-12">20+ life events detected from transaction patterns alone.</p>
        <div className="grid md:grid-cols-2 gap-6">
          {lifeEvents.map((evt) => (
            <div key={evt.name} className="rounded-lg p-5 bg-white" style={{ borderLeft: `3px solid ${evt.color}` }}>
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
    <section className="py-20 px-6" style={{ backgroundColor: "#F9FAFB" }}>
      <ScrollReveal>
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12 text-center">
            From raw transaction to product recommendation.
          </h2>
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-4">
            {flowSteps.map((step, i) => (
              <div key={step.label} className="flex items-center gap-3">
                <div
                  className="rounded-xl px-5 py-4 text-center min-w-[140px]"
                  style={{ backgroundColor: i === 2 ? "#F0F4FF" : "white" }}
                >
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold mb-2">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="text-sm font-semibold text-gray-900">{step.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{step.desc}</p>
                </div>
                {i < flowSteps.length - 1 && (
                  <ArrowRight size={18} className="text-blue-500 hidden md:block flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>

    {/* Stats */}
    <section className="bg-white py-16 px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-3xl md:text-4xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>

    <SolutionsIntegration extraLabels={["nCino"]} />
    <SolutionsCTA />
  </main>
);

export default NextProductPage;
