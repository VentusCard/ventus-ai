

## Fix Column Alignment in Enrichment Output Table

The table columns are unevenly spaced because they all use minimal `px-1` padding with no defined column widths, letting content dictate sizing inconsistently.

### Changes to `src/components/demo/DemoEnrichmentTableView.tsx`

**Set explicit column widths** via `w-*` or `min-w-*` classes on `<th>` and matching `<td>` elements, and normalize padding to `px-2`:

| Column | Width | Notes |
|--------|-------|-------|
| Merchant | `w-[110px] min-w-[110px]` | Fixed, truncated |
| Amt | `w-[55px] min-w-[55px]` | Right-aligned monospace |
| Date | `w-[80px] min-w-[80px]` | Fixed date format |
| Source | `w-[90px] min-w-[90px]` | Badge width |
| Arrow | `w-[20px]` | Unchanged |
| Pillar | `w-[130px] min-w-[130px]` | Longer badge text |
| Category | `w-[100px] min-w-[100px]` | Truncated |
| Subcategories | `w-[110px] min-w-[110px]` | Wrapped chips |
| Trip | `w-[80px] min-w-[80px]` | Badge or dash |
| Tier | `w-[70px] min-w-[70px]` | Badge |
| Freq | `w-[75px] min-w-[75px]` | Badge |
| Conf | `w-[45px] min-w-[45px]` | Percentage |

- Increase all cell padding from `px-1` to `px-2` for even breathing room
- Increase `min-w` on the outer table from `580px` to `1050px` to prevent column compression
- Increase merchant truncate from `max-w-[80px]` to `max-w-[100px]`

**File**: `src/components/demo/DemoEnrichmentTableView.tsx`

