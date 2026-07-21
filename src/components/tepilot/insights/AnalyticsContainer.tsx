import { useState, useRef, useEffect, useMemo } from "react";
import { BankwideView } from "./BankwideView";
import { DealsAndPerksView } from "./DealsAndPerksView";
import { SegmentTargetingView } from "../campaigns/SegmentTargetingView";
import { ProductAutomatedFlowsView } from "../campaigns/ProductAutomatedFlowsView";
import { ProductCampaignBuilderView } from "../campaigns/ProductCampaignBuilderView";

import { AutonomousActivityFeed } from "../campaigns/AutonomousActivityFeed";
import { WalletShareView } from "./WalletShareView";
import { WellnessAlertsDashboard } from "./WellnessAlertsDashboard";
import { GamificationManagement } from "./GamificationManagement";
import { RewardsAnalyticsDashboard } from "./RewardsAnalyticsDashboard";

import { RelationshipIntelligenceView } from "./RelationshipIntelligenceView";
import { BankwideWMCopilotView } from "./BankwideWMCopilotView";

import { SubscriptionAnalyticsView } from "./SubscriptionAnalyticsView";
import { FVIDashboard } from "./fvi/FVIDashboard";
import { TabHeader } from "./TabHeader";
import { CapabilitiesView } from "./CapabilitiesView";
import { BankContextView } from "./BankContextView";
import { SettingsContainer } from "./SettingsContainer";
import ExecDemoPage from "@/pages/ExecDemoPage";

import { ReportsLibrary } from "./reports/ReportsLibrary";
import { QueryConsoleView } from "./QueryConsoleView";
import { LifestylePillarReport } from "./reports/pages/LifestylePillarReport";
import { PillarDeepDiveReport } from "./reports/pages/PillarDeepDiveReport";
import { CrossSellReport } from "./reports/pages/CrossSellReport";
import { RegionalSpendReport } from "./reports/pages/RegionalSpendReport";
import { OutflowCompetitorReport } from "./reports/pages/OutflowCompetitorReport";
import { TopMerchantOutflowReport } from "./reports/pages/TopMerchantOutflowReport";
import { SubscriptionChurnReport } from "./reports/pages/SubscriptionChurnReport";
import { CohortRetentionReport } from "./reports/pages/CohortRetentionReport";
import { LifeEventVolumeReport } from "./reports/pages/LifeEventVolumeReport";
import { FviSummaryReport } from "./reports/pages/FviSummaryReport";
import { TierMigrationReport } from "./reports/pages/TierMigrationReport";
import { LifeEventFunnelReport } from "./reports/pages/LifeEventFunnelReport";
import { WalletShareReport } from "./reports/pages/WalletShareReport";
import { TravelTripsReport } from "./reports/pages/TravelTripsReport";
import { NextConversationReport } from "./reports/pages/NextConversationReport";
import { PriorityOpportunityReport } from "./reports/pages/PriorityOpportunityReport";
import type { InteractiveReportId } from "./reports/interactiveReportsRegistry";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  BarChart3, Route, Wallet, Heart, Gamepad2, Sparkles, FileBarChart,
  CalendarHeart, Briefcase, ChevronLeft, ChevronRight, ChevronDown, MapPin, Package,
  Building2, ArrowLeft, Bot, MessageSquare, MessagesSquare, Settings, CreditCard, ShieldAlert, AlertTriangle, Users,
  Zap, Megaphone, Layers, Presentation, Terminal, LogOut, Gem
} from "lucide-react";
import { AIAssistantActivityView } from "./AIAssistantActivityView";
import { toast } from "@/hooks/use-toast";
import { VentusAIDashboardView } from "./VentusAIDashboardView";
import { ClientProfileData } from "@/types/clientProfile";
import { AIInsights } from "@/types/lifestyle-signals";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { VentusAIChatPanel } from "./VentusAIChatPanel";
import { FeedbackPage } from "./FeedbackPage";
import { MODULE_NAV_GROUP_MAP, type ModuleKey } from "@/types/demo";

