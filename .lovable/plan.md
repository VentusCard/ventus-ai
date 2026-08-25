# Signal pills drive the deal collection on Personalized Deals

Today the signal pills in the left "Customer Selection" panel only expand an evidence line. The phone on the right shows the generated deal collections independently. Clicking a pill should make the phone jump to the collection that signal produced.

## Behaviour

- Click a pill → the phone's rewards view opens the matching deal collection (same focus mechanism the /demo intel panel already uses), and the pill stays visually active.
- Click the active pill again (or pick another customer) → focus clears and the phone returns to the default rotating collections.
- The evidence line still expands on click, so the "why" stays visible next to the collection.
- Pills whose signal has no matching collection get a subtle "no collection yet" state instead of a dead click — the phone stays where it is.
- Spending-habit pills map most directly; life-event, financial and demographic pills fall back to fuzzy label/pillar matching, which the existing matcher already supports.

## Technical notes

- `GeneratedOffersPhoneView` already accepts `activeRollupLabel` / `activeRollupPillar` and resolves them with `findGroupForLabel` (exact → normalized → token match). No change needed there beyond exporting a way to know whether a label resolves.
- `CustomerMockupPanel` gains local state `focusedSignal: { label, pillar } | null`, passes it into `ExecDemoPhoneView` as `activeRollupLabel` / `activeRollupPillar` for the example-customer path (session path keeps its own values), and resets it when the selected customer changes.
- `CustomerSignalPanel` takes two new props: `focusedLabel` and `onSignalClick(signal)`. Clicking a pill both toggles the evidence expansion (existing behaviour) and reports the click up. Active pill gets a stronger ring/filled treatment; matching is by signal label.
- Pillar for a clicked signal is derived with the same `pillarFor` helper used by `buildPillarRollups` in `src/lib/personalizationGeneration.ts` (export it) so pill → collection matching agrees with how the collections were generated.
- Availability check: compute the set of resolvable labels from `generated.offers` in `CustomerMockupPanel` and pass it down so unmatched pills render the muted state.
- Strict light theme, existing pillar chip colors, no new dependencies. Only the rewards surface changes behaviour; product/relationship surfaces keep passing `null`.
