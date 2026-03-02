import { useEffect, useState, useCallback, useRef, useMemo } from "react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const SOURCE_COLORS = ["#60a5fa", "#34d399", "#fbbf24", "#a78bfa", "#fb7185"];

const getSourceColor = (transactions: Transaction[], account: string): string => {
  const uniqueAccounts = [...new Set(transactions.map(t => t.account))];
  const idx = uniqueAccounts.indexOf(account);
  return SOURCE_COLORS[idx % SOURCE_COLORS.length];
};

interface Transaction {
  account: string;
  merchant: string;
  amount: string;
}

interface IntelCard {
  accent: string;
  icon: string;
  title: string;
  subtitle?: string;
  content: string;
  pills?: string[];
  txIndices: number[];
}

interface CustomerProfile {
  name: string;
  age: number;
  family: string;
  location: string;
  income: string;
  transactions: Transaction[];
  cards: IntelCard[];
}

const customers: CustomerProfile[] = [
  {
    name: "Michael R.",
    age: 42,
    family: "Family of 4",
    location: "Wellesley, MA",
    income: "High Income",
    transactions: [
      { account: "••4821", merchant: "Home Depot", amount: "$847.00" },        // 0
      { account: "••9053", merchant: "Vail Resorts", amount: "$3,200.00" },    // 1
      { account: "••7390", merchant: "Whole Foods", amount: "$187.40" },       // 2
      { account: "••2156", merchant: "Benjamin Moore", amount: "$234.00" },    // 3
      { account: "••4821", merchant: "Lowe's", amount: "$312.50" },            // 4
      { account: "••9053", merchant: "United Airlines", amount: "$1,890.00" }, // 5
      { account: "••7390", merchant: "Trader Joe's", amount: "$94.20" },       // 6
      { account: "••2156", merchant: "Houzz Pro", amount: "$89.00" },          // 7
      { account: "••4821", merchant: "Pottery Barn", amount: "$1,245.00" },    // 8
      { account: "••9053", merchant: "Delta Sky Club", amount: "$45.00" },     // 9
      { account: "••7390", merchant: "Blue Apron", amount: "$62.00" },         // 10
      { account: "••2156", merchant: "West Elm", amount: "$567.00" },          // 11
      { account: "••4821", merchant: "Restoration Hardware", amount: "$2,180.00" }, // 12
      { account: "••9053", merchant: "Marriott Bonvoy", amount: "$892.00" },   // 13
      { account: "••7390", merchant: "Peloton", amount: "$44.00" },            // 14
      { account: "••2156", merchant: "Crate & Barrel", amount: "$423.00" },    // 15
      { account: "••4821", merchant: "Ferguson", amount: "$489.00" },          // 16
      { account: "••4821", merchant: "Sherwin-Williams", amount: "$167.30" },  // 17
      { account: "••2156", merchant: "Ace Hardware", amount: "$78.50" },       // 18
    ],
    cards: [
      {
        accent: "#a78bfa",
        icon: "◈",
        title: "Dynamic Persona",
        content: "",
        pills: ["Urban Homeowner", "High-Spend Renovation", "Annual Ski Trips", "Health-Conscious"],
        txIndices: [],
      },
      {
        accent: "#60a5fa",
        icon: "◆",
        title: "Analytics Intelligence",
        subtitle: "Personalized product recommendations from spend signals",
        content: "Recommend Premium Home Equity Line — renovation spend pattern detected across 6 transactions. Personalized pre-approval message ready.",
        txIndices: [0, 4, 8, 12, 16, 17],
      },
      {
        accent: "#34d399",
        icon: "★",
        title: "Smart Rewards",
        subtitle: "Hyper-personalized ranking and messages",
        content: "",
        pills: ["Delta SkyMiles 3x", "Marriott Elite Match", "United Lounge Pass", "Vail Season Deal"],
        txIndices: [1, 5, 9, 13],
      },
      {
        accent: "#fbbf24",
        icon: "⚡",
        title: "Relationship Intelligence",
        subtitle: "Personalized projections, timeline and meeting prep",
        content: "Life Event: Major Home Renovation detected from lifestyle shifts across 3 accounts. Sent meeting prep to wealth advisor.",
        txIndices: [2, 3, 6, 7, 10, 11, 14, 15, 18],
      },
    ],
  },
  {
    name: "Sarah & David L.",
    age: 34,
    family: "Growing Family",
    location: "Brooklyn, NY",
    income: "Upper-Middle Income",
    transactions: [
      { account: "••3347", merchant: "Buy Buy Baby", amount: "$234.00" },       // 0
      { account: "••8812", merchant: "Whole Foods", amount: "$203.00" },         // 1
      { account: "••5501", merchant: "Walgreens", amount: "$67.20" },            // 2
      { account: "••6274", merchant: "Babylist", amount: "$312.00" },            // 3
      { account: "••3347", merchant: "Amazon Baby Registry", amount: "$189.00" },// 4
      { account: "••8812", merchant: "Instacart", amount: "$87.40" },            // 5
      { account: "••5501", merchant: "CVS", amount: "$45.80" },                  // 6
      { account: "••6274", merchant: "Snoo Rental", amount: "$159.00" },         // 7
      { account: "••3347", merchant: "Pottery Barn Kids", amount: "$567.00" },   // 8
      { account: "••8812", merchant: "DoorDash", amount: "$142.00" },            // 9
      { account: "••5501", merchant: "Walgreens", amount: "$52.10" },            // 10
      { account: "••6274", merchant: "Owlet", amount: "$299.00" },               // 11
      { account: "••3347", merchant: "Hanna Andersson", amount: "$89.00" },      // 12
      { account: "••8812", merchant: "Sweetgreen", amount: "$34.00" },           // 13
      { account: "••5501", merchant: "One Medical", amount: "$250.00" },         // 14
      { account: "••6274", merchant: "Uppababy", amount: "$1,049.00" },          // 15
      { account: "••3347", merchant: "Carter's", amount: "$124.50" },            // 16
      { account: "••8812", merchant: "Blue Apron", amount: "$62.00" },           // 17
      { account: "••6274", merchant: "529 Plan Contrib", amount: "$500.00" },    // 18
    ],
    cards: [
      {
        accent: "#a78bfa",
        icon: "◈",
        title: "Dynamic Persona",
        content: "",
        pills: ["New Parent", "Nesting Phase", "Health-Focused", "Meal Delivery Reliant", "Financial Planner"],
        txIndices: [],
      },
      {
        accent: "#60a5fa",
        icon: "◆",
        title: "Analytics Intelligence",
        subtitle: "Personalized product recommendations from spend signals",
        content: "Recommend Family Rewards Card — baby-related spend is 40% of wallet. Personalized upgrade offer queued.",
        txIndices: [0, 4, 8, 12, 16],
      },
      {
        accent: "#34d399",
        icon: "★",
        title: "Smart Rewards",
        subtitle: "Hyper-personalized ranking and messages",
        content: "",
        pills: ["Whole Foods 5% Back", "Instacart Free Delivery", "DoorDash DashPass", "Blue Apron Family Plan"],
        txIndices: [1, 5, 9, 13, 17],
      },
      {
        accent: "#fbbf24",
        icon: "⚡",
        title: "Relationship Intelligence",
        subtitle: "Personalized projections, timeline and meeting prep",
        content: "Life Event: New Baby detected from health and planning transactions. Family financial package sent to advisor.",
        txIndices: [2, 3, 6, 7, 10, 11, 14, 15, 18],
      },
    ],
  },
  {
    name: "Emily & James W.",
    age: 58,
    family: "Empty Nesters",
    location: "Scottsdale, AZ",
    income: "High Income",
    transactions: [
      { account: "••6102", merchant: "Fidelity Investments", amount: "$5,000.00" },  // 0
      { account: "••7745", merchant: "Four Seasons Resort", amount: "$4,850.00" },   // 1
      { account: "••3318", merchant: "Mayo Clinic", amount: "$450.00" },             // 2
      { account: "••9901", merchant: "Williams Sonoma", amount: "$345.00" },         // 3
      { account: "••6102", merchant: "Charles Schwab", amount: "$3,200.00" },        // 4
      { account: "••7745", merchant: "Napa Valley Wine Train", amount: "$680.00" },  // 5
      { account: "••3318", merchant: "Equinox", amount: "$220.00" },                 // 6
      { account: "••9901", merchant: "Sur La Table", amount: "$189.00" },            // 7
      { account: "••6102", merchant: "Edward Jones", amount: "$2,750.00" },          // 8
      { account: "••7745", merchant: "Viking Cruises", amount: "$8,200.00" },        // 9
      { account: "••3318", merchant: "United Way", amount: "$1,000.00" },            // 10
      { account: "••9901", merchant: "MasterClass", amount: "$120.00" },             // 11
      { account: "••6102", merchant: "Vanguard", amount: "$4,500.00" },              // 12
      { account: "••7745", merchant: "Amex Travel", amount: "$1,950.00" },           // 13
      { account: "••3318", merchant: "Habitat for Humanity", amount: "$500.00" },    // 14
      { account: "••9901", merchant: "Audible", amount: "$14.95" },                  // 15
      { account: "••6102", merchant: "Northwestern Mutual", amount: "$1,800.00" },   // 16
      { account: "••6102", merchant: "TIAA", amount: "$2,100.00" },                  // 17
      { account: "••9901", merchant: "National Geographic", amount: "$39.00" },      // 18
    ],
    cards: [
      {
        accent: "#a78bfa",
        icon: "◈",
        title: "Dynamic Persona",
        content: "",
        pills: ["Pre-Retiree", "Luxury Traveler", "Philanthropist", "Wellness Focused", "Lifelong Learner"],
        txIndices: [],
      },
      {
        accent: "#60a5fa",
        icon: "◆",
        title: "Analytics Intelligence",
        subtitle: "Personalized product recommendations from spend signals",
        content: "Recommend Wealth Management Upgrade — retirement consolidation pattern detected across 6 accounts. Personalized advisor introduction queued.",
        txIndices: [0, 4, 8, 12, 16, 17],
      },
      {
        accent: "#34d399",
        icon: "★",
        title: "Smart Rewards",
        subtitle: "Hyper-personalized ranking and messages",
        content: "",
        pills: ["Four Seasons 5x Points", "Viking Cruises $500 Credit", "Napa Wine Club", "Amex Centurion Invite"],
        txIndices: [1, 5, 9, 13],
      },
      {
        accent: "#fbbf24",
        icon: "⚡",
        title: "Relationship Intelligence",
        subtitle: "Personalized projections, timeline and meeting prep",
        content: "Life Event: Retirement Transition detected from financial consolidation and lifestyle shifts. Estate planning package sent to advisor.",
        txIndices: [2, 3, 6, 7, 10, 11, 14, 15, 18],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Phases & Timing                                                    */
/* ------------------------------------------------------------------ */

type Phase = "profile" | "scroll" | "cardCycle" | "hold" | "flip";

const TIMINGS = {
  profile: 1680,
  scroll: 4800,
  cardScan: 1320,
  collectInterval: 420,
  collectBuffer: 840,
  cardReveal: 1200,
  hold: 3840,
  flip: 960,
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const EnrichmentMockup = () => {
  const [customerIdx, setCustomerIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("profile");
  const [visiblePills, setVisiblePills] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  // Per-card cycle state
  const [revealedCards, setRevealedCards] = useState(0);
  const [activeCardIdx, setActiveCardIdx] = useState(-1);
  const [cardPhase, setCardPhase] = useState<"scanning" | "scroll" | "reveal" | null>(null);
  const [collectedIndices, setCollectedIndices] = useState<number[]>([]);
  const [currentCardColor, setCurrentCardColor] = useState<string>("#60a5fa");

  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timeoutsRef.current.push(setTimeout(fn, ms));
  }, []);

  const runCycle = useCallback(
    (idx: number) => {
      clearTimeouts();
      setCustomerIdx(idx);
      setPhase("profile");
      setVisiblePills(0);
      setIsFlipping(false);
      setRevealedCards(0);
      setActiveCardIdx(-1);
      setCardPhase(null);
      setCollectedIndices([]);
      let elapsed = TIMINGS.profile;

      // -> scroll + progressive persona pills
      schedule(() => {
        setPhase("scroll");
        const pillCount = customers[idx].cards[0].pills?.length ?? 0;
        const pillInterval = TIMINGS.scroll / (pillCount + 1);
        for (let p = 0; p < pillCount; p++) {
          schedule(() => setVisiblePills(p + 1), (p + 1) * pillInterval);
        }
      }, elapsed);
      elapsed += TIMINGS.scroll;

      // -> per-card cycles (cards 1-3, skipping persona at index 0)
      const remainingCards = customers[idx].cards.slice(1);
      for (let c = 0; c < remainingCards.length; c++) {
        const card = remainingCards[c];
        const cardElapsed = elapsed;
        const cardCollectDuration = card.txIndices.length * TIMINGS.collectInterval + TIMINGS.collectBuffer;

        // 1) Scanning sub-phase — rapid scroll animation
        schedule(() => {
          setPhase("cardCycle");
          setActiveCardIdx(c);
          setCardPhase("scanning");
          setCollectedIndices([]); // reset for this card
          setCurrentCardColor(card.accent);
        }, cardElapsed);

        // 2) Collect sub-phase — stagger collection after scan
        const collectStart = cardElapsed + TIMINGS.cardScan;
        schedule(() => {
          setCardPhase("scroll");
        }, collectStart);

        // Stagger each tx found
        card.txIndices.forEach((txIdx, j) => {
          schedule(() => {
            setCollectedIndices(prev => [...prev, txIdx]);
          }, collectStart + (j + 1) * TIMINGS.collectInterval);
        });

        // 3) Card reveal sub-phase
        schedule(() => {
          setCardPhase("reveal");
          setRevealedCards(c + 1);
        }, collectStart + cardCollectDuration);

        elapsed += TIMINGS.cardScan + cardCollectDuration + TIMINGS.cardReveal;
      }

      // -> hold
      schedule(() => {
        setPhase("hold");
        setCardPhase(null);
      }, elapsed);
      elapsed += TIMINGS.hold;

      // -> flip
      schedule(() => {
        setIsFlipping(true);
        setPhase("flip");
      }, elapsed);

      schedule(() => {
        const next = (idx + 1) % customers.length;
        runCycle(next);
      }, elapsed + TIMINGS.flip);
    },
    [clearTimeouts, schedule],
  );

  useEffect(() => {
    const startDelay = setTimeout(() => runCycle(0), 600);
    return () => {
      clearTimeout(startDelay);
      clearTimeouts();
    };
  }, [runCycle, clearTimeouts]);

  const customer = customers[customerIdx];
  const showProfile = phase !== "flip";
  const showScrolling = phase === "scroll";
  const personaCard = customer.cards[0];
  const remainingCards = customer.cards.slice(1);

  // Build collected/uncollected split for left panel
  const collected = customer.transactions
    .map((tx, i) => ({ tx, i }))
    .filter(({ i }) => collectedIndices.includes(i));
  const uncollected = customer.transactions
    .map((tx, i) => ({ tx, i }))
    .filter(({ i }) => !collectedIndices.includes(i));

  return (
    <div
      style={{
        perspective: "1200px",
        width: 560,
        maxWidth: "100%",
      }}
    >
      <div
        className="rounded-2xl shadow-2xl overflow-hidden"
        style={{
          background: "#0a0f1e",
          border: "1px solid #1e2d4a",
          transform: `rotateY(${isFlipping ? "90deg" : "0deg"})`,
          transition: "transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "center center",
          width: "100%",
        }}
      >
        {/* ---- Header ---- */}
        <div className="flex items-center gap-2 px-5 pt-4 pb-3 border-b border-[#1e2d4a]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-white text-[11px] font-medium tracking-wide">
            Ventus AI Intelligent Orchestration
          </span>
        </div>

        {/* ---- Body ---- */}
        <div className="grid gap-0" style={{ height: 450, gridTemplateColumns: "40% 60%" }}>
          {/* ======== LEFT PANEL ======== */}
          <div className="border-r border-[#1e2d4a] px-4 py-3 overflow-hidden flex flex-col">
            {/* Demographics */}
            <div
              className="transition-all duration-700 ease-out"
              style={{
                opacity: showProfile ? 1 : 0,
                transform: showProfile ? "translateY(0)" : "translateY(8px)",
              }}
            >
              <div className="text-[10px] font-mono font-semibold text-blue-400 tracking-widest uppercase mb-2">
                Customer Profile
              </div>
              <div className="text-white text-[13px] font-semibold leading-tight">
                {customer.name}
                <span className="text-gray-400 font-normal ml-1.5 text-[11px]">
                  {customer.age}
                </span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1.5 mb-3">
                {[customer.family, customer.location, customer.income].map((tag) => (
                  <span
                    key={tag}
                    className="text-[9px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{ background: "rgba(59,130,246,0.12)", color: "#93c5fd" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Transaction Feed */}
            <div className="flex-1 overflow-hidden relative">
              <div className="text-[10px] font-mono font-semibold text-emerald-400 tracking-widest uppercase mb-1.5">
                Transaction Feed
              </div>

              {/* Waiting state */}
              {phase === "profile" && (
                <div className="font-mono text-[10px] text-gray-600 mt-2">
                  Awaiting data stream...
                </div>
              )}

              {/* Initial rapid-scroll phase */}
              {showScrolling && (
                <div className="absolute inset-x-0 top-5 bottom-0 overflow-hidden">
                  <div
                    className="space-y-0.5"
                    style={{
                      animation: `orch-rapid-scroll ${TIMINGS.scroll}ms linear forwards`,
                    }}
                  >
                    {customer.transactions.map((tx, i) => (
                      <TxRow key={`scroll-${i}`} tx={tx} dim={false} sourceColor={getSourceColor(customer.transactions, tx.account)} />
                    ))}
                    {customer.transactions.map((tx, i) => (
                      <TxRow key={`scroll2-${i}`} tx={tx} dim sourceColor={getSourceColor(customer.transactions, tx.account)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Card cycle: scanning — rapid scroll per card */}
              {phase === "cardCycle" && cardPhase === "scanning" && (
                <div className="absolute inset-x-0 top-5 bottom-0 overflow-hidden">
                  <div
                    className="space-y-0.5"
                    style={{
                      animation: `orch-card-scroll ${TIMINGS.cardScan}ms linear forwards`,
                    }}
                  >
                    {customer.transactions.map((tx, i) => (
                      <TxRow key={`cscan-${i}`} tx={tx} dim={false} sourceColor={getSourceColor(customer.transactions, tx.account)} />
                    ))}
                    {customer.transactions.map((tx, i) => (
                      <TxRow key={`cscan2-${i}`} tx={tx} dim sourceColor={getSourceColor(customer.transactions, tx.account)} />
                    ))}
                  </div>
                </div>
              )}

              {/* Card cycle: collect/reveal — collected float to top */}
              {((phase === "cardCycle" && cardPhase !== "scanning") || phase === "hold") && (
                <div className="space-y-0.5" style={{ animation: "orch-fade-in 0.3s ease-out" }}>
                  {/* Collected transactions at top */}
                  {collected.map(({ tx, i }) => (
                    <div
                      key={`col-${i}`}
                      style={{ animation: "orch-collect-pulse 0.4s ease-out" }}
                    >
                      <TxRow
                        tx={tx}
                        dim={false}
                        highlight
                        highlightColor={currentCardColor}
                        sourceColor={getSourceColor(customer.transactions, tx.account)}
                      />
                    </div>
                  ))}
                  {/* Uncollected transactions below, dimmed */}
                  {uncollected.map(({ tx, i }) => (
                    <TxRow key={`unc-${i}`} tx={tx} dim sourceColor={getSourceColor(customer.transactions, tx.account)} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ======== RIGHT PANEL ======== */}
          <div className="px-3 py-3 overflow-hidden flex flex-col">
            <div className="text-[11px] font-mono font-semibold text-blue-300 tracking-widest uppercase mb-2">
              Personalization Orchestration
            </div>

            {/* Persona card — always visible once profile shows */}
            {showProfile && (
              <div
                className="rounded-lg px-3 py-2.5 mb-2 transition-all duration-700 ease-out"
                style={{
                  background: "rgba(59,130,246,0.08)",
                  opacity: showProfile ? 1 : 0,
                  transform: showProfile ? "translateY(0)" : "translateY(8px)",
                }}
              >
                <div className="flex items-center gap-1 mb-1">
                  <span style={{ color: "#93c5fd", fontSize: 12 }}>{personaCard.icon}</span>
                  <span
                    className="text-[10px] font-semibold tracking-wider uppercase"
                    style={{ color: "#93c5fd" }}
                  >
                    {personaCard.title}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 min-h-[20px]">
                  {personaCard.pills?.map((pill, i) => (
                    <span
                      key={pill}
                      className="text-[9px] font-medium px-2 py-0.5 rounded-full"
                      style={{
                        background: "rgba(59,130,246,0.18)",
                        color: "#93c5fd",
                        opacity: i < visiblePills ? 1 : 0,
                        transform: i < visiblePills ? "scale(1)" : "scale(0.7)",
                        transition: "opacity 0.4s ease-out, transform 0.4s ease-out",
                      }}
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Processing shimmer — during initial scroll phase */}
            {phase === "scroll" && (
              <div className="flex-1 flex flex-col justify-center items-center gap-2">
                <div
                  className="w-3/4 h-1.5 rounded-full overflow-hidden"
                  style={{ background: "#1a2332" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: "60%",
                      background: "linear-gradient(90deg, #1e2d4a, #3b82f6, #1e2d4a)",
                      backgroundSize: "200% 100%",
                      animation: "orch-shimmer 1.5s ease-in-out infinite",
                    }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 font-mono">Processing signals...</span>
              </div>
            )}

            {/* Intelligence cards — revealed one at a time during cardCycle, all visible during hold */}
            {(phase === "cardCycle" || phase === "hold") && (
              <div className="flex flex-col gap-1.5 flex-1 justify-between">
                {remainingCards.map((card, i) => {
                  const isRevealed = i < revealedCards;
                  const isActiveScrolling = phase === "cardCycle" && activeCardIdx === i && (cardPhase === "scroll" || cardPhase === "scanning");
                  return (
                    <div
                      key={card.title}
                      className="rounded-lg px-3 py-2 flex-1 flex flex-col transition-all duration-500"
                      style={{
                        borderLeft: `3px solid ${isRevealed ? card.accent : "transparent"}`,
                        background: isActiveScrolling
                          ? `${card.accent}0a`
                          : isRevealed
                          ? "rgba(255,255,255,0.05)"
                          : "transparent",
                        opacity: isRevealed ? 1 : isActiveScrolling ? 0.5 : 0,
                        transform: isRevealed
                          ? "translateX(0)"
                          : isActiveScrolling
                          ? "translateX(4px)"
                          : "translateX(12px)",
                      }}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <span style={{ color: card.accent, fontSize: 14 }}>{card.icon}</span>
                        <span
                          className="text-[11px] font-semibold tracking-wider uppercase"
                          style={{ color: card.accent }}
                        >
                          {card.title}
                        </span>
                      </div>
                      {isRevealed && card.subtitle && (
                        <div className="text-[9px] text-gray-400 mb-0.5">{card.subtitle}</div>
                      )}
                      {isRevealed && (
                        <>
                          {card.pills ? (
                            <div className="flex flex-wrap gap-1">
                              {card.pills.map((pill) => (
                                <span
                                  key={pill}
                                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                                  style={{
                                    background: `${card.accent}22`,
                                    color: card.accent,
                                  }}
                                >
                                  {pill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-gray-300 leading-snug">{card.content}</p>
                          )}
                        </>
                      )}
                      {isActiveScrolling && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <div
                            className="w-12 h-1 rounded-full overflow-hidden"
                            style={{ background: "#1a2332" }}
                          >
                            <div
                              className="h-full rounded-full"
                              style={{
                                width: "60%",
                                background: `linear-gradient(90deg, transparent, ${card.accent}, transparent)`,
                                backgroundSize: "200% 100%",
                                animation: "orch-shimmer 1s ease-in-out infinite",
                              }}
                            />
                          </div>
                          <span className="text-[8px] font-mono" style={{ color: card.accent, opacity: 0.6 }}>
                            Analyzing...
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes orch-rapid-scroll {
          0% { transform: translateY(0); }
          90% { transform: translateY(-65%); }
          100% { transform: translateY(-65%); }
        }
        @keyframes orch-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes orch-fade-in {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes orch-collect-pulse {
          0% { opacity: 0; transform: translateY(4px); background: rgba(255,255,255,0.06); }
          50% { background: rgba(255,255,255,0.06); }
          100% { opacity: 1; transform: translateY(0); background: transparent; }
        }
        @keyframes orch-card-scroll {
          0% { transform: translateY(0); }
          80% { transform: translateY(-55%); }
          100% { transform: translateY(-55%); }
        }
      `}</style>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

const TxRow = ({
  tx,
  dim,
  highlight,
  highlightColor,
  sourceColor,
}: {
  tx: Transaction;
  dim: boolean;
  highlight?: boolean;
  highlightColor?: string;
  sourceColor?: string;
}) => (
  <div
    className="font-mono text-[9px] leading-tight px-1.5 py-[3px] rounded flex items-center gap-1 truncate transition-all duration-300"
    style={{
      color: highlight ? "#e2e8f0" : dim ? "#475569" : "#e2e8f0",
      background: highlight ? `${highlightColor}12` : "transparent",
      borderLeft: highlight ? `2px solid ${highlightColor}` : "2px solid transparent",
    }}
  >
    <span
      className="text-[8px] font-medium px-1 py-0 rounded shrink-0"
      style={{
        background: sourceColor ? `${sourceColor}20` : "rgba(100,116,139,0.2)",
        color: sourceColor || "#94a3b8",
        border: sourceColor ? `1px solid ${sourceColor}30` : "none",
        opacity: dim ? 0.5 : 1,
      }}
    >
      {tx.account}
    </span>
    <span className="truncate">{tx.merchant}</span>
    <span className="ml-auto shrink-0 tabular-nums" style={{ color: highlight ? highlightColor : dim ? "#64748b" : "#94a3b8" }}>
      {tx.amount}
    </span>
  </div>
);

export default EnrichmentMockup;
