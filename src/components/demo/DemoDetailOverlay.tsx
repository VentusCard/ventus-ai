import { useState } from "react";
import { X, Sparkles, Gift, Users, Bot, Wifi, Battery, BarChart3 } from "lucide-react";
import ConsumerAIChatView, { type RiskFlag } from "./ConsumerAIChatView";
import type { DemoCustomer } from "@/lib/demoData";
import { getDemoBankConfig } from "@/lib/demoBankConfig";
import type { DemoNodeType } from "./DemoNetworkDiagram";
import { PILLAR_ROWS } from "./DemoNetworkDiagram";
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
import { AnalyticsContainer, type TabValue } from "@/components/tepilot/insights/AnalyticsContainer";
import { BankwideWMCopilotView } from "@/components/tepilot/insights/BankwideWMCopilotView";

interface Props {
  node: DemoNodeType;
  customer: DemoCustomer;
  enriched?: EnrichedTransaction[];
  localExperiences?: LocalExperiencesData;
  personalizedDeals?: PersonalizedDealData | null;
  detectedEvents?: DetectedLifeEventResult[];
  riskFlags?: { flags: RiskFlag[]; summary: string } | null;
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

const CARD_DESCRIPTIONS: Record<string, string> = {
  analytics: "Organizes spending into lifestyle categories like Dining, Fitness, and Travel — so the app feels like it truly knows the customer.",
  outflow: "Surfaces forgotten subscriptions and spending leaks, positioning your bank as a proactive financial guardian.",
  aiFinancialInsights: "Delivers timely, personalized money tips and alerts that make customers feel coached — not just served.",
  travel: "Anticipates what a customer needs next and delivers the right offer before they even search for it.",
  locational: "Identifies travel and surfaces local perks and experiences, positioning your bank as a travel and life companion.",
  dealPersonalization: "Matches offers to individual habits so every reward feels hand-picked — driving higher engagement and redemption.",
  lifeEventIntel: "Recognizes major life moments — a new home, a baby, retirement — so your bank can show up when it matters most.",
  lifeEvents: "Recommends the right financial product at the right life stage, turning routine banking into proactive guidance.",
  wmCopilot: "Arms relationship managers with AI-prepared context so every client conversation feels informed and personal.",
};

const BANK_WIDE_TAB_MAP: Partial<Record<DemoNodeType, TabValue>> = {
  analytics: "dashboard",
  outflow: "wallet-share",
  travel: "personalized-deals",
  locational: "personalized-deals",
  lifeEventIntel: "personalized-relationship",
  lifeEvents: "targeting",
  dealPersonalization: "personalized-deals",
  aiFinancialInsights: "personalized-relationship",
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

const TAB_ROW_INDEX: Record<ConsumerTab, number | null> = {
  ux: 0,
  rewards: 1,
  relationship: 2,
  ai: null,
};

const defaultPayloads: ApiPayloads = { classification: null, dealPersonalization: null, localExperiences: null, lifestyleSignals: null };

function FeatureCardSidebar({ activeTab }: { activeTab: ConsumerTab }) {
  const rowIdx = TAB_ROW_INDEX[activeTab];
  const isAI = activeTab === "ai";

  // For AI tab, collect all bank nodes from all rows with their colors
  const allNodes: { node: typeof PILLAR_ROWS[0]["bankNodes"][0]; color: string }[] = [];
  if (isAI) {
    PILLAR_ROWS.forEach((row) => {
      row.bankNodes.forEach((n) => allNodes.push({ node: n, color: row.color }));
    });
  }

  const bankNodes = !isAI && rowIdx !== null ? PILLAR_ROWS[rowIdx].bankNodes : [];
  const pillarColor = !isAI && rowIdx !== null ? PILLAR_ROWS[rowIdx].color : "#3b82f6";

  const cardPy = isAI ? "py-2.5" : "py-4";
  const cardGap = isAI ? "gap-2.5" : "gap-4";
  const iconSize = isAI ? "w-7 h-7" : "w-9 h-9";
  const iconInner = isAI ? "w-4 h-4" : "w-5 h-5";

  const renderCard = (id: string, label: string, Icon: React.ElementType, color: string) => (
    <div
      key={id}
      className={`group relative rounded-xl border-l-4 px-4 ${cardPy} flex items-center gap-3.5 cursor-default`}
      style={{
        borderColor: color,
        background: `linear-gradient(135deg, ${color}0F 0%, ${color}05 100%)`,
      }}
    >
      <div
        className={`${iconSize} rounded-lg flex items-center justify-center shrink-0`}
        style={{ background: `${color}1F` }}
      >
        <Icon className={iconInner} style={{ color }} />
      </div>
      <span className="text-sm font-semibold text-slate-700">{label}</span>
      {CARD_DESCRIPTIONS[id] && (
        <div className="absolute left-0 right-0 -bottom-1 translate-y-full z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200">
          <div className="bg-slate-800 text-white text-[11px] leading-snug rounded-lg px-3 py-2 shadow-lg mx-2">
            {CARD_DESCRIPTIONS[id]}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`flex flex-col justify-center ${cardGap} h-full px-4 ${isAI ? "overflow-y-auto" : ""}`}>
      {/* Section label */}
      <p className="text-xs font-semibold uppercase tracking-widest mb-1 text-secondary-foreground">
        {isAI ? "Full Context" : "Powering this Experience"}
      </p>

      {/* Core Analytics card — always shown */}
      {renderCard("core", "Core Customer Intelligence", BarChart3, "#3b82f6")}

      {/* AI tab: all bank nodes from all rows */}
      {isAI && allNodes.map(({ node, color }) => renderCard(node.id, node.label, node.icon, color))}

      {/* Non-AI tabs: tab-specific bank node cards */}
      {!isAI && bankNodes.map((node) => renderCard(node.id, node.label, node.icon, pillarColor))}
    </div>
  );
}

export default function DemoDetailOverlay({ node, customer, enriched, localExperiences, personalizedDeals, detectedEvents, riskFlags, apiPayloads, tip, onClose, enabledModules }: Props) {
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
            riskFlags={riskFlags}
          />
        );
    }
  };

