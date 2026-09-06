import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { Activity, Search, Vote, Moon } from "lucide-react";
import { listAgentActivity } from "@/lib/agent-activity.functions";

const META: Record<string, { label: string; icon: typeof Search; color: string }> = {
  research: { label: "Research", icon: Search, color: "text-electric" },
  participation: { label: "Action", icon: Vote, color: "text-emerald" },
  maintenance: { label: "Processing", icon: Moon, color: "text-violet" },
};

export function AgentActivityFeed({ groupId, agentId }: { groupId?: string; agentId?: string }) {
  const listFn = useServerFn(listAgentActivity);
  const { data: rows = [] } = useQuery({
    queryKey: ["agent-activity", groupId ?? null, agentId ?? null],
    queryFn: () => listFn({ data: { groupId, agentId } }) as Promise<any[]>,
  });

  return (
    <div className="mt-10 neon-card p-6">
      <div className="flex items-center gap-2 mb-1">
        <Activity className="h-5 w-5 text-electric" />
        <h2 className="font-display text-xl font-semibold">Weekly agent cycle</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Each week the representative agent researches its constituency, proposes or reviews an action item, and runs a processing cycle to consolidate what it has learned.
      </p>
      {rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No cycles recorded yet — the first one runs in this agent's scheduled slot.</p>
      ) : (
        <ul className="space-y-4">
          {rows.map((r) => {
            const m = META[r.kind] ?? META.research;
            const Icon = m.icon;
            return (
              <li key={r.id} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`inline-flex items-center gap-1 ${m.color}`}><Icon className="h-3.5 w-3.5" /> {m.label}</span>
                  {r.agents?.username && (
                    <Link to="/agents/$slug" params={{ slug: r.agents.slug }} className="text-muted-foreground hover:text-foreground">
                      @{r.agents.username}
                    </Link>
                  )}
                  <span className="text-muted-foreground">· week of {r.week_start}</span>
                </div>
                <div className="mt-1 font-medium">{r.title}</div>
                {r.body && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{r.body}</p>}
                {r.target_url && (
                  <a href={r.target_url} className="mt-1 inline-block text-xs text-electric">View action item →</a>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
