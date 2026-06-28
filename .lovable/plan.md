# Per-team workflow narratives (left → right, tailored to each team)

Scope: only the 5 TEAM panels in `src/components/tepilot/insights/CapabilitiesView.tsx`. Each team gets its own workflow with its own stage names and number of steps — no forced template. Every workflow still starts with a **signal-family input** so it lines up with the diagram on the left.

## Data model

Extend `TeamDetail` with an optional `workflow` array of free-form stages:

```ts
type WorkflowStep = {
  stage: string;          // team-specific stage label
  text: string;           // one short sentence
  chips?: { label: string; kind: "signal" | "destination" | "product" | "system" }[];
};
workflow?: WorkflowStep[];
```

Chip kinds map to existing tints: signal → per-signal color (amber/blue/emerald/violet/rose), destination → slate, product → indigo, system → zinc.

## Tailored workflows

### Merchant Deals (5 stages)
1. **Behavioral & Life Event signals in** — golf habit, coffee runs, new home, new baby. *chips: Behavioral, Life Event*
2. **Curate deal collection** — assemble a deal set per behavioral cluster and per life event.
3. **Personalize ranking** — re-rank using Financial tier and Demographic context (Luxury, income band, region). *chips: Financial, Demographic*
4. **Risk exclusion pass** — drop offers adjacent to vice, gambling, distress for that customer. *chips: Risk*
5. **Push to rewards rails** — individualized offer set → Rewards Provider → Digital Banking. *chips: Rewards Provider, Digital Banking App*

### Analytics & Targeting (4 stages)
1. **Question + signal scope** — analyst picks any of the 5 signal families via SQL or reports library. *chips: Life Event, Behavioral, Financial, Demographic, Risk*
2. **AI-assisted SQL execution** — natural language → SQL → results grounded in the Ventus schema.
3. **AI takeaway + cohort split** — business interpretation; GROUP BY segments become per-segment cohorts.
4. **Cohort export to activation channels** — CSV / DISTINCT customer_id → CRM, Marketing Automation. *chips: CRM, Marketing Automation*

### Product Growth (5 stages)
1. **Life Event + Financial signals in** — new home, new baby, retirement, payroll growth, wallet-share leak. *chips: Life Event, Financial*
2. **Map signal → eligible product** — join against the Bank Product catalog (single source of truth). *chips: Bank Product*
3. **Eligibility & demographic fit** — income band, account tenure, regional product availability. *chips: Demographic*
4. **Risk gate** — suppress new credit pushes for customers in distress or active risk review. *chips: Risk*
5. **Brief + cross-sell distribution** — go-to-market briefs → CRM, Marketing Automation, AI Banking Assistant. *chips: CRM, Marketing Automation, AI Banking Assistant*

### Wealth Management (5 stages)
1. **Life Event + Financial signals in** — inheritance, retirement, business sale, outbound brokerage flow. *chips: Life Event, Financial*
2. **HNW client identification** — segment by investable-asset tier and wallet-share posture.
3. **Portfolio-aware brief assembly** — one-page advisor brief: posture, events, talking points, win-back hooks.
4. **Compliance & demographic context** — tenure, AUM tier, exclude clients under open Risk review. *chips: Demographic, Risk*
5. **Route to relationship manager** — brief + follow-up tasks → Advisor Console + CRM. *chips: Advisor Console, CRM*

### Risk & Compliance (5 stages)
1. **Risk signals in** — vice, AML structuring, payday, distress. *chips: Risk*
2. **Severity scoring & bucketing** — weighted scores, model-routed AML, deterministic vice flags.
3. **Alert triage queue** — analysts work alerts against SLA thresholds.
4. **Policy tuning & false-positive suppression** — threshold adjustments, audit-logged overrides.
5. **Escalate to risk ops & SAR workflow** — confirmed cases → Risk Ops, SAR filing. *chips: Risk Ops*

## UI change

In the existing shared detail panel (~line 818 of `CapabilitiesView.tsx`), add a **Workflow** block above the responsibilities grid, only when `activeDetail` is a team with `workflow` set.

- Desktop: horizontal step row, N columns matching the team's step count, thin connector arrow between cells, equal-width.
- Mobile: stacked vertical list with arrow separators between steps.
- Each cell: uppercase stage label, one-sentence body, chip row using the kind→color mapping above.
- Existing responsibilities grid stays unchanged underneath.

## Out of scope

- Signal-family panels keep their current shape.
- No changes to the network-wire SVG, source groups, or destinations list.
- No new icons.