export type TabValue = 'ventus-ai-dashboard' | 'ventus-ai' | 'capabilities' | 'products' | 'exec-demo' | 'ai-assistant-activity' | 'analytics-dashboard' | 'reports' | 'query' | 'report-lifestyle-pillars' | 'report-pillar-deep-dive' | 'report-cross-sell' | 'report-regional-spend' | 'report-outflow' | 'report-top-merchants' | 'report-subscription' | 'report-cohort-retention' | 'report-life-events' | 'report-fvi' | 'report-tier-migration' | 'report-life-event-funnel' | 'report-wallet-share' | 'report-travel-trips' | 'report-next-conversation' | 'report-priority-opportunity' | 'dashboard' | 'targeting' | 'targeting-automated-flows' | 'targeting-campaign-builder' | 'wallet-share' | 'customer-insights' | 'gamification' | 'rewards-intelligence' | 'location-experience' | 'life-events' | 'deal-management' | 'wm-copilot' | 'subscription-analytics' | 'fvi-dashboard' | 'fraud-aml' | 'settings' | 'feedback';

interface NavItem {
  value: TabValue;
  label: string;
  icon: React.ElementType;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Home",
    items: [
      { value: "capabilities", label: "System", icon: Layers },
      { value: "products", label: "Bank\u00A0Context", icon: Package },
      { value: "exec-demo", label: "Demo", icon: Presentation },
    ],
  },
  {
    label: "Analytics",
    items: [
      {
        value: "ventus-ai-dashboard",
        label: "Ventus AI Dashboard",
        icon: ({ className }: { className?: string }) => (
          <span className={cn("inline-flex items-center justify-center font-black text-[12px]", className)} style={{ lineHeight: "16px" }}>
            V
          </span>
        ),
      },
      { value: "query", label: "Query", icon: Terminal },
      { value: "reports", label: "Reports", icon: FileBarChart },
    ],
  },
  {
    label: "Product & Growth",
    items: [
      
      { value: "targeting-automated-flows", label: "Automated Flows", icon: Zap },
      { value: "targeting-campaign-builder", label: "Campaign Builder", icon: Megaphone },
      { value: "targeting", label: "Next Product", icon: Route },
    ],
  },
  {
    label: "Deals & Rewards",
    items: [
      { value: "rewards-intelligence", label: "Next-Deal Intelligence", icon: Sparkles },
      { value: "deal-management", label: "Deals & Perks", icon: Package },
      { value: "gamification", label: "Gamification", icon: Gamepad2 },
    ],
  },
  {
    label: "WEALTH & RELATIONSHIP",
    items: [
      { value: "life-events", label: "Relationship Intelligence", icon: Gem },
      { value: "ai-assistant-activity", label: "AI Banking Assistant ", icon: MessagesSquare },
      { value: "wm-copilot", label: "WM Coworker", icon: Briefcase },
    ],
  },
  {
    label: "Risk",
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
  enabledModules?: Set<ModuleKey>;
}

