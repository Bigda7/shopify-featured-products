# Shopify Featured Products Section

A custom **Online Store 2.0** section built for a Shopify theme as a test assignment for an agency. Implements a fully responsive Featured Products block with automatic product recommendations via the Shopify API — no third-party libraries.

## Demo

[![Featured Products Demo](https://img.youtube.com/vi/5VOAhunSU5s/maxresdefault.jpg)](https://youtu.be/5VOAhunSU5s?si=_ZpqcSEvAmFkk_B3)

**[Watch on YouTube](https://youtu.be/5VOAhunSU5s?si=_ZpqcSEvAmFkk_B3)**

---

## Features

- **Product Recommendations API** — fetches personalized recommendations via Shopify's HTML endpoint; falls back to manually selected products if API returns empty
- **Custom slider** — desktop: 4-card grid with arrow navigation; mobile: horizontal scroll-snap with peek effect (no libraries)
- **Sale badge** — dynamically calculated from `compare_at_price` vs `price`
- **Star rating** — rendered from `reviews.rating` metafield using two SVG layers and CSS `clip-path` (no JS, no images)
- **Responsive images** — Shopify `image_tag` with `srcset` and `sizes` for optimal loading on all devices
- **Accessibility** — semantic HTML (`<section>`, `<ul>`, `<article>`), `aria-label`, `aria-busy`, keyboard-navigable controls
- **Lazy loading** — images load only when near the viewport
- **Reduced motion** — respects `prefers-reduced-motion` system setting in both CSS and JS
- **Fully customizable** via Theme Customizer — colors, fonts, heading, description, product count, fallback products

---

## Tech Stack

| Layer | Technology |
|---|---|
| Templates | Liquid (Shopify Online Store 2.0) |
| Styling | Vanilla CSS — BEM, CSS Custom Properties, Flexbox, scroll-snap |
| Behavior | Vanilla JS — Web Component (`customElements`), Fetch API, AbortController, ResizeObserver |
| Design reference | Figma (pixel-perfect implementation) |

**No external libraries or frameworks.**

---

## File Structure

```text
sections/
└── featured-products.liquid      # Section schema, settings, layout, API call logic

snippets/
└── featured-product-card.liquid  # Single product card template (used for both fallback and API results)

assets/
├── featured-products.css         # Styles: grid, slider, card, sale badge, star rating, responsive
└── featured-products.js          # Web Component: API fetch, slider controls, ResizeObserver
```

---

## How It Works

### Product source logic
On initial page load, **fallback products** (selected in Theme Customizer) are rendered server-side by Liquid.

Once the page loads, the JS Web Component fires `connectedCallback` and makes a `fetch` request to Shopify's `/recommendations/products` endpoint, requesting an HTML response. Shopify re-renders the section with recommended products. The component replaces its own `innerHTML` with the fresh HTML.

If the API returns no results or fails — the fallback products remain visible and the slider initializes normally.

### Arrow visibility
Arrow controls are hidden by Liquid at render time when `products_count <= 4`.  
After any content update, `updateControls()` re-evaluates based on real `scrollWidth` vs `clientWidth` — so arrows only appear when there is actual overflow.

### Mobile slider
On screens `≤ 749px`, card width is fixed at `247px` and the section removes its right padding. The next card peeks into view — creating a scroll affordance with pure CSS, zero JavaScript.

---

## Figma Reference

Section built pixel-perfect from the provided design file, including:
- 4-column desktop grid with 40px gap
- Exact card dimensions, badge position, star size
- Mobile horizontal scroll with card peek
- Typography, spacing, and color tokens mapped to CSS Custom Properties

---

## Notes

- Shopify Markets: `compare_at_price` can be hidden by Shopify for EEA regions (EU pricing directive). Preview with `?country=US` to see sale prices correctly.
- The section uses `defer` script loading and a guard against double Custom Element registration to work safely inside Theme Customizer.
