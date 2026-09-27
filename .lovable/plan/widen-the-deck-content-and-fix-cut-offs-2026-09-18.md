# Widen the deck content and fix cut-offs

## Goal
Give every `/deckmo` slide more horizontal room so headlines, pills and callouts sit on fewer lines, then sweep the whole deck for text that is clipped or spilling.

## What changes

### 1. Wider slide canvas
Today most slides are capped at roughly 1280px while the two newer slides use about 1380px, so on a 1494px screen there is unused space on both sides and text wraps early.

- Introduce one shared slide width used by every scene (about 1560px, still centered, with the same side padding rules).
- Apply it to: opener, visibility, complete picture, Ricky, immediate, mid-term, segment activation, long-term, bank tools, close.
- Let headline and subtitle blocks use more of that width so titles break onto fewer lines.
- Keep the fixed-size elements untouched: phone mockups, the embedded workspace screen, header bar and footer bar.

### 2. Rebalance the columns that the extra width feeds
- Phone slides (immediate, mid-term, long-term): let the text column and the callout rail grow with the wider canvas instead of staying at fixed pixel widths, so callout sentences fit on fewer lines.
- Complete picture: allow the inside/outside panels to take the extra room, keeping the customer centered.
- Segment activation: give the message card more room before it needs to shrink.

### 3. Full-flow overflow audit
Walk every slide and every reveal step at 1024x768, 1280x800, 1494x855, 1440x900 and 1920x1080 and check for:
- text clipped by a container or hidden behind the header/footer bars,
- horizontal scrolling anywhere,
- pills, badges or callouts overflowing their card,
- the embedded workspace screen and phone screens being cropped.

Anything found gets fixed with wrapping, clamped type sizes, or the existing compact-height scaling — no redesign of any slide.

## Verification
- Automated pass through all slides and steps at the five sizes, capturing screenshots and flagging any element wider than its container.
- No console or page errors, no external network requests (the deck stays fully offline).
- `/bankdemo` is not modified.

## Technical notes
- Shared width constant applied in `DeckmoDeck.tsx` and `DeckmoBankdemoScenes.tsx`, replacing the mixed `max-w-7xl` / `max-w-[1380px]` values.
- Fixed grid track widths (e.g. `1fr_370px_380px`) become min/max ranges so they scale.
- Reuse existing `clamp()` type sizing and `[@media(max-height:800px)]` compact rules rather than adding new breakpoints.
- Audit script under `/tmp/browser/deckmo-width-audit/`.
