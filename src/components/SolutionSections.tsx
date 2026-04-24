import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

/* ─── Section 1: Next Offer ─── */
const NextOfferVisual = () => (
  <div>
    <p className="text-xs font-mono text-gray-400 mb-2">cust_013 · <span className="text-blue-600 font-semibold">Frequent Traveler</span></p>
    <div className="space-y-2">
      {[
        { name: "Delta SkyMiles Card", desc: "matches your travel spend", tag: "Travel & Exploration", color: "#3B82F6" },
        { name: "Whole Foods 5% Back", desc: "3x weekly grocery visits", tag: "Food & Dining", color: "#22C55E" },
        { name: "REI Co-op Card", desc: "active lifestyle detected", tag: "Sports & Fitness", color: "#F59E0B" },
      ].map((o) => (
        <div key={o.name} className="rounded-lg p-3 flex items-center gap-2 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]" style={{ borderLeft: `3px solid ${o.color}` }}>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 font-semibold truncate" style={{ fontSize: "13px" }}>{o.name}</p>
            <p className="text-gray-500 text-[11px] mt-0.5 truncate">{o.desc}</p>
          </div>
          <span className="font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0" style={{ fontSize: "11px", background: `${o.color}15`, color: o.color }}>{o.tag}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Section 2: Next Product ─── */
const NextProductVisual = () => (
  <div>
    <div className="flex items-center gap-2 mb-2">
      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
      <p className="text-gray-900 text-base font-bold">New Parent</p>
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-600">95% confidence</span>
    </div>
    <div className="space-y-2">
      {[
        { merchant: "Buy Buy Baby", amount: "$234.50" },
        { merchant: "Pottery Barn Kids", amount: "$189.00" },
        { merchant: "Carter's", amount: "$124.50" },
      ].map((t) => (
        <div key={t.merchant} className="rounded-lg p-3 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]" style={{ borderLeft: "3px solid #22C55E" }}>
          <p className="font-mono text-xs text-gray-600">{t.merchant} · <span className="text-gray-900 font-semibold">{t.amount}</span></p>
        </div>
      ))}
    </div>
    <div className="border-t border-[#E5E7EB] mt-3 pt-3">
      <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-2">Recommended products</p>
      <div className="flex flex-wrap gap-2">
        {["529 College Savings", "Life Insurance Review", "Family Rewards Card"].map((p) => (
          <span key={p} className="text-xs text-blue-600 bg-blue-500/10 px-3 py-1 rounded-full font-medium flex items-center gap-1">
            {p} <span className="text-blue-400">↗</span>
          </span>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Section 3: Next Conversation ─── */
const NextConversationVisual = () => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <p className="text-xs font-mono text-gray-400">Advisor Alert · <span className="text-gray-900 font-semibold">cust_013</span></p>
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
      </span>
    </div>
    <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/15 text-amber-600">College-Bound Child — 91% confidence</span>
    <div className="mt-3 space-y-2">
      {[
        "Significant college application spending detected Jan–Feb 2026",
        "Child applying to Harvard, MIT, Yale, Stanford",
        "Over $3,000 in test prep and campus visits",
      ].map((point, i) => (
        <div key={i} className="rounded-lg p-3 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]" style={{ borderLeft: "3px solid #8B5CF6" }}>
          <p className="text-xs text-gray-700">● {point}</p>
        </div>
      ))}
    </div>
    <div className="border-t border-[#E5E7EB] mt-3 pt-3">
      <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-2">Recommended action</p>
      <button className="text-xs font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors">
        Schedule college savings consultation →
      </button>
    </div>
  </div>
);

/* ─── Section 4: Portfolio ─── */
const PortfolioVisual = () => (
  <div className="space-y-2">
    {[
      { label: "Travel & Exploration", stat: "26.9% · 14 customers", color: "#3B82F6" },
      { label: "New Parent detected", stat: "847 customers · 94% confidence", color: "#22C55E" },
      { label: "Delta Air Lines", stat: "$8,860 total spend · 13 customers", color: "#F59E0B" },
    ].map((row) => (
      <div
        key={row.label}
        className="rounded-lg p-3 flex items-center justify-between gap-2 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
        style={{ borderLeft: `3px solid ${row.color}` }}
      >
        <p className="text-gray-900 font-semibold truncate" style={{ fontSize: "13px" }}>{row.label}</p>
        <p className="font-mono text-gray-500 text-[11px] whitespace-nowrap shrink-0">{row.stat}</p>
      </div>
    ))}
  </div>
);

/* ─── Main Component ─── */
const SolutionSections = () => {
  const sections = [
    {
      id: "offer-intelligence",
      bg: "bg-white",
      label: "OFFER",
      labelColor: "text-blue-600",
      headline: "Serve the right offer before they go looking.",
      body: "Ventus detects purchase intent from spending patterns — giving your team the signal to serve the right offer at exactly the right moment.",
      card: <NextOfferVisual />,
      reverse: false,
      link: "/solutions/offer-intelligence",
    },
    {
      id: "product-intelligence",
      bg: "bg-white",
      label: "PRODUCT",
      labelColor: "text-blue-600",
      headline: "Know what your customer needs before they ask.",
      body: "Life event detection gives your team the intelligence to surface the right product at the right moment.",
      card: <NextProductVisual />,
      reverse: true,
      link: "/solutions/product-intelligence",
    },
    {
      id: "conversation-intelligence",
      bg: "bg-white",
      label: "CONVERSATION",
      labelColor: "text-blue-600",
      headline: "Turn every life event into an advisor conversation.",
      body: "Ventus detects life events in your customers transaction data and delivers structured intelligence to your CRM — who to call, why it matters, and exactly what to say.",
      card: <NextConversationVisual />,
      reverse: false,
      link: "/solutions/conversation-intelligence",
    },
    {
      id: "portfolio-intelligence",
      bg: "bg-white",
      label: "PORTFOLIO",
      labelColor: "text-blue-600",
      headline: "See your entire customer base in one view.",
      body: "Bank-wide behavioral intelligence for executive teams — lifestyle distribution, life event frequency, and spending patterns, all queryable via API.",
      card: <PortfolioVisual />,
      reverse: false,
      link: "/solutions/portfolio-intelligence",
    },
  ];

  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <ScrollReveal>
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-4">Solutions</p>
            <h2 className="text-3xl md:text-[40px] font-bold text-gray-900 leading-tight">
              Customer intelligence at every layer.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 lg:gap-6 items-stretch">
            {sections.map((s) => (
              <div
                key={s.id}
                className="rounded-2xl p-6 flex flex-col bg-white"
                style={{
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <p className={`text-[11px] font-semibold tracking-widest uppercase mb-2 ${s.labelColor}`}>{s.label}</p>
                <h2 className="text-xl font-bold text-gray-900 leading-tight mb-2">{s.headline}</h2>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{s.body}</p>
                <div className="rounded-xl p-4 mb-4 bg-gray-50 border border-gray-100">
                  {s.card}
                </div>
                <Link to={s.link} className="mt-auto">
                  <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50">
                    Learn more
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};

export default SolutionSections;
