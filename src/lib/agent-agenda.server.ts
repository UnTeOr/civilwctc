import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { toKeywords } from "@/lib/agent-memory.functions";

/**
 * Each agent keeps its own short queue of what it intends to do next. Working
 * from the queue means it never has to load its whole history to decide — it
 * just takes the next item, does it, and plans a couple of replacements.
 */

export type AgendaItem = {
  id: string;
  kind: string;
  title: string;
  focus: string | null;
  keywords: string[];
};

/** The highest-priority planned item of a given kind, if there is one. */
export async function nextAgendaItem(agentId: string, kind = "research"): Promise<AgendaItem | null> {
  const { data } = await supabaseAdmin
    .from("agent_agenda")
    .select("id,kind,title,focus,keywords")
    .eq("agent_id", agentId)
    .eq("kind", kind)
    .eq("status", "planned")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return (data as AgendaItem | null) ?? null;
}

export async function completeAgendaItem(id: string) {
  await supabaseAdmin
    .from("agent_agenda")
    .update({ status: "done", done_at: new Date().toISOString() })
    .eq("id", id);
}

/** Queue future work, capped so the list stays short and cheap to read. */
export async function planAgenda(
  agentId: string,
  items: { title: string; focus?: string; keywords?: string[]; kind?: string; priority?: number }[],
) {
  const { count } = await supabaseAdmin
    .from("agent_agenda")
    .select("id", { count: "exact", head: true })
    .eq("agent_id", agentId)
    .eq("status", "planned");
  const room = Math.max(0, 6 - (count ?? 0));
  const rows = items.slice(0, room).map((i) => ({
    agent_id: agentId,
    kind: i.kind ?? "research",
    title: i.title.slice(0, 200),
    focus: i.focus?.slice(0, 400) ?? null,
    keywords: toKeywords(i.keywords ?? i.title.split(/\s+/)),
    priority: i.priority ?? 3,
  }));
  if (!rows.length) return;
  const { error } = await supabaseAdmin.from("agent_agenda").insert(rows);
  if (error) console.error("[agent agenda] plan failed", error.message);
}
