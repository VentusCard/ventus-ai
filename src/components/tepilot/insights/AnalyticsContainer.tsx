import { useState, useRef, useEffect, useMemo } from "react";
import { prewarmDefaultCustomer } from "@/lib/personalizationResultStore";

import { BankwideView } from "./BankwideView";
import { SegmentTargetingView } from "../campaigns/SegmentTargetingView";
import { ProductAutomatedFlowsView } from "../campaigns/ProductAutomatedFlowsView";
import { ProductCampaignBuilderView } from "../campaigns/ProductCampaignBuilderView";
import { PersonalizedRelationshipView } from "./PersonalizedRelationshipView";
import { BankwideWMCopilotView } from "./BankwideWMCopilotView";

import { SubscriptionAnalyticsView } from "./SubscriptionAnalyticsView";

import { TabHeader } from "./TabHeader";
import { CapabilitiesView } from "./CapabilitiesView";
import { BankContextView } from "./BankContextView";
import { SettingsContainer } from "./SettingsContainer";
import { GovernanceView } from "../governance/GovernanceView";


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
  Zap, Megaphone, Layers, LogOut, Gem, ShieldCheck, Handshake, Search, Bell
} from "lucide-react";
import { PROMPT_GROUPS } from "./ventus-chat/PromptRail";

// First question from each Ventus AI prompt theme — shown in the header omnibox when empty.
const SUGGESTED_VENTUS_PROMPTS = PROMPT_GROUPS.map((g) => g.prompts[0]).filter(Boolean);


const HEADER_NOTIFICATIONS: { title: string; detail: string; time: string; tab?: string }[] = [
  { title: "12 new life events detected", detail: "Home purchase and new-child signals ready for outreach.", time: "8m ago", tab: "targeting" },
  { title: "Campaign approval pending", detail: "Premium Travel Card segment awaiting sign-off.", time: "1h ago", tab: "targeting-campaign-builder" },
  { title: "Wallet share alert", detail: "Outbound transfers up 6% in the affluent cohort.", time: "3h ago", tab: "growth-merchant-partnerships" },
];


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


