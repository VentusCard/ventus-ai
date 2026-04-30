## Step 3 polish

Two tweaks to `src/pages/Pricing.tsx`:

1. **Add field labels** above each Step 3 input (Contact name, Contact email, Notes (optional)) — same `text-[11px] uppercase tracking-wide` style used in Step 1.
2. **Move the primary CTA out of the card.** Remove the "Copy summary" button entirely. Render a single "Email draft to prospect" button as a row *below* the Step 3 card, right-aligned, slightly larger (h-10).

`handleCopy` and the `Copy` icon import become unused — remove them.

No layout, logic, or other section changes.
