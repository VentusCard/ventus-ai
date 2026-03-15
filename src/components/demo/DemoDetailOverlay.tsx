import { X } from "lucide-react";
import type { DemoCustomer } from "@/lib/demoData";
import type { DemoNodeType } from "./DemoNetworkDiagram";
import type { LocalExperiencesData, PersonalizedDealData } from "@/hooks/useDemoEnrichment";
import type { EnrichedTransaction } from "@/types/transaction";
import DemoAnalyticsView from "./DemoAnalyticsView";
import DemoRewardsView from "./DemoRewardsView";
import DemoEngagementView from "./DemoEngagementView";
import DemoTravelView from "./DemoTravelView";
import DemoWealthView from "./DemoWealthView";
import DemoLifeEventsView from "./DemoLifeEventsView";
import DemoEngineProfileView from "./DemoEngineProfileView";

interface Props {
  node: DemoNodeType;
  customerA: DemoCustomer;
  customerB: DemoCustomer;
  enrichedA?: EnrichedTransaction[];
  enrichedB?: EnrichedTransaction[];
  localExperiences?: LocalExperiencesData;
  personalizedDealsA?: PersonalizedDealData | null;
  personalizedDealsB?: PersonalizedDealData | null;
  onClose: () => void;
}

const NODE_TITLES: Record<DemoNodeType, { title: string; color: string }> = {
  engagement: { title: "Personalized UX", color: "#f59e0b" },
  analytics: { title: "Bank-Wide Analytics", color: "#3b82f6" },
  rewards: { title: "Consumer Rewards", color: "#22c55e" },
  travel: { title: "Travel Experiences", color: "#06b6d4" },
  lifeEvents: { title: "Life Event Detection Dashboard", color: "#ec4899" },
  wealth: { title: "Wealth Management Copilot", color: "#a855f7" },
  engine: { title: "Deep Customer Intelligence Profile", color: "#6366f1" },
};

const SIMPLE_VIEW_MAP: Record<string, React.FC<{ customerA: DemoCustomer; customerB: DemoCustomer }>> = {
  analytics: DemoAnalyticsView,
  wealth: DemoWealthView,
  lifeEvents: DemoLifeEventsView,
};

export default function DemoDetailOverlay({ node, customerA, customerB, enrichedA, enrichedB, localExperiences, personalizedDealsA, personalizedDealsB, onClose }: Props) {
  const { title, color } = NODE_TITLES[node];

  const renderContent = () => {
    if (node === "engine") {
      return <DemoEngineProfileView customerA={customerA} customerB={customerB} enrichedA={enrichedA} enrichedB={enrichedB} />;
    }
    if (node === "engagement") {
      return <DemoEngagementView customerA={customerA} customerB={customerB} enrichedA={enrichedA} enrichedB={enrichedB} />;
    }
    if (node === "travel") {
      return (
        <DemoTravelView
          customerA={customerA}
          customerB={customerB}
          localExperiencesA={localExperiences?.[customerA.id]}
          localExperiencesB={localExperiences?.[customerB.id]}
        />
      );
    }
    if (node === "rewards") {
      return (
        <DemoRewardsView
          customerA={customerA}
          customerB={customerB}
          enrichedA={enrichedA}
          enrichedB={enrichedB}
          precomputedA={personalizedDealsA}
          precomputedB={personalizedDealsB}
        />
      );
    }
    const ViewComponent = SIMPLE_VIEW_MAP[node];
    if (ViewComponent) return <ViewComponent customerA={customerA} customerB={customerB} />;
    return null;
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col animate-fade-in" style={{ background: "rgba(255, 255, 255, 0.97)", backdropFilter: "blur(20px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}40` }} />
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <span className="text-[10px] text-slate-400 ml-2">Side-by-side comparison</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-2 gap-4 px-6 pt-3 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center">
            <span className="text-[8px] font-bold text-blue-600">{customerA.profile.name.split(" ").map(w => w[0]).join("")}</span>
          </div>
          <span className="text-xs font-semibold text-blue-600">{customerA.profile.name}</span>
          <span className="text-[9px] text-slate-400">· {customerA.lifestyleType}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
            <span className="text-[8px] font-bold text-emerald-600">{customerB.profile.name.split(" ").map(w => w[0]).join("")}</span>
          </div>
          <span className="text-xs font-semibold text-emerald-600">{customerB.profile.name}</span>
          <span className="text-[9px] text-slate-400">· {customerB.lifestyleType}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
        {renderContent()}
      </div>
    </div>
  );
}
