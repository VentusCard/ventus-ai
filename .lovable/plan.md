

## AI-Generated Evolving Persona for Exec Demo

### Overview
Replace the hardcoded MCC-based signal mapping and static persona data with an AI-powered edge function that analyzes transaction data and returns progressive persona descriptions, signal classifications, lifestyle pills, and intelligence cards. The persona description evolves every ~10 transactions during the scroll phase.

### Edge Function: `generate-exec-profile`

**File: `supabase/functions/generate-exec-profile/index.ts`** (new)

Accepts `{ csv: string }` and returns:
```json
{
  "signalMap": { "0": { "pillar": "Travel", "label": "Airlines" }, ... },
  "pills": ["Wellness Explorer", "Career Focused", ...],
  "descriptions": {
    "10": "Active consumer with early travel and dining patterns",
    "20": "Health-conscious professional with premium fitness and organic grocery habits",
    "30": "Career-focused wellness enthusiast with frequent travel and sustainable brand preferences"
  },
  "intelligence": {
    "analytics": { "accent": "#60a5fa", "icon": "◆", "title": "Analytics Intelligence", "subtitle": "...", "content": "...", "txIndices": [0,2,8] },
    "rewards": { "accent": "#34d399", "icon": "★", "title": "Smart Rewards", "subtitle": "...", "pills": ["REI 10% Back", ...], "txIndices": [1,3,5] },
    "relationship": { "accent": "#fbbf24", "icon": "⚡", "title": "Relationship Intelligence", "subtitle": "...", "content": "...", "txIndices": [7,9,14] }
  }
}
```

- Uses Gemini 3 Flash Preview via Lovable AI gateway with tool calling for structured output
- Prompt instructs the model to classify each transaction row, generate 4-5 lifestyle pills, write 3-4 milestone descriptions (at tx counts 10, 20, 30, etc.), and compose intelligence card content
- Standard CORS headers, `LOVABLE_API_KEY` auth

### Data Layer Changes

**File: `src/components/exec-demo/execDemoData.ts`**
- Add `descriptions: Record<number, string>` to `ExecPersona` interface (milestone-keyed evolving descriptions)
- Export `parseCsvToTransactions` for reuse
- Add `buildExecProfileFromAI(csv, aiResult)` helper that constructs the full profile object from edge function response
- Keep existing hardcoded profiles as fallback, but add a function to call the edge function and replace them

### Intel Panel Changes

**File: `src/components/exec-demo/ExecDemoIntelPanel.tsx`**
- Track `processedSignals.length` and derive current description from `persona.descriptions` (highest milestone key ≤ signal count)
- Render the description as italic text below the signal pill rows
- Cross-fade between descriptions when milestone changes (CSS transition on opacity with key swap)

### Page Orchestration

**File: `src/pages/ExecDemoPage.tsx`**
- On `handleRunAnalysis`, call the edge function with the customer's CSV data
- Store the AI-generated profile in state
- Pass it to `ExecDemoIntelPanel` instead of the hardcoded profile
- Show a loading indicator while the edge function processes
- Fallback to hardcoded data if the edge function fails

### Custom Customer Input

**File: `src/components/exec-demo/ExecDemoLeftPanel.tsx`**
- Add a "Custom" option in the customer selector
- When selected, show a textarea for pasting CSV + "Generate" button
- On submit, call the same edge function
- Loading state with spinner while processing

### Files
1. `supabase/functions/generate-exec-profile/index.ts` — new edge function
2. `src/components/exec-demo/execDemoData.ts` — add descriptions field, export helpers, add AI profile builder
3. `src/components/exec-demo/ExecDemoIntelPanel.tsx` — render evolving description
4. `src/components/exec-demo/ExecDemoLeftPanel.tsx` — custom input UI
5. `src/pages/ExecDemoPage.tsx` — call edge function, manage AI profile state

