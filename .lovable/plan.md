

## Plan: Remove Beat 6 (Status Quo) and Move "Enter Demo" to Beat 5

### Summary
Delete the entire Beat 6 section (the "Status Quo" / flow diagram beat) and add the "Enter Demo →" button to the end of Beat 5 ("Behavioral Signal + Demographics = Personalization"). Beat 5 becomes the final beat.

### Changes — `src/components/demo/DemoPasswordGate.tsx`

**1. Update constants (line 7)**
- `TOTAL_BEATS = 7` → `TOTAL_BEATS = 6`
- Remove the last entry from `BEAT_SUMMARIES` array (line 16)

**2. Update `advance` logic (~lines 46-60)**
- Remove the `if (s === 6)` block that handles beat6Phase
- Change beat 5 to be the final beat: after beat5Phase reaches 3, one more click shows the "Enter Demo" button (beat5Phase 4), then stop advancing
- Update the beat5Phase max from 3 to 4

**3. Update `goBack` logic (~lines 83-86)**
- Remove the `if (step === 6 && beat6Phase > 0)` block
- Remove `setBeat6Phase(0)` reset

**4. Remove `beat6Phase` state (line 27)**
- Delete `const [beat6Phase, setBeat6Phase] = useState(0)`

**5. Add "Enter Demo" button to Beat 5 section (~after line 762)**
- After the three personalization cards, add the Enter Demo button (from current beat 6, lines 966-982), shown when `beat5Phase >= 4`

**6. Delete Beat 6 section entirely (lines 767-983)**
- Remove the entire `{displayStep === 6 && (...)}` block

**7. Clean up dependencies**
- Remove `beat6Phase` from the `advance` and `goBack` dependency arrays

