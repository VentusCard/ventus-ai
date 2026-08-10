import { Handshake } from "lucide-react";
import { TabHeader } from "./TabHeader";
import { CategoryExtensionOpportunities } from "./CategoryExtensionOpportunities";

interface Props {
  onLaunchCampaign?: (productName: string, offers: string[]) => void;
}

export function MerchantPartnershipsView({ onLaunchCampaign }: Props) {
  return (
    <div className="space-y-4">
      <TabHeader
        icon={<Handshake className="w-4 h-4" />}
        title="Merchant Partnerships"
        subtitle="Behaviorally adjacent products and merchant partners that category codes alone can never connect"
        howItWorks="Ventus bridges an enriched spending subcategory to an adjacent product a customer is likely to want next, then sizes the addressable audience, revenue, and the deployment window when that spend peaks."
        whyItMatters="Category codes describe what was bought. The behavioral bridge shows what should be offered next — turning existing spend into merchant partnership and co-marketing revenue."
      />

      <CategoryExtensionOpportunities onLaunchCampaign={onLaunchCampaign} />
    </div>
  );
}
