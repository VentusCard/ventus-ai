// Deterministic 5-card preview builder per CatalogProduct.
// Hard rule: 2 behavior + 1 life event + 1 demographic + 1 financial signal.
// Promo overlay folds into the first behavior card's copy — never its own card.

import type { CatalogProduct, ProductCategory } from "@/types/campaign-studio";
import type { VariantBreakdown } from "@/lib/campaignCatalogVariants";
import { getProductMechanics, type ProductMechanics, type RateRow } from "@/lib/productCatalogExtras";
import type { FlowCategory } from "@/lib/productAutomatedFlows";

export type AnchorFamily = "BEHAVIOR" | "LIFE_EVENT" | "DEMOGRAPHIC" | "FINANCIAL_SIGNAL";

export interface MessageCard {
  anchorFamily: AnchorFamily;
  play: string;          // ACQUIRE / UPGRADE / ACTIVATE / RETAIN / WINBACK
  anchor: string;        // short anchor label (the one thing this card is built on)
  subject: string;
  body: string;
  cta: string;
  ctaHref?: string;      // optional campaign URL — renders the CTA as a link
  why: string;           // 1-line rationale
  estimatedReach: number; // customers eligible for this micro-segment
}

// Deterministic reach per (family, slot, seed). Rounded to nearest 100.
const REACH_BANDS: Record<AnchorFamily, [number, number]> = {
  BEHAVIOR:         [40_000, 120_000],
  DEMOGRAPHIC:      [15_000, 45_000],
  LIFE_EVENT:       [4_000, 14_000],
  FINANCIAL_SIGNAL: [2_000, 9_000],
};

function computeReach(family: AnchorFamily, slot: number, seed: number): number {
  const [lo, hi] = REACH_BANDS[family];
  // simple deterministic hash
  const h = Math.abs(Math.sin((slot + 1) * 12.9898 + (seed + 1) * 78.233)) % 1;
  const raw = lo + h * (hi - lo);
  return Math.round(raw / 100) * 100;
}



// ── Anchor pools by category ────────────────────────────────────────────────

// Behavior (stack) — rate-table-friendly pairs.
const STACK_ANCHORS: Partial<Record<ProductCategory, string[]>> = {
  credit_cards: [
    "Groceries × Warehouse club",
    "Dining × Streaming",
    "Travel × Hotels (direct)",
    "Fuel & transit × Ride-share",
  ],
};

// Behavior (usage) — single-anchor utilization signals.
const USAGE_ANCHORS: Record<ProductCategory, string[]> = {
  credit_cards:      ["Off-us spend leakage", "Single-card concentration", "Recurring bills off-card", "Travel booked off-portal"],
  deposit_accounts:  ["Idle checking buffer", "Dormant savings sub-account", "Direct-deposit not enrolled", "Bill-pay underused"],
  loans:             ["High-rate balance elsewhere", "Variable-rate exposure", "Promo-rate window closing", "Auto-pay not enrolled"],
  investments:       ["Cash drag in checking", "Outbound brokerage transfer", "Idle IRA contribution room", "Unused tax-loss harvest"],
  insurance:         ["Coverage gap vs assets", "Comparable policy expiring", "Bundling discount unused", "Beneficiary not on file"],
  digital_services:  ["Enrolled but inactive", "Adjacent feature unused", "Mobile app not installed", "Alerts not configured"],
};

const LIFE_EVENT_ANCHORS: Record<ProductCategory, string[]> = {
  credit_cards:      ["New job on direct deposit", "Move to a new metro", "Honeymoon booked", "Newborn in household"],
  deposit_accounts:  ["Pay raise on payroll ACH", "Move to a new metro", "Bonus / settlement landed", "Returning from leave"],
  loans:             ["Auto search activity", "Earnest money posted", "Tuition bill incoming", "Wedding deposits"],
  investments:       ["New child in household", "Inheritance landed", "Career peak earnings", "Empty-nest cash freed"],
  insurance:         ["Home purchase closed", "New baby registered", "Auto purchase closed", "Beneficiary added"],
  digital_services:  ["New device detected", "First mobile session in 90 days", "Switched to direct deposit", "Move to a new metro"],
};

