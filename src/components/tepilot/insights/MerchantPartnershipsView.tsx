import { useState } from "react";
import { Handshake, Globe, MapPin, GitBranch, DollarSign, Users, Activity, Building2, Package, Gamepad2 } from "lucide-react";
import { TabHeader } from "./TabHeader";
import { SubTabBar } from "./SubTabBar";
import { CategoryExtensionOpportunities } from "./CategoryExtensionOpportunities";
import { DealsAndPerksView } from "./DealsAndPerksView";
import { GamificationManagement } from "./GamificationManagement";
import { NationalPartnersView } from "./partnerships/NationalPartnersView";
import { LocalPartnersView } from "./partnerships/LocalPartnersView";
import { BrandContactDialog, type ContactTarget } from "./partnerships/BrandContactDialog";
import { getPartnershipSummary } from "@/lib/merchantPartnershipData";
import { formatCurrency, formatNumber } from "@/lib/formatHelper";

interface Props {
  onLaunchCampaign?: (productName: string, offers: string[]) => void;
}

export function MerchantPartnershipsView({ onLaunchCampaign }: Props) {
  const [tab, setTab] = useState("national");
  const [contactTarget, setContactTarget] = useState<ContactTarget | null>(null);
  const summary = getPartnershipSummary();

  const kpis = [
    { label: "Partner targets", value: `${summary.partnerCount}`, sub: `${summary.nationalCount} national · ${summary.localCount} local`, icon: Building2 },
    { label: "Est. annual value", value: formatCurrency(summary.totalValue), sub: `${formatCurrency(summary.nationalValue)} national`, icon: DollarSign },
    { label: "Cardholders reached", value: `${(summary.reach / 1_000_000).toFixed(1)}M`, sub: "across national brands", icon: Users },
    { label: "Deals in motion", value: formatNumber(summary.inMotion), sub: "negotiating, contract, or live", icon: Activity },
  ];

  return (
    <div className="space-y-4">
      <TabHeader
        icon={<Handshake className="w-4 h-4" />}
        title="Rewards and Perks"
        subtitle="Plan brand partnerships, manage the deal and perk catalog, and run gamified engagement"
        howItWorks="Ventus ranks named national brands and local merchants by the spend already flowing through the card book, estimates the annual value of a co-funded partnership, resolves the right partnerships contact, and hands the resulting deals and perks to the activation and engagement programs."
        whyItMatters="Category codes describe what was bought. Named brands, sized value, a contact, and a live perk catalog turn that spend into signed partnership and co-marketing revenue."
      />

      <div className="grid grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="bg-slate-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <k.icon className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-500">{k.label}</span>
            </div>
            <p className="text-lg font-bold text-slate-900 mt-1">{k.value}</p>
            <p className="text-[11px] text-slate-400">{k.sub}</p>
          </div>
        ))}
      </div>

      <SubTabBar
        value={tab}
        onChange={setTab}
        items={[
          { value: "national", label: "National Partners", icon: <Globe className="w-3.5 h-3.5" /> },
          { value: "local", label: "Local Partners", icon: <MapPin className="w-3.5 h-3.5" /> },
          { value: "deals", label: "Deals & Perks", icon: <Package className="w-3.5 h-3.5" /> },
          { value: "gamification", label: "Gamification", icon: <Gamepad2 className="w-3.5 h-3.5" /> },
          { value: "bridges", label: "Behavioral Bridges", icon: <GitBranch className="w-3.5 h-3.5" /> },
        ]}
      />

      {tab === "national" && <NationalPartnersView onFindContact={setContactTarget} />}
      {tab === "local" && <LocalPartnersView onFindContact={setContactTarget} />}
      {tab === "deals" && (
        <div className="border border-slate-200 rounded-lg bg-white p-4">
          <DealsAndPerksView defaultTab="shopping" />
        </div>
      )}
      {tab === "gamification" && (
        <div className="border border-slate-200 rounded-lg bg-white p-4">
          <GamificationManagement hideHeader />
        </div>
      )}
      {tab === "bridges" && <CategoryExtensionOpportunities onLaunchCampaign={onLaunchCampaign} />}

      <BrandContactDialog target={contactTarget} onClose={() => setContactTarget(null)} />
    </div>
  );
}
