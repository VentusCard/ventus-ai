

## ✅ Trip-Fare Matching: Active Flight-to-Trip Assignment (Completed)

Implemented two-phase trip resolution:
1. AI prompt expanded with FLIGHT-TO-TRIP MATCHING section (price signal, date proximity, fare pairs, surplus fares)
2. Tool schema expanded with `fare_match_confidence`, `fare_match_reason`, `third_party_likely`
3. Post-processing `reconcileFlightsWithTrips()` function added to edge function
4. Pre-filter updated to tag airline anchors with `anchor_type: 'flight'` (+ hotel, car_rental, transport)
