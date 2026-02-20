
## Change classify-transactions Fetch URL

### What Changes

**File:** `src/hooks/useSSEEnrichment.ts`

**Location:** Lines 89–102, inside `callClassifyTransactions`

**Current code (lines 90–92):**
```ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const url = `${supabaseUrl}/functions/v1/classify-transactions`;
```

**Replacement:**
```ts
const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const url = `https://dy3pwpbu34.execute-api.us-east-2.amazonaws.com/classify-transactions`;
```

The `supabaseUrl` variable is only used to build the classify-transactions URL, so it is removed. The `anonKey` variable and all headers (`Authorization`, `apikey`), the request body, the retry logic, and the SSE stream parsing are all left exactly as-is.

### Scope

This is the only location in the entire codebase that references the classify-transactions endpoint. The travel-detection endpoint (`callEnrichTransactions`, line ~160) is a separate call and is not touched.

### Risk

Low. It is a one-line URL swap with no logic change. The AWS API Gateway endpoint must accept the same POST body (`{ transactions }`) and return the same SSE event stream format (`status`, `batch_complete`, `done`, `error`) for the rest of the pipeline to work correctly.
