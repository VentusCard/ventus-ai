import { useState, useEffect } from "react";
import { Gift, Users, Bot, Wallet, Wifi, Battery } from "lucide-react";
import type { DemoCustomer } from "@/lib/demoData";
import { getDemoBankConfig } from "@/lib/demoBankConfig";

import ConsumerAIChatView from "@/components/demo/ConsumerAIChatView";
import GeneratedOffersPhoneView from "./GeneratedOffersPhoneView";
import ProductCardsPhoneView, { type ProductCard } from "./ProductCardsPhoneView";
import RelationshipPhoneView from "./RelationshipPhoneView";
import AdvisorConversationTabletView from "./AdvisorConversationTabletView";
import BudgetPhoneView from "./BudgetPhoneView";
import EmailPreviewPhoneView from "./phone-channels/EmailPreviewPhoneView";
import SmsPreviewPhoneView from "./phone-channels/SmsPreviewPhoneView";
import type { ProductDeliveryChannel } from "./ProductDeliveryChannelCard";
import type { RollupOfferGroup } from "./NextOfferRationale";
import type { LifeEvent } from "@/types/lifestyle-signals";
import type { EnrichedTransaction } from "@/components/exec-demo/execDemoData";
import type { SelectedSignal } from "./NextConversationRationale";

type TabKey = "analytics" | "rewards" | "product" | "relationship";
type ConsumerTab = "rewards" | "relationship" | "budget" | "ai";

const TAB_MAP: Record<TabKey, ConsumerTab> = {
  analytics: "rewards",
  rewards: "rewards",
  product: "relationship",
  relationship: "ai",
};

const CONSUMER_TABS: { key: ConsumerTab; label: string; icon: typeof Gift; color: string }[] = [
  { key: "budget", label: "Budget", icon: Wallet, color: "#0ea5e9" },
  { key: "rewards", label: "Rewards", icon: Gift, color: "#22c55e" },
  { key: "relationship", label: "Membership", icon: Users, color: "#8b5cf6" },
  { key: "ai", label: "AI", icon: Bot, color: "#3b82f6" },
];

interface Props {
  customer: DemoCustomer;
  activeTab: TabKey | null;
  phase: string;
  showContent?: boolean;
  generatedOffers?: RollupOfferGroup[] | null;
  detectedLifeEvents?: LifeEvent[] | null;
  productCards?: ProductCard[] | null;
  activeRollupLabel?: string | null;
  activeRollupPillar?: string | null;
  enrichedTxs?: EnrichedTransaction[] | null;
  riskFlags?: { flags: any[]; summary: string } | null;
  productDeliveryChannel?: ProductDeliveryChannel;
  aiTabTrigger?: number;
  pendingAIPrompt?: { text: string; nonce: number; kind?: "lifestyle" | "lifeEvent" | "risk"; signalContext?: string } | null;
  /** Persistent grounding context appended to every consumer-chat request (demo mock-up mode). */
  chatSignalContext?: string;
  /** When true, the right phone panel renders the WM CoPilot view instead of the customer mockup. */
  wmCopilotMode?: boolean;
  /** Currently selected signal driving the WM CoPilot brief. */
  wmCopilotSignal?: SelectedSignal | null;
  /** Optional secondary signal label (e.g., "Home Purchase Planning") combined into the customer summary. */
  wmCopilotSecondarySignal?: string | null;
  /** Persona context for personalized AI outreach pointers. */
  wmCopilotPersonaTitle?: string;
  wmCopilotPersonaSummary?: string;
  /** Called when the user closes the WM CoPilot view from inside the phone. */
  onCloseWMCopilot?: () => void;
  /** Device frame chrome: "default" (chunky demo bezel) or "compact" (thin bezel for embedded workspaces). */
  frame?: "default" | "compact";
}

