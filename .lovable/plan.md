## Sample data formatting changes for executive demo

Update `src/lib/sampleData.ts` to adjust how non-card payment rows display in the Selection Dialog raw transaction table.

### Rules
- **ACH rows**: clear the `description` field (leave empty between the two commas).
- **Checks, Zelle, Wire rows**: wrap the existing `description` field in literal double-quote characters so they render as `"…"` in the description column.

### Affected rows (14 total in `src/lib/sampleData.ts`)

| Line | Source | Change |
|------|--------|--------|
| 224 | Checks | `Annual membership dues` → `"Annual membership dues"` |
| 225 | ACH | `Monthly rent payment` → *(empty)* |
| 226 | Zelle | `Dogsitting` → `"Dogsitting"` |
| 227 | Wire | `Home down payment` → `"Home down payment"` |
| 248 | Checks | `SAT registration fee` → `"SAT registration fee"` |
| 252 | Checks | `SAT prep course` → `"SAT prep course"` |
| 256 | Checks | `Spring membership renewal` → `"Spring membership renewal"` |
| 262 | Checks | `Annual wellness exam` → `"Annual wellness exam"` |
| 276 | Checks | `College admissions package` → `"College admissions package"` |
| 279 | Checks | `Past-due account payment` → `"Past-due account payment"` |
| 281 | Checks | `Mortgage application` → `"Mortgage application"` |
| 285 | Checks | `Pre-purchase inspection` → `"Pre-purchase inspection"` |
| 286 | Checks | `Title and escrow fees` → `"Title and escrow fees"` |
| 287 | Zelle | `Kitchen remodel deposit` → `"Kitchen remodel deposit"` |

### Technical note
The CSV parser in `ExecDemoSelectionDialog.tsx` uses naive `split(",")`, so the literal `"` characters become part of the description string and render as visible quotes — exactly the intent. None of the affected descriptions contain commas, so the split won't break.

No other files need changes.
