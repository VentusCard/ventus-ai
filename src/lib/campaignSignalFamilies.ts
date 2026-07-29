// Static chip catalogs for the Financial and Risk signal families.
// These mirror two of the five signal families surfaced in the System tab
// (CapabilitiesView) so the Campaign Builder can layer all 5 families:
// Life Event · Behavioral · Financial · Demographic · Risk.

export interface SignalFamilyChip {
  id: string;
  label: string;
  description: string;
  /** Approximate share of the targetable base that exhibits this signal. */
  detectionRate: number;
}

export const FINANCIAL_SIGNAL_CHIPS: SignalFamilyChip[] = [
  {
    id: "fin-payroll-direct-deposit",
    label: "Active payroll deposit",
    description: "Recurring employer direct deposits land in checking.",
    detectionRate: 0.62,
  },
  {
    id: "fin-large-recent-inflow",
    label: "Recent large inflow",
    description: "One-off deposit well above typical payroll baseline.",
    detectionRate: 0.12,
  },
  {
    id: "fin-deposit-growth",
    label: "Deposit balance growing",
    description: "Checking and savings balances trending up across recent statements.",
    detectionRate: 0.28,
  },
  {
    id: "fin-investable-assets",
    label: "Investable assets tier",
    description: "Idle balances above typical operating-cash needs.",
    detectionRate: 0.18,
  },
  {
    id: "fin-low-credit-util",
    label: "Low credit utilization",
    description: "Headroom on existing revolving credit lines.",
    detectionRate: 0.41,
  },
  {
    id: "fin-mortgage-payer",
    label: "Active mortgage payer",
    description: "Recurring mortgage servicer outflow on file.",
    detectionRate: 0.22,
  },
];

export const RISK_SIGNAL_CHIPS: SignalFamilyChip[] = [
  {
    id: "risk-no-overdraft-90d",
    label: "No overdraft (90d)",
    description: "No overdraft or NSF events in the trailing 90 days.",
    detectionRate: 0.78,
  },
  {
    id: "risk-no-fraud-flags",
    label: "Clean fraud history",
    description: "No recent fraud or disputed-transaction flags on file.",
    detectionRate: 0.93,
  },
  {
    id: "risk-stable-tenure",
    label: "Stable account tenure",
    description: "Primary relationship has been open longer than the cohort median.",
    detectionRate: 0.55,
  },
  {
    id: "risk-healthy-dti",
    label: "Healthy DTI",
    description: "Debt-to-income comfortably below underwriting thresholds.",
    detectionRate: 0.48,
  },
  {
    id: "risk-no-recent-decline",
    label: "No recent declines",
    description: "No card or ACH declines in the trailing 60 days.",
    detectionRate: 0.71,
  },
];

export const DEMOGRAPHIC_SIGNAL_CHIPS: SignalFamilyChip[] = [
  {
    id: "demo-dual-income",
    label: "Dual-income household",
    description: "Two recurring payroll deposits to the same household.",
    detectionRate: 0.34,
  },
  {
    id: "demo-single-income",
    label: "Single-income household",
    description: "One payroll stream supporting family-pattern outflows.",
    detectionRate: 0.29,
  },
  {
    id: "demo-parent-young-kids",
    label: "Parent of young children",
    description: "Childcare, pediatric, and family-store outflow patterns.",
    detectionRate: 0.21,
  },
  {
    id: "demo-parent-school-age",
    label: "Parent of school-age kids",
    description: "K-12 tuition, school supplies, and youth-sports activity.",
    detectionRate: 0.19,
  },
  {
    id: "demo-empty-nester",
    label: "Empty nester",
    description: "Drop in family outflows alongside discretionary recovery.",
    detectionRate: 0.14,
  },
  {
    id: "demo-eldercare",
    label: "Caregiver for aging parent",
    description: "Eldercare, assisted-living, and medical co-pay activity.",
    detectionRate: 0.09,
  },
  {
    id: "demo-likely-homeowner",
    label: "Likely homeowner",
    description: "Mortgage servicer, property tax, and home-insurance outflows.",
    detectionRate: 0.46,
  },
  {
    id: "demo-likely-renter",
    label: "Likely renter",
    description: "Recurring rent ACH with no mortgage activity on file.",
    detectionRate: 0.32,
  },
  {
    id: "demo-recently-relocated",
    label: "Recently relocated",
    description: "Sustained merchant footprint shift into a new metro.",
    detectionRate: 0.07,
  },
  {
    id: "demo-self-employed",
    label: "Self-employed / 1099",
    description: "Irregular inflows alongside quarterly tax outflows.",
    detectionRate: 0.11,
  },
  {
    id: "demo-pre-retiree",
    label: "Pre-retiree",
    description: "Peak earnings with 401k catch-up and advisory-fee activity.",
    detectionRate: 0.13,
  },
  {
    id: "demo-newly-partnered",
    label: "Newly partnered household",
    description: "Joint account opened with merged outflow patterns.",
    detectionRate: 0.06,
  },
];
