"use client";

import { useRef, useState, type CSSProperties } from "react";
import {
  cubicBezier,
  motion,
  useIsomorphicLayoutEffect,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";

const QUOTES = [
  { initial: "J", name: "Jheanlyn", text: "Deciding what to cook every night used to be the worst part of my day, honestly. Now I just open it and the week's already sorted — I only have to cook. My partner thinks I suddenly got organized 😂" },
  { initial: "Ma", name: "Madeline", text: "Living alone I used to buy way more than I needed and toss half of it by the weekend. First time in months I've actually finished a grocery haul before it went bad." },
  { initial: "C", name: "Chrysraille", text: "Honestly the part I didn't expect to like is it telling me what's already in the fridge before I add stuff. Caught me almost buying garlic for the third time lol." },
  { initial: "A", name: "Aldrin", text: "I used to just eyeball my protein and hope for the best. Didn't think an app could actually keep me near my numbers without the grocery bill going up too." },
  { initial: "M", name: "Mash", text: "The receipt scan is the reason I actually use this over just texting myself a list. Take a pic after the palengke and it's already in the app." },
];

type Slot = {
  /** Pure edge-anchored box — no transform, so the card's own motion
   * transform never has to compose with a centring translate. */
  pos: CSSProperties;
  rot: number;
  /** Distance below the frame the card starts from. Far slots travel
   * further over the same scroll window, which is the parallax cue. */
  riseVh: number;
  /** Back-of-pile cards sit slightly narrower so the stack reads as
   * receding without resorting to partial opacity. */
  back?: boolean;
};

// Anchored off the centre line rather than the stage edges so the pile
// crowds the heading and overlaps its text, the way the reference does.
// The top pair very nearly meet at the centre; the heading reads through
// the sliver between them plus the band below.
const SLOTS: Slot[] = [
  { pos: { right: "calc(50% + 1vw)", top: "calc(var(--nav-safe) + 2vh)" }, rot: -7, riseVh: 92, back: true },
  { pos: { left: "calc(50% + 1vw)", top: "var(--nav-safe)" }, rot: 6, riseVh: 94, back: true },
  // Bottom row hangs off the centre line, not the viewport floor: anchoring
  // it to the floor let it climb into the heading on short viewports (at
  // 1024x768 both rows converged and buried the text). Measuring down from
  // centre keeps its clearance from the heading fixed at any height.
  { pos: { right: "calc(50% + 8vw)", top: "calc(50% + 24px)" }, rot: 6, riseVh: 46 },
  { pos: { left: "calc(50% + 8vw)", top: "calc(50% + 12px)" }, rot: -8, riseVh: 44 },
  { pos: { left: "calc(50% - var(--card-w) / 2)", top: "calc(50% + 60px)" }, rot: 3, riseVh: 34 },
];

// Scroll windows overlap by half a card, and HOLD reserves dead-still
// scroll at the end so the finished collage is actually seen rather than
// completing at the exact instant the pin releases.
const STRIDE = 0.5;
const HOLD = 0.55;
const TOTAL = (QUOTES.length - 1) * STRIDE + 1 + HOLD;
const EXTRA_VH = Math.round(TOTAL * 52);

// Position-domain ease. The house EASE ([0.16,1,0.3,1]) is tuned for a
// time clock and would put 97% of the travel in the first half of the
// scroll window, making the cards teleport and the section feel dead.
// Note motion requires an easing *function* here — passing the raw
// bezier tuple throws at runtime.
const EASE_SCROLL = cubicBezier(0.33, 0, 0.15, 1);

/** Collage geometry is impossible below `md` (a ~296px card at ±25% of a
 * 375px stage), so narrow screens take the same plain-stack path as
 * reduced motion. Seeded false so SSR and first client render agree; the
 * layout effect upgrades it before paint rather than flashing the swap. */
function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(false);

  useIsomorphicLayoutEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isDesktop;
}

