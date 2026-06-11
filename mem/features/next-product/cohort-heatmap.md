---
name: Next-product Cohort Heatmap
description: Next-product tab is a read-only cohort × product heatmap rolling up Automated Flows output; no CampaignStudio
type: feature
---

The Next-product tab (`SegmentTargetingView.tsx`) is positioned as the **customer-first roll-up of Automated Flows**, NOT a campaign builder.

Rules:
- Read-only intelligence. No CampaignStudio, no FinancialJourneyHeader, no "create/send campaign" CTAs.
- Primary UI is a Cohort × Product heatmap. Rows = customer cohorts (life-stage × lifestyle pillar), Columns = ~8 BoA-style products. Top-1 cell per row is outlined.
- KPI strip above heatmap: matched customers, avg signal strength, top product this week, count of Automated Flows feeding the view.
- Cohort drill-down panel (right side) shows ranked product ladder with the **list of Automated Flows feeding each score** — reinforces "data rolled up from Automated Flows" framing.
- Filters: life-stage chips + sort (top score / audience / momentum).
- Static demo data lives in `src/components/tepilot/campaigns/next-product/data/cohorts.ts`.

Differentiation in the Targeting group:
- Automated Flows = product → signal → enroll (always-on)
- Next-product = cohort → ranked products (read-only roll-up)
- Campaign Builder = pick product → see who qualifies → author campaign
