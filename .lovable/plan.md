# Remove Gradient from /bankdemo Left Sidebar

## Goal
Replace the gradient background on the /bankdemo left sidebar with a flat, dark-blue surface while preserving the full-height layout and readable light text.

## Changes
1. Replace `bg-gradient-to-b from-[#0a0a1a] via-[#141432] to-[#1e1e5a]` on the sidebar container with a solid dark blue (`bg-[#141432]` or `bg-slate-950`).
2. Remove the ambient radial glow overlay (`bg-[radial-gradient(...)]`) so the surface is uniformly flat.
3. Keep all existing text colors, hover states, active states, collapse behavior, resize handle, and group dividers unchanged.

## Verification
- Open `/bankdemo` and confirm the left sidebar is a single flat dark blue with no visible gradient or glow.
- Confirm nav items, group labels, icons, hover/active states, and the collapse/resize controls still render correctly.
