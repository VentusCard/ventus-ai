# Merge Intelligence Delivery Destinations into Capabilities Card

## Goal
Consolidate the two separate Coworker Dashboard sections — "Ventus AI Coworker Capabilities" and "Intelligence Delivery Destinations" — so every team destination is listed inside the capabilities card instead of only Advisor and Leadership.

## Current state
- `CoworkerInboxView.tsx` renders a collapsible "Ventus AI Coworker Capabilities" panel that, when expanded, shows only two role descriptions (Advisor, Leadership) followed by six generic capability tiles.
- Below it, a separate "Intelligence Delivery Destinations" grid shows six team cards (Bank Leadership, Product & Growth, Risk & Compliance, Rewards & Deals, Relationship Managers, Marketing / Campaign Ops) with weekly email counts, stats, and insight bullets.

## Proposed changes

### 1. Move all team destinations into the capabilities panel
- Replace the current Advisor + Leadership-only role descriptions inside the expanded capabilities panel with a grid/list of all six `TEAM_DESTINATIONS`.
- Each destination item keeps its existing data: team name, email type, weekly count, trend delta, two stats, insight bullets, and last-delivery timestamp.
- Use the existing accent colors and channel badges so the visual identity of each team is preserved.

### 2. Keep the generic capability tiles as the "how it works" section
- Retain the six capability tiles (Continuous signal detection, Insight emails, Context memory, Instant conversational replies, Always-on coverage, Coordinated hand-offs) inside the same expanded panel, below the team destinations.
- This makes the capabilities card self-contained: first *who* Ventus emails, then *how* it works.

### 3. Remove the standalone "Intelligence Delivery Destinations" section
- Delete the separate grid section and its heading from `CoworkerInboxView.tsx`.
- Remove the now-unused `teamsCount` variable and any orphaned imports.

### 4. Preserve surrounding layout
- Keep the status header strip and the four KPI cards exactly as they are.
- Keep the footer disclaimer.
- Ensure the panel remains collapsible and the page scrolls cleanly.

## Files to change
- `src/components/tepilot/coworker-inbox/CoworkerInboxView.tsx`

## Outcome
The Coworker Dashboard will have one unified capabilities panel that lists every intelligence destination and explains the underlying capabilities, eliminating the duplicated section below.
