# AI Coworker email demo runbook

This runbook stands up the AI Coworker as an **emailable demo**: someone sends an
email to `coworker@<domain>` and gets a grounded, mock-data reply (target
audiences, meeting prep, household evidence, thread summaries). All portfolio data
is synthetic — it comes from `backend/shared/coworker/fixtures/`, never Aurora.

## What's already built

- **Reasoning** (`backend/shared/coworker/core.mjs`): one full agent turn —
  parse → allowlist → classify intent → route (audience / prep / evidence /
  summary) → render HTML → persist. Provider-injected, so the same code runs
  offline in tests and in the Lambda.
- **Mock data** (`backend/shared/coworker/fixtures/`): 8 synthetic households, a
  product catalog, modeled signals, and transactions.
- **Inbound Lambda** (`backend/functions/ventus-coworker-inbound/`): SES receipt
  → S3 → SNS → agent turn → SES reply.
- **Customer context** (`backend/shared/coworker/context.mjs` +
  `backend/functions/ventus-coworker-context-refresh/`): a daily snapshot per
  household that dates every signal. See "Customer context refresh" below.
- **Outreach timing** (`backend/shared/coworker/timing.mjs`): signal decay,
  window expiry, and contact cadence. See "Outreach timing" below.
- **Infra** (`infra/lib/ventus-coworker-stack.ts`): DynamoDB table, inbound S3
  bucket, SNS topic + DLQ, inbound + digest + context-refresh Lambdas, SES
  receipt rule set, IAM, log retention.

## Demo behaviour flags

Both are CDK context flags surfaced as Lambda env vars:

| Flag (`-c ...`) | Env var | Default | Demo value |
| --- | --- | --- | --- |
| `coworkerDryRun` | `COWORKER_DRY_RUN` | `true` | `false` (actually send the reply) |
| `coworkerDemoOpen` | `COWORKER_DEMO_OPEN` | `false` | `true` (reply to **any** sender) |

- **`COWORKER_DRY_RUN=true`** skips the SES send and just logs/returns the
  rendered reply. Use it to smoke-test the full reasoning + persistence path
  before a sending identity is verified.
- **`COWORKER_DEMO_OPEN=true`** admits senders who are *not* on the advisor
  allowlist. They're mapped to a synthetic advisor over the **full** demo book
  (widest fixture advisor) and greeted by the name derived from their email
  address. Leave this **OFF** in production — unknown senders should bounce.

## Open-inbox abuse guards

Because `coworkerDemoOpen=true` lets **anyone** email the coworker, the turn
pipeline enforces a few guards before spending a model call or sending a reply:

- **Loop / bounce guard** — auto-responders (Out-of-office), bounces (`Return-Path: <>`),
  mailing-list traffic, and `no-reply@` / `mailer-daemon@` senders are dropped with
  no reply (`reason=automated_message:*`). This is checked *before* the allowlist,
  so even an allowlisted advisor's OOO can't start a mail loop.
