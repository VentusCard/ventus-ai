

## Require At Least One Feature Module Before Processing

### Problem
Users can deselect all 3 toggleable modules (AI & UX, Rewards, Relationship) and still hit "Process," which produces no useful output since Analytics alone is just the core engine.

### Fix — `src/components/demo/DemoCustomerPanel.tsx`

**1. Add a check**: count how many of the 3 feature modules are enabled (excluding Analytics which is always on). If none are selected, disable the Process button.

**Line ~168** — update the `disabled` prop:
```tsx
disabled={isProcessing || !customer || !["AI & UX", "Rewards", "Relationship"].some(m => enabledModules.has(m as ModuleKey))}
```

**2. Add helper text** below the button when no feature modules are selected, e.g.:
```tsx
{!["AI & UX", "Rewards", "Relationship"].some(m => enabledModules.has(m as ModuleKey)) && (
  <p className="text-[11px] text-amber-600 mt-2 text-center">Select at least one feature module to proceed</p>
)}
```

### Files changed
1. `src/components/demo/DemoCustomerPanel.tsx` — disable button + warning text

