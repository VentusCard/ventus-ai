# Add a 2024 Hawaii Trip to Reinforce Annual Cadence

Currently the persona evidence only contains two Hawaii trips (2025 Maui + 2026 Big Island). To make "Annual Hawaiian Vacations" undeniable as a 3-year repeat ritual, I'll add a **summer 2024 Kauai trip** before the existing dataset starts.

Today the CSV begins on **2024-10-28**, so the new trip extends the customer's history back by ~4 months. That's a normal range for a personal banking dataset and won't break anything else.

## Changes — `src/lib/sampleData.ts` (`SAMPLE_CSV` only)

Insert **8 new transactions** right at the top of `SAMPLE_CSV`, dated **June–July 2024**, in chronological order:

### Pre-trip prep (San Francisco)
- `txn_h15` · `SUNBUM REEF SAFE SPF` — $64 — 2024-06-20 — Cashback Card
- `txn_h16` · `OLUKAI SANDALS` — $128 — 2024-06-23 — Premium Card

### Kauai trip (zip 96746 = Kapaa, 96714 = Hanalei, 96766 = Lihue)
- `txn_h17` · `HAWAIIAN AIRLINES HNL` — Round trip SFO to LIH — $865 — 2024-07-02 — MCC 4511 — Premium Card
- `txn_h18` · `KOA KEA HOTEL KAUAI` — Poipu beachfront 5 nights — $2,290 — 2024-07-03 — MCC 7011 — Premium Card
- `txn_h19` · `BUDGET RENT-A-CAR LIH` — Jeep rental Lihue airport — $578 — 2024-07-03 — MCC 7512 — Premium Card
- `txn_h20` · `NA PALI CATAMARAN TOUR` — Na Pali coast snorkel sail — $245 — 2024-07-05 — MCC 7999 — Cashback Card
- `txn_h21` · `BEACH HOUSE RESTAURANT KAUAI` — Sunset oceanfront dinner — $228 — 2024-07-06 — MCC 5812 — Premium Card
- `txn_h22` · `LUAU KALAMAKU KAUAI` — Traditional luau for two — $358 — 2024-07-07 — MCC 5812 — Premium Card

## Why these merchants

The classifier in `supabase/functions/classify-transactions/index.ts` tags any merchant with `HAWAII`, `KAUAI`, `LIH` (Lihue airport), `KOA`, `MAUI`, `KONA`, or named Hawaii resorts as `[Tropical Vacation]`. All 8 merchants either:
- are explicit "good brand anchors" for tropical travel (Sunbum, Olukai), or
- carry a Hawaii location cue in the merchant name (KAUAI, LIH, HAWAIIAN AIRLINES).

Using **Kauai** instead of repeating Maui or Big Island reinforces "annual Hawaii" as the pattern (rather than "loves Maui specifically"), which matches the persona-synthesizer's `Annual Hawaiian Vacations` rollup label.

## Out of scope

- No edits to other personas, classifier, persona prompt, or offer generator.
- Existing 2025 + 2026 Hawaii rows stay untouched.
- IDs use `txn_h##` prefix (continuing the series from the prior addition) so no renumbering of existing rows.

## Result

The "Annual Hawaiian Vacations" pill will now show **3 consecutive July trips** (Kauai 2024 → Maui 2025 → Big Island 2026) with consistent flight + resort + rental car + snorkel + luau + sunscreen pre-prep across all three. The cadence reads as an unambiguous yearly ritual.
