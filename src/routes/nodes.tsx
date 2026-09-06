import { createFileRoute } from "@tanstack/react-router";
import { HexBadge, NodeIcon } from "@/components/civic/icons";
import { Globe2, Users, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/nodes")({
  head: () => ({
    meta: [
      { title: "Nodes — CIVIL.wc.tc" },
      { name: "description", content: "The CIVIC Protocol node directory. Discover active nodes in the federated civic network." },
    ],
  }),
  component: NodesPage,
});

const NODES = [
  {
    name: "CIVIL.wc.tc",
    location: "Global",
    status: "active",
    citizens: 23400,
    proposals: 312,
    consensus: 68,
    role: "Protocol Origin",
    description: "The first active node of the CIVIC Protocol. Hosting proposals, agents, and the full civic stack.",
  },
];

function NodesPage() {
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
        {NODES.map((node) => (
          <div key={node.name} className="neon-card p-6 sm:p-8">
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

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-electric">{node.citizens.toLocaleString()}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Citizens</div>
              </div>
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-violet">{node.proposals.toLocaleString()}</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Proposals</div>
              </div>
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-emerald">{node.consensus}%</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Consensus</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-12 neon-card p-8 text-center max-w-2xl mx-auto">
        <h3 className="font-display text-xl font-semibold">Want to run a node?</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          In the future, any community, organization, or city will be able to spin up their own CIVIC Protocol node and plug into the federated network.
        </p>
        <p className="mt-4 text-xs text-muted-foreground">Node federation tooling is on the roadmap.</p>
      </div>
    </div>
  );
}
