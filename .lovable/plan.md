

## Widen Left Panel + Add Category Labels to Transaction Rows

### Changes

**1. `src/pages/ExecDemoPage.tsx` — Widen left column**
- Change grid template from `grid-cols-[320px_1fr_360px]` to `grid-cols-[400px_1fr_360px]`

**2. `src/components/exec-demo/ExecDemoLeftPanel.tsx` — Add category label to TxRow**

Update the `TxRow` component to accept a new optional `categoryLabel` prop. When present (post-enrichment), render the category name in the pillar color after the amount, right-aligned.

```
// TxRow additions:
- New prop: categoryLabel?: string
- After the amount span, add:
  {categoryLabel && pillarColor && (
    <span className="text-[8px] font-semibold shrink-0 truncate max-w-[90px]"
      style={{ color: pillarColor }}>
      {categoryLabel}
    </span>
  )}
```

**3. Same file — Pass category label from signalMap in all post-enrichment render paths**

In the `showCollected` block (both filtered and unfiltered paths), pass `categoryLabel={signalMap?.[i]?.label}` to each `TxRow`.

**4. Same file — Darken post-enrichment text (from prior approved plan)**
- Base text color: `#334155` → `#0f172a` (near-black)
- Date text: `#64748b` → `#334155`
- Pillar border opacity: `40` → `80`
- Pillar dot: `w-1.5` → `w-2`
- In `showCollected` unfiltered path: render all rows as `dim={false}` (remove grey-out of uncollected rows)

### Files to edit
- `src/pages/ExecDemoPage.tsx` — one line change for column width
- `src/components/exec-demo/ExecDemoLeftPanel.tsx` — TxRow enhancement + text darkening

