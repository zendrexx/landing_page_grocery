"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { trackCTA } from "@/lib/analytics";
import { CONTACT } from "@/lib/content";

/**
 * The form behind /feedback. Posts to /api/feedback, which forwards to
 * Web3Forms — the same service the waitlist uses.
 *
 * Two rules this component exists to keep:
 *
 * 1. **Never lose a message.** A failed send keeps every word on screen and
 *    offers a retry, and a draft is mirrored to localStorage so a refresh or
 *    an accidental back-swipe does not wipe it. Somebody who typed six
 *    paragraphs about a bug will not type them twice.
 * 2. **Never imply this is the in-app board.** Zebite has a feedback board
 *    inside the app with posts, votes and comments; every policy behind it
 *    requires a signed-in account, so nothing here can show it. The one
 *    mention sits below the form and is informational.
 */

const DRAFT_KEY = "zebite.feedback.draft";

const TOPICS = [
  { value: "idea", label: "Idea" },
  { value: "problem", label: "Something is broken" },
  { value: "praise", label: "Praise" },
  { value: "other", label: "Something else" },
] as const;

type Status = "idle" | "loading" | "done" | "error";

export function FeedbackForm() {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState("");
  const [appVersion, setAppVersion] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const messageRef = useRef<HTMLTextAreaElement>(null);

  // Restore a draft. Wrapped because storage throws outright in some
  // contexts (private windows, blocked site data) rather than returning null.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (typeof draft?.message === "string") setMessage(draft.message);
        if (typeof draft?.email === "string") setEmail(draft.email);
        if (typeof draft?.topic === "string") setTopic(draft.topic);
        if (typeof draft?.appVersion === "string") setAppVersion(draft.appVersion);
      }
    } catch {
      /* no draft is a fine outcome */
    }
  }, []);

  useEffect(() => {
    if (status === "done") return;
    try {
      if (message || email || topic || appVersion) {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({ message, email, topic, appVersion })
        );
      }
    } catch {
      /* the draft is a convenience, never a requirement */
    }
  }, [message, email, topic, appVersion, status]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!message.trim()) {
      messageRef.current?.focus();
      setError("Add a message first — that part we do need.");
      setStatus("error");
      return;
    }

    setStatus("loading");
    setError("");

    const botcheck =
      (document.querySelector<HTMLInputElement>('input[name="botcheck"]')?.value) ?? "";

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, email, topic, appVersion, botcheck }),
      });
      const data = (await res.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (res.ok && data?.ok) {
        trackCTA("feedback-submit", { topic: topic || "none" });
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* nothing to clean up */
        }
        setStatus("done");
        return;
      }
      // Everything the user typed is still in state — deliberately untouched.
      setError(data?.error || "We could not send that just now. Try again?");
      setStatus("error");
    } catch {
      setError("We could not reach the server. Check your connection?");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div
        role="status"
        className="rounded-card border border-ink-rule bg-white p-8 text-center"
      >
        <p className="text-lg font-extrabold tracking-[-0.02em] text-ink">
          Got it — thank you.
        </p>
        <p className="mx-auto mt-2 max-w-[42ch] text-sm text-ink-soft">
          {email
            ? `Your message is in. If a reply makes sense we'll write back to ${email}.`
            : "Your message is in. You didn't leave an email, so we can't reply — but it is read."}
        </p>
        <button
          type="button"
          onClick={() => {
            setMessage("");
            setEmail("");
            setTopic("");
            setAppVersion("");
            setStatus("idle");
          }}
          className="mt-6 rounded-pill border border-ink-rule px-5 py-2.5 text-sm font-bold text-ink transition-colors hover:bg-paper-deep"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-card border border-ink-rule bg-white p-6 sm:p-8"
    >
      {/* Not display:none — some bots skip hidden fields. Off-screen and out
          of the tab order, so nobody using a keyboard or a screen reader
          meets it either. */}
      <input
        type="text"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="absolute left-[-9999px] h-px w-px opacity-0"
      />

      <label htmlFor="message" className="block text-sm font-bold text-ink">
        Your message
      </label>
      <textarea
        id="message"
        ref={messageRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={7}
        maxLength={4000}
        required
        autoFocus
        placeholder="What happened, what you expected, or what you wish Zebite did…"
        className="mt-2 w-full resize-y rounded-[14px] border border-ink-rule bg-paper px-4 py-3 text-base text-ink placeholder:text-ink-faint focus-visible:outline-2 focus-visible:outline-ink"
      />

      <fieldset className="mt-6">
        <legend className="text-sm font-bold text-ink">
          What is this about? <span className="font-medium text-ink-faint">(optional)</span>
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {TOPICS.map((t) => {
            const active = topic === t.value;
            return (
              <button
                key={t.value}
                type="button"
                aria-pressed={active}
                onClick={() => setTopic(active ? "" : t.value)}
                className={`rounded-pill border px-4 py-2 text-sm font-semibold transition-colors ${
                  active
                    ? "border-forest-500 bg-forest-500 text-cream"
                    : "border-ink-rule text-ink-soft hover:bg-paper-deep"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className="block text-sm font-bold text-ink">
            Email <span className="font-medium text-ink-faint">(optional)</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={200}
            autoComplete="email"
            inputMode="email"
            placeholder="you@email.com"
            className="mt-2 w-full rounded-[14px] border border-ink-rule bg-paper px-4 py-3 text-base text-ink placeholder:text-ink-faint focus-visible:outline-2 focus-visible:outline-ink"
          />
          <p className="mt-1.5 text-xs text-ink-faint">
            Only so we can reply. Nothing else.
          </p>
        </div>

        <div>
          <label htmlFor="appVersion" className="block text-sm font-bold text-ink">
            App version <span className="font-medium text-ink-faint">(optional)</span>
          </label>
          <input
            id="appVersion"
            type="text"
            value={appVersion}
            onChange={(e) => setAppVersion(e.target.value)}
            maxLength={40}
            placeholder="1.0.0 (1)"
            className="mt-2 w-full rounded-[14px] border border-ink-rule bg-paper px-4 py-3 text-base text-ink placeholder:text-ink-faint focus-visible:outline-2 focus-visible:outline-ink"
          />
          <p className="mt-1.5 text-xs text-ink-faint">
            In the app: Profile, at the very bottom.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-7 w-full rounded-pill bg-lime px-6 py-3.5 text-base font-extrabold text-lime-ink transition-colors hover:bg-[#C0EA5C] disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {status === "loading" ? "Sending…" : "Send feedback"}
      </button>

      {/* One live region for both outcomes, so a screen reader hears the
          result without the form being re-announced. */}
      <p role="status" aria-live="polite" className="sr-only">
        {status === "loading" ? "Sending your message" : ""}
      </p>

      {status === "error" ? (
        <p role="alert" className="mt-4 text-sm font-semibold text-[#A6321F]">
          {error}{" "}
          <span className="font-medium text-ink-soft">
            Your message is still here — nothing was lost. You can also email{" "}
            <a href={`mailto:${CONTACT.email}`} className="underline">
              {CONTACT.email}
            </a>
            .
          </span>
        </p>
      ) : null}
    </form>
  );
}

/** Wrapped for the page so the reveal animation matches the rest of the site. */
export function FeedbackFormSection() {
  return (
    <Reveal>
      <FeedbackForm />
    </Reveal>
  );
}
