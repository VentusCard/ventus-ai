## Goal

In the "2. Behavioral Intelligence" view (header shown when no Next-* tab is active), the 3 pill rows currently render at the smaller, expanded size. Make them match the larger collapsed-state pill size already used on the Next-* tabs.

## Change

In `src/components/exec-demo/ExecDemoIntelPanel.tsx`, drop the `isCollapsed` size branching on all four pill renderers — always use the larger size:

- Lifestyle rollup pill (`PillarRollupChip`, line 1161)
- Life-event pill (line 629)
- Risk pill (line 764)
- Empty-state risk pill (line 800)

Each goes from:
`${isCollapsed ? "gap-2 text-[12.5px] px-3.5 py-2" : "gap-1.5 text-[11px] px-3 py-1.5"}`
to:
`"gap-2 text-[12.5px] px-3.5 py-2"`

Inner count `<span>` text size also goes from conditional → always `text-[11.5px]`.

No color, ordering, click-handler, or other-tab changes.