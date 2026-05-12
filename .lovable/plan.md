In `src/components/exec-demo/WMCopilotPhoneView.tsx`, render a second file packet card whenever `secondarySignalLabel` is provided (and differs from the primary).

### Implementation
1. Extract the existing file-packet `<button>` (mapped from a signal label) into a small inline component/helper `FilePacketCard({ label, brief, sensitive, displayName, onOpen })` so we can reuse it for both events. It encapsulates: SHORT_MAP lookup, filename derivation (`{firstName}_{short}.pdf`), the styled button, and the "Timeline · N action items" subline.
2. Build two `SelectedSignal` entries:
   - primary = `fallbackSignal`
   - secondary = `secondarySignalLabel ? { kind: "lifeEvent", label: secondarySignalLabel } : null`
   Resolve a brief for each via `resolveBrief()` to drive its own `nextSteps.length` count and tone.
3. Track planner state per card with a single `plannerSignal: SelectedSignal | null` (null = closed). Clicking a card sets it; closing resets to null. Build the `LifeEvent` `mockEvent` from `plannerSignal.label` instead of always from the primary.
4. Render section heading "Tasks Automated" once, then the AI prompt copy ("I've prepped the timeline and action list — see attachments below."), then a vertical stack of the 1–2 file cards (`space-y-2`).
5. Filenames use the same `firstName` (already derived once) and the per-event SHORT_MAP slug.

### Scope
- Only `WMCopilotPhoneView.tsx` is edited.
- No new imports beyond what is already used.