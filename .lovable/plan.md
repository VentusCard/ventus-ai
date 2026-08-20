# Fix: "Live generation didn't return for this customer"

## Updated read of the cause

Two separate things show up in the signals, and the credit top-up likely resolves the live one.

1. Backend function logs from the last few minutes show `generate-next-offers` booting, matching both life events, and returning 5 groups. So the deployed functions are up and answering — this is not a dead-backend situation right now.
2. The preview network snapshot captured earlier shows both calls going to the local-development fallback address and failing instantly. That snapshot predates the current state and matches an earlier session where the frontend backend variables were empty.
3. Out-of-credits (a 402 from the AI gateway inside the function) produces exactly this banner: the call completes, but returns no offers/cards, so the store marks the customer `failed` and the UI falls back to static content.

Given the credits were just reloaded, the most likely remaining state is simply a stale cached `failed` entry plus needing a fresh attempt.

## Plan

1. Reload `/bankdemo`, open a Personalization tab and select Ricky, and watch the two calls end to end (status code plus response body) to confirm they now return offers and product cards.
2. If the calls still return empty, read the function logs for the AI gateway status to distinguish a credit/rate error from an empty model response, and surface that status in the banner instead of the generic "didn't return" wording.
3. If the calls are again hitting the local fallback address, restore the three backend environment variables in the project env file (keeping the Google Maps entries intact) and restart the dev server.
4. Add a retry affordance so a transient failure doesn't require reselecting the customer: a "Retry" action on the banner that clears that customer's cached entry and refires generation.

## Notes

- No changes to prompts, generation payloads, or edge-function logic.
- Step 4 is the only behavior change; steps 1-3 are verification and environment repair.
