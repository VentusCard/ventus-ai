

## Filter Out Non-Life-Event Signals

### Problem
The `analyze-lifestyle-signals` edge function prompt includes "TYPE 2: STANDOUT TRANSACTION SIGNALS" (lines 267-272) which instructs the AI to return notable spending patterns (e.g., "Increased Pet Care Spending"), major purchases, and other non-life-event items prefixed with `[NOTABLE]`, `[URGENT]`, or `[OPPORTUNITY]`. These are not life events and pollute the life event detection results.

### Fix — `supabase/functions/analyze-lifestyle-signals/index.ts`

1. **Remove lines 267-272** — the entire "TYPE 2: STANDOUT TRANSACTION SIGNALS" section from the system prompt, including the three prefix categories (`[URGENT]`, `[NOTABLE]`, `[OPPORTUNITY]`).

2. **Update the OUTPUT REQUIREMENTS section** (lines 274-280) to explicitly state: "Only return genuine life events (college, home purchase, wedding, baby, retirement, career change, elder care, business formation, wealth transfer). Do NOT return spending pattern observations, notable purchases, or generic spending increases as life events."

3. **Add a server-side filter** after parsing the AI response (line 353): filter out any `detected_events` whose `event_name` starts with `[NOTABLE]`, `[URGENT]`, or `[OPPORTUNITY]` as a safety net in case the AI still returns them.

### Result
Life event detection returns only genuine life transition signals, not spending pattern observations.

