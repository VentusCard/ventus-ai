const CARDS = [
  {
    label: "NEXT OFFER",
    title: "Serve the right offer before they go looking.",
    body: "Ventus detects purchase intent from spending patterns — giving your team the signal to serve the right offer at exactly the right moment.",
  },
  {
    label: "NEXT PRODUCT",
    title: "Know what your customer needs before they ask.",
    body: "Life event detection gives your team the intelligence to surface the right product at exactly the right moment in your customer's journey.",
  },
  {
    label: "NEXT CONVERSATION",
    title: "Turn every life event into the right conversation.",
    body: "Ventus detects life events in transaction data and delivers structured intelligence to your CRM — who to call, why it matters, and what to say.",
  },
];

const BrowserChrome = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-white/10 bg-[#0B1626] overflow-hidden">
    <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-white/10">
      <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
      <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
    </div>
    <div className="p-3 md:p-4">{children}</div>
  </div>
);

const Tag = ({ children, color = "blue" }: { children: React.ReactNode; color?: "blue" | "green" | "amber" | "purple" | "sky" }) => {
  const colorMap = {
    blue: "bg-blue-500/10 text-blue-300 border-blue-500/20",
    green: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    purple: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    sky: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${colorMap[color]}`}>
      {children}
    </span>
  );
};

const OfferMockup = () => (
  <BrowserChrome>
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-xs text-white/60 font-mono">
        <span>cust_013</span>
        <span className="text-white/30">·</span>
        <span className="text-blue-400 font-semibold">Frequent Traveler</span>
      </div>
      <div className="space-y-2.5">
        {[
          { title: "Delta SkyMiles Card", sub: "matches your travel spend", tag: "Travel", color: "blue" as const, accent: "bg-blue-500" },
          { title: "Whole Foods 5% Back", sub: "3x weekly grocery visits", tag: "Food", color: "green" as const, accent: "bg-emerald-500" },
          { title: "REI Co-op Card", sub: "active lifestyle detected", tag: "Fitness", color: "amber" as const, accent: "bg-amber-500" },
        ].map((item) => (
          <div key={item.title} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
            <div className={`w-1 self-stretch rounded-full ${item.accent}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{item.title}</p>
              <p className="text-xs text-white/50 truncate">{item.sub}</p>
            </div>
            <Tag color={item.color}>{item.tag}</Tag>
          </div>
        ))}
      </div>
    </div>
  </BrowserChrome>
);

const ProductMockup = () => (
  <BrowserChrome>
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
        <span className="text-sm font-semibold text-white">New Parent</span>
        <Tag color="green">95%</Tag>
      </div>
      <div className="space-y-2.5">
        {[
          { merchant: "Buy Buy Baby", amount: "$234.50", accent: "bg-emerald-500" },
          { merchant: "Pottery Barn Kids", amount: "$189.00", accent: "bg-emerald-500" },
          { merchant: "Carter's", amount: "$124.50", accent: "bg-emerald-500" },
        ].map((t) => (
          <div key={t.merchant} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-2.5">
            <div className={`w-1 self-stretch rounded-full ${t.accent}`} />
            <p className="flex-1 text-sm text-white truncate">{t.merchant}</p>
            <p className="text-sm font-mono font-medium text-white">{t.amount}</p>
          </div>
        ))}
      </div>
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-white/40">Recommended</p>
        <div className="flex flex-wrap gap-2">
          <Tag color="blue">529 Savings</Tag>
          <Tag color="blue">Life Insurance</Tag>
          <Tag color="blue">Family Card</Tag>
        </div>
      </div>
    </div>
  </BrowserChrome>
);

const ConversationMockup = () => (
  <BrowserChrome>
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-white/60 font-mono">
          <span>Advisor</span>
          <span className="text-white/30">·</span>
          <span className="text-white">cust_013</span>
        </div>
        <span className="h-2 w-2 rounded-full bg-emerald-400" />
      </div>
      <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2">
        <p className="text-xs font-medium text-amber-300">College-Bound — 91%</p>
      </div>
      <div className="space-y-2.5">
        {[
          "College application spending detected",
          "Applying to Harvard, MIT, Yale",
          "$3,000+ in test prep & visits",
        ].map((point) => (
          <div key={point} className="flex items-start gap-2.5">
            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-white/70" />
            <p className="text-sm text-white/80 leading-snug">{point}</p>
          </div>
        ))}
      </div>
      <button className="mt-1 inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-400 transition-colors">
        Schedule consultation <span>→</span>
      </button>
    </div>
  </BrowserChrome>
);

const MOCKUPS = [OfferMockup, ProductMockup, ConversationMockup];

const PersonalizationSection = () => (
  <section
    id="personalization"
    className="scroll-mt-28 border-y border-white/10 bg-[#08111F] py-16 md:py-20"
  >
    <div className="mx-auto max-w-7xl px-6 md:px-8">
      <div className="mb-10 md:mb-12 max-w-2xl md:max-w-3xl">
        <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-blue-400">
          Personalization
        </p>
        <h2 className="text-3xl md:text-4xl md:whitespace-nowrap font-bold tracking-tight text-white leading-[1.1]">
          Personalize every customer touchpoint.
        </h2>
        <p className="mt-4 text-base leading-[1.65] text-white/75">
          The same intelligence powers consistent, context-aware experiences across every channel the customer touches.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card, i) => {
          const Mockup = MOCKUPS[i];
          return (
            <div
              key={card.label}
              className="group flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6 transition-colors hover:border-white/20"
            >
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-blue-400">
                {card.label}
              </p>
              <h3 className="text-xl font-semibold text-white leading-tight">
                {card.title}
              </h3>
              <p className="mt-2 text-base leading-[1.65] text-white/70">
                {card.body}
              </p>
              <div className="mt-5 flex-1">
                <Mockup />
              </div>
              <button className="mt-5 self-start rounded-full border border-white/20 bg-white/[0.03] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/[0.08]">
                Learn more
              </button>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

export default PersonalizationSection;
