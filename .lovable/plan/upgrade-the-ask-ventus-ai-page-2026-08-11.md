# Upgrade the Ask Ventus AI page

Today the page is a single edge-to-edge white panel with a gradient bar, four plain pills and an empty middle. The upgrade turns it into an enterprise analyst workspace that feels intentional whether it is empty or mid-conversation.

## Layout

```text
+----------------+-------------------------------------+----------------+
| PROMPT RAIL    |  header: Ventus AI · Leadership      | CONTEXT PANEL |
| (grouped       |  ------------------------------------|  data scope   |
|  suggestions,  |  transcript, max-width ~760px,       |  live metrics |
|  by theme)     |  centered on a soft slate canvas     |  hot trends   |
|                |  ------------------------------------|  jump-to tabs |
|                |  composer + inline suggestions       |               |
+----------------+-------------------------------------+----------------+
```

- Center column is width-capped and centered so long answers stay readable instead of stretching across a 1400px screen.
- Left rail (collapsible, hidden under ~1280px) groups starter prompts by theme: Deposits & outflow, Growth & pillars, Segments & life events, Campaigns & activation.
- Right context panel (hidden under ~1536px) shows what the assistant is grounded on: bankwide metric tiles (accounts, users, annual spend, cross-sell rate), the hot-trend list, and quick links that jump to the related tab (Wallet Share, Life Events, Campaign Builder).

## Empty state

Replace the lone sparkle circle with a briefing-style welcome: Ventus mark, one-line role statement, a row of three capability cards ("Explain a shift", "Find the opportunity", "Draft the brief") each with an example prompt that fires on click, and a compact "grounded on" line summarizing data scope.

## Conversation surface

- Assistant messages render on the canvas with no bubble, an avatar chip and the "Ventus AI" label, tighter markdown styling for bullets/tables/numbers.
- User messages keep a filled dark bubble, right-aligned, with a timestamp.
- Hover actions on assistant replies: copy, regenerate, and "open related tab" when the answer references a module.
- Loading uses a shimmering "Analyzing bankwide signals…" line with a stepped status (reading spend → matching segments → drafting) instead of a static spinner.
- After each answer, show 2-3 suggested follow-up chips derived from the quick-action set.

## Composer

- Auto-growing textarea (Enter sends, Shift+Enter newline) in a bordered card with a footer row: scope selector chip ("Bankwide book"), character-free hint text, and a fixed-size icon submit button.
- Disabled/loading state shows a stop-style disabled button; input keeps focus after send and on tab activation.

## Technical notes

- All work stays in `src/components/tepilot/insights/VentusAIChatPage.tsx`, plus small new presentational files in the same folder (`ventus-chat/PromptRail.tsx`, `ventus-chat/ContextPanel.tsx`, `ventus-chat/ChatMessage.tsx`) to keep the page readable.
- No backend change: it continues to use `useAdvisorChat` with `bankwide-chat` and `LEADERSHIP_CONTEXT`. Regenerate simply re-sends the last user message.
- Context panel metrics read from the existing `LEADERSHIP_CONTEXT` object so nothing new is fabricated.
- Quick-link chips call the existing tab-navigation callback pattern already used in `AnalyticsContainer.tsx`; a new optional `onNavigate` prop is passed to the chat page.
- Strict light theme, slate-200 borders, Manrope type, no `dark:` utilities.
