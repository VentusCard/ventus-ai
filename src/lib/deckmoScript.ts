import { RICKY_SIGNAL_LABELS } from "@/lib/deckmoRickyTransactions";

export type DeckmoBeatId =
  | "opener"
  | "visibility"
  | "living-view"
  | "ricky-story"
  | "ricky"
  | "immediate"
  | "mid-term"
  | "long-term"
  | "retention"
  | "bank-tools"
  | "close";

// Flat beat index within the "For Your Teams" slide -> workspace screen index.
export const BANK_TOOLS_BEAT_SCREENS = [0];

export const DECKMO_BENEFITS = [
  { id: "immediate", label: "Lower Service Cost" },
  { id: "mid-term", label: "Profit" },
  { id: "long-term", label: "Growth" },
  { id: "retention", label: "Retention & NPS" },
] as const satisfies readonly { id: DeckmoBeatId; label: string }[];

export const RICKY_KYC_PROFILE = {
  name: "Ricky J",
  customerId: "45275487",
  age: 34,
  location: "San Francisco, CA 94123",
  estimatedHouseholdIncome: "$500K",
  relationshipTier: "Preferred",
};

export const RICKY_KYC_SIGNAL_LABEL = "KYC";
export const RICKY_KYC_LOCATION = (() => {
  const [city = "", region = ""] = RICKY_KYC_PROFILE.location.split(", ");
  const [state = "", postalCode = ""] = region.split(" ");
  return { city, state, postalCode };
})();

