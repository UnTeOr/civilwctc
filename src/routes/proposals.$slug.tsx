import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getProposal, submitVote, submitPrimaryVote, getPrimaryTally, getMyVotes, listPrimaryVotes } from "@/lib/proposals.functions";
import { appendRecord } from "@/lib/records.functions";
import { useAuth } from "@/hooks/use-auth";
import { useSolanaWallet } from "@/hooks/use-solana-wallet";
import { ConsensusIcon } from "@/components/civic/icons";
import { ArrowLeft, Flame, TrendingUp, Star, Share2, Heart, ShieldCheck, Copy, Wallet } from "lucide-react";
import { toast } from "sonner";
import { sha256Hex, shortHash } from "@/lib/hash";
import { AgentVotePanel } from "@/components/civic/AgentVotePanel";

export const Route = createFileRoute("/proposals/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `Proposal — ${params.slug} | CIVIL.wc.tc` },
      { name: "description", content: "View and score this civic proposal on CIVIL.wc.tc" },
    ],
  }),
  loader: async ({ params }) => {
    const proposal = await getProposal({ data: { slug: params.slug } });
    return { proposal };
  },
  component: ProposalDetailPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-4xl px-4 py-20 text-center">
      <h1 className="font-display text-3xl font-bold">Proposal not found</h1>
      <p className="mt-2 text-muted-foreground">{error.message}</p>
      <Link to="/proposals" className="mt-6 inline-block text-electric">← Back to proposals</Link>
    </div>
  ),
});

