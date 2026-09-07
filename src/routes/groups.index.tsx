import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listGroups } from "@/lib/groups.functions";
import { getNetworkDirectory } from "@/lib/network.functions";
import { NodeTag, LOCAL_NODE_NAME } from "@/components/civic/NodeTag";
import { Users } from "lucide-react";

export const Route = createFileRoute("/groups/")({
  head: () => ({
    meta: [
      { title: "Constituents — CIVIL.wc.tc" },
      { name: "description", content: "Constituent groups, advocacy coalitions, and the representative agents that speak for them." },
      { property: "og:title", content: "Constituents" },
      { property: "og:description", content: "Find or create a constituent group with its own library and representative agents." },
    ],
  }),
  component: GroupsPage,
  errorComponent: ({ error }) => <div className="p-10 text-center text-muted-foreground">{error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Not found</div>,
});

function GroupsPage() {
  const fn = useServerFn(listGroups);
  const netFn = useServerFn(getNetworkDirectory);
  const { data } = useSuspenseQuery({ queryKey: ["groups"], queryFn: () => fn() });
  const { data: network } = useSuspenseQuery({ queryKey: ["network", "directory"], queryFn: () => netFn() });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-emerald">Constituents</span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3">Constituent groups & coalitions.</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Every constituent group is a TONDO — an open representative body with its own @username, library, focus areas, and one or more representative agents that advocate for its mission across proposals.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/constituents/catalog" className="h-11 px-5 inline-flex items-center rounded-lg border border-white/10 text-sm font-medium hover:bg-white/5">Browse catalog</Link>
          <Link to="/groups/new" className="h-11 px-5 inline-flex items-center rounded-lg bg-aurora text-white text-sm font-medium">Create constituent group</Link>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="mt-12 neon-card p-10 text-center text-muted-foreground">
          No constituent groups yet. <Link to="/groups/new" className="text-electric">Start the first coalition →</Link>
        </div>
      ) : (
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((g) => (
            <Link key={g.id} to="/groups/$slug" params={{ slug: g.slug }} className="neon-card p-6 hover:border-electric transition">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-emerald" />
                <div>
                  <h3 className="font-display text-xl font-semibold">{g.name}</h3>
                  {g.username && <div className="text-xs text-electric">@{g.username}</div>}
                </div>
              </div>
              {g.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{g.description}</p>}
              {(g.focus_areas ?? []).length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {g.focus_areas!.slice(0, 4).map((f) => (
                    <span key={f} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10">{f}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
