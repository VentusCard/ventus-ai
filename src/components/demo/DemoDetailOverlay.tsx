import { useState } from "react";
import { X, Sparkles, Gift, Users, Bot, Wifi, Battery } from "lucide-react";
import ConsumerAIChatView from "./ConsumerAIChatView";
import type { DemoCustomer } from "@/lib/demoData";
import type { DemoNodeType } from "./DemoNetworkDiagram";
import type { LocalExperiencesData, PersonalizedDealData, DetectedLifeEventResult, ApiPayloads } from "@/hooks/useDemoEnrichment";
import type { EnrichedTransaction } from "@/types/transaction";
import type { FinancialTip } from "@/lib/wellnessIntelligenceEngine";
import type { ModuleKey } from "@/types/demo";
import DemoWealthView from "./DemoWealthView";
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
  enabledModules?: Set<ModuleKey>;
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
  wealth: { title: "Personalized Banking Relationship", color: "#8b5cf6" },
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
  dealPersonalization: "deal-management",
  aiFinancialInsights: "customer-insights",
};

const CONSUMER_NODES = new Set<DemoNodeType>(["engagement", "rewards", "wealth"]);

type ConsumerTab = "ux" | "rewards" | "relationship" | "ai";

const NODE_TO_TAB: Record<string, ConsumerTab> = {
  engagement: "ux",
  rewards: "rewards",
  wealth: "relationship",
};

const CONSUMER_TABS: { key: ConsumerTab; label: string; icon: typeof Sparkles; color: string }[] = [
  { key: "ux", label: "UX", icon: Sparkles, color: "#f59e0b" },
  { key: "rewards", label: "Rewards", icon: Gift, color: "#22c55e" },
  { key: "relationship", label: "Relationship", icon: Users, color: "#8b5cf6" },
  { key: "ai", label: "AI", icon: Bot, color: "#3b82f6" },
];

const defaultPayloads: ApiPayloads = { classification: null, dealPersonalization: null, localExperiences: null, lifestyleSignals: null };

export default function DemoDetailOverlay({ node, customer, enriched, localExperiences, personalizedDeals, detectedEvents, apiPayloads, tip, onClose, enabledModules }: Props) {
  const { title, color } = NODE_TITLES[node];
  const isBankWide = BANK_WIDE_NODES.has(node);
  const isConsumer = CONSUMER_NODES.has(node);

  const [activeTab, setActiveTab] = useState<ConsumerTab>(NODE_TO_TAB[node] ?? "ux");

  const renderConsumerTabContent = () => {
    switch (activeTab) {
      case "ux":
        return <DemoEngagementView customer={customer} enriched={enriched} tip={tip} />;
      case "rewards": {
        const travelCity = localExperiences?.[customer.id]?.[0]?.destination;
        return (
          <DemoRewardsView
            customer={customer}
            enriched={enriched}
            precomputed={personalizedDeals}
            travelCity={travelCity}
          />
        );
      }
      case "relationship":
        return <DemoWealthView customer={customer} detectedEvents={detectedEvents ?? []} />;
      case "ai":
        return (
          <ConsumerAIChatView
            customer={customer}
            enriched={enriched}
            detectedEvents={detectedEvents}
            personalizedDeals={personalizedDeals}
          />
        );
    }
  };

  const renderConsumerOverlay = () => {
    const activeTabMeta = CONSUMER_TABS.find(t => t.key === activeTab)!;
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-y-auto">
        {/* iPad Frame */}
        <div className="w-full max-w-[820px] rounded-[20px] border-[12px] border-slate-300 bg-white shadow-2xl overflow-hidden flex flex-col" style={{ minHeight: "520px", maxHeight: "calc(100vh - 80px)" }}>
          {/* Camera dot */}
          <div className="flex justify-center pt-1.5 pb-0.5 bg-white">
            <div className="w-2 h-2 rounded-full bg-slate-300" />
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-5 py-1 bg-white text-[10px] text-slate-400 font-medium">
            <span>9:41 AM</span>
            <span className="font-semibold text-slate-600 text-[11px]">TCBY Bank</span>
            <div className="flex items-center gap-1.5">
              <Wifi className="w-3 h-3" />
              <Battery className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Content */}
          <div className={`flex-1 bg-white min-h-0 ${activeTab === 'ai' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
            {renderConsumerTabContent()}
          </div>

          {/* Bottom Tab Bar */}
          <div className="flex border-t border-slate-200 bg-slate-50/80 px-2">
            {CONSUMER_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className="flex-1 flex flex-col items-center gap-0.5 py-2.5 transition-all relative"
                >
                  <Icon className="w-4 h-4" style={{ color: isActive ? tab.color : "#94a3b8" }} />
                  <span className="text-[10px] font-semibold" style={{ color: isActive ? tab.color : "#94a3b8" }}>
                    {tab.label}
                  </span>
                  {isActive && (
                    <div className="absolute top-0 left-1/4 right-1/4 h-[2px] rounded-full" style={{ background: tab.color }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Home indicator */}
          <div className="flex justify-center py-2 bg-white">
            <div className="w-28 h-1 rounded-full bg-slate-300" />
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isConsumer) return renderConsumerOverlay();
    if (node === "wmCopilot") return <BankwideWMCopilotView />;
    if (isBankWide) return <AnalyticsContainer defaultTab={BANK_WIDE_TAB_MAP[node] as any} enabledModules={enabledModules} />;
    if (node === "engine") return <DemoEnrichmentTableView customer={customer} enriched={enriched} />;
    if (node === "profiling" || node === "predictive" || node === "phase") return <DemoPillarCodeView mode={node} customer={customer} enriched={enriched} apiPayloads={apiPayloads ?? defaultPayloads} />;
    return null;
  };

  return (
    <div className="tepilot-theme absolute inset-0 z-50 flex flex-col animate-fade-in" style={{ background: "rgba(255, 255, 255, 0.97)", backdropFilter: "blur(20px)" }}>
      {/* Header — hidden for bank-wide and consumer nodes */}
      {!isBankWide && !isConsumer && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}40` }} />
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <div className="flex items-center gap-2 ml-2">
              <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
                <span className="text-[8px] font-bold text-blue-600">{customer.profile.name.split(" ").map(w => w[0]).join("")}</span>
              </div>
              <span className="text-xs font-semibold text-blue-600">{customer.profile.name}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Close button for bank-wide and consumer nodes */}
      {(isBankWide || isConsumer) && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-[60] w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 bg-white/80 backdrop-blur-sm border border-slate-200 transition-colors shadow-sm"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Content */}
      <div className={`flex-1 ${isBankWide || isConsumer ? 'overflow-hidden' : 'overflow-y-auto px-6 pb-6 pt-2'}`}>
        {renderContent()}
      </div>
    </div>
  );
}
