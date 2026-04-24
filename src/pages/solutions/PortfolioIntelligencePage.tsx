import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import StepFlow from "@/components/solutions/StepFlow";
import SolutionsCTA from "@/components/solutions/SolutionsCTA";
import { useSectionReveal, revealStyle } from "@/hooks/useSectionReveal";

const headerStats = [
  { value: "22", label: "customers enriched" },
  { value: "218", label: "transactions analyzed" },
  { value: "$126k", label: "total spend tracked" },
  { value: "90%", label: "avg confidence" },
];

const pillarDistribution = [
  { name: "Travel & Exploration", pct: 26.9 },
  { name: "Financial & Aspirational", pct: 26.4 },
  { name: "Home & Living", pct: 15.4 },
  { name: "Family & Community", pct: 12.8 },
  { name: "Style & Beauty", pct: 11.9 },
];

const topMerchants = [
  { name: "Real Estate Attorney", spend: "$15,300" },
  { name: "Delta Air Lines", spend: "$8,860" },
  { name: "The Plaza Hotel", spend: "$8,500" },
  { name: "Home Depot", spend: "$7,847" },
  { name: "Marriott", spend: "$7,206" },
];

const segments = [
  { name: "Family-oriented", count: "4 customers" },
  { name: "Frequent Traveler", count: "3" },
  { name: "New Parent", count: "2" },
  { name: "Retired", count: "1" },
];

const flowSteps = [
  { label: "Enrich", desc: "Every transaction enriched in real time" },
  { label: "Aggregate", desc: "Intelligence surfaces at portfolio level" },
  { label: "Query", desc: "Available via API for your analytics stack" },
];

const stats = [
  { value: "50+", label: "Lifestyle dimensions" },
  { value: "20+", label: "Life events monitored" },
  { value: "Real-time", label: "Customer Intelligence updates" },
];

