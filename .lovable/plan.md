

## Plan: Spread life-event transactions throughout each dataset

The life-event transactions in all 6 sample datasets are currently clustered at the very end. They need to be interspersed throughout the transaction history so the AI detection feels more realistic — picking up early signals mixed in with normal spending.

### Strategy per dataset

For each dataset, redistribute the life-event transactions by inserting them at different points in the timeline, adjusting their dates to fit naturally. The goal is to have early hints appear weeks before the final confirming transactions.

### 1-month datasets (spread across Aug-Oct timeline)

**Sarah Mitchell** (3 life-event txns: SAT reg, Kaplan prep, Stanford tour):
- Move SAT registration (`txn_073`) to ~Aug 22 (early in the month)
- Move Kaplan prep (`txn_074`) to ~Sep 5 (mid-timeline)
- Keep Stanford tour (`txn_075`) at Oct 14 (confirming signal at end)

**James Rodriguez** (3 life-event txns: Buy Buy Baby, OB-GYN, Pottery Barn Kids):
- Move OB-GYN (`txn_s077`) to ~Aug 20 (earliest signal)
- Move Buy Buy Baby (`txn_s076`) to ~Sep 8 (mid-timeline)
- Keep Pottery Barn Kids (`txn_s078`) at Oct 8 (final signal)

**Emily Chen** (3 life-event txns: Mortgage pre-approval, Home inspection, Title company):
- Move Mortgage pre-approval (`txn_h076`) to ~Aug 25 (early signal)
- Move Home inspection (`txn_h077`) to ~Sep 12 (mid-timeline)
- Keep Title company (`txn_h078`) at Oct 12 (closing signal)

### 12-month datasets (spread across the 12-month timeline)

**Michael Thompson** (6 life-event txns):
- Move ACT registration (`txn_sf200`) to ~Feb 2025
- Move Princeton Review (`txn_sf201`) to ~Apr 2025
- Move UC Berkeley visit (`txn_sf202`) to ~Jun 2025
- Move Del Webb (`txn_sf203`) to ~Aug 2025
- Move Estate attorney (`txn_sf204`) to ~Sep 2025
- Keep Keller Williams (`txn_sf205`) at Nov 2025

**Amanda Williams** (6 life-event txns):
- Move LinkedIn Premium (`txn_ny236`) to ~Jan 2025
- Move E*Trade (`txn_ny237`) to ~Mar 2025
- Move estate attorney (`txn_ny239`) to ~May 2025
- Move KPMG tax (`txn_ny240`) to ~Jul 2025
- Move Fidelity 401K (`txn_ny238`) to ~Sep 2025
- Keep Fidelity Trust (`txn_ny241`) at Nov 2025

**Robert Garcia** (6 life-event txns):
- Move James Allen Diamonds (`txn_ch243`) to ~Jan 2025
- Move Four Seasons (`txn_ch244`) to ~Mar 2025
- Move wedding planner (`txn_ch245`) to ~May 2025
- Move OB-GYN (`txn_ch246`) to ~Jul 2025
- Move Northwestern Mutual (`txn_ch247`) to ~Sep 2025
- Keep estate planning (`txn_ch248`) at Nov 2025

### Technical details

**File**: `src/lib/sampleData.ts`

For each dataset CSV string:
1. Remove the life-event transaction lines from the end
2. Insert them at chronologically appropriate positions within the existing transaction list, adjusting the `date` field to match surrounding transactions
3. Update `transaction_id` numbering is not required since IDs are just identifiers

This is purely a data reordering task within CSV template literals. No logic or component changes needed.

