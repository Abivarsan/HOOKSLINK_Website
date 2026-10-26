# HOOKSLINK — Production Company Portfolio Website

> Modern, high-performance, and accessible company portfolio website for **HOOKSLINK** — UK AI-Powered Creative Digital Marketing & Web Development Agency. Inspired by the design aesthetics and engineering standards of Linear, Vercel, and Stripe.

---

## 1. Project Overview & Technology Stack

- **Markup:** Semantic HTML5 Living Standard, W3C-valid, fully accessible landmarks (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`).
- **Styling:** Modern CSS3 targeting [Baseline Widely Available](https://web.dev/baseline) using CSS Cascade Layers (`@layer tokens, reset, base, layout, components, pages, utilities;`), CSS Custom Properties in `:root`, CSS Grid & Flexbox, fluid typography (`clamp()`), and BEM naming methodology.
- **JavaScript:** Native ES6+ Modules (`<script type="module">`), zero heavy third-party framework dependencies. Built with native browser APIs: `IntersectionObserver`, `matchMedia`, `requestAnimationFrame`, and HTML5 Constraint Validation.
- **Assets:** Self-hosted variable web fonts (*Inter* and *Montserrat* in WOFF2 format), modern WebP responsive images, and vector SVG iconography.
- **Accessibility:** Follows WCAG 2.2 AA standards with accessible skip links, visible high-contrast focus rings, screen reader support (`aria-*`), and `prefers-reduced-motion` compliance.

---

## 2. Directory Architecture

```text
HOOKSLINK_Website/
├── index.html                      # Homepage
├── about-us/index.html             # Company Story, Mission & Differentiators
├── services/index.html             # 9 Specialized Services across 3 Stages
├── contact-us/index.html           # Inquiries, Phone, Address & Contact Form
├── privacy-policy/index.html       # UK GDPR Compliant Privacy Policy
├── terms-and-conditions/index.html # Company Terms & Conditions
├── 404.html                        # Custom 404 Not Found Page
│
├── assets/
│   ├── css/
│   │   ├── tokens.css              # Cascade layers, self-hosted fonts & design tokens
│   │   ├── base.css                # CSS reset, element defaults & focus states
│   │   ├── layout.css              # Containers, responsive grids & layout primitives
│   │   ├── components.css          # BEM components (Header, Nav, Cards, Buttons, Form, Footer)
│   │   ├── utilities.css           # Helper classes, gradients, and reveal transitions
│   │   └── pages/                  # Page-specific stylesheet overrides
│   │       ├── home.css
│   │       ├── about.css
│   │       ├── services.css
│   │       └── contact.css
│   │
│   ├── js/
│   │   ├── main.js                 # Global entry point & module initializer
│   │   ├── modules/
│   │   │   ├── header.js           # Sticky header glassmorphism scroll watcher
│   │   │   ├── nav.js              # Accessible mobile drawer with focus trap
│   │   │   ├── reveal.js           # IntersectionObserver scroll animations
│   │   │   ├── spotlight.js        # Mouse-following spotlight card glow (Linear style)
│   │   │   ├── counter.js          # Animated milestone metric counters
│   │   │   ├── contact-form.js     # Real-time validation & async submission handler
│   │   │   └── current-year.js     # Automatic copyright year update
│   │   └── utils/
│   │       ├── dom.js              # Query & event helpers
│   │       └── motion.js           # Reduced motion & throttle utilities
│   │
│   ├── images/
│   │   ├── brand/                  # Optimized WebP/PNG logos & transparent badges
│   │   ├── clients/                # Optimized partner logos (TAM Chicken, Vextroo, etc.)
│   │   ├── projects/               # Client portfolio card previews
│   │   ├── og/                     # 1200x630 social share graphics
│   │   └── source/                 # Original uncompressed assets
│   ├── icons/                      # SVG favicons, Apple touch icon & PWA icons
│   └── fonts/                      # Self-hosted Inter & Montserrat WOFF2 fonts
│
├── docs/
│   ├── CONTENT.md                  # Complete verified content inventory & sources
│   └── DESIGN-SYSTEM.md            # Comprehensive design system specification
├── scripts/
│   └── process-assets.js           # Asset optimization and generation script
├── favicon.svg
├── site.webmanifest
├── robots.txt
├── sitemap.xml
├── .editorconfig
├── .gitignore
├── package.json
└── README.md
```

---

## 3. Brand Identity & Color Palette

Extracted from official brand assets:
- **Black:** `#000000` (Core canvas and contrast)
- **Royal Blue:** `#003CFF` (Depth, brand anchor, button backgrounds)
- **Cyan Blue:** `#16C8FF` (High-energy accent, active borders, focus indicators)
- **White:** `#FFFFFF` (Headings, primary high-contrast text)
- **Signature Gradient:** `linear-gradient(135deg, #003CFF 0%, #16C8FF 100%)`

---

## 4. Local Development & Testing

Because the website utilizes native ES modules (`<script type="module">`), it must be served over HTTP/HTTPS rather than opened directly via `file://`.

### Run Local Development Server:
```bash
# Using Node.js (recommended)
npm run serve
# Or using Python 3
python -m http.server 3000
```
Open your browser at `http://localhost:3000`.

### Validate HTML Structure:
```bash
npm run validate:html
```

### Regenerate Assets:
```bash
npm run process:assets
```

---

## 5. Git & Branch Management Protocol

The development workflow adheres to the strict branch hierarchy:
`main -> dev -> V1 -> Abivarsan`

- All development work and commits are executed solely on the **`Abivarsan`** branch.
- Branches `main`, `dev`, and `V1` remain untouched for manual approval and pull request merges by the repository owner.
