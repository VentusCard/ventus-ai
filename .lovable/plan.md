

## Flatten Wizard to Single Page + Add Eligibility Step

### Changes to `src/components/tepilot/insights/LocationExperienceManager.tsx`

**1. Add eligibility fields to data model**
- Extend `LocationPerk` with: `eligibility: { wealthTiers: string[]; ageRestriction: string; customRules: string }`
- Wealth tier options: "All Clients", "Mass Market", "Affluent", "HNW", "UHNW"
- Age restriction options: "No Restriction", "18+", "21+", "55+", "65+"
- `customRules` free-text for any additional applicability notes
- Update `EMPTY_PERK` and `INITIAL_PERKS` with default eligibility values

**2. Convert multi-step wizard to single scrollable page**
- Remove the step state, step indicator dots, and step-based conditional rendering
- Show all sections on one page inside the dialog, separated by section headers (styled like the current step labels):
  - **Section 1 — Location & Type**: City, State, Category chips (unchanged)
  - **Section 2 — Experience Details**: Title, Tagline, Description, Partner, Value, Member Tier, Dates, Link (unchanged)
  - **Section 3 — Eligibility & Restrictions** (new): Wealth tier multi-select chips, Age restriction dropdown, Custom rules textarea
- Remove Back/Next navigation; keep only Cancel + Save buttons at the bottom

**3. Update perk cards**
- Show eligibility info as small badges (e.g., "HNW Only", "21+") alongside existing badges

**4. All inputs keep `!text-slate-900`** for dark text

### Files modified
- `src/components/tepilot/insights/LocationExperienceManager.tsx`

