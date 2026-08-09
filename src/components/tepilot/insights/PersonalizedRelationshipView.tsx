import { Users, Gem, MessagesSquare, Briefcase } from "lucide-react";
import { TabHeader } from "./TabHeader";
import { RelationshipIntelligenceView } from "./RelationshipIntelligenceView";
import { AIAssistantActivityView } from "./AIAssistantActivityView";
import { BankwideWMCopilotView } from "./BankwideWMCopilotView";
import { cn } from "@/lib/utils";
import type { ClientProfileData } from "@/types/clientProfile";
import type { AIInsights } from "@/types/lifestyle-signals";
import type { TabValue } from "./AnalyticsContainer";

interface SectionProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  children: React.ReactNode;
  className?: string;
}

function Section({ icon, label, description, children, className }: SectionProps) {
  return (
    <section className={cn("border border-slate-200 rounded-lg bg-white overflow-hidden", className)}>
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/60">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-sm font-semibold text-slate-900">{label}</h2>
        </div>
        <p className="text-[11px] text-slate-500 mt-0.5 ml-6">{description}</p>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

interface PersonalizedRelationshipViewProps {
  userDemographics?: ClientProfileData | null;
  lifestyleSignals?: AIInsights | null;
  onNavigate?: (tab: TabValue) => void;
}

export function PersonalizedRelationshipView({
  userDemographics,
  lifestyleSignals,
  onNavigate,
}: PersonalizedRelationshipViewProps) {
  return (
    <div className="space-y-5">
      <TabHeader
        icon={<Users className="w-4 h-4" />}
        title="Personalized Relationship"
        subtitle="Relationship signals, assistant conversations, and the AI coworker in one surface"
        howItWorks="Ventus enriches every transaction into relationship signals, surfaces what customers are asking the banking assistant, and delivers the same intelligence to advisors and leadership through an email-based AI coworker."
        whyItMatters="One coordinated view of every relationship touchpoint — so growth, protection, and outreach all run off the same behavioral evidence."
      />

      <Section
        icon={<Gem className="w-4 h-4 text-violet-500" />}
        label="Relationship Intelligence"
        description="Growth and protection signals across the customer portfolio."
      >
        <RelationshipIntelligenceView
          hideHeader
          userDemographics={userDemographics}
          lifestyleSignals={lifestyleSignals}
          onNavigate={onNavigate}
        />
      </Section>

      <Section
        icon={<MessagesSquare className="w-4 h-4 text-blue-500" />}
        label="AI Banking Assistant"
        description="What customers are asking — by volume, intent, and trend."
      >
        <AIAssistantActivityView hideHeader />
      </Section>

      <Section
        icon={<Briefcase className="w-4 h-4 text-emerald-500" />}
        label="WM Coworker"
        description="Email-based AI teammate for advisors and wealth leadership."
      >
        <BankwideWMCopilotView hideHeader />
      </Section>
    </div>
  );
}
