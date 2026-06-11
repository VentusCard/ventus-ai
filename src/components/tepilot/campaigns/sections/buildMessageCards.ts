// Deterministic 5-card preview builder per CatalogProduct.
// One anchored campaign per card — never blended.

import type { CatalogProduct, ProductCategory } from "@/types/campaign-studio";
import type { VariantBreakdown } from "@/lib/campaignCatalogVariants";
import { getProductMechanics, type ProductMechanics, type RateRow } from "@/lib/productCatalogExtras";
import type { FlowCategory } from "@/lib/productAutomatedFlows";

export type AnchorFamily = "STACK" | "LIFE_EVENT" | "GOAL" | "USAGE";

export interface MessageCard {
  anchorFamily: AnchorFamily;
  play: string;          // ACQUIRE / UPGRADE / ACTIVATE / RETAIN / WINBACK
  anchor: string;        // short anchor label (the one thing this card is built on)
  subject: string;
  body: string;
  cta: string;
  why: string;           // 1-line rationale
}

// ── Anchor pools by category ────────────────────────────────────────────────

const STACK_ANCHORS: Partial<Record<ProductCategory, string[]>> = {
  credit_cards: [
    "Groceries × Warehouse club",
    "Dining × Streaming",
    "Travel × Hotels (direct)",
    "Fuel & transit × Ride-share",
  ],
};

const LIFE_EVENT_ANCHORS: Record<ProductCategory, string[]> = {
  credit_cards:      ["New job on direct deposit", "Move to a new metro", "Honeymoon booked", "Newborn in household"],
  deposit_accounts:  ["Pay raise on payroll ACH", "Move to a new metro", "Bonus / settlement landed", "Returning from leave"],
  loans:             ["Auto search activity", "Earnest money posted", "Tuition bill incoming", "Wedding deposits"],
  investments:       ["New child in household", "Inheritance landed", "Career peak earnings", "Empty-nest cash freed"],
  insurance:         ["Home purchase closed", "New baby registered", "Auto purchase closed", "Beneficiary added"],
  digital_services:  ["New device detected", "First mobile session in 90 days", "Switched to direct deposit", "Move to a new metro"],
};

const GOAL_ANCHORS: Record<ProductCategory, string[]> = {
  credit_cards:      ["Pay-off plan in motion", "Travel fund forming", "Big-ticket purchase ahead"],
  deposit_accounts:  ["Emergency fund target", "Down-payment savings", "Tax-bill set-aside"],
  loans:             ["Debt consolidation arc", "Home-improvement plan", "Tuition runway"],
  investments:       ["Retirement runway", "College tuition runway", "Wealth-transfer plan"],
  insurance:         ["Income-protection floor", "Asset-protection floor"],
  digital_services:  ["Self-serve adoption goal"],
};

const USAGE_ANCHORS: Record<ProductCategory, string[]> = {
  credit_cards:      ["Off-us spend leakage", "Single-card concentration"],
  deposit_accounts:  ["Idle checking buffer", "Dormant savings sub-account"],
  loans:             ["High-rate balance elsewhere", "Variable-rate exposure"],
  investments:       ["Cash drag in checking", "Outbound brokerage transfer"],
  insurance:         ["Coverage gap vs assets", "Comparable policy expiring"],
  digital_services:  ["Enrolled but inactive", "Adjacent feature unused"],
};

// ── Play assignment per anchor family ───────────────────────────────────────

const PLAYS_BY_FAMILY: Record<AnchorFamily, string[]> = {
  STACK:      ["ACQUIRE", "UPGRADE", "ACTIVATE", "RETAIN"],
  LIFE_EVENT: ["ACQUIRE", "ACTIVATE"],
  GOAL:       ["RETAIN", "UPGRADE"],
  USAGE:      ["ACTIVATE", "WINBACK"],
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

// Keyword groups: anchor-part token → tier-text tokens that imply a match.
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

// Strip parenthetical qualifiers ("Hotels (direct)" → "Hotels"), lowercase.
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
  // Fallback: the top "chosen-category" tier (first row), if it reads like one.
  if (table[0] && /chosen|top|bonus|category|select/i.test(table[0].tier)) {
    return table[0];
  }
  return null;
}

