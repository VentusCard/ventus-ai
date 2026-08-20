# Segment header bar: metrics left, exports right

When a segment is active in the Segments sub-tab, the search card becomes a working segment header: live counts sit to the left of the search input, export actions sit to the right.

## What changes

In the Segments view (`CustomersDirectoryView` → `CustomerSearchBar`), the search row becomes a three-part row:

```text
[ 128 customers · 412 signals · $54.2M value ]  [ search input ]  [ Export CSV ] [ ⋯ ]
```

- Left metric cluster (only when a segment is active or filters are applied):
  - matched customers
  - total signals across matches
  - share of the book (matches / total directory, %)
  - combined relationship value
  Rendered as compact stat chips, wrapping under the input on narrow widths.
- Right export cluster:
  - Primary "Export CSV" button — downloads the currently filtered customer list (name, email, city, segment, tier, products, signal counts, value).
  - A dropdown next to it for "Copy as JSON" and "Copy customer list" (clipboard), with a toast confirmation.
  - Disabled with a tooltip when the filtered list is empty.
- The search input keeps its dropdown suggestions and stays centered; the filter chips row below is unchanged.
- The existing "N customers · N signals / Clear all" strip above the results table is removed, since those numbers now live in the header row.

## Technical notes

- `CustomerSearchBar` gains props: `filtered: DirectoryCustomer[]`, `totalCount: number`, and `onExport`-style handlers; metrics are computed in `CustomersDirectoryView` (reusing `totalSignals` from `CustomerResultsTable`) and passed down.
- Export is a local client-side CSV builder over the filtered `DirectoryCustomer[]` (Blob + object URL download), file named from the active segment label; no new dependency and no change to `src/lib/segmentExportUtils.ts` (that path is campaign-specific).
- Uses `sonner` toast, shadcn `Button`/`DropdownMenu`, strict light theme (white surfaces, slate-200 borders), no `dark:` utilities.
- Purely presentational + local export; filtering logic and segment seeding stay as-is.
