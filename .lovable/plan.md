## Change

In `src/components/tepilot/insights/CapabilitiesView.tsx`, prepend a new entry to the `INPUTS` array so it renders as the first row in the Data Inputs column of the System tab:

```ts
{ label: "KYC", icon: UserCircle, source: "Core" }
```

- Uses the already-imported `UserCircle` icon (consistent with Demographic Signals iconography, and KYC is identity data).
- `source: "Core"` so its right-side badge matches the other core-sourced rows (ACH & Wires, Checks).
- Connected-count chip ("Data Inputs · N connected") updates automatically from `INPUTS.length` (6 → 7).
- No other files, styles, or layouts change.
