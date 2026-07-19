## Root cause

Two independent classifiers feed the Behavioral Intelligence panel on `/bankdemo`:

1. `analyze-lifestyle-signals` — the upstream detector that still returns "College Preparation for Dependent" as a life event.
2. `synthesize-persona` — the final LLM that owns the full taxonomy (Life Events, Financial Signals, Demographic, Spending Habits).

`ExecDemoPage` merges the upstream events into the Life Event row, so "College Preparation for Dependent" and "Kid → College" both show up. Pet leakage in Demographic is the same class of bug from a different angle: the final classifier's decision isn't fully respected downstream.

Per direction, the final LLM (`synthesize-persona`) is the sole authority. Upstream detectors and prompts stay untouched.

## Change

Make `synthesize-persona` output the single source of truth for the four pill rows on `/bankdemo`. Everything else is discarded or subordinated to it.

### 1. Stop merging upstream life events into the pills

In `src/pages/ExecDemoPage.tsx`:

- Keep calling `analyze-lifestyle-signals` only if other downstream views (product cards, offers) still need it. It must no longer contribute to the Life Event Detection row.
- The `detectedLifeEvents` state that feeds `ExecDemoIntelPanel` is populated exclusively from `synthesize-persona.detected_life_events` (plus external-intelligence signals bucketed as `life_event`, which are already authoritative).
- Remove the "promoted vs upstream" merge, `themeKey`, `keptUpstream`, `droppedUpstreamNames`, and `isBannedLifeEvent` logic — they exist only to reconcile two classifiers.

### 2. Render exactly what the final LLM returned

In `src/components/exec-demo/ExecDemoIntelPanel.tsx`:

- Life Event Detection row → `personaSynthesis.detectedLifeEvents` only.
- Financial Signals row → `personaSynthesis.financialSignals` only.
- Demographic row → `personaSynthesis.demographicShifts` only.
- Spending Habits row → `personaSynthesis.pillarRollups` only.

No client-side re-bucketing, no theme dedup across rows.

### 3. Thin cross-row dedup (final classifier still wins)

The only guard we keep is a strict "same item cannot appear in two rows" pass, using the classifier's own IDs / transaction indices — not our own keyword rules:

- If the same `event_name` string (case-insensitive) appears in both `detected_life_events` and `demographic_shifts`, keep it in whichever row the final LLM listed first and drop it from the other.
- If two rows share ≥ 1 transaction index, keep it in the higher-tier row per the ladder the final LLM already enforces (Life Event > Financial Signal > Demographic > Pillar Rollup), and remove the duplicate from the lower row.

That's it — no keyword lists, no pet regex, no college regex on the client. The LLM decides content; we only prevent literal duplicates.

### 4. Consequences the user will see

- No more "College Preparation for Dependent" in Life Event Detection when the final LLM has already classified it as "Kid → College" in Demographic.
- If the final LLM decides pet activity is Demographic, it stays in Demographic. If it decides pet activity is Spending Habits, it stays there. Either way, it never appears in two rows.
- Everything else in the Behavioral Intelligence panel comes straight from `synthesize-persona`, unfiltered.

## Files touched

- `src/pages/ExecDemoPage.tsx` — remove upstream/promoted life-event merge; feed `detectedLifeEvents` from `synthesize-persona` output only.
- `src/components/exec-demo/ExecDemoIntelPanel.tsx` — add the two-line cross-row duplicate guard described above; no other logic changes.

No edge function changes. No prompt changes. No changes to `analyze-lifestyle-signals`, `synthesize-persona`, or any other upstream file.