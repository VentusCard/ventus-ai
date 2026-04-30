## Goal

Keep the current single-column vertical flow (Step 1 → Step 2 → Step 3) but compress everything so the entire `/pricing` page fits in one ~887px viewport with no page scroll. The module list is the only place that may scroll internally if needed.

## Layout (unchanged structure, tightened density)

```text
┌──────────────────────────────────────────────────┐
│ Header (h-12) — Ventus | Pricing Builder [Admin] │
├──────────────────────────────────────────────────┤
│ STEP 1 · Prospect — Who are we pricing for?      │
│ Bank name [______]    Customers [______]         │
├──────────────────────────────────────────────────┤
│ STEP 2 · À la carte menu       3 of 8 selected   │
│  table header                                    │
│  row · row · row · row …  (flex-1, scroll inside)│
│  Fixed | Per-user | $/cust |   TOTAL / yr        │
├──────────────────────────────────────────────────┤
│ STEP 3 · Send draft                              │
│ Name [__]  Email [__]  Notes [____]              │
│                       [Copy] [Email draft →]     │
└──────────────────────────────────────────────────┘
```

## Density changes

- Page wrapper: `h-screen overflow-hidden flex flex-col`; `<main>` uses `flex-1 min-h-0` with `flex flex-col gap-3` so Step 2 can flex and own the only scroll area.
- Header: `h-16` → `h-12`.
- Container: keep `max-w-5xl` and single column. Outer vertical padding `py-10` → `py-3`, section gap `space-y-8` → `gap-3`.
- Section cards: padding `p-8` → `px-5 py-3`; rounded `2xl` → `xl`.
- Step 1: collapse step label + heading into one row; inputs `h-12` → `h-9`; drop the "1,000,000 customers" helper line (number is already in the field).
- Step 2: header row condensed to one line; module list gets `flex-1 min-h-0 overflow-y-auto`; rows `py-4` → `py-2`, description clamped to one line, font sizes `text-[15px]` → `text-[13px]`. Totals footer collapsed into a single inline strip (`py-2.5`) with the grand total on the right.
- Step 3: name + email + notes laid out in a 3-column grid (notes spans 1 col, single-line height ~`h-9` via `Input` instead of `Textarea`-tall, or `Textarea` with `min-h-[40px]`). Buttons share a single right-aligned row, `h-9`. "Email draft to prospect" stays the blue primary CTA.

## Files

- `src/pages/Pricing.tsx` — re-layout only: heights, paddings, gaps, internal scroll on the module list, condensed totals strip, compact Step 3. No changes to logic, state, calculations, password gate, Admin dialog, or Email dialog.

## Preserved

- Vertical single-column flow with three labeled steps.
- All handlers (`toggle`, `handleCopy`, `handleEmail`), summary/email body builders.
- Strict light theme via `LIGHT_INPUT` on every input.
- `SimplePasswordGate`, `AdminFeeEditorDialog`, `EmailDraftDialog`.

## Out of scope

- Mobile/tablet: below `lg`, page may scroll (acceptable per desktop-only demo rule).
- Catalog data and pricing math.
