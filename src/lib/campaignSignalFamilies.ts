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
