import { useEffect, useState, useRef } from "react";

const tags = ["Snow Sports", "Family", "Outdoor Enthusiast"];

interface Deal {
  brand: string;
  offer: string;
  match: number;
  pillar: string;
  mcc: string;
  evidence: string;
  personalized: string;
  suppressed?: boolean;
}

const deals: Deal[] = [
  {
    brand: "GoPro",
    offer: "15% off HERO12",
    match: 94,
    pillar: "Snow Sports",
    mcc: "Electronics",
    evidence: "$1,129 at Epic Pass",
    personalized: "Capture family ski moments with waterproof action cam",
  },
  {
    brand: "Smith Goggles",
    offer: "25% off 4D MAG",
    match: 91,
    pillar: "Snow Sports",
    mcc: "Snow Sports",
    evidence: "$312 at Loon Mountain",
    personalized: "Quick-swap lenses for all-condition visibility",
  },
  {
    brand: "Ikon Pass",
    offer: "Season Pass",
    match: 0,
    pillar: "Snow Sports",
    mcc: "Snow Sports",
    evidence: "Epic Pass detected",
    personalized: "Competing product — already purchased Epic Pass",
    suppressed: true,
  },
];

const useTypewriter = (text: string, active: boolean, speed = 30) => {
  const [displayed, setDisplayed] = useState("");
  const idx = useRef(0);

  useEffect(() => {
    if (!active) { setDisplayed(""); idx.current = 0; return; }
    const interval = setInterval(() => {
      idx.current++;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [active, text, speed]);

  return displayed;
};

const HeroRewardsCard = () => {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const run = () => {
      setPhase(0);
      timers.push(setTimeout(() => setPhase(1), 600));
      timers.push(setTimeout(() => setPhase(2), 1200));
      timers.push(setTimeout(() => setPhase(3), 2000));
    };
    run();
    const loop = setInterval(run, 6000);
    return () => { clearInterval(loop); timers.forEach(clearTimeout); };
  }, []);

  const firstMsg = useTypewriter(deals[0].personalized, phase >= 2);

  return (
    <div className="w-full max-w-md rounded-2xl p-5" style={{ background: "#111827", border: "1px solid #1e2d4a" }}>
      {/* Profile */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center">
          <span className="text-blue-400 font-bold text-sm">SM</span>
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Sarah M.</p>
          <p className="text-gray-500 text-xs">Premium Checking · Chicago, IL</p>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {tags.map((tag, i) => (
          <span
            key={tag}
            className="px-2 py-0.5 rounded-full text-[10px] font-medium transition-all duration-500"
            style={{
              background: "rgba(59,130,246,0.15)",
              color: "#60a5fa",
              opacity: phase >= 0 ? 1 : 0,
              transform: phase >= 0 ? "translateY(0)" : "translateY(8px)",
              transitionDelay: `${i * 120}ms`,
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Deals */}
      <div className="space-y-2.5">
        {deals.map((deal, i) => {
          const isFirst = i === 0;
          const visible = isFirst ? phase >= 1 : phase >= 3;
          const isCrossCategory = deal.pillar !== deal.mcc;

          return (
            <div
              key={deal.brand}
              className="rounded-lg px-3 py-2.5 transition-all duration-500"
              style={{
                background: deal.suppressed ? "#0a0f1e" : "#0a0f1e",
                opacity: visible ? (deal.suppressed ? 0.45 : 1) : 0,
                transform: visible ? "translateX(0)" : "translateX(16px)",
                transitionDelay: isFirst ? "0ms" : `${(i - 1) * 150}ms`,
              }}
            >
              {/* Top row: brand + offer + match/suppressed */}
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-white text-sm font-medium">{deal.brand}</p>
                    <span className="text-gray-500 text-[10px]">·</span>
                    <span className="text-blue-300 text-[11px] font-medium">{deal.offer}</span>
                  </div>
                </div>
                {deal.suppressed ? (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                    style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
                    Suppressed
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
                    style={{
                      background: visible ? "rgba(34,197,94,0.15)" : "transparent",
                      color: visible ? "#4ade80" : "transparent",
                    }}>
                    {deal.match}% Match
                  </span>
                )}
              </div>

              {/* Cross-category pill */}
              {isCrossCategory && !deal.suppressed && (
                <div className="mt-1.5 flex items-center gap-1">
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                    style={{ background: "rgba(139,92,246,0.15)", color: "#a78bfa" }}>
                    {deal.pillar} → {deal.mcc}
                  </span>
                </div>
              )}

              {/* Evidence */}
              <p className="text-gray-600 text-[9px] mt-1">
                Detected: {deal.evidence}
              </p>

              {/* Personalized message (typewriter on first, static on others) */}
              {visible && (
                <p className="text-gray-400 text-[10px] italic mt-1 leading-snug truncate">
                  {isFirst && phase >= 2 ? firstMsg : (phase >= 3 ? deal.personalized : "")}
                  {isFirst && phase >= 2 && firstMsg.length < deal.personalized.length && (
                    <span className="inline-block w-px h-3 bg-blue-400 ml-0.5" style={{ animation: "blink-cursor 0.8s step-end infinite" }} />
                  )}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HeroRewardsCard;
