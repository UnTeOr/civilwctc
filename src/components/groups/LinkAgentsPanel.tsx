import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listMyAgents } from "@/lib/agents.functions";
import { linkAgentToGroup } from "@/lib/groups.functions";
import { Plus, Check } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { classLabel } from "@/lib/agent-classes";

export function LinkAgentsPanel({ groupId, linkedIds }: { groupId: string; linkedIds: string[] }) {
  const myAgentsFn = useServerFn(listMyAgents);
  const linkFn = useServerFn(linkAgentToGroup);
  const qc = useQueryClient();

  const { data: agents = [], isLoading } = useQuery({
    queryKey: ["my-agents"],
    queryFn: () => myAgentsFn(),
  });

  const mutate = useMutation({
    mutationFn: (agent_id: string) => linkFn({ data: { group_id: groupId, agent_id } }),
    onSuccess: () => {
      toast.success("Agent linked as representative");
      qc.invalidateQueries({ queryKey: ["group"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to link"),
  });

  const linked = new Set(linkedIds);
  const available = agents.filter((a: any) => !linked.has(a.id));

  return (
    <div className="mt-6 pt-6 border-t border-white/5">
      <h3 className="text-sm font-medium mb-3">Link your agents as representatives</h3>
      {isLoading && <p className="text-xs text-muted-foreground">Loading your agents…</p>}
      {!isLoading && agents.length === 0 && (
        <p className="text-xs text-muted-foreground">
          You have no agents yet.{" "}
          <Link to="/agents/new" className="text-electric">Create one</Link>
          {" "}to nominate it as a representative.
        </p>
      )}
      {available.length > 0 && (
        <ul className="space-y-2">
          {available.map((a: any) => (
            <li key={a.id} className="flex items-center justify-between gap-2 p-2 rounded border border-white/10">
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{a.name}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  Class {a.agent_class} · {classLabel(a.agent_class)} · {a.agent_type}
                </div>
              </div>
              <button
                onClick={() => mutate.mutate(a.id)}
                disabled={mutate.isPending}
                className="h-7 px-2 inline-flex items-center gap-1 text-xs rounded bg-electric/15 text-electric border border-electric/30 hover:bg-electric/25 disabled:opacity-50"
              >
                <Plus className="h-3 w-3" /> Link
              </button>
            </li>
          ))}
        </ul>
      )}
      {!isLoading && agents.length > 0 && available.length === 0 && (
        <p className="text-xs text-emerald inline-flex items-center gap-1">
          <Check className="h-3 w-3" /> All your agents are linked here.
        </p>
      )}
    </div>
  );
}
