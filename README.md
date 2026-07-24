# AI Grocery Planner — landing page

Marketing landing page for **AI Grocery Planner**, a Flutter app (iOS + Android)
that plans a week of meals and groceries around three inputs: **what you have →
what you want → your budget.**

## Stack choice

**Static, self-contained HTML + CSS + vanilla JS** — no build step, no
framework. The brief allowed either Next.js or a single well-structured static
page; static was chosen because this is a standalone marketing page that ships to
any host as-is, has zero dependencies, and hits Lighthouse 95+ trivially (no
framework JS, no layout shift). It's easy to port into a Next.js `app/` route
later — the sections are already cleanly separated and the palette lives in CSS
variables.

- `index.html` — all page sections + SEO / Open Graph / Twitter meta.
- `styles.css` — design tokens (CSS variables) + every section, responsive,
  light/dark, reduced-motion.
- `main.js` — mobile menu, scroll reveals, hero parallax, pricing toggle,
  waitlist, analytics hooks. Progressive-enhancement: the page reads fine with JS
  off.
- `assets/` — real app screenshots, SVG logo + favicon, OG image.

## Run it

It's a static page — just open `index.html`, or serve the folder:

```bash
npx serve .        # or: python -m http.server 8000
```

## Assets

Product imagery is **real app screenshots** (400×820), framed in
iPhone-15-Pro-style device mockups drawn in CSS (`.device`):

| File | Screen |
| --- | --- |
| `assets/screens/home.png` | Today's plan, all meals cooked, targets hit |
| `assets/screens/plan_recipe.png` | Meal plan + expanded AI recipe |
| `assets/screens/pantry.png` | Categorized pantry, expiry / low-stock |
| `assets/screens/grocery.png` | Grocery list, "Within budget ✓" |
| `assets/screens/insights.png` | Spending + nutrition dashboard |
| `assets/screens/scan.png` | Snap to stock (receipt / groceries) |

`assets/logo.svg` / `assets/favicon.svg` are the leaf-in-forest-tile lockup.
`assets/og-image.png` is the brand forest social artwork (1200×630).

## Editing the essentials

- **Brand palette / type** — `:root` tokens at the top of `styles.css`
  (`--cream`, `--ink`, `--lime`, forest gradient, radii, shadows).
- **Pricing** — plain markup in the `#pricing` section of `index.html`; the
  monthly/annual figures live in `data-monthly` / `data-annual` attributes.
- **CTAs / links** — store badges and "Get early access" buttons point to
  `#get` (the waitlist). Swap in real App Store / Google Play URLs when ready.
- **Waitlist endpoint** — `main.js` → `data-waitlist` handler has a marked
  `TODO` where you POST the email to your list provider.
- **OG / canonical URLs** — replace the `https://aigroceryplanner.app/`
  placeholders in `<head>` (and make `og:image` an absolute URL in production).

## Analytics

`main.js` defines a `window.track(event, props)` stub and auto-fires
`cta_click` for every `[data-cta]` element, plus `pricing_toggle` and
`waitlist_signup`. Drop your provider snippet at the marked spot in
`index.html <head>` and forward `track` to it (GA4 `gtag`, Plausible, PostHog…).

## Honesty note

Every feature named on this page is real and shipping. There is **no** recipe
sharing / social feed, **no** AI calorie *guessing* (targets are computed via
Mifflin-St Jeor → TDEE → goal), **no** barcode scanning, wearables, voice
assistant, or store-route optimization. The app has community **prices**, not
community recipes. Testimonials are clearly marked placeholder copy — no names,
star counts, or download numbers are invented.
