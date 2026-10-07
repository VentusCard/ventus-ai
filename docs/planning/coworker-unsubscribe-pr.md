# PR description: Coworker mail: working opt-out and mechanical suppression

Scratch file — paste into the PR body, then delete. Untracked, not committed.

Branch: `zoheb/coworker-unsubscribe` → `main`
Open at: https://github.com/VentusCard/ventus-ai/pull/new/zoheb/coworker-unsubscribe

---

## Why

The daily digest goes out today with no `List-Unsubscribe` header, no footer link, and nowhere to record that someone wanted it to stop.

Bounces and complaints already publish to `ventus-coworker-ses-events`, but that topic only emails an operator. That's an alert, not a control: it tells a human a spam complaint happened and then mails the same address again the next morning. AWS enforces complaint rate at 0.5% and bounce rate at 10% at the account level, so this is a sending-suspension risk as well as a compliance one.

## What changed

**Recipient-initiated opt-out.** HMAC-signed tokens (`shared/coworker/unsubscribe.mjs`) — an unsigned `?email=` endpoint lets anyone unsubscribe anyone by editing a query string. A Function URL renders a confirmation page on `GET` and acts on `POST`, because corporate link scanners like Outlook Safe Links issue `GET` against every URL in a message and a `GET` that unsubscribed would opt people out of mail they never opened. The same `POST` handler serves RFC 8058 one-click, which Gmail and Yahoo send with no human involved and will retry, so the write is idempotent.

**Mechanical suppression.** `ventus-coworker-ses-events` consumes the existing SNS topic and suppresses on complaints and permanent bounces. Transient bounces, rejects, and delivery delays deliberately do *not* suppress — a full mailbox or a greylisting gateway is not an opt-out, and muting a real advisor for good is its own outage. Dead-letters with an alarm, since a dropped complaint is the one event that must not be lost.

**Scoped suppression.** `proactive` (from the link) stops the digest; `all` (from complaints and hard bounces) stops everything including replies. An advisor who wanted less mail did not ask to be ignored when they email us. Scope only ever widens, so a replayed one-click POST cannot narrow a complaint back down. No TTL — an expiring opt-out resumes mailing on its own.

**Fails closed.** If the opt-out URL or signing key can't be resolved, the digest sends nothing and returns `{ skipped: 'unsubscribe_not_configured' }`. Degrading to "send it anyway, minus the link" is the exact state this replaces, and it fails silently — nobody notices a missing footer link, whereas a digest that stops arriving gets reported the same morning.

## Files

| Area | Change |
| --- | --- |
| `shared/coworker/unsubscribe.mjs` | new — token sign/verify, URL and header builders, scope policy |
| `shared/coworker/ses-events.mjs` | new — suppress-or-not policy per SES event type |
| `shared/coworker/store.mjs` | `SUPPRESS#<email>` entity, `suppress` / `getSuppression` / `isSuppressed` / `unsuppress` |
| `shared/coworker/render.mjs` | optional footer opt-out link |
| `functions/ventus-coworker-unsubscribe/` | new — public Function URL handler |
| `functions/ventus-coworker-ses-events/` | new — SNS consumer |
| `functions/ventus-coworker-digest/` | suppression gate, signed link, `List-Unsubscribe` headers, fail-closed config |
| `functions/ventus-coworker-inbound/` | suppression gate on replies (scope `all` only) |
| `infra/lib/ventus-coworker-stack.ts` | Function URL, generated signing secret, SNS subscription, DLQ + alarm, scoped IAM |
| `docs/runbooks/coworker-email-demo.md` | opt-out section, scope table, rotation warning, re-subscribe command |

## Model and tools

Claude Opus 5 via Cursor.

## Tests run

- `npm run --prefix backend test` — 267 pass, 0 fail
- `npm run --prefix backend coworker:test` — 179 pass, 0 fail
- `npm run --prefix backend check:imports` — pass
- `npm run --prefix infra check` (`tsc --noEmit`) — pass
- `npm run --prefix infra check:secrets` / `check:iam` — pass
- `npm run --prefix infra synth -- VentusCoworkerStack` — synthesizes; verified in the template that the Function URL is `AuthType: NONE`, the `lambda:InvokeFunction` wildcard grant is constrained by `InvokedViaFunctionUrl: true` (no direct-invoke hole), and the digest carries both new env vars
- `npx eslint` on all changed files — clean

New tests: 12 in `unsubscribe.test.mjs` (forged-payload rejection, tampered signature, wrong key, malformed input, expiry semantics, header emission rules), 9 in `ses-events.test.mjs` (the full suppress/don't-suppress matrix), 8 in `store.test.mjs` (case-insensitive matching, no TTL, scope widening, replay idempotency, kind gating), 2 in `render.test.mjs`.

## Scope boundaries

Backend, infra, and runbook only. No UI, no demo page behavior, no changes to enrichment prompts, routing policy, taxonomy, or golden labels. The client-facing outreach path is untouched — drafts are still advisor-only and never sent.

## Known risks

1. **The digest will not send until this is deployed with the new config.** The signing secret is generated by the stack on first deploy and the URL comes from the Function URL, so `cdk deploy` sets both. A partial deploy (Lambda updated, stack not) leaves the digest silent.
2. **The signing key must not be rotated casually.** Every unsubscribe link in every already-delivered digest is signed with the current value; CAN-SPAM expects the opt-out to work for at least 30 days after a send. Rotation needs a dual-verify overlap window. Secret is `RETAIN`.
3. **Function URL is public and unauthenticated.** That is required for one-click. The HMAC is the authorization; there is no rate limiting on the endpoint yet, so a determined attacker can burn invocations even though they cannot forge a token.
4. **Suppression is not surfaced anywhere yet.** It lives in DynamoDB with no read UI, so "who opted out and why" needs a CLI query until the ops console lands.
5. Carries earlier uncommitted Coworker work this depends on (`friendlyFrom`, digest subject line, outreach personalization) plus the `src/api` contract commit from the prior session, kept as one PR by choice.

## Not done

Per-advisor send timezone, the surfaced/fatigue ledger, and delivery-status recording for the console's sends view. All scoped as follow-ons.
