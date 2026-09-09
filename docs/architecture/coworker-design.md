# AI Coworker — design & internals

> **✅ CURRENT (as of 2026-08).** Describes the coworker as built in
> `backend/shared/coworker/` + `backend/functions/ventus-coworker-*`. For the
> operate/deploy view (SES, demo flags, abuse guards), see
> [`../runbooks/coworker-email-demo.md`](../runbooks/coworker-email-demo.md). For
> where the coworker sits in the wider system, see
> [`current-system.md`](./current-system.md).

## What it is

An email-driven assistant for wealth advisors. An advisor emails
`coworker@<domain>`; the coworker runs **one agent turn** and emails back a
grounded, HTML reply — a target audience, a drafted outreach, meeting prep,
household evidence, a thread recap, or a grounded answer to a free-form question.

Two design rules shape everything below:

1. **Deterministic core, model narration at the edges.** The parts that decide
   *who* and *what* (audience ranking, benefit bands, suppression, evidence
   retrieval) are model-free and reproducible. The model only classifies intent
   and narrates prose over data we already assembled. This keeps the outputs
   auditable and offline-testable.
2. **Everything is injected.** `runCoworkerTurn` takes its portfolio provider,
   model gateway, and store as arguments, so the exact same code path runs in the
   Lambda and in offline tests with fixtures + a mock gateway. No AWS or network
   references live in the reasoning code.

## Components

| File | Responsibility |
| --- | --- |
| `core.mjs` | Orchestrates one turn end-to-end (`runCoworkerTurn`). |
| `mail.mjs` | Pure MIME parse, quote stripping, threading headers, allowlist, automated-message detection. |
| `tasks.mjs` | The task tools: intent schema, audience build, evidence, outreach, prep, summary, QA. Deterministic logic + model-backed narration. |
| `render.mjs` | HTML rendering (shell, tables, bullets) with badges for modeled/external attributes. |
| `store.mjs` | DynamoDB single-table access (+ in-memory backend for tests) and the per-sender rate limiter. |
| `memory.mjs` | Advisor-scoped memory (household/thread notes) over the store. |
| `portfolio-provider.mjs` | The book-of-business data source. Today: fixtures; swappable for a pipeline-backed provider without touching `core.mjs`. |
| `fixtures/` | Synthetic institution, advisors, households, catalog, signals, transactions. |

The two Lambdas are thin adapters: `ventus-coworker-inbound` (SES receipt → turn
→ SES reply) and `ventus-coworker-digest` (scheduled proactive digests). All
reasoning stays in `shared/coworker/` so it never depends on AWS.

## The turn pipeline (`runCoworkerTurn`)

```text
raw MIME
  │  parseInboundEmail
  ▼
1. loop/bounce guard      isAutomatedMessage → drop auto-replies, bounces, lists, no-reply
2. allowlist gate         checkAllowlist (demoOpen: admit anyone as a synthetic advisor)
3. rate limit             store.checkAndBumpRate (per-sender fixed window)
4. thread bookkeeping     resolveThreadId, append inbound turn, strip quoted reply, cap body
5. classify intent        classifyIntent(gateway, {subject, body, catalog, roster, priorTurns})
6. route + render         routeAndRender → paragraphs / sections / forwardMove (+ slot memory)
7. build reply            replySubject + buildThreadingHeaders + renderShell (never-blank net)
8. persist                thread meta, outbound turn, task row, advisor memory
  ▼
{ allowed, threadId, advisorId, intent, reply{to,subject,headers,html}, task }
```

Steps 1–3 are the open-inbox guards (see the runbook). Steps 5–6 are where the
model and the deterministic tools meet.

## Intent classification

`classifyIntent` calls the model gateway with a single **tool/function schema**
(`INTENT_TOOL` in `tasks.mjs`) and forces a tool call, so the model returns
structured fields, not free text:

- `task_type` — one of `audience_build`, `compose_outreach`, `prep`, `evidence`,
  `summary`, `other`.
- `product_id`, `household_id`, `household_ids` — extracted entities, constrained
  to the **exact ids from the roster** we pass in.
- `confidence`.

We feed the product catalog, this advisor's household roster, and the last ~6
turns so the model returns real ids and follow-ups route correctly. If the model
errors or returns junk, it falls back to `other` — the turn still produces a
useful reply. The classifier never has data-store access; it only shapes the
request.

## Task routing (deterministic where it counts)

`routeAndRender` dispatches on `task_type`. Free-text names the model returns
(e.g. "Nakamura") are resolved to real household ids by `resolveHousehold` /
`scanHouseholdMentions` before any data work, so a fuzzy classifier can't target
the wrong people.

