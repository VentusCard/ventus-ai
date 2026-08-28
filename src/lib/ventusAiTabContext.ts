// Per-tab context surfaced to Ventus AI so the co-pilot knows what the user
// is actually looking at. Keys match TabValue in AnalyticsContainer.

import { BANK_PRODUCT_CATEGORIES } from "@/lib/bankProductCatalog";

export interface TabContext {
  label: string;
  summary: string;
  keyData?: string[];
  suggestedNav?: string[];
  quickActions?: string[];
  /**
   * Concrete list of what the view renders (products, reports, deals, cohorts).
   * Sent verbatim to the model so it can quote it back instead of falling back
   * to a generic platform brief.
   */
  onScreenItems?: unknown;
}

// Compact catalog for the Bank Context tab — real bank products the view shows.
const PRODUCTS_ON_SCREEN = BANK_PRODUCT_CATEGORIES.map((cat) => ({
  category: cat.label,
  description: cat.description,
  products: cat.products.map((p) => ({
    name: p.name,
    tagline: p.tagline,
    pricing: p.pricing,
    terms: p.terms,
  })),
}));

// Curated list of report templates + interactive briefings shown on /reports.
const REPORTS_ON_SCREEN = {
  templates: [
    { title: "Lifestyle pillar share", category: "Lifestyle" },
    { title: "Pillar deep-dive (age × region)", category: "Lifestyle" },
    { title: "Cross-sell propensity matrix", category: "Lifestyle" },
    { title: "Spend by region", category: "Lifestyle" },
    { title: "Behavioral tier migration", category: "Retention" },
    { title: "Travel trip reconstruction", category: "Lifestyle" },
    { title: "Outflow to competitors", category: "Outflow" },
    { title: "Top merchant outflow", category: "Outflow" },
    { title: "Wallet share & outbound funds", category: "Outflow" },
    { title: "Subscription churn cohort", category: "Retention" },
    { title: "Cohort retention (sign-up month)", category: "Retention" },
    { title: "Life-event volume", category: "Opportunities" },
    { title: "Life event detection funnel", category: "Opportunities" },
    { title: "Financial vulnerability summary", category: "Risk" },
    { title: "Next-best-conversation triggers", category: "Opportunities" },
  ],
  interactiveReports: [
    {
      title: "Priority Opportunity Briefing",
      description:
        "The bank's top revenue-gap in narrative form: what's happening, the numbers, and recommended next steps.",
    },
  ],
};

const PERSONALIZED_DEALS_CONTEXT: TabContext = {
  label: "Personalized Deals",
  summary:
    "Unified surface for deal intelligence, merchant activation, location perks, and gamified engagement programs.",
  keyData: [
    "Seasonal spend heatmaps highlight over-indexed lifestyle pillars",
    "Merchant partnership pipeline with active deals and location perks",
    "Achievement and badge engine for financial wellness engagement",
  ],
  suggestedNav: ["Automated Flows", "Campaign Builder", "Next Product"],
  quickActions: [
    "Seasonal deal opportunities",
    "Top performing deals",
    "Most popular badges",
    "Engagement lift from gamification",
  ],
};

const PERSONALIZED_RELATIONSHIP_CONTEXT: TabContext = {
  label: "Personalized Relationship",
  summary:
    "Unified relationship surface: predictive life-event and relationship intelligence, customer-facing AI Banking Assistant activity, and the email-based WM Coworker for advisors and leadership.",
  keyData: [
    "Life events carry 3-5 transaction evidence items each",
    "Money-transfer merchants (Zelle, Wire) excluded from life-event evidence unless described",
    "Assistant activity shows live topics, rising intents, and unresolved questions",
    "Coworker digests are capped and resolve to a specific product recommendation",
  ],
  suggestedNav: ["Next Product", "Campaign Builder", "Personalized Deals"],
  quickActions: [
    "Upcoming home purchase signals",
    "Retirement planning candidates",
    "Top assistant topics today",
    "High-value client risks",
  ],
};

