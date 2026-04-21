

## Change

Rename the vice subcategory from **"Adult Content"** to **"Adult Entertainment"** and broaden the detection to cover the wider venue + service surface (strip clubs, cam sites, adult streaming subs, escort-adjacent services), not just MCC 5967.

No data changes to Sarah's CSV. Single edge function.

## Files Changed

**`supabase/functions/detect-risk-transactions/index.ts`** — three coordinated updates:

1. **Deterministic pre-pass (`deterministicFlags`)** — extend MCC 5967 branch and add a merchant-keyword pass:
   - Keep MCC 5967 → label becomes `"Adult Entertainment"`.
   - Add MCC 5813 (Drinking Places / Bars) **only when** merchant name matches strip-club keywords (`STRIP`, `GENTLEMENS`, `GENTLEMEN'S`, `CABARET`, `SPEARMINT RHINO`, `SAPPHIRE`, `RICK'S CABARET`, `SCORES`, `CRAZY HORSE`, `PENTHOUSE CLUB`) — bars alone are not flagged.
   - Add merchant-name keyword scan across any MCC for: cam-site processors (`CHATURBATE`, `STRIPCHAT`, `CAMSODA`, `LIVEJASMIN`, `BONGACAMS`, `MYFREECAMS`, `CAM4`), adult streaming subs (`ONLYFANS`, `FENIX INTL`, `FANSLY`, `MANYVIDS`, `JUSTFORFANS`, `POSE`, `MINDGEEK`, `MG BILLING`, `PORNHUB`, `BRAZZERS`, `ADULT TIME`), adult content processors (`CCBILL`, `EPOCH.COM`, `SEGPAY`, `ROCKETGATE`, `VENDO`, `NETBILLING`, `VERIFCARD`), and escort-adjacent (`ESCORT`, `COMPANION SERVICES`, `MASSAGE PARLOR` — explicitly NOT therapeutic/medical massage; only flag when accompanied by ambiguous high-cost amount or escort keyword).
   - Severity: `medium` for single events, `high` if ≥3 adult-entertainment hits OR aggregate spend ≥$500 in the dataset.
   - Reason strings reference the specific signal (e.g. "Strip-club merchant pattern (MCC 5813 + 'GENTLEMENS')", "Adult streaming subscription processor (Fenix International / OnlyFans)", "Cam-site billing platform").

2. **System prompt (`SYSTEM_PROMPT`)** — under the **vice** group, replace "adult content" with:
   > "**Adult Entertainment** — adult content subscriptions (OnlyFans, Pornhub network, Fansly), cam sites, strip clubs / gentlemen's clubs, escort-adjacent services, adult-content payment processors (CCBill, Epoch, Segpay, Fenix International)."
   
   Add the matching `category_label` example: `"Adult Entertainment"` (drop `"Adult Content"`).

3. **`normalizeLabel` callers / dedupe** — no logic change; the new label flows through automatically. Add a small label-alias map so any model-emitted `"Adult Content"` is normalized to `"Adult Entertainment"` before dedupe, preventing duplicate pills if the model uses the old phrasing.

## Frontend touch points to verify (no edits expected)

- Risk panel in `/demo` overlays renders `category_label` as-is — will display "Adult Entertainment" automatically.
- Search the codebase for hardcoded `"Adult Content"` strings in UI components; if any are found that filter/group by exact label, alias them or update the literal. Likely candidates: `src/components/demo/DemoDetailOverlay.tsx`, `src/components/exec-demo/NextConversationRationale.tsx` (already references `"adult"` keyword, fine). FVI module (`src/lib/fviData.ts`, `src/components/tepilot/insights/fvi/*`) uses `"Adult Content"` for its own separate dashboard — leave untouched (different feature, different surface).

## Verification

- /demo → any customer whose CSV contains MCC 5967 (e.g. Sarah's `PRIVATE MEDIA GRP LLC` until/unless removed): risk panel shows the flag labeled **"Adult Entertainment"** instead of "Adult Content".
- Synthesize a quick test by temporarily editing one merchant in a sample CSV to e.g. `SPEARMINT RHINO LV` (MCC 5813) → confirms strip-club path fires.
- Insert a row `CHATURBATE.COM` MCC 5969 → confirms cam-site keyword path fires regardless of MCC.
- No regression: ordinary bars (`THE OLD FASHIONED BAR` MCC 5813) and therapeutic spas (`ELEMENTS MASSAGE` MCC 7298) are NOT flagged.
- Edge function logs show single-pass dedupe and no duplicate "Adult Content" + "Adult Entertainment" flags on the same transaction.

