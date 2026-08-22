"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { PhoneScreen } from "./PhoneScreen";

/**
 * Ported verbatim from Zhevion's HeroHand.tsx. hand-phone.png is the exact
 * same photo Zhevion's own site uses for its Zebite case-study hero —
 * copied byte-for-byte into this repo's /public/hero/.
 */
export function HeroHand() {
  const reduce = useReducedMotion();

  return (
    <div
      className="pointer-events-none absolute bottom-0 right-0 z-20"
      aria-hidden
    >
      <motion.div
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 70 }}
        animate={{ opacity: 1, y: 0 }}
        transition={
          reduce
            ? { duration: 0.4, delay: 0.2 }
            : {
                duration: 1.25,
                delay: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }
        }
      >
        <div
          className="relative aspect-[185/281] w-[clamp(150px,46vw,220px)] md:h-[50svh] md:w-auto lg:h-[68svh]"
        >
          <Image
            src="/hero/hand-phone.png"
            alt=""
            fill
            sizes="(max-width: 767px) 70vw, (max-width: 1023px) 34vw, 32vw"
            priority
            className="select-none object-contain"
            draggable={false}
          />

          <PhoneScreen />
        </div>
      </motion.div>
    </div>
  );
}