// Build a natural-language earn phrase for STACK / USAGE bodies.
// Returns null when the product doesn't have a rate table (deposits, etc.).
function buildRatePhrase(anchor: string, mechanics: ProductMechanics): string | null {
  const table = mechanics.rateTable;
  if (!table || table.length === 0) return null;

  // Flat-rate card: single tier covering everything.
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
    // No keyword hits — fall back to top two tiers verbatim.
    const top = table.slice(0, 2);
    return top.map((r) => `${r.rate} on ${r.tier.toLowerCase()}`).join(" and ");
  }

  // Collapse when both parts resolve to the same tier.
  if (resolved.length === 2 && resolved[0].tier.rate === resolved[1].tier.rate) {
    return `${resolved[0].tier.rate} on ${resolved[0].part} and ${resolved[1].part}`;
  }

  return resolved
    .map(({ part, tier }) => `${tier.rate} on ${pluralize(part)}`)
    .join(" and ");
}

// Light pluralization for natural earn phrases ("warehouse club" → "warehouse clubs").
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
  // Pick the feature most aligned with the family's intent.
  if (family === "LIFE_EVENT") return f.find((x) => /protect|cover|trip|fraud|insur/i.test(x)) ?? f[0];
  if (family === "GOAL")       return f.find((x) => /goal|automat|rebalanc|track|harvest|grow/i.test(x)) ?? f[0];
  if (family === "USAGE")      return f.find((x) => /activat|switch|enable|enroll|redeem|cap|bonus/i.test(x)) ?? f[0];
  return f[0];
}

// Lowercase first letter (for mid-sentence interpolation).
function lc(s: string): string {
  return s.length === 0 ? s : s.charAt(0).toLowerCase() + s.slice(1);
}

// ── Copy templates ──────────────────────────────────────────────────────────

// Anchor labels sometimes use "×" (e.g. "Groceries × Warehouse club"). Convert
// to "and" when interpolated mid-sentence, and lowercase only the first word so
// brand-ish nouns ("Streaming", "Ride-share") keep their shape.
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
    case "STACK": {
      const partCount = splitAnchor(anchor).length;
      const noun = partCount === 1 ? "category" : "categories";
      const subject = ratePhrase
        ? `${ratePhrase} — on your two biggest categories`
        : `More from your everyday spend`;
      const body = ratePhrase
        ? `With the ${name} you can get ${ratePhrase} — the ${noun} that already carry most of your spend. ${fee}, nothing to switch on.`
        : `With the ${name} you can get ${lc(mechanics.tagline)} — built around the pattern your spend already follows. ${fee}.`;
      return {
        subject,
        body,
        cta: play === "UPGRADE" ? "Make the switch" : "See how it adds up",
        why: `Stack anchor — ${anchor}. Play: ${play}.`,
      };
    }
    case "LIFE_EVENT":
      return {
        subject: `A good moment for ${lower}`,
        body: `${anchor} usually reshuffles a few accounts. ${name} comes with ${lc(feature)}, ${lc(fee)} — set it up once and it keeps pace with what just changed.`,
        cta: play === "ACTIVATE" ? "Turn it on" : "Open when you're ready",
        why: `Life-event anchor — ${anchor}. Play: ${play}.`,
      };
    case "GOAL":
      return {
        subject: `Quiet support for your ${anchorProse}`,
        body: `The direction of your saving and spending lines up with a ${anchorProse}. ${name} adds ${lc(feature)}, with ${lc(fee)} — progress compounds in the background.`,
        cta: play === "UPGRADE" ? "Strengthen the plan" : "Keep it going",
        why: `Goal anchor — ${anchor}. Play: ${play}.`,
      };
    case "USAGE": {
      const tail = ratePhrase
        ? `you start earning ${ratePhrase}`
        : `it starts pulling its weight`;
      return {
        subject: `One small switch, more from ${lower}`,
        body: `You already have ${lower}. The piece most people miss is ${lc(feature)} — flip it on and ${tail}, with nothing else to change.`,
        cta: play === "WINBACK" ? "Pick it back up" : "Turn it on",
        why: `Usage anchor — ${anchor}. Play: ${play}.`,
      };
    }
  }
}


