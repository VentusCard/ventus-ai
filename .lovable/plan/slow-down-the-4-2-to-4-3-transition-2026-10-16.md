## Slow down the 4.2 to 4.3 transition

- Description line: fade in over about 0.9s instead of 0.4s.
- Signal details: fade and slide up over about 0.9s.
- Transactions table: start about 0.5s later than it does now, then fade in over about 0.9s, so it clearly lands after the details.
- The other places that use this fade (another slide's panel and the list-item panel) keep their current speed.

## Technical details
- Add a slower `animate-fade-in-slow` (0.9s, same easing and `both` fill) in `tailwind.config.ts`; leave `animate-fade-in` at 0.4s.
- Use it on the Section 4 subtitle (DeckmoDeck.tsx Header when `animateSubtitle`), the 4.3 detail wrapper, and the table in RickySignalStory.tsx, raising the table delay from 150ms to 500ms.
- Re-check timing in the preview at 1546x903 with screenshots at roughly 0.3s, 0.8s and 1.6s.
