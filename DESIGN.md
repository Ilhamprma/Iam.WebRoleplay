# Iam.WebRoleplay Design System

## 0. Direction
Warm editorial control room: dark charcoal surfaces, parchment text, and one muted terracotta accent. Preserve app density for worldbuilding while making mobile reading and thumb actions comfortable.

## 1. Tokens
- Background: `#08090d` dark, `#f8fafc` light
- Surface: `#0d101a` dark, `#ffffff` light
- Text: `#f8fafc` dark, `#0f172a` light
- Muted text: `#94a3b8`
- Accent: slate/white; semantic success emerald, warning amber, error red
- Radius: 8px controls, 12px panels, 16px modal shells
- Spacing: Tailwind 4px base scale; mobile page padding 12px, desktop 24px
- Type: Plus Jakarta Sans UI, JetBrains Mono metadata

## 2. Layout
- Sticky 56px header.
- App shell owns viewport height with `min-height: 100dvh`.
- Desktop uses split panels where content requires it.
- Mobile stacks panels, keeps controls at least 44px tall, and lets content scroll naturally.

## 3. Responsive rules
- `<640px`: compact header, horizontally scrollable phase control, full-width modal/panels, stacked actions.
- `640–1023px`: two-column content only where minimum panel width stays usable.
- `≥1024px`: full workspace layout and desktop action density.

## 4. Interaction
- Buttons: 150ms color/transform transition, visible focus ring, pressed scale 0.98.
- Drawers/modals: preserve existing transitions; no layout animation.
- Respect `prefers-reduced-motion`.

## 5. Primitives
- `Navbar`: sticky responsive workspace navigation.
- `Modal`: centered desktop shell, edge-to-edge mobile shell.
- `Panel`: bordered surface with compact metadata and readable body copy.
- `MessageComposer`: full-width mobile input with thumb-sized submit action.

## 6. Accessibility
- Every icon-only button keeps a `title` or accessible label.
- Focus indicators remain visible.
- Text remains readable at mobile width without horizontal scrolling.

## 7. Accepted debt
- Tailwind utility classes remain inline because existing components already use this convention. Shared visual tokens stay in this file and `src/index.css`; a component extraction can happen when a second screen needs the same primitive markup.
