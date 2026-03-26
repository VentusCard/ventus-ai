

## Redesign "Next Step" Popup

### Overview
Replace the current contact-form dialog with a larger, two-panel closing slide. Left panel shows the brand message; right panel has 3 buttons that open the uploaded deck pages as full-screen image overlays.

### Changes

**1. Copy deck page images into project**
Copy the 3 full-page screenshots to `src/assets/deck/`:
- `go-to-market.jpg` (Go-to-Market Strategy)
- `team-traction.jpg` (Team & Traction)
- `competitive-landscape.jpg` (Competitive Landscape)

**2. Rewrite `src/components/ContactFormDialog.tsx`**

- Widen dialog: `sm:max-w-4xl` (up from `3xl`)
- Two-column layout:

**Left panel** (slate-50 background):
- Bigger Ventus logo (`w-36` instead of `w-24`)
- New tagline: **"Banking Should be Deeply Personal"** in large bold text below the logo
- Keep the 3 narrative blocks (Right now / With VentusAI / What's next) but give them more vertical breathing room and slightly larger text

**Right panel**:
- Remove the contact form entirely
- Replace with heading "Learn More" and 3 large styled buttons:
  1. "Go-to-Market Strategy"
  2. "Team & Traction"  
  3. "Competitive Landscape"
- Each button opens a full-screen image overlay showing the corresponding deck page screenshot
- Overlay has a close button and semi-transparent dark backdrop

**3. Internal state for deck viewer**
- Add `activeDeck: string | null` state to track which deck image to show
- When a button is clicked, set `activeDeck` to the corresponding image import
- Render a fixed full-screen overlay with the deck image centered and a close/X button

### Result
- "Next Step" opens a polished closing slide instead of a contact form
- 3 clickable buttons let the presenter show GTM, Team, and Competitive slides inline
- No navigation away from the demo page

