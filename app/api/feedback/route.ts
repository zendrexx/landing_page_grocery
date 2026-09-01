/**
 * Feedback intake for /feedback.
 *
 * Forwards to Web3Forms — so this needs no new Cloudflare resource, no
 * Durable Object, no D1 database and no secret to set before it works.
 * Deploy is `npm run deploy` and nothing else.
 *
 * Why a route handler rather than posting straight from the browser: the
 * bounds below are the point. A form that reaches a human's inbox wants a
 * length ceiling and a honeypot somewhere the page can't skip, and keeping
 * the access key on this side means it can move to an env var without
 * touching the page. Until the waitlist came down at release that same key
 * also shipped in the client bundle (the old GetAccess form posted direct),
 * so the literal fallback below disclosed nothing new. That is no longer
 * true: this route is the only place it appears now, and it stays here.
 *
 * This is deliberately NOT the in-app feedback board. That lives in Supabase
 * behind authenticated-only RLS and cannot be read or written from here; see
 * lib/features/feedback/ in the Zebite app repo.
 */

const WEB3FORMS_ENDPOINT = "https://api.web3forms.com/submit";

/** Was shared with the waitlist form; still distinguished by `subject`. */
const FALLBACK_ACCESS_KEY = "7e815f4a-d060-4d2e-ab8c-e89ed28aab88";

/** Generous enough for a real bug report, small enough to bound the inbox. */
const MAX_MESSAGE = 4000;
const MAX_EMAIL = 200;
const MAX_VERSION = 40;

/** Mirrors the chips on the page. Anything else is dropped, not rejected —
 *  the category is a convenience and must never cost somebody their message. */
const TOPICS = new Set(["idea", "problem", "praise", "other"]);

type Payload = {
  message?: unknown;
  email?: unknown;
  topic?: unknown;
  appVersion?: unknown;
  botcheck?: unknown;
};

function str(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function fail(error: string, status: number) {
  return Response.json({ ok: false, error }, { status });
}

export async function POST(request: Request) {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return fail("We could not read that. Try again?", 400);
  }

  // Honeypot: a real person never fills a field they cannot see. Answered with
  // a success shape on purpose — telling a bot why it failed only helps it.
  if (str(body.botcheck, 100)) {
    return Response.json({ ok: true });
  }

  const message = str(body.message, MAX_MESSAGE);
  if (!message) {
    return fail("Add a message first — that part we do need.", 400);
  }

  const email = str(body.email, MAX_EMAIL);
  // Shape only. Deliverability is not knowable here, and an over-strict
  // pattern rejecting a valid address would lose the whole message with it.
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return fail("That email address does not look right.", 400);
  }

  const rawTopic = str(body.topic, 20).toLowerCase();
  const topic = TOPICS.has(rawTopic) ? rawTopic : "";
  const appVersion = str(body.appVersion, MAX_VERSION);

  const accessKey = process.env.WEB3FORMS_ACCESS_KEY || FALLBACK_ACCESS_KEY;

  try {
    const upstream = await fetch(WEB3FORMS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: accessKey,
        subject: topic
          ? `Zebite feedback (${topic})`
          : "Zebite feedback",
        from_name: "Zebite feedback page",
        // Web3Forms mails every key it is given, so these become the email's
        // body. Named for a human reading it, not for this code.
        Message: message,
        Topic: topic || "not given",
        "App version": appVersion || "not given",
        "Reply to": email || "not given",
        // Lets a reply go straight back without copying the address out.
        ...(email ? { email } : {}),
      }),
    });

    const data = (await upstream.json().catch(() => null)) as
      | { success?: boolean }
      | null;

    if (!upstream.ok || !data?.success) {
      return fail("We could not send that just now. Try again in a moment?", 502);
    }
  } catch {
    return fail("We could not reach the server. Check your connection?", 502);
  }

  return Response.json({ ok: true });
}
