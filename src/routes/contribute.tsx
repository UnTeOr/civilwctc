import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/contribute")({
  head: () => ({
    meta: [
      { title: "Ways to Contribute — CIVIL.wc.tc" },
      { name: "description", content: "CIVIL.wc.tc is free and non-profit. Contribute time, energy, expertise, or commitment — never money for access." },
      { property: "og:title", content: "Ways to contribute to CIVIL.wc.tc" },
      { property: "og:description", content: "A non-profit civic platform from WC.TC. Everything is free — the only currency is participation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Ways to contribute to CIVIL.wc.tc" },
      { name: "twitter:description", content: "A non-profit civic platform from WC.TC. Everything is free — the only currency is participation." },
    ],
    links: [{ rel: "canonical", href: "https://civilwctc.lovable.app/contribute" }],
  }),
  component: ContributePage,
});

const WAYS = [
  {
    name: "Participant",
    kind: "Time & attention",
    desc: "For every person. Free, forever.",
    cta: "Join now",
    features: ["Personal representative agent", "Score & debate every action item", "Earn Contribution Points & badges", "Wallet sign-in for verifiable voting"],
    color: "oklch(0.62 0.26 265)",
  },
  {
    name: "Constituent group",
    kind: "Shared commitment",
    desc: "Coalitions, community orgs, non-profits.",
    cta: "Start a group",
    features: ["Group representative agent", "Internal deliberation room", "Group profile + research library", "Shared action-item templates"],
    color: "oklch(0.66 0.22 300)",
  },
  {
    name: "Node steward",
    kind: "Energy & expertise",
    desc: "Run a node on the CIVIC Protocol.",
    cta: "Talk to us",
    features: ["Federated identity & data ingest", "RSS + JSON feed access", "Cross-node consensus signals", "Verified node badge"],
    color: "oklch(0.85 0.17 90)",
  },
];

function ContributePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 lg:py-24">
      <span className="text-xs uppercase tracking-[0.2em] text-violet">Contribute</span>
      <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3">Free for everyone. Powered by what people give.</h1>
      <p className="mt-3 text-muted-foreground max-w-2xl">
        CIVIL.wc.tc is a programme of WC.TC, a California 501(c)(3) non-profit public charity. There are no
        plans, prices, subscriptions or paid tiers — and there never will be. What the platform runs on is
        contributed time, energy, expertise, care and commitment.
      </p>

      <div className="mt-12 grid lg:grid-cols-3 gap-5">
        {WAYS.map((t) => (
          <div key={t.name} className="neon-card p-7 flex flex-col">
            <div className="text-xs uppercase tracking-[0.2em]" style={{ color: t.color }}>{t.name}</div>
            <div className="mt-3 font-display text-3xl font-bold">{t.kind}</div>
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

      <div className="mt-10 neon-card p-7">
        <h2 className="font-display text-xl font-semibold">No money, no tokens, no investment</h2>
        <p className="mt-3 text-sm text-muted-foreground max-w-3xl leading-relaxed">
          Contribution Points recognise participation. They are not currency, are not for sale, cannot be
          traded or cashed out, and carry no financial value of any kind. Wallets are used only to sign
          votes and prove authorship — never for payments or transfers. Learn more about the charity behind
          the platform on the <Link to="/about" className="text-electric hover:underline">About page</Link>.
        </p>
      </div>
    </div>
  );
}
