

# Add Download PDF Button to Event Preparation Dialog

## Overview
Add a new "Download PDF" button alongside the existing "Email Me Summary" button in the PrepareEventDialog. This will generate and download a professional PDF summary of the life event preparation data.

## Changes Required

### 1. Create PDF Export Function
**New File: `src/lib/eventPreparationPdfExport.ts`**

Create a function following the existing pattern from `financialTimelinePdfExport.ts`:
- Header with event type, client name, segment, and confidence score
- Detected Supporting Transactions table
- Ventus AI Insights section
- Ventus AI Recommended Next Steps checklist
- Footer with generation timestamp

### 2. Update PrepareEventDialog Component
**File: `src/components/tepilot/advisor-console/PrepareEventDialog.tsx`**

| Change | Location |
|--------|----------|
| Add `Download` icon import | Line 12-15 (icon imports) |
| Import PDF export function | New import statement |
| Add `handleDownloadPDF` function | After `handleEmailMe` (around line 91) |
| Add Download PDF button | DialogFooter (line 181-190) |

### Technical Details

**New PDF Export Function:**
```typescript
// src/lib/eventPreparationPdfExport.ts
import jsPDF from "jspdf";
import { EventPreparationData, LIFE_EVENT_CONFIG } from "@/types/dashboardClient";

export async function exportEventPreparationPDF(
  data: EventPreparationData,
  insights: string
): Promise<void> {
  const doc = new jsPDF();
  // Generate formatted PDF with all sections
  doc.save(`${clientName}_${eventType}_Preparation.pdf`);
}
```

**Updated DialogFooter (3 buttons):**
```tsx
<DialogFooter className="border-t pt-3 flex items-center gap-2">
  <Button variant="outline" onClick={handleAskVentus} className="gap-2">
    <MessageSquare className="h-4 w-4" />
    Prepare with Ventus WM Co-Pilot
  </Button>
  <Button variant="outline" onClick={handleDownloadPDF} className="gap-2">
    <Download className="h-4 w-4" />
    Download PDF
  </Button>
  <Button onClick={handleEmailMe} className="gap-2">
    <Mail className="h-4 w-4" />
    Email Me Summary
  </Button>
</DialogFooter>
```

## PDF Content Layout

```text
+------------------------------------------+
|  PREPARE: RETIREMENT TRANSITION          |
|  Margaret Chen | Premium | 92% confidence|
+------------------------------------------+
|                                          |
|  DETECTED SUPPORTING TRANSACTIONS        |
|  ----------------------------------------|
|  Fidelity Investments    $6,500  Jan 15  |
|  401k contribution increase              |
|  ----------------------------------------|
|  AARP Membership           $16   Dec 28  |
|  Retirement association membership       |
|  ... (all transactions)                  |
|                                          |
+------------------------------------------+
|  VENTUS AI INSIGHTS                      |
|  This client is in the early exploration |
|  phase of retirement planning...         |
|                                          |
+------------------------------------------+
|  RECOMMENDED NEXT STEPS                  |
|  1. Open conversation about retirement   |
|     vision...                            |
|  2. Introduce retirement income modeling |
|  3. Propose establishing a trust...      |
|                                          |
+------------------------------------------+
|  Generated: Feb 6, 2026 at 2:30 PM       |
+------------------------------------------+
```

## Files Summary

| File | Action |
|------|--------|
| `src/lib/eventPreparationPdfExport.ts` | Create |
| `src/components/tepilot/advisor-console/PrepareEventDialog.tsx` | Modify |

