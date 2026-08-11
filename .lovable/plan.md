# Unify header search with Ventus AI

Make the global header search bar the single entry point to Ventus AI, so "Ask Ventus AI" and search are one thing.

## Behavior

- The header input becomes an **Ask Ventus AI** omnibox: placeholder "Ask Ventus AI or search…", with the Ventus AI live dot inside the input instead of a plain magnifier.
- Typing shows one dropdown with two zones:
  1. **Ask Ventus AI** — the top, highlighted row: "Ask: <what you typed>". Pressing Enter always runs this.
  2. **Go to** — matching workspace pages (existing nav matches), so navigation still works instantly.
- Selecting the Ask row (or Enter) switches to the Ask Ventus AI tab and sends the typed text as the opening question, using the existing pending-prompt handoff so the answer streams in immediately.
- When the input is empty and focused, the dropdown shows a few suggested Ventus AI questions (reused from the chat page's starter prompts) plus recent pages.

## Header cleanup

- The separate "Ventus AI" pill button no longer opens the side chat panel; it becomes a status indicator only when Ventus AI is active, since the search bar is now the way in. Breadcrumb, notification bell, and exit icon stay as they are.
- On the Ask Ventus AI tab itself, the omnibox stays functional and simply appends a new question to the existing conversation.

## Technical notes

- All work is in `src/components/tepilot/insights/AnalyticsContainer.tsx` (header omnibox, results, Enter handling) plus a small suggestions export from `src/components/tepilot/insights/ventus-chat/PromptRail.tsx`.
- Reuse the existing `openVentusChat(prompt)` helper and the `pendingPrompt` / `onPendingPromptConsumed` contract on `VentusAIChatPage`; the persistent chat mount keeps conversation state across tab switches.
- No backend or model changes — the same chat path answers the query.
