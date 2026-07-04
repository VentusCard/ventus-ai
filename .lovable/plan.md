## Goal
Add an exit button to the top-right of the `/bankdemo` header (after the "Powered by Ventus AI" badge) that clears the demo session and returns the user to the password gate.

## Files to Change
- `src/components/tepilot/insights/AnalyticsContainer.tsx` — add the exit button in the header's right-side flex container
- `src/pages/BankAnalyticsDashboard.tsx` — no changes needed; the `SimplePasswordGate` wrapper already handles session clearing via `sessionStorage`

## Implementation
1. In `AnalyticsContainer.tsx` line ~295-301, the header already has a right-side flex container with the date and "Powered by Ventus AI" badge.
2. Insert an exit button (icon or text+icon) immediately after the badge.
3. The button should:
   - Remove the `demo_password_access` key from `sessionStorage`
   - Call `window.location.reload()` so the `SimplePasswordGate` re-evaluates and shows the password form
4. Styling: match the existing light theme — `slate-200` border, white background, `slate-500` text, hover to `slate-700`, rounded-full or subtle button style consistent with the header aesthetic. Use `lucide-react`'s `LogOut` or `X` icon.

## No structural changes
No new state, no routing changes, no backend changes. Purely a UI trigger that reuses the existing password gate logic.