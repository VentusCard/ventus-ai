## Strip zip codes from non-card transactions

Update `src/lib/sampleData.ts` so only card-based transactions (Premium Card, Cashback Card, Travel Card, Checking-card, etc.) carry a `zip_code` value. ACH, Wire, Zelle, and Checks rows should have an empty `zip_code` field.

### Affected rows (12 of 14 non-card rows currently have zips)

| Line | Source | zip_code change |
|------|--------|-----------------|
| 224 | Checks | `94102` → empty |
| 225 | ACH | `94102` → empty |
| 226 | Zelle | `94102` → empty |
| 227 | Wire | `94102` → empty |
| 252 | Checks | `94102` → empty |
| 256 | Checks | `94102` → empty |
| 262 | Checks | `94103` → empty |
| 276 | Checks | `94102` → empty |
| 281 | Checks | `94102` → empty |
| 285 | Checks | `94102` → empty |
| 286 | Checks | `94102` → empty |
| 287 | Zelle | `94102` → empty |

Lines 248 and 279 already have empty zip codes — no change needed.

### Scope
- Only `src/lib/sampleData.ts` is touched.
- All other CSV columns (description, mcc, amount, date, source) are preserved as-is from the prior change.
- Card transactions retain their existing zip codes.
