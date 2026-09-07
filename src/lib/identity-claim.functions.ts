import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { NODE_SLUG, PROTOCOL_BASE } from "@/lib/civic-sync.server";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

/** Normalise a DID: people often copy it without the node segment. */
function didVariants(raw: string): string[] {
  const did = raw.trim();
  const out = new Set<string>([did]);
  const m = did.match(/^did:civic:([0-9a-fA-F-]{20,})$/);
  if (m) out.add(`did:civic:%:${m[1]}`);
  return [...out];
}

/**
 * Look up an existing CIVIC Protocol identity in the network mirror, so a
 * newcomer can port their handle from another node instead of starting over.
 */
export const lookupNetworkIdentity = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ query: z.string().min(3).max(120) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const q = data.query.trim().replace(/^@/, "");

    let row = null as null | { did: string; username: string | null; display_name: string | null; type: string | null; home_node: string; also_on: string[] | null };

    if (q.startsWith("did:")) {
      for (const variant of didVariants(q)) {
        const { data: r } = variant.includes("%")
          ? await sb.from("network_identities").select("did, username, display_name, type, home_node, also_on").like("did", variant).maybeSingle()
          : await sb.from("network_identities").select("did, username, display_name, type, home_node, also_on").eq("did", variant).maybeSingle();
        if (r) { row = r; break; }
      }
    } else {
      const { data: r } = await sb
        .from("network_identities")
        .select("did, username, display_name, type, home_node, also_on")
        .ilike("username", q)
        .maybeSingle();
      row = r ?? null;
    }

    if (!row) return { found: false as const };

    // Is this handle already taken locally?
    const { data: taken } = await sb.from("profiles").select("id, did").eq("did", row.did).maybeSingle();

    return {
      found: true as const,
      did: row.did,
      username: row.username,
      displayName: row.display_name,
      type: row.type ?? "human",
      homeNode: row.home_node,
      alreadyOnThisNode: !!taken,
    };
  });

/**
 * Attach a ported protocol identity to the signed-in account and tell the
 * protocol this node is now part of that identity's presence list.
 */
export const claimNetworkIdentity = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ did: z.string().min(8), setHome: z.boolean().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    const sb = publicClient();
    const { data: identity } = await sb
      .from("network_identities")
      .select("did, username, display_name, type, home_node")
      .eq("did", data.did)
      .maybeSingle();
    if (!identity) throw new Error("That identity is not on the network mirror yet.");

    const { error } = await context.supabase
      .from("profiles")
      .update({
        did: identity.did,
        username: identity.username ?? undefined,
        display_name: identity.display_name ?? identity.username ?? undefined,
      })
      .eq("id", context.userId);
    if (error) throw new Error(error.message);

    // Ask the protocol to record presence for this node.
    let claim: { ok: boolean; status?: string; detail?: string } = { ok: false, detail: "node key not configured" };
    const nodeKey = process.env["CIVIC_NODE_KEY"];
    if (nodeKey) {
      try {
        const res = await fetch(`${PROTOCOL_BASE}/api/public/identity-claim`, {
          method: "POST",
          headers: { "content-type": "application/json", "x-node-key": nodeKey },
          body: JSON.stringify({
            did: identity.did,
            username: identity.username,
            node_slug: NODE_SLUG,
            set_home: data.setHome ?? false,
          }),
        });
        const text = await res.text();
        claim = { ok: res.ok, status: res.status ? String(res.status) : undefined, detail: text.slice(0, 200) };
      } catch (e) {
        claim = { ok: false, detail: e instanceof Error ? e.message : "claim request failed" };
      }
    }

    return { ok: true, did: identity.did, username: identity.username, homeNode: identity.home_node, claim };
  });
