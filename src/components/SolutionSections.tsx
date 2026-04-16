import ScrollReveal from "@/components/ScrollReveal";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

/* ─── Section 1: Next Offer ─── */
const NextOfferCard = () => (
  <div className="rounded-2xl p-6 shadow-xl" style={{ background: "#0A1628", minHeight: 380 }}>
    <p className="text-xs font-mono text-gray-400 mb-4">cust_013 · <span className="text-blue-400">Frequent Traveler</span></p>
    <div className="space-y-3">
      {[
        { name: "Delta SkyMiles Card", desc: "matches your travel spend", tag: "Travel & Exploration", color: "#3B82F6", border: "#3B82F6" },
        { name: "Whole Foods 5% Back", desc: "3x weekly grocery visits", tag: "Food & Dining", color: "#22C55E", border: "#22C55E" },
        { name: "REI Co-op Card", desc: "active lifestyle detected", tag: "Sports & Fitness", color: "#F59E0B", border: "#F59E0B" },
      ].map((o) => (
        <div key={o.name} className="rounded-lg p-4 flex items-start gap-3" style={{ background: "#111D2E", borderLeft: `3px solid ${o.border}` }}>
          <div className="flex-1">
            <p className="text-white text-sm font-semibold">{o.name}</p>
            <p className="text-gray-400 text-xs mt-0.5">{o.desc}</p>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: `${o.color}20`, color: o.color }}>{o.tag}</span>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Section 2: Next Product ─── */
const NextProductCard = () => (
  <div className="rounded-2xl p-6 shadow-xl" style={{ background: "#0A1628", minHeight: 380 }}>
    <div className="flex items-center gap-2 mb-1">
      <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
      <p className="text-white text-lg font-bold">New Parent</p>
      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">95% confidence</span>
    </div>
    <div className="mt-4 space-y-1.5 font-mono text-xs text-gray-400">
      <p>Buy Buy Baby · <span className="text-gray-300">$234.50</span></p>
      <p>Pottery Barn Kids · <span className="text-gray-300">$189.00</span></p>
      <p>Carter's · <span className="text-gray-300">$124.50</span></p>
    </div>
    <div className="border-t border-gray-700 mt-5 pt-4">
      <p className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase mb-3">Recommended products</p>
      <div className="flex flex-wrap gap-2">
        {["529 College Savings", "Life Insurance Review", "Family Rewards Card"].map((p) => (
          <span key={p} className="text-xs text-blue-400 bg-blue-500/10 px-3 py-1.5 rounded-full font-medium flex items-center gap-1">
            {p} <span className="text-blue-300">↗</span>
          </span>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Section 3: Next Conversation ─── */
const NextConversationCard = () => (
  <div className="rounded-2xl p-6 shadow-xl" style={{ background: "#0A1628", minHeight: 380 }}>
    <div className="flex items-center justify-between mb-4">
      <p className="text-xs font-mono text-gray-400">Advisor Alert · <span className="text-white">cust_013</span></p>
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
      </span>
    </div>
    <span className="text-sm font-semibold px-3 py-1 rounded-full bg-amber-500/20 text-amber-400">College-Bound Child — 91% confidence</span>
    <ul className="mt-5 space-y-2.5 text-sm text-gray-300 leading-relaxed">
      <li>● Significant college application spending detected Jan–Feb 2026</li>
      <li>● Child applying to Harvard, MIT, Yale, Stanford</li>
      <li>● Over $3,000 in test prep and campus visits</li>
    </ul>
    <div className="border-t border-gray-700 mt-5 pt-4">
      <p className="text-[10px] font-semibold tracking-widest text-gray-500 uppercase mb-3">Recommended action</p>
      <button className="text-sm font-semibold text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg transition-colors">
        Schedule college savings consultation →
      </button>
    </div>
  </div>
);

/* ─── Stat Chip ─── */
const StatChip = ({ text }: { text: string }) => (
  <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-full bg-gray-100 border border-gray-200">
    <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
    <span className="text-xs font-medium text-gray-600">{text}</span>
  </div>
);

/* ─── Main Component ─── */
const SolutionSections = () => {
  const sections = [
    {
      id: "next-offer",
      bg: "bg-white",
      label: "🎯 NEXT OFFER",
      labelColor: "text-blue-600",
      headline: "Serve the right offer before they go looking.",
      body: "Ventus detects purchase intent from spending patterns — surfacing personalized offers at exactly the moment a customer is ready to buy.",
      stat: "3,000+ Dynamic reward labels",
      card: <NextOfferCard />,
      reverse: false,
      link: "/smart-rewards",
    },
    {
      id: "next-product",
      bg: "bg-[#F9FAFB]",
      label: "📦 NEXT PRODUCT",
      labelColor: "text-green-600",
      headline: "Know what your customer needs before they ask.",
      body: "Life event detection surfaces the right product at the right moment — automatically. No surveys, no guesswork, just transaction signals.",
      stat: "20+ life events detected in real time",
      card: <NextProductCard />,
      reverse: true,
      link: "/engagement",
    },
    {
      id: "next-conversation",
      bg: "bg-white",
      label: "💬 NEXT CONVERSATION",
      labelColor: "text-purple-600",
      headline: "Give every advisor a warm lead every morning.",
      body: "Ventus sends advisors a daily briefing — who to call, why to call them, and what to say. Built entirely from transaction signals.",
      stat: "Detected from transaction data alone · Zero PII",
      card: <NextConversationCard />,
      reverse: false,
      link: "/wealth",
    },
  ];

  return (
    <>
      {sections.map((s) => (
        <section key={s.id} className={`${s.bg} py-24 md:py-32`}>
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <ScrollReveal>
              <div className={`grid md:grid-cols-2 gap-12 lg:gap-20 items-center ${s.reverse ? "md:[direction:rtl]" : ""}`}>
                {/* Text side */}
                <div className={s.reverse ? "md:[direction:ltr]" : ""}>
                  <p className={`text-xs font-semibold tracking-widest uppercase mb-4 ${s.labelColor}`}>{s.label}</p>
                  <h2 className="text-3xl md:text-[40px] font-bold text-gray-900 leading-tight mb-5">{s.headline}</h2>
                  <p className="text-lg text-gray-500 leading-relaxed mb-6 max-w-lg">{s.body}</p>
                  <Link to={s.link}>
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                      Learn more
                    </Button>
                  </Link>
                  <div className="block">
                    <StatChip text={s.stat} />
                  </div>
                </div>

                {/* Card side */}
                <div className={s.reverse ? "md:[direction:ltr]" : ""}>
                  {s.card}
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
