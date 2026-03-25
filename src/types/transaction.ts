export interface Transaction {
  transaction_id: string;
  merchant_name: string;
  description?: string;
  mcc?: string;
  amount: number;
  date: string;
  zip_code?: string;
  home_zip?: string;
  source?: string;
}

export interface EnrichedTransaction extends Transaction {
  normalized_merchant: string;
  pillar: string;
  category: string;
  subcategories: string[];
  /** @deprecated Use subcategories[0] instead */
  subcategory: string;
  confidence: number;
  spending_tier: "Budget" | "Standard" | "Premium" | "N/A";
  purchase_frequency: "Weekly" | "Monthly" | "Occasional" | "Annually" | "One-Time";
  explanation: string;
  enriched_at: string;
  /** Compact trip label e.g. "260301:260315 Banff Trip". Null for non-travel transactions. */
  trip_label?: string | null;
  travel_context?: {
    is_travel_related: boolean;
    travel_period_start: string | null;
    travel_period_end: string | null;
    travel_destination: string | null;
    original_pillar: string | null;
    reclassification_reason: string | null;
  };
}

export interface Correction {
  transaction_id: string;
  original_pillar: string;
  corrected_pillar: string;
  original_subcategory: string;
  corrected_subcategory: string;
  reason: string;
  corrected_at: string;
}

export interface Filters {
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  confidenceThreshold: number;
  includeMisc: boolean;
  mode: "predicted" | "corrected";
}

export interface MCCAggregate {
  mcc: string;
  totalSpend: number;
  transactionCount: number;
  avgAmount: number;
}

export interface PillarAggregate {
  pillar: string;
  totalSpend: number;
  transactionCount: number;
  avgAmount: number;
  avgConfidence: number;
  subcategories: SubcategoryData[];
}

export interface PillarSegment {
  originalPillar: string;
  amount: number;
  color: string;
}

export interface PillarAggregateWithSegments extends PillarAggregate {
  segments: PillarSegment[];
}

export interface SubcategoryData {
  subcategory: string;
  totalSpend: number;
  transactionCount: number;
}

export interface TimeSeriesData {
  date: string;
  [key: string]: number | string;
}

export interface PieChartData {
  name: string;
  value: number;
  percentage: number;
}

export interface SankeyNode {
  id: string;
  label: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
}

export interface SankeyData {
  nodes: SankeyNode[];
  links: SankeyLink[];
}
