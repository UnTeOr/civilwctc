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

/** Mirrored network entities (identities + actions) from other CIVIC Protocol nodes. */
export const getNetworkDirectory = createServerFn({ method: "GET" }).handler(async () => {
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

  const [nodes, identities, actions, totals] = await Promise.all([
    supabase.from("network_nodes").select("slug, name, url"),
    supabase.from("network_identities").select("did, username, display_name, type, home_node").limit(500),
    supabase.from("network_actions").select("id, title, summary, status, closes_at, origin_node").order("synced_at", { ascending: false }).limit(100),
    supabase.from("network_action_totals").select("action_id, node_slug, votes_for, votes_against, approval"),
  ]);

  const nodeName = new Map((nodes.data ?? []).map((n) => [n.slug, n.name ?? n.slug]));
  const ids = identities.data ?? [];
  const approvalByAction = new Map<string, { approval: number | null; votes: number }>();
  for (const t of totals.data ?? []) {
    const prev = approvalByAction.get(t.action_id) ?? { approval: null, votes: 0 };
    approvalByAction.set(t.action_id, {
      approval: t.approval != null ? Number(t.approval) : prev.approval,
      votes: prev.votes + (t.votes_for ?? 0) + (t.votes_against ?? 0),
    });
  }

  const decorate = <T extends { home_node?: string | null }>(r: T) => ({
    ...r,
    node_slug: r.home_node ?? "unknown",
    node_name: nodeName.get(r.home_node ?? "") ?? r.home_node ?? "Network",
  });

  return {
    agents: ids.filter((i) => i.type === "agent").map(decorate),
    organizations: ids.filter((i) => i.type === "organization").map(decorate),
    people: ids.filter((i) => i.type !== "agent" && i.type !== "organization").map(decorate),
    actions: (actions.data ?? []).map((a) => ({
      ...a,
      node_slug: a.origin_node,
      node_name: nodeName.get(a.origin_node) ?? a.origin_node,
      approval: approvalByAction.get(a.id)?.approval ?? null,
      votes: approvalByAction.get(a.id)?.votes ?? 0,
    })),
  };
});
