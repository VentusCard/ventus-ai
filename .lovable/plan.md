## Split the Next Steps dialog into two pages

Convert `src/components/ContactFormDialog.tsx` from a single scrolling layout into a 2-page paginated dialog with a small footer pager (Page 1 / Page 2 dots + Next/Back).

### Page 1 — Bank Analytics
- Ventus logo (existing header treatment)
- Headline: "Bank Analytics"
- Subcopy: "Manage everything you've seen so far, and unlock new analytical capabilities."
- Primary CTA pill: "Bank Analytics Dashboard →" (same `/bank-analytics` new-tab link as today)
- "Next →" control bottom-right advances to page 2

### Page 2 — Vision
- Ventus logo header (kept consistent)
- Existing "Banking Today → With Ventus AI" comparison block
- Existing tagline: "The future of banking is smarter and warmer"
- Existing link: `www.ventusai.com`
- "← Back" control bottom-left returns to page 1

### Implementation notes
- Local `useState<1 | 2>(1)` inside the dialog; reset to `1` whenever `open` flips to true (via `useEffect`).
- Pager dots centered at the bottom, Back/Next on the sides, all using existing slate/blue tokens — no new colors.
- Keep dialog width (`sm:max-w-3xl`), background, font, and close-button styling untouched.
- No changes outside this file.
