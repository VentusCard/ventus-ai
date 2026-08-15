# Plan: Prefix AI Coworker destination titles

## Goal
On the `/bankdemo` AI Coworker tab, every destination title in the "Intelligence delivery destinations" list should read as "Coworker for {Team}" — e.g., "Coworker for Bank Leadership".

## Current state
The `TEAM_DESTINATIONS` array in `src/components/tepilot/coworker-inbox/coworkerInboxData.ts` stores plain team names such as "Bank Leadership", "Product & Growth", "Risk & Compliance", "Rewards & Deals", "Relationship Managers", and "Marketing / Campaign Ops". The `CoworkerInboxView.tsx` component renders `team.name` directly in the destination slivers.

## Proposed change
1. Update each `name` value in `TEAM_DESTINATIONS` to include the "Coworker for " prefix.
2. Verify the change renders correctly in the AI Coworker tab preview.

## Files to change
- `src/components/tepilot/coworker-inbox/coworkerInboxData.ts`

## Validation
- Open `/bankdemo` AI Coworker tab.
- Confirm each destination sliver title begins with "Coworker for ".
