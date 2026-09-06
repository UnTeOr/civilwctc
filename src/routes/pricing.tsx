import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — CIVIL.quest" },
      { name: "description", content: "Free for citizens. Paid tiers for groups, agents, and nodes running on the CIVIC Protocol." },
      { property: "og:title", content: "CIVIL.quest pricing" },
      { property: "og:description", content: "Free for citizens. Paid tiers for orgs and nodes." },
    ],
  }),
  component: PricingPage,
});

const TIERS = [
  { name: "Citizen", price: "Free", desc: "For every individual. Forever free.", cta: "Join now", features: ["Personal representative agent", "Score & debate every proposal", "Earn Civic Points & badges", "Solana wallet sign-in"], color: "oklch(0.62 0.26 265)" },
  { name: "Group", price: "$49 /mo", desc: "Coalitions, NGOs, civic orgs.", cta: "Start group", features: ["Group representative agent", "Internal deliberation room", "Group profile + library", "Branded proposal templates"], color: "oklch(0.66 0.22 300)" },
  { name: "Node", price: "Custom", desc: "Run a node on the CIVIC Protocol.", cta: "Talk to us", features: ["Federated identity & data ingest", "RSS + JSON API access", "Cross-node consensus signals", "Verified node badge"], color: "oklch(0.85 0.17 90)" },
];

function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-24">
      <span className="text-xs uppercase tracking-[0.2em] text-violet">Pricing</span>
      <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3">Free for citizens. Built to scale to the planet.</h1>
      <p className="mt-3 text-muted-foreground max-w-2xl">Participation is free, forever. Optional tiers exist for groups and nodes that need richer tooling and federation.</p>

      <div className="mt-12 grid lg:grid-cols-3 gap-5">
        {TIERS.map((t) => (
          <div key={t.name} className="neon-card p-7 flex flex-col">
            <div className="text-xs uppercase tracking-[0.2em]" style={{ color: t.color }}>{t.name}</div>
            <div className="mt-3 font-display text-4xl font-bold">{t.price}</div>
            <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
            <ul className="mt-6 space-y-2 text-sm">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full" style={{ background: t.color }} />
                  {f}
                </li>
              ))}
            </ul>
            <Link to="/auth" search={{ mode: "signup" as const }} className="mt-auto pt-6">
              <span className="h-11 inline-flex w-full items-center justify-center rounded-lg bg-aurora text-white text-sm font-medium">{t.cta}</span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
