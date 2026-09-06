import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const publicClient = () =>
  createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 60) +
  "-" + Math.random().toString(36).slice(2, 6);

export const listGroups = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ q: z.string().optional() }).optional().parse(d ?? {}))
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb.from("groups").select("*").eq("is_public", true).order("created_at", { ascending: false }).limit(100);
    if (data?.q) q = q.ilike("name", `%${data.q}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getGroup = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: group, error } = await sb.from("groups").select("*").eq("slug", data.slug).maybeSingle();
    if (error) throw new Error(error.message);
    if (!group) throw new Error("Group not found");
    const { data: links } = await sb.from("group_agents").select("agent_id, role, agents(*)").eq("group_id", group.id);
    const { count } = await sb.from("group_members").select("id", { count: "exact", head: true }).eq("group_id", group.id);
    return { ...group, agents: links ?? [], member_count: count ?? 0 };
  });

export const createGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    name: z.string().min(2).max(80),
    username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only"),
    description: z.string().max(2000).optional(),
    focus_areas: z.array(z.string().max(40)).max(12).optional(),
    website: z.string().url().optional().or(z.literal("")),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const slug = slugify(data.name);
    const { data: created, error } = await context.supabase.from("groups").insert({
      owner_id: context.userId,
      name: data.name,
      username: data.username.toLowerCase(),
      slug,
      is_tondo: true,
      description: data.description ?? null,
      focus_areas: data.focus_areas ?? [],
      website: data.website || null,
    }).select("slug").single();
    if (error) {
      if (error.code === "23505") throw new Error("That @username is already taken.");
      throw new Error(error.message);
    }
    return { slug: created.slug };
  });

export const linkAgentToGroup = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    group_id: z.string().uuid(),
    agent_id: z.string().uuid(),
    role: z.string().max(40).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("group_agents").insert({
      group_id: data.group_id, agent_id: data.agent_id, role: data.role ?? "representative",
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const myMembership = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ group_id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase.from("group_members").select("id")
      .eq("group_id", data.group_id).eq("user_id", context.userId).maybeSingle();
    return { joined: !!row };
  });
