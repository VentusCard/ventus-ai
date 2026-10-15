# Lighter nested attributes for slide 2.3

## Presentation
- Replace parentheses in all 14 signal pills with individual nested attribute pills, each slightly lighter than its parent’s family color.
- Keep the compact, single inline phrase: **[Monthly] [$3,500] to [Goldman Marcus] a [HYSA]**, with each bracketed element rendered as a child pill, not literal brackets. Connecting words remain plain text inside the parent pill.
- Do not restore stacked titles or a separate row of attributes. Allow natural wrapping when space is limited; keep child text readable and visually quieter than the parent.
- Preserve the left-hand family headings, family order, narrative connections, external markers, and click-to-open evidence. Child pills are labels, not separate buttons; clicking anywhere within a parent toggles that signal’s details without navigating slides.
- Keep existing amounts, variable-payment qualifiers, annualized-estimate labels, and external uncertainty unchanged.

## Technical scope
- Represent inline wording as structured attribute and connector segments in `src/lib/deckmoSignalAttributes.ts`, rather than parsing parentheses for display.
- Render child spans inside the existing parent Button in `src/components/deckmo/RickySignalStory.tsx`.
- Define lighter child backgrounds and subtle borders through the existing family color tokens in `src/styles/base.css`; preserve the strict light theme.
- Update the saved presentation preference during implementation to replace the previous parenthesized-text treatment. Leave fixtures, financial calculations, other slides, and shared demo views unchanged.

## Verification
- Check all 14 pills at 1691×1011 and smaller supported desktop sizes for readable child labels, wrapping, and no overlap or horizontal overflow.
- Exercise financial and external details, including clicks on child labels; confirm evidence remains intact and slides never advance.
- Run the existing signal calculation, story, and navigation tests and check the preview for errors.