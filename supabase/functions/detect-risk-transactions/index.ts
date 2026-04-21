import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

const ALLOWED_ORIGINS = [
  "https://ventuscard.com",
  "https://ventusai.com",
  "https://staging.d1gaewa028qzng.amplifyapp.com",
  /^https:\/\/.*\.ventusai\.com$/,
  /^https:\/\/.*\.lovable\.app$/,
  /^https:\/\/.*\.lovable\.dev$/,
  /^https:\/\/.*\.lovableproject\.com$/,
  /^https:\/\/.*\.amplifyapp\.com$/,
  /^http:\/\/localhost:\d+$/,
];

function getCorsHeaders(origin: string | null): Record<string, string> {
  const isAllowed =
    origin &&
    ALLOWED_ORIGINS.some((a) =>
      typeof a === "string" ? a === origin : a.test(origin)
    );
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin! : "",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };
}

// Real-estate / closing-cost keywords — never flag standalone as AML
const REAL_ESTATE_KEYWORDS = [
  "DOWN PAYMENT", "DOWNPAYMENT", "TITLE CO", "TITLE COMPANY", "ESCROW",
  "MORTGAGE", "INSPECTION", "HOME PURCHASE", "REAL ESTATE", "REALTY",
  "CLOSING COST", "EARNEST MONEY", "HOA", "PROPERTY TAX",
];

const INTL_KEYWORDS = ["INTL", "INTERNATIONAL", "FOREIGN", "OVERSEAS", "OFFSHORE"];

// Adult Entertainment merchant keyword surface (matches across any MCC)
const ADULT_STREAMING_KEYWORDS = [
  "ONLYFANS", "FENIX INTL", "FENIX INTERNATIONAL", "FANSLY", "MANYVIDS",
  "JUSTFORFANS", "MINDGEEK", "MG BILLING", "PORNHUB", "BRAZZERS", "ADULT TIME",
  "REALITY KINGS", "DIGITAL PLAYGROUND",
];
const ADULT_CAMSITE_KEYWORDS = [
  "CHATURBATE", "STRIPCHAT", "CAMSODA", "LIVEJASMIN", "BONGACAMS",
  "MYFREECAMS", "CAM4", "FLIRT4FREE", "STREAMATE",
];
const ADULT_PROCESSOR_KEYWORDS = [
  "CCBILL", "EPOCH.COM", "SEGPAY", "ROCKETGATE", "NETBILLING", "VENDO",
  "VERIFCARD", "PROBILLER",
];
// Strip-club / gentlemen's-club venue keywords — only flag when paired with MCC 5813 (bars) or 7299
const STRIP_CLUB_KEYWORDS = [
  "STRIP CLUB", "GENTLEMENS CLUB", "GENTLEMEN'S CLUB", "CABARET",
  "SPEARMINT RHINO", "RICK'S CABARET", "RICKS CABARET", "SAPPHIRE GENTLEMENS",
  "SCORES", "CRAZY HORSE", "PENTHOUSE CLUB", "CHEETAHS", "FOLLIES",
  "DEJA VU SHOWGIRLS", "TOOTSIES CABARET",
];
// Escort-adjacent — be conservative, require explicit term
const ESCORT_KEYWORDS = [
  "ESCORT SVC", "ESCORT SERVICE", "ESCORT AGENCY", "COMPANION SERVICES",
  "COMPANION SVC", "VIP COMPANIONS",
];

function matchesAny(text: string, keywords: string[]): string | null {
  for (const kw of keywords) {
    if (text.includes(kw)) return kw;
  }
  return null;
}

// ============== Gambling subcategory keyword surfaces ==============
// Order matters: more specific / higher-risk buckets are checked first.

const GAMBLING_OFFSHORE_KEYWORDS = [
  "BOVADA", "BETONLINE", "MYBOOKIE", "SPORTSBETTING.AG", "BOOKMAKER.EU",
  "BETUS", "XBET", "5DIMES", "HERITAGE SPORTS", "JAZZ SPORTS",
  "NITROGEN SPORTS", "STAKE.COM", "ROOBET", "CLOUDBET", "CRYPTO SPORTSBOOK",
  "OFFSHORE GAMING", "CURACAO GAMING", "WAGERWEB", "INTERTOPS",
];

