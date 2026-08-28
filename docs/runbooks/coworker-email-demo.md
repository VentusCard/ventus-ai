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
- **Infra** (`infra/lib/ventus-coworker-stack.ts`): DynamoDB table, inbound S3
  bucket, SNS topic + DLQ, inbound + digest Lambdas, SES receipt rule set, IAM,
  log retention.

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
3. **Exit the SES sandbox** (Account dashboard → request production access) so the
   coworker can send replies to arbitrary external demo recipients. In the
   sandbox, replies only go to verified addresses.
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
