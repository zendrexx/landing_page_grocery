/* =====================================================================
   Waitlist counter Durable Object — its own Worker.

   OpenNext regenerates the main app's Worker (.open-next/worker.js) on
   every build, so a Durable Object class can't live there. Instead this
   tiny Worker exists only to export the class; the root wrangler.jsonc
   binds to it cross-script via `script_name`. The Next.js app talks to
   the DO through app/api/waitlist/status and app/api/waitlist/join
   (using the WAITLIST binding) — this file's own fetch handler is never
   hit directly.

   The counter lives in a Durable Object so the increment in /join is
   atomic even under concurrent signups — a plain KV read-then-write
   could hand out spot 101 to two people at once, which the honesty
   note this site holds itself to (README.md) rules out.

   Change CAP, then `npm run deploy:waitlist-do`. To reset the count
   (e.g. for a second cohort), delete and recreate the Durable Object
   storage for id "global", or bump the migration tag with a fresh class
   name and rebind (here and in the root wrangler.jsonc).
   ===================================================================== */

const CAP = 100;

export class WaitlistCounter {
  constructor(state) {
    this.state = state;
    this.count = null;
  }

  async ready() {
    if (this.count === null) {
      this.count = (await this.state.storage.get('count')) || 0;
    }
  }

  async fetch(request) {
    await this.ready();
    const { pathname } = new URL(request.url);

    if (request.method === 'POST' && pathname === '/join') {
      const direct = this.count < CAP;
      if (direct) {
        this.count += 1;
        await this.state.storage.put('count', this.count);
      }
      return Response.json({ direct, count: this.count, cap: CAP });
    }

    return Response.json({
      count: this.count,
      cap: CAP,
      spotsLeft: Math.max(0, CAP - this.count),
    });
  }
}

export default {
  async fetch() {
    return new Response('Not found', { status: 404 });
  },
};
