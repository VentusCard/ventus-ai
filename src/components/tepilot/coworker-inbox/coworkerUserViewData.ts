/**
 * User View — what each bank colleague sees when they log in to the platform.
 * Keyed to TEAM_DESTINATIONS ids so names/accents stay in one place.
 * Demo content only: session-only, no backend, no LLM calls.
 */

export interface UserKpi {
  label: string;
  value: string;
  sub: string;
}

export type QueueTone = "action" | "review" | "info";

export interface QueueItem {
  id: string;
  title: string;
  evidence: string;
  meta: string;
  tone: QueueTone;
  /** Label of the primary action button. */
  action: string;
}

export interface TablePanel {
  kind: "table";
  title: string;
  columns: string[];
  rows: string[][];
  /** Column index (after the first label column) to color-scale. */
  highlightCol?: number;
}

export interface BarPanel {
  kind: "bars";
  title: string;
  rows: { label: string; value: string; pct: number; sub?: string }[];
}

export interface ListPanel {
  kind: "list";
  title: string;
  rows: { label: string; value: string; sub?: string }[];
}

export type RolePanel = TablePanel | BarPanel | ListPanel;

export interface UserWorkspace {
  id: string;
  person: { name: string; title: string; initials: string; scope: string };
  kpis: UserKpi[];
  brief: { title: string; sentAgo: string; body: string; bullets: string[] };
  queue: QueueItem[];
  panel: RolePanel;
  /** "Only Ventus sees this" — insights unique to semantic enrichment. */
  unique: { title: string; body: string }[];
  access: string;
}

