

# Update Email Sender Address

## Change
Update the `from` field in the `send-follow-up-email` backend function to use `marco@ventusai.com` instead of `onboarding@resend.dev`.

## Technical Detail
**File: `supabase/functions/send-follow-up-email/index.ts`** (line 38)

Change:
```
from: `${fromName} <onboarding@resend.dev>`
```
To:
```
from: `${fromName} <marco@ventusai.com>`
```

## Important Note
For this to work, the `ventusai.com` domain must be verified in the Resend dashboard. If it is already verified and linked to the API key you provided, emails will deliver immediately. If not, Resend will reject the send request until domain verification is complete.

