export type PersonRole = "advisor" | "leadership";

export interface Person {
  id: string;
  name: string;
  title: string;
  initials: string;
  role: PersonRole;
  bookSize?: string; // advisors only
}

export type MessageAuthor = "ventus" | Person["id"];

export interface Message {
  id: string;
  author: MessageAuthor; // "ventus" or person id
  timestamp: string; // display string
  body: string; // supports \n for paragraphs
}

export interface Thread {
  id: string;
  subject: string;
  recipientId: string; // person id
  preview: string;
  updatedAt: string;
  unread?: boolean;
  messages: Message[];
}

export const ROSTER: Person[] = [
  { id: "sarah", name: "Sarah Chen", title: "Senior Advisor", initials: "SC", role: "advisor", bookSize: "142 clients" },
  { id: "marco", name: "Marco Rossi", title: "Wealth Advisor", initials: "MR", role: "advisor", bookSize: "98 clients" },
  { id: "priya", name: "Priya Patel", title: "Advisor, Retirement", initials: "PP", role: "advisor", bookSize: "116 clients" },
  { id: "james", name: "James O'Brien", title: "Advisor, HNW", initials: "JO", role: "advisor", bookSize: "74 clients" },
  { id: "elena", name: "Elena Vasquez", title: "Head of Wealth", initials: "EV", role: "leadership" },
  { id: "david", name: "David Kim", title: "Regional Director, NW", initials: "DK", role: "leadership" },
];

