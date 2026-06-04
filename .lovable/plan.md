## Feedback form with sender details

Extend the previously planned Feedback & Ideas flow to capture who sent the feedback.

### 1. Edge Function `supabase/functions/send-feedback/index.ts`
Use Resend via the connector gateway. Validate with zod:
- `name`: string, trim, 1–120 chars (required)
- `position`: string, trim, 1–160 chars (required)
- `contact`: string, trim, 3–200 chars (required) — accepts email or phone, free-form
- `message`: string, trim, 5–5000 chars (required)
- `source`: string, optional, max 200

Send to `Marco@ventusai.com`:
- Subject: `New Ventus feedback from {name}`
- `reply_to`: set to `contact` if it parses as an email, otherwise omit
- HTML body: labeled rows for Name, Position, Contact, Source, Submitted at, followed by the message in a styled block
- Plain-text fallback with the same fields
- From: `Ventus Feedback <onboarding@resend.dev>`

Returns `{ ok: true }` or 400/500 with error detail.

### 2. `src/components/tepilot/insights/FeedbackDialog.tsx`
shadcn `Dialog` titled "Feedback & Ideas", subtitle "Tell us what would make Ventus better." Fields in this order:
- Name (`Input`)
- Position / Role (`Input`)
- Contact (email or phone) (`Input`)
- Message (`Textarea`, rows 6)

Client-side zod validation mirroring the edge function. Submit button calls `supabase.functions.invoke('send-feedback', { body: {...} })`, shows loading state, toast on success/error, resets and closes on success.

### 3. `AnalyticsContainer.tsx`
Add `feedbackOpen` state, wire the existing footer "Feedback & Ideas" button's `onClick` to open the dialog, render `<FeedbackDialog open onOpenChange />`.

No DB or schema changes. Uses existing Resend connector and `LOVABLE_API_KEY` / `RESEND_API_KEY` secrets.
