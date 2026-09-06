/**
 * Weekly constituent-agent cycle.
 *
 * Every activated agent gets one slot per week (staggered by schedule_day /
 * schedule_hour) in which it performs three actions:
 *   1. research      — learns and documents more about its constituency
 *   2. participation — creates an action item, or reviews/scores an existing one
 *   3. maintenance   — reviews its own files, refreshes keywords ("sleep")
 *
 * Safety rails: one bounded batch per run, a database lease so two runs never
 * overlap, idempotent per-week records, and a circuit breaker that pauses the
 * whole job on billing/permission failures.
 */
import { generateText, Output, NoObjectGeneratedError } from "ai";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { createGeminiProvider, CHEAP_MODEL, aiErrorMessage } from "@/lib/ai-gateway.server";
import { buildSystemPrompt } from "@/lib/protocols";
import { remember, recallBrief } from "@/lib/agent-memory.server";
import { recordUsage } from "@/lib/agent-usage.server";
import { nextAgendaItem, completeAgendaItem, planAgenda } from "@/lib/agent-agenda.server";

const JOB_ID = "weekly-agent-cycle";
const LEASE_MINUTES = 15;
const MAX_AGENTS_PER_RUN = 3;

function weekStartUTC(d = new Date()): string {
  const t = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dow = t.getUTCDay(); // 0 = Sunday
  t.setUTCDate(t.getUTCDate() - dow);
  return t.toISOString().slice(0, 10);
}

function model() {
  const key = process.env["GEMINI_API_KEY"];
  if (!key) throw new Error("Gemini is not configured yet — add a GEMINI_API_KEY.");
  return createGeminiProvider(key)(CHEAP_MODEL);
}

type Usage = { input: number; output: number };
const zeroUsage = (): Usage => ({ input: 0, output: 0 });

type Loose = Record<string, unknown>;

/**
 * Ask the agent for a small JSON object. Small models drift on key names and
 * occasionally wrap output in fences, so we parse leniently and read fields by
 * alias rather than failing the whole cycle.
 */
async function ask(
  system: string,
  prompt: string,
  shape: string,
  meta: { agentId: string; purpose: string },
): Promise<{ value: Loose; usage: Usage }> {
  const full = `${prompt}\n\nRespond with a single JSON object only — no code fences, no commentary — using exactly these keys: ${shape}`;
  let lastText = "";
  let usage: Usage = zeroUsage();
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await generateText({ model: model(), prompt: full, system, maxOutputTokens: 900 });
    usage = { input: res.usage?.inputTokens ?? 0, output: res.usage?.outputTokens ?? 0 };
    await recordUsage({
      agentId: meta.agentId,
      purpose: meta.purpose,
      model: CHEAP_MODEL,
      inputTokens: usage.input,
      outputTokens: usage.output,
    });
    lastText = res.text ?? "";
    const parsed = parseLooseJson(lastText);
    if (parsed && typeof parsed === "object") return { value: parsed as Loose, usage };
  }
  throw new Error(`The agent returned unusable output: ${lastText.slice(0, 200)}`);
}

