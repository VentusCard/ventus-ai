import { useEffect, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ------------------------------------------------------------------ */
/* Geometry                                                            */
/* ------------------------------------------------------------------ */

const W = 1000;
const H = 700;
const N = 140;

type P = { x: number; y: number };

/** Deterministic PRNG so the layout is identical on every render/SSR pass. */
const makeRand = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const rand = makeRand(20260908);

/* Phase 1: scattered noise */
const scattered: P[] = Array.from({ length: N }, () => ({
  x: 60 + rand() * (W - 120),
  y: 50 + rand() * (H - 100),
}));

/* Phase 2: force-directed style clustered graph */
const CLUSTERS: { x: number; y: number; r: number }[] = [
  { x: 300, y: 210, r: 120 },
  { x: 660, y: 170, r: 110 },
  { x: 780, y: 430, r: 120 },
  { x: 430, y: 500, r: 130 },
  { x: 150, y: 420, r: 95 },
];

const clusterOf: number[] = [];
const network: P[] = Array.from({ length: N }, (_, i) => {
  const ci = i % CLUSTERS.length;
  clusterOf.push(ci);
  const c = CLUSTERS[ci];
  const a = rand() * Math.PI * 2;
  const rr = Math.sqrt(rand()) * c.r;
  return { x: c.x + Math.cos(a) * rr, y: c.y + Math.sin(a) * rr * 0.85 };
});

/* Relax the graph a little so points do not overlap (runs once at module load). */
for (let iter = 0; iter < 60; iter++) {
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const dx = network[j].x - network[i].x;
      const dy = network[j].y - network[i].y;
      const d2 = dx * dx + dy * dy;
      if (d2 > 0 && d2 < 900) {
        const d = Math.sqrt(d2) || 0.001;
        const push = ((30 - d) / d) * 0.25;
        network[i].x -= dx * push;
        network[i].y -= dy * push;
        network[j].x += dx * push;
        network[j].y += dy * push;
      }
    }
  }
}

/* Edges: near neighbours, mostly inside a cluster */
const edges: { a: number; b: number; delay: number }[] = [];
for (let i = 0; i < N; i++) {
  for (let j = i + 1; j < N; j++) {
    const dx = network[j].x - network[i].x;
    const dy = network[j].y - network[i].y;
    const d = Math.hypot(dx, dy);
    const same = clusterOf[i] === clusterOf[j];
    if ((same && d < 86) || (!same && d < 52)) {
      edges.push({ a: i, b: j, delay: rand() * 0.5 });
    }
  }
}

/* Phase 3: resolved into a person (head + shoulders silhouette) */
const person: P[] = (() => {
  const cx = W * 0.5;
  const headY = 230;
  const headR = 104;
  const pts: P[] = [];
  const headCount = 52;
  for (let i = 0; i < headCount; i++) {
    const t = i / headCount;
    const layer = i % 2;
    const ring = headR - layer * 26;
    const a = t * Math.PI * 2 + layer * 0.14;
    pts.push({ x: cx + Math.cos(a) * ring, y: headY + Math.sin(a) * ring * 1.06 });
  }
  const bodyCount = N - headCount;
  const halfW = 268;
  const baseY = 590;
  const rise = 155;
  for (let i = 0; i < bodyCount; i++) {
    const layer = i % 3;
    const k = Math.floor(i / 3);
    const per = Math.ceil(bodyCount / 3);
    const t = per > 1 ? k / (per - 1) : 0.5;
    const u = t * 2 - 1; // -1 .. 1
    const x = cx + u * (halfW - layer * 24);
    // shoulder curve: peaks near the neck, drops to the outer edges
    const y = baseY - rise * (1 - u * u) + layer * 30;
    pts.push({ x, y });
  }
  return pts;
})();


/* Phase 4: points redistribute onto four surfaces */
const SURFACES = [
  { x: 120, y: 96, w: 300, h: 210, label: "Digital banking" },
  { x: 470, y: 96, w: 300, h: 210, label: "Email" },
  { x: 120, y: 372, w: 300, h: 210, label: "Advisor console" },
  { x: 470, y: 372, w: 300, h: 210, label: "Campaigns" },
];