const DEMOGRAPHIC_ANCHORS: Record<ProductCategory, string[]> = {
  credit_cards:      ["Young professional, metro", "Family with school-age kids", "Mass-affluent household", "Empty-nester, suburb"],
  deposit_accounts:  ["Dual-income household", "Single-earner family", "Recent grad", "Pre-retiree"],
  loans:             ["First-time buyer cohort", "Move-up homeowner", "Parents of college-bound teens", "Self-employed household"],
  investments:       ["High-earner, no portfolio", "Inheritance-eligible Gen X", "Pre-retiree, 55+", "Dual-income, no kids"],
  insurance:         ["New homeowner cohort", "Young family, single income", "Empty-nester downsizer", "Small-business owner"],
  digital_services:  ["Mobile-first Gen Z", "Branch-loyal boomer", "Urban Millennial", "Suburban family"],
};

const FINANCIAL_SIGNAL_ANCHORS: Record<ProductCategory, string[]> = {
  credit_cards:      ["Rising monthly card spend", "Balance carried elsewhere", "Direct-deposit increase", "Cross-bank transfers up"],
  deposit_accounts:  ["Savings rate trending up", "Bonus landed in checking", "Outbound transfers to brokerage", "Balance volatility rising"],
  loans:             ["High-rate balance elsewhere", "Mortgage payoff accelerating", "Auto-loan term ending", "Credit utilization climbing"],
  investments:       ["Cash position growing", "Outbound to competitor brokerage", "401(k) match maxed out", "Tax-bill set-aside growing"],
  insurance:         ["Premium increase at renewal", "Asset value outpacing coverage", "Claim history clean", "Auto-pay lapses"],
  digital_services:  ["Login frequency declining", "Mobile sessions trending up", "Alert opt-ins growing", "Feature-trial signals"],
};

// ── Play assignment per anchor family ───────────────────────────────────────

const PLAYS_BY_FAMILY: Record<AnchorFamily, string[]> = {
  BEHAVIOR:         ["ACQUIRE", "UPGRADE", "ACTIVATE", "RETAIN"],
  LIFE_EVENT:       ["ACQUIRE", "ACTIVATE"],
  DEMOGRAPHIC:      ["ACQUIRE", "UPGRADE"],
  FINANCIAL_SIGNAL: ["ACTIVATE", "WINBACK", "RETAIN"],
};

// ── Mechanics resolution ────────────────────────────────────────────────────

const CATEGORY_TO_FLOW: Record<ProductCategory, FlowCategory> = {
  credit_cards: "Cards",
  deposit_accounts: "Deposits",
  loans: "Lending",
  investments: "Wealth",
  insurance: "Insurance",
  digital_services: "Deposits",
};

function productSlug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function getMechanics(product: CatalogProduct): ProductMechanics {
  return getProductMechanics(productSlug(product.name), CATEGORY_TO_FLOW[product.category]);
}

// ── Anchor → rate tier matching ─────────────────────────────────────────────

const ANCHOR_KEYWORDS: Array<{ part: RegExp; tier: RegExp }> = [
  { part: /grocer/i,                      tier: /grocer/i },
  { part: /warehouse/i,                   tier: /warehouse/i },
  { part: /dining|restaurant/i,           tier: /dining|restaurant/i },
  { part: /streaming/i,                   tier: /streaming/i },
  { part: /hotel/i,                       tier: /hotel/i },
  { part: /airfare|flight|airline/i,      tier: /airfare|airline|flight/i },
  { part: /travel/i,                      tier: /travel/i },
  { part: /fuel|gas/i,                    tier: /fuel|gas/i },
  { part: /transit|ride-?share|ride/i,    tier: /transit|ride/i },
];

function splitAnchor(anchor: string): string[] {
  return anchor.split(/\s*[×x&]\s*/).map((s) => s.trim()).filter(Boolean);
}

function cleanPart(part: string): string {
  return part.replace(/\s*\(.*?\)\s*/g, "").trim().toLowerCase();
}

function matchTier(part: string, table: RateRow[]): RateRow | null {
  const lower = cleanPart(part);
  for (const kw of ANCHOR_KEYWORDS) {
    if (kw.part.test(lower)) {
      const hit = table.find((r) => kw.tier.test(r.tier));
      if (hit) return hit;
    }
  }
  if (table[0] && /chosen|top|bonus|category|select/i.test(table[0].tier)) {
    return table[0];
  }
  return null;
}

