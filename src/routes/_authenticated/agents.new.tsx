import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, ArrowRight, Check, Camera, Loader2, Sparkles, Bot, X } from "lucide-react";
import { toast } from "sonner";
import { HexBadge, AgentIcon } from "@/components/civic/icons";
import { createAgent } from "@/lib/agents.functions";
import { AGENT_CLASSES } from "@/lib/agent-classes";
import { VALUE_LIBRARY } from "@/lib/agent-values";

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/agents/new")({
  head: () => ({ meta: [{ title: "Create Agent — CIVIL.quest" }] }),
  component: NewAgentWizard,
});

const TYPES = [
  { v: "personal", label: "Personal", blurb: "Represents you. Trained on your values, votes on your behalf." },
  { v: "integrated", label: "Integrated", blurb: "Wraps an external AI or system YOU control (API, model, bot)." },
  { v: "external", label: "External", blurb: "Represents a person, group, or interest you don't control — visible for engagement." },
] as const;
const CLASSES = AGENT_CLASSES;


const SELF_NAMES = ["NOVA", "AXIOM", "ECHO", "ORACLE", "VESPER", "KAIROS", "LUMEN", "SOLACE", "ARBOR", "MERIDIAN", "CIPHER", "AURELIA"];

function NewAgentWizard() {
  const navigate = useNavigate();
  const create = useServerFn(createAgent);
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0);
  const [type, setType] = useState<(typeof TYPES)[number]["v"]>("personal");
  const [klass, setKlass] = useState<"F" | "T" | "S">("F");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [selfDirected, setSelfDirected] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [vals, setVals] = useState<string[]>([]);
  const [valueSearch, setValueSearch] = useState("");
  const [customValue, setCustomValue] = useState("");
  const [principles, setPrinciples] = useState("");
  const [votingInstructions, setVotingInstructions] = useState("");
  const [charter, setCharter] = useState("");
  const [externalUrl, setExternalUrl] = useState("");

  const toggle = (v: string) => setVals((c) => (c.includes(v) ? c.filter((x) => x !== v) : [...c, v]));

  const needle = valueSearch.trim().toLowerCase();
  const shownGroups = needle
    ? VALUE_LIBRARY.map((g) => ({ ...g, values: g.values.filter((v) => v.toLowerCase().includes(needle)) })).filter((g) => g.values.length > 0)
    : VALUE_LIBRARY;

  const addCustom = () => {
    const v = customValue.trim().slice(0, 40);
    if (!v) return;
    if (!vals.includes(v)) setVals((c) => [...c, v]);
    setCustomValue("");
  };


  const selfGenerate = () => {
    const base = SELF_NAMES[Math.floor(Math.random() * SELF_NAMES.length)]!;
    const tag = Math.random().toString(36).slice(2, 6);
    const handle = `${base.toLowerCase()}_${tag}`;
    setName(base);
    setUsername(handle);
    setAvatarUrl(`https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${encodeURIComponent(handle)}`);
  };

  const onSelfDirected = (on: boolean) => {
    setSelfDirected(on);
    if (on) selfGenerate();
  };

  const onPickFile = async (file: File | undefined) => {
    if (!file || !user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `${user.id}/agent-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, cacheControl: "3600" });
      if (error) throw error;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(pub.publicUrl);
      toast.success("Agent image uploaded");
    } catch (e: any) {
      toast.error(e?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = useMutation({
    mutationFn: async () =>
      create({ data: {
        name, username, avatar_url: avatarUrl || undefined, self_directed: selfDirected,
        agent_class: klass, agent_type: type, values_list: vals,
        principles: principles || undefined, voting_instructions: votingInstructions || undefined,

        charter: charter || undefined, external_url: externalUrl || undefined,
      }}),
    onSuccess: ({ slug }) => {
      toast.success(`${name} created · +75 PC`);
      navigate({ to: "/agents/$slug", params: { slug } });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed to create"),
  });

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 lg:py-16">
      <Link to="/agents" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> All agents
      </Link>

      <span className="text-xs uppercase tracking-[0.2em] text-violet">UASTC creation wizard</span>
      <h1 className="font-display text-4xl font-bold mt-2">Create a representative agent</h1>

      <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
        {["Type", "Class", "Identity", "Instructions", "Review"].map((s, i) => (
          <span key={s} className={`px-2 py-1 rounded-full border ${i === step ? "border-electric text-electric" : "border-white/10"}`}>{i + 1}. {s}</span>
        ))}
      </div>

      <div className="mt-8 neon-card p-6">
        {step === 0 && (
          <div className="space-y-3">
            {TYPES.map((t) => (
              <button key={t.v} onClick={() => setType(t.v)}
                className={`w-full text-left rounded-lg p-4 border transition ${type === t.v ? "border-electric bg-electric/5" : "border-white/10 hover:border-white/20"}`}>
                <div className="font-display font-semibold flex items-center justify-between">{t.label}{type === t.v && <Check className="h-5 w-5 text-electric" />}</div>
                <div className="text-sm text-muted-foreground mt-1">{t.blurb}</div>
              </button>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            {CLASSES.map((c) => (
              <button key={c.code} onClick={() => setKlass(c.code)}
                className={`w-full text-left rounded-lg p-4 border transition flex gap-4 items-start ${klass === c.code ? "border-electric bg-electric/5" : "border-white/10 hover:border-white/20"}`}>
                <HexBadge color={c.color}><AgentIcon color={c.color} /></HexBadge>
                <div>
                  <div className="font-display font-semibold">{c.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">{c.long}</div>
                  <ul className="mt-2 space-y-0.5">
                    {c.rights.map((r) => (
                      <li key={r} className="text-xs text-muted-foreground/80">· {r}</li>
                    ))}
                  </ul>
                </div>
                {klass === c.code && <Check className="h-5 w-5 text-electric ml-auto" />}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4 rounded-lg border border-violet/30 bg-violet/5 p-4">
              <div>
                <div className="font-display font-semibold flex items-center gap-2"><Bot className="h-4 w-4 text-violet" /> Self-directed identity</div>
                <p className="text-sm text-muted-foreground mt-1">Let the agent choose its own name, @username and portrait.</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={selfDirected}
                onClick={() => onSelfDirected(!selfDirected)}
                className={`relative h-6 w-11 shrink-0 rounded-full border transition ${selfDirected ? "bg-violet/60 border-violet" : "bg-white/5 border-white/15"}`}
              >
                <span className={`absolute top-0.5 h-4.5 w-4.5 h-[18px] w-[18px] rounded-full bg-white transition-all ${selfDirected ? "left-[22px]" : "left-0.5"}`} />
              </button>
            </div>

            {selfDirected && (
              <button type="button" onClick={selfGenerate} className="inline-flex items-center gap-1 text-xs text-violet">
                <Sparkles className="h-3 w-3" /> Let it choose again
              </button>
            )}

            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-full overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Agent portrait preview" className="h-full w-full object-cover" />
                ) : (
                  <Bot className="h-7 w-7 text-muted-foreground" />
                )}
              </div>
              <div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onPickFile(e.target.files?.[0])} />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading || selfDirected}
                  className="h-9 px-3 inline-flex items-center gap-2 rounded-md border border-white/10 text-sm disabled:opacity-40"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  Upload agent image
                </button>
                <p className="text-xs text-muted-foreground mt-1">PNG or JPG, up to 5 MB.</p>
              </div>
            </div>

            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Agent name</span>
              <input value={name} disabled={selfDirected} onChange={(e) => setName(e.target.value)} placeholder="NOVA, AXIOM, ECHO…" className="w-full h-11 px-3 rounded-md bg-background border border-white/10 outline-none focus:border-electric disabled:opacity-60" />
            </label>
            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Agent @username</span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">@</span>
                <input
                  value={username}
                  disabled={selfDirected}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                  placeholder="nova_agent"
                  className="flex-1 h-11 px-3 rounded-md bg-background border border-white/10 outline-none focus:border-electric disabled:opacity-60"
                />
              </div>
              <span className="block text-xs text-muted-foreground mt-1">Unique across the network. Letters, numbers and underscores.</span>
            </label>
            {(type === "integrated" || type === "external") && (
              <label className="block">
                <span className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">External URL</span>
                <input value={externalUrl} onChange={(e) => setExternalUrl(e.target.value)} placeholder="https://…" className="w-full h-11 px-3 rounded-md bg-background border border-white/10 outline-none focus:border-electric" />
              </label>
            )}
            {(klass === "S" || type === "external") && (
              <label className="block">
                <span className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Public charter</span>
                <textarea rows={5} value={charter} onChange={(e) => setCharter(e.target.value)} placeholder="What this agent stands for, who it represents, how it makes decisions." className="w-full p-3 rounded-md bg-background border border-white/10 outline-none focus:border-electric" />
              </label>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tell your agent what you value. Pick as many as you like across the spectrum — these become tags used to match and group people.</p>
              <div className="mt-3 relative">
                <input
                  value={valueSearch}
                  onChange={(e) => setValueSearch(e.target.value)}
                  placeholder="Search values…"
                  className="w-full h-10 px-3 rounded-md bg-background border border-white/10 outline-none focus:border-electric text-sm"
                />
              </div>
              {vals.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {vals.map((v) => (
                    <button key={v} onClick={() => toggle(v)} className="text-xs px-3 py-1.5 rounded-full bg-aurora text-white inline-flex items-center gap-1">
                      {v} <X className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              )}
              <div className="mt-5 space-y-5 max-h-[420px] overflow-y-auto pr-1">
                {shownGroups.map((g) => (
                  <div key={g.group}>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">{g.group}</div>
                    <div className="flex flex-wrap gap-2">
                      {g.values.map((v) => (
                        <button key={v} onClick={() => toggle(v)}
                          className={`px-3 py-1.5 rounded-full text-xs border transition ${vals.includes(v) ? "bg-aurora text-white border-transparent" : "border-white/10 text-muted-foreground hover:text-foreground hover:border-white/25"}`}>
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {shownGroups.length === 0 && <p className="text-sm text-muted-foreground">No values match. Add it as a custom value below.</p>}
              </div>

              <div className="mt-5 flex gap-2">
                <input
                  value={customValue}
                  onChange={(e) => setCustomValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }}
                  placeholder="Add a custom value…"
                  className="flex-1 h-10 px-3 rounded-md bg-background border border-white/10 outline-none focus:border-electric text-sm"
                />
                <button onClick={addCustom} className="h-10 px-4 rounded-md border border-white/10 text-sm hover:border-electric">Add</button>
              </div>
            </div>

            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Principles</span>
              <textarea rows={5} value={principles} onChange={(e) => setPrinciples(e.target.value)}
                placeholder="The lines your agent must never cross, and the beliefs it should hold when the details are unclear."
                className="w-full p-3 rounded-md bg-background border border-white/10 outline-none focus:border-electric" />
            </label>

            <label className="block">
              <span className="block text-xs uppercase tracking-wider text-muted-foreground mb-1.5">Instructions on voting</span>
              <textarea rows={6} value={votingInstructions} onChange={(e) => setVotingInstructions(e.target.value)}
                placeholder="How should your agent weigh trade-offs, when should it abstain, when must it ask you first, and what matters most when it votes on your behalf?"
                className="w-full p-3 rounded-md bg-background border border-white/10 outline-none focus:border-electric" />
            </label>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-2 text-sm">
            <Row label="Type" value={type} />
            <Row label="Class" value={CLASSES.find((c) => c.code === klass)?.name ?? ""} />
            <Row label="Name" value={name || "—"} />
            <Row label="Username" value={username ? `@${username}` : "—"} />
            <Row label="Identity" value={selfDirected ? "Self-directed" : "Set by owner"} />
            <Row label="Values" value={vals.join(", ") || "—"} />
            {principles && <Row label="Principles" value={principles} />}
            {votingInstructions && <Row label="Voting instructions" value={votingInstructions} />}
            {externalUrl && <Row label="External URL" value={externalUrl} />}
            {charter && <Row label="Charter" value={charter} />}
          </div>
        )}

      </div>

      <div className="mt-6 flex justify-between">
        <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}
          className="h-11 px-4 inline-flex items-center gap-1 rounded-lg border border-white/10 disabled:opacity-30">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        {step < 4 ? (
          <button onClick={() => setStep((s) => s + 1)} disabled={step === 2 && (!name || username.length < 3)}
            className="h-11 px-5 inline-flex items-center gap-1 rounded-lg bg-aurora text-white font-medium disabled:opacity-60">
            Next <ArrowRight className="h-4 w-4" />
          </button>
        ) : (
          <button onClick={() => submit.mutate()} disabled={submit.isPending}
            className="h-11 px-5 rounded-lg bg-aurora text-white font-medium glow-electric disabled:opacity-60">
            {submit.isPending ? "Launching…" : "Launch agent"}
          </button>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-b border-white/5 py-2 last:border-0">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <span className="text-right break-all">{value}</span>
    </div>
  );
}
