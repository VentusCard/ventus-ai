
# Fix Text Colors in Enrichment Tab Components

## Problem Analysis

After reviewing the enrichment tab components, I identified several elements using `text-slate-500` which provides insufficient contrast against the white/light backgrounds:

### Issues Found

| Component | Element | Current | Recommended |
|-----------|---------|---------|-------------|
| **ResultsTable.tsx** | Table headers | No explicit color (muted default) | `text-slate-700` |
| **ResultsTable.tsx** | Amount cells | No explicit color | `text-slate-900` |
| **ResultsTable.tsx** | Date cells | `text-sm` only | `text-slate-700` |
| **ResultsTable.tsx** | Subcategory cells | `text-sm` only | `text-slate-700` |
| **ResultsTable.tsx** | Travel colon separator | `text-slate-500` | `text-slate-600` |
| **ResultsTable.tsx** | Tooltip reclassification reason | `text-slate-500` | `text-slate-600` |
| **BeforeAfterTransformation.tsx** | "See AI transformation" text | `text-slate-500` | `text-slate-600` |
| **BeforeAfterTransformation.tsx** | Chart descriptions | `text-slate-500` | `text-slate-600` |
| **BeforeAfterTransformation.tsx** | Tooltip total text | `text-slate-500` | `text-slate-600` |
| **BeforeAfterTransformation.tsx** | MCC/Pillar amounts | `text-slate-500` | `text-slate-600` |
| **BeforeAfterTransformation.tsx** | Flow connection details | `text-slate-500` | `text-slate-600` |
| **EnrichActionBar.tsx** | Processing status text | `text-slate-500` | `text-slate-600` |

## Solution

Apply the same contrast fix pattern used in other TePilot components:
1. Replace `text-slate-500` with `text-slate-600` for descriptive text
2. Add explicit `text-slate-700` to table headers
3. Add explicit `text-slate-900` to primary data cells
4. Add `text-slate-700` to secondary data cells

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/tepilot/ResultsTable.tsx` | Add explicit colors to headers and cells; update slate-500 to slate-600 |
| `src/components/tepilot/insights/BeforeAfterTransformation.tsx` | Update ~10 instances of `text-slate-500` to `text-slate-600` |
| `src/components/tepilot/EnrichActionBar.tsx` | Update 1 instance of `text-slate-500` to `text-slate-600` |

## Technical Changes

### ResultsTable.tsx
- Line 66-75: Add `text-slate-700` to all `TableHead` elements
- Line 91: Add `text-slate-900` to Amount cell
- Line 92: Add `text-slate-700` to Date cell
- Line 114: Change `text-slate-500` to `text-slate-600` (colon separator)
- Line 140: Change `text-slate-500` to `text-slate-600` (tooltip text)
- Line 168: Add `text-slate-700` to Subcategory cell

### BeforeAfterTransformation.tsx
- Line 71: Change `text-slate-500` to `text-slate-600`
- Lines 93, 109, 155: Change chart description `text-slate-500` to `text-slate-600`
- Lines 126, 130: Change tooltip `text-slate-500` to `text-slate-600`
- Lines 174, 177, 204, 207: Change flow details `text-slate-500` to `text-slate-600`

### EnrichActionBar.tsx
- Line 40: Change `text-slate-500` to `text-slate-600`

## Result

All text in the enrichment tab will have proper contrast against light backgrounds, matching the improved contrast levels in the preview tab and other TePilot components.
