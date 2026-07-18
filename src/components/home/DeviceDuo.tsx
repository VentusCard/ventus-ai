import { useEffect, useRef, useState } from "react";
import ScrollReveal from "@/components/ScrollReveal";
import { Bell } from "lucide-react";
import ventusLogoBlue from "@/assets/ventus-logo-blue.png";

// One play landing in the workflow — shown on a PC dashboard and a phone
// notification, side by side. Minimal captions; the devices carry the story.

const bookRows = [
  { seg: "College-bound families", lift: "+32%", n: "12,408" },
  { seg: "New parents", lift: "+28%", n: "8,119" },
  { seg: "Frequent travelers", lift: "+18%", n: "21,932" },
  { seg: "Pre-retirees", lift: "+14%", n: "5,677" },
];

const DeviceDuo = () => {
  const [ping, setPing] = useState(false);
  const [reduced, setReduced] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && !reduced && setPing(true)),
      { threshold: 0.4 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [reduced]);

  return (
    <section ref={ref} className="v2-rule-t w-full relative z-10" style={{ paddingTop: 104, paddingBottom: 104, backgroundColor: "var(--v2-paper)" }}>
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <ScrollReveal>
          <div className="max-w-2xl mb-16">
            <p className="v2-label mb-4">In the workflow</p>
            <h2 className="v2-display text-3xl md:text-5xl">
              The play lands where your team already works.
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.65fr)] gap-12 lg:gap-16 items-center">
          {/* PC screen — book-wide dashboard */}
          <ScrollReveal>
            <div className="rounded-2xl border bg-white overflow-hidden shadow-[0_20px_60px_rgba(15,23,42,0.12)]" style={{ borderColor: "var(--v2-rule)" }}>
              <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "var(--v2-rule)", backgroundColor: "var(--v2-paper-raised)" }}>
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
                <span className="ml-3 v2-mono text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>
                  ventus · book-wide view
                </span>
              </div>
              <div className="p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="v2-mono text-[10px] uppercase tracking-wider" style={{ color: "var(--v2-ink-faint)" }}>incremental lift by segment</p>
                    <p className="v2-display text-2xl mt-1">This quarter</p>
                  </div>
                  <span className="v2-chip-amber">illustrative</span>
                </div>
                <div className="space-y-4">
                  {bookRows.map((r) => (
                    <div key={r.seg}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[13px] font-semibold text-gray-900">{r.seg}</span>
                        <span className="v2-mono text-[11px]" style={{ color: "var(--v2-ink-soft)" }}>
                          <span className="font-bold" style={{ color: "var(--v2-green)" }}>{r.lift}</span> · {r.n} customers
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: ping || reduced ? r.lift.replace("+", "") : "0%",
                            background: "var(--v2-green)",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Phone — advisor notification */}
          <ScrollReveal delay={0.15}>
            <div className="mx-auto w-full max-w-[300px]">
              <div className="rounded-[36px] border-[10px] bg-white shadow-2xl overflow-hidden" style={{ borderColor: "#1f2937" }}>
                {/* notch */}
                <div className="flex justify-center pt-2 pb-1 bg-white">
                  <span className="w-20 h-4 rounded-full bg-gray-900" />
                </div>
                <div className="px-4 pb-8 pt-2 min-h-[420px] bg-gray-50">
                  <div className="flex items-center justify-between mb-4 px-1">
                    <img src={ventusLogoBlue} alt="Ventus" className="h-4 w-auto" />
                    <span className="v2-mono text-[9px] text-gray-400">9:41</span>
                  </div>
                  {/* notification card */}
                  <div
                    className="rounded-2xl bg-white border border-gray-200 shadow-lg p-4 transition-all duration-700"
                    style={{
                      transform: ping || reduced ? "translateY(0)" : "translateY(-12px)",
                      opacity: ping || reduced ? 1 : 0,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-md text-white" style={{ background: "var(--v2-green)" }}>
                        <Bell className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-[11px] font-bold text-gray-900">Growth Play</span>
                      <span className="ml-auto text-[9px] text-gray-400">now</span>
                    </div>
                    <p className="text-[13px] font-semibold text-gray-900 leading-snug">
                      Sarah M. is college-bound — 91%
                    </p>
                    <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                      $3,000+ in test-prep &amp; app fees. 529 outreach is queued under policy.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <span className="flex-1 text-center text-[11px] font-bold text-white rounded-lg py-2" style={{ background: "var(--v2-green)" }}>
                        Open briefing
                      </span>
                    </div>
                  </div>
                  {/* second, quieter card */}
                  <div className="mt-3 rounded-2xl bg-white/70 border border-gray-100 p-3 opacity-60">
                    <p className="text-[11px] font-semibold text-gray-700">Holdout reserved — 10%</p>
                    <p className="text-[10px] text-gray-400">control cohort untouched</p>
                  </div>
                </div>
              </div>
              <p className="v2-mono mt-5 text-center text-[10px]" style={{ color: "var(--v2-ink-faint)" }}>
                advisor notified in-app · action stays governed
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
};

export default DeviceDuo;
