import { createFileRoute } from "@tanstack/react-router";
import { HexBadge, AgentIcon, ProposalIcon, VoteIcon, ConsensusIcon, NodeIcon, StarSparkIcon } from "@/components/civic/icons";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How It Works — CIVIL.wc.tc" },
      { name: "description", content: "Understand how CIVIL.wc.tc turns civic participation into meaningful, transparent, non-profit collective decision making." },
      { property: "og:title", content: "How CIVIL.wc.tc works" },
      { property: "og:description", content: "Proposals, agents, scoring, consensus, contribution — explained." },
    ],
  }),
  component: HowItWorks,
});

const SECTIONS = [
  { icon: <ProposalIcon />, color: "oklch(0.66 0.22 300)", title: "Proposals", body: "Every issue lives as a proposal — with context, data, debate, and a 0–100 scoring system. The community shapes feasibility, support, and impact in real time." },
  { icon: <VoteIcon />, color: "oklch(0.62 0.26 265)", title: "Scoring votes", body: "Instead of yes/no, you score proposals from 0 to 100. This produces richer signal, better consensus, and fewer winner-take-all outcomes." },
  { icon: <AgentIcon />, color: "oklch(0.78 0.15 215)", title: "Representative agents", body: "Create an AI agent (UASTC class F/T/S) that votes the way you would. Agents learn from your scores, your written values, and your past activity." },
  { icon: <ConsensusIcon />, color: "oklch(0.74 0.20 152)", title: "Consensus formation", body: "Live consensus rings show how the community is converging. Snapshots are immutable and cryptographically anchored." },
  { icon: <StarSparkIcon />, color: "oklch(0.85 0.17 90)", title: "Contribution Points & XP", body: "Every score, debate, proposal and verified action earns Contribution Points (CP) and XP. CP is recognition of contributed time, energy and commitment — never currency, and never redeemable for money." },
  { icon: <NodeIcon />, color: "oklch(0.78 0.15 215)", title: "Federated nodes", body: "CIVIL.wc.tc is the first node of the CIVIC Protocol. Other nodes plug in via public RSS feeds and a JSON API. Your record travels with you." },
];

function HowItWorks() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 lg:py-24">
      <span className="text-xs uppercase tracking-[0.2em] text-emerald">How it works</span>
      <h1 className="font-display text-4xl sm:text-6xl font-bold mt-3">A real decision engine, wrapped in a great game.</h1>
      <p className="mt-6 text-lg text-muted-foreground max-w-3xl">
        CIVIL.wc.tc combines a serious, scientifically-grounded scoring system with a clear, engaging experience. Nothing here costs money. Here are the moving parts.
      </p>

      <div className="mt-12 grid sm:grid-cols-2 gap-5">
        {SECTIONS.map((s) => (
          <div key={s.title} className="neon-card p-6">
            <HexBadge color={s.color}>{s.icon}</HexBadge>
            <h2 className="mt-4 font-display text-xl font-semibold">{s.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
