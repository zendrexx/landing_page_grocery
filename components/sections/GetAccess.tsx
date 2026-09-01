"use client";

import Image from "next/image";
import { Reveal } from "@/components/ui/Reveal";
import { trackCTA } from "@/lib/analytics";
import { CONTACT, STORE } from "@/lib/content";

/**
 * The closing CTA.
 *
 * This was the waitlist: a Web3Forms email capture wired to a
 * WaitlistCounter Durable Object that handed out 30 "direct access" spots
 * and counted the rest. It came down at release. The DO and its final
 * count are untouched and still deployed (worker/waitlist-do/); nothing
 * here reads them any more.
 *
 * Note what this section must NOT do. Zebite is in closed testing on
 * Google Play, and a closed-testing opt-in URL only resolves for accounts
 * already on the tester list — for everyone else it is an "item not
 * available" page that looks exactly like a broken download. So that link
 * lives in the mail to the people it works for, never in STORE below, and
 * this section stays honest about being early access until there is a
 * public listing to point at.
 *
 * Both badges take their URL from STORE in lib/content.ts, and an empty
 * URL there is a feature: the badge renders as an unclickable "soon" chip
 * rather than a dead link, so this page is honest during the hours a
 * listing is still going live, and becomes a real download the moment the
 * constant is filled in.
 *
 * The section keeps `id="get"` — every CTA on the site points at #get
 * (nav, mobile menu, all three pricing cards, the footer), and a release
 * is no reason to break the anchor they all share.
 */
export function GetAccess() {
  const live = Boolean(STORE.play || STORE.ios);

  return (
    <section
      id="get"
      className="world-grocery grid-texture bg-graphite-900 py-[clamp(72px,12vh,140px)] text-cream"
    >
      <div className="shell max-w-[38rem] text-center">
        <Reveal>
          <Image
            src="/mascot/zeb/zebwave.png"
            alt="Zeb waving"
            width={130}
            height={130}
            className="mx-auto"
            style={{ width: 130, height: "auto" }}
          />
          <p className="eyebrow mt-3 justify-center text-lime text-xs">
            {live ? "Out now" : "Early access"}
          </p>
          <h2 className="mt-2 text-[clamp(1.8rem,3.6vw,2.6rem)] font-extrabold tracking-[-0.02em]">
            Eat better · Spend less · Waste nothing
          </h2>

          <p className="mx-auto mt-4 max-w-[44ch] text-sm font-semibold text-muted">
            {live ? (
              <>
                Download Zebite and let it plan your first week — your pantry,
                your targets, your budget.
              </>
            ) : (
              <>
                Zebite is in closed testing on Google Play — a small group
                using it for real weeks before the public release. Email me
                and I&rsquo;ll add you to the tester list.
              </>
            )}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <StoreBadge
              href={STORE.play}
              small={STORE.play ? "Get it on" : "Launching on"}
              big="Google Play"
              cta="final-googleplay"
              playIcon
            />
            <StoreBadge
              href={STORE.ios}
              small={STORE.ios ? "Download on the" : "Coming soon to the"}
              big="App Store"
              cta="final-appstore"
            />
          </div>

          {/* A plain address, not a form. Closed testing admits people one
              Google account at a time — I have to add each address in Play
              Console by hand — so a signup box would only rebuild the
              waitlist this release took down, and would promise an automatic
              door that does not exist. Mail is the honest interface for a
              process that is genuinely manual. */}
          {!live ? (
            <p className="mt-6 text-xs text-muted">
              <a
                href={`mailto:${CONTACT.email}?subject=Zebite%20tester%20access`}
                onClick={() => trackCTA("final-email")}
                className="font-semibold text-cream/85 underline"
              >
                {CONTACT.email}
              </a>
              {" — "}tell me the Google account you use on Play and I&rsquo;ll
              send the opt-in link.
            </p>
          ) : null}
        </Reveal>
      </div>
    </section>
  );
}

/**
 * A link when there is somewhere to go, a plain chip when there is not —
 * never an <a> with a placeholder href. `aria-disabled` plus the dimmed
 * styling say the same thing to a screen reader that the greying says to
 * everyone else.
 */
function StoreBadge({
  href,
  small,
  big,
  cta,
  playIcon,
}: {
  href: string;
  small: string;
  big: string;
  cta: string;
  playIcon?: boolean;
}) {
  const icon = playIcon ? (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
      <path d="M4 3.2v17.6c0 .5.5.8.9.5l9.6-8.8-9.6-8.8c-.4-.3-.9 0-.9.5z" fill="#B5E34D" />
      <path d="M17.4 9.6 14.5 12l2.9 2.4 2.8-1.6c.7-.4.7-1.4 0-1.8l-2.8-1.4z" fill="#fff" />
      <path d="M4.9 20.8 14.5 12l-2.6-2.4-7 8.7c-.2.3-.1.6 0 .5z" fill="#fff" opacity=".7" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden>
      <path d="M16.5 12.6c0-2 1.6-2.9 1.7-3-1-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7-.6 0-1.6-.7-2.6-.7-1.3 0-2.6.8-3.3 2-1.4 2.4-.4 6 1 8 .7 1 1.4 2 2.4 2 1 0 1.3-.6 2.5-.6 1.1 0 1.5.6 2.5.6s1.7-1 2.4-2c.7-1.1 1-2.1 1-2.2 0 0-1.9-.8-1.9-3zm-2-5.5c.5-.7.9-1.6.8-2.6-.8 0-1.8.6-2.4 1.2-.5.6-1 1.5-.8 2.4.9.1 1.8-.4 2.4-1z" />
    </svg>
  );

  const label = (
    <span className="text-left">
      <span className="block text-[0.63rem] font-semibold uppercase tracking-[0.06em] opacity-80">
        {small}
      </span>
      <span className="-mt-0.5 block text-base font-bold">{big}</span>
    </span>
  );

  const base =
    "flex items-center gap-2.5 rounded-card border border-white/20 px-4 py-2.5";

  if (!href) {
    return (
      <span
        aria-disabled
        aria-label={`${small} ${big}`}
        className={`${base} bg-white/5 opacity-55`}
      >
        {icon}
        {label}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={() => trackCTA(cta)}
      aria-label={`${small} ${big}`}
      className={`${base} bg-white/10 transition-colors hover:bg-white/[0.16]`}
    >
      {icon}
      {label}
    </a>
  );
}