- **Per-sender rate limit** — a fixed window counter in DynamoDB
  (`RATE#<sender>` / TTL'd). Over the limit → dropped silently (`reason=rate_limited`),
  so we never hand a flooder a reply amplifier.
- **Body cap** — the message body handed to the model is truncated so one huge
  email can't blow up token cost or attempt prompt-stuffing.

Tunable via inbound-Lambda env vars (defaults are sensible for a demo):

| Env var | Default | Meaning |
| --- | --- | --- |
| `COWORKER_RATE_LIMIT` | `12` | Max messages per sender per window. `0` disables. |
| `COWORKER_RATE_WINDOW_MS` | `3600000` | Rate-limit window (ms). |
| `COWORKER_MAX_BODY_CHARS` | `8000` | Max body chars fed to the model. |

Failures are surfaced, not silent: the inbound Lambda already retries then
dead-letters to `ventus-coworker-inbound-dlq`, and the stack now alarms on both
**any dead-lettered message** and **any Lambda error** to the
`ventus-coworker-alarms` SNS topic. Subscribe an address so a failing inbox is
noticed during the demo window:

```bash
npm run deploy -- VentusCoworkerStack \
  -c coworkerRegion=us-east-1 \
  -c coworkerAlertEmail=you@ventusai.com
```

(Confirm the SNS subscription email AWS sends after the first deploy.)

> Region note: SES **inbound** is not available in `us-east-2`. Deploy this stack
> to a SES-inbound region (e.g. `us-east-1`) with `-c coworkerRegion=us-east-1`.
> The Coworker is an isolated subsystem (own DynamoDB, own Lambdas, no VPC/Aurora
> dependency), so cross-region deploy is safe.

## One-time SES setup (out of band, needs AWS console + DNS access)

1. **Verify the domain** in SES in the demo region (`us-east-1`):
   `aws ses verify-domain-identity --domain <domain> --region us-east-1`.
2. **Publish DNS records** at the domain registrar:
   - the SES domain verification `TXT` record;
   - the 3 DKIM `CNAME` records SES provides;
   - an `MX` record pointing mail to SES inbound:
     `10 inbound-smtp.us-east-1.amazonaws.com`.
3. **Exit the SES sandbox** — ✅ **done (2026-08-28).** Production access is granted
   in `us-east-1` (quota 50k/day, 14 msg/s). Replies can now go to any recipient.
   Because the account is out of the sandbox, bounce/complaint handling is now
   mandatory — see "Production sending: bounces & complaints" below.
4. **Replicate the model-provider secret into the demo region.** The inbound
   Lambda reads `ventus/model-providers/gemini` from its **own** region
   (`us-east-1`), and the stack only grants Secrets Manager / KMS access in that
   region. If the secret lives only in `us-east-2`, intent classification silently
   degrades to `task=other`. Add a replica once:

   ```bash
   aws secretsmanager replicate-secret-to-regions \
     --secret-id ventus/model-providers/gemini \
     --add-replica-regions Region=us-east-1 \
     --region us-east-2
   ```

   The us-east-1 replica re-encrypts under that region's
   `alias/ventus/model-provider-secrets` KMS key, matching the Lambda's
   `kms:ViaService` grant. Rotations propagate to the replica automatically.

## Production sending: bounces & complaints

Now that the account is out of the SES sandbox, all outbound goes through the SES
**configuration set** `ventus-coworker` (provisioned by the stack; both Lambdas
send with `ConfigurationSetName`). That gives us:

- **Bounce/complaint routing** — bounces, complaints, rejects, and delivery
  delays publish to the `ventus-coworker-ses-events` SNS topic. Subscribe an
  address (`-c coworkerAlertEmail=...`) to see the actual failing recipients.
- **Reputation alarms** — CloudWatch alarms on the config set's
  `Reputation.BounceRate` (≥5%) and `Reputation.ComplaintRate` (≥0.1%) fire to
  `ventus-coworker-alarms`. AWS reviews accounts at 5% bounce / enforces at 10%,
  and enforces complaints at 0.5%, so these alert with margin.
- **Loop protection** — the inbound loop/bounce guard (above) already refuses to
  auto-reply to bounces and auto-responders, which is the main way a bot inflates
  its own bounce/complaint rate.

Both alarm topics use email subscriptions, so after the first deploy **confirm
the two SNS subscription emails** AWS sends (`ventus-coworker-alarms` and
`ventus-coworker-ses-events`) or notifications won't arrive.

## Opt-out and suppression

The digest is mail we originate, so it carries a working opt-out. Three moving
parts, all provisioned by the stack:

- **`ventus-coworker-unsubscribe`** — a Lambda Function URL (`authType: NONE`)
  that verifies an HMAC-signed token and records a suppression. `GET` renders a
  confirmation page, `POST` performs the opt-out. The split matters: corporate
  link scanners (Outlook Safe Links among them) issue `GET` against every URL in
  a message, so a `GET` that unsubscribed would opt people out of mail they never
  opened. The same `POST` serves RFC 8058 one-click, which Gmail and Yahoo send
  with no human involved and will retry.
- **`ventus-coworker-ses-events`** — subscribes to the `ventus-coworker-ses-events`
  topic and suppresses on **complaints** and **permanent bounces**. Transient
  bounces, rejects, and delivery delays are logged and deliberately do **not**
  suppress. Dead-letters to `ventus-coworker-ses-events-dlq` with an alarm,
  because a dropped complaint keeps us mailing someone who reported us as spam.
- **`ventus/coworker/unsubscribe-signing`** — the HMAC key, generated on first
  deploy. Read only by the digest (signs) and the unsubscribe endpoint (verifies).

Suppression is keyed on the lowercased address (`SUPPRESS#<email>` / `META`) with
**no TTL**, and carries a scope:

| Scope | Set by | Blocks |
| --- | --- | --- |
| `proactive` | the unsubscribe link | the daily digest only |
| `all` | complaints, permanent bounces | digest **and** replies |

Scope only ever widens. An advisor who opted out of the digest still gets replies
to mail they send, because they asked for less mail, not to be ignored.

> **The digest fails closed.** If `COWORKER_UNSUBSCRIBE_URL` or
> `COWORKER_UNSUBSCRIBE_SECRET_ID` can't be resolved, the handler logs and sends
> **nothing**, returning `{ skipped: 'unsubscribe_not_configured' }`. Degrading to
> "send it anyway, minus the link" is the exact state this replaces, and nobody
> notices a missing footer link — whereas a digest that stops arriving gets
> reported the same morning.

**Do not rotate the signing key casually.** Every unsubscribe link in every
digest already delivered is signed with the current value, and CAN-SPAM expects
the opt-out to keep working for at least 30 days after a send. A rotation needs
an overlap window where both keys verify.

To put someone back on the digest, delete their suppression row:

```bash
aws dynamodb delete-item --table-name ventus-coworker \
  --key '{"PK":{"S":"SUPPRESS#name@example.com"},"SK":{"S":"META"}}' \
  --region us-east-1
```

## Customer context refresh

`ventus-coworker-context-refresh` runs daily at **11:00 UTC**, one hour before
the digest. For every household it reads what the provider currently reports,
compares it against yesterday's stored snapshot, and writes today's.

### Why it exists

The provider returns a household's signals with no history: "expecting a child,
travel-heavy spend, $40k idle" is true today and was true last month, and
nothing in that shape says which. Without an age, the digest cannot tell an
inheritance that landed overnight from one it has been mentioning since spring,
so it ranks them identically and re-sends both every morning.

Ages are **derived from the refresh history**, not read from the fixtures. A
signal still present keeps the `first_seen_at` it already had; one that has
appeared is stamped with now. After a week of running, every signal carries a
real observed age.

### What it writes

| Record | Key | Retention |
| --- | --- | --- |
| Current snapshot | `HH#<householdId>` / `CTX#LATEST` | none |
| Dated snapshot | `HH#<householdId>` / `CTXV#<YYYY-MM-DD>` | 90 days |
| Run outcome | `RUN#context-refresh` / `<iso>` | 90 days |

The dated copies are what make a claimed age auditable: when an advisor asks why
we said a signal was 40 days old, the answer has to be a record rather than a
recomputation.

### Operational notes

- **The grace period is 2 days.** A signal that disappears from the provider is
  held as `fading` before being dropped, so a single bad upstream refresh cannot
  reset a six-month-old signal's clock. Raising it hides genuinely resolved
  signals for longer; lowering it to 0 makes every upstream flicker look like
  news.
- **One household's failure does not abort the book.** The run reports
  `partial`; only a total failure throws and trips the error alarm.
- **Two alarms, and the second is the one that matters.**
  `ventus-coworker-context-refresh-errors` catches the job failing.
  `ventus-coworker-context-refresh-not-running` catches it not being invoked at
  all, which the error alarm structurally cannot see — a function that never
  runs emits no error metric, and no metric reads as healthy.
- **A failed refresh does not stop the digest.** Yesterday's context plus
  today's mail is a slightly stale ordering; no mail is a broken product. Check
  `context_coverage` in the digest logs.

Run it by hand:

```bash
aws lambda invoke --function-name ventus-coworker-context-refresh \
  --region us-east-1 /dev/stdout | jq
```

## Outreach timing

Before this, `outreachWindow()` stamped every row with a window ("Next 14 days")
that never moved: the same row carried the same window on day 1 and day 90, and
the digest re-sent it at identical rank until the advisor stopped opening the
mail. Now that signals have ages, four things act on them.

**Decay splits on signal type.** Life events describe a moment — the money gets
deployed, the decision gets made — so they decay linearly across their window
and then **expire out of the audience entirely**. Standing signals (behavioral
patterns, balances) describe a condition that is as true on day 200 as on day 1,
so they decay on a half-life toward a floor (0.5 for behavioral, 0.4 for
financial) and never expire.

**Novelty promotes.** A signal first observed within 3 days is marked `NEW` in
the mail and ranked above everything else. Three days rather than one, so a
Friday signal is still news on Monday.

**News wins a household's row.** A household gets one row, and it goes to its
most newsworthy conversation rather than its tidiest figure. Without this, a
household that came into $310,000 last night is represented by a $272-a-year
card saving, purely because the card figure is computed from their ledger while
the inheritance figure rests on an assumed return.

**Cadence stops repetition.** A household is not shown twice within 7 days, and
the same product is not re-pitched to it within 30 — unless the lead signal is
new, which overrides both. Touches are written to `HH#<id>` / `TOUCH#<iso>`
**after** a successful send, so a delivery failure never mutes a household.

### Tuning cadence for a small book

| Env var | Default |
| --- | --- |
| `COWORKER_MIN_DAYS_BETWEEN_TOUCHES` | 7 |
| `COWORKER_MIN_DAYS_BETWEEN_SAME_PRODUCT` | 30 |

The defaults suit a real book of a few hundred households. The 12-household
fixture book exhausts itself in about three mornings at five rows a day and then
goes quiet, which is arithmetically correct and still the wrong demo. If a demo
needs to show rows every day, lower both.

### What ranking did not change

The benefit qualifier tier still leads for everything that is not breaking news:
a computed net outranks a gross outranks an estimate. Timing reorders **within**
a tier via an internal `priority` field, which is the benefit scaled by decay
and novelty. `priority` is a sort key and is never rendered — the email always
shows the real benefit figure.

With no context stored, every priority equals its benefit exactly and the
ordering is identical to the pre-timing behavior. The first digest after deploy,
before any refresh has run, is unchanged.

## Production cutover to `coworker@ventusai.com`

The demo runs on `coworker@demo.ventusai.com`. Moving to the real
`coworker@ventusai.com` is constrained by existing mail:

- **DNS** is authoritative at **NS1** (`*.nsone.net`) — add records there (same
  place the `demo.ventusai.com` records live).
- **Root MX** points to **Proofpoint** (`*.ppe-hosted.com`) → real company mail
  flows Proofpoint → Microsoft 365. **Do not repoint the root `ventusai.com` MX
  to SES** — it would break real mail. So SES cannot *receive* on the root domain.

Split the problem into sending and receiving.

### 1. Send *from* `coworker@ventusai.com` (DKIM only, no MX/SPF change)

The `ventusai.com` SES domain identity is already created (Easy DKIM, us-east-1).
Add these **3 CNAME** records at NS1 to verify it for signed, DMARC-aligned
sending. This does **not** affect existing mail (no MX/SPF change):

| Type | Name | Value |
| --- | --- | --- |
| CNAME | `4fazip2h5txv5q2wdpplu5enrhvtjraw._domainkey.ventusai.com` | `4fazip2h5txv5q2wdpplu5enrhvtjraw.dkim.amazonses.com` |
| CNAME | `3j3zp5z45u2s6e6aexso3fgswz6c6bsz._domainkey.ventusai.com` | `3j3zp5z45u2s6e6aexso3fgswz6c6bsz.dkim.amazonses.com` |
| CNAME | `zy5a4xe4rmvkzikbquyoucsystmx77sv._domainkey.ventusai.com` | `zy5a4xe4rmvkzikbquyoucsystmx77sv.dkim.amazonses.com` |

Verify status once DNS propagates:

```bash
aws sesv2 get-email-identity --email-identity ventusai.com --region us-east-1 \
  --query 'DkimAttributes.Status'   # -> "SUCCESS"
```

Then deploy so the coworker **replies from** the root address while still
**receiving** on the demo subdomain (the stack now decouples these):

```bash
npm run deploy -- VentusCoworkerStack \
  -c coworkerRegion=us-east-1 \
  -c coworkerEmailDomain=demo.ventusai.com \
  -c coworkerFrom=coworker@ventusai.com \
  -c coworkerDryRun=false -c coworkerDemoOpen=true \
  -c coworkerAlertEmail=zoheb@ventuscard.com
```

### 2. Receive *at* `coworker@ventusai.com`

Pick one (root MX stays on Proofpoint either way):

- **Option A — M365 forward (fast, good for the demo).** In Microsoft 365, create
  `coworker@ventusai.com` (shared mailbox or mail-enabled contact) and
  forward/redirect it to `coworker@demo.ventusai.com` (which SES already
  receives). The inbound Lambda processes the forwarded message and replies from
  `coworker@ventusai.com` (per step 1). If M365/Proofpoint blocks external
  auto-forwarding, use a **transport (mail flow) rule** to redirect instead.
- **Option B — Microsoft Graph subscription (clean, SOC2-friendly, long-term).**
  Register an Entra app with `Mail.Read` on the `coworker@ventusai.com` mailbox,
  create a change-notification subscription to a webhook, and hand new messages to
  the coworker turn. No forwarding, no MX changes, full auditability. Preferred
  once past the demo.

> Why not just point the root MX at SES? Because Proofpoint → M365 carries real
> `ventusai.com` mail. Forwarding (A) or Graph (B) adds the coworker without
> touching that flow.

## Deploy

From `infra/` (packages the Lambda zips first, then deploys):

```bash
# smoke test: no send, reply logged only
npm run deploy -- VentusCoworkerStack \
  -c coworkerRegion=us-east-1 \
  -c coworkerDryRun=true \
  -c coworkerDemoOpen=true

# live demo: actually email replies to anyone
npm run deploy -- VentusCoworkerStack \
  -c coworkerRegion=us-east-1 \
  -c coworkerDryRun=false \
  -c coworkerDemoOpen=true
```

After the first deploy, **activate the receipt rule set** (CDK provisions it but
cannot set it active):

```bash
aws ses set-active-receipt-rule-set --rule-set-name ventus-coworker-rules --region us-east-1
```

## Verify

- **Offline first:** `cd backend && npm run coworker:test`.
- **Dry-run in AWS:** send a test email to `coworker@<domain>`, then read
  `/aws/lambda/ventus-coworker-inbound` logs — you'll see the rendered reply HTML
  and `Demo sender admitted...` for non-allowlisted senders.
- **Live:** flip `coworkerDryRun=false`, email `coworker@<domain>` with something
  like *"Build me an audience for the travel card"* or *"What do we know about the
  Bianchi household?"*, and confirm the reply lands.
- **Context refresh:** invoke it by hand (command above) and confirm the run
  returns `status: "ok"` with `refreshed` equal to the household count. The
  first run reports every household under `first_run` and marks nothing new —
  that is correct, not a bug. Ages only start accruing from the second run, so
  the timing features are inert for the first 24 hours after deploy.

Inspect a household's stored context:

```bash
aws dynamodb get-item --table-name ventus-coworker --region us-east-1 \
  --key '{"PK":{"S":"HH#hh_nakamura"},"SK":{"S":"CTX#LATEST"}}' \
  | jq '.Item.signals.L[].M | {key:.key.S, first_seen:.first_seen_at.S, status:.status.S}'
```

Read the last few refresh runs:

```bash
aws dynamodb query --table-name ventus-coworker --region us-east-1 \
  --key-condition-expression 'PK = :pk' \
  --expression-attribute-values '{":pk":{"S":"RUN#context-refresh"}}' \
  --scan-index-forward false --max-items 5 | jq '.Items[] | {at:.at.S, status:.status.S}'
```

## Demo prompts that exercise each task

| Ask | Task |
| --- | --- |
| "Build me an audience for the travel-card." | `audience_build` (ranked table) |
| "Prep me for a meeting with the Nakamura household." | `prep` (grounded narrative) |
| "What do we know about the Bianchi household?" | `evidence` (modeled signals) |
| "Recap this thread." | `summary` |

## Turning the demo off

Redeploy with `-c coworkerDemoOpen=false` (and/or `-c coworkerDryRun=true`).
`COWORKER_DEMO_OPEN` defaults to `false`, so a normal production deploy is closed
by default and only the three fixture advisors get replies.
