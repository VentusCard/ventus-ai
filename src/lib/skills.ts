// Skills are literal artifacts, not UI copy.
//
// A Skill is a declarative, versioned decision package: trigger, cohort, evidence,
// intervention, policy pack, delivery adapter, and a measurement design with a
// MANDATORY holdout. Critically, a Skill cannot validate without naming the P&L metric
// it moves — that constraint is what makes every use case "tied to a measurable revenue
// driver" by construction (the answer to the rewards/life-events critique).
//
// The Studio is an LLM compiler from a plain-language objective to a Skill draft.
// The same artifact shape is portable across banks: what worked at bank A parameterizes
// bank B in days — the cross-bank library is the platform-expansion story.

export type SkillStage = "draft" | "shadow" | "assisted" | "automated";
export const SKILL_STAGES: readonly SkillStage[] = ["draft", "shadow", "assisted", "automated"];

// The P&L metrics a Skill is allowed to move. A Skill MUST pick one — no vanity metrics.
export type PnlMetric =
  | "Deposit balances retained ($)"
  | "Primary-checking households retained (#)"
  | "Net new assets to Merrill ($)"
  | "Products per household (#)"
  | "Incremental loan originations ($)";

export type SkillPromotionEvidence = {
  source: "verified" | "simulated";
  evaluationApproved: boolean;
  sampleSize: number;
  precision: number;
  acceptanceRate?: number;
  incrementalLiftPct?: number;
  fairnessReviewed: boolean;
  policyApprovalId?: string;
  holdoutActive: boolean;
  outcomeWindowComplete: boolean;
};

export type SkillPromotionOptions = { allowSimulatedEvidence?: boolean };

export type SkillArtifact = {
  slug: string;
  version: string; // semantic-ish, e.g. 0.1.0
  stage: SkillStage;
  objective: string;
  pnlMetric: PnlMetric; // REQUIRED — validateSkill rejects a Skill without it
  trigger: string;
  cohort: string;
  evidenceRequired: string;
  intervention: string;
  ownerChannel: string;
  policyPack: string[];
  deliveryAdapter: string; // maps to src/lib/integrations.ts systems
  measurement: { design: string; holdoutPct: number }; // holdoutPct > 0 REQUIRED
  promotionEvidence?: SkillPromotionEvidence;
  history: { version: string; stage: SkillStage; ts: string; note: string }[];
};

export type SkillValidation = { valid: boolean; errors: string[] };

// The constraint engine. A Skill is invalid — and cannot be promoted — unless it names
// a P&L metric and carries a real holdout. This is the "measurable revenue driver by
// construction" guarantee, enforced in code rather than asserted in a deck.
export function validateSkill(s: Partial<SkillArtifact>): SkillValidation {
  const errors: string[] = [];
  if (!s.objective?.trim()) errors.push("No business objective defined.");
  if (!s.pnlMetric) errors.push("No P&L metric named — a Skill must move one measurable driver.");
  if (!s.trigger?.trim()) errors.push("No trigger defined.");
  if (!s.cohort?.trim()) errors.push("No eligible cohort defined.");
  if (!s.evidenceRequired?.trim()) errors.push("No evidence requirement defined.");
  if (!s.intervention?.trim()) errors.push("No intervention defined.");
  if (!s.ownerChannel?.trim()) errors.push("No accountable owner or channel defined.");
  if (!s.policyPack?.length || s.policyPack.some((policy) => !policy.trim())) errors.push("No valid policy pack — cannot gate activation.");
  if (!s.deliveryAdapter?.trim()) errors.push("No delivery adapter — nowhere to write the decision.");
  if (!s.measurement || s.measurement.holdoutPct < 5 || s.measurement.holdoutPct > 15) {
    errors.push("Holdout must be 5–15% so incremental lift can be measured responsibly.");
  }
  return { valid: errors.length === 0, errors };
}

