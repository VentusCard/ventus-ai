# Instant Ventus AI answers on the Intelligence Database

## What changes for the user

Today, clicking the "3 priorities in your book right now" banner (or one of its rotating priority lines) opens Ventus AI and then waits several seconds while the answer is generated. After this change the answer is already there — it appears the moment the panel opens.

The answer text also reads better: clearer headings, tighter bullets, readable tables and bolded metrics instead of one dense block.

## How it works

1. When the Intelligence Database view loads, Ventus quietly asks its own priority questions in the background (the same three prompts behind the rotating banner) and keeps the answers in memory for the session.
2. Clicking the banner or a priority line opens the chat and shows the stored answer instantly, with a short reveal animation so it still feels like Ventus is speaking.
3. If a background answer isn't ready yet (slow network, or the user clicks within the first second), it falls back to today's behavior: the loading steps, then the live answer. Nothing breaks if the AI service is unavailable.
4. Pre-warming happens once per session and only for the three priority prompts — no extra requests when the user types their own question.

## Technical notes

- New `src/lib/ventusPrewarm.ts`: a module-level `Map<prompt, {status, answer}>` cache plus `prewarmPriorityPrompts(prompts, context)` and `getPrewarmedAnswer(prompt)`. Requests go through the existing `bankwide-chat` edge function via `supabase.functions.invoke`, fired in sequence (not parallel) to stay inside the gateway rate budget, with failures swallowed and marked so they are not retried in a loop.
- `useAdvisorChat` gains an optional `prewarm` lookup: when `sendMessage(text)` finds a cached answer, it pushes the user + assistant messages immediately without a network call; otherwise unchanged.
- `VentusAIDashboardView` triggers `prewarmPriorityPrompts` on mount using the same `getVentusPriorityCards(...)` prompts it already renders, with `LEADERSHIP_CONTEXT` from `VentusAIChatPage`. Context moves to `src/lib/ventusLeadershipContext.ts` so both files can import it without a cycle.
- Formatting: `ChatMessage.tsx` adds `remark-gfm` (tables, strikethrough) to `ReactMarkdown` and a tighter prose ruleset — headings at 12.5–13.5px semibold slate-900, `[&_ul]:list-disc [&_ul]:pl-4`, spaced list items, bordered/zebra tables, `tabular-nums` for numeric cells, and styled `hr`/`blockquote`. Same treatment applied to the compact renderer in `VentusAIChatPanel.tsx` so both surfaces match.
- Edge function `bankwide-chat` system prompt: keep behavior, add explicit markdown formatting guidance (short `##` section headers, `-` bullets, bold metrics, tables only when comparing) so responses arrive in a shape the new styles render well.
- Strict light theme throughout; no `dark:` utilities.