function ProposalDetailPage() {
  const { proposal } = Route.useLoaderData() as { proposal: any };
  const { user } = useAuth();
  const wallet = useSolanaWallet();
  const queryClient = useQueryClient();
  const appendFn = useServerFn(appendRecord);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [contentHash, setContentHash] = useState<string>("");

  useEffect(() => {
    const payload = JSON.stringify({
      slug: proposal.slug, title: proposal.title, summary: proposal.summary,
      description: proposal.description ?? "", category: proposal.category, scope: proposal.scope,
      published_at: proposal.published_at,
    });
    sha256Hex(payload).then(setContentHash);
  }, [proposal]);

  const tallyFn = useServerFn(getPrimaryTally);
  const myVotesFn = useServerFn(getMyVotes);
  const [overall, setOverall] = useState<number>(50);
  const [reason, setReason] = useState("");
  const [showSubs, setShowSubs] = useState(false);
  const [showVotes, setShowVotes] = useState(false);
  const votesFn = useServerFn(listPrimaryVotes);

  const votesList = useQuery({
    queryKey: ["primary-votes", proposal.id],
    enabled: showVotes,
    queryFn: () => votesFn({ data: { proposal_id: proposal.id } }),
  });

  const tally = useQuery({
    queryKey: ["primary-tally", proposal.id],
    queryFn: () => tallyFn({ data: { proposal_id: proposal.id } }),
  });

  const mine = useQuery({
    queryKey: ["my-votes", proposal.id, user?.id],
    enabled: !!user,
    queryFn: () => myVotesFn({ data: { proposal_id: proposal.id } }),
  });

  useEffect(() => {
    if (mine.data?.primary) {
      setOverall(mine.data.primary.score);
      setReason(mine.data.primary.comment ?? "");
    }
    if (mine.data?.subs) setScores((s) => ({ ...mine.data!.subs, ...s }));
  }, [mine.data]);

  const primaryMutation = useMutation({
    mutationFn: async () => submitPrimaryVote({ data: { proposal_id: proposal.id, score: overall, comment: reason || undefined } }),
    onSuccess: () => {
      toast.success("Your vote is recorded. +10 CP");
      tally.refetch();
      queryClient.invalidateQueries({ queryKey: ["my-votes", proposal.id] });
      queryClient.invalidateQueries({ queryKey: ["primary-votes", proposal.id] });
    },
    onError: (err: any) => toast.error(err?.message || "Could not record your vote"),
  });

  const voteMutation = useMutation({
    mutationFn: async ({ issue_id, score }: { issue_id: string; score: number }) => {
      return submitVote({ data: { issue_id, score } });
    },
    onSuccess: () => {
      toast.success("Sub-vote recorded. +5 CP");
      queryClient.invalidateQueries({ queryKey: ["proposal", proposal.slug] });
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to submit vote");
    },
  });


  const sealMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in first");
      let wallet_address: string | undefined;
      let signature: string | undefined;
      if (wallet.connected && wallet.publicKey) {
        wallet_address = wallet.publicKey;
        const msg = new TextEncoder().encode(`CIVIL.wc.tc seal:${contentHash}`);
        const sig = await wallet.signMessage(msg);
        if (sig) signature = Array.from(sig).map((b) => b.toString(16).padStart(2, "0")).join("");
      }
      return appendFn({ data: { kind: "proposal_seal", ref_id: proposal.id, payload: { slug: proposal.slug, title: proposal.title, hash: contentHash }, wallet_address, signature } });
    },
    onSuccess: () => toast.success("Sealed to record chain"),
    onError: (e: any) => toast.error(e?.message ?? "Failed to seal"),
  });

  const statusColor: Record<string, string> = {
    open: "oklch(0.74 0.20 152)",
    deliberating: "oklch(0.85 0.17 90)",
    consensus: "oklch(0.62 0.26 265)",
    closed: "oklch(0.72 0.03 260)",
    archived: "oklch(0.72 0.03 260)",
  };

  const scopeIcon = {
    local: <Flame className="h-3 w-3" />,
    national: <TrendingUp className="h-3 w-3" />,
    global: <Star className="h-3 w-3" />,
  };

  const latestSnapshot = (proposal.snapshots as any)?.[0] ?? null;

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 lg:py-16">
      <Link to="/proposals" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> All proposals
      </Link>

      <div className="flex flex-wrap items-start gap-3 mb-4">
        <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 rounded-full bg-white/5 text-muted-foreground border border-white/10">
          {scopeIcon[proposal.scope as keyof typeof scopeIcon]} {proposal.scope}
        </span>
        <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-full" style={{ background: `${statusColor[proposal.status]}22`, color: statusColor[proposal.status] }}>
          {proposal.status}
        </span>
        <span className="text-[10px] uppercase font-bold px-2 py-1 rounded-full bg-white/5 text-muted-foreground border border-white/10">
          {proposal.category}
        </span>
      </div>

      <h1 className="font-display text-3xl sm:text-5xl font-bold leading-tight">{proposal.title}</h1>
      <p className="mt-4 text-lg text-muted-foreground max-w-3xl">{proposal.summary}</p>

      {proposal.description && (
        <div className="mt-6 neon-card p-6 sm:p-8">
          <p className="text-foreground/90 leading-relaxed whitespace-pre-line">{proposal.description}</p>
        </div>
      )}

      {/* Stats bar */}
      <div className="mt-8 neon-card p-5 flex flex-wrap gap-6 items-center">
        <div className="flex items-center gap-3">
          <ConsensusIcon />
          <div>
            <div className="font-display text-2xl font-bold" style={{ color: statusColor[proposal.status] }}>
              {latestSnapshot ? Math.round(Number(latestSnapshot.mean_score)) : "—"}%
            </div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Consensus</div>
          </div>
        </div>
        <div className="h-10 w-px bg-white/10 hidden sm:block" />
        <div>
          <div className="font-display text-2xl font-bold">{latestSnapshot ? Number(latestSnapshot.vote_count).toLocaleString() : "—"}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Votes cast</div>
        </div>
        <div className="h-10 w-px bg-white/10 hidden sm:block" />
        <div>
          <div className="font-display text-2xl font-bold">{(proposal.issues as any)?.length ?? 0}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Issues to score</div>
        </div>
        <div className="ml-auto flex gap-2">
          <button className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-white/10 text-sm hover:bg-white/5">
            <Heart className="h-4 w-4" /> Support
          </button>
          <button className="h-9 w-9 inline-flex items-center justify-center rounded-md border border-white/10 hover:bg-white/5">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Immutable record */}
      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground neon-card p-3">
        <ShieldCheck className="h-4 w-4 text-emerald" />
        <span className="uppercase tracking-wider text-emerald">Immutable record</span>
        <code className="font-mono text-foreground/90 break-all">sha256:{contentHash ? shortHash(contentHash, 10, 10) : "computing…"}</code>
        {contentHash && (
          <button onClick={() => { navigator.clipboard.writeText(contentHash); toast.success("Hash copied"); }}
            className="inline-flex items-center gap-1 hover:text-foreground">
            <Copy className="h-3 w-3" /> Copy
          </button>
        )}
        <div className="ml-auto flex items-center gap-2">
          {!wallet.connected ? (
            <button onClick={() => wallet.connect()} disabled={wallet.connecting}
              className="inline-flex items-center gap-1 px-3 h-7 rounded-md border border-violet/40 text-violet text-xs hover:bg-violet/10">
              <Wallet className="h-3 w-3" /> {wallet.connecting ? "Connecting…" : "Connect wallet"}
            </button>
          ) : (
            <span className="text-emerald text-xs font-mono">{wallet.publicKey!.slice(0, 4)}…{wallet.publicKey!.slice(-4)}</span>
          )}
          {user && contentHash && (
            <button onClick={() => sealMutation.mutate()} disabled={sealMutation.isPending}
              className="inline-flex items-center gap-1 px-3 h-7 rounded-md bg-aurora text-white text-xs disabled:opacity-60">
              {sealMutation.isPending ? "Sealing…" : wallet.connected ? "Sign & seal" : "Seal"}
            </button>
          )}
        </div>
      </div>

      {/* Primary vote */}
      <div className="mt-10">
        <h2 className="font-display text-2xl font-bold">Your vote</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          One overall vote per person. Weigh feasibility, impact, urgency and anything else that matters to you.
        </p>

        <div className="mt-5 neon-card p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-display text-lg font-semibold">Overall support</div>
              <div className="text-xs text-muted-foreground">
                {tally.data?.count
                  ? `${tally.data.count} ${tally.data.count === 1 ? "person has" : "people have"} voted · average ${tally.data.mean}`
                  : "No overall votes yet — be the first."}
              </div>
            </div>
            <div className="text-center">
              <div className="font-display text-4xl font-bold text-electric">{overall}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {mine.data?.primary ? "Your vote" : "Your score"}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <input
              type="range" min={0} max={100} value={overall}
              onChange={(e) => setOverall(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-white/10 accent-electric"
            />
            <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>Strongly oppose (0)</span>
              <span>Neutral (50)</span>
              <span>Strongly support (100)</span>
            </div>
          </div>

          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Why? (optional — published with your vote)"
            className="mt-4 w-full rounded-lg bg-white/5 border border-white/10 p-3 text-sm outline-none focus:border-electric"
          />

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => {
                if (!user) { toast.info("Sign in to vote"); return; }
                primaryMutation.mutate();
              }}
              disabled={primaryMutation.isPending}
              className="h-11 px-6 rounded-lg bg-aurora text-white text-sm font-medium glow-electric disabled:opacity-60"
            >
              {primaryMutation.isPending ? "Recording…" : mine.data?.primary ? "Update my vote" : "Cast my vote"}
            </button>
          </div>
        </div>
      </div>

      {/* Community votes */}
      <div className="mt-6">
        <button
          onClick={() => setShowVotes((v) => !v)}
          className="h-9 px-4 rounded-full text-xs border border-white/10 text-muted-foreground hover:text-foreground"
        >
          {showVotes ? "Hide votes" : `View votes${tally.data?.count ? ` (${tally.data.count})` : ""}`}
        </button>
        {showVotes && (
          <div className="mt-4 space-y-3">
            {votesList.isPending && <p className="text-sm text-muted-foreground">Loading votes…</p>}
            {votesList.data?.length === 0 && (
              <p className="text-sm text-muted-foreground">No votes yet — be the first.</p>
            )}
            {votesList.data?.map((v: any, i: number) => (
              <div key={i} className="neon-card p-4 flex items-start gap-4">
                {v.profiles?.avatar_url ? (
                  <img src={v.profiles.avatar_url} alt="" className="h-9 w-9 rounded-full object-cover" />
                ) : (
                  <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-muted-foreground">
                    {(v.profiles?.display_name ?? v.profiles?.username ?? "?").slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium">
                      {v.profiles?.display_name ?? v.profiles?.username ?? "Citizen"}
                    </span>
                    {v.profiles?.username && (
                      <span className="text-xs text-muted-foreground">@{v.profiles.username}</span>
                    )}
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(v.updated_at ?? v.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {v.comment && (
                    <p className="mt-1 text-sm text-foreground/85 whitespace-pre-line">{v.comment}</p>
                  )}
                </div>
                <div className="text-center shrink-0">
                  <div className="font-display text-2xl font-bold text-electric">{v.score}</div>
                  <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Score</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Optional sub-votes */}
      {((proposal.issues as any[]) ?? []).length > 0 && (
        <div className="mt-10">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h2 className="font-display text-2xl font-bold">Sub-votes</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Optional. Score individual components — you don't need to score them all.
              </p>
            </div>
            <button
              onClick={() => setShowSubs((v) => !v)}
              className="h-9 px-4 rounded-full text-xs border border-white/10 text-muted-foreground hover:text-foreground"
            >
              {showSubs ? "Hide" : `Show ${(proposal.issues as any[]).length}`}
            </button>
          </div>
          {showSubs && (
            <div className="mt-5 space-y-4">
              {(proposal.issues as any[]).map((issue: any) => (
                <IssueCard
                  key={issue.id}
                  issue={issue}
                  score={scores[issue.id] ?? 50}
                  onChange={(v) => setScores((s) => ({ ...s, [issue.id]: v }))}
                  onSubmit={() => {
                    if (!user) {
                      toast.info("Sign in to vote");
                      return;
                    }
                    voteMutation.mutate({ issue_id: issue.id, score: scores[issue.id] ?? 50 });
                  }}
                  busy={voteMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      )}


      <AgentVotePanel issues={((proposal.issues as any[]) ?? []).map((i: any) => ({ id: i.id, title: i.title }))} />
    </div>
  );
}

function IssueCard({
  issue,
  score,
  onChange,
  onSubmit,
  busy,
}: {
  issue: any;
  score: number;
  onChange: (v: number) => void;
  onSubmit: () => void;
  busy: boolean;
}) {
  return (
    <div className="neon-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex-1 min-w-[200px]">
          <h3 className="font-display text-lg font-semibold">{issue.title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{issue.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="font-display text-3xl font-bold text-electric">{score}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Your score</div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        <input
          type="range"
          min={0}
          max={100}
          value={score}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-white/10 accent-electric"
        />
        <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
          <span>Strongly oppose (0)</span>
          <span>Neutral (50)</span>
          <span>Strongly support (100)</span>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onSubmit}
          disabled={busy}
          className="h-10 px-5 rounded-lg bg-aurora text-white text-sm font-medium glow-electric disabled:opacity-60"
        >
          {busy ? "Submitting…" : "Submit vote"}
        </button>
      </div>
    </div>
  );
}
