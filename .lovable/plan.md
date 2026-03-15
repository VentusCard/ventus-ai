

# Enhance Ventus AI Engine Profile with Frequency, Tier, and Temporal Patterns

## What Changes

Enhance the `buildEnrichedProfile` function in `DemoEngineProfileView.tsx` to produce a richer, truly dynamic profile by mining the `spending_tier`, `purchase_frequency`, and `date` fields already present on every `EnrichedTransaction`.

## New Profile Sections

### 1. `spending_intelligence` — Tier-Qualified Behavioral Signals
Aggregate spending tier per pillar/subcategory to produce human-readable insights like:
- `"premium_sports_equipment_buyer"`
- `"budget_traveler"`
- `"standard_dining"`

Structure:
```json
"spending_intelligence": {
  "tier_profile": [
    { "pillar": "Sports & Outdoors", "dominant_tier": "Premium", "avg_spend": "$342", "insight": "Purchases premium sports equipment consistently" },
    { "pillar": "Travel", "dominant_tier": "Budget", "avg_spend": "$89", "insight": "Budget-conscious traveler, prefers value options" }
  ]
}
```

### 2. `temporal_patterns` — Seasonal and Frequency Analysis
Parse transaction dates to detect monthly clustering and combine with `purchase_frequency` to generate seasonal behavioral narratives:
- Group transactions by month, identify peak months per pillar
- Produce insights like `"Sports spending peaks May–Nov"`, `"Travel clusters in March"`

Structure:
```json
"temporal_patterns": {
  "seasonal_behaviors": [
    { "pillar": "Sports & Outdoors", "peak_months": ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"], "frequency": "Monthly", "narrative": "Purchases premium sports equipment every May–Nov" },
    { "pillar": "Travel", "peak_months": ["Mar"], "frequency": "Occasional", "narrative": "Budget travels every March" }
  ],
  "monthly_activity_heatmap": { "Jan": 4, "Feb": 6, ... }
}
```

### 3. `dynamic_profile_summary` — Natural Language Array
Combine tier + temporal + pillar data into plain-English behavioral statements at the top level:
```json
"dynamic_profile_summary": [
  "Purchases premium sports equipment every May–Nov",
  "Budget traveler with occasional trips in March",
  "Weekly dining at standard-tier restaurants",
  "Premium wellness spending year-round"
]
```

## Technical Approach

**Single file change**: `src/components/demo/DemoEngineProfileView.tsx`

- In `buildEnrichedProfile`, add logic to:
  1. **Tier aggregation**: For each pillar, tally `spending_tier` values, pick the dominant one
  2. **Month clustering**: Parse `t.date`, bucket by month per pillar, find peak months (months with above-average tx count for that pillar)
  3. **Frequency mode**: For each pillar, pick the most common `purchase_frequency` value
  4. **Narrative builder**: Combine tier + peak months + frequency into a sentence (e.g., "Purchases premium sports equipment every May–Nov")
- Insert these three new sections into the returned profile object between `behavioral_patterns` and `life_events_detected`

No new dependencies, no database changes, no edge function changes. All data is already available on the `EnrichedTransaction` type.

