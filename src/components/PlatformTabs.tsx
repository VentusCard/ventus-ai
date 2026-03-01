import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

const tabs = [
  {
    label: "Analytics & Targeting",
    heading: "Analytics & Targeting",
    description:
      "Portfolio-wide behavioral intelligence across every account and card product. Identify spending gaps, cross-sell opportunities, and revenue leakage before it compounds.",
    capabilities: [
      "Spending distribution across 12 lifestyle pillars",
      "Card product performance matrix with penetration rates",
      "Revenue opportunity pipeline with merchant partnership suggestions",
    ],
  },
  {
    label: "Consumer Rewards",
    heading: "Consumer Rewards",
    description:
      "Stop showing every customer the same catalog. Ventus matches offers to individuals based on real behavioral signals — life stage, spending velocity, and purchase cycle prediction.",
    capabilities: [
      "Hyper-personalized offer matching with relevance scores",
      "Location-based deal targeting for home city and travel",
      "Spending gap detection to capture out-of-ecosystem wallet share",
    ],
  },
  {
    label: "Customer Engagement",
    heading: "Customer Engagement",
    description:
      "Hyper-targeted campaigns powered by real behavioral intelligence, not demographics. Reach the right customer at the right life moment across every channel.",
    capabilities: [
      "AI-detected life event triggers for campaign activation",
      "Multi-channel delivery across email, push, and SMS",
      "Micro-segment builder with real-time audience sizing",
    ],
  },
  {
    label: "Wealth Management Copilot",
    heading: "Wealth Management Copilot",
    description:
      "Turn transaction patterns into relationship intelligence. Detect life events before clients mention them and walk into every meeting prepared.",
    capabilities: [
      "AI life event detection with urgency scoring",
      "Automated meeting prep with talking points and action items",
      "Standout transaction alerts for unusual client activity",
    ],
  },
];

const ROTATE_INTERVAL = 5000;

const PlatformTabs = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const startTimeRef = useRef(Date.now());
  const rafRef = useRef<number>();

  const resetTimer = useCallback(() => {
    setProgress(0);
    startTimeRef.current = Date.now();
  }, []);

  const handleTabClick = useCallback(
    (i: number) => {
      setActiveIndex(i);
      resetTimer();
    },
    [resetTimer]
  );

  // Auto-rotate
  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / ROTATE_INTERVAL) * 100, 100);
      setProgress(pct);

      if (elapsed >= ROTATE_INTERVAL) {
        setActiveIndex((prev) => (prev + 1) % tabs.length);
        startTimeRef.current = Date.now();
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const tab = tabs[activeIndex];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        {/* Header */}
        <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase mb-3">
          The Platform
        </p>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          One Tech Core. Four Insight Tools.
        </h2>
        <p className="text-gray-500 text-lg mb-10">
          Every team in your bank. One enrichment engine underneath.
        </p>

        {/* Tab Buttons */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabs.map((t, i) => (
            <button
              key={t.label}
              onClick={() => handleTabClick(i)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                i === activeIndex
                  ? "bg-blue-600 text-white shadow-md"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content Panel */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden">
          <div className="grid md:grid-cols-5 min-h-[420px]">
            {/* Left Column — 2/5 */}
            <div className="md:col-span-2 p-8 md:p-10 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {tab.heading}
                </h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  {tab.description}
                </p>
                <ul className="space-y-3">
                  {tab.capabilities.map((cap) => (
                    <li key={cap} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-blue-600 mt-1 shrink-0" />
                      <span className="text-gray-600 text-sm leading-relaxed">
                        {cap}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <Link to="/contact" className="mt-8">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Schedule Demo
                </Button>
              </Link>
            </div>

            {/* Right Column — 3/5: Browser Mockup */}
            <div className="md:col-span-3 bg-gray-50 p-6 md:p-8 flex items-center justify-center">
              <div className="w-full rounded-xl border border-gray-200 shadow-lg overflow-hidden bg-white">
                {/* Title bar */}
                <div className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 border-b border-gray-200">
                  <span className="w-3 h-3 rounded-full bg-red-400" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400" />
                  <span className="w-3 h-3 rounded-full bg-green-400" />
                  <span className="ml-3 text-xs text-gray-400 font-mono">
                    ventus.ai/dashboard
                  </span>
                </div>
                {/* Content area */}
                <div className="relative h-72 md:h-80 bg-[#0a0f1e] flex items-center justify-center">
                  {/* Fake blurred dashboard content */}
                  <div className="absolute inset-0 opacity-20 p-6 space-y-4">
                    <div className="h-4 w-2/3 bg-white/30 rounded" />
                    <div className="grid grid-cols-3 gap-3">
                      <div className="h-20 bg-white/20 rounded-lg" />
                      <div className="h-20 bg-white/20 rounded-lg" />
                      <div className="h-20 bg-white/20 rounded-lg" />
                    </div>
                    <div className="h-32 bg-white/15 rounded-lg" />
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-16 bg-white/10 rounded-lg" />
                      <div className="h-16 bg-white/10 rounded-lg" />
                    </div>
                  </div>
                  <div className="absolute inset-0 backdrop-blur-sm" />
                  {/* Lock overlay */}
                  <div className="relative z-10 flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-gray-400 text-sm">
                      Full demo available on request
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-gray-100">
            <div
              className="h-full bg-blue-600 transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Dot indicators */}
        <div className="flex items-center justify-center gap-2 mt-6">
          {tabs.map((_, i) => (
            <button
              key={i}
              onClick={() => handleTabClick(i)}
              className={`rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? "w-3 h-3 bg-blue-600"
                  : "w-2 h-2 bg-gray-300 hover:bg-gray-400"
              }`}
              aria-label={`Go to tab ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default PlatformTabs;
