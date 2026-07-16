import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/** Compute a human-readable cadence hint from an array of date strings */
function cadenceHint(dates: string[]): string {
  if (!dates || dates.length < 2) return "";
  const sorted = dates.map(d => new Date(d).getTime()).filter(t => !isNaN(t)).sort((a, b) => a - b);
  if (sorted.length < 2) return "";
  const spanMs = sorted[sorted.length - 1] - sorted[0];
  const spanWeeks = spanMs / (7 * 24 * 60 * 60 * 1000);
  const spanYears = spanMs / (365.25 * 24 * 60 * 60 * 1000);
  const count = sorted.length;

  if (spanWeeks < 1) return `${count}x in one week`;
  if (spanYears >= 1) {
    const perYear = count / spanYears;
    return `~${perYear.toFixed(0)}x/yr over ${Math.round(spanYears)}yr`;
  }
  const perWeek = count / spanWeeks;
  return `~${perWeek.toFixed(1)}x/wk over ${Math.round(spanWeeks)}wk`;
}

/** Pillars where merchant-level lifestyle context (Ski/Tropical/Wedding/etc) really matters.
 * For these we send the full numbered transaction list to the model so it can pick exact rows.
 * Other pillars stay as category summaries. */
const TXN_LEVEL_PILLARS = new Set([
  "Travel & Exploration",
  "Style & Beauty",
  "Family & Community",
  "Health & Wellness",
  "Sports & Active Living",
  "Entertainment & Culture",
  "Food & Dining",
]);

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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { pillars, lifeEvents, transactions, riskCategoriesPresent, riskTransactionIds } = await req.json() as {
      pillars: any[];
      lifeEvents?: { event_name?: string }[];
      transactions?: IncomingTxn[];
      // Distinct risk-engine category labels detected on this customer
      // (e.g. ["Sports Betting", "Casino & Table Games", "BNPL Activity"]).
      riskCategoriesPresent?: string[];
      // transaction_id values flagged by detect-risk-transactions. The persona LLM must NOT
      // include any of these IDs in transaction_indices for any lifestyle rollup — those rows
      // are owned by the Risk pill.
      riskTransactionIds?: string[];
    };
    if (!pillars || !Array.isArray(pillars) || pillars.length === 0) {
      return new Response(JSON.stringify({ error: "pillars array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const detectedEventNames: string[] = Array.isArray(lifeEvents)
      ? lifeEvents.map((e: { event_name?: string }) => e?.event_name).filter((n): n is string => !!n)
      : [];
    const presentRiskCategories: string[] = Array.isArray(riskCategoriesPresent)
      ? Array.from(new Set(riskCategoriesPresent.filter((s): s is string => typeof s === "string" && s.trim().length > 0)))
      : [];
    const flaggedTxIds: string[] = Array.isArray(riskTransactionIds)
      ? Array.from(new Set(riskTransactionIds.filter((s): s is string => typeof s === "string" && s.trim().length > 0)))
      : [];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const distinctPillars = [...new Set(pillars.map((p: { pillar: string }) => p.pillar))] as string[];

    // ---- Per-category summary block (unchanged) ----
    const pillarSummary = pillars
      .map((p: { pillar: string; label: string; count: number; totalSpend: number; frequency?: string; topMerchants?: string[]; spendingTier?: string; subcategories?: string[]; dates?: string[] }, i: number) => {
        const merchants = p.topMerchants?.length ? ` merchants: ${p.topMerchants.slice(0, 5).join(", ")}` : "";
        const tier = p.spendingTier ? ` [${p.spendingTier}]` : "";
        const subs = p.subcategories?.length ? ` subs: ${p.subcategories.slice(0, 5).join(", ")}` : "";
        const cadence = cadenceHint(p.dates || []);
        const cadenceStr = cadence ? ` (${cadence})` : "";
        return `[${i}] ${p.pillar} > ${p.label}: ${p.count} txns, $${p.totalSpend.toFixed(0)}${tier}${merchants}${subs}${cadenceStr}`;
      })
      .join("\n");

    // ---- Per-transaction numbered block for lifestyle-prone pillars ----
    // Each row: [T<n>] MERCHANT · $amt · YYYY-MM-DD · pillar/category · [subcategories]
    // Only include transactions whose pillar is in TXN_LEVEL_PILLARS — keeps token cost bounded
    // and gives the model the merchant + lifestyle-tag context it needs to assign membership precisely.
    const txns: IncomingTxn[] = Array.isArray(transactions) ? transactions : [];
    const txnLines: string[] = [];
    txns.forEach((t, idx) => {
      if (!t.pillar || !TXN_LEVEL_PILLARS.has(t.pillar)) return;
      const merchant = (t.normalized_merchant || t.merchant_name || "?").slice(0, 40);
      const amt = typeof t.amount === "number" ? `$${t.amount.toFixed(0)}` : "?";
      const date = t.date || "?";
      const subs = t.subcategories?.length ? `[${t.subcategories.join(", ")}]` : "[]";
      txnLines.push(`[T${idx}] ${merchant} · ${amt} · ${date} · ${t.pillar} > ${t.category ?? "?"} · ${subs}`);
    });
    const txnBlock = txnLines.length
      ? `\n\nLifestyle-relevant transactions (use these to build transaction_indices for rollups in Travel, Style, Family, Health, Sports, Entertainment, Food pillars):\n${txnLines.join("\n")}`
      : "";

    // ---- Financial-signal candidate transactions ----
    // The lifestyle block above deliberately hides financial products (auto loans, mortgages,
    // brokerage, insurance, etc.), so we surface them separately with the SAME [T<idx>] numbering
    // so the LLM can attach them to financial_signals.transaction_indices.
    const FINANCIAL_MERCHANT_HINTS = [
      "toyota financial","vw credit","volkswagen credit","ford credit","gm financial","honda financial",
      "ally auto","chase auto","capital one auto","bmw financial","mercedes-benz financial",
      "hyundai motor finance","nissan motor accept","lease","leasing",
      "rocket mortgage","wells fargo home mortgage","chase home lending","pennymac","mr. cooper",
      "loandepot","zillow home loans","quicken loans","heloc","home equity",
      "nelnet","sallie mae","navient","great lakes","fedloan","mohela","aidvantage",
      "sofi loan","lightstream","marcus loan","upstart","prosper","lendingclub","best egg",
      "amex payment","chase card payment","discover payment","capital one card",
      "fidelity","schwab","vanguard","robinhood","wealthfront","betterment","etrade","merrill edge",
      "401k","ira contribution","roth ira","sep ira",
      "northwestern mutual","new york life","massmutual","prudential life","guardian life",
      "haven life","policygenius",
      "529","my529","collegeamerica","scholarshare",
    ];
    const FINANCIAL_PILLARS = new Set(["Financial & Aspirational", "Financial Services"]);
    const financialTxnLines: string[] = [];
    txns.forEach((t, idx) => {
      const merchant = (t.normalized_merchant || t.merchant_name || "").toLowerCase();
      const pillar = t.pillar || "";
      const category = (t.category || "").toLowerCase();
      const merchantHit = merchant && FINANCIAL_MERCHANT_HINTS.some(h => merchant.includes(h));
      const pillarHit = FINANCIAL_PILLARS.has(pillar);
      const rentMortgageHit = pillar === "Home & Living" && (category.includes("rent") || category.includes("mortgage"));
      if (!merchantHit && !pillarHit && !rentMortgageHit) return;
      const m = (t.normalized_merchant || t.merchant_name || "?").slice(0, 40);
      const amt = typeof t.amount === "number" ? `$${t.amount.toFixed(0)}` : "?";
      const date = t.date || "?";
      const subs = t.subcategories?.length ? `[${t.subcategories.join(", ")}]` : "[]";
      financialTxnLines.push(`[T${idx}] ${m} · ${amt} · ${date} · ${pillar} > ${t.category ?? "?"} · ${subs}`);
    });
    const financialTxnBlock = financialTxnLines.length
      ? `\n\nFinancial-signal candidate transactions (use these [T<n>] indices for financial_signals.transaction_indices — NEVER include them in pillar_rollups):\n${financialTxnLines.join("\n")}`
      : "";

    const lifeEventSuppressionBlock = detectedEventNames.length > 0
      ? `

**CRITICAL — LIFE EVENTS ALWAYS WIN:**
The following life events have already been detected for this customer and will be shown separately: ${detectedEventNames.map(n => `"${n}"`).join(", ")}.

Life events carry richer context (funding sources, timing, product fit) and are surfaced in their own dedicated UI section. When a behavioral pattern thematically overlaps with a detected life event, **DROP the behavioral rollup entirely** — do NOT try to "complement" the life event with a parallel rollup on the same theme. Redundant pills make the UI feel duplicated and dilute both signals.

Examples of forbidden overlaps:
- If "New Home Transition" or any home-purchase event is detected → do NOT produce "Aspiring Homeowner", "Home Buyer", "Nesting Phase", "New Homeowner", or any home-purchase / moving / nesting themed rollup.
- If "College Preparation for Dependent" or any education event is detected → do NOT produce "College Bound", "Education Investor", or similar education-themed rollup.
- If "New Baby" or family-expansion event is detected → do NOT produce "New Parent", "Baby Prep", or similar.
- If "Retirement Planning" is detected → do NOT produce retirement-themed rollups.
- If "Wedding" is detected → do NOT produce engagement / wedding-themed rollups.

When in doubt, skip the rollup. Life events take priority — every time.
`
      : "";

    // ---- Risk suppression: keep gambling, vice, BNPL, payday, collections, adult, offshore
    // out of customer-facing lifestyle rollups. The risk engine owns these themes and surfaces
    // them in its own dedicated Risk panel — so any overlap here would double-show transactions.
    const riskSuppressionBlock = `

**CRITICAL — RISK SIGNALS WIN OVER LIFESTYLE PILLS:**
${presentRiskCategories.length > 0
  ? `The following risk categories have already been detected for this customer and will be shown in a separate Risk panel: ${presentRiskCategories.map(n => `"${n}"`).join(", ")}.

When a behavioral pattern thematically overlaps with one of these risk categories, **DROP the behavioral rollup entirely** — do NOT package vice/financial-distress activity as a customer-facing lifestyle habit. The Risk panel handles it; your job is to describe lifestyle.

Examples of forbidden overlaps:
- If "Sports Betting", "Casino & Table Games", "Gambling", or "High-Risk / Offshore Gambling" is present → do NOT produce "Sports Betting", "Casino", "Gambler", "Sportsbook", "High Roller", "Wagering", "Vegas Trips" (when the Vegas spend is gambling-driven), or any rollup that bundles those merchants.
- If "BNPL Activity", "Payday Advance", or "Overdraft & NSF Activity" is present → do NOT produce "Smart Borrower", "Buy-Now-Pay-Later Shopper", "Cash Flow Manager", or similar money-management rollups built on those rows.
- If "Adult Entertainment" is present → do NOT produce "Nightlife Regular" or any rollup built on those merchants.
- If "Collections" is present → do NOT produce any debt-themed rollup; that's risk territory.
- If "High-Risk / Offshore Gambling" or unusual cross-border wires are flagged → do NOT produce "Crypto Trader", "Global Money Mover", or similar rollup built on flagged rows.

`
  : ""
}**PERMANENT VOCABULARY BAN (always enforced, even when no risk categories are listed above):**
NEVER use any of these tokens in a pillar_rollup label: "Betting", "Sportsbook", "Casino", "Wager", "Wagering", "Gambler", "Gambling", "High Roller", "Cash Advance", "Payday", "BNPL", "Buy Now Pay Later", "Collections", "Adult", "Vice". These concepts belong exclusively to the Risk surface — restating them as a celebrated lifestyle habit creates conflicting tone and double-shows the same transactions.

${flaggedTxIds.length > 0
  ? `**FORBIDDEN TRANSACTION INDICES:** The transactions corresponding to these merchant IDs have been flagged by the risk engine: they are owned exclusively by the Risk panel. NEVER include any of these rows in transaction_indices for any pillar_rollup, regardless of how attractive a lifestyle theme might appear: ${flaggedTxIds.slice(0, 50).map(id => `"${id}"`).join(", ")}.

When you build transaction_indices, you must check each candidate [T<n>] row against the merchant context — if its merchant is one of the flagged IDs above (the [T<n>] line will let you cross-reference by merchant name), exclude it.

`
  : ""
}When in doubt, skip the rollup. Risk signals take priority — every time.
`;

    const systemPrompt = `You are a sharp behavioral analyst at a bank. You look at someone's spending and figure out who they actually are — the way a friend would describe them.

Given aggregated spending signals, produce TWO outputs:
1. **detected_life_events** — major life-stage events (home purchase, college prep, wedding, baby, etc.) that the spending evidence supports.
2. **pillar_rollups** — vivid behavioral labels that group categories into lifestyle habits.

**Life events are NOT lifestyle habits.** A home purchase is a one-time life event; "Casual Dining Regular" is a lifestyle habit. Promote qualifying clusters into life events FIRST, then build rollups from what's left.

**Before you write anything, scan the merchants in each category — they're your ground truth. Category names lie; merchants don't.**

---

## LIFE EVENT PROMOTION (do this FIRST, before any rollup)

For each canonical life event below, check whether the per-transaction list meets the minimum-evidence threshold. If it does, **you MUST emit it under detected_life_events** AND you MUST NOT emit a pillar_rollup on the same theme.

**Canonical life events + thresholds:**

- **"Home Purchase / Transition"** — 3+ transactions from any combination of: realtor, title company, escrow, home inspector, mortgage company, moving company, large home retailers in atypical volume (Crate & Barrel, West Elm, Pottery Barn, Restoration Hardware, IKEA, Williams Sonoma Home), Home Depot/Lowe's spike (>$500 single ticket or 3+ visits), first-time mortgage payment, HOA setup, utility transfers, appliance retailers (>$500).

- **"College Preparation for Dependent"** — 2+ from: SAT/ACT/Kaplan/Princeton Review, college visitor parking, application portals (Common App, Coalition), university bursar/tuition deposit, AP exam fees, college tour airfare paired with university merchant. OR a single explicit university tuition/deposit transaction.

- **"Wedding / Engagement"** — 2+ from: jeweler $2k+, wedding venue, bridal salon, wedding photographer, event caterer, registry retailers (Crate & Barrel registry, Williams Sonoma registry).

- **"New Baby / Family Expansion"** — 2+ from: OB/midwife, baby specialty retailers (buybuy BABY, Babylist, Carter's), pediatrician, daycare, hospital L&D, baby furniture, infant formula in volume.

- **"Business Formation"** — 2+ from: LLC/incorporation services (LegalZoom, Stripe Atlas, ZenBusiness), business banking setup, business insurance, commercial leasing, business software subscriptions in cluster.

- **"Elder Care"** — 2+ from: assisted living facility, home health aide service, geriatric care manager, durable medical equipment, hospice services, senior community fees.

- **"Retirement Planning"** — 2+ from: financial advisor consult fees, estate attorney, downsizing-related real estate activity, Medicare supplement insurance, retirement community deposits.

- **"Relocation"** — 2+ from: long-distance movers, vehicle shipping, temporary housing/extended-stay hotels >7 nights, utility setup in new metro, storage unit rental.

- **"Inheritance / Windfall"** — large one-time inflow indicators paired with: estate attorney, trust services, financial planner consult, sudden tax-advantaged account funding spike.

**Rules:**
- Use the EXACT canonical event_name strings above. Do not invent variants.
- For each emitted life event, pick 2-4 of the strongest [T<n>] transactions as evidence. Each evidence item needs a 1-sentence "relevance" string explaining the direct causal link.
- Confidence scoring: 2 rows = 65, 3 rows = 75, 4-5 rows = 85, 6+ rows = 92.
- Talking points: 3 short, empathetic conversation starters an advisor could use.
- transaction_indices = the same [T<n>] indices listed in evidence (used downstream to highlight rows).
- **If a life event was already passed in via the input lifeEvents list, do NOT re-emit it.** That theme is already covered.
- If a cluster qualifies for a life event, the related transactions belong in that event ONLY — they must NOT also appear in a pillar_rollup. Pull them out of rollup territory entirely.

**Vocabulary ban for pillar_rollups (final defense):** NEVER use these words in a rollup label: "Phase", "Transition", "Prep", "Preparation", "Bound", "Expecting", "New Parent", "New Homeowner", "Empty Nest", "Aspiring Homeowner", "Nesting". Those describe life events — emit them as detected_life_events or omit them entirely.

---

## FINANCIAL SIGNALS (do this SECOND, after life events, before pillar rollups)

**Financial signals are recurring large-financial-product relationships** — auto loans, auto leases, mortgages, HELOCs, student loans, personal loans, credit-card payoffs, brokerage / retirement / 529 contributions, and life/disability insurance premiums. They are *bigger than spending* and NEVER belong inside a pillar_rollup (previously we saw the LLM invent "Autoloan Management" rollups mixing VW Credit + Zillow mortgage — that is EXACTLY what this section prevents).

**Detect a financial_signal when** the **Financial-signal candidate transactions** block (a separately-numbered `[T<n>]` list at the end of the user message) contains at least ONE transaction whose merchant matches one of the families below. Use those `[T<n>]` indices — they are the source of truth for `financial_signals.transaction_indices`. Group all transactions from the same servicer into one signal.

**Product families + merchant hints:**
  - auto_loan (Auto Loan) — "toyota financial", "vw credit", "volkswagen credit", "ford credit", "gm financial", "honda financial", "ally auto", "chase auto", "capital one auto", "bmw financial", "mercedes-benz financial", "hyundai motor finance", "nissan motor accept"
  - auto_lease (Auto Lease) — merchant contains "lease" / "leasing"
  - mortgage (Mortgage) — "rocket mortgage", "wells fargo home mortgage", "chase home lending", "pennymac", "mr. cooper", "loandepot", "zillow home loans", "quicken loans"
  - heloc (HELOC) — contains "heloc" / "home equity"
  - student_loan (Student Loan) — "nelnet", "sallie mae", "navient", "great lakes", "fedloan", "mohela", "aidvantage"
  - personal_loan (Personal Loan) — "sofi loan", "lightstream", "marcus loan", "upstart", "prosper", "lendingclub", "best egg"
  - credit_card_payoff (Card Payoff) — "amex payment", "chase card payment", "discover payment", "capital one card"
  - brokerage_contribution (Brokerage Contribution) — "fidelity", "schwab", "vanguard", "robinhood", "wealthfront", "betterment", "etrade", "merrill edge"
  - retirement_contribution (Retirement Contribution) — "401k", "ira contribution", "roth ira", "sep ira"
  - insurance_premium (Insurance Premium) — "northwestern mutual", "new york life", "massmutual", "prudential life", "guardian life", "haven life", "policygenius"
  - education_savings (529 Contribution) — "529", "my529", "collegeamerica", "scholarshare"

**Emit one financial_signal per (product_family, servicer) pair** with:
  - product_family — one of the enum values above
  - label — 2-5 words, "<Family> · <Servicer>", e.g. "Auto Loan · VW Credit", "Mortgage · Rocket"
  - servicer — the counterparty name as it appears
  - monthly_amount_band — vaguely-specific band ("~$450/mo", "~$2.1k/mo"). NEVER exact dollar figures. Omit if only 1 txn.
  - cadence — "monthly" | "biweekly" | "quarterly" | "annual" | "irregular"
  - transaction_indices — every [T<n>] index tied to this servicer
  - talking_points — 2 short advisor conversation starters (e.g. "Refi opportunity — rate reset in 2026", "Cross-sell umbrella policy")

**CRITICAL EXCLUSION — these transactions are the exclusive property of financial_signals.** Any [T<n>] you place into a financial_signal MUST NOT appear inside any pillar_rollup transaction_indices — no exceptions. This prevents debt/investment rows from being repackaged as lifestyle habits.

**Vocabulary ban for pillar_rollups (financial products):** NEVER use these words in a rollup label: "Loan", "Mortgage", "Lease", "HELOC", "Brokerage", "Investing", "Investment", "Retirement Saver", "401k", "IRA", "Premium Payer", "Debt", "Servicing", "Management" (when combined with "Auto", "Loan", "Debt"). Those belong in financial_signals.

---

## PILLAR ROLLUPS (do this THIRD, after life events and financial signals)

**How to think about rollups:**

- A rollup describes a *recurring lifestyle habit* — something you'd mention about this person at a dinner party. "She's a total fitness nut" (gym + yoga + supplements + athletic apparel). "He eats out constantly at casual spots" (fast food + casual dining + delivery).

- Only group categories within the SAME pillar. The "pillar" field MUST be one of these exact strings: ${distinctPillars.map(p => `"${p}"`).join(", ")}.

- Ask yourself: "Would a friend describe this person this way?" If someone stays at a Hilton in Dallas and also does Orange Theory, a friend would say "she's really into fitness and she traveled to Dallas" — two separate things, not "strategic domestic traveler."

- Be honest about tier. Look at actual spending levels — frequent fast-casual dining is a "Casual Dining Regular" or "Budget-Friendly Foodie", not a "Premium Gastronome." Describe spending the way the person would describe it themselves.

- Never mention brand or merchant names in rollup labels. Labels should describe the behavior or lifestyle habit, not the stores. Nordstrom + Sephora + Warby Parker = "Style-Conscious Shopper", not "Nordstrom & Sephora Loyalist." If subcategories say "Golf", say "Weekend Golfer", not "Sports Enthusiast."

- When a category shows a clear repeat cadence (shown in parentheses), explicitly encode cadence in the label — "Annual Hawaiian Vacations" (not "Hawaii Vacationer"), "Tennis & Ski Seasonal Sports" (not "Alpine & Court Enthusiast"), "Weekly Workday Coffee Runs". Don't use raw stats like "3.2x/wk".

- **Pattern-forward naming (REQUIRED when cadence is clear):** Labels must explicitly state the behavioral pattern. Use one of these formats:
  - "[Frequency] [Activity]" → "Annual Hawaiian Vacations", "Weekly Workday Coffee Runs", "Monthly Fine Dining Nights"
  - "[Activity] [Pattern]" → "Tennis & Ski Seasonal Sports", "Casual Dining Regular", "Grocery Run Weekly"
  - "[Season] [Activity]" → "Winter Ski Trips", "Summer Coastal Travel"
- **FORBIDDEN abstract descriptors:** Never use "Enthusiast", "Fan", "Lover", "Buff", "Aspirant", "Devotee", "Vacationer", "Junkie", "Aficionado", "Connoisseur". Use concrete activity + cadence terms instead. "Premium Hawaii Vacationer" → "Premium Annual Hawaiian Vacations". "Active Alpine & Court Enthusiast" → "Tennis & Ski Seasonal Sports".

- **SEMANTIC COHERENCE — TRANSACTIONS INSIDE A ROLLUP MUST MATCH ITS MEANING.**

  A rollup is not just a label — it's a *promise* about what specific transactions belong inside it. You will return **transaction_indices** (the [T<n>] row numbers from the lifestyle-relevant transactions list) listing the EXACT transactions that fit this rollup's lifestyle. The downstream UI displays only these transactions under the pill — nothing more, nothing less.

  Categories like "Hotels & Lodging", "Airlines", "Restaurants" routinely mix incompatible lifestyles. A single "Hotels & Lodging" category can contain a Hawaii beach resort, a Tahoe ski lodge, and a midtown business hotel — those are **three different lifestyles**, not one. Do NOT bundle them together.

  **Use the subcategory tags as your primary filter signal.** The classifier attaches lifestyle tags like \`Ski\`, \`Mountain\`, \`Tropical Vacation\`, \`Beach\`, \`Urban Hotel\`, \`Theme Park\`, \`Cruise\`, \`Wedding\`, \`Engagement\`, \`New Parent\`, \`Career Development\`, \`Athleisure\`, \`Foodie\`, \`Wellness\`, \`Family-Oriented\`, etc. When these tags are present on a transaction, they are the ground truth for lifestyle membership.

  Examples of forbidden mismatches:
  - "Annual Hawaiian Vacations" must NOT include a transaction tagged \`[Ski]\` or \`[Mountain]\` (PALISADES TAHOE LODGE, ASPEN MOUNTAIN, VAIL RESORTS, WHISTLER, BRECKENRIDGE).
  - "Seasonal Ski Trips" must NOT include a transaction tagged \`[Tropical Vacation]\` or \`[Beach]\` (MAUI HILTON, KONA VILLAGE, HAWAIIAN AIRLINES, Caribbean resorts).
  - "European Getaways" must NOT include domestic-only US merchants.
  - "Premium Fine Dining Nights" must NOT include MCDONALD'S or CHIPOTLE rows even if they live in a "Restaurants" category.

  **What to do:**
  1. Read every transaction in the lifestyle-relevant transactions list — merchant name, date, and especially the [subcategory tags].
  2. For each rollup, decide which exact [T<n>] rows fit the lifestyle. Include EVERY transaction that fits; exclude every one that doesn't.
  3. If a category contains **mixed lifestyles** (some Hawaii merchants, some Tahoe ski merchants), emit **separate rollups** for each coherent sub-pattern (e.g. "Annual Hawaiian Vacations" AND "Seasonal Ski Trips"). Each rollup gets its own \`transaction_indices\` listing only the matching rows.
  4. Generic merchants without a clear destination/activity tag (plain "Marriott", "Delta") may be assigned to a themed rollup ONLY if other transactions on similar dates establish the destination context. Otherwise leave them out.
  5. Do NOT include a transaction in two rollups that contradict each other. A transaction can appear in at most one lifestyle-themed rollup.

  Be inclusive WITHIN a lifestyle theme (don't drop matching transactions), exclusive ACROSS themes (don't bleed Tahoe into Hawaii).

  When in doubt, emit fewer, more honest rollups. A coherent "Annual Hawaiian Vacations" pill containing only Hawaii-tagged transactions is worth more than a bloated "Premium Travel" pill that lumps everything together.

- **For pillars NOT in the lifestyle-relevant transactions list** (Home & Living utilities, Financial Services, Technology subscriptions, Pets, Transportation, etc.), you don't need transaction_indices — just provide \`category_indices\` from the per-category summary. Use \`transaction_indices: []\` for those rollups.

- Rollups are optional. If categories don't share a clear habit, leave them ungrouped. One thoughtful rollup is better than three forced ones. A single purchase at one merchant doesn't define a lifestyle. **A coherent individual identity is the only justification for a rollup. Timing patterns alone (weekend / evening / morning) and price-tier alone (premium / luxury / big-ticket) are not identities — they're descriptors. If no underlying identity holds the transactions together, drop the rollup.**

- **THE IDENTITY TEST — RUN THIS BEFORE EMITTING ANY ROLLUP.** Every candidate rollup must pass BOTH questions below. If either fails, drop the rollup entirely.

  **Q1 — Fill in the blank:** Complete this sentence using the rollup as the noun: *"This person is the kind of person who ___."*
  - PASS examples: "...takes annual Hawaii trips", "...plays tennis every week", "...eats at casual spots constantly", "...buys premium athleisure", "...stocks up at warehouse clubs", "...keeps an organic-grocery routine".
  - FAIL examples: "...shops on weekends", "...spends premium amounts", "...has runs of purchases", "...goes on outings", "...makes big-ticket buys".
  - If the only honest completion describes *when* (weekend / evening / morning) or *how much* (premium / luxury / big-ticket) the spending happened — not *what activity or lifestyle* — there is no identity. Drop it.

  **Q2 — Single activity / lifestyle:** Name in 1–3 words the ONE activity, hobby, lifestyle, or merchant category at the heart of this rollup.
  - PASS examples: golf, coffee, Hawaii travel, fine dining, athleisure, organic groceries, skincare, ski trips, warehouse-club bulk shopping.
  - FAIL examples: "shopping" (too generic), "spending" (not an activity), "outings" / "runs" (too generic), "lifestyle" (circular), "errands", "weekend stuff".
  - If you can't name a concrete activity or lifestyle, the transactions don't actually share an identity. Drop the rollup.

  **Worked failure example — DO NOT EMIT THIS:**
  ❌ "Premium Weekend Shopping Runs" covering Whole Foods + Starbucks + Costco + Nordstrom + Lululemon.
  - Q1: "...shops on weekends." → Everyone shops on weekends. No identity.
  - Q2: Single activity? "Shopping." → Too generic; this lumps groceries, coffee, warehouse club, department store, and athleisure into one bucket.
  - Cross-pillar red flag: the transactions span Food & Dining AND Style & Beauty — that alone is a structural sign there's no shared identity.
  - Correct response: drop this rollup. If the athleisure repeats elsewhere, emit something like "Athleisure Wardrobe" instead. If the organic / specialty grocery repeats, emit "Organic Grocery Routine". Otherwise, emit nothing for these transactions.

  **Cross-pillar guard:** If your candidate rollup pulls transactions from more than one pillar (e.g. groceries + clothing, or coffee + cosmetics), that's a structural sign there's no shared identity. Either split into separate per-pillar rollups (each of which must independently pass the Identity Test) or drop entirely.

  Neutral words like "Weekend", "Premium", "Weekly" are NOT banned — they're fine when paired with a real activity ("Weekend Golfer", "Premium Hawaii Vacations", "Weekly Coffee Runs"). They are forbidden only when they ARE the theme.

- **THEMATIC UNIQUENESS — ONE ROLLUP PER THEME:** Each rollup must cover a *distinct* behavioral theme. NEVER emit two rollups that describe the same underlying life pattern under different names. Forbidden duplicate pairs include (but are not limited to):
  - "Aspiring Homeowner" + "New Home Transition" / "Home Buyer" / "Nesting Phase"
  - "College Bound" + "Education Investor" / "Tuition Planner"
  - "New Parent" + "Baby Prep" / "Growing Family"
  - "Frequent Traveler" + "Vacation Planner" / "Jetsetter"
  - "Retirement Saver" + "Pre-Retiree"
  Pick the SINGLE best label and combine all related categories under it. If you find yourself writing two rollups about the same life pattern, merge them into one. (Note: "Annual Hawaiian Vacations" + "Seasonal Ski Trips" are NOT duplicates — they're distinct lifestyles and should remain separate.)

- Always include the exact category names combined and the [N] row indices from the per-category input. For lifestyle-prone pillars also include the [T<n>] transaction_indices from the per-transaction list.

- **RECURRING SPORT / FITNESS / HOBBY CLUSTERS — ALWAYS EMIT:** If the per-transaction list contains **3 or more transactions** tied to the same recurring sport, fitness discipline, or hobby (e.g. tennis club + tennis apparel + racquet retailer; golf course + pro shop + golf apparel; cycling studio + bike shop + cycling kit; yoga studio + activewear; ski resort + ski rental + ski apparel), you MUST emit a dedicated rollup for that activity (e.g. "Tennis & Court Sports", "Weekend Golfer", "Cycling Enthusiast", "Dedicated Yogi", "Seasonal Skier"). Do NOT bundle two distinct sports into one generic "Seasonal Sports" or "Active Lifestyle" pill — each recurring discipline gets its own rollup. This rule applies even when the cluster's total spend is smaller than other categories; recurring activity-specific behavior is a strong lifestyle signal regardless of dollar rank.${lifeEventSuppressionBlock}${riskSuppressionBlock}`;

    const userContent = `Per-category spending signals:\n${pillarSummary}${txnBlock}${financialTxnBlock}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_persona",
              description: "Return the per-pillar rollup labels with exact transaction membership",
              parameters: {
                type: "object",
                properties: {
                  pillar_rollups: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        pillar: { type: "string", enum: distinctPillars, description: "The pillar name — MUST be one of the exact input pillar names" },
                        label: { type: "string", description: "2-4 word vivid rollup label for this pillar" },
                        categories: {
                          type: "array",
                          items: { type: "string" },
                          description: "The category names from this pillar that were combined",
                        },
                        category_indices: {
                          type: "array",
                          items: { type: "number" },
                          description: "The [N] row indices from the per-category input that this rollup covers",
                        },
                        transaction_indices: {
                          type: "array",
                          items: { type: "number" },
                          description: "For lifestyle-prone pillars (Travel, Style, Family, Health, Sports, Entertainment, Food): the EXACT [T<n>] row indices from the per-transaction list that belong in this rollup. Use the [subcategory] tags (Ski / Tropical Vacation / Wedding / etc.) as your primary filter. NEVER include a transaction whose subcategory tags contradict the rollup's theme (no Ski-tagged txn in a Hawaii rollup, no Tropical-tagged txn in a Ski rollup). For pillars without per-transaction data, return an empty array.",
                        },
                      },
                      required: ["pillar", "label", "categories", "category_indices", "transaction_indices"],
                      additionalProperties: false,
                    },
                    description: "Per-pillar rollup labels. Each rollup MUST describe a distinct behavioral theme — never emit two rollups on the same underlying life pattern (merge them into one). If a theme is already covered by a detected life event (either passed in via input lifeEvents OR emitted in detected_life_events below), OMIT the behavioral rollup entirely — life events take priority. Return empty array if no coherent groupings exist.",
                  },
                  detected_life_events: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        event_name: {
                          type: "string",
                          enum: [
                            "Home Purchase / Transition",
                            "College Preparation for Dependent",
                            "Wedding / Engagement",
                            "New Baby / Family Expansion",
                            "Business Formation",
                            "Elder Care",
                            "Retirement Planning",
                            "Relocation",
                            "Inheritance / Windfall",
                          ],
                          description: "Canonical life event name — MUST match one of the enum values exactly.",
                        },
                        confidence: {
                          type: "number",
                          description: "0-100. Use 65 (2 rows), 75 (3 rows), 85 (4-5 rows), 92 (6+ rows).",
                        },
                        evidence: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              merchant: { type: "string" },
                              amount: { type: "number" },
                              date: { type: "string" },
                              relevance: { type: "string", description: "1 sentence explaining the direct causal link to the event." },
                            },
                            required: ["merchant", "amount", "date", "relevance"],
                            additionalProperties: false,
                          },
                          description: "2-4 strongest evidence transactions.",
                        },
                        talking_points: {
                          type: "array",
                          items: { type: "string" },
                          description: "3 short empathetic advisor conversation starters.",
                        },
                        transaction_indices: {
                          type: "array",
                          items: { type: "number" },
                          description: "The [T<n>] indices of the evidence transactions, for downstream highlighting.",
                        },
                      },
                      required: ["event_name", "confidence", "evidence", "talking_points", "transaction_indices"],
                      additionalProperties: false,
                    },
                    description: "Major life-stage events the spending evidence supports. Only emit when the canonical threshold is met. Do NOT re-emit any event that was passed in via the input lifeEvents list. Return empty array if nothing qualifies.",
                  },
                  financial_signals: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        product_family: {
                          type: "string",
                          enum: [
                            "auto_loan","auto_lease","mortgage","heloc","student_loan","personal_loan",
                            "credit_card_payoff","brokerage_contribution","retirement_contribution",
                            "insurance_premium","education_savings",
                          ],
                        },
                        label: { type: "string", description: "2-5 words, '<Family> · <Servicer>'." },
                        servicer: { type: "string" },
                        monthly_amount_band: { type: "string", description: "Vaguely-specific band like '~$450/mo'. Omit if only 1 txn." },
                        cadence: { type: "string", enum: ["monthly","biweekly","quarterly","annual","irregular"] },
                        transaction_indices: { type: "array", items: { type: "number" } },
                        talking_points: { type: "array", items: { type: "string" } },
                      },
                      required: ["product_family", "label", "servicer", "transaction_indices"],
                      additionalProperties: false,
                    },
                    description: "Recurring large-financial-product relationships (loans, mortgages, leases, investments, insurance). MUST NOT overlap pillar_rollups transaction_indices. Return empty array if none detected.",
                  },
                },
                required: ["pillar_rollups", "detected_life_events", "financial_signals"],
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
        return new Response(JSON.stringify({ error: "Rate limited" }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required" }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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

    return new Response(JSON.stringify({
      pillar_rollups: (raw.pillar_rollups || []).map((r: any) => ({
        pillar: r.pillar,
        label: r.label,
        categories: r.categories || [],
        category_indices: r.category_indices || [],
        transaction_indices: r.transaction_indices || [],
      })),
      detected_life_events: (raw.detected_life_events || []).map((e: any) => ({
        event_name: e.event_name,
        confidence: typeof e.confidence === "number" ? e.confidence : 70,
        evidence: Array.isArray(e.evidence) ? e.evidence : [],
        talking_points: Array.isArray(e.talking_points) ? e.talking_points : [],
        transaction_indices: Array.isArray(e.transaction_indices) ? e.transaction_indices : [],
      })),
      financial_signals: (raw.financial_signals || []).map((f: any, i: number) => ({
        id: `fs-${i}`,
        product_family: f.product_family,
        label: f.label,
        servicer: f.servicer || "",
        monthly_amount_band: f.monthly_amount_band || "",
        cadence: f.cadence || "irregular",
        transaction_indices: Array.isArray(f.transaction_indices) ? f.transaction_indices : [],
        talking_points: Array.isArray(f.talking_points) ? f.talking_points : [],
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
