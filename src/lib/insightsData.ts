export interface InsightPost {
  slug: string;
  title: string;
  excerpt: string;
  category: "Product" | "Industry" | "Engineering" | "Research";
  date: string;
  readTime: string;
  image?: string;
  body: string;
}

export const insightsPosts: InsightPost[] = [
  {
    slug: "transaction-enrichment-beyond-mcc",
    title: "Transaction Enrichment: Moving Beyond MCC Codes",
    excerpt:
      "Why merchant category codes alone can't power modern personalization — and what behavioral intelligence unlocks instead.",
    category: "Product",
    date: "Feb 18, 2026",
    readTime: "6 min read",
    body: `## The Limits of MCC Codes

For decades, banks have relied on Merchant Category Codes to classify transactions. A four-digit number assigned by the card network tells you *where* a customer spent — but almost nothing about *why*.

MCC 5812 tells you "Eating Places, Restaurants." It doesn't tell you whether that was a quick weekday lunch, a date-night splurge, or a family celebration. The behavioral context — the part that actually matters for personalization — is completely lost.

## What Behavioral Intelligence Looks Like

Ventus enrichment layers go far beyond category labels. Every transaction is analyzed for:

- **Lifestyle pillars** — Travel, Dining, Wellness, Entertainment, and more
- **Intent signals** — Is this a one-time purchase or part of a recurring pattern?
- **Life event indicators** — Moving, new baby, retirement spending shifts

This transforms a flat list of debits into a living behavioral profile that updates with every swipe.

## Why It Matters for Banks

Banks that enrich transactions at the behavioral level see measurable lifts in cross-sell conversion, campaign response rates, and advisor-client engagement. The data was always there — it just needed a smarter lens.

---

*Ventus processes millions of transactions daily, turning raw payment data into actionable intelligence for financial institutions.*`,
  },
  {
    slug: "life-event-detection-banking",
    title: "Detecting Life Events from Spending Patterns",
    excerpt:
      "How transactional signals reveal major life milestones — and why banks that act on them win.",
    category: "Research",
    date: "Feb 4, 2026",
    readTime: "5 min read",
    body: `## Spending Tells a Story

Every major life event leaves a financial footprint. A new baby shows up as pharmacy visits, baby-goods purchases, and shifting dining patterns weeks before any form is filed. A relocation appears as moving-company charges, utility deposits, and a new geographic cluster of transactions.

## From Reactive to Proactive

Most banks learn about life events when the customer walks in — or worse, when they leave. Behavioral intelligence flips that timeline. By detecting patterns early, advisors and marketing teams can engage at the moment of highest relevance.

## The Ventus Approach

Our life-event models analyze velocity, category shifts, and merchant-type clustering to flag events like:

- **Relocation** — geographic spending migration
- **New child** — healthcare + retail pattern shifts
- **Career change** — income timing and deposit changes
- **Retirement** — drawdown patterns and lifestyle spending shifts

Early detection means earlier, more relevant engagement — and measurably stronger retention.`,
  },
  {
    slug: "rewards-personalization-at-scale",
    title: "Personalizing Rewards Without Losing Margin",
    excerpt:
      "How behavioral segmentation enables deal matching that customers actually value — without blanket discounts.",
    category: "Industry",
    date: "Jan 22, 2026",
    readTime: "4 min read",
    body: `## The Discount Trap

Most rewards programs operate on a simple premise: offer broad discounts and hope for engagement. The result is thin margins and low redemption rates. Customers ignore generic offers, and banks absorb the cost.

## Behavioral Deal Matching

Ventus Smart Rewards takes a different approach. Instead of broadcasting the same offers to every customer, deals are matched based on individual spending behavior, lifestyle affinity, and purchase timing.

A customer who dines out three times a week gets restaurant offers. A frequent traveler sees hotel and airline deals. A wellness-focused spender receives fitness and health promotions.

## The Economics

Targeted matching drives:

- **3–5× higher redemption rates** compared to broadcast offers
- **Lower merchant acquisition costs** because relevance reduces waste
- **Stronger customer satisfaction** because offers feel curated, not random

Personalization at scale isn't about more data — it's about the right lens on existing data.`,
  },
  {
    slug: "wealth-management-copilot-design",
    title: "Designing the Wealth Management Copilot",
    excerpt:
      "Inside the product decisions behind Ventus's advisor-facing intelligence layer.",
    category: "Engineering",
    date: "Jan 10, 2026",
    readTime: "7 min read",
    body: `## The Advisor's Problem

Wealth advisors spend a disproportionate amount of time on meeting prep, manual research, and CRM updates. The actual relationship-building — the part that creates value — gets squeezed.

## Building for the Workflow

We designed the Wealth Management Copilot around the advisor's daily rhythm:

1. **Pre-meeting prep** — Auto-generated client briefs with recent life events, portfolio context, and talking points
2. **During the meeting** — Real-time transcript analysis that surfaces relevant insights as the conversation unfolds
3. **Post-meeting follow-up** — Draft emails, action items, and CRM updates generated from the meeting context

## Technical Decisions

The copilot combines transaction-derived behavioral intelligence with portfolio data and meeting transcripts. Key architecture choices:

- **Context window management** — Advisors need relevant history, not everything. We built a dynamic context builder that prioritizes recent events and high-signal data points.
- **Actionable outputs** — Every insight links to a concrete next step. No "interesting but useless" analytics.
- **Privacy by design** — Client data stays within the institution's boundary. The AI layer processes enriched signals, not raw PII.

## What's Next

We're expanding the copilot to include proactive alerts — surfacing clients who need attention before the advisor even thinks to check.`,
  },
  {
    slug: "bank-wide-analytics-behavioral-segmentation",
    title: "From Demographics to Behavioral Segmentation",
    excerpt:
      "Why age-and-income segments fail modern banking — and how transaction-derived personas perform better.",
    category: "Industry",
    date: "Dec 28, 2025",
    readTime: "5 min read",
    body: `## The Demographic Illusion

Two customers can be the same age, live in the same ZIP code, and earn similar incomes — yet have completely different financial behaviors. One is a frequent traveler who values experiences. The other is a homebody who invests in home improvement.

Demographic segmentation treats them identically. Behavioral segmentation doesn't.

## Transaction-Derived Personas

Ventus Bank-Wide Analytics builds customer segments from actual spending behavior:

- **Lifestyle affinity** — What categories dominate their spending?
- **Spending velocity** — Are they accelerating or decelerating in key areas?
- **Channel preference** — Online vs. in-store, subscription vs. one-time
- **Life stage signals** — What does their transaction pattern say about where they are in life?

## Campaign Impact

Banks using behavioral segments for campaign targeting consistently outperform demographic-based approaches:

- **2–4× improvement** in campaign response rates
- **Higher LTV customers** identified earlier in the relationship
- **Reduced churn** through timely, relevant engagement

The shift from "who they are" to "what they do" is the single biggest unlock in modern banking analytics.`,
  },
];
