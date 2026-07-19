import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/* ============================================================================
 * synthesize-persona
 * ----------------------------------------------------------------------------
 * Single-pass classifier for the 5-signal taxonomy used by /bankdemo:
 *
 *   Ladder (mutually exclusive):
 *     1. LIFE EVENT        — discrete, time-bounded transitions
 *     2. FINANCIAL SIGNAL  — durable product relationships (loans, brokerage…)
 *     3. DEMOGRAPHIC       — inferred STATE CHANGE (income / household / geo)
 *     4. SPENDING HABIT    — recurring lifestyle rollup (aka pillar_rollups)
 *     5. RISK FACTOR       — owned upstream; referenced only to prevent overlap
 *
 * Every transaction can belong to AT MOST ONE bucket. Higher tier wins and
 * strips the row from every lower tier.
 *
 * Architecture:
 *  - We build ONE unified candidate list where every [T<n>] row carries
 *    deterministic hint tags (pet, auto_loan_servicer, college_prep, …).
 *  - The LLM makes ONE decision-tree pass and returns all 5 buckets plus an
 *    `audit` block listing which indices it claimed for each bucket.
 *  - A thin server guard validates the audit, enforces the ladder, applies
 *    hard overrides for known-abuse patterns using the hint tags (not string
 *    sniffing), and merges external pre-classified signals.
 *
 * Response shape is unchanged for client compatibility:
 *   { pillar_rollups, detected_life_events, financial_signals,
 *     demographic_shifts, dropped_upstream_life_events }
 * ========================================================================== */

// ─────────────────────────── Types ────────────────────────────────────────

interface IncomingTxn {
  merchant_name?: string;
  normalized_merchant?: string;
  amount?: number;
  date?: string;
  pillar?: string;
  category?: string;
  subcategories?: string[];
  spending_tier?: string;
}

interface ExternalSignal {
  id: string;
  bucket: "life_event" | "financial_signal" | "demographic_shift" | "behavioral";
  label: string;
  event_name?: string;
  provider: string;
  detail?: string;
  confidence?: number;
  product_family?: string;
  servicer?: string;
  monthly_amount_band?: string;
  cadence?: string;
  demographic_category?: string;
  direction?: string;
  magnitude_band?: string;
  talking_points?: string[];
}

type HintTag =
  // Financial-signal ownership
  | "auto_loan_servicer" | "auto_lease_servicer" | "mortgage_servicer" | "heloc"
  | "student_loan_servicer" | "personal_loan_servicer" | "brokerage_contribution"
  | "retirement_contribution" | "insurance_premium" | "education_savings_529"
  | "credit_card_payoff"
  // Life-event ownership
  | "home_purchase_vendor" | "wedding_vendor" | "new_baby_vendor" | "elder_care_vendor"
  | "relocation_vendor" | "business_formation_vendor" | "retirement_planning_vendor"
  | "large_inflow"
  // Demographic ownership
  | "payroll" | "college_prep" | "wealth_investment_hint" | "relocation_hint"
  // Spending-habit ownership (never demographic / never life event)
  | "pet" | "recurring_lifestyle"
  // Risk (never surfaced here — pass-through)
  | "risk_flagged";

// ─────────────────────────── Merchant taxonomies (single source of truth) ──

// Financial servicers — each triggers Financial Signal, never anything lower.
const FIN_SERVICERS: Array<[RegExp, HintTag]> = [
  [/toyota financial|vw credit|volkswagen credit|ford credit|gm financial|honda financial|ally auto|chase auto|capital one auto|bmw financial|mercedes-benz financial|hyundai motor finance|nissan motor accept/i, "auto_loan_servicer"],
  [/\blease\b|leasing/i, "auto_lease_servicer"],
  [/rocket mortgage|wells fargo home mortgage|chase home lending|pennymac|mr\.? cooper|loandepot|zillow home loans|quicken loans/i, "mortgage_servicer"],
  [/\bheloc\b|home equity/i, "heloc"],
  [/nelnet|sallie mae|navient|great lakes|fedloan|mohela|aidvantage/i, "student_loan_servicer"],
  [/sofi loan|lightstream|marcus loan|upstart|prosper|lendingclub|best egg/i, "personal_loan_servicer"],
  [/amex payment|chase card payment|discover payment|capital one card/i, "credit_card_payoff"],
  [/fidelity|schwab|vanguard|robinhood|wealthfront|betterment|etrade|merrill edge/i, "brokerage_contribution"],
  [/401k|ira contribution|roth ira|sep ira/i, "retirement_contribution"],
  [/northwestern mutual|new york life|massmutual|prudential life|guardian life|haven life|policygenius/i, "insurance_premium"],
  [/\b529\b|my529|collegeamerica|scholarshare/i, "education_savings_529"],
];

