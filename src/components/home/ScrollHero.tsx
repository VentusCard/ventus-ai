import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const W = 1000;
const H = 700;
const POINT_COUNT = 140;

type Point = { x: number; y: number };

const makeRandom = (seed: number) => {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
};

const random = makeRandom(20260908);

const scattered: Point[] = Array.from({ length: POINT_COUNT }, () => ({
  x: 70 + random() * (W - 140),
  y: 60 + random() * (H - 120),
}));

const person: Point[] = (() => {
  const points: Point[] = [];
  const centerX = 500;
  const headCenterY = 225;
  const headCount = 58;

  for (let index = 0; index < headCount; index += 1) {
    const ring = index % 3;
    const angle = (index / headCount) * Math.PI * 2 + ring * 0.12;
    const radius = 108 - ring * 23;
    points.push({
      x: centerX + Math.cos(angle) * radius * 0.82,
      y: headCenterY + Math.sin(angle) * radius,
    });
  }

  const bodyCount = POINT_COUNT - headCount;
  for (let index = 0; index < bodyCount; index += 1) {
    const layer = index % 3;
    const position = Math.floor(index / 3) / Math.max(1, Math.ceil(bodyCount / 3) - 1);
    const normalized = position * 2 - 1;
    points.push({
      x: centerX + normalized * (265 - layer * 25),
      y: 590 - 158 * (1 - normalized * normalized) + layer * 30,
    });
  }

  return points;
})();

const pointStyles = Array.from({ length: POINT_COUNT }, (_, index) => ({
  radius: 2 + random() * 3.3,
  color: ["#38bdf8", "#60a5fa", "#818cf8", "#a78bfa", "#22d3ee"][index % 5],
  driftAngle: random() * Math.PI * 2,
  driftSpeed: 0.22 + random() * 0.55,
  driftRadius: 8 + random() * 22,
}));

const SOURCE_LABELS = [
  { label: "Card activity", x: 10, y: 18 },
  { label: "Account patterns", x: 66, y: 12 },
  { label: "Digital engagement", x: 75, y: 42 },
  { label: "Household context", x: 4, y: 54 },
  { label: "Merchant intelligence", x: 58, y: 76 },
];

const SIGNALS = [
  { label: "Frequent Traveler", x: 74, y: 16, anchorX: 585, anchorY: 205 },
  { label: "Young Parent", x: 78, y: 39, anchorX: 590, anchorY: 295 },
  { label: "College-Bound Child", x: 70, y: 66, anchorX: 590, anchorY: 430 },
  { label: "Building Cash Reserves", x: 3, y: 67, anchorX: 408, anchorY: 430 },
  { label: "Home Purchase Journey", x: 1, y: 29, anchorX: 410, anchorY: 265 },
];

const CAPTIONS = [
  "Thousands of data points, disconnected.",
  "Ventus resolves them into a person.",
  "Named signals reveal the opportunity.",
];

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const ease = (value: number) => 1 - Math.pow(1 - clamp(value), 3);

