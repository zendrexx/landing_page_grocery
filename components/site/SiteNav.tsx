"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { NAV } from "@/lib/content";
import { trackCTA } from "@/lib/analytics";

const PILL_LIGHT =
  "rounded-pill border border-ink/10 bg-paper/70 backdrop-blur-xl " +
  "shadow-[0_1px_2px_rgba(13,46,33,0.04),0_10px_30px_-16px_rgba(13,46,33,0.25)]";

const PILL_DARK =
  "rounded-pill border border-white/12 bg-graphite-900/75 backdrop-blur-xl " +
  "shadow-[0_1px_2px_rgba(0,0,0,0.3),0_10px_30px_-16px_rgba(0,0,0,0.55)]";

// The mobile flyout panel needs to stay legible over whatever sits behind it
// (often the huge hero headline), so unlike the pill above it's fully opaque
// rather than translucent + blurred — a blur over that much contrast just
// turns into a muddy blob instead of a clean panel.
const PANEL_LIGHT =
  "rounded-card border border-ink/10 bg-paper " +
  "shadow-[0_1px_2px_rgba(13,46,33,0.04),0_20px_50px_-16px_rgba(13,46,33,0.35)]";

const PANEL_DARK =
  "rounded-card border border-white/12 bg-graphite-900 " +
  "shadow-[0_1px_2px_rgba(0,0,0,0.3),0_20px_50px_-16px_rgba(0,0,0,0.6)]";

// Sections whose background the nav should read as "dark" over — kept in
// sync with Cursor.tsx's own dark-surface detection. `.bg-paper` has to be
// in the same selector (not checked separately) so `.closest()` stops there
// when it's the nearer ancestor — e.g. the Hero's light `bg-paper` panel
// sits nested inside its own outer `.dark-panel` scroll-reveal wrapper, and
// without this the far ancestor would win over the actually-visible one.
const SURFACE_SELECTOR = ".dark-panel, .on-dark, .bg-graphite-900, .bg-paper";

function isDarkSurface(el: Element | null): boolean {
  const surface = el?.closest?.(SURFACE_SELECTOR) as HTMLElement | null;
  return !!surface && !surface.classList.contains("bg-paper");
}

/**
 * Floating navigation — ported from Zhevion's SiteNav.tsx (same pill,
 * same shared-layout puck, same spring constants). The one deliberate
 * adaptation: Zebite is a conversion page, not a portfolio, so a compact
 * primary CTA sits inside the same pill after the links — Zhevion's own
 * nav has no CTA at all, since "Contact" already does that job for it.
 */
