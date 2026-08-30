import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { FeedbackFormSection } from "@/components/sections/FeedbackForm";
import { CONTACT } from "@/lib/content";

/**
 * https://zebite.zhevion.com/feedback — the door for everyone the in-app
 * feedback board cannot serve: somebody who has not installed Zebite, is
 * signed out, has deleted their account, followed the link from the store
 * listing, or whose app cannot reach the board at all. The Zebite app links
 * here from Profile → Feedback → "Send us a message" (AppInfo.feedbackUrl)
 * and from the board's own error state.
 *
 * Deliberately not a landing page. No hero, no nav, no scroll journey — one
 * job, done above the fold on a phone.
 *
 * `noindex`: a utility page with no search value, reached by a link the app
 * already holds. It is not hidden — just not competing with the home page.
 */
export const metadata: Metadata = {
  title: "Send feedback — Zebite",
  description:
    "Tell the people who build Zebite what is working, what is broken, and what you wish it did.",
  robots: { index: false, follow: true },
  openGraph: {
    type: "website",
    siteName: "Zebite",
    title: "Send feedback — Zebite",
    description:
      "Tell the people who build Zebite what is working, what is broken, and what you wish it did.",
  },
};

export default function FeedbackPage() {
  return (
    <>
      {/* Wordmark only. The site nav is all in-page hash links (#how, #family)
          that resolve to nothing here, so linking home is the honest header. */}
      <header className="border-b border-ink-rule">
        <div className="shell flex h-[72px] items-center">
          <Link
            href="/"
            aria-label="Zebite — home"
            className="inline-flex items-center gap-2.5"
          >
            <Image
              src="/mascot/zeb-face.png"
              alt=""
              width={34}
              height={34}
              className="rounded-full"
            />
            <span className="text-lg font-extrabold tracking-[-0.02em] text-ink">
              Zebite
            </span>
          </Link>
        </div>
      </header>

      <main id="main" className="paper-grain relative py-[clamp(40px,7vh,80px)]">
        <div className="shell max-w-[46rem]">
          <Reveal>
            <p className="eyebrow text-forest-500">Feedback</p>
            <h1 className="mt-2 text-[clamp(1.9rem,4.2vw,2.9rem)] font-extrabold leading-[1.08] tracking-[-0.035em] text-ink">
              Tell us what you think.
            </h1>
            <p className="mt-4 max-w-[52ch] text-[1.05rem] leading-relaxed text-ink-soft">
              This goes straight to the people who build Zebite. Every message
              is read — bug reports, half-formed ideas and blunt criticism all
              welcome. You do not need an account, and you do not need the app
              installed.
            </p>
          </Reveal>

          <div className="mt-9">
            <FeedbackFormSection />
          </div>

          {/* The only mention of the in-app board, and it sits below the form
              on purpose: it is informational, not a redirect. Nothing here
              can show the board — it is authenticated-only. */}
          <Reveal>
            <div className="mt-10 rounded-card border border-ink-rule bg-paper-deep p-6">
              <h2 className="text-sm font-extrabold text-ink">
                Already using the app?
              </h2>
              <p className="mt-2 max-w-[58ch] text-sm leading-relaxed text-ink-soft">
                Zebite has a feedback board built in — post publicly, upvote what
                you want most, and follow along as things move from open to
                fixed. You will find it under{" "}
                <b className="font-bold text-ink">Profile → Feedback</b>, or in
                the menu beside the navigation bar. It needs you signed in, which
                is why it lives in the app rather than here.
              </p>
            </div>
          </Reveal>

          <Reveal>
            <p className="mt-8 text-sm text-ink-faint">
              Prefer email? Write to{" "}
              <a
                href={`mailto:${CONTACT.email}`}
                className="font-semibold text-ink-soft underline"
              >
                {CONTACT.email}
              </a>
              .
            </p>
          </Reveal>
        </div>
      </main>

      {/* Small, per this page's brief — the site footer is a full sitemap of
          hash links that go nowhere from here. */}
      <footer className="border-t border-ink-rule py-8">
        <div className="shell flex flex-col gap-2 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Zebite</span>
          <span className="flex flex-wrap gap-x-3 gap-y-1">
            <Link href="/" className="hover:text-ink-soft">
              Home
            </Link>
            <a
              href="https://zhevion.com/legal/zebite/privacy"
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink-soft"
            >
              Privacy
            </a>
            <a
              href="https://zhevion.com/legal/zebite/terms"
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink-soft"
            >
              Terms
            </a>
          </span>
        </div>
      </footer>
    </>
  );
}