const GAMBLING_HORSE_KEYWORDS = [
  "TVG", "TWINSPIRES", "TWIN SPIRES", "XPRESSBET", "NYRA BETS", "NYRABETS",
  "AMWAGER", "BETAMERICA", "DERBYWARS", "WATCHANDWAGER",
  "CHURCHILL DOWNS", "BELMONT PARK", "SARATOGA RACE", "SANTA ANITA",
  "DEL MAR RACE", "GULFSTREAM PARK", "AQUEDUCT", "PIMLICO RACE",
  "OFF TRACK BETTING", "OTB ", "PARI-MUTUEL", "PARIMUTUEL", "1ST BET",
];

const GAMBLING_SPORTS_KEYWORDS = [
  "DRAFTKINGS SPORTSBOOK", "DRAFTKINGS SB", "DK SPORTSBOOK",
  "FANDUEL SPORTSBOOK", "FANDUEL SB", "FD SPORTSBOOK",
  "BETMGM", "BET MGM", "CAESARS SPORTSBOOK", "CAESARS SB",
  "POINTSBET", "BETRIVERS", "BET RIVERS", "WYNNBET", "WYNN BET",
  "BARSTOOL SPORTSBOOK", "BARSTOOL SB", "FANATICS SPORTSBOOK", "FANATICS BET",
  "ESPN BET", "ESPNBET", "HARD ROCK BET", "HARDROCK BET",
  "PRIZEPICKS", "UNDERDOG FANTASY", "UNDERDOG SPORTS",
  "SPORTSBOOK", "SB DEPOSIT",
];

const GAMBLING_CASINO_KEYWORDS = [
  "MGM GRAND", "MGM RESORTS", "MGM CASINO", "BELLAGIO", "ARIA RESORT",
  "MANDALAY BAY", "LUXOR HOTEL", "EXCALIBUR HOTEL", "PARK MGM",
  "CAESARS PALACE", "HARRAHS", "HARRAH'S", "HORSESHOE CASINO",
  "WYNN LAS VEGAS", "WYNN CASINO", "ENCORE CASINO",
  "VENETIAN RESORT", "PALAZZO RESORT", "COSMOPOLITAN LAS VEGAS",
  "FOXWOODS", "MOHEGAN SUN", "BORGATA", "OCEAN CASINO", "TROPICANA CASINO",
  "PARX CASINO", "SUGARHOUSE", "RIVERS CASINO", "MOTORCITY CASINO",
  "GREEKTOWN CASINO", "PECHANGA", "BARONA CASINO", "AGUA CALIENTE",
  "BETMGM CASINO", "CAESARS CASINO", "DRAFTKINGS CASINO", "FANDUEL CASINO",
  "GOLDEN NUGGET CASINO", "BORGATA ONLINE", "RESORTS CASINO",
];

const GAMBLING_CASUAL_KEYWORDS = [
  "DRAFTKINGS DFS", "DRAFTKINGS DAILY", "DRAFTKINGS FANTASY",
  "FANDUEL DFS", "FANDUEL FANTASY", "FANDUEL DAILY",
  "YAHOO FANTASY", "SLEEPER FANTASY",
  "CHUMBA CASINO", "STAKE.US", "LUCKYLAND SLOTS", "FUNZPOINTS",
  "GLOBAL POKER", "PULSZ", "HIGH 5 CASINO", "WOW VEGAS", "MCLUCK",
  "ZYNGA POKER", "WSOP APP", "WORLD SERIES OF POKER APP",
  "POKERSTARS PLAY", "JACKPOT.COM",
];

const GAMBLING_LOTTERY_KEYWORDS = [
  "LOTTERY", "LOTTO", "POWERBALL", "MEGA MILLIONS", "SCRATCH OFF",
  "SCRATCH-OFF", "SCRATCHER", "STATE LOTTERY", "JACKPOCKET",
  "LOTTERY OFFICE", "RAFFLE", "CHARITY RAFFLE", "50/50 RAFFLE",
];

