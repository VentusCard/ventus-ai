import { X } from "lucide-react";
import type { DemoCustomer } from "@/lib/demoData";
import type { DemoNodeType } from "./DemoNetworkDiagram";
import type { LocalExperiencesData, PersonalizedDealData, DetectedLifeEventResult, ApiPayloads } from "@/hooks/useDemoEnrichment";
import type { EnrichedTransaction } from "@/types/transaction";
import type { FinancialTip } from "@/lib/wellnessIntelligenceEngine";
import DemoRewardsView from "./DemoRewardsView";
import DemoEngagementView from "./DemoEngagementView";
import DemoTravelView from "./DemoTravelView";
import DemoLifeEventsView from "./DemoLifeEventsView";
import DemoFinancialJourneyView from "./DemoFinancialJourneyView";
import DemoEngineProfileView from "./DemoEngineProfileView";
import DemoPillarCodeView from "./DemoPillarCodeView";
import DemoEnrichmentTableView from "./DemoEnrichmentTableView";
import { AnalyticsContainer } from "@/components/tepilot/insights/AnalyticsContainer";
import { BankwideWMCopilotView } from "@/components/tepilot/insights/BankwideWMCopilotView";

interface Props {
  node: DemoNodeType;
  customer: DemoCustomer;
  enriched?: EnrichedTransaction[];
  localExperiences?: LocalExperiencesData;
  personalizedDeals?: PersonalizedDealData | null;
  detectedEvents?: DetectedLifeEventResult[];
  apiPayloads?: ApiPayloads;
  tip?: FinancialTip | null;
  onClose: () => void;
}

const NODE_TITLES: Record<DemoNodeType, { title: string; color: string }> = {
  engagement: { title: "Personalized UX", color: "#f59e0b" },
  analytics: { title: "Behavioral Analytics", color: "#3b82f6" },
  outflow: { title: "Outflow Analysis", color: "#1d4ed8" },
  rewards: { title: "Consumer Rewards", color: "#22c55e" },
  travel: { title: "Reward Intelligence", color: "#06b6d4" },
  locational: { title: "Locational Experience", color: "#0891b2" },
  lifeEvents: { title: "Financial Journey — Next Best Product", color: "#ec4899" },
  lifeEventIntel: { title: "Life Event Intelligence", color: "#ec4899" },
  wealth: { title: "Wealth Management", color: "#8b5cf6" },
  engine: { title: "Ventus AI Engine — Enrichment Output", color: "#6366f1" },
  profiling: { title: "Profiling — Pillar Summary", color: "#3b82f6" },
  predictive: { title: "Predictive — Personalization + Travel", color: "#22c55e" },
  phase: { title: "Phase — Life Event Detection", color: "#a855f7" },
  wmCopilot: { title: "Wealth Management CoPilot", color: "#7c3aed" },
  aiFinancialInsights: { title: "AI Financial Insights", color: "#2563eb" },
  dealPersonalization: { title: "Deal Personalization", color: "#16a34a" },
};

const BANK_WIDE_NODES = new Set<DemoNodeType>(["analytics", "travel", "lifeEvents", "outflow", "locational", "lifeEventIntel", "wmCopilot", "aiFinancialInsights", "dealPersonalization"]);

const BANK_WIDE_TAB_MAP: Partial<Record<DemoNodeType, string>> = {
  analytics: "dashboard",
  outflow: "wallet-share",
  travel: "rewards-intelligence",
  locational: "location-experience",
  lifeEventIntel: "life-events",
  lifeEvents: "targeting",
};

const defaultPayloads: ApiPayloads = { classification: null, dealPersonalization: null, localExperiences: null, lifestyleSignals: null };

export default function DemoDetailOverlay({ node, customer, enriched, localExperiences, personalizedDeals, detectedEvents, apiPayloads, tip, onClose }: Props) {
  const { title, color } = NODE_TITLES[node];

  const isBankWide = BANK_WIDE_NODES.has(node);

  const renderContent = () => {
    if (node === "wmCopilot") {
      return <BankwideWMCopilotView />;
    }
    if (isBankWide) {
      return <AnalyticsContainer defaultTab={BANK_WIDE_TAB_MAP[node] as any} />;
    }
    if (node === "engine") {
      return <DemoEnrichmentTableView customer={customer} enriched={enriched} />;
    }
    if (node === "profiling" || node === "predictive" || node === "phase") {
      return <DemoPillarCodeView mode={node} customer={customer} enriched={enriched} apiPayloads={apiPayloads ?? defaultPayloads} />;
    }
    if (node === "engagement") {
      return <DemoEngagementView customer={customer} enriched={enriched} tip={tip} />;
    }
    if (node === "rewards") {
      return (
        <DemoRewardsView
          customer={customer}
          enriched={enriched}
          precomputed={personalizedDeals}
        />
      );
    }
    if (node === "wealth") {
      return (
        <DemoFinancialJourneyView
          customer={customer}
          detectedEvents={detectedEvents ?? []}
        />
      );
    }
    return null;
  };

  return (
    <div className="tepilot-theme absolute inset-0 z-50 flex flex-col animate-fade-in" style={{ background: "rgba(255, 255, 255, 0.97)", backdropFilter: "blur(20px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}40` }} />
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          {!isBankWide && (
            <div className="flex items-center gap-2 ml-2">
              <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                <span className="text-[8px] font-bold text-blue-600">{customer.profile.name.split(" ").map(w => w[0]).join("")}</span>
              </div>
              <span className="text-xs font-semibold text-blue-600">{customer.profile.name}</span>
            </div>
          )}
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${isBankWide ? '' : 'px-6 pb-6 pt-2'}`}>
        {renderContent()}
      </div>
    </div>
  );
}
