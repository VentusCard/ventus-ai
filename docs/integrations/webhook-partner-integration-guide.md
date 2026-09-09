# Ventus Webhook Partner Integration Guide

This guide is for bank, processor, and merchant-integration partners wiring their systems to Ventus webhook events. It covers registration, test delivery, delivery history, replay, signature verification, thin payloads, and Ventus-side monitoring.

The current API base URL is:

```text
https://api.ventusai.com
```

All partner API calls require the bank API key:

```http
x-api-key: <bank_api_key>
```

Do not send production API keys in email, chat, screenshots, or shared documents. Use the approved bank onboarding process for key issuance and rotation.

## Supported Events

Ventus supports these webhook event subscriptions:

| Event | Granularity | Meaning |
| --- | --- | --- |
| `batch_started` | Batch | File/batch accepted for processing |
| `batch_complete` | Batch | All customers finished successfully |
| `batch_partial` | Batch | Batch finished with mix of success and failure |
| `batch_failed` | Batch | All customers failed |
| `batch_stuck` | Batch | One or more customers past SLA, still not complete/failed |
| `life_event_detected` | Customer | New life event(s) detected |
| `behavioral_signal_detected` | Customer | New behavioral signal(s) detected |
| `risk_detected` | Customer | New high-severity risk factor(s) |
| `trip_detected` | Customer | Trip(s) written or updated this run |

Batch outcome events (`batch_complete`, `batch_partial`, `batch_failed`) fire **once per batch** when every customer is terminal. `batch_stuck` fires **once per batch** when the stuck-job SLA is exceeded (default 20 minutes). A batch may receive `batch_stuck` and later a terminal batch event.

## Webhook Payload Shape

All production events use `schema_version: 1` inside `data`.

Envelope:

```json
{
  "event": "life_event_detected",
  "bank_id": "bank_demo",
  "timestamp": "2026-05-21T22:00:00.000Z",
  "delivery_id": "00000000-0000-4000-8000-000000000000",
  "data": {
    "schema_version": 1,
    "customer_id": "cust_013",
    "batch_id": "batch_abc",
    "life_event_ids": ["101", "102"]
  }
}
```

### Entity events (thin ID arrays)

Partners receive IDs in the webhook and load full records via the API:

| Event | IDs in `data` | Detail API (preferred) | List API (bulk) |
| --- | --- | --- | --- |
| `life_event_detected` | `life_event_ids[]` | `GET /v1/customers/:id/life-events/:life_event_id` | `GET /v1/customers/:id/life-events` |
| `behavioral_signal_detected` | `behavioral_signal_ids[]` | `GET /v1/customers/:id/behavioral-signals/:behavioral_signal_id` | same list endpoint |
| `risk_detected` | `risk_factor_ids[]` | `GET /v1/customers/:id/risk-factors/:risk_factor_id` | `GET /v1/customers/:id/risk-factors` |
| `trip_detected` | `trip_ids[]` | `GET /v1/customers/:id/trips/:trip_id` | `GET /v1/customers/:id/trips` |

Example `risk_detected`:

```json
{
  "event": "risk_detected",
  "data": {
    "schema_version": 1,
    "customer_id": "cust_013",
    "batch_id": "batch_abc",
    "risk_factor_ids": ["42"]
  }
}
```

### Batch events

Example `batch_started`:

```json
{
  "event": "batch_started",
  "data": {
    "schema_version": 1,
    "batch_id": "batch_abc",
    "filename": "star_upload.csv",
    "transaction_count": 1200,
    "customer_count": 45
  }
}
```

Example `batch_partial`:

```json
{
  "event": "batch_partial",
  "data": {
    "schema_version": 1,
    "batch_id": "batch_abc",
    "customers_processed": 40,
    "customers_failed": 5,
    "status": "partial"
  }
}
```

Example `batch_stuck`:

```json
{
  "event": "batch_stuck",
  "data": {
    "schema_version": 1,
    "batch_id": "batch_abc",
    "status": "stuck",
    "sla_minutes": 20,
    "stuck_customer_ids": ["cust_001", "cust_002"],
    "customers_complete": 38,
    "customers_failed": 0,
    "customers_in_progress": 7
  }
}
```

Job-level detail (per-customer status, errors, warnings): `GET /v1/jobs/:batch_id`.

Treat unknown fields as forward-compatible additions.

## Delivery Headers

Ventus sends:

| Header | Meaning |
| --- | --- |
| `Content-Type: application/json` | Payload is JSON. |
| `x-ventus-event` | Event type for routing and quick inspection. |
| `x-ventus-delivery-id` | Unique delivery attempt ID. |
| `x-ventus-signature` | HMAC SHA-256 signature when a shared secret is configured. |

## Signature Verification

When registering a webhook, partners may provide a shared `secret`. If configured, Ventus signs the exact JSON request body with HMAC SHA-256 and sends the lowercase hex digest in `x-ventus-signature`.

Node.js example:

```js
import crypto from 'node:crypto';

function verifyVentusSignature({ rawBody, secret, signature }) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(expected, 'hex'),
    Buffer.from(signature, 'hex')
  );
}
```

Important implementation notes:

- Verify against the raw request body before parsing/re-serializing JSON.
- Use a constant-time comparison.
- Reject missing or malformed signatures when a secret is expected.
- Return a 2xx response only after the event is safely accepted or queued.

## Register Or Update A Webhook

Use `POST /v1/webhooks`.

