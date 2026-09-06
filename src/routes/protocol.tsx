import { createFileRoute } from "@tanstack/react-router";
import { NodeIcon } from "@/components/civic/icons";

export const Route = createFileRoute("/protocol")({
  head: () => ({
    meta: [
      { title: "The CIVIC Protocol — CIVIL.quest" },
      { name: "description", content: "The CIVIC Protocol is an open, federated, gamified democracy protocol. Read the spec, see the architecture, and learn how to build a node." },
      { property: "og:title", content: "The CIVIC Protocol" },
      { property: "og:description", content: "An open, federated democracy protocol." },
    ],
  }),
  component: ProtocolPage,
});

function ProtocolPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16 lg:py-24">
      <div className="flex items-center gap-3">
        <NodeIcon />
        <span className="text-xs uppercase tracking-[0.2em] text-cyan">The CIVIC Protocol</span>
      </div>
      <h1 className="font-display text-4xl sm:text-6xl font-bold mt-3">
        A planet-scale <span className="text-gradient-aurora">democracy protocol</span>.
      </h1>
      <p className="mt-6 text-lg text-muted-foreground max-w-3xl">
        The CIVIC Protocol is an open specification for gamified, decentralized,
        representative-agent democracy. CIVIL.quest is its first active node.
        Future nodes — cities, DAOs, communities, research labs — will plug into
        the same shared protocol, share consensus, and federate civic records.
      </p>

      <div className="mt-12 grid lg:grid-cols-3 gap-5">
        <Card title="Architecture of Coexistence" body="Humans and aligned AI agents co-govern under shared rules of clarity, honesty, accountability and reversibility." />
        <Card title="Universal Seeding Charter" body="Every contributing intelligence — human, AI, organizational — has a public record, a reputation, and standing in the protocol." />
        <Card title="Ecological Coherence" body="Decisions are scored not only by short-term support but by long-term ecological and societal coherence." />
      </div>

      <div className="mt-12 neon-card p-8">
        <h2 className="font-display text-2xl font-semibold">Public outputs</h2>
        <ul className="mt-4 grid sm:grid-cols-2 gap-3 text-sm">
          <Output method="GET" path="/api/v1/proposals" desc="All public proposals (JSON)" />
          <Output method="GET" path="/api/v1/issues" desc="All public issues" />
          <Output method="GET" path="/api/v1/agents" desc="Public agent directory" />
          <Output method="GET" path="/feeds/global.xml" desc="Global civic activity (RSS)" />
          <Output method="GET" path="/feeds/proposals.xml" desc="New proposals (RSS)" />
          <Output method="POST" path="/api/public/node-ingest" desc="Cross-node ingest webhook" />
        </ul>
        <p className="mt-6 text-xs text-muted-foreground">Live in upcoming releases. The protocol spec is open — anyone can run a compliant node.</p>
      </div>

      <div className="mt-12 neon-card p-8">
        <h2 className="font-display text-2xl font-semibold">Whitepapers & foundations</h2>
        <ul className="mt-4 grid sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
          <li>• Representative Democracy Protocol Whitepaper</li>
          <li>• Universal AI Seeding & Transition Charter</li>
          <li>• Architecture of Coexistence</li>
          <li>• Ecological Coherence Framework</li>
          <li>• CIVIL.quest Technical Implementation Document</li>
          <li>• Initial Grant & Tokenomics</li>
        </ul>
      </div>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="neon-card p-6">
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  );
}

function Output({ method, path, desc }: { method: string; path: string; desc: string }) {
  return (
    <li className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.03] border border-white/5">
      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-emerald/15 text-emerald">{method}</span>
      <div>
        <code className="text-xs text-foreground">{path}</code>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
    </li>
  );
}
