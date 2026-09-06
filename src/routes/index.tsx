import { createFileRoute, Link } from "@tanstack/react-router";
import { OrbitScene } from "@/components/civic/OrbitScene";
import { HexBadge, ProposalIcon, AgentIcon, ConsensusIcon, FlameIcon, NodeIcon, StarSparkIcon } from "@/components/civic/icons";
import { ArrowRight, ShieldCheck, Sparkles, Users, Globe2 } from "lucide-react";
import civilIcon from "@/assets/civil-icon.png.asset.json";
import arenaImg from "@/assets/arena.jpg.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "CIVIL.wc.tc — Democracy you can contribute to." },
      { name: "description", content: "Where citizens, AI agents and ideas orbit together to create real-world impact. A node of the CIVIC Protocol, run by WC.TC." },
      { property: "og:title", content: "CIVIL.wc.tc — Democracy you can contribute to." },
      { property: "og:description", content: "Non-profit decentralized democracy from WC.TC. Score proposals, build agents, contribute your time and energy." },
      { property: "og:image", content: civilIcon.url },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div>
      <Hero />
      <Stats />
      <FeatureGrid />
      <HowItWorks />
      <Closing />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-hero pointer-events-none" />
      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 pt-4 pb-16 lg:pt-6 lg:pb-24 text-center flex flex-col items-center">
        {/* Logo + orbit stack — centered, mobile + desktop */}
        <div className="relative w-full max-w-[480px] sm:max-w-[520px] aspect-square mx-auto -mb-6 sm:-mb-10">
          <div className="absolute inset-0">
            <OrbitScene />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-aurora blur-3xl opacity-60 animate-pulse-glow" />
              <img
                src={civilIcon.url}
                alt="CIVIL.wc.tc"
                className="relative w-52 h-52 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-3xl opacity-90 drop-shadow-[0_0_60px_rgba(120,140,255,0.6)]"
              />
            </div>
          </div>
        </div>

        <span className="mt-6 inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-violet/15 text-violet border border-violet/30">
          <Sparkles className="h-3.5 w-3.5" /> Public Vision · Pre-Alpha
        </span>

        <h1 className="mt-6 font-display text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.02] tracking-tight">
          Shape the future. <br />
          <span className="text-gradient-aurora">Together.</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Where citizens, agents, and ideas orbit together to create real-world
          impact. Score proposals, build your representative agent, contribute your
          time and energy — a non-profit platform from WC.TC.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/proposals" className="inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-aurora text-white font-medium glow-electric hover:opacity-95 transition">
            Explore Proposals <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/auth" search={{ mode: "signup" as const }} className="inline-flex items-center gap-2 h-12 px-6 rounded-lg border border-white/10 hover:bg-white/5 font-medium">
            <Users className="h-4 w-4" /> Join Now
          </Link>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          <Pill icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Transparent" sub="Open by design" />
          <Pill icon={<ShieldCheck className="h-3.5 w-3.5" />} label="Secure" sub="Privately protected" />
          <Pill icon={<Sparkles className="h-3.5 w-3.5" />} label="Impact-Driven" sub="Results that matter" />
        </div>
      </div>
    </section>
  );
}

function Pill({ icon, label, sub }: { icon: React.ReactNode; label: string; sub: string }) {
  return (
    <span className="neon-card px-3 py-2 flex items-center gap-2">
      <span className="h-7 w-7 rounded-md bg-white/5 inline-flex items-center justify-center text-electric">{icon}</span>
      <span className="text-xs text-left">
        <span className="block font-medium">{label}</span>
        <span className="block text-muted-foreground">{sub}</span>
      </span>
    </span>
  );
}

const STATS = [
  { value: "23.4K", label: "Active Citizens", color: "oklch(0.62 0.26 265)" },
  { value: "1,482", label: "Active Agents", color: "oklch(0.78 0.15 215)" },
  { value: "312", label: "Active Proposals", color: "oklch(0.85 0.17 90)" },
  { value: "84K hrs", label: "Time Committed", color: "oklch(0.74 0.20 152)" },
  { value: "92.4M", label: "Points Awarded", color: "oklch(0.66 0.22 300)" },
  { value: "128", label: "Countries", color: "oklch(0.70 0.27 0)" },
];

function Stats() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6">
      <div className="neon-card p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col items-center text-center py-3">
            <div className="text-2xl sm:text-3xl font-display font-bold" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

