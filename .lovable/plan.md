

## Add action pills below each product card in Next-Product Intelligence

### What
Below each product recommendation card, add contextual "next step" action pills that differ based on card type:

- **Life Event cards**: "Notify Wealth Advisor" and "Schedule Review Meeting"
- **Behavioral cards**: "Signal Sent to Mobile App" and "Triggered Email Campaign"

These are decorative/illustrative pills (not functional buttons) showing the automated actions the system would take.

### Changes

**`src/components/exec-demo/NextProductRationale.tsx`** (single file)

After the trigger badge section (line ~273, closing `</div>` of the product card inner content), add a new row of pills:

```tsx
{/* Action pills */}
<div className="flex items-center gap-1.5 mt-2 flex-wrap">
  {isBehavioral ? (
    <>
      <span className="inline-flex items-center gap-1 text-[9px] font-medium text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-2 py-0.5">
        <Smartphone className="w-2.5 h-2.5" /> Signal Sent to Mobile App
      </span>
      <span className="inline-flex items-center gap-1 text-[9px] font-medium text-amber-600 bg-amber-50 border border-amber-100 rounded-full px-2 py-0.5">
        <Mail className="w-2.5 h-2.5" /> Triggered Email Campaign
      </span>
    </>
  ) : (
    <>
      <span className="inline-flex items-center gap-1 text-[9px] font-medium text-violet-600 bg-violet-50 border border-violet-100 rounded-full px-2 py-0.5">
        <UserCheck className="w-2.5 h-2.5" /> Notify Wealth Advisor
      </span>
      <span className="inline-flex items-center gap-1 text-[9px] font-medium text-teal-600 bg-teal-50 border border-teal-100 rounded-full px-2 py-0.5">
        <CalendarCheck className="w-2.5 h-2.5" /> Schedule Review Meeting
      </span>
    </>
  )}
</div>
```

Add `Smartphone`, `Mail`, `UserCheck`, `CalendarCheck` to the lucide-react imports.

No new files or dependencies needed.

