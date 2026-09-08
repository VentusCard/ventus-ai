import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Baby,
  Building2,
  CreditCard,
  GraduationCap,
  Home,
  Landmark,
  MapPin,
  Plane,
  Smartphone,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const W = 1000;
const H = 640;
const POINT_COUNT = 180;

type Point = { x: number; y: number; depth?: number };

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
  const cx = 500;
  const headCy = 190;
  const headR = 78;

  // Head: outer outline ring plus one inner ring for density
  const headRings = [
    { count: 34, r: headR, depth: 1 },
    { count: 22, r: headR * 0.66, depth: 0.72 },
    { count: 10, r: headR * 0.32, depth: 0.5 },
  ];
  headRings.forEach((ring) => {
    for (let index = 0; index < ring.count; index += 1) {
      const angle = (index / ring.count) * Math.PI * 2 - Math.PI / 2;
      points.push({
        x: cx + Math.cos(angle) * ring.r,
        y: headCy + Math.sin(angle) * ring.r * 1.06,
        depth: ring.depth,
      });
    }
  });

  // Shoulders: bust silhouette, neck at center rising into sloping shoulders
  const shoulderTop = 300;
  const halfWidth = 250;
  const bottomY = 470;
  const topAt = (x: number) => {
    const n = Math.min(1, Math.abs(x) / halfWidth);
    // flat-ish near the neck, then curving down toward the outer shoulder
    return shoulderTop + 118 * Math.pow(n, 1.7);
  };

  const remaining = POINT_COUNT - points.length;

  // Outline of the shoulder curve
  const outlineCount = Math.round(remaining * 0.34);
  for (let i = 0; i < outlineCount; i += 1) {
    const u = outlineCount > 1 ? i / (outlineCount - 1) : 0.5;
    const x = (u * 2 - 1) * halfWidth;
    points.push({ x: cx + x, y: topAt(x), depth: 1 });
  }

  // Interior fill of the bust so it reads as a solid mass
  const fillCount = remaining - outlineCount;
  const cols = 13;
  const rows = Math.max(1, Math.ceil(fillCount / cols));
  for (let i = 0; i < fillCount; i += 1) {
    const row = Math.floor(i / cols);
    const col = i % cols;
    const stagger = row % 2 === 0 ? 0 : 0.5 / (cols - 1);
    const u = col / (cols - 1) + stagger;
    const x = (Math.min(1, u) * 2 - 1) * (halfWidth - 18);
    const top = topAt(x) + 20;
    const span = Math.max(12, bottomY - top);
    const y = top + (span * (row + 0.5)) / rows;
    points.push({ x: cx + x, y, depth: 0.66 });
  }


  return points;
})();


const pointStyles = Array.from({ length: POINT_COUNT }, (_, index) => ({
  radius: 1.8 + random() * 2.6,
  color: "#2563eb",
  driftAngle: random() * Math.PI * 2,
  driftSpeed: 0.22 + random() * 0.55,
  driftRadius: 6 + random() * 18,
}));

const SOURCE_LABELS = [
  { label: "Card activity", x: 26, y: 24, icon: CreditCard },
  { label: "Account patterns", x: 52, y: 17, icon: Landmark },
  { label: "Digital engagement", x: 56, y: 42, icon: Smartphone },
  { label: "Household context", x: 24, y: 47, icon: Home },
  { label: "Merchant intelligence", x: 40, y: 63, icon: Building2 },
];

