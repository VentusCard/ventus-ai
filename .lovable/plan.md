

## Add "Signal Activation" Beat After Life Event Reveal

Insert a new Beat 5 between the current Beat 4 (life event reveal) and Beat 5 (disconnected data). This beat demonstrates what the bank can **do** with the detected signal by combining it with demographics to power three downstream capabilities.

### Mechanism

New `beat5Phase` state with 4 phases (current `beat5Phase` logic shifts to `beat6Phase`):

- **Phase 0**: The "Expecting a Baby" signal badge animates up into a header. Below it, a demographics card fades in showing location-aware profile info (e.g., "Sarah M. · 32 · Chicago, IL · HHI $145K · Married"). A merge animation connects them.
- **Phase 1** (click): Three output cards appear — **Personalized Rewards**, **Personalized Relationship**, **Analytics Signal** (in that order per user request).
- **Phase 2** (click): Expand Personalized Rewards with hyper-personalized detail referencing location: "Chicago-area baby boutique deals · Personalized messaging · Lifestyle-matched offers near you"
- **Phase 3** (click): Expand Personalized Relationship: "Wealth manager alerted · Automated event prep · Next-step recommendations"

Analytics Signal stays as a static card (no expand phase) — it's the third item to reinforce the "signal feeds everything" message.

### Changes to `src/components/demo/DemoPasswordGate.tsx`

1. **`TOTAL_BEATS`**: 7 → 8
2. **`BEAT_SUMMARIES`**: Insert at index 5: "One signal activates personalized rewards, relationship management, and analytics."
3. **State**: Rename current `beat5Phase` → `beat6Phase`. New `beat5Phase` for signal activation (max phase = 3).
4. **`advance` / `goBack`**: Add phase logic for step 5 (max 3). Update old step 5 refs to step 6 with `beat6Phase`.
5. **Step index shift**: Old Beat 5 (Disconnected data) → `displayStep === 6`, card label "04". Old Beat 6 (Reveal) → `displayStep === 7`. Update reveal effect trigger to `step === 7`.
6. **New Beat 5 JSX** (`displayStep === 5`):
   - Card label: "03"
   - Heading: "One signal. Three personalized actions."
   - Subtitle: "Combine the life event with the customer's demographics — every downstream system activates."
   - Phase 0: Life event badge + demographics card with location emphasis
   - Phase 1+: Three cards:
     - 🎁 **Personalized Rewards** — Phase 2 expands with location-aware detail
     - 🤝 **Personalized Relationship** — Phase 3 expands with advisor workflow detail
     - 📊 **Analytics Signal** — "Behavioral cluster updated · Segment migration triggered" (static, no expand)
7. **Old Beat 5 card label**: "03" → "04"

**File**: `src/components/demo/DemoPasswordGate.tsx`

