## Audit + hardening pass on the SQL engine and the AI generation function

Below are concrete issues found and the corresponding fixes. Scope is `sqlEngine.ts`, `queryDataset.ts` (export-only addition), and `supabase/functions/generate-analytics-query/index.ts`. No UI/business-logic changes.

---

### 1. `src/components/tepilot/insights/query/sqlEngine.ts`

**Issues**
- **False-positive keyword rejection.** `FORBIDDEN` regex is run on the raw SQL, so a perfectly safe query like `WHERE name LIKE '%delete%'` or a SQL comment `-- update notes` is rejected as forbidden. In a professional console this is unacceptable.
- **CTE / `WITH` queries blocked.** The `SELECT`-start check rejects valid `WITH … SELECT …` queries, even though alasql supports them.
- **Multiple statements not guarded.** `clean` only trims trailing `;`. Embedded `;` (e.g. `SELECT 1; SELECT 2`) is silently passed through. Should reject any query containing a `;` outside of string literals / comments.
- **Column extraction is fragile.** `extractSelectedColumns` splits on `,` blindly — breaks for `COUNT(a, b)`, nested functions, or `CASE WHEN … END AS x` containing commas.
- **No execution-time guard.** alasql is synchronous; an accidental cartesian join freezes the tab. We can't add real timeouts in JS, but we can cap input size and add an upfront row-explosion guard via the existing `LIMIT 5000` injection AND a hard ceiling on returned rows (truncate `rows` to 5000 even if the LIMIT was higher).
- **LIMIT injection appends after `;` or trailing whitespace already trimmed — OK, but it doesn't respect uppercase/lowercase + line break.** Append on its own line for safety.

**Fix**
- Add a `stripLiteralsAndComments(sql)` helper (used only for the safety scan, never for execution). Run the FORBIDDEN regex and the `;` check against the stripped version.
- Allow queries that start with `WITH` (still require they contain a `SELECT` and no forbidden DDL/DML).
- Reject queries with more than one statement (any `;` in the stripped form).
- Replace the brittle `extractSelectedColumns` with a paren-aware tokenizer (track depth, only split on top-level commas; extract `AS alias` or last identifier).
- Truncate returned `rows` to a hard cap of 5000 even if the user wrote `LIMIT 100000`, and surface a `truncated: true` flag on `SqlResult` so the UI can show "first 5000 rows" if needed (UI change is out of scope; flag is additive and harmless).
- Inject `LIMIT 5000` on a new line, only when the query is a plain `SELECT` (CTEs already include their own).

### 2. `src/components/tepilot/insights/query/queryDataset.ts`

**Issues**
- `deals.active` is `1/0` but the LLM is likely to write `WHERE active = TRUE`. Not a bug per se (alasql treats 1 as truthy in `WHERE active` but not in `= TRUE`), but the LLM has no hint.
- Enum values (segments, pillars, urgency, spending_tier, frequency, event_type, category) are not surfaced to the LLM, so it guesses casing like `'premium'` vs `'Premium'`.

**Fix (data file)**
- Add a new exported `SCHEMA_HINTS` (or extend `SCHEMA`) with per-column type + a small `enum` sample where applicable, derived from the existing constants (`PILLARS`, `SEGMENTS`, `LIFE_EVENTS`, `URGENCY`, tier/frequency literals, `COMPETITOR_MERCHANTS.category`, `DEALS_SEED.brand`). No change to data generation.

### 3. `supabase/functions/generate-analytics-query/index.ts`

**Issues**
- **Same false-positive risk** as the engine: the post-generation FORBIDDEN regex matches inside string literals. Strip literals/comments before scanning.
- **No enum/type grounding.** Without the value samples the model picks wrong casing or invents columns. Will be fixed by accepting and rendering `SCHEMA_HINTS` from the client.
- **Stack-internal name leak.** System prompt names "alasql"; per memory, we must not name backend infra in user-facing copy. The prompt itself is server-side, but the model can echo "alasql" into its explanation. Rephrase as "an in-browser SQL engine".
- **`Authorization: Bearer` header.** Lovable AI Gateway expects `Lovable-API-Key`. Current pattern works today but is fragile and inconsistent with the documented contract. Switch to the documented header.
- **Tool-call shape doesn't constrain SQL safety.** Add a tighter system rule list: no `;`, no DDL/DML, must reference only schema tables/columns, must use exact enum casing, prefer single statement, must include `LIMIT` for top-N.
- **Few-shot grounding missing.** Add 2 short examples (user → SQL) in the system prompt so the model learns the table joins (`shopping_habits` keyed by `customer_id + pillar`, `deal_redemptions` joined to `deals` + `customers`). This dramatically improves correctness on JOIN-heavy questions.
- **No upper bound on prompt length.** Add a 2000-char cap on `prompt` and `currentQuery` to avoid abuse / runaway tokens.
- **Inconsistent error messaging.** Keep 4xx for client-fixable errors, 5xx only for actual failures; preserve the existing 402/429 mapping.

**Fix (edge function)**
- Accept `schemaHints` from the client; render schema as `table.column : type (enum: a, b, c)` lines.
- Replace `Authorization: Bearer …` with `Lovable-API-Key: …` header (keep `Content-Type: application/json`).
- Rewrite system prompt: remove "alasql" name, add safety rules, add 2 few-shot examples.
- Add `stripLiteralsAndComments` helper, run all safety checks against the stripped form, reject embedded `;`.
- Cap `prompt` and `currentQuery` to 2000 chars each; reject > limit with a clear 400.
- Keep `dateContext` block (already correct).

### 4. Verification

- Deploy the edge function, then `curl` it with 6 prompts and confirm each returned `query` parses and runs in the engine without false rejection:
  1. `"top 5 brands redeemed by Affluent customers last 30 days"`
  2. `"customers with a new_baby life event and their average Family pillar spend"`
  3. `"wallet-share leakage by category, top 10"`
  4. `"any customer named 'delete'"` (false-positive guard test — must NOT be rejected)
  5. `"daily transactions for the last week"`
  6. `"WITH high_spend AS (...) SELECT ..."` style — confirm `WITH` is accepted.
- In the running app, click each of the 7 pre-set pills and confirm rows + chart still render.
- Run a Playwright probe on `/bankdemo` → Analytics → Query and screenshot final state for visual confirmation.

No changes to UI components, the SQL editor, the chart picker, or the data table.