const GAMBLING_GENERIC_KEYWORDS = [
  "CASINO", "POKER", "BLACKJACK", "BACCARAT", "ROULETTE", "SLOTS ",
  "WAGER", "BETTING", "BOOKIE", "BOOKMAKER", "TURF CLUB",
];

interface GamblingHit {
  label: string;
  kind: string;
  matched: string;
  riskWeight: number;
}

function detectGambling(merchant: string, mcc: string): GamblingHit | null {
  const m = (merchant || "").toUpperCase();
  if (!m) return mcc === "7995" ? { label: "Gambling", kind: "MCC 7995 with no merchant name", matched: "MCC 7995", riskWeight: 2 } : null;
  const isGamblingMcc = mcc === "7995";

  let hit = matchesAny(m, GAMBLING_OFFSHORE_KEYWORDS);
  if (hit) return { label: "High-Risk / Offshore Gambling", kind: "Offshore / unregulated sportsbook or crypto sportsbook", matched: hit, riskWeight: 5 };

  hit = matchesAny(m, GAMBLING_HORSE_KEYWORDS);
  if (hit) return { label: "Horse Racing & Pari-mutuel", kind: "Pari-mutuel / track wagering", matched: hit, riskWeight: 2 };

  hit = matchesAny(m, GAMBLING_SPORTS_KEYWORDS);
  if (hit) return { label: "Sports Betting", kind: "Regulated sportsbook deposit", matched: hit, riskWeight: 3 };

  hit = matchesAny(m, GAMBLING_CASINO_KEYWORDS);
  if (hit) return { label: "Casino & Table Games", kind: "Casino property or regulated online casino", matched: hit, riskWeight: 3 };

  hit = matchesAny(m, GAMBLING_CASUAL_KEYWORDS);
  if (hit) return { label: "Casual / Social Gaming", kind: "Daily fantasy, sweepstakes casino, or social poker", matched: hit, riskWeight: 1 };

  hit = matchesAny(m, GAMBLING_LOTTERY_KEYWORDS);
  if (hit) return { label: "Lottery & Raffles", kind: "Lottery, scratch ticket, or raffle", matched: hit, riskWeight: 1 };

  if (isGamblingMcc) {
    hit = matchesAny(m, GAMBLING_GENERIC_KEYWORDS);
    if (hit) return { label: "Gambling", kind: "Generic gambling merchant (MCC 7995)", matched: hit, riskWeight: 2 };
    return { label: "Gambling", kind: "MCC 7995 (Betting / Casino / Lottery), unrecognized merchant", matched: "MCC 7995", riskWeight: 2 };
  }
  return null;
}

function detectAdultEntertainment(merchant: string, mcc: string): { kind: string; matched: string } | null {
  const m = (merchant || "").toUpperCase();
  if (!m) return null;
  let hit = matchesAny(m, ADULT_STREAMING_KEYWORDS);
  if (hit) return { kind: "Adult streaming subscription", matched: hit };
  hit = matchesAny(m, ADULT_CAMSITE_KEYWORDS);
  if (hit) return { kind: "Cam-site billing", matched: hit };
  hit = matchesAny(m, ADULT_PROCESSOR_KEYWORDS);
  if (hit) return { kind: "Adult content payment processor", matched: hit };
  hit = matchesAny(m, ESCORT_KEYWORDS);
  if (hit) return { kind: "Escort-adjacent service", matched: hit };
  if (mcc === "5813" || mcc === "7299") {
    hit = matchesAny(m, STRIP_CLUB_KEYWORDS);
    if (hit) return { kind: "Strip-club venue", matched: hit };
  }
  return null;
}

function isRealEstate(merchant: string, description: string): boolean {
  const text = `${merchant} ${description}`.toUpperCase();
  return REAL_ESTATE_KEYWORDS.some((kw) => text.includes(kw));
}

