

## Goal
When the user clicks a life-event pill (e.g. "Home Purchase", "College Preparation for Dependent") while on the **Next-Offer** tab, the corresponding LLM-generated deal collection should appear. Today the panel is empty because the filter in `NextOfferRationale` can't match the clicked life event to any returned offer group.

## Root cause
The `generate-next-offers` edge function relies on the LLM to echo each life event's `event_name` *verbatim* into the `rollup` field, and tags `pillar = "Life Event"`. In practice the LLM often:
- Paraphrases the label (e.g. "Home Purchase" → "New Home Transition", "College Preparation for Dependent" → "College Prep").
- Sometimes omits an event entirely if it dedups with a behavioral cluster.
- Sometimes returns a `pillar` other than `"Life Event"`.

`NextOfferRationale` then filters with:
- `pillar === "Life Event"` (strict)
- `rollup === activeTriggerLabel` exact, or substring either direction

If the LLM-returned label doesn't share a substring with the clicked event, the filter returns `[]` → "No offers generated for X yet."

There's also no console signal when the filter yields zero, which makes this silent.

## Fix — three-layer defense

**1. Backend (`supabase/functions/generate-next-offers/index.ts`)**
- Pass each life event into the prompt with an explicit `id` (e.g. `LE_1`) and require the LLM to echo that id alongside the rollup label, so we can deterministically map the response back to the input event regardless of label drift.
- Post-process: for each life event in the request, find the matching response group by id (preferred), then by exact label, then by fuzzy match. If still missing, **synthesize a minimal placeholder group** so the front end can render at least the collection card with the correct `rollup = event_name` and `pillar = "Life Event"`. This guarantees a 1-to-1 mapping.
- Force-overwrite `pillar = "Life Event"` and `rollup = <input event_name>` on every life-event group before returning, so labels always match what the UI clicks.

**2. Front end (`src/components/exec-demo/NextOfferRationale.tsx`)**
- Improve the matching: normalize, then exact → substring → token-overlap (≥1 shared significant word like "home", "college", "retirement"). 
- Add a `console.warn` listing available `rollup` labels when no match is found, so future drift is easy to spot.
- When `activeRollupPillar === "Life Event"` but no group matches, render a friendly "Generating offers for {event}…" state instead of "No offers generated yet" so it doesn't read as a final failure during the brief loading window.

**3. Page (`src/pages/ExecDemoPage.tsx`)**
- When `handleTriggerPillClick` fires for a life event and the analytics tab is active, also auto-switch focus to the Next-Offer view if the user isn't already there (only when triggered from a life-event pill, not a risk pill).

## Files touched
- `supabase/functions/generate-next-offers/index.ts` — add ids to life-event prompt, normalize response, guarantee 1-to-1 mapping.
- `src/components/exec-demo/NextOfferRationale.tsx` — token-overlap fallback matcher + diagnostic log + friendlier empty state.
- `src/pages/ExecDemoPage.tsx` — minor: ensure life-event clicks land on the analytics tab when on Next-Offer flow.

## Out of scope
- Changing life event detection logic.
- Redesigning the deal card layout.
- Persona synthesis prompt changes.

