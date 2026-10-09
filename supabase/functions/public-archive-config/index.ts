const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "apikey, content-type",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};

function isBrowserKey(key: string) {
  if (key.startsWith("sb_publishable_")) return true;
  try {
    return JSON.parse(atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))).role === "anon";
  } catch {
    return false;
  }
}

Deno.serve((request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  if (request.method !== "GET") return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });

  let managedKeys: Record<string, string> = {};
  try { managedKeys = JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS") || "{}"); } catch {}
  const candidates = [
    ...Object.values(managedKeys),
    Deno.env.get("SUPABASE_ANON_KEY") || "",
  ];
  const publishableKey = candidates.find((key) => typeof key === "string" && isBrowserKey(key));
  if (!publishableKey) {
    return new Response(JSON.stringify({ error: "Archive connection is not configured" }), { status: 503, headers });
  }
  return new Response(JSON.stringify({ publishableKey }), { headers });
});
