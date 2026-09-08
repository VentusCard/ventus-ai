import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Database,
  Landmark,
  Mail,
  RadioTower,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ventusHeroBust from "@/assets/ventus-hero-bust-points.png";

const CAPTIONS = [
  "Your existing data, brought into focus.",
  "Ventus resolves activity into customer intelligence.",
  "Every customer and colleague gets the next best action.",
];

const ScrollHero = () => {
  const navigate = useNavigate();
  const trackRef = useRef<HTMLElement>(null);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const connectorRefs = useRef<(HTMLDivElement | null)[]>([]);
  const captionRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;

    const frame = () => {
      const track = trackRef.current;
      if (!track) return;

      const rect = track.getBoundingClientRect();
      const distance = rect.height - window.innerHeight;
      const progress = Math.max(0, Math.min(1, distance > 0 ? -rect.top / distance : 0));

      stageRefs.current.forEach((stage, index) => {
        if (!stage) return;
        const start = index * 0.22;
        const local = reduced ? 1 : Math.max(0, Math.min(1, (progress - start) / 0.2));
        const eased = 1 - Math.pow(1 - local, 3);
        stage.style.opacity = String(0.34 + eased * 0.66);
        stage.style.transform = `translate3d(${(1 - eased) * 18}px, 0, 0)`;
      });

      connectorRefs.current.forEach((connector, index) => {
        if (!connector) return;
        const start = 0.16 + index * 0.24;
        const local = reduced ? 1 : Math.max(0, Math.min(1, (progress - start) / 0.18));
        connector.style.opacity = String(0.2 + local * 0.8);
        connector.style.transform = `scaleX(${0.15 + local * 0.85})`;
      });

      const phase = progress < 0.33 ? 0 : progress < 0.66 ? 1 : 2;
      captionRefs.current.forEach((caption, index) => {
        if (caption) caption.style.opacity = index === phase ? "1" : "0";
      });

      if (progressRef.current) progressRef.current.style.transform = `scaleX(${progress})`;
      raf = requestAnimationFrame(frame);
    };

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <section
      id="hero"
      ref={trackRef}
      className="relative h-[400vh] bg-[#070d1c]"
      aria-label="How Ventus turns bank data into customer intelligence"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_45%,rgba(37,99,235,0.15),transparent_44%)]" />

        <div className="relative mx-auto grid h-full max-w-[1440px] grid-cols-1 content-center gap-8 px-6 pb-8 pt-24 lg:grid-cols-[minmax(290px,0.8fr)_minmax(680px,1.55fr)] lg:gap-8 lg:px-10 lg:pb-0 lg:pt-0">
          <div className="relative z-10 self-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-300/80">
              Customer intelligence for banks
            </p>
            <h1 className="mt-5 max-w-xl text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
              The opportunities are already in your data.{" "}
              <span className="text-slate-400">You just can't see them.</span>
            </h1>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-500" onClick={() => navigate("/contact")}>
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

            <div className="relative mt-7 h-6">
              {CAPTIONS.map((caption, index) => (
                <span
                  key={caption}
                  ref={(element) => (captionRefs.current[index] = element)}
                  className="absolute inset-0 text-sm text-slate-300/90 transition-opacity duration-500"
                  style={{ opacity: index === 0 ? 1 : 0 }}
                >
                  {caption}
                </span>
              ))}
            </div>
            <div className="mt-6 h-px w-40 overflow-hidden bg-white/10">
              <div ref={progressRef} className="h-px w-full origin-left bg-sky-400" style={{ transform: "scaleX(0)" }} />
            </div>
          </div>

          <div className="relative flex min-h-[330px] items-center lg:min-h-[610px]">
            <div className="grid w-full grid-cols-[minmax(150px,0.9fr)_34px_minmax(190px,1.2fr)_34px_minmax(160px,0.95fr)] items-center sm:grid-cols-[minmax(170px,0.9fr)_42px_minmax(220px,1.25fr)_42px_minmax(180px,0.95fr)]">
              <div
                ref={(element) => (stageRefs.current[0] = element)}
                className="rounded-lg border border-slate-200/80 bg-slate-50 p-3 text-slate-900 shadow-2xl shadow-black/20 sm:p-4"
              >
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-700">Data sources</p>
                <div className="mt-3 space-y-2">
                  <div className="rounded-md border border-slate-200 bg-white p-2.5">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-900 sm:text-xs">
                      <Database className="h-3.5 w-3.5 text-blue-600" /> Internal signals
                    </div>
                    <p className="mt-1 text-[9px] leading-snug text-slate-600 sm:text-[10px]">Rail-agnostic transaction enrichment</p>
                  </div>
                  <div className="rounded-md border border-slate-200 bg-white p-2.5">
                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-900 sm:text-xs">
                      <Sparkles className="h-3.5 w-3.5 text-blue-600" /> External signals
                    </div>
                    <p className="mt-1 text-[9px] leading-snug text-slate-600 sm:text-[10px]">Source-agnostic behavioral intelligence</p>
                  </div>
                </div>
              </div>

              <PipelineConnector ref={(element) => (connectorRefs.current[0] = element)} />

              <div
                ref={(element) => (stageRefs.current[1] = element)}
                className="relative flex min-h-[300px] items-center justify-center sm:min-h-[410px] lg:min-h-[520px]"
              >
                <p className="absolute top-1 z-10 text-center font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-sky-200/80 sm:text-[10px]">
                  Customer intelligence
                </p>
                <div className="absolute inset-x-[8%] top-[18%] h-[62%] rounded-full bg-blue-500/20 blur-3xl" />
                <div className="ventus-hero-bust relative h-[285px] w-full sm:h-[390px] lg:h-[500px]">
                  <img
                    src={ventusHeroBust}
                    alt="Abstract three-dimensional human bust formed from blue points and wireframe"
                    width={1024}
                    height={1280}
                    className="h-full w-full object-contain mix-blend-screen"
                  />
                </div>
              </div>

              <PipelineConnector ref={(element) => (connectorRefs.current[1] = element)} />

              <div
                ref={(element) => (stageRefs.current[2] = element)}
                className="rounded-lg border border-white/15 bg-white/[0.06] p-3 shadow-2xl shadow-black/20 backdrop-blur-sm sm:p-4"
              >
                <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-sky-200/80 sm:text-[10px]">Activation destinations</p>
                <div className="mt-3 space-y-1.5">
                  <Destination icon={Landmark} label="Bank teams" />
                  <Destination icon={Smartphone} label="Digital banking" />
                  <Destination icon={Mail} label="Email and SMS" />
                  <Destination icon={BarChart3} label="Campaigns" />
                </div>
                <div className="mt-3 flex items-center gap-1.5 text-[9px] font-medium text-sky-200/70 sm:text-[10px]">
                  <RadioTower className="h-3 w-3" /> Every customer, every colleague
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const PipelineConnector = ({ ref }: { ref: (element: HTMLDivElement | null) => void }) => (
  <div ref={ref} className="relative h-px origin-left bg-sky-400/35" style={{ transform: "scaleX(0.15)", opacity: 0.2 }}>
    <span className="ventus-flow-particle absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-sky-300 shadow-[0_0_10px_rgba(125,211,252,0.9)]" />
    <ArrowRight className="absolute -right-1 top-1/2 h-3 w-3 -translate-y-1/2 text-sky-300/60" />
  </div>
);

const Destination = ({ icon: Icon, label }: { icon: typeof Landmark; label: string }) => (
  <div className="flex min-h-8 items-center gap-2 rounded-md border border-white/10 bg-white/[0.05] px-2 py-1.5 text-[10px] font-medium text-slate-100 sm:text-[11px]">
    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-sky-400/10 text-sky-300">
      <Icon className="h-3 w-3" />
    </span>
    <span>{label}</span>
  </div>
);

export default ScrollHero;