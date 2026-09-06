import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Gauge, ListChecks } from "lucide-react";
import { getAgentUsage, listAgentAgenda } from "@/lib/agent-usage.functions";

const fmt = (n: number) => n.toLocaleString();
const money = (n: number) => `$${n < 0.01 ? n.toFixed(4) : n.toFixed(2)}`;

/**
 * What this agent has spent and what it plans to do next. Agents work from a
 * short queue and recall only keywords, so their running cost stays small.
 */
export function AgentEfficiencyPanel({ agentId }: { agentId: string }) {
  const usageFn = useServerFn(getAgentUsage);
  const agendaFn = useServerFn(listAgentAgenda);

  const { data: usage } = useQuery({
    queryKey: ["agent-usage", agentId],
    queryFn: () => usageFn({ data: { agentId } }),
  });
  const { data: agenda = [] } = useQuery({
    queryKey: ["agent-agenda", agentId],
    queryFn: () => agendaFn({ data: { agentId } }) as Promise<any[]>,
  });

  const t = usage?.totals;
  const planned = agenda.filter((a) => a.status === "planned");
  const done = agenda.filter((a) => a.status === "done").slice(0, 4);

  return (
    <div className="mt-8 grid gap-6 md:grid-cols-2">
      <div className="neon-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <Gauge className="h-5 w-5 text-electric" />
          <h2 className="font-display text-xl font-semibold">Resource use</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Every thought this agent has is metered. It recalls keywords, not whole archives, to keep cost and energy low.
        </p>
        <dl className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-muted-foreground">Calls</dt>
            <dd className="font-display text-lg">{fmt(t?.calls ?? 0)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Tokens</dt>
            <dd className="font-display text-lg">{fmt((t?.input_tokens ?? 0) + (t?.output_tokens ?? 0))}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Cost</dt>
            <dd className="font-display text-lg">{money(t?.cost_usd ?? 0)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Energy</dt>
            <dd className="font-display text-lg">{(t?.energy_wh ?? 0).toFixed(2)} Wh</dd>
          </div>
        </dl>
        {(usage?.recent?.length ?? 0) > 0 && (
          <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
            {usage!.recent.map((r: any, i: number) => (
              <li key={i} className="flex justify-between gap-3">
                <span>{r.purpose}</span>
                <span>{fmt(r.input_tokens + r.output_tokens)} tokens · {money(Number(r.cost_usd))}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="neon-card p-6">
        <div className="flex items-center gap-2 mb-1">
          <ListChecks className="h-5 w-5 text-violet" />
          <h2 className="font-display text-xl font-semibold">Next on its list</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          The agent decides its own next steps in advance, so each weekly cycle starts with almost no context to load.
        </p>
        {planned.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing queued yet — the next cycle will plan ahead.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {planned.map((a) => (
              <li key={a.id} className="flex gap-2">
                <span className="text-electric">•</span>
                <span>
                  {a.title}
                  {a.focus && <span className="block text-xs text-muted-foreground">{a.focus}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}
        {done.length > 0 && (
          <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
            {done.map((a) => (
              <li key={a.id} className="line-through">{a.title}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
