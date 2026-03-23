

## Add Demographics Line Below Customer Dropdown

**File: `src/components/demo/DemoCustomerPanel.tsx`**

After the `<select>` dropdown, when a customer is selected (not custom mode), insert a single compact line showing two bank-available fields:

- **Industry**: from `selected.profile.demographics.industry` (e.g., "Technology")
- **Income Level**: from `selected.profile.demographics.incomeLevel` (e.g., "$200K–$250K")

Rendered as:
```text
Industry: Technology  ·  Income: $200K–$250K
```

Styled `text-[10px] text-slate-500` with a light top border, between the dropdown and transaction stats.

### File Modified
- `src/components/demo/DemoCustomerPanel.tsx` — add 2-field demographics line after select, before transaction stats

