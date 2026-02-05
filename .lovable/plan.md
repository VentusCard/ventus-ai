
# Fix Text Colors in PreviewTable Component

## Problem

The PreviewTable uses a white background (`bg-white`), but several table elements rely on `text-muted-foreground` or no explicit text color. Since `muted-foreground` is defined as `hsl(0 0% 60%)` (light gray for dark themes), this creates poor contrast on white backgrounds.

## Affected Elements

| Element | Current Styling | Problem |
|---------|-----------------|---------|
| Table headers | `text-muted-foreground` (default) | Light gray on white = poor contrast |
| Amount cells | No color class | Defaults to body color, may be too light |
| Date cells | `text-sm` only | Missing explicit color |
| Zip code cells | `text-sm` only | Missing explicit color |

## Solution

Add explicit `text-slate-700` to table headers and `text-slate-900` to data cells that are missing color classes.

### Changes to PreviewTable.tsx

1. **Table headers** - Add `text-slate-700` override:
```tsx
<TableHead className="text-slate-700">Merchant</TableHead>
<TableHead className="text-slate-700">Description</TableHead>
<TableHead className="text-slate-700">MCC</TableHead>
<TableHead className="text-right text-slate-700">Amount</TableHead>
<TableHead className="text-slate-700">Date</TableHead>
<TableHead className="text-slate-700">Zip Code</TableHead>
```

2. **Amount cells** - Add explicit color:
```tsx
<TableCell className="text-right font-mono text-slate-900">
```

3. **Date cells** - Add explicit color:
```tsx
<TableCell className="text-sm text-slate-700">{transaction.date}</TableCell>
```

4. **Zip code cells** - Add explicit color:
```tsx
<TableCell className="text-sm text-slate-700">
```

## Files to Modify

| File | Change |
|------|--------|
| `src/components/tepilot/PreviewTable.tsx` | Add explicit text colors to headers and cells |

## Result

All text in the PreviewTable will have proper contrast against the white background:
- Headers: `text-slate-700` (dark gray, good for labels)
- Primary data: `text-slate-900` (near black)
- Secondary data: `text-slate-700` (dark gray)
