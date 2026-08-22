"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { Reveal } from "@/components/ui/Reveal";
import { DeviceFrame } from "@/components/ui/DeviceFrame";
import { ZebMascot } from "@/components/brand/ZebMascot";

const STEPS = [
  {
    n: 1,
    title: "Stock your pantry",
    body: "Type what you have, or snap a receipt and let the AI read it in.",
  },
  {
    n: 2,
    title: "Set goal & budget",
    body: "Your goal, diet and allergies, plus a ₱ budget for the plan.",
  },
  {
    n: 3,
    title: "Generate & shop",
    body: "A week of real recipes, and a list holding only what's missing.",
  },
];

const PANTRY = {
  key: "pantry",
  icon: "M12 3c-1.5 3-5 4-5 8a5 5 0 0 0 10 0c0-4-3.5-5-5-8z M12 21v-6",
  heading: "Plans that start in your pantry",
  detail:
    "Every plan is built from what you already own, and leans on whatever expires first — so you buy less, cook what's there, and bin far less of it.",
  tags: ["Expiry tracking", "No duplicate buys", "Receipt & photo scan"],
  screen: "40_pantry.webp",
  alt: "Pantry: produce, meat and fish grouped by category, with kangkong and tofu marked expires in 3 days.",
};

const MEALS = {
  key: "meals",
  icon: "M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0 M12 12m-4.5 0a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0 -9 0",
  heading: "Meals that hit your numbers",
  detail:
    "Targets are computed from your body and goal — Mifflin-St Jeor, not a guess.",
  tags: ["1,867 kcal", "117 g protein"],
  screen: "20_plan.webp",
  alt: "Meal plan: kcal eaten so far of the goal, protein/fat/carb bars, and today's meals.",
};

const ROW_C = [
  {
    key: "budget",
    icon: "M8 4V20M8 4h4.5a4 4 0 0 1 0 8H8M4.5 8h9M4.5 11.5h9",
    heading: "A list that stays in budget",
    detail:
      "It fills only what your pantry lacks, uses real local prices, and shows if you’re within your ₱ budget.",
    tags: ["Within budget", "Money-saving swaps"],
    screen: "30_grocery.webp",
    alt: "Grocery list: Within budget hero, and priced items still to buy.",
  },
  {
    key: "photo",
    icon: "M3 8a2 2 0 0 1 2-2h2l1.5-2.2h7L19 6h0a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M12 12.5m-3.6 0a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0 -7.2 0",
    heading: "Stock it with a photo",
    detail:
      "Snap a receipt or your shelf and the AI reads the items straight into your pantry — logging the spend at the same time.",
    tags: ["Receipt scan", "Shelf & haul photos"],
    screen: "41_add_to_pantry.webp",
    alt: "Add to pantry sheet: add manually, scan a receipt, or snap groceries.",
  },
];

const MINI_FEATURES = [
  {
    title: "Ask Zeb, anytime",
    body: "He reads your real pantry, plan and budget before he answers — and speaks up first when something's about to turn.",
    icon: "M21 11.5a8.4 8.4 0 0 1-8.4 8.4 8.3 8.3 0 0 1-3.8-.9L3 21l1.9-5.8a8.3 8.3 0 0 1-.9-3.7A8.4 8.4 0 1 1 21 11.5z",
  },
  {
    title: "See it working",
    body: "Spend against budget week by week, macros against goal, meals cooked, and what's expiring first.",
    icon: "M4 20V11 M10 20V4 M16 20v-8 M22 20v-4",
  },
  {
    title: "Yours, everywhere",
    body: "Offline-first, synced across your devices, and built for light and dark from the first screen.",
    icon: "M3 12a9 9 0 0 1 15-6.7L21 8 M21 3v5h-5 M21 12a9 9 0 0 1-15 6.7L3 16 M3 21v-5h5",
  },
];

// The five bento cards, in the order they rise into the grid: pantry →
// meals → budget → photo → the mini-features column.
const CARD_COUNT = 5;

