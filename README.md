# Zebite — landing page

Marketing landing page for **Zebite**, a Flutter app (iOS + Android) that plans a
week of meals and groceries around three inputs: **what you have → what you want
→ your budget.**

## Stack

**Next.js 15 (App Router) + React 19 + TypeScript + Tailwind CSS 3**, deployed to
Cloudflare Workers via `@opennextjs/cloudflare`. This repo used to be a static
HTML/CSS/vanilla-JS site (no bundler, no `package.json`); it has since been
rebuilt on the framework above. Motion is `motion` (the Framer Motion
successor) and smooth scroll is `lenis` — both plain npm dependencies now,
not vendored `<script>` files.

```
app/            Root layout, page composition, global CSS, favicon (icon.svg)
components/
  hero/         Hero, the hand/phone composite, the rotating-word strip
  sections/     One file per landing-page section (see "Page structure")
  site/         Nav, custom cursor, Lenis smooth-scroll mount
  ui/           Reveal (scroll-in animation), DeviceFrame (phone mockup)
  brand/        ZebMascot (crops Zeb's art to its opaque bounding box)
lib/            content.ts (copy/config) and analytics.ts (CTA tracking)
public/         Everything Next.js serves as-is: screenshots, mascot art,
                founder photo, og.png
assets/         Dev-tooling inputs only — not shipped. See "Dev tools" below.
tools/          Dev-time scripts (map generator, OG image source). Not part
                of the Next.js build.
worker/         A Cloudflare Worker + Durable Object for the waitlist
                counter — written for the old static deploy, not yet ported
                into this app. See "The waitlist cap".
```

## Run it

```bash
npm install
npm run dev       # next dev, with the OpenNext Cloudflare dev shim initialized
npm run build      # next build
npm run preview    # opennextjs-cloudflare build + preview (runs in workerd)
npm run deploy     # opennextjs-cloudflare build + wrangler deploy
```

## Page structure

Rendered in `app/page.tsx`, in this order:

| Component | Section | Carries |
| --- | --- | --- |
| `Hero` | `#hero` | The promise, the animated wordmark, the hand/phone composite |
| `HowItWorks` | `#how` | 3-step flow strip + the pinned bento grid (pantry, meals, budget, photo-to-pantry, mini-features) |
| `Family` | `#family` | One pot → four plates, portioned per person |
| `Prices` | `#prices` | The generated Philippines price-intelligence map |
| `Founder` | `#about` | "Hey, I'm Zen" |
| `Testimonials` | — | Horizontal card rail |
| `Pricing` | `#pricing` | Free / Plus / Pro, monthly ↔ annual toggle |
| `Faq` | `#faq` | Six accordion questions |
| `GetAccess` | `#get` | Waitlist form + store badges |
| `Footer` | — | Product/company links, social |

Product screenshots are real app captures, framed by `components/ui/DeviceFrame.tsx`
(an iPhone-style mockup sized off the screenshot's own dimensions — no fixed
CSS device). Each screen ships as a single `.webp` under `public/screens/`;
`HowItWorks` and `Family` always render the **dark**-theme captures (the
section itself is a dark graphite band), and the hero phone always renders
the **light**-theme home screen (it sits in a light `bg-paper` section). There
is no light/dark switcher on the page — a scheme is picked per section, once,
to match that section's own background.

## Dev tools

Two scripts under `tools/` support the page but aren't part of the Next.js
build or deploy:

- **`tools/map/build-map.mjs`** — regenerates the `#prices` archipelago (real
  Mercator-projected coastline + real lat/lng pins, from
  `tools/map/ph-coastline.json` and `assets/data/prices.json`). The SVG
  currently hardcoded in `components/sections/Prices.tsx` was extracted
  byte-for-byte from this script's output. **Note:** the script still targets
  the old `index.html` / `main.js` files from the static-site era, which no
  longer exist in this repo — it needs its write targets repointed at
  `Prices.tsx` (or its `--print` mode used to dump fresh markup for manual
  copy-in) before it can be run again.