export const THREADS: Thread[] = [
  {
    id: "t1",
    recipientId: "sarah",
    subject: "3 college-prep signals in your book this week",
    preview: "Ventus detected new tuition-planning behavior across three of your households…",
    updatedAt: "Today · 9:12 AM",
    unread: true,
    messages: [
      {
        id: "t1m1",
        author: "ventus",
        timestamp: "Mon 8:04 AM",
        body:
          "Hi Sarah,\n\nThis week I flagged three households in your book showing college-prep signals: the Hendersons, the Nguyens, and the Alvarez family. Each has had recurring 529-related transfers and campus visit activity in the last 45 days.\n\nTop recommendation: reach out to the Hendersons first — their oldest is entering senior year and they have $180K in a taxable brokerage that could be repositioned. I've drafted talking points for each family and attached them below.\n\n— Ventus",
      },
      {
        id: "t1m2",
        author: "sarah",
        timestamp: "Mon 9:47 AM",
        body: "Thanks — which of the three should I prioritize this week? I only have bandwidth for two outreach calls.",
      },
      {
        id: "t1m3",
        author: "ventus",
        timestamp: "Mon 9:52 AM",
        body:
          "Prioritize the Hendersons and the Alvarez family.\n\n1. Hendersons — highest projected funding gap ($95K), decision window is next 60 days.\n2. Alvarez — new 529 contribution just started; strong receptivity signal.\n3. Nguyens — early stage; a nurture email is enough for now, I can draft it.\n\nSuggested opener for the Hendersons: 'Wanted to share a couple of tuition-funding options before senior year kicks off.' Let me know if you'd like suggested next steps or outreach timing.",
      },
    ],
  },
  {
    id: "t2",
    recipientId: "marco",
    subject: "Liquidity event detected: Robert Hayes",
    preview: "Inbound wire of $2.4M into checking on Friday. Recommend outreach this week.",
    updatedAt: "Today · 7:41 AM",
    messages: [
      {
        id: "t2m1",
        author: "ventus",
        timestamp: "Mon 7:41 AM",
        body:
          "Marco,\n\nRobert Hayes received an inbound wire of $2.4M into his checking account on Friday. Pattern matches a business-sale event (he's an owner-operator per your CRM notes).\n\nCurrently sitting in cash. Recommend proactive outreach this week to discuss deployment — options included in the attached brief.\n\n— Ventus",
      },
      {
        id: "t2m2",
        author: "marco",
        timestamp: "Mon 8:15 AM",
        body: "Let's reach out this week. What timing should I suggest?",
      },
      {
        id: "t2m3",
        author: "ventus",
        timestamp: "Mon 8:17 AM",
        body:
          "I suggest reaching out Tuesday or Wednesday with the following focus areas:\n\n1. Short-term parking (T-bills, money market)\n2. Diversified deployment plan\n3. Tax-loss harvesting and estate implications\n\nI can draft a personalized outreach note for each option. Let me know which angle you'd like to lead with.",
      },
    ],
  },
  {
    id: "t3",
    recipientId: "priya",
    subject: "Retirement-planning cluster in your book",
    preview: "4 clients crossed the 60-day retirement-signal threshold this month.",
    updatedAt: "Yesterday · 4:20 PM",
    messages: [
      {
        id: "t3m1",
        author: "ventus",
        timestamp: "Sun 4:20 PM",
        body:
          "Priya,\n\nFour of your clients hit multiple retirement-planning signals this month: reduced discretionary spend, increased healthcare provider payments, and Medicare-adjacent inquiries.\n\nClients: Diane Ross (63), Charles Whitman (61), Nadia Freeman (64), Peter Ito (66).\n\nRecommend a lightweight 'retirement readiness' outreach sequence. I can draft the copy and personalize per client — just say the word.",
      },
      {
        id: "t3m2",
        author: "priya",
        timestamp: "Sun 5:02 PM",
        body: "Yes please — draft them and I'll review before sending.",
      },
      {
        id: "t3m3",
        author: "ventus",
        timestamp: "Sun 5:06 PM",
        body: "Drafts are in your review queue. Each is under 120 words and includes a personalized data point (e.g. projected income gap, Social Security timing). Ready for your edits.",
      },
    ],
  },
  {
    id: "t4",
    recipientId: "elena",
    subject: "Weekly trends — HNW life-event volume +18%",
    preview: "Top pillar this week: education planning. Full breakdown attached.",
    updatedAt: "Today · 6:00 AM",
    unread: true,
    messages: [
      {
        id: "t4m1",
        author: "ventus",
        timestamp: "Mon 6:00 AM",
        body:
          "Elena,\n\nWeekly wealth pulse:\n\n• HNW life-event volume: +18% WoW (driven by education + liquidity events)\n• Top pillar: education planning (32% of new signals)\n• Advisor response time: 1.6 days avg (target: 1.0)\n• At-risk AUM (outbound signals): $47M across 12 households\n\nFull dashboard in the attached brief.\n\n— Ventus",
      },
      {
        id: "t4m2",
        author: "elena",
        timestamp: "Mon 7:22 AM",
        body: "Any product gaps showing up in the education cluster?",
      },
      {
        id: "t4m3",
        author: "ventus",
        timestamp: "Mon 7:25 AM",
        body:
          "Two gaps stand out:\n\n1. No branded 529-to-Roth rollover playbook — 14 households qualify under SECURE 2.0 and no one is being contacted proactively.\n2. Limited coordination between wealth and lending on parent-plus refinance opportunities — 9 flagged households.\n\nSuggested campaign brief: 'Education Funding Beyond the 529.' I can draft it and route to the marketing team for your review.",
      },
    ],
  },
  {
    id: "t5",
    recipientId: "david",
    subject: "NW region: outbound wealth transfer signal",
    preview: "$12M in outbound transfers to competitor custodians this month.",
    updatedAt: "Fri · 3:14 PM",
    messages: [
      {
        id: "t5m1",
        author: "ventus",
        timestamp: "Fri 3:14 PM",
        body:
          "David,\n\nOutbound-transfer signal in NW region: $12M moved to competitor custodians this month (mostly Fidelity + Schwab), across 8 households. 6 of the 8 have advisors who haven't had a recorded interaction in 90+ days.\n\nRecommend a targeted retention campaign + advisor re-engagement mandate for these households. Detailed list attached.\n\n— Ventus",
      },
      {
        id: "t5m2",
        author: "david",
        timestamp: "Fri 4:02 PM",
        body: "Who are the six advisors? And do we have a retention-offer playbook ready?",
      },
      {
        id: "t5m3",
        author: "ventus",
        timestamp: "Fri 4:05 PM",
        body:
          "Advisors: M. Rossi, S. Chen, J. O'Brien, T. Nakamura, R. Patel, L. Gomez.\n\nWe have a retention playbook from Q1 (fee concession + planning review); it worked on 4 of 7 attempts. I can auto-generate personalized retention briefs for each household and route to the assigned advisor. Approve to proceed?",
      },
    ],
  },
  {
    id: "t6",
    recipientId: "elena",
    subject: "Campaign recommendation: 529 cross-sell to 42 households",
    preview: "Behavioral targeting identified 42 high-fit households. Expected uplift +$3.1M AUM.",
    updatedAt: "Thu · 11:08 AM",
    messages: [
      {
        id: "t6m1",
        author: "ventus",
        timestamp: "Thu 11:08 AM",
        body:
          "Elena,\n\nRecommended campaign: 529 plan cross-sell to 42 identified households.\n\nSegment: HNW parents of children ages 8–15, no active 529, at least one taxable brokerage over $200K. Behavioral fit score ≥ 0.78.\n\nExpected uplift: +$3.1M AUM in 90 days (based on prior-campaign benchmark).\n\nSuggested channel mix: advisor-led (top quartile) + email nurture (rest). Ready to route drafts to the marketing team on your approval.",
      },
      {
        id: "t6m2",
        author: "elena",
        timestamp: "Thu 12:30 PM",
        body: "Approved for advisor-led on top quartile. Hold the email nurture until I've seen the copy.",
      },
      {
        id: "t6m3",
        author: "ventus",
        timestamp: "Thu 12:33 PM",
        body: "Got it — routed the top-quartile list (11 households) to the assigned advisors with personalized briefs. Nurture drafts will be in your review queue by EOD tomorrow.",
      },
    ],
  },
];

