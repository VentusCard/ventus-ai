

## Add "Next Best Product" Card with Life-Event-Driven Personalization

### What
Add a prominent **"Next Best Product"** card between the profile summary and category sections in the Financial Journey view. It highlights the #1 scored opportunity with personalized outreach messages driven by **detected life events when available**, falling back to pillar/segment signals otherwise.

### How

**File: `src/components/demo/DemoFinancialJourneyView.tsx`**

1. **New `NextProductCard` component** — rendered after the profile card, before category sections. Takes top opportunity + customer + detectedEvents.

2. **Card layout:**
   - Category color accent (left border)
   - Product name + category badge + confidence bar
   - Top signals with Zap icons
   - Est. annual revenue
   - **Personalized Messages** section with 3 channel previews (Email, SMS, In-App)
   - "Push to Campaign" button per channel (toast on click)

3. **Message generation logic** — `generatePersonalizedMessages(customer, product, signals, detectedEvents)`:
   - **If life events detected**: Use the top event's `event_name` and `talking_points` to craft contextual messages. E.g., "Robert, as you prepare for [Home Purchase], our HELOC could help bridge your down payment..."
   - **Fallback (no life events)**: Use top pillar spending + segment tier. E.g., "Robert, your travel-forward lifestyle suggests Premium Travel could earn you 5x on flights..."
   - Returns `{ email: string; sms: string; inApp: string }` — all deterministic, no API call.

4. **Insert in `CustomerOpportunities`** layout:
   ```
   [Profile Card + Held Products]
   [Next Best Product Card]        ← NEW
   [Category Sections...]
   ```

### Files Modified
- `src/components/demo/DemoFinancialJourneyView.tsx`

