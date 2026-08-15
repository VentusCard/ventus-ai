# Merge conversation demos into one "Examples" sub-tab

## What changes
In the AI Coworker tab, the two sub-tabs "Advisor Conv. Demo" and "Leadership Conv. Demo" are replaced by a single sub-tab named **Examples**.

Inside Examples, a small secondary switcher (two pills: **Advisor** and **Leadership**) selects which conversation demo is shown. Advisor is selected by default.

Resulting sub-tabs:
1. Coworker Dashboard
2. Persona Settings
3. Live Work Stream
4. Examples

## Technical details
- `src/components/tepilot/insights/BankwideWMCopilotView.tsx`
  - `ViewMode` becomes `"inbox" | "persona" | "stream" | "examples"`.
  - Toggle list: replace the two demo entries with one `{ key: "examples", label: "Examples", icon: Mail }`.
  - Add local state `exampleMode: "advisor" | "leadership"` (default `advisor`).
  - When `viewMode === "examples"`, render a light pill switcher (same slate-100 / white-active styling as the parent toggle, one size smaller) above the content, then render `AdvisorNotificationsView` or `LeadershipNotificationsView` accordingly.
- No changes to the demo views themselves; existing props for `AdvisorNotificationsView` are preserved.
- Styling stays strict light theme.