export interface WeeklyStats {
  emailsSent: number;
  emailsSentPrev: number;
  replyRatePct: number;
  repliesCount: number;
  signalsSurfaced: number;
  ventusReplyLatency: string;
  advisorReplyMedianHrs: number;
  activeThreads: number;
  advisorsCount: number;
  leadersCount: number;
  collaboratorsTotal: number;
  actionsToday: number;
  lastActivityAgo: string;
}

export const WEEKLY_STATS: WeeklyStats = {
  emailsSent: 28450,
  emailsSentPrev: 24180,
  replyRatePct: 61,
  repliesCount: 17320,
  signalsSurfaced: 142800,
  ventusReplyLatency: "< 1 min",
  advisorReplyMedianHrs: 1.8,
  activeThreads: 9640,
  advisorsCount: 12400,
  leadersCount: 340,
  collaboratorsTotal: 12740,
  actionsToday: 4120,
  lastActivityAgo: "4 sec ago",
};

export type TeamChannel = "Email";

export interface TeamDestination {
  id: string;
  name: string;
  channel: TeamChannel;
  accent: "indigo" | "emerald" | "amber" | "rose" | "violet" | "sky";
  weeklyCount: number;
  weeklyPrev: number;
  stat1: { label: string; value: string };
  stat2: { label: string; value: string };
  insights: string[];
  lastDeliveryAgo: string;
  emailType: "Weekly pulse" | "Alert" | "Daily brief" | "Campaign brief" | "Signal brief";
}

