

# Attach PDFs to Follow-Up Emails

## Problem
The follow-up email dialog shows attachments in the UI (e.g., Financial Timeline PDF) but they are not actually included when the email is sent. The edge function currently only sends plain text.

## Solution
Generate the Financial Timeline PDF as base64 data on the client side, send it to the edge function, and pass it to Resend's attachments API.

## Steps

### 1. Create a PDF-to-base64 helper
Add a new export to `src/lib/financialTimelinePdfExport.ts` that returns the PDF as a base64 string instead of triggering a download. This reuses the same PDF generation logic.

### 2. Update the Edge Function
Modify `supabase/functions/send-follow-up-email/index.ts` to accept an optional `attachments` array in the request body and forward it to the Resend API using their attachments format:
```
attachments: [{ filename: "...", content: "<base64>" }]
```

### 3. Update the Email Dialog
Modify `FollowUpEmailDialog.tsx` to:
- When the dialog opens and a `savedProjection` exists, generate the PDF as base64
- Pass the attachment data alongside the email body when invoking the edge function
- Show a small loading indicator while the PDF is being generated

## Technical Details

- Resend's API supports attachments as `{ filename, content }` where content is a base64 string
- The `jsPDF` library already supports `doc.output('datauristring')` which gives us base64 data
- Meeting Notes and Product Brochure attachments remain decorative (no real files exist for those) -- they will be removed from the attachment list to avoid confusion
- Only the Financial Timeline PDF (when a saved projection exists) will be attached as a real file