// ── Builder ─────────────────────────────────────────────────────────────────

export function buildMessageCards(
  product: CatalogProduct,
  variants: VariantBreakdown,
  offers: string[] = [],
): MessageCard[] {
  const cards: MessageCard[] = [];
  const cat = product.category;

  // Slot allocation: prefer stack cards when product is category-bearing,
  // then life events, then goals, then usage as filler.
  const hasStacks = variants.stacks > 0 && variants.plays > 0;
  const stackAnchors = STACK_ANCHORS[cat] ?? [];
  const lifeAnchors = LIFE_EVENT_ANCHORS[cat];
  const goalAnchors = GOAL_ANCHORS[cat];
  const usageAnchors = USAGE_ANCHORS[cat];

  const target = 5;
  const primaryOffer = offers[0]?.trim();

  // Offer card — prepended when the user added at least one timely promo.
  if (primaryOffer) {
    const lower = product.name.toLowerCase();
    cards.push({
      anchorFamily: "USAGE",
      play: "OFFER",
      anchor: primaryOffer,
      subject: `${primaryOffer} — on the ${lower}`,
      body: `Right now, the ${product.name} comes with ${primaryOffer}. A timely reason to take a closer look — no other change needed.`,
      cta: "Claim offer",
      why: `Promo anchor — ${primaryOffer}.`,
    });
  }

  if (hasStacks) {
    const n = Math.min(2, stackAnchors.length);
    for (let i = 0; i < n; i++) {
      const anchor = stackAnchors[i];
      const play = PLAYS_BY_FAMILY.STACK[i % PLAYS_BY_FAMILY.STACK.length];
      const base = copyFor("STACK", product, anchor, play);
      // First STACK card carries an offer tail when a promo is active.
      const body = primaryOffer && i === 0 ? `${base.body} — ${primaryOffer}.` : base.body;
      cards.push({ anchorFamily: "STACK", play, anchor, ...base, body });
    }
  }


  // Life-event slots — at least 2 when product has them
  const lifeSlots = hasStacks ? 2 : Math.min(3, lifeAnchors.length);
  for (let i = 0; i < lifeSlots && cards.length < target; i++) {
    const anchor = lifeAnchors[i % lifeAnchors.length];
    const play = PLAYS_BY_FAMILY.LIFE_EVENT[i % PLAYS_BY_FAMILY.LIFE_EVENT.length];
    cards.push({ anchorFamily: "LIFE_EVENT", play, anchor, ...copyFor("LIFE_EVENT", product, anchor, play) });
  }

  // Goal slot
  if (cards.length < target && variants.financialGoals > 0 && goalAnchors.length > 0) {
    const anchor = goalAnchors[0];
    const play = PLAYS_BY_FAMILY.GOAL[0];
    cards.push({ anchorFamily: "GOAL", play, anchor, ...copyFor("GOAL", product, anchor, play) });
  }

  // Pad with usage / activation nudges (honest filler for low-variant products)
  let usageIdx = 0;
  while (cards.length < target && usageIdx < usageAnchors.length) {
    const anchor = usageAnchors[usageIdx];
    const play = PLAYS_BY_FAMILY.USAGE[usageIdx % PLAYS_BY_FAMILY.USAGE.length];
    cards.push({ anchorFamily: "USAGE", play, anchor, ...copyFor("USAGE", product, anchor, play) });
    usageIdx++;
  }

  // If product genuinely has fewer than 5 anchors available, return what we have —
  // the UI will render an honest "no further anchors" placeholder.
  return cards.slice(0, target);
}
