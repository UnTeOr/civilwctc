import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { HexBadge, ProposalIcon } from "@/components/civic/icons";
import { Flame, TrendingUp, Star, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { NodeTag, LOCAL_NODE_NAME } from "@/components/civic/NodeTag";

export const Route = createFileRoute("/proposals/")({
  head: () => ({
    meta: [
      { title: "Actions — CIVIL.wc.tc" },
      { name: "description", content: "Browse live action items — proposals, issues, and priorities citizens are scoring and shaping." },
      { property: "og:title", content: "Live action items on CIVIL.wc.tc" },
      { property: "og:description", content: "Score, deliberate, and decide on real-world action items." },
    ],
  }),
  loader: async ({ context }) => {
    const { listProposals } = await import("@/lib/proposals.functions");
    const { getNetworkDirectory } = await import("@/lib/network.functions");
    const [proposals, network] = await Promise.all([
      context.queryClient.ensureQueryData({
        queryKey: ["proposals", "list"],
        queryFn: () => listProposals(),
      }),
      context.queryClient.ensureQueryData({
        queryKey: ["network", "directory"],
        queryFn: () => getNetworkDirectory(),
      }),
    ]);
    return { proposals, network };
  },
  component: ProposalsPage,
});

const FILTERS = ["All", "Trending", "Local", "National", "Global", "Environment", "Rights"];

const CATEGORY_COLOR: Record<string, string> = {
  Environment: "oklch(0.74 0.20 152)",
  Sustainability: "oklch(0.74 0.20 152)",
  Education: "oklch(0.66 0.22 300)",
  Infrastructure: "oklch(0.78 0.15 215)",
  Community: "oklch(0.85 0.17 90)",
  Rights: "oklch(0.70 0.27 0)",
};

function ProposalsPage() {
  const { proposals, network } = Route.useLoaderData();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState("All");

  const filtered = activeFilter === "All"
    ? proposals
    : activeFilter === "Trending"
    ? proposals.filter((p: any) => (p.latest_snapshot?.[0]?.vote_count ?? 0) > 80)
    : activeFilter === "Local" || activeFilter === "National" || activeFilter === "Global"
    ? proposals.filter((p: any) => p.scope === activeFilter.toLowerCase())
    : proposals.filter((p: any) => p.category === activeFilter);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-violet">Live feed</span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3">Actions</h1>
          <p className="mt-2 text-muted-foreground max-w-2xl">Action items — proposals, issues, and priorities — scored by citizens and their representative agents. Score 0–100. Watch consensus form. Earn contribution points.</p>
        </div>
        {user ? (
          <Link to="/proposals/new" className="h-11 px-5 inline-flex items-center rounded-lg bg-aurora text-white text-sm font-medium glow-electric">
            Submit an action item
          </Link>
        ) : (
          <Link to="/auth" search={{ mode: "signup" as const }} className="h-11 px-5 inline-flex items-center rounded-lg bg-aurora text-white text-sm font-medium">
            Sign in to score
          </Link>
        )}
      </div>

      <div className="mt-8 flex gap-2 flex-wrap">
        {FILTERS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveFilter(t)}
            className={`px-3 py-1.5 text-xs rounded-full border transition ${
              activeFilter === t
                ? "bg-aurora text-white border-transparent"
                : "border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p: any) => {
          const color = CATEGORY_COLOR[p.category] ?? "oklch(0.62 0.26 265)";
          const snapshot = p.latest_snapshot?.[0];
          const feasibility = snapshot ? Math.round(Number(snapshot.mean_score)) : p.feasibility_target ?? 0;
          const votes = snapshot ? Number(snapshot.vote_count) : 0;
          const status = p.featured ? "Hot" : votes > 80 ? "Trending" : "New";
          const statusIcon = status === "Hot" ? <Flame className="h-3 w-3" /> : status === "Trending" ? <TrendingUp className="h-3 w-3" /> : <Star className="h-3 w-3" />;
          const supporters = p.proposal_supporters?.length ?? Math.round(votes * 0.6);

          return (
            <Link
              key={p.id}
              to="/proposals/$slug"
              params={{ slug: p.slug }}
              className="neon-card p-5 group hover:-translate-y-0.5 transition-transform block"
            >
              <div className="flex justify-between items-start">
                <HexBadge color={color}><ProposalIcon color={color} /></HexBadge>
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 rounded-full bg-hotpink/15 text-hotpink">
                  {statusIcon} {status}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold">{p.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{p.summary}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <NodeTag name={LOCAL_NODE_NAME} local />
                {p.public_id && (
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/10">
                    {p.public_id}
                  </span>
                )}
                {(p.tags ?? []).slice(0, 4).map((tg: string) => (
                  <span key={tg} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-electric/10 text-electric border border-electric/20">
                    #{tg}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between">
                <div className="text-xs text-muted-foreground"><span className="text-foreground font-medium">{supporters.toLocaleString()}</span> supporters</div>
                <FeasibilityRing pct={feasibility} color={color} />
              </div>

              <div className="mt-5 flex items-center justify-between pt-4 border-t border-white/5">
                <span className="text-xs text-muted-foreground">Consensus {feasibility}%</span>
                <span className="text-xs text-electric font-medium group-hover:gap-1 inline-flex items-center transition-all gap-0">
                  Open <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          );
        })}

        {activeFilter === "All" && network.actions.map((a: any) => (
          <div key={a.id} className="neon-card p-5 block">
            <div className="flex justify-between items-start">
              <HexBadge color="oklch(0.66 0.22 300)"><ProposalIcon color="oklch(0.66 0.22 300)" /></HexBadge>
              {a.status && (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 rounded-full bg-violet/15 text-violet">
                  {a.status}
                </span>
              )}
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">{a.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{a.summary}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              <NodeTag name={a.node_name} />
              <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/10">{a.id}</span>
            </div>
            <div className="mt-5 flex items-center justify-between">
              <div className="text-xs text-muted-foreground"><span className="text-foreground font-medium">{a.votes.toLocaleString()}</span> votes on the network</div>
              <FeasibilityRing pct={Math.round(a.approval ?? 0)} color="oklch(0.66 0.22 300)" />
            </div>
            <div className="mt-5 pt-4 border-t border-white/5 text-xs text-muted-foreground">
              Mirrored from {a.node_name} — score it on its home node.
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (activeFilter !== "All" || network.actions.length === 0) && (
        <p className="mt-12 text-center text-muted-foreground">No action items match this filter.</p>
      )}
    </div>
  );
}

function FeasibilityRing({ pct, color }: { pct: number; color: string }) {
  const r = 18; const c = 2 * Math.PI * r;
  return (
    <svg width="48" height="48" viewBox="0 0 48 48">
      <circle cx="24" cy="24" r={r} stroke="oklch(1 0 0 / 0.08)" strokeWidth="4" fill="none" />
      <circle cx="24" cy="24" r={r} stroke={color} strokeWidth="4" fill="none"
        strokeDasharray={`${(c * pct) / 100} ${c}`} strokeDashoffset="0"
        strokeLinecap="round" transform="rotate(-90 24 24)" />
      <text x="24" y="27" textAnchor="middle" fontSize="10" fontWeight="700" fill={color}>{pct}%</text>
    </svg>
  );
}
