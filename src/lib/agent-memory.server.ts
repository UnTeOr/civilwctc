import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { toKeywords } from "@/lib/agent-memory.functions";

/** Write a memory into an agent's file (server-side, trusted callers only). */
export async function remember(input: {
  agentId: string;
  kind: string;
  title: string;
  content?: string;
  keywords?: string[];
  tags?: string[];
  importance?: number;
  sourceKind?: string;
  sourceId?: string | null;
}) {
  const keywords = toKeywords([...(input.keywords ?? []), ...input.title.split(/\s+/)]);
  const { error } = await supabaseAdmin.from("agent_memories").insert({
    agent_id: input.agentId,
    kind: input.kind,
    title: input.title.slice(0, 200),
    content: (input.content ?? "").slice(0, 8000),
    keywords,
    tags: toKeywords(input.tags ?? []),
    importance: input.importance ?? 3,
    source_kind: input.sourceKind ?? null,
    source_id: input.sourceId ?? null,
  });
  if (error) console.error("[agent memory] write failed", error.message);
  await noteTopics(input.agentId, keywords, input.title);
}

/**
 * Keep a compact keyword index of what the agent knows. Recall reads this
 * instead of past content, so context stays small no matter how much the agent
 * has accumulated.
 */
export async function noteTopics(agentId: string, keywords: string[], summary: string) {
  for (const keyword of keywords.slice(0, 8)) {
    const { data: existing } = await supabaseAdmin
      .from("agent_topics")
      .select("id,hits")
      .eq("agent_id", agentId)
      .eq("keyword", keyword)
      .maybeSingle();
    if (existing) {
      await supabaseAdmin
        .from("agent_topics")
        .update({ hits: existing.hits + 1, summary: summary.slice(0, 160), last_seen_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabaseAdmin
        .from("agent_topics")
        .insert({ agent_id: agentId, keyword, summary: summary.slice(0, 160) });
    }
  }
}

/**
 * Minimal recall: a short list of topic keywords the agent has already covered,
 * with one-line summaries. Deliberately never returns full past content — that
 * would grow without bound and cost far more than it is worth.
 */
export async function recallBrief(agentId: string, limit = 12): Promise<string> {
  const { data } = await supabaseAdmin
    .from("agent_topics")
    .select("keyword,summary,hits")
    .eq("agent_id", agentId)
    .order("hits", { ascending: false })
    .order("last_seen_at", { ascending: false })
    .limit(limit);
  if (!data?.length) return "(nothing covered yet)";
  return data.map((t) => `${t.keyword}: ${(t.summary ?? "").slice(0, 90)}`).join("\n");
}


/**
 * Recall the memories most relevant to a topic: keyword matches first, then the
 * agent's most important recent records as background.
 */
export async function recall(agentId: string, topic: string, limit = 8): Promise<string> {
  const keys = toKeywords(topic.split(/\s+/)).slice(0, 8);
  const rows: { kind: string; title: string; content: string | null }[] = [];

  if (keys.length) {
    const { data } = await supabaseAdmin
      .from("agent_memories")
      .select("kind, title, content")
      .eq("agent_id", agentId)
      .overlaps("keywords", keys)
      .order("importance", { ascending: false })
      .limit(limit);
    rows.push(...(data ?? []));
  }

  if (rows.length < limit) {
    const { data } = await supabaseAdmin
      .from("agent_memories")
      .select("kind, title, content")
      .eq("agent_id", agentId)
      .order("importance", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit - rows.length);
    for (const r of data ?? []) if (!rows.some((x) => x.title === r.title)) rows.push(r);
  }

  if (!rows.length) return "(no prior memories)";
  return rows.map((r) => `[${r.kind}] ${r.title}: ${(r.content ?? "").slice(0, 300)}`).join("\n");
}