function buildRatePhrase(anchor: string, mechanics: ProductMechanics): string | null {
  const table = mechanics.rateTable;
  if (!table || table.length === 0) return null;

  if (table.length === 1) {
    const only = table[0];
    if (/all|every|purchases|spend/i.test(only.tier)) {
      return `${only.rate} on everything, no categories to track`;
    }
    return `${only.rate} on ${only.tier.toLowerCase()}`;
  }

  const parts = splitAnchor(anchor);
  const resolved = parts
    .map((p) => ({ part: cleanPart(p), tier: matchTier(p, table) }))
    .filter((r): r is { part: string; tier: RateRow } => !!r.tier);

  if (resolved.length === 0) {
    const top = table.slice(0, 2);
    return top.map((r) => `${r.rate} on ${r.tier.toLowerCase()}`).join(" and ");
  }

  if (resolved.length === 2 && resolved[0].tier.rate === resolved[1].tier.rate) {
    return `${resolved[0].tier.rate} on ${resolved[0].part} and ${resolved[1].part}`;
  }

  return resolved
    .map(({ part, tier }) => `${tier.rate} on ${pluralize(part)}`)
    .join(" and ");
}

function pluralize(word: string): string {
  if (/s$/i.test(word)) return word;
  if (/(ch|sh|x|z)$/i.test(word)) return word + "es";
  if (/[^aeiou]y$/i.test(word)) return word.slice(0, -1) + "ies";
  return word + "s";
}

function feeLine(mechanics: ProductMechanics): string {
  return mechanics.fee || "No annual fee";
}

function keyFeature(mechanics: ProductMechanics, family: AnchorFamily): string {
  const f = mechanics.features ?? [];
  if (f.length === 0) return mechanics.tagline;
  if (family === "LIFE_EVENT")       return f.find((x) => /protect|cover|trip|fraud|insur/i.test(x)) ?? f[0];
  if (family === "DEMOGRAPHIC")      return f.find((x) => /rewards|benefit|tier|perk|status/i.test(x)) ?? f[0];
  if (family === "FINANCIAL_SIGNAL") return f.find((x) => /activat|switch|enable|enroll|redeem|cap|bonus|rate/i.test(x)) ?? f[0];
  return f[0];
}

function lc(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toLowerCase() + s.slice(1);
}

// ── Copy templates ──────────────────────────────────────────────────────────

function prose(anchor: string): string {
  const cleaned = anchor.replace(/\s*×\s*/g, " and ");
  return cleaned.charAt(0).toLowerCase() + cleaned.slice(1);
}

function copyFor(
  family: AnchorFamily,
  product: CatalogProduct,
  anchor: string,
  play: string,
): { subject: string; body: string; cta: string; why: string } {
  const name = product.name;
  const lower = name.toLowerCase();
  const anchorProse = prose(anchor);
  const mechanics = getMechanics(product);
  const ratePhrase = buildRatePhrase(anchor, mechanics);
  const fee = feeLine(mechanics);
  const feature = keyFeature(mechanics, family);

  switch (family) {
    case "BEHAVIOR": {
      const partCount = splitAnchor(anchor).length;
      const noun = partCount === 1 ? "category" : "categories";
      const subject = ratePhrase
        ? `${ratePhrase} — on your top ${noun}`
        : `More from your everyday spend`;
      const body = ratePhrase
        ? `With the ${name} you can get ${ratePhrase} — the ${noun} that already carry most of your spend. ${fee}, nothing to switch on.`
        : `With the ${name} you can get ${lc(mechanics.tagline)} — built around the pattern your spend already follows. ${fee}.`;
      return {
        subject,
        body,
        cta: play === "UPGRADE" ? "Make the switch" : "See how it adds up",
        why: `Behavior anchor — ${anchor}. Play: ${play}.`,
      };
    }
    case "LIFE_EVENT":
      return {
        subject: `A good moment for ${lower}`,
        body: `${anchor} usually reshuffles a few accounts. ${name} comes with ${lc(feature)}, ${lc(fee)} — set it up once and it keeps pace with what just changed.`,
        cta: play === "ACTIVATE" ? "Turn it on" : "Open when you're ready",
        why: `Life-event anchor — ${anchor}. Play: ${play}.`,
      };
    case "DEMOGRAPHIC":
      return {
        subject: `Built for ${anchorProse}`,
        body: `Households like ${anchorProse} tend to use ${lower} differently. ${name} leans into ${lc(feature)}, with ${lc(fee)} — sized to where you are now.`,
        cta: play === "UPGRADE" ? "See the upgrade" : "See if it fits",
        why: `Demographic anchor — ${anchor}. Play: ${play}.`,
      };
    case "FINANCIAL_SIGNAL":
      return {
        subject: `${anchor} — worth a look`,
        body: `Your recent pattern shows ${lc(anchor)}. ${name} responds with ${lc(feature)}, ${lc(fee)} — a low-friction move that matches the signal.`,
        cta: play === "WINBACK" ? "Pick it back up" : "Take a look",
        why: `Financial-signal anchor — ${anchor}. Play: ${play}.`,
      };
  }
}


