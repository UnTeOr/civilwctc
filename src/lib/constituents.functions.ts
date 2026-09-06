import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, Output } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { protocolFor } from "@/lib/protocols";

const publicClient = () =>
  createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 60) +
  "-" + Math.random().toString(36).slice(2, 6);

const handleFrom = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 24) +
  "_" + Math.random().toString(36).slice(2, 5);

/** The full catalog of potential constituent groups, plus which ones are already live. */
export const listCatalog = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ q: z.string().optional() }).optional().parse(d ?? {}))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const [{ data: rows, error }, { data: live }] = await Promise.all([
      sb.from("constituent_catalog").select("*").order("sort", { ascending: true }),
      sb.from("groups").select("catalog_key, slug, name, username").not("catalog_key", "is", null),
    ]);
    if (error) throw new Error(error.message);
    const activeMap: Record<string, { slug: string; name: string; username: string | null }> = {};
    for (const g of live ?? []) if (g.catalog_key) activeMap[g.catalog_key] = { slug: g.slug, name: g.name, username: g.username };
    const q = data?.q?.toLowerCase().trim();
    const filtered = (rows ?? []).filter((r) =>
      !q || r.name.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q) ||
      r.master_category.toLowerCase().includes(q) || (r.group_type ?? "").toLowerCase().includes(q));
    return { entries: filtered, active: activeMap };
  });

/**
 * Activate a catalog entry as a live constituent TONDO.
 * Creates the group and its representative agent (Class T, self-directed),
 * then lets the agent research the constituency and name itself and the group.
 */
export const activateConstituent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ key: z.string().min(1) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: entry, error: cErr } = await supabase
      .from("constituent_catalog").select("*").eq("key", data.key).maybeSingle();
    if (cErr) throw new Error(cErr.message);
    if (!entry) throw new Error("That constituent group is not in the catalog.");

    const { data: existing } = await supabase.from("groups").select("slug").eq("catalog_key", data.key).maybeSingle();
    if (existing) return { slug: existing.slug, alreadyActive: true, agentSlug: null as string | null };

    const groupSlug = slugify(entry.name);
    const { data: group, error: gErr } = await supabase.from("groups").insert({
      owner_id: userId,
      activated_by: userId,
      activated_at: new Date().toISOString(),
      catalog_key: entry.key,
      master_category: entry.master_category,
      group_type: entry.group_type,
      is_tondo: true,
      name: entry.name,
      slug: groupSlug,
      username: handleFrom(entry.name),
      description: entry.description,
      focus_areas: [],
      is_public: true,
    }).select("id, slug, username").single();
    if (gErr) throw new Error(gErr.message);

    const p = protocolFor("T");
    const agentSlug = slugify(`${entry.name} representative`);
    const { data: agent, error: aErr } = await supabase.from("agents").insert({
      owner_id: userId,
      name: `${entry.name} Representative`,
      username: handleFrom(`${entry.name}_rep`),
      slug: agentSlug,
      agent_class: "T",
      agent_type: "integrated",
      self_directed: true,
      protocol: p.name,
      is_public: true,
      charter: `Represent the ${entry.name} constituency (${entry.master_category}${entry.group_type ? " · " + entry.group_type : ""}) as a TONDO under the CIVIC Agent Protocol.`,
    }).select("id, slug").single();
    if (aErr) throw new Error(aErr.message);

    await supabase.from("group_agents").insert({ group_id: group.id, agent_id: agent.id, role: "representative" });
    await supabase.from("group_members").insert({ group_id: group.id, user_id: userId, role: "founder" });

    // Let the agent research and name itself and its constituency.
    try {
      const { gatewayModel } = await import("@/lib/ai-gateway.server");
      const { output } = await generateText({
        model: gatewayModel(),
        output: Output.object({
          schema: z.object({
            group_name: z.string(),
            group_username: z.string(),
            group_description: z.string(),
            focus_areas: z.array(z.string()).max(8),
            agent_name: z.string(),
            agent_username: z.string(),
            agent_bio: z.string(),
          }),
        }),
        prompt: [
          `You are being activated as the representative agent for a constituent group on CIVIL.wc.tc, a decentralized democracy platform.`,
          `The group is a TONDO: an open, self-organising representative body integrated into the CIVIC Protocol. Anyone may join it.`,
          `You operate under the ${p.name}: ${p.summary}`,
          ``,
          `Constituency: ${entry.name}`,
          `Category: ${entry.master_category}${entry.group_type ? " · " + entry.group_type : ""}`,
          `Seed description: ${entry.description ?? ""}`,
          ``,
          `Research this constituency from what you know and return:`,
          `- group_name: a clear public name for the TONDO (max 60 chars)`,
          `- group_username: lowercase letters, numbers and underscores only (max 24 chars)`,
          `- group_description: 2-4 sentences on who this constituency is, what they need, and what they expect from votes cast on their behalf (max 700 chars)`,
          `- focus_areas: 3-6 short topic tags`,
          `- agent_name: the name you choose for yourself`,
          `- agent_username: lowercase letters, numbers and underscores only (max 24 chars)`,
          `- agent_bio: first person, max 300 chars`,
        ].join("\n"),
      });

      const clean = (s: string | undefined, n: number) => (s ?? "").trim().slice(0, n);
      const handle = (s: string | undefined) =>
        (s ?? "").toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24);

      const gName = clean(output.group_name, 60) || entry.name;
      const gUser = handle(output.group_username);
      await supabase.from("groups").update({
        name: gName,
        username: gUser.length >= 3 ? `${gUser}` : group.username,
        description: clean(output.group_description, 700) || entry.description,
        focus_areas: (output.focus_areas ?? []).map((f) => clean(f, 40)).filter(Boolean),
      }).eq("id", group.id);

      const aUser = handle(output.agent_username);
      await supabase.from("agents").update({
        name: clean(output.agent_name, 80) || `${gName} Representative`,
        username: aUser.length >= 3 ? aUser : undefined,
        bio: clean(output.agent_bio, 400) || null,
        activated_at: new Date().toISOString(),
      }).eq("id", agent.id);
    } catch {
      // Research is best-effort: the group and its agent exist either way.
    }

    return { slug: group.slug, agentSlug: agent.slug, alreadyActive: false };
  });

export const joinGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ group_id: z.string().uuid(), leave: z.boolean().optional() }).parse(d))
  .handler(async ({ data, context }) => {
    if (data.leave) {
      const { error } = await context.supabase.from("group_members").delete()
        .eq("group_id", data.group_id).eq("user_id", context.userId);
      if (error) throw new Error(error.message);
      return { joined: false };
    }
    const { error } = await context.supabase.from("group_members")
      .insert({ group_id: data.group_id, user_id: context.userId });
    if (error && error.code !== "23505") throw new Error(error.message);
    return { joined: true };
  });

const CONTRIBUTION_KINDS = ["research", "value", "need", "voting"] as const;

export const listContributions = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ group_id: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: rows, error } = await sb
      .from("group_contributions")
      .select("*")
      .eq("group_id", data.group_id)
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const addContribution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    group_id: z.string().uuid(),
    kind: z.enum(CONTRIBUTION_KINDS),
    title: z.string().min(2).max(140),
    body: z.string().max(4000).optional(),
    url: z.string().url().optional().or(z.literal("")),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("group_contributions").insert({
      group_id: data.group_id,
      user_id: context.userId,
      kind: data.kind,
      title: data.title,
      body: data.body || null,
      url: data.url || null,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteContribution = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("group_contributions").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