function looksInternational(merchant: string): boolean {
  const m = (merchant || "").toUpperCase();
  return INTL_KEYWORDS.some((kw) => m.includes(kw));
}

function nonUsZip(zip: string, homeZip: string): boolean {
  // US zip is 5 digits (or 5+4). Empty or non-numeric counts as non-US/missing.
  if (!zip) return true;
  const trimmed = zip.trim();
  if (!/^\d{5}(-\d{4})?$/.test(trimmed)) return true;
  // If we have a home zip and it matches, it's domestic
  if (homeZip && trimmed.startsWith(homeZip.trim().substring(0, 3))) return false;
  return false;
}

interface RiskFlag {
  transaction_id: string;
  category_group: "vice" | "suspicious_international" | "aml";
  category_label: string;
  severity: "low" | "medium" | "high";
  merchant: string;
  amount: number;
  date: string;
  reason: string;
}

function gamblingSeverityFor(
  hit: GamblingHit,
  weightedScore: number,
  totalSpend: number,
  subCount: number
): "low" | "medium" | "high" {
  // Offshore is always high — single hit is enough.
  if (hit.label === "High-Risk / Offshore Gambling") return "high";
  if (weightedScore >= 12 || totalSpend >= 2000) return "high";
  if (weightedScore >= 4 || totalSpend >= 500) return "medium";
  // ≥2 hits in a serious bucket (sports / casino) bumps to medium even at low spend
  if (subCount >= 2 && (hit.label === "Sports Betting" || hit.label === "Casino & Table Games")) return "medium";
  return "low";
}

