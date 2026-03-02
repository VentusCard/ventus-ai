

## Add Insights/Blog Landing Page

### Overview
Add an "Insights" link to the navbar (between "Products" and "FAQ") that navigates to a new `/insights` blog landing page.

### Changes

**1. Create the Insights landing page (`src/pages/Insights.tsx`)**
- Hero section with title "Insights" and subtitle about thought leadership
- Grid of blog post cards (hardcoded sample data initially) with:
  - Thumbnail/placeholder image
  - Category tag (e.g., "Product", "Industry", "Engineering")
  - Title, short excerpt, date, read time
  - Click navigates to individual post page
- Clean, minimal design consistent with the rest of the site

**2. Create individual blog post page (`src/pages/InsightPost.tsx`)**
- Route: `/insights/:slug`
- Renders a single blog post from the sample data, matched by slug
- Back link to `/insights`
- Markdown-rendered body using the already-installed `react-markdown`

**3. Add sample blog data (`src/lib/insightsData.ts`)**
- Array of 4-6 sample posts with title, slug, excerpt, category, date, read time, and body content

**4. Update Navbar (`src/components/Navbar.tsx`)**
- Add an "Insights" `Link` to `/insights` between the Products dropdown and the FAQ button
- Add it to both desktop and mobile menus

**5. Update routing (`src/App.tsx`)**
- Add routes for `/insights` and `/insights/:slug`
- Import both new page components

### Technical Notes
- No backend needed initially; blog data is static in a TS file
- Uses existing `react-markdown` dependency for post rendering
- Follows existing page patterns (ScrollReveal, consistent spacing, same color palette)
- Navbar styling uses the same `textColor` variable for consistent transparent/solid behavior

