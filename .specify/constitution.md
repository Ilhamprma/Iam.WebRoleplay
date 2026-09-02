# Project Constitution & Engineering Principles

## 1. Core Directives
- **Spec-First Architecture:** No implementation code shall be written without an approved specification (`spec.md`) and technical plan (`plan.md`).
- **Zero Vibe-Coding:** All features, bugfixes, and refactors must tie directly to verified acceptance criteria.
- **Design Integrity:** Maintain strict minimalism, zero-glow aesthetics, WCAG 2.2 AA accessibility standards, and semantic HTML5/CSS structure.

## 2. Technical Guardrails
- **HTML:** Semantic HTML5 elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<footer>`), valid `id` anchors, no inline style tags.
- **CSS:** Vanilla CSS with custom property tokens (`:root`), modular BEM-like naming, responsive grid/flexbox layouts.
- **Motion:** Purposeful, restrained motion via hardware-accelerated transforms and GSAP ScrollTrigger. Respect `prefers-reduced-motion`.

## 3. Quality Assurance & Invariants
- Zero console errors and clean markup validation.
- Fast initial paint and zero layout shifts (`CLS = 0`).
- Responsive verification across mobile (360px+), tablet (768px+), and desktop (1024px+).