function deterministicFlags(transactions: any[]): RiskFlag[] {
  const flags: RiskFlag[] = [];

  // ============== Gambling subcategory pre-pass ==============
  // Resolve every transaction (any MCC) through detectGambling. Adult-flagged ones are skipped.
  const gamblingHits = transactions
    .map((t) => {
      const merchant = t.merchant_name || t.normalized_merchant || "";
      const mcc = String(t.mcc || "").trim();
      if (isRealEstate(merchant, t.description || "")) return null;
      const hit = detectGambling(merchant, mcc);
      return hit ? { tx: t, hit } : null;
    })
    .filter((x): x is { tx: any; hit: GamblingHit } => x !== null);

  const gamblingTotal = gamblingHits.reduce((s, h) => s + (Number(h.tx.amount) || 0), 0);
  const subCounts = new Map<string, number>();
  for (const { hit } of gamblingHits) {
    subCounts.set(hit.label, (subCounts.get(hit.label) || 0) + 1);
  }
  // weightedScore = Σ (riskWeight × txCount per subcategory) + (totalSpend / 500)
  const weightedScore =
    gamblingHits.reduce((s, { hit }) => s + hit.riskWeight, 0) + gamblingTotal / 500;
  const gamblingFlaggedIds = new Set<string>();

  console.log(`[RISK] Gambling: ${gamblingHits.length} hits, total $${gamblingTotal.toFixed(2)}, weightedScore=${weightedScore.toFixed(2)}, subCounts=${JSON.stringify(Object.fromEntries(subCounts))}`);

  // ============== Adult Entertainment pre-pass ==============
  const adultHits = transactions
    .map((t) => {
      const merchant = t.merchant_name || t.normalized_merchant || "";
      const mcc = String(t.mcc || "").trim();
      if (isRealEstate(merchant, t.description || "")) return null;
      if (mcc === "5967") {
        return { tx: t, kind: "MCC 5967 (Direct Marketing / adult-content processor)", matched: "MCC 5967" };
      }
      const hit = detectAdultEntertainment(merchant, mcc);
      return hit ? { tx: t, kind: hit.kind, matched: hit.matched } : null;
    })
    .filter((x): x is { tx: any; kind: string; matched: string } => x !== null);
  const adultCount = adultHits.length;
  const adultTotal = adultHits.reduce((s, h) => s + (Number(h.tx.amount) || 0), 0);
  const adultSeverity: "low" | "medium" | "high" =
    adultCount >= 3 || adultTotal >= 500 ? "high" : "medium";
  const adultFlaggedIds = new Set(adultHits.map((h) => h.tx.transaction_id));

  // Emit adult-entertainment flags first (adult > gambling priority if both somehow match)
  for (const { tx, kind, matched } of adultHits) {
    flags.push({
      transaction_id: tx.transaction_id,
      category_group: "vice",
      category_label: "Adult Entertainment",
      severity: adultSeverity,
      merchant: tx.merchant_name || tx.normalized_merchant || "",
      amount: tx.amount,
      date: tx.date,
      reason: `${kind} — matched "${matched}". Adult-entertainment indicator (covers adult subs, cam sites, strip clubs, escort-adjacent services, adult-content processors).`,
    });
  }

  // Emit gambling flags (skip adult-flagged transactions)
  for (const { tx, hit } of gamblingHits) {
    if (adultFlaggedIds.has(tx.transaction_id)) continue;
    const subCount = subCounts.get(hit.label) || 1;
    const severity = gamblingSeverityFor(hit, weightedScore, gamblingTotal, subCount);
    const reason =
      hit.label === "High-Risk / Offshore Gambling"
        ? `${hit.label} — ${hit.kind}. Matched "${hit.matched}". Strong financial-distress / AML correlate.`
        : hit.label === "Lottery & Raffles"
          ? `${hit.label} — ${hit.kind}. Matched "${hit.matched}". Low-stakes; weak signal in isolation.`
          : `${hit.label} — ${hit.kind}. Matched "${hit.matched}". ${subCount} of ${gamblingHits.length} gambling transactions ($${gamblingTotal.toFixed(2)} total) — weighted score ${weightedScore.toFixed(1)}.`;
    flags.push({
      transaction_id: tx.transaction_id,
      category_group: "vice",
      category_label: hit.label,
      severity,
      merchant: tx.merchant_name || tx.normalized_merchant || "",
      amount: tx.amount,
      date: tx.date,
      reason,
    });
    gamblingFlaggedIds.add(tx.transaction_id);
  }

  for (const t of transactions) {
    const merchant = t.merchant_name || t.normalized_merchant || "";
    const desc = t.description || "";
    const mcc = String(t.mcc || "").trim();

    if (isRealEstate(merchant, desc)) continue;
    if (adultFlaggedIds.has(t.transaction_id)) continue;
    if (gamblingFlaggedIds.has(t.transaction_id)) continue;


    // International keywords + missing/non-US zip
    if (looksInternational(merchant) && nonUsZip(t.zip_code || "", t.home_zip || "")) {
      flags.push({
        transaction_id: t.transaction_id,
        category_group: "suspicious_international",
        category_label: "Suspicious International",
        severity: "medium",
        merchant,
        amount: t.amount,
        date: t.date,
        reason: `Merchant name suggests international processor with missing or non-US zip code.`,
      });
    }
  }
  return flags;
}

// Aliases that collapse legacy / model-emitted phrasings to canonical labels
const LABEL_ALIASES: Record<string, string> = {
  // Adult Entertainment
  "adult content": "Adult Entertainment",
  "adult": "Adult Entertainment",
  "adult services": "Adult Entertainment",
  "adult subscription": "Adult Entertainment",
  "cam site": "Adult Entertainment",
  "strip club": "Adult Entertainment",
  "escort": "Adult Entertainment",
  // Gambling subcategories
  "sports betting": "Sports Betting",
  "sportsbook": "Sports Betting",
  "regulated sportsbook": "Sports Betting",
  "casino": "Casino & Table Games",
  "casino & table games": "Casino & Table Games",
  "table games": "Casino & Table Games",
  "online casino": "Casino & Table Games",
  "horse racing": "Horse Racing & Pari-mutuel",
  "horse racing & pari-mutuel": "Horse Racing & Pari-mutuel",
  "pari-mutuel": "Horse Racing & Pari-mutuel",
  "parimutuel": "Horse Racing & Pari-mutuel",
  "track wagering": "Horse Racing & Pari-mutuel",
  "lottery": "Lottery & Raffles",
  "lottery & raffles": "Lottery & Raffles",
  "raffle": "Lottery & Raffles",
  "scratch ticket": "Lottery & Raffles",
  "scratch-off": "Lottery & Raffles",
  "casual gaming": "Casual / Social Gaming",
  "social gaming": "Casual / Social Gaming",
  "casual / social gaming": "Casual / Social Gaming",
  "daily fantasy": "Casual / Social Gaming",
  "dfs": "Casual / Social Gaming",
  "sweepstakes casino": "Casual / Social Gaming",
  "social poker": "Casual / Social Gaming",
  "offshore gambling": "High-Risk / Offshore Gambling",
  "high-risk gambling": "High-Risk / Offshore Gambling",
  "high-risk / offshore gambling": "High-Risk / Offshore Gambling",
  "crypto sportsbook": "High-Risk / Offshore Gambling",
  "unregulated gambling": "High-Risk / Offshore Gambling",
};