export const VENTUS_AI_TAB_CONTEXT: Record<string, TabContext> = {
  // ---------- Home ----------
  capabilities: {
    label: "System Overview",
    summary:
      "Map of every Ventus destination: Digital Banking App, Marketing Automation, CRM, Rewards Provider, AI Banking Assistant, and AI Coworker. Shows how enriched signals flow into each downstream system.",
    keyData: [
      "6 downstream destinations wired to Ventus signals",
      "AI Coworker serves every team, 24/7",
    ],
    suggestedNav: ["Bank Context", "Demo", "Ventus AI Dashboard"],
    quickActions: [
      "Which system consumes life-event signals?",
      "How does the AI Coworker plug into CRM?",
      "Where do rewards signals land?",
    ],
  },
  products: {
    label: "Bank Context",
    summary:
      "Reference catalog of the bank's own products (cards, deposits, lending, wealth, insurance) that every Ventus recommendation must ground into.",
    keyData: [
      "Product catalog spans cards, deposits, mortgage, HELOC, auto, 529, wealth, insurance",
      "Ventus uses this catalog to constrain next-best-product and coworker recommendations",
    ],
    suggestedNav: ["Next Product", "Campaign Builder", "WM Coworker"],
    quickActions: [
      "What products are here?",
      "List every credit card we offer",
      "Which products fit a household in relocation?",
      "Best product for a Hawaii traveler?",
    ],
    onScreenItems: PRODUCTS_ON_SCREEN,
  },
  governance: {
    label: "Governance — Personalization Controls",
    summary:
      "Where bank leaders set the personalization level, enable signal families, upload compliance and brand documents, and configure operating guardrails.",
    keyData: [
      "Four personalization stages: Conservative, Balanced, Personalized, Segment of One",
      "Signal families: Spending Habits, Life Events, Financial, Demographic, Risk",
      "Policy documents constrain generated copy and targeting",
      "Guardrails: frequency cap, quiet hours, cooling-off, product eligibility, autonomy",
    ],
    suggestedNav: ["Demo", "Bank Context", "Settings"],
    quickActions: [
      "What changes if we move to Segment of One?",
      "Which signal families are off right now?",
      "What do the uploaded policies control?",
      "Explain the autonomy threshold",
    ],
  },

  // ---------- Analytics ----------
  "ventus-ai-dashboard": {
    label: "Ventus AI Dashboard",
    summary:
      "Executive briefing surface: top priority opportunities, portfolio health, and hot signals across the $385B book.",
    keyData: [
      "Priority opportunity tiles link into full interactive briefings",
      "Signals span life events, wallet-share, and lifestyle pillars",
    ],
    suggestedNav: ["Reports", "Query", "Next Product"],
    quickActions: [
      "Rank today's top 3 opportunities",
      "Biggest emerging risk this week?",
      "What changed vs last month?",
    ],
  },
  "analytics-dashboard": {
    label: "Ventus AI Dashboard",
    summary: "Same as Ventus AI Dashboard — executive priority view.",
    quickActions: [
      "Summarize this dashboard",
      "Top 3 opportunities",
      "Anything urgent to escalate?",
    ],
  },
  query: {
    label: "Query Console",
    summary:
      "SQL console over the enriched transaction warehouse. Users can write and run queries against pillars, life-event signals, wallet-share, subscription analytics, and rewards data.",
    keyData: [
      "Warehouse tables: enriched_transactions, pillars, life_events, wallet_share_outflow, subscriptions, rewards_activity",
      "Sample deep-linked SQL is pre-loaded from Reports templates",
    ],
    suggestedNav: ["Reports", "Ventus AI Dashboard"],
    quickActions: [
      "Write SQL for top-10 outflow merchants",
      "Query households with mortgage in 90 days",
      "SQL to find travel spend growth by region",
    ],
  },
  reports: {
    label: "Reports Library",
    summary:
      "Two tabs: Templates (SQL-backed report templates) and Reports (interactive briefings with words, numbers, graphs, and recommended next steps).",
    keyData: [
      "Templates default sub-tab lists reusable SQL reports",
      "Interactive Reports include Priority Opportunity Briefing",
    ],
    suggestedNav: ["Query", "Ventus AI Dashboard"],
    quickActions: [
      "What reports do I have?",
      "Summarize the priority opportunity briefing",
      "Which template fits a HELOC campaign?",
      "Recommend a report for wallet-share loss",
    ],
    onScreenItems: REPORTS_ON_SCREEN,
  },
  api: {
    label: "API Access & Usage",
    summary:
      "Sub-tab of the Intelligence Dashboard covering Ventus API consumption: call volume, success rate, p95 latency, error rate, quota, endpoint breakdown, rate limits, recent requests, webhook delivery, and a quickstart. Key creation and assignment live in Settings → API Keys.",
    keyData: [
      "22.5M calls in the last 30 days at 99.71% success and 214ms p95",
      "Enterprise tier: 6,000 rpm, 30M monthly call quota",
      "Endpoints span enrichment, customer signals, life events, recommendations, and portfolio rollups",
      "Credential management is not on this view — it deep-links to Settings → API Keys",
    ],
    suggestedNav: ["Settings", "Reports", "Query"],
    quickActions: [
      "Which endpoint drives the most calls?",
      "Are we close to the monthly quota?",
      "Where is latency worst?",
      "Any webhook delivery failures?",
    ],
  },


  // ---------- Report deep-links ----------
  "report-lifestyle-pillars": {
    label: "Report — Lifestyle Pillars",
    summary: "Deep dive on the 12 lifestyle pillars: share of spend, growth, and dominant pillar per segment.",
    quickActions: ["Which pillar grew most MoM?", "Top pillars by revenue", "Where are we under-indexed?"],
  },
  "report-pillar-deep-dive": {
    label: "Report — Pillar Deep Dive",
    summary: "Age × Region heatmap for a single pillar with over-index highlighting.",
    quickActions: ["Where are we over-indexed?", "Which region is softest?", "Suggest a campaign angle"],
  },
  "report-cross-sell": {
    label: "Report — Cross-Sell Opportunities",
    summary: "Ranked cross-sell openings across the book with addressable population and revenue capture.",
    quickActions: ["Top cross-sell opportunity", "Best fit for HELOC", "Which segment converts fastest?"],
  },
  "report-regional-spend": {
    label: "Report — Regional Spend",
    summary: "Geographic spend distribution with over/under-index by region.",
    quickActions: ["Softest region this quarter", "Where is travel spend growing?", "Regional wallet-share risks"],
  },
  "report-outflow": {
    label: "Report — Outflow to Competitors",
    summary: "$4.2B annual deposit flight to neobanks, with severity classification and retention ROI.",
    quickActions: ["Top competitor threats", "Cost of inaction", "Which segment is flighting fastest?"],
  },
  "report-top-merchants": {
    label: "Report — Top Merchant Outflows",
    summary: "Merchants receiving the most outbound customer spend, ranked with wallet-share loss.",
    quickActions: ["Top 5 outbound merchants", "Best partnership candidates", "Merchants to win back"],
  },
  "report-subscription": {
    label: "Report — Subscription Analytics",
    summary: "Subscription churn risk, revenue by tier, and cancellation patterns.",
    quickActions: ["Top churn risks", "Fastest growing subscriptions", "Where can we intervene?"],
  },
  "report-cohort-retention": {
    label: "Report — Cohort Retention",
    summary: "Cohort retention curves and tier migration.",
    quickActions: ["Weakest cohort", "Retention lift from rewards", "Which cohort is aging up?"],
  },
  "report-life-events": {
    label: "Report — Life Event Volume",
    summary: "Volume and trajectory of detected life events across the book.",
    quickActions: ["Fastest-growing life event", "Home purchase pipeline", "Retirement signals trend"],
  },
  "report-fvi": {
    label: "Report — Financial Vulnerability",
    summary: "FVI cohorts, sensitivity drivers, and policy impact.",
    quickActions: ["Highest-risk cohort", "Rising vulnerability signals", "Intervention priorities"],
  },
  "report-tier-migration": {
    label: "Report — Tier Migration",
    summary: "Movement of households across affluence and behavioral tiers.",
    quickActions: ["Who upgraded this quarter?", "Down-shift risk cohort", "Best tier to invest in"],
  },
  "report-life-event-funnel": {
    label: "Report — Life Event Funnel",
    summary: "Detection → outreach → conversion funnel for life-event opportunities.",
    quickActions: ["Where is the funnel leaking?", "Best converting life event", "Suggested next step"],
  },
  "report-wallet-share": {
    label: "Report — Wallet Share",
    summary: "Outbound funds movement and win-back opportunities by segment.",
    quickActions: ["Biggest wallet-share loss", "Top win-back plays", "Where to defend deposits"],
  },
  "report-travel-trips": {
    label: "Report — Travel Trips",
    summary: "Detected trips with destination, party size, and price bracket. Feeds rewards + travel card offers.",
    quickActions: ["Top destinations", "Best premium travel card candidates", "Trips with highest reward upside"],
  },
  "report-next-conversation": {
    label: "Report — Next Conversation",
    summary: "Suggested advisor conversations grounded in transaction evidence.",
    quickActions: ["Top 3 conversations for tomorrow", "Highest-value outreach", "Which clients need a call?"],
  },
  "report-priority-opportunity": {
    label: "Report — Priority Opportunity Briefing",
    summary:
      "Full interactive briefing for a single priority opportunity: KPIs, strategic narrative, charts, and recommended next steps.",
    quickActions: [
      "Summarize this briefing",
      "What are the recommended next steps?",
      "Estimated revenue capture?",
      "Which segment should we start with?",
    ],
  },

  // ---------- Product & Growth ----------
  targeting: {
    label: "Next-Best Product Engine",
    summary:
      "Segment builder for next-best-product campaigns. Grounds every recommendation in the bank's product catalog.",
    keyData: [
      "Micro-segment headers are category-aware (HELOC, deposits, investments, cards)",
      "Personalized product copy includes rates, multipliers, and estimated benefit",
    ],
    suggestedNav: ["Bank Context", "Campaign Builder", "Reports"],
    quickActions: [
      "Best next product for high-earning renters",
      "Cross-sell for households with a new baby",
      "Which segment should get a HELOC push?",
    ],
  },
  "targeting-automated-flows": {
    label: "Automated Flows",
    summary:
      "Cohort × product roll-up of automated marketing flows currently running against the book (read-only).",
    keyData: [
      "Rows are cohorts, columns are products, cells show active flow count",
      "No CampaignStudio access here — flows are surfaced for visibility",
    ],
    suggestedNav: ["Campaign Builder", "Next Product"],
    quickActions: [
      "Which cohort has the most active flows?",
      "Coverage gaps for HELOC",
      "Where should we launch new flows?",
    ],
  },
  "targeting-campaign-builder": {
    label: "Campaign Builder",
    summary:
      "Draft campaigns with AI-generated briefs, category-aware micro-segments, and product-grounded messaging.",
    keyData: [
      "Micro-segment copy adapts per product category (loans / deposits / investments)",
      "Every campaign resolves to a specific bank product",
    ],
    suggestedNav: ["Next Product", "Bank Context", "Reports"],
    quickActions: [
      "Draft a HELOC micro-segment",
      "Campaign brief for premium travel card",
      "Deposit growth campaign for Q4",
    ],
  },

  // ---------- Personalized Deals ----------
  "personalized-deals": PERSONALIZED_DEALS_CONTEXT,
  "rewards-intelligence": PERSONALIZED_DEALS_CONTEXT,
  "deal-management": PERSONALIZED_DEALS_CONTEXT,
  "location-experience": PERSONALIZED_DEALS_CONTEXT,
  gamification: PERSONALIZED_DEALS_CONTEXT,

  // ---------- Personalized Relationship ----------
  "personalized-relationship": PERSONALIZED_RELATIONSHIP_CONTEXT,
  "life-events": PERSONALIZED_RELATIONSHIP_CONTEXT,
  "ai-assistant-activity": PERSONALIZED_RELATIONSHIP_CONTEXT,
  "wm-copilot": PERSONALIZED_RELATIONSHIP_CONTEXT,
  "customer-insights": PERSONALIZED_RELATIONSHIP_CONTEXT,

  // ---------- Risk ----------
  "fvi-dashboard": {
    label: "Financial Vulnerability",
    summary:
      "7 behavioral risk cohorts with vulnerability scoring, sensitivity drivers, and policy impact analysis.",
    quickActions: [
      "Vulnerability cohort overview",
      "Rising risk segments",
      "Sensitivity drivers",
    ],
  },
  "growth-merchant-partnerships": {
    label: "Merchant Partnerships",
    summary:
      "Behaviorally adjacent product extensions with addressable audience, estimated revenue, confidence, and merchant partners per opportunity.",
    quickActions: [
      "Highest revenue partnership",
      "Best deployment windows",
      "Which pillars extend furthest?",
    ],
  },
  "wallet-share": {
    label: "Wallet Share & Win-Back",
    summary:
      "$4.2B annual deposit flight to neobanks with severity classification, exposure, and retention ROI.",
    quickActions: [
      "Outflow summary",
      "Top competitor threats",
      "Deposit flight trends",
      "Win-back opportunities",
    ],
  },
  "subscription-analytics": {
    label: "Subscription Analytics",
    summary: "Subscription churn risk, revenue by tier, trending subscriptions, cancellation patterns.",
    quickActions: [
      "Subscription churn risk",
      "Revenue by subscription tier",
      "Trending subscriptions",
    ],
  },
  dashboard: {
    label: "Lifestyle Analysis",
    summary: "12-pillar lifestyle spend analysis with budget variance and growth trends.",
    quickActions: [
      "Top spending pillars",
      "Budget variance alerts",
      "Segment spending breakdown",
    ],
  },

  // ---------- Footer ----------
  settings: {
    label: "Settings",
    summary: "Platform settings.",
    quickActions: ["What can I configure here?"],
  },
  feedback: {
    label: "Feedback",
    summary: "Send feedback to the Ventus team.",
    quickActions: ["How is feedback triaged?"],
  },
};

export function getTabContext(tabValue: string): TabContext {
  return (
    VENTUS_AI_TAB_CONTEXT[tabValue] ?? {
      label: tabValue,
      summary: "General Ventus platform view.",
      quickActions: ["What's on this screen?", "Top actions I can take here"],
    }
  );
}
