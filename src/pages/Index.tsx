import SEO from "@/components/SEO";
import { faqSchema, softwareApplicationSchema } from "@/lib/seoSchema";
import ScrollDrivenHero from "@/components/ScrollDrivenHero";
import IntegrationSection from "@/components/IntegrationSection";
import IntelligenceSection from "@/components/IntelligenceSection";
import GovernanceSection from "@/components/GovernanceSection";
import CTA from "@/components/CTA";
import ProblemStatementSection from "@/components/ProblemStatementSection";
import { COMPANY_FAQS } from "@/lib/faqContent";

const Index = ({ noindex = false }: { noindex?: boolean }) => {
  return (
    <div>
      <SEO
        title="Ventus AI — Behavioral Intelligence & Personalization for Banks"
        description="Customer intelligence and personalization system for banks — spending, financial, and life-event signals from multi-rail data and national partnerships."
        path={noindex ? "/classic" : "/"}
        noindex={noindex}
        keywords="behavioral intelligence, personalization engine for financial institutions, behavioral enrichment, multi-rail transaction data, life event detection banking, personalized rewards for banks, next best offer banking, card linked offer redemption, interchange growth"
        jsonLd={noindex ? undefined : [softwareApplicationSchema, faqSchema(COMPANY_FAQS)]}
      />
      <main className="flex flex-col">
        <ScrollDrivenHero />
        <ProblemStatementSection />
        <IntelligenceSection />
        <GovernanceSection />
        <IntegrationSection />
        <CTA />
      </main>
    </div>
  );
};

export default Index;
