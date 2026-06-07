import { getProductFlow } from "./productAutomatedFlows";
import type { DemographicFilters } from "@/types/segment";

export interface LifestyleAssetSignal {
  id: string;
  label: string;
  description: string;
  detectionRate: number; // share of base population estimated to exhibit this
}

export const LIFESTYLE_ASSET_SIGNALS: LifestyleAssetSignal[] = [
  { id: "luxury-auto", label: "Luxury Auto Owner", description: "Service spend at luxury marques (Porsche, Mercedes, Tesla)", detectionRate: 0.038 },
  { id: "marine", label: "Marine / Boat Owner", description: "Marina slip fees, marine fuel, boat insurance ACH", detectionRate: 0.014 },
  { id: "private-aviation", label: "Private Aviation User", description: "Charter operator spend or fractional jet membership", detectionRate: 0.004 },
  { id: "country-club", label: "Country Club Member", description: "Recurring private club dues > $400/mo", detectionRate: 0.022 },
  { id: "fine-dining", label: "Fine Dining Frequent", description: "10+ check-average > $200 dining transactions per year", detectionRate: 0.061 },
  { id: "second-home", label: "Second Home Owner", description: "Two distinct property-tax or HOA recipients", detectionRate: 0.018 },
  { id: "private-school", label: "Private School Family", description: "Tuition ACH to K-12 independent school", detectionRate: 0.029 },
  { id: "equestrian", label: "Equestrian", description: "Boarding, tack, vet spend in equine merchant cluster", detectionRate: 0.005 },
  { id: "golf-club", label: "Golf Club Member", description: "Greens fees, pro shop, golf travel package", detectionRate: 0.046 },
  { id: "charter-yacht", label: "Charter Yacht", description: "Recurring or large charter operator card spend", detectionRate: 0.003 },
  { id: "watch-collector", label: "High-End Watch Collector", description: "Authorized dealer spend at Rolex, Patek, AP", detectionRate: 0.007 },
  { id: "philanthropy", label: "Charitable Donor (>$10k/yr)", description: "Aggregate annual giving > $10k across non-profits", detectionRate: 0.024 },
  { id: "private-banking", label: "Private Banking Indicator", description: "Avg deposit balance > $1M sustained 6+ months", detectionRate: 0.009 },
];

interface EstimateInput {
  productId: string;
  assetSignals: string[];
  lifeEvents: string[];
  pillars: string[];
  demographics: DemographicFilters;
}

const BASE_POPULATION = 250_000_000;

export function estimateAssetSignalAudience({
  productId,
  assetSignals,
  lifeEvents,
  pillars,
  demographics,
}: EstimateInput): number {
  const product = getProductFlow(productId);
  let size = BASE_POPULATION * (product?.penetration ?? 0.05);

  // Each asset signal narrows audience to people exhibiting it
  for (const id of assetSignals) {
    const sig = LIFESTYLE_ASSET_SIGNALS.find((s) => s.id === id);
    if (sig) size *= sig.detectionRate * 12; // boost: many signals correlate with target product
  }

  // Life events / pillars: each selection adds ~6% expansion if any, else multiplies by 0.6
  if (lifeEvents.length > 0) size *= 0.55 + lifeEvents.length * 0.08;
  if (pillars.length > 0) size *= 0.55 + pillars.length * 0.06;

  // Demographics
  if (demographics.ageRanges.length > 0 && demographics.ageRanges.length < 6) {
    size *= demographics.ageRanges.length / 6;
  }
  if (demographics.incomeBands.length > 0 && demographics.incomeBands.length < 4) {
    size *= demographics.incomeBands.length / 4;
  }
  if (demographics.regions.length > 0 && demographics.regions.length < 6) {
    size *= demographics.regions.length / 6;
  }
  if (demographics.accountTenure && demographics.accountTenure !== "all") {
    size *= 0.4;
  }

  return Math.max(0, Math.floor(size));
}
