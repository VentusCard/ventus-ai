

## Problem

When `selectedPillars` is empty (life event flows like "New Parents"), `generateSamplePersonas` falls back to the first 3 random pillar keys (Travel, Food, Wellness). Life event data is only appended as a minor addition, so personas end up dominated by irrelevant signals. The AI then generates travel/dining messages for a baby-focused flow.

## Plan

### Fix `generateSamplePersonas` in `src/lib/samplePersonaGenerator.ts`

Change the persona generation logic so that when life events are the primary context (no pillars selected), life event signals become the **sole source** for tags, transaction signals, and emojis:

- **When `selectedPillars` is empty AND `selectedLifeEvents` is not empty**: Use `LIFE_EVENT_SIGNALS` as the primary source. Each persona gets 2 tags and 2 signals from the life event data. Do NOT fall back to random pillars.
- **When both are provided**: Life event is primary, pillar is secondary (1 signal mixed in for variety).
- **When only pillars are provided**: Current behavior (pillar-based personas).

This means a "New Parents" flow will produce personas like:
- "Sarah M." — New Parent, Growing Family — "Baby product purchases", "Childcare payments"
- "James T." — Family Expansion, New Parent — "Family vehicle research", "Baby product purchases"

### Fix `PersonalizationPreviewPanel` in `src/components/tepilot/campaigns/PersonalizationPreviewPanel.tsx`

Send each persona's own profile/context to the AI edge function instead of only `profiles[0]` and `ctx[0]`. Build per-persona `profile` and `ctx` objects using that persona's actual `behavioralTags` and `transactionSignals`, so the AI generates contextually correct messages for each card.