const ScrollHero = () => {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLElement>(null);
  const pointRefs = useRef<(SVGCircleElement | null)[]>([]);
  const sourceRefs = useRef<(HTMLDivElement | null)[]>([]);
  const signalRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lineRefs = useRef<(SVGLineElement | null)[]>([]);
  const captionRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const auraRef = useRef<SVGCircleElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const startTime = performance.now();
    let frameId = 0;

    const update = (now: number) => {
      frameId = requestAnimationFrame(update);
      const track = trackRef.current;
      if (!track) return;

      const bounds = track.getBoundingClientRect();
      const distance = bounds.height - window.innerHeight;
      const progress = clamp(distance > 0 ? -bounds.top / distance : 0);
      const time = reducedMotion ? 0 : (now - startTime) / 1000;
      const personProgress = reducedMotion ? 1 : ease((progress - 0.18) / 0.38);
      const signalProgress = reducedMotion ? 1 : ease((progress - 0.62) / 0.24);

      pointRefs.current.forEach((point, index) => {
        if (!point) return;
        const style = pointStyles[index];
        const drift = 1 - personProgress;
        const sourceX = scattered[index].x + Math.cos(time * style.driftSpeed + style.driftAngle) * style.driftRadius * drift;
        const sourceY = scattered[index].y + Math.sin(time * style.driftSpeed * 0.8 + style.driftAngle) * style.driftRadius * drift;
        const x = sourceX + (person[index].x - sourceX) * personProgress;
        const y = sourceY + (person[index].y - sourceY) * personProgress;
        point.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
        point.style.opacity = String(0.3 + personProgress * 0.65);
      });

      sourceRefs.current.forEach((source, index) => {
        if (!source) return;
        const opacity = clamp(1 - personProgress * 1.7);
        source.style.opacity = String(opacity);
        source.style.transform = `translate3d(0, ${Math.sin(time * 0.5 + index) * 5}px, 0) scale(${0.96 + opacity * 0.04})`;
      });

      signalRefs.current.forEach((signal, index) => {
        if (!signal) return;
        const local = ease((signalProgress - index * 0.08) / 0.68);
        signal.style.opacity = String(local);
        signal.style.transform = `translate3d(${(1 - local) * (index < 3 ? -22 : 22)}px, 0, 0) scale(${0.94 + local * 0.06})`;
      });

      lineRefs.current.forEach((line, index) => {
        if (!line) return;
        const local = ease((signalProgress - index * 0.08) / 0.68);
        line.style.opacity = String(local * 0.45);
        line.style.strokeDashoffset = String(120 * (1 - local));
      });

      if (auraRef.current) auraRef.current.style.opacity = String(personProgress * 0.42);
      const phase = progress < 0.3 ? 0 : progress < 0.7 ? 1 : 2;
      captionRefs.current.forEach((caption, index) => {
        if (caption) caption.style.opacity = index === phase ? "1" : "0";
      });
      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
    };

    frameId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return (
    <section id="hero" ref={trackRef} className="relative h-[400vh] bg-[#070d1c]" aria-label="Ventus customer intelligence">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_44%,rgba(37,99,235,0.18),transparent_48%)]" />
        <div className="relative mx-auto grid h-full max-w-7xl grid-cols-1 items-center gap-4 px-6 pb-6 pt-24 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-8 lg:px-10 lg:pb-0 lg:pt-0">
          <div className="relative z-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-300/80">Customer intelligence for banks</p>
            <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-[1.08] text-white sm:text-5xl lg:text-[3.4rem]">
              The opportunities are already in your data. <span className="text-slate-400">You just can't see them.</span>
            </h1>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-500" onClick={() => navigate("/contact")}>Schedule Demo <ArrowRight className="ml-2 h-4 w-4" /></Button>
              <Button size="lg" variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white" onClick={() => document.getElementById("flows")?.scrollIntoView({ behavior: "smooth" })}>See the platform</Button>
            </div>
            <div className="relative mt-7 h-6">
              {CAPTIONS.map((caption, index) => <span key={caption} ref={(node) => (captionRefs.current[index] = node)} className="absolute inset-0 text-sm text-slate-300/90 transition-opacity duration-500" style={{ opacity: index === 0 ? 1 : 0 }}>{caption}</span>)}
            </div>
            <div className="mt-6 h-px w-40 overflow-hidden bg-white/10"><div ref={progressRef} className="h-px w-full origin-left bg-sky-400" style={{ transform: "scaleX(0)" }} /></div>
          </div>

          <div className="relative h-[43vh] min-h-[310px] w-full lg:h-[76vh]">
            <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
              <defs><radialGradient id="person-aura"><stop offset="0%" stopColor="#38bdf8" stopOpacity="0.38" /><stop offset="100%" stopColor="#38bdf8" stopOpacity="0" /></radialGradient></defs>
              <circle ref={auraRef} cx="500" cy="340" r="315" fill="url(#person-aura)" style={{ opacity: 0 }} />
              {SIGNALS.map((signal, index) => {
                const endX = signal.x > 50 ? signal.x * 10 - 20 : signal.x * 10 + 170;
                const endY = signal.y * 7;
                return <line key={signal.label} ref={(node) => (lineRefs.current[index] = node)} x1={signal.anchorX} y1={signal.anchorY} x2={endX} y2={endY} stroke="#7dd3fc" strokeWidth="1.2" strokeDasharray="5 5" style={{ opacity: 0, strokeDashoffset: 120 }} />;
              })}
              {pointStyles.map((style, index) => <circle key={index} ref={(node) => (pointRefs.current[index] = node)} r={style.radius} fill={style.color} transform={`translate(${scattered[index].x} ${scattered[index].y})`} style={{ opacity: 0.3 }} />)}
            </svg>

            {SOURCE_LABELS.map((source, index) => <div key={source.label} ref={(node) => (sourceRefs.current[index] = node)} className="absolute rounded-full border border-sky-300/20 bg-sky-300/[0.06] px-3 py-1.5 text-[10px] font-medium text-sky-100/70 backdrop-blur-sm sm:text-xs" style={{ left: `${source.x}%`, top: `${source.y}%` }}>{source.label}</div>)}
            {SIGNALS.map((signal, index) => <div key={signal.label} ref={(node) => (signalRefs.current[index] = node)} className="absolute rounded-full border border-sky-300/35 bg-[#0d1d38]/90 px-3 py-2 text-[10px] font-semibold text-sky-100 shadow-[0_0_24px_rgba(56,189,248,0.16)] backdrop-blur-md sm:text-xs" style={{ left: `${signal.x}%`, top: `${signal.y}%`, opacity: 0 }}>{signal.label}</div>)}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollHero;