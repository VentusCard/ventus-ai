

## Plan: Add "Custom" Option to Customer Selector

### What Changes

Add a "Custom" option to each customer dropdown that opens an inline paste area for transactions CSV and a demographics form. Include a small helper icon/popover with a prompt users can copy-paste into ChatGPT to generate random transaction data.

### Files to Edit

**1. `src/components/demo/DemoCustomerPanel.tsx`**

- Add a "Custom" option to the `<select>` dropdown (value `"custom"`)
- When "Custom" is selected, replace the transaction table with:
  - A `<textarea>` for pasting CSV transaction data (placeholder shows expected format: `date,merchant_name,amount,mcc,merchant_zip`)
  - A compact demographics form with inputs: Name, Age, Occupation, Family Status, Zip Code
  - A small info icon button (💡 or `HelpCircle` from lucide) that opens a popover/tooltip containing a ready-to-copy LLM prompt like:
    ```
    Generate 30 rows of realistic bank transaction CSV data with columns: date, merchant_name, amount, mcc, merchant_zip. Use varied merchants, dates in the last 3 months, amounts from $5-$2000. Include travel, dining, grocery, shopping, and wellness categories.
    ```
  - A "Load" button that parses the pasted CSV and constructs a `DemoCustomer` object
- When custom data is loaded, show the same transaction table as preset customers

**2. `src/pages/DemoPage.tsx`**

- Update `onSelectA`/`onSelectB` handlers to accept either a preset `DemoCustomer` or a custom-built one
- No structural changes needed since `DemoCustomer` type already supports all required fields

**3. `src/lib/demoData.ts`**

- Export a `buildCustomDemoCustomer(csv: string, demographics: {...}, zip: string): DemoCustomer` helper that:
  - Creates a minimal `DemoCustomer` with the pasted CSV, a generated `ClientProfileData` from the demographics inputs
  - Sets sensible defaults for `deals`, `trips`, `lifeEvents`, `topPillars`, `pillarBreakdown` (empty arrays)
  - Uses id `"custom-a"` or `"custom-b"`

### UI Layout (when "Custom" is selected)

```text
┌─ Customer A ─────────────────────┐
│ [Dropdown: Custom            ▾]  │
│                                  │
│ Name: [___________]  Age: [__]   │
│ Occupation: [___________]        │
│ Family: [Single ▾]  Zip: [____] │
│                                  │
│ Transactions CSV        [💡]     │
│ ┌──────────────────────────────┐ │
│ │ paste CSV here...            │ │
│ │                              │ │
│ └──────────────────────────────┘ │
│ [Load Data]                      │
└──────────────────────────────────┘
```

The 💡 icon opens a popover with the LLM prompt + copy button.

### Files Summary
- `src/lib/demoData.ts` — add `buildCustomDemoCustomer()` helper
- `src/components/demo/DemoCustomerPanel.tsx` — add "Custom" dropdown option, paste area, demographics form, LLM prompt helper
- `src/pages/DemoPage.tsx` — minor handler updates if needed

