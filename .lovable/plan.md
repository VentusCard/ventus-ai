
## What’s happening (why some batches still fail)
Even with retries, you can still get “empty classifications” for a batch because the `classify-transactions` backend function is currently doing **all batches in parallel**:

- 75 transactions → 4 batches (24/24/24/3)
- It fires **4 concurrent AI requests** to `ai.gateway.lovable.dev`
- Under load or transient instability, one request can come back with **no tool call / empty results** (your logs show this consistently for Batch 2)
- The retry loop currently retries the *same request shape* after a short delay, so it can repeatedly hit the same transient failure mode

So the system is resilient to occasional empties, but not to **repeatable empties under concurrency pressure**.

## Goal
Make classification robust so that:
1. Batches don’t fail due to concurrency/rate/load artifacts.
2. If a batch still fails after retries, we degrade gracefully by retrying with smaller payloads and/or a more reliable model.
3. We reduce “Miscellaneous & Unclassified” fallbacks to near-zero for normal inputs.

---

## Implementation plan (backend only)

### 1) Limit concurrency for batch classification (biggest win)
**Change:** Replace `Promise.all(batches.map(...))` with a small concurrency pool (e.g., 2 at a time, or even 1 for maximum reliability).

**Why:** This prevents simultaneous AI calls from competing and causing silent/empty tool call responses. In practice, concurrency=2 usually keeps throughput good while greatly improving reliability.

**Details:**
- Implement a simple `runWithConcurrency(items, limit, worker)` helper in `supabase/functions/classify-transactions/index.ts`.
- Emit SSE status updates as each batch starts/completes (you already do).
- Keep the same BATCH_SIZE (24) initially.

### 2) Add exponential backoff + jitter for retries
**Change:** Instead of fixed 1s delay, use exponential backoff with jitter:
- attempt 1: ~1s
- attempt 2: ~2–3s
- attempt 3: ~4–6s (if you decide to increase retries)

**Why:** If the gateway/model is temporarily degraded, fixed short delays often re-hit the same issue window.

**Details:**
- Keep `MAX_RETRIES = 2` or bump to `3` (I’d recommend `3` once concurrency is limited).
- Replace `RETRY_DELAY_MS` with a function `getDelayMs(attempt)`.

### 3) Fallback strategy when a batch still fails: split and retry smaller
**Change:** If a batch returns empty after all retries:
- Split that batch into 2 halves (or into size 8/8/8 chunks)
- Classify sub-batches sequentially (or with concurrency=1)
- Merge results

**Why:** Smaller payloads often avoid edge-case model/tool-call failures and reduce response complexity.

**Details:**
- Add `classifyBatchWithFallback(batch, ...)`:
  - try normal `classifyBatch`
  - if empty → split and classify parts
  - if still empty → final fallback classification as today

### 4) Optional “retry with stronger model” on the final attempt
**Change:** Keep the fast model for first attempt(s), but if we’re on the last retry (or after the first failure), switch to a more reliable model.

**Why:** Some models are faster but occasionally flake on forced tool calls. A stronger model used only for retries is a good cost/performance trade.

**Concrete option:**
- Attempt 0–1: `google/gemini-2.5-flash-lite`
- Final attempt (or fallback sub-batches): `google/gemini-3-flash-preview` or `openai/gpt-5-mini`

**Notes:**
- We’ll keep your tool schema and forced `tool_choice`.
- We’ll log which model succeeded to help diagnosis.

### 5) Improve observability for “empty tool calls”
**Change:** When empty tool calls happen, log:
- batch number
- attempt number
- response status
- (safely) whether `choices[0].message` exists
- and the first ~200 chars of raw response text if JSON parse fails

**Why:** Right now we know it’s empty, but not if it’s a gateway partial response, JSON shape mismatch, or a model hiccup.

---

## Files affected
- `supabase/functions/classify-transactions/index.ts`
  - Replace parallel `Promise.all` with concurrency-limited runner
  - Improve retry backoff
  - Add split-and-retry fallback
  - (Optional) model escalation on final attempt
  - Add stronger logs around empty tool_calls

No frontend changes required for this fix.

---

## Testing plan (end-to-end)
1. In `/tepilot`, run enrichment multiple times on the same dataset (75 txns) and confirm:
   - No batch logs show “All attempts failed”
   - Success rate rises significantly (target: >95%)
2. Try a larger dataset (e.g., 200–400 txns) to confirm stability:
   - Ensure SSE stays responsive
   - Ensure total runtime is acceptable
3. Force a “worst-case” scenario:
   - Temporarily set concurrency higher (dev check) to confirm failures correlate with concurrency (then keep it low)

---

## Rollout / risk
- Low risk: changes are contained to the classification backend function.
- Primary tradeoff: slightly slower classification (because fewer parallel calls), but materially more reliable results and fewer “Miscellaneous & Unclassified” fallbacks.

