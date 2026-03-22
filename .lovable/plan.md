

## Edit the Add/Edit Experience Dialog

### Problem
The current add/edit dialog needs updates to match the campaign-creation-style flow described earlier: add new fields (tagline, dates, link), use a multi-step wizard layout, and ensure all input text is dark-colored.

### Changes to `src/components/tepilot/insights/LocationExperienceManager.tsx`

**1. Expand the data model** — Add `tagline`, `startDate`, `endDate`, and `link` fields to the `LocationPerk` interface and update `EMPTY_PERK` and `INITIAL_PERKS` with sample values.

**2. Multi-step wizard dialog** — Replace the single-page form with a 3-step flow inside a wider dialog (`max-w-2xl`):
- **Step 1 — Location & Type**: City/State inputs + category selector displayed as clickable icon chips (using existing `CATEGORY_CONFIG` colors) instead of a dropdown.
- **Step 2 — Experience Details**: Title, Tagline, Description, Partner, Value, Member Tier, Start Date, End Date, and Link (URL) fields.
- **Step 3 — Review**: Summary card showing all entered info with category icon, city badge, tier badge, and dates. "Save Experience" button to confirm.

A step indicator (numbered dots/bar) at the top of the dialog. Back/Next navigation buttons at the bottom.

**3. Dark text on all form fields** — Add `!text-slate-900` to every `Input`, `Textarea`, and `SelectTrigger` in the dialog so text is clearly visible.

**4. Update perk cards** — Show tagline (italic, below title), date range (small badge), and link (external-link icon button) on existing cards.

### Files modified
- `src/components/tepilot/insights/LocationExperienceManager.tsx` — All changes in this single file.

