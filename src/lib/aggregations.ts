import {
  Transaction,
  EnrichedTransaction,
  Correction,
  Filters,
  MCCAggregate,
  PillarAggregate,
  PillarAggregateWithSegments,
  PillarSegment,
  SubcategoryData,
  TimeSeriesData,
  PieChartData,
  SankeyData,
} from "@/types/transaction";
import { PILLAR_COLORS } from "./sampleData";
import { isIncome } from "./transactionFlow";

// Strip income rows so spend totals/charts don't include paychecks/deposits.
const stripIncome = <T extends { merchant_name?: string; merchant?: string; description?: string }>(txs: T[]): T[] =>
  txs.filter((t) => !isIncome(t));

// MCC-based aggregations
export function aggregateByMCC(transactions: Transaction[]): MCCAggregate[] {
  const mccMap = new Map<string, { totalSpend: number; count: number }>();

  transactions.forEach((t) => {
    const mcc = t.mcc || "Unknown";
    const existing = mccMap.get(mcc) || { totalSpend: 0, count: 0 };
    mccMap.set(mcc, {
      totalSpend: existing.totalSpend + t.amount,
      count: existing.count + 1,
    });
  });

  return Array.from(mccMap.entries())
    .map(([mcc, data]) => ({
      mcc,
      totalSpend: data.totalSpend,
      transactionCount: data.count,
      avgAmount: data.totalSpend / data.count,
    }))
    .sort((a, b) => b.totalSpend - a.totalSpend);
}

