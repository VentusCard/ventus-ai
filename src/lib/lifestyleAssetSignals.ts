import { getProductFlow } from "./productAutomatedFlows";
import type { DemographicFilters } from "@/types/segment";

export interface LifestyleAssetSignal {
  id: string;
  label: string;
  description: string;
  detectionRate: number; // share of base population estimated to exhibit this
}

interface EstimateInput {
  productId: string;
  selectedSignals: LifestyleAssetSignal[];
  lifeEvents: string[];
  pillars: string[];
  demographics: DemographicFilters;
  /** Count of selected Financial Signal chips (System tab family). */
  financialSignalCount?: number;
  /** Count of selected Risk Signal chips (System tab family). */
  riskSignalCount?: number;
  /** Count of selected inferred Demographic Signal chips (beyond KYC). */
  demographicSignalCount?: number;
}

const BASE_POPULATION = 250_000_000;

export function estimateAssetSignalAudience({
  productId,
  selectedSignals,
  lifeEvents,
  pillars,
  demographics,
  financialSignalCount = 0,
  riskSignalCount = 0,
  demographicSignalCount = 0,
}: EstimateInput): number {
  const product = getProductFlow(productId);
  let size = BASE_POPULATION * (product?.penetration ?? 0.05);

  for (const sig of selectedSignals) {
    const rate = sig.detectionRate || 0.02;
    size *= rate * 12; // boost: signals strongly correlate with target product
  }

  if (lifeEvents.length > 0) size *= 0.55 + lifeEvents.length * 0.08;
  if (pillars.length > 0) size *= 0.55 + pillars.length * 0.06;

  // Financial signals narrow the audience to qualified balances/cash-flow.
  if (financialSignalCount > 0) {
    size *= Math.max(0.25, 0.85 - financialSignalCount * 0.1);
  }
  // Risk signals act as inclusion filters (clean credit, no fraud, etc.).
  if (riskSignalCount > 0) {
    size *= Math.max(0.3, 0.9 - riskSignalCount * 0.08);
  // Inferred demographic signals narrow to the specific household pattern.
  if (demographicSignalCount > 0) {
    size *= Math.max(0.2, 0.8 - demographicSignalCount * 0.12);
  }



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
