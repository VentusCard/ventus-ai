import { useState, useRef, useEffect, useMemo } from "react";
import { BankwideView } from "./BankwideView";
import { SegmentTargetingView } from "../campaigns/SegmentTargetingView";
import { ProductAutomatedFlowsView } from "../campaigns/ProductAutomatedFlowsView";
import { ProductCampaignBuilderView } from "../campaigns/ProductCampaignBuilderView";

import { AutonomousActivityFeed } from "../campaigns/AutonomousActivityFeed";

import { PersonalizedRelationshipView } from "./PersonalizedRelationshipView";
import { BankwideWMCopilotView } from "./BankwideWMCopilotView";

import { SubscriptionAnalyticsView } from "./SubscriptionAnalyticsView";

import { TabHeader } from "./TabHeader";
import { CapabilitiesView } from "./CapabilitiesView";
import { BankContextView } from "./BankContextView";
import { SettingsContainer } from "./SettingsContainer";
import { GovernanceView } from "../governance/GovernanceView";
import ExecDemoPage from "@/pages/ExecDemoPage";

import { MerchantPartnershipsView } from "./MerchantPartnershipsView";
import { CustomersDirectoryView } from "./customers/CustomersDirectoryView";


import { PersonalizedDealsView } from "./PersonalizedDealsView";
import { PersonalizedProductView } from "./PersonalizedProductView";
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
  BarChart3, Route, Heart, Sparkles, FileBarChart,
  CalendarHeart, Briefcase, ChevronLeft, ChevronRight, ChevronDown, Package,
  Building2, ArrowLeft, Bot, MessageSquare, MessagesSquare, Settings, CreditCard, ShieldAlert, Users,
  Zap, Megaphone, Layers, Presentation, LogOut, Gem, ShieldCheck, Handshake
} from "lucide-react";

import { toast } from "@/hooks/use-toast";
import { VentusAIDashboardView } from "./VentusAIDashboardView";
import { VentusAIChatPage } from "./VentusAIChatPage";
import { ClientProfileData } from "@/types/clientProfile";
import { AIInsights } from "@/types/lifestyle-signals";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { VentusAIChatPanel } from "./VentusAIChatPanel";
import { FeedbackPage } from "./FeedbackPage";
import { MODULE_NAV_GROUP_MAP, type ModuleKey } from "@/types/demo";

export type TabValue = 'ventus-ai-dashboard' | 'ventus-chat' | 'customers' | 'ventus-ai' | 'capabilities' | 'products' | 'exec-demo' | 'ai-assistant-activity' | 'analytics-dashboard' | 'reports' | 'report-lifestyle-pillars' | 'report-pillar-deep-dive' | 'report-cross-sell' | 'report-regional-spend' | 'report-outflow' | 'report-top-merchants' | 'report-subscription' | 'report-cohort-retention' | 'report-life-events' | 'report-fvi' | 'report-tier-migration' | 'report-life-event-funnel' | 'report-wallet-share' | 'report-travel-trips' | 'report-next-conversation' | 'report-priority-opportunity' | 'dashboard' | 'targeting' | 'targeting-automated-flows' | 'targeting-campaign-builder' | 'growth-merchant-partnerships' | 'wallet-share' | 'customer-insights' | 'personalized-deals' | 'gamification' | 'rewards-intelligence' | 'location-experience' | 'life-events' | 'deal-management' | 'wm-copilot' | 'subscription-analytics' | 'fvi-dashboard' | 'settings' | 'feedback' | 'governance' | 'personalized-relationship';

interface NavItem {
  value: TabValue;
  label: string;
  icon: React.ElementType;
}

