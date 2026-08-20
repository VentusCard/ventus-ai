# Pulsing status dots across /bankdemo

Give the small colored indicator dots throughout the demo a subtle, continuous pulse so the console feels live — without turning the page into a light show.

## The pulse itself

One shared visual: the dot stays solid, and a soft halo of the same color expands and fades behind it (~2s loop, staggered slightly per row so a list doesn't blink in unison). Respects reduced-motion — the halo is simply not animated for users who ask for less motion.

## Where it gets applied

- Intelligence Database — behavioral / signal family dots (the sky, violet, amber, emerald, rose dots) in the family lists, portfolio tiles, segment chips, and the live signal stream rows.
- AI Coworker — the per-coworker / team accent dots in the inbox sidebar, persona settings team list, and live work stream.
- Signal and pillar dots reused in customer directory, pillar explorer, and cohort panels.
- Existing "live" green dots stay as they are (already pulsing) but move onto the same shared component so they look identical everywhere.

## Where it is deliberately NOT applied

- Legend/key swatches and chart series markers (static reference, not status).
- Dots inside dense tables where every row would pulse — those stay solid to keep the table readable.
- Bullet-style decorative dots in body copy.

## Technical notes

- Add a `pulse-dot` keyframe + utility in `src/styles/animations.css` (halo via a `::after` ring, `prefers-reduced-motion` guard).
- Add `src/components/tepilot/common/PulseDot.tsx`: props `colorClass`, `size` (sm/md), `pulse` (default true), `delayMs`. Renders the halo span plus the solid dot, forwarding `className`.
- Replace the inline `<span className={cn("h-2 w-2 rounded-full", ...)} />` dot markup with `PulseDot` in the files above (CoworkerInboxView, CoworkerPersonaSettingsView, CoworkerLiveStreamView, LiveSignalStream, CustomerPortfolioStats, CustomersDirectoryView, BankwidePillarExplorer, CapabilitiesView and the sibling insight panels using `SIGNAL_FAMILY_META.dot`).
- No data, color-token, or logic changes — colors keep coming from `SIGNAL_FAMILY_META` / `ACCENT_DOT`.
