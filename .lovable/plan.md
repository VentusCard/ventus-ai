# Make Ventus AI chat its own page/tab

Today the Ventus AI leadership chat lives behind a card on the Intelligence Dashboard overview that expands into a fullscreen overlay. It becomes its own full page in the left sidebar.

## What changes

- New sidebar item **Ask Ventus AI** in the "Customer Intelligence" group, directly under Intelligence Dashboard.
- Selecting it opens a full-page chat: gradient header, message thread, quick-action prompts, and the input bar — no overlay, no close button.
- The Ventus AI card on the dashboard Overview stays as an entry point, but clicking it (or one of its quick chips) navigates to the Ask Ventus AI page instead of popping open the overlay. Clicking a chip sends that prompt on arrival.
- Chat history persists for the session while navigating between tabs.
- The floating "Ventus AI" pill in the header keeps working on other tabs and shows its "active" state on this page.

## Technical notes

- New `VentusAIChatPage.tsx` (in `insights/`): owns `useAdvisorChat` with the existing `LEADERSHIP_CONTEXT` and `bankwide-chat` function, renders the chat body currently inside the overlay in `VentusAIDashboardView.tsx`, accepts an optional initial prompt.
- `VentusAIDashboardView.tsx`: drop the `expanded` overlay state, escape handler, and close button; the sliver becomes a navigation trigger calling a new `onOpenChat(prompt?)` prop.
- `AnalyticsContainer.tsx`: add `'ventus-chat'` to `TabValue`, add the sidebar item (MessageSquare icon), route it to `VentusAIChatPage`, and keep a module-level/session-held pending prompt so a chip click lands as the first message. Keep chat state alive across tab switches the same way the demo mount is preserved, or hold messages in a shared store so returning to the tab restores the thread.
- Strict light theme apart from the existing dark gradient chat header.
