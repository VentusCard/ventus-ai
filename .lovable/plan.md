# Replace "Bank of America" with "Our Bank" in /demo product generation

The /demo experience uses a single edge function that hardcodes Bank of America as the reference brand for generated product cards and chat suggestions. We'll swap all of those mentions to a generic "Our Bank" so output reads like "Travel Rewards Card from Our Bank".

## Changes

### 1. `supabase/functions/generate-product-cards/index.ts`
Rewrite the system-prompt section that references real BoA products (lines ~50–98 and ~131, 259) so the LLM:
- Uses generic product names prefixed with "Our Bank" (e.g., "Our Bank Travel Rewards Card", "Our Bank Premium Rewards Card", "Our Bank Customized Cash Rewards Card", "Our Bank Advantage Savings", "Our Bank Home Equity Line of Credit", "Our Bank Mortgage", "Our Bank Business Advantage Card").
- Wellness/distress products become "Our Bank SafeBalance Account Controls", "Our Bank Account Wellness Tools", "Our Bank Hardship Assistance Program", "Our Bank Balance Assist Short-Term Loan", etc.
- Removes the ® symbols and "Merrill Edge" branding (replace with "Our Bank Investing").
- Replaces phrases like "BoA-style product features" with "bank-grade product features".
- Replaces "Adapt the product name to match what Bank of America actually offers" with "Use the 'Our Bank' prefix on every product name; keep naming conventions clean and consumer-friendly".

### 2. Memory update
Update `mem://technical/edge-functions/product-card-generation` to reflect that the function uses a generic "Our Bank" reference rather than Bank of America branding, so future edits don't reintroduce BoA names.

## Out of scope
- No UI component changes — products are rendered from the LLM output as-is.
- Other edge functions (`generate-next-offers`, `consumer-chat`, `advisor-chat`, etc.) contain no BoA references and need no changes.
