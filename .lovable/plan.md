

## Fix Blog Post Readability

### Problem
The base CSS theme sets `--foreground` to `0 0% 95%` (near-white), which is the default for the dark landing pages. The blog post page has a white background but doesn't override these variables, so Tailwind's `prose` classes render headings, list items, bold text, and other elements in near-invisible light gray.

### Solution
Override the CSS theme variables on the blog article container and add refined prose typography for comfortable reading.

### Changes

**File: `src/pages/InsightPost.tsx`**

1. Add a `tepilot-theme` class (already defined in base.css with light-mode variables) to the `<main>` element so all child elements inherit proper dark-on-white colors

2. Enhance the prose container with explicit light-mode overrides and better spacing:
   - `prose-headings:text-gray-900` -- dark, visible headings
   - `prose-p:text-gray-700 prose-p:leading-[1.8] prose-p:mb-6` -- readable body with generous line height and paragraph spacing
   - `prose-strong:text-gray-900` -- bold text stands out
   - `prose-li:text-gray-700 prose-li:leading-[1.7]` -- readable list items
   - `prose-ul:my-6 prose-ol:my-6` -- breathing room around lists
   - `prose-headings:mt-12 prose-headings:mb-5` -- clear section separation
   - `prose-hr:my-10` -- generous divider spacing
   - `prose-blockquote:border-blue-500 prose-blockquote:text-gray-600` -- styled quotes
   - `prose-em:text-gray-600` -- visible italics

No new files or dependencies needed -- just fixing color inheritance and adding typographic refinement to the existing component.

