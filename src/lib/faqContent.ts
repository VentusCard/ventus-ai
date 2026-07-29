import type { QA } from "@/lib/seoSchema";

/**
 * Canonical FAQ set. Rendered on the homepage FAQ section and the /faq page,
 * and emitted as FAQPage structured data on both.
 */
export const COMPANY_FAQS: QA[] = [
  {
    q: "What is Ventus AI?",
    a: "Ventus AI is a behavioral intelligence and personalization engine for financial institutions. We extract signals in spending behavior, financial behavior, and major life events by combining proprietary behavioral enrichment on multi-rail internal data with externally observed signals from national data partnerships. Those signals are orchestrated into the systems banks already run, so every customer gets an individually personalized experience across rewards, products, and relationships.",
  },
  {
    q: "What signals does Ventus extract?",
    a: "Three families. Spending behavior covers lifestyle pillars, category affinities, merchant loyalty, and wallet share. Financial behavior covers loans, mortgages, leases, subscriptions, transfers, and investment activity. Major life events cover inflection points such as a home purchase, relocation, a new child, or college preparation. Demographic context and risk flags sit underneath as supporting layers, and every signal carries the transactions that justify it.",
  },
  {
    q: "Where does the data come from?",
    a: "Two sources, combined. The first is multi-rail internal data — card, ACH, transfer, and account activity from the institution's own systems, run through Ventus proprietary behavioral enrichment. The second is externally observed signals from national data partnerships, which extend visibility beyond the institution's own rails so a customer's picture is not limited to what they spend in-house.",
  },
  {
    q: "How is Ventus different from a transaction enrichment provider?",
    a: "Enrichment providers clean and categorize a transaction: merchant name, MCC, category. That is a labeling layer. Ventus interprets patterns across a customer's full history and across external signals to produce behavioral intelligence — what this customer is doing, what they are committed to, and what is changing in their life — then activates it. Enrichment is an input to Ventus, not the product.",
  },
  {
    q: "How does life event detection work?",
    a: "Ventus scores combinations of enriched transactions over time against life-event patterns — inspection fees, moving services, and title payments for a home purchase, for example — and corroborates them against externally observed signals where available. Each detected event carries a confidence level and the underlying transaction evidence, so a banker can see exactly why it fired.",
  },
  {
    q: "How does Ventus orchestrate into the systems we already run?",
    a: "No core banking changes are required. Institutions send transaction data securely and receive signals and activations back through a simple API, which routes into the systems already in production: digital banking and mobile app surfaces, marketing and campaign tools, CRM and task queues, rewards and card-linked offer platforms, and advisor workflows.",
  },
  {
    q: "What results can an institution expect?",
    a: "Higher interchange, as personalized rewards and offers move spend onto the institution's cards. Stronger deal redemption, because offers matched to observed behavior get acted on instead of ignored. Product growth, as life-event and financial-behavior signals surface the right product at the moment a customer needs it. And retention, because relevance at every touchpoint deepens the relationship.",
  },
  {
    q: "Is our data secure?",
    a: "Ventus runs on enterprise-grade cloud infrastructure with end-to-end encryption and complete data isolation between institutions. Ventus does not store PII — only anonymized behavioral signals. SOC 2 certification is in progress.",
  },
  {
    q: "Who inside the bank uses Ventus?",
    a: "Digital banking teams use it for in-app personalization, rewards and loyalty teams for card-linked offers and redemption lift, marketing teams for segment-of-one campaigns, wealth and relationship managers for timely client conversations, and executives for portfolio-level behavioral and life-event analytics.",
  },
];
