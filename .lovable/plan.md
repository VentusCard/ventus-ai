

# Send Real Emails from Follow-Up Email Dialog

## Overview
Wire up the "Send Email" button to actually deliver the drafted email using Resend's API. The API key will be stored securely as a backend secret.

## Steps

### 1. Store the Resend API key
- Save `RESEND_API_KEY` as a secure secret (never stored in code)

### 2. Create backend function: `send-follow-up-email`
**New file: `supabase/functions/send-follow-up-email/index.ts`**
- POST endpoint accepting `{ to, subject, body, advisorName }`
- Calls Resend API (`https://api.resend.com/emails`) to send plain-text email
- Sends from `onboarding@resend.dev` (Resend's default sender -- works immediately, no domain verification needed)
- Standard CORS headers
- Returns success/error JSON

### 3. Register the function
**File: `supabase/config.toml`**
- Add `[functions.send-follow-up-email]` with `verify_jwt = false`

### 4. Update the Send button
**File: `src/components/tepilot/advisor-console/FollowUpEmailDialog.tsx`**
- Replace the mock `handleSend` with a real call to `supabase.functions.invoke('send-follow-up-email', ...)`
- Add loading state (spinner on button while sending)
- Show success or error toast based on response

### Files Modified
1. `supabase/functions/send-follow-up-email/index.ts` (new)
2. `supabase/config.toml` (add function entry)
3. `src/components/tepilot/advisor-console/FollowUpEmailDialog.tsx` (update handleSend)