  const renderConsumerOverlay = () => {
    return (
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* Left: Feature cards (~25% width) */}
        <div className="w-1/4 shrink-0 flex flex-col justify-center">
          <FeatureCardSidebar activeTab={activeTab} />
        </div>

        {/* Right: iPad Frame */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-[820px] rounded-[20px] border-[12px] border-slate-300 bg-white shadow-2xl overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 2rem)' }}>
            {/* Camera dot */}
            <div className="flex justify-center pt-1.5 pb-0.5 bg-white">
              <div className="w-2 h-2 rounded-full bg-slate-300" />
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between px-5 py-1 bg-white text-[10px] text-slate-400 font-medium">
              <span>9:41 AM</span>
              <div className="flex flex-col items-center">
                <span className="font-semibold text-slate-600 text-[11px]">{(() => { const c = getDemoBankConfig(); return c.mode === "custom" ? (c.bankShortName || c.bankName || "Our Bank") : "Our Bank"; })()}</span>
                {(activeTab === 'ai') && <span className="text-[8px] text-slate-400"></span>}
              </div>
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Content */}
            <div className={`flex-1 bg-white min-h-0 ${activeTab === 'ai' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
              {renderConsumerTabContent()}
            </div>

            {/* Bottom Tab Bar */}
            <div className="flex shrink-0 border-t border-slate-200 bg-slate-50/80 px-2">
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
            <div className="flex shrink-0 justify-center py-2 bg-white">
              <div className="w-28 h-1 rounded-full bg-slate-300" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (isConsumer) return renderConsumerOverlay();
    if (node === "wmCopilot") return <BankwideWMCopilotView />;
    if (isBankWide) return <AnalyticsContainer defaultTab={BANK_WIDE_TAB_MAP[node]} enabledModules={enabledModules} />;
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
      <div className={`flex-1 min-h-0 ${isBankWide || isConsumer ? 'overflow-hidden' : 'overflow-y-auto px-6 pb-6 pt-2'}`}>
        {renderContent()}
      </div>
    </div>
  );
}
