import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
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

export const listAgents = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({
    agent_class: z.enum(["F", "T", "S", "all"]).optional(),
    agent_type: z.enum(["personal", "integrated", "external", "all"]).optional(),
    q: z.string().optional(),
  }).optional().parse(d ?? {}))
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb.from("agents").select("*").eq("is_public", true).order("reputation", { ascending: false }).limit(100);
    if (data?.agent_class && data.agent_class !== "all") q = q.eq("agent_class", data.agent_class);
    if (data?.agent_type && data.agent_type !== "all") q = q.eq("agent_type", data.agent_type);
    if (data?.q) q = q.ilike("name", `%${data.q}%`);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const getAgent = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: agent, error } = await sb.from("agents").select("*").eq("slug", data.slug).maybeSingle();
    if (error) throw new Error(error.message);
    if (!agent) throw new Error("Agent not found");
    return agent;
  });

export const createAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    name: z.string().min(2).max(80),
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only"),
    avatar_url: z.string().url().optional().or(z.literal("")),
    self_directed: z.boolean().optional(),
    agent_class: z.enum(["F", "T", "S"]),
    agent_type: z.enum(["personal", "integrated", "external"]),
    values_list: z.array(z.string().max(40)).max(120).optional(),
    principles: z.string().max(6000).optional(),
    voting_instructions: z.string().max(6000).optional(),
    charter: z.string().max(4000).optional(),
    external_url: z.string().url().optional().or(z.literal("")),
    is_public: z.boolean().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    const slug = slugify(data.name);
    const { data: created, error } = await supabase.from("agents").insert({
      owner_id: userId,
      protocol: protocolFor(data.agent_class).name,
      name: data.name,
      username: data.username.toLowerCase(),
      avatar_url: data.avatar_url || null,
      self_directed: data.self_directed ?? false,
      slug,
      agent_class: data.agent_class,
      agent_type: data.agent_type,
      values_list: data.values_list ?? [],
      principles: data.principles ?? null,
      voting_instructions: data.voting_instructions ?? null,
      charter: data.charter ?? null,
      external_url: data.external_url || null,
      is_public: data.is_public ?? true,
    }).select("slug").single();
    if (error) {
      if (error.code === "23505") throw new Error("That @username is already taken.");
      throw new Error(error.message);
    }
    return { slug: created.slug };
  });

export const listMyAgents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.from("agents").select("*").eq("owner_id", context.userId).order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });
