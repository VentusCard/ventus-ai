Remove the sub-bullet `<ul>` lists inside the small nested cards (Signal → Intent, Personalize, Orchestrate) for both the Regular Client and Wealth Client journeys in `src/components/exec-demo/NextConversationRationale.tsx`.

Each nested card keeps:
- The small uppercase label (e.g. "Signal → Intent")
- The icon + bold title row (e.g. "Behavior → playbook")

Removed from each: the entire `<ul className="space-y-0.5 mt-1...">…</ul>` block (3 bullets per card × 6 cards = 6 lists deleted total).

Layout cleanup:
- Drop `flex-1 min-h-0 overflow-hidden` from the Orchestrate body since there's no longer a list to clip.
- Keep card heights driven by their grid row so the two journey rows stay equal-height.

No copy changes, no color changes.