export function promotionBlockers(s: SkillArtifact, options: SkillPromotionOptions = {}): string[] {
  const blockers = validateSkill(s).errors.slice();
  if (s.stage === "automated") return [...blockers, "Already at the final stage."];
  const evidence = s.promotionEvidence;
  if (evidence?.source === "simulated" && !options.allowSimulatedEvidence) {
    blockers.push("Simulated evidence can only be used in the internal evaluation workspace.");
  }
  if (!evidence?.evaluationApproved) blockers.push("Evaluation has not been approved.");
  if (!evidence?.policyApprovalId) blockers.push("Policy approval has not been recorded.");
  if (s.stage === "shadow" || s.stage === "assisted") {
    if ((evidence?.sampleSize ?? 0) < 200) blockers.push("At least 200 evaluated decisions are required.");
    if ((evidence?.precision ?? 0) < 0.9) blockers.push("Precision must be at least 90%.");
    if (!evidence?.fairnessReviewed) blockers.push("Fairness review is incomplete.");
  }
  if (s.stage === "assisted") {
    if ((evidence?.sampleSize ?? 0) < 1000) blockers.push("At least 1,000 assisted decisions are required.");
    if (!evidence?.holdoutActive) blockers.push("A governed holdout must be active.");
    if (!evidence?.outcomeWindowComplete) blockers.push("The outcome window is incomplete.");
    if ((evidence?.incrementalLiftPct ?? 0) <= 0) blockers.push("Positive incremental lift has not been demonstrated.");
  }
  return blockers;
}

export function canPromote(s: SkillArtifact, options: SkillPromotionOptions = {}): boolean {
  return promotionBlockers(s, options).length === 0;
}

export function nextStage(stage: SkillStage): SkillStage {
  const i = SKILL_STAGES.indexOf(stage);
  return SKILL_STAGES[Math.min(SKILL_STAGES.length - 1, i + 1)];
}

// Promote shadow → assisted → automated, appending an immutable history entry. Returns a
// new artifact (the prior version is preserved in history — git-like lineage).
export function promoteSkill(s: SkillArtifact, note = "Promoted", options: SkillPromotionOptions = {}): SkillArtifact {
  const blockers = promotionBlockers(s, options);
  if (blockers.length) throw new Error(`Skill cannot be promoted: ${blockers.join(" ")}`);
  const stage = nextStage(s.stage);
  const [maj, min, patch] = s.version.split(".").map((n) => parseInt(n, 10) || 0);
  const version = `${maj}.${min}.${patch + 1}`;
  return {
    ...s,
    stage,
    version,
    history: [...s.history, { version, stage, ts: new Date().toISOString().slice(0, 10), note }],
  };
}

// ── The cross-bank Skill library — parameterized, not rebuilt, per institution ──
// Seed skills that ship with the platform. A new bank inherits these and re-parameterizes
// cohort/policy/adapter to its own stack.

export const DEPOSIT_PRIMACY_SKILL: SkillArtifact = {
  slug: "deposit-primacy-defense",
  version: "0.1.0",
  stage: "draft",
  objective: "Defend primary-checking relationships before they migrate",
  pnlMetric: "Deposit balances retained ($)",
  trigger: "Direct-deposit split + card spend migrating off-bank + balance drawdown",
  cohort: "Primary-checking households showing >2 primacy-risk signals",
  evidenceRequired: "Payroll, card, and P2P rails corroborate within 60 days",
  intervention: "Banker conversation with a pre-computed retention offer",
  ownerChannel: "Relationship banker · appointment scheduler",
  policyPack: ["UDAAP review", "Uniform offer criteria (fair lending)", "Financial-health suppression"],
  deliveryAdapter: "Banker workbench webhook",
  measurement: { design: "Incremental balances retained vs. held-out control", holdoutPct: 10 },
  history: [
    { version: "0.1.0", stage: "draft", ts: "2026-07-10", note: "Prototype definition — no bank results yet" },
  ],
};

export const CONSUMER_MERRILL_SKILL: SkillArtifact = {
  slug: "consumer-to-merrill-handoff",
  version: "0.1.0",
  stage: "draft",
  objective: "Convert on-bank liquidity moments into qualified Merrill NNA",
  pnlMetric: "Net new assets to Merrill ($)",
  trigger: "Rollover / liquidity / asset-leakage in a consumer relationship",
  cohort: "Banking-only households with a real, evidenced wealth need",
  evidenceRequired: "Liquidity + relationship depth + held-product gap",
  intervention: "Warm, named referral to the mapped Merrill advisor",
  ownerChannel: "Relationship owner → CEW · Book 360",
  policyPack: ["Reg BI best-interest", "Consent + eligibility", "Vulnerability suppression", "OSJ supervision"],
  deliveryAdapter: "Salesforce FSC referral",
  measurement: { design: "Incremental NNA vs. held-out control", holdoutPct: 10 },
  history: [
    { version: "0.1.0", stage: "draft", ts: "2026-07-10", note: "Prototype definition — no bank results yet" },
  ],
};

