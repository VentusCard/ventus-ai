I’ll update `src/components/exec-demo/NextConversationRationale.tsx` so the Orchestrate content cards and CTA buttons are not part of the same card at all.

Plan:

1. Change each journey row from a 3-card flow to a 4-content-column layout:

```text
Signal → Intent   >   Personalize   >   Orchestrate card   CTA button
```

2. Keep the Orchestrate card as a standalone informational card containing only:
- the `Orchestrate` label
- the icon/title
- the three bullet points

3. Move the CTA into its own horizontally separate button column to the right of the Orchestrate card:
- `Open AI Assistant` for Regular Client
- `Open WM Copilot` for Wealth Client

4. Give the CTA column fixed/dedicated width and vertical centering so it cannot overlap or be visually contained by the Orchestrate card.

5. Preserve the existing light theme and brand colors:
- blue for Regular Client
- purple for Wealth Client
- no dark-mode utilities

Technical details:
- Replace the current grid column definition with one that includes an additional CTA column, for example:
  `grid-cols-[minmax(0,1fr)_14px_minmax(0,1fr)_14px_minmax(0,1fr)_132px]`
- Remove the CTA footer from inside both Orchestrate cards.
- Add a new sibling `<div>` after each Orchestrate card for the CTA button.
- Keep `min-w-0`, `min-h-0`, and `overflow-hidden` on cards so text remains contained.
- Add a small horizontal gap before the CTA column so the button reads as a separate action zone, not part of the Orchestrate card.