function normalizeLabel(label: string): string {
  const cleaned = String(label || "").replace(/_/g, " ").trim().toLowerCase();
  if (LABEL_ALIASES[cleaned]) return LABEL_ALIASES[cleaned];
  return cleaned.replace(/\b\w/g, (c) => c.toUpperCase());
}

function dedupeFlags(detFlags: RiskFlag[], modelFlags: RiskFlag[]): RiskFlag[] {
  // Deterministic flags win. Drop any model flag that overlaps a deterministic
  // flag on (transaction_id) OR (transaction_id + category_group).
  const detTxIds = new Set(detFlags.map((f) => f.transaction_id));
  const detGroupKeys = new Set(detFlags.map((f) => `${f.transaction_id}::${f.category_group}`));

  const filteredModel = modelFlags.filter((f) => {
    if (f.transaction_id && f.transaction_id !== "pattern" && detTxIds.has(f.transaction_id)) return false;
    if (detGroupKeys.has(`${f.transaction_id}::${f.category_group}`)) return false;
    return true;
  });

  // Then dedupe within the merged set by (transaction_id + category_group)
  const seen = new Set<string>();
  const out: RiskFlag[] = [];
  for (const f of [...detFlags, ...filteredModel]) {
    const key = `${f.transaction_id}::${f.category_group}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ ...f, category_label: normalizeLabel(f.category_label) });
  }
  return out;
}

const SYSTEM_PROMPT = `You are a banking risk analysis engine. You receive RAW transaction data (merchant_name, description, mcc, amount, date, zip_code, home_zip, source). You analyze it for risk in THREE groups only:

1. **vice** — Gambling/casinos/sports betting; **Adult Entertainment** (adult content subscriptions like OnlyFans / Pornhub network / Fansly, cam sites like Chaturbate / Stripchat / CamSoda, strip clubs / gentlemen's clubs / cabarets, escort-adjacent or "companion" services, adult-content payment processors like CCBill / Epoch / Segpay / Fenix International / MindGeek); payday/predatory loans; pawn shops; crypto mixing services.
2. **suspicious_international** — Cross-border wires/processors, OFAC-sanctioned jurisdictions, international transfers inconsistent with the customer's home zip.
3. **aml** — STRUCTURING (multiple deposits/withdrawals just below $10,000 thresholds), rapid round-number layering, repeated cash-equivalent activity. Must be a PATTERN of multiple transactions. A single large legitimate purchase is NEVER aml.

For each flag, return:
- transaction_id (use "pattern" only for multi-transaction AML patterns)
- category_group: "vice" | "suspicious_international" | "aml"
- category_label: a SPECIFIC human label such as "Gambling", "Adult Entertainment", "Sports Betting", "Payday Loan", "Crypto Mixing", "Suspicious International", "Cross-Border Wire", "Structuring", "Layering". Always use "Adult Entertainment" — never "Adult Content".
- severity: "low" | "medium" | "high"
- merchant
- amount
- date
- reason (one short sentence)

CRITICAL EXCLUSIONS — NEVER flag:
- Real estate / home purchases (DOWN PAYMENT, ESCROW, MORTGAGE, TITLE CO, INSPECTION, HOME PURCHASE, CLOSING COST, EARNEST MONEY, HOA, PROPERTY TAX)
- Normal travel, routine spending, large legitimate single purchases
- Generic fraud patterns (duplicates, geo anomalies)
- Tier/spending shifts

Be conservative. If unsure, do not flag. If no risks, return {"flags":[],"summary":"No significant risk factors detected."}.

Respond with valid JSON only, no markdown fences:
{
  "flags": [...],
  "summary": "..."
}`;

serve(async (req) => {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const { transactions } = await req.json();

    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return new Response(
        JSON.stringify({ error: "transactions array is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Deterministic pre-pass for high-confidence MCC/keyword matches
    const detFlags = deterministicFlags(transactions);
    console.log(`[RISK] Deterministic flags: ${detFlags.length}`);

    // Step 2: Send raw evidence to LLM for AML/pattern reasoning
    const txSummary = transactions.map((t: any) => ({
      id: t.transaction_id,
      merchant: t.merchant_name,
      description: t.description,
      mcc: t.mcc,
      amount: t.amount,
      date: t.date,
      source: t.source,
      zip: t.zip_code,
      home_zip: t.home_zip,
    }));

    const alreadyFlaggedIds = detFlags.map((f) => f.transaction_id);
    const exclusionNote = alreadyFlaggedIds.length > 0
      ? `\n\nIMPORTANT: The following transaction_ids have ALREADY been definitively flagged by deterministic rules. DO NOT re-flag them or include them in your output: ${JSON.stringify(alreadyFlaggedIds)}`
      : "";

    const userPrompt = `Analyze these ${txSummary.length} RAW transactions for risk. Focus on AML structuring patterns and suspicious international activity. Vice categories with MCC 7995 or 5967 are already handled deterministically — you may still flag other vice indicators (e.g., merchant names like "CASINO", "BET", "POKER", "PAYDAY LOAN", "PAWN") if MCC is missing.${exclusionNote}\n\n${JSON.stringify(txSummary, null, 1)}`;

    let modelFlags: RiskFlag[] = [];
    let modelSummary = "";

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 2000,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      // Still return deterministic flags if LLM fails
      return new Response(
        JSON.stringify({ flags: detFlags, summary: "Deterministic risk flags only (model unavailable)." }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content ?? "{}";

    try {
      const cleaned = rawContent.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const parsed = JSON.parse(cleaned);
      const rawModelFlags = Array.isArray(parsed.flags) ? parsed.flags : [];
      // Filter out anything the model returned for real-estate transactions
      modelFlags = rawModelFlags
        .map((f: any) => {
          // Find the matching tx to validate against real-estate exclusion
          const tx = transactions.find((t: any) => t.transaction_id === f.transaction_id);
          if (tx && isRealEstate(tx.merchant_name || "", tx.description || "")) return null;
          // Normalize: ensure category_group + category_label exist
          const group = f.category_group || f.category || "aml";
          const label = f.category_label || (typeof f.category === "string" ? f.category : "Risk");
          return {
            transaction_id: f.transaction_id || "pattern",
            category_group: group,
            category_label: label,
            severity: f.severity || "medium",
            merchant: f.merchant || "",
            amount: f.amount || 0,
            date: f.date || "",
            reason: f.reason || "",
          } as RiskFlag;
        })
        .filter((f: RiskFlag | null): f is RiskFlag => f !== null);
      modelSummary = parsed.summary || "";
    } catch {
      console.error("Failed to parse AI response:", rawContent);
    }

    const merged = dedupeFlags(detFlags, modelFlags);
    const summary = merged.length === 0
      ? "No significant risk factors detected in the analyzed transactions."
      : (modelSummary || `${merged.length} risk factor${merged.length === 1 ? "" : "s"} detected across the customer's transaction history.`);

    return new Response(
      JSON.stringify({ flags: merged, summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("detect-risk-transactions error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
