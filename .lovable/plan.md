Replace the "Digital identity & device" input in the External Intelligence section with "Loans & Payments" and move it to third position.

### Files changed
- `src/components/tepilot/insights/CapabilitiesView.tsx`

### Edits
1. **External Intelligence inputs array (line ~666):**
   - Remove the existing `Digital identity & device` entry.
   - Insert a new entry at index 2 (third position):
     ```
     { label: "Loans & Payments", sublabel: "Auto loans, mortgage history, HELOC, and personal loan servicing", icon: Receipt, fcra: false }
     ```
   - Reorder so the sequence becomes: Credit File, Wealth Data, Loans & Payments, Property Data, Demographics Data, Auto & VIN, Life events, Interests & hobbies, Public records, Firmographics, Licenses & registrations, New movers & pre-movers.

2. **External Intelligence description (line ~665):**
   - Update the string to replace "digital identity" with "loans & payments" so the summary stays accurate.

3. **Verification:**
   - Run TypeScript check to confirm no type errors.