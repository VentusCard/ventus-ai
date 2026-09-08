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
  const rings = [
    { count: 30, rx: 72, ry: 95, cx: 510, cy: 205, depth: 1 },
    { count: 26, rx: 56, ry: 78, cx: 522, cy: 208, depth: 0.76 },
    { count: 20, rx: 39, ry: 60, cx: 533, cy: 210, depth: 0.54 },
    { count: 14, rx: 22, ry: 40, cx: 541, cy: 213, depth: 0.34 },
  ];

  rings.forEach((ring) => {
    for (let index = 0; index < ring.count; index += 1) {
      const angle = (index / ring.count) * Math.PI * 2;
      const profilePush = Math.max(0, Math.cos(angle)) * 14;
      points.push({
        x: ring.cx + Math.cos(angle) * ring.rx + profilePush,
        y: ring.cy + Math.sin(angle) * ring.ry,
        depth: ring.depth,
      });
    }
  });

  const bodyRows = 5;
  const bodyCount = POINT_COUNT - points.length;
  for (let index = 0; index < bodyCount; index += 1) {
    const row = index % bodyRows;
    const columnPosition = Math.floor(index / bodyRows) / Math.max(1, Math.ceil(bodyCount / bodyRows) - 1);
    const normalized = columnPosition * 2 - 1;
    const width = 252 - row * 32;
    points.push({
      x: 500 + normalized * width + row * 7,
      y: 560 - 152 * (1 - normalized * normalized) + row * 22,
      depth: 1 - row * 0.15,
    });
  }
  return points;
})();

const pointStyles = Array.from({ length: POINT_COUNT }, (_, index) => ({
  radius: 1.8 + random() * 2.6,
  color: ["#38bdf8", "#60a5fa", "#818cf8", "#a78bfa", "#22d3ee"][index % 5],
  driftAngle: random() * Math.PI * 2,
  driftSpeed: 0.22 + random() * 0.55,
  driftRadius: 6 + random() * 18,
}));

const SOURCE_LABELS = [
  { label: "Card activity", x: 20, y: 18, icon: CreditCard },
  { label: "Account patterns", x: 58, y: 11, icon: Landmark },
  { label: "Digital engagement", x: 67, y: 41, icon: Smartphone },
  { label: "Household context", x: 15, y: 51, icon: Home },
  { label: "Merchant intelligence", x: 55, y: 75, icon: Building2 },
];

