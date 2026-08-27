# Brighten Customer Intelligence Core Signal Cards

## Goal
Increase the perceived brightness of the five signal-family cards in the System tab's "Customer Intelligence Core" panel so the family colors (blue, amber, emerald, violet, rose) read clearly against the dark background.

## Current State
- The cards are rendered by `SignalSection` in `src/components/tepilot/insights/CapabilitiesView.tsx`.
- Family styling lives in the `SIGNAL_DARK_STYLE` map (lines ~468–524).
- Current gradients use low opacity stops (e.g., `from-blue-500/[0.22] via-blue-500/[0.09]`) and thin/soft borders (`border-blue-400/30`), which makes the cards look washed out and grey on the dark panel.

## Proposed Changes

### 1. Increase surface gradient opacity
Raise the gradient start/mid opacity values across all five families so the family hue is visible at a glance:
- Start stop: from `0.22` → `0.38`
- Mid stop: from `0.09` → `0.18`
- End stop: keep a subtle fade to transparent (`0.04`–`0.06`)
- Hover: start `0.48`, mid `0.24`
- Active: start `0.55`, mid `0.30`, end `0.08`

### 2. Strengthen borders and rings
- Bump border opacity from `400/30` to `400/55` (or equivalent 300-level at `0.70`).
- Active ring from `ring-<family>-400/30` to `ring-<family>-400/50`.

### 3. Brighten supporting chrome
- Icon chip background: from `500/20` to `500/30`.
- Icon color: from `200` tint to `100` or white.
- Label text: keep `50` tints but ensure contrast remains crisp.
- Left accent bar: from `400` to `300` for more luminosity.
- Basis badge backgrounds (`DETECTION_BASIS_CLASS`) can remain as-is unless contrast suffers.

### 4. Keep behavior unchanged
- Rolling detection ticker animation stays the same.
- Card dimensions, spacing, selection logic, and the detail panel below remain untouched.

## Verification
- Open `/bankdemo` → System tab.
- Confirm the five signal cards look distinctly blue, amber/orange, emerald, violet, and rose against the dark panel.
- Confirm hover and active states are brighter without losing readability of the white text and rolling examples.