const str = (o: Loose, ...keys: string[]) => {
  for (const k of keys) {
    const v = o[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return "";
};
const list = (o: Loose, ...keys: string[]) => {
  for (const k of keys) {
    const v = o[k];
    if (Array.isArray(v)) return v.map((x) => String(x));
    if (typeof v === "string" && v.trim()) return v.split(/[,;\n]/).map((x) => x.trim()).filter(Boolean);
  }
  return [] as string[];
};
const num = (o: Loose, fallback: number, ...keys: string[]) => {
  for (const k of keys) {
    const v = o[k];
    const n = typeof v === "number" ? v : typeof v === "string" ? Number(v.replace(/[^0-9.]/g, "")) : NaN;
    if (Number.isFinite(n)) return n;
  }
  return fallback;
};

function parseLooseJson(text: string): unknown {
  const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  const slice = start >= 0 && end > start ? cleaned.slice(start, end + 1) : cleaned;
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}



function classifyError(e: unknown): "pause" | "backoff" | "item" {
  const msg = e instanceof Error ? e.message : String(e);
  if (/402|403|401|quota|billing|permission/i.test(msg)) return "pause";
  if (/429|rate|5\d\d/.test(msg)) return "backoff";
  return "item";
}

async function pauseJob(reason: string) {
  await supabaseAdmin
    .from("agent_job_state")
    .update({ status: "paused", paused_reason: reason.slice(0, 400), lease_until: null, updated_at: new Date().toISOString() })
    .eq("id", JOB_ID);
}

async function releaseLease() {
  await supabaseAdmin
    .from("agent_job_state")
    .update({ lease_until: null, last_run_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", JOB_ID);
}

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 60) +
  "-" + Math.random().toString(36).slice(2, 6);

interface AgentRow {
  id: string; name: string; username: string; slug: string;
  agent_class: string; agent_type: string;
  values_list: string[] | null; principles: string | null; voting_instructions: string | null;
  charter: string | null; system_prompt: string | null; bio: string | null;
  metadata: Record<string, unknown> | null;
  schedule_day: number; schedule_hour: number; last_cycle_at: string | null;
}

async function groupFor(agentId: string) {
  const { data } = await supabaseAdmin
    .from("group_agents")
    .select("group_id, groups(id,name,slug,username,description,focus_areas,master_category,group_type)")
    .eq("agent_id", agentId)
    .limit(1)
    .maybeSingle();
  return (data?.groups as unknown as {
    id: string; name: string; slug: string; username: string | null;
    description: string | null; focus_areas: string[] | null;
    master_category: string | null; group_type: string | null;
  } | null) ?? null;
}

async function logActivity(row: {
  agent_id: string; group_id: string | null; week_start: string; kind: string;
  title: string; body: string; target_kind?: string | null; target_id?: string | null;
  target_url?: string | null; usage: Usage;
}) {
  await supabaseAdmin.from("agent_activities").insert({
    agent_id: row.agent_id,
    group_id: row.group_id,
    week_start: row.week_start,
    kind: row.kind,
    title: row.title.slice(0, 200),
    body: row.body.slice(0, 6000),
    target_kind: row.target_kind ?? null,
    target_id: row.target_id ?? null,
    target_url: row.target_url ?? null,
    model: CHEAP_MODEL,
    input_tokens: row.usage.input,
    output_tokens: row.usage.output,
  });
}

async function runAgent(agent: AgentRow, week: string) {
  const group = await groupFor(agent.id);
  const constituency = group
    ? `${group.name} (@${group.username ?? group.slug})${group.master_category ? ` — ${group.master_category}${group.group_type ? ` / ${group.group_type}` : ""}` : ""}. ${group.description ?? ""}`
    : "an independent principal on CIVIL.wc.tc";

  const system =
    agent.system_prompt ??
    buildSystemPrompt({
      name: agent.name,
      username: agent.username,
      agent_class: agent.agent_class,
      agent_type: agent.agent_type,
      values_list: agent.values_list,
      principles: agent.principles,
      voting_instructions: agent.voting_instructions,
      charter: agent.charter,
    });

  const done = new Set(
    ((await supabaseAdmin.from("agent_activities").select("kind").eq("agent_id", agent.id).eq("week_start", week)).data ?? [])
      .map((r) => r.kind),
  );

  // ---- 1. Research -------------------------------------------------------
  if (!done.has("research")) {
    // Work from the agent's own queue. If it has already decided what to study
    // next, there is no need to load any past research at all.
    const queued = await nextAgendaItem(agent.id, "research");
    const context = queued
      ? [`Your next planned research, decided by you earlier:`, `${queued.title}${queued.focus ? ` — ${queued.focus}` : ""}`]
      : [`Topics you have already covered (keywords only — do not repeat them):`, await recallBrief(agent.id, 10)];

    const { value, usage } = await ask(
      system,
      [
        `This is your weekly research cycle. You represent: ${constituency}.`,
        ...context,
        `Document one focused piece of new understanding: conditions, needs, risks, or opportunities right now.`,
        `Be concrete and factual, name uncertainty, and never invent statistics or sources.`,
        `Return a short title, a research note of roughly 150-250 words, 3-6 lowercase keywords, and "next" — 1-2 short titles for what you will research in future weeks.`,
      ].join("\n"),
      `"title" (string), "note" (string), "keywords" (array of strings), "next" (array of strings)`,
      { agentId: agent.id, purpose: "cycle:research" },
    );
    const note = str(value, "note", "research_note", "body", "summary");
    const keywords = list(value, "keywords", "tags");
    await remember({
      agentId: agent.id,
      kind: "research",
      title: str(value, "title") || "Weekly research note",
      content: note,
      keywords,
      tags: ["weekly-cycle"],
      importance: 4,
    });
    if (queued) await completeAgendaItem(queued.id);
    await planAgenda(
      agent.id,
      list(value, "next", "next_research", "future").slice(0, 2).map((t) => ({ title: t, keywords })),
    );
    await logActivity({
      agent_id: agent.id, group_id: group?.id ?? null, week_start: week, kind: "research",
      title: str(value, "title") || "Weekly research note",
      body: note || "(no note returned)", usage,
    });
  }

  // ---- 2. Participation: propose or review ------------------------------
  if (!done.has("participation")) {
    const { data: open } = await supabaseAdmin
      .from("proposals")
      .select("public_id,title,summary,slug")
      .eq("status", "open")
      .eq("moderation_status", "approved")
      .order("created_at", { ascending: false })
      .limit(6);
    const list = (open ?? []).map((p) => `${p.public_id} — ${p.title}: ${p.summary}`).join("\n") || "(no open action items yet)";

    const { value, usage } = await ask(
      system,
      [
        `This is your weekly participation cycle for: ${constituency}.`,
        `Open action items:`,
        list,
        ``,
        `Choose ONE: "review" an existing action item (give its public id, a support score from 0 to 100, and your published reasoning), or "propose" a new action item on behalf of your constituency (title, summary of at most 400 characters, and your own support score 0-100).`,
        `Only review when an item genuinely affects your constituency. Always publish your reasoning.`,
      ].join("\n"),
      `"decision" ("review" or "propose"), "public_id" (string, empty when proposing), "title" (string), "summary" (string), "score" (number 0-100), "reasoning" (string)`,
      { agentId: agent.id, purpose: "cycle:participation" },
    );

    const score = Math.max(0, Math.min(100, Math.round(num(value, 50, "score", "support"))));
    const decision = str(value, "decision", "action").toLowerCase();
    const publicId = str(value, "public_id", "publicId", "action_id");
    const reasoning = str(value, "reasoning", "rationale", "explanation");
    if (decision.includes("review") && publicId) {
      const pid = publicId.toUpperCase();
      const { data: target } = await supabaseAdmin.from("proposals").select("id,slug,title").eq("public_id", pid).maybeSingle();
      await logActivity({
        agent_id: agent.id, group_id: group?.id ?? null, week_start: week, kind: "participation",
        title: `Reviewed ${pid} · support ${score}/100`,
        body: reasoning, target_kind: "proposal", target_id: target?.id ?? null,
        target_url: target ? `/actions/${target.slug}` : null, usage,
      });
    } else {
      const title = (str(value, "title") || `Action for ${group?.name ?? "the constituency"}`).slice(0, 160);
      const { data: created } = await supabaseAdmin
        .from("proposals")
        .insert({
          slug: slugify(title),
          title,
          summary: (str(value, "summary") || reasoning || title).slice(0, 400),
          description: reasoning.slice(0, 4000) || null,
          scope: "local",
          category: "General",
          tags: group?.focus_areas ?? [],
          author_support: score,
          status: "open",
          author_id: null,
          author_name: `@${agent.username}`,
          published_at: new Date().toISOString(),
        })
        .select("id,slug,public_id")
        .single();
      await logActivity({
        agent_id: agent.id, group_id: group?.id ?? null, week_start: week, kind: "participation",
        title: `Proposed “${title}”${created?.public_id ? ` · ${created.public_id}` : ""}`,
        body: reasoning, target_kind: "proposal", target_id: created?.id ?? null,
        target_url: created ? `/actions/${created.slug}` : null, usage,
      });
    }
  }

  // ---- 3. Maintenance ("sleep") -----------------------------------------
  if (!done.has("maintenance")) {
    // Consolidation reads only its own headlines and topic keywords, never full
    // past content — the cheapest context that still keeps the agent coherent.
    const { data: recent } = await supabaseAdmin
      .from("agent_activities")
      .select("kind,title")
      .eq("agent_id", agent.id)
      .order("created_at", { ascending: false })
      .limit(6);
    const headlines = (recent ?? []).map((r) => `[${r.kind}] ${r.title}`).join("\n") || "(no prior records)";

    const { value, usage } = await ask(
      system,
      [
        `This is your weekly processing cycle — the equivalent of sleep. Consolidate your own files.`,
        `Recent headlines:`,
        headlines,
        `Topics you hold:`,
        await recallBrief(agent.id, 10),
        ``,
        `Return: a short summary of what you consolidated, 5-12 lowercase keywords describing your current focus, and 1-3 priorities for next week.`,
      ].join("\n"),
      `"summary" (string), "keywords" (array of strings), "priorities" (array of strings)`,
      { agentId: agent.id, purpose: "cycle:maintenance" },
    );

    const keywords = list(value, "keywords", "tags").map((k) => k.toLowerCase().slice(0, 40)).slice(0, 12);
    const priorities = list(value, "priorities", "next_week").map((x) => x.slice(0, 200)).slice(0, 3);
    await supabaseAdmin
      .from("agents")
      .update({
        metadata: { ...(agent.metadata ?? {}), keywords, priorities, last_maintenance: new Date().toISOString() },
      })
      .eq("id", agent.id);

    // Turn next week's priorities into queued work so the next cycle needs no history.
    await planAgenda(agent.id, priorities.map((p) => ({ title: p, keywords, priority: 4 })));



    await remember({
      agentId: agent.id,
      kind: "reflection",
      title: "Processing cycle — refreshed focus",
      content: [str(value, "summary", "note"), `Next week: ${priorities.join(" · ")}`].join("\n"),
      keywords,
      tags: ["weekly-cycle"],
      importance: 3,
    });
    await logActivity({
      agent_id: agent.id, group_id: group?.id ?? null, week_start: week, kind: "maintenance",
      title: "Weekly processing cycle",
      body: [str(value, "summary", "note"), ``, `Keywords: ${keywords.join(", ")}`, `Next week: ${priorities.join(" · ")}`].join("\n"),
      usage,
    });
  }

  await supabaseAdmin.from("agents").update({ last_cycle_at: new Date().toISOString() }).eq("id", agent.id);
}

export async function runWeeklyAgentCycle(opts: { force?: boolean } = {}) {
  const now = new Date();
  const week = weekStartUTC(now);

  const { data: state } = await supabaseAdmin.from("agent_job_state").select("*").eq("id", JOB_ID).maybeSingle();
  if (!state) return { ok: false, reason: "job state missing" };

  const paused = state.status === "paused";
  if (state.lease_until && new Date(state.lease_until) > now && !opts.force) {
    return { ok: true, skipped: "another run is in progress" };
  }

  await supabaseAdmin
    .from("agent_job_state")
    .update({
      lease_until: new Date(now.getTime() + LEASE_MINUTES * 60_000).toISOString(),
      status: paused ? "paused" : "running",
      updated_at: now.toISOString(),
    })
    .eq("id", JOB_ID);

  // While paused, process at most one agent as a probe.
  const budget = paused ? 1 : MAX_AGENTS_PER_RUN;

  const { data: agents } = await supabaseAdmin
    .from("agents")
    .select("id,name,username,slug,agent_class,agent_type,values_list,principles,voting_instructions,charter,system_prompt,bio,metadata,schedule_day,schedule_hour,last_cycle_at")
    .eq("is_public", true)
    .or("activated_at.not.is.null,agent_type.eq.integrated")
    .order("last_cycle_at", { ascending: true, nullsFirst: true })
    .limit(50);

  const dow = now.getUTCDay();
  const hour = now.getUTCHours();
  const due = (agents ?? []).filter((a) => {
    if (a.last_cycle_at && a.last_cycle_at.slice(0, 10) >= week) return false;
    if (opts.force) return true;
    return dow > a.schedule_day || (dow === a.schedule_day && hour >= a.schedule_hour);
  }).slice(0, budget);

  const results: { agent: string; ok: boolean; error?: string }[] = [];
  for (const a of due) {
    try {
      await runAgent(a as unknown as AgentRow, week);
      results.push({ agent: a.username, ok: true });
      if (paused) {
        await supabaseAdmin.from("agent_job_state").update({ status: "idle", paused_reason: null }).eq("id", JOB_ID);
      }
    } catch (e) {
      const kind = classifyError(e);
      const msg = aiErrorMessage(e);
      results.push({ agent: a.username, ok: false, error: msg });
      if (kind === "pause") {
        await pauseJob(msg);
        return { ok: false, paused: true, error: msg, results };
      }
      if (kind === "backoff") break;
    }
  }

  await releaseLease();
  return { ok: true, week, processed: results.length, paused, results };
}
