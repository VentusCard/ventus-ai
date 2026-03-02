import { useEffect, useState, useCallback, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface Transaction {
  account: string;
  merchant: string;
  amount: string;
}

interface IntelCard {
  accent: string;
  icon: string;
  title: string;
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
      { account: "••4821", merchant: "Home Depot", amount: "$847.00" },
      { account: "••4821", merchant: "Lowe's", amount: "$312.50" },
      { account: "••4821", merchant: "Pottery Barn", amount: "$1,245.00" },
      { account: "••4821", merchant: "Restoration Hardware", amount: "$2,180.00" },
      { account: "••4821", merchant: "Ferguson", amount: "$489.00" },
      { account: "••4821", merchant: "Sherwin-Williams", amount: "$167.30" },
      { account: "••9053", merchant: "Vail Resorts", amount: "$3,200.00" },
      { account: "••9053", merchant: "United Airlines", amount: "$1,890.00" },
      { account: "••9053", merchant: "Delta Sky Club", amount: "$45.00" },
      { account: "••9053", merchant: "Marriott Bonvoy", amount: "$892.00" },
      { account: "••7390", merchant: "Whole Foods", amount: "$187.40" },
      { account: "••7390", merchant: "Trader Joe's", amount: "$94.20" },
      { account: "••7390", merchant: "Blue Apron", amount: "$62.00" },
      { account: "••7390", merchant: "Peloton", amount: "$44.00" },
      { account: "••2156", merchant: "Benjamin Moore", amount: "$234.00" },
      { account: "••2156", merchant: "Houzz Pro", amount: "$89.00" },
      { account: "••2156", merchant: "West Elm", amount: "$567.00" },
      { account: "••2156", merchant: "Crate & Barrel", amount: "$423.00" },
      { account: "••2156", merchant: "Ace Hardware", amount: "$78.50" },
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
        content: "Recommend Premium Home Equity line — spending indicates major renovation ($8K+ in 6 weeks)",
        txIndices: [0, 1, 2, 3, 4, 5],
      },
      {
        accent: "#34d399",
        icon: "★",
        title: "Smart Rewards",
        content: "",
        pills: ["Home Depot 5% Cashback", "Lowe's Bonus Points", "Vail Ski Pass Deal", "Whole Foods Bundle"],
        txIndices: [0, 1, 6, 10],
      },
      {
        accent: "#fbbf24",
        icon: "⚡",
        title: "Relationship Intelligence",
        content: "Life Event: Major Home Renovation from 8 transactions across 3 accounts. Sent meeting prep to wealth advisor.",
        txIndices: [0, 1, 2, 3, 4, 5, 14, 15, 16, 17, 18],
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
      { account: "••3347", merchant: "Buy Buy Baby", amount: "$234.00" },
      { account: "••3347", merchant: "Amazon Baby Registry", amount: "$189.00" },
      { account: "••3347", merchant: "Pottery Barn Kids", amount: "$567.00" },
      { account: "••3347", merchant: "Hanna Andersson", amount: "$89.00" },
      { account: "••3347", merchant: "Carter's", amount: "$124.50" },
      { account: "••8812", merchant: "Whole Foods", amount: "$203.00" },
      { account: "••8812", merchant: "Instacart", amount: "$87.40" },
      { account: "••8812", merchant: "DoorDash", amount: "$142.00" },
      { account: "••8812", merchant: "Sweetgreen", amount: "$34.00" },
      { account: "••8812", merchant: "Blue Apron", amount: "$62.00" },
      { account: "••5501", merchant: "Walgreens", amount: "$67.20" },
      { account: "••5501", merchant: "CVS", amount: "$45.80" },
      { account: "••5501", merchant: "Walgreens", amount: "$52.10" },
      { account: "••5501", merchant: "One Medical", amount: "$250.00" },
      { account: "••6274", merchant: "Babylist", amount: "$312.00" },
      { account: "••6274", merchant: "Snoo Rental", amount: "$159.00" },
      { account: "••6274", merchant: "Owlet", amount: "$299.00" },
      { account: "••6274", merchant: "Uppababy", amount: "$1,049.00" },
      { account: "••6274", merchant: "529 Plan Contrib", amount: "$500.00" },
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
        content: "Recommend family rewards card — baby spend is 40% of wallet. Projected annual value: $1,200",
        txIndices: [0, 1, 2, 3, 4],
      },
      {
        accent: "#34d399",
        icon: "★",
        title: "Smart Rewards",
        content: "",
        pills: ["Buy Buy Baby 8%", "Whole Foods Family", "One Medical Plan", "529 Match"],
        txIndices: [0, 5, 13, 18],
      },
      {
        accent: "#fbbf24",
        icon: "⚡",
        title: "Relationship Intelligence",
        content: "Life Event: New Baby from 12 transactions across 4 accounts. Sent family planning package to advisor.",
        txIndices: [0, 1, 2, 3, 4, 14, 15, 16, 17, 18],
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Phases & Timing                                                    */
/* ------------------------------------------------------------------ */

type Phase = "profile" | "scroll" | "cardCycle" | "hold" | "flip";

const TIMINGS = {
  profile: 1000,
  scroll: 3000,
  cardScan: 800,        // rapid scroll per card before collecting
  collectInterval: 250, // time between each tx "found"
  collectBuffer: 500,   // buffer after last tx found before reveal
  cardReveal: 800,
  hold: 2500,
  flip: 800,
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
        <div className="grid gap-0" style={{ height: 380, gridTemplateColumns: "40% 60%" }}>
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
                      animation: "orch-rapid-scroll 2.8s linear forwards",
                    }}
                  >
                    {customer.transactions.map((tx, i) => (
                      <TxRow key={`scroll-${i}`} tx={tx} dim={false} />
                    ))}
                    {customer.transactions.map((tx, i) => (
                      <TxRow key={`scroll2-${i}`} tx={tx} dim />
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
                      <TxRow key={`cscan-${i}`} tx={tx} dim={false} />
                    ))}
                    {customer.transactions.map((tx, i) => (
                      <TxRow key={`cscan2-${i}`} tx={tx} dim />
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
                      />
                    </div>
                  ))}
                  {/* Uncollected transactions below, dimmed */}
                  {uncollected.map(({ tx, i }) => (
                    <TxRow key={`unc-${i}`} tx={tx} dim />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ======== RIGHT PANEL ======== */}
          <div className="px-3 py-3 overflow-hidden flex flex-col">
            <div className="text-[10px] font-mono font-semibold text-emerald-400 tracking-widest uppercase mb-2">
              Personalization Orchestration
            </div>

            {/* Persona card — always visible once profile shows */}
            {showProfile && (
              <div
                className="rounded-lg px-2.5 py-2 mb-2 transition-all duration-700 ease-out"
                style={{
                  background: "rgba(59,130,246,0.08)",
                  opacity: showProfile ? 1 : 0,
                  transform: showProfile ? "translateY(0)" : "translateY(8px)",
                }}
              >
                <div className="flex items-center gap-1 mb-1">
                  <span style={{ color: "#60a5fa", fontSize: 10 }}>{personaCard.icon}</span>
                  <span
                    className="text-[9px] font-semibold tracking-wider uppercase"
                    style={{ color: "#60a5fa" }}
                  >
                    {personaCard.title}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 min-h-[20px]">
                  {personaCard.pills?.map((pill, i) => (
                    <span
                      key={pill}
                      className="text-[8px] font-medium px-1.5 py-0.5 rounded-full"
                      style={{
                        background: "rgba(59,130,246,0.15)",
                        color: "#60a5fa",
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
              <div className="flex flex-col gap-2 flex-1 justify-between">
                {remainingCards.map((card, i) => {
                  const isRevealed = i < revealedCards;
                  const isActiveScrolling = phase === "cardCycle" && activeCardIdx === i && cardPhase === "scroll";
                  return (
                    <div
                      key={card.title}
                      className="rounded-lg px-3 py-2.5 flex-1 flex flex-col transition-all duration-500"
                      style={{
                        borderLeft: `3px solid ${isRevealed ? card.accent : "transparent"}`,
                        background: isActiveScrolling
                          ? `${card.accent}08`
                          : isRevealed
                          ? "rgba(255,255,255,0.03)"
                          : "transparent",
                        opacity: isRevealed ? 1 : isActiveScrolling ? 0.5 : 0,
                        transform: isRevealed
                          ? "translateX(0)"
                          : isActiveScrolling
                          ? "translateX(4px)"
                          : "translateX(12px)",
                      }}
                    >
                      <div className="flex items-center gap-1 mb-1">
                        <span style={{ color: card.accent, fontSize: 12 }}>{card.icon}</span>
                        <span
                          className="text-[10px] font-semibold tracking-wider uppercase"
                          style={{ color: card.accent }}
                        >
                          {card.title}
                        </span>
                      </div>
                      {isRevealed && (
                        <>
                          {card.pills ? (
                            <div className="flex flex-wrap gap-1.5">
                              {card.pills.map((pill) => (
                                <span
                                  key={pill}
                                  className="text-[9px] font-medium px-2 py-0.5 rounded-full"
                                  style={{
                                    background: `${card.accent}18`,
                                    color: card.accent,
                                  }}
                                >
                                  {pill}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[10px] text-gray-400 leading-relaxed">{card.content}</p>
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
          70% { transform: translateY(-65%); }
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
}: {
  tx: Transaction;
  dim: boolean;
  highlight?: boolean;
  highlightColor?: string;
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
        background: highlight ? `${highlightColor}20` : "rgba(100,116,139,0.2)",
        color: highlight ? highlightColor : "#94a3b8",
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