export const DECKMO = {
  chrome: {
    progress: "Story progress",
    presenterHint: "Press P for presenter view",
    presenterTitle: "Table of Contents",
    presenterClose: "Close presenter navigator",
    previous: "Previous",
    next: "Next",
    exit: "Exit",
    desktopTitle: "Desktop Required",
    desktopBody: "This conference experience is designed for screens at least 1024 pixels wide.",
    returnHome: "Return to Home",
    phoneTime: "9:41",
    phoneMenu: "•••",
    stepUnit: "steps",
    gateTitle: "Interactive Presentation",
    gateSubtitle: "Version Oct. 2026",
  },
  phoneNavigation: {
    bankLabel: "Our Bank · Ricky",
    tabs: ["Activity", "Rewards", "Membership", "AI"],
  },
  beats: [
    { id: "opener", nav: "Thesis", steps: 6 },
    { id: "visibility", nav: "The Visibility Gap", steps: 2 },
    { id: "living-view", nav: "The Complete Picture", steps: 3 },
    { id: "ricky-story", nav: "Ricky, understood", steps: 2 },
    {
      id: "bank-tools",
      nav: "Tools for the Bank",
      steps: 1,
      stepScreens: BANK_TOOLS_BEAT_SCREENS,
    },
    { id: "immediate", nav: "Immediate: Lower Service Cost", steps: 5 },
    { id: "mid-term", nav: "Mid-Term: Profit", steps: 5 },
    { id: "long-term", nav: "Mid-Term: Growth", steps: 3 },
    { id: "retention", nav: "Long-Term: Retention & NPS", steps: 4 },
    { id: "close", nav: "The Ask", steps: 3 },
  ],
  opener: {
    lines: ["Banking is personal.", "Or at least, it used to be."],
    comparison: {
      today: {
        label: "Today",
        segments: ["Can't talk to and understand customer needs", "Generic banking", "Commoditization"],
      },
      ventus: {
        label: "with",
        segments: ["Understand and anticipate customer needs", "Personalized banking", "Differentiation"],
      },
    },
  },
  visibility: {
    eyebrow: "THE VISIBILITY GAP",
    title: "You cannot personalize what you cannot see.",
    subtitle: "First-party transaction data is observed, but lagging and partial. It ends at the institution's walls.",
    inside: {
      header: "INSIDE THE WALLS",
      caption: "Raw activity across payment rails",
      rows: [
        {
          id: "C•••1842",
          rail: "CARD",
          description: "POS DEBIT 59382",
          amount: "−$184.26",
          mcc: "5712",
          mccLabel: "Home Furnishings",
        },
        { id: "C•••9071", rail: "ACH", description: "ACH CREDIT EMPLOYER PAYROLL", amount: "+$4,280.15" },
        { id: "C•••5218", rail: "CHECK", description: "CHECK #••4821", amount: "−$2,145.00" },
        { id: "C•••3364", rail: "WIRE", description: "WIRE OUT TITLE CO ESCROW", amount: "−$25,000.00" },
        { id: "C•••7480", rail: "ACH", description: "ACH DEBIT ELECTRIC UTILITY", amount: "−$142.63" },
        { id: "C•••2195", rail: "RTP", description: "RTP TRANSFER TO A••• R•••", amount: "−$75.00" },
        { id: "C•••6632", rail: "ATM", description: "ATM WITHDRAWAL 0042", amount: "−$400.00" },
        {
          id: "C•••4059",
          rail: "CARD",
          description: "TST*COURTSIDE NYC",
          amount: "−$86.40",
          mcc: "5812",
          mccLabel: "Restaurants & Dining",
        },
      ],
    },
    outside: {
      header: "OUTSIDE THE WALLS",
      caption: "Financial relationships and life context beyond the bank",
      status: "not visible",
      empty: "The wider picture remains out of view.",
      rows: [
        "Bought a house",
        "Credit card at another bank",
        "Changed to a new job",
        "Savings at another bank",
        "Got married",
        "Investments at another brokerage",
        "Started a business",
        "Mortgage with another lender",
        "Took a trip overseas",
        "Streaming and subscription spend",
        "Children going to college",
        "Auto loan at another bank",
        "Second checking account elsewhere",
        "Private school tuition",
        "Insurance premiums paid elsewhere",
        "Buy-now-pay-later balances",
        "Donations to another charity",
        "Childcare paid elsewhere",
        "And everything in between",
      ],
    },
  },
  livingView: {
    eyebrow: "THE COMPLETE PICTURE",
    title: "Ventus AI: One living customer view",
    subtitle: "Internal activity and external context come together to show who each customer is, how they live, and what they may need next.",
    inside: {
      header: "INSIDE THE WALLS",
      title: "Understand activity across payment rails",
      chips: ["Checks", "Wires", "Zelle", "Card swipes", "P2P", "Digital telemetry"],
    },
    outside: {
      header: "OUTSIDE THE WALLS",
      title: "Extra insights from external sources",
      chips: ["Credit bureaus", "Data compilers", "National databases", "SKU-level insights"],
    },
    result: { header: "ONE LIVING CUSTOMER VIEW" },
    synthesis: {
      families: [
        { name: "100+ Demographic Labels", tone: "violet" },
        { name: "100+ Financial Signals", tone: "emerald" },
        { name: "3000+ Spending Habits", tone: "blue" },
        { name: "100+ Major Life Events", tone: "amber" },
        { name: "50+ Risk Patterns", tone: "rose" },
      ],
      question: "Who they are · What they do · What do they need next?",
    },
  },
  ricky: {
    eyebrow: "A 360-DEGREE VIEW OF THE CUSTOMER",
    title: "Meet Ricky",
    storyHeader: {
      eyebrow: "CUSTOMER INTELLIGENCE IN ACTION",
      title: "Ricky, understood",
      descriptions: [
        "Internal activity reveals Ricky’s routines, financial relationships, and emerging needs.",
        "External context adds the relationships and life details the bank cannot see on its own.",
      ],
    },
    sectionSubtitles: [
      "Start with the transactions the institution can see.",
      "But transactions alone reveal only part of Ricky’s life.",
      "Enrichment turns every transaction into structured customer intelligence.",
      "Internal signals reveal Ricky’s behaviors, life events, financial needs, and opportunities.",
      "External signals complete the picture beyond the institution’s walls.",
    ],
    rawLabel: "SUPPORTING TRANSACTIONS",
    signalLabel: "VENTUS CUSTOMER INTELLIGENCE",
    signals: [
      { family: "Demographics", label: RICKY_KYC_SIGNAL_LABEL, tone: "violet", source: "internal" },
      { family: "Demographics", label: RICKY_SIGNAL_LABELS.business, tone: "violet", source: "internal" },
      {
        family: "Demographics",
        label: "Small airplane co-owner",
        tone: "violet",
        source: "external",
        externalEvidence: {
          provider: "Outside aircraft ownership data",
          detail: "Shared ownership interest in a Cirrus SR22",
          timing: "Annual · recurring obligations",
          confidence: "Likely",
        },
      },
      { family: "Financial", label: RICKY_SIGNAL_LABELS.income, tone: "emerald", source: "internal" },
      { family: "Financial", label: RICKY_SIGNAL_LABELS.brokerage, tone: "emerald", source: "internal" },
      { family: "Financial", label: RICKY_SIGNAL_LABELS.marcus, tone: "emerald", source: "internal" },
      { family: "Financial", label: RICKY_SIGNAL_LABELS.amex, tone: "emerald", source: "internal" },
      {
        family: "Financial",
        label: "BMW X5 loan ending in ~4 months",
        tone: "emerald",
        source: "external",
        externalEvidence: {
          provider: "Outside vehicle ownership data",
          detail: "BMW X5 financing is nearing the end of its term",
          timing: "Maturity · ~4 months",
          confidence: "Likely",
        },
      },
      { family: "Behavioral", label: RICKY_SIGNAL_LABELS.tennis, tone: "blue", source: "internal" },
      { family: "Behavioral", label: RICKY_SIGNAL_LABELS.hawaii, tone: "blue", source: "internal" },
      { family: "Behavioral", label: RICKY_SIGNAL_LABELS.media, tone: "blue", source: "internal" },
      {
        family: "Behavioral",
        label: "High pet expenditure",
        tone: "blue",
        source: "external",
        externalEvidence: {
          provider: "Outside SKU-level purchase data",
          detail: "Recurring high-value pet spending observed outside the bank",
          timing: "Monthly · ongoing",
          confidence: "Likely",
        },
      },
      { family: "Life Events", label: RICKY_SIGNAL_LABELS.baby, tone: "amber", source: "internal" },
      { family: "Life Events", label: RICKY_SIGNAL_LABELS.home, tone: "amber", source: "internal" },
      { family: "Risk", label: RICKY_SIGNAL_LABELS.betting, tone: "rose", source: "internal" },
    ],
    profileTitle: `${RICKY_KYC_PROFILE.name} #${RICKY_KYC_PROFILE.customerId}`,
    profileFacts: `Age ${RICKY_KYC_PROFILE.age} · ${RICKY_KYC_PROFILE.location} · Est. household income ${RICKY_KYC_PROFILE.estimatedHouseholdIncome} · ${RICKY_KYC_PROFILE.relationshipTier} tier`,
    profileBody:
      "Affluent homeowner, active traveler, tennis regular, business owner, and an emerging relationship opportunity.",
  },
  immediate: {
    eyebrow: "IMMEDIATE",
    value: { metric: "-9%", label: "Customer Service inquiries" },
    title: "Make every transaction understandable",
    subtitle:
      "Help customers recognize charges, understand the context, and confirm the answer without calling the bank.",
    phoneTitle: "Recent transactions",
    account: "Our Bank Account #9905",
    activity: [
      {
        date: "Today",
        rail: "CARD",
        icon: "sports",
        raw: "TST*COURTSIDE NYC",
        clean: "Courtside Tennis Club",
        meta: "Fitness · Sports & Active Living",
        amount: "$86.00",
        pattern: "Recurring · every other week",
        explanation: "This matches your usual every-other-week tennis club visit.",
        insight: "matches your usual every-other-week tennis club visit",
        needsConfirmation: false,
      },
      {
        date: "Yesterday",
        rail: "ACH",
        icon: "utilities",
        raw: "ACH DEBIT CITYUTIL 8841",
        clean: "City Utilities",
        meta: "Utilities · Home & Living",
        amount: "$142.38",
        pattern: "Recurring · monthly autopay",
        explanation: "This is your usual monthly utility payment from checking.",
        insight: "your usual monthly utility payment",
        needsConfirmation: false,
      },
      {
        date: "Sep 19",
        rail: "RTP",
        icon: "shared-expense",
        raw: "ZELLE TO M. CHEN",
        clean: "Mia Chen",
        meta: "Shared expense · Money Movement",
        amount: "$54.25",
        pattern: "Occasional person-to-person payment",
        explanation: "This appears to be a payment to Mia Chen for a shared expense.",
        insight: "payment to Mia Chen for a shared expense",
        needsConfirmation: false,
      },
      {
        date: "Sep 18",
        rail: "ATM",
        icon: "cash",
        raw: "ATM WDL 500 FELL ST",
        clean: "Cash withdrawal — Fell St",
        meta: "Cash · Money Movement",
        amount: "$100.00",
        pattern: "Familiar location · near home",
        explanation: "This withdrawal was made at an ATM near your home address.",
        insight: "an ATM near your home address",
        needsConfirmation: false,
      },
      {
        date: "Sep 17",
        rail: "CHECK",
        icon: "landscaping",
        raw: "CHECK #1042",
        clean: "Greenfield Landscaping",
        meta: "Home services · Home & Living",
        amount: "$320.00",
        pattern: "Recurring · quarterly service",
        explanation: "This check matches your regular landscaping service payment.",
        insight: "matches your regular landscaping service payment",
        needsConfirmation: false,
      },
      {
        date: "Sep 16",
        rail: "WIRE",
        icon: "home",
        raw: "WIRE OUT REF 88213",
        clean: "Escrow — Home Closing",
        meta: "Real estate · Financial Planning",
        amount: "$2,500.00",
        pattern: "One-time transfer",
        explanation: "This wire was sent to the escrow account associated with your home closing.",
        insight: "your home closing",
        needsConfirmation: false,
      },
      {
        date: "Sep 15",
        rail: "CARD",
        icon: "music",
        raw: "SPOTIFY P3A1B2C3D4",
        clean: "Spotify Premium",
        meta: "Music streaming · Entertainment",
        amount: "$13.99",
        pattern: "Recurring · monthly · price up $2.00 this month",
        isSubscription: true,
        explanation:
          "This monthly subscription went up $2.00 from your usual $11.99 — we wanted you to know before you spot it on a statement.",
        insight: "went up $2.00 from your usual $11.99",
        needsConfirmation: false,
      },
      {
        date: "Sep 14",
        rail: "CARD",
        icon: "vending",
        raw: "365 RETAIL MARKETS TROY MI",
        clean: "JFK Vending Machine",
        meta: "Vending · Miscellaneous retail",
        suggestionPrompt: "You can also tell us what this purchase was.",
        amount: "$4.75",
        pattern: "One-time · card purchase",
        explanation:
          "The merchant descriptor lists Troy, MI, but this purchase resembles vending machine purchases at JFK Airport. Please confirm so we label it correctly.",
        insight: "this purchase resembles vending machine purchases at JFK Airport.",
        needsConfirmation: true,
      },
      {
        date: "Sep 12",
        rail: "CARD",
        icon: "business",
        raw: "LEGALZOOM.COM 8005551212 CA",
        clean: "LegalZoom",
        meta: "Business filing services · Professional services",
        amount: "$199.00",
        pattern: "Recurring · annual business renewal",
        explanation:
          "An annual business filing and registered-agent renewal — a small-business expense, not a personal one.",
        insight: "a small-business expense, not a personal one",
        needsConfirmation: false,
      },
    ],
    popups: [
      {
        title: "Clear merchant names and locations",
        body: "Cryptic statement strings become clean merchant names and locations.",
      },
      {
        title: "Context behind every purchase",
        body: "Each transaction carries a category and a lifestyle pillar, not just an amount.",
      },
      {
        title: "Recurring patterns surface automatically",
        body: "Subscriptions and repeat activity are identified without the customer lifting a finger.",
      },
      {
        title: "Plain-language answers, self-served",
        body: "A tap explains the charge from the customer's own activity — no call to the bank needed.",
      },
      {
        title: "Confirmed by the customer",
        body: "One tap confirms the charge and helps improve future explanations.",
      },
    ],
    explainer: {
      title: "Recognize this charge?",
      body: "This appears to be your recurring tennis club visit. It matches your usual every-other-week pattern.",
      action: "Yes, that's mine",
    },
  },
  midTerm: {
    eyebrow: "MID-TERM: PROFIT",
    value: { metric: "$20 User/Year", label: "yield for the bank" },
    title: "Turn understanding into relevant growth",
    subtitle:
      "Bring partner offers, rewards, and perks into collections shaped around each customer’s interests and plans.",
    phoneTitle: "Selected for Ricky",
    rewardsIntro: "Benefits built around how you live",
    topPick: {
      label: "TOP PICK",
      title: "Your next island escape",
      body: "Travel benefits shaped around Ricky's annual vacation pattern.",
      benefit: "Roughly $150 in value on a similar trip",
      action: "View travel benefits",
      family: "Behavioral",
    },
    categories: ["For you", "Travel", "Tennis", "Dining", "Home"],
    deals: [
      { title: "Airport lounge access", detail: "Before the next Hawaii trip", family: "Behavioral" },
      { title: "Premium racquet fitting", detail: "For the next tennis season", family: "Behavioral" },
      { title: "Home design consultation", detail: "Timed to the home purchase journey", family: "Life Events" },
    ],
    product: {
      title: "Home lending relationship",
      body: "A tailored home loan relationship can support the next move.",
      benefit: "0.5% lower APR",
      action: "Explore options",
      family: "Life Events",
      personalized: "Personalized for Ricky",
      benefits: ["Preferred relationship pricing", "Flexible closing support", "A specialist ready when needed"],
    },
    placement: {
      title: "One asset, placed everywhere",
      channels: ["Digital banking", "Email", "Relationship manager", "Marketing/CRM automation"],
    },
    delivery: {
      inbox: "Inbox",
      time: "just now",
      subject: "A home lending option selected for you",
      from: "Our Bank · to Ricky",
      label: "JUST FOR YOU",
      body: "Your relationship with us may qualify you for preferred home lending support.",
    },
    popups: [
      {
        title: "Deals, rewards and perks in one place",
        body: "Partner offers and local experiences sit alongside the bank’s own benefits.",
      },
      {
        title: "Offers from multiple partners",
        body: "Bring partner catalogs together in one customer experience.",
      },
      {
        title: "Search by meaning, not keywords",
        body: "Customers find relevant offers by meaning, not exact keywords.",
      },
      {
        title: "Collections shaped by customer context",
        body: "Group offers around interests, routines, and upcoming plans.",
      },
      {
        title: "A collection for the next trip",
        body: "Travel gear, clothing, and airport benefits come together around Ricky’s upcoming getaway.",
      },
    ],
  },
  longTerm: {
    eyebrow: "MID-TERM: GROWTH",
    value: { metric: "+5.5%", label: "Cross-sell rate" },
    title: "Build a relationship that evolves",
    subtitle:
      "Connect life events, routines, and future plans to timely banking products that deepen the customer relationship and grow share of wallet.",
    phoneTitle: "Ricky's relationship",
    welcome: "Welcome, Ricky",
    memberStatus: "Private client · Member since 2018",
    snapshotTitle: "Your financial snapshot",
    snapshot: [
      { label: "Savings", value: "$148K" },
      { label: "Credit", value: "$22K" },
      { label: "Mortgage", value: "$610K" },
      { label: "Investments", value: "$385K" },
    ],
    event: {
      label: "LIFE EVENT DETECTED",
      title: "Home purchase journey",
      body: "A sustained cluster of housing-related activity indicates Ricky may be preparing for a move.",
    },
    advisor: {
      label: "NEXT CONVERSATION",
      title: "Talk through the new home plan",
      body: "A relationship manager receives the context, timing, and a concise conversation guide.",
      actions: ["Review timeline", "Prepare outreach"],
    },
    outreach: {
      label: "FOLLOW-UP READY",
      title: "A personal note, already drafted",
      body: "Ricky receives relevant help without exposing sensitive signals.",
      action: "Review draft",
    },
    popups: [
      {
        title: "Life context informs product recommendations",
        body: "Home plans, routines, and future trips inform mortgage, card, and savings recommendations.",
      },
      {
        title: "Make the benefit concrete",
        body: "Show how each recommendation could support the customer’s routine or next goal.",
      },
      {
        title: "Give the customer a next step",
        body: "Each recommendation pairs a clear benefit with an action the customer can take.",
      },
    ],
  },
  retention: {
    eyebrow: "LONG-TERM: RETENTION & NPS",
    value: { metric: "+4.5%", label: "In-app engagement" },
    title: "Give customers more reasons to stay",
    subtitle:
      "An assistant with the customer’s wider financial context can offer useful answers today and more relevant help over time.",
    openingPrompt: "How much have I spent on my last trip to Hawaii?",
    popups: [
      {
        title: "Understand the context",
        body: "Answer from enriched activity across the customer’s relationship, not isolated transactions.",
      },
      {
        title: "Remove everyday friction",
        body: "Give customers useful answers without making them search, repeat themselves, or leave the experience.",
      },
      {
        title: "Earn the next interaction",
        body: "Useful, relevant help gives customers a reason to return and can support stronger engagement over time.",
      },
    ],
    showcase: {
      eyebrow: "COUNTLESS WAYS TO SERVE",
      title: "More context. More ways to help.",
      subtitle:
        "With a richer understanding of the customer’s financial life, your assistant can be proactive with everyday questions, future plans, and the moments in between.",
      phones: [
        {
          id: "credit-score",
          label: "Credit score update",
          initiator: "ai",
          prompt:
            "I noticed your credit score changed this month. **It increased by 18 points**, helped by lower card utilization and consistent payments. Want me to show you what moved?",
          answer: "Show me what changed.",
          reply: "Sure! Here is what I found…",
          items: [
            { title: "Score increased", detail: "Up 18 points this month" },
            { title: "Lower utilization", detail: "Primary positive driver" },
          ],
        },
        {
          id: "planning",
          label: "Financial planning",
          initiator: "customer",
          prompt: "Am I on track to buy a home?",
          answer:
            "**You’re 68% toward your home purchase fund.** At your current pace, you’re on track for Summer 2027. I’d keep travel savings separate so the home goal stays protected.",
          goal: "Home purchase fund",
          progress: "68%",
          items: [
            { title: "On track for your target", detail: "At your current monthly pace" },
            { title: "Keep travel funds separate", detail: "Protect your home goal" },
          ],
        },
        {
          id: "late-payment",
          label: "Payment support",
          initiator: "ai",
          prompt:
            "I noticed your utility payment arrived after its due date. **You may have been charged a late fee.** I can help review the charge and adjust the reminder before next month.",
          answer: "Help me prevent that next month.",
          reply: "Yes, here's the plan…",
          items: [
            { title: "Utility payment", detail: "Paid after due date" },
            { title: "Reminder available", detail: "Before next month’s bill" },
          ],
        },
        {
          id: "subscriptions",
          label: "Subscription management",
          initiator: "customer",
          prompt: "Can you review my subscriptions?",
          answer:
            "I found three recurring services. **Spotify Premium increased to $13.99 monthly.** Adobe Creative Cloud is $59.99 monthly, and your pet wellness plan is $42.00 monthly.",
          items: [
            { title: "Spotify Premium", detail: "$13.99 monthly · Price changed" },
            { title: "Adobe Creative Cloud", detail: "$59.99 monthly" },
            { title: "Pet wellness plan", detail: "$42.00 monthly" },
          ],
        },
        {
          id: "cash-flow",
          label: "Cash-flow support",
          initiator: "ai",
          prompt:
            "Your usual cash cushion looks tighter ahead of three recurring bills. **Moving one payment date could create more breathing room.** Would you like me to map the options?",
          answer: "Yes, show me the options.",
          reply: "Yes, here are the options…",
          items: [
            { title: "Tighter cash cushion", detail: "Ahead of recurring bills" },
            { title: "Timing options", detail: "Create more breathing room" },
          ],
        },
        {
          id: "picture",
          label: "Complete financial picture",
          initiator: "customer",
          prompt: "What should I focus on next?",
          answer:
            "Your clearest next priority is the **home purchase goal**. I’m balancing that with your growing business, frequent travel, tennis, and pet-care commitments so recommendations fit your whole life.",
          items: [
            { title: "Planning a home purchase", detail: "High-confidence life moment" },
            { title: "Runs a growing business", detail: "Business-owner signals" },
            { title: "Travel, tennis and pet care", detail: "Lifestyle preferences" },
          ],
        },
      ],
    },
  },
  bankTools: {
    eyebrow: "TOOLS FOR THE BANK",
    title: "Possible for Ricky because it is\npossible for every customer",
    subtitle: "A modular, governed intelligence and personalization platform with 45 tools and workflows.",
    screens: [
      {
        id: "database",
        tab: "INTELLIGENCE DATABASE",
        title: "Every signal opens the segment behind it",
        description:
          "Explore customer groups, export audiences, automate reports, connect through APIs, or ask embedded AI a free-form question.",
        sections: ["Overview", "Segments", "Risk", "Reports", "Query", "API"],
        priority: {
          title: "3 priorities in your book right now",
          body: "What are the trends and opportunities for this past week?",
          action: "Ask Ventus AI",
        },
        families: [
          { label: "Demographic", count: 13, tone: "violet", unit: "signal types" },
          { label: "Financial", count: 9, tone: "emerald", unit: "signal types" },
          { label: "Behavioral", count: 11, tone: "blue", unit: "signal types" },
          { label: "Life Event", count: 9, tone: "amber", unit: "signal types" },
          { label: "Risk", count: 14, tone: "rose", unit: "signal types" },
        ],
        segment: {
          title: "Emerging opportunities",
          count: "View all segments",
          rows: [
            { label: "Primary relationship opportunity", value: "Growing", dot: "bg-emerald-500" },
            { label: "Home journey signals", value: "High intent", dot: "bg-amber-500" },
            { label: "Premium travel affinity", value: "Active", dot: "bg-blue-500" },
          ],
        },
        accessTitle: "Put intelligence to work",
        actions: ["Open segment", "Export audience", "Ask Ventus AI"],
      },
      {
        id: "flows",
        tab: "AUTOMATED FLOWS",
        title: "Products activated by the right signals",
        description:
          "Teams can edit each signal, define exclusions, and set guardrails before any experience reaches a customer.",
        workspaceTitle: "Automated Flows",
        workspaceSubtitle: "Connect customer signals to governed product actions",
        newFlow: "Create flow",
        productLabel: "Product flows",
        triggerLabel: "Trigger signals",
        flows: [
          {
            name: "529 College Savings",
            status: "Active · 3 signals",
            triggers: ["New child", "College-bound child", "Tutoring spend spike"],
          },
          {
            name: "Home Equity Line",
            status: "Draft · 3 signals",
            triggers: ["Homeowner", "Renovation", "Tuition or medical liquidity need"],
          },
        ],
        outcome: {
          title: "Review-ready audience",
          body: "Qualified households move forward only after exclusions and policy checks.",
        },
        controlsTitle: "Controls",
        controls: ["Edit signal logic", "Define exclusions", "Set approval rules"],
        guardrail: {
          label: "POLICY GUARDRAIL",
          title: "Increasing sports betting",
          body: "Visible to authorized bank teams. Excluded from every customer-facing offer, product, and message.",
        },
      },
      {
        id: "coworker",
        tab: "AI COWORKER",
        title: "Intelligence delivered like a teammate",
        description:
          "Daily digests, reply threads, drafted documents, and ready-to-review relationship tasks, tailored by role.",
        sections: ["Coworker Dashboard", "User View", "Persona Settings", "Integrations", "Activity History"],
        inboxTitle: "Ventus AI Coworker",
        inboxSubtitle: "Role-specific intelligence delivered by email",
        inbox: [
          {
            role: "Bank leadership",
            subject: "Weekly trends and emerging opportunities",
            preview: "The strongest patterns, customer needs, and actions to consider this week.",
          },
          {
            role: "Relationship manager",
            subject: "Three conversations worth having",
            preview:
              "Client A is buying a home. Client B is preparing for retirement. Client C fits the premium travel card.",
          },
          {
            role: "Product and growth",
            subject: "New high-fit segments ready for review",
            preview: "Product opportunities with signal rationale, exclusions, and draft activation plans.",
          },
        ],
        reply: "Reply to ask a follow-up, request a draft, or route the next action.",
        send: "Send",
        message: {
          from: "Ventus AI Coworker",
          subject: "Weekly trends and emerging opportunities",
          status: "Ready to review",
          intro: "Here are the strongest customer patterns and actions for leadership this week.",
          priorities: [
            {
              title: "Relationship growth",
              body: "More customers are showing signs of consolidating their financial lives.",
            },
            { title: "Home journeys", body: "Housing-related signals are creating timely lending conversations." },
            { title: "Travel momentum", body: "Premium travel behavior is strengthening across valuable segments." },
          ],
          readyTitle: "Work already prepared",
          outputs: ["Leadership brief", "Segment export", "Relationship tasks"],
        },
      },
    ],
  },
  close: {
    eyebrow: "PERSONALIZATION BECOMES DIFFERENTIATION",
    lines: ["No more commoditized banking.", "\n"],
    equation: ["anticipate customer needs", "differentiated banking"],
    ticker: [
      "lift LTV",
      "grow deposits",
      "cross-sell more products",
      "increase card spend",
      "deepen engagement",
      "increase retention",
    ],
    signature: {
      parting: "Let's do great things together",
      name: "Marco Ma",
      role: "CEO & Cofounder",
      email: "marco@ventusai.com",
    },
  },
} as const;

