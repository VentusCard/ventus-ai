# Move Hawaiian Airlines bookings 3 months before each trip

Realistic booking behavior: a traveler buys flights well in advance of the actual trip dates, not the day before. Right now all three Hawaiian Airlines transactions sit alongside the resort/snorkel/dinner rows on trip-day. I'll shift each flight purchase to **~3 months before** its trip so the data matches normal advance-booking patterns and gives the engine a clearer "planning ahead" signal.

## Changes — `src/lib/sampleData.ts` (`SAMPLE_CSV` only)

Update the `date` field on three rows (no other fields change, no row reordering needed — the persona engine sorts by date internally):

| txn_id | Trip | Old flight date | New flight date |
|---|---|---|---|
| `txn_h17` | 2024 Kauai (Jul 2–7) | 2024-07-02 | **2024-04-02** |
| `txn_034` | 2025 Maui (Jul 1–6) | 2025-07-01 | **2025-04-01** |
| `txn_054` | 2026 Big Island (Jul 5–10) | 2026-07-05 | **2026-04-05** |

All other Hawaii transactions (resorts, rental cars, snorkel sails, luaus, dinners, sunscreen prep) keep their existing dates — those are correctly tied to the actual travel window.

## Out of scope

- Resort bookings stay on trip-day (they hit the card at check-in, not at booking).
- Pre-trip prep (Sunbum, Olukai, Quiksilver) keeps its existing 2–4 week pre-trip dates.
- No changes to other personas or the classifier.

## Result

The engine will now see a clean **"book in April → travel in July"** pattern across three consecutive years, which is the realistic shape for an annual vacation ritual and gives the offer rationale a stronger booking-window signal.
