## Pilot toggle (Step 1 button → Step 2 column)

### Step 1 (Prospect)

Add a "Pilot" toggle button to the right of the Customers field:

```
Bank [______________]    Customers [_______]   [⚡ Pilot]
```

- Off (default): Step 2 looks exactly like today.
- On: a new "Pilot/yr" column is inserted before "Fixed/yr" in Step 2; all rows are pre-checked under it.
- Toggling on **does not** auto-fill the customers field — it just exposes the pilot column so the user can compare side-by-side.

Active state: filled blue pill; inactive: white outline pill.

### Step 2 (Modules) — conditional Pilot/yr column

Only renders when pilot is on:

```
| Function | Description | Pilot/yr | Fixed/yr | Per user/yr | Line/yr | Add |
```

- Header label: `Pilot/yr` (sub-label: `<pilotCustomers> · all in`).
- Row cell: small green check + per-module pilot share (`flatFee / enabledModules.length`, rounded). The check signals "included".
- Totals strip gets an extra metric on the left: `Pilot · $200,000 / yr`.

When pilot is off, the column, sub-label, and totals metric are all hidden — column widths revert to the current layout.

Pilot config is read-only here; admin sets the values.

### Admin Console

New "Pilot package" panel above the module table with two inputs:
- Pilot customer count (default 100,000)
- Pilot flat fee / yr (default 200,000)

Persisted under `ventus_pricing_pilot_v1`. "Reset to defaults" restores both.

### Email draft

When pilot toggle is on, append one line below the à la carte summary:

```
Pilot option: 100,000 customers · all modules · $200,000 / yr flat
```

When off, email is unchanged.

### Files

- `src/lib/pricingCatalog.ts` — add `PilotConfig`, `DEFAULT_PILOT_CONFIG`, persist pilot config under `ventus_pricing_pilot_v1`, expose `pilot` + `updatePilot`, include pilot in `resetToDefaults`.
- `src/pages/Pricing.tsx` — add `pilotMode` state, "Pilot" pill button in Step 1, conditional Pilot/yr column in Step 2 (header + rows + totals strip), pilot line in `buildSummaryText`/`buildEmailBody`.
- `src/components/pricing/AdminFeeEditorDialog.tsx` — accept `pilot` + `updatePilot`, render Pilot package panel above the module table.

### Notes

- `pilotMode` is local component state, not persisted (resets on page load like the other inputs).
- Column widths when pilot is on: function `col-span-3 → col-span-3`, description `col-span-4 → col-span-3`, new Pilot/yr `col-span-1`. Other columns unchanged.
