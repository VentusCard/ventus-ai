

## Typography & Color Consistency Pass for Stage Readability

**File: `src/components/demo/DemoNetworkDiagram.tsx`**

### Problem
Font sizes are inconsistent across elements (bank labels 9/11px vs consumer labels 10/12px), column headers are too small (9/11px), and secondary text uses slate-400 which washes out on projectors.

### Unified Size Scale (normal / centered)

| Element | Current | Proposed |
|---------|---------|----------|
| Column headers | 9 / 11px | 11 / 13px |
| Pillar questions | 9 / 11px | 12 / 14px |
| Engine title | 12 / 14px | 14 / 16px |
| Engine "V" | xl / 2xl | 2xl / 3xl |
| Engine capabilities | 10 / 12px | 12 / 13px |
| Bank node labels | 9 / 11px | **12 / 13px** |
| Bank node check/status | 8 / 9px | 10 / 11px |
| Consumer node labels | 10 / 12px | **13 / 14px** |
| Consumer node status | 8 / 10px | 11 / 12px |
| TX card name | 11 / 13px | 13 / 15px |
| TX card stats | 9 / 11px | 11 / 12px |
| TX card empty label | 11 / 13px | 13 / 14px |
| TX card initials | 9 / 11px | 11 / 12px |

### Color Adjustments
- Column headers: `text-slate-400` → `text-slate-500` (better projector contrast)
- Bank node check/status: `text-slate-400` → `text-slate-500`
- Consumer node status text: `text-slate-400` → `text-slate-500`
- TX card stats line 1: `text-slate-600` stays (good contrast)
- TX card stats line 2: `text-slate-400` → `text-slate-500`
- TX card empty label: `text-slate-400` → `text-slate-500`
- Engine capability idle color: `#64748b` stays

### Principle
Every text element bumps up ~2px uniformly. Bank and consumer node labels now follow the same relative hierarchy. Secondary/meta text shifts from slate-400 to slate-500 throughout for projector visibility.

