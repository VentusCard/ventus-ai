import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import StepFlow from "@/components/solutions/StepFlow";
import SolutionsCTA from "@/components/solutions/SolutionsCTA";
import { useSectionReveal, revealStyle, slideRightStyle } from "@/hooks/useSectionReveal";

const dealCards = [
  {
    brand: "Away Luggage",
    discount: "15% Off",
    quote: "Find your perfect travel companion",
    reason: "Customer travels monthly, no luggage spend detected",
    cta: "Shop Away",
  },
  {
    brand: "Bose",
    discount: "10% Off",
    quote: "Make every flight disappear",
    reason: "Frequent flyer with no headphone spend",
    cta: "Tune In",
  },
  {
    brand: "Delta SkyMiles Card",
    discount: "Bonus miles",
    quote: "Earn on every flight you already take",
    reason: "8 Delta purchases in 12 months",
    cta: "Apply Now",
  },
  {
    brand: "Allbirds",
    discount: "20% Off",
    quote: "Comfort from gate to gate",
    reason: "Active lifestyle, travel-ready footwear gap detected",
    cta: "Walk Lighter",
  },
  {
    brand: "Calm",
    discount: "3 months free",
    quote: "Your pre-flight ritual",
    reason: "Regular traveler, no wellness app spend",
    cta: "Start Calm",
  },
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
      <section ref={hero.ref} className="pt-32 sm:pt-40 pb-16 sm:pb-20 px-6 min-h-[70vh] sm:min-h-screen flex items-center">
        <div className="max-w-3xl mx-auto text-center">
          <p style={revealStyle(hero.visible, 0)} className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">Next Offer</p>
          <h1 style={revealStyle(hero.visible, 100)} className="font-bold text-gray-900 leading-tight mb-6 text-3xl sm:text-[56px]">
            Serve the right offer before they go looking.
          </h1>
          <p style={revealStyle(hero.visible, 200)} className="text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed text-base sm:text-lg">
            Ventus detects purchase intent from spending patterns and lifestyle signals — surfacing personalized offers at exactly the moment a customer is ready to act.
          </p>
          <div style={revealStyle(hero.visible, 300)}>
            <Link to="/contact">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Schedule a Demo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Visual proof — richer demo-style layout */}
      <section ref={proof.ref} className="bg-white px-6" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-6xl mx-auto" style={revealStyle(proof.visible, 0)}>
          {/* Persona header */}
          <div
            className="rounded-xl bg-white p-6 mb-6"
            style={{ border: "1px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
          >
            <p className="text-xs font-mono text-gray-400 mb-3">
              cust_013 · <span className="text-blue-600 font-semibold">Frequent Traveler</span>
            </p>
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                Weekly Boutique Fitness & Training · 31 txns · $4.0k
              </span>
              <span className="text-xs font-medium px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 border border-gray-200">
                Monthly Travel · 14 txns · $1,338
              </span>
            </div>
            {/* Shopping pattern analysis */}
            <div className="rounded-lg bg-gray-50 p-4 border border-gray-200">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-500 mb-2">Shopping Pattern</p>
              <p className="text-sm text-gray-700 leading-relaxed">
                Top spot: <span className="font-semibold text-gray-900">DELTA AIR LINES</span> (8 of 14) · Cadence: every ~26 days · Active: Jan 2025 – Present · Lifetime: <span className="font-semibold text-gray-900">$1,338</span> · avg $428/trip
              </p>
            </div>
          </div>

          {/* Behavioral Based Deal Collection */}
          <div className="flex items-center gap-3 mb-5">
            <h3 className="text-lg font-bold text-gray-900">Behavioral Based Deal Collection</h3>
            <span className="text-xs font-semibold px-3 py-1 rounded-full" style={{ background: "#22C55E15", color: "#15803D" }}>
              Frequent Traveler
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {dealCards.map((d, i) => (
              <div
                key={d.brand}
                className="rounded-xl bg-white p-4 flex flex-col"
                style={{
                  ...slideRightStyle(proof.visible, 100 + i * 100),
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.04)",
                }}
              >
                <p className="text-sm font-bold text-gray-900 leading-snug mb-2">{d.brand}</p>
                <span className="self-start text-[11px] font-semibold px-2 py-0.5 rounded-full mb-3" style={{ background: "#22C55E15", color: "#15803D" }}>
                  {d.discount}
                </span>
                <p className="text-sm italic text-gray-700 leading-snug mb-3">"{d.quote}"</p>
                <p className="text-[11px] text-gray-500 leading-snug mb-4 flex-1">{d.reason}</p>
                <button
                  className="text-xs font-semibold text-white px-3 py-2 rounded-lg transition-colors w-full"
                  style={{ backgroundColor: "#16A34A" }}
                >
                  {d.cta} →
                </button>
              </div>
            ))}
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

export default NextOfferPage;