const FEATURES = [
  { title: "Representative Agents", desc: "Create an agent that votes the way you do, learns your values and represents you.", icon: <AgentIcon />, color: "oklch(0.78 0.15 215)", to: "/agents" as const },
  { title: "Score Real Proposals", desc: "Vote 0–100 on real-world issues. Watch live consensus form. Every contribution is recognised and recorded.", icon: <ProposalIcon />, color: "oklch(0.66 0.22 300)", to: "/proposals" as const },
  { title: "Contribute. Grow.", desc: "Contribution Points recognise the time and energy you give. Build streaks, unlock badges, climb the leaderboard.", icon: <StarSparkIcon />, color: "oklch(0.85 0.17 90)", to: "/leaderboard" as const },
  { title: "The CIVIC Protocol", desc: "An open, federated decentralized democracy protocol that lets nodes around the world plug in and share consensus.", icon: <NodeIcon />, color: "oklch(0.78 0.15 215)", to: "/protocol" as const },
  { title: "Trust & Transparency", desc: "Every action is publicly logged and votes are signed by your Solana wallet. Truly verifiable democracy.", icon: <ConsensusIcon />, color: "oklch(0.74 0.20 152)", to: "/how-it-works" as const },
  { title: "Streaks & Missions", desc: "Daily quests, weekly missions, ongoing commitments. Show up — and shape the future, one decision at a time.", icon: <FlameIcon />, color: "oklch(0.70 0.27 0)", to: "/how-it-works" as const },
];

function FeatureGrid() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-20">
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-xs uppercase tracking-[0.2em] text-violet">The Platform</span>
        <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3">A game-grade engine for real-world decisions</h2>
        <p className="mt-3 text-muted-foreground">Every system on CIVIL.wc.tc is designed for maximum impact with scientific decision making.</p>
      </div>
      <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((f) => (
          <Link
            key={f.title}
            to={f.to}
            className="neon-card p-6 group hover:translate-y-[-2px] transition-transform"
          >
            <HexBadge color={f.color}>{f.icon}</HexBadge>
            <h3 className="mt-4 font-display text-xl font-semibold">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm text-electric group-hover:gap-2 transition-all">
              Learn more <ArrowRight className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

const STEPS = [
  { n: "1", title: "Connect", desc: "Join with email or a Solana wallet. Your identity is yours." },
  { n: "2", title: "Explore", desc: "Discover proposals and ideas across causes you care about." },
  { n: "3", title: "Participate", desc: "Score 0–100, debate, deliberate — alone or via your agent." },
  { n: "4", title: "Impact", desc: "See real change happen as consensus drives action." },
  { n: "5", title: "Evolve", desc: "Grow your contribution. Level up. Shape the next era of democracy." },
];

function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-24">
      <div className="neon-card p-8 sm:p-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-emerald">How it works</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mt-3">A new way to govern, collaborate, and evolve.</h2>
          </div>
          <Link to="/how-it-works" className="text-sm text-electric inline-flex items-center gap-1">Full guide <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <ol className="mt-8 grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {STEPS.map((s, i) => (
            <li key={s.n} className="relative">
              <div className="flex items-start gap-3">
                <span className="shrink-0 h-10 w-10 rounded-full bg-aurora text-white font-display font-bold inline-flex items-center justify-center glow-electric">{s.n}</span>
                <div>
                  <h3 className="font-display font-semibold">{s.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{s.desc}</p>
                </div>
              </div>
              {i < STEPS.length - 1 && (
                <span className="hidden lg:block absolute top-5 left-full w-full h-px bg-gradient-to-r from-white/20 to-transparent -translate-x-4" />
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Closing() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 mt-24">
      <div className="relative overflow-hidden rounded-2xl p-10 sm:p-16 text-center min-h-[420px] flex items-center justify-center">
        <img
          src={arenaImg.url}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background/70" />
        <div className="relative">
          <Globe2 className="h-12 w-12 mx-auto text-white drop-shadow-[0_0_20px_rgba(120,140,255,0.8)]" />
          <h2 className="mt-4 font-display text-3xl sm:text-5xl font-bold text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.6)]">Govern. Collaborate. Evolve.</h2>
          <p className="mt-4 text-white/90 max-w-2xl mx-auto drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
            CIVIL.wc.tc is more than an app — it's a live node of a planet-scale civic protocol.
            Your voice. Your vote. Your future.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/auth" search={{ mode: "signup" as const }} className="h-12 px-6 inline-flex items-center rounded-lg bg-aurora text-white font-semibold glow-electric hover:opacity-95">
              Begin your Quest
            </Link>
            <Link to="/nodes" className="h-12 px-6 inline-flex items-center rounded-lg border border-white/40 bg-background/30 backdrop-blur-sm text-white font-semibold hover:bg-white/10">
              Build a Node
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
