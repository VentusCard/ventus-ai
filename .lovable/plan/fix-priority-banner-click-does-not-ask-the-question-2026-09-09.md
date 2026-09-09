# Fix: priority banner click does not ask the question

## What happens today

In the Intelligence Database dashboard, the "3 priorities in your book right now" banner has two separate click targets:

- The small rotating headline text inside it sends the question to Ask Ventus AI.
- The rest of the banner (the "3 priorities..." line, the V badge, the arrow, empty space) just opens Ask Ventus AI with **no** question, so the chat lands on the empty briefing screen and nothing is asked.

The rotating line is a thin, moving 18px strip, so most clicks land on the outer area and appear to "do nothing".

## The fix

Make the whole banner ask the question:

- The banner's main click sends the current priority question instead of opening an empty chat.
- The inner rotating headline keeps the same behaviour (no change in outcome), so both paths are identical.
- The small dots that switch between priorities keep only switching the priority.

Result: clicking anywhere on the banner opens Ask Ventus AI with the question bubble already posted and the answer streaming in (served instantly from the pre-warmed cache when ready).

## Technical detail

File: `src/components/tepilot/insights/VentusAIDashboardView.tsx`

- In `renderSliver`, change the outer `<button onClick={() => onOpenChat?.()}>` to `onClick={() => onOpenChat?.(activeCard ? getPriorityPrompt(activeCard) : undefined)}`.
- Leave the inner headline handlers, the pager dots' `stopPropagation`, and pre-warm logic untouched.

## Verification

- `bun run build` and the build-error log.
- Playwright on `/bankdemo`: click the banner, confirm the transcript shows the user bubble "What are the trends and opportunities for this past week?" without jumping to the bottom of the page.
