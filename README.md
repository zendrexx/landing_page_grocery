# Zebite — landing page

Marketing landing page for **Zebite**, a Flutter app (iOS + Android) that plans a
week of meals and groceries around three inputs: **what you have → what you want
→ your budget.**

## Stack choice

**Static HTML + CSS + vanilla JS — still no build step.** There is no bundler, no
framework and no `package.json`; the repo root is what ships. Three animation
libraries are *vendored* into `assets/vendor/` and loaded `defer`:

| File | Why |
| --- | --- |
| `gsap.min.js` | tweens + timelines |
| `ScrollTrigger.min.js` | scroll-linked entrances and scrubbed depth |
| `lenis.min.js` | smooth wheel scrolling |

Vendored rather than CDN-linked so there is no extra DNS + TLS round trip before
animation code can run, no third-party origin to go down, and Cloudflare caches
them with everything else. To update one, re-download it from jsDelivr and strip
the trailing `sourceMappingURL` comment (the `.map` files are not deployed).

- `index.html` — all page sections + SEO / Open Graph / Twitter meta.
- `styles.css` — design tokens (CSS variables) + every section, responsive,
  reduced-motion, reduced-transparency.
- `main.js` — motion system, price-intelligence map, mobile menu, pricing
  toggle, FAQ, waitlist, analytics hooks.
- `assets/` — real app screenshots, Zeb mascot art, self-hosted fonts, vendored
  JS, OG image.

### Motion

Two rules hold throughout `main.js`:

1. **The page is complete without any of it.** Entrance states are scoped to a
   `.js` class set before first paint, so with JS off nothing is stuck at
   `opacity: 0`. If GSAP fails to load, or the visitor prefers reduced motion,
   `.motion-off` goes on `<html>` and every element is simply there.
2. **One rAF loop.** Lenis is driven from `gsap.ticker`, so scroll smoothing,
   scrubbed timelines and entrance tweens all advance on the same frame.

Reveals are declarative: `data-anim="fade-up|fade|scale-in|blur-in|lines"`, with
`data-anim-stagger` on a parent to sequence its children off one trigger. Scrubbed
depth uses `data-depth`. Every entrance is `once: true` so its ScrollTrigger is
killed after firing.

Two traps worth knowing if you extend this:

- **Never put a `filter` or `stroke-dasharray` resting state in CSS** for
  something GSAP animates. `clearProps` removes the inline value and the CSS rule
  silently reasserts itself, leaving the element blurred or blank. Set those from
  JS instead — the icon draw-on and the blur entrances both do.
- **`content-visibility: auto` was tried and removed.** An unrendered section
  reports its `contain-intrinsic-size` placeholder rather than its real height,
  so every ScrollTrigger below it computes against the wrong page length. It
  changed the measured document height by ~3,000px.

`.lines` headings are split into `<span class="line"><span>…</span></span>` **in
the markup**, not at runtime — the text stays intact for screen readers,
find-in-page and copy/paste. Lines, never characters.

## Run it

It's a static page — just open `index.html`, or serve the folder:

```bash
npx serve .        # or: python -m http.server 8000
```

## Assets

Product imagery is **real app screenshots**, framed in iPhone-15-Pro-style
device mockups drawn in CSS (`.device`). Every screen ships in both themes:

- `assets/screens/v4/{light,dark}/` — the masters, 2580 × 5592 straight off a
  device (see that folder's own README). **Source only — don't deploy them.**
- `assets/screens/{light,dark}/*.webp` — what the page actually loads, 840 ×
  1801, ~50 KB each. Built by `python assets/screens/v4/export_web.py`, which
  crops the Android status/gesture bars off and extends the first and last row
  into the bezel padding, so a dark shot never meets a cream bezel.

| File | Screen |
| --- | --- |
| `10_home` | Today's plan, progress, daily targets |
| `12_budget_plan` | Weekly ₱ budget, days + meals per day |
| `21_plan_recipe` | Meal plan + expanded AI recipe |
| `22_cook_sheet` | "Start cooking?" — what it deducts |
| `30_grocery` | Grocery list, "Within budget ✓" |
| `40_pantry` | Categorized pantry, expiry / low-stock |
| `41_add_to_pantry` | Snap to stock (receipt / groceries) |
| `51_insights_charts` | Spending + nutrition charts, food waste |
| `71_zeb_chat` | Ask Zeb — the in-app assistant |
| `80_generate` | "What the AI will use" before generating |

Screenshots follow the visitor's `prefers-color-scheme` on their own (each is a
`<picture class="shot">` with a dark `<source>`); the Light / Dark switch in the
gallery pins one, by flipping `source.media` rather than rewriting `src`. To add
a screen: add its name to `SCREENS` in `export_web.py`, re-run it, and copy an
existing `<picture class="shot">` block.

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

**The price-intelligence map (`#prices`) is sample data.** The city figures,
confidence scores, contributor counts and "updated N mins ago" values live in the
`CITIES` table in `main.js` and are not wired to anything. The section carries a
visible `Sample data — illustrative` line under the map, and it must keep it
until those numbers come from the real pricing backend. The underlying claim —
that budgets ride on crowdsourced local prices — is true and is already made
elsewhere on the page; the map illustrates it, it does not report it.
