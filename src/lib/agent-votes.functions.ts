import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const publicClient = () =>
  createClient<Database>(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

/** All agent votes on the issues of one action item. */
export const listAgentVotes = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ issueIds: z.array(z.string().uuid()).max(50) }).parse(d))
  .handler(async ({ data }) => {
    if (!data.issueIds.length) return [];
    const sb = publicClient();
    const { data: rows, error } = await sb
      .from("agent_votes")
      .select("id, issue_id, score, rationale, created_at, agents(name, username, slug, agent_class, avatar_url)")
      .in("issue_id", data.issueIds)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/**
 * Have one of your agents vote on an issue. The agent reasons under its own
 * protocol, values, voting instructions and recalled memories, then records the
 * score plus a published rationale — and remembers the decision.
 */
export const castAgentVote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({
      agentId: z.string().uuid(),
      issueId: z.string().uuid(),
      score: z.number().int().min(0).max(100).optional(),
      rationale: z.string().max(2000).optional(),
    }).parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: agent, error: aErr } = await supabase
      .from("agents")
      .select("id, name, username, owner_id, agent_class, agent_type, values_list, principles, voting_instructions, charter, system_prompt, activated_at")
      .eq("id", data.agentId)
      .maybeSingle();
    if (aErr) throw new Error(aErr.message);
    if (!agent) throw new Error("Agent not found");
    if (agent.owner_id !== userId) throw new Error("Only the agent's owner can have it vote.");
    if (!agent.activated_at) throw new Error("Activate this agent before it can vote.");

    const { data: issue, error: iErr } = await supabase
      .from("issues")
      .select("id, title, description, proposals(title, summary, description)")
      .eq("id", data.issueId)
      .maybeSingle();
    if (iErr) throw new Error(iErr.message);
    if (!issue) throw new Error("Issue not found");

    let score = data.score;
    let rationale = data.rationale ?? "";

    if (score === undefined) {
      const { buildSystemPrompt } = await import("@/lib/protocols");
      const { gatewayModel, aiErrorMessage, AI_MODEL } = await import("@/lib/ai-gateway.server");
      const { recallBrief } = await import("@/lib/agent-memory.server");
      const { recordUsage } = await import("@/lib/agent-usage.server");
      const { generateText } = await import("ai");

      const proposal = (issue as any).proposals ?? {};
      const memories = await recallBrief(agent.id, 8);
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
        const res = await generateText({
          model: gatewayModel(),
          system,
          maxOutputTokens: 700,
          prompt: [
            `ACTION ITEM: ${proposal.title ?? ""}`,
            proposal.summary ?? "",
            (proposal.description ?? "").slice(0, 1200),
            ``,
            `ISSUE TO SCORE: ${issue.title}`,
            issue.description ?? "",
            ``,
            `TOPICS YOU ALREADY HOLD (keywords only):`,
            memories,
            ``,
            `Score this issue from 0 (strongly oppose) to 100 (strongly support) on behalf of those you represent, following your voting instructions. Reply with a single JSON object only: {"score": number, "rationale": string (max 600 chars)}`,
          ].join("\n"),
        });
        await recordUsage({
          agentId: agent.id,
          userId: context.userId,
          purpose: "vote",
          model: AI_MODEL,
          inputTokens: res.usage?.inputTokens ?? 0,
          outputTokens: res.usage?.outputTokens ?? 0,
        });
        const text = (res.text ?? "").replace(/```json|```/g, "");
        const match = text.match(/\{[\s\S]*\}/);
        const parsed = match ? (JSON.parse(match[0]) as { score?: number; rationale?: string }) : {};
        const n = Number(parsed.score);
        score = Number.isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 50;
        rationale = (parsed.rationale ?? text).trim().slice(0, 900);
      } catch (e) {
        throw new Error(aiErrorMessage(e));
      }
    }

    const { error: vErr } = await supabase
      .from("agent_votes")
      .upsert(
        { agent_id: agent.id, issue_id: data.issueId, score: score!, rationale: rationale || null },
        { onConflict: "agent_id,issue_id" },
      );
    if (vErr) throw new Error(vErr.message);

    const { remember } = await import("@/lib/agent-memory.server");
    await remember({
      agentId: agent.id,
      kind: "vote",
      title: `Scored "${issue.title}" at ${score}`,
      content: rationale,
      keywords: [...issue.title.split(/\s+/), "vote", "decision"],
      importance: 4,
      sourceKind: "issue",
      sourceId: data.issueId,
    });

    return { score: score!, rationale };
  });
