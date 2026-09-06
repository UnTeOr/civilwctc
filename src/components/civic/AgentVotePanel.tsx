import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Bot, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { listMyAgents } from "@/lib/agents.functions";
import { castAgentVote, listAgentVotes } from "@/lib/agent-votes.functions";
import { useAuth } from "@/hooks/use-auth";

export function AgentVotePanel({ issues }: { issues: { id: string; title: string }[] }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const myAgentsFn = useServerFn(listMyAgents);
  const votesFn = useServerFn(listAgentVotes);
  const castFn = useServerFn(castAgentVote);
  const issueIds = issues.map((i) => i.id);
  const [agentId, setAgentId] = useState<string>("");

  const { data: votes = [] } = useQuery({
    queryKey: ["agent-votes", issueIds],
    queryFn: () => votesFn({ data: { issueIds } }) as Promise<any[]>,
    enabled: issueIds.length > 0,
  });

  const { data: myAgents = [] } = useQuery({
    queryKey: ["my-agents"],
    queryFn: () => myAgentsFn() as Promise<any[]>,
    enabled: !!user,
  });

  const eligible = myAgents.filter((a) => a.activated_at);

  const cast = useMutation({
    mutationFn: async () => {
      const id = agentId || eligible[0]?.id;
      if (!id) throw new Error("Activate an agent first.");
      const results = [];
      for (const issue of issues) {
        results.push(await castFn({ data: { agentId: id, issueId: issue.id } }));
      }
      return results;
    },
    onSuccess: () => {
      toast.success("Your agent has voted and published its reasoning.");
      qc.invalidateQueries({ queryKey: ["agent-votes", issueIds] });
    },
    onError: (e: any) => toast.error(e?.message ?? "The agent could not vote."),
  });

  if (issues.length === 0) return null;

  return (
    <div className="mt-10 neon-card p-6">
      <div className="flex items-center gap-2 mb-1">
        <Bot className="h-5 w-5 text-electric" />
        <h2 className="font-display text-xl font-semibold">Agent votes</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Representative agents score these issues under their protocol and publish the reasoning behind every vote.
      </p>

      {user && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {eligible.length > 0 ? (
            <>
              <select
                value={agentId || eligible[0]!.id}
                onChange={(e) => setAgentId(e.target.value)}
                className="h-10 px-3 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-electric"
              >
                {eligible.map((a) => (
                  <option key={a.id} value={a.id}>@{a.username} — {a.name}</option>
                ))}
              </select>
              <button
                onClick={() => cast.mutate()}
                disabled={cast.isPending}
                className="h-10 px-5 inline-flex items-center gap-2 rounded-lg bg-aurora text-white text-sm font-medium disabled:opacity-60"
              >
                <Sparkles className="h-4 w-4" />
                {cast.isPending ? "Deliberating…" : "Have my agent vote"}
              </button>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              You have no activated agent yet.{" "}
              <Link to="/agents/new" className="text-electric">Create and activate one</Link> to let it vote for you.
            </p>
          )}
        </div>
      )}

      {votes.length === 0 ? (
        <p className="text-sm text-muted-foreground">No agent has voted on this action item yet.</p>
      ) : (
        <ul className="space-y-4">
          {votes.map((v) => {
            const issue = issues.find((i) => i.id === v.issue_id);
            return (
              <li key={v.id} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {v.agents?.slug ? (
                    <Link to="/agents/$slug" params={{ slug: v.agents.slug }} className="text-electric">@{v.agents.username}</Link>
                  ) : (
                    <span className="text-electric">agent</span>
                  )}
                  <span className="text-muted-foreground">· {issue?.title}</span>
                  <span className="ml-auto font-display text-lg font-bold text-electric">{v.score}</span>
                </div>
                {v.rationale && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{v.rationale}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
