

## Fix: Life Event pills should highlight evidence transactions

### Problem
Clicking a Life Event pill does a broad pillar match instead of highlighting the specific evidence transactions (e.g., COLLEGEBOARD SAT, KAPLAN TEST PREP, STANFORD VISITOR PARKING) that the AI returned as supporting evidence.

### Approach
Pass the evidence merchants directly through the pill click, then match transactions by merchant name.

### Changes

**`src/components/exec-demo/NextProductRationale.tsx`**
- For life-event card pills, find the matching `LifeEvent` from the `lifeEvents` prop using `card.signal_label` ↔ `event.event_name`.
- Pass the event's `evidence[]` merchant names via `onPillClick` as a new optional parameter (e.g., `evidenceMerchants: string[]`).
- Behavioral pills remain unchanged (pillar-based filtering).

**`src/components/exec-demo/ExecDemoIntelPanel.tsx`**
- Update `onPillClick` prop type to include optional `evidenceMerchants`.

**`src/pages/ExecDemoPage.tsx`**
- Extend `activePillFilter` state to support an optional `evidenceMerchants: string[]` field.
- In `filteredIndices`, when `evidenceMerchants` is present, match transactions by normalized merchant name against the evidence list instead of using pillar matching.
- Matching logic: normalize both sides (lowercase, strip punctuation) and check if either contains the other.

### Example flow
1. User clicks "College Preparation" pill
2. `onPillClick("Education & Family", "College Preparation", false, ["COLLEGEBOARD SAT", "KAPLAN TEST PREP", "STANFORD VISITOR PARKING"])`
3. `filteredIndices` finds transactions whose merchant names match those 3 evidence merchants
4. Left panel highlights exactly those 3 rows

