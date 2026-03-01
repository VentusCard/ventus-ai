import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowDown, RotateCcw } from "lucide-react";

const pills = [
  { label: "Outdoor Enthusiast", color: "bg-blue-100 text-blue-700" },
  { label: "Pre-Summer Trip Planning", color: "bg-purple-100 text-purple-700" },
  { label: "Loyalty Decay Detected", color: "bg-orange-100 text-orange-700" },
  { label: "Life Event: Vacation Upcoming", color: "bg-teal-100 text-teal-700" },
];

const BeforeAfterAnimation = () => {
  const [phase, setPhase] = useState<"idle" | "before" | "arrow" | "after" | "done">("idle");
  const [barWidth, setBarWidth] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  const runSequence = useCallback(() => {
    setPhase("idle");
    setBarWidth(0);

    // Before fades in
    setTimeout(() => setPhase("before"), 100);
    // Arrow appears
    setTimeout(() => setPhase("arrow"), 1100);
    // After slides up
    setTimeout(() => {
      setPhase("after");
      setTimeout(() => setBarWidth(94), 200);
    }, 1600);
    // Mark done
    setTimeout(() => setPhase("done"), 3200);
  }, []);

  // Auto-loop every 8 seconds
  useEffect(() => {
    if (phase === "done") {
      timerRef.current = setTimeout(() => runSequence(), 5000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, runSequence]);

  // Intersection observer to trigger on scroll
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          runSequence();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [runSequence]);

  const showBefore = phase !== "idle";
  const showArrow = phase === "arrow" || phase === "after" || phase === "done";
  const showAfter = phase === "after" || phase === "done";

  return (
    <div ref={sectionRef} className="space-y-4">
      {/* BEFORE card */}
      <div
        className="rounded-xl p-6 transition-all duration-500"
        style={{
          background: "#f8f9fa",
          opacity: showBefore ? 1 : 0,
          transform: showBefore ? "translateY(0)" : "translateY(10px)",
        }}
      >
        <p className="text-[10px] font-bold tracking-widest text-red-500 uppercase mb-2">
          Before
        </p>
        <p className="text-gray-700 text-lg">"This customer shops at REI"</p>
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
        <p className="text-[10px] font-bold tracking-widest text-green-400 uppercase mb-3">
          After
        </p>
        <div className="flex flex-wrap gap-2 mb-4">
          {pills.map((p, i) => (
            <span
              key={p.label}
              className={`text-xs font-medium px-3 py-1 rounded-full ${p.color} transition-opacity duration-300`}
              style={{
                opacity: showAfter ? 1 : 0,
                transitionDelay: `${i * 100}ms`,
              }}
            >
              {p.label}
            </span>
          ))}
        </div>

        {/* Confidence bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-gray-400">Confidence Score</span>
            <span className="text-[11px] font-bold text-green-400">94%</span>
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
          onClick={runSequence}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          Replay
        </button>
      </div>
    </div>
  );
};

export default BeforeAfterAnimation;
