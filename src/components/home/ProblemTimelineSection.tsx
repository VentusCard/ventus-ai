import { useEffect, useRef, useState } from "react";

const QUARTERS = ["Q1", "Q2", "Q3", "Q4"];

const LIFE = [
  { label: "Pediatric and nursery activity begins", dot: "bg-amber-400" },
  { label: "Home-setup and storage spend clusters", dot: "bg-sky-400" },
  { label: "Auto loan approaches renewal", dot: "bg-emerald-400" },
  { label: "Retirement contributions steady every cycle", dot: "bg-violet-400" },
];

const BANK = [
  "Quarterly newsletter",
  "Balance transfer promotion",
  "Customer satisfaction survey",
  "Quarterly newsletter",
];

const BEAT_COPY = [
  "Over four quarters, four things changed for Morgan Ellis.",
  "Every one of them was visible in her account activity as it happened.",
  "Here is what her bank sent her over the same four quarters.",
  "Not one of them was a response to anything that actually happened.",
];

const ProblemTimelineSection = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setProgress(1);
      return;
    }
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const el = stageRef.current;
        if (!el) return;
        if (window.innerWidth < 1024) {
          setProgress(1);
          return;
        }
        const rect = el.getBoundingClientRect();
        const total = rect.height - window.innerHeight;
        if (total <= 0) {
          setProgress(1);
          return;
        }
        setProgress(Math.min(1, Math.max(0, -rect.top / total)));
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [reducedMotion]);

  const beat = progress < 0.25 ? 0 : progress < 0.5 ? 1 : progress < 0.75 ? 2 : 3;

  const lifeShown = (index: number) => beat >= 1 && (beat > 1 || progress > 0.27 + index * 0.05);
  const bankShown = (index: number) => beat >= 2 && (beat > 2 || progress > 0.52 + index * 0.05);
  const linesShown = beat >= 3;

  return (
    <section className="relative bg-white" aria-label="The problem">
      <div ref={stageRef} className="relative lg:h-[380vh]">
        <div className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:items-center">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 px-6 py-20 md:px-8 lg:grid-cols-[34fr_66fr] lg:gap-14 lg:py-0">
            {/* framing */}
            <div>
              <p className="text-[12px] font-bold uppercase tracking-widest text-blue-600">
                The problem
              </p>
              <h2 className="mt-4 text-3xl font-bold leading-[1.15] tracking-tight text-slate-900 md:text-[40px]">
                The moments that mattered were all in the account. Nobody read them.
              </h2>
              <p className="mt-5 max-w-md text-base leading-relaxed text-slate-600">
                Banks hold more behavioural data than almost any other business, and still market by
                the calendar.
              </p>
              <div className="relative mt-8 h-16">
                {BEAT_COPY.map((copy, index) => (
                  <p
                    key={copy}
                    className="absolute inset-x-0 top-0 text-[15px] font-medium text-slate-900 transition-opacity duration-500"
                    style={{ opacity: (reducedMotion ? 3 : beat) === index ? 1 : 0 }}
                  >
                    {copy}
                  </p>
                ))}
              </div>
            </div>

            {/* stage */}
            <div>
              {/* desktop / tablet horizontal timeline */}
              <div className="hidden md:block">
                <div className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Her life
                </div>
                <div className="grid grid-cols-4 items-end gap-3">
                  {LIFE.map((item, index) => (
                    <div
                      key={item.label}
                      className="rounded-xl border border-slate-200 bg-white px-3 py-3 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.6)] transition-all duration-500"
                      style={{
                        opacity: lifeShown(index) ? 1 : 0,
                        transform: lifeShown(index) ? "translateY(0)" : "translateY(10px)",
                      }}
                    >
                      <span className={`mb-2 block h-2 w-2 rounded-full ${item.dot}`} />
                      <span className="block text-[13px] font-medium leading-snug text-slate-900">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* mismatch lines above axis */}
                <div className="grid grid-cols-4 gap-3">
                  {QUARTERS.map((q, index) => (
                    <div key={`t-${q}`} className="flex justify-center">
                      <span
                        className="block w-px border-l border-dashed border-slate-300 transition-all duration-500"
                        style={{ height: 16, opacity: linesShown ? 1 : 0 }}
                      />
                    </div>
                  ))}
                </div>

                {/* axis */}
                <div className="relative my-1 border-t border-slate-200">
                  <div className="grid grid-cols-4 gap-3 pt-2">
                    {QUARTERS.map((q) => (
                      <span
                        key={q}
                        className="text-center font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400"
                      >
                        {q}
                      </span>
                    ))}
                  </div>
                </div>

                {/* mismatch lines below axis */}
                <div className="grid grid-cols-4 gap-3">
                  {QUARTERS.map((q) => (
                    <div key={`b-${q}`} className="flex justify-center">
                      <span
                        className="block w-px border-l border-dashed border-slate-300 transition-all duration-500"
                        style={{ height: 16, opacity: linesShown ? 1 : 0 }}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-4 items-start gap-3">
                  {BANK.map((item, index) => (
                    <div
                      key={`${item}-${index}`}
                      className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-3 transition-all duration-500"
                      style={{
                        opacity: bankShown(index) ? 1 : 0,
                        transform: bankShown(index) ? "translateY(0)" : "translateY(-10px)",
                      }}
                    >
                      <span className="block text-[13px] font-medium leading-snug text-slate-500">
                        {item}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                  What her bank sent
                </div>
              </div>

              {/* mobile vertical timeline */}
              <div className="md:hidden">
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    Her life
                  </span>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">
                    What her bank sent
                  </span>
                </div>
                <div className="flex flex-col gap-5">
                  {QUARTERS.map((q, index) => (
                    <div key={q}>
                      <span className="mb-2 block font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">
                        {q}
                      </span>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                          <span className={`mb-2 block h-2 w-2 rounded-full ${LIFE[index].dot}`} />
                          <span className="block text-[13px] font-medium leading-snug text-slate-900">
                            {LIFE[index].label}
                          </span>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-100 px-3 py-3">
                          <span className="block text-[13px] font-medium leading-snug text-slate-500">
                            {BANK[index]}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemTimelineSection;
