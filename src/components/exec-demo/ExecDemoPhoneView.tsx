import { useState, useEffect } from "react";
import { Gift, Users, Bot, CreditCard, Wifi, Battery, Layers } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import type { DemoCustomer } from "@/lib/demoData";

import ConsumerAIChatView from "@/components/demo/ConsumerAIChatView";
import GeneratedOffersPhoneView from "./GeneratedOffersPhoneView";
import ProductCardsPhoneView, { type ProductCard } from "./ProductCardsPhoneView";
import RelationshipPhoneView from "./RelationshipPhoneView";
import type { RollupOfferGroup } from "./NextOfferRationale";
import type { LifeEvent } from "@/types/lifestyle-signals";

type TabKey = "analytics" | "rewards" | "product" | "relationship";
type ConsumerTab = "rewards" | "product" | "relationship" | "ai";

const TAB_MAP: Record<TabKey, ConsumerTab> = {
  analytics: "rewards",
  rewards: "rewards",
  product: "product",
  relationship: "ai",
};

const CONSUMER_TABS: { key: ConsumerTab; label: string; icon: typeof Gift; color: string }[] = [
  { key: "rewards", label: "Rewards", icon: Gift, color: "#22c55e" },
  { key: "product", label: "Offers", icon: CreditCard, color: "#6366f1" },
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
}

export default function ExecDemoPhoneView({ customer, activeTab, phase, showContent = false, generatedOffers, detectedLifeEvents, productCards, activeRollupLabel, activeRollupPillar }: Props) {
  const mappedTab: ConsumerTab = activeTab ? TAB_MAP[activeTab] : "rewards";
  const [consumerTab, setConsumerTab] = useState<ConsumerTab>(mappedTab);
  const [pendingAIMessage, setPendingAIMessage] = useState<string | null>(null);
  const [focusMode, setFocusMode] = useState(true);

  // Sync with external activeTab changes
  useEffect(() => {
    setConsumerTab(mappedTab);
  }, [mappedTab]);

  const renderContent = () => {
    switch (consumerTab) {
      case "rewards":
        if (generatedOffers && generatedOffers.length > 0) {
          return <GeneratedOffersPhoneView offerGroups={generatedOffers} customerName={customer.profile.name} focusMode={focusMode} activeRollupLabel={activeRollupLabel} activeRollupPillar={activeRollupPillar} />;
        }
        return (
          <div className="flex items-center justify-center h-full">
            <span className="text-[11px] text-slate-300">Personalizing rewards...</span>
          </div>
        );
      case "product":
        if (productCards && productCards.length > 0) {
          return <ProductCardsPhoneView cards={productCards} customerName={customer.profile.name} />;
        }
        return (
          <div className="flex items-center justify-center h-full">
            <span className="text-[11px] text-slate-300">Detecting life events...</span>
          </div>
        );
      case "relationship":
        return <RelationshipPhoneView customer={customer} detectedLifeEvents={detectedLifeEvents} onGoToAI={(msg) => { setPendingAIMessage(msg); setConsumerTab("ai"); }} />;
      case "ai":
        return <ConsumerAIChatView customer={customer} initialMessage={pendingAIMessage} onInitialMessageConsumed={() => setPendingAIMessage(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="relative flex items-center justify-center h-full py-4">
      {/* iPhone frame */}
      <div
        className="phone-mockup-frame relative rounded-[40px] bg-white shadow-2xl border-[6px] border-slate-200 overflow-hidden flex flex-col"
        style={{ width: 340, height: 740 }}
      >
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-200 rounded-b-2xl z-10" />

        {/* Status bar */}
        <div className="h-10 bg-white flex items-end justify-between px-6 pb-1 text-[9px] text-slate-400 font-medium shrink-0">
          <span>9:41</span>
          <span className="flex items-center gap-1">
            <Wifi className="w-2.5 h-2.5" />
            <Battery className="w-3 h-3" />
          </span>
        </div>

        {/* Header */}
        <div className="px-4 py-1.5 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            <span className="text-[10px] font-semibold text-slate-600 tracking-wide">
              TCBY Bank · {customer.profile.name.split(" ")[0]}
            </span>
          </div>
          {(consumerTab === 'product' || consumerTab === 'ai') && <span className="text-[8px] text-slate-400 px-1">Using Bank of America product information as reference.</span>}
        </div>

        {/* Content */}
        <div className={`flex-1 min-h-0 bg-white ${(consumerTab === 'ai') ? 'overflow-hidden flex flex-col' : 'overflow-y-auto exec-light-scroll'}`}>
          {showContent ? (
            renderContent()
          ) : (
            <div className="flex items-center justify-center h-full">
              <span className="text-[11px] text-slate-300">Waiting for analysis...</span>
            </div>
          )}
        </div>

        {/* Bottom Tab Bar */}
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

        {/* Home indicator */}
        <div className="h-5 flex items-center justify-center shrink-0">
          <div className="w-24 h-1 rounded-full bg-slate-200" />
        </div>
      </div>

      {/* Focus mode toggle — only on Rewards tab when offers are loaded */}
      {consumerTab === "rewards" && generatedOffers && generatedOffers.length > 0 && showContent && !activeRollupLabel && (
        <div className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-white border border-slate-200 shadow-sm px-3 py-1.5">
          <Layers className="w-3 h-3 text-slate-500" />
          <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Focus</span>
          <Switch checked={focusMode} onCheckedChange={setFocusMode} className="scale-75 origin-center" />
        </div>
      )}
    </div>
  );
}
