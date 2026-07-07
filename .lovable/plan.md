Scrub the first WM Coworker conversation (Advisor Conv. Demo → Daily Digest).

## 1. Rename Copilot → Coworker (sender identity)

In `AdvisorNotificationsView.tsx` and `LeadershipNotificationsView.tsx`:

- `VENTUS.name`: "Ventus AI Copilot" → "Ventus AI Coworker"
- `VENTUS.email`: "[copilot@ventusai.com](mailto:copilot@ventusai.com)" → "[wmcoworker@ventusai.com](mailto:coworker@ventusai.com)"
- To-line label: "Ventus AI Copilot" → "Ventus AI Coworker"
- Footer: "Sent by Ventus Copilot · ventusai.com" → "Sent by Ventus Coworker · ventusai.com"

## 2. Trim digest to a short, coverable list

In the digest render (`rows.slice(0, 6)`):

- Cap each section at 3 rows.
- Cap total displayed to ~8 rows: Act Now up to 3, Opportunities up to 3, At Risk up to 2.
- Update intro paragraph to a shorter framing ("A short list this morning — the handful worth your attention. Reply on any name to go deeper.").

## 3. Add specific product offer per row

Add helper `offerFor(eventType)` mapping event types to a concrete recommendation:

- business_liquidity → Short-term T-bill / money-market parking + diversified deployment
- wealth_transfer → Trust review + estate/gifting strategy
- retirement → Retirement income plan + Medicare/Social Security timing
- elder_care → Care-cost planning + POA/trust checkpoint
- college_prep → 529 top-up + 529-to-Roth rollover eligibility check
- home_purchase → Bridge financing / jumbo mortgage pre-qual
- new_child → 529 open + term life review
- fallback → Household planning check-in

Render below the evidence/confidence line as: `Recommended offer: <text>`.

## 4. Fix confidence scale (100× lower, as stated)

Change display so raw 0.90 renders as "0.9%" instead of "90%":

```
const confidencePct = (event.confidence ?? Math.min(0.95, event.urgencyScore * 0.18 + 0.1)).toFixed(1);
```

Render `{confidencePct}% confidence`.

## Files touched

- `src/components/tepilot/advisor-console/AdvisorNotificationsView.tsx` — identity strings, row cap, offer helper + line, confidence formatting, intro sentence.
- `src/components/tepilot/advisor-console/LeadershipNotificationsView.tsx` — identity strings only (Copilot → Coworker).

## Out of scope (ask if wanted)

- Renaming internal tab id `wm-copilot`, `BankwideWMCopilotView`, `WMCopilotSignInDialog`, sessionStorage key `wm_copilot_launch_client`.
- Later conversations in the Advisor demo (messages 2–7), Leadership demo, and Coworker Inbox threads — will scrub next on your go-ahead.

## Confidence interpretation check

"100x too high" is taken literally (90% → 0.9%). If you meant "tone to realistic AI numbers like 8–25%" instead, tell me before I implement and I'll swap the formula.