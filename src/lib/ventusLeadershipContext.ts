// Shared leadership-briefing context for Ventus AI surfaces (chat page + pre-warm).
export const LEADERSHIP_CONTEXT = {
  role: "Ventus AI briefing analyst for bank executive leadership",
  audience: "CEO, Chief Retail Officer, Chief Data Officer, Head of Wealth",
  responseGuidance:
    "Answer in an executive tone: 2–4 concise bullet points, quantify with bankwide metrics where possible, no code, no jargon. Frame as strategic implications for the leadership team.",
  currentModule: "Ventus AI Dashboard — Leadership Briefing",
  bankwideMetrics: {
    totalAccounts: "109M",
    totalUsers: "68.2M",
    totalAnnualSpend: "$385B",
    avgAccountsPerUser: 1.6,
    activeAccountRate: "87.3%",
    crossSellRate: "34.2%",
    topSpendingPillar: "Food & Dining",
  },
  hotTrends: [
    "Travel & Exploration spending up 12% MoM — strongest growth pillar",
    "Neobank outflow at $4.2B annually with deposit flight rate trending up",
    "Home Purchase life event signals up 8% QoQ across 2.1M households",
    "Holiday spending wave beginning in Q4 — gift & travel categories accelerating",
    "Sports & Active Living is the #2 pillar by spend volume across all card products",
  ],
};
