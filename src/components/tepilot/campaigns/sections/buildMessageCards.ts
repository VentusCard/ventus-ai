// Deterministic 5-card preview builder per CatalogProduct.
// One anchored campaign per card — never blended.

import type { CatalogProduct, ProductCategory } from "@/types/campaign-studio";
import type { VariantBreakdown } from "@/lib/campaignCatalogVariants";

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

// ── Copy templates ──────────────────────────────────────────────────────────

// Anchor labels sometimes use "×" (e.g. "Groceries × Warehouse club"). That
// reads as a formula in headlines and is awkward in prose. Convert to "and"
// when interpolated mid-sentence, and lowercase only the first word so brand
// nouns ("Streaming", "Ride-share") keep their shape.
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

  switch (family) {
    case "STACK":
      return {
        subject: `More back where you already shop`,
        body: `Your spend in ${anchorProse} has been steady for a while. ${name} quietly pays the most in those categories, so the rewards keep up with how you already live.`,
        cta: play === "UPGRADE" ? "Make the switch" : "See how it adds up",
        why: `Stack anchor — ${anchor}. Play: ${play}.`,
      };
    case "LIFE_EVENT":
      return {
        subject: `A good moment for ${lower}`,
        body: `${anchor} is a natural turning point. ${name} fits cleanly into what you already have — nothing to redo, just a setup that catches up with where you are.`,
        cta: play === "ACTIVATE" ? "Turn it on" : "Open when you're ready",
        why: `Life-event anchor — ${anchor}. Play: ${play}.`,
      };
    case "GOAL":
      return {
        subject: `Quiet support for your ${anchorProse}`,
        body: `The direction of your saving and spending lines up with a ${anchorProse}. ${name} keeps that momentum going in the background, on your terms.`,
        cta: play === "UPGRADE" ? "Strengthen the plan" : "Keep it going",
        why: `Goal anchor — ${anchor}. Play: ${play}.`,
      };
    case "USAGE":
      return {
        subject: `A small adjustment, more value from ${lower}`,
        body: `There's a little more room in how ${lower} can work for you. One quick change closes the gap — the rest of your setup stays exactly as it is.`,
        cta: play === "WINBACK" ? "Pick it back up" : "Turn it on",
        why: `Usage anchor — ${anchor}. Play: ${play}.`,
      };
  }
}


// ── Builder ─────────────────────────────────────────────────────────────────

export function buildMessageCards(
  product: CatalogProduct,
  variants: VariantBreakdown,
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

  if (hasStacks) {
    const n = Math.min(2, stackAnchors.length);
    for (let i = 0; i < n; i++) {
      const anchor = stackAnchors[i];
      const play = PLAYS_BY_FAMILY.STACK[i % PLAYS_BY_FAMILY.STACK.length];
      cards.push({ anchorFamily: "STACK", play, anchor, ...copyFor("STACK", product, anchor, play) });
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
