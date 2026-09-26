# Make section 9 a live, clickable bank platform

## What changes
Section 9 already renders the real platform, but it is locked: clicks, scrolling and typing are switched off, so it behaves like a screenshot. We will unlock it so you can click through the sidebar, open reports, scroll views and use the Ventus AI chat directly inside the slide.

- 9.1 opens on Ventus AI, 9.2 on Automated Flows, 9.3 on WM Copilot (as today). Each beat starts fresh on its tab.
- Everything is clickable and scrollable inside the framed window.
- Arrow keys still move slides unless you are typing in a field inside the platform (same rule as the phone chat).
- Scrolling inside the platform scrolls the platform, not the deck.
- The rest of the site's /bankdemo page and other deck slides are unchanged.

## Technical details
- `AnalyticsContainer.tsx`: add explicit `interactive?: boolean` prop; when true, skip the `pointer-events-none select-none` class (line 437) while keeping other presentation-mode behavior (e.g. no auto-open effects at line 215).
- `DeckmoBankdemoScenes.tsx` `ExactWorkspace`: pass `interactive`; add `data-deck-interactive` and stop wheel propagation so deck scroll-snap doesn't hijack scrolling; key by tab so beats reset.
- Deck keyboard handler (DeckmoDeck.tsx): ignore arrow keys when the event target is an input/textarea/contenteditable (confirm existing guard covers it).
- Dialogs/popovers opened from the platform render in portals; verify they appear above the deck and stay light theme.
- Verify with Playwright at 1691×1011 and 1540×855: click sidebar items on 9.1–9.3, scroll a report, type in the AI chat, then arrow to next slide.
