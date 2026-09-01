/**
 * Reads the public half of Zebite's feedback board for /feedback.
 *
 * Talks to two SECURITY DEFINER functions added by
 * `supabase/migrations/0030_feedback_public_read.sql` in the Zebite app repo.
 * Neither returns an author — the board inside the app shows real names taken
 * from onboarding profiles, and those must not reach the open web. There is
 * no author field in these types because there is no author column in the
 * response; the anonymity is structural, not something this file filters.
 *
 * PostgREST directly rather than @supabase/supabase-js: two RPC calls with no
 * auth, no realtime and no session do not justify a dependency in a repo that
 * hand-rolls its own scroll reveal.
 *
 * **Works without it.** Missing env, an unreachable project, a migration that
 * has not been run yet — every failure returns null and the page simply does
 * not render the board. The form above it keeps working. Same rule the
 * waitlist counter followed in components/sections/GetAccess.tsx before
 * release took it down.
 *
 * The keys are read server-side and never shipped to the browser (no
 * NEXT_PUBLIC_ prefix). The anon key is publishable by design — RLS is the
 * protection, and the Zebite app already ships it to every user — but there
 * is no reason to put it in a bundle that does not need it.
 */

export type PublicPost = {
  id: string;
  body: string;
  status: string;
  vote_count: number;
  comment_count: number;
  created_at: string;
};

export type PublicComment = {
  id: string;
  post_id: string;
  body: string;
  created_at: string;
};

export type PublicBoard = {
  posts: PublicPost[];
  commentsByPost: Record<string, PublicComment[]>;
};

/** Matches FeedbackStatus in the app, storage name for storage name. */
export const STATUS_LABELS: Record<string, string> = {
  open: "Open",
  investigating: "Investigating",
  planned: "Planned",
  in_progress: "In progress",
  fixed: "Fixed",
  wont_fix: "Won't fix",
};

const TIMEOUT_MS = 6000;

async function rpc<T>(fn: string, body: Record<string, unknown>): Promise<T | null> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) return null;

  // A marketing page must not hang on someone else's outage. Bounded, and a
  // timeout is just another reason to render without the board.
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${url.replace(/\/+$/, "")}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
      // The board is a live conversation; a cached copy that lags by minutes
      // reads as broken to the person who just posted.
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchPublicBoard(limit = 25): Promise<PublicBoard | null> {
  const posts = await rpc<PublicPost[]>("public_feedback_board", {
    p_limit: limit,
  });
  if (!posts || !Array.isArray(posts) || posts.length === 0) return null;

  // Comments are a bonus: if this second call fails the posts still render,
  // each simply without its thread expanded.
  const comments = await rpc<PublicComment[]>("public_feedback_comments", {
    p_limit: 300,
  });

  const commentsByPost: Record<string, PublicComment[]> = {};
  for (const c of comments ?? []) {
    (commentsByPost[c.post_id] ??= []).push(c);
  }

  return { posts, commentsByPost };
}

/** "3 days ago" — same phrasing family as the app's `agoLabel`. */
export function agoLabel(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const days = Math.floor((Date.now() - then) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return "last month";
  if (months < 12) return `${months} months ago`;
  const years = Math.floor(months / 12);
  return years === 1 ? "last year" : `${years} years ago`;
}
