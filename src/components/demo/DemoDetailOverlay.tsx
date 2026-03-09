import { X } from "lucide-react";
import type { DemoCustomer } from "@/lib/demoData";
import type { DemoNodeType } from "./DemoNetworkDiagram";
import DemoAnalyticsView from "./DemoAnalyticsView";
import DemoRewardsView from "./DemoRewardsView";
import DemoEngagementView from "./DemoEngagementView";
import DemoTravelView from "./DemoTravelView";
import DemoWealthView from "./DemoWealthView";

interface Props {
  node: DemoNodeType;
  customerA: DemoCustomer;
  customerB: DemoCustomer;
  onClose: () => void;
}

const NODE_TITLES: Record<DemoNodeType, { title: string; color: string }> = {
  analytics: { title: "Bank-Wide Analytics", color: "#3b82f6" },
  rewards: { title: "Consumer Rewards", color: "#22c55e" },
  engagement: { title: "Customer Engagement", color: "#f59e0b" },
  travel: { title: "Travel Experience", color: "#06b6d4" },
  wealth: { title: "Wealth Management", color: "#a855f7" },
};

const VIEW_MAP: Record<DemoNodeType, React.FC<{ customerA: DemoCustomer; customerB: DemoCustomer }>> = {
  analytics: DemoAnalyticsView,
  rewards: DemoRewardsView,
  engagement: DemoEngagementView,
  travel: DemoTravelView,
  wealth: DemoWealthView,
};

export default function DemoDetailOverlay({ node, customerA, customerB, onClose }: Props) {
  const { title, color } = NODE_TITLES[node];
  const ViewComponent = VIEW_MAP[node];

  return (
    <div className="absolute inset-0 z-50 flex flex-col animate-fade-in" style={{ background: "rgba(5, 10, 25, 0.97)", backdropFilter: "blur(20px)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full" style={{ background: color, boxShadow: `0 0 10px ${color}60` }} />
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <span className="text-[10px] text-slate-500 ml-2">Side-by-side comparison</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Column Headers */}
      <div className="grid grid-cols-2 gap-4 px-6 pt-3 pb-1">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
            <span className="text-[8px] font-bold text-blue-400">{customerA.profile.name.split(" ").map(w => w[0]).join("")}</span>
          </div>
          <span className="text-xs font-semibold text-blue-400">{customerA.profile.name}</span>
          <span className="text-[9px] text-slate-500">· {customerA.lifestyleType}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
            <span className="text-[8px] font-bold text-emerald-400">{customerB.profile.name.split(" ").map(w => w[0]).join("")}</span>
          </div>
          <span className="text-xs font-semibold text-emerald-400">{customerB.profile.name}</span>
          <span className="text-[9px] text-slate-500">· {customerB.lifestyleType}</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2">
        <ViewComponent customerA={customerA} customerB={customerB} />
      </div>
    </div>
  );
}