```bash
curl -X POST "https://api.ventusai.com/v1/webhooks" \
  -H "Content-Type: application/json" \
  -H "x-api-key: $VENTUS_API_KEY" \
  -d '{
    "url": "https://partner.example.com/ventus/webhooks",
    "events": ["batch_complete", "batch_partial", "batch_stuck", "life_event_detected", "risk_detected"],
    "secret": "replace-with-shared-secret"
  }'
```

Rules:

- The URL must be valid HTTPS.
- `events` must contain at least one supported event.
- Re-registering the same bank + URL updates the events/secret and reactivates the webhook.

## List Configured Webhooks

Use `GET /v1/webhooks`.

```bash
curl "https://api.ventusai.com/v1/webhooks" \
  -H "x-api-key: $VENTUS_API_KEY"
```

Use this during onboarding and support calls to confirm which endpoint is active for a bank.

## Disable A Webhook

Use `DELETE /v1/webhooks/{webhook_id}`.

```bash
curl -X DELETE "https://api.ventusai.com/v1/webhooks/wh_bank_demo_1770000000000" \
  -H "x-api-key: $VENTUS_API_KEY"
```

This is a soft-disable. It does not delete delivery history.

## Send A Test Delivery

Use `POST /v1/webhooks/{webhook_id}/test`.

```bash
curl -X POST "https://api.ventusai.com/v1/webhooks/wh_bank_demo_1770000000000/test" \
  -H "x-api-key: $VENTUS_API_KEY"
```

Expected response:

```json
{
  "webhook_id": "wh_bank_demo_1770000000000",
  "event": "webhook_test",
  "delivery_id": "00000000-0000-4000-8000-000000000000",
  "status_code": 200,
  "delivered": true
}
```

Use test delivery before enabling production event traffic for a partner endpoint.

## Inspect Delivery History

Use `GET /v1/webhook-deliveries`.

```bash
curl "https://api.ventusai.com/v1/webhook-deliveries?limit=20" \
  -H "x-api-key: $VENTUS_API_KEY"
```

Optional filters:

```bash
curl "https://api.ventusai.com/v1/webhook-deliveries?status=failed&webhook_id=wh_bank_demo_1770000000000&limit=20" \
  -H "x-api-key: $VENTUS_API_KEY"
```

The delivery list returns operational metadata only. It does not expose stored replay payloads.

## Replay A Failed Delivery

Use `POST /v1/webhook-deliveries/{delivery_id}/replay`.

```bash
curl -X POST "https://api.ventusai.com/v1/webhook-deliveries/00000000-0000-4000-8000-000000000000/replay" \
  -H "x-api-key: $VENTUS_API_KEY"
```

Replay rules:

- Only failed deliveries can be replayed.
- The replay is scoped to the authenticated bank.
- The original delivery must have a stored replay payload.
- The webhook registration must still be active.
- The replay creates a new delivery ID and links back to the original through `replay_of_delivery_id`.

## Partner Endpoint Requirements

Partner endpoints should:

- Accept HTTPS `POST` requests.
- Respond with a 2xx status once the event is accepted.
- Complete quickly; slow endpoints may time out and be treated as failed.
- Treat `delivery_id` as idempotency material.
- Verify HMAC signatures when a secret is configured.
- Log `x-ventus-delivery-id`, `x-ventus-event`, response status, and processing outcome.
- For entity events, fetch detail by ID from the Ventus API after receiving the webhook.

## Ventus Operational Monitoring

Ventus monitors webhook delivery health in two ways:

- Worker log metric filters for legacy webhook failure log lines.
- `ventus-webhook-delivery-monitor`, which queries the Aurora `webhook_delivery_attempts` ledger every five minutes and publishes `Ventus/Pipeline` `WebhookFailedDeliveries`.

Pipeline stuck jobs are monitored separately via `ventus-stuck-job-monitor` (internal SNS + optional partner `batch_stuck` webhook).

The ledger-backed monitor sends alerts through `ventus-backend-alerts` and the CloudWatch alarm `ventus-webhook-readiness-failed-deliveries`.

## Postman / Client Collection Path

The source contract is `docs/api/openapi-draft.yaml`. A generated Postman collection is checked in at `docs/api/ventus-api.postman_collection.json` and can be imported directly into Postman for pilot onboarding.

Configure these collection variables before calling authenticated endpoints:

- `baseUrl`: `https://api.ventusai.com`
- `apiKey`: partner/bank API key
- `webhookId`: webhook ID returned by `POST /v1/webhooks`
- `deliveryId`: failed delivery ID returned by `GET /v1/webhook-deliveries`

Recommended onboarding sequence:

1. Register webhook with desired batch + entity events.
2. List webhooks and confirm the registered endpoint.
3. Send test delivery.
4. Upload a pilot file; confirm `batch_started` → entity events → terminal batch event.
5. Inspect delivery history.
6. Disable any stale endpoint.
7. Replay a failed delivery only after partner endpoint readiness is confirmed.

## Internal Support Checklist

When a partner reports a missing event:

1. Confirm the bank API key maps to the expected `bank_id`.
2. Check `GET /v1/webhooks` for active endpoint and event subscription.
3. Check `GET /v1/webhook-deliveries?status=failed`.
4. Compare the partner's logged `x-ventus-delivery-id` with Ventus delivery history.
5. Confirm partner endpoint status codes and signature verification.
6. For batch issues, check `GET /v1/jobs/:batch_id` for per-customer status and warnings.
7. Use replay only for failed deliveries after confirming the partner endpoint is ready.

Operational runbook: `backend/RUNBOOK.md`. Database DDL for webhook columns: `backend/sql/webhook-payload-v2-migration.sql`.
