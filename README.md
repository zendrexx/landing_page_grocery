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
worker/waitlist-do/
                A standalone Cloudflare Worker that exists only to export
                the WaitlistCounter Durable Object class (see "The
                waitlist cap"). Deployed separately from the main app.
```

## Run it

```bash
npm install
npm run dev       # next dev, with the OpenNext Cloudflare dev shim initialized
npm run build      # next build
npm run preview    # opennextjs-cloudflare build + preview (runs in workerd)
npm run deploy     # opennextjs-cloudflare build + wrangler deploy
npm run deploy:waitlist-do  # deploy the waitlist counter's own Worker (see below)
```

`postinstall` runs `cf-typegen` automatically (regenerates `cloudflare-env.d.ts` from
`wrangler.jsonc`'s bindings), so `env.WAITLIST` etc. typecheck without a manual step.

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

- `components/sections/GetAccess.tsx` calls `GET /api/waitlist/status` and
  `POST /api/waitlist/join` (alongside a Web3Forms submission for the email
  itself), and degrades to static fallback copy if those calls fail.
- Those routes are Next.js route handlers —
  [app/api/waitlist/status/route.ts](app/api/waitlist/status/route.ts) and
  [app/api/waitlist/join/route.ts](app/api/waitlist/join/route.ts) — that
  forward to the `WaitlistCounter` Durable Object via the `WAITLIST`
  binding (`env.WAITLIST`, from `getCloudflareContext()`).
- `WaitlistCounter` itself lives in
  [worker/waitlist-do/index.js](worker/waitlist-do/index.js), deployed as
  its **own** Worker (`zebite-waitlist-do`), not inside the main app's
  Worker. That split exists because OpenNext regenerates the app's Worker
  entry point (`.open-next/worker.js`) on every build, so it can't own a
  Durable Object class itself — `wrangler.jsonc`'s `WAITLIST` binding
  points at the other Worker cross-script via `script_name`, per
  [Cloudflare's docs](https://developers.cloudflare.com/durable-objects/reference/durable-objects-migrations/#durable-object-migrations-in-wrangler).
- **First deploy / after changing the class**: run
  `npm run deploy:waitlist-do` (deploys `zebite-waitlist-do` and applies
  its migration) before or after `npm run deploy` — order between the two
  doesn't matter once `zebite-waitlist-do` exists.
- **Change the cap** — edit `CAP` in `worker/waitlist-do/index.js`, then
  `npm run deploy:waitlist-do`.
- **Local dev** — the Durable Object binding isn't available under `next
  dev`; `/api/waitlist/*` calls fail locally and the page falls back to its
  static copy, same as production would if the DO Worker weren't deployed.
  Use `npm run preview` (runs in workerd) to exercise it locally instead.
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