// ── Builder ─────────────────────────────────────────────────────────────────

// ── Hardcoded overrides ────────────────────────────────────────────────────

function isCustomerChoiceCard(p: CatalogProduct): boolean {
  const n = p.name.toLowerCase();
  return p.category === "credit_cards" &&
         (n.includes("3/2/1") || n.includes("customer-choice") || n.includes("customer choice"));
}

const CUSTOMER_CHOICE_CARDS: MessageCard[] = [
  {
    anchorFamily: "BEHAVIOR",
    play: "ACTIVATE",
    anchor: "Everyday foodie (budget tier)",
    subject: "6% on takeout, 4% on groceries — eat happy",
    body: "The daily coffee, the Friday pizza, the grocery run that somehow always has snacks in the cart. The Customer-Choice card lets you set dining at 6% and groceries at 4% — doubled for new cardholders through December 31. The food you're feeding yourself anyway, finally feeding your rewards too.",
    cta: "Start earning on takeout",
    why: "Behavioral — everyday foodie (budget tier).",
  },
  {
    anchorFamily: "BEHAVIOR",
    play: "UPGRADE",
    anchor: "Premium foodie (premium tier)",
    subject: "6% on fine dining, 4% at the specialty grocer",
    body: "The chef's counter on a Friday, the imported cheese and good olive oil for Sunday. The Customer-Choice card lets you set dining at 6% and specialty grocery at 4% — doubled for new cardholders through December 31. However you chase a great meal, in or out, your taste earns its keep.",
    cta: "Earn on every reservation",
    why: "Behavioral — premium foodie (premium tier).",
  },
  {
    anchorFamily: "LIFE_EVENT",
    play: "ACTIVATE",
    anchor: "New home",
    subject: "New keys, new projects — 6% back",
    body: "Congrats on the new place — now comes the fun part (and the trips to the hardware store). The Customer-Choice card lets you set home improvement at 6% and furniture at 4% — doubled for new cardholders through December 31. Get rewarded for making it yours, right when it counts most.",
    cta: "Earn on the new place",
    why: "Life event — new home.",
  },
  {
    anchorFamily: "DEMOGRAPHIC",
    play: "ACQUIRE",
    anchor: "New city",
    subject: "New city, more gas, more dinners out — 6% back",
    body: "A new place to figure out means a lot of driving around and a lot of \"let's just eat out tonight.\" The Customer-Choice card lets you set gas at 6% and dining at 4%, doubled for new cardholders through December 31. Turn all that exploring into cash back while you find your new favorite spots.",
    cta: "Earn while you explore",
    why: "Demographic shift — new city.",
  },
  {
    anchorFamily: "FINANCIAL_SIGNAL",
    play: "ACTIVATE",
    anchor: "Saving toward a goal",
    subject: "Turn everyday spending into your goal",
    body: "You're saving toward something — so why not let your spending help? The Customer-Choice card pays you back on the categories you pick (think 6% groceries, 4% gas), doubled for new cardholders through December 31. Send that cash back straight to your goal and get there a little faster, every time you shop.",
    cta: "Put rewards toward my goal",
    why: "Financial signal — saving toward a goal.",
  },
];

function pick<T>(pool: T[], i: number, seed: number): T {
  return pool[(i + seed) % pool.length];
}

