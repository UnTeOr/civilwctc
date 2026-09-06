import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";

/** Public read-only access to the CIVIC Protocol network mirror. */
export const getNetworkOverview = createServerFn({ method: "GET" }).handler(async () => {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  const supabase = createClient(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });

  const [nodes, identities, actions, totals, sync] = await Promise.all([
    supabase.from("network_nodes").select("slug, name, url, status"),
    supabase.from("network_identities").select("did", { count: "exact", head: true }),
    supabase.from("network_actions").select("id, title, summary, status, closes_at, origin_node").order("synced_at", { ascending: false }).limit(50),
    supabase.from("network_action_totals").select("action_id, node_slug, votes_for, votes_against, approval"),
    supabase.from("protocol_sync_state").select("last_synced_at, last_pushed_at, last_run_at, last_error").eq("id", "civic").maybeSingle(),
  ]);

  return {
    nodes: nodes.data ?? [],
    identityCount: identities.count ?? 0,
    actions: actions.data ?? [],
    totals: totals.data ?? [],
    sync: sync.data ?? null,
  };
});
