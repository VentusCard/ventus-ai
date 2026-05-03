## Trim spacing & normalize font sizes — Regular & Wealth Client columns

In `src/components/exec-demo/NextConversationRationale.tsx` (lines ~347–512), tighten paddings and unify type sizes inside both columns. Right phone panel, sliver, and pills are unchanged.

### Type scale (consistent across both columns)

- Column header label: `text-[11px] font-semibold` (was 10px on left, 10px on right).
- Card title (e.g., "AI Banking Assistant Context", "Personalized Outreach", "Advisor Notification"): `text-[11px] font-bold`.
- Subsection label (e.g., "Knows", "Can Answer", "Prep Brief Includes", "Actions", "Automated", "Advisor Actions"): `text-[10px] font-semibold uppercase tracking-wide` (was a mix of 9px / 10px).
- Body bullets and metadata lines: `text-[11px]` (was a mix of 10/11px).
- Action buttons: `text-[11px] font-semibold` (was 10.5px).
- CTA buttons at footer: `text-[11px] font-bold`, `py-2` (was 11.5px / py-2.5).

### Spacing trims

- Column header bar: `px-3 pt-2 pb-1.5` (was `px-3.5 pt-3 pb-2`).
- Scroll area: `px-3 py-2 space-y-2` (was `px-3.5 py-3 space-y-3` / `space-y-2.5`).
- Cards: `p-2.5` (was `p-3`).
- Card section margins: `mb-1.5` (was `mb-2` / `mb-2.5`).
- Prep brief inner card: `p-2 mb-2` (was `p-2.5 mb-2.5`).
- Notification meta block: `mb-2` (was `mb-2.5`).
- Actions row spacing: `space-y-1.5` (was `space-y-2`).
- Footer button container: `p-2` (was `p-3`).

### Out of scope

No content/copy changes, no color changes, no behavior changes. Sliver, phone panel, and pills are untouched.