- **`tools/og/og-image.html`** — source for `public/og.png` (1200×630, the
  Open Graph / Twitter card). Self-contained HTML, rebuilt by serving the
  repo root and screenshotting it headless at exactly 1200×630 (command in
  the file's own header comment), then copying the result to `public/og.png`.

`assets/fonts/` (two self-hosted `.woff2` files) exists only because
`tools/og/og-image.html` is a standalone page that can't use `next/font` —
the live site loads Plus Jakarta Sans through `next/font/google` instead.

## The waitlist cap

The `#get` section's promise — "send your email and I'll send you the app
myself" for the first *N* signups, plain waitlist copy after that — is meant
to be backed by a real counter, not a fake countdown.

- `components/sections/GetAccess.tsx` already calls `GET /api/waitlist/status`
  and `POST /api/waitlist/join` (alongside a Web3Forms submission for the
  email itself), and degrades to static fallback copy if those calls fail.
- The counter's actual implementation, `WaitlistCounter` (a Cloudflare
  Durable Object), lives in `worker/index.js` — written for the previous
  static-site deploy, where a Worker served both the static assets and these
  two routes directly.
- `wrangler.jsonc` still declares the `WAITLIST` Durable Object binding for
  it, but `main` now points at OpenNext's generated Worker
  (`.open-next/worker.js`), so `worker/index.js` is currently **not** the
  deployed entry point — the `/api/waitlist/*` routes have no live handler
  yet. Porting the logic in `worker/index.js` into a Next.js route handler
  (or wiring a custom worker override via `open-next.config.ts`) is
  outstanding work, not a bug in the page itself.
- **Change the cap** — edit `CAP` in `worker/index.js` once it's wired back
  up.
- **This only gates the on-page copy.** Claiming a direct-access spot doesn't
  send anything by itself — the emails Web3Forms delivers still get added to
  the Google Play closed-testing tester list by hand.

## Editing the essentials

- **Copy** — `lib/content.ts` (hero copy, nav links, contact email). Section-
  specific copy (FAQ items, pricing plans, family example, etc.) lives as
  plain arrays/objects at the top of each file in `components/sections/`.
- **Brand palette / type / radii** — design tokens are defined twice, kept in
  sync by hand: `tailwind.config.ts` (Tailwind theme extension) and the
  `:root` custom properties at the top of `app/globals.css`.
- **Pricing** — the `PLANS` array in `components/sections/Pricing.tsx`.
- **Waitlist endpoint** — `components/sections/GetAccess.tsx`; swap the
  Web3Forms `access_key` there, or replace the call entirely, once you have a
  real list provider. See "The waitlist cap" above for the counter side.
- **OG image / canonical URL / metadata** — `app/layout.tsx` (`metadataBase`,
  Open Graph, Twitter card). Favicon is `app/icon.svg`.

## Analytics

`lib/analytics.ts` exports `trackCTA(name, props)`, which forwards to
`window.zebiteAnalytics` if it exists (a no-op, logged to the console in dev,
otherwise). Drop your provider's snippet in the marked slot in
`app/layout.tsx` and assign `window.zebiteAnalytics` to forward events to it
(GA4 `gtag`, Plausible, PostHog, …).

## Honesty note

Every feature named on this page is real and shipping. There is **no** recipe
sharing / social feed, **no** AI calorie *guessing* (targets are computed via
Mifflin-St Jeor → TDEE → goal), **no** barcode scanning, wearables, voice
assistant, or store-route optimization. The app has community **prices**, not
community recipes. Testimonials are clearly marked placeholder copy — no
names, star counts, or download numbers are invented.

**The price-intelligence map (`#prices`) still shows placeholder figures.**
The prices, confidence scores, contributor counts and "updated N mins ago"
values in `components/sections/Prices.tsx` are illustrative, not wired to the
pricing backend. The underlying claim — that budgets ride on crowdsourced
local prices — is true and is made elsewhere on the page; the map illustrates
it, it does not yet report it live. Map coverage is Luzon, and the pins say
so: the rest of the archipelago is drawn but unpinned.