export function SiteNav() {
  const [compact, setCompact] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const reduce = useReducedMotion();

  const { scrollY } = useScroll();

  useEffect(() => {
    // Sample a point just left of the centred pill, where the header itself
    // is `pointer-events-none` — this hits whatever section sits underneath,
    // never the nav pill, so it works regardless of how wide the pill is.
    const checkSurface = () => {
      setOnDark(isDarkSurface(document.elementFromPoint(24, 56)));
    };
    checkSurface();
    window.addEventListener("resize", checkSurface);
    return () => window.removeEventListener("resize", checkSurface);
  }, []);

  useMotionValueEvent(scrollY, "change", (v) => {
    setCompact(v > 40);
    setOnDark(isDarkSurface(document.elementFromPoint(24, 56)));
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const enter = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 } }
    : {
        initial: { opacity: 0, y: -14 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] as const },
      };

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <div className="flex justify-center px-[var(--page-x)] py-5">
        <motion.div {...enter} className="pointer-events-auto relative">
          <motion.div
            animate={{ scale: compact && !reduce ? 0.94 : 1 }}
            style={{ originX: 0.5, originY: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
          >
            <div
              className={`${onDark ? PILL_DARK : PILL_LIGHT} flex items-center gap-1 p-2 transition-colors duration-300`}
            >
              <a
                href="/"
                aria-label="Zebite — home"
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-pill transition-colors ${
                  onDark ? "hover:bg-white/10" : "hover:bg-ink/5"
                }`}
              >
                <Image src="/mascot/zeb-face.png" alt="" width={28} height={28} className="rounded-full" />
              </a>

              {/* ---- Links (desktop) --------------------------------- */}
              <nav aria-label="Primary" className="hidden md:block">
                <ul
                  className="flex items-center gap-1"
                  onMouseLeave={() => setHovered(null)}
                >
                  {NAV.links.map((l) => {
                    const isHovered = hovered === l.href;
                    return (
                      <li key={l.href}>
                        <a
                          href={l.href}
                          onMouseEnter={() => setHovered(l.href)}
                          onFocus={() => setHovered(l.href)}
                          className="relative block rounded-pill px-4 py-2.5 text-sm font-semibold whitespace-nowrap"
                        >
                          {/* One puck, shared across items — motion interpolates
                              its box between them, so it slides instead of
                              cross-fading. */}
                          {isHovered ? (
                            <motion.span
                              layoutId="nav-puck"
                              className="absolute inset-0 rounded-pill bg-ink"
                              transition={
                                reduce
                                  ? { duration: 0 }
                                  : { type: "spring", stiffness: 420, damping: 38 }
                              }
                            />
                          ) : null}
                          <span
                            className={`relative z-10 transition-colors duration-200 ${
                              isHovered ? "text-paper" : onDark ? "text-cream/80" : "text-ink-soft"
                            }`}
                          >
                            {l.label}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              {/* ---- CTA (desktop) — Zebite's own adaptation ---------- */}
              <a
                href="#get"
                onClick={() => trackCTA("nav-get")}
                className="hidden md:inline-flex items-center rounded-pill bg-lime px-4 py-2.5 text-sm font-bold text-lime-ink transition-colors hover:bg-[#C0EA5C] whitespace-nowrap"
              >
                Get the app
              </a>

              {/* ---- Menu button (mobile) ----------------------------- */}
              <button
                type="button"
                aria-expanded={open}
                aria-controls="site-menu"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((v) => !v)}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-pill transition-colors md:hidden ${
                  onDark ? "text-cream hover:bg-white/10" : "text-ink hover:bg-ink/5"
                }`}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path
                    d={open ? "M6 6l12 12M18 6L6 18" : "M4 8h16M4 16h16"}
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </motion.div>

          {/* ---- Menu (mobile, expanded) --------------------------------- */}
          <div className="absolute left-1/2 top-full mt-2 w-[min(16rem,78vw)] -translate-x-1/2 md:hidden">
            <AnimatePresence>
              {open ? (
                <motion.nav
                  id="site-menu"
                  aria-label="Primary"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.96 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  style={{ originX: 0.5, originY: 0 }}
                  className={`${onDark ? PANEL_DARK : PANEL_LIGHT} pointer-events-auto overflow-hidden p-2`}
                >
                  <ul className="flex flex-col">
                    {NAV.links.map((l) => (
                      <li key={l.href}>
                        <a
                          href={l.href}
                          onClick={() => setOpen(false)}
                          className={`block rounded-[14px] px-4 py-3 text-base font-semibold transition-colors hover:bg-ink hover:text-paper ${
                            onDark ? "text-cream" : "text-ink"
                          }`}
                        >
                          {l.label}
                        </a>
                      </li>
                    ))}
                    <li className="mt-1">
                      <a
                        href="#get"
                        onClick={() => {
                          trackCTA("menu-get");
                          setOpen(false);
                        }}
                        className="block rounded-[14px] bg-lime px-4 py-3 text-center text-base font-bold text-lime-ink transition-colors hover:bg-[#C0EA5C]"
                      >
                        Get the app
                      </a>
                    </li>
                  </ul>
                </motion.nav>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </header>
  );
}