export const DECKMO_STEPS = DECKMO.beats.flatMap((beat, section) =>
  Array.from({ length: beat.steps }, (_, step) => {
    const sub = "subSteps" in beat ? beat.subSteps?.[step] : undefined;
    const screen = "stepScreens" in beat ? beat.stepScreens[step] : step;
    return { section, step, screen, id: `${beat.id}-${step}`, ...(sub ? { sub } : {}) };
  }),
);

/** Explicit section controls resolve through the authoritative ordered script. */
export function deckmoBeatStartIndex(id: DeckmoBeatId): number {
  return DECKMO_STEPS.findIndex((entry) => DECKMO.beats[entry.section].id === id);
}

export interface RickySignalDetail {
  evidenceKind?: "customer-profile";
  summary: string;
  facts: string[];
  merchants: string[];
}

/** Inline clauses preserve family order and put external signals last in each family. */
export const RICKY_SIGNAL_STORY = [
  { before: ". His customer profile shows", label: RICKY_KYC_SIGNAL_LABEL },
  { before: "; he is also a", label: RICKY_SIGNAL_LABELS.business },
  { before: "; outside ownership data identifies him as a", label: "Small airplane co-owner" },
  { before: ". His financial picture combines", label: RICKY_SIGNAL_LABELS.income },
  { before: "with", label: RICKY_SIGNAL_LABELS.brokerage },
  { before: ",", label: RICKY_SIGNAL_LABELS.marcus },
  { before: ", and", label: RICKY_SIGNAL_LABELS.amex },
  { before: ", while outside vehicle data shows a", label: "BMW X5 loan ending in ~4 months" },
  { before: "Ricky’s routine includes", label: RICKY_SIGNAL_LABELS.tennis },
  { before: ", an", label: RICKY_SIGNAL_LABELS.hawaii },
  { before: ", and", label: RICKY_SIGNAL_LABELS.media },
  { before: "; outside purchase data also points to", label: "High pet expenditure" },
  { before: ". His family is entering a new chapter:", label: RICKY_SIGNAL_LABELS.baby },
  { before: ", and", label: RICKY_SIGNAL_LABELS.home },
  { before: ". Separately, an account pattern to review is", label: RICKY_SIGNAL_LABELS.betting },
] as const;

