## Goal
Make sure AI-generated lifestyle signals always include the obvious, baseline consumer spending behaviors for the product — not just clever edge signals. E.g. a travel rewards card must surface flights, hotels, rental cars, rideshare to airport, etc.

## Change
Edit `supabase/functions/generate-lifestyle-signals/index.ts` system + user prompt:

1. **Add a "baseline coverage" rule**: The first 2–3 signals MUST be the most obvious consumer spending categories the product directly rewards/serves. Then add more nuanced/behavioral signals after.

2. **Add per-product baseline examples** in the prompt:
   - Travel rewards card → flights booked, hotel stays, rental cars, rideshare/taxis, restaurant spend abroad
   - HELOC → home improvement spend, contractor payments, big-box hardware runs
   - 529 plan → daycare/tuition payments, kids' activity spend
   - Auto loan → dealer visits, vehicle service spend, gas stations
   - Cashback card → grocery, gas, streaming subscriptions
   - Mortgage → rent payments, real estate agent fees, moving services
   - Checking upgrade → direct deposit payroll, recurring bills

3. **Silent-checklist addition**: "Does this set include the obvious top-of-mind spending categories a customer would expect this product to reward? If not, add them first."

4. **Keep all prior rules**: consumer perspective (no fee/leakage/interchange terms), product-specific phrasing, banned generic labels, tone constraints (≤18 words, no em dashes, no exact $).

## Out of scope
Frontend, segment generation, other edge functions.

## Validation
Re-run for travel rewards card; confirm output leads with flights/hotels/rental cars before more nuanced signals.