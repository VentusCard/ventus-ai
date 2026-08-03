import PlatformTabs from "@/components/PlatformTabs";
import ScrollReveal from "@/components/ScrollReveal";
import SEO from "@/components/SEO";
import { breadcrumbSchema, softwareApplicationSchema } from "@/lib/seoSchema";

const Platform = () => {
  return (
    <div className="pt-28">
      <SEO
        title="Platform — Transaction Enrichment & Behavioral Intelligence"
        description="Explore the Ventus AI platform: semantic transaction enrichment, lifestyle pillars, life event detection, financial signals, and personalization for banks and credit unions."
        path="/platform"
        keywords="transaction enrichment platform, behavioral intelligence engine, lifestyle pillars, life event detection, banking personalization API"
        jsonLd={[softwareApplicationSchema, breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Platform", path: "/platform" }])]}
      />
      <ScrollReveal>
        <PlatformTabs />
      </ScrollReveal>
    </div>
  );
};

export default Platform;
