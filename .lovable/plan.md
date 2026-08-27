# Improve Signal-Family Card Legibility in Customer Intelligence Core

## Goal
Make the five signal-family cards in the dark Customer Intelligence Core panel easy to read at a glance while keeping the family color identity (blue / amber / emerald / violet / rose).

## Current State
- `src/components/tepilot/insights/CapabilitiesView.tsx` defines `SIGNAL_DARK_STYLE` and renders each card in `SignalSection`.
- Cards currently use left-to-right translucent gradients (`from-<family>-500/[0.38] via-<family>-500/[0.18] to-<family>-500/[0.04]`) with family-tinted text.
- The gradient creates uneven contrast behind the label and rolling ticker, and the tinted text (e.g. `text-blue-50`) can still feel dim against the colored wash.

## Proposed Changes

### 1. Solid, higher-opacity family backgrounds
Replace the gradient washes with a uniform, moderately saturated solid tint that is dark enough for white text:
- Behavioral: `bg-blue-600/30`
- Life Event: `bg-amber-600/30`
- Financial: `bg-emerald-600/30`
- Demographic: `bg-violet-600/30`
- Risk: `bg-rose-600/30`

Use a slightly stronger active state (`bg-<family>-600/45`) and a subtle hover lift (`bg-<family>-600/38`).

### 2. White / high-contrast typography
- Family label: switch from `text-<family>-50` to `text-white` with `drop-shadow-sm` for crispness.
- Detection count and "· 24h": `text-slate-200` for the metadata, count itself in `text-white font-semibold`.
- Rolling ticker "to" line: `text-white` / `font-medium`.
- Ticker "ev" line: keep `text-slate-300` but bump size to `text-[12.5px]`.
- Basis badge text: brighten to `text-slate-100`.

### 3. Stronger icon chips
- Enlarge chip to `h-6 w-6` with a fully opaque family background (`bg-<family>-500`).
- Icon color to `text-white` at `h-3.5 w-3.5`.
- Add a thin white/20 border so the chip pops off the card surface.

### 4. Wider, brighter left accent bar
- Increase left bar width from `4px` to `5px`.
- Use family-300 (`bg-blue-300`, etc.) for higher luminosity.

### 5. Lift cards off the dark panel
- Add a soft shadow: `shadow-[0_2px_10px_-4px_rgba(0,0,0,0.4)]`.
- Active card gets a `ring-2 ring-<family>-400/60` plus the stronger background.

### 6. Ticker readability
- Bump ticker row height from `h-6` to `h-7` and font size to `text-[12.5px]`.
- Increase opacity animation end-state for the outgoing row from `0.15` to `0.25` so it doesn't compete.

## Scope
Only `src/components/tepilot/insights/CapabilitiesView.tsx`. No data or interaction changes.

## Verification
- Open `/bankdemo` → System tab.
- Confirm each of the five cards is immediately readable from a normal viewing distance.
- Confirm family colors remain distinct: blue, amber, emerald, violet, rose.
- Check active and hover states still read clearly.
