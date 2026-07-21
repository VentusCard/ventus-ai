Shorten the external auto-loan pill in `src/lib/externalIntelligenceSignals.ts`:

- `event_name`: `"Auto Loan · Renewal in ~2mo"` → `"Auto Loan Renewal"`
- `detail`: `"Bureau tradeline · estimated maturity window · VW Credit"` (currently combined with `monthly_amount_band` "~$685/mo") → `"VW Credit · ~$685/mo"`

Result pill: `Ext  Auto Loan Renewal  VW Credit · ~$685/mo`

No other files change — downstream matching by servicer/product family still works.