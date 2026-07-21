## Wrap intel pills on Next-* tabs

In `src/components/exec-demo/ExecDemoIntelPanel.tsx` at line 1017, the collapsed pill row used for Next-Offer / Next-Product / Next-Conversation is currently:

```
flex-1 min-w-0 flex flex-nowrap gap-2.5 overflow-x-auto exec-light-scroll py-0.5
```

Change it to wrap instead of horizontally scroll:

```
flex-1 min-w-0 flex flex-wrap gap-2.5 py-0.5
```

Also drop `whitespace-nowrap shrink-0` from the individual pill classNames at lines ~1035 and ~1111 (the two pill renderers inside this compiled strip) so multi-line wrapping behaves cleanly — keep `whitespace-nowrap` on the pill label itself if needed, but remove `shrink-0` so long pills don't force overflow.

No other tabs affected: the per-section rows (Life Events, Spending Habits, etc. at lines 812 / 960) stay as-is since they're only shown on non-Next tabs.