export const RICKY_SIGNAL_DETAILS: Record<string, RickySignalDetail> = {
  [RICKY_KYC_SIGNAL_LABEL]: {
    evidenceKind: "customer-profile",
    summary: "Basic customer-profile information held by the institution",
    facts: [
      `Name: ${RICKY_KYC_PROFILE.name}`,
      `Customer ID: ${RICKY_KYC_PROFILE.customerId}`,
      `Age: ${RICKY_KYC_PROFILE.age}`,
      `Location: ${RICKY_KYC_PROFILE.location}`,
      `Relationship tier: ${RICKY_KYC_PROFILE.relationshipTier}`,
    ],
    merchants: [],
  },
  [RICKY_SIGNAL_LABELS.tennis]: {
    summary: "Committed club player with court time roughly every other week",
    facts: [
      "Cadence: court bookings about every 2 weeks",
      "Typical visit: $28–$186",
      "Annual club dues of $1,450 paid by check in March",
      "Summer step-up: USTA tournament entry, coaching and new gear",
    ],
    merchants: ["City Tennis Center", "Racket Sports Club", "CourtReserve", "USTA NorCal"],
  },
  [RICKY_SIGNAL_LABELS.hawaii]: {
    summary: "Maui getaway each December, already rebooked for this year",
    facts: [
      "Last trip: Dec 1–9, 2025, about $6,100 all-in",
      "Pattern: insure, fly, rent a car, resort stay",
      "Resort stay: $2,960 at Wailea Beach Resort",
      "Next trip: Hawaiian Airlines booked in Sep for December",
    ],
    merchants: ["Hawaiian Airlines", "Wailea Beach Resort", "Allianz Travel", "Mama's Fish House"],
  },
  [RICKY_SIGNAL_LABELS.media]: {
    summary: "Layered streaming plus live events and movie nights",
    facts: [
      "Subscriptions: Netflix, YouTube TV, Spotify",
      "Spotify plan upgraded: $11.99 → $12.99 → $13.99",
      "Live events: $286 at Shoreline Amphitheatre",
      "Recurring media base around $120 per month",
    ],
    merchants: ["Netflix", "YouTube TV", "Spotify", "Ticketmaster", "AMC Theatres"],
  },
  "High pet expenditure": {
    summary: "Premium pet spending seen in outside purchase data",
    facts: [
      "Cadence: monthly, ongoing",
      "Basket: premium food, supplies and care",
      "Not visible in the bank's own ledger",
      "Confidence: likely",
    ],
    merchants: ["Outside SKU-level purchase data"],
  },
  [RICKY_SIGNAL_LABELS.baby]: {
    summary: "Nursery prep in winter, hospital stay in March, childcare by summer",
    facts: [
      "Jan–Feb: Babylist registry and Pottery Barn Kids nursery",
      "Mar 19: $2,460 Lucile Packard Children's Hospital",
      "Recurring diaper orders from The Honest Company",
      "Aug: Bright Horizons childcare starts at $2,180",
    ],
    merchants: ["Babylist", "Pottery Barn Kids", "Lucile Packard", "The Honest Company", "Bright Horizons"],
  },
  [RICKY_SIGNAL_LABELS.home]: {
    summary: "Home purchase moving from planning to closing",
    facts: [
      "Feb: property attorney retained",
      "Apr and Aug: two appraisals",
      "Sep: $315,000 escrow wire to Pacific Title",
      "Inspection and moving deposit booked the same month",
    ],
    merchants: ["Pacific Title Escrow", "Premier Home Inspection", "Northstar Moving"],
  },
  [RICKY_SIGNAL_LABELS.brokerage]: {
    summary: "Disciplined monthly investor with a fixed schedule",
    facts: [
      "Cadence: monthly, on the 15th",
      "Amount: $5,000 every month",
      "About $45,000 moved year to date",
      "Same day as payroll, so it is planned and automatic",
    ],
    merchants: ["Fidelity Brokerage"],
  },
  [RICKY_SIGNAL_LABELS.marcus]: {
    summary: "Growing savings habit held at an outside high-yield account",
    facts: [
      "Cadence: monthly ACH on the 17th",
      "Size: $2,000 rising to $3,500",
      "About $24,000 moved year to date",
      "Step-ups every two months",
    ],
    merchants: ["Marcus by Goldman Sachs"],
  },
  [RICKY_SIGNAL_LABELS.amex]: {
    summary: "Primary card spend runs through an outside card",
    facts: [
      "Cadence: monthly ePayment on the 4th",
      "Size: $3,300 rising to $4,860",
      "About $35,700 paid year to date",
      "Trend: steady growth across 9 months",
    ],
    merchants: ["American Express"],
  },
  "BMW X5 loan ending in ~4 months": {
    summary: "Vehicle financing nears payoff, opening a next-car decision",
    facts: [
      "Loan maturity in about 4 months",
      "Financed outside the bank",
      "Growing family may favor a larger vehicle",
      "Confidence: likely",
    ],
    merchants: ["Outside vehicle ownership data"],
  },
  [RICKY_SIGNAL_LABELS.income]: {
    summary: "Reliable salary with steady raises",
    facts: [
      "Cadence: semi-monthly on the 1st and 15th",
      "Monthly: $22.8K in Jan to $24.7K in Sep",
      "Employer: HP Inc. direct deposit",
      "Trend: small increases most months",
      `Estimated annual household income: ${RICKY_KYC_PROFILE.estimatedHouseholdIncome} (profile estimate, not observed payroll)`,
    ],
    merchants: ["HP Inc. Payroll"],
  },
  [RICKY_SIGNAL_LABELS.business]: {
    summary: "New cottage food business with fast-growing weekly sales",
    facts: [
      "May: LLC formation and county cottage food permit",
      "From June: weekly Square payouts",
      "Payouts grew from $1,216 to $2,486",
      "Costs: market vendor fees, Restaurant Depot, liability insurance",
    ],
    merchants: ["Square", "LegalZoom", "Urban Village Farmers' Market", "Restaurant Depot", "FLIP"],
  },
  "Small airplane co-owner": {
    summary: "Shared aircraft ownership suggests an affluent aviation lifestyle",
    facts: [
      "Aircraft: Cirrus SR22",
      "Ownership: shared rather than sole ownership",
      "Pattern: recurring annual ownership and operating obligations",
      "Confidence: likely",
    ],
    merchants: ["Outside aircraft ownership data"],
  },
  [RICKY_SIGNAL_LABELS.betting]: {
    summary: "Sportsbook activity rising steadily through the year",
    facts: [
      "Size: $65 in Jan to $480 in Sep",
      "Cadence: roughly monthly, now more frequent",
      "New in Sep: direct wallet funding by ACH",
      "Worth a gentle wellness check-in",
    ],
    merchants: ["DraftKings"],
  },
};
