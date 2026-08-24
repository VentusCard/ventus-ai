# Make Channel Numbers Consistent with the Signal Corpus

## Problem
The governance rail now counts everything in signals: 233 total signals, 220 cleared both approval gates (94%). But the three channel chips still show hardcoded flow counts — Digital 41, Email 58, SMS 17 (116 total) — which don't tie to anything on the rail. The Channels stage headline number is just their sum, so it reads as unrelated to the 220 signals that are actually live.

## Change
Derive channel counts from the cleared-signal count (220) instead of hardcoding them:

- Channels headline = 220 (signals live on at least one channel), matching the rail.
- Each channel gets a share of those 220 signals, so the chips read as "how many of the live signals run on this channel" rather than an unexplained flow count:
  - Digital banking — all cleared signals (highest coverage), status Live
  - Email — large majority subset, status Live
  - SMS — small subset (cost/consent capped), status Capped
- Keep the reach strings (sessions / sent / delivered per 24h) as-is, scaled so they stay plausible against the new counts.
- Tooltips keep showing full label, reach, and status.

## Technical notes
- `src/components/tepilot/campaigns/data/flowGovernance.ts`: replace the literal `flows` values in `CHANNEL_STATS` with values computed from `FLOW_GOVERNANCE.readySignals` (fixed share factors, rounded), so any future change to the signal corpus or pending counts flows through automatically.
- `src/components/tepilot/campaigns/FlowGovernanceCard.tsx`: change the Channels tile headline from the sum of channel flows to `readySignals` (channels overlap, so summing double-counts). No layout changes.
- Uniform tile height, light theme, and tooltip behavior stay unchanged.