const SIGNALS = [
  { label: "Frequent Traveler", x: 65, y: 17, anchorX: 585, anchorY: 195, icon: Plane, tone: "text-cyan-100 bg-cyan-400/15 border-cyan-300/45" },
  { label: "Young Parent", x: 69, y: 39, anchorX: 590, anchorY: 285, icon: Baby, tone: "text-violet-100 bg-violet-400/15 border-violet-300/45" },
  { label: "College-Bound Child", x: 63, y: 66, anchorX: 590, anchorY: 410, icon: GraduationCap, tone: "text-amber-100 bg-amber-400/15 border-amber-300/45" },
  { label: "Building Cash Reserves", x: 15, y: 66, anchorX: 408, anchorY: 410, icon: WalletCards, tone: "text-emerald-100 bg-emerald-400/15 border-emerald-300/45" },
  { label: "Home Purchase Journey", x: 12, y: 29, anchorX: 410, anchorY: 255, icon: MapPin, tone: "text-blue-100 bg-blue-400/15 border-blue-300/45" },
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
        signal.style.opacity = String(local);
        signal.style.transform = `translate3d(${(1 - local) * (index < 3 ? -18 : 18)}px, 0, 0) scale(${0.94 + local * 0.06})`;
      });

      lineRefs.current.forEach((line, index) => {
        if (!line) return;
        const local = ease((signalProgress - index * 0.08) / 0.68);
        line.style.opacity = String(local * 0.45);
        line.style.strokeDashoffset = String(120 * (1 - local));
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
    <section id="hero" ref={trackRef} className="relative h-[320vh] bg-[#070d1c]" aria-label="Ventus customer intelligence">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_44%,rgba(37,99,235,0.14),transparent_48%)]" />
        <div className="relative mx-auto flex h-full max-w-6xl flex-col items-center px-6 pb-6 pt-24 lg:px-10 lg:pt-24">
          <div className="relative z-10 flex-none text-center">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-300/80">Customer intelligence for banks</p>
            <h1 className="mx-auto mt-4 max-w-3xl text-3xl font-bold leading-[1.12] text-white sm:text-4xl lg:text-[2.6rem]">
              Turn behavioral intelligence into <span className="italic text-blue-400">growth opportunities</span>
            </h1>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button className="bg-blue-600 text-white hover:bg-blue-500" onClick={() => navigate("/contact")}>Schedule Demo <ArrowRight className="ml-2 h-4 w-4" /></Button>
              <Button variant="outline" className="border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white" onClick={() => document.getElementById("flows")?.scrollIntoView({ behavior: "smooth" })}>See the platform</Button>
            </div>
            <div className="relative mt-5 h-4">
              {CAPTIONS.map((caption, index) => <span key={caption} ref={(node) => (captionRefs.current[index] = node)} className="absolute inset-0 text-xs text-slate-300/90 transition-opacity duration-500" style={{ opacity: index === 0 ? 1 : 0 }}>{caption}</span>)}
            </div>
            <div className="mx-auto mt-4 h-px w-32 overflow-hidden bg-white/10"><div ref={progressRef} className="h-px w-full origin-left bg-sky-400" style={{ transform: "scaleX(0)" }} /></div>
          </div>

          <div className="relative mt-8 min-h-0 w-full max-w-4xl flex-1">
            <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
              <defs><radialGradient id="person-aura"><stop offset="0%" stopColor="#38bdf8" stopOpacity="0.34" /><stop offset="100%" stopColor="#38bdf8" stopOpacity="0" /></radialGradient></defs>
              <circle ref={auraRef} cx="500" cy="320" r="285" fill="url(#person-aura)" style={{ opacity: 0 }} />
              {SIGNALS.map((signal, index) => {
                const endX = signal.x > 50 ? signal.x * 10 - 20 : signal.x * 10 + 170;
                const endY = signal.y * 7;
                return <line key={signal.label} ref={(node) => (lineRefs.current[index] = node)} x1={signal.anchorX} y1={signal.anchorY} x2={endX} y2={endY} stroke="#7dd3fc" strokeWidth="1" strokeDasharray="5 5" style={{ opacity: 0, strokeDashoffset: 120 }} />;
              })}
              {pointStyles.map((style, index) => <circle key={index} ref={(node) => (pointRefs.current[index] = node)} r={style.radius} fill={style.color} transform={`translate(${scattered[index].x} ${scattered[index].y})`} style={{ opacity: 0.3 }} />)}
            </svg>

            {SOURCE_LABELS.map((source, index) => {
              const Icon = source.icon;
              return <div key={source.label} ref={(node) => (sourceRefs.current[index] = node)} className="absolute flex items-center gap-2 rounded-full border border-slate-400/30 bg-slate-500/12 px-3.5 py-2 text-[11px] font-medium text-slate-200 shadow-sm backdrop-blur-sm" style={{ left: `${source.x}%`, top: `${source.y}%` }}><Icon className="h-4 w-4 text-slate-300" />{source.label}</div>;
            })}
            {SIGNALS.map((signal, index) => {
              const Icon = signal.icon;
              return <div key={signal.label} ref={(node) => (signalRefs.current[index] = node)} className={`absolute flex items-center gap-2 rounded-full border px-3.5 py-2 text-[11px] font-medium shadow-[0_0_20px_rgba(56,189,248,0.14)] backdrop-blur-sm ${signal.tone}`} style={{ left: `${signal.x}%`, top: `${signal.y}%`, opacity: 0 }}><Icon className="h-4 w-4" />{signal.label}</div>;
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollHero;
