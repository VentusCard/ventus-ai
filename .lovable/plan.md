

# Add "Next Step" Button with Contact Form Dialog

## What
Add a floating "Next Step" button in the bottom-right corner of the Demo page that opens a dialog containing the contact form (reusing the form from `ContactUs.tsx`).

## Implementation

### 1. Extract contact form into a reusable component
- Create `src/components/ContactFormDialog.tsx`
- Contains a `Dialog` with the contact form fields (name, company, email, subject, message) and mailto submission logic extracted from `ContactUs.tsx`
- Accepts `open` and `onOpenChange` props

### 2. Add button + dialog to `src/pages/DemoPage.tsx`
- Add state: `const [contactOpen, setContactOpen] = useState(false)`
- Render a floating button at `absolute bottom-6 right-6 z-50` with text "Next Step →" styled with blue bg
- Render `<ContactFormDialog open={contactOpen} onOpenChange={setContactOpen} />`
- Button sits alongside the existing "Exit Demo" button area

### Files changed
- **New**: `src/components/ContactFormDialog.tsx` — Dialog wrapper with the contact form
- **Edit**: `src/pages/DemoPage.tsx` — Add floating button + dialog state

