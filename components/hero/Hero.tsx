"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { HERO } from "@/lib/content";
import { HeroHand } from "./HeroHand";
import { WordCycle } from "./WordCycle";

const LETTERS = "ZEBITE".split("");

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Wordmark size — measured, not guessed, same rule Zhevion's own hero
 * follows. Zhevion computes the exact em-advance of "ZHEVION" once at
 * build time (measuring the real font file) and bakes it into a clamp().
 * There's no equivalent build step here, so a canvas probe does the same
 * measurement at runtime instead: it reads the *actual* rendered advance
 * width of "ZEBITE" in the loaded Plus Jakarta Sans ExtraBold, then derives
 * the font-size that makes the wordmark land flush on both edges of the
 * content column — the same outcome as Zhevion's build-time math, just
 * computed a moment later. FALLBACK_SIZE is only what SSR/first paint show
 * before that measurement resolves.
 */
const FALLBACK_SIZE = "clamp(3.5rem, 17vw, 11rem)";

function useMeasuredWordmarkSize(rowRef: React.RefObject<HTMLSpanElement | null>) {
  const [size, setSize] = useState<string | null>(null);

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    function apply() {
      if (!row) return;
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.font = '800 200px "Plus Jakarta Sans", sans-serif';
      const w200 = ctx.measureText("ZEBITE").width;
      const colWidth = row.getBoundingClientRect().width;
      if (!w200 || !colWidth) return;
      // ~1.5% held back, matching Zhevion's own margin, so flex
      // justify-between still has a hair of tracking to distribute rather
      // than squeezing the final glyph into its mask.
      const px = Math.max(48, Math.min((colWidth / w200) * 200 * 0.985, 240));
      setSize(`${px}px`);
    }

    apply();
    document.fonts?.ready?.then(apply);
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [rowRef]);

  return size;
}

export function Hero() {
  const reduce = useReducedMotion();
  const pinRef = useRef<HTMLDivElement | null>(null);
  const rowRef = useRef<HTMLSpanElement | null>(null);
  const wordmarkSize = useMeasuredWordmarkSize(rowRef);

  // "Becomes a container": scrolling in pins the hero (extra scroll height
  // reserved on the outer div, sticky inner) while it settles and its bottom
  // corners round off, revealing the dark ground behind it as a frame — then
  // holds there before releasing into the section below. Ported verbatim
  // from Zhevion's Hero.tsx.
  const { scrollYProgress } = useScroll({
    target: pinRef,
    offset: ["start start", "end end"],
  });
  const exitScale = useTransform(scrollYProgress, [0, 0.6, 1], [1, 0.97, 0.97]);
  const bottomRadius = useTransform(scrollYProgress, [0, 0.6, 1], [0, 24, 24]);
  const exitRadius = useTransform(bottomRadius, (r) => `0px 0px ${r}px ${r}px`);

  const rise = (delay: number) =>
    reduce
      ? {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.4, delay: 0 },
        }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.9, delay, ease: EASE },
        };

  return (
    <div
      id="hero"
      ref={pinRef}
      className={reduce ? "relative" : "dark-panel relative"}
      style={reduce ? undefined : { height: "170vh" }}
    >
      <div className={reduce ? undefined : "sticky top-0 h-screen overflow-hidden"}>
        <motion.section
          style={
            reduce
              ? undefined
              : {
                  scale: exitScale,
                  borderRadius: exitRadius,
                  transformOrigin: "50% 0%",
                }
          }
          className="paper-grain relative isolate min-h-[100svh] overflow-hidden bg-paper"
        >
      <div className="relative mx-auto flex min-h-[100svh] max-w-content flex-col px-[var(--page-x)]">
        <motion.p
          {...rise(0.2)}
          className="eyebrow pt-[clamp(96px,12vh,132px)] text-ink-faint"
        >
          {HERO.eyebrow}
        </motion.p>

        <h1 className="mt-[clamp(12px,2.5vh,28px)]">
          <span className="sr-only">Zebite</span>
          <span
            ref={rowRef}
            aria-hidden
            className="flex w-full justify-between font-extrabold leading-[0.86] text-ink"
            style={{ fontSize: wordmarkSize ?? FALLBACK_SIZE }}
          >
            {LETTERS.map((letter, i) => (
              <span key={i} className="letter-mask shrink-0">
                <motion.span
                  className="block"
                  initial={reduce ? { opacity: 0 } : { y: "110%" }}
                  animate={reduce ? { opacity: 1 } : { y: "0%" }}
                  transition={
                    reduce
                      ? { duration: 0.4 }
                      : { duration: 0.9, delay: 0.3 + i * 0.04, ease: EASE }
                  }
                >
                  {letter}
                </motion.span>
              </span>
            ))}
          </span>
        </h1>

        {/* Full width on mobile; from md up the hand shares the row, so it
            caps at 62%. */}
        <div className="relative z-30 mt-[clamp(36px,6vh,88px)] max-w-full md:max-w-[min(560px,62%)]">
          <p className="sr-only">{HERO.spoken}</p>

          <div aria-hidden>
            <motion.p
              {...rise(0.7)}
              className="text-[clamp(1rem,1.9vw,1.35rem)] font-medium text-ink-soft"
            >
              {HERO.lead}
            </motion.p>

            <motion.div {...rise(0.78)} className="mt-2">
              <WordCycle />
            </motion.div>

            <motion.p
              {...rise(0.86)}
              className="mt-4 text-[clamp(1rem,1.9vw,1.35rem)] font-medium text-ink-soft"
            >
              {HERO.tail}
            </motion.p>
          </div>
        </div>

        {/* Baseline row — scroll cue only, sitting where the CTA used to
            anchor the row, still capped to the same 62% column so it never
            runs under the hand. */}
        <motion.div
          {...rise(1.2)}
          className="relative z-30 mt-auto flex items-end justify-start pb-[clamp(22px,5vh,44px)] pt-[clamp(28px,6vh,64px)] md:max-w-[62%]"
        >
          <ScrollCue reduce={!!reduce} />
        </motion.div>

        <HeroHand />
      </div>
        </motion.section>
      </div>
    </div>
  );
}

/** A hairline that keeps travelling down its own track. */
function ScrollCue({ reduce }: { reduce: boolean }) {
  return (
    <span className="flex items-center gap-3">
      <span className="relative block h-[26px] w-px overflow-hidden bg-ink/15">
        {!reduce ? (
          <motion.span
            className="absolute inset-x-0 top-0 block h-[10px] bg-ink"
            animate={{ y: [-10, 26] }}
            transition={{
              duration: 1.9,
              repeat: Infinity,
              ease: [0.65, 0, 0.35, 1],
              repeatDelay: 0.35,
            }}
          />
        ) : null}
      </span>
      <span className="eyebrow text-[0.6875rem] text-ink-faint">Scroll</span>
    </span>
  );
}
