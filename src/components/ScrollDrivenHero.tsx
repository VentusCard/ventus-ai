import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Database, Globe2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import HueField from "@/components/HueField";

const SOURCES = [
  { title: "Internal Signals", icon: Database },
  { title: "External Intelligence", icon: Globe2 },
];

const ScrollDrivenHero = () => {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setLoaded(true), 100);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <section className="landing-signal-hero relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <HueField blobs={[{ hue: "violet", size: 720, top: "4%", left: "-10%", opacity: 0.4 }, { hue: "sky", size: 640, top: "28%", left: "34%", opacity: 0.35 }]} />
      </div>

      <div className="flex min-h-screen items-center justify-center overflow-hidden pb-12 pt-28">
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
            <div className="simple-signal-flow">
              <div className="signal-source-column">
                {SOURCES.map((source) => {
                  const Icon = source.icon;
                  return (
                    <article key={source.title} className="simple-source-card">
                      <Icon className="h-5 w-5" />
                      <h2>{source.title}</h2>
                    </article>
                  );
                })}
              </div>

              <div className="simple-flow-line" aria-hidden="true">
                <span className="simple-flow-particle" />
              </div>

              <article className="simple-intelligence-core">
                <span className="simple-core-pulse" aria-hidden="true" />
                <span className="simple-core-mark">V</span>
                <p>Ventus</p>
                <h2>Intelligence</h2>
              </article>

              <div className="simple-flow-line" aria-hidden="true">
                <span className="simple-flow-particle simple-flow-particle-late" />
              </div>

              <article className="simple-outcome-card">
                <Sparkles className="h-5 w-5" />
                <p>Personalized</p>
                <h2>Outcomes</h2>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScrollDrivenHero;
