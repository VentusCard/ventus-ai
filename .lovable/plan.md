

## Simplify the Transaction Card in the Network Diagram

### What Changes
In the `TxCard` component (`src/components/demo/DemoNetworkDiagram.tsx`, lines 538-550), when a customer is selected, remove the transaction count/date/source detail lines and replace with a simple "User Data" label.

### File: `src/components/demo/DemoNetworkDiagram.tsx`

**Replace lines 538-550** — keep the avatar circle with initials and customer name, remove the two `font-mono` detail lines, add a simple "User Data" label instead:

```tsx
<div className={`rounded-lg border-2 ${scaled ? "p-3" : "p-2.5"} bg-white`} style={{ borderColor: `${color}50`, boxShadow: `0 0 12px ${color}20` }}>
  <div className="flex items-center gap-2">
    <div className={`${scaled ? "w-8 h-8 text-[12px]" : "w-7 h-7 text-[11px]"} rounded-full flex items-center justify-center font-bold text-white`} style={{ background: `${color}30`, border: `1px solid ${color}50` }}>
      {initials}
    </div>
    <div>
      <p className={`font-semibold text-slate-900 truncate ${scaled ? "text-[15px]" : "text-[13px]"}`}>{customer.profile.name}</p>
      <p className={`text-slate-400 ${scaled ? "text-[11px]" : "text-[10px]"}`}>User Data</p>
    </div>
  </div>
</div>
```

No other files affected.

