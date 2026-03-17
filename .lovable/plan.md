

## Plan: Add Vision Statement Panel to ContactFormDialog

**File: `src/components/ContactFormDialog.tsx`**

**Changes:**

1. **Widen the dialog** — change `sm:max-w-lg` to `sm:max-w-3xl` to accommodate two columns.

2. **Import the Ventus logo** — `import ventusLogo from "@/assets/ventus-logo-blue.png"` (or whichever logo variant fits best on white).

3. **Add a two-column grid layout** inside `DialogContent`, below the header:
   - **Left column (~40%):** Vision statement panel with:
     - Ventus logo at top
     - Three stacked blocks, each with a small bold label and description text:
       - **Right now** — "Generic. Static. The same for everyone." (gray/muted)
       - **With VentusAI** — "Personalized. Intelligent. Built for each customer." (blue)
       - **What's next** — "Autonomous. A bank that doesn't wait to be told — it already knows." (gradient text or bold dark)
     - Separated by a subtle vertical divider or spacing
   - **Right column (~60%):** The existing form (unchanged)

4. **Responsive:** On small screens (`< sm`), stack vertically — vision panel on top, form below.

5. **Success state** stays full-width centered as-is.

