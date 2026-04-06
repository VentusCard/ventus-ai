

## Color-Code Transactions with Their Associated Pills

### What this does
Transaction rows in the left panel will always show a subtle color indicator matching their pillar pill color — so you can visually see which transactions belong to which pill without having to click anything. When a pill is clicked, the existing highlight behavior stays but now the color connection is immediately obvious.

### Changes

**1. `src/pages/ExecDemoPage.tsx` — Pass signal map to left panel**

The left panel needs access to the signal map so each transaction row knows its pillar color. Add a new prop `signalMap` passing `execProfile.persona.signalMap` to `ExecDemoLeftPanel`.

**2. `src/components/exec-demo/ExecDemoLeftPanel.tsx` — Color-code every transaction row**

- Accept new `signalMap` prop (maps transaction index → `{ pillar, label }`).
- Import `getColor` from `ExecDemoIntelPanel`.
- In the "collected" phase (post-enrichment), render each `TxRow` with a colored left-border dot or tinted left border matching its pillar color from the signal map.
- `TxRow` gets a new optional `pillarColor` prop. When set and not in highlight/dim mode, it renders a subtle left border (`2px solid pillarColor` at ~40% opacity) and a tiny colored dot before the merchant name.

**3. `TxRow` component update**

```
// Current: plain rows unless highlighted
// New: always show pillar color indicator in collected phase

<div style={{
  borderLeft: highlight
    ? `2px solid ${highlightColor}`
    : pillarColor
      ? `2px solid ${pillarColor}40`
      : '2px solid transparent',
}}>
  {pillarColor && !dim && (
    <span className="w-1.5 h-1.5 rounded-full shrink-0"
      style={{ background: pillarColor }} />
  )}
  ...
</div>
```

This means:
- **Idle/scrolling**: no colors (unchanged)
- **Post-enrichment**: every transaction gets a subtle pillar-colored left border + dot
- **Filtered (pill clicked)**: matching rows get the full highlight treatment, non-matching rows dim but keep their faint color dot
- Colors match exactly because both pills and transaction indicators use the same `getColor(pillar).dot` value

### Files to edit
- `src/pages/ExecDemoPage.tsx` — pass `signalMap` prop
- `src/components/exec-demo/ExecDemoLeftPanel.tsx` — consume signal map, update `TxRow`

