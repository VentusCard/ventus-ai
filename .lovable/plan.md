## Goal
On the System tab, the signal detail panel should be hidden by default. It only appears when the user clicks a signal chip. Clicking the active chip again collapses the panel.

## Change
Single file: `src/components/tepilot/insights/CapabilitiesView.tsx`

1. **State** — change `useState<string>("Life Event")` → `useState<string | null>(null)`.
2. **Chip onClick** — toggle: `setActiveSignalLabel(prev => prev === s.label ? null : s.label)`.
3. **Active resolution** — `const activeSignal = activeSignalLabel ? SIGNALS.find(...) : null`.
4. **Render guard** — wrap the entire detail panel `<div>` (header + 2-col grid + top border + animation wrapper) in `{activeSignal && (...)}` so nothing renders until a chip is clicked.
5. **Chip helper text** — update the core card subtitle from "Five signal families · click to inspect" to remain the same (already invites clicking).
6. **No other changes** — wires, sources, destinations, and footer row stay as-is.
