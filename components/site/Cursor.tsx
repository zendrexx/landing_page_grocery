"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";

type CursorState = "default" | "link" | "visual";

type Palette = { size: number; background: string };

/**
 * Three states, one element. The circle morphs between them rather than
 * swapping a dot for a ring, so the transition itself is the effect.
 * Ported verbatim from Zhevion's Cursor.tsx — fully generic, no studio- or
 * app-specific content, so nothing here needed adapting for Zebite.
 *
 * Each state carries a light and dark palette so the dot stays visible
 * crossing onto a `.dark-panel`/`.on-dark` surface — see the `onDark`
 * detection below. `visual`'s lime background is left unchanged on dark;
 * it already reads fine against graphite. The outer ring's color is handled
 * separately (see `RING_COLOR` below) — it's a constant outline across all
 * three states, not something that varies with `state`.
 */
const STATES: Record<CursorState, { light: Palette; dark: Palette }> = {
  default: {
    light: { size: 10, background: "rgba(13, 46, 33, 1)" },
    dark: { size: 10, background: "rgba(245, 245, 243, 1)" },
  },
  link: {
    light: { size: 46, background: "rgba(13, 46, 33, 0.08)" },
    dark: { size: 46, background: "rgba(245, 245, 243, 0.08)" },
  },
  visual: {
    light: { size: 96, background: "rgba(181, 227, 77, 0.26)" },
    dark: { size: 96, background: "rgba(181, 227, 77, 0.26)" },
  },
};

// The janky outer outline's stroke color: always visible (~45% opacity),
// just recolored between ink and cream depending on the surface underneath.
const RING_COLOR = {
  light: "rgba(13, 46, 33, 0.45)",
  dark: "rgba(245, 245, 243, 0.45)",
};

/**
 * Custom cursor.
 *
 * Gated behind a fine pointer and no reduced-motion preference, and re-checked
 * live — plugging in a mouse or flipping the OS motion setting takes effect
 * without a reload. When it doesn't apply, nothing renders and nothing in the
 * document is touched, so touch and no-JS visitors keep the native pointer.
 */
export function Cursor() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const evaluate = () => setEnabled(fine.matches && !reduced.matches);

    evaluate();
    fine.addEventListener("change", evaluate);
    reduced.addEventListener("change", evaluate);
    return () => {
      fine.removeEventListener("change", evaluate);
      reduced.removeEventListener("change", evaluate);
    };
  }, []);

  return enabled ? <CursorLayer /> : null;
}

function CursorLayer() {
  const [state, setState] = useState<CursorState>("default");
  const [label, setLabel] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [onDark, setOnDark] = useState(false);

  const x = useMotionValue(-200);
  const y = useMotionValue(-200);
  // Deliberately under-damped-adjacent: enough lag to feel like it has mass,
  // not so much that it reads as dropped frames.
  const sx = useSpring(x, { stiffness: 420, damping: 34, mass: 0.7 });
  const sy = useSpring(y, { stiffness: 420, damping: 34, mass: 0.7 });

  useEffect(() => {
    document.documentElement.classList.add("has-cursor");

    const onMove = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };

    /**
     * One delegated listener for the whole document. Elements opt into a state
     * with `data-cursor="visual"`; plain links and buttons get the link state
     * for free, so future sections need no wiring at all.
     */
    const onOver = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;

      const surface = target?.closest?.(
        ".dark-panel, .on-dark, .bg-graphite-900, .bg-paper",
      ) as HTMLElement | null;
      setOnDark(!!surface && !surface.classList.contains("bg-paper"));

      const el = target?.closest?.(
        "[data-cursor], a[href], button, [role='button']",
      ) as HTMLElement | null;

      if (!el) {
        setState("default");
        setLabel(null);
        return;
      }

      const declared = el.getAttribute("data-cursor") as CursorState | null;
      setState(declared ?? "link");
      setLabel(el.getAttribute("data-cursor-label"));
    };

    const hide = () => setVisible(false);
    const show = () => setVisible(true);

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerleave", hide);
    document.addEventListener("pointerenter", show);
    window.addEventListener("blur", hide);

    return () => {
      document.documentElement.classList.remove("has-cursor");
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerleave", hide);
      document.removeEventListener("pointerenter", show);
      window.removeEventListener("blur", hide);
    };
  }, [x, y]);

  const s = STATES[state][onDark ? "dark" : "light"];

  return (
  <motion.div
    aria-hidden
    className="pointer-events-none fixed left-0 top-0 z-[9999]"
    style={{ x: sx, y: sy }}
  >
    <motion.div
      className="relative grid h-[120px] w-[120px] -translate-x-1/2 -translate-y-1/2 place-items-center"
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Janky outer outline */}
<motion.div
  className="absolute border"
  animate={{
    width: s.size + 18,
    height: s.size + 18,
    borderColor: onDark ? RING_COLOR.dark : RING_COLOR.light,
    rotate: [-7, -3, -8, -5, -7],
    scaleX: [0.92, 0.97, 0.9, 0.95, 0.92],
    scaleY: [1, 0.96, 1.03, 0.98, 1],
  }}
  style={{
    borderRadius: "47% 53% 49% 51% / 54% 46% 55% 45%",
  }}
  transition={{
    width: {
      type: "spring",
      stiffness: 320,
      damping: 30,
      mass: 0.6,
    },
    height: {
      type: "spring",
      stiffness: 320,
      damping: 30,
      mass: 0.6,
    },
    borderColor: {
      type: "spring",
      stiffness: 320,
      damping: 30,
      mass: 0.6,
    },
    rotate: {
      duration: 2.8,
      repeat: Infinity,
      ease: "easeInOut",
    },
    scaleX: {
      duration: 2.4,
      repeat: Infinity,
      ease: "easeInOut",
    },
    scaleY: {
      duration: 2.1,
      repeat: Infinity,
      ease: "easeInOut",
    },
  }}
/>

    {/* Inner dot */}
    <motion.div
      className="relative z-10 rounded-full"
      animate={{
        width: s.size,
        height: s.size,
        backgroundColor: s.background,
      }}
      transition={{
        type: "spring",
        stiffness: 320,
        damping: 30,
        mass: 0.6,
      }}
    >
      <AnimatePresence>
        {label ? (
          <motion.span
            key={label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.24 }}
            className={`select-none whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.16em] ${
              onDark ? "text-cream" : "text-ink"
            }`}
          >
            {label}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </motion.div>
    </motion.div>
  </motion.div>
);
}
