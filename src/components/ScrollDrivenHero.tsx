import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Database,
  Globe2,
  MessagesSquare,
  RadioTower,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import HueField from "@/components/HueField";

const STAGE_LABELS = ["Signal intake", "Unify context", "Understand", "Orchestrate"];
const STAGE_RANGES: [number, number][] = [[0, 0.18], [0.18, 0.43], [0.43, 0.68], [0.68, 1]];

const SOURCES = [
  { title: "Internal Signals", subtitle: "Bank-owned context", icon: Database, signals: ["Accounts + transactions", "Digital banking behavior"] },
  { title: "External Intelligence", subtitle: "Broader customer context", icon: Globe2, signals: ["Life-stage intelligence", "National data partnership"] },
];

const FAMILIES = [
  { label: "Behavioral", signal: "Recurring travel pattern", tone: "behavioral" },
  { label: "Life Event", signal: "Home purchase in progress", tone: "life" },
  { label: "Financial", signal: "Investable assets held away", tone: "financial" },
  { label: "Demographic", signal: "Small business owner", tone: "demographic" },
  { label: "Risk", signal: "Policy review required", tone: "risk" },
] as const;

const OUTCOMES = [
  { title: "Personalized Experiences", detail: "Relevant products, deals, and guidance", audience: "Customer-facing", icon: Smartphone },
  { title: "AI Coworker", detail: "Prepared context for every conversation", audience: "Bank-facing", icon: MessagesSquare },
  { title: "Growth Workflows", detail: "Governed actions across every channel", audience: "Bank-facing", icon: Workflow },
];