export type TabValue = 'ventus-ai-dashboard' | 'ventus-chat' | 'customers' | 'ventus-ai' | 'capabilities' | 'products' | 'ai-assistant-activity' | 'analytics-dashboard' | 'reports' | 'report-lifestyle-pillars' | 'report-pillar-deep-dive' | 'report-cross-sell' | 'report-regional-spend' | 'report-outflow' | 'report-top-merchants' | 'report-subscription' | 'report-cohort-retention' | 'report-life-events' | 'report-fvi' | 'report-tier-migration' | 'report-life-event-funnel' | 'report-wallet-share' | 'report-travel-trips' | 'report-next-conversation' | 'report-priority-opportunity' | 'dashboard' | 'targeting' | 'targeting-automated-flows' | 'targeting-campaign-builder' | 'growth-merchant-partnerships' | 'wallet-share' | 'customer-insights' | 'personalized-deals' | 'gamification' | 'rewards-intelligence' | 'location-experience' | 'life-events' | 'deal-management' | 'wm-copilot' | 'subscription-analytics' | 'fvi-dashboard' | 'settings' | 'feedback' | 'governance' | 'personalized-relationship';

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
      
      { value: "governance", label: "Governance", icon: ShieldCheck },
    ],
  },
  {
    label: "Customer Intelligence",
    items: [
      {
        value: "ventus-ai-dashboard",
        label: "Intelligence Database",
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
      { value: "growth-merchant-partnerships", label: "Rewards and Perks", icon: Handshake },
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
  const [sidebarWidth, setSidebarWidth] = useState(340);
  const [isResizing, setIsResizing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef(0);
  const dragStartWidth = useRef(340);

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

  // Header omnibox: search and "Ask Ventus AI" are the same entry point.
  const askVentus = (question: string) => {
    const q = question.trim();
    if (!q) return;
    setSearchQuery("");
    setSearchOpen(false);
    setChatOpen(false);
    openVentusChat(q);
  };




  const MIN_SIDEBAR_WIDTH = 260;
  const MAX_SIDEBAR_WIDTH = 460;

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

  // Pre-fire generation for the default example customer (Ricky) once per
  // session as soon as the dashboard mounts, so his personalized surface is
  // cached before a banker opens a Personalization tab.
  useEffect(() => {
    prewarmDefaultCustomer();
  }, []);



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
    // Risk now lives as a sub-tab of the Intelligence Database; keep deep links valid.
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

  // All nav groups stay expanded by default; active group is always visible.
  const activeGroupLabel = useMemo(
    () => filteredNavGroups.find((g) => g.items.some((i) => i.value === activeTab))?.label,
    [filteredNavGroups, activeTab],
  );
  const [openGroups, setOpenGroups] = useState<Set<string>>(
    () => new Set(filteredNavGroups.map((g) => g.label)),
  );
  // Keep all groups expanded by default; only sync if the active group is newly added.
  useEffect(() => {
    if (activeGroupLabel && !openGroups.has(activeGroupLabel)) {
      setOpenGroups((prev) => new Set([...prev, activeGroupLabel]));
    }
  }, [activeGroupLabel]);
  const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Global header: breadcrumb label, workspace search, notifications
  const activeTabLabel = useMemo(() => {
    for (const g of filteredNavGroups) {
      const hit = g.items.find((i) => i.value === activeTab);
      if (hit) return hit.label;
    }
    if (activeTab === 'settings') return 'Settings';
    if (activeTab === 'feedback') return 'Feedback & Ideas';
    return 'Workspace';
  }, [filteredNavGroups, activeTab]);

  const [settingsTab, setSettingsTab] = useState<string>('general');
  useEffect(() => {
    const onOpenSettingsTab = (e: Event) => {
      const detail = (e as CustomEvent<{ tab?: string }>).detail;
      setSettingsTab(detail?.tab ?? 'general');
      setActiveTab('settings');
    };
    window.addEventListener('ventus:open-settings-tab', onOpenSettingsTab);
    return () => window.removeEventListener('ventus:open-settings-tab', onOpenSettingsTab);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");

  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return filteredNavGroups
      .flatMap((g) => g.items.map((i) => ({ ...i, group: g.label })))
      .filter((i) => i.label.toLowerCase().includes(q) || i.group.toLowerCase().includes(q))
      .slice(0, 8);
  }, [filteredNavGroups, searchQuery]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (searchRef.current && !searchRef.current.contains(t)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(t)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);


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
      case 'capabilities': return <CapabilitiesView onNavigate={setActiveTab} />;
      case 'products': return <BankContextView />;
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
      case 'settings': return <SettingsContainer initialTab={settingsTab} />;
      case 'feedback': return <FeedbackPage />;
    }
  };

  const navButtonClasses = (isActive: boolean, collapsed: boolean) => cn(
    "w-full flex items-center gap-3 text-left transition-colors",
    collapsed ? "justify-center px-0 py-2" : "px-3 py-2",
    isActive
      ? "text-[16px] font-semibold text-white bg-white/10 border-l-2 border-indigo-400 shadow-[0_0_12px_rgba(79,70,229,0.15)]"
      : "text-[15px] font-medium text-indigo-100/80 hover:bg-white/5 hover:text-white border-l-2 border-transparent"
  );

  const navIconClasses = (isActive: boolean) => cn(
    "w-4 h-4 shrink-0",
    isActive ? "text-teal-400" : "text-indigo-200/60"
  );

  return (
    <div className="w-full h-full flex border border-slate-200 overflow-hidden bg-white">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        style={collapsed ? undefined : { width: sidebarWidth }}
        className={cn(
          "relative shrink-0 h-full flex flex-col",
          "bg-[#141432]",
          collapsed ? "w-[52px] transition-all duration-200" : !isResizing && "transition-all duration-200"
        )}
      >
        <div
          onPointerDown={handleResizeStart}
          className={cn(
            "absolute top-0 right-0 z-10 h-full w-1.5 cursor-col-resize transition-colors",
            isResizing ? "bg-indigo-400" : "bg-transparent hover:bg-white/20"
          )}
          title="Drag to resize sidebar"
        />
        <div className="relative z-10 flex h-20 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-indigo-500/20">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-base font-bold leading-tight text-white">Our Bank</h1>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-indigo-200 transition-colors hover:bg-white/10 hover:text-white"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        <nav className="relative z-10 flex-1 overflow-y-auto py-1">
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
                    <div className="px-3 py-1.5 text-[13px] font-semibold uppercase tracking-wider text-indigo-100/90">
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
                <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-1.5 text-[13px] font-semibold uppercase tracking-wider text-indigo-100/90 hover:text-white">
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
      <div className="flex-1 min-w-0 flex flex-col min-h-0">
        {/* Consistent global header: breadcrumb · search · notifications · exit */}
        <div className="flex items-center justify-between gap-4 px-5 py-2.5 bg-white border-b border-slate-200 shrink-0">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 min-w-0">
            {onBack && (
              <Button variant="ghost" size="icon" className="text-slate-500 hover:bg-slate-100 hover:text-slate-900 shrink-0 h-8 w-8" onClick={onBack}>
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-[12px] min-w-0">
              <span className="text-slate-400">Our Bank</span>
              {activeGroupLabel && (
                <>
                  <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                  <span className="text-slate-400 capitalize truncate">{activeGroupLabel.toLowerCase()}</span>
                </>
              )}
              <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
              <span className="font-semibold text-slate-900 truncate">{activeTabLabel}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {/* Ask Ventus AI omnibox — search and AI are the same entry point */}
            <div className="relative" ref={searchRef}>
              <span className="ventus-ai-live-dot absolute left-2.5 top-1/2 -translate-y-1/2 z-10 pointer-events-none" aria-hidden="true" />
              <div className="w-72 h-8 rounded-xl p-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400 transition-shadow focus-within:shadow-[0_0_0_4px_rgba(99,102,241,0.22),0_0_20px_rgba(99,102,241,0.12)]">
                <input
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setSearchOpen(true); }}
                  onFocus={() => setSearchOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && searchQuery.trim()) {
                      e.preventDefault();
                      askVentus(searchQuery);
                    } else if (e.key === 'Escape') {
                      setSearchOpen(false);
                    }
                  }}
                  placeholder="Ask Ventus AI or search…"
                  aria-label="Ask Ventus AI or search the workspace"
                  className="w-full h-full pl-7 pr-3 rounded-[10px] border-0 bg-slate-50 text-[12px] text-slate-700 placeholder:text-slate-400 focus:outline-none focus:bg-white"
                />
              </div>
              {searchOpen && (
                <div className="absolute right-0 mt-1 w-80 max-h-80 overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg z-50 py-1">
                  {searchQuery.trim() ? (
                    <>
                      <button
                        onClick={() => askVentus(searchQuery)}
                        className="w-full flex items-start gap-2 px-3 py-2 text-left bg-indigo-50/60 hover:bg-indigo-50"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span className="min-w-0">
                          <span className="block text-[12px] font-medium text-slate-900 truncate">Ask Ventus AI: “{searchQuery.trim()}”</span>
                          <span className="block text-[10px] text-slate-500">Press Enter to run this question</span>
                        </span>
                      </button>
                      {searchResults.length > 0 && (
                        <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Go to</div>
                      )}
                      {searchResults.map((r) => {
                        const Icon = r.icon;
                        return (
                          <button
                            key={r.value}
                            onClick={() => { setActiveTab(r.value); setSearchQuery(""); setSearchOpen(false); }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-slate-50"
                          >
                            <Icon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="text-[12px] text-slate-700 truncate">{r.label}</span>
                            <span className="ml-auto text-[10px] text-slate-400 truncate">{r.group}</span>
                          </button>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      <div className="px-3 pt-1 pb-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">Suggested questions</div>
                      {SUGGESTED_VENTUS_PROMPTS.map((p) => (
                        <button
                          key={p}
                          onClick={() => askVentus(p)}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-slate-50"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="text-[12px] text-slate-700 truncate">{p}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {(activeTab === 'ventus-ai' || activeTab === 'ventus-ai-dashboard' || activeTab === 'ventus-chat' || chatOpen) && (
              <div className="ventus-ai-badge" aria-label="Ventus AI is active">
                <span className="ventus-ai-live-dot" aria-hidden="true" />
                <span>Ventus AI</span>
              </div>
            )}


            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="relative h-8 w-8 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors"
                title="Notifications"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {HEADER_NOTIFICATIONS.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[15px] h-[15px] px-1 rounded-full bg-indigo-600 text-white text-[9px] font-semibold flex items-center justify-center">
                    {HEADER_NOTIFICATIONS.length}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-1 w-80 rounded-md border border-slate-200 bg-white shadow-lg z-50">
                  <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                    Notifications
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1">
                    {HEADER_NOTIFICATIONS.map((n) => (
                      <button
                        key={n.title}
                        onClick={() => { setNotifOpen(false); if (n.tab) setActiveTab(n.tab as TabValue); }}
                        className="w-full text-left px-3 py-2 hover:bg-slate-50"
                      >
                        <div className="text-[12px] font-medium text-slate-900">{n.title}</div>
                        <div className="text-[11px] text-slate-500 leading-snug">{n.detail}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">{n.time}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Exit */}
            <button
              onClick={() => {
                sessionStorage.clear();
                window.location.href = "/bankdemo";
              }}
              className="h-8 w-8 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-colors"
              title="Exit demo"
              aria-label="Exit demo"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>


        {/* Content + Chat Panel */}
        <div className="flex flex-1 min-h-0 min-w-0">
          {/* Content */}
          <div ref={contentRef} className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 relative">
            {renderContent()}




            {/* Persistent Ventus AI chat mount — keeps the conversation across tab switches. */}
            <div className={cn("h-full", activeTab === 'ventus-chat' ? "block" : "hidden")}>
              <VentusAIChatPage
                active={activeTab === 'ventus-chat'}
                pendingPrompt={activeTab === 'ventus-chat' ? pendingChatPrompt : null}
                onPendingPromptConsumed={() => setPendingChatPrompt(null)}
                onNavigate={(tab) => setActiveTab(tab as TabValue)}
                onOpenOpportunity={(id) => openInteractiveReport('priority-opportunity', { opportunityId: id })}
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
