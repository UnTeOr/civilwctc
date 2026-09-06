import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMyCivicSummary } from "@/lib/proposals.functions";
import { Flame, Trophy, Sparkles, ArrowUpRight, ArrowDownRight, Target } from "lucide-react";

export const Route = createFileRoute("/_authenticated/missions")({
  head: () => ({ meta: [{ title: "Missions & CP Ledger — CIVIL.wc.tc" }] }),
  component: MissionsPage,
});

function MissionsPage() {
  const fn = useServerFn(getMyCivicSummary);
  const { data } = useSuspenseQuery({
    queryKey: ["civic-summary"],
    queryFn: () => fn(),
  });

  const profile = data.profile;
  const xpToNext = ((profile?.level ?? 1) * 100);
  const xpPct = profile ? Math.min(100, Math.round((profile.xp / xpToNext) * 100)) : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 lg:py-16">
      <span className="text-xs uppercase tracking-[0.2em] text-gold">Game layer</span>
      <h1 className="font-display text-4xl font-bold mt-2">Missions & Contribution Points</h1>
      <p className="mt-2 text-muted-foreground">Track your streak, complete missions, earn badges, and watch your CP build.</p>

      {/* Top stats */}
      <div className="mt-8 grid sm:grid-cols-4 gap-4">
        <StatCard icon={<Sparkles className="h-4 w-4" />} label="Contribution Points" value={(profile?.civic_points ?? 0).toLocaleString()} accent="text-electric" />
        <StatCard icon={<Trophy className="h-4 w-4" />} label="Level" value={`Lv ${profile?.level ?? 1}`} subtitle={`${xpPct}% to next`} accent="text-violet" />
        <StatCard icon={<Flame className="h-4 w-4" />} label="Streak" value={`${profile?.streak_days ?? 0}d`} accent="text-coral" />
        <StatCard icon={<Target className="h-4 w-4" />} label="Reputation" value={String(profile?.reputation ?? 0)} accent="text-cyan" />
      </div>

      {/* XP bar */}
      <div className="mt-4 neon-card p-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
          <span>XP {profile?.xp ?? 0} / {xpToNext}</span>
          <span>Next level: Lv {(profile?.level ?? 1) + 1}</span>
        </div>
        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full bg-aurora glow-electric transition-all" style={{ width: `${xpPct}%` }} />
        </div>
      </div>

      <div className="mt-10 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 neon-card p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Active missions</h2>
          {data.missions.length === 0 && (
            <p className="text-sm text-muted-foreground">No missions assigned yet. Start by scoring a proposal — first vote earns 25 CP.</p>
          )}
          <div className="space-y-3">
            {data.missions.map((m: any) => {
              const um = m.user_missions?.[0];
              const done = um?.completed;
              const progress = um?.progress ?? 0;
              const target = m.target ?? 1;
              const pct = Math.min(100, Math.round((progress / target) * 100));
              return (
                <div key={m.id} className="rounded-lg border border-white/10 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-medium text-sm">{m.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{m.description}</p>
                    </div>
                    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ${done ? "bg-emerald/20 text-emerald" : "bg-white/5 text-muted-foreground"}`}>
                      {done ? "Done" : `+${m.reward_pc ?? 0} CP`}
                    </span>
                  </div>
                  <div className="mt-3 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-aurora" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="neon-card p-6">
          <h2 className="font-display text-xl font-semibold mb-4">Badges</h2>
          {data.badges.length === 0 && (
            <p className="text-sm text-muted-foreground">No badges yet. They unlock as you participate.</p>
          )}
          <div className="grid grid-cols-3 gap-3">
            {data.badges.map((ub: any) => (
              <div key={ub.badges.id} className="text-center" title={ub.badges.description}>
                <div className="aspect-square rounded-xl bg-aurora flex items-center justify-center text-2xl">🏅</div>
                <div className="mt-1 text-[10px] text-muted-foreground line-clamp-2">{ub.badges.name}</div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-8 neon-card p-6">
        <h2 className="font-display text-xl font-semibold mb-4">CP Ledger</h2>
        {data.ledger.length === 0 && (
          <p className="text-sm text-muted-foreground">No transactions yet. Every action you take here will appear on this immutable ledger.</p>
        )}
        <div className="divide-y divide-white/5">
          {data.ledger.map((e: any) => {
            const isCredit = e.amount > 0;
            return (
              <div key={e.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <span className={`h-8 w-8 rounded-full flex items-center justify-center ${isCredit ? "bg-emerald/15 text-emerald" : "bg-coral/15 text-coral"}`}>
                    {isCredit ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  </span>
                  <div>
                    <div className="text-sm font-medium">{e.reason ?? e.event_type}</div>
                    <div className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</div>
                  </div>
                </div>
                <div className={`font-display font-bold ${isCredit ? "text-emerald" : "text-coral"}`}>
                  {isCredit ? "+" : ""}{e.amount} CP
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, subtitle, accent }: { icon: React.ReactNode; label: string; value: string; subtitle?: string; accent?: string }) {
  return (
    <div className="neon-card p-4">
      <div className={`flex items-center gap-1.5 text-xs ${accent ?? "text-muted-foreground"}`}>{icon}<span>{label}</span></div>
      <div className="mt-2 font-display text-2xl font-bold">{value}</div>
      {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
    </div>
  );
}
