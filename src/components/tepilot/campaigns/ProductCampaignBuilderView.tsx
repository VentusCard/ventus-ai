import { useMemo, useState } from "react";
import { Megaphone } from "lucide-react";
import { TabHeader } from "@/components/tepilot/insights/TabHeader";
import { PRODUCT_CATALOG } from "@/lib/campaignStudioData";
import { adaptCatalogProduct } from "@/lib/catalogProductAdapter";
import { getProductVariants } from "@/lib/campaignCatalogVariants";
import { ProductPickerSection } from "./sections/ProductPickerSection";
import { ExclusionFunnelSection } from "./sections/ExclusionFunnelSection";
import { MessagePreviewsSection } from "./sections/MessagePreviewsSection";

const DEFAULT_CAMPAIGN_LINK = "https://www.ventusai.com";

export function ProductCampaignBuilderView() {
  const [productName, setProductName] = useState<string>("");
  const [offers, setOffers] = useState<string[]>([]);
  const [campaignLink, setCampaignLink] = useState<string>(DEFAULT_CAMPAIGN_LINK);

  const handleSelectProduct = (name: string) => {
    setProductName(name);
    setOffers([]);
    setCampaignLink(DEFAULT_CAMPAIGN_LINK);
  };

  const catalogProduct = useMemo(
    () => PRODUCT_CATALOG.find((p) => p.name === productName),
    [productName],
  );
  const flow = useMemo(
    () => (catalogProduct ? adaptCatalogProduct(catalogProduct) : undefined),
    [catalogProduct],
  );
  const variants = useMemo(
    () => (catalogProduct ? getProductVariants(catalogProduct) : undefined),
    [catalogProduct],
  );

  return (
    <div className="space-y-4">
      <TabHeader
        icon={<Megaphone className="w-4 h-4" />}
        title="Campaign Builder"
        subtitle="Pick a product, see who qualifies after risk filters, and preview the personalized campaigns it can author."
        howItWorks="44 products span six categories. Each product carries an additive variant budget — Spending Behavior × plays plus life-event hooks plus financial-goal hooks — that maps to the distinct campaigns the engine can anchor on."
        whyItMatters="Lets relationship managers reason about a single product end-to-end — mechanics, eligible audience, and the honest count of campaigns it can power — without leaving the tab."
      />

      <ProductPickerSection
        selectedName={productName}
        onSelect={handleSelectProduct}
        offers={offers}
        onOffersChange={setOffers}
        campaignLink={campaignLink}
        onCampaignLinkChange={setCampaignLink}
      />
      <ExclusionFunnelSection product={flow} />
      <MessagePreviewsSection
        product={catalogProduct}
        variants={variants}
        offers={offers}
        campaignLink={campaignLink}
      />

    </div>
  );
}

