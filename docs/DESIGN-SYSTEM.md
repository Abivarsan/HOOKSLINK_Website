# HOOKSLINK Design System Specification

## Brand Foundation
- **Visual Aesthetic:** High-performance, minimalist, dark-first tech aesthetic inspired by Linear, Vercel, and Stripe.
- **Core Brand Palette:**
  - `Black`: `#000000` (Surface background, deep contrast)
  - `Royal Blue`: `#003CFF` (Brand depth, primary action fills)
  - `Cyan Blue`: `#16C8FF` (High-energy accent, active states, focus indicator)
  - `Primary Gradient`: `linear-gradient(135deg, #003CFF 0%, #16C8FF 100%)`
  - `White`: `#FFFFFF` (Headings, primary text on dark surfaces)
  - `Slate/Muted Text`: `#94A3B8` (High readability secondary text, > 7:1 contrast on black)

## Typography
- **Display Headings:** `Montserrat` (Variable, weights 600, 700, 800, 900)
  - Letter-spacing: `-0.02em` to `0.02em`
- **Body & UI Elements:** `Inter` (Variable, weights 400, 500, 600)
  - Clean legibility, tabular numbers where appropriate
- **Fluid Sizing:** Built with modern CSS `clamp()` functions for seamless scaling from 320px mobile to 1920px ultrawide displays.

## Responsive Breakpoints
- **Mobile Compact:** `< 480px`
- **Mobile Wide / Phablet:** `480px` (`30rem`)
- **Tablet:** `768px` (`48rem`)
- **Desktop:** `1024px` (`64rem`)
- **Wide Desktop:** `1280px` (`80rem`)

## Component Architecture
- **Cascade Layers:** `@layer tokens, reset, base, layout, components, pages, utilities;`
- **CSS Methodology:** BEM (`block__element--modifier`) with semantic state classes (`is-active`, `is-scrolled`, `is-visible`).
- **Interactive Enhancements:**
  - Sticky glassmorphic navigation with backdrop blur
  - Mouse-following spotlight card borders
  - GPU-accelerated reveal animations via `IntersectionObserver`
  - Accessible mobile drawer navigation with focus trapping
  - Real-time client-side form validation with accessible ARIA live alerts
