# Design Direction

## Product Feel

`museums-eu-atlas` should feel like a focused personal route planner for serious art travel, not a marketing landing page. The visible product title is "Europe's Top 50 Art Museums Atlas". Preserve the compact Roboto Mono visual language and RU-style museum card treatment.

## Visual Principles

- Museum cards stay compact and familiar.
- Dark mode remains the default identity; light mode uses warm museum-paper surfaces.
- Standard blue (`#2563eb`) is the visit/action accent; red is reserved for validation and error states.
- Account and theme controls sit in a fixed top-right utility rail, matching the pelevin-quotes pattern.
- The favicon is a minimal classical museum facade (pediment and columns) on a dark square, generated from `public/favicons/museum-icon.svg`.
- No mascot or character layer is used.
- No decorative gradient-orb backgrounds.
- Stable spacing and fixed image aspect ratios so filtering and toggling do not shift layout unexpectedly.

## Interaction Principles

- Cards are not toggle targets. Use explicit detail icon links plus planned and visited chip buttons.
- `Planned` and `Visited` buttons must keep `aria-pressed` in sync with localStorage.
- Filters should remain fast and local.
- Milestone feedback should be small and non-blocking.
- Magic-link auth should stay narrow and focused.
- Theme controls should keep `aria-pressed` current and avoid layout shifts.

## Accessibility

- Use semantic landmarks and `lang="en"`.
- Preserve visible focus states.
- Use descriptive image alt text.
- Use stable labels for form controls, even when visually hidden.
- Keep text inside compact controls legible on mobile.
