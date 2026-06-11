import { useState } from "react";
import { Megaphone } from "lucide-react";
import { TabHeader } from "@/components/tepilot/insights/TabHeader";
import { PRODUCT_FLOWS, getProductFlow } from "@/lib/productAutomatedFlows";
import { ProductPickerSection } from "./sections/ProductPickerSection";
import { ExclusionFunnelSection } from "./sections/ExclusionFunnelSection";
import { MessagePreviewsSection } from "./sections/MessagePreviewsSection";

export function ProductCampaignBuilderView() {
  const [productId, setProductId] = useState<string>("");
  const product = getProductFlow(productId);

  return (
    <div className="space-y-4">
      <TabHeader
        icon={<Megaphone className="w-4 h-4" />}
        title="Campaign Builder"
        subtitle="Pick a product, see who qualifies after risk filters, and preview three personalized angles."
        howItWorks="Every product from the Automated Flows catalog is loaded here. Selecting one surfaces how the product works, who the addressable audience becomes after financial and behavioral risk filters, and three sample messages personalized along different angles."
        whyItMatters="Lets relationship managers reason about a single product end-to-end — mechanics, eligible audience, and tone of voice — without leaving the tab."
      />

      <ProductPickerSection selectedId={productId} onSelect={setProductId} />
      <ExclusionFunnelSection product={product} />
      <MessagePreviewsSection product={product} />
    </div>
  );
}
