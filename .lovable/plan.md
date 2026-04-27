
# Better use of space in the Behavioral Intelligence table view

The current `/demo` table view (after Behavioral Intelligence is triggered) reads small on a 1355×887 (and larger) screen: 10–10.5px body text, 9–9.5px badges, narrow column widths, and the pill cluster sitting in a cramped half-column above the table. We have ~1900px of horizontal real estate when the panel is at full width — let's actually use it.

## Changes (scoped, visual only)

### 1. Pills cluster header — `src/components/exec-demo/ExecDemoIntelPanel.tsx`

- Bump section header (`Behavioral Intelligence: Personas = …`) from `text-lg` to `text-xl` and tighten bottom margin so it doesn't waste a full line of vertical space.
- Group labels (`SPENDING HABITS`, `LIFE EVENT DETECTION`, `RISK FACTORS`): bump from `text-[11px]` → `text-[12px]`, slightly tighter top margins between the three groups (`mt-3` → `mt-2.5`) so all three groups + the table fit without scroll on a 900px viewport.
- Pills themselves: keep `text-[12px]` font-size but trim vertical padding (`py-2` → `py-1.5`) and meta-text from `text-[10px]` → `text-[11px]` for legibility. Net: pills get shorter but the numbers inside read better.
- Remove the persona-card border/background when in `fullWidthEnrichment` mode (already done) and drop the panel's outer `py-3` → `pt-2 pb-1` so the pills hug the top.

### 2. Enrichment table — `src/components/exec-demo/ExecDemoEnrichmentTable.tsx`

Goal: text jumps from ~10px to ~12px without requiring horizontal scroll, by widening columns to fill the available width.

- Bump base cell text from `text-[10.5px]` → `text-[12px]` (date, merchant, amount, category).
- Bump badge text from `text-[9–9.5px]` → `text-[10.5–11px]` (source pill, MCC, pillar, tier, freq, subcategories).
- Bump column header text from `text-[10px]` → `text-[11px]`; bump grouping header (`Raw Transaction` / `Ventus Enriched`) from `text-[10px]` → `text-[11px]`.
- Bump row vertical padding from `py-1` → `py-1.5` so the larger text doesn't feel cramped.
- Widen columns proportionally and drop `min-w-[1180px]` → `min-w-[1480px]` so the table fills wide screens and only scrolls on smaller ones:
  - `merchant` 130 → 170, `description` 170 → 220, `pillar` 130 → 150, `category` 110 → 140, `subs` 130 → 160, `tier` 75 → 90, `freq` 80 → 95, `source` 95 → 110, `date` 70 → 90, `amount` 60 → 75, `mcc` 55 → 65.
- Update the matching `truncate max-w-[…]` values on merchant (120→160), description (160→210), and category (110→135).
- "Showing N of M for …" strip: bump from `text-[11px]` → `text-[12px]` and `py-1.5` → `py-2`.

### 3. Page-level table card — `src/pages/ExecDemoPage.tsx`

- When the table view is shown, give the surrounding card the full available width (it already uses `fullWidthEnrichment`); just make sure the outer wrapper has zero horizontal padding and the close-button row uses the same horizontal rhythm (no change to logic, only spacing classes if needed after a quick check).

## Acceptance

- All three pill groups (Spending Habits / Life Events / Risk) remain visible above the table without vertical scroll on the user's current 1355×887 viewport.
- Table body text is comfortably readable from across a desk (~12px); badges read at a glance (~11px).
- Table fills the panel horizontally on screens ≥1480px wide; horizontal scroll only kicks in on narrower viewports.
- Highlight/dim behavior, pill click → row sort, and the "Showing N of M" strip continue to work unchanged.
