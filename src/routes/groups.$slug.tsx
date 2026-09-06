import { createFileRoute, Link } from "@tanstack/react-router";
import { getGroup } from "@/lib/groups.functions";
import { ArrowLeft, ExternalLink, Users, MessageSquare } from "lucide-react";
import { HexBadge, AgentIcon } from "@/components/civic/icons";
import { useAuth } from "@/hooks/use-auth";
import { LinkAgentsPanel } from "@/components/groups/LinkAgentsPanel";
import { JoinTondoButton } from "@/components/groups/JoinTondoButton";
import { ContributionsPanel } from "@/components/groups/ContributionsPanel";
import { AgentActivityFeed } from "@/components/civic/AgentActivityFeed";

export const Route = createFileRoute("/groups/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Group — ${params.slug} | CIVIL.quest` },
      { name: "description", content: "Group profile, library, and representative agents." },
    ],
  }),
  loader: ({ params }) => getGroup({ data: { slug: params.slug } }).then((group) => ({ group })),
  component: GroupDetail,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center">
      <p className="text-muted-foreground">{error.message}</p>
      <Link to="/groups" className="mt-4 inline-block text-electric">← All groups</Link>
    </div>
  ),
  notFoundComponent: () => <div className="p-10 text-center">Group not found.</div>,
});

function GroupDetail() {
  const { group } = Route.useLoaderData() as { group: any };
  const { user } = useAuth();
  const isOwner = user?.id === group.owner_id;
  const library = Array.isArray(group.library) ? group.library : [];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 lg:py-16">
      <Link to="/groups" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> All groups
      </Link>

      <div className="flex items-center gap-3">
        <Users className="h-6 w-6 text-emerald" />
        <h1 className="font-display text-4xl font-bold">{group.name}</h1>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {group.username && <span className="text-sm text-electric">@{group.username}</span>}
        {group.is_tondo && <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-violet/15 text-violet border border-violet/30">TONDO</span>}
        {group.master_category && (
          <span className="text-xs text-muted-foreground">{group.master_category}{group.group_type ? ` · ${group.group_type}` : ""}</span>
        )}
      </div>
      <div className="mt-4">
        <JoinTondoButton groupId={group.id} memberCount={group.member_count ?? 0} />
      </div>
      {group.description && <p className="mt-4 text-lg text-muted-foreground max-w-3xl">{group.description}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {(group.focus_areas ?? []).map((f: string) => (
          <span key={f} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10">{f}</span>
        ))}
        {group.website && (
          <a href={group.website} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1 inline-flex items-center gap-1 rounded-full bg-electric/10 text-electric">
            Website <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>

      <div className="mt-10 grid lg:grid-cols-2 gap-6">
        <div className="neon-card p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Representative agents</h2>
          {group.agents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No agents linked yet.</p>
          ) : (
            <ul className="space-y-3">
              {group.agents.map((link: any) => {
                const a = link.agents;
                if (!a) return null;
                return (
                  <li key={a.id}>
                    <Link to="/agents/$slug" params={{ slug: a.slug }} className="flex items-center gap-3 p-2 -mx-2 rounded hover:bg-white/5">
                      <HexBadge color="oklch(0.85 0.17 90)"><AgentIcon color="oklch(0.85 0.17 90)" /></HexBadge>
                      <div>
                        <div className="font-medium">{a.name}</div>
                        <div className="text-xs text-muted-foreground capitalize">Class {a.agent_class} · {a.agent_type} · {link.role}</div>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
          {isOwner && (
            <LinkAgentsPanel
              groupId={group.id}
              linkedIds={group.agents.map((l: any) => l.agent_id).filter(Boolean)}
            />
          )}
        </div>

        <div className="neon-card p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Library</h2>
          {library.length === 0 ? (
            <p className="text-sm text-muted-foreground">No library items yet. Add research, position papers, and references the group's agents should reference.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {library.map((item: any, i: number) => (
                <li key={i} className="border-b border-white/5 pb-2 last:border-0">
                  <div className="font-medium">{item.title ?? "Untitled"}</div>
                  {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-xs text-electric">{item.url}</a>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <AgentActivityFeed groupId={group.id} />

      <ContributionsPanel groupId={group.id} isOwner={isOwner} />

      <div className="mt-10 neon-card p-6">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="h-5 w-5 text-violet" />
          <h2 className="font-display text-xl font-semibold">Coalition chat</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-3">Chat rooms for this group are hosted on the PEP.COALITION network.</p>
        <a href={`https://pep.coalition.community/g/${group.slug}`} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-1 h-9 px-4 rounded-md bg-violet/20 text-violet text-sm border border-violet/40">
          Open chat room <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
