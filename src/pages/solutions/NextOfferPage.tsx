import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import StepFlow from "@/components/solutions/StepFlow";
import SolutionsCTA from "@/components/solutions/SolutionsCTA";
import { useSectionReveal, revealStyle, slideRightStyle } from "@/hooks/useSectionReveal";

const offers = [
  { name: "Delta SkyMiles Card", desc: "matches your travel spend", tag: "Travel & Exploration", color: "#3B82F6" },
  { name: "Whole Foods 5% Back", desc: "3x weekly grocery visits", tag: "Food & Dining", color: "#22C55E" },
  { name: "REI Co-op Card", desc: "active lifestyle detected", tag: "Sports & Fitness", color: "#F59E0B" },
];

const stats = [
  { value: "3,000+", label: "Dynamic reward labels" },
  { value: "12", label: "Behavioral lifestyle categories" },
  { value: "<200ms", label: "Time to surface an offer" },
];

const flowSteps = [
  { label: "Detect", desc: "Analyze transaction patterns" },
  { label: "Match", desc: "Map to relevant offers" },
  { label: "Surface", desc: "Deliver via API" },
];

const NextOfferPage = () => {
  const hero = useSectionReveal();
  const proof = useSectionReveal();
  const flow = useSectionReveal();
  const statsSection = useSectionReveal();

  return (
    <main className="bg-white min-h-screen">
      {/* Hero */}
      <section ref={hero.ref} className="pt-40 pb-20 px-6 min-h-screen flex items-center">
        <div className="max-w-3xl mx-auto text-center">
          <p style={revealStyle(hero.visible, 0)} className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">Next Offer</p>
          <h1 style={{ ...revealStyle(hero.visible, 100), fontSize: 56 }} className="font-bold text-gray-900 leading-tight mb-6">
            Serve the right offer before they go looking.
          </h1>
          <p style={{ ...revealStyle(hero.visible, 200), fontSize: 18 }} className="text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
            Ventus detects purchase intent from spending patterns and lifestyle signals — surfacing personalized offers at exactly the moment a customer is ready to act.
          </p>
          <div style={revealStyle(hero.visible, 300)}>
            <Link to="/contact">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Schedule a Demo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Visual proof */}
      <section ref={proof.ref} className="bg-white px-6" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div style={revealStyle(proof.visible, 0)}>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">Example</p>
            <h2 className="font-bold text-gray-900 leading-tight mb-6" style={{ fontSize: 36 }}>
              A Frequent Traveler profile generates travel-specific offers automatically.
            </h2>
            <div className="space-y-3 text-gray-600" style={{ fontSize: 18 }}>
              <p>● 14 travel transactions detected across Delta, Marriott, Uber</p>
              <p>● Lifestyle pillar: Travel & Exploration — $1,338 spend</p>
              <p>● Offer surfaced: Delta SkyMiles Card — matched before customer searched</p>
            </div>
          </div>
          <div style={revealStyle(proof.visible, 100)}>
            <div
              className="rounded-xl p-6"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1px solid #E5E7EB",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}
            >
              <p className="text-xs font-mono text-gray-400 mb-4">
                cust_013 · <span className="text-blue-600 font-semibold">Frequent Traveler</span>
              </p>
              <div className="space-y-0">
                {offers.map((o, i) => (
                  <div key={o.name} style={slideRightStyle(proof.visible, 200 + i * 150)}>
                    <div className="rounded-lg p-4 flex items-start gap-3 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]" style={{ borderLeft: `3px solid ${o.color}` }}>
                      <div className="flex-1">
                        <p className="text-gray-900 text-sm font-semibold">{o.name}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{o.desc}</p>
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style={{ background: `${o.color}15`, color: o.color }}>{o.tag}</span>
                    </div>
                    {i < offers.length - 1 && <div className="border-b border-gray-200 mx-4" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flow steps */}
      <section ref={flow.ref} className="bg-white px-6" style={{ paddingTop: 48, paddingBottom: 48 }}>
        <div style={revealStyle(flow.visible, 0)}>
          <StepFlow steps={flowSteps} title="From transaction to offer in three steps." />
        </div>
      </section>

      {/* Stats */}
      <section ref={statsSection.ref} className="bg-white px-6" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
          {stats.map((s, i) => (
            <div key={s.label} style={revealStyle(statsSection.visible, i * 100)}>
              <p className="font-bold text-gray-900" style={{ fontSize: 64 }}>{s.value}</p>
              <p className="text-gray-500 mt-1" style={{ fontSize: 18 }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <SolutionsCTA />
    </main>
  );
};

export default NextOfferPage;
