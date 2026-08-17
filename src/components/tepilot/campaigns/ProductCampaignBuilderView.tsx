import { useCallback, useEffect, useMemo, useState } from "react";
import { Megaphone, Package, Wand2, Wallet } from "lucide-react";
import { TabHeader } from "@/components/tepilot/insights/TabHeader";
import { PRODUCT_CATALOG } from "@/lib/campaignStudioData";
import { adaptCatalogProduct } from "@/lib/catalogProductAdapter";
import { getProductVariants } from "@/lib/campaignCatalogVariants";
import { ProductPickerSection } from "./sections/ProductPickerSection";
import { ExclusionFunnelSection } from "./sections/ExclusionFunnelSection";
import { MessagePreviewsSection } from "./sections/MessagePreviewsSection";
import { SignalStudioView } from "./SignalStudioView";
import { WalletShareView } from "@/components/tepilot/insights/WalletShareView";
import { GoalIntentBar } from "./ai/GoalIntentBar";
import { AiCampaignBrief } from "./ai/AiCampaignBrief";
import { LaunchReadinessCard } from "./ai/LaunchReadinessCard";
import type { AiBriefContext, AiNextAction } from "@/lib/campaignAiEngine";
import type { GoalMatch } from "@/lib/campaignGoalMatcher";

export type BuilderMode = "product" | "signals" | "outflow";

const DEFAULT_CAMPAIGN_LINK = "https://www.ventusai.com";

export function ProductCampaignBuilderView({ initialMode = "product" }: { initialMode?: BuilderMode } = {}) {
  const [mode, setMode] = useState<BuilderMode>(initialMode);
  const [productName, setProductName] = useState<string>("");
  const [offers, setOffers] = useState<string[]>([]);
  const [campaignLink, setCampaignLink] = useState<string>(DEFAULT_CAMPAIGN_LINK);
  const [visibleStep, setVisibleStep] = useState<1 | 2 | 3>(1);
  const [audience, setAudience] = useState(0);
  const [baseAudience, setBaseAudience] = useState(0);
  const [guardrailsPassed, setGuardrailsPassed] = useState(false);
  const [goalExplanation, setGoalExplanation] = useState<string | null>(null);


  // Apply prefill payload from other views (e.g., Relationship Intelligence)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('ventus.campaignBuilder.prefill');
      if (!raw) return;
      const payload = JSON.parse(raw) as {
        productName?: string;
        offers?: string[];
        campaignLink?: string;
      };
      if (payload.productName) {
        setMode('product');
        setProductName(payload.productName);
        if (payload.offers) setOffers(payload.offers);
        if (payload.campaignLink) setCampaignLink(payload.campaignLink);
        setVisibleStep(3);
      }
      sessionStorage.removeItem('ventus.campaignBuilder.prefill');
    } catch {
      /* ignore */
    }
  }, []);

  const handleLaunchFromOutflow = (name: string, nextOffers: string[]) => {
    setMode("product");
    setProductName(name);
    setOffers(nextOffers);
    setCampaignLink(DEFAULT_CAMPAIGN_LINK);
    setVisibleStep(3);
  };

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

  useEffect(() => {
    if (!flow) {
      setAudience(0);
      setBaseAudience(0);
    } else if (visibleStep < 2) {
      setAudience(flow.estimatedAudience);
      setBaseAudience(flow.estimatedAudience);
    }
  }, [flow, visibleStep]);

  const handleAudienceChange = useCallback((next: number, base: number) => {
    setAudience(next);
    setBaseAudience(base);
  }, []);

  const aiCtx: AiBriefContext = {
    mode,
    productName,
    product: catalogProduct,
    audience,
    baseAudience,
    offers,
    campaignLink,
    step: visibleStep,
  };

  const handleGoalMatch = (match: GoalMatch, goal: string) => {
    setMode(match.mode);
    setGoalExplanation(`"${goal}" → ${match.explanation}`);
    if (match.mode === "product" && match.product) {
      setProductName(match.product.name);
      setOffers([]);
      setCampaignLink(DEFAULT_CAMPAIGN_LINK);
      setVisibleStep(2);
    }
  };

  const handleBriefAction = (action: AiNextAction) => {
    if (action.id.startsWith("select:")) {
      handleSelectProduct(action.id.slice("select:".length));
      return;
    }
    if (action.id === "advance" || action.id === "audience") {
      setVisibleStep((s) => (s < 3 ? ((s + 1) as 1 | 2 | 3) : s));
      return;
    }
    if (action.id === "messages") setVisibleStep(3);
  };



  const nextBtnClass =
    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-blue-600 disabled:hover:border-blue-600";

  const toggleBtn = (active: boolean) =>
    `inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
      active
        ? "bg-slate-900 text-white border-slate-900"
        : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
    }`;

  return (
    <div className="space-y-4">
      <TabHeader
        icon={<Megaphone className="w-4 h-4" />}
        title="Campaign Builder"
        subtitle="Build a campaign two ways: start from a product you want to push, or start from the signals you've extracted and let the engine recommend the products, audience, and channel."
        howItWorks="Product-first walks you through picker → exclusion funnel → personalized message previews. Signal-first lets you stack any signals across the five families and computes audience size, ranked best-fit products, and the recommended outreach channel."
        whyItMatters="Relationship managers can reason top-down from a product OR bottom-up from what the data is actually showing — without leaving the tab."
      />

      <GoalIntentBar onMatch={handleGoalMatch} lastExplanation={goalExplanation} />

      {/* Mode toggle */}
      <div className="inline-flex items-center gap-1 p-1 rounded-lg border border-slate-200 bg-slate-50">
        <button type="button" className={toggleBtn(mode === "product")} onClick={() => setMode("product")}>
          <Package className="w-3.5 h-3.5" />
          Start from a product
        </button>
        <button type="button" className={toggleBtn(mode === "signals")} onClick={() => setMode("signals")}>
          <Wand2 className="w-3.5 h-3.5" />
          Start from signals
        </button>
        <button type="button" className={toggleBtn(mode === "outflow")} onClick={() => setMode("outflow")}>
          <Wallet className="w-3.5 h-3.5" />
          Start from outflow
        </button>
      </div>


      {mode === "outflow" ? (
        <WalletShareView variant="growth" onLaunchCampaign={handleLaunchFromOutflow} />
      ) : mode === "signals" ? (
        <SignalStudioView embedded />
      ) : (
        <>

      <AiCampaignBrief ctx={aiCtx} onAction={handleBriefAction} />

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

      {visibleStep >= 2 && (
        <ExclusionFunnelSection
          product={flow}
          catalogProduct={catalogProduct}
          onAudienceChange={handleAudienceChange}
        />
      )}
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
        <>
          <MessagePreviewsSection
            product={catalogProduct}
            variants={variants}
            offers={offers}
            campaignLink={campaignLink}
            onGuardrailChange={setGuardrailsPassed}
          />
          <LaunchReadinessCard ctx={aiCtx} guardrailsPassed={guardrailsPassed} />
        </>
      )}
        </>

      )}
    </div>
  );
}
