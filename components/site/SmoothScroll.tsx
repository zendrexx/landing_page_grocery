"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Inertial scrolling, mounted once from the root layout. Ported verbatim
 * from Zhevion's SmoothScroll.tsx — this is fully generic, no studio- or
 * app-specific content.
 *
 * Renders nothing. Two things here are less obvious than they look:
 *
 * 1. Lenis drives the scroll position itself, so `scroll-behavior: smooth` was
 *    removed from globals.css — the two fight and the result is neither.
 * 2. Because it owns scroll, a plain `#hash` link would jump the document out
 *    from under it. We intercept same-page anchors and hand them to
 *    `lenis.scrollTo` instead. That means calling preventDefault, which also
 *    cancels the focus move the browser would normally do — so we move focus
 *    ourselves. Without that the "Skip to content" link would scroll the page
 *    but leave the keyboard user's focus stranded up in the nav.
 *
 * Under `prefers-reduced-motion` none of this mounts: the browser's own instant
 * jump is the correct behaviour, and it already handles focus.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.05,
      // Exponential ease-out: quick to respond, long settle. Anything springier
      // reads as lag rather than weight.
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.6,
    });

    let frame = requestAnimationFrame(function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    });

    const onClick = (e: MouseEvent) => {
      // Leave modified clicks alone — those are "open in a new tab".
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as HTMLElement | null)?.closest?.("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.includes("#")) return;

      const url = new URL(anchor.href, window.location.href);
      const samePage =
        url.origin === window.location.origin &&
        url.pathname === window.location.pathname;
      if (!samePage) return;

      const id = decodeURIComponent(url.hash.slice(1));
      const target = id ? document.getElementById(id) : null;
      if (!target) return;

      e.preventDefault();
      lenis.scrollTo(target, {
        offset: -24,
        onComplete: () => {
          // Restore the focus move that preventDefault just cancelled.
          if (!target.hasAttribute("tabindex")) {
            target.setAttribute("tabindex", "-1");
          }
          target.focus({ preventScroll: true });
        },
      });
      window.history.pushState(null, "", url.hash);
    };

    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