const SIGNALS = [
  { label: "Frequent Traveler", x: 70, y: 10, anchorX: 585, anchorY: 195, icon: Plane, tone: "text-cyan-700 bg-cyan-50 border-cyan-200" },
  { label: "Young Parent", x: 74, y: 34, anchorX: 605, anchorY: 285, icon: Baby, tone: "text-violet-700 bg-violet-50 border-violet-200" },
  { label: "College-Bound Child", x: 71, y: 82, anchorX: 600, anchorY: 410, icon: GraduationCap, tone: "text-amber-700 bg-amber-50 border-amber-200" },
  { label: "Building Cash Reserves", x: 18, y: 78, anchorX: 400, anchorY: 410, icon: WalletCards, tone: "text-emerald-700 bg-emerald-50 border-emerald-200" },
  { label: "Home Purchase Journey", x: 16, y: 14, anchorX: 395, anchorY: 255, icon: MapPin, tone: "text-blue-700 bg-blue-50 border-blue-200" },
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
        point.style.opacity = String(0.3 + personProgress * (0.38 + (person[index].depth ?? 1) * 0.3));
        point.setAttribute("r", String(style.radius * (0.86 + (person[index].depth ?? 1) * 0.3)));
      });

      sourceRefs.current.forEach((source, index) => {
        if (!source) return;
        const opacity = clamp(1 - personProgress * 1.7);
        source.style.opacity = String(opacity);
        source.style.transform = `translate3d(0, ${Math.sin(time * 0.5 + index) * 4}px, 0) scale(${0.96 + opacity * 0.04})`;
      });

      signalRefs.current.forEach((signal, index) => {
        if (!signal) return;
        const local = ease((signalProgress - index * 0.08) / 0.68);
        const floatY = Math.sin(time * 0.9 + index * 1.3) * 5;
        const floatX = Math.cos(time * 0.6 + index * 1.1) * 3;
        signal.style.opacity = String(local);
        signal.style.transform = `translate3d(${(1 - local) * (index < 3 ? -18 : 18) + floatX}px, ${floatY}px, 0) scale(${0.94 + local * 0.06})`;
      });

      if (auraRef.current) auraRef.current.style.opacity = String(personProgress * 0.38);
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
    <section id="hero" ref={trackRef} className="relative h-[320vh] bg-white" aria-label="Ventus customer intelligence">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_44%,rgba(37,99,235,0.08),transparent_48%)]" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col items-center gap-8 px-6 pb-6 pt-24 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:items-center lg:gap-12 lg:px-10 lg:pt-20">
          <div className="relative z-10 flex-none text-center lg:text-left">
            <h1 className="mx-auto max-w-4xl text-[2.9rem] font-bold leading-[1.05] tracking-tight text-slate-900 sm:text-[3.6rem] lg:mx-0 lg:text-[4.25rem]">
              Turn behavioral intelligence into <span className="italic text-blue-600">growth opportunities</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg lg:mx-0">
              Ventus AI orchestrates a hyper-personalized banking experience for every customer with your existing stack.
            </p>
            <div className="mt-7 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Button size="lg" className="h-12 bg-blue-600 px-7 text-base text-white hover:bg-blue-500" onClick={() => navigate("/contact")}>Schedule Demo <ArrowRight className="ml-2 h-5 w-5" /></Button>
              <Button size="lg" variant="outline" className="h-12 border-slate-300 bg-white px-7 text-base text-slate-700 hover:bg-slate-50 hover:text-slate-900" onClick={() => document.getElementById("outcomes")?.scrollIntoView({ behavior: "smooth" })}>Learn More</Button>
            </div>
            <div className="relative mt-6 h-4">
              {CAPTIONS.map((caption, index) => <span key={caption} ref={(node) => (captionRefs.current[index] = node)} className="absolute inset-0 text-xs text-slate-500 transition-opacity duration-500 lg:text-left" style={{ opacity: index === 0 ? 1 : 0 }}>{caption}</span>)}
            </div>
            <div className="mx-auto mt-4 h-px w-32 overflow-hidden bg-slate-200 lg:mx-0"><div ref={progressRef} className="h-px w-full origin-left bg-blue-600" style={{ transform: "scaleX(0)" }} /></div>
          </div>

          <div className="relative min-h-0 w-full max-w-4xl flex-1 lg:h-[76vh] lg:flex-none">
            <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
              <defs><radialGradient id="person-aura"><stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" /><stop offset="100%" stopColor="#2563eb" stopOpacity="0" /></radialGradient></defs>
              <circle ref={auraRef} cx="500" cy="320" r="285" fill="url(#person-aura)" style={{ opacity: 0 }} />
              {pointStyles.map((style, index) => <circle key={index} ref={(node) => (pointRefs.current[index] = node)} r={style.radius} fill={style.color} transform={`translate(${scattered[index].x} ${scattered[index].y})`} style={{ opacity: 0.3 }} />)}
            </svg>

            {SOURCE_LABELS.map((source, index) => {
              const Icon = source.icon;
              return <div key={source.label} ref={(node) => (sourceRefs.current[index] = node)} className="absolute flex items-center gap-2 rounded-full border border-slate-300 bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm" style={{ left: `${source.x}%`, top: `${source.y}%` }}><Icon className="h-4 w-4 text-slate-500" />{source.label}</div>;
            })}
            {SIGNALS.map((signal, index) => {
              const Icon = signal.icon;
              return <div key={signal.label} ref={(node) => (signalRefs.current[index] = node)} className={`absolute flex items-center gap-2 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-medium shadow-[0_0_20px_rgba(37,99,235,0.1)] backdrop-blur-sm ${signal.tone}`} style={{ left: `${signal.x}%`, top: `${signal.y}%`, opacity: 0 }}><Icon className="h-4 w-4" />{signal.label}</div>;
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollHero;
