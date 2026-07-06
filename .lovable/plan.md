## Update the source column header

Replace the "Bank-native sources" label in the CapabilitiesView three-column header to accurately reflect that the list now includes both bank-native and external intelligence sources.

### Change
In `src/components/tepilot/insights/CapabilitiesView.tsx`, update line ~762:

**From:**
```
Bank-native sources · {totalSourceInputs} inputs across {sourceGroups.length} providers
```

**To:**
```
Internal & external inputs · {totalSourceInputs} sources across {sourceGroups.length} providers
```

This drops the "bank-native" framing (since External Intelligence is now included and ranked last) and uses "sources" instead of repeating "inputs".