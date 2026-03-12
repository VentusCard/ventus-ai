

## Consolidate Actions: Eye-only column + Edit inside Detail Modal

### Changes

**1. `ResultsTable.tsx`** — Simplify Actions column
- Remove the Edit button from the actions column, keep only the Eye icon
- Remove the `Edit` import from lucide-react
- Remove the standalone `CorrectionModal` rendering and its state (`correctionTransaction`)
- Rename column header from "Actions" to just use sr-only or keep minimal

**2. `TransactionDetailModal.tsx`** — Add inline correction capability
- Accept `onCorrection` callback prop (same signature as ResultsTable's)
- Add an "Edit Classification" button (pencil icon) in the modal header or footer
- When clicked, toggle an inline edit mode within the same modal showing:
  - Pillar dropdown (pre-filled with current pillar)
  - Subcategory text input (pre-filled)
  - Reason textarea
  - Save / Cancel buttons
- On save, call `onCorrection(transaction.transaction_id, pillar, subcategory, reason)` and close
- This merges the CorrectionModal's functionality directly into the detail popup

**3. Props update**
- `TransactionDetailModal` gains `onCorrection: (transactionId: string, correctedPillar: string, correctedSubcategory: string, reason: string) => void`
- `ResultsTable` passes `onCorrection` through to the modal

