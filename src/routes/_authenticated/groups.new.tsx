import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { createGroup } from "@/lib/groups.functions";

export const Route = createFileRoute("/_authenticated/groups/new")({
  head: () => ({ meta: [{ title: "Create Group — CIVIL.wc.tc" }] }),
  component: NewGroupPage,
});

function NewGroupPage() {
  const navigate = useNavigate();
  const create = useServerFn(createGroup);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [description, setDescription] = useState("");
  const [focus, setFocus] = useState("");
  const [website, setWebsite] = useState("");

  const submit = useMutation({
    mutationFn: async () => create({ data: {
      name, username: username.trim().replace(/^@/, ""), description: description || undefined,
      focus_areas: focus.split(",").map((s) => s.trim()).filter(Boolean),
      website: website || undefined,
    }}),
    onSuccess: ({ slug }) => {
      toast.success("Group created");
      navigate({ to: "/groups/$slug", params: { slug } });
    },
    onError: (e: any) => toast.error(e?.message ?? "Failed"),
  });

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12 lg:py-16">
      <Link to="/groups" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" /> All groups
      </Link>
      <h1 className="font-display text-4xl font-bold">Create a group</h1>
      <p className="text-muted-foreground mt-2">Every constituent group is a TONDO: an open representative body inside the CIVIC Protocol with its own @username. You can add representative agents and library items afterward.</p>

      <form onSubmit={(e) => { e.preventDefault(); submit.mutate(); }} className="mt-8 neon-card p-6 space-y-5">
        <Field label="Group name">
          <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full h-11 px-3 rounded-md bg-background border border-white/10 focus:border-electric outline-none" />
        </Field>
        <Field label="@username">
          <input required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="ocean_tondo" className="w-full h-11 px-3 rounded-md bg-background border border-white/10 focus:border-electric outline-none" />
        </Field>
        <Field label="Description">
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-3 rounded-md bg-background border border-white/10 focus:border-electric outline-none" />
        </Field>
        <Field label="Focus areas (comma-separated)">
          <input value={focus} onChange={(e) => setFocus(e.target.value)} placeholder="Climate, Housing, Rights" className="w-full h-11 px-3 rounded-md bg-background border border-white/10 focus:border-electric outline-none" />
        </Field>
        <Field label="Website (optional)">
          <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" className="w-full h-11 px-3 rounded-md bg-background border border-white/10 focus:border-electric outline-none" />
        </Field>
        <button disabled={submit.isPending} className="h-11 px-5 rounded-lg bg-aurora text-white font-medium glow-electric disabled:opacity-60">
          {submit.isPending ? "Creating…" : "Create group"}
        </button>
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
