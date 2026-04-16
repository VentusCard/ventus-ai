

## Show Only Category in Transaction Row Pills

### Change — `src/components/exec-demo/ExecDemoLeftPanel.tsx`

Remove the subcategory (`signalEntry.label`) portion of the split pill (lines 118-125), keeping only the category badge. Simplify the wrapper span since it no longer needs the split-pill layout.

Lines 108-127 become a single category pill:
```tsx
{signalEntry?.category && pillarColor && !dim && (
  <span
    className="shrink-0 rounded px-1.5 py-[2px] text-[7.5px] font-semibold text-white/90"
    style={{ background: `${pillarColor}cc` }}
  >
    {signalEntry.category}
  </span>
)}
```

