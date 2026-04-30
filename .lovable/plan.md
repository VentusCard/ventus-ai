## Redesign /pricing as a vertical 3-step flow

Replace the current 2-column layout with a single-column, top-to-bottom flow inside a max-w-5xl container. Strict light theme preserved.

### Section 1 — Prospect (Step 1)

White card. Two large inputs side-by-side:

- **Bank name**
- **Number of customers** (with formatted "1,000,000 customers" helper text below)

### Section 2 — À la carte menu (Step 2, main section)

White card containing a table-style list. Each module is a clickable row with columns:

Function | Description | Fixed / yr | Per user / yr | Line total / yr | Add | 

- Column header strip (slate-50, uppercase tiny labels).
- Click a row to toggle inclusion (checkbox right, blue tint when selected, blue line total).
- Sticky totals strip at the bottom of the card: Fixed fees · Per-user fees · $/customer/yr · **Total / year** (large, right-aligned).
- Mobile fallback: rows collapse, labels prefix the numbers.

### Section 3 — Send draft (Step 3)

White card with:

- Contact name + Contact email (side-by-side)
- Notes textarea (full width)
- Footer row: "Copy summary" (outline) on the left, **"Email draft to prospect"** as a prominent **blue** primary CTA (`bg-blue-600`) on the right.

### Top bar (unchanged)

Ventus wordmark + "Pricing Builder" label + Admin gear button (top-right).

### Removed / repurposed

- `PricingSummary` component is no longer used on the page (totals now live inline in Section 2 footer). File can be left in place but unimported.
- `ModuleCard` component is no longer used (replaced by inline table rows). File can be left in place.

### Files

- **Edit**: `src/pages/Pricing.tsx` — rewrite layout to vertical 3-section flow.
- No other files change. `AdminFeeEditorDialog` and `EmailDraftDialog` stay as-is.

All inputs/textareas keep the explicit light styling (`bg-white text-slate-900 border-slate-200 placeholder:text-slate-400`) per the pricing light-theme rule.