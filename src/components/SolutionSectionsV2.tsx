import ScrollReveal from "@/components/ScrollReveal";
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
    body: "Ventus detects purchase intent from spending patterns and launches a governed offer play — then measures the incremental redemptions against a holdout.",
    card: <NextOfferVisual />,
    link: "/solutions/offer-intelligence",
  },
  {
    id: "product-intelligence",
    label: "NEXT PRODUCT",
    headline: "Know what your customer needs before they ask.",
    body: "Life event detection triggers the right product play at the right moment — with incremental adoption proven against a control group.",
    card: <NextProductVisual />,
    link: "/solutions/product-intelligence",
  },
  {
    id: "conversation-intelligence",
    label: "NEXT CONVERSATION",
    headline: "Turn every life event into the right conversation.",
    body: "Ventus detects life events and delivers a governed advisor play to your CRM — who to call and why — then measures the resulting incremental conversations.",
    card: <NextConversationVisual />,
    link: "/solutions/conversation-intelligence",
  },
];

const SolutionSectionsV2 = () => {
  return (
    <>
      <section className="v2-rule-t py-24" style={{ backgroundColor: "var(--v2-paper-raised)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="mb-12 grid gap-10 lg:grid-cols-[minmax(0,0.35fr)_minmax(0,0.65fr)]">
              <p className="v2-label">05 — Solutions</p>
              <h2 className="v2-display text-3xl md:text-5xl">
                Growth Plays for every customer touchpoint.
              </h2>
            </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
            {nextCards.map((section) => (
              <div key={section.id} className="v2-row flex flex-col">
                <div className="flex flex-col flex-1">
                  <p className="v2-mono text-[10px] font-semibold tracking-[0.14em] uppercase mb-3" style={{ color: "var(--v2-green)" }}>
                    {section.label}
                  </p>
                  <h3 className="v2-display text-xl mb-3" style={{ letterSpacing: "-0.02em" }}>
                    {section.headline}
                  </h3>
                  <p className="v2-body text-sm mb-5">
                    {section.body}
                  </p>
                </div>
                <div>
                  <div className="overflow-hidden rounded-lg border" style={{ borderColor: "var(--v2-rule)", backgroundColor: "var(--v2-paper)" }}>
                    <div className="flex items-center gap-1.5 border-b px-3 py-2" style={{ borderColor: "var(--v2-rule)" }}>
                      <span className="v2-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: "var(--v2-ink-faint)" }}>preview</span>
                    </div>
                    <div className="p-4 bg-white">
                      {section.card}
                    </div>
                  </div>
                  <div className="mt-4">
                    <Link to={section.link} className="inline-flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: "var(--v2-green)" }}>
                      Learn more <span aria-hidden>→</span>
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
      <section className="v2-ruled v2-rule-t py-24" style={{ backgroundColor: "var(--v2-paper)" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <ScrollReveal>
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-start">
              <div>
                <p className="v2-label mb-4">06 — Analytics</p>
                <h2 className="v2-display text-3xl md:text-5xl mb-5">
                  Every play compounds into book-wide intelligence.
                </h2>
                <p className="v2-body text-base">
                  Because every Growth Play is measured and logged, Ventus builds a compounding picture of your whole book — which moments drive real incremental growth, and which don't. See how the Decision Ledger turns individual plays into portfolio-level strategy.
                </p>
                <p className="v2-mono mt-6 text-[11px]" style={{ color: "var(--v2-ink-faint)" }}>
                  plugs into your existing stack · cores · warehouses · salesforce fsc · no core changes
                </p>
              </div>
              <div>
                <div className="overflow-hidden rounded-lg border bg-white" style={{ borderColor: "var(--v2-rule)" }}>
                  <div className="flex items-center gap-1.5 border-b px-4 py-2.5" style={{ borderColor: "var(--v2-rule)", backgroundColor: "var(--v2-paper)" }}>
                    <span className="v2-mono text-[9px] uppercase tracking-[0.12em]" style={{ color: "var(--v2-ink-faint)" }}>portfolio · book-wide view</span>
                  </div>
                  <div className="p-3 sm:p-6">
                    <PortfolioVisual />
                  </div>
                </div>
                <div className="mt-5 flex justify-start">
                  <Link to="/solutions/portfolio-intelligence" className="inline-flex items-center gap-1.5 text-[14px] font-semibold" style={{ color: "var(--v2-green)" }}>
                    Learn more <span aria-hidden>→</span>
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

export default SolutionSectionsV2;