export function AnalyticsContainer({ defaultTab = 'capabilities', userDemographics, lifestyleSignals, onBack, enabledModules }: AnalyticsContainerProps) {
  const [activeTab, setActiveTab] = useState<TabValue>(defaultTab);
  const [collapsed, setCollapsed] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [pendingQuery, setPendingQuery] = useState<string | undefined>(undefined);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const openInQuery = (sql: string) => {
    setPendingQuery(sql);
    setActiveTab('query');
  };

  const openInteractiveReport = (id: InteractiveReportId, payload?: { opportunityId?: string }) => {
    if (id === 'priority-opportunity') {
      setSelectedOpportunityId(payload?.opportunityId ?? null);
      setActiveTab('report-priority-opportunity');
    }
  };


  // Filter nav groups based on enabled modules
  const filteredNavGroups = useMemo(() => {
    if (!enabledModules) return NAV_GROUPS;

    // Build set of allowed group labels from enabled modules
    const allowedLabels = new Set<string>(["Home"]);
    for (const mod of enabledModules) {
      const groups = MODULE_NAV_GROUP_MAP[mod];
      if (groups) groups.forEach(g => allowedLabels.add(g));
    }
    // Risk/Others/Product & Growth groups follow Analytics (always on since Analytics is always enabled)
    if (enabledModules.has("Analytics")) {
      allowedLabels.add("Risk");
      allowedLabels.add("Others");
      allowedLabels.add("Product & Growth");
    }
    return NAV_GROUPS.filter(g => allowedLabels.has(g.label));
  }, [enabledModules]);

  // All valid tab values from filtered groups
  const validTabs = useMemo(() => {
    const set = new Set<TabValue>();
    filteredNavGroups.forEach(g => g.items.forEach(i => set.add(i.value)));
    // Footer-anchored, always available
    set.add('settings');
    set.add('feedback');
    // Deep-linked report pages (not in sidebar) — reachable from Reports library
    // or from cards on other pages. Always valid so the auto-reset effect doesn't
    // bounce the user back.
    set.add('report-lifestyle-pillars');
    set.add('report-pillar-deep-dive');
    set.add('report-cross-sell');
    set.add('report-regional-spend');
    set.add('report-outflow');
    set.add('report-top-merchants');
    set.add('report-subscription');
    set.add('report-cohort-retention');
    set.add('report-life-events');
    set.add('report-fvi');
    set.add('report-tier-migration');
    set.add('report-life-event-funnel');
    set.add('report-wallet-share');
    set.add('report-travel-trips');
    set.add('report-next-conversation');
    set.add('report-priority-opportunity');
    return set;
  }, [filteredNavGroups]);


  // Auto-reset tab if it became hidden
  useEffect(() => {
    if (!validTabs.has(activeTab)) {
      setActiveTab('ventus-ai');
    }
  }, [validTabs, activeTab]);

  useEffect(() => {
    contentRef.current?.scrollTo(0, 0);
    if (activeTab === 'ventus-ai') setChatOpen(false);
  }, [activeTab]);

  // Accordion-style group expansion: only the group containing the active tab stays open after navigation.
  const activeGroupLabel = useMemo(
    () => filteredNavGroups.find((g) => g.items.some((i) => i.value === activeTab))?.label,
    [filteredNavGroups, activeTab],
  );
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set(activeGroupLabel ? [activeGroupLabel] : []),
  );
  useEffect(() => {
    setOpenGroups(new Set(activeGroupLabel ? [activeGroupLabel] : []));
  }, [activeTab, activeGroupLabel]);
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const renderContent = () => {
    switch (activeTab) {
      case 'ventus-ai-dashboard':
      case 'ventus-ai':
      case 'analytics-dashboard':
        return <VentusAIDashboardView onNavigate={setActiveTab} onOpenOpportunity={(id) => openInteractiveReport('priority-opportunity', { opportunityId: id })} />;
      case 'capabilities': return <CapabilitiesView onOpenProducts={() => setActiveTab('products')} />;
      case 'products': return <BankContextView />;
      // 'exec-demo' is rendered as a persistent mount outside renderContent so
      // its state (enrichment, persona, offers, product cards) survives tab
      // switches. See the always-mounted block below.
      case 'exec-demo': return null;
      case 'ai-assistant-activity': return <AIAssistantActivityView />;
      case 'reports': return <ReportsLibrary onOpenQuery={openInQuery} onOpenInteractiveReport={openInteractiveReport} />;
      case 'query': return <QueryConsoleView initialQuery={pendingQuery} />;
      case 'report-lifestyle-pillars': return <LifestylePillarReport onBack={() => setActiveTab('reports')} />;
      case 'report-pillar-deep-dive': return <PillarDeepDiveReport onBack={() => setActiveTab('reports')} />;
      case 'report-cross-sell': return <CrossSellReport onBack={() => setActiveTab('reports')} />;
      case 'report-regional-spend': return <RegionalSpendReport onBack={() => setActiveTab('reports')} />;
      case 'report-outflow': return <OutflowCompetitorReport onBack={() => setActiveTab('reports')} />;
      case 'report-top-merchants': return <TopMerchantOutflowReport onBack={() => setActiveTab('reports')} />;
      case 'report-subscription': return <SubscriptionChurnReport onBack={() => setActiveTab('reports')} />;
      case 'report-cohort-retention': return <CohortRetentionReport onBack={() => setActiveTab('reports')} />;
      case 'report-life-events': return <LifeEventVolumeReport onBack={() => setActiveTab('reports')} />;
      case 'report-fvi': return <FviSummaryReport onBack={() => setActiveTab('reports')} />;
      case 'report-tier-migration': return <TierMigrationReport onBack={() => setActiveTab('reports')} />;
      case 'report-life-event-funnel': return <LifeEventFunnelReport onBack={() => setActiveTab('reports')} />;
      case 'report-wallet-share': return <WalletShareReport onBack={() => setActiveTab('reports')} />;
      case 'report-travel-trips': return <TravelTripsReport onBack={() => setActiveTab('reports')} />;
      case 'report-next-conversation': return <NextConversationReport onBack={() => setActiveTab('reports')} />;
      case 'report-priority-opportunity': return <PriorityOpportunityReport opportunityId={selectedOpportunityId} onBack={() => setActiveTab('reports')} onNavigate={setActiveTab} onSelectOpportunity={setSelectedOpportunityId} />;
      case 'dashboard': return <BankwideView />;
      case 'rewards-intelligence': return <RewardsAnalyticsDashboard />;
      case 'targeting': return <SegmentTargetingView />;
      case 'targeting-automated-flows': return <ProductAutomatedFlowsView />;
      case 'targeting-campaign-builder': return <ProductCampaignBuilderView />;
      
      case 'wallet-share': return <WalletShareView />;
      case 'customer-insights': return <WellnessAlertsDashboard />;
      case 'gamification': return <GamificationManagement />;
      case 'deal-management': return <DealsAndPerksView defaultTab="shopping" />;
      case 'location-experience': return <DealsAndPerksView defaultTab="perks" />;
      case 'life-events': return <RelationshipIntelligenceView userDemographics={userDemographics} lifestyleSignals={lifestyleSignals} onNavigate={setActiveTab} />;
      case 'wm-copilot': return <BankwideWMCopilotView />;
      
      case 'subscription-analytics': return <SubscriptionAnalyticsView />;
      case 'fvi-dashboard': return <FVIDashboard />;
      case 'fraud-aml': return (
        <div className="space-y-6">
          <TabHeader
            icon={<AlertTriangle className="w-4 h-4" />}
            title="Fraud / AML Detection"
            subtitle="Transaction anomaly detection and suspicious pattern flagging"
            howItWorks="Ventus monitors transaction velocity, geo-anomalies, and behavioral deviations to flag suspicious activity patterns in real time."
            whyItMatters="Reduces fraud losses and strengthens AML compliance with behavioral intelligence layered on top of traditional rule engines."
          />
          <div className="flex flex-col items-center justify-center h-48 text-slate-400">
            <AlertTriangle className="w-10 h-10 mb-3 text-slate-300" />
            <p className="text-sm">Coming Soon</p>
          </div>
        </div>
      );
      case 'settings': return <SettingsContainer />;
      case 'feedback': return <FeedbackPage />;
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
              <h1 className="text-sm font-bold text-slate-900 leading-tight">Our Bank</h1>
              <p className="text-[11px] text-slate-400 leading-tight">Customer Intelligence and Personalization Platform</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px] text-slate-400">Last updated: {today}</span>
          {activeTab !== 'ventus-ai' && activeTab !== 'ventus-ai-dashboard' && !chatOpen && (
            <button
              onClick={() => setChatOpen(true)}
              className="ventus-ai-badge ventus-ai-badge-interactive"
              title="Open Ventus AI"
              aria-label="Open Ventus AI"
            >
              <span className="ventus-ai-live-dot" aria-hidden="true" />
              Ventus AI
            </button>
          )}
          {(activeTab === 'ventus-ai' || activeTab === 'ventus-ai-dashboard' || chatOpen) && (
            <div className="ventus-ai-badge" aria-label="Ventus AI is active">
              <span className="ventus-ai-live-dot" aria-hidden="true" />
              <span>Ventus AI</span>
            </div>
          )}
          <button
            onClick={() => {
              sessionStorage.clear();
              window.location.href = "/bankdemo";
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:border-slate-300 transition-colors"
            title="Exit demo"
          >
            <LogOut className="w-3 h-3" />
            Exit
          </button>
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
          className="flex items-center justify-center h-8 border-b border-slate-200 hover:bg-slate-100 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4 text-slate-500" /> : <ChevronLeft className="w-4 h-4 text-slate-500" />}
        </button>

        <nav className="flex-1 py-1 overflow-y-auto">
          {filteredNavGroups.map((group) => {
            const isHome = group.label === "Home";
            const isOpen = collapsed || isHome ? true : openGroups.has(group.label);
            const ownsActive = group.label === activeGroupLabel;
            const renderItems = () => group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.value;
              return (
                <button
                  key={item.value}
                  onClick={() => setActiveTab(item.value)}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "w-full flex items-center gap-2.5 text-left text-[13px] transition-colors",
                    collapsed ? "justify-center px-0 py-1.5" : "px-3 py-1.5",
                    isActive
                      ? "bg-blue-50 text-blue-700 border-l-2 border-blue-600 font-medium"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 border-l-2 border-transparent"
                  )}
                >
                  <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-blue-600" : "text-slate-400")} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            });

            if (isHome) {
              return (
                <div key={group.label}>
                  {!collapsed && (
                    <div className="px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      {group.label}
                    </div>
                  )}
                  {renderItems()}
                  {!collapsed && <div className="mx-3 my-0.5 border-b border-slate-200" />}
                </div>
              );
            }

            return (
            <Collapsible
              key={group.label}
              open={isOpen}
              onOpenChange={(next) => {
                if (collapsed) return;
                // Don't allow collapsing the group that owns the active tab
                if (!next && ownsActive) return;
                setOpenGroups((prev) => {
                  const out = new Set(prev);
                  if (next) out.add(group.label);
                  else out.delete(group.label);
                  return out;
                });
              }}
            >
              {!collapsed && (
                <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 hover:text-slate-600">
                  {group.label}
                  <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen ? "rotate-0" : "-rotate-90")} />
                </CollapsibleTrigger>
              )}
              <CollapsibleContent>
                {renderItems()}
              </CollapsibleContent>
              {!collapsed && <div className="mx-3 my-0.5 border-b border-slate-200 last:hidden" />}
            </Collapsible>
            );
          })}

        </nav>

        <div className="mt-auto border-t border-slate-200 py-1">
          {[
            { label: "Feedback & Ideas", icon: MessageSquare, tab: 'feedback' as const },
            { label: "Settings", icon: Settings, tab: 'settings' as const },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.tab)}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "w-full flex items-center gap-2.5 text-left text-[13px] transition-colors",
                  collapsed ? "justify-center px-0 py-1.5" : "px-3 py-1.5",
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
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="flex-1 min-w-0 overflow-y-auto p-4 relative">
        {(activeTab === 'targeting' || activeTab === 'targeting-automated-flows') && (
          <div className="mb-4">
            <AutonomousActivityFeed />
          </div>
        )}
        {renderContent()}

        {/*
          Persistent Demo mount — kept alive across tab switches so the
          pre-fired enrichment pipeline (classification, persona, offers,
          product cards) is ready the moment the user clicks the Demo tab.
          Hidden via CSS instead of unmounting so React state is preserved.
        */}
        <div
          className={cn(
            "-m-4 h-[calc(100%+2rem)] w-[calc(100%+2rem)] overflow-hidden bg-white",
            activeTab === 'exec-demo' ? "block" : "hidden",
          )}
        >
          <ExecDemoPage embedded prefireOnMount active={activeTab === 'exec-demo'} onBack={() => setActiveTab('ventus-ai-dashboard')} />
        </div>
      </div>

      {/* Chat Panel */}
      {chatOpen && activeTab !== 'ventus-ai' && activeTab !== 'ventus-ai-dashboard' && (
        <VentusAIChatPanel
          activeTab={activeTab}
          onClose={() => setChatOpen(false)}
          contextExtras={
            activeTab === 'report-priority-opportunity' && selectedOpportunityId
              ? { selectedOpportunityId }
              : undefined
          }
        />
      )}
      </div>
    </div>
  );
}
