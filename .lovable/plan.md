## Goal

Replace `ProductCampaignBuilderView` with a focused 3-section layout driven entirely by the existing 44-product `PRODUCT_FLOWS` catalog. No new tab — the existing Targeting → Campaign Builder slot now renders the redesigned view.

---

## Layout

```text
┌─────────────────────────────────────────────────────────────┐
│ Section 1 — PRODUCT PICKER + MECHANICS                      │
│  Left:  scrollable grid of all 44 products (grouped by      │
│         category: Wealth · Lending · Deposits · Cards ·     │
│         Insurance) as compact cards with icon + name.       │
│  Right: selected product detail — positioning + 1–2 lines   │
│         of mechanics ("3% transit · 2% sports · 1% else,    │
│         $0 annual fee, top-3 categories auto-rotate") and a │
│         bullet list of 3–5 product features.                │
├─────────────────────────────────────────────────────────────┤
│ Section 2 — AUDIENCE & EXCLUSION FUNNEL                     │
│  Horizontal funnel:                                         │
│   Total base (250M) → Eligible (penetration) →              │
│   minus financial-risk → minus behavioral-risk →            │
│   Final addressable                                         │
│  Below funnel: two columns of exclusion chips, each with    │
│   • criterion label                                         │
│   • count removed (vaguely specific)                        │
│   • one-line plain-English rationale                        │
│  e.g. "Recent NSF cluster — 1.2M removed — protects         │
│   customer from a card they'd struggle to service."         │
├─────────────────────────────────────────────────────────────┤
│ Section 3 — THREE PERSONALIZED MESSAGE PREVIEWS             │
│  Three side-by-side cards, each tagged by angle:            │
│   1. Behavioral / spend-pattern                              │
│      "This card gets you 3% on transit and 2% on sports."   │
│   2. Life-event driven                                       │
│      "Your top categories this year — diapers, pediatric    │
│       copays — both earn 2% with this card."                │
│   3. Financial-journey driven                                │
│      "You're building toward a down payment — round-ups     │
│       on every swipe go straight to your HYSA."             │
│  Each card: subject line, 2–3 sentence body, CTA pill, and  │
│  a small "Why this angle" chip referencing the signal type. │
└─────────────────────────────────────────────────────────────┘
```

---

## Data model changes

Extend `ProductFlow` in `src/lib/productAutomatedFlows.ts`:

```ts
export interface ProductMechanics {
  tagline: string;            // one-liner: "3% / 2% / 1% on top categories"
  features: string[];         // 3–5 short bullets
  // optional structured rate card for visual rendering
  rateTable?: { tier: string; rate: string; note?: string }[];
  fee?: string;               // "$0 annual fee" / "$95 / waived first year"
}
```

Add a `mechanics` field to every one of the 44 products, anonymized from the BoA-style reference catalog already used elsewhere in the project (Category Cash Back Card = 3/2/1, Travel Card = 1.5x/3x on travel, HYSA = 4.25% APY, etc.). Hand-authored in the catalog file — no LLM call for mechanics.

Audience funnel inputs (deterministic, mock):
- `estimatedAudience` already on each product.
- Add `exclusions: { id, label, removedPct, rationale, type: 'financial'|'behavioral' }[]` on each product. ~4–6 exclusions per product, mocked but plausible (e.g. cards exclude "thin credit file", "recent NSF cluster"; HELOC excludes "LTV > 80%", "recent late mortgage payment").

Counts in the funnel = `estimatedAudience × (1 − sum(removedPct))` with per-stage subtraction shown visually.

---

## Files to touch

- `src/lib/productAutomatedFlows.ts` — extend type, add `mechanics` + `exclusions` to all 44 entries (largest edit; mechanical).
- `src/components/tepilot/campaigns/ProductCampaignBuilderView.tsx` — full rewrite into 3-section layout described above. Remove the old 3-step state (signals/lifeEvents/pillars/etc.) and the right sticky strip.
- New `src/components/tepilot/campaigns/sections/ProductPickerSection.tsx` — grid + detail panel.
- New `src/components/tepilot/campaigns/sections/ExclusionFunnelSection.tsx` — funnel + exclusion list.
- New `src/components/tepilot/campaigns/sections/MessagePreviewsSection.tsx` — 3 message cards.
- New `src/lib/productMessageVariants.ts` — for each product, 3 hand-authored message variants keyed by angle (behavioral, life-event, financial-journey). Uses the same anonymized voice as `productMicrosegments.ts`. No LLM call — deterministic so the preview is instant and consistent.

Untouched: `ProductAutomatedFlowsView`, edge functions, `productMicrosegments.ts`, sidebar navigation, all other tabs.

---

## Style + tone constraints (from project memory)

- Strict light theme; white cards, slate-200 borders; no `dark:` utilities.
- Manrope for UI; `ui-monospace` only for raw transaction-style strings (rate-card mono is fine).
- "Vaguely specific" messaging — no exact transaction counts or dollar amounts in customer copy.
- No competitor or BoA product names in any visible string; mechanics phrased generically.
- Avoid risk/stress language in the message previews; exclusion rationales are framed as customer protection ("we hold off until …") rather than denial.

---

## Non-goals

- No edge function changes, no DB schema, no auth.
- No regeneration of `productMicrosegments.ts`.
- Old multi-family signal builder is gone; nothing else in the app imports its state.
