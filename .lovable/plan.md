## Root cause

Resend's testing mode (the `onboarding@resend.dev` sender) only allows sending to the account owner (`marco@ventusai.com`) and **rejects any additional recipient field**. The function currently sets `reply_to` to whatever email the submitter types — Resend counts that as a second recipient and returns:

```text
403 You can only send testing emails to your own email address...
```

That's why every submission still fails.

## Fix

In `supabase/functions/send-feedback/index.ts`:

1. Remove the `reply_to` line entirely (this is what trips the 403).
2. Keep `to: ['marco@ventusai.com']`.
3. Surface the submitter's contact email so you know who to reach out to:
   - Subject becomes: `New Ventus feedback from {name} <{contact}>`
   - The Contact row is already rendered prominently in the HTML/text body.

Then redeploy `send-feedback` and test from `/bankdemo` → Feedback & Ideas.

No frontend, schema, or secret changes needed. Verifying a domain in Resend later would let us also reply directly to submitters, but it isn't required.