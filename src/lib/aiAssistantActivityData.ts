export type TopicIntent = "spend-recap" | "resource-request" | "life-event" | "product-question";

export interface TrendingTopic {
  id: string;
  emoji: string;
  label: string;
  intent: TopicIntent;
  volumeBlurb: string;
  deltaBlurb: string;
  sampleQuestion: string;
  /** 2–4 user-side turns fed sequentially into the iPad mockup. */
  script: string[];
}

export const INTENT_META: Record<TopicIntent, { label: string; color: string }> = {
  "spend-recap": { label: "Spend recap", color: "bg-blue-50 text-blue-700 border-blue-200" },
  "resource-request": { label: "Resource request", color: "bg-violet-50 text-violet-700 border-violet-200" },
  "life-event": { label: "Life event", color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  "product-question": { label: "Product question", color: "bg-amber-50 text-amber-700 border-amber-200" },
};

export const TRENDING_TOPICS: TrendingTopic[] = [
  {
    id: "ski-trip",
    emoji: "🎿",
    label: "Ski trip spend recap",
    intent: "spend-recap",
    volumeBlurb: "Trending across many high-income outdoor enthusiasts",
    deltaBlurb: "↑ this week",
    sampleQuestion: "How much did I spend on my Tahoe ski trip?",
    script: [
      "How much did I spend on my Tahoe ski trip?",
      "Break that down by category for me.",
      "Any deals that would have saved me money?",
    ],
  },
  {
    id: "first-home",
    emoji: "🏠",
    label: "First-home buying resources",
    intent: "life-event",
    volumeBlurb: "Rising among renters in their early thirties",
    deltaBlurb: "↑ steadily this quarter",
    sampleQuestion: "I'm thinking about buying a house. What resources do you have?",
    script: [
      "I'm thinking about buying a house. What resources do you have?",
      "How much should I have saved before I start looking?",
      "What programs might help with my down payment?",
    ],
  },
  {
    id: "holiday-travel",
    emoji: "✈️",
    label: "Holiday travel planning",
    intent: "resource-request",
    volumeBlurb: "Frequent across travel-active households heading into Q4",
    deltaBlurb: "↑ as the season approaches",
    sampleQuestion: "I'm planning a trip home for the holidays — any tips on booking smarter?",
    script: [
      "I'm planning a trip home for the holidays — any tips on booking smarter?",
      "Which of my cards earns the most on flights?",
      "Show me lounges I'd have access to.",
    ],
  },
  {
    id: "wedding-savings",
    emoji: "💍",
    label: "Wedding savings plan",
    intent: "life-event",
    volumeBlurb: "Common among newly engaged couples",
    deltaBlurb: "↑ leading into spring",
    sampleQuestion: "We just got engaged — how should we start saving for the wedding?",
    script: [
      "We just got engaged — how should we start saving for the wedding?",
      "What's a realistic monthly target for an 18-month timeline?",
      "Any high-yield savings options I should know about?",
    ],
  },
  {
    id: "new-baby",
    emoji: "👶",
    label: "New baby budgeting",
    intent: "life-event",
    volumeBlurb: "Recurring among new parents in the first trimester",
    deltaBlurb: "→ steady",
    sampleQuestion: "We're expecting a baby in the spring. How do I get our budget ready?",
    script: [
      "We're expecting a baby in the spring. How do I get our budget ready?",
      "What new line items should I plan for?",
      "Should I open a separate account for baby expenses?",
    ],
  },
  {
    id: "ev-tco",
    emoji: "🚗",
    label: "EV vs. gas total cost",
    intent: "product-question",
    volumeBlurb: "Curious shoppers comparing vehicle ownership costs",
    deltaBlurb: "↑ this month",
    sampleQuestion: "Would an EV actually save me money based on how I drive?",
    script: [
      "Would an EV actually save me money based on how I drive?",
      "What does my current spend on gas and maintenance look like?",
      "Any financing options I should look at?",
    ],
  },
  {
    id: "401k",
    emoji: "📈",
    label: "401k rebalance question",
    intent: "product-question",
    volumeBlurb: "Asked across long-tenured professionals near year-end",
    deltaBlurb: "↑ around earnings season",
    sampleQuestion: "Is my 401k allocation still appropriate for me?",
    script: [
      "Is my 401k allocation still appropriate for me?",
      "Am I taking on too much risk for my age?",
      "Should I talk to an advisor?",
    ],
  },
  {
    id: "debt-payoff",
    emoji: "💳",
    label: "Debt payoff strategy",
    intent: "resource-request",
    volumeBlurb: "Common among customers carrying card balances",
    deltaBlurb: "↑ after the holidays",
    sampleQuestion: "What's the fastest way for me to pay off my credit card?",
    script: [
      "What's the fastest way for me to pay off my credit card?",
      "Avalanche or snowball — which works better for my situation?",
      "Would a balance transfer make sense?",
    ],
  },
  {
    id: "529",
    emoji: "🎓",
    label: "529 plan setup",
    intent: "life-event",
    volumeBlurb: "Parents of young children exploring education savings",
    deltaBlurb: "↑ heading into fall",
    sampleQuestion: "How do I open a 529 for my daughter?",
    script: [
      "How do I open a 529 for my daughter?",
      "How much should I contribute each month?",
      "What are the tax benefits in my state?",
    ],
  },
  {
    id: "dining-tune-up",
    emoji: "🍽️",
    label: "Dining budget tune-up",
    intent: "spend-recap",
    volumeBlurb: "Foodie households re-evaluating discretionary spend",
    deltaBlurb: "→ steady",
    sampleQuestion: "Am I spending too much on dining out?",
    script: [
      "Am I spending too much on dining out?",
      "How does that compare to similar households?",
      "Any rewards I'm missing out on?",
    ],
  },
];

/** Slow rolling feed of anonymized one-line questions for visual flavor. */
export const LIVE_QUESTION_FEED: string[] = [
  "How much did I tip on travel last month?",
  "Can I afford a $40k car payment?",
  "What's my biggest recurring subscription?",
  "Are there deals near me this weekend?",
  "How do I split bills with my partner?",
  "What credit card should I use for groceries?",
  "Can you remind me when my mortgage is due?",
  "Is there a way to round up my purchases into savings?",
  "How much did I donate to charity this year?",
  "Show me everything I spent at coffee shops.",
  "What's my net cash flow this month?",
  "How do I freeze my card temporarily?",
];
