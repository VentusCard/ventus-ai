/**
 * Canonical company description. Every marketing surface (FAQ, footer, About,
 * SEO metadata, JSON-LD, llms.txt) should source its boilerplate from here so
 * positioning stays consistent site-wide.
 */

/** ~1 line. Used in footers, og descriptions, schema slogans. */
export const COMPANY_ONE_LINER =
  "Ventus AI is a behavioral intelligence and personalization engine for financial institutions.";

/** ~2 sentences. Used in meta descriptions and short intros. */
export const COMPANY_SHORT =
  "Ventus AI is a behavioral intelligence and personalization engine for financial institutions. We extract signals in spending behavior, financial behavior, and major life events, then orchestrate them into the systems banks already run so every customer gets an individually personalized experience.";

/** Full approved paragraph. Used on About and as the primary schema description. */
export const COMPANY_FULL =
  "Ventus AI is a behavioral intelligence and personalization engine for financial institutions. We extract signals in spending behavior, financial behavior, and major life events by combining proprietary behavioral enrichment on multi-rail internal data with externally observed signals from national data partnerships. Those signals are then orchestrated into the systems banks already run, so every customer gets an individually personalized experience across rewards, products, and relationships. Institutions working with Ventus can expect higher interchange, stronger deal redemption, product growth, and retention.";

export interface Outcome {
  label: string;
  detail: string;
}

/** The four outcomes institutions can expect. */
export const OUTCOMES: Outcome[] = [
  {
    label: "Higher interchange",
    detail:
      "Personalized rewards and offers move spend onto the institution's cards and keep it there.",
  },
  {
    label: "Stronger deal redemption",
    detail:
      "Offers matched to observed behavior get redeemed instead of ignored, lifting merchant-funded program economics.",
  },
  {
    label: "Product growth",
    detail:
      "Life-event and financial-behavior signals surface the right product at the moment the customer actually needs it.",
  },
  {
    label: "Retention",
    detail:
      "Relevance at every touchpoint deepens the relationship and reduces attrition to competing institutions.",
  },
];

export const OUTCOMES_INLINE =
  "Higher interchange · Stronger deal redemption · Product growth · Retention";

export interface SignalFamily {
  name: string;
  detail: string;
}

/** The three signal families Ventus extracts. */
export const SIGNAL_FAMILIES: SignalFamily[] = [
  {
    name: "Spending behavior",
    detail:
      "Lifestyle pillars, category affinities, merchant loyalty, and wallet share read across every rail the institution sees.",
  },
  {
    name: "Financial behavior",
    detail:
      "Loans, mortgages, leases, subscriptions, transfers, and investment activity — the obligations and capacity that shape what a customer can act on.",
  },
  {
    name: "Major life events",
    detail:
      "Home purchase, relocation, a new child, college preparation, and similar inflection points, each scored with the transaction evidence that fired it.",
  },
];

/** Where the signal comes from. */
export const DATA_SOURCES = [
  {
    name: "Multi-rail internal data",
    detail:
      "Card, ACH, transfer, and account activity from the institution's own systems, run through proprietary behavioral enrichment.",
  },
  {
    name: "National data partnerships",
    detail:
      "Externally observed signals that extend visibility beyond the institution's own rails, so the picture of a customer is not limited to what they spend in-house.",
  },
];
