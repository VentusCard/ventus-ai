# Targeting — White-Glove Autonomous Enhancements

Reframes Targeting from "tools the bank operates" to "service Ventus runs for the bank." Two additions, in two different places.

## 1. Autonomous Activity Feed (Targeting, top of section)

A persistent, always-visible feed at the top of the Targeting area showing what Ventus has done autonomously — the headline proof that the service is working overnight without the bank lifting a finger.

**Placement:** Renders above the active Targeting sub-tab (Automated Flows / Campaign Builder / Next-product). Shared across all three so the activity stream is the constant frame.

**Card design (mock, light theme):**
- Horizontal scrolling strip OR compact stacked list (5 most recent, "View all" link).
- Each item: timestamp ("2h ago"), action verb badge, one-line description, affected count, optional drill-link.
- Action types + example copy:
  - `Enrolled` — "Enrolled 1,240 customers into HELOC equity-tap flow"
  - `Paused` — "Paused Auto-Refi campaign — saturation detected in 18–34 segment"
  - `Drafted` — "Drafted 3 new flows from emerging signals — awaiting review"
  - `Optimized` — "Shifted Term Life flow from email to in-app — 2.3× lift"
  - `Suppressed` — "Suppressed 412 customers from outreach — frequency cap reached"
  - `Detected` — "Detected new cohort: Empty-Nesters relocating coastal — 380 customers"
- Soft pulse indicator on the newest item; auto-rotates demo entries every ~6s for liveness.

**Data:** Hardcoded mock entries in `next-product/data/autonomousActivity.ts` (or new `targeting/data/`). No backend.

**Tone rules:** Vaguely specific counts (rounded), no exact spend, no customer names. Frame as opportunity language per existing memory.

## 2. Governance & Guardrails (Settings tab)

Moves the "service contract" into the existing **Settings** sidebar item — the bank sets the rails once, Ventus operates inside them. This is what makes the autonomy feel safe.

**New Settings sub-section: "Targeting Guardrails"**

Read-mostly card grid (toggles + sliders mocked, no persistence needed for demo):
- **Frequency cap** — Max messages per customer per week (slider, default 2).
- **Channel priority** — Drag-ordered list: In-app → Email → SMS → Push.
- **Quiet hours** — Time window where no outbound fires (e.g. 9pm–8am local).
- **Cooling-off period** — Days of silence after a conversion before re-targeting (default 30).
- **Product eligibility** — Which products Ventus may autonomously enroll vs require human approval. Checklist over the product catalog.
- **Tone & disclaimers** — Brand voice pinned + required compliance footer.
- **Autonomy threshold** — Slider: "Banker approves everything" ↔ "Ventus runs autonomously." Default: mid.

Top of the panel: one-line statement — "Ventus operates inside these rails. Everything else runs autonomously."

## Technical Notes

**Files to create:**
- `src/components/tepilot/campaigns/AutonomousActivityFeed.tsx` — feed UI
- `src/components/tepilot/campaigns/data/autonomousActivity.ts` — mock entries
- `src/components/tepilot/settings/TargetingGuardrailsPanel.tsx` — guardrails UI

**Files to edit:**
- `src/components/tepilot/insights/AnalyticsContainer.tsx` — render `AutonomousActivityFeed` above content when `activeTab` is one of the three Targeting tabs.
- `src/components/tepilot/insights/SettingsContainer.tsx` — add Targeting Guardrails section.

**Untouched:** `ProductAutomatedFlowsView`, `ProductCampaignBuilderView`, `SegmentTargetingView` internals.

**Out of scope:** No persistence, no edge functions, no real auto-optimization — all mocked. No changes to other nav groups.

## Memory updates after build
- New: `mem://features/targeting/autonomous-activity-feed` — placement, action verbs, tone.
- New: `mem://features/settings/targeting-guardrails` — guardrail fields + autonomy slider concept.