- **`audience_build`** — deterministic. `buildAudience` scores every household in
  the advisor's roster against the product, ranks candidates, computes a modeled
  benefit band, and applies **suppression rules** (e.g. a household with a low
  liquidity buffer is suppressed for high-yield-savings). Same portfolio in →
  same ranked table out. Needs a product; without one it asks.
- **`compose_outreach`** — resolves targets from named households, or from "the
  top N" against the **most recent audience** persisted on the thread (slot
  memory via `priorTasks`). Only drafts for qualifying households; if a named
  household doesn't qualify, it asks instead of drafting the wrong list. Prose is
  model-narrated over the grounded per-household context; a deterministic
  fallback draft is used if the model is unavailable.
- **`evidence`** — deterministic. `retrieveEvidence` returns the modeled signals
  we hold for a household, each badged (modeled / third-party) with provenance.
- **`prep`** — model narration over the assembled household context.
- **`summary`** — model recap of the thread's turns.
- **`other`** — grounded QA: `summarizeSpend` / `answerQuestion` assemble the
  relevant household context and let the model answer naturally. If the model is
  down, it returns a capability menu rather than a blank or a hallucination.

Every external/inferred attribute and every benefit figure is returned **tagged**
so `render.mjs` can badge it ("modeled", "third-party modeled") and never present
an estimate as a hard fact.

## Grounding — how DB/fixture data becomes a reply

There is **no RAG and no vector store**. Grounding is a precomputed relational
signal store with explicit provenance:

1. The provider exposes structured book-of-business data (households, catalog,
   modeled signals, transactions).
2. Deterministic task tools query/assemble exactly the rows relevant to the ask
   into a compact structured context object.
3. That context is injected into the model prompt for the narration tasks, under
   a system message that constrains the model to the supplied facts.
4. `render.mjs` badges modeled/external values in the final HTML.

So the model narrates over data we already selected and ranked; it does not fetch
or invent data. Swapping fixtures for a pipeline-backed provider (real Aurora
signals) is a provider change only — `core.mjs`, tasks, and rendering are
unchanged.

## Model routing

All LLM calls go through the platform model gateway
(`backend/shared/platform/model-gateway.mjs`) keyed by task name in
`backend/config/model-routing.json`:

| Gateway task | Role | Used by |
| --- | --- | --- |
| `coworker_intent_classification` | fast router | intent classification |
| `coworker_audience_build` | reasoning worker | audience narration |
| `coworker_outreach` | reasoning worker | outreach drafting |
| `coworker_prep` | reasoning worker | meeting prep |
| `coworker_qa` | reasoning worker | grounded free-form answers |
| `coworker_summary` | reasoning worker | thread recap |
| `coworker_reply` | reasoning worker | general reply prose |

Routing/model/fallback changes live in that config, not in coworker code.

## State (DynamoDB single table `ventus-coworker`)

Single-table key design (see `store.mjs`):

| Entity | PK | SK | Notes |
| --- | --- | --- | --- |
| Thread | `THREAD#<threadId>` | `META` | last task type, subject, updated_at |
| Turn | `THREAD#<threadId>` | `TURN#<seq>` | inbound/outbound, zero-padded seq for ordering |
| Task | `THREAD#<threadId>` | `TASK#<taskId>` | + `GSI1` on type/status for flag/metrics queries |
| Memory | `ADVISOR#<advisorId>` | `MEM#<scope>#<key>` | advisor-scoped, TTL'd |
| Rate | `RATE#<sender>` | `WINDOW` | per-sender fixed-window counter, TTL'd |

Thread id is derived from the `References`/`In-Reply-To` chain (falling back to a
hash of sender+time), so replies stay in one conversation and prior turns/tasks
provide slot memory for follow-ups. `GSI1` supports "all tasks of type X in
status Y" (e.g. a review/flag queue).

## Why this shape

- **Auditability** — the who/what decisions are deterministic and reproducible;
  the model only writes prose over vetted facts, all badged.
- **Testability** — the whole agent runs offline with fixtures + a mock gateway
  (`*.test.mjs` in `shared/coworker/`), so behavior is verified without AWS or
  live models.
- **Swappability** — provider, gateway, and store are injected; moving from demo
  fixtures to real pipeline data, or changing models, touches config/provider
  only.

## Related

- Operate/deploy + abuse guards: [`../runbooks/coworker-email-demo.md`](../runbooks/coworker-email-demo.md)
- System context: [`current-system.md`](./current-system.md)
- Model gateway: [`../runbooks/model-gateway-deployment-checklist.md`](../runbooks/model-gateway-deployment-checklist.md)
