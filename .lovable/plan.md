# Make Ventus AI chat a tab, not a popup

Today the Ventus AI leadership chat lives behind a card on the Intelligence Dashboard overview that expands into a fullscreen overlay. It becomes a first-class sub-tab instead.

## What changes

- Intelligence Dashboard sub-tabs become: **Overview · Ask Ventus AI · Customers · Reports · Query · Risk**.
- "Ask Ventus AI" renders the chat inline as a full-height panel — gradient header, message thread, quick-action prompts, and the input bar — with no fullscreen overlay and no close button.
- The Ventus AI card on the Overview stays as an entry point, but clicking it (or one of its quick chips) switches to the Ask Ventus AI sub-tab instead of popping open the overlay. Clicking a chip sends that prompt on arrival.
- Chat history persists while moving between sub-tabs in the session.
- The floating "Ventus AI" pill in the header keeps working for every other tab; on the dashboard it stays in its "active" state as it does today.

## Technical notes

- `VentusAIDashboardView.tsx`: add an `ask` entry to `DASHBOARD_SECTIONS` and to the `initialSection` union; extract the current overlay body into an inline chat section rendered when `section === "ask"`. Remove the `expanded` overlay state, the escape-key handler, and the close button; keep `useAdvisorChat`, messages, quick actions, and the input handling as-is. The sliver's onClick and chip clicks call `setSection("ask")` (chips also `sendMessage`).
- `AnalyticsContainer.tsx`: no routing change required; optionally keep `chatOpen` behavior untouched for non-dashboard tabs.
- Strict light theme apart from the existing dark gradient header used by the chat surface.
