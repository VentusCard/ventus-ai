export type PersonalizationLevelId =
  | "conservative"
  | "balanced"
  | "personalized"
  | "segment-of-one";

export type SignalFamilyId =
  | "spending-habits"
  | "life-events"
  | "financial"
  | "demographic"
  | "risk";

export interface SignalFamily {
  id: SignalFamilyId;
  label: string;
  policyNote: string;
}

export const SIGNAL_FAMILIES: SignalFamily[] = [
  {
    id: "spending-habits",
    label: "Spending Habits",
    policyNote: "Category and merchant-theme rollups from internal card and ACH rails.",
  },
  {
    id: "life-events",
    label: "Life Events",
    policyNote: "Inferred transitions (relocation, college prep, home purchase). Requires ≥2 corroborating transactions.",
  },
  {
    id: "financial",
    label: "Financial Signals",
    policyNote: "Loans, leases, mortgages, investments. Never used for deal generation — product and relationship only.",
  },
  {
    id: "demographic",
    label: "Demographic",
    policyNote: "Household composition and stage. Excluded from any credit or pricing decision.",
  },
  {
    id: "risk",
    label: "Risk",
    policyNote: "Servicing and wellness outreach only. Never used for marketing or offer targeting.",
  },
];

export interface PersonalizationLevel {
  id: PersonalizationLevelId;
  label: string;
  tagline: string;
  enabledFamilies: SignalFamilyId[];
  externalIntelligence: boolean;
  individualValueMath: boolean;
  autonomousEnrollment: boolean;
  downstream: string[];
}

export const PERSONALIZATION_LEVELS: PersonalizationLevel[] = [
  {
    id: "conservative",
    label: "Conservative",
    tagline: "Product-agnostic. Category-level only.",
    enabledFamilies: ["spending-habits"],
    externalIntelligence: false,
    individualValueMath: false,
    autonomousEnrollment: false,
    downstream: [
      "Offers reference broad spend categories, never individual merchants",
      "No life-event inference anywhere in the pipeline",
      "Every outbound message requires banker approval",
    ],
  },
  {
    id: "balanced",
    label: "Balanced",
    tagline: "Life events allowed. Internal data only.",
    enabledFamilies: ["spending-habits", "life-events", "demographic"],
    externalIntelligence: false,
    individualValueMath: false,
    autonomousEnrollment: false,
    downstream: [
      "Life-event moments drive product timing",
      "External data partnerships stay switched off",
      "Value framing stays qualitative (\"could save on travel\")",
    ],
  },
  {
    id: "personalized",
    label: "Personalized",
    tagline: "External signals on. Individual value math shown.",
    enabledFamilies: ["spending-habits", "life-events", "financial", "demographic", "risk"],
    externalIntelligence: true,
    individualValueMath: true,
    autonomousEnrollment: false,
    downstream: [
      "Externally observed signals (auto loan maturity, tradelines) enrich the household",
      "Offers show dollar-specific value lines derived from annualized spend",
      "Enrollment still routes through a banker for approval",
    ],
  },
  {
    id: "segment-of-one",
    label: "Segment of One",
    tagline: "Full behavioral + external. Autonomous enrollment.",
    enabledFamilies: ["spending-habits", "life-events", "financial", "demographic", "risk"],
    externalIntelligence: true,
    individualValueMath: true,
    autonomousEnrollment: true,
    downstream: [
      "Every household is its own segment — no cohort averaging",
      "Ventus enrolls into eligible products inside the guardrails below",
      "Bankers are notified rather than asked",
    ],
  },
];

export function levelById(id: PersonalizationLevelId): PersonalizationLevel {
  return PERSONALIZATION_LEVELS.find((l) => l.id === id) ?? PERSONALIZATION_LEVELS[1];
}

export interface GovernanceDocument {
  id: string;
  name: string;
  type: string;
  uploadedBy: string;
  uploadedAt: string;
  status: "Applied" | "Under review";
  influences: string;
}

export const SEED_DOCUMENTS: GovernanceDocument[] = [
  {
    id: "doc-marketing-compliance",
    name: "Marketing Compliance Policy v4.2.pdf",
    type: "Compliance",
    uploadedBy: "D. Alvarez",
    uploadedAt: "Jul 12, 2026",
    status: "Applied",
    influences: "Copy rules · Disclaimer footer · Risk family lockout",
  },
  {
    id: "doc-brand-voice",
    name: "Brand Voice Guide 2026.docx",
    type: "Brand",
    uploadedBy: "M. Chen",
    uploadedAt: "Jun 28, 2026",
    status: "Applied",
    influences: "Tone · Opportunity framing · Forbidden phrases",
  },
  {
    id: "doc-fair-lending",
    name: "Fair Lending Guidelines.pdf",
    type: "Regulatory",
    uploadedBy: "Compliance Ops",
    uploadedAt: "Jun 03, 2026",
    status: "Applied",
    influences: "Demographic family · Product eligibility gating",
  },
  {
    id: "doc-model-risk",
    name: "Model Risk Governance Memo.pdf",
    type: "Model Risk",
    uploadedBy: "R. Patel",
    uploadedAt: "May 21, 2026",
    status: "Under review",
    influences: "Confidence thresholds · Autonomy ceiling",
  },
];

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  at: string;
}

export const AUDIT_TRAIL: AuditEntry[] = [
  { id: "a1", actor: "D. Alvarez", action: "Raised personalization level to Personalized", at: "Aug 4, 2026 · 09:12" },
  { id: "a2", actor: "Compliance Ops", action: "Disabled Risk family for offer targeting", at: "Jul 30, 2026 · 16:45" },
  { id: "a3", actor: "M. Chen", action: "Uploaded Brand Voice Guide 2026", at: "Jun 28, 2026 · 11:02" },
  { id: "a4", actor: "R. Patel", action: "Lowered autonomy threshold to 65%", at: "Jun 19, 2026 · 14:37" },
  { id: "a5", actor: "D. Alvarez", action: "Set quiet hours to 9:00 PM – 8:00 AM", at: "Jun 11, 2026 · 08:20" },
];