export function aggregateMCCTimeSeries(transactions: Transaction[]): TimeSeriesData[] {
  const dateMap = new Map<string, Record<string, number>>();

  transactions.forEach((t) => {
    const mcc = t.mcc || "Unknown";
    const existing = dateMap.get(t.date) || {};
    existing[mcc] = (existing[mcc] || 0) + t.amount;
    dateMap.set(t.date, existing);
  });

  return Array.from(dateMap.entries())
    .map(([date, mccData]) => ({
      date,
      ...mccData,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getMCCDistribution(transactions: Transaction[]): PieChartData[] {
  const aggregates = aggregateByMCC(transactions);
  const total = aggregates.reduce((sum, a) => sum + a.totalSpend, 0);

  return aggregates.map((a) => ({
    name: a.mcc,
    value: a.totalSpend,
    percentage: (a.totalSpend / total) * 100,
  }));
}

// Pillar-based aggregations with travel breakdown
export function aggregateByPillarWithTravelBreakdown(transactions: EnrichedTransaction[]): PillarAggregateWithSegments[] {
  const pillarMap = new Map<string, { 
    totalSpend: number; 
    count: number; 
    totalConfidence: number; 
    subcats: Map<string, SubcategoryData>;
    segments: Map<string, number>; // Track spending by original pillar
  }>();

  transactions.forEach((t) => {
    const existing = pillarMap.get(t.pillar) || { 
      totalSpend: 0, 
      count: 0, 
      totalConfidence: 0, 
      subcats: new Map(),
      segments: new Map()
    };
    
    existing.totalSpend += t.amount;
    existing.count += 1;
    existing.totalConfidence += t.confidence;

    const subcat = existing.subcats.get(t.subcategory) || { subcategory: t.subcategory, totalSpend: 0, transactionCount: 0 };
    subcat.totalSpend += t.amount;
    subcat.transactionCount += 1;
    existing.subcats.set(t.subcategory, subcat);

    // Track segments by original pillar for travel-reclassified transactions
    const segmentKey = (t.trip_label && t.travel_context?.original_pillar) 
      ? t.travel_context.original_pillar 
      : t.pillar;
    existing.segments.set(segmentKey, (existing.segments.get(segmentKey) || 0) + t.amount);

    pillarMap.set(t.pillar, existing);
  });

  return Array.from(pillarMap.entries())
    .map(([pillar, data]) => ({
      pillar,
      totalSpend: data.totalSpend,
      transactionCount: data.count,
      avgAmount: data.totalSpend / data.count,
      avgConfidence: data.totalConfidence / data.count,
      subcategories: Array.from(data.subcats.values()).sort((a, b) => b.totalSpend - a.totalSpend),
      segments: Array.from(data.segments.entries())
        .map(([originalPillar, amount]) => ({
          originalPillar,
          amount,
          color: PILLAR_COLORS[originalPillar] || "#64748b"
        }))
        .sort((a, b) => b.amount - a.amount)
    }))
    .sort((a, b) => b.totalSpend - a.totalSpend);
}

// Pillar-based aggregations (original function preserved)
export function aggregateByPillar(transactions: EnrichedTransaction[]): PillarAggregate[] {
  const pillarMap = new Map<string, { totalSpend: number; count: number; totalConfidence: number; subcats: Map<string, SubcategoryData> }>();

  transactions.forEach((t) => {
    const existing = pillarMap.get(t.pillar) || { totalSpend: 0, count: 0, totalConfidence: 0, subcats: new Map() };
    
    existing.totalSpend += t.amount;
    existing.count += 1;
    existing.totalConfidence += t.confidence;

    const subcat = existing.subcats.get(t.subcategory) || { subcategory: t.subcategory, totalSpend: 0, transactionCount: 0 };
    subcat.totalSpend += t.amount;
    subcat.transactionCount += 1;
    existing.subcats.set(t.subcategory, subcat);

    pillarMap.set(t.pillar, existing);
  });

  return Array.from(pillarMap.entries())
    .map(([pillar, data]) => ({
      pillar,
      totalSpend: data.totalSpend,
      transactionCount: data.count,
      avgAmount: data.totalSpend / data.count,
      avgConfidence: data.totalConfidence / data.count,
      subcategories: Array.from(data.subcats.values()).sort((a, b) => b.totalSpend - a.totalSpend),
    }))
    .sort((a, b) => b.totalSpend - a.totalSpend);
}

export function aggregatePillarTimeSeries(transactions: EnrichedTransaction[]): TimeSeriesData[] {
  const dateMap = new Map<string, Record<string, number>>();

  transactions.forEach((t) => {
    const existing = dateMap.get(t.date) || {};
    existing[t.pillar] = (existing[t.pillar] || 0) + t.amount;
    dateMap.set(t.date, existing);
  });

  return Array.from(dateMap.entries())
    .map(([date, pillarData]) => ({
      date,
      ...pillarData,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getPillarDistribution(transactions: EnrichedTransaction[]): PieChartData[] {
  const aggregates = aggregateByPillar(transactions);
  const total = aggregates.reduce((sum, a) => sum + a.totalSpend, 0);

  return aggregates.map((a) => ({
    name: a.pillar,
    value: a.totalSpend,
    percentage: (a.totalSpend / total) * 100,
  }));
}

// Subcategory drill-down
export function getSubcategoriesForPillar(pillar: string, transactions: EnrichedTransaction[]): SubcategoryData[] {
  const subcatMap = new Map<string, { totalSpend: number; count: number }>();

  transactions
    .filter((t) => t.pillar === pillar)
    .forEach((t) => {
      const existing = subcatMap.get(t.subcategory) || { totalSpend: 0, count: 0 };
      subcatMap.set(t.subcategory, {
        totalSpend: existing.totalSpend + t.amount,
        count: existing.count + 1,
      });
    });

  return Array.from(subcatMap.entries())
    .map(([subcategory, data]) => ({
      subcategory,
      totalSpend: data.totalSpend,
      transactionCount: data.count,
    }))
    .sort((a, b) => b.totalSpend - a.totalSpend);
}

// Sankey data builder
export function buildSankeyFlow(transactions: EnrichedTransaction[]): SankeyData {
  const linkMap = new Map<string, number>();

  transactions.forEach((t) => {
    const mcc = t.mcc || "Unknown MCC";
    const key = `${mcc}|${t.pillar}`;
    linkMap.set(key, (linkMap.get(key) || 0) + t.amount);
  });

  const mccNodes = new Set<string>();
  const pillarNodes = new Set<string>();
  const links: any[] = [];

  linkMap.forEach((value, key) => {
    const [mcc, pillar] = key.split("|");
    mccNodes.add(mcc);
    pillarNodes.add(pillar);
    links.push({
      source: mcc,
      target: pillar,
      value,
    });
  });

  const nodes = [
    ...Array.from(mccNodes).map((id) => ({ id, label: id })),
    ...Array.from(pillarNodes).map((id) => ({ id, label: id })),
  ];

  return { nodes, links };
}

// Apply filters
export function applyFilters(transactions: EnrichedTransaction[], filters: Filters): EnrichedTransaction[] {
  let filtered = [...transactions];

  // Date range filter
  if (filters.dateRange.start) {
    const startDate = filters.dateRange.start.toISOString().split("T")[0];
    filtered = filtered.filter((t) => t.date >= startDate);
  }
  if (filters.dateRange.end) {
    const endDate = filters.dateRange.end.toISOString().split("T")[0];
    filtered = filtered.filter((t) => t.date <= endDate);
  }

  // Confidence threshold filter
  const threshold = filters.confidenceThreshold / 100;
  filtered = filtered.filter((t) => t.confidence >= threshold);

  // Include/exclude Miscellaneous
  if (!filters.includeMisc) {
    filtered = filtered.filter((t) => t.pillar !== "Miscellaneous & Unclassified");
  }

  return filtered;
}

// Calculate metrics
export function calculateMiscRate(transactions: EnrichedTransaction[]): number {
  if (transactions.length === 0) return 0;
  const miscCount = transactions.filter((t) => t.pillar === "Miscellaneous & Unclassified").length;
  return (miscCount / transactions.length) * 100;
}

export function calculateAverageConfidence(transactions: EnrichedTransaction[]): number {
  if (transactions.length === 0) return 0;
  const total = transactions.reduce((sum, t) => sum + t.confidence, 0);
  return total / transactions.length;
}

// Merge corrections into enriched data
export function applyCorrections(
  enriched: EnrichedTransaction[],
  corrections: Map<string, Correction>
): EnrichedTransaction[] {
  return enriched.map((t) => {
    const correction = corrections.get(t.transaction_id);
    if (!correction) return t;

    return {
      ...t,
      pillar: correction.corrected_pillar,
      subcategory: correction.corrected_subcategory,
    };
  });
}
