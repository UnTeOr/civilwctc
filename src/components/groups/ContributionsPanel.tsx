import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Link } from "@tanstack/react-router";
import { BookOpen, Plus, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { listContributions, addContribution, deleteContribution } from "@/lib/constituents.functions";
import { useAuth } from "@/hooks/use-auth";

const KINDS = [
  { v: "research", label: "Research" },
  { v: "value", label: "Value" },
  { v: "need", label: "Need" },
  { v: "voting", label: "Voting guidance" },
] as const;

export function ContributionsPanel({ groupId, isOwner }: { groupId: string; isOwner: boolean }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const listFn = useServerFn(listContributions);
  const addFn = useServerFn(addContribution);
  const delFn = useServerFn(deleteContribution);

  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState<(typeof KINDS)[number]["v"]>("research");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("");

  const { data: rows = [] } = useQuery({
    queryKey: ["contributions", groupId],
    queryFn: () => listFn({ data: { group_id: groupId } }),
  });

  const add = useMutation({
    mutationFn: () => addFn({ data: { group_id: groupId, kind, title, body: body || undefined, url: url || undefined } }),
    onSuccess: () => {
      toast.success("Contribution added");
      setTitle(""); setBody(""); setUrl(""); setOpen(false);
      qc.invalidateQueries({ queryKey: ["contributions", groupId] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  const remove = useMutation({
    mutationFn: (id: string) => delFn({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contributions", groupId] }),
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <div className="mt-10 neon-card p-6">
      <div className="flex items-center justify-between gap-3 mb-1">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-emerald" />
          <h2 className="font-display text-xl font-semibold">Constituent research & values</h2>
        </div>
        {user ? (
          <button onClick={() => setOpen(!open)} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-white/10 text-sm hover:bg-white/5">
            <Plus className="h-4 w-4" /> Contribute
          </button>
        ) : (
          <Link to="/auth" search={{ mode: "signin" }} className="text-sm text-electric">Sign in to contribute</Link>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Anything posted here informs how this TONDO's representative agent votes and what it says on the constituency's behalf.
      </p>

      {open && (
        <form
          onSubmit={(e) => { e.preventDefault(); add.mutate(); }}
          className="mt-5 space-y-3 border border-white/10 rounded-lg p-4 bg-white/[0.02]"
        >
          <div className="flex flex-wrap gap-2">
            {KINDS.map((k) => (
              <button
                key={k.v}
                type="button"
                onClick={() => setKind(k.v)}
                className={`h-8 px-3 rounded-full text-xs border transition ${
                  kind === k.v ? "border-electric/60 bg-electric/10 text-foreground" : "border-white/10 text-muted-foreground hover:bg-white/5"
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
          <input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title"
            className="w-full h-10 px-3 rounded-md bg-background border border-white/10 focus:border-electric outline-none text-sm" />
          <textarea rows={4} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Details, evidence, or guidance…"
            className="w-full p-3 rounded-md bg-background border border-white/10 focus:border-electric outline-none text-sm" />
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Source link (optional)"
            className="w-full h-10 px-3 rounded-md bg-background border border-white/10 focus:border-electric outline-none text-sm" />
          <button disabled={add.isPending} className="h-10 px-4 rounded-lg bg-aurora text-white text-sm font-medium disabled:opacity-60">
            {add.isPending ? "Posting…" : "Post contribution"}
          </button>
        </form>
      )}

      {rows.length === 0 ? (
        <p className="mt-5 text-sm text-muted-foreground">No contributions yet. Be the first to define what this constituency needs.</p>
      ) : (
        <ul className="mt-5 space-y-3">
          {rows.map((c: any) => (
            <li key={c.id} className="border-b border-white/5 pb-3 last:border-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                      {KINDS.find((k) => k.v === c.kind)?.label ?? c.kind}
                    </span>
                    <span className="font-medium text-sm">{c.title}</span>
                  </div>
                  {c.body && <p className="mt-1.5 text-sm text-muted-foreground whitespace-pre-wrap">{c.body}</p>}
                  {c.url && (
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-electric">
                      Source <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                {(isOwner || user?.id === c.user_id) && (
                  <button onClick={() => remove.mutate(c.id)} className="text-muted-foreground hover:text-destructive shrink-0" aria-label="Delete contribution">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
