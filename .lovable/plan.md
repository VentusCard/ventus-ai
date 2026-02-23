

# Update Email Sender Display Name

## Problem
Follow-up emails are sent with the "from" name as `"{advisorName} via Ventus AI"`, but it should be `"Wealth Management Co-Pilot via Ventus AI"`.

## Fix
**File: `supabase/functions/send-follow-up-email/index.ts`**

Change the `fromName` logic from using the advisor's name to a fixed label:

```typescript
// Before
const fromName = advisorName ? `${advisorName} via Ventus AI` : 'Ventus AI';

// After
const fromName = 'Wealth Management Co-Pilot via Ventus AI';
```

This is a one-line change in the edge function. No other files need modification.

