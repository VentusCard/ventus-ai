

# Add Email Popup to "Email Me Summary" in Prepare Event Dialog

## What changes
Clicking "Email Me Summary" will open the same style email dialog used by the Follow-Up Email feature -- with prefilled recipient, subject, body (summary of the event preparation data), and the event preparation PDF auto-attached.

## Changes

### 1. Add base64 PDF export function
**File: `src/lib/eventPreparationPdfExport.ts`**

Add a new `exportEventPreparationPDFBase64` function (alongside the existing `exportEventPreparationPDF`) that returns the PDF as a base64 string instead of triggering a download. This reuses all the same PDF-building logic but calls `doc.output("datauristring")` and strips the prefix to get raw base64.

### 2. Create `EventSummaryEmailDialog` component
**New file: `src/components/tepilot/advisor-console/EventSummaryEmailDialog.tsx`**

A new dialog component modeled after `FollowUpEmailDialog` with:
- **Props**: `open`, `onOpenChange`, `data: EventPreparationData`
- **Prefilled fields**:
  - **To**: empty (advisor enters their own email)
  - **Subject**: `"Event Preparation: {eventName} - {clientName}"`
  - **Body**: plain-text summary built from EventPreparationData -- client name/segment, event name/confidence, supporting transactions list, Ventus AI insights, and recommended next steps
  - **Attachment**: auto-generated PDF (same as Download PDF) shown as a badge, with the base64 generated on dialog open
- **Actions**: "Copy to Clipboard" and "Send Email" (calls `send-follow-up-email` edge function with the PDF attachment)

### 3. Wire up in `PrepareEventDialog`
**File: `src/components/tepilot/advisor-console/PrepareEventDialog.tsx`**

- Import `EventSummaryEmailDialog`
- Add `emailDialogOpen` state
- Change `handleEmailMe` to set `emailDialogOpen = true`
- Render `EventSummaryEmailDialog` passing `data` and the open/close state

### No backend changes needed
The existing `send-follow-up-email` edge function already supports attachments with base64 content.