export const TEAM_DESTINATIONS: TeamDestination[] = [
  {
    id: "leadership",
    name: "Coworker for Bank Leadership",
    channel: "Email",
    accent: "indigo",
    weeklyCount: 340,
    weeklyPrev: 312,
    stat1: { label: "Weekly pulses", value: "1" },
    stat2: { label: "Pending approvals", value: "4" },
    insights: [
      "Weekly pulse summarizing major trends, key takeaways and strategic opportunities across the bank.",
      "Surfaces leadership-level themes like life-event momentum, advisor engagement, and at-risk AUM.",
    ],
    lastDeliveryAgo: "6 min ago",
    emailType: "Weekly pulse",
  },
  {
    id: "product-growth",
    name: "Coworker for Product & Growth",
    channel: "Email",
    accent: "emerald",
    weeklyCount: 2840,
    weeklyPrev: 2510,
    stat1: { label: "Product-gap alerts", value: "142" },
    stat2: { label: "Est. 90-day AUM uplift", value: "$12.4M" },
    insights: [
      "Daily brief on product-fit gaps and cross-sell opportunities surfaced from behavioral signals.",
      "Highlights rollover playbooks, refinance moments, and next-product candidates by segment.",
    ],
    lastDeliveryAgo: "9 min ago",
    emailType: "Daily brief",
  },
  {
    id: "risk",
    name: "Coworker for Risk & Compliance",
    channel: "Email",
    accent: "rose",
    weeklyCount: 1860,
    weeklyPrev: 1920,
    stat1: { label: "Vulnerability flags", value: "63" },
    stat2: { label: "Escalations routed", value: "12" },
    insights: [
      "Alert stream for outbound-transfer clusters, vulnerability indicators, and advisor-inactivity flags.",
      "Surfaces risk cohorts and escalation candidates before they become attrition events.",
    ],
    lastDeliveryAgo: "14 min ago",
    emailType: "Alert",
  },
  {
    id: "rewards",
    name: "Coworker for Rewards & Deals",
    channel: "Email",
    accent: "amber",
    weeklyCount: 4210,
    weeklyPrev: 3890,
    stat1: { label: "Offer refreshes", value: "28" },
    stat2: { label: "Rewards and Perks", value: "6" },
    insights: [
      "Daily brief on merchant partnership opportunities and reward-redemption intent by segment.",
      "Flags premium card offers, lifestyle perks, and redemption-lift opportunities.",
    ],
    lastDeliveryAgo: "3 min ago",
    emailType: "Daily brief",
  },
  {
    id: "advisors",
    name: "Coworker for Relationship Managers",
    channel: "Email",
    accent: "violet",
    weeklyCount: 19860,
    weeklyPrev: 16840,
    stat1: { label: "Active advisor threads", value: "9,640" },
    stat2: { label: "Reply rate", value: "61%" },
    insights: [
      "Signal brief highlighting client life events, liquidity moments, and recommended next outreach.",
      "Prioritizes the highest-propensity households and drafts talking points for each advisor.",
    ],
    lastDeliveryAgo: "1 min ago",
    emailType: "Signal brief",
  },
  {
    id: "marketing",
    name: "Coworker for Marketing / Campaign Ops",
    channel: "Email",
    accent: "sky",
    weeklyCount: 1340,
    weeklyPrev: 1210,
    stat1: { label: "Segment-of-one briefs", value: "86" },
    stat2: { label: "Drafts in review", value: "11" },
    insights: [
      "Campaign brief with segment-of-one audiences and pre-drafted personalization copy.",
      "Routes ready-to-launch campaigns to advisors and tracks draft approvals through launch.",
    ],
    lastDeliveryAgo: "22 min ago",
    emailType: "Campaign brief",
  },
];

export type ActivityKind = "advisor" | "leadership" | "signal" | "reply";

export interface ActivityEntry {
  id: string;
  kind: ActivityKind;
  title: string;
  ago: string;
  actorId?: string; // person id when relevant
}

export const ACTIVITY_FEED: ActivityEntry[] = [
  { id: "a1", kind: "advisor",    title: "Sent brief to Sarah Chen — 3 college-prep signals",              ago: "42 sec ago", actorId: "sarah" },
  { id: "a2", kind: "leadership", title: "Drafted campaign brief for Elena Vasquez's review",              ago: "3 min ago",  actorId: "elena" },
  { id: "a3", kind: "signal",     title: "Detected liquidity event: Robert Hayes ($2.4M inbound wire)",    ago: "6 min ago" },
  { id: "a4", kind: "reply",      title: "Received reply from Marco Rossi — confirming outreach timing",         ago: "8 min ago",  actorId: "marco" },
  { id: "a5", kind: "advisor",    title: "Prepared retirement outreach drafts for Priya Patel (4 clients)", ago: "14 min ago", actorId: "priya" },
  { id: "a6", kind: "leadership", title: "Sent weekly wealth pulse to Elena Vasquez",                      ago: "21 min ago", actorId: "elena" },
  { id: "a7", kind: "signal",     title: "Flagged NW outbound-transfer trend — $12M to competitors",       ago: "38 min ago" },
  { id: "a8", kind: "leadership", title: "Routed retention brief for David Kim's approval",                ago: "52 min ago", actorId: "david" },
];

// Rough per-person thread activity counts for the Team Status panel.
export const PERSON_ACTIVITY: Record<string, { threads: number; pendingReplies: number }> = {
  sarah: { threads: 3, pendingReplies: 0 },
  marco: { threads: 2, pendingReplies: 1 },
  priya: { threads: 2, pendingReplies: 0 },
  james: { threads: 1, pendingReplies: 0 },
  elena: { threads: 4, pendingReplies: 1 },
  david: { threads: 2, pendingReplies: 0 },
};
