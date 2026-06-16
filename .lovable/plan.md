## Changes to `src/components/tepilot/insights/CapabilitiesView.tsx`

Update the `INPUTS` list and card rendering on the Systems tab.

### 1. Restructure INPUTS array

Current 7 items → new 7 items, grouped as internal vs external:

**Internal (bank-owned data):**
- KYC — Core
- Card Transactions — Card Processor
- ACH, Wires & Checks — Core *(combined)*
- Zelle — EWS
- Digital Telemetry — Digital Banking

**External (third-party / bureau):**
- External Loan & Credit Payments — Credit Bureau
- External Transactions — Credit Bureau

Each item gets a new `kind: "internal" | "external"` field.

### 2. Visual differentiation

Add a colored left border per kind in the input card:
- Internal → `border-l-2 border-l-emerald-400` (matches existing emerald accent / hover)
- External → `border-l-2 border-l-violet-400`

Hover ring color also shifts per kind (emerald vs violet) to reinforce the grouping.

Optional small group label row ("Internal" / "External") inserted between the two clusters for clarity — kept minimal so layout height stays roughly the same.

### 3. Header count

`Data Inputs · {INPUTS.length} connected` stays correct (still 7).

No other tabs, files, or logic touched.
