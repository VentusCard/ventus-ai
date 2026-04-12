

## Color-Code Source Labels in the Exec Demo Selection Dialog

### Problem
The initial customer selection dialog on `/demo` shows a `Source` column as plain grey text. The user wants it color-coded like other parts of the app.

### Changes

**File: `src/components/exec-demo/ExecDemoSelectionDialog.tsx`** — ~10 lines changed

1. Add a `SOURCE_COLORS` map at the top of the file:
   - Checking → `bg-slate-100 text-slate-600`
   - Cashback Card → `bg-emerald-50 text-emerald-700`
   - Travel Card → `bg-blue-50 text-blue-700`
   - Premium Card → `bg-purple-50 text-purple-700`
   - HSA → `bg-amber-50 text-amber-700`
   - Fallback → `bg-slate-50 text-slate-500`

2. Replace the plain text source cell (line 234) with a color-coded pill:
   ```tsx
   <td className="py-1.5">
     <span className={`inline-block px-1.5 py-px rounded text-[9px] font-medium ${SOURCE_COLORS[row.source] || 'bg-slate-50 text-slate-500'}`}>
       {row.source || "—"}
     </span>
   </td>
   ```

One file, ~10 lines changed.

