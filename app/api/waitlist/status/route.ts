import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function GET() {
  const { env } = await getCloudflareContext({ async: true });
  const id = env.WAITLIST.idFromName("global");
  const stub = env.WAITLIST.get(id);
  const res = await stub.fetch("https://waitlist/status");
  return new Response(res.body, { status: res.status, headers: res.headers });
}
