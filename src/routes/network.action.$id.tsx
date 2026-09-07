import { createFileRoute, Link } from "@tanstack/react-router";
import { getNetworkAction } from "@/lib/network.functions";
import { NodeTag } from "@/components/civic/NodeTag";
import { HexBadge, ProposalIcon } from "@/components/civic/icons";
import { ArrowLeft, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/network/action/$id")({
  head: ({ params }) => ({
    meta: [
      { title: `Network action ${params.id} — CIVIL.wc.tc` },
      { name: "description", content: "An action item mirrored from another node of the CIVIC Protocol, with network-wide results." },
      { property: "og:title", content: "Network action — CIVIL.wc.tc" },
      { property: "og:description", content: "Mirrored action item with network-wide approval across nodes." },
    ],
  }),
  loader: ({ params }) => getNetworkAction({ data: { id: decodeURIComponent(params.id) } }),
  component: NetworkActionPage,
  errorComponent: ({ error }) => (
    <div className="p-10 text-center">
      <p className="text-muted-foreground">{error.message}</p>
      <Link to="/proposals" className="mt-4 inline-block text-electric">← All actions</Link>
    </div>
  ),
  notFoundComponent: () => <div className="p-10 text-center">Action not found.</div>,
});

function NetworkActionPage() {
  const { action, node, totals } = Route.useLoaderData();
  const violet = "oklch(0.66 0.22 300)";
  const votes = totals.reduce((s, t) => s + (t.votes_for ?? 0) + (t.votes_against ?? 0), 0);
  const approval = totals.find((t) => t.approval != null)?.approval ?? null;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 lg:py-16">
      <Link to="/proposals" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> All actions
      </Link>

      <div className="flex items-start gap-5 flex-wrap">
        <HexBadge color={violet}><ProposalIcon color={violet} /></HexBadge>
        <div className="flex-1 min-w-[200px]">
          <div className="flex flex-wrap items-center gap-2">
            <NodeTag name={node?.name ?? action.origin_node} />
            {action.status && (
              <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-full bg-violet/15 text-violet">{action.status}</span>
            )}
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/5 text-muted-foreground border border-white/10">{action.id}</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold mt-3">{action.title}</h1>
          {action.summary && <p className="mt-3 text-foreground/90 leading-relaxed">{action.summary}</p>}
          {action.closes_at && (
            <p className="mt-2 text-xs text-muted-foreground">Closes {new Date(action.closes_at).toLocaleString()}</p>
          )}
        </div>
      </div>

      <div className="mt-8 neon-card p-6">
        <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-4">Network-wide result</h2>
        <div className="flex items-baseline gap-6">
          <div>
            <div className="font-display text-4xl font-bold" style={{ color: violet }}>
              {approval != null ? `${Math.round(Number(approval))}%` : "—"}
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Approval</div>
          </div>
          <div>
            <div className="font-display text-4xl font-bold">{votes.toLocaleString()}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Votes across nodes</div>
          </div>
        </div>

        {totals.length > 0 && (
          <div className="mt-6 space-y-2">
            {totals.map((t) => (
              <div key={t.node_slug} className="flex items-center justify-between rounded-lg border border-white/10 p-3 text-sm">
                <NodeTag name={t.node_name} />
                <span className="text-muted-foreground">
                  <span className="text-foreground">{t.votes_for ?? 0}</span> for ·{" "}
                  <span className="text-foreground">{t.votes_against ?? 0}</span> against
                  {t.approval != null && <> · {Math.round(Number(t.approval))}%</>}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 neon-card p-6">
        <p className="text-sm text-muted-foreground">
          Mirrored from {node?.name ?? action.origin_node}. Scoring happens on its home node; results flow back here through the protocol.
        </p>
        {node?.url && (
          <a href={node.url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1 text-sm text-electric">
            Score it on {node.name ?? node.slug} <ExternalLink className="h-3 w-3" />
          </a>
        )}
        {action.synced_at && (
          <p className="mt-3 text-xs text-muted-foreground">Last synced {new Date(action.synced_at).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}
