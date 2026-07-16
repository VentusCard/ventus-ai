## Unify pill format in the /bankdemo intel panel

The five signal rows in `src/components/exec-demo/ExecDemoIntelPanel.tsx` currently render pills with inconsistent shapes:

| Row | Leading glyph | Trailing metadata | Issue |
|---|---|---|---|
| Spending Habits | ✦ | `N txns · $Y` | ok |
| Life Events | ✦ | `N% · N txns/signals` | ok |
| Financial Signals | ◆ | `$XXX/mo` band; label may include brand names (e.g. "Chase Auto Loan") | brand names in label |
| Demographic | ↑ / ↓ / → arrow | magnitude band | **arrow glyph** |
| Risk Factors | ⚠ / ✕ | `N txns · severity` | ok |

### Fix

1. **Drop the arrow direction glyph** on Demographic pills. Replace with the same ✦ marker used by the other benign pills (color kept as the teal `#0d9488`). Remove the `dirGlyph` helper.
2. **Strip brand names from Financial Signal labels** before rendering. Trim any leading issuer/brand token (e.g. "Chase ", "Wells Fargo ", "BofA ", "Ally ") so the pill reads as a generic product ("Auto Loan", "Mortgage", "Brokerage Contributions"). Apply the same sanitizer to Demographic labels defensively. Sanitizer lives inline in the panel (small allowlist regex against a list of bank/issuer names already surfaced in `bankProductCatalog.ts`).
3. Leave counts / % / severity metadata as-is — those are the "same format" already (small tabular-nums badge on the right).

No changes to backend, taxonomy rules, or the enrichment table. Purely cosmetic normalization of the pill row.

### Files touched
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — remove `dirGlyph`, swap Demographic leading glyph to `✦`, add `stripBrand()` helper applied to Financial Signal + Demographic labels.
