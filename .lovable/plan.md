

## Fix Incorrect MCC Codes in Sample Data

### Issues Found

After auditing all 6 CSV datasets (~600 transactions), four MCC codes are incorrectly assigned:

| Line | Merchant | Current MCC | Current Meaning | Correct MCC | Correct Meaning |
|------|----------|-------------|-----------------|-------------|-----------------|
| 225 | PAYPAL*TICKETMASTR | 7996 | Amusement Parks, Carnivals, Circuses | **7922** | Theatrical Producers, Ticket Agencies |
| 232 | LULULEMON | 5651 | Family Clothing Stores | **5655** | Sports Apparel, Riding Apparel Stores |
| 291 | WARBY PARKER | 5995 | Pet Shops, Pet Food and Supplies | **8043** | Opticians, Optical Goods, Eyeglasses |
| 769 | STOWE MOUNTAIN (lift tickets) | 7012 | Timeshares | **7941** | Athletic Fields, Commercial Sports, Professional Sports Clubs |

All other MCC assignments across the 6 CSVs are correct.

### Changes

**File 1: `src/lib/sampleData.ts`** — Fix 4 MCC codes:
- Line 225: `7996` → `7922`
- Line 232: `5651` → `5655`
- Line 291: `5995` → `8043`
- Line 769: `7012` → `7941`

**File 2: `src/components/exec-demo/ExecDemoSelectionDialog.tsx`** — Add missing MCC to the `MCC_DESCRIPTIONS` map:
- `"8043": "Opticians, Optical Goods and Eyeglasses"`

**File 3: `src/components/exec-demo/execDemoData.ts`** — Add missing MCC to `MCC_SIGNAL_MAP`:
- `"8043": { pillar: "Healthcare", label: "Optician" }`

