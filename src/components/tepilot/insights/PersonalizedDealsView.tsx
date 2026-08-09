import { Sparkles, Package, Gamepad2 } from "lucide-react";
import { TabHeader } from "./TabHeader";
import { RewardsAnalyticsDashboard } from "./RewardsAnalyticsDashboard";
import { DealsAndPerksView } from "./DealsAndPerksView";
import { GamificationManagement } from "./GamificationManagement";
import { cn } from "@/lib/utils";

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

export function PersonalizedDealsView() {
  return (
    <div className="space-y-5">
      <TabHeader
        icon={<Sparkles className="w-4 h-4" />}
        title="Personalized Deals"
        subtitle="Intelligence, activation, and engagement for merchant and reward programs"
        howItWorks="Ventus connects seasonal deal intelligence, merchant partnership activation, and gamified engagement into one coordinated personalization surface."
        whyItMatters="Grows share-of-wallet by matching the right deal or perk to the right customer at the right time — then sustaining engagement with achievement-driven rewards."
      />

      <Section
        icon={<Sparkles className="w-4 h-4 text-violet-500" />}
        label="Next-Deal Intelligence"
        description="Seasonal spend curves, category gaps, and timing intelligence for merchant partnerships."
      >
        <RewardsAnalyticsDashboard />
      </Section>

      <Section
        icon={<Package className="w-4 h-4 text-blue-500" />}
        label="Deals & Perks"
        description="Active merchant discounts and geo-targeted location perks."
      >
        <DealsAndPerksView defaultTab="shopping" />
      </Section>

      <Section
        icon={<Gamepad2 className="w-4 h-4 text-emerald-500" />}
        label="Gamification"
        description="Achievement programs, badges, and engagement lift tracking."
      >
        <GamificationManagement />
      </Section>
    </div>
  );
}
