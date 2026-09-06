import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAgent } from "@/lib/agents.functions";
import { getAgentLinks } from "@/lib/profiles.functions";
import { HexBadge, AgentIcon } from "@/components/civic/icons";
import { AgentConsole } from "@/components/civic/AgentConsole";
import { AgentActivityFeed } from "@/components/civic/AgentActivityFeed";
import { AgentMemoryPanel } from "@/components/civic/AgentMemoryPanel";
import { AgentEfficiencyPanel } from "@/components/civic/AgentEfficiencyPanel";
import { protocolFor } from "@/lib/protocols";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { CLASS_COLOR, AGENT_CLASS_MAP } from "@/lib/agent-classes";

export const Route = createFileRoute("/agents/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Agent ${params.slug} — CIVIL.wc.tc` },
      { name: "description", content: "Representative agent profile." },
    ],
  }),
  loader: ({ params }) => getAgent({ data: { slug: params.slug } }).then((agent) => ({ agent })),
  component: AgentDetail,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center">
      <p className="text-muted-foreground">{error.message}</p>
      <Link to="/agents" className="mt-4 inline-block text-electric">← All agents</Link>
    </div>
  ),
  notFoundComponent: () => <div className="p-10 text-center">Agent not found.</div>,
});



function AgentDetail() {
  const { agent } = Route.useLoaderData() as { agent: any };
  const color = CLASS_COLOR[agent.agent_class] ?? "oklch(0.62 0.26 265)";
  const protocol = protocolFor(agent.agent_class);
  const linksFn = useServerFn(getAgentLinks);
  const { data: links } = useQuery({
    queryKey: ["agent-links", agent.id],
    queryFn: () => linksFn({ data: { agentId: agent.id, ownerId: agent.owner_id ?? null } }),
  });

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 lg:py-16">
      <Link to="/agents" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> All agents
      </Link>

      <div className="flex items-start gap-6 flex-wrap">
        {agent.avatar_url ? (
          <img src={agent.avatar_url} alt={`${agent.name} agent portrait`} className="h-24 w-24 rounded-full object-cover border border-white/10" />
        ) : (
          <HexBadge color={color}><AgentIcon color={color} /></HexBadge>
        )}
        <div className="flex-1 min-w-[200px]">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground capitalize">{agent.agent_type} · {AGENT_CLASS_MAP[agent.agent_class]?.name ?? `Class ${agent.agent_class}`}</span>
          <h1 className="font-display text-4xl font-bold mt-2">{agent.name}</h1>
          <p className="text-electric mt-1">@{agent.username}</p>
          {agent.bio && <p className="mt-3 text-foreground/90 leading-relaxed max-w-xl">{agent.bio}</p>}
          {agent.self_directed && (
            <p className="text-xs text-violet mt-1">Self-directed identity — this agent names and portrays itself.</p>
          )}
          <p className="text-xs mt-2 text-muted-foreground">
            {agent.activated_at ? `Live · running under the ${protocol.name}` : `Standby · ${protocol.name} not yet loaded`}
          </p>
          {agent.external_url && (
            <a href={agent.external_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-electric">
              External profile <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <div className="text-right">
          <div className="font-display text-4xl font-bold" style={{ color }}>{agent.reputation}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Reputation</div>
        </div>
      </div>

      {(links?.owner || (links?.groups.length ?? 0) > 0) && (
        <div className="mt-8 neon-card p-6">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Linked profiles</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {links?.owner && (
              <Link
                to="/u/$username"
                params={{ username: links.owner.username ?? "" }}
                className="flex items-center gap-3 rounded-lg border border-white/10 p-3 hover:border-electric transition"
              >
                <div className="h-10 w-10 rounded-full overflow-hidden bg-aurora inline-flex items-center justify-center text-white text-sm font-bold">
                  {links.owner.avatar_url ? (
                    <img src={links.owner.avatar_url} alt={`${links.owner.display_name ?? links.owner.username} profile picture`} className="h-full w-full object-cover" />
                  ) : (
                    (links.owner.display_name || links.owner.username || "C").slice(0, 1).toUpperCase()
                  )}
                </div>
                <div>
                  <div className="text-sm font-medium">Acts on behalf of {links.owner.display_name || links.owner.username}</div>
                  <div className="text-xs text-electric">@{links.owner.username}</div>
                </div>
              </Link>
            )}
            {links?.groups.map((g) => (
              <Link
                key={g.group!.slug}
                to="/groups/$slug"
                params={{ slug: g.group!.slug }}
                className="flex items-center gap-3 rounded-lg border border-white/10 p-3 hover:border-electric transition"
              >
                <div>
                  <div className="text-sm font-medium">Represents {g.group!.name}</div>
                  <div className="text-xs text-electric">{g.group!.username ? `@${g.group!.username}` : g.role}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {AGENT_CLASS_MAP[agent.agent_class] && (
        <div className="mt-8 neon-card p-6">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Class rights</h2>
          <p className="text-foreground/90 leading-relaxed">{AGENT_CLASS_MAP[agent.agent_class]!.long}</p>
          <ul className="mt-3 space-y-1">
            {AGENT_CLASS_MAP[agent.agent_class]!.rights.map((r) => (
              <li key={r} className="text-sm text-muted-foreground">· {r}</li>
            ))}
          </ul>
        </div>
      )}

      <AgentConsole
        slug={agent.slug}
        ownerId={agent.owner_id}
        activatedAt={agent.activated_at ?? null}
        protocol={protocol.name}
        agentName={agent.name}
      />

      <AgentEfficiencyPanel agentId={agent.id} />

      <AgentMemoryPanel agentId={agent.id} />

      <AgentActivityFeed agentId={agent.id} />

      <div className="mt-6 neon-card p-6">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Protocol file — {protocol.name}</h2>
        <p className="text-foreground/90 leading-relaxed">{protocol.summary}</p>
        <ul className="mt-3 space-y-1">
          {protocol.clauses.map((c) => (
            <li key={c} className="text-sm text-muted-foreground">· {c}</li>
          ))}
        </ul>
      </div>



      {(agent.values_list ?? []).length > 0 && (
        <div className="mt-8 neon-card p-6">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Values</h2>
          <div className="flex flex-wrap gap-2">
            {agent.values_list!.map((v: string) => <span key={v} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10">{v}</span>)}
          </div>
        </div>
      )}

      {agent.principles && (
        <div className="mt-6 neon-card p-6">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Principles</h2>
          <p className="whitespace-pre-line text-foreground/90 leading-relaxed">{agent.principles}</p>
        </div>
      )}

      {agent.voting_instructions && (
        <div className="mt-6 neon-card p-6">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Instructions on voting</h2>
          <p className="whitespace-pre-line text-foreground/90 leading-relaxed">{agent.voting_instructions}</p>
        </div>
      )}

      {agent.charter && (
        <div className="mt-6 neon-card p-6">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Charter</h2>
          <p className="whitespace-pre-line text-foreground/90 leading-relaxed">{agent.charter}</p>
        </div>
      )}
    </div>
  );
}
