

## Mutually Exclusive Transactions + Updated Card Messaging

### Problem
Currently, the 3 intelligence cards share overlapping `txIndices` (e.g., indices 0 and 1 appear in all three cards for Michael R.). The user wants each card to highlight a distinct, non-overlapping set of transactions. Additionally, the card content/takeaways need updating:
- **Analytics**: Recommend a new **product** with personalized messages
- **Rewards**: Recommend new **deals** with hyper-personalized messages

### Data Changes (EnrichmentMockup.tsx)

**Michael R. — Transaction Index Redistribution:**
- Analytics Intelligence: `[0, 1, 2, 3, 4, 5]` (Home Depot, Lowe's, Pottery Barn, Restoration Hardware, Ferguson, Sherwin-Williams) — renovation cluster
- Smart Rewards: `[6, 7, 8, 9]` (Vail Resorts, United Airlines, Delta Sky Club, Marriott) — travel cluster
- Relationship Intelligence: `[10, 11, 12, 13, 14, 15, 16, 17, 18]` or a curated subset — remaining lifestyle (groceries, health, decor)

**Michael R. — Updated Card Content:**
- Analytics: "Recommend Premium Home Equity Line — renovation spend pattern detected across 6 transactions. Personalized pre-approval message ready."
- Rewards: Pills updated to travel-specific deals: "Delta SkyMiles 3x", "Marriott Elite Match", "United Lounge Pass", "Vail Season Deal"
- Relationship Intelligence: kept as life-event detection (unchanged concept)

**Sarah & David L. — Transaction Index Redistribution:**
- Analytics Intelligence: `[0, 1, 2, 3, 4]` (Buy Buy Baby, Amazon Baby Registry, Pottery Barn Kids, Hanna Andersson, Carter's) — baby cluster
- Smart Rewards: `[5, 6, 7, 8, 9]` (Whole Foods, Instacart, DoorDash, Sweetgreen, Blue Apron) — food/delivery cluster
- Relationship Intelligence: `[10, 11, 12, 13, 14, 15, 16, 17, 18]` — health + financial planning

**Sarah & David L. — Updated Card Content:**
- Analytics: "Recommend Family Rewards Card — baby-related spend is 40% of wallet. Personalized upgrade offer queued."
- Rewards: Pills updated to food/delivery deals: "Whole Foods 5% Back", "Instacart Free Delivery", "DoorDash DashPass", "Blue Apron Family Plan"
- Relationship Intelligence: "Life Event: New Baby detected from health and planning transactions. Family financial package sent to advisor."

### Summary of Changes
Only `src/components/hero/EnrichmentMockup.tsx` is modified:
1. Update `txIndices` arrays for cards 1-3 in both customer profiles to be mutually exclusive
2. Update `content` strings for Analytics cards to emphasize product recommendation with personalized messaging
3. Update `pills` arrays for Rewards cards to reflect hyper-personalized deal recommendations matching the new exclusive transaction sets
4. Update Relationship Intelligence content to reference the correct remaining transactions

