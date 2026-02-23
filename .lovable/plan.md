

# Fix Semantic Deal Search Quality for "coffee machine"

## Problem
The AI returns poor results because the system prompt is too simplistic. For "coffee machine", it should return merchants where you can **buy** a coffee machine (Target, Walmart, Amazon, Best Buy, Williams-Sonoma, Costco) and coffee-related brands (Starbucks, Dunkin') -- not just Dyson because it's labeled "Home Appliances".

## Changes

### 1. Improve the system prompt in the edge function
**File: `supabase/functions/semantic-deal-search/index.ts`**

Update the `systemPrompt` to explicitly instruct the model to think about:
- Where you would **purchase** the searched item (retailers, specialty stores, e-commerce)
- Brands **associated** with the product category (coffee machine -> coffee brands)
- General-purpose retailers that carry the product (Target, Walmart, Costco, Amazon)
- Be generous with matches -- include all plausible merchants rather than being overly conservative

### 2. Add explicit examples to the prompt
Include better few-shot examples in the prompt:
- "coffee machine" -> kitchen stores, general retailers, electronics, coffee brands
- "running shoes" -> athletic wear, sporting goods, department stores
- "birthday gift" -> department stores, toys, flowers, cards

### 3. No frontend changes needed
The previous fix to `AvailableDealsGrid.tsx` correctly handles the loading state. The issue is entirely about the AI returning only 1 poor match instead of 10-15 good ones.

## Technical Details

The key change is in the `systemPrompt` variable within the edge function. The current prompt:
```
Think about intent: "coffee" -> cafes, "gym" -> fitness...
```

Will be replaced with a more detailed prompt that instructs the model to consider purchase intent, brand association, and general retailers -- with explicit examples to calibrate the model's behavior. The model (`gemini-2.5-flash-lite`) is capable of this with better prompting.