// Life-event vendors — trigger Life Event candidacy.
const LIFE_EVENT_VENDORS: Array<[RegExp, HintTag]> = [
  [/realtor|title company|escrow|home inspector|crate ?& ?barrel|west elm|pottery barn|restoration hardware|williams sonoma home|ikea|home depot|lowe'?s|hoa/i, "home_purchase_vendor"],
  [/jeweler|the knot|zola|bridal|wedding venue|wedding photog/i, "wedding_vendor"],
  [/pediatric|obstetric|ob\/gyn|midwife|doula|buybuy baby|babylist|carter'?s|huggies|pampers|similac|enfamil|gerber|daycare|childcare|kindercare|bright horizons/i, "new_baby_vendor"],
  [/assisted living|senior living|home health|hospice|in-home care|geriatric/i, "elder_care_vendor"],
  [/u-?haul|penske truck|two men and a truck|mayflower|allied van|north american van|pods moving|extended stay|corporate housing/i, "relocation_vendor"],
  [/legalzoom|stripe atlas|zenbusiness/i, "business_formation_vendor"],
  [/estate attorney|trust services|medicare supplement|retirement community/i, "retirement_planning_vendor"],
];

// Demographic hints (state CHANGE, not lifestyle).
const DEMO_HINTS: Array<[RegExp, HintTag]> = [
  [/payroll|direct dep|direct deposit|adp|gusto|paychex|workday payroll|salary|wages|bonus|commission|1099|stripe payout|square payout|paypal payout|ssa|social security|pension|unemployment|edd|state di/i, "payroll"],
  [/\bcollege\b|\buniversity\b|tuition|\bsat\b|\bact test\b|kaplan|princeton review|common ?app|bursar|ap exam/i, "college_prep"],
  [/wire transfer|incoming wire|cashier'?s check|brokerage transfer|trust services/i, "wealth_investment_hint"],
  [/storage unit|title company|escrow|comcast install|xfinity install|pg&e install|conedison install/i, "relocation_hint"],
];

// Pet vendors — ALWAYS Spending Habit (Pets pillar). Never demographic. Never life event.
const PET_RE = /chewy|petsmart|petco|banfield|vca|barkbox|rover|pet\s?food|pet\s?supplies|\bvet\b|veterinar|groomin|dog ?walk|dog ?sit|cat ?sit/i;

// ─────────────────────────── Helpers ──────────────────────────────────────

function cadenceHint(dates: string[]): string {
  if (!dates || dates.length < 2) return "";
  const sorted = dates.map((d) => new Date(d).getTime()).filter((t) => !isNaN(t)).sort((a, b) => a - b);
  if (sorted.length < 2) return "";
  const spanMs = sorted[sorted.length - 1] - sorted[0];
  const spanWeeks = spanMs / (7 * 24 * 60 * 60 * 1000);
  const spanYears = spanMs / (365.25 * 24 * 60 * 60 * 1000);
  const count = sorted.length;
  if (spanWeeks < 1) return `${count}x in one week`;
  if (spanYears >= 1) return `~${(count / spanYears).toFixed(0)}x/yr over ${Math.round(spanYears)}yr`;
  return `~${(count / spanWeeks).toFixed(1)}x/wk over ${Math.round(spanWeeks)}wk`;
}

/** Compute deterministic hint tags for a single transaction. */
function computeHints(t: IncomingTxn, flaggedMerchants: Set<string>): HintTag[] {
  const merchant = (t.normalized_merchant || t.merchant_name || "").toLowerCase();
  const amt = typeof t.amount === "number" ? t.amount : 0;
  const hints: HintTag[] = [];

  // Risk always wins — flagged rows are stripped entirely.
  if (flaggedMerchants.has(merchant)) {
    hints.push("risk_flagged");
    return hints;
  }

  // Pets are absolute: Spending Habit, always.
  if (PET_RE.test(merchant)) {
    hints.push("pet");
    return hints;
  }

  // Financial servicers.
  for (const [re, tag] of FIN_SERVICERS) if (re.test(merchant)) hints.push(tag);
  // Life-event vendors.
  for (const [re, tag] of LIFE_EVENT_VENDORS) if (re.test(merchant)) hints.push(tag);
  // Demographic hints.
  for (const [re, tag] of DEMO_HINTS) if (re.test(merchant)) hints.push(tag);

  // Large one-time inflow (≥$10k credit) → Life Event candidate (Inheritance / Windfall).
  if (amt < 0 && Math.abs(amt) >= 10_000) hints.push("large_inflow");

  return hints;
}

/** Which bucket a hint list points to. Higher tier wins. */
function ownerBucketFromHints(hints: HintTag[]): "life_event" | "financial_signal" | "demographic" | "spending_habit" | "risk" | null {
  if (hints.includes("risk_flagged")) return "risk";
  // Life event first (vendor clusters or windfall).
  if (hints.some((h) =>
    h === "home_purchase_vendor" || h === "wedding_vendor" || h === "new_baby_vendor" ||
    h === "elder_care_vendor" || h === "relocation_vendor" || h === "business_formation_vendor" ||
    h === "retirement_planning_vendor" || h === "large_inflow",
  )) return "life_event";
  // Financial signal — any servicer hint.
  if (hints.some((h) =>
    h === "auto_loan_servicer" || h === "auto_lease_servicer" || h === "mortgage_servicer" ||
    h === "heloc" || h === "student_loan_servicer" || h === "personal_loan_servicer" ||
    h === "credit_card_payoff" || h === "brokerage_contribution" || h === "retirement_contribution" ||
    h === "insurance_premium" || h === "education_savings_529",
  )) return "financial_signal";
  // Pets are Spending Habit even though they are recurring.
  if (hints.includes("pet")) return "spending_habit";
  // Demographic — payroll / college / wealth-investment / relocation-hint.
  if (hints.some((h) => h === "payroll" || h === "college_prep" || h === "wealth_investment_hint" || h === "relocation_hint")) return "demographic";
  return null; // No opinion → LLM may route to Spending Habit or drop.
}

// ─────────────────────────── Handler ──────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pillars, lifeEvents, transactions, riskCategoriesPresent, riskTransactionIds, externalSignals } = await req.json() as {
      pillars: any[];
      lifeEvents?: { event_name?: string }[];
      transactions?: IncomingTxn[];
      riskCategoriesPresent?: string[];
      riskTransactionIds?: string[];
      externalSignals?: ExternalSignal[];
    };
    if (!pillars || !Array.isArray(pillars) || pillars.length === 0) {
      return new Response(JSON.stringify({ error: "pillars array is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const detectedEventNames: string[] = Array.isArray(lifeEvents)
      ? lifeEvents.map((e) => e?.event_name).filter((n): n is string => !!n)
      : [];
    const presentRiskCategories: string[] = Array.isArray(riskCategoriesPresent)
      ? Array.from(new Set(riskCategoriesPresent.filter((s): s is string => typeof s === "string" && s.trim().length > 0)))
      : [];
    const flaggedTxIds: string[] = Array.isArray(riskTransactionIds)
      ? Array.from(new Set(riskTransactionIds.filter((s): s is string => typeof s === "string" && s.trim().length > 0)))
      : [];
    const externals: ExternalSignal[] = Array.isArray(externalSignals) ? externalSignals : [];
    const flaggedMerchants = new Set(flaggedTxIds.map((s) => s.toLowerCase()));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const distinctPillars = [...new Set(pillars.map((p: { pillar: string }) => p.pillar))] as string[];

    // ── Per-category summary (unchanged shape) ───────────────────────────
    const pillarSummary = pillars
      .map((p: any, i: number) => {
        const merchants = p.topMerchants?.length ? ` merchants: ${p.topMerchants.slice(0, 5).join(", ")}` : "";
        const tier = p.spendingTier ? ` [${p.spendingTier}]` : "";
        const subs = p.subcategories?.length ? ` subs: ${p.subcategories.slice(0, 5).join(", ")}` : "";
        const cadence = cadenceHint(p.dates || []);
        const cadenceStr = cadence ? ` (${cadence})` : "";
        return `[${i}] ${p.pillar} > ${p.label}: ${p.count} txns, $${(p.totalSpend ?? 0).toFixed(0)}${tier}${merchants}${subs}${cadenceStr}`;
      })
      .join("\n");

    // ── Unified candidate txn block with hint tags ───────────────────────
    const txns: IncomingTxn[] = Array.isArray(transactions) ? transactions : [];
    const txnHints: HintTag[][] = new Array(txns.length);
    const txnOwner: (string | null)[] = new Array(txns.length);
    const txnLines: string[] = [];
    txns.forEach((t, idx) => {
      const hints = computeHints(t, flaggedMerchants);
      txnHints[idx] = hints;
      const owner = ownerBucketFromHints(hints);
      txnOwner[idx] = owner;
      // Risk-flagged rows are excluded from the LLM entirely.
      if (owner === "risk") return;
      const merchant = (t.normalized_merchant || t.merchant_name || "?").slice(0, 40);
      const amt = typeof t.amount === "number" ? `$${t.amount.toFixed(0)}` : "?";
      const date = t.date || "?";
      const subs = t.subcategories?.length ? `[${t.subcategories.join(", ")}]` : "[]";
      const hintStr = hints.length ? ` · hints=[${hints.join(",")}]` : "";
      const ownerStr = owner ? ` · owner=${owner}` : "";
      txnLines.push(`[T${idx}] ${merchant} · ${amt} · ${date} · ${t.pillar ?? "?"} > ${t.category ?? "?"} · ${subs}${hintStr}${ownerStr}`);
    });
    const txnBlock = txnLines.length
      ? `\n\nUnified candidate transactions (each row is pre-tagged with hints + owner bucket — RESPECT the owner unless the row is empty/null):\n${txnLines.join("\n")}`
      : "";

    // ── External signals block (pre-classified, ground truth) ────────────
    const externalsBlock = externals.length > 0
      ? `\n\nEXTERNAL SIGNALS (pre-classified — ground truth. DO NOT emit any bucket entry that duplicates these themes):\n${externals.map((s) => {
          const extras: string[] = [];
          if (s.product_family) extras.push(`family=${s.product_family}`);
          if (s.servicer) extras.push(`servicer=${s.servicer}`);
          if (s.demographic_category) extras.push(`demo=${s.demographic_category}`);
          return `- [${s.bucket.toUpperCase()}] "${s.label || s.event_name}" provider=${s.provider}${extras.length ? " (" + extras.join(", ") + ")" : ""}`;
        }).join("\n")}`
      : "";

    // ── Upstream life event names (already detected) ─────────────────────
    const upstreamLEBlock = detectedEventNames.length
      ? `\n\nUPSTREAM LIFE EVENTS already detected (do NOT re-emit under detected_life_events; you MAY still route the same theme to Financial Signal / Demographic / Spending Habit if it belongs there):\n${detectedEventNames.map((n) => `- "${n}"`).join("\n")}`
      : "";

    // ── Risk context (never surface, prevent overlap) ────────────────────
    const riskBlock = presentRiskCategories.length
      ? `\n\nRISK CATEGORIES PRESENT (owned by risk panel — DO NOT emit spending_habits/life_events/demographic/financial for these themes):\n${presentRiskCategories.map((n) => `- "${n}"`).join("\n")}`
      : "";

    // ── System prompt: single-pass decision tree ─────────────────────────
    const systemPrompt = `You are a bank's behavioral classifier. You place each customer transaction into EXACTLY ONE of five signal buckets, using a strict ownership ladder.

# THE 5 SIGNAL BUCKETS (ranked ladder — higher tier always wins)

1. **LIFE_EVENT** — discrete, time-bounded life transitions with a vendor cluster.
   OWNS: Home Purchase / Transition, Wedding / Engagement, New Baby / Family Expansion,
         Business Formation, Elder Care, Retirement Planning, Relocation, Inheritance / Windfall.
   NEVER: auto loans, mortgages, student loans, brokerage (those are Financial).
   NEVER: college prep / SAT / tuition / Common App (that is Demographic → "Kid → College").
   NEVER: pet ownership (that is Spending Habit).

2. **FINANCIAL_SIGNAL** — durable large-product relationships surfaced as recurring servicer ACH.
   OWNS: auto_loan, auto_lease, mortgage, heloc, student_loan, personal_loan,
         credit_card_payoff, brokerage_contribution, retirement_contribution,
         insurance_premium, education_savings (529).
   NEVER: lifestyle spend, life-stage transitions.

3. **DEMOGRAPHIC** — inferred STATE CHANGE (not baseline attributes, not recurring lifestyle).
   OWNS: income_trajectory (payroll step-up/step-down, job change, 1099 onset),
         wealth_tier_migration (sustained contribution rate change),
         household_composition (empty nest, divorce, "Kid → College"),
         geography_relocation (post-move ZIP centroid drift).
   NEVER: pets, fitness, streaming, groceries, coffee, restaurants, subscriptions,
          hobbies, salons, gym (those are Spending Habits — recurring vendor presence is NEVER a demographic shift).
   NEVER: baby vendors / eldercare / moving vendors (those are Life Events).
   NEVER: recurring auto/mortgage/insurance ACH (those are Financial Signals).

4. **SPENDING_HABIT** (aka pillar_rollups) — recurring lifestyle habits, the "friend at a dinner party" descriptor.
   OWNS: everything not claimed by tiers 1–3, if it forms a coherent activity/lifestyle identity.
   ALWAYS OWNS: pet spend (Chewy, Petco, PetSmart, vet, grooming, boarding, Rover, BarkBox).

5. **RISK_FACTOR** — owned by the risk engine upstream. DO NOT emit anything for risk-flagged rows.

# THE ACCOUNTING RULE

Every [T<n>] row can appear in AT MOST ONE bucket's transaction_indices. If a row's pre-computed \`owner=\`
tag says life_event / financial_signal / demographic / spending_habit, you MUST route it to that bucket
(or drop it if evidence is too thin). If \`owner=\` is unset, you decide — favor the higher tier when in doubt.

You must return an \`audit\` object listing every claimed index per bucket. Overlap is a hard error.

# DECISION LOOP (run this once, in order, for each candidate cluster)

For each cluster of related transactions:
  Step 1. Is any row tagged with a life-event vendor hint AND does the cluster meet the LE threshold below?
          → LIFE_EVENT. Claim those rows. Done.
  Step 2. Is any row tagged with a financial servicer hint?
          → FINANCIAL_SIGNAL. Claim those rows. Done. (One entry per (product_family, servicer).)
  Step 3. Does the cluster represent a temporal STATE CHANGE (payroll delta, empty nest,
          Kid → College, self-employment onset, sustained wealth contribution shift, post-move ZIP drift)?
          → DEMOGRAPHIC. Claim those rows. Done.
  Step 4. Does the cluster form a coherent recurring lifestyle habit (activity/identity, not "shopping")?
          → SPENDING_HABIT (pillar_rollup). Claim those rows. Done.
  Step 5. Otherwise drop the cluster.

# LIFE EVENT THRESHOLDS

- Home Purchase / Transition — 3+ rows (realtor / title / escrow / inspector / mortgage first-pay / moving / large home-retail spike)
- Wedding / Engagement — 2+ rows (jeweler $2k+ / venue / bridal / photographer / caterer)
- New Baby / Family Expansion — 2+ rows (OB / pediatric / daycare / baby retailers / L&D hospital)
- Business Formation — 2+ rows (LLC / incorp services / business insurance / commercial leasing)
- Elder Care — 2+ rows (assisted living / home health aide / hospice / senior community)
- Retirement Planning — 2+ rows (estate attorney / financial advisor fee / Medicare supplement / retirement community deposit)
- Relocation — 2+ rows (long-distance movers / vehicle shipping / extended stay >7 nights / new-metro utility setup / storage)
- Inheritance / Windfall — 1+ large_inflow row (≥$10k credit) + estate-adjacent context

Use the EXACT canonical event_name (enum enforced). Confidence: 2 rows→65, 3→75, 4-5→85, 6+→92.
Provide 2-4 evidence items each with a 1-sentence "relevance". Provide 3 short empathetic talking_points.

# FINANCIAL SIGNAL RULES

One entry per (product_family, servicer). \`monthly_amount_band\` is vaguely-specific ("~$450/mo"),
NEVER exact figures. Omit if only 1 txn. Cadence: monthly | biweekly | quarterly | annual | irregular.

# DEMOGRAPHIC RULES

- Categories: income_trajectory | wealth_tier_migration | household_composition | geography_relocation.
- Label is 2-5 words, e.g. "Payroll Step-Up · +18%", "Kid → College", "SF → NYC Everyday Spend".
- Confidence is 0–1 (NOT 0–100). Cap at 0.92.
- REQUIRE ≥2 unclaimed indices (or 1 for a single large_inflow). If fewer, drop the shift.
- NEVER re-state static baseline attributes (current age, ZIP, income band).
- **GENERAL AUDIT RULE**: recurring vendor presence is NOT a demographic shift. A shift requires a
  start / stop / step / drift over time. If the honest answer is "this vendor is just present in
  the window" — route to Spending Habit or drop.

# SPENDING HABIT RULES

- Pillar MUST be one of: ${distinctPillars.map((p) => `"${p}"`).join(", ")}.
- Label: 2-4 words. Concrete activity + cadence: "Annual Hawaiian Vacations", "Weekly Coffee Runs",
  "Tennis & Court Sports", "Weekend Golfer", "Pet Care Routine".
- FORBIDDEN label words: "Enthusiast", "Fan", "Lover", "Aficionado", "Vacationer", "Junkie",
  "Phase", "Transition", "Prep", "Preparation", "Bound", "Expecting", "New Parent",
  "New Homeowner", "Aspiring Homeowner", "Empty Nest", "Nesting",
  "Loan", "Mortgage", "Lease", "HELOC", "Brokerage", "Investing", "Investment",
  "401k", "IRA", "Debt", "Servicing".
- FORBIDDEN vice/risk words in labels: "Betting", "Sportsbook", "Casino", "Gambler", "Gambling",
  "High Roller", "Cash Advance", "Payday", "BNPL", "Buy Now Pay Later", "Collections", "Adult", "Vice".
- **THE IDENTITY TEST** — every rollup must pass BOTH:
    Q1. "This person is the kind of person who ___." — completion must name an ACTIVITY/LIFESTYLE,
        not a time-of-week or price-tier.
    Q2. Name in 1-3 words the ONE activity at the heart of it (golf, coffee, Hawaii travel, pets…).
        "Shopping" / "spending" / "outings" FAIL.
- Coherence: transactions bundled into one rollup must share the same activity/lifestyle. Do NOT
  mix Ski-tagged rows with Tropical-tagged rows in one "travel" rollup — split them.
- If a category has ≥3 rows tied to the same recurring sport/fitness/hobby, emit a dedicated rollup
  for that discipline (Tennis, Golf, Cycling, Yoga, Skiing, etc.).

# HARD OVERRIDES (baked into the row-level owner hints — respect them)

- \`owner=life_event\`     → row belongs to LIFE_EVENT bucket (if cluster meets threshold; else drop).
- \`owner=financial_signal\` → row belongs to FINANCIAL_SIGNAL bucket. NEVER route to Spending Habit or Life Event.
- \`owner=demographic\`    → row belongs to DEMOGRAPHIC bucket. NEVER route to Life Event or Spending Habit.
- \`owner=spending_habit\` → row belongs to SPENDING_HABIT bucket. This includes ALL pet spend.
- (no owner)               → your call, following the ladder.

# OUTPUT

Return via the return_persona tool. Fill every bucket you can support with evidence; return an empty
array for buckets with no qualifying signal. Fill the audit block so overlaps can be verified.
${upstreamLEBlock}${externalsBlock}${riskBlock}`;

    const userContent = `Per-category spending signals:\n${pillarSummary}${txnBlock}`;

    // ── LLM call ─────────────────────────────────────────────────────────
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3.1-pro-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_persona",
              description: "Return all 5 signal buckets in one pass with an audit of claimed transaction indices.",
              parameters: {
                type: "object",
                properties: {
                  detected_life_events: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        event_name: {
                          type: "string",
                          enum: [
                            "Home Purchase / Transition",
                            "Wedding / Engagement",
                            "New Baby / Family Expansion",
                            "Business Formation",
                            "Elder Care",
                            "Retirement Planning",
                            "Relocation",
                            "Inheritance / Windfall",
                          ],
                        },
                        confidence: { type: "number" },
                        evidence: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              merchant: { type: "string" },
                              amount: { type: "number" },
                              date: { type: "string" },
                              relevance: { type: "string" },
                            },
                            required: ["merchant", "amount", "date", "relevance"],
                            additionalProperties: false,
                          },
                        },
                        talking_points: { type: "array", items: { type: "string" } },
                        transaction_indices: { type: "array", items: { type: "number" } },
                      },
                      required: ["event_name", "confidence", "evidence", "talking_points", "transaction_indices"],
                      additionalProperties: false,
                    },
                  },
                  financial_signals: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        product_family: {
                          type: "string",
                          enum: [
                            "auto_loan", "auto_lease", "mortgage", "heloc", "student_loan", "personal_loan",
                            "credit_card_payoff", "brokerage_contribution", "retirement_contribution",
                            "insurance_premium", "education_savings",
                          ],
                        },
                        label: { type: "string" },
                        servicer: { type: "string" },
                        monthly_amount_band: { type: "string" },
                        cadence: { type: "string", enum: ["monthly", "biweekly", "quarterly", "annual", "irregular"] },
                        transaction_indices: { type: "array", items: { type: "number" } },
                        talking_points: { type: "array", items: { type: "string" } },
                      },
                      required: ["product_family", "label", "servicer", "transaction_indices"],
                      additionalProperties: false,
                    },
                  },
                  demographic_shifts: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        category: {
                          type: "string",
                          enum: ["income_trajectory", "wealth_tier_migration", "household_composition", "geography_relocation"],
                        },
                        label: { type: "string" },
                        direction: { type: "string", enum: ["up", "down", "lateral"] },
                        confidence: { type: "number" },
                        magnitude_band: { type: "string" },
                        evidence_summary: { type: "string" },
                        transaction_indices: { type: "array", items: { type: "number" } },
                      },
                      required: ["category", "label", "direction", "confidence", "evidence_summary", "transaction_indices"],
                      additionalProperties: false,
                    },
                  },
                  spending_habits: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        pillar: { type: "string", enum: distinctPillars },
                        label: { type: "string" },
                        categories: { type: "array", items: { type: "string" } },
                        category_indices: { type: "array", items: { type: "number" } },
                        transaction_indices: { type: "array", items: { type: "number" } },
                      },
                      required: ["pillar", "label", "categories", "category_indices", "transaction_indices"],
                      additionalProperties: false,
                    },
                  },
                  audit: {
                    type: "object",
                    properties: {
                      claimed_life_event: { type: "array", items: { type: "number" } },
                      claimed_financial_signal: { type: "array", items: { type: "number" } },
                      claimed_demographic: { type: "array", items: { type: "number" } },
                      claimed_spending_habit: { type: "array", items: { type: "number" } },
                    },
                    required: [
                      "claimed_life_event", "claimed_financial_signal",
                      "claimed_demographic", "claimed_spending_habit",
                    ],
                    additionalProperties: false,
                  },
                },
                required: ["detected_life_events", "financial_signals", "demographic_shifts", "spending_habits", "audit"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_persona" } },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      return new Response(JSON.stringify({ error: "AI processing failed" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      console.error("No tool call:", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "AI did not return structured output" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const raw = typeof toolCall.function.arguments === "string"
      ? JSON.parse(toolCall.function.arguments)
      : toolCall.function.arguments;

    // ═════════════════════ Deterministic guard layer ═══════════════════════

    const rawLifeEvents: any[] = Array.isArray(raw.detected_life_events) ? raw.detected_life_events : [];
    const rawFinancial: any[] = Array.isArray(raw.financial_signals) ? raw.financial_signals : [];
    const rawDemographic: any[] = Array.isArray(raw.demographic_shifts) ? raw.demographic_shifts : [];
    const rawSpending: any[] = Array.isArray(raw.spending_habits) ? raw.spending_habits : [];

    // 1. Enforce the hard row-level owner tags. Any row whose owner mismatches
    //    its LLM-assigned bucket is removed from that bucket.
    const cleanIndices = (indices: number[], allowed: (string | null)[]): number[] =>
      indices.filter((ti) => {
        if (typeof ti !== "number" || ti < 0 || ti >= txnOwner.length) return false;
        // risk-flagged rows never appear anywhere
        if (txnOwner[ti] === "risk") return false;
        // if owner is unset, LLM is free to use it
        if (txnOwner[ti] === null) return true;
        return allowed.includes(txnOwner[ti]);
      });

    const filteredLE = rawLifeEvents
      .map((e: any) => ({
        ...e,
        transaction_indices: cleanIndices(e.transaction_indices || [], ["life_event"]),
      }))
      // College Prep, auto loans, mortgages, student loans should never end up as life events —
      // even if the model picked the enum, if all its evidence indices were stripped, drop it.
      .filter((e: any) => Array.isArray(e.evidence) && e.evidence.length >= 2);

    const filteredFS = rawFinancial
      .map((f: any) => ({
        ...f,
        transaction_indices: cleanIndices(f.transaction_indices || [], ["financial_signal"]),
      }))
      .filter((f: any) => f.product_family && f.label);

    // 2. Cross-bucket ladder: build the claimed sets, apply Life > Fin > Demo > Habit.
    const claimedByHigher = new Set<number>();
    for (const e of filteredLE) for (const ti of e.transaction_indices) claimedByHigher.add(ti);
    for (const f of filteredFS) for (const ti of f.transaction_indices) claimedByHigher.add(ti);

    const filteredDemo = rawDemographic
      .map((d: any) => {
        const idx: number[] = cleanIndices(d.transaction_indices || [], ["demographic"])
          .filter((ti) => !claimedByHigher.has(ti));
        return { ...d, transaction_indices: idx };
      })
      // Demographic requires ≥2 unclaimed indices (or 1 large_inflow — but large_inflow is life_event-owned)
      .filter((d: any) => (d.transaction_indices?.length ?? 0) >= 2)
      // Kill any demographic labeled with pet vocab (belt-and-suspenders after hint filter)
      .filter((d: any) => !PET_RE.test(String(d.label || "")) && !PET_RE.test(String(d.magnitude_band || "")));

    for (const d of filteredDemo) for (const ti of d.transaction_indices) claimedByHigher.add(ti);

    // 3. Spending habits — strip any row already claimed. Pets keep their indices.
    //    Also auto-promote any orphaned pet rows into a "Pet Care Routine" habit so the
    //    signal still surfaces if the model missed it.
    const filteredSH = rawSpending
      .map((r: any) => {
        const raw: number[] = Array.isArray(r.transaction_indices) ? r.transaction_indices : [];
        const kept = raw.filter((ti) => {
          if (typeof ti !== "number" || ti < 0 || ti >= txnOwner.length) return false;
          if (txnOwner[ti] === "risk") return false;
          if (claimedByHigher.has(ti)) return false;
          const owner = txnOwner[ti];
          // Spending habit accepts anything not owned by a higher tier, plus pets.
          return owner === null || owner === "spending_habit";
        });
        return { ...r, transaction_indices: kept };
      })
      .filter((r: any) => r.pillar && r.label);

    // 3b. Pet-orphan promotion — any pet row not yet in a spending habit rollup
    //     gets folded into (or seeds) a "Pet Care Routine" rollup.
    const petIndices = txnHints
      .map((hints, i) => (hints?.includes("pet") ? i : -1))
      .filter((i) => i >= 0 && !claimedByHigher.has(i));
    if (petIndices.length > 0) {
      const alreadyClaimedByHabit = new Set<number>();
      filteredSH.forEach((r: any) => r.transaction_indices.forEach((ti: number) => alreadyClaimedByHabit.add(ti)));
      const orphanPets = petIndices.filter((i) => !alreadyClaimedByHabit.has(i));
      if (orphanPets.length >= 2) {
        // Add a synthetic Pets rollup. Prefer an existing "Pets" pillar if the LLM omitted one.
        const petsPillar = distinctPillars.find((p) => /pets?/i.test(p)) || distinctPillars[0];
        filteredSH.push({
          pillar: petsPillar,
          label: "Pet Care Routine",
          categories: [],
          category_indices: [],
          transaction_indices: orphanPets,
        });
      }
    }

    // 4. dropped_upstream_life_events — signals the upstream detector emitted
    //    but which our taxonomy re-routes elsewhere (college, auto, mortgage).
    const RETIRED_UPSTREAM_RE = /college|university|tuition|auto\s*loan|mortgage|student\s*loan/i;
    const droppedUpstreamLifeEvents = detectedEventNames.filter((n) => RETIRED_UPSTREAM_RE.test(n));

    // 5. Merge external pre-classified signals — respect their declared bucket.
    for (const es of externals) {
      if (es.bucket === "financial_signal") {
        const dup = filteredFS.some((f: any) =>
          (f.product_family || "").toLowerCase() === (es.product_family || "").toLowerCase() &&
          (es.product_family || "") !== "",
        );
        if (!dup) {
          filteredFS.push({
            id: es.id,
            product_family: es.product_family || "other",
            label: es.event_name || es.label,
            servicer: es.servicer || "",
            monthly_amount_band: es.monthly_amount_band || "",
            cadence: es.cadence || "irregular",
            transaction_indices: [],
            talking_points: es.talking_points || [],
            source: "external",
            provider: es.provider,
            confidence: es.confidence,
            detail: es.detail,
          } as any);
        }
      } else if (es.bucket === "demographic_shift") {
        filteredDemo.push({
          id: es.id,
          category: es.demographic_category || "household_composition",
          label: es.event_name || es.label,
          direction: es.direction || "lateral",
          confidence: es.confidence,
          magnitude_band: es.magnitude_band || "",
          evidence_summary: es.detail || "",
          transaction_indices: [],
          source: "external",
          provider: es.provider,
        } as any);
      }
      // life_event externals: the client already surfaces them from externalSignals directly;
      // we do NOT re-emit them under detected_life_events to avoid double-display.
    }

    // ═════════════════════ Response (backwards-compatible shape) ═══════════
    return new Response(JSON.stringify({
      pillar_rollups: filteredSH.map((r: any) => ({
        pillar: r.pillar,
        label: r.label,
        categories: r.categories || [],
        category_indices: r.category_indices || [],
        transaction_indices: r.transaction_indices || [],
      })),
      detected_life_events: filteredLE.map((e: any) => ({
        event_name: e.event_name,
        confidence: typeof e.confidence === "number" ? e.confidence : 70,
        evidence: Array.isArray(e.evidence) ? e.evidence : [],
        talking_points: Array.isArray(e.talking_points) ? e.talking_points : [],
        transaction_indices: Array.isArray(e.transaction_indices) ? e.transaction_indices : [],
      })),
      dropped_upstream_life_events: droppedUpstreamLifeEvents,
      financial_signals: filteredFS.map((f: any, i: number) => ({
        id: f.id ?? `fs-${i}`,
        product_family: f.product_family,
        label: f.label,
        servicer: f.servicer || "",
        monthly_amount_band: f.monthly_amount_band || "",
        cadence: f.cadence || "irregular",
        transaction_indices: Array.isArray(f.transaction_indices) ? f.transaction_indices : [],
        talking_points: Array.isArray(f.talking_points) ? f.talking_points : [],
        source: f.source,
        provider: f.provider,
        confidence: f.confidence,
        detail: f.detail,
      })),
      demographic_shifts: filteredDemo.map((d: any, i: number) => ({
        id: d.id ?? `ds-${i}`,
        category: d.category,
        label: d.label,
        direction: d.direction || "lateral",
        confidence: typeof d.confidence === "number" ? Math.max(0, Math.min(0.92, d.confidence)) : 0.6,
        magnitude_band: d.magnitude_band || "",
        evidence_summary: d.evidence_summary || "",
        transaction_indices: Array.isArray(d.transaction_indices) ? d.transaction_indices : [],
        source: d.source,
        provider: d.provider,
      })),
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("synthesize-persona error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
