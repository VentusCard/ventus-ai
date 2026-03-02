

## Enhance WealthPreview with More Supporting Transactions from Diverse Sources

**File: `src/components/PlatformTabs.tsx`** — update `WealthPreview` component data only.

### Changes

Expand each client's transaction evidence from 2 rows to 4 rows, using all five source types (Checking, Cashback Card, Travel Card, Premium Card, HSA) across the two clients.

### Updated Data

**Margaret Chen — Retirement Planning ($4.2M)**
| Merchant | Amount | Source | Color | Note |
|---|---|---|---|---|
| Fidelity Rollover | $45,000 | Premium Card | purple | 401k consolidation |
| AARP Membership | $48 | Checking | slate | membership activation |
| Schwab Advisory | $2,400 | Travel Card | blue | annual fee payment |
| Medicare Supplement | $312 | HSA | amber | coverage upgrade |

**David Park — Home Purchase ($1.8M)**
| Merchant | Amount | Source | Color | Note |
|---|---|---|---|---|
| Zillow Premium | $35 | Checking | slate | active home search |
| Home Depot | $1,280 | Cashback Card | green | renovation planning |
| First American Title | $450 | Premium Card | purple | title search initiated |
| Lowe's Pro Services | $890 | Travel Card | blue | contractor materials |

### Technical Notes

- Only the `txns` arrays change — no layout or styling modifications needed
- All five source colors now represented across the two clients (Checking=slate, Cashback=green, Travel=blue, Premium=purple, HSA=amber)
- Transaction merchants are tightly coupled to the detected life event for high-confidence signaling

