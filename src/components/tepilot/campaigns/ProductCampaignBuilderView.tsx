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
  const [visibleStep, setVisibleStep] = useState<1 | 2 | 3>(1);

  const handleSelectProduct = (name: string) => {
    setProductName(name);
    setOffers([]);
    setCampaignLink(DEFAULT_CAMPAIGN_LINK);
    setVisibleStep(1);
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

  const nextBtnClass =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:text-slate-600 disabled:hover:border-slate-200";

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
      {visibleStep === 1 && (
        <div className="flex justify-end">
          <button
            type="button"
            className={nextBtnClass}
            disabled={!productName}
            onClick={() => setVisibleStep(2)}
          >
            Next step →
          </button>
        </div>
      )}

      {visibleStep >= 2 && <ExclusionFunnelSection product={flow} />}
      {visibleStep === 2 && (
        <div className="flex justify-end">
          <button
            type="button"
            className={nextBtnClass}
            onClick={() => setVisibleStep(3)}
          >
            Next step →
          </button>
        </div>
      )}

      {visibleStep >= 3 && (
        <MessagePreviewsSection
          product={catalogProduct}
          variants={variants}
          offers={offers}
          campaignLink={campaignLink}
        />
      )}
    </div>
  );
}
