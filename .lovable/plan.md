## Change

In `src/components/tepilot/insights/CapabilitiesView.tsx` line ~762, update the left-column header from:

```
Internal & external inputs · {totalSourceInputs} sources across {sourceGroups.length} providers
```

To:

```
{totalSourceInputs} Internal & External Sources
```

This uses the already-computed `totalSourceInputs` value (line 683) so the number stays accurate if source groups change later.