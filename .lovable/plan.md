# Automated Flows: signal list with toggles + personalization detail

## What changes

Today, expanding a flow on `/bankdemo` → Automated Flows shows a grid of 3 microsegment cards with the campaign email baked into each card.

New behavior when a flow is expanded:

1. A compact **list of signals** for that product (one row per signal), instead of the card grid.
2. Each signal row has its own **on/off toggle** — bankers can decide which signals the flow acts on. Toggling off dims the row and removes its audience from the flow's live audience count.
3. Clicking a signal row **opens its hyper-personalization detail** in a panel beneath the row, showing the microsegment currently tied to that signal.

## Signal row (collapsed)

```text
[on/off]  [Life Event]  Newborn / toddler expense cluster        Audience 9.5M   >
          Clustered spend at baby supply retailers, pediatric copays...
```

- Type badge: amber for Life Event, blue for Behavioral (existing colors).
- Evidence line truncated to one line.
- Per-signal audience = flow audience split across enabled signals.

## Personalization detail (expanded signal)

Shown inline under the clicked row:

- **Microsegment name** and audience size
- **Why this fires** — the full evidence string
- **Personalized message** — subject line, body preview with `{{first_name}}` merge token, CTA button
- **Delivery**: channel chips (Email / In-app / Advisor brief) and a "Preview" affordance

Only one signal detail is open at a time per flow. All content comes from the existing microsegment catalog — no new copy generation, no backend calls.

## Header behavior

The flow row's audience number and the `N signals` chip reflect only enabled signals, so turning signals off visibly shrinks the flow's reach. Turning off all signals of a flow shows the flow as Paused.

## Technical notes

- Edit `src/components/tepilot/campaigns/ProductAutomatedFlowsView.tsx` only: replace `MicrosegmentCard` grid with a `SignalRow` list plus an inline `SignalDetail` block.
- Enabled-signal state: `Record<flowId, Set<signalLabel>>` in component state, defaulting to all enabled. Session-only, no persistence.
- Data sources unchanged: `PRODUCT_FLOWS` (signals) and `FLOW_MICROSEGMENTS` (matched by index, same as today).
- Strict light theme — white surfaces, `slate-200` borders, no `dark:` utilities.
