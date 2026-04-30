## Step 3 layout updates

### Row 1 — Contact (3 columns)
Switch the first row from `grid-cols-2` to `grid-cols-3`:
- Contact name (existing)
- Contact email (existing)
- **Contact phone (new)** — `Input type="tel"`, placeholder `+1 (555) 123-4567`, bound to new `contactPhone` state (session-only, like other inputs).

### Row 2 — Notes + Send (3 columns)
Switch from `grid-cols-2` to `grid-cols-3`:
- **Notes (optional)**: `col-span-2` so it visually matches the two fields above (name + email).
- **Email button**: 1 column wide, matching the phone field above. Rename label from `Email draft to prospect` → **`Email proposal`**.

### State + summary
- Add `const [contactPhone, setContactPhone] = useState("")` near the other Step 3 fields (no localStorage — clears each session, consistent with the existing inputs).
- Append phone to `buildSummaryText` / email payload when present, so it flows into the admin-defined email body alongside name/email/notes.

### Files
- `src/pages/Pricing.tsx` — JSX grid changes, new state, phone wiring into summary builder and `EmailDraftDialog` props if a phone field is surfaced there (otherwise just included in body text).

No changes to admin console, catalog, or pilot logic.
