## Add KYC Card to Executive Demo Customer Selection

Add a "KYC" card styled identically to the transaction source group cards in `ExecDemoSelectionDialog.tsx`, placed **directly below the user pills row and above the divider line / ScrollArea** (outside the scroll area, so it stays pinned).

### Placement

In `src/components/exec-demo/ExecDemoSelectionDialog.tsx`, insert a new section between the pills `div` (currently ending around line ~195) and the transaction cards block (`{!showCustomFlow && (...)}`). When `showCustomFlow` is true, hide it.

Wrapper styling matches other pinned sections:
`px-8 py-3 border-b border-slate-100 shrink-0`

### Card markup (matches source card style)

Same outer container as source cards:
- `rounded-xl border border-slate-200 bg-white overflow-hidden`
- Collapsible header button with chevron rotation (`useState` for `kycOpen`)
- Body revealed when open

### Header row

- Left: pill labeled `KYC` using `bg-indigo-50 text-indigo-700` (matches source pill shape: `inline-block px-2 py-0.5 rounded text-xs font-medium`)
- Then: bold status `<customer.profile.compliance.kycStatus>` (e.g. "Current"), `·` separator, muted "Last reviewed <date>"
- Right: chevron with rotation transition

### Body (when expanded)

Two/three-column key/value grid pulled from `customer.profile`:
- Name, Segment, AUM, Tenure
- Age, Occupation, Industry, Family Status, Income Level
- Email, Phone, Address (`profile.contact`)
- KYC Status, Last Review, Next Review, Risk Profile (`profile.compliance`)

Layout: `grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 px-4 py-3 border-t border-slate-100`. Labels: `text-[10px] uppercase tracking-wider text-slate-500`. Values: `text-sm text-slate-800`.

### State

Local `const [kycOpen, setKycOpen] = useState(false);` reset on customer change via existing `useEffect` on `customer.id`.

### Files touched

- `src/components/exec-demo/ExecDemoSelectionDialog.tsx` only.

No data model, type, or other component changes required.