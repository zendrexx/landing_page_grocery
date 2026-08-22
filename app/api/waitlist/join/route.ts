import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function POST() {
  const { env } = await getCloudflareContext({ async: true });
  const id = env.WAITLIST.idFromName("global");
  const stub = env.WAITLIST.get(id);
  const res = await stub.fetch("https://waitlist/join", { method: "POST" });
  return new Response(res.body, { status: res.status, headers: res.headers });
}
