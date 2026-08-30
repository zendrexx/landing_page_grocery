import { Reveal } from "@/components/ui/Reveal";
import {
  agoLabel,
  fetchPublicBoard,
  STATUS_LABELS,
  type PublicComment,
} from "@/lib/feedback-board";

/**
 * What other people have asked for, on the public /feedback page.
 *
 * A server component with no client JavaScript: threads expand through a
 * native <details>, which costs nothing, works before hydration and works
 * with JS off entirely — the same progressive-enhancement rule Reveal keeps.
 *
 * **No names.** The board inside the app shows each author's real first name
 * from their onboarding profile. Those are deliberately not fetched here (see
 * lib/feedback-board.ts and migration 0030): a person who typed their name to
 * personalise a meal planner did not agree to have it published beside their
 * opinion on the open web. Every entry reads as anonymous, and the note at
 * the foot of the section says so rather than leaving it to be inferred.
 *
 * Renders nothing at all when there is no board to show — no env configured,
 * migration not yet run, project unreachable, or simply no posts yet. An
 * empty "no feedback yet" shell on a marketing page is worse than silence.
 */

/** Fixed → good news, Won't fix → closed, everything else → in flight. */
function statusTone(status: string): string {
  if (status === "fixed") return "border-transparent bg-forest-500 text-cream";
  if (status === "wont_fix") return "border-ink-rule bg-paper-deep text-ink-faint";
  if (status === "open") return "border-ink-rule bg-white text-ink-soft";
  return "border-transparent bg-lime text-lime-ink";
}

export async function PublicBoard() {
  const board = await fetchPublicBoard();
  if (!board) return null;

  return (
    <section className="mt-14" aria-labelledby="board-heading">
      <Reveal>
        <h2
          id="board-heading"
          className="text-[clamp(1.3rem,2.6vw,1.7rem)] font-extrabold tracking-[-0.025em] text-ink"
        >
          What others have asked for
        </h2>
        <p className="mt-2 max-w-[54ch] text-sm leading-relaxed text-ink-soft">
          Real messages from people using Zebite, with where each one stands.
          Posting, voting and replying happen in the app.
        </p>
      </Reveal>

      <ul className="mt-6 space-y-3">
        {board.posts.map((post, i) => {
          const comments = board.commentsByPost[post.id] ?? [];
          return (
            // Only the first few are staggered; past that the delay would
            // outlast the scroll and rows would arrive visibly late.
            <Reveal as="li" key={post.id} delay={i < 6 ? i * 45 : 0}>
              <article className="rounded-card border border-ink-rule bg-white p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-pill border px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.06em] ${statusTone(
                      post.status
                    )}`}
                  >
                    {STATUS_LABELS[post.status] ?? "Open"}
                  </span>
                  <span className="text-xs font-semibold text-ink-faint">
                    {agoLabel(post.created_at)}
                  </span>
                  {post.vote_count > 0 ? (
                    <span className="ml-auto text-xs font-bold text-ink-soft">
                      ▲ {post.vote_count}
                    </span>
                  ) : null}
                </div>

                {/* whitespace-pre-line: people write in paragraphs and a board
                    that flattens them into a wall reads as a database dump. */}
                <p className="mt-3 whitespace-pre-line text-[0.95rem] leading-relaxed text-ink">
                  {post.body}
                </p>

                {comments.length > 0 ? (
                  <details className="group mt-3">
                    <summary className="cursor-pointer list-none text-xs font-bold text-forest-500 marker:content-[''] hover:underline">
                      {comments.length === 1
                        ? "1 reply"
                        : `${comments.length} replies`}
                      <span className="group-open:hidden"> ▾</span>
                      <span className="hidden group-open:inline"> ▴</span>
                    </summary>
                    <ul className="mt-3 space-y-3 border-l-2 border-ink-rule pl-4">
                      {comments.map((c: PublicComment) => (
                        <li key={c.id}>
                          <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                            {c.body}
                          </p>
                          <p className="mt-1 text-xs text-ink-faint">
                            {agoLabel(c.created_at)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : null}
              </article>
            </Reveal>
          );
        })}
      </ul>

      <Reveal>
        <p className="mt-5 text-xs leading-relaxed text-ink-faint">
          Shown without names. Who wrote what is visible only inside the app,
          to people signed in — and messages marked “Team only” never appear
          here at all.
        </p>
      </Reveal>
    </section>
  );
}
