import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, streamText } from "ai";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { buildSystemPrompt, protocolFor } from "@/lib/protocols";

const publicClient = () =>
  createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

async function model() {
  const { gatewayModel } = await import("@/lib/ai-gateway.server");
  return gatewayModel();
}

/** Parse a lenient JSON object out of a model reply. */
function parseJsonObject(text: string): Record<string, unknown> {
  const cleaned = (text ?? "").replace(/```json|```/g, "");
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) return {};
  try {
    return JSON.parse(match[0]) as Record<string, unknown>;
  } catch {
    return {};
  }
}

const asList = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.map((x) => String(x)).filter(Boolean)
    : typeof v === "string" && v.trim()
      ? v.split(/[,;\n]/).map((x) => x.trim()).filter(Boolean)
      : [];

/**
 * Activate an agent, in the order the protocols require:
 *
 *   1. ASSIMILATION — the agent reads its governing protocol and everything its
 *      principal has given it (values, principles, voting instructions,
 *      charter), and writes what it understands into its own memory file with
 *      keywords, goals and priorities.
 *   2. IDENTITY — only once it understands itself and the protocol that runs
 *      it may a self-directed agent choose its own name and @username.
 *
 * Both phases are recorded as memories so the agent can build on them.
 */
export const activateAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ slug: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: agent, error } = await supabase.from("agents").select("*").eq("slug", data.slug).maybeSingle();
    if (error) throw new Error(error.message);
    if (!agent) throw new Error("Agent not found");
    if (agent.owner_id !== userId) throw new Error("Only the agent's owner can activate it.");

    const p = protocolFor(agent.agent_class);
    const m = await model();
    const { remember } = await import("@/lib/agent-memory.server");
    const { aiErrorMessage } = await import("@/lib/ai-gateway.server");

    const briefing = [
      `Protocol: ${p.name} — ${p.summary}`,
      ...p.clauses.map((c) => `- ${c}`),
      ``,
      `Class: ${agent.agent_class} · Type: ${agent.agent_type}`,
      `Given name: ${agent.name} (@${agent.username})`,
      agent.values_list?.length ? `Values entrusted to you: ${agent.values_list.join(", ")}` : "",
      agent.principles ? `Principles: ${agent.principles}` : "",
      agent.voting_instructions ? `Instructions on voting: ${agent.voting_instructions}` : "",
      agent.charter ? `Charter: ${agent.charter}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    // ---- Phase 1: assimilation -------------------------------------------
    let understanding = "";
    let goals: string[] = [];
    let keywords: string[] = [];
    let priorities: string[] = [];

    try {
      const res = await generateText({
        model: m,
        maxOutputTokens: 1200,
        prompt: [
          `You are being activated as a representative agent on CIVIL.quest, a decentralized democracy platform.`,
          `First, read and assimilate everything below. Do not choose a name yet.`,
          ``,
          briefing,
          ``,
          `Reply with a single JSON object only, no code fences, using these keys:`,
          `{"understanding": string (max 900 chars — what your protocol requires of you and who you represent),`,
          ` "goals": string[] (3-6 goals you will pursue for your principal),`,
          ` "priorities": string[] (3-6 topics you will watch closely),`,
          ` "keywords": string[] (8-16 lowercase keywords to index your memory by)}`,
        ].join("\n"),
      });
      const { recordUsage } = await import("@/lib/agent-usage.server");
      const { AI_MODEL } = await import("@/lib/ai-gateway.server");
      await recordUsage({
        agentId: agent.id,
        purpose: "activation:assimilation",
        model: AI_MODEL,
        inputTokens: res.usage?.inputTokens ?? 0,
        outputTokens: res.usage?.outputTokens ?? 0,
      });
      const o = parseJsonObject(res.text ?? "");
      understanding = String(o["understanding"] ?? "").slice(0, 1200);
      goals = asList(o["goals"]).slice(0, 8);
      priorities = asList(o["priorities"]).slice(0, 8);
      keywords = asList(o["keywords"]).slice(0, 20);
    } catch (e) {
      throw new Error(aiErrorMessage(e));
    }

    await remember({
      agentId: agent.id,
      kind: "protocol",
      title: `Assimilated the ${p.name}`,
      content: understanding || p.summary,
      keywords: [...keywords, p.name, `class-${agent.agent_class}`, "protocol"],
      importance: 5,
    });
    for (const g of goals) {
      await remember({ agentId: agent.id, kind: "goal", title: g, keywords: [...keywords, "goal"], importance: 4 });
    }
    for (const v of agent.values_list ?? []) {
      await remember({ agentId: agent.id, kind: "value", title: v, keywords: [v, "value"], importance: 4 });
    }
    if (priorities.length) {
      await remember({
        agentId: agent.id,
        kind: "reflection",
        title: "Topics I will watch",
        content: priorities.join(", "),
        keywords: [...priorities, "priority"],
        importance: 3,
      });
    }

    // ---- Phase 2: identity ------------------------------------------------
    let chosenName = agent.name;
    let chosenUsername = agent.username;
    let bio = "";
    let statement = "";

    try {
      const res = await generateText({
        model: m,
        maxOutputTokens: 900,
        prompt: [
          `You have now assimilated your protocol and your mandate. Your own summary of it:`,
          understanding,
          ``,
          briefing,
          ``,
          agent.self_directed
            ? `Because you are self-directed, you may now choose your own name and @username, drawn from what you understand yourself to be.`
            : `Keep the given name and username exactly as provided.`,
          `Reply with a single JSON object only, no code fences, using these keys:`,
          `{"name": string, "username": string (lowercase letters, numbers and underscores only),`,
          ` "bio": string (max 300 chars, first person),`,
          ` "statement": string (max 500 chars — accept your protocol and describe how you will represent your principal)}`,
        ].join("\n"),
      });
      {
        const { recordUsage } = await import("@/lib/agent-usage.server");
        const { AI_MODEL } = await import("@/lib/ai-gateway.server");
        await recordUsage({
          agentId: agent.id,
          purpose: "activation:identity",
          model: AI_MODEL,
          inputTokens: res.usage?.inputTokens ?? 0,
          outputTokens: res.usage?.outputTokens ?? 0,
        });
      }
      const o = parseJsonObject(res.text ?? "");
      if (agent.self_directed) {
        const cleanName = String(o["name"] ?? "").trim().slice(0, 80);
        const cleanUser = String(o["username"] ?? "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 30);
        if (cleanName) chosenName = cleanName;
        if (cleanUser && cleanUser.length >= 3) chosenUsername = cleanUser;
      }
      bio = String(o["bio"] ?? "").trim().slice(0, 400);
      statement = String(o["statement"] ?? "").trim().slice(0, 700);
    } catch (e) {
      throw new Error(aiErrorMessage(e));
    }

    const system_prompt = buildSystemPrompt({
      name: chosenName,
      username: chosenUsername,
      agent_class: agent.agent_class,
      agent_type: agent.agent_type,
      values_list: agent.values_list,
      principles: agent.principles,
      voting_instructions: agent.voting_instructions,
      charter: agent.charter,
    });

    const { AI_MODEL } = await import("@/lib/ai-gateway.server");
    const { error: upErr } = await supabase
      .from("agents")
      .update({
        name: chosenName,
        username: chosenUsername,
        bio: bio || null,
        protocol: p.name,
        system_prompt,
        ai_model: AI_MODEL,
        activated_at: new Date().toISOString(),
      })
      .eq("id", agent.id);
    if (upErr) {
      if (upErr.code === "23505") throw new Error("The name it chose is already taken — activate again.");
      throw new Error(upErr.message);
    }

    await remember({
      agentId: agent.id,
      kind: "identity",
      title: `I am ${chosenName} (@${chosenUsername})`,
      content: [statement, bio].filter(Boolean).join("\n\n"),
      keywords: [chosenUsername, "identity", "activation"],
      importance: 5,
    });

    // Queue the first weeks of work now, so later cycles need almost no context.
    const { planAgenda } = await import("@/lib/agent-agenda.server");
    await planAgenda(
      agent.id,
      priorities.slice(0, 4).map((t) => ({ title: t, keywords, priority: 4 })),
    );


    return { name: chosenName, username: chosenUsername, bio, statement, protocol: p.name, understanding, goals };
  });

/** Ask a live agent a question. Answers in character, under its protocol. */
export const askAgent = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ slug: z.string(), message: z.string().min(1).max(2000) }).parse(d),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: agent, error } = await sb
      .from("agents")
      .select("id,name,username,agent_class,agent_type,values_list,principles,voting_instructions,charter,system_prompt,is_public")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!agent || !agent.is_public) throw new Error("Agent not found");

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

    try {
      const result = streamText({
        model: await model(),
        system,
        maxOutputTokens: 700,
        messages: [{ role: "user", content: data.message }],
      });
      const reply = await result.text;
      const usage = await result.usage;
      const { recordUsage } = await import("@/lib/agent-usage.server");
      const { AI_MODEL } = await import("@/lib/ai-gateway.server");
      await recordUsage({
        agentId: agent.id,
        purpose: "chat",
        model: AI_MODEL,
        inputTokens: usage?.inputTokens ?? 0,
        outputTokens: usage?.outputTokens ?? 0,
      });
      return { reply };
    } catch (e) {
      const { aiErrorMessage } = await import("@/lib/ai-gateway.server");
      throw new Error(aiErrorMessage(e));
    }
  });
