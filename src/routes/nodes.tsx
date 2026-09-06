import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { HexBadge, NodeIcon } from "@/components/civic/icons";
import { Globe2, Users, CheckCircle, RefreshCw } from "lucide-react";
import { getNetworkOverview } from "@/lib/network.functions";

export const Route = createFileRoute("/nodes")({
  head: () => ({
    meta: [
      { title: "Nodes — CIVIL.wc.tc" },
      { name: "description", content: "The CIVIC Protocol node directory. Discover active nodes in the federated civic network." },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(networkQueryOptions),
  component: NodesPage,
});

const networkQueryOptions = queryOptions({
  queryKey: ["network-overview"],
  queryFn: () => getNetworkOverview(),
});

const REGISTERED_NODES = [
  {
    slug: "civilquest",
    name: "CIVIL.quest",
    url: "https://civil.quest",
    location: "Global",
    role: "Protocol Origin · Node 1",
    description: "The first node of the CIVIC Protocol, where the network began.",
    isThisNode: false,
  },
  {
    slug: "civilwctc",
    name: "CIVIL.wc.tc",
    url: "https://civil.wc.tc",
    location: "Global",
    role: "Node 2 · This node",
    description: "The second node of the CIVIC Protocol, run by WC.TC — the World Collaborative for Transformative Community, a 501(c)(3) non-profit.",
    isThisNode: true,
  },
];

function NodesPage() {
  const { data: network } = useSuspenseQuery(networkQueryOptions);

  const networkApproval = (actionId: string) => {
    const rows = network.totals.filter((t) => t.action_id === actionId);
    if (!rows.length) return null;
    const forSum = rows.reduce((a, r) => a + (r.votes_for ?? 0), 0);
    const againstSum = rows.reduce((a, r) => a + (r.votes_against ?? 0), 0);
    const total = forSum + againstSum;
    if (!total) return null;
    return Math.round((forSum / total) * 100);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-[0.2em] text-violet">CIVIC Protocol</span>
        <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3">Node Directory</h1>
        <p className="mt-3 text-muted-foreground">
          The CIVIC Protocol is a federated network of independent civic nodes. Each node governs its own domain while sharing consensus and trust across the network.
        </p>
      </div>

      <div className="mt-10 grid gap-5 max-w-3xl mx-auto">
        {REGISTERED_NODES.map((node) => (
          <div key={node.slug} className={node.isThisNode ? "neon-card p-6 sm:p-8 ring-1 ring-electric/40" : "neon-card p-6 sm:p-8"}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <HexBadge color="oklch(0.62 0.26 265)"><NodeIcon /></HexBadge>
                <div>
                  <h2 className="font-display text-xl font-semibold">{node.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <Globe2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{node.location}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald/15 text-emerald">
                      <CheckCircle className="h-3 w-3" /> Active
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-xs uppercase tracking-wider px-2 py-1 rounded-full bg-violet/15 text-violet border border-violet/30">
                {node.role}
              </span>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{node.description}</p>
          </div>
        ))}
      </div>

      {/* Live network mirror — data published by other nodes */}
      <div className="mt-16 max-w-3xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">Live from the network</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Actions published by other nodes, mirrored here read-only via the protocol.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            <span>{network.identityCount.toLocaleString()} network identities</span>
          </div>
        </div>

        {network.actions.length === 0 ? (
          <div className="mt-6 neon-card p-8 text-center text-sm text-muted-foreground">
            <RefreshCw className="h-5 w-5 mx-auto mb-3 opacity-60" />
            No mirrored actions yet. They will appear here as soon as other nodes publish to the protocol.
          </div>
        ) : (
          <div className="mt-6 grid gap-3">
            {network.actions.map((a) => {
              const approval = networkApproval(a.id);
              return (
                <div key={a.id} className="neon-card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display font-semibold">{a.title}</h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan/15 text-cyan">
                      via {a.origin_node}
                    </span>
                  </div>
                  {a.summary && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.summary}</p>}
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="font-mono">{a.id}</span>
                    {a.status && <span className="capitalize">{a.status}</span>}
                    {approval !== null && <span className="text-emerald">{approval}% network approval</span>}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {network.sync?.last_synced_at && (
          <p className="mt-4 text-center text-xs text-muted-foreground">
            Last synced {new Date(network.sync.last_synced_at).toLocaleString()}
          </p>
        )}
      </div>

      <div className="mt-12 neon-card p-8 text-center max-w-2xl mx-auto">
        <h3 className="font-display text-xl font-semibold">Want to run a node?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Any community, organization, or city can spin up their own CIVIC Protocol node and plug into the federated network.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">Ask the protocol maintainer for the Node Integration Guide and a node key.</p>
      </div>
    </div>
  );
}
