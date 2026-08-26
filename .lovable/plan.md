# Update Ricky's signal set (/bankdemo)

Replace the signals on the first example customer (Ricky J, `c1`) so every Personalization tab, the signal panel, and deal generation are driven by the new set.

## New signals

Behavioral
- Biweekly tennis — recurring court/club charges on a two-week cadence
- Recurring pet expenditures — repeat pet supply, vet and grooming activity
- External: Annual tropical vacation in December — outside travel booking history each December

Life Event
- Buying a new house (pre-mover → new homeowner) — earnest deposit, inspection, moving and setup spend
- External: Car loan expiring in ~4 months — outside lender tradeline nearing end of term

Financial
- Recurring transfers to an outside brokerage — steady outbound transfers to a non-bank investment account

Demographic
- Small business owner — merchant-services deposits and business-expense pattern

Risk
- Gambling — recurring casino / sports betting activity

## Technical notes

- Single file: `src/lib/personalizationExamples.ts`, the `c1` entry only. Behavioral list uses the existing `s()`/`ext()` helpers, so the December vacation renders with the "Ext" tag alongside the internal behavioral pills.
- Keep the `c1` id, `customerId`, name, city, segment and products unchanged so the `DEMO_CUSTOMERS` mapping, prewarm path and phone mockup keep working.
- Confidence values assigned per signal (Strong for the recurring, evidence-heavy ones; Likely/Emerging for the forward-looking and risk items).
- No other customers, components, prompts or backend calls change.