export function Testimonials() {
  const reduce = useReducedMotion();
  const isDesktop = useIsDesktop();
  const staticLayout = reduce || !isDesktop;
  const pinRef = useRef<HTMLElement | null>(null);

  // Same pin mechanism as Hero.tsx: scroll height reserved on the outer
  // element, sticky inner. Here it drives cards rising from below the
  // fold into fixed slots around a heading that never moves.
  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });

  // Dim via colour, not opacity — ink at 0.55 alpha measures 3.32:1 on
  // paper-deep (AA-large only, no headroom), while ink-soft holds 6.27:1
  // at any size. Keeping opacity at 1 also keeps the heading honest in
  // the accessibility tree.
  const headingColor = useTransform(scrollYProgress, [0, 0.22], ["#0D2E21", "#4A554E"]);
  // Spans the full range for the same WAAPI reason as the card opacity.
  const hintOpacity = useTransform(scrollYProgress, [0, 0.55, 0.72, 1], [1, 1, 0, 0]);

  return (
    <section
      id="testimonials"
      ref={pinRef}
      aria-labelledby="quotes-title"
      className="world-grocery bg-paper"
      style={staticLayout ? undefined : { height: `calc(100svh + ${EXTRA_VH}vh)` }}
    >
      <div
        className={
          staticLayout
            ? "py-[clamp(64px,10vh,120px)]"
            : "sticky top-0 h-[100svh] overflow-hidden"
        }
      >
        {staticLayout ? (
          <div className="shell">
            <div className="mx-auto max-w-[38rem] text-center">
              <p className="eyebrow text-ink-soft">Social proof</p>
              <h2 id="quotes-title" className="mt-2 text-[clamp(1.7rem,3.4vw,2.4rem)] font-extrabold tracking-[-0.02em] text-ink">
                What it feels like to plan ahead
              </h2>
            </div>
            <div className="mt-10 flex flex-col gap-5" role="group" aria-label="What people say">
              {QUOTES.map((q) => (
                <QuoteCard key={q.name} quote={q} />
              ))}
            </div>
          </div>
        ) : (
          <div
            className="relative isolate mx-auto h-full w-full max-w-[1240px] px-[var(--page-x)]"
            style={
              {
                "--card-w": "clamp(228px, 18.5vw, 296px)",
                "--nav-safe": "88px",
              } as CSSProperties
            }
          >
            <div className="absolute inset-0 z-0 flex flex-col items-center justify-center text-center">
              {/* Cards are meant to stack over this — the dim is what keeps
                  the overlap readable, so no collision channel here. */}
              <div className="max-w-[34rem]">
                <p className="eyebrow text-ink-soft">Social proof</p>
                <motion.h2
                  id="quotes-title"
                  style={{ color: headingColor }}
                  className="mt-2 text-[clamp(1.7rem,3.4vw,2.4rem)] font-extrabold tracking-[-0.02em]"
                >
                  What it feels like to plan ahead
                </motion.h2>
                <motion.p style={{ opacity: hintOpacity }} className="mt-3 text-xs font-semibold text-ink-soft">
                  Keep scrolling to read on ↓
                </motion.p>
              </div>
            </div>

            <div role="group" aria-label="What people say">
              {QUOTES.map((q, i) => (
                <CollageCard key={q.name} quote={q} index={i} progress={scrollYProgress} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function CollageCard({
  quote,
  index,
  progress,
}: {
  quote: (typeof QUOTES)[number];
  index: number;
  progress: MotionValue<number>;
}) {
  const slot = SLOTS[index];
  const start = (index * STRIDE) / TOTAL;
  const end = (index * STRIDE + 1) / TOTAL;

  // Mapped straight off scrollYProgress — useTransform clamps at both
  // ends, so each card holds its parked state for the rest of the section.
  const y = useTransform(progress, [start, end], [`${slot.riseVh}vh`, "0vh"], { ease: EASE_SCROLL });
  const scale = useTransform(progress, [start, end], [0.86, 1], { ease: EASE_SCROLL });
  const rotate = useTransform(progress, [start, end], [slot.rot + 10, slot.rot], { ease: EASE_SCROLL });

  // Opacity keyframes MUST span the full 0..1 progress range. Motion
  // hands scroll-linked opacity to a native WAAPI ViewTimeline animation,
  // and if the keyframe list stops short of offset 1 the browser
  // synthesises the missing endpoint from the element's underlying style
  // (opacity 0) — which silently fades every card back out after it
  // lands. The transform values dodge this only because they park on
  // their base values, so the same decay is a no-op there.
  const fadeEnd = start + 0.35 * (end - start);
  const opacity = useTransform(
    progress,
    start > 0 ? [0, start, fadeEnd, 1] : [start, fadeEnd, 1],
    start > 0 ? [0, 0, 1, 1] : [0, 1, 1]
  );

  return (
    <motion.div
      style={{
        position: "absolute",
        ...slot.pos,
        width: slot.back ? "calc(var(--card-w) * 0.9)" : "var(--card-w)",
        zIndex: index + 1,
        y,
        scale,
        rotate,
        opacity,
      }}
    >
      <QuoteCard quote={quote} />
    </motion.div>
  );
}

function QuoteCard({ quote }: { quote: (typeof QUOTES)[number] }) {
  return (
    <figure className="w-full rounded-card border border-ink/10 bg-white p-6 shadow-[0_1px_2px_rgba(13,46,33,0.04),0_8px_24px_-12px_rgba(13,46,33,0.10)]">
      <div aria-hidden className="text-3xl font-serif text-lime">&ldquo;</div>
      <blockquote className="mt-1 text-sm leading-[1.6] text-ink-soft">{quote.text}</blockquote>
      <figcaption className="mt-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-pill bg-forest-900 text-xs font-bold text-cream">{quote.initial}</span>
        <b className="text-sm font-extrabold text-ink">{quote.name}</b>
      </figcaption>
    </figure>
  );
}
