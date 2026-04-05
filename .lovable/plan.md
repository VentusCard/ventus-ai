

## Add Custom Data Input to Executive Demo

### Problem
The exec demo (`ExecDemoPage`) only supports pre-built customers. The `/demo` page already has a working "Custom" flow (copy prompt → paste LLM output → parse profile + CSV). We need to replicate this in the exec demo.

### Changes

**`src/components/exec-demo/ExecDemoLeftPanel.tsx`**
- Add a "✏️ Custom" option after the 6 pre-built customer buttons
- When selected, show the same two-step UI: "Copy Prompt" button + textarea for pasting output + "Load Customer" button
- Import `buildCustomerPrompt`, `parseUnifiedOutput` from `@/lib/demoData`
- On "Load Customer": parse the pasted text, build a custom CSV string, and call a new `onLoadCustomCsv` callback

**`src/pages/ExecDemoPage.tsx`**
- Add a `customCsv` state to hold user-provided CSV data
- Add `handleLoadCustomCsv(csv: string, name: string)` handler that:
  - Stores the custom CSV
  - Sets a flag so `handleRunAnalysis` uses the custom CSV instead of `getCsvForCustomer(selectedIdx)`
- Pass this handler down to `ExecDemoLeftPanel`
- When running analysis with custom data, `buildLocalProfile` already works with any CSV — just pass the custom CSV directly

**`src/components/exec-demo/execDemoData.ts`**
- Update `buildLocalProfile` to accept an optional customer name parameter for the persona title
- No other changes needed — `parseCsvToTransactions` and `buildSignalMap` already work with arbitrary CSV data

### Flow
The user clicks "Custom" → copies the prompt → pastes into ChatGPT/Claude → gets a `=== PROFILE ===` + `=== TRANSACTIONS ===` block → pastes it back → clicks "Load Customer" → clicks "Run Analysis" → instant local signals + async AI enrichment, same as pre-built customers.

### Files
1. `src/components/exec-demo/ExecDemoLeftPanel.tsx` — add Custom option + prompt/paste UI
2. `src/pages/ExecDemoPage.tsx` — handle custom CSV state + pass to analysis
3. `src/components/exec-demo/execDemoData.ts` — minor: accept custom name in `buildLocalProfile`