const PortfolioIntelligencePage = () => {
  const hero = useSectionReveal();
  const dashboard = useSectionReveal();
  const flow = useSectionReveal();
  const statsSection = useSectionReveal();

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section ref={hero.ref} className="pt-32 sm:pt-40 pb-16 sm:pb-20 px-6 min-h-[70vh] sm:min-h-screen flex items-center">
        <div className="max-w-3xl mx-auto text-center">
          <p style={revealStyle(hero.visible, 0)} className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">Customer Intelligence</p>
          <h1 style={revealStyle(hero.visible, 100)} className="font-bold text-gray-900 leading-tight mb-6 text-3xl sm:text-[56px]">
            Know what's happening across your customer base before anyone asks.
          </h1>
          <p style={revealStyle(hero.visible, 200)} className="text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed text-base sm:text-lg">
            Ventus surfaces aggregate intelligence across your entire customer base — lifestyle distribution, life event frequency, and spending patterns, all queryable via API.
          </p>
          <div style={revealStyle(hero.visible, 300)}>
            <Link to="/contact">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Schedule a Demo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live dashboard mockup */}
      <section ref={dashboard.ref} className="bg-white px-6" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-6xl mx-auto" style={revealStyle(dashboard.visible, 0)}>
          <div className="mb-8" style={{ paddingTop: 48 }}>
            <h2 className="font-bold text-gray-900 text-2xl sm:text-[32px] leading-tight mb-2">
              A live view of your Customer Intelligence layer.
            </h2>
            <p className="text-gray-500 text-base sm:text-[16px] leading-relaxed">
              Real-time aggregate intelligence, ready for your analytics stack.
            </p>
          </div>

          {/* Light dashboard card */}
          <div
            className="rounded-2xl p-6 sm:p-8 bg-white"
            style={{
              border: "1px solid #E5E7EB",
              boxShadow: "0 12px 40px rgba(15,23,42,0.06)",
            }}
          >
            {/* Header bar */}
            <div
              className="flex items-center justify-between mb-6 px-4 py-2.5 rounded-lg"
              style={{ backgroundColor: "#F3F4F6" }}
            >
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <p className="text-[11px] font-mono text-gray-700">Customer Intelligence · Live</p>
              </div>
              <p className="text-[10px] font-mono text-gray-500">Powered by Ventus</p>
            </div>

            {/* Top stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {headerStats.map((s, i) => (
                <div
                  key={s.label}
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    animation: dashboard.visible ? "fade-in 0.5s ease-out both" : "none",
                    animationDelay: `${i * 80}ms`,
                  }}
                >
                  <p className="text-2xl sm:text-[28px] font-bold text-gray-900 leading-tight">{s.value}</p>
                  <p className="text-[11px] text-gray-500 mt-1 leading-snug">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Three side-by-side panels */}
            <div className="grid md:grid-cols-3 gap-5">
              {/* Lifestyle pillar distribution */}
              <div
                className="rounded-lg bg-white overflow-hidden"
                style={{ border: "1px solid #E5E7EB" }}
              >
                <div className="px-5 py-3" style={{ backgroundColor: "#F3F4F6" }}>
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-blue-600">
                    Lifestyle Pillar Distribution
                  </p>
                </div>
                <div className="p-5 space-y-3">
                  {pillarDistribution.map((p, i) => (
                    <div key={p.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[11px] text-gray-700 font-medium">{p.name}</p>
                        <p className="text-[11px] font-mono font-semibold text-gray-900">{p.pct}%</p>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: "#F3F4F6" }}>
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: dashboard.visible ? `${(p.pct / 30) * 100}%` : "0%",
                            backgroundColor: "#3B82F6",
                            transition: `width 800ms cubic-bezier(0.4,0,0.2,1) ${i * 100}ms`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top merchants */}
              <div
                className="rounded-lg bg-white overflow-hidden"
                style={{ border: "1px solid #E5E7EB" }}
              >
                <div className="px-5 py-3" style={{ backgroundColor: "#F3F4F6" }}>
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-blue-600">
                    Top Merchants by Spend
                  </p>
                </div>
                <div className="p-5 space-y-2.5">
                  {topMerchants.map((m, i) => (
                    <div
                      key={m.name}
                      className="flex items-center justify-between py-1.5"
                      style={{
                        borderBottom: i < topMerchants.length - 1 ? "1px solid #F3F4F6" : "none",
                        animation: dashboard.visible ? "fade-in 0.4s ease-out both" : "none",
                        animationDelay: `${300 + i * 70}ms`,
                      }}
                    >
                      <p className="text-[12px] text-gray-700 font-medium truncate">{m.name}</p>
                      <p className="text-[12px] font-mono font-semibold text-gray-900 flex-shrink-0 ml-2">{m.spend}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Customer segments */}
              <div
                className="rounded-lg bg-white overflow-hidden"
                style={{ border: "1px solid #E5E7EB" }}
              >
                <div className="px-5 py-3" style={{ backgroundColor: "#F3F4F6" }}>
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-blue-600">
                    Customer Segments
                  </p>
                </div>
                <div className="p-5 flex flex-wrap gap-2">
                  {segments.map((s, i) => (
                    <div
                      key={s.name}
                      className="rounded-full px-3 py-1.5 flex items-center gap-2"
                      style={{
                        backgroundColor: "#EFF6FF",
                        border: "1px solid #BFDBFE",
                        animation: dashboard.visible ? "fade-in 0.4s ease-out both" : "none",
                        animationDelay: `${500 + i * 80}ms`,
                      }}
                    >
                      <p className="text-[11px] font-semibold text-gray-900">{s.name}</p>
                      <p className="text-[10px] text-gray-500 font-mono">{s.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flow steps */}
      <section ref={flow.ref} className="bg-white px-6" style={{ paddingTop: 48, paddingBottom: 48 }}>
        <div style={revealStyle(flow.visible, 0)}>
          <StepFlow steps={flowSteps} title="From transaction to Portfolio Intelligence." />
        </div>
      </section>

      {/* Stats */}
      <section ref={statsSection.ref} className="bg-white px-6" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={s.label} style={revealStyle(statsSection.visible, i * 100)}>
              <p className="font-bold text-gray-900 text-3xl sm:text-[52px]">{s.value}</p>
              <p className="text-gray-500 mt-1 text-sm sm:text-lg">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <SolutionsCTA />
    </main>
  );
};

export default PortfolioIntelligencePage;
