import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import StepFlow from "@/components/solutions/StepFlow";
import SolutionsCTA from "@/components/solutions/SolutionsCTA";
import CampaignStudioPreview from "@/components/solutions/CampaignStudioPreview";
import { useSectionReveal, revealStyle } from "@/hooks/useSectionReveal";

const flowSteps = [
  { label: "Enrich", desc: "Every transaction enriched in real time" },
  { label: "Segment", desc: "Build micro-segments from signals" },
  { label: "Activate", desc: "Launch personalized campaigns at scale" },
];

const stats = [
  { value: "Segment of One", label: "Campaign precision" },
  { value: "Auto", label: "Generated briefs" },
  { value: "<200ms", label: "Time to surface an insight" },
];

const CampaignIntelligencePage = () => {
  const hero = useSectionReveal();
  const studio = useSectionReveal();
  const flow = useSectionReveal();
  const statsSection = useSectionReveal();

  return (
    <main className="bg-white min-h-screen">
      <SEO
        title="Segment of One Campaigns — Ventus AI"
        description="Build micro-segment campaigns from life events, behavioral signals, and financial intelligence."
        path="/solutions/campaign-intelligence"
      />

      {/* Hero */}
      <section ref={hero.ref} className="pt-40 sm:pt-40 pb-16 sm:pb-20 px-6 min-h-[80vh] sm:min-h-screen flex items-center">
        <div className="max-w-3xl mx-auto text-center">
          <p style={revealStyle(hero.visible, 0)} className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-4">
            CAMPAIGN INTELLIGENCE
          </p>
          <h1 style={revealStyle(hero.visible, 100)} className="font-bold text-gray-900 leading-tight mb-6 text-3xl sm:text-[56px]">
            Build campaigns for segments of one.
          </h1>
          <p style={revealStyle(hero.visible, 200)} className="text-gray-500 max-w-2xl mx-auto mb-8 leading-relaxed text-base sm:text-lg">
            Ventus turns enriched transaction signals into micro-segment campaigns — life events, spending habits, financial signals, and demographics — so every offer feels like it was built for that customer.
          </p>
          <div style={revealStyle(hero.visible, 300)}>
            <Link to="/contact">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">Schedule a Demo</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Campaign Studio mockup */}
      <section ref={studio.ref} className="bg-white px-6" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-7xl mx-auto" style={revealStyle(studio.visible, 0)}>
          <div className="mb-8" style={{ paddingTop: 48 }}>
            <h2 className="font-bold text-gray-900 text-3xl md:text-4xl leading-tight mb-2">
              A live view of the Campaign Studio.
            </h2>
            <p className="text-gray-500 text-base sm:text-[16px] leading-relaxed">
              Select signals, define the audience, and generate an AI campaign brief in seconds.
            </p>
          </div>

          <CampaignStudioPreview />
        </div>
      </section>

      {/* Flow steps */}
      <section ref={flow.ref} className="bg-white px-6" style={{ paddingTop: 48, paddingBottom: 48 }}>
        <div style={revealStyle(flow.visible, 0)}>
          <StepFlow steps={flowSteps} title="From signal to campaign." />
        </div>
      </section>

      {/* Stats */}
      <section ref={statsSection.ref} className="bg-white px-6" style={{ paddingTop: 80, paddingBottom: 80 }}>
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {stats.map((s, i) => {
            const isLong = s.value.length > 6;
            return (
              <div key={s.label} style={revealStyle(statsSection.visible, i * 100)}>
                <p className={`font-bold text-gray-900 whitespace-nowrap ${isLong ? "text-2xl sm:text-[32px]" : "text-3xl sm:text-[52px]"}`}>
                  {s.value}
                </p>
                <p className="text-gray-500 mt-1 text-sm sm:text-lg">{s.label}</p>
              </div>
            );
          })}
        </div>
      </section>

      <SolutionsCTA />
    </main>
  );
};

export default CampaignIntelligencePage;