export const MERRILL_RELATIONSHIP_GROWTH_SKILL: SkillArtifact = {
  slug: "merrill-relationship-growth",
  version: "0.1.0",
  stage: "draft",
  objective: "Convert qualified Merrill demand into advised relationships and net new assets",
  pnlMetric: "Net new assets to Merrill ($)",
  trigger: "Self-directed relationship + evidenced asset-transfer intent + planning engagement",
  cohort: "Merrill clients or prospects with a qualified wealth need and no assigned advisor",
  evidenceRequired: "Merrill-held relationship + transfer intent + recent planning engagement",
  intervention: "Assign the best-fit advisor and prepare a plan-led consolidation review",
  ownerChannel: "Merrill growth desk → CEW · Book 360",
  policyPack: ["Reg BI best-interest", "Consent + eligibility", "Vulnerability suppression", "OSJ supervision"],
  deliveryAdapter: "Salesforce FSC advisor task",
  measurement: { design: "Incremental qualified NNA vs. held-out control", holdoutPct: 10 },
  history: [
    { version: "0.1.0", stage: "draft", ts: "2026-07-12", note: "Prototype definition — no bank results yet" },
  ],
};

export const SKILL_LIBRARY: SkillArtifact[] = [
  DEPOSIT_PRIMACY_SKILL,
  MERRILL_RELATIONSHIP_GROWTH_SKILL,
  CONSUMER_MERRILL_SKILL,
];

function slugify(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^a-z]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .split("-")
      .filter(Boolean)
      .slice(0, 4)
      .join("-") || "growth-skill"
  );
}

// Map a plain-language objective to the P&L metric it most plausibly moves — the compiler
// refuses to leave this unset, which is what forces revenue-relevance.
function inferPnlMetric(text: string): PnlMetric {
  const t = text.toLowerCase();
  if (/(deposit|checking|primacy|neobank|fintech|debit|balance)/.test(t)) return "Deposit balances retained ($)";
  if (/(retain|attrition|churn|leav)/.test(t)) return "Primary-checking households retained (#)";
  if (/(nna|net new|merrill|wealth|advisor|rollover|invest)/.test(t)) return "Net new assets to Merrill ($)";
  if (/(loan|mortgage|lend|credit|home)/.test(t)) return "Incremental loan originations ($)";
  return "Products per household (#)";
}

// Deterministic prototype compiler: plain-language objective → Skill draft. External
// models remain evaluation-only until a sponsor approves the evaluation plan.
export function compileObjectiveToSkill(objective: string, seed?: Partial<SkillArtifact>): SkillArtifact {
  const pnlMetric = seed?.pnlMetric ?? inferPnlMetric(objective);
  const draft: SkillArtifact = {
    slug: seed?.slug ?? slugify(objective),
    version: "0.1.0",
    stage: "draft",
    objective,
    pnlMetric,
    trigger: seed?.trigger ?? "Financial-state change matching the objective",
    cohort: seed?.cohort ?? "Eligibility-screened households matching the trigger",
    evidenceRequired: seed?.evidenceRequired ?? "Corroborating signals across ≥2 data rails",
    intervention: seed?.intervention ?? "One owner, one channel, one prepared action",
    ownerChannel: seed?.ownerChannel ?? "Relationship owner · existing bank channel",
    policyPack: seed?.policyPack ?? ["Consent", "Eligibility", "Vulnerability suppression"],
    deliveryAdapter: seed?.deliveryAdapter ?? "Salesforce FSC",
    measurement: seed?.measurement ?? { design: "Incremental lift vs. control", holdoutPct: 10 },
    history: [{ version: "0.1.0", stage: "draft", ts: new Date().toISOString().slice(0, 10), note: "Compiled from objective" }],
  };
  return draft;
}

// Render a Skill as its declarative file — the artifact, verbatim.
export function skillToSource(s: SkillArtifact): string {
  const q = (v: string) => JSON.stringify(v);
  return [
    `skill "${s.slug}" @${s.version} {`,
    `  objective:        ${q(s.objective)}`,
    `  pnl_metric:       ${q(s.pnlMetric)}   // required — the driver this Skill moves`,
    `  trigger:          ${q(s.trigger)}`,
    `  cohort:           ${q(s.cohort)}`,
    `  evidence:         ${q(s.evidenceRequired)}`,
    `  intervention:     ${q(s.intervention)}`,
    `  owner_channel:    ${q(s.ownerChannel)}`,
    `  policy_pack:      [${s.policyPack.map(q).join(", ")}]`,
    `  delivery_adapter: ${q(s.deliveryAdapter)}`,
    `  measurement:      { design: ${q(s.measurement.design)}, holdout_pct: ${s.measurement.holdoutPct} }`,
    `  stage:            ${q(s.stage)}`,
    `}`,
  ].join("\n");
}
