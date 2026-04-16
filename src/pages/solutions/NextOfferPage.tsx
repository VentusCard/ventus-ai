import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import ScrollReveal from "@/components/ScrollReveal";
import SolutionsIntegration from "@/components/solutions/SolutionsIntegration";
import SolutionsCTA from "@/components/solutions/SolutionsCTA";

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

const steps = [
  { num: "01", title: "Detect", desc: "Ventus analyzes transaction history to build lifestyle pillars and identify spending patterns across 12 behavioral categories." },
  { num: "02", title: "Match", desc: "Each lifestyle signal maps to relevant products, rewards, and offers from your existing catalog — automatically." },
  { num: "03", title: "Surface", desc: "Matched offers flow into your existing CRM, rewards engine, or customer app through our API — no infrastructure changes required." },
];

const NextOfferPage = () => (
  <main className="bg-white min-h-screen">
    {/* Hero */}
    <section className="pt-40 pb-20 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">Next Offer</p>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
          Serve the right offer before they go looking.
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed">
          Ventus detects purchase intent from spending patterns and lifestyle signals — surfacing personalized offers at exactly the moment a customer is ready to act.
        </p>
        <Link to="/contact">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">Schedule a Demo</Button>
        </Link>
      </div>
    </section>

    {/* How it works */}
    <section style={{ backgroundColor: "#F9FAFB" }} className="py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-12 text-center">
          From transaction to offer in three steps.
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((s) => (
            <div key={s.num}>
              <p className="text-5xl font-bold mb-3" style={{ color: "rgba(37,99,235,0.15)" }}>{s.num}</p>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Visual proof */}
    <section className="py-20 px-6">
      <ScrollReveal>
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">Example</p>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-6">
              A Frequent Traveler profile generates travel-specific offers automatically.
            </h2>
            <div className="space-y-3 text-sm text-gray-600">
              <p>● 14 travel transactions detected across Delta, Marriott, Uber</p>
              <p>● Lifestyle pillar: Travel & Exploration — $1,338 spend</p>
              <p>● Offer surfaced: Delta SkyMiles Card — matched before customer searched</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-mono text-gray-400 mb-4">
              cust_013 · <span className="text-blue-600 font-semibold">Frequent Traveler</span>
            </p>
            <div className="space-y-0">
              {offers.map((o, i) => (
                <div key={o.name}>
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
      </ScrollReveal>
    </section>

    {/* Stats */}
    <section style={{ backgroundColor: "#F9FAFB" }} className="py-16 px-6">
      <div className="max-w-4xl mx-auto grid grid-cols-3 gap-8 text-center">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="text-3xl md:text-4xl font-bold text-gray-900">{s.value}</p>
            <p className="text-sm text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </section>

    <SolutionsIntegration />
    <SolutionsCTA />
  </main>
);

export default NextOfferPage;
