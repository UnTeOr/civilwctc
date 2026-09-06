import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listModerationQueue } from "@/lib/proposals.functions";
import { moderateProposal, listAuditLog } from "@/lib/moderation.functions";
import { Shield, Users, FileText, Activity, ArrowRight, Server, Check, X, Star } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Coordinator Dashboard — CIVIL.quest" },
      { name: "description", content: "Node operations, moderation, and analytics." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const queryClient = useQueryClient();
  const queueFn = useServerFn(listModerationQueue);
  const auditFn = useServerFn(listAuditLog);
  const modFn = useServerFn(moderateProposal);

  const { data } = useSuspenseQuery({ queryKey: ["mod-queue"], queryFn: () => queueFn() });
  const audit = useSuspenseQuery({
    queryKey: ["audit-log"],
    queryFn: async () => { try { return await auditFn(); } catch { return []; } },
  });

  const mutate = useMutation({
    mutationFn: (input: { proposal_id: string; action: "approve" | "reject" | "feature" | "unfeature" }) =>
      modFn({ data: input }),
    onSuccess: () => {
      toast.success("Action recorded");
      queryClient.invalidateQueries({ queryKey: ["mod-queue"] });
      queryClient.invalidateQueries({ queryKey: ["audit-log"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-6 w-6 text-violet" />
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-violet">Coordinator</span>
          <h1 className="font-display text-3xl sm:text-4xl font-bold">Node Operations</h1>
        </div>
        {!data.isAdmin && (
          <span className="ml-auto text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-white/10 text-muted-foreground">
            Read-only · request admin/moderator role
          </span>
        )}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard icon={<Users className="h-5 w-5" />} label="Citizens" value={data.stats.citizens.toLocaleString()} color="oklch(0.62 0.26 265)" />
        <StatCard icon={<FileText className="h-5 w-5" />} label="Proposals" value={String(data.proposals.length)} color="oklch(0.66 0.22 300)" />
        <StatCard icon={<Activity className="h-5 w-5" />} label="Votes" value={data.stats.votes.toLocaleString()} color="oklch(0.74 0.20 152)" />
        <StatCard icon={<Server className="h-5 w-5" />} label="Node status" value="Healthy" color="oklch(0.85 0.17 90)" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 neon-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-semibold">Moderation queue</h2>
            <Link to="/proposals" className="text-xs text-electric inline-flex items-center gap-1">All <ArrowRight className="h-3 w-3" /></Link>
          </div>
          {data.proposals.length === 0 && <p className="text-sm text-muted-foreground">No proposals yet.</p>}
          <div className="divide-y divide-white/5">
            {data.proposals.map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-3 py-3">
                <Link to="/proposals/$slug" params={{ slug: p.slug }} className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate hover:text-electric">{p.title}</div>
                  <div className="text-xs text-muted-foreground">{p.author_name ?? "anon"} · {new Date(p.created_at).toLocaleDateString()} · {p.status}</div>
                </Link>
                {data.isAdmin && (
                  <div className="flex gap-1">
                    <ModBtn title="Approve" onClick={() => mutate.mutate({ proposal_id: p.id, action: "approve" })}><Check className="h-3 w-3" /></ModBtn>
                    <ModBtn title="Reject" onClick={() => mutate.mutate({ proposal_id: p.id, action: "reject" })}><X className="h-3 w-3" /></ModBtn>
                    <ModBtn title="Feature" onClick={() => mutate.mutate({ proposal_id: p.id, action: "feature" })}><Star className="h-3 w-3" /></ModBtn>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="neon-card p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Audit log</h2>
          {audit.data.length === 0 ? (
            <p className="text-sm text-muted-foreground">No admin actions logged yet.</p>
          ) : (
            <ul className="space-y-3 text-sm max-h-96 overflow-y-auto">
              {audit.data.map((row: any) => (
                <li key={row.id} className="text-muted-foreground">
                  <span className="text-foreground">{row.action}</span>
                  <span className="block text-xs">{row.target_kind}:{row.target_id?.slice(0, 8)} · {new Date(row.created_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          )}
          <Link to="/nodes" className="mt-6 inline-flex items-center gap-1 text-xs text-electric">Node directory <ArrowRight className="h-3 w-3" /></Link>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  return (
    <div className="neon-card p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider" style={{ color }}>{icon}{label}</div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
    </div>
  );
}

function ModBtn({ children, title, onClick }: { children: React.ReactNode; title: string; onClick: () => void }) {
  return (
    <button title={title} onClick={onClick} className="h-7 w-7 inline-flex items-center justify-center rounded border border-white/10 hover:bg-white/5">
      {children}
    </button>
  );
}
