import { useState } from "react";
import { SubTabBar } from "./SubTabBar";
import { WalletShareView } from "./WalletShareView";
import { BankwideView } from "./BankwideView";
import { SubscriptionAnalyticsView } from "./SubscriptionAnalyticsView";
import { Wallet, Layers, Repeat } from "lucide-react";

type AnalyticsSubTab = "outflow" | "pillars" | "subscriptions";

const SUB_TABS = [
  { value: "outflow", label: "Outflow & Wallet Share", icon: <Wallet className="w-3.5 h-3.5" /> },
  { value: "pillars", label: "Portfolio Pillars", icon: <Layers className="w-3.5 h-3.5" /> },
  { value: "subscriptions", label: "Subscription Analytics", icon: <Repeat className="w-3.5 h-3.5" /> },
];

export function AnalyticsView() {
  const [subTab, setSubTab] = useState<AnalyticsSubTab>("outflow");

  return (
    <div className="space-y-4">
      <SubTabBar items={SUB_TABS} value={subTab} onChange={(v) => setSubTab(v as AnalyticsSubTab)} />
      {subTab === "outflow" && <WalletShareView groupOutflowsByType />}
      {subTab === "pillars" && <BankwideView />}
      {subTab === "subscriptions" && <SubscriptionAnalyticsView />}
    </div>
  );
}
