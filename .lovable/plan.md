

## Replace "⚡ Action" with "■ V Orchestration" in persona sub-bubbles

Swap the lightning bolt + "Action" label in each persona sub-bubble for the **Ventus V block + "Orchestration"** label. This reinforces that Ventus AI is the actor turning each insight into a downstream flow — and it visually ties the hero to the V branding used everywhere else (sidebar, chat panel, floating button).

### Visual change

**Before:**
```text
┌──────────────────────────┐
│ ⚡ ACTION                 │
│ Trigger pre-trip offer…   │
└──────────────────────────┘
```

**After:**
```text
┌──────────────────────────┐
│ [V] ORCHESTRATION         │
│ Trigger pre-trip offer…   │
└──────────────────────────┘
```

### Styling spec

- **V block**: 14×14px rounded square (`rounded-[3px]`), background = persona color, white bold "V" text inside (10px, font-black)
- **Label**: "Orchestration" — same uppercase 10px tracking-wide treatment as before
- Per-persona color stays — the V block tints to match the persona (travel blue, parent green, college purple), so each callout still feels distinct
- Action body copy stays unchanged

### Why this works in context

1. Reinforces V branding the user already established in the dashboard sidebar, chat panel, floating button
2. Names Ventus as the actor performing the orchestration — clearer cause→effect than a generic ⚡
3. "Orchestration" is more accurate than "Action" — these aren't single actions, they're multi-step flows (529 nudge + insurance review + debit card invite)
4. Visual weight is similar to the lightning bolt, so the layout doesn't shift

### File touched

- `src/components/ScrollDrivenHero.tsx` — only lines 333–339 (the label header inside each sub-bubble). Replace the `<span>⚡</span>` + `<span>Action</span>` with a small colored V-block + `<span>Orchestration</span>`.

### Technical detail

```tsx
<div className="flex items-center gap-1.5 font-semibold text-[10px] uppercase tracking-wide mb-1" style={{ color: p.color }}>
  <span
    className="flex items-center justify-center w-3.5 h-3.5 rounded-[3px] text-white font-black text-[9px] leading-none"
    style={{ background: p.color }}
  >
    V
  </span>
  <span>Orchestration</span>
</div>
```

No layout changes, no new components, no scroll-timing changes.

