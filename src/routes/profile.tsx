import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { HexBadge, StarSparkIcon, FlameIcon } from "@/components/civic/icons";
import { buildProfileDocument, pushProfileDocument, makeDid } from "@/lib/civic-protocol";
import { shortHash } from "@/lib/hash";
import { Camera, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "My Civic Record — CIVIL.wc.tc" },
      { name: "description", content: "Your democratic experience record on CIVIL.wc.tc." },
      { property: "og:title", content: "My Civic Record — CIVIL.wc.tc" },
      { property: "og:description", content: "Your democratic experience record on CIVIL.wc.tc." },
      { property: "og:type", content: "profile" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

interface Profile {
  username: string | null;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  city: string | null;
  country: string | null;
  wallet_address: string | null;
  did: string | null;
  values_list: string[] | null;
  protocol_version: number | null;
  protocol_synced_at: string | null;
  civic_points: number;
  xp: number;
  level: number;
  streak_days: number;
  reputation: number;
  verified: boolean;
}

const VALUE_OPTIONS = [
  "Climate & Environment",
  "Equity & Justice",
  "Digital Rights",
  "Education & Innovation",
  "Community Building",
  "Public Health",
];

function ProfilePage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [lastHash, setLastHash] = useState<string | null>(null);
  const [agents, setAgents] = useState<Array<{ id: string; slug: string; name: string; username: string; avatar_url: string | null; agent_class: string; agent_type: string }>>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    username: "",
    display_name: "",
    bio: "",
    city: "",
    country: "",
    values_list: [] as string[],
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return;
        const p = data as unknown as Profile;
        setProfile(p);
        setForm({
          username: p.username ?? "",
          display_name: p.display_name ?? "",
          bio: p.bio ?? "",
          city: p.city ?? "",
          country: p.country ?? "",
          values_list: p.values_list ?? [],
        });
      });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("agents")
      .select("id, slug, name, username, avatar_url, agent_class, agent_type")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => setAgents((data as never as typeof agents) ?? []));
  }, [user]);

  async function syncToProtocol(next: Profile) {
    if (!user) return;
    const doc = await buildProfileDocument({
      userId: user.id,
      username: next.username,
      displayName: next.display_name,
      bio: next.bio,
      avatarUrl: next.avatar_url,
      city: next.city,
      country: next.country,
      values: next.values_list ?? [],
      walletAddress: next.wallet_address,
      version: (next.protocol_version ?? 0) + 1,
    });
    await pushProfileDocument(doc);
    setLastHash(doc.contentHash);
    await supabase
      .from("profiles")
      .update({
        did: next.did ?? makeDid(user.id),
        protocol_version: (next.protocol_version ?? 0) + 1,
        protocol_synced_at: new Date().toISOString(),
      } as never)
      .eq("id", user.id);
  }

  async function handleAvatar(file: File) {
    if (!user) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file.");
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5 MB.");
    setUploading(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${user.id}/avatar-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, cacheControl: "3600" });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ avatar_url: pub.publicUrl })
        .eq("id", user.id);
      if (dbErr) throw dbErr;
      const next = { ...(profile as Profile), avatar_url: pub.publicUrl };
      setProfile(next);
      await syncToProtocol(next);
      toast.success("Profile picture updated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!user) return;
    const handle = form.username.trim().replace(/^@/, "");
    if (handle && !/^[a-zA-Z0-9_]{3,24}$/.test(handle)) {
      return toast.error("Handle must be 3–24 letters, numbers or underscores.");
    }
    setSaving(true);
    try {
      const patch = {
        username: handle || null,
        display_name: form.display_name.trim() || handle || null,
        bio: form.bio.trim() || null,
        city: form.city.trim() || null,
        country: form.country.trim() || null,
        values_list: form.values_list,
      };
      const { error } = await supabase.from("profiles").update(patch as never).eq("id", user.id);
      if (error) throw error;
      const next = { ...(profile as Profile), ...patch } as Profile;
      setProfile(next);
      await syncToProtocol(next);
      setEditing(false);
      toast.success("Profile saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="mx-auto max-w-5xl px-4 py-20 text-center text-muted-foreground">Loading…</div>;

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center neon-card mt-20 p-10">
        <h1 className="font-display text-2xl font-bold">Sign in required</h1>
        <p className="mt-2 text-muted-foreground text-sm">Sign in to see your civic record.</p>
        <Link to="/auth" className="inline-block mt-6 h-11 px-5 rounded-lg bg-aurora text-white font-medium leading-[2.75rem]">Sign in</Link>
      </div>
    );
  }

  const p = profile;
  const did = p?.did || makeDid(user.id);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 lg:py-16">
      <span className="text-xs uppercase tracking-[0.2em] text-violet">Democratic experience record</span>
      <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3">Your Journey. Your Impact.</h1>

      <div className="mt-10 grid lg:grid-cols-3 gap-6">
        <div className="neon-card p-8 text-center lg:col-span-1">
          <div className="relative mx-auto w-32 h-32 group">
            <div className="absolute inset-0 rounded-full bg-aurora blur-xl opacity-50" />
            <div className="relative w-full h-full rounded-full overflow-hidden bg-aurora inline-flex items-center justify-center text-white font-display text-4xl font-bold border-2 border-white/20">
              {p?.avatar_url ? (
                <img src={p.avatar_url} alt={`${p.display_name || "Citizen"} profile picture`} className="w-full h-full object-cover" />
              ) : (
                (p?.display_name || user.email || "C").slice(0, 1).toUpperCase()
              )}
            </div>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              aria-label="Upload profile picture"
              className="absolute bottom-0 right-0 h-10 w-10 rounded-full bg-background border border-white/15 inline-flex items-center justify-center hover:border-electric/50 transition"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleAvatar(f);
                e.target.value = "";
              }}
            />
          </div>
          <h2 className="mt-4 font-display text-xl font-semibold">{p?.display_name || "New Citizen"}</h2>
          <p className="text-muted-foreground text-sm">@{p?.username || "—"}</p>
          {p?.verified && <span className="mt-2 inline-block text-[10px] px-2 py-0.5 rounded-full bg-emerald/15 text-emerald uppercase">Verified</span>}
          {p?.bio && <p className="mt-3 text-sm text-muted-foreground">{p.bio}</p>}
          {(p?.city || p?.country) && (
            <p className="mt-2 text-xs text-muted-foreground">{[p?.city, p?.country].filter(Boolean).join(", ")}</p>
          )}
          <p className="mt-4 text-xs text-muted-foreground">{user.email}</p>

          <button
            onClick={() => setEditing((v) => !v)}
            className="mt-5 h-10 px-5 rounded-lg border border-white/10 text-sm hover:border-electric/40 transition"
          >
            {editing ? "Cancel" : "Edit profile"}
          </button>

          <div className="mt-6 pt-5 border-t border-white/10 text-left">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald" /> CIVIC Protocol identity
            </div>
            <p className="mt-1 font-mono text-[11px] break-all text-muted-foreground">{did}</p>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {p?.protocol_synced_at
                ? `Last synced ${new Date(p.protocol_synced_at).toLocaleString()} · v${p.protocol_version ?? 1}`
                : "Not yet synced to the network"}
              {lastHash ? ` · ${shortHash(lastHash)}` : ""}
            </p>
          </div>
        </div>

        <div className="neon-card p-8 lg:col-span-2">
          {editing ? (
            <div>
              <h3 className="font-display text-lg font-semibold mb-4">Edit your civic identity</h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Handle" value={form.username} onChange={(v) => setForm({ ...form, username: v })} placeholder="yourhandle" />
                <Field label="Display name" value={form.display_name} onChange={(v) => setForm({ ...form, display_name: v })} placeholder="How you want to be known" />
                <Field label="City" value={form.city} onChange={(v) => setForm({ ...form, city: v })} placeholder="City" />
                <Field label="Country" value={form.country} onChange={(v) => setForm({ ...form, country: v })} placeholder="Country" />
              </div>
              <label className="block mt-4">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Bio</span>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  maxLength={280}
                  placeholder="What do you stand for?"
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] outline-none text-sm placeholder:text-muted-foreground/60"
                />
                <span className="text-[10px] text-muted-foreground">{form.bio.length}/280</span>
              </label>

              <div className="mt-4">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Values</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {VALUE_OPTIONS.map((v) => {
                    const active = form.values_list.includes(v);
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() =>
                          setForm({
                            ...form,
                            values_list: active
                              ? form.values_list.filter((x) => x !== v)
                              : [...form.values_list, v],
                          })
                        }
                        className={`px-3 py-1.5 rounded-full text-xs border transition ${active ? "border-electric/50 bg-electric/10 text-foreground" : "border-white/10 text-muted-foreground hover:border-white/25"}`}
                      >
                        {v}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="h-11 px-6 rounded-lg bg-aurora text-white font-medium glow-electric disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save & sync"}
                </button>
                <button onClick={() => setEditing(false)} className="h-11 px-5 rounded-lg border border-white/10 text-sm">Cancel</button>
              </div>
              <p className="mt-3 text-[11px] text-muted-foreground">
                Saving signs a canonical profile document ready for the CIVIC Protocol network.
              </p>
            </div>
          ) : (
            <>
              <h3 className="font-display text-lg font-semibold mb-4">Civic stats</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <StatCard icon={<StarSparkIcon />} label="Contribution Points" value={p?.civic_points ?? 0} color="oklch(0.85 0.17 90)" />
                <StatCard icon={<StarSparkIcon color="oklch(0.62 0.26 265)" />} label="XP" value={p?.xp ?? 0} color="oklch(0.62 0.26 265)" />
                <StatCard icon={<StarSparkIcon color="oklch(0.66 0.22 300)" />} label="Level" value={p?.level ?? 1} color="oklch(0.66 0.22 300)" />
                <StatCard icon={<FlameIcon />} label="Streak (days)" value={p?.streak_days ?? 0} color="oklch(0.70 0.27 0)" />
              </div>

              {(p?.values_list?.length ?? 0) > 0 && (
                <div className="mt-8">
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Values</h4>
                  <div className="flex flex-wrap gap-2">
                    {p?.values_list?.map((v) => (
                      <span key={v} className="px-3 py-1.5 rounded-full text-xs border border-white/10 text-muted-foreground">{v}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h4 className="text-xs uppercase tracking-wider text-muted-foreground">Linked agent profiles</h4>
                  {p?.username && (
                    <Link to="/u/$username" params={{ username: p.username }} className="text-xs text-electric">View public profile →</Link>
                  )}
                </div>
                {agents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No agents yet. <Link to="/agents/new" className="text-electric">Create an agent to act on your behalf →</Link>
                  </p>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-3">
                    {agents.map((a) => (
                      <Link key={a.id} to="/agents/$slug" params={{ slug: a.slug }} className="neon-card p-3 flex items-center gap-3 hover:border-electric transition">
                        <div className="h-10 w-10 rounded-full overflow-hidden bg-aurora inline-flex items-center justify-center text-white text-sm font-bold">
                          {a.avatar_url ? (
                            <img src={a.avatar_url} alt={`${a.name} agent portrait`} className="h-full w-full object-cover" />
                          ) : (
                            a.name.slice(0, 1).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{a.name}</div>
                          <div className="text-xs text-electric">@{a.username}</div>
                          <div className="text-[11px] text-muted-foreground capitalize">{a.agent_type} · Class {a.agent_class}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8">
                <h4 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Next steps</h4>
                <ul className="grid sm:grid-cols-2 gap-3 text-sm">
                  <li className="neon-card p-3">🎯 Score your first action — earn 50 CP</li>
                  <li className="neon-card p-3">🤖 Create your representative agent — earn 200 CP</li>
                  <li className="neon-card p-3">🔗 Link your Solana wallet (soon)</li>
                  <li className="neon-card p-3">🏘️ Join a community node</li>
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1 w-full px-3 py-2.5 rounded-lg border border-white/10 bg-white/[0.03] outline-none text-sm placeholder:text-muted-foreground/60"
      />
    </label>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="neon-card p-4 flex items-center gap-3">
      <HexBadge color={color}>{icon}</HexBadge>
      <div>
        <div className="font-display text-2xl font-bold" style={{ color }}>{value.toLocaleString()}</div>
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
