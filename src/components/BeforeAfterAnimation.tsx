import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowDown, RotateCcw, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const examples = [
  {
    before: "Walgreens • $47.20",
    pills: [
      { label: "New Parent", color: "bg-blue-100 text-blue-700" },
      { label: "Baby Care Shopping", color: "bg-purple-100 text-purple-700" },
      { label: "Formula & Diapers Pattern", color: "bg-teal-100 text-teal-700" },
      { label: "Life Event: New Baby", color: "bg-green-100 text-green-700" },
    ],
    confidence: 97,
  },
  {
    before: "REI • $127.43",
    pills: [
      { label: "Outdoor Enthusiast", color: "bg-blue-100 text-blue-700" },
      { label: "Pre-Summer Trip Planning", color: "bg-purple-100 text-purple-700" },
      { label: "Loyalty Decay Detected", color: "bg-orange-100 text-orange-700" },
      { label: "Life Event: Vacation Upcoming", color: "bg-teal-100 text-teal-700" },
    ],
    confidence: 94,
  },
  {
    before: "Zillow Premium • $49.99",
    pills: [
      { label: "Home Buyer", color: "bg-blue-100 text-blue-700" },
      { label: "Active Property Search", color: "bg-purple-100 text-purple-700" },
      { label: "Pre-Purchase Research Phase", color: "bg-orange-100 text-orange-700" },
      { label: "Life Event: Home Purchase", color: "bg-green-100 text-green-700" },
    ],
    confidence: 96,
  },
  {
    before: "AARP • $18.00",
    pills: [
      { label: "Pre-Retiree", color: "bg-blue-100 text-blue-700" },
      { label: "Retirement Planning Active", color: "bg-purple-100 text-purple-700" },
      { label: "Benefits Research", color: "bg-teal-100 text-teal-700" },
      { label: "Life Event: Approaching Retirement", color: "bg-green-100 text-green-700" },
    ],
    confidence: 93,
  },
  {
    before: "Whole Foods • $210.40",
    pills: [
      { label: "Health Conscious", color: "bg-blue-100 text-blue-700" },
      { label: "Premium Grocery Shopper", color: "bg-purple-100 text-purple-700" },
      { label: "Wellness Lifestyle", color: "bg-teal-100 text-teal-700" },
      { label: "High Disposable Income", color: "bg-green-100 text-green-700" },
    ],
    confidence: 91,
  },
  {
    before: "United Airlines • $890.00",
    pills: [
      { label: "Frequent Traveler", color: "bg-blue-100 text-blue-700" },
      { label: "Business Travel Pattern", color: "bg-purple-100 text-purple-700" },
      { label: "Miles Optimizer", color: "bg-orange-100 text-orange-700" },
      { label: "Life Event: Relocation Possible", color: "bg-teal-100 text-teal-700" },
    ],
    confidence: 95,
  },
];

const BeforeAfterAnimation = () => {
  const [phase, setPhase] = useState<"idle" | "before" | "arrow" | "after" | "fading">("idle");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [barWidth, setBarWidth] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  const clearTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    timeoutsRef.current.push(setTimeout(fn, ms));
  }, []);

  const runCycle = useCallback(
    (index: number) => {
      clearTimeouts();
      setCurrentIndex(index);
      setPhase("idle");
      setBarWidth(0);

      schedule(() => setPhase("before"), 100);
      schedule(() => setPhase("arrow"), 1100);
      schedule(() => {
        setPhase("after");
        setTimeout(() => setBarWidth(examples[index].confidence), 200);
      }, 1600);
      // Hold for 3s then fade out
      schedule(() => setPhase("fading"), 4600);
      // Start next
      schedule(() => {
        const next = (index + 1) % examples.length;
        runCycle(next);
      }, 5200);
    },
    [clearTimeouts, schedule]
  );

  const handleReplay = useCallback(() => {
    runCycle(0);
  }, [runCycle]);

  // Intersection observer
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          runCycle(0);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeouts();
    };
  }, [runCycle, clearTimeouts]);

  const example = examples[currentIndex];
  const showBefore = phase !== "idle" && phase !== "fading";
  const showArrow = phase === "arrow" || phase === "after";
  const showAfter = phase === "after";

  return (
    <div ref={sectionRef} className="relative" style={{ minHeight: 420 }}>
      {/* Counter */}
      <p className="text-xs text-gray-400 text-right mb-3">
        {currentIndex + 1} of {examples.length}
      </p>

      <div className="space-y-4">
        {/* BEFORE card */}
        <div
          className="rounded-xl p-6 transition-all duration-500"
          style={{
            background: "#f8f9fa",
            opacity: showBefore ? 1 : 0,
            transform: showBefore ? "translateY(0)" : "translateY(10px)",
          }}
        >
          <p className="text-[10px] font-bold tracking-widest text-red-500 uppercase mb-2">Before</p>
          <p className="text-gray-700 text-lg">"{example.before}"</p>
        </div>

        {/* Animated arrow */}
        <div
          className="flex justify-center transition-all duration-500"
          style={{
            opacity: showArrow ? 1 : 0,
            transform: showArrow ? "scaleY(1)" : "scaleY(0)",
          }}
        >
          <div className="relative flex flex-col items-center">
            <div className="w-px h-8 bg-blue-300 relative overflow-hidden">
              <div className="absolute inset-0 w-full h-4 bg-blue-500 blur-sm animate-[arrow-glow_1.5s_ease-in-out_infinite]" />
            </div>
            <ArrowDown className="w-4 h-4 text-blue-500" />
          </div>
        </div>

        {/* AFTER card */}
        <div
          className="rounded-xl p-6 transition-all duration-700"
          style={{
            background: "#0a0f1e",
            opacity: showAfter ? 1 : 0,
            transform: showAfter ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <p className="text-[10px] font-bold tracking-widest text-green-400 uppercase mb-3">After</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {example.pills.map((p, i) => (
              <span
                key={p.label}
                className={`text-xs font-medium px-3 py-1 rounded-full ${p.color} transition-opacity duration-300`}
                style={{ opacity: showAfter ? 1 : 0, transitionDelay: `${i * 100}ms` }}
              >
                {p.label}
              </span>
            ))}
          </div>
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-gray-400">Confidence Score</span>
              <span className="text-[11px] font-bold text-green-400">{example.confidence}%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400"
                style={{
                  width: `${barWidth}%`,
                  transition: "width 1.5s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
            </div>
          </div>
        </div>

        {/* Replay button */}
        <div className="flex justify-center pt-1">
          <button
            onClick={handleReplay}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Replay
          </button>
        </div>

        {/* Learn more link */}
        <div className="flex justify-center pt-3">
          <Link to="/enrichment" className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            Learn more about Transaction Enrichment <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterAnimation;
