Add AI-generated personalized outreach pointers to the **Ventus AI Insight** section of the WM CoPilot view.

### Backend
Create `supabase/functions/generate-outreach-pointers/index.ts`:
- POST with body `{ customerName, personaTitle, personaSummary, lifeEvents: string[] }`.
- CORS headers, OPTIONS handler.
- Calls the Lovable AI Gateway (`https://ai.gateway.lovable.dev/v1/chat/completions`) with `LOVABLE_API_KEY`, model `google/gemini-2.5-flash`.
- System prompt: senior wealth advisor, return JSON `{ pointers: string[] }` with **3 short, vaguely-specific outreach pointers** tailored to the customer's persona + the detected life event(s). Each pointer ≤ 18 words, opportunity-framed (no risk/stress language per project rules), no specific dollar amounts.
- Returns parsed `{ pointers: string[] }`.

### Wiring (props plumbing)
- `WMCopilotPhoneView` gains optional props `personaTitle?: string`, `personaSummary?: string`.
- `ExecDemoPhoneView` adds matching pass-through props.
- `ExecDemoPage.tsx` passes `execProfile.persona.title` (and the resolved `personaDescription` already computed in the intel panel — replicate the simple lookup here, or pass `execProfile.persona.title` only and a short fallback). For minimal scope, pass `personaTitle = execProfile.persona.title`; `personaSummary` is optional.

### WMCopilotPhoneView changes
- New state: `pointers: string[] | null`, `pointersLoading: boolean`.
- `useEffect` keyed on `[fallbackSignal.label, secondarySignalLabel, displayName]`: call the edge function via `supabase.functions.invoke('generate-outreach-pointers', { body: {...} })`. Aborts on unmount via a `cancelled` flag.
- Render order in the **Ventus AI Insight** section:
  1. Existing static `brief.insight` paragraph (unchanged).
  2. New sub-block titled "Personalized Outreach Pointers" — bullet list of `pointers` with the same purple/rose dot styling. While loading, show 3 shimmer rows. On error, hide the sub-block silently.
- No changes to Next Steps or Tasks Automated sections.

### Scope
- New file: `supabase/functions/generate-outreach-pointers/index.ts`.
- Edited: `WMCopilotPhoneView.tsx`, `ExecDemoPhoneView.tsx`, `ExecDemoPage.tsx`.
- No DB changes. No new dependencies.