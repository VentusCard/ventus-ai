import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

/* ─── Section 1: Next Offer ─── */
const NextOfferVisual = () => (
  <div>
    <p className="text-xs font-mono text-gray-400 mb-4">cust_013 · <span className="text-blue-600 font-semibold">Frequent Traveler</span></p>
    <div className="space-y-0">
      {[
        { name: "Delta SkyMiles Card", desc: "matches your travel spend", tag: "Travel & Exploration", color: "#3B82F6" },
        { name: "Whole Foods 5% Back", desc: "3x weekly grocery visits", tag: "Food & Dining", color: "#22C55E" },
        { name: "REI Co-op Card", desc: "active lifestyle detected", tag: "Sports & Fitness", color: "#F59E0B" },
      ].map((o, i, arr) => (
        <div key={o.name}>
          <div className="rounded-lg p-4 flex items-start gap-3 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]" style={{ borderLeft: `3px solid ${o.color}` }}>
            <div className="flex-1">
              <p className="text-gray-900 text-sm font-semibold">{o.name}</p>
              <p className="text-gray-500 text-xs mt-0.5">{o.desc}</p>
            </div>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: `${o.color}15`, color: o.color }}>{o.tag}</span>
          </div>
          {i < arr.length - 1 && <div className="border-b border-[#E5E7EB] mx-4" />}
        </div>
      ))}
    </div>
  </div>
);

/* ─── Section 2: Next Product ─── */
const NextProductVisual = () => (
  <div>
    <div className="flex items-center gap-2 mb-4">
      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
      <p className="text-gray-900 text-lg font-bold">New Parent</p>
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/15 text-green-600">95% confidence</span>
    </div>
    <div className="space-y-0">
      {[
        { merchant: "Buy Buy Baby", amount: "$234.50" },
        { merchant: "Pottery Barn Kids", amount: "$189.00" },
        { merchant: "Carter's", amount: "$124.50" },
      ].map((t, i, arr) => (
        <div key={t.merchant}>
          <div className="rounded-lg p-4 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]" style={{ borderLeft: "3px solid #22C55E" }}>
            <p className="font-mono text-xs text-gray-600">{t.merchant} · <span className="text-gray-900 font-semibold">{t.amount}</span></p>
          </div>
          {i < arr.length - 1 && <div className="border-b border-[#E5E7EB] mx-4" />}
        </div>
      ))}
    </div>
    <div className="border-t border-[#E5E7EB] mt-5 pt-4">
      <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-3">Recommended products</p>
      <div className="flex flex-wrap gap-2">
        {["529 College Savings", "Life Insurance Review", "Family Rewards Card"].map((p) => (
          <span key={p} className="text-xs text-blue-600 bg-blue-500/10 px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
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
    <div className="flex items-center justify-between mb-4">
      <p className="text-xs font-mono text-gray-400">Advisor Alert · <span className="text-gray-900 font-semibold">cust_013</span></p>
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
      </span>
    </div>
    <span className="text-sm font-semibold px-3 py-1 rounded-full bg-amber-500/15 text-amber-600">College-Bound Child — 91% confidence</span>
    <div className="mt-5 space-y-0">
      {[
        "Significant college application spending detected Jan–Feb 2026",
        "Child applying to Harvard, MIT, Yale, Stanford",
        "Over $3,000 in test prep and campus visits",
      ].map((point, i, arr) => (
        <div key={i}>
          <div className="rounded-lg p-4 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]" style={{ borderLeft: "3px solid #8B5CF6" }}>
            <p className="text-sm text-gray-700">● {point}</p>
          </div>
          {i < arr.length - 1 && <div className="border-b border-[#E5E7EB] mx-4" />}
        </div>
      ))}
    </div>
    <div className="border-t border-[#E5E7EB] mt-5 pt-4">
      <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-3">Recommended action</p>
      <button className="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors">
        Schedule college savings consultation →
      </button>
    </div>
  </div>
);

/* ─── Main Component ─── */
const SolutionSections = () => {
  const sections = [
    {
      id: "next-offer",
      bg: "bg-white",
      label: "NEXT OFFER",
      labelColor: "text-blue-600",
      headline: "Serve the right offer before they go looking.",
      body: "Ventus detects purchase intent from spending patterns — surfacing personalized offers at exactly the moment a customer is ready to buy.",
      card: <NextOfferVisual />,
      reverse: false,
      link: "/solutions/next-offer",
    },
    {
      id: "next-product",
      bg: "bg-white",
      label: "NEXT PRODUCT",
      labelColor: "text-blue-600",
      headline: "Know what your customer needs before they ask.",
      body: "Life event detection surfaces the right product at the right moment — automatically. No surveys, no guesswork, just transaction signals.",
      card: <NextProductVisual />,
      reverse: true,
      link: "/solutions/next-product",
    },
    {
      id: "next-conversation",
      bg: "bg-white",
      label: "NEXT CONVERSATION",
      labelColor: "text-blue-600",
      headline: "Give every advisor a warm lead every morning.",
      body: "Ventus sends advisors a daily briefing — who to call, why to call them, and what to say. Built entirely from transaction signals.",
      card: <NextConversationVisual />,
      reverse: false,
      link: "/solutions/next-conversation",
    },
  ];

  return (
    <>
      {sections.map((s) => (
        <section key={s.id} className="py-24 md:py-32 bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <ScrollReveal>
              <div
                className="rounded-2xl p-12"
                style={{
                  backgroundColor: "#F9FAFB",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
                }}
              >
                <div className={`grid md:grid-cols-2 gap-12 lg:gap-20 items-center ${s.reverse ? "md:[direction:rtl]" : ""}`}>
                  <div className={s.reverse ? "md:[direction:ltr]" : ""}>
                    <p className={`text-xs font-semibold tracking-widest uppercase mb-4 ${s.labelColor}`}>{s.label}</p>
                    <h2 className="text-3xl md:text-[40px] font-bold text-gray-900 leading-tight mb-5">{s.headline}</h2>
                    <p className="text-lg text-gray-500 leading-relaxed mb-6 max-w-lg">{s.body}</p>
                    <Link to={s.link}>
                      <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        Learn more
                      </Button>
                    </Link>
                  </div>
                  <div className={s.reverse ? "md:[direction:ltr]" : ""}>
                    {s.card}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>
      ))}
    </>
  );
};

export default SolutionSections;
