# Contact booking and message tabs

## Goal
Combine the booking calendar and contact form into one horizontal tabbed area beneath the existing “Let’s talk” introduction.

## Changes
- Replace the separate booking and form sections with one centered, `max-w-4xl` contact area.
- Add two tabs above the content:
  - **Book Meeting** — selected by default and shows the existing Cal.com month view.
  - **Message** — shows the existing email contact form in the same space.
- Update the two introduction buttons so each selects its matching tab and scrolls to the shared contact area.
- Preserve the existing calendar configuration, direct message delivery, validation, success state, light theme, and current copy.
- Keep the tab controls and content usable on smaller screens without changing the rest of the page.

## Verification
- Confirm Book Meeting is selected on first load.
- Confirm both tabs and both introduction buttons switch to the correct content.
- Confirm switching tabs does not create duplicate sections or unwanted page jumps.
- Check the page at desktop and mobile sizes and confirm the build remains clean.
