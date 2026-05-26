import PlatformTabs from "@/components/PlatformTabs";
import ScrollReveal from "@/components/ScrollReveal";
import SEO from "@/components/SEO";

const Platform = () => {
  return (
    <div className="pt-28">
      <SEO
        title="Platform — Ventus AI Transaction Intelligence"
        description="Explore the Ventus AI platform: semantic enrichment, lifestyle pillars, life event detection, and personalization for banks and credit unions."
        path="/platform"
      />
      <ScrollReveal>
        <PlatformTabs />
      </ScrollReveal>
    </div>
  );
};

export default Platform;
