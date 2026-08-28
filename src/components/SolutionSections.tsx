import ScrollReveal from "@/components/ScrollReveal";
import HueField from "@/components/HueField";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

/* ─── Section 1: Next Offer ─── */
const NextOfferVisual = () => (
  <div>
    <p className="text-xs font-mono text-gray-400 mb-2">cust_013 · <span className="text-blue-600 font-semibold">Frequent Traveler</span></p>
    <div className="space-y-2">
      {[
        { name: "Delta SkyMiles Card", desc: "matches your travel spend", tag: "Travel", color: "#3B82F6" },
        { name: "Whole Foods 5% Back", desc: "3x weekly grocery visits", tag: "Food", color: "#22C55E" },
        { name: "REI Co-op Card", desc: "active lifestyle detected", tag: "Fitness", color: "#F59E0B" },
      ].map((o) => (
        <div key={o.name} className="rounded-lg p-2.5 flex items-center gap-2 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]" style={{ borderLeft: `3px solid ${o.color}` }}>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 font-semibold truncate" style={{ fontSize: "12px" }}>{o.name}</p>
            <p className="text-gray-500 text-[10px] mt-0.5 truncate">{o.desc}</p>
          </div>
          <span className="font-semibold px-2 py-0.5 rounded-full whitespace-nowrap shrink-0" style={{ fontSize: "10px", background: `${o.color}15`, color: o.color }}>{o.tag}</span>
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
      <p className="text-gray-900 text-sm font-bold">New Parent</p>
      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-green-500/15 text-green-600">95%</span>
    </div>
    <div className="space-y-1.5">
      {[
        { merchant: "Buy Buy Baby", amount: "$234.50" },
        { merchant: "Pottery Barn Kids", amount: "$189.00" },
        { merchant: "Carter's", amount: "$124.50" },
      ].map((t) => (
        <div key={t.merchant} className="rounded-lg p-2.5 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]" style={{ borderLeft: "3px solid #22C55E" }}>
          <p className="font-mono text-[11px] text-gray-600 truncate">{t.merchant} · <span className="text-gray-900 font-semibold">{t.amount}</span></p>
        </div>
      ))}
    </div>
    <div className="border-t border-[#E5E7EB] mt-3 pt-3">
      <p className="text-[9px] font-semibold tracking-widest text-gray-400 uppercase mb-2">Recommended</p>
      <div className="flex flex-wrap gap-1.5">
        {["529 Savings", "Life Insurance", "Family Card"].map((p) => (
          <span key={p} className="text-[11px] text-blue-600 bg-blue-500/10 px-2.5 py-0.5 rounded-full font-medium">{p}</span>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Section 3: Next Conversation ─── */
const NextConversationVisual = () => (
  <div>
    <div className="flex items-center justify-between mb-2">
      <p className="text-[11px] font-mono text-gray-400">Advisor · <span className="text-gray-900 font-semibold">cust_013</span></p>
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
      </span>
    </div>
    <span className="inline-block text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600">College-Bound — 91%</span>
    <div className="mt-2.5 space-y-1.5">
      {[
        "College application spending detected",
        "Applying to Harvard, MIT, Yale",
        "$3,000+ in test prep & visits",
      ].map((point, i) => (
        <div key={i} className="rounded-lg p-2.5 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]" style={{ borderLeft: "3px solid #8B5CF6" }}>
          <p className="text-[11px] text-gray-700">● {point}</p>
        </div>
      ))}
    </div>
    <div className="border-t border-[#E5E7EB] mt-3 pt-3">
      <button className="text-[11px] font-semibold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors">
        Schedule consultation →
      </button>
    </div>
  </div>
);

/* ─── Customer Intelligence Visual ─── */
const PortfolioVisual = () => (
  <div className="space-y-2">
    {[
      { label: "Travel & Exploration", stat: "26.9% · 14 customers", color: "#3B82F6" },
      { label: "New Parent detected", stat: "847 customers · 94% confidence", color: "#22C55E" },
      { label: "Delta Air Lines", stat: "$8,860 total spend · 13 customers", color: "#F59E0B" },
      { label: "College-Bound Child", stat: "312 customers · 89% confidence", color: "#8B5CF6" },
      { label: "Gen Z Lifestyle Spend", stat: "$2.4M qtr · trending up", color: "#EC4899" },
    ].map((row) => (
      <div
        key={row.label}
        className="rounded-lg px-3 py-2.5 flex items-center justify-between gap-2 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)] min-w-0"
        style={{ borderLeft: `3px solid ${row.color}` }}
      >
        <p className="text-gray-900 font-semibold truncate text-[12px] sm:text-[13px] min-w-0">{row.label}</p>
        <p className="font-mono text-gray-500 text-[10px] sm:text-[11px] whitespace-nowrap shrink-0 truncate max-w-[55%]">{row.stat}</p>
      </div>
    ))}
  </div>
);

const nextCards = [
  {
    id: "offer-intelligence",
    label: "NEXT OFFER",
    headline: "Serve the right offer before they go looking.",
    body: "Ventus detects purchase intent from spending patterns — giving your team the signal to serve the right offer at exactly the right moment.",
    card: <NextOfferVisual />,
    link: "/solutions/offer-intelligence",
  },
  {
    id: "product-intelligence",
    label: "NEXT PRODUCT",
    headline: "Know what your customer needs before they ask.",
    body: "Life event detection gives your team the intelligence to surface the right product at exactly the right moment in your customer's journey.",
    card: <NextProductVisual />,
    link: "/solutions/product-intelligence",
  },
  {
    id: "conversation-intelligence",
    label: "NEXT CONVERSATION",
    headline: "Turn every life event into the right conversation.",
    body: "Ventus detects life events in transaction data and delivers structured intelligence to your CRM — who to call, why it matters, and what to say.",
    card: <NextConversationVisual />,
    link: "/solutions/conversation-intelligence",
  },
];

const SolutionSections = () => {
  return (
    <>
      <section className="bg-white py-20 relative overflow-hidden">
        <HueField
          blobs={[
            { hue: "sky", size: 620, top: "-12%", left: "-8%" },
            { hue: "violet", size: 560, bottom: "-20%", right: "-6%", opacity: 0.45 },
          ]}
        />
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          <ScrollReveal>
            <div className="mb-12 max-w-4xl">
              <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-4">Solutions</p>
              <h2 className="text-3xl md:text-[40px] font-bold text-gray-900 leading-tight">
                Powering personalized banking at every customer touchpoint.
              </h2>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {nextCards.map((section) => (
              <div
                key={section.id}
                className="ventus-glass rounded-[20px] overflow-hidden flex flex-col"
              >
                <div className="p-6 lg:p-7 flex flex-col flex-1">
                  <p className="text-[11px] font-semibold tracking-widest uppercase text-blue-600 mb-3">
                    {section.label}
                  </p>
                  <h3 className="text-xl md:text-[22px] font-bold text-gray-900 leading-tight mb-3">
                    {section.headline}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed mb-5">
                    {section.body}
                  </p>
                </div>
                <div className="bg-white/45 border-t border-white/60 p-5">
                  <div className="rounded-[14px] border border-gray-200 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] overflow-hidden">
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 border-b border-gray-200">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <div className="p-4">
                      {section.card}
                    </div>
                  </div>
                  <div className="mt-5">
                    <Link to={section.link}>
                      <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        Learn more
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Bank-Wide Intelligence */}
      <section className="bg-white py-20 border-y border-gray-200 relative overflow-hidden">
        <HueField
          blobs={[
            { hue: "indigo", size: 680, top: "-18%", right: "-10%" },
            { hue: "warm", size: 480, bottom: "-15%", left: "-5%", opacity: 0.5 },
          ]}
        />
        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          <ScrollReveal>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
              <div>
                <p className="text-xs font-semibold tracking-widest uppercase text-blue-600 mb-4">Analytics</p>
                <h2 className="text-3xl md:text-[40px] font-bold text-gray-900 leading-tight mb-5">
                  A new analytics layer for your entire customer base.
                </h2>
                <p className="text-base text-gray-500 leading-relaxed">
                  Every behavioral signal Ventus detects becomes queryable intelligence across your entire book. Questions you couldn't answer before: What are Gen Zs spending on? Which life events are trending this quarter? Where is financial stress concentrated in your portfolio? Your data team gets answers without building anything new.
                </p>
              </div>
              <div>
                <div className="ventus-glass rounded-[20px] overflow-hidden">
                  <div className="flex items-center gap-1.5 px-4 py-3 bg-gray-100 border-b border-gray-200">
                    <span className="w-3 h-3 rounded-full bg-red-400" />
                    <span className="w-3 h-3 rounded-full bg-yellow-400" />
                    <span className="w-3 h-3 rounded-full bg-green-400" />
                    <span className="ml-3 text-[11px] text-gray-400 font-mono"></span>
                  </div>
                  <div className="p-3 sm:p-6">
                    <PortfolioVisual />
                  </div>
                </div>
                <div className="mt-5 flex justify-start">
                  <Link to="/solutions/portfolio-intelligence">
                    <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
                      Learn more
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
};

export default SolutionSections;
