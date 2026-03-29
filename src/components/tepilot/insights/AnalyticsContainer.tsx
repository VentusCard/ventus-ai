import { useState, useRef, useEffect } from "react";
import { BankwideView } from "./BankwideView";
import { AvailableDealsGrid } from "@/components/tepilot/rewards-pipeline/AvailableDealsGrid";
import { SegmentTargetingView } from "../campaigns/SegmentTargetingView";
import { WalletShareView } from "./WalletShareView";
import { WellnessAlertsDashboard } from "./WellnessAlertsDashboard";
import { GamificationManagement } from "./GamificationManagement";
import { RewardsAnalyticsDashboard } from "./RewardsAnalyticsDashboard";
import { LocationExperienceManager } from "./LocationExperienceManager";
import { BankwideLifeEventsView } from "./BankwideLifeEventsView";
import { BankwideWMCopilotView } from "./BankwideWMCopilotView";
import { SubscriptionAnalyticsView } from "./SubscriptionAnalyticsView";
import { FVIDashboard } from "./fvi/FVIDashboard";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  BarChart3, Route, Wallet, Heart, Gamepad2, Sparkles,
  CalendarHeart, Briefcase, ChevronLeft, ChevronRight, ChevronDown, MapPin, Package,
  Building2, ArrowLeft, Bot, MessageSquare, Settings, CreditCard, ShieldAlert, AlertTriangle
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { VentusAIWelcomeView } from "./VentusAIWelcomeView";
import { ClientProfileData } from "@/types/clientProfile";
import { AIInsights } from "@/types/lifestyle-signals";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type TabValue = 'ventus-ai' | 'dashboard' | 'targeting' | 'wallet-share' | 'customer-insights' | 'gamification' | 'rewards-intelligence' | 'location-experience' | 'life-events' | 'deal-management' | 'wm-copilot' | 'subscription-analytics' | 'fvi-dashboard' | 'fraud-aml';

interface NavItem {
  value: TabValue;
  label: string;
  icon: React.ElementType;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Home",
    items: [
      { value: "ventus-ai", label: "Ventus AI", icon: () => <span className="text-xs font-black leading-none">V</span> },
    ],
  },
  {
    label: "Analytics",
    items: [
      { value: "dashboard", label: "Category Consolidation & Budgeting", icon: BarChart3 },
      { value: "wallet-share", label: "Outflow Analysis", icon: Wallet },
      { value: "subscription-analytics", label: "Subscription Analytics", icon: CreditCard },
    ],
  },
  {
    label: "Rewards",
    items: [
      { value: "rewards-intelligence", label: "Next-Deal Intelligence", icon: Sparkles },
      { value: "deal-management", label: "Deal Management", icon: Package },
      { value: "location-experience", label: "Locational Perk Aggregation", icon: MapPin },
      { value: "gamification", label: "Gamification", icon: Gamepad2 },
    ],
  },
  {
    label: "Relationship",
    items: [
      { value: "life-events", label: "Life Event Detection", icon: CalendarHeart },
      { value: "targeting", label: "Next-Best Product Engine", icon: Route },
      { value: "wm-copilot", label: "WM Copilot", icon: Briefcase },
    ],
  },
  {
    label: "Health",
    items: [
      { value: "customer-insights", label: "Customer Insights", icon: Heart },
      { value: "fvi-dashboard", label: "Financial Vulnerability", icon: ShieldAlert },
      { value: "fraud-aml", label: "Fraud/AML (Coming Soon)", icon: AlertTriangle },
    ],
  },
];

interface AnalyticsContainerProps {
  defaultTab?: TabValue;
  userDemographics?: ClientProfileData | null;
  lifestyleSignals?: AIInsights | null;
  onBack?: () => void;
}

export function AnalyticsContainer({ defaultTab = 'ventus-ai', userDemographics, lifestyleSignals, onBack }: AnalyticsContainerProps) {
  const [activeTab, setActiveTab] = useState<TabValue>(defaultTab);
  const [collapsed, setCollapsed] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
  }, [activeTab]);
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const renderContent = () => {
    switch (activeTab) {
      case 'ventus-ai': return <VentusAIWelcomeView onNavigate={setActiveTab} />;
      case 'dashboard': return <BankwideView />;
      case 'rewards-intelligence': return <RewardsAnalyticsDashboard />;
      case 'targeting': return <SegmentTargetingView />;
      case 'wallet-share': return <WalletShareView />;
      case 'customer-insights': return <WellnessAlertsDashboard />;
      case 'gamification': return <GamificationManagement />;
      case 'deal-management': return <AvailableDealsGrid />;
      case 'location-experience': return <LocationExperienceManager />;
      case 'life-events': return <BankwideLifeEventsView userDemographics={userDemographics} lifestyleSignals={lifestyleSignals} />;
      case 'wm-copilot': return <BankwideWMCopilotView />;
      case 'subscription-analytics': return <SubscriptionAnalyticsView />;
      case 'fvi-dashboard': return <FVIDashboard />;
      case 'fraud-aml': return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400">
          <AlertTriangle className="w-10 h-10 mb-3 text-slate-300" />
          <p className="text-lg font-semibold text-slate-500">Fraud / AML</p>
          <p className="text-sm">Coming Soon</p>
        </div>
      );
    }
  };

  return (
    <div className="w-full h-full flex flex-col border border-slate-200 overflow-hidden bg-white">
      {/* Professional Header */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-200">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-slate-100 hover:text-slate-900 shrink-0 h-8 w-8" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
          )}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-900">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">TCBY Bank (This Could Your Bank)</h1>
              <p className="text-[11px] text-slate-400 leading-tight">Customer Intelligence and Personalization Platform</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-slate-400">Last updated: {today}</span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200">
            <Sparkles className="w-3 h-3 text-blue-500" />
            <span className="text-[11px] font-medium text-slate-600">Powered by Ventus AI</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
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
        </nav>

        <div className="mt-auto border-t border-slate-200 py-2">
          {[
            { label: "Feedback", icon: MessageSquare },
            { label: "Settings", icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => toast({ title: item.label, description: "Coming soon" })}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "w-full flex items-center gap-2.5 text-left text-sm transition-colors text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-2 border-transparent",
                  collapsed ? "justify-center px-0 py-2.5" : "px-3 py-2"
                )}
              >
                <Icon className="w-4 h-4 shrink-0 text-slate-400" />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="flex-1 min-w-0 overflow-y-auto p-4">
        {renderContent()}
      </div>
      </div>
    </div>
  );
}
