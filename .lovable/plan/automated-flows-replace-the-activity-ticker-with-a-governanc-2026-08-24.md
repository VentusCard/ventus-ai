# Automated Flows — replace the activity ticker with a governance workflow card

Swap the rolling "Ventus — autonomous activity" feed at the top of the Automated Flows tab for a single card that shows how a bank governs Ventus automated flows end to end, from product mapping through channel activation.

## The workflow

Five stages, left to right, each with a live count and a state:

```text
Products Mapped  →  Signals Assigned  →  Marketing Approval  →  Product Owner Approval  →  Channels Live
     76                   410               18 pending              6 pending          Digital · Email · SMS
```

1. **Products Mapped** — count of products in the catalog with a flow configured (from `PRODUCT_FLOWS`), plus how many are active vs draft.
2. **Signals Assigned** — total signals attached across all flows, plus average signals per product and how many are custom (user-added overrides).
3. **Marketing Approval** — flows whose copy/creative is approved, with a pending count and last-reviewed timestamp. Pending count is the actionable number.
4. **Product Owner Approval** — flows signed off by the owning product line, pending count, and the named owner group for the oldest pending item.
5. **Channels Assigned** — a stage that expands into three sub-cards: Digital Banking, Email, SMS. Each sub-card shows its enabled flow count, reach for the last 24h, and status (live / capped / paused by frequency guardrail).

Visual model: one white card, slate-200 border, header row ("Flow governance — how automated flows reach customers" + a small "all stages inside your guardrails" hint and a green pulse dot). Below, a horizontal 5-stage rail with thin chevron connectors. Each stage tile shows: stage label, large tabular number, one-line sub-detail, and a small state chip (green complete / amber pending / slate neutral). The Channels stage renders as a wider tile containing the three channel sub-cards stacked as compact pills with their own numbers.

Progress reads left to right: stages 1–2 are system-generated (always complete), 3–4 are human gates (show pending counts in amber), 5 is the execution surface. A thin progress bar under the rail shows the share of mapped products that have cleared both approvals and are live on at least one channel.

Clicking a stage tile is non-navigating for now (hover highlight only) to keep scope to the card.

## Technical notes

- New file `src/components/tepilot/campaigns/FlowGovernanceCard.tsx` — presentational, strict light theme, no `dark:` classes.
- New file `src/components/tepilot/campaigns/data/flowGovernance.ts` — stage definitions, approval/pending mock counts, and the three channel sub-card records. Approval numbers are mocked constants; products/signals counts derive from `PRODUCT_FLOWS` and `flowSignalsNow` so they stay in sync with the catalog.
- `ProductAutomatedFlowsView.tsx` — replace the `AutonomousActivityFeed` import and its render at line 663 with `<FlowGovernanceCard />`. Nothing else in the view changes.
- `AutonomousActivityFeed.tsx` and `data/autonomousActivity.ts` are left in place (unused) unless you want them deleted.
- Icons from lucide-react: Boxes, Radar, Megaphone, UserCheck, Send / Smartphone, Mail, MessageSquare.
