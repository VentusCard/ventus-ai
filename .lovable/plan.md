

## Fix: Panel breaks after loading custom customer

### Root Cause
In `handleLoad` (line 152), after successfully parsing and selecting the custom customer, `isCustomMode` is set to `false`. The dropdown then tries to use `selected?.id` (`"custom-a"`) as its value, but no `<option>` exists for that ID — only the preset DEMO_CUSTOMERS and `"custom"`.

This causes the `<select>` to show a blank/broken state, and the panel renders the customer details view but with a disconnected dropdown.

### Fix — `src/components/demo/DemoCustomerPanel.tsx`

1. **Track custom-loaded state separately**: After loading a custom customer, keep the dropdown showing "Custom" by detecting if `selected?.id` starts with `"custom-"`.

2. **Change dropdown value logic** (line 169):
   ```tsx
   // Before
   value={isCustomMode ? "custom" : (selected?.id ?? "")}
   
   // After — treat loaded custom customers as "custom" in the dropdown
   const isCustomCustomer = selected?.id?.startsWith("custom-");
   value={isCustomMode ? "custom" : isCustomCustomer ? "custom" : (selected?.id ?? "")}
   ```

3. **Show customer details after custom load**: When `isCustomCustomer` is true and `isCustomMode` is false, render the customer details view (demographics, stats, transaction table) — which already works, we just need the dropdown value to be valid.

### Single change location
`src/components/demo/DemoCustomerPanel.tsx` — lines 167-170, update the `value` prop of the `<select>`.

