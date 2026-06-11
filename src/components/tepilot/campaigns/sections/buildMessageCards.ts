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

function copyFor(
  family: AnchorFamily,
  product: CatalogProduct,
  anchor: string,
  play: string,
): { subject: string; body: string; cta: string; why: string } {
  const name = product.name;
  const lower = name.toLowerCase();

  switch (family) {
    case "STACK":
      return {
        subject: `${anchor} — your two top categories, one card`,
        body: `Your everyday spend leans into ${anchor.toLowerCase()}. The ${lower} card was built to earn the most where you already spend, with no category swaps to remember.`,
        cta: play === "UPGRADE" ? "Upgrade the card" : "See the rewards math",
        why: `Stack anchor — ${anchor}. Play: ${play}.`,
      };
    case "LIFE_EVENT":
      return {
        subject: `${anchor} — a timely fit for ${lower}`,
        body: `Recent activity points to ${anchor.toLowerCase()}. ${name} is the product designed for exactly this moment, opened in minutes without re-doing your setup.`,
        cta: play === "ACTIVATE" ? "Activate now" : "Open in minutes",
        why: `Life-event anchor — ${anchor}. Play: ${play}.`,
      };
    case "GOAL":
      return {
        subject: `${name} supports the ${anchor.toLowerCase()}`,
        body: `The arc of your finances over the last few quarters lines up with the ${anchor.toLowerCase()}. ${name} reinforces that direction and works quietly in the background.`,
        cta: play === "UPGRADE" ? "Strengthen the plan" : "Add to my plan",
        why: `Goal anchor — ${anchor}. Play: ${play}.`,
      };
    case "USAGE":
      return {
        subject: `${anchor} — ${lower} is built for this`,
        body: `We noticed ${anchor.toLowerCase()}. A quick adjustment in ${lower} closes the gap without changing the rest of your setup.`,
        cta: play === "WINBACK" ? "Bring it back" : "Turn it on",
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
