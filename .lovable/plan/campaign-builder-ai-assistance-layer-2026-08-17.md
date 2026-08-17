# Campaign Builder — AI Assistance Layer

Keep the three entry points (product / signals / outflow) and the step flow. Add a deterministic, LLM-free "Ventus AI" layer on top that turns the tab from a form into an advisor: it recommends, forecasts, warns, and drafts — and always shows its reasoning.

## 1. AI Campaign Brief (new top block)

A persistent card directly under the tab header, present in all three modes. It reads the current state (product, filters, exclusions, signals) and produces:

- **One-line recommendation** — e.g. "Target the 41K high-fit segment, suppress recent decliners, send Tue 9am via app push."
- **Confidence** — a realistic band (58–82%), never near-100, with the drivers listed.
- **Three ranked next actions**, each a real button that mutates state (apply the recommended audience, add the missing exclusion, jump to copy).
- **Reasoning trace** — collapsible "How Ventus got here": signal weights, overlap penalties, exclusion pass rates, comparable past campaigns.

Recomputes live as the user changes anything, with a short 400–700ms "thinking" shimmer so it reads as AI without any network call.

## 2. Goal-first intent bar

Above the mode toggle: a plain-language input ("grow deposits from customers about to receive a windfall"). Matching is keyword + tag scoring against the product catalog and signal library. It doesn't chat — it sets state: picks the mode, preselects the product or signal stack, and explains the mapping in one line. Includes 4–5 suggested goal chips so the demo never dead-ends.

## 3. Smarter product picker (product mode)

- Each product card gains an **AI fit score** (0–100) with a one-line why, computed from signal coverage, catalog audience, and category affinity.
- **"Recommended for you now"** row at the top: the 3 products with the strongest live signal support this period.
- **Cannibalization warning** when the picked product overlaps an active flow's audience.
- Offer chips get **AI-suggested offers** per product instead of a single hardcoded preset.

## 4. Audience copilot (exclusion funnel)

- **Auto-tune button**: proposes a filter/exclusion set that maximizes projected conversion per contact, shown as a diff (what changed, and the effect on reach) that the user can accept or reject.
- **Live health meter**: flags over-narrowing (audience below a viable threshold), redundant filters, and filters with near-zero impact.
- **Forecast strip**: projected reach → opens → clicks → conversions → revenue, each with a range, derived deterministically from the funnel math already in `productCatalogExtras`.
- **Comparable campaigns**: 2–3 mock historical campaigns with similar shape and their outcomes, as an anchor for the forecast.

## 5. Message copilot (previews)

- Every variant gets a **predicted lift vs. the control** and a **tone/read-level chip**.
- **Why this message**: the exact anchor signal and evidence it was built from.
- **Guardrail check** per variant — creepiness, compliance phrasing, length, "vaguely specific" tone rule — with pass/warn badges and a one-click fix that swaps in a compliant phrasing.
- **A/B split recommendation**: which two variants to run and the suggested traffic split.
- **Send-time and channel recommendation** per segment, with the reasoning.

## 6. Signal mode upgrades

- Ranked **"signals worth adding"** suggestions: each shows the delta to audience and to top-product fit if enabled.
- **Diminishing-returns indicator** when stacked signals stop adding qualified reach.
- Signal stack gets a saveable name so it can be reused as a campaign template.

## 7. Launch readiness

Replaces the implicit end of the flow: a checklist card (audience viable, exclusions applied, copy passes guardrails, channel set, link set) with an overall readiness score and a primary **Launch** action that is disabled until the blocking items clear.

## Technical notes

- New `src/lib/campaignAiEngine.ts`: pure functions for fit scoring, auto-tune, forecast ranges, guardrail checks, send-time and channel rules, confidence bands. No network, fully deterministic from current state.
- New `src/lib/campaignGoalMatcher.ts`: keyword/tag scoring for the intent bar.
- New components under `src/components/tepilot/campaigns/ai/`: `AiCampaignBrief`, `GoalIntentBar`, `AudienceCopilot`, `ForecastStrip`, `LaunchReadinessCard`, `ReasoningTrace`.
- Reuses existing math: `productCatalogExtras` (funnel/exclusions), `signalStudio` (audience, product fits, outreach), `campaignCatalogVariants` (variants).
- `ProductCampaignBuilderView.tsx` becomes the state owner and passes a single derived `aiContext` down; the three mode bodies stay where they are.
- Strict light theme throughout, no `dark:` utilities. Confidence and lift numbers stay realistic; no exact transaction counts or spend amounts in customer-facing copy.
- No LLM calls anywhere in this tab.
