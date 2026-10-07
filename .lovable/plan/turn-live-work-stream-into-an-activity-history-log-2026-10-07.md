# Turn "Live Work Stream" into an Activity History log

## What changes

The last button on the AI Coworker tab becomes **Activity History**, and the screen behind it stops behaving like a live feed and starts reading like a record of everything the coworker has said and heard.

**The button**
- Label: "Live Work Stream" → "Activity History".
- Icon: the live-broadcast dot is replaced with a clock-and-arrow history icon.
- Position unchanged: still last, after Coworker Dashboard, User View, Persona Settings, and Integrations.

**The screen behind it**
- Entries are grouped under day headings: **Today**, **Yesterday**, then dated headings such as "Mon, Oct 5". Each day is a separate block, most recent day first.
- Every entry carries an exact clock time (9:12 AM) instead of "3 min ago". A small "time ago" line stays only in the side panel, where it helps.
- The "Streaming live" banner is replaced with a quieter history header: a range line ("Last 3 days · 4,120 logged actions") plus the same sent / replies / signals totals, framed as this week.
- The message list becomes a proper log: one line per message, with a sent or received arrow, a category chip, who it involved, and what it was about. Sent and received are visually distinct so the back-and-forth reads at a glance.
- Filters move from "All / Sending / Replies / Signals / Hand-offs" to **All / Sent / Replies / Signals / Hand-offs**, and the person filter chip stays — click someone in the side panel and the log narrows to their exchanges.
- The side panel becomes **Working with**: each person shows how many exchanges are on record and when the last one was, instead of a live "who's active right now" read.
- The trickle stays, but slows to roughly one new entry every 12–20 seconds. New entries land at the top of Today with a brief highlight, so the log visibly grows without pulling attention. Nothing else on the page moves.
- The small "static demo" note at the bottom stays as-is.

**What does not change**
- The five subtab buttons and their order, other than the rename.
- The coworker dashboard, user view, persona settings, and integrations screens.
- The wording of the log entries themselves — the same briefs, replies, signals, and hand-offs, just presented as history across several days.
- Strict light theme: white surfaces, slate borders, no dark-mode styling.

## Where this shows up

The same screen is reached from the /bankdemo AI Coworker tab, from the demo overlay, and from slide 9 of /deckmo (which embeds the real platform). All three get the change together.

The deck's own copy that lists the coworker's screens is in the deck script; the name there is updated to "Activity History" so the deck and the product agree. That list is currently also missing "Integrations" — say the word if you would rather it stay out.

## Technical details

- `src/components/tepilot/insights/BankwideWMCopilotView.tsx`: subtab label "Live Work Stream" → "Activity History", icon `Radio` → `History`, internal view key `stream` → `history`.
- `src/lib/deckmoScript.ts` (coworker module config): rename the entry in the `sections` list.
- `src/components/tepilot/coworker-inbox/CoworkerLiveStreamView.tsx`: rewrite the render as a day-grouped log.
  - Group the visible entries by calendar day, most recent day first; each group gets a sticky-feeling day header with a count.
  - Replace `relativeTime` in log rows with a new absolute clock-time formatter; keep `relativeTime` for the side panel's "last exchange".
  - Header: drop the pulse dot and "Streaming live"; show range + totals instead.
  - Trickle interval: change the 2.5–5s random delay to 12–20s; keep the single-insertion highlight animation.
  - Raise the entry cap so several days of history fit (roughly 120 entries), container scrolls.
- `src/components/tepilot/coworker-inbox/coworkerStreamData.ts`: extend `seedStream` to spread entries across the last three days (denser in business hours, thinner overnight and at the weekend) so every day heading has real content; add `clockTime(at)` and `dayLabel(at, now)` helpers; keep the existing template pool untouched.
- No new tables, no backend or database work, no new dependencies.

## Verification

- Playwright at 1376×855 and 1590×1024: open /bankdemo, the AI Coworker tab, then Activity History.
  - Day headings for Today, Yesterday, and an earlier dated day all render with entries under them.
  - Every log row shows an exact time; filters for Sent, Replies, Signals and Hand-offs each narrow the list; the person chip narrows to one colleague.
  - A new entry arrives within about 20 seconds and lands at the top of Today without shifting anything else on the slide.
  - The panel does not jump or resize between subtabs.
- Confirm the same tab reads correctly inside slide 9 of /deckmo at both sizes.
- Typecheck clean, build log clean.
