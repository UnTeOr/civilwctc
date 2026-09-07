import { createFileRoute, Link } from "@tanstack/react-router";
import { getNetworkIdentity } from "@/lib/network.functions";
import { NodeTag } from "@/components/civic/NodeTag";
import { ArrowLeft, ExternalLink, Users } from "lucide-react";
import { HexBadge, AgentIcon } from "@/components/civic/icons";

export const Route = createFileRoute("/network/identity/$did")({
  head: ({ params }) => ({
    meta: [
      { title: `Network profile — CIVIL.wc.tc` },
      { name: "description", content: `Mirrored CIVIC Protocol profile ${decodeURIComponent(params.did)} shown on CIVIL.wc.tc.` },
      { property: "og:title", content: "Network profile — CIVIL.wc.tc" },
      { property: "og:description", content: "A profile mirrored from another node of the CIVIC Protocol." },
    ],
  }),
  loader: ({ params }) => getNetworkIdentity({ data: { did: decodeURIComponent(params.did) } }),
  component: NetworkIdentityPage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center">
      <p className="text-muted-foreground">{error.message}</p>
      <Link to="/nodes" className="mt-4 inline-block text-electric">← The network</Link>
    </div>
  ),
  notFoundComponent: () => <div className="p-10 text-center">Network profile not found.</div>,
});

function NetworkIdentityPage() {
  const { identity, node } = Route.useLoaderData() as unknown as {
    identity: any;
    node: { slug: string; name: string | null; url: string | null } | null;
  };
  const violet = "oklch(0.66 0.22 300)";
  const isOrg = identity.type === "organization";
  const backTo = isOrg ? "/groups" : identity.type === "agent" ? "/agents" : "/nodes";

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 lg:py-16">
      <Link to={backTo} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <div className="flex items-start gap-6 flex-wrap">
        <HexBadge color={violet}>
          {isOrg ? <Users className="h-6 w-6" style={{ color: violet }} /> : <AgentIcon color={violet} />}
        </HexBadge>
        <div className="flex-1 min-w-[200px]">
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground capitalize">{identity.type ?? "identity"}</span>
          <h1 className="font-display text-4xl font-bold mt-2">{identity.display_name ?? identity.username ?? "Network profile"}</h1>
          {identity.username && <p className="text-electric mt-1">@{identity.username}</p>}
          <div className="mt-3"><NodeTag name={node?.name ?? identity.home_node ?? "Network"} /></div>
        </div>
      </div>

      <div className="mt-8 neon-card p-6 space-y-3">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground">Protocol identity</h2>
        <p className="text-sm break-all font-mono text-foreground/90">{identity.did}</p>
        <p className="text-sm text-muted-foreground">
          Home node: <span className="text-foreground">{node?.name ?? identity.home_node ?? "unknown"}</span>
        </p>
        {Array.isArray(identity.also_on) && identity.also_on.length > 0 && (
          <p className="text-sm text-muted-foreground">
            Also active on: <span className="text-foreground">{identity.also_on.join(", ")}</span>
          </p>
        )}
        {identity.synced_at && (
          <p className="text-xs text-muted-foreground">Mirrored here {new Date(identity.synced_at).toLocaleString()}</p>
        )}
      </div>

      <div className="mt-6 neon-card p-6">
        <p className="text-sm text-muted-foreground">
          This profile lives on another node of the CIVIC Protocol. CIVIL.wc.tc shows it read-only — activity, scoring, and edits happen on its home node.
        </p>
        {node?.url && (
          <a href={node.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-electric">
            Open {node.name ?? node.slug} <ExternalLink className="h-3 w-3" />
          </a>
        )}
      </div>
    </div>
  );
}