export default function ExecDemoPhoneView({ customer, activeTab, phase, showContent = false, generatedOffers, detectedLifeEvents, productCards, activeRollupLabel, activeRollupPillar, enrichedTxs, riskFlags, aiTabTrigger, pendingAIPrompt, chatSignalContext, wmCopilotMode = false, wmCopilotSignal = null, wmCopilotSecondarySignal = null, wmCopilotPersonaTitle, wmCopilotPersonaSummary, onCloseWMCopilot, productDeliveryChannel = "mobile", frame = "default" }: Props) {
  const isCompactFrame = frame === "compact";
  const mappedTab: ConsumerTab = activeTab ? TAB_MAP[activeTab] : "rewards";
  const [consumerTab, setConsumerTab] = useState<ConsumerTab>(mappedTab);
  const [pendingAIMessage, setPendingAIMessage] = useState<string | null>(null);
  const firstName = (customer.profile?.name ?? "").split(" ")[0] || "there";
  const bankCfg = getDemoBankConfig();
  const bankLabel = "Our Bank";
  

  // Sync with external activeTab changes
  useEffect(() => {
    setConsumerTab(mappedTab);
  }, [mappedTab]);

  // External trigger to force AI tab (e.g. from "Open AI Banking Assistant" button or pill clicks)
  useEffect(() => {
    if (aiTabTrigger && aiTabTrigger > 0) {
      setConsumerTab("ai");
    }
  }, [aiTabTrigger]);

  // When a pill dispatches a new prompt, queue it for the chat view and switch to AI tab
  useEffect(() => {
    if (pendingAIPrompt && pendingAIPrompt.text) {
      setPendingAIMessage(pendingAIPrompt.text);
      setConsumerTab("ai");
    }
  }, [pendingAIPrompt]);

  const renderContent = () => {
    switch (consumerTab) {
      case "rewards":
        if (generatedOffers && generatedOffers.length > 0) {
          return <GeneratedOffersPhoneView offerGroups={generatedOffers} customerName={customer.profile.name} focusMode={false} activeRollupLabel={activeRollupLabel} activeRollupPillar={activeRollupPillar} />;
        }
        return (
          <div className="flex items-center justify-center h-full">
            <span className="text-[11px] text-slate-300">Personalizing rewards...</span>
          </div>
        );
      case "relationship":
        if (productDeliveryChannel === "email") {
          return <EmailPreviewPhoneView cards={productCards ?? []} customerName={customer.profile?.name} bankLabel={bankLabel} />;
        }
        if (productDeliveryChannel === "sms") {
          return <SmsPreviewPhoneView cards={productCards ?? []} customerName={customer.profile?.name} bankLabel={bankLabel} />;
        }
        return <RelationshipPhoneView customer={customer} detectedLifeEvents={detectedLifeEvents} productCards={productCards} onGoToAI={(msg) => { setPendingAIMessage(msg); setConsumerTab("ai"); }} />;
      case "budget":
        return <BudgetPhoneView enrichedTxs={enrichedTxs} />;
      case "ai": {
        const personalizedDeals = generatedOffers && generatedOffers.length > 0
          ? {
              deals: generatedOffers.flatMap((g) =>
                (g.deals || []).map((o) => ({
                  merchantName: o.merchant,
                  dealTitle: `${o.product} — ${o.message}`,
                  activationCount: 90,
                }))
              ),
            }
          : null;
        const detectedEvents = detectedLifeEvents?.map((e) => ({
          event_name: e.event_name,
          confidence: e.confidence,
          talking_points: e.talking_points,
          evidence: (e as any).evidence ?? [],
        })) as any;
        return (
          <ConsumerAIChatView
            customer={customer}
            enriched={(enrichedTxs ?? undefined) as any}
            detectedEvents={detectedEvents}
            personalizedDeals={personalizedDeals as any}
            offerGroups={generatedOffers ?? null}
            productRecommendations={productCards ?? null}
            riskFlags={riskFlags ?? undefined}
            initialMessage={pendingAIMessage}
            messageNonce={pendingAIPrompt?.nonce}
            initialMessageKind={pendingAIPrompt?.kind}
            initialMessageContext={pendingAIPrompt?.signalContext}
            baseSignalContext={chatSignalContext}
            onInitialMessageConsumed={() => setPendingAIMessage(null)}
          />
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className={`relative flex items-center justify-center h-full ${isCompactFrame ? "p-0" : "p-3"}`}>
      {/* iPad frame */}
      <div
        className={`phone-mockup-frame relative bg-white shadow-2xl overflow-hidden flex flex-col w-full h-full ${
          isCompactFrame
            ? "rounded-[16px] border-[6px] border-slate-300"
            : "rounded-[20px] border-[12px] border-slate-300"
        }`}
      >
        {/* Camera dot */}
        <div className={`flex justify-center bg-white shrink-0 ${isCompactFrame ? "pt-1 pb-0.5" : "pt-1.5 pb-0.5"}`}>
          <div className="w-2 h-2 rounded-full bg-slate-300" />
        </div>

        {/* Zoomed inner stack */}
        <div className="flex-1 min-h-0 flex flex-col" style={{ zoom: 1.1 }}>
          {/* Status bar */}
          <div className="flex items-center justify-between px-5 py-1 bg-white text-[10px] text-slate-400 font-medium shrink-0">
            {wmCopilotMode ? <span /> : <span>9:41 AM</span>}
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span className="font-semibold text-slate-600 text-[11px]">
                {wmCopilotMode ? `${bankLabel} · Advisor` : `${bankLabel} · ${firstName}`}
              </span>
            </div>
            {wmCopilotMode ? (
              <span />
            ) : (
              <div className="flex items-center gap-1.5">
                <Wifi className="w-3 h-3" />
                <Battery className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className={`flex-1 min-h-0 bg-white ${(consumerTab === 'ai' || wmCopilotMode) ? 'overflow-hidden flex flex-col' : 'overflow-y-auto exec-light-scroll'}`}>
            {wmCopilotMode ? (
              <AdvisorConversationTabletView onClose={() => onCloseWMCopilot?.()} />
            ) : showContent ? (
              renderContent()
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-[11px] text-slate-300">Waiting for analysis...</span>
              </div>
            )}
          </div>

          {/* Bottom Tab Bar — hidden in WM CoPilot mode */}
          {!wmCopilotMode && (
            <div className="flex shrink-0 border-t border-slate-200 bg-slate-50/80 px-2">
              {CONSUMER_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = consumerTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setConsumerTab(tab.key)}
                    className="flex-1 flex flex-col items-center gap-0.5 py-2 transition-all relative cursor-pointer"
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: isActive ? tab.color : "#94a3b8" }} />
                    <span className="text-[9px] font-semibold" style={{ color: isActive ? tab.color : "#94a3b8" }}>
                      {tab.label}
                    </span>
                    {isActive && (
                      <div className="absolute top-0 left-1/4 right-1/4 h-[2px] rounded-full" style={{ background: tab.color }} />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
