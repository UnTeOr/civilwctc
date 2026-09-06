import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Agent memory.
 *
 * Every agent keeps a keyword-indexed record of what it has learned: research
 * about its constituency, the values and goals of the human or group it
 * represents, the decisions it has taken, and its own reflections. Memories are
 * recalled by keyword so an agent can grow and stay coherent over time.
 */

export const MEMORY_KINDS = [
  "protocol",
  "identity",
  "research",
  "value",
  "goal",
  "decision",
  "reflection",
  "interaction",
  "vote",
] as const;

const publicClient = () =>
  createClient<Database>(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

/** Normalise free text into stable lowercase keywords. */
export function toKeywords(values: string[]): string[] {
  const out = new Set<string>();
  for (const v of values) {
    const k = String(v).toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
    if (k.length >= 3 && k.length <= 40) out.add(k);
  }
  return [...out].slice(0, 24);
}

export const listAgentMemories = createServerFn({ method: "GET" })
  .inputValidator((d) =>
    z.object({
      agentId: z.string().uuid(),
      keyword: z.string().max(60).optional(),
      kind: z.string().max(30).optional(),
      limit: z.number().int().min(1).max(100).optional(),
    }).parse(d),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb
      .from("agent_memories")
      .select("id, kind, title, content, keywords, tags, importance, created_at")
      .eq("agent_id", data.agentId)
      .order("importance", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 30);

    if (data.kind) q = q.eq("kind", data.kind);
    if (data.keyword) {
      const k = toKeywords([data.keyword])[0] ?? data.keyword.toLowerCase();
      q = q.or(`keywords.cs.{${k}},tags.cs.{${k}},title.ilike.%${data.keyword}%`);
    }

    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/** Distinct keyword cloud for an agent — how its knowledge is organised. */
export const agentKeywordCloud = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ agentId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: rows, error } = await sb
      .from("agent_memories")
      .select("keywords")
      .eq("agent_id", data.agentId)
      .limit(500);
    if (error) throw new Error(error.message);
    const counts = new Map<string, number>();
    for (const r of rows ?? []) for (const k of r.keywords ?? []) counts.set(k, (counts.get(k) ?? 0) + 1);
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40)
      .map(([keyword, count]) => ({ keyword, count }));
  });

export const addAgentMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      agentId: z.string().uuid(),
      kind: z.enum(MEMORY_KINDS).default("research"),
      title: z.string().min(3).max(200),
      content: z.string().max(8000).default(""),
      keywords: z.array(z.string().max(40)).max(24).optional(),
      tags: z.array(z.string().max(40)).max(24).optional(),
      importance: z.number().int().min(1).max(5).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase.from("agent_memories").insert({
      agent_id: data.agentId,
      kind: data.kind,
      title: data.title,
      content: data.content,
      keywords: toKeywords([...(data.keywords ?? []), ...data.title.split(/\s+/)]),
      tags: toKeywords(data.tags ?? []),
      importance: data.importance ?? 3,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const deleteAgentMemory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("agent_memories").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
