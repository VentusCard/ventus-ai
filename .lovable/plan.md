## Goal

Expand the "AI Native Intelligence Layer" context band in `NextConversationRationale.tsx` so each existing row has more pills, and add a fourth row describing what the AI banking assistant explicitly will **not** do.

## Changes

### `src/components/exec-demo/NextConversationRationale.tsx`

**1. Import a new icon**
Add `Ban` to the existing `lucide-react` import (line 1).

**2. Expand the three existing rows in `CONTEXT_ROWS`** (lines 12–56) — add 6 more pills each (12 total per row):

- **Inputs** — add: `Card & payment activity`, `Statement history`, `Channel interactions`, `Geo & device signals`, `Bill pay & payee list`, `Rewards & offers history`.
- **Capabilities** — add: `Explain a charge or fee`, `Forecast cash flow`, `Detect duplicate subscriptions`, `Compare card rewards`, `Set savings rules & alerts`, `Prep for advisor meetings`.
- **Routes To** — add: `Card services`, `Disputes & chargebacks`, `Lending officers`, `Retirement planners`, `Estate & trust desk`, `Client service center`.

**3. Add a new fourth row — "Out of Scope"** with rose accent, strikethrough pills to make the "not doing" intent visually obvious:

```ts
{
  label: "Out of Scope",
  icon: Ban,
  accent: "bg-rose-400",
  labelClass: "text-rose-700",
  pillClass: "border-rose-200 bg-rose-50/60 text-rose-700 line-through decoration-rose-300/70",
  pills: [
    "Give tax or legal advice",
    "Pick individual stocks",
    "Move money without confirmation",
    "Open accounts unattended",
    "Override compliance rules",
    "Share data with third parties",
    "Discuss other clients",
    "Predict market direction",
    "Approve loans or credit lines",
    "Process disputes end-to-end",
    "Replace a licensed advisor",
    "Make medical or life decisions",
  ],
},
```

**4. Update the comment** above `CONTEXT_ROWS` from "3 rows describing the AI assistant" to "rows describing the AI assistant".

## Visual result

The intelligence layer card now shows 4 horizontal rows (Inputs, Capabilities, Routes To, Out of Scope), each densely packed with 12 pills. The Out of Scope row uses a rose accent bar and rose-tinted pills with strikethrough text so it reads as guardrails rather than features. No layout changes — the existing `ContextPillRows` component already handles wrapping and per-row styling via `pillClass`/`accent`/`labelClass`.

## Out of scope

- Layout changes to `ContextPillRows`.
- Changes to the journey cards or CTAs below the band.
- Tooltip/explanations on individual pills (text-only chips remain).
