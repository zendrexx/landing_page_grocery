"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { HERO } from "@/lib/content";

const DWELL = 2400;

/**
 * Sized so the longest word still fits its column. Zebite's three words
 * (PANTRY / GOALS / BUDGET) are all shorter than Zhevion's longest
 * ("DIGITAL EXPERIENCES"), so reusing its exact clamp is a safe, conservative
 * fit rather than a guess — it was already sized for a harder case than this.
 */
const WORD_SIZE = "clamp(1.5rem, 4.4vw, 3.5rem)";

/**
 * The rotating word in the hero statement. Ported from Zhevion's
 * WordCycle.tsx — same mechanism (the word sits on its own line so the
 * sentence never reflows; the width motion goes to the rule underneath
 * instead), only the word list changed.
 */
export function WordCycle() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(() =>
    Math.max(0, HERO.words.indexOf(HERO.restWord)),
  );
  const [width, setWidth] = useState(0);
  const sizerRef = useRef<HTMLSpanElement>(null);

  const word = reduce ? HERO.restWord : HERO.words[index];

  useEffect(() => {
    if (reduce) return;

    let timer: ReturnType<typeof setInterval>;
    const start = () => {
      timer = setInterval(
        () => setIndex((i) => (i + 1) % HERO.words.length),
        DWELL,
      );
    };
    const stop = () => clearInterval(timer);

    const onVisibility = () => {
      stop();
      if (document.visibilityState === "visible") start();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reduce]);

  useEffect(() => {
    const el = sizerRef.current;
    if (!el) return;
    const measure = () => setWidth(el.getBoundingClientRect().width);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <span className="block">
      <span
        ref={sizerRef}
        aria-hidden
        className="pointer-events-none absolute -left-[9999px] top-0 whitespace-nowrap font-extrabold leading-none tracking-tightest"
        style={{ fontSize: WORD_SIZE }}
      >
        {word}
      </span>

      <span
        className="relative block overflow-hidden font-extrabold leading-none tracking-tightest text-ink"
        style={{ fontSize: WORD_SIZE, height: "1.08em" }}
      >
        <AnimatePresence initial={false} mode="wait">
          <motion.span
            key={word}
            className="absolute inset-x-0 top-0 block whitespace-nowrap leading-none"
            initial={reduce ? { opacity: 1 } : { y: "70%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={
              reduce
                ? { opacity: 0 }
                : { y: "-45%", opacity: 0, transition: { duration: 0.3, ease: [0.4, 0, 1, 1] } }
            }
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
            }
          >
            {word}
          </motion.span>
        </AnimatePresence>
      </span>

      {/* The only saturated colour on the page, and the only thing whose width
          moves. */}
      <motion.span
        aria-hidden
        className="mt-2 block h-[4px] rounded-pill bg-lime"
        initial={{ width: 0 }}
        animate={{ width }}
        transition={
          reduce
            ? { duration: 0 }
            : { type: "spring", stiffness: 170, damping: 26, mass: 0.9, delay: 0.12 }
        }
      />
    </span>
  );
}
