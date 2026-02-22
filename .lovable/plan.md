

# Semantic Campaign Intent Input with Auto-Selection

## Overview
Replace the "Campaign Goal" chip selector with a full-width semantic text input above the two-column layout. Users type natural language like "I want to cross sell high spenders in cashback cards with a wealth management account with a theme of long term financial wellness" and the system uses AI to:
1. Parse the intent into structured dimensions (pillars, products, strategies, goal, etc.)
2. Auto-select the corresponding chips in the left panel
3. Auto-generate the campaign brief in the right panel

## Layout Change

```text
[Header with metrics badges]

[Full-width Semantic Intent Input]
  Textarea + "Interpret & Build" button
  Shows parsed intent chips after processing

[Two-column resizable layout]
  LEFT: Presets | Saved | Pillars | Life Events | Products | Geo | Demo | Strategies | Audience
  RIGHT: AI Campaign Brief Preview
```

## What Gets Built

### 1. New Edge Function: `parse-campaign-intent`
Calls `google/gemini-2.5-flash` (fast, cheap) with a structured tool call to extract:
- `campaign_goal`: one of the 8 goal IDs
- `lifestyle_pillars`: array of matching pillar names
- `life_events`: array of matching event IDs
- `products_has`: array of product names the user wants to target holders of
- `products_lacks`: array of product names the user wants to cross-sell (customer doesn't have)
- `cross_sell_strategies`: array of matching strategy IDs
- `upsell_strategies`: array of matching strategy IDs
- `regions`: array of region names if mentioned
- `age_ranges`: array if mentioned
- `income_bands`: array if mentioned
- `summary`: one-line summary of interpreted intent

The system prompt includes the full list of valid values for each dimension so the AI maps accurately.

### 2. New Component: `SemanticIntentInput.tsx`
Full-width section placed between the header and the main studio card:
- A `Textarea` with placeholder: "Describe your campaign target... e.g. 'cross sell high spenders in cashback cards with wealth management, theme of financial wellness'"
- A "Interpret & Build" button with Sparkles icon (disabled when empty, shows loading spinner while processing)
- After successful parsing, shows a row of small parsed-intent badges (e.g., "Goal: Cross-Sell", "Has: Cashback", "Lacks: Managed Portfolio", "Pillar: Financial & Aspirational") so the user sees what was understood
- A small "Clear" link to reset

### 3. Modify `CampaignStudio.tsx`
- Remove `CampaignGoalSelector` from the left column
- Add `SemanticIntentInput` between the header and the main `Card`
- The `SemanticIntentInput` receives a callback `onIntentParsed` that sets all the dimension state at once (pillars, products, strategies, goal, life events, demographics)
- After state is set, automatically trigger `handleGenerate()` to generate the campaign brief
- The left panel chips update reactively since they're driven by the same state

### 4. Modify `supabase/config.toml`
- Add `[functions.parse-campaign-intent]` with `verify_jwt = false`

## Files

| File | Action | Purpose |
|---|---|---|
| `supabase/functions/parse-campaign-intent/index.ts` | Create | Edge function to parse natural language into structured dimensions using Gemini 2.5 Flash |
| `src/components/tepilot/campaigns/SemanticIntentInput.tsx` | Create | Full-width textarea + button + parsed badges display |
| `src/components/tepilot/campaigns/CampaignStudio.tsx` | Modify | Add SemanticIntentInput above main card, remove CampaignGoalSelector from left column, wire up onIntentParsed callback that sets all state and triggers brief generation |
| `supabase/config.toml` | Modify | Add parse-campaign-intent function config |

## Technical Details

### Edge Function: `parse-campaign-intent`
- Model: `google/gemini-2.5-flash` (optimized for speed -- this is a parsing task, not creative)
- Tool call: `parse_intent` with structured output matching all dimension fields
- System prompt includes exhaustive valid values:
  - All 12 lifestyle pillars
  - All 7 life event IDs
  - All 44 product names
  - All 6 cross-sell and 5 upsell strategy IDs
  - All 8 campaign goal IDs
  - Region names, age ranges, income bands
- The AI maps fuzzy user language ("high spenders", "wealth management") to exact catalog values ("Cashback" as has-product, "Managed Portfolio" as lacks-product, "Financial & Aspirational" as pillar, "cross_sell" as goal)

### `SemanticIntentInput` Component
Props:
- `onIntentParsed(result)`: callback with the parsed structured output
- `isProcessing`: boolean for loading state

Internal state:
- `inputText: string` -- the textarea value
- `parsedResult`: the structured output from the edge function (shown as badges)
- `isLoading`: boolean

Renders:
- A gradient-bordered card with a `Textarea` (3 rows, auto-resize)
- "Interpret & Build" button (primary, with Sparkles icon)
- After parsing: a flex-wrap row of small color-coded badges showing each parsed dimension
- "Clear" text button to reset input and parsed state

### State Flow in `CampaignStudio`
When `onIntentParsed` fires:
1. Set `campaignGoal` from `result.campaign_goal`
2. Set `selectedPillars` from `result.lifestyle_pillars`
3. Set `lifeEventCriteria.eventTypes` from `result.life_events`
4. Build `selectedProducts` from `result.products_has` (as 'has') and `result.products_lacks` (as 'lacks')
5. Set `crossSellStrategies` from `result.cross_sell_strategies`
6. Set `upsellStrategies` from `result.upsell_strategies`
7. Set `selectedRegions` from `result.regions` if present
8. Set demographic age ranges/income bands if present
9. Call `handleGenerate()` after a short delay (via `setTimeout` or `useEffect`) to auto-generate the brief

### Campaign Goal Display
Since the `CampaignGoalSelector` is removed from the left column, the parsed campaign goal will show as one of the badges in the `SemanticIntentInput` output row. Users can still manually change individual chips in the left panel after the AI auto-selects them.

