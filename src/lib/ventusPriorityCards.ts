// Ventus-anchored priority cards for the Intelligence Database overview.
// Each card is a capability Ventus can act on right now, grounded in signals
// it detected — not a generic portfolio gap. Copy stays "vaguely specific":
// no exact transaction counts, no per-customer amounts.

import type { RevenueOpportunity } from "@/types/bankwide";
import { getSignalCoverage, getSignalFamilyStats, fmtCount } from "@/lib/intelligenceSignalStats";

export type VentusCardTone = "life-event" | "offer" | "flow";

export interface VentusPriorityCard {
  id: string;
  /** Capability label shown above the headline. */
  label: string;
  headline: string;
  insight: string;
  /** Compact metric line: customers reached + value framing. */
  metric: string;
  cta: string;
  tone: VentusCardTone;
  /** Existing opportunity id so the briefing report still opens. */
  opportunityId?: string;
}

function fmtMoney(n: number) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${Math.round(n)}`;
}

export function getVentusPriorityCards(
  opportunities: RevenueOpportunity[],
): VentusPriorityCard[] {
  const coverage = getSignalCoverage();
  const families = getSignalFamilyStats();
  const financial = families.find((f) => f.key === "financial");
  const behavioral = families.find((f) => f.key === "spending_habit") ?? families[0];

  const ranked = [...opportunities].sort(
    (a, b) => b.totalOpportunityAmount - a.totalOpportunityAmount,
  );
  const [first, second, third] = ranked;

  const lifeEventCustomers = coverage.lifeEventsActive;
  const offerCustomers = financial?.customers ?? Math.round(coverage.profilesEnriched * 0.31);
  const winbackCustomers = Math.round((behavioral?.customers ?? coverage.profilesEnriched) * 0.18);

  return [
    {
      id: "life-events-ready",
      label: "Segment ready",
      headline: "Life-event signals ready to act on",
      insight:
        "Ventus detected a fresh life event in these customers' enriched transactions — the window is open now.",
      metric: `${fmtCount(lifeEventCustomers)} customers · ${fmtMoney(first?.totalOpportunityAmount ?? 0)} addressable`,
      cta: "Export segment",
      tone: "life-event",
      opportunityId: first?.id,
    },
    {
      id: "offers-ready",
      label: "Offer ready",
      headline: "Personalized offers waiting to ship",
      insight:
        "Behavioral and financial signals already map these customers to a specific product or deal.",
      metric: `${fmtCount(offerCustomers)} customers · ${fmtMoney(second?.totalOpportunityAmount ?? 0)} addressable`,
      cta: "Open personalization",
      tone: "offer",
      opportunityId: second?.id,
    },
    {
      id: "winback-ready",
      label: "Flow ready",
      headline: "Outbound wallet share Ventus can win back",
      insight:
        "Enriched transactions show recurring spend leaving the bank — an automated flow can pull it back.",
      metric: `${fmtCount(winbackCustomers)} customers · ${fmtMoney(third?.totalOpportunityAmount ?? 0)} addressable`,
      cta: "Launch flow",
      tone: "flow",
      opportunityId: third?.id,
    },
  ];
}

/** Destination each priority hands off to once Ventus has delivered it. */
export const PRIORITY_ACTION: Record<
  VentusCardTone,
  { label: string; tab: string }
> = {
  "life-event": { label: "Open the segment", tab: "ventus-ai-dashboard" },
  offer: { label: "Open personalization", tab: "targeting" },
  flow: { label: "Open automated flows", tab: "targeting-automated-flows" },
};

/** The question the chatbot answers when a priority is opened from a chip. */
export function getPriorityPrompt(card: VentusPriorityCard): string {
  return `Brief me on this priority: ${card.headline}. ${card.metric}. What did Ventus detect, who is in the segment, and what should we do next?`;
}
