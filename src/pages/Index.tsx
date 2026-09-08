import SEO from "@/components/SEO";
import { faqSchema, softwareApplicationSchema } from "@/lib/seoSchema";
import HeroSection from "@/components/home/HeroSection";
import OutcomesSection from "@/components/home/OutcomesSection";
import SignalWallSection from "@/components/home/SignalWallSection";
import OneCustomerSection from "@/components/home/OneCustomerSection";
import AutomatedFlowsSection from "@/components/home/AutomatedFlowsSection";
import CoworkerSection from "@/components/home/CoworkerSection";
import GovernanceSection from "@/components/GovernanceSection";
import IntegrationSection from "@/components/IntegrationSection";
import HomeFAQSection from "@/components/home/HomeFAQSection";
import CTA from "@/components/CTA";
import { COMPANY_FAQS } from "@/lib/faqContent";

const Index = ({ noindex = false }: { noindex?: boolean }) => {
  return (
    <div>
      <SEO
        title="Ventus AI: Customer Intelligence & Personalization for Banks"
        description="Customer intelligence and personalization engine for banks. Named behavioral, life-event, financial, demographic, and risk signals routed into the systems you already run."
        path={noindex ? "/classic" : "/"}
        noindex={noindex}
        keywords="customer intelligence for banks, personalization engine for financial institutions, behavioral signals, life event detection banking, next best product banking, automated flows, bank personalization governance"
        jsonLd={noindex ? undefined : [softwareApplicationSchema, faqSchema(COMPANY_FAQS)]}
      />
      <main className="flex flex-col">
        <HeroSection />
        <OutcomesSection />
        <SignalWallSection />
        <OneCustomerSection />
        <AutomatedFlowsSection />
        <CoworkerSection />
        <GovernanceSection />
        <IntegrationSection />
        <HomeFAQSection />
        <CTA />
      </main>
    </div>
  );
};

export default Index;
