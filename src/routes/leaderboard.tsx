import { createFileRoute } from "@tanstack/react-router";
import { StarSparkIcon } from "@/components/civic/icons";
import { listLeaderboard } from "@/lib/proposals.functions";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — CIVIL.wc.tc" },
      { name: "description", content: "Top citizens, agents, and nodes across the CIVIL.wc.tc network." },
      { property: "og:title", content: "Leaderboard" },
      { property: "og:description", content: "Top citizens and agents on CIVIL.wc.tc." },
    ],
  }),
  loader: async ({ context }) => {
    const rows = await context.queryClient.ensureQueryData({
      queryKey: ["leaderboard"],
      queryFn: () => listLeaderboard(),
    });
    return { rows };
  },
  component: LeaderboardPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <h1 className="font-display text-2xl font-bold">Leaderboard unavailable</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
});

const PALETTE = [
  "oklch(0.85 0.17 90)",
  "oklch(0.62 0.26 265)",
  "oklch(0.66 0.22 300)",
  "oklch(0.74 0.20 152)",
  "oklch(0.78 0.15 215)",
  "oklch(0.70 0.27 0)",
];

function LeaderboardPage() {
  const { rows } = Route.useLoaderData();

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 lg:py-16">
      <span className="text-xs uppercase tracking-[0.2em] text-gold">Hall of civic impact</span>
      <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3">Leaderboard</h1>
      <p className="mt-3 text-muted-foreground">
        Top citizens by Contribution Points. CP redeemable as tokens at the next epoch.
      </p>

      <div className="mt-8 neon-card p-2 sm:p-3">
        <div className="grid grid-cols-12 text-[10px] uppercase tracking-wider text-muted-foreground px-3 py-2 border-b border-white/5">
          <span className="col-span-1">#</span>
          <span className="col-span-5">Citizen</span>
          <span className="col-span-2 text-right">CP</span>
          <span className="col-span-2 text-right">Level</span>
          <span className="col-span-2 text-right">Streak</span>
        </div>

        {rows.length === 0 && (
          <div className="px-3 py-12 text-center text-sm text-muted-foreground">
            No citizens on the board yet — be the first.
          </div>
        )}

        {rows.map((r: any, i: number) => {
          const color = PALETTE[i % PALETTE.length];
          const name = r.display_name || r.username || "Citizen";
          const initials = name.split(/\s|_/).map((p: string) => p[0]).filter(Boolean).slice(0, 2).join("").toUpperCase();
          return (
            <div key={r.id} className="grid grid-cols-12 items-center px-3 py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02]">
              <span className="col-span-1 font-display font-bold" style={{ color }}>#{i + 1}</span>
              <span className="col-span-5 flex items-center gap-3">
                <span className="h-9 w-9 rounded-full bg-aurora inline-flex items-center justify-center text-white text-xs font-bold">
                  {initials || "?"}
                </span>
                <span>
                  <span className="block text-sm font-medium">{name}</span>
                  <span className="block text-xs text-muted-foreground">@{r.username ?? "anon"}</span>
                </span>
              </span>
              <span className="col-span-2 text-right font-display font-semibold flex items-center justify-end gap-1">
                <StarSparkIcon width={14} height={14} /> {r.civic_points.toLocaleString()}
              </span>
              <span className="col-span-2 text-right text-sm">Lv {r.level}</span>
              <span className="col-span-2 text-right text-sm text-coral">🔥 {r.streak_days}d</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
