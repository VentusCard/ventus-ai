Make the file packet card in `src/components/exec-demo/WMCopilotPhoneView.tsx` clickable. On click, open the existing **Life Event Planner** (`FinancialTimelineTool`) as a full app-level modal over the entire demo.

### Implementation
In `WMCopilotPhoneView.tsx`:
1. Add `useState` for `plannerOpen`.
2. Wrap the existing file packet `<div>` in a `<button type="button" onClick={() => setPlannerOpen(true)}>` with `w-full text-left` + a hover ring (`hover:ring-2 hover:ring-purple-300`) so it reads as actionable. Keep the existing visual unchanged.
3. Render `<FinancialTimelineTool open={plannerOpen} onOpenChange={setPlannerOpen} detectedEvent={mockEvent} />` at the bottom of the component (the dialog portals out, so it escapes the phone frame).
4. Build `mockEvent: LifeEvent` from `fallbackSignal.label` via a small map → `project_type` (and a sensible `event_name`):
   - `College Preparation for Dependent` → `education`
   - `Home Purchase` → `home`
   - `Wedding Planning` → `wedding`
   - `New Baby` → `family_formation`
   - `Retirement Planning` → `retirement`
   - default → `other`
   No `financial_projection` is supplied — `FinancialTimelineTool` will fall back to `loadTemplate(projectType)` using the matching default template (it sets `projectType` from the map below).
5. Set `projectType` on the tool by passing a minimal `detectedEvent` with no `financial_projection` is not enough on its own (the tool only consumes `detectedEvent.financial_projection`). To make the planner open on the right tab, call `loadFromDetectedEvent` path by also supplying a stub `financial_projection` with the mapped `project_type` and the default duration from `projectDurations`, plus empty arrays for cost_breakdown / funding_sources and zeros for the numeric fields. The tool's existing `loadFromDetectedEvent` will then key off `project_type`.

### Scope
- Only `WMCopilotPhoneView.tsx` is edited.
- No changes to `FinancialTimelineTool` or its data files.
- Tone follows existing `brief.sensitive` accents on the card; the planner dialog itself is unchanged.