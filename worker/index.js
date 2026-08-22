/* =====================================================================
   Waitlist counter — the only server-side logic this site has.

   Everything else here is static assets served by the `assets` binding
   (see wrangler.jsonc). This Worker exists for two routes:

     GET  /api/waitlist/status  -> { count, cap, spotsLeft }
     POST /api/waitlist/join    -> { direct, count, cap }

   `direct` on /join tells the caller whether THIS signup claimed one of
   the CAP direct-access spots or arrived after the cap was hit. The page
   uses it to pick the right success message; it does not, by itself,
   send anything — Zen still adds each "direct" email to the Google Play
   closed-testing tester list by hand (see README.md, "Waitlist cap").

   The counter lives in a Durable Object so the increment in /join is
   atomic even under concurrent signups — a plain KV read-then-write
   could hand out spot 101 to two people at once, which the honesty
   note this site holds itself to (README.md) rules out.

   Change CAP, then `npx wrangler deploy`. To reset the count (e.g. for
   a second cohort), delete and recreate the Durable Object storage for
   id "global", or bump WaitlistCounter's migration tag with a fresh
   class name and rebind.
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
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/waitlist/status' || url.pathname === '/api/waitlist/join') {
      if (request.method !== 'GET' && request.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
      }
      const id = env.WAITLIST.idFromName('global');
      const stub = env.WAITLIST.get(id);
      const inner = url.pathname.endsWith('/join') ? '/join' : '/status';
      return stub.fetch('https://waitlist' + inner, { method: request.method });
    }

    return env.ASSETS.fetch(request);
  },
};