export function buildMessageCards(
  product: CatalogProduct,
  variants: VariantBreakdown,
  offers: string[] = [],
  campaignLink: string = "",
  seed: number = 0,
): MessageCard[] {
  if (isCustomerChoiceCard(product)) {
    const href = campaignLink.trim();
    // Rotate the deck by seed so Regenerate actually reorders the 5 cards
    // (featured card + reveal sequence shift on each click).
    const len = CUSTOMER_CHOICE_CARDS.length;
    const offset = ((seed % len) + len) % len;
    const rotated = CUSTOMER_CHOICE_CARDS
      .slice(offset)
      .concat(CUSTOMER_CHOICE_CARDS.slice(0, offset));
    return href
      ? rotated.map((c) => ({ ...c, ctaHref: href }))
      : rotated;
  }
  const cat = product.category;
  const stackPool = STACK_ANCHORS[cat] ?? [];
  const usagePool = USAGE_ANCHORS[cat] ?? [];
  const lifePool = LIFE_EVENT_ANCHORS[cat] ?? [];
  const demoPool = DEMOGRAPHIC_ANCHORS[cat] ?? [];
  const signalPool = FINANCIAL_SIGNAL_ANCHORS[cat] ?? [];

  const primaryOffer = offers[0]?.trim();
  const cards: MessageCard[] = [];

  // Build two behavior pools: prefer stacks first when available, then usage.
  // Slot 0 + 1 both behavior.
  const behaviorSources: Array<string[]> = [];
  if (stackPool.length > 0) {
    behaviorSources.push(stackPool);
    behaviorSources.push(usagePool.length > 0 ? usagePool : stackPool);
  } else {
    behaviorSources.push(usagePool);
    behaviorSources.push(usagePool);
  }

  // Decouple slot 0 and slot 1 so Regenerate reshuffles instead of shifting
  // both slots in lockstep. Slot 1 uses a different seed offset, and if the
  // two anchors still collide (same pool), bump slot 1 further.
  const slotSeedOffsets = [0, 1];
  let prevAnchor: string | null = null;
  for (let slot = 0; slot < 2; slot++) {
    const pool = behaviorSources[slot];
    if (pool.length === 0) continue;
    let extra = slotSeedOffsets[slot];
    let anchor = pick(pool, 0, seed + extra);
    if (slot === 1 && anchor === prevAnchor && pool.length > 1) {
      extra += 1;
      anchor = pick(pool, 0, seed + extra);
    }
    const play = pick(PLAYS_BY_FAMILY.BEHAVIOR, slot, seed);
    const base = copyFor("BEHAVIOR", product, anchor, play);
    const body = primaryOffer && slot === 0
      ? `${base.body} Currently: ${primaryOffer}.`
      : base.body;
    cards.push({ anchorFamily: "BEHAVIOR", play, anchor, ...base, body });
    prevAnchor = anchor;
  }

  // Slot 2: life event
  if (lifePool.length > 0) {
    const anchor = pick(lifePool, 0, seed);
    const play = pick(PLAYS_BY_FAMILY.LIFE_EVENT, 0, seed);
    cards.push({ anchorFamily: "LIFE_EVENT", play, anchor, ...copyFor("LIFE_EVENT", product, anchor, play) });
  }

  // Slot 3: demographic
  if (demoPool.length > 0) {
    const anchor = pick(demoPool, 0, seed);
    const play = pick(PLAYS_BY_FAMILY.DEMOGRAPHIC, 0, seed);
    cards.push({ anchorFamily: "DEMOGRAPHIC", play, anchor, ...copyFor("DEMOGRAPHIC", product, anchor, play) });
  }

  // Slot 4: financial signal
  if (signalPool.length > 0) {
    const anchor = pick(signalPool, 0, seed);
    const play = pick(PLAYS_BY_FAMILY.FINANCIAL_SIGNAL, 0, seed);
    cards.push({ anchorFamily: "FINANCIAL_SIGNAL", play, anchor, ...copyFor("FINANCIAL_SIGNAL", product, anchor, play) });
  }

  const href = campaignLink.trim();
  const out = href ? cards.map((c) => ({ ...c, ctaHref: href })) : cards;

  return out.slice(0, 5);
}
