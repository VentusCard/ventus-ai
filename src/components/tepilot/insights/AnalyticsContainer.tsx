import { useState } from "react";
import { BankwideView } from "./BankwideView";
import { SegmentTargetingView } from "../campaigns/SegmentTargetingView";
import { WalletShareView } from "./WalletShareView";
import { WellnessAlertsDashboard } from "./WellnessAlertsDashboard";
import { GamificationManagement } from "./GamificationManagement";
import { RewardsAnalyticsDashboard } from "./RewardsAnalyticsDashboard";
import { LocationExperienceManager } from "./LocationExperienceManager";
import { BankwideLifeEventsView } from "./BankwideLifeEventsView";
import { WMCopilotSignInDialog } from "./WMCopilotSignInDialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  BarChart3, Route, Wallet, Heart, Gamepad2, Sparkles,
  CalendarHeart, Briefcase, ChevronLeft, ChevronRight, ChevronDown, MapPin
} from "lucide-react";
import { ClientProfileData } from "@/types/clientProfile";
import { AIInsights } from "@/types/lifestyle-signals";
import { cn } from "@/lib/utils";

type TabValue = 'dashboard' | 'targeting' | 'wallet-share' | 'customer-insights' | 'gamification' | 'rewards-intelligence' | 'location-experience' | 'life-events';

interface NavItem {
  value: TabValue;
  label: string;
  icon: React.ElementType;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Analytics",
    items: [
      { value: "dashboard", label: "Analytics Dashboard", icon: BarChart3 },
      { value: "wallet-share", label: "Wallet Share Intelligence", icon: Wallet },
      { value: "customer-insights", label: "Customer Insights", icon: Heart },
    ],
  },
  {
    label: "Rewards",
    items: [
      { value: "rewards-intelligence", label: "Rewards Intelligence", icon: Sparkles },
      { value: "location-experience", label: "Location Experience", icon: MapPin },
      { value: "gamification", label: "Gamification", icon: Gamepad2 },
    ],
  },
  {
    label: "Relationship",
    items: [
      { value: "life-events", label: "Life Events Intelligence", icon: CalendarHeart },
      { value: "targeting", label: "Financial Journey", icon: Route },
    ],
  },
];

interface AnalyticsContainerProps {
  defaultTab?: TabValue;
  userDemographics?: ClientProfileData | null;
  lifestyleSignals?: AIInsights | null;
}

export function AnalyticsContainer({ defaultTab = 'dashboard', userDemographics, lifestyleSignals }: AnalyticsContainerProps) {
  const [activeTab, setActiveTab] = useState<TabValue>(defaultTab);
  const [collapsed, setCollapsed] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <BankwideView />;
      case 'rewards-intelligence': return <RewardsAnalyticsDashboard />;
      case 'targeting': return <SegmentTargetingView />;
      case 'wallet-share': return <WalletShareView />;
      case 'customer-insights': return <WellnessAlertsDashboard />;
      case 'gamification': return <GamificationManagement />;
      case 'location-experience': return <LocationExperienceManager />;
      case 'life-events': return <BankwideLifeEventsView userDemographics={userDemographics} lifestyleSignals={lifestyleSignals} />;
    }
  };

  return (
    <div className="flex w-full min-h-[600px]">
      {/* Sidebar */}
      <div
        className={cn(
          "shrink-0 border-r border-slate-200 bg-slate-50/80 transition-all duration-200 flex flex-col",
          collapsed ? "w-[52px]" : "w-[240px]"
        )}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center justify-center h-10 border-b border-slate-200 hover:bg-slate-100 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4 text-slate-500" /> : <ChevronLeft className="w-4 h-4 text-slate-500" />}
        </button>

        <nav className="flex-1 py-2 overflow-y-auto">
          {NAV_GROUPS.map((group) => (
            <Collapsible key={group.label} defaultOpen>
              {!collapsed && (
                <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600">
                  {group.label}
                  <ChevronDown className="w-3 h-3" />
                </CollapsibleTrigger>
              )}
              <CollapsibleContent>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.value;
                  return (
                    <button
                      key={item.value}
                      onClick={() => setActiveTab(item.value)}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "w-full flex items-center gap-2.5 text-left text-sm transition-colors",
                        collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2",
                        isActive
                          ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600 font-medium"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-2 border-transparent"
                      )}
                    >
                      <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-blue-600" : "text-slate-400")} />
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </button>
                  );
                })}
              </CollapsibleContent>
              {!collapsed && <div className="mx-3 my-1 border-b border-slate-200 last:hidden" />}
            </Collapsible>
          ))}

          {/* WM Copilot - opens sign-in dialog */}
          <div>
            <button
              onClick={() => setShowSignIn(true)}
              title={collapsed ? "WM Copilot" : undefined}
              className={cn(
                "w-full flex items-center gap-2.5 text-left text-sm transition-colors",
                collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2",
                "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-2 border-transparent"
              )}
            >
              <Briefcase className="w-4 h-4 shrink-0 text-slate-400" />
              {!collapsed && <span className="truncate">WM Copilot</span>}
            </button>
          </div>
        </nav>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 overflow-y-auto p-4">
        {renderContent()}
      </div>

      <WMCopilotSignInDialog
        open={showSignIn}
        onOpenChange={setShowSignIn}
        userDemographics={userDemographics ?? null}
      />
    </div>
  );
}
