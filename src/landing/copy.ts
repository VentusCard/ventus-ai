/**
 * Every string that appears on the landing page lives here (Appendix C of
 * the 31 Aug goal, hero and record strings per FINNOVATE-LANDING-GOAL-C.md). Components import from this file and do
 * not inline copy — that is what keeps a QA text-search for banned words
 * ("revolutionary", "transformative", "seamless", "hyper-personalized",
 * "real-time", "guaranteed", "before customers ask", "the future of
 * banking") a single grep over one file instead of a hunt through JSX.
 */

export const LANDING_COPY = {
  hero: {
    eyebrow: "Decision intelligence for financial institutions",
    headline: "Personalization your bank can stand behind.",
    body: "Customer context, bank policy, and activation in one governed layer — inside the systems your bank already runs.",
    cta: "Request Access",
    /**
     * The decision record (FINNOVATE-LANDING-GOAL-C.md, Appendix D), kept
     * lean for the hero. Values are categorical by rule: never a customer
     * name, merchant, amount, percentage, date, model or version number.
     */
    record: {
      title: "Decision record",
      badge: "Governed",
      status: ["Context", "Policy", "Review", "Record"],
      sources: [
        { key: "transactions", label: "Transactions" },
        { key: "relationships", label: "Relationships" },
        { key: "digital", label: "Digital" },
        { key: "teams", label: "Teams" },
      ] as const,
      pathLabels: {
        context: "Approved context",
        decision: "Decision",
        workflow: "Existing workflow",
      },
      workflowSlot: { title: "Advisor queue", item: "Wealth conversation" },
      rows: [
        { key: "Context", value: "Approved signal families", stamp: { state: "filled", label: "Approved" } },
        { key: "Policy", value: "Institution-defined rules", stamp: { state: "filled", label: "Passed" } },
        { key: "Review", value: "Below the review threshold", stamp: { state: "hollow", label: "No human step" } },
        { key: "Destination", value: "Advisor queue", stamp: { state: "filled", label: "Filed" } },
      ],
      mobileRows: ["Context", "Policy", "Destination"],
      srSummary:
        "Illustrative decision record: approved signal families enter, one next action is chosen within institution-defined rules, no human review step is required in this case, and the decision is filed to an existing advisor queue with its rationale.",
    },
  },

  intelligence: {
    eyebrow: "Intelligence",
    headline: "A shared understanding of the customer.",
    body: "Customer context is spread across transactions, product relationships, digital behavior, and teams. Ventus organizes what the bank has approved into one view, so every decision starts from the whole relationship.",
    stages: [
      {
        key: "understand",
        title: "Understand",
        body: "Organize approved context into one view of the relationship.",
      },
      {
        key: "decide",
        title: "Decide",
        body: "Prioritize the next relevant action for this customer, within bank policy.",
      },
      {
        key: "activate",
        title: "Activate",
        body: "Route the decision into the workflow that already owns it.",
      },
    ] as const,
    plane: {
      header: "Context plane",
      relationship: { title: "Relationship view", rows: ["Transactions", "Relationships", "Digital", "Teams"] },
      candidates: { title: "Next action", raised: "Wealth conversation", tag: "Within policy" },
      workflow: { title: "Advisor queue", item: "Wealth conversation", stamp: "Filed" },
    },
  },

  governance: {
    eyebrow: "Governance",
    headline: "Personalization under the bank’s rules.",
    body: "Governance is part of the decision itself, not a review after it. Approved context, policy checks, review thresholds, and the decision record stay connected in one visible path.",
    planeHeader: "DECISION CONTROL",
    planeStatus: "POLICY ACTIVE",
    /** Row 03 is deliberately the hollow stamp (decision 5). */
    rows: [
      {
        n: "01",
        title: "Approved context",
        body: "Only permitted signal families enter the decision.",
        stamp: { state: "filled", label: "Approved" },
      },
      {
        n: "02",
        title: "Policy checks",
        body: "Institution-defined rules shape what can happen next.",
        stamp: { state: "filled", label: "Passed" },
      },
      {
        n: "03",
        title: "Review threshold",
        body: "Human involvement stays visible where required.",
        stamp: { state: "hollow", label: "Human review" },
      },
      {
        n: "04",
        title: "Decision record",
        body: "The rationale and the destination remain connected.",
        stamp: { state: "filled", label: "Retained" },
      },
    ],
  },

  activation: {
    eyebrow: "Activation",
    headline: "Intelligence that works through the bank you already run.",
    body: "A governed decision is only useful when it reaches the right team and channel. Ventus delivers decisions into existing workflows rather than adding another one.",
    /** The decision bar across the top of the network: the action and its
     *  destination follow the cycle; the policy result is constant. */
    chip: { title: "Governed decision", keys: { action: "Action", policy: "Policy", destination: "Destination" }, policy: "Passed" },
    /** Each destination carries the categorical action that reaches it while
     *  the network cycles; the connector shows the same action. */
    destinations: [
      { label: "Digital banking", icon: "smartphone", surface: "tile", item: "Card upgrade", kind: "In-app · card" },
      { label: "CRM", icon: "users", surface: "task", item: "Service follow-up", kind: "Task" },
      { label: "Marketing", icon: "megaphone", surface: "send", item: "Onboarding journey", kind: "Journey" },
      { label: "Rewards", icon: "gift", surface: "offer", item: "Travel offer", kind: "Offer" },
      { label: "Advisor", icon: "briefcase", surface: "queue", item: "Wealth conversation", kind: "Queue" },
    ] as const,
    litSlot: "Advisor",
    litLabel: "Filed",
    closing: {
      eyebrow: "A more informed relationship",
      headline: "Make every customer interaction informed by the full relationship.",
      body: "Tell us which customer decision your team wants to improve first.",
      cta: "Request Access",
    },
  },

  footer: {
    copyright: "© 2026 Ventus Financial Technologies Inc.",
    email: "info@ventusai.com",
    privacyLabel: "Privacy",
    privacyHref: "/privacy",
  },

  header: {
    anchors: [
      { id: "intelligence", label: "Intelligence" },
      { id: "governance", label: "Governance" },
      { id: "activation", label: "Activation" },
    ] as const,
    cta: "Request Access",
    brandAriaLabel: "Ventus AI home",
    menuAriaLabel: "Toggle section navigation",
  },

  modal: {
    title: "Request access",
    intro: "Tell us what your team is trying to improve. We’ll follow up with the most relevant Ventus overview or pilot path.",
    fields: {
      name: "Name",
      email: "Work email",
      institution: "Institution",
      role: "Role",
      decision: "Which customer decision would you improve first?",
      decisionPlaceholder: "Optional — keep this high level",
      decisionHint: "Please do not include customer, account, or other confidential information.",
    },
    submit: "Request Access",
    submitting: "Sending…",
    success: "Request received. We will reply from info@ventusai.com.",
    failure: "We could not send this request. Email info@ventusai.com and we will follow up.",
    close: "Close",
  },

  seo: {
    title: "Ventus AI — Governed Decision Intelligence for Financial Institutions",
    description: "Ventus brings customer context, bank policy, and activation together in one governed intelligence layer, delivered through the systems your bank already uses.",
    keywords: "governed decision intelligence for banks, decision intelligence banking, bank policy engine, customer intelligence for banks, personalized banking governance",
  },
} as const;