export const COWORKER_USER_VIEWS: Record<string, UserWorkspace> = {
  leadership: {
    id: "leadership",
    person: {
      name: "Elena Vasquez",
      title: "Head of Wealth",
      initials: "EV",
      scope: "Bank-wide · aggregates only",
    },
    kpis: [
      { label: "AUM movement", value: "+$412M", sub: "week over week" },
      { label: "Open decision windows", value: "18,240", sub: "households, next 60 days" },
      { label: "Advisor response time", value: "0.8 d", sub: "target 1.0 d" },
      { label: "At-risk AUM", value: "$1.9B", sub: "↓ 6% vs last week" },
    ],
    brief: {
      title: "Weekly pulse — three shifts that moved most",
      sentAgo: "Sent Mon 6:00 AM · 6 min ago",
      body:
        "Momentum is concentrated in three places this week. Each is an opportunity with a named owner and a decision window, not an alarm.",
      bullets: [
        "Liquidity moments up 14% in the Northwest — business-sale and inheritance patterns leading.",
        "Retirement-transition signals now the largest single family in the book, up two ranks.",
        "Outbound flows to outside institutions slowed for a second week after the retention push.",
      ],
    },
    queue: [
      {
        id: "l-q1",
        title: "Approve campaign brief: retirement transition, 24,800 households",
        evidence: "Behavioral + life-event overlap; drafted by Marketing / Campaign Ops",
        meta: "Waiting 2 days",
        tone: "review",
        action: "Approve",
      },
      {
        id: "l-q2",
        title: "Coverage gap — Southeast region running 1.6-day response",
        evidence: "Advisor engagement below target for 2 consecutive weeks",
        meta: "Routed by Ventus",
        tone: "action",
        action: "Assign owner",
      },
      {
        id: "l-q3",
        title: "Retention brief for David Kim's region ready for sign-off",
        evidence: "$12M outbound trend, now stabilizing",
        meta: "Waiting 4 hours",
        tone: "review",
        action: "Sign off",
      },
      {
        id: "l-q4",
        title: "Rewards partnership shortlist requests budget confirmation",
        evidence: "6 merchant candidates ranked by observed wallet share",
        meta: "New",
        tone: "info",
        action: "Acknowledge",
      },
    ],
    panel: {
      kind: "table",
      title: "Region roll-up",
      columns: ["Region", "Momentum", "Coverage", "Open windows"],
      rows: [
        ["Northwest", "+9.2%", "94%", "4,120"],
        ["Northeast", "+4.1%", "91%", "3,880"],
        ["Midwest", "+2.6%", "88%", "3,010"],
        ["Southeast", "-1.4%", "79%", "3,640"],
        ["Southwest", "+5.8%", "90%", "3,590"],
      ],
      highlightCol: 0,
    },
    unique: [
      {
        title: "Wallet-share leakage by named institution",
        body:
          "Outbound transfer strings resolve to the institutions receiving them, so leakage is a named list rather than an unexplained balance drop.",
      },
      {
        title: "Life-event momentum as a leading indicator",
        body:
          "Event families trend weeks before balances move, giving leadership a forward read the core system cannot produce.",
      },
      {
        title: "True coverage, not login counts",
        body:
          "The share of the book with zero detected signals shows where the bank has no relationship read at all.",
      },
    ],
    access:
      "This login sees aggregates, regions, and cohorts only — no household names, balances, or transaction detail.",
  },

  "product-growth": {
    id: "product-growth",
    person: {
      name: "Daniel Reyes",
      title: "Head of Product Strategy",
      initials: "DR",
      scope: "Segment-level · identity suppressed",
    },
    kpis: [
      { label: "Open product gaps", value: "142", sub: "across 38 segments" },
      { label: "Households in gap", value: "1.24M", sub: "of 68.2M book" },
      { label: "Projected 90-day uplift", value: "$12.4M", sub: "AUM, fit-weighted" },
      { label: "Tests running", value: "7", sub: "3 reading positive" },
    ],
    brief: {
      title: "Daily product-fit brief — gaps ranked by households × fit",
      sentAgo: "Sent 7:30 AM · 9 min ago",
      body:
        "Four gaps cleared the activation threshold overnight. Each maps to a product already in the catalog and carries the behavioral evidence behind it.",
      bullets: [
        "Rollover moment: 41,200 households with 401(k)-pattern inflows and no IRA on file.",
        "Refinance window: 18,900 households paying an outside mortgage servicer above the current book rate.",
        "Premium card fit: 63,400 households whose travel and dining mix clears the tier threshold.",
      ],
    },
    queue: [
      {
        id: "p-q1",
        title: "Activate rollover playbook — 41,200 households",
        evidence: "Recurring employer-plan distributions; maps to Managed IRA",
        meta: "Fit score 0.86",
        tone: "action",
        action: "Send to Marketing",
      },
      {
        id: "p-q2",
        title: "Review eligibility rule blocking refinance segment",
        evidence: "High fit, conversion 40% below baseline",
        meta: "Flagged twice",
        tone: "review",
        action: "Open rule",
      },
      {
        id: "p-q3",
        title: "Premium card tier candidate ready for pricing review",
        evidence: "Travel + dining spend mix over threshold for 3 months",
        meta: "New today",
        tone: "action",
        action: "Route to pricing",
      },
      {
        id: "p-q4",
        title: "Segment drift: small-business owners audience down 22%",
        evidence: "Behavior no longer matches the defining pattern",
        meta: "Auto-detected",
        tone: "info",
        action: "Rebuild audience",
      },
    ],
    panel: {
      kind: "table",
      title: "Segment × product fit",
      columns: ["Segment", "Top product", "Fit", "Households"],
      rows: [
        ["Pre-retirees 55+", "Managed IRA", "0.86", "41.2K"],
        ["Dual-income families", "College savings", "0.78", "36.8K"],
        ["Frequent travelers", "Premium card", "0.74", "63.4K"],
        ["New homeowners", "HELOC", "0.71", "22.5K"],
        ["Business owners", "Treasury sweep", "0.69", "9.8K"],
      ],
      highlightCol: 1,
    },
    unique: [
      {
        title: "Off-bank product ownership, confirmed",
        body:
          "Competitor mortgage servicers, brokerages, and card issuers appear in the transaction stream, so a gap is a product held elsewhere — not a guess.",
      },
      {
        title: "Behavioral tier movement",
        body:
          "Households trading up or down a spend tier are the earliest next-product trigger, visible months before an application.",
      },
      {
        title: "12-pillar lifestyle mix per segment",
        body:
          "Shows which lifestyle pillar over-indexes against the book, which is what makes positioning land instead of read generic.",
      },
    ],
    access:
      "This login sees segments, cohorts, and product performance — household identity is suppressed at every level.",
  },

  risk: {
    id: "risk",
    person: {
      name: "Angela Boateng",
      title: "Director, Risk Operations",
      initials: "AB",
      scope: "Flagged households · all regions",
    },
    kpis: [
      { label: "Open flags", value: "63", sub: "12 new today" },
      { label: "Two-cohort matches", value: "9", sub: "escalate on review" },
      { label: "Escalations routed", value: "12", sub: "today, all named owners" },
      { label: "Time to review", value: "3.4 h", sub: "target 4 h" },
    ],
    brief: {
      title: "Alert digest — newest first, evidence attached",
      sentAgo: "Continuous · 14 min ago",
      body:
        "Twelve new flags since the last digest. Each carries the behavior that produced it. No flag has been actioned; all await human review.",
      bullets: [
        "Outbound-transfer cluster: 4 same-day transfers to an outside institution, no matching life event.",
        "Cash-advance sequence detected behind a generic merchant descriptor.",
        "Two-cohort match: thin-buffer and rising-obligation indicators on the same household.",
      ],
    },
    queue: [
      {
        id: "r-q1",
        title: "Review outbound cluster — 4 transfers, same business day",
        evidence: "Resolved recipient is an outside institution; no corroborating event",
        meta: "2 h old",
        tone: "action",
        action: "Escalate",
      },
      {
        id: "r-q2",
        title: "Suppress candidate — transfer pattern explained by relocation",
        evidence: "Moving, deposit, and utility-setup signals in the same window",
        meta: "Life-event match",
        tone: "review",
        action: "Suppress",
      },
      {
        id: "r-q3",
        title: "Two-cohort match requires compliance review",
        evidence: "Thin buffer + rising obligations, 11 households",
        meta: "SLA 1 hour",
        tone: "action",
        action: "Route to compliance",
      },
      {
        id: "r-q4",
        title: "Advisor context requested before escalation",
        evidence: "Household has an assigned advisor (M. Rossi)",
        meta: "Awaiting reply",
        tone: "info",
        action: "Nudge advisor",
      },
    ],
    panel: {
      kind: "bars",
      title: "Vulnerability cohorts",
      rows: [
        { label: "Thin liquidity buffer", value: "18.4K", pct: 82, sub: "↑ 3% WoW" },
        { label: "Rising fixed obligations", value: "14.1K", pct: 68, sub: "flat" },
        { label: "Income volatility", value: "11.9K", pct: 58, sub: "↑ 2%" },
        { label: "Credit reliance", value: "9.6K", pct: 47, sub: "↓ 1%" },
        { label: "Fee-cycle repetition", value: "7.2K", pct: 36, sub: "↓ 4%" },
        { label: "Support-payment strain", value: "5.1K", pct: 26, sub: "flat" },
        { label: "Sudden spend contraction", value: "3.8K", pct: 19, sub: "↑ 1%" },
      ],
    },
    unique: [
      {
        title: "Obfuscated merchant identity resolved",
        body:
          "Cash-advance, BNPL stacking, and vice-adjacent merchants hiding behind generic descriptors are named, which a raw MCC feed cannot do.",
      },
      {
        title: "Life-event corroboration kills false flags",
        body:
          "A relocation or a tuition cycle explains a transfer cluster, so the queue stays small enough to review properly.",
      },
      {
        title: "Cohort overlap",
        body:
          "Households sitting in two indicators at once are the real escalations — single-rule engines never see the intersection.",
      },
    ],
    access:
      "This login sees flagged households across all regions. Behavior only — no intent inference, and no account actions of any kind.",
  },

  rewards: {
    id: "rewards",
    person: {
      name: "Priya Nair",
      title: "Rewards Portfolio Manager",
      initials: "PN",
      scope: "Segment-level performance",
    },
    kpis: [
      { label: "Active collections", value: "11", sub: "across 12 pillars" },
      { label: "Offer refreshes", value: "28", sub: "this week" },
      { label: "Redemption lift", value: "+3.4×", sub: "vs generic baseline" },
      { label: "Merchant partners", value: "6", sub: "live agreements" },
    ],
    brief: {
      title: "Daily brief — what is landing, what is going stale",
      sentAgo: "Sent 6:45 AM · 3 min ago",
      body:
        "Two collections are over-indexing and one has under-indexed for a second week and is due for retirement.",
      bullets: [
        "Weekend dining collection leading redemptions in five metros.",
        "Travel-planning perks strong where trip-planning behavior is rising.",
        "Home-improvement collection under-indexing for 2 weeks — retire or refresh.",
      ],
    },
    queue: [
      {
        id: "w-q1",
        title: "Approve refresh — weekend dining, 5 metros",
        evidence: "Merchant concentration rising in each metro",
        meta: "Ready",
        tone: "action",
        action: "Approve",
      },
      {
        id: "w-q2",
        title: "Retire home-improvement collection",
        evidence: "Under-indexed 2 consecutive weeks",
        meta: "Auto-flagged",
        tone: "review",
        action: "Retire",
      },
      {
        id: "w-q3",
        title: "Merchant partnership candidate shortlist",
        evidence: "Ranked by observed wallet share on outside cards",
        meta: "3 candidates",
        tone: "action",
        action: "Open shortlist",
      },
      {
        id: "w-q4",
        title: "Premium tier upgrade offer ready for review",
        evidence: "Travel + dining mix clears the tier threshold",
        meta: "New",
        tone: "info",
        action: "Review copy",
      },
    ],
    panel: {
      kind: "bars",
      title: "Collection performance by pillar",
      rows: [
        { label: "Dining & Nightlife", value: "+4.1×", pct: 88, sub: "5 metros" },
        { label: "Travel & Transport", value: "+3.6×", pct: 78, sub: "rising" },
        { label: "Health & Fitness", value: "+2.9×", pct: 62, sub: "steady" },
        { label: "Family & Education", value: "+2.4×", pct: 51, sub: "seasonal" },
        { label: "Home & Living", value: "+1.1×", pct: 22, sub: "under-indexing" },
      ],
    },
    unique: [
      {
        title: "Wallet share on the competitor's card",
        body:
          "Where customers spend when they are not using ours — that list is the actual partnership shortlist, not a survey.",
      },
      {
        title: "City-level merchant concentration",
        body:
          "Local perk refreshes follow observed concentration by metro rather than a national offer calendar.",
      },
      {
        title: "Personalized vs generic baselines side by side",
        body:
          "Lift is attributable to personalization because both baselines are measured on the same cohort.",
      },
    ],
    access:
      "This login sees segment-level performance. No individual spend amounts, visit counts, or household identity.",
  },

  advisors: {
    id: "advisors",
    person: {
      name: "Sarah Chen",
      title: "Senior Advisor",
      initials: "SC",
      scope: "Own book · 142 clients · NW Region",
    },
    kpis: [
      { label: "Households with a live signal", value: "17", sub: "of 142 clients" },
      { label: "Windows closing this week", value: "4", sub: "act first" },
      { label: "Outreach drafted", value: "9", sub: "awaiting your review" },
      { label: "Replies pending", value: "2", sub: "from clients" },
    ],
    brief: {
      title: "Your daily signal brief — ranked by decision window",
      sentAgo: "Sent 7:00 AM · 1 min ago",
      body:
        "Three relationships changed overnight and are worth a call today. Evidence and an opening line are prepared for each.",
      bullets: [
        "Henderson household — tuition-funding window closes in ~60 days; largest projected gap in your book.",
        "Alvarez household — new college-savings contributions started; strong receptivity.",
        "Hayes household — inbound liquidity sitting in cash since Friday.",
      ],
    },
    queue: [
      {
        id: "a-q1",
        title: "Call the Hendersons — tuition funding",
        evidence: "Recurring education-plan transfers since March; campus-visit travel in the last 45 days",
        meta: "Window closes ~60 days",
        tone: "action",
        action: "Open draft",
      },
      {
        id: "a-q2",
        title: "Call Robert Hayes — deployment of idle cash",
        evidence: "Large inbound transfer Friday, pattern matches a business-sale event",
        meta: "Escalated to Regional Director",
        tone: "action",
        action: "Open draft",
      },
      {
        id: "a-q3",
        title: "Send nurture email to the Nguyens",
        evidence: "Early-stage education signals; not yet a call",
        meta: "Draft ready",
        tone: "review",
        action: "Review & send",
      },
      {
        id: "a-q4",
        title: "Follow up — brief unread for 72 hours",
        evidence: "Alvarez household, receptivity signal still active",
        meta: "Auto-follow-up",
        tone: "info",
        action: "Mark done",
      },
    ],
    panel: {
      kind: "list",
      title: "This week",
      rows: [
        { label: "Tue 10:00", value: "Henderson call", sub: "Talking points attached" },
        { label: "Tue 15:30", value: "Hayes call", sub: "Deployment options brief" },
        { label: "Wed", value: "Alvarez follow-up", sub: "Reply SLA 24 h" },
        { label: "Thu", value: "Nguyen nurture send", sub: "Awaiting your review" },
        { label: "Fri", value: "Book re-rank", sub: "Ventus refreshes overnight" },
      ],
    },
    unique: [
      {
        title: "The evidence line behind every claim",
        body:
          "Raw transaction strings are enriched into plain language — \"recurring tuition-plan transfers since March\" — so you can defend the call.",
      },
      {
        title: "Assets held away, surfaced early",
        body:
          "Flows to outside institutions reveal held-away assets before the client mentions them in a review.",
      },
      {
        title: "Ranked by window, not by balance",
        body:
          "A $400K household outranks a $4M one when its decision window closes first — that ordering is the whole point.",
      },
      {
        title: "An opener you can actually say out loud",
        body:
          "Vaguely specific phrasing: no amounts, no counts, no merchant names — useful in front of the client, never surveillance-flavored.",
      },
    ],
    access: "This login sees your assigned book only — 142 households, no other advisor's clients.",
  },

  marketing: {
    id: "marketing",
    person: {
      name: "Tom Whitfield",
      title: "Campaign Operations Lead",
      initials: "TW",
      scope: "Campaign + cohort level",
    },
    kpis: [
      { label: "Flows live", value: "220", sub: "of 233 signals" },
      { label: "Awaiting marketing approval", value: "9", sub: "copy ready to review" },
      { label: "Channels enabled", value: "3", sub: "digital · email · SMS" },
      { label: "Reach last 24h", value: "1.8M", sub: "households messaged" },
    ],
    brief: {
      title: "Governance read — what cleared, what is blocked",
      sentAgo: "Sent Tue 8:00 AM · 22 min ago",
      body:
        "Nine signals are waiting on your gate and four are blocked upstream on product-owner sign-off. Copy is pre-drafted for every channel.",
      bullets: [
        "Retirement-transition flow cleared both gates — live on digital and email.",
        "Two audiences drifted past the 20% threshold and were rebuilt overnight.",
        "One campaign recommendation paused: a risk flag hit the same households.",
      ],
    },
    queue: [
      {
        id: "m-q1",
        title: "Approve copy — retirement transition, 3 channels",
        evidence: "Brand-safety pass clean: no amounts, counts, or merchant names",
        meta: "Waiting 1 day",
        tone: "review",
        action: "Approve",
      },
      {
        id: "m-q2",
        title: "Rebuild audience — small-business owners drifted 22%",
        evidence: "Behavior no longer matches the defining pattern",
        meta: "Auto-detected",
        tone: "action",
        action: "Rebuild",
      },
      {
        id: "m-q3",
        title: "Paused recommendation — risk overlap",
        evidence: "Risk cohort intersects the target audience",
        meta: "Held by policy",
        tone: "info",
        action: "Acknowledge",
      },
      {
        id: "m-q4",
        title: "SMS variant needs a shorter benefit line",
        evidence: "Exceeds the 120-character channel cap",
        meta: "New",
        tone: "review",
        action: "Edit copy",
      },
    ],
    panel: {
      kind: "bars",
      title: "Channel mix",
      rows: [
        { label: "Digital banking", value: "220 flows", pct: 94, sub: "1.2M reach / 24h" },
        { label: "Email", value: "172 flows", pct: 74, sub: "480K reach / 24h" },
        { label: "SMS", value: "48 flows", pct: 21, sub: "96K reach / 24h" },
      ],
    },
    unique: [
      {
        title: "Segment-of-one built from behavior",
        body:
          "Audiences come from what households actually did, not declared demographics — and the copy is drafted per channel before you open it.",
      },
      {
        title: "Audience drift detection",
        body:
          "A live segment that no longer matches its defining behavior is caught mid-flight instead of at the post-campaign readout.",
      },
      {
        title: "Brand-safety read before the queue",
        body:
          "Every draft is checked for amounts, counts, merchant names, and detection language before a human ever sees it.",
      },
    ],
    access:
      "This login sees campaigns, audiences, and cohorts. No household identity, and no send without a named approver.",
  },
};
