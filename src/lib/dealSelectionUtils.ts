/**
 * Shared deal selection & profile derivation utilities.
 * Used by both TePilot DealActivationPreview and the Demo Rewards view.
 */
import { availableDeals as AVAILABLE_DEALS, type AvailableDeal } from "@/lib/availableDealsData";
import type { EnrichedTransaction } from "@/types/transaction";

// ─── Types ──────────────────────────────────────────────────────────────
export interface BankDeal {
  id: string;
  merchantName: string;
  merchantCategory: string;
  dealTitle: string;
  dealDescription: string;
  rewardValue: string;
  subcategory: string;
  popularity: string;
  activationCount: number;
}

export interface DerivedCustomerProfile {
  topPillars: Array<{ pillar: string; annualSpend: number; topMerchant: string; transactionCount: number }>;
  topMerchants: Array<{ merchant: string; totalSpend: number; visits: number; pillar: string }>;
  lifestyleSignals: string[];
  locationContext: { homeCity?: string; homeState?: string; travelDestinations: string[] };
  totalSpend: number;
  avgTransactionSize: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────
export const formatCurrency = (value: number): string =>
  value >= 1000 ? `$${(value / 1000).toFixed(1)}K` : `$${value.toFixed(0)}`;

// ─── Convert AvailableDeal → BankDeal ───────────────────────────────────
export function convertToBankDeal(deal: AvailableDeal): BankDeal {
  return {
    id: deal.id,
    merchantName: deal.merchantName,
    merchantCategory: deal.category,
    dealTitle: deal.dealTitle,
    dealDescription: deal.dealDescription,
    rewardValue: deal.rewardValue,
    subcategory: deal.subcategory,
    popularity: deal.popularity,
    activationCount: deal.activationCount,
  };
}

// ─── Derive customer profile from enriched transactions ─────────────────
export function deriveCustomerProfile(transactions: EnrichedTransaction[]): DerivedCustomerProfile {
  if (transactions.length === 0) {
    return { topPillars: [], topMerchants: [], lifestyleSignals: [], locationContext: { travelDestinations: [] }, totalSpend: 0, avgTransactionSize: 0 };
  }

  const pillarData: Record<string, { spend: number; merchants: Record<string, number>; count: number }> = {};
  transactions.forEach(t => {
    const pillar = t.pillar || "Other";
    if (!pillarData[pillar]) pillarData[pillar] = { spend: 0, merchants: {}, count: 0 };
    pillarData[pillar].spend += t.amount;
    pillarData[pillar].count += 1;
    const merchant = t.merchant_name || "Unknown";
    pillarData[pillar].merchants[merchant] = (pillarData[pillar].merchants[merchant] || 0) + t.amount;
  });

  const topPillars = Object.entries(pillarData)
    .map(([pillar, data]) => {
      const topMerchant = Object.entries(data.merchants).sort((a, b) => b[1] - a[1])[0]?.[0] || "Various";
      return { pillar, annualSpend: data.spend, topMerchant, transactionCount: data.count };
    })
    .sort((a, b) => b.annualSpend - a.annualSpend)
    .slice(0, 5);

  const merchantData: Record<string, { spend: number; visits: number; pillar: string }> = {};
  transactions.forEach(t => {
    const merchant = t.merchant_name || "Unknown";
    if (!merchantData[merchant]) merchantData[merchant] = { spend: 0, visits: 0, pillar: t.pillar || "Other" };
    merchantData[merchant].spend += t.amount;
    merchantData[merchant].visits += 1;
  });

  const topMerchants = Object.entries(merchantData)
    .map(([merchant, data]) => ({ merchant, totalSpend: data.spend, visits: data.visits, pillar: data.pillar }))
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 10);

  const lifestyleSignals: string[] = [];
  topPillars.forEach(p => {
    if (p.pillar === "Travel & Exploration" && p.annualSpend > 2000) lifestyleSignals.push("frequent traveler");
    if (p.pillar === "Sports & Active Living" && p.annualSpend > 1000) lifestyleSignals.push("fitness enthusiast");
    if (p.pillar === "Food & Dining" && p.annualSpend > 3000) lifestyleSignals.push("food connoisseur");
    if (p.pillar === "Entertainment & Culture" && p.annualSpend > 1500) lifestyleSignals.push("experience seeker");
    if (p.pillar === "Style & Beauty" && p.annualSpend > 2000) lifestyleSignals.push("style-conscious");
    if (p.pillar === "Health & Wellness" && p.annualSpend > 1500) lifestyleSignals.push("health-focused");
  });

  const travelDestinations: string[] = [];
  transactions.forEach(t => {
    if (t.travel_context?.is_travel_related && t.travel_context?.travel_destination && t.travel_context.travel_destination !== "unknown") {
      if (!travelDestinations.includes(t.travel_context.travel_destination)) travelDestinations.push(t.travel_context.travel_destination);
    }
  });

  const totalSpend = transactions.reduce((sum, t) => sum + t.amount, 0);

  return {
    topPillars,
    topMerchants,
    lifestyleSignals: lifestyleSignals.length > 0 ? lifestyleSignals : ["active spender"],
    locationContext: { travelDestinations: travelDestinations.slice(0, 5) },
    totalSpend,
    avgTransactionSize: totalSpend / transactions.length,
  };
}

// ─── Select relevant deals from the library ─────────────────────────────
export function getRelevantDeals(profile: DerivedCustomerProfile, maxDeals = 8): BankDeal[] {
  const customerPillars = profile.topPillars.map(p => p.pillar);

  if (customerPillars.length === 0) {
    return AVAILABLE_DEALS.filter(d => d.popularity === "featured" || d.popularity === "trending").slice(0, maxDeals).map(convertToBankDeal);
  }

  const topPillarNames = customerPillars.slice(0, 3);
  const popularityOrder: Record<string, number> = { trending: 0, featured: 1, popular: 2, new: 3 };

  const relevantDeals = AVAILABLE_DEALS
    .filter(deal => topPillarNames.includes(deal.category))
    .sort((a, b) => (popularityOrder[a.popularity] ?? 4) - (popularityOrder[b.popularity] ?? 4))
    .slice(0, maxDeals - 2)
    .map(convertToBankDeal);

  // Add a couple of discovery deals from outside their pillars
  const discoveryDeals = AVAILABLE_DEALS
    .filter(deal => !topPillarNames.includes(deal.category) && (deal.popularity === "trending" || deal.popularity === "featured"))
    .slice(0, 2)
    .map(convertToBankDeal);

  return [...relevantDeals, ...discoveryDeals].slice(0, maxDeals);
}