const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "VENTUS AI",
    items: [
      { value: "capabilities", label: "System", icon: Layers },
      { value: "products", label: "Context", icon: Package },
      { value: "exec-demo", label: "Demo", icon: Presentation },
      { value: "governance", label: "Governance", icon: ShieldCheck },
    ],
  },
  {
    label: "Customer Intelligence",
    items: [
      {
        value: "ventus-ai-dashboard",
        label: "Intelligence Dashboard",
        icon: ({ className }: { className?: string }) => (
          <span className={cn("inline-flex items-center justify-center font-black text-[12px]", className)} style={{ lineHeight: "16px" }}>
            V
          </span>
        ),
      },
      { value: "ventus-chat", label: "Ask Ventus AI", icon: MessagesSquare },
      
      
      { value: "wm-copilot", label: "AI Coworker", icon: Briefcase },
    ],
  },
  {
    label: "Growth Opportunities",
    items: [
      { value: "targeting-automated-flows", label: "Automated Flows", icon: Zap },
      { value: "targeting-campaign-builder", label: "Campaign Builder", icon: Megaphone },
      { value: "growth-merchant-partnerships", label: "Merchant Partnerships", icon: Handshake },
    ],
  },
  {
    label: "BANKING PERSONALIZATION\u00A0",
    items: [
      { value: "personalized-deals", label: "Personalized Deals", icon: Sparkles },
      { value: "targeting", label: "Personalized Product", icon: Route },
      { value: "personalized-relationship", label: "Personalized Relationship", icon: Users },
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
  const [pendingChatPrompt, setPendingChatPrompt] = useState<string | null>(null);
  const [selectedOpportunityId, setSelectedOpportunityId] = useState<string | null>(null);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(280);

  const openInteractiveReport = (id: InteractiveReportId, payload?: { opportunityId?: string }) => {
    if (id === 'priority-opportunity') {
      setSelectedOpportunityId(payload?.opportunityId ?? null);
      setActiveTab('report-priority-opportunity');
    }
  };

  const openVentusChat = (prompt?: string) => {
    if (prompt) setPendingChatPrompt(prompt);
    setActiveTab('ventus-chat');
  };



  const MIN_SIDEBAR_WIDTH = 220;
  const MAX_SIDEBAR_WIDTH = 420;

  const handleResizeStart = (e: React.PointerEvent) => {
    if (collapsed) return;
    e.preventDefault();
    setIsResizing(true);
    dragStartX.current = e.clientX;
    dragStartWidth.current = sidebarWidth;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const handleResizeMove = (e: PointerEvent) => {
    if (!isResizing) return;
    const delta = e.clientX - dragStartX.current;
    const nextWidth = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, dragStartWidth.current + delta));
    setSidebarWidth(nextWidth);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (!isResizing) return;
    window.addEventListener('pointermove', handleResizeMove);
    window.addEventListener('pointerup', handleResizeEnd);
    return () => {
      window.removeEventListener('pointermove', handleResizeMove);
      window.removeEventListener('pointerup', handleResizeEnd);
    };
  }, [isResizing]);


  // Filter nav groups based on enabled modules
  const filteredNavGroups = useMemo(() => {
    if (!enabledModules) return NAV_GROUPS;

    // Build set of allowed group labels from enabled modules
    const allowedLabels = new Set<string>(["VENTUS AI"]);
    for (const mod of enabledModules) {
      const groups = MODULE_NAV_GROUP_MAP[mod];
      if (groups) groups.forEach(g => allowedLabels.add(g));
    }
    // All consolidated groups follow Analytics (always on since Analytics is always enabled)
    if (enabledModules.has("Analytics")) {
      allowedLabels.add("Customer Intelligence");
      allowedLabels.add("Growth Opportunities");
      allowedLabels.add("BANKING PERSONALIZATION\u00A0");
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
    // Risk now lives as a sub-tab of the Intelligence Dashboard; keep deep links valid.
    set.add('fvi-dashboard');
    set.add('reports');
    set.add('customers');
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

  const launchCampaignFor = (productName: string, offers: string[]) => {
    try {
      sessionStorage.setItem(
        'ventus.campaignBuilder.prefill',
        JSON.stringify({ productName, offers }),
      );
    } catch {
      /* ignore */
    }
    setActiveTab('targeting-campaign-builder');
  };

  const renderContent = () => {

    switch (activeTab) {
      case 'ventus-ai-dashboard':
      case 'ventus-ai':
      case 'analytics-dashboard':
        return <VentusAIDashboardView onNavigate={setActiveTab} onOpenChat={openVentusChat} onOpenInteractiveReport={openInteractiveReport} onOpenOpportunity={(id) => openInteractiveReport('priority-opportunity', { opportunityId: id })} />;
      case 'capabilities': return <CapabilitiesView onOpenProducts={() => setActiveTab('products')} />;
      case 'products': return <BankContextView />;
      // 'exec-demo' is rendered as a persistent mount outside renderContent so
      // its state (enrichment, persona, offers, product cards) survives tab
      // switches. See the always-mounted block below.
      case 'exec-demo': return null;
      // 'ventus-chat' is rendered as a persistent mount below so the thread survives tab switches.
      case 'ventus-chat': return null;
      case 'reports': return <VentusAIDashboardView onNavigate={setActiveTab} onOpenChat={openVentusChat} onOpenInteractiveReport={openInteractiveReport} onOpenOpportunity={(id) => openInteractiveReport('priority-opportunity', { opportunityId: id })} initialSection="reports" />;
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
      case 'personalized-deals':
      case 'rewards-intelligence':
      case 'deal-management':
      case 'gamification':
      case 'location-experience':
        return <PersonalizedDealsView onNavigate={setActiveTab} />;
      case 'targeting': return <PersonalizedProductView onNavigate={setActiveTab} />;
      case 'targeting-automated-flows': return <ProductAutomatedFlowsView />;
      case 'targeting-campaign-builder': return <ProductCampaignBuilderView />;
      case 'growth-merchant-partnerships': return <MerchantPartnershipsView onLaunchCampaign={launchCampaignFor} />;

      
      case 'wallet-share': return <ProductCampaignBuilderView initialMode="outflow" />;
      case 'wm-copilot': return <BankwideWMCopilotView />;
      case 'personalized-relationship':
      case 'customer-insights':
      case 'life-events':
      case 'ai-assistant-activity':
        return <PersonalizedRelationshipView userDemographics={userDemographics} lifestyleSignals={lifestyleSignals} onNavigate={setActiveTab} />;
      
      
      case 'subscription-analytics': return <SubscriptionAnalyticsView />;
      case 'customers': return <VentusAIDashboardView onNavigate={setActiveTab} onOpenChat={openVentusChat} onOpenInteractiveReport={openInteractiveReport} onOpenOpportunity={(id) => openInteractiveReport('priority-opportunity', { opportunityId: id })} initialSection="customers" />;
      case 'fvi-dashboard': return <VentusAIDashboardView onNavigate={setActiveTab} onOpenChat={openVentusChat} onOpenOpportunity={(id) => openInteractiveReport('priority-opportunity', { opportunityId: id })} initialSection="risk" />;
      case 'governance': return <GovernanceView />;
      case 'settings': return <SettingsContainer />;
      case 'feedback': return <FeedbackPage />;
    }
  };

  const navButtonClasses = (isActive: boolean, collapsed: boolean) => cn(
    "w-full flex items-center gap-3 text-left text-[14px] transition-colors",
    collapsed ? "justify-center px-0 py-2" : "px-3 py-2",
    isActive
      ? "bg-white/10 text-white border-l-2 border-indigo-400 font-medium shadow-[0_0_12px_rgba(79,70,229,0.15)]"
      : "text-indigo-50/90 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
  );

  const navIconClasses = (isActive: boolean) => cn(
    "w-4 h-4 shrink-0",
    isActive ? "text-indigo-400" : "text-indigo-200/60"
  );

  return (
    <div className="w-full h-full flex border border-slate-200 overflow-hidden bg-white">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        style={collapsed ? undefined : { width: sidebarWidth }}
        className={cn(
          "relative shrink-0 h-full flex flex-col",
          "bg-gradient-to-b from-[#0a0a1a] via-[#141432] to-[#1e1e5a]",
          collapsed ? "w-[52px] transition-all duration-200" : !isResizing && "transition-all duration-200"
        )}
      >
        {/* Ambient intelligent glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,rgba(79,70,229,0.18),transparent_45%)]" />
        <div
          onPointerDown={handleResizeStart}
          className={cn(
            "absolute top-0 right-0 z-10 h-full w-1.5 cursor-col-resize transition-colors",
            isResizing ? "bg-indigo-400" : "bg-transparent hover:bg-white/20"
          )}
          title="Drag to resize sidebar"
        />
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="relative z-10 flex items-center justify-center h-8 border-b border-white/10 hover:bg-white/5 transition-colors"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="w-4 h-4 text-indigo-200" /> : <ChevronLeft className="w-4 h-4 text-indigo-200" />}
        </button>

        <nav className="relative z-10 flex-1 py-1 overflow-y-auto">
          {filteredNavGroups.map((group) => {
            const isHome = group.label === "VENTUS AI";
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
                  className={navButtonClasses(isActive, collapsed)}
                >
                  <Icon className={navIconClasses(isActive)} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </button>
              );
            });

            if (isHome) {
              return (
                <div key={group.label}>
                  {!collapsed && (
                    <div className="px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wider text-indigo-100/90">
                      {group.label}
                    </div>
                  )}
                  {renderItems()}
                  {!collapsed && <div className="mx-3 my-0.5 border-b border-white/10" />}
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
                <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wider text-indigo-100/90 hover:text-white">
                  {group.label}
                  <ChevronDown className={cn("w-3 h-3 transition-transform text-indigo-100/80", isOpen ? "rotate-0" : "-rotate-90")} />
                </CollapsibleTrigger>
              )}
              <CollapsibleContent>
                {renderItems()}
              </CollapsibleContent>
              {!collapsed && <div className="mx-3 my-0.5 border-b border-white/10 last:hidden" />}
            </Collapsible>
            );
          })}

        </nav>

        <div className="relative z-10 mt-auto border-t border-white/10 py-1">
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
                className={navButtonClasses(isActive, collapsed)}
              >
                <Icon className={navIconClasses(isActive)} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Professional Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-slate-200 shrink-0">
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
            {activeTab !== 'ventus-ai' && activeTab !== 'ventus-ai-dashboard' && activeTab !== 'ventus-chat' && !chatOpen && (
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
            {(activeTab === 'ventus-ai' || activeTab === 'ventus-ai-dashboard' || activeTab === 'ventus-chat' || chatOpen) && (
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

        {/* Content + Chat Panel */}
        <div className="flex flex-1 min-h-0">
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

            {/* Persistent Ventus AI chat mount — keeps the conversation across tab switches. */}
            <div className={cn("h-full", activeTab === 'ventus-chat' ? "block" : "hidden")}>
              <VentusAIChatPage
                active={activeTab === 'ventus-chat'}
                pendingPrompt={activeTab === 'ventus-chat' ? pendingChatPrompt : null}
                onPendingPromptConsumed={() => setPendingChatPrompt(null)}
                onNavigate={(tab) => setActiveTab(tab as TabValue)}
              />
            </div>

          </div>

          {/* Chat Panel */}
          {chatOpen && activeTab !== 'ventus-ai' && activeTab !== 'ventus-ai-dashboard' && activeTab !== 'ventus-chat' && (
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
    </div>
  );
}
