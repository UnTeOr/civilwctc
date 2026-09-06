import { createFileRoute, Link } from "@tanstack/react-router";
import { getPublicProfile } from "@/lib/profiles.functions";
import { HexBadge, AgentIcon } from "@/components/civic/icons";
import { CLASS_COLOR, AGENT_CLASS_MAP } from "@/lib/agent-classes";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/u/$username")({
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username} — CIVIL.quest` },
      { name: "description", content: `Public civic profile and linked representative agents for @${params.username}.` },
      { property: "og:title", content: `@${params.username} — CIVIL.quest` },
      { property: "og:description", content: `Public civic profile and linked representative agents for @${params.username}.` },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ params }) => getPublicProfile({ data: { username: params.username } }),
  component: PublicProfile,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center">
      <p className="text-muted-foreground">{error.message}</p>
      <Link to="/agents" className="mt-4 inline-block text-electric">← Agents</Link>
    </div>
  ),
});

function PublicProfile() {
  const { profile, agents } = Route.useLoaderData() as {
    profile: any;
    agents: Array<{ id: string; slug: string; name: string; username: string; avatar_url: string | null; agent_class: string; agent_type: string }>;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 lg:py-16">
      <Link to="/agents" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Agents
      </Link>

      <div className="flex items-start gap-6 flex-wrap">
        <div className="h-24 w-24 rounded-full overflow-hidden bg-aurora inline-flex items-center justify-center text-white font-display text-3xl font-bold border border-white/15">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={`${profile.display_name ?? profile.username} profile picture`} className="w-full h-full object-cover" />
          ) : (
            (profile.display_name || profile.username || "C").slice(0, 1).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-[200px]">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground capitalize">{profile.account_type}</span>
          <h1 className="font-display text-4xl font-bold mt-2">{profile.display_name || profile.username}</h1>
          <p className="text-electric mt-1">@{profile.username}</p>
          {profile.bio && <p className="mt-3 text-foreground/90 leading-relaxed max-w-xl">{profile.bio}</p>}
          {(profile.city || profile.country) && (
            <p className="mt-2 text-xs text-muted-foreground">{[profile.city, profile.country].filter(Boolean).join(", ")}</p>
          )}
        </div>
        <div className="text-right">
          <div className="font-display text-4xl font-bold text-violet">{profile.reputation}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Reputation</div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Stat label="Civic Points" value={profile.civic_points} />
        <Stat label="XP" value={profile.xp} />
        <Stat label="Level" value={profile.level} />
        <Stat label="Streak (days)" value={profile.streak_days} />
      </div>

      {(profile.values_list?.length ?? 0) > 0 && (
        <div className="mt-8 neon-card p-6">
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Values</h2>
          <div className="flex flex-wrap gap-2">
            {profile.values_list?.map((v: string) => (
              <span key={v} className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10">{v}</span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Linked agent profiles</h2>
        {agents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No agents linked to this profile yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((a) => {
              const color = CLASS_COLOR[a.agent_class] ?? "oklch(0.62 0.26 265)";
              return (
                <Link key={a.id} to="/agents/$slug" params={{ slug: a.slug }} className="neon-card p-5 text-center hover:border-electric transition">
                  <div className="flex justify-center">
                    {a.avatar_url ? (
                      <img src={a.avatar_url} alt={`${a.name} agent portrait`} className="h-14 w-14 rounded-full object-cover border border-white/10" />
                    ) : (
                      <HexBadge color={color}><AgentIcon color={color} /></HexBadge>
                    )}
                  </div>
                  <h3 className="mt-3 font-display text-lg font-semibold">{a.name}</h3>
                  <p className="text-xs text-electric">@{a.username}</p>
                  <p className="text-xs text-muted-foreground mt-1 capitalize">
                    {a.agent_type} · Class {a.agent_class} {AGENT_CLASS_MAP[a.agent_class]?.label ?? ""}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="neon-card p-4">
      <div className="font-display text-2xl font-bold">{value?.toLocaleString?.() ?? value}</div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
