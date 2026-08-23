"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { trackCTA } from "@/lib/analytics";
import { CONTACT } from "@/lib/content";

/**
 * Waitlist form, ported from the static build's main.js. Submits to
 * Web3Forms (email capture, no backend needed) and, once that confirms,
 * claims a spot from /api/waitlist/join — a Next.js route handler backed
 * by the WaitlistCounter Durable Object (see worker/waitlist-do/ and
 * README.md, "The waitlist cap"). If that DO Worker isn't deployed
 * alongside this app, both /api/waitlist/* calls fail silently and the
 * static fallback copy below stands, same "works without it" rule the
 * rest of the site follows.
 */
export function GetAccess() {
  const formRef = useRef<HTMLFormElement>(null);
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);
  const [cap, setCap] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [direct, setDirect] = useState(false);

  useEffect(() => {
    fetch("/api/waitlist/status")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) {
          setSpotsLeft(d.spotsLeft);
          setCap(d.cap);
        }
      })
      .catch(() => {});
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = formRef.current;
    if (!form) return;
    const input = form.querySelector<HTMLInputElement>('input[type="email"]');
    if (input && !input.checkValidity()) {
      input.reportValidity();
      return;
    }
    const email = input?.value.trim() ?? "";
    setStatus("loading");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      const data = await res.json();
      if (data?.success) {
        trackCTA("waitlist-submit", { email_domain: email.split("@")[1] || "" });
        try {
          const j = await fetch("/api/waitlist/join", { method: "POST" }).then((r) => (r.ok ? r.json() : null));
          if (j) {
            setDirect(!!j.direct);
            setSpotsLeft(Math.max(0, j.cap - j.count));
            setCap(j.cap);
          }
        } catch {
          /* the join call is a bonus, not a requirement for success */
        }
        setStatus("done");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <section id="get" className="world-grocery grid-texture bg-graphite-900 py-[clamp(72px,12vh,140px)] text-cream">
      <div className="shell max-w-[38rem] text-center">
        <Reveal>
          <Image src="/mascot/zeb/zebwave.png" alt="Zeb waving, inviting you to join" width={130} height={130} className="mx-auto" style={{ width: 130, height: "auto" }} />
          <p className="eyebrow mt-3 justify-center text-lime text-xs">Get early access</p>
          <h2 className="mt-2 text-[clamp(1.8rem,3.6vw,2.6rem)] font-extrabold tracking-[-0.02em]">
            Eat better · Spend less · Waste nothing
          </h2>
         

          {status === "done" ? (
            <p role="status" className="mt-8 text-sm font-bold text-[#7CD37C]">
              {direct
                ? "You're in — check your email, I'll send the Google Play access link myself."
                : "Thanks — you're on the waitlist. I'll email you the moment a spot opens."}
            </p>
          ) : (
            <form ref={formRef} onSubmit={onSubmit} className="mt-8" noValidate>
              <input type="hidden" name="access_key" value="7e815f4a-d060-4d2e-ab8c-e89ed28aab88" />
              <input type="hidden" name="subject" value="New waitlist signup — Zebite" />
              <input type="hidden" name="from_name" value="Zebite waitlist" />
              <input type="checkbox" name="botcheck" tabIndex={-1} autoComplete="off" style={{ display: "none" }} aria-hidden />

              <p className="mb-3 text-sm font-semibold text-muted">
                {spotsLeft !== null && cap !== null ? (
                  spotsLeft > 0 ? (
                    <>Send your email and I&rsquo;ll send you the app myself — <b className="text-lime">{spotsLeft} of {cap}</b> direct-access spots left.</>
                  ) : (
                    <>The first {cap} spots are taken — join the waitlist and I&rsquo;ll email you the moment one opens.</>
                  )
                ) : (
                  "Send your email and I'll send you the app myself — spots are limited, first come first served."
                )}
              </p>

              <div className="flex flex-wrap justify-center gap-2.5">
                <label className="sr-only" htmlFor="email">Email address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@email.com"
                  autoComplete="email"
                  inputMode="email"
                  className="w-full sm:w-[280px] rounded-pill border border-white/20 bg-white/5 px-4 py-3 text-base text-cream placeholder:text-muted focus-visible:outline-2 focus-visible:outline-lime"
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="rounded-pill bg-lime px-5 py-2.5 text-sm font-extrabold text-lime-ink transition-colors hover:bg-[#C0EA5C] disabled:opacity-60"
                >
                  {status === "loading" ? "Joining…" : spotsLeft === 0 ? "Join the waitlist" : "Get early access"}
                </button>
              </div>
              <p className="mt-2.5 text-xs text-muted">Early-access updates only. No spam — unsubscribe anytime.</p>
              {status === "error" ? (
                <p role="alert" className="mt-2.5 text-sm font-semibold text-[#F3B8B8]">
                  Something went wrong — try again, or email{" "}
                  <a href={`mailto:${CONTACT.email}`} className="underline">{CONTACT.email}</a> directly.
                </p>
              ) : null}
            </form>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <StoreBadge small="Launching on" big="Google Play" cta="final-googleplay" playIcon />
            <StoreBadge small="Coming soon to the" big="App Store" cta="final-appstore" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function StoreBadge({ small, big, cta, playIcon }: { small: string; big: string; cta: string; playIcon?: boolean }) {
  return (
    <a
      href="#get"
      onClick={() => trackCTA(cta)}
      aria-label={`${small} ${big}`}
      className="flex items-center gap-2.5 rounded-card border border-white/20 bg-white/10 px-4 py-2.5 transition-colors hover:bg-white/[0.16]"
    >
      {playIcon ? (
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
          <path d="M4 3.2v17.6c0 .5.5.8.9.5l9.6-8.8-9.6-8.8c-.4-.3-.9 0-.9.5z" fill="#B5E34D" />
          <path d="M17.4 9.6 14.5 12l2.9 2.4 2.8-1.6c.7-.4.7-1.4 0-1.8l-2.8-1.4z" fill="#fff" />
          <path d="M4.9 20.8 14.5 12l-2.6-2.4-7 8.7c-.2.3-.1.6 0 .5z" fill="#fff" opacity=".7" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
          <path d="M16.5 12.6c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.4 2 2.4 2 1 0 1.3-.6 2.5-.6 1.1 0 1.5.6 2.5.6s1.7-1 2.4-2c.7-1.1 1-2.1 1-2.2 0 0-1.9-.8-1.9-3zm-2-5.5c.5-.7.9-1.6.8-2.6-.8 0-1.8.6-2.4 1.2-.5.6-1 1.5-.8 2.4.9.1 1.8-.4 2.4-1z" />
        </svg>
      )}
      <span className="text-left">
        <span className="block text-[0.63rem] font-semibold uppercase tracking-[0.06em] opacity-80">{small}</span>
        <span className="-mt-0.5 block text-base font-bold">{big}</span>
      </span>
    </a>
  );
}