const surfaces: P[] = Array.from({ length: N }, (_, i) => {
  const s = SURFACES[i % SURFACES.length];
  const k = Math.floor(i / SURFACES.length);
  const per = Math.ceil(N / SURFACES.length);
  const t = (k + 0.5) / per;
  // walk the perimeter
  const peri = 2 * (s.w + s.h);
  let d = t * peri;
  if (d < s.w) return { x: s.x + d, y: s.y };
  d -= s.w;
  if (d < s.h) return { x: s.x + s.w, y: s.y + d };
  d -= s.h;
  if (d < s.w) return { x: s.x + s.w - d, y: s.y + s.h };
  d -= s.w;
  return { x: s.x, y: s.y + s.h - d };
});

const HUES = ["#38bdf8", "#60a5fa", "#818cf8", "#a78bfa", "#22d3ee"];

const POINTS = Array.from({ length: N }, (_, i) => ({
  r: 2 + rand() * 3.4,
  hue: HUES[i % HUES.length],
  driftA: rand() * Math.PI * 2,
  driftS: 0.25 + rand() * 0.6,
  driftR: 8 + rand() * 22,
}));

const CAPTIONS = [
  "Thousands of signals, disconnected.",
  "Ventus reads them as patterns.",
  "And resolves them into a person.",
  "Then every surface adapts.",
];

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const seg = (p: number, a: number, b: number) => easeInOut(clamp01((p - a) / (b - a)));

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const ScrollHero = () => {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(SVGCircleElement | null)[]>([]);
  const edgeRefs = useRef<(SVGLineElement | null)[]>([]);
  const captionRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const auraRef = useRef<SVGCircleElement>(null);
  const surfaceRefs = useRef<(SVGGElement | null)[]>([]);
  const barRef = useRef<HTMLDivElement>(null);

  const edgeList = useMemo(() => edges, []);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let t0 = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const el = trackRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight;
      const p = clamp01(total > 0 ? -rect.top / total : 0);
      const time = reduced ? 0 : (now - t0) / 1000;

      const toNet = seg(p, 0.22, 0.5);
      const toPerson = seg(p, 0.5, 0.74);
      const toSurface = seg(p, 0.74, 0.96);
      const driftAmt = 1 - toNet;

      for (let i = 0; i < N; i++) {
        const c = dotRefs.current[i];
        if (!c) continue;
        const cfg = POINTS[i];
        let x = scattered[i].x;
        let y = scattered[i].y;
        if (!reduced) {
          x += Math.cos(time * cfg.driftS + cfg.driftA) * cfg.driftR * driftAmt;
          y += Math.sin(time * cfg.driftS * 0.8 + cfg.driftA) * cfg.driftR * driftAmt;
        }
        x += (network[i].x - x) * toNet;
        y += (network[i].y - y) * toNet;
        x += (person[i].x - x) * toPerson;
        y += (person[i].y - y) * toPerson;
        x += (surfaces[i].x - x) * toSurface;
        y += (surfaces[i].y - y) * toSurface;

        c.setAttribute("transform", `translate(${x.toFixed(2)} ${y.toFixed(2)})`);
        const op = 0.28 + 0.55 * toNet + 0.15 * toPerson;
        c.style.opacity = String(Math.min(0.95, op));
      }

      const edgeOpacity = Math.min(toNet, 1 - toPerson * 0.92);
      for (let e = 0; e < edgeList.length; e++) {
        const ln = edgeRefs.current[e];
        if (!ln) continue;
        const { a, b, delay } = edgeList[e];
        const A = dotRefs.current[a];
        const B = dotRefs.current[b];
        if (!A || !B) continue;
        const ta = A.getAttribute("transform")!.slice(10, -1).split(" ");
        const tb = B.getAttribute("transform")!.slice(10, -1).split(" ");
        ln.setAttribute("x1", ta[0]);
        ln.setAttribute("y1", ta[1]);
        ln.setAttribute("x2", tb[0]);
        ln.setAttribute("y2", tb[1]);
        ln.style.opacity = String(clamp01((edgeOpacity - delay * 0.35) / 0.65) * 0.4);
      }

      if (auraRef.current) {
        auraRef.current.style.opacity = String(toPerson * (1 - toSurface) * 0.5);
        auraRef.current.style.transform = `scale(${0.85 + toPerson * 0.15})`;
      }

      surfaceRefs.current.forEach((g, i) => {
        if (!g) return;
        const local = clamp01((toSurface - i * 0.08) / 0.6);
        g.style.opacity = String(local);
        g.style.transform = `translateY(${(1 - local) * 14}px)`;
      });

      const phase = p < 0.28 ? 0 : p < 0.54 ? 1 : p < 0.78 ? 2 : 3;
      captionRefs.current.forEach((s, i) => {
        if (s) s.style.opacity = i === phase ? "1" : "0";
      });

      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [edgeList]);

  return (
    <section
      id="hero"
      ref={trackRef}
      className="relative h-[400vh] bg-[#070d1c]"
      aria-label="How Ventus turns bank data into customer intelligence"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* ambient wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 620px at 72% 40%, rgba(56,189,248,0.16), transparent 70%), radial-gradient(700px 520px at 20% 80%, rgba(129,140,248,0.14), transparent 70%)",
          }}
        />

        <div className="relative mx-auto grid h-full max-w-7xl grid-cols-1 items-center gap-8 px-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:px-10">
          {/* Copy */}
          <div className="pt-24 lg:pt-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-300/80">
              Customer intelligence for banks
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
              The opportunities are already in your data.{" "}
              <span className="text-slate-400">You just can't see them.</span>
            </h1>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="bg-blue-600 text-white hover:bg-blue-500"
                onClick={() => navigate("/contact")}
              >
                Schedule Demo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/25 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                onClick={() => document.getElementById("flows")?.scrollIntoView({ behavior: "smooth" })}
              >
                See the platform
              </Button>
            </div>

            {/* Phase caption */}
            <div className="relative mt-7 h-6">
              {CAPTIONS.map((c, i) => (
                <span
                  key={c}
                  ref={(el) => (captionRefs.current[i] = el)}
                  className="absolute inset-0 text-sm text-slate-300/90 transition-opacity duration-500"
                  style={{ opacity: i === 0 ? 1 : 0 }}
                >
                  {c}
                </span>
              ))}
            </div>

            <div className="mt-6 h-px w-40 overflow-hidden bg-white/10">
              <div
                ref={barRef}
                className="h-px w-full origin-left bg-sky-400"
                style={{ transform: "scaleX(0)" }}
              />
            </div>
          </div>

          {/* Canvas */}
          <div className="relative h-[42vh] w-full lg:h-[76vh]">
            <svg
              viewBox={`0 0 ${W} ${H}`}
              className="h-full w-full"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden
            >
              <circle
                ref={auraRef}
                cx={W * 0.52}
                cy={330}
                r={300}
                fill="url(#ventus-aura)"
                style={{ opacity: 0, transformOrigin: "center", transformBox: "fill-box" }}
              />
              <defs>
                <radialGradient id="ventus-aura">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                </radialGradient>
              </defs>

              {/* surfaces */}
              {SURFACES.map((s, i) => (
                <g
                  key={s.label}
                  ref={(el) => (surfaceRefs.current[i] = el)}
                  style={{ opacity: 0 }}
                >
                  <rect
                    x={s.x}
                    y={s.y}
                    width={s.w}
                    height={s.h}
                    rx={18}
                    fill="rgba(255,255,255,0.035)"
                    stroke="rgba(148,163,184,0.35)"
                  />
                  <text
                    x={s.x + 20}
                    y={s.y + 38}
                    fill="rgba(226,232,240,0.85)"
                    fontSize="20"
                    fontWeight="600"
                  >
                    {s.label}
                  </text>
                </g>
              ))}

              {/* edges */}
              <g stroke="#7dd3fc" strokeWidth="1">
                {edgeList.map((e, i) => (
                  <line key={i} ref={(el) => (edgeRefs.current[i] = el)} style={{ opacity: 0 }} />
                ))}
              </g>

              {/* points */}
              {POINTS.map((pt, i) => (
                <circle
                  key={i}
                  ref={(el) => (dotRefs.current[i] = el)}
                  r={pt.r}
                  fill={pt.hue}
                  transform={`translate(${scattered[i].x} ${scattered[i].y})`}
                  style={{ opacity: 0.3 }}
                />
              ))}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollHero;