const ScrollDrivenHero = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 100);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const rect = container.getBoundingClientRect();
      const totalScrollable = container.offsetHeight - window.innerHeight;
      setScrollProgress(Math.max(0, Math.min(1, -rect.top / totalScrollable)));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stage = scrollProgress < 0.18 ? 0 : scrollProgress < 0.43 ? 1 : scrollProgress < 0.68 ? 2 : 3;
  const familyCount = stage < 2 ? 0 : Math.min(5, Math.max(1, Math.ceil(((scrollProgress - 0.43) / 0.25) * 5)));
  const outcomeCount = stage < 3 ? 0 : Math.min(3, Math.max(1, Math.ceil(((scrollProgress - 0.68) / 0.32) * 3)));

  return (
    <section ref={containerRef} className="landing-signal-hero relative min-h-screen xl:h-[360vh]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-screen overflow-hidden" aria-hidden="true">
        <HueField blobs={[{ hue: "violet", size: 720, top: "4%", left: "-10%", opacity: 0.4 }, { hue: "sky", size: 640, top: "28%", left: "34%", opacity: 0.35 }]} />
      </div>

      <div className="sticky top-0 flex min-h-screen items-start justify-center overflow-hidden pb-10 pt-24 md:pt-28 xl:h-screen xl:items-center xl:pt-16">
        <div className="relative z-10 mx-auto flex w-full max-w-[1440px] flex-col items-center gap-8 px-6 xl:flex-row xl:gap-8">
          <div className="flex w-full flex-col items-center xl:w-[44%] xl:items-start">
            <h1 className={`hero-copy-enter text-center font-bold leading-[1.15] text-slate-900 xl:text-left ${loaded ? "is-loaded" : ""}`}>
              Turn behavioral intelligence into <br className="hidden xl:block" />
              <span className="italic text-primary">growth opportunities</span>
            </h1>
            <p className={`hero-copy-enter hero-copy-delay mt-6 max-w-xl text-center text-base leading-relaxed text-slate-600 md:text-lg xl:text-left ${loaded ? "is-loaded" : ""}`}>
              Ventus AI orchestrates a hyper-personalized banking experience for every customer with your existing stack
            </p>
            <div className={`hero-copy-enter hero-actions-delay mt-7 flex flex-col items-center gap-3 sm:flex-row ${loaded ? "is-loaded" : ""}`}>
              <Button className="h-12 px-10 text-base" onClick={() => navigate("/contact")}>Schedule Demo<ArrowRight className="h-4 w-4" /></Button>
              <Button variant="outline" className="h-12 px-10 text-base" onClick={() => document.getElementById("problem")?.scrollIntoView({ behavior: "smooth" })}>Learn More</Button>
            </div>
          </div>

          <div className={`signal-visual-shell w-full xl:w-[56%] ${loaded ? "is-loaded" : ""}`}>
            <div className="signal-visual-topline">
              <div className="flex items-center gap-2"><span className="signal-live-dot" aria-hidden="true" /><span className="signal-eyebrow">Live intelligence orchestration</span></div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500"><ShieldCheck className="h-4 w-4 text-primary" />Governed by bank rules</div>
            </div>

            <div className="signal-flow-grid">
              <div className="signal-source-column">
                {SOURCES.map((source, sourceIndex) => {
                  const Icon = source.icon;
                  return (
                    <article key={source.title} className="signal-source-card is-active">
                      <div className="signal-source-heading"><span className="signal-source-icon"><Icon className="h-4 w-4" /></span><div><h2>{source.title}</h2><p>{source.subtitle}</p></div></div>
                      <div className="signal-source-list">{source.signals.map((signal) => <div key={signal} className="signal-source-row"><span className="signal-mini-dot" /><span>{signal}</span></div>)}</div>
                      <span className="signal-provenance">{sourceIndex === 0 ? "1P" : "Ext"}</span>
                    </article>
                  );
                })}
              </div>

              <div className={`signal-converge ${stage >= 1 ? "is-active" : ""}`} aria-hidden="true">
                <svg viewBox="0 0 100 440" preserveAspectRatio="none"><path d="M0 92 C58 92 44 220 100 220" /><path d="M0 348 C58 348 44 220 100 220" /></svg>
                <span className="signal-packet signal-packet-one" /><span className="signal-packet signal-packet-two" />
              </div>

              <article className={`signal-core ${stage >= 1 ? "is-active" : ""}`}>
                <div className="signal-core-aura" aria-hidden="true" />
                <div className="signal-core-header">
                  <span className="signal-core-mark">V</span><div><p>Customer Intelligence</p><h2>Core</h2></div>
                  <span className="signal-core-status">{stage < 1 ? "READY" : stage < 3 ? "LIVE" : "ACTIVE"}</span>
                </div>
                <div className="signal-family-list">
                  {FAMILIES.map((family, index) => {
                    const revealed = index < familyCount;
                    return <div key={family.label} className={`signal-family-row signal-family-${family.tone} ${revealed ? "is-revealed" : ""}`}><span className="signal-family-dot" /><div className="min-w-0 flex-1"><p>{family.label}</p><span>{revealed ? family.signal : "Awaiting context"}</span></div><span className="signal-family-proof">{index % 2 === 0 ? "Both" : "1P"}</span></div>;
                  })}
                </div>
                <div className="signal-core-footer"><Sparkles className="h-4 w-4" /><span>{stage < 2 ? "Building a unified relationship view" : "Relationship context continuously refreshed"}</span></div>
              </article>

              <div className={`signal-distribute ${stage >= 3 ? "is-active" : ""}`} aria-hidden="true">
                <svg viewBox="0 0 100 440" preserveAspectRatio="none"><path d="M0 220 C56 220 44 76 100 76" /><path d="M0 220 C56 220 44 220 100 220" /><path d="M0 220 C56 220 44 364 100 364" /></svg>
                <span className="signal-packet signal-packet-three" />
              </div>

              <div className="signal-outcome-column">
                <div className="signal-output-label"><RadioTower className="h-4 w-4" />Orchestrated experiences</div>
                {OUTCOMES.map((outcome, index) => {
                  const Icon = outcome.icon;
                  return <article key={outcome.title} className={`signal-outcome-card ${index < outcomeCount ? "is-revealed" : ""}`}><span className="signal-outcome-icon"><Icon className="h-4 w-4" /></span><div className="min-w-0"><div className="flex items-center gap-2"><h2>{outcome.title}</h2>{index === 0 ? <Building2 className="h-3 w-3" /> : <BriefcaseBusiness className="h-3 w-3" />}</div><p>{outcome.detail}</p><span>{outcome.audience}</span></div></article>;
                })}
              </div>
            </div>

            <div className="signal-stage-rail" aria-label={`Current step: ${STAGE_LABELS[stage]}`}>
              {STAGE_LABELS.map((label, index) => {
                const [start, end] = STAGE_RANGES[index];
                const fill = Math.max(0, Math.min(1, (scrollProgress - start) / (end - start)));
                return <div key={label} className={`signal-stage ${index <= stage ? "is-active" : ""}`}><div><span style={{ width: `${(scrollProgress >= end ? 1 : fill) * 100}%` }} /></div><p>{label}</p></div>;
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollDrivenHero;
