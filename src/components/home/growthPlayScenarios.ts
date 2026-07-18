export type GrowthPlayId = "deposit" | "wealth";

export type GrowthPlayStage = {
  key: string;
  label: string;
  detail: string;
  ledger: string;
};

export type GrowthPlayScenario = {
  id: GrowthPlayId;
  label: string;
  stages: GrowthPlayStage[];
  funnel: Array<{
    label: string;
    value: string;
    width: string;
    verified?: boolean;
  }>;
  workbench: {
    customer: string;
    title: string;
    confidence: string;
    evidence: Array<[string, string]>;
    policy: string;
    receipt: string;
  };
};

export const GROWTH_PLAY_SCENARIOS: Record<GrowthPlayId, GrowthPlayScenario> = {
  deposit: {
    id: "deposit",
    label: "Deposit retention",
    stages: [
      { key: "moment", label: "Qualified Moment", detail: "Deposit primacy risk · 91%", ledger: "signal · payroll split + balance migration" },
      { key: "gate", label: "Policy Gate", detail: "Eligibility + consent passed", ledger: "gate · uniform criteria applied" },
      { key: "play", label: "Growth Play", detail: "Retention review · routed", ledger: "decision · banker task qualified" },
      { key: "holdout", label: "Holdout", detail: "10% cohort reserved", ledger: "counterfactual · holdout reserved" },
      { key: "lift", label: "Measured Lift", detail: "Measured vs holdout", ledger: "outcome · retention measured vs holdout" },
      { key: "ledger", label: "Decision Ledger", detail: "receipt written", ledger: "append-only · hash-chained" },
    ],
    funnel: [
      { label: "Moments qualified", value: "1,240", width: "100%" },
      { label: "Policy eligible", value: "782", width: "63%" },
      { label: "Banker tasks accepted", value: "486", width: "39%" },
      { label: "Retained vs holdout", value: "+8.4 pp", width: "72%", verified: true },
    ],
    workbench: {
      customer: "Customer 013",
      title: "Deposit primacy at risk",
      confidence: "91%",
      evidence: [
        ["Payroll", "Split detected"],
        ["Balances", "18% migrated"],
      ],
      policy: "Eligible under approved retention policy",
      receipt: "Ventus evidence receipt attached",
    },
  },
  wealth: {
    id: "wealth",
    label: "Qualified wealth growth",
    stages: [
      { key: "moment", label: "Qualified Moment", detail: "Wealth readiness · 88%", ledger: "signal · income growth + cash buildup" },
      { key: "gate", label: "Policy Gate", detail: "Eligibility + consent passed", ledger: "gate · wealth referral policy applied" },
      { key: "play", label: "Growth Play", detail: "Advisor review · routed", ledger: "decision · advisor task qualified" },
      { key: "holdout", label: "Holdout", detail: "10% cohort reserved", ledger: "counterfactual · holdout reserved" },
      { key: "lift", label: "Measured Lift", detail: "Measured vs holdout", ledger: "outcome · conversion measured vs holdout" },
      { key: "ledger", label: "Decision Ledger", detail: "receipt written", ledger: "append-only · hash-chained" },
    ],
    funnel: [
      { label: "Moments qualified", value: "640", width: "100%" },
      { label: "Policy eligible", value: "388", width: "61%" },
      { label: "Advisor tasks accepted", value: "241", width: "38%" },
      { label: "Converted vs holdout", value: "+6.2 pp", width: "64%", verified: true },
    ],
    workbench: {
      customer: "Customer 027",
      title: "Wealth conversation ready",
      confidence: "88%",
      evidence: [
        ["Cash", "22% buildup"],
        ["Income", "14% growth"],
      ],
      policy: "Eligible under approved wealth referral policy",
      receipt: "Ventus evidence receipt attached",
    },
  },
};
