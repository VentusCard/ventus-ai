export type IntegrationProofLevel = "live-attested" | "unit-proven" | "infra-required";

export type IntegrationEvidence = {
  id: "workflow" | "source" | "ledger";
  label: string;
  detail: string;
  level: IntegrationProofLevel;
  status: string;
};

// One evidence ladder keeps the leadership demo and internal readiness discussion honest.
// "Live attested" records an operator-observed result; it is not a bank-production claim.
export const INTEGRATION_EVIDENCE: readonly IntegrationEvidence[] = [
  {
    id: "workflow",
    label: "Workflow delivery",
    detail: "Salesforce Task created in a test org",
    level: "live-attested",
    status: "Live attested",
  },
  {
    id: "source",
    label: "Source ingestion",
    detail: "Plaid custom user maps into a grounded decision",
    level: "unit-proven",
    status: "Unit proven",
  },
  {
    id: "ledger",
    label: "Evidence ledger",
    detail: "Migration and verification ready for non-prod Postgres",
    level: "infra-required",
    status: "Infra next",
  },
] as const;
