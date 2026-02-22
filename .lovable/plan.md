

# Email Follow-Up Draft Popup

## Overview
Replace the no-op "Email" button in the Action Workspace panel with a popup that drafts a full follow-up email to the client. The email is auto-generated from the current Next Steps action items, products discussed, and meeting context. Products and applications are hyperlinked to `www.ventusai.com/technology`, and relevant attachments are listed.

## Email Draft Dialog Sections

| Section | Details |
|---|---|
| **To** | Pre-filled with client email from `sampleClientData.contact.email` (read-only display) |
| **Subject** | Auto-generated: "Follow-Up: [Meeting Topic or 'Our Recent Meeting'] - [Client Name]" |
| **Greeting** | "Dear [Client Name]," |
| **Meeting Recap** | 1-2 sentence summary referencing meeting type and sentiment if available from session storage |
| **Action Items / Next Steps** | Bulleted list of all incomplete action items from `nextStepsData.actionItems`, grouped by source badge |
| **Products & Applications** | Each product mentioned (from session storage `tepilot_products_discussed`) rendered as a hyperlink to `https://www.ventusai.com/technology` with descriptive text |
| **Attachments** | Auto-suggested based on context: Financial Timeline PDF (if saved projection exists), Meeting Notes Summary, relevant product brochures |
| **Closing** | Professional sign-off with advisor name |
| **Edit & Send** | All sections are editable textareas. "Copy to Clipboard" and "Send" buttons in footer |

## Product Hyperlink Mapping

Each product gets a descriptive link:

| Product | Link Text | URL |
|---|---|---|
| Checking | Premium Checking Account | https://www.ventusai.com/technology |
| Savings | High-Yield Savings | https://www.ventusai.com/technology |
| Mortgage | Mortgage Solutions | https://www.ventusai.com/technology |
| Investment Portfolio | Investment Management | https://www.ventusai.com/technology |
| Insurance | Insurance Solutions | https://www.ventusai.com/technology |
| 529 Plan | 529 Education Savings | https://www.ventusai.com/technology |
| IRA | IRA Retirement Accounts | https://www.ventusai.com/technology |
| Credit Card | Rewards Credit Card | https://www.ventusai.com/technology |

## Attachments Logic

Auto-attach based on available data:
- If `savedProjection` exists: "Financial_Timeline_[ProjectName].pdf"
- If meeting notes were taken (session has products discussed): "Meeting_Notes_Summary.pdf"
- If any product is discussed: "[Product]_Brochure.pdf" for each product

Each attachment shown as a removable chip with a paperclip icon.

## Files to Create/Modify

| File | Change |
|---|---|
| `src/components/tepilot/advisor-console/FollowUpEmailDialog.tsx` | **New file** - Dialog with pre-drafted email, editable fields, product hyperlinks, attachment chips, copy/send buttons |
| `src/components/tepilot/advisor-console/ActionWorkspacePanel.tsx` | Wire Email button to open the dialog. Pass `nextStepsData`, `savedProjection`, and client info as props. Add state for dialog open/close |

## Technical Details

### FollowUpEmailDialog Props
```text
- open: boolean
- onOpenChange: (open: boolean) => void
- nextStepsData: NextStepsData
- clientName: string
- clientEmail: string
- advisorName: string
- savedProjection?: SavedFinancialProjection | null
```

### Email Body Generation
1. Read `sessionStorage.getItem("tepilot_products_discussed")` for products
2. Read incomplete items from `nextStepsData.actionItems`
3. Build email body as editable rich text (stored as state string)
4. Products rendered as `<a href="https://www.ventusai.com/technology">Product Name</a>` in a preview section
5. User can edit any part before sending

### ActionWorkspacePanel Changes
- Add `emailDialogOpen` state
- Wire the Email button's `onClick` to `setEmailDialogOpen(true)`
- Render `<FollowUpEmailDialog>` with appropriate props
- Pass `sampleClientData.name`, `sampleClientData.contact.email`, and `sampleClientData.advisor` as client/advisor info

### Dialog Layout
- White background with dark text (consistent with Note Taking dialog)
- Top: To / Subject fields (pre-filled, editable)
- Body: ScrollArea with the full email draft as a textarea
- Below body: Product links section with clickable hyperlinks
- Attachments bar: horizontal row of removable file chips
- Footer: "Copy to Clipboard" (outline) and "Send Email" (primary) buttons

