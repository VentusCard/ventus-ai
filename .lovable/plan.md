

## Goal

Update persona synthesis to generate more explicit, pattern-based labels that describe the actual behavioral cadence (e.g., "Annual", "Seasonal", "Weekly") rather than abstract lifestyle descriptors.

## Changes required

**`supabase/functions/synthesize-persona/index.ts`** — Update the system prompt:

1. **Add explicit pattern instruction**: Require labels to incorporate the temporal/cadence pattern directly into the rollup name (e.g., "Annual Hawaiian Vacations", "Seasonal Tennis & Ski", "Weekly Dining Out").

2. **Replace abstract phrasing**: Guide the model away from vague lifestyle terms like "Enthusiast", "Lover", "Fan", "Devotee" and toward concrete activity descriptors.

3. **Enforce cadence inclusion**: When dates show clear patterns (annual, seasonal, weekly), the label must include that pattern explicitly rather than burying it in implied language.

### Prompt additions

After line 93 ("Never mention brand or merchant names..."), add:

```text
- **Pattern-forward naming**: Labels must explicitly state the behavioral pattern when cadence is clear. Use formats like:
  - "[Frequency] [Activity]" → "Annual Hawaiian Vacations", "Weekly Workday Coffee Runs"
  - "[Activity] [Pattern]" → "Tennis & Ski Seasonal Sports", "Casual Dining Regular"
  - "[Season] [Activity]" → "Winter Ski Trips", "Summer Coastal Travel"
- Avoid abstract lifestyle descriptors like "Enthusiast", "Fan", "Lover", "Buff", "Aspirant" — use concrete activity terms instead.
```

Update the existing cadence guidance (line 95) from:
> "bake it into the label naturally — 'workday coffee runs', 'weekly grocery runs', 'annual hawaii trips'"

To:
> "explicitly encode cadence in the label — 'Annual Hawaiian Vacations' (not 'Hawaii Vacationer'), 'Tennis & Ski Seasonal Sports' (not 'Alpine & Court Enthusiast'), 'Weekly Workday Coffee Runs'."

### Verification

1. Re-run analysis on a customer with Hawaii travel → label should read "Annual Hawaiian Vacations" or similar pattern-based name.
2. Customer with mixed sports (ski + tennis) → label should read "Tennis & Ski Seasonal Sports" or similar.
3. Verify "Enthusiast", "Vacationer", "Lover" no longer appear in generated rollups.

