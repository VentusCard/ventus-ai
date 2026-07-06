## Replace 2 Repetitive Capability Tiles

### Goal
Remove the repetitive "Personalized advisor briefs" and "Leadership intelligence" tiles from the Coworker Inbox capabilities grid and replace them with fresh, non-repetitive capability tiles.

### Changes

1. **In `src/components/tepilot/coworker-inbox/CoworkerInboxView.tsx`**
   - Remove the `CapabilityTile` for **"Personalized advisor briefs"** (line 90).
   - Remove the `CapabilityTile` for **"Leadership intelligence"** (line 91).
   - Add a new tile: **"Always-on coverage"** — copy about Ventus operating 24/7 across time zones without downtime.
   - Add a new tile: **"Context memory"** — copy about remembering past conversations, client history, and thread continuity.
   - Keep the remaining 4 tiles unchanged: Continuous signal detection, Instant conversational replies, Draft generation, Coordinated hand-offs.
   - Choose appropriate Lucide icons for the two new tiles (e.g., `Clock` or `Globe` for always-on; `Brain` or `History` for context memory).

### Result
The capabilities grid stays at **6 tiles** but no longer repeats the Advisor/Leadership deliverables described in the collapsed header text above it. The two new tiles surface differentiating system-level capabilities (availability and memory) instead of role-specific outputs.