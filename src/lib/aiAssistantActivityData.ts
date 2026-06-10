export type TopicIntent = "spend-recap" | "resource-request" | "life-event" | "product-question";

export interface TrendingTopic {
  id: string;
  emoji: string;
  label: string;
  intent: TopicIntent;
  /** Conversations in the last 24h. */
  volume: number;
  /** 7-day percentage change. */
  deltaPct: number;
  /** 7-point sparkline series (oldest -> newest). */
  spark: number[];
  sampleQuestion: string;
  /** 2–4 user-side turns fed sequentially into the iPad mockup. */
  script: string[];
}

export const INTENT_META: Record<TopicIntent, { label: string; pillClass: string; barColor: string }> = {
  "spend-recap": { label: "Spend recap", pillClass: "bg-blue-50 text-blue-700 border-blue-200", barColor: "#3b82f6" },
  "resource-request": { label: "Resource request", pillClass: "bg-violet-50 text-violet-700 border-violet-200", barColor: "#8b5cf6" },
  "life-event": { label: "Life event", pillClass: "bg-emerald-50 text-emerald-700 border-emerald-200", barColor: "#10b981" },
  "product-question": { label: "Product question", pillClass: "bg-amber-50 text-amber-700 border-amber-200", barColor: "#f59e0b" },
};

export interface IntentMixEntry {
  intent: TopicIntent;
  count: number;
  pct: number;
}

export const INTENT_MIX: IntentMixEntry[] = [
  { intent: "spend-recap", count: 4742, pct: 38 },
  { intent: "resource-request", count: 2995, pct: 24 },
  { intent: "life-event", count: 2621, pct: 21 },
  { intent: "product-question": 2122, pct: 17 } as unknown as IntentMixEntry,
].map((e: any) => ({ intent: e.intent, count: e.count, pct: e.pct }));

export const ASSISTANT_KPIS = {
  conversations24h: { value: "12,480", delta: "+18% WoW", trend: "up" as const },
  avgMessages: { value: "4.6", delta: "+0.3", trend: "up" as const },
  selfServeResolution: { value: "81%", delta: "+4 pts", trend: "up" as const },
  avgResponseTime: { value: "1.4s", delta: "−0.2s", trend: "up" as const }, // faster = good
};

export const TRENDING_TOPICS: TrendingTopic[] = [
  {
    id: "ski-trip",
    emoji: "🎿",
    label: "Ski trip spend recap",
    intent: "spend-recap",
    volume: 3240,
    deltaPct: 42,
    spark: [120, 145, 180, 210, 260, 295, 340],
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
    volume: 2870,
    deltaPct: 31,
    spark: [180, 195, 215, 230, 255, 280, 310],
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
    volume: 2150,
    deltaPct: 58,
    spark: [80, 95, 120, 155, 195, 240, 285],
    sampleQuestion: "I'm planning a trip home for the holidays — any tips on booking smarter?",
    script: [
      "I'm planning a trip home for the holidays — any tips on booking smarter?",
      "Which of my cards earns the most on flights?",
      "Show me lounges I'd have access to.",
    ],
  },
  {
    id: "debt-payoff",
    emoji: "💳",
    label: "Debt payoff strategy",
    intent: "resource-request",
    volume: 1980,
    deltaPct: 22,
    spark: [150, 160, 165, 175, 185, 195, 210],
    sampleQuestion: "What's the fastest way for me to pay off my credit card?",
    script: [
      "What's the fastest way for me to pay off my credit card?",
      "Avalanche or snowball — which works better for my situation?",
      "Would a balance transfer make sense?",
    ],
  },
  {
    id: "401k",
    emoji: "📈",
    label: "401k rebalance question",
    intent: "product-question",
    volume: 1620,
    deltaPct: 14,
    spark: [125, 130, 138, 142, 150, 158, 165],
    sampleQuestion: "Is my 401k allocation still appropriate for me?",
    script: [
      "Is my 401k allocation still appropriate for me?",
      "Am I taking on too much risk for my age?",
      "Should I talk to an advisor?",
    ],
  },
  {
    id: "new-baby",
    emoji: "👶",
    label: "New baby budgeting",
    intent: "life-event",
    volume: 1340,
    deltaPct: 9,
    spark: [110, 115, 118, 120, 125, 128, 132],
    sampleQuestion: "We're expecting a baby in the spring. How do I get our budget ready?",
    script: [
      "We're expecting a baby in the spring. How do I get our budget ready?",
      "What new line items should I plan for?",
      "Should I open a separate account for baby expenses?",
    ],
  },
  {
    id: "wedding-savings",
    emoji: "💍",
    label: "Wedding savings plan",
    intent: "life-event",
    volume: 1085,
    deltaPct: 27,
    spark: [70, 78, 85, 92, 98, 104, 112],
    sampleQuestion: "We just got engaged — how should we start saving for the wedding?",
    script: [
      "We just got engaged — how should we start saving for the wedding?",
      "What's a realistic monthly target for an 18-month timeline?",
      "Any high-yield savings options I should know about?",
    ],
  },
  {
    id: "ev-tco",
    emoji: "🚗",
    label: "EV vs. gas total cost",
    intent: "product-question",
    volume: 920,
    deltaPct: 36,
    spark: [40, 48, 55, 62, 72, 82, 95],
    sampleQuestion: "Would an EV actually save me money based on how I drive?",
    script: [
      "Would an EV actually save me money based on how I drive?",
      "What does my current spend on gas and maintenance look like?",
      "Any financing options I should look at?",
    ],
  },
  {
    id: "529",
    emoji: "🎓",
    label: "529 plan setup",
    intent: "life-event",
    volume: 740,
    deltaPct: 11,
    spark: [55, 58, 62, 65, 68, 70, 74],
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
    volume: 615,
    deltaPct: -6,
    spark: [80, 78, 76, 74, 70, 66, 62],
    sampleQuestion: "Am I spending too much on dining out?",
    script: [
      "Am I spending too much on dining out?",
      "How does that compare to similar households?",
      "Any rewards I'm missing out on?",
    ],
  },
];
