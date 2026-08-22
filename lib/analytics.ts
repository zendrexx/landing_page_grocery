/**
 * Analytics slot.
 *
 * No real key is hardcoded. Drop your provider snippet in app/layout.tsx where
 * marked, then this helper forwards CTA click events to it. Until a provider is
 * wired, calls are safe no-ops (logged in dev only).
 */
declare global {
  interface Window {
    zebiteAnalytics?: (event: string, props?: Record<string, unknown>) => void;
  }
}

export function trackCTA(name: string, props?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  try {
    window.zebiteAnalytics?.("cta_click", { cta: name, ...props });
  } catch {
    /* analytics must never break the UI */
  }
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[cta]", name, props ?? "");
  }
}
