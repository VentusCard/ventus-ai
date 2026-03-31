import { useState } from "react";
import { Smartphone, Gift, Heart, Sparkles } from "lucide-react";
import type { DemoCustomer } from "@/lib/demoData";
import type { EnrichedTransaction } from "@/types/transaction";
import type { NodeReadiness, LocalExperiencesData, PersonalizedDealData, DetectedLifeEventResult } from "@/hooks/useDemoEnrichment";
import type { FinancialTip } from "@/lib/wellnessIntelligenceEngine";
import DemoEngagementView from "./DemoEngagementView";
import DemoRewardsView from "./DemoRewardsView";
import DemoWealthView from "./DemoWealthView";

type TabKey = "ux" | "rewards" | "relationship" | "ai";

interface Props {
  customer: DemoCustomer | null;
  enriched?: EnrichedTransaction[];
  localExperiences?: LocalExperiencesData;
  personalizedDeals?: PersonalizedDealData | null;
  detectedEvents?: DetectedLifeEventResult[];
  tip?: FinancialTip | null;
  nodeReadiness: NodeReadiness;
  engineReady: boolean;
  width: number;
  height: number;
  scaled?: boolean;
}

const TABS: { key: TabKey; label: string; icon: typeof Smartphone; nodeId: string }[] = [
  { key: "ux", label: "UX", icon: Smartphone, nodeId: "engagement" },
  { key: "rewards", label: "Rewards", icon: Gift, nodeId: "rewards" },
  { key: "relationship", label: "Relation", icon: Heart, nodeId: "wealth" },
  { key: "ai", label: "AI", icon: Sparkles, nodeId: "" },
];

export default function DemoPhoneMockup({ customer, enriched, localExperiences, personalizedDeals, detectedEvents, tip, nodeReadiness, engineReady, width, height, scaled }: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>("ux");

  const frameRadius = 28;
  const notchWidth = width * 0.35;
  const tabBarH = 44;
  const statusBarH = 20;
  const contentH = height - tabBarH - statusBarH - 8; // 8 for home indicator

  const renderContent = () => {
    if (!customer || !engineReady) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <Smartphone className="w-8 h-8 text-slate-300 mb-2" />
          <p className="text-[11px] text-slate-400 font-medium">
            {!customer ? "Select a customer" : "Processing…"}
          </p>
        </div>
      );
    }

    if (activeTab === "ai") {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center px-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
          </div>
          <p className="text-[12px] font-semibold text-slate-700 mb-1">AI Assistant</p>
          <p className="text-[10px] text-slate-400">Coming Soon</p>
        </div>
      );
    }

    // Scale down content inside phone
    return (
      <div className="w-full h-full overflow-y-auto overflow-x-hidden" style={{ fontSize: "8px" }}>
        <div style={{ transform: "scale(0.42)", transformOrigin: "top left", width: `${100 / 0.42}%` }}>
          {activeTab === "ux" && <DemoEngagementView customer={customer} enriched={enriched} tip={tip} />}
          {activeTab === "rewards" && (
            <DemoRewardsView
              customer={customer}
              enriched={enriched}
              precomputed={personalizedDeals}
              travelCity={localExperiences?.[customer.id]?.[0]?.destination}
            />
          )}
          {activeTab === "relationship" && (
            <DemoWealthView customer={customer} detectedEvents={detectedEvents ?? []} />
          )}
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative flex flex-col bg-black overflow-hidden"
      style={{
        width,
        height,
        borderRadius: frameRadius,
        boxShadow: "0 8px 40px rgba(0,0,0,0.18), 0 0 0 1px rgba(0,0,0,0.08)",
      }}
    >
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-black rounded-b-xl z-10" style={{ width: notchWidth, height: 14 }} />

      {/* Status bar */}
      <div className="flex items-center justify-between px-4 bg-white" style={{ height: statusBarH, paddingTop: 2 }}>
        <span className="text-[8px] font-semibold text-slate-800">9:41</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-1.5 rounded-sm border border-slate-600 relative">
            <div className="absolute inset-[1px] right-[2px] bg-slate-700 rounded-[1px]" />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white overflow-hidden" style={{ height: contentH }}>
        {renderContent()}
      </div>

      {/* Tab bar */}
      <div className="flex items-center justify-around bg-white border-t border-slate-200" style={{ height: tabBarH }}>
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          const nodeState = tab.nodeId ? nodeReadiness[tab.nodeId as keyof NodeReadiness] : undefined;
          const isReady = tab.key === "ai" || (engineReady && nodeState === "ready");

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex flex-col items-center gap-0.5 py-1 transition-colors"
              style={{ opacity: isReady ? 1 : 0.4 }}
            >
              <Icon className="w-4 h-4" style={{ color: isActive ? "#3b82f6" : "#94a3b8" }} />
              <span className="text-[8px] font-medium" style={{ color: isActive ? "#3b82f6" : "#94a3b8" }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Home indicator */}
      <div className="flex justify-center bg-white pb-1 pt-0.5">
        <div className="w-8 h-1 rounded-full bg-slate-300" />
      </div>
    </div>
  );
}