// ---- Sticky reveal tuning ----------------------------------------------
// Vertical scroll (vh) reserved per card, on top of the one viewport the
// pinned grid itself occupies.
const CARD_SCROLL_VH = 58;
// Where inside its own one-unit window a card starts and finishes rising.
// The gap between one card's END and the next card's START is what makes
// the reveal read as five discrete scroll steps rather than one blur.
const ENTER_START = 0.06;
const ENTER_END = 0.7;
// How far (px) a card travels up into its grid slot.
const ENTRY_Y = 90;
// Space held clear inside the pinned viewport: enough at the top for the
// fixed nav pill to never sit on the grid, plus a little breathing room
// under it. Both feed the fit-to-viewport scale below, so they can't drift
// out of sync with the padding actually applied.
const NAV_CLEARANCE = 88;
const BOTTOM_PAD = 24;
// Below this the grid would have to shrink so far the body copy stops
// being comfortable, so the section gives up pinning and falls back to the
// in-flow reveal instead.
const MIN_FIT = 0.72;

/**
 * "How it works" — the dark graphite bento band. The grid itself is
 * unchanged from the reference comp: the same 2fr/1fr pantry+meals row and
 * the same 3-up budget / photo / mini-features row, at the same radii,
 * padding and hierarchy.
 *
 * What's new is how it arrives. On desktop the whole grid is wrapped in a
 * viewport-centred sticky container: scrolling into the section pins it,
 * and the next five scroll steps float each card up from below into its
 * *own* grid position (the grid is laid out from the start, so nothing
 * reflows — cards only fade and translate). Once the fifth card lands the
 * reserved scroll height runs out and the section unpins on its own.
 * Because every value is derived from scroll progress rather than fired by
 * an observer, scrolling back up plays the same five steps in reverse.
 *
 * Below `lg`, and under reduced motion, the grid is too tall to pin
 * honestly, so it falls back to the original in-flow <Reveal> entrances.
 */
