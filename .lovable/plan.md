In the `/bankdemo` Automated Flows (and Next-product) tabs, the "Ventus — autonomous activity" banner currently shows 5 rows and advances one row every 6 seconds via a discrete offset shift.

Make two changes to `src/components/tepilot/campaigns/AutonomousActivityFeed.tsx`:

1. **Half the visible height** — reduce the rendered row count from 5 to 3 (`slice(0, 3)`), and cap the list container with a fixed `max-height` that matches 3 rows plus their internal borders so the banner is roughly half as tall.
2. **Rolling / marquee effect** — replace the 6-second discrete interval with a continuous CSS `translateY` marquee. Render the full 8-item array twice (duplicated) inside the overflow-hidden container, then animate `transform: translateY` from `0` to `-50%` over a ~20s linear infinite loop so the feed appears to roll upward smoothly and seamlessly.

No other files need changes.