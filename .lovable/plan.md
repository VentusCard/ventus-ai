## Goal

Differentiate transaction source labels using a **monospace bracket prefix** (`[CARD] Cashback`, `[ACH]`, `[WIRE]`) so the **Cards** vs **Direct funds** grouping reads at a glance — and color stops doing all the work. This also frees up red/saturated colors (currently `Wire` is red, clashing with risk pills; `Travel Card` blue, `Cashback Card` emerald, and `Premium Card` rose all clash with the new pillar palette).

## New label scheme

**Cards** (subtle product-color tint + `[CARD]` prefix + product name):

| Source | Rendered | Color |
|---|---|---|
| Cashback Card | `[CARD] Cashback` | emerald-50/700 |
| Travel Card | `[CARD] Travel` | sky-50/700 |
| Premium Card | `[CARD] Premium` | violet-50/700 |

**Direct funds** (neutral slate, bracket carries the meaning):

| Source | Rendered |
|---|---|
| Checking | `[CHK]` |
| Checks | `[CHECK]` |
| ACH | `[ACH]` |
| Wire | `[WIRE]` |
| Zelle | `[ZELLE]` |
| HSA | `[HSA]` |

All labels render in `font-mono` (or `ui-monospace`) so the bracket prefix reads as a system tag — consistent with the project's "raw transaction string" mono convention.

## Changes

### 1. `src/lib/sampleData.ts` (~lines 490–503)

- Rewrite `SOURCE_COLORS`: cards get pastel tints (emerald/sky/violet), all direct funds get the same neutral slate (`bg-slate-100 text-slate-700 border-slate-200`). No more red/orange/purple competing with risk and pillar pills.
- Add new export `SOURCE_LABELS: Record<string, { prefix: string; name?: string; isCard: boolean }>` with the prefix + display-name mapping above.
- Add helper `getSourceLabel(source)` that returns the entry (with a safe fallback).

### 2. Three render sites — wrap source text in a small inline component

Replace each existing `<span>{tx.source}</span>` with a render that emits:
- `<span class="font-mono text-[10px] opacity-70">[{prefix}]</span>` followed by, only for cards, ` <span class="font-medium">{name}</span>`.
- The outer pill keeps its existing `SOURCE_COLORS` background/border classes (now muted).

Files:
- `src/components/exec-demo/ExecDemoLeftPanel.tsx` (line ~141–143)
- `src/components/exec-demo/ExecDemoSelectionDialog.tsx` (line ~238–239)
- `src/components/exec-demo/ExecDemoEnrichmentTable.tsx` (line ~237–243)

To keep this DRY, add a tiny `SourceTag` component inside `sampleData.ts`'s sibling — actually, define it once in a new file `src/components/exec-demo/SourceTag.tsx` exporting `<SourceTag source={...} size="xs|sm" />`, and import it in all three sites. This keeps prefix/name/color logic in one place for future tweaks.

### 3. Memory

Save a `mem://design/source-label-style` note documenting the bracket-prefix convention so future demos stay consistent.

## Out of scope

- `src/components/demo/DemoEnrichmentTableView.tsx` has its own local `SOURCE_COLORS` constant for a different (legacy) demo. Leave it alone unless asked — it doesn't share the executive-demo pill space.
