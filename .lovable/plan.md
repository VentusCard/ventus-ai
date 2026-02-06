
# Fix: Add Retry Logic for Failed Classification Batches

## Problem
The most recent classification run returned many "Miscellaneous & Unclassified" transactions because **Batch 2 classified 0 out of 24 transactions**:

```
[BATCH 1] ✓ Classified 24/24 
[BATCH 2] ✓ Classified 0/24  ← Problem!
[BATCH 3] ✓ Classified 24/24 
[BATCH 4] ✓ Classified 3/3
```

When the AI model returns empty results (no error, just no classifications), those 24 transactions fall back to "Miscellaneous & Unclassified" with `confidence: 0.1`.

## Root Cause
The `classify-transactions` edge function has **no retry logic**. When a batch fails silently (model returns empty tool_calls), the transactions are assigned fallback values instead of being retried.

## Solution
Add retry logic to the `classifyBatch` function to attempt classification up to 2 times before giving up.

## File to Update

### `supabase/functions/classify-transactions/index.ts`

**Add retry constants at the top:**
```typescript
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000;
```

**Update the `classifyBatch` function to include retry logic:**

```typescript
async function classifyBatch(
  batch: any[],
  batchIndex: number,
  totalBatches: number,
  sendEvent: Function,
): Promise<any[]> {
  const batchNum = batchIndex + 1;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const startTime = Date.now();
    
    if (attempt > 0) {
      console.log(`[BATCH ${batchNum}] Retry attempt ${attempt}/${MAX_RETRIES}`);
      await new Promise(r => setTimeout(r, RETRY_DELAY_MS));
    }
    
    sendEvent("status", {
      message: `Classifying batch ${batchNum}/${totalBatches}${attempt > 0 ? ` (retry ${attempt})` : ''}...`,
      progress: Math.round((batchIndex / totalBatches) * 100),
    });

    try {
      const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-lite",
          messages: [
            { role: "system", content: CLASSIFICATION_PROMPT },
            { role: "user", content: `Classify these ${batch.length} transactions:\n${JSON.stringify(batch, null, 2)}` },
          ],
          tools: CLASSIFICATION_TOOL,
          tool_choice: { type: "function", function: { name: "classify_batch" } },
          temperature: 0,
          max_tokens: 3500, // Increased from 2500
        }),
      });

      if (!response.ok) {
        console.error(`[BATCH ${batchNum}] Classification failed (${response.status})`);
        continue; // Retry
      }

      const data = await response.json();
      const toolCalls = data.choices?.[0]?.message?.tool_calls;

      if (!toolCalls || toolCalls.length === 0) {
        console.warn(`[BATCH ${batchNum}] No tool calls returned, retrying...`);
        continue; // Retry
      }

      const results = JSON.parse(toolCalls[0].function.arguments);
      const classifications = results.classifications || [];
      
      // If we got 0 classifications, retry
      if (classifications.length === 0) {
        console.warn(`[BATCH ${batchNum}] Empty classifications array, retrying...`);
        continue;
      }
      
      const elapsed = Date.now() - startTime;
      console.log(`[BATCH ${batchNum}] ✓ Classified ${classifications.length}/${batch.length} in ${elapsed}ms`);

      sendEvent("batch_complete", {
        batchIndex,
        batchNum,
        totalBatches,
        count: classifications.length,
        elapsed,
        model: "flash-lite",
        retries: attempt,
      });

      return classifications;
    } catch (error) {
      console.error(`[BATCH ${batchNum}] Error:`, error);
      // Continue to retry
    }
  }
  
  // All retries exhausted
  console.error(`[BATCH ${batchNum}] All ${MAX_RETRIES + 1} attempts failed`);
  return [];
}
```

## Key Changes

| Aspect | Before | After |
|--------|--------|-------|
| **Retry logic** | None | Up to 2 retries with 1s delay |
| **Empty results handling** | Immediately return `[]` | Retry before giving up |
| **max_tokens** | 2500 | 3500 (more headroom) |
| **Status messages** | Basic | Shows retry attempts |
| **Logging** | Silent failures | Explicit retry logs |

## Why This Fixes the Problem

1. **Transient model failures** are automatically retried
2. **Empty classifications arrays** trigger a retry instead of silent failure
3. **Increased token limit** gives the model more room to respond
4. **Better logging** helps diagnose future issues

## Expected Outcome

After this fix:
- Failed batches will be retried up to 2 times
- Fewer transactions will fall back to "Miscellaneous & Unclassified"
- Success rate should improve from 68% to closer to 95%+