export function HowItWorks() {
  const chrome = "#0E0F10";
  const screenSrc = (name: string) => `/screens/dark/${name}`;

  const reduce = useReducedMotion();
  const wideEnough = useMediaQuery("(min-width: 1024px) and (min-height: 640px)");
  const gridRef = useRef<HTMLDivElement | null>(null);
  // Shrinks the grid just enough to sit inside one viewport on shorter
  // screens. It scales the finished layout rather than re-flowing it, so
  // the card positions, radii and hierarchy stay exactly as designed.
  const fit = useFitToViewport(gridRef, wideEnough && !reduce);
  const pinned = wideEnough && !reduce && fit >= MIN_FIT;

  const pinRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });
  // 0 → nothing revealed yet; 1 → card 1 home; … 5 → the whole grid.
  const step = useTransform(scrollYProgress, [0, 1], [0, CARD_COUNT]);

  const grid = (
    <>
      {/* Row B — pantry (wide, the premise of everything else) + meals */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <CardShell
          index={0}
          step={step}
          pinned={pinned}
          className="flex flex-col gap-5 overflow-hidden rounded-card border border-white/10 bg-white/[0.03] p-6 sm:flex-row sm:items-center"
        >
          <div className="flex-1">
            <BentoIcon d={PANTRY.icon} />
            <h3 className="mt-3 text-xl font-extrabold tracking-[-0.01em]">{PANTRY.heading}</h3>
            <p className="mt-1.5 text-[0.95rem] text-cream/70">{PANTRY.detail}</p>
            <ul className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              {PANTRY.tags.map((t) => (
                <li key={t} className="rounded-pill border border-white/15 px-3 py-1.5 text-cream/90">
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="-mb-6 flex shrink-0 justify-center sm:self-end sm:justify-end">
            <CroppedShot
              src={screenSrc(PANTRY.screen)}
              alt={PANTRY.alt}
              chrome={chrome}
              width={230}
              height={300}
              edge="top"
            />
          </div>
        </CardShell>

        <CardShell
          index={1}
          step={step}
          pinned={pinned}
          delay={80}
          className="flex flex-col overflow-hidden rounded-card border border-white/10 bg-white/[0.03] p-5"
        >
          <BentoIcon d={MEALS.icon} />
          <h3 className="mt-3 text-xl font-extrabold tracking-[-0.01em]">{MEALS.heading}</h3>
          <p className="mt-1.5 text-[0.95rem] text-cream/70">{MEALS.detail}</p>
          <ul className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            {MEALS.tags.map((t) => (
              <li key={t} className="rounded-pill border border-white/15 px-3 py-1.5 text-cream/90">
                {t}
              </li>
            ))}
          </ul>
          <div className="-mb-5 mt-4 flex flex-1 items-end justify-center">
            <CroppedShot
              src={screenSrc(MEALS.screen)}
              alt={MEALS.alt}
              chrome={chrome}
              width={210}
              height={220}
              edge="top"
            />
          </div>
        </CardShell>
      </div>

      {/* Row C — budget, photo, and the mini-features rundown */}
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        {ROW_C.map((b, i) => (
          <CardShell
            key={b.key}
            index={2 + i}
            step={step}
            pinned={pinned}
            delay={i * 80}
            className="flex flex-col overflow-hidden rounded-card border border-white/10 bg-white/[0.03] p-5"
          >
            <BentoIcon d={b.icon} />
            <h3 className="mt-3 text-xl font-extrabold tracking-[-0.01em]">{b.heading}</h3>
            <p className="mt-1.5 text-[0.95rem] text-cream/70">{b.detail}</p>
            <ul className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              {b.tags.map((t) => (
                <li key={t} className="rounded-pill border border-white/15 px-3 py-1.5 text-cream/90">
                  {t}
                </li>
              ))}
            </ul>
            <div className="-mb-5 mt-4 flex flex-1 items-end justify-center">
              <CroppedShot
                src={screenSrc(b.screen)}
                alt={b.alt}
                chrome={chrome}
                width={200}
                height={185}
                edge={b.key === "photo" ? "bottom" : "top"}
              />
            </div>
          </CardShell>
        ))}

        <CardShell
          index={4}
          step={step}
          pinned={pinned}
          delay={160}
          className="rounded-card border border-white/10 bg-white/[0.03] p-6"
        >
          <ul className="grid gap-6">
            {MINI_FEATURES.map((f) => (
              <MiniFeature key={f.title} {...f} />
            ))}
          </ul>
        </CardShell>
      </div>
    </>
  );

  return (
    <section id="how" className="world-grocery bg-graphite-900 py-[clamp(48px,8vh,100px)] text-cream">
      <div className="shell">
        <Reveal className="mx-auto max-w-[46rem] text-center">
          <ZebMascot pose="cook" alt="" sizes="140px" className="mx-auto mb-4 w-[110px]" />
          <p className="eyebrow text-lime">How it works</p>
          <h2 className="mt-3 text-[clamp(1.9rem,4vw,2.9rem)] font-extrabold leading-[1.15] tracking-[-0.02em] text-cream">
            Stock it, set it, <span className="text-lime">shop the gaps</span>
          </h2>
          <p className="mx-auto mt-4 max-w-[52ch] text-[clamp(1.03rem,1.5vw,1.2rem)] font-medium text-muted">
            Zebite plans a week of real meals around the food you already own, the
            numbers your body needs, and the money you have — then writes the grocery list itself.
          </p>
        </Reveal>

        {/* Row A — the 3-step flow */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 70} className="rounded-card border border-white/10 bg-white/[0.03] p-6">
              <span className="flex h-8 w-8 items-center justify-center rounded-pill bg-lime text-sm font-extrabold text-lime-ink">
                {s.n}
              </span>
              <h3 className="mt-4 text-base font-extrabold tracking-[-0.01em]">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </div>

      {/* The grid itself — pinned and viewport-centred while its five cards
          rise into place, then released to normal flow. */}
      <div
        ref={pinRef}
        className="relative mt-4"
        style={
          pinned
            ? { height: `calc(100svh + ${CARD_COUNT * CARD_SCROLL_VH}vh)` }
            : undefined
        }
      >
        <div
          className={
            pinned
              ? "sticky top-0 flex h-[100svh] items-center justify-center"
              : undefined
          }
          style={
            pinned
              ? { paddingTop: NAV_CLEARANCE, paddingBottom: BOTTOM_PAD }
              : undefined
          }
        >
          <div
            ref={gridRef}
            className="shell w-full"
            style={pinned && fit < 1 ? { transform: `scale(${fit})` } : undefined}
          >
            {grid}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * One bento card. When the section is pinned, `step` (0…5) drives the
 * card's own rise — a translate-y slide plus a fade, clamped so it sits
 * still once landed — and reverses for free on the way back up. Otherwise
 * it degrades to the section's original in-flow <Reveal> entrance.
 *
 * Either way the card occupies its grid slot from first paint, so the
 * layout never reflows as cards appear.
 */
function CardShell({
  index,
  step,
  pinned,
  delay = 0,
  className,
  children,
}: {
  index: number;
  step: MotionValue<number>;
  pinned: boolean;
  delay?: number;
  className: string;
  children: ReactNode;
}) {
  const range = [index + ENTER_START, index + ENTER_END];
  const y = useTransform(step, range, [ENTRY_Y, 0]);
  const opacity = useTransform(step, range, [0, 1]);

  if (!pinned) {
    return (
      <Reveal delay={delay} className={className}>
        {children}
      </Reveal>
    );
  }

  return (
    <motion.div style={{ y, opacity }} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * Ratio the grid has to shrink by to sit inside one viewport, alongside
 * the nav clearance the pinned layout reserves. Returns 1 whenever it
 * already fits (it never scales the grid *up*).
 *
 * Measurement uses `offsetHeight`, which is the pre-transform layout
 * height — so applying the resulting scale can't feed back into the next
 * measurement and oscillate.
 */
function useFitToViewport(
  ref: React.RefObject<HTMLElement | null>,
  active: boolean
) {
  const [fit, setFit] = useState(1);

  useEffect(() => {
    if (!active) {
      setFit(1);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const natural = el.offsetHeight;
      if (!natural) return;
      const available = window.innerHeight - NAV_CLEARANCE - BOTTOM_PAD;
      setFit(Math.min(1, available / natural));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [ref, active]);

  return fit;
}

/** SSR-safe `matchMedia`, false until mounted so the server markup is the
 *  in-flow (non-pinned) grid. */
function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/**
 * A phone mockup pinned inside a shorter, overflow-hidden window — the
 * bento crop from the reference comp. `edge="top"` shows the top of the
 * screen (status bar down) with the phone's foot cut off by the card;
 * `edge="bottom"` shows the phone's foot (home indicator / bottom sheet)
 * with the top faded into the card, for screens that live at the bottom
 * of the phone (e.g. the "add to pantry" sheet).
 */
function CroppedShot({
  src,
  alt,
  chrome,
  width,
  height,
  edge = "top",
}: {
  src: string;
  alt: string;
  chrome: string;
  width: number;
  height: number;
  edge?: "top" | "bottom";
}) {
  return (
    <div
      className="relative overflow-hidden"
      style={{ width, height }}
    >
      <div
        className={`absolute left-0 ${
          edge === "top" ? "top-0" : "bottom-0"
        }`}
      >
        <DeviceFrame
          src={src}
          alt={alt}
          imgWidth={860}
          imgHeight={1828}
          width={width}
          chrome={chrome}
        />
      </div>

      {edge === "bottom" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-8 bg-gradient-to-b from-graphite-900 to-transparent"
        />
      )}
    </div>
  );
}

function BentoIcon({ d }: { d: string }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-card bg-lime/15 text-lime">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={d} />
      </svg>
    </div>
  );
}

function MiniFeature({ title, body, icon }: { title: string; body: string; icon: string }) {
  return (
    <li className="flex gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-lime/15 text-lime">
        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d={icon} />
        </svg>
      </span>
      <span>
        <b className="block text-sm font-extrabold text-cream">{title}</b>
        <span className="mt-1 block text-sm text-muted">{body}</span>
      </span>
    </li>
  );
}
