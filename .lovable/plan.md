

## Color-Code Source Badges

Add a shared color mapping for card/account source types and apply it to the source badges in both `PreviewTable` and `ResultsTable`.

### Color Map

| Source | Colors |
|--------|--------|
| Cashback Card | Green (bg-emerald-500/10, text-emerald-700, border-emerald-500/20) |
| Travel Card | Blue (bg-blue-500/10, text-blue-700, border-blue-500/20) |
| Premium Card | Purple (bg-purple-500/10, text-purple-700, border-purple-500/20) |
| Checking | Slate (bg-slate-500/10, text-slate-700, border-slate-500/20) |
| HSA | Amber (bg-amber-500/10, text-amber-700, border-amber-500/20) |
| Unknown/other | Default gray |

### Files to Modify

**1. `src/lib/sampleData.ts`** (or a small new utility)
- Add a `SOURCE_COLORS` constant mapping source names to their badge class strings
- Export it for use in both tables

**2. `src/components/tepilot/PreviewTable.tsx`**
- Import `SOURCE_COLORS`
- Replace the plain `text-slate-600 border-slate-300` badge styling with the color-coded classes based on `transaction.source`

**3. `src/components/tepilot/ResultsTable.tsx`**
- Import `SOURCE_COLORS`
- Replace the plain source badge styling with color-coded classes

### Technical Detail

A helper function like:
```ts
const getSourceColor = (source: string) =>
  SOURCE_COLORS[source] ?? "bg-slate-100 text-slate-600 border-slate-300";
```

Will be used in both table components to apply the correct badge className.

