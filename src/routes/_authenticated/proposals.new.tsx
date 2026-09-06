import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createProposal } from "@/lib/proposals.functions";
import { Plus, Trash2, ArrowLeft, X } from "lucide-react";
import { toast } from "sonner";
import { useSolanaWallet } from "@/hooks/use-solana-wallet";
import { PenLine, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_authenticated/proposals/new")({
  head: () => ({ meta: [{ title: "Submit an Action Item — CIVIL.quest" }] }),
  component: NewActionPage,
});

function NewActionPage() {
  const navigate = useNavigate();
  const submit = useServerFn(createProposal);

  const [form, setForm] = useState({
    title: "",
    summary: "",
    description: "",
    parent_public_id: "",
  });
  const [authorSupport, setAuthorSupport] = useState(75);
  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");
  const [issues, setIssues] = useState<{ title: string; description: string }[]>([
    { title: "", description: "" },
  ]);
  const wallet = useSolanaWallet();
  const [signature, setSignature] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);

  const signSubmission = async () => {
    if (!form.title.trim()) {
      toast.error("Add a title before signing.");
      return;
    }
    setSigning(true);
    try {
      const payload = `CIVIC Protocol action submission\ntitle: ${form.title}\nsupport: ${authorSupport}\ntime: ${new Date().toISOString()}`;
      if (wallet.connected) {
        const sig = await wallet.signMessage(new TextEncoder().encode(payload));
        if (!sig) {
          toast.error("Wallet signature declined.");
          return;
        }
        const hex = Array.from(sig).map((b) => b.toString(16).padStart(2, "0")).join("");
        setSignature(`sol:${hex.slice(0, 32)}…`);
        toast.success("Signed with your wallet.");
      } else {
        const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
        const hex = Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
        setSignature(`local:${hex.slice(0, 32)}…`);
        toast.success("Submission signed locally. Connect a wallet later for on-chain verification.");
      }
    } catch (e: any) {
      toast.error(e?.message ?? "Could not sign");
    } finally {
      setSigning(false);
    }
  };

  const addTag = (raw: string) => {
    const v = raw.trim().replace(/^#/, "");
    if (!v) return;
    if (tags.includes(v) || tags.length >= 20) return;
    setTags([...tags, v]);
    setTagDraft("");
  };

  const mutation = useMutation({
    mutationFn: () =>
      submit({
        data: {
          title: form.title,
          summary: form.summary,
          description: form.description,
          tags,
          author_support: authorSupport,
          parent_public_id: form.parent_public_id.trim() || undefined,
          issues: issues.filter((i) => i.title.trim().length >= 4),
        },
      }),
    onSuccess: (r) => {
      toast.success(`Action submitted — ID ${r.public_id} · sealed for the CIVIC Protocol · +50 PC`);
      navigate({ to: "/proposals/$slug", params: { slug: r.slug } });
    },
    onError: (e: any) => toast.error(e?.message ?? "Submit failed"),
  });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 lg:py-16">
      <Link to="/proposals" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> All actions
      </Link>

      <span className="text-xs uppercase tracking-[0.2em] text-violet">Citizen submission</span>
      <h1 className="font-display text-4xl font-bold mt-2">Submit an Action Item</h1>
      <p className="mt-2 text-muted-foreground">
        An action item is anything that can be prioritized and voted on — a proposal, an issue, a priority.
        Every action receives a unique cryptographic ID you can use to link it from other actions.
      </p>

      <form
        onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
        className="mt-8 space-y-5"
      >
        <Field label="Title">
          <input
            required minLength={8} maxLength={160}
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full h-11 px-3 rounded-md bg-background border border-white/10 focus:border-electric outline-none"
            placeholder="e.g. Carbon-Neutral Schools by 2030"
          />
        </Field>

        <Field label="One-line summary">
          <input
            required minLength={20} maxLength={500}
            value={form.summary}
            onChange={(e) => setForm({ ...form, summary: e.target.value })}
            className="w-full h-11 px-3 rounded-md bg-background border border-white/10 focus:border-electric outline-none"
            placeholder="What this action does, in one breath."
          />
        </Field>

        <Field label="Full description">
          <textarea
            required minLength={40} maxLength={8000} rows={8}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full p-3 rounded-md bg-background border border-white/10 focus:border-electric outline-none"
            placeholder="Context, goals, plan, expected outcomes."
          />
        </Field>

        <Field label="Tags">
          <div className="rounded-md bg-background border border-white/10 focus-within:border-electric p-2 flex flex-wrap gap-1.5">
            {tags.map((tg) => (
              <span key={tg} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-electric/10 text-electric border border-electric/30">
                #{tg}
                <button type="button" onClick={() => setTags(tags.filter((t) => t !== tg))} aria-label={`Remove ${tg}`}>
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              value={tagDraft}
              onChange={(e) => setTagDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(tagDraft); }
                else if (e.key === "Backspace" && !tagDraft && tags.length) setTags(tags.slice(0, -1));
              }}
              onBlur={() => addTag(tagDraft)}
              placeholder={tags.length ? "Add another…" : "scope, topic, region, or another Action ID (e.g. A-7K2P9XQ4)"}
              className="flex-1 min-w-[180px] h-8 px-2 bg-transparent outline-none text-sm"
            />
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">Press Enter or comma to add. Scope, category, region, or a linked Action ID all live as tags.</p>
        </Field>

        <Field label={`Your support: ${authorSupport}%`}>
          <input
            type="range" min={0} max={100} step={1}
            value={authorSupport}
            onChange={(e) => setAuthorSupport(Number(e.target.value))}
            className="w-full accent-electric"
          />
          <div className="flex justify-between text-[11px] text-muted-foreground mt-1">
            <span>0 · neutral</span><span>50</span><span>100 · maximum</span>
          </div>
        </Field>

        <Field label="Parent Action ID (optional)">
          <input
            value={form.parent_public_id}
            onChange={(e) => setForm({ ...form, parent_public_id: e.target.value })}
            placeholder="A-XXXXXXXX — link this as a sub-item of another action"
            className="w-full h-11 px-3 rounded-md bg-background border border-white/10 focus:border-electric outline-none font-mono text-sm"
          />
        </Field>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs uppercase tracking-wider text-muted-foreground">Sub-items / options (optional, up to 8)</label>
            <button
              type="button"
              onClick={() => setIssues([...issues, { title: "", description: "" }])}
              disabled={issues.length >= 8}
              className="text-xs inline-flex items-center gap-1 text-electric hover:opacity-80 disabled:opacity-40"
            >
              <Plus className="h-3.5 w-3.5" /> Add sub-item
            </button>
          </div>
          <p className="text-[11px] text-muted-foreground mb-2">
            Break the action into options that can be scored individually. You can also paste another Action ID here to reference it.
          </p>
          <div className="space-y-3">
            {issues.map((iss, idx) => (
              <div key={idx} className="neon-card p-4 flex flex-col gap-2">
                <div className="flex gap-2">
                  <input
                    value={iss.title}
                    onChange={(e) => {
                      const next = [...issues];
                      next[idx] = { ...iss, title: e.target.value };
                      setIssues(next);
                    }}
                    placeholder={`Sub-item ${idx + 1} title (or Action ID)`}
                    className="flex-1 h-10 px-3 rounded-md bg-background border border-white/10 outline-none focus:border-electric"
                  />
                  {issues.length > 1 && (
                    <button
                      type="button"
                      onClick={() => setIssues(issues.filter((_, i) => i !== idx))}
                      className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-white/10 hover:bg-white/5 text-muted-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <input
                  value={iss.description}
                  onChange={(e) => {
                    const next = [...issues];
                    next[idx] = { ...iss, description: e.target.value };
                    setIssues(next);
                  }}
                  placeholder="Short description (optional)"
                  className="h-9 px-3 rounded-md bg-background border border-white/10 outline-none text-sm"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="neon-card p-4 flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-[200px]">
            <div className="text-sm font-medium">Signature</div>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {signature
                ? `Signed · ${signature}`
                : wallet.connected
                  ? "Sign with your connected Solana wallet to verify this submission."
                  : "Sign this submission. Connect a Solana wallet for on-chain verification later."}
            </p>
          </div>
          <button
            type="button"
            onClick={signSubmission}
            disabled={signing}
            className={`h-10 px-4 inline-flex items-center gap-2 rounded-lg border text-sm disabled:opacity-60 ${
              signature ? "border-emerald/40 text-emerald bg-emerald/10" : "border-electric/40 text-electric bg-electric/10"
            }`}
          >
            {signature ? <ShieldCheck className="h-4 w-4" /> : <PenLine className="h-4 w-4" />}
            {signature ? "Signed" : signing ? "Signing…" : "Sign submission"}
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Link to="/proposals" className="h-11 px-4 inline-flex items-center rounded-lg border border-white/10 text-sm">Cancel</Link>
          <button
            type="submit"
            disabled={mutation.isPending || !signature}
            className="h-11 px-6 rounded-lg bg-aurora text-white font-medium glow-electric disabled:opacity-60"
          >
            {mutation.isPending ? "Submitting…" : signature ? "Submit Action Item" : "Sign to submit"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">{label}</span>
      {children}
    </label>
  );
}
