import { useState } from "react";
import { ShieldCheck, Package, MapPin, Users, Crown } from "lucide-react";
import { SubTabBar } from "../insights/SubTabBar";
import { TabHeader } from "../insights/TabHeader";
import { GovernanceView } from "./GovernanceView";
import {
  ProductsPanel,
  LocationsPanel,
  DepartmentsPanel,
  SegmentsPanel,
} from "../insights/BankContextView";

type GovernanceContextSubTab = "governance" | "products" | "locations" | "departments" | "segments";

const SUB_TABS = [
  { value: "governance", label: "Governance", icon: <ShieldCheck className="w-3.5 h-3.5" /> },
  { value: "products", label: "Products", icon: <Package className="w-3.5 h-3.5" /> },
  { value: "locations", label: "Locations & Hours", icon: <MapPin className="w-3.5 h-3.5" /> },
  { value: "departments", label: "Departments", icon: <Users className="w-3.5 h-3.5" /> },
  { value: "segments", label: "Segments & Tiers", icon: <Crown className="w-3.5 h-3.5" /> },
];

export function GovernanceContextView() {
  const [subTab, setSubTab] = useState<GovernanceContextSubTab>("governance");

  return (
    <div className="space-y-4">
      <TabHeader
        icon={<ShieldCheck className="w-4 h-4" />}
        title="Governance & Context"
        subtitle="Set how far personalization goes, and the operating context that shapes what Ventus can recommend"
        howItWorks="Choose a personalization level, enable the signal families your institution permits, upload the compliance and brand documents Ventus must respect, and set the operating guardrails. Then define the bank context referenced by every downstream module: the product catalog, the branch and ATM footprint, the servicing org and escalation paths, and the customer segment/tier thresholds."
        whyItMatters="Personalization only scales when leadership can see and change its limits, and every recommendation must fit who the bank can serve, what it can offer, and which team owns the relationship."
      />
      <SubTabBar items={SUB_TABS} value={subTab} onChange={(v) => setSubTab(v as GovernanceContextSubTab)} />
      {subTab === "governance" && <GovernanceView hideHeader />}
      {subTab === "products" && <ProductsPanel />}
      {subTab === "locations" && <LocationsPanel />}
      {subTab === "departments" && <DepartmentsPanel />}
      {subTab === "segments" && <SegmentsPanel />}
    </div>
  );
}
