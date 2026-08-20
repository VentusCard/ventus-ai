# Rewrite the "Ventus — autonomous activity" rolling feed

The ticker still shows generic cohort/flow chatter (enrolling cohorts, detecting cohorts, drafting flows) that no longer matches what the Automated Flows tab is about. Rewrite it so every line is a concrete execution event on a channel: product email campaigns, digital banking pushes, card-app placements, SMS, and statement inserts.

## New content model

Replace the current action set (`Enrolled / Paused / Drafted / Optimized / Suppressed / Detected`) with channel-first actions:

- `Email sent` — product email campaign wave
- `App push` — digital banking push notification
- `In-app` — placement served in the banking app / card hub
- `SMS` — short-form alert
- `Optimized` — send-time / channel / creative change with measured lift
- `Held` — suppressed by frequency cap or governance guardrail

Each row reads: channel badge + what shipped (named product flow) + audience or measured result + time.

Example lines:
- App push — "Travel Card upgrade nudge to frequent-flyer spenders" — 4,180 delivered — 8m ago
- Email sent — "HELOC equity-tap wave 2, home-value uptick segment" — 12,400 sent — 26m ago
- In-app — "529 tile placed on dashboard for confirmed new parents" — 2,310 sessions — 1h ago
- Optimized — "Auto-Refi email moved to Tue 9am send window" — +18% opens — 2h ago
- SMS — "Overdraft-cushion line offer to repeat-fee customers" — 890 delivered — 3h ago
- Held — "Small-business LOC email paused, frequency cap hit" — 412 held — 5h ago
- Email sent — "Term Life cross-sell to new-mortgage cohort" — 6,750 sent — 7h ago
- App push — "Rewards boost reminder for lapsed dining spenders" — 3,020 delivered — Yesterday

About 10-12 rows so the loop feels alive.

## Technical changes

- `src/components/tepilot/campaigns/data/autonomousActivity.ts`: replace `ActivityAction` union and the `AUTONOMOUS_ACTIVITY` array with the channel-based events above; keep the same interface shape (`id`, `action`, `description`, `timeAgo`, `affected`).
- `src/components/tepilot/campaigns/AutonomousActivityFeed.tsx`: update `ACTION_META` to the new keys with matching icons (Mail, BellRing, LayoutTemplate/Smartphone, MessageSquare, TrendingUp, PauseCircle) and existing light-theme tone classes. Keep the marquee, row height, and header markup unchanged; the header subtitle stays "running 24/7 inside your guardrails".

No other files or logic change.
