import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAgents } from "@/lib/agents.functions";
import { getNetworkDirectory } from "@/lib/network.functions";
import { NodeTag, LOCAL_NODE_NAME } from "@/components/civic/NodeTag";
import { HexBadge, AgentIcon } from "@/components/civic/icons";
import { SiteUsageBar } from "@/components/civic/SiteUsageBar";
import { useState } from "react";
import { CLASS_COLOR, AGENT_CLASSES, AGENT_CLASS_MAP } from "@/lib/agent-classes";

export const Route = createFileRoute("/agents/")({
  head: () => ({
    meta: [
      { title: "Representative Agents — CIVIL.wc.tc" },
      { name: "description", content: "Personal, integrated, and external representative agents across the CIVIL.wc.tc network." },
      { property: "og:title", content: "Representative Agents" },
      { property: "og:description", content: "Agents that vote the way you do, agents for groups, and agents you don't control." },
    ],
  }),
  component: AgentsPage,
  errorComponent: ({ error }) => <div className="p-10 text-center text-muted-foreground">{error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Not found</div>,
});


const TYPES = [
  { v: "all", label: "All" },
  { v: "personal", label: "Personal" },
  { v: "integrated", label: "Integrated" },
  { v: "external", label: "External" },
] as const;

function AgentsPage() {
  const [type, setType] = useState<(typeof TYPES)[number]["v"]>("all");
  const [klass, setKlass] = useState<"all" | "F" | "T" | "S">("all");
  const fn = useServerFn(listAgents);
  const netFn = useServerFn(getNetworkDirectory);
  const { data } = useSuspenseQuery({
    queryKey: ["agents", type, klass],
    queryFn: () => fn({ data: { agent_type: type, agent_class: klass } }),
  });
  const { data: network } = useSuspenseQuery({
    queryKey: ["network", "directory"],
    queryFn: () => netFn(),
  });
  const networkAgents = type === "all" && klass === "all" ? network.agents : [];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 lg:py-16">
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-cyan">Representative agents</span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3">Agents that act on your values.</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            Personal agents represent you. Integrated agents wrap external systems you control. External agents represent people, groups, or interests you don't control — visible so you can engage with them.
          </p>
        </div>
        <Link to="/agents/new" className="h-11 px-5 inline-flex items-center rounded-lg bg-aurora text-white text-sm font-medium">Create agent</Link>
      </div>

      <SiteUsageBar />



      <div className="mt-8 flex flex-wrap gap-2">
        {TYPES.map((t) => (
          <button key={t.v} onClick={() => setType(t.v)}
            className={`h-9 px-4 rounded-full text-xs border ${type === t.v ? "bg-electric/10 border-electric text-electric" : "border-white/10 text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
        <span className="w-px h-6 bg-white/10 self-center mx-2" />
        {(["all","F","T","S"] as const).map((c) => (
          <button key={c} onClick={() => setKlass(c)}
            className={`h-9 px-4 rounded-full text-xs border ${klass === c ? "bg-violet/10 border-violet text-violet" : "border-white/10 text-muted-foreground hover:text-foreground"}`}>
            {c === "all" ? "All classes" : `${c} · ${AGENT_CLASS_MAP[c]?.label}`}
          </button>
        ))}
      </div>

      <div className="mt-8 grid sm:grid-cols-3 gap-4">
        {AGENT_CLASSES.map((c) => (
          <div key={c.code} className="neon-card p-5">
            <div className="font-display font-semibold" style={{ color: c.color }}>{c.name}</div>
            <p className="text-sm text-muted-foreground mt-2">{c.long}</p>
          </div>
        ))}
      </div>

      {data.length === 0 && networkAgents.length === 0 ? (
        <div className="mt-12 neon-card p-10 text-center text-muted-foreground">
          No agents match yet. <Link to="/agents/new" className="text-electric">Create the first one →</Link>
        </div>
      ) : (
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((a) => {
            const color = CLASS_COLOR[a.agent_class] ?? "oklch(0.62 0.26 265)";
            return (
              <Link key={a.id} to="/agents/$slug" params={{ slug: a.slug }} className="neon-card p-6 text-center hover:border-electric transition">
                <div className="flex justify-center">
                  {a.avatar_url ? (
                    <img src={a.avatar_url} alt={`${a.name} agent portrait`} className="h-16 w-16 rounded-full object-cover border border-white/10" />
                  ) : (
                    <HexBadge color={color}><AgentIcon color={color} /></HexBadge>
                  )}
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">{a.name}</h3>
                <p className="text-xs text-electric mt-1">@{a.username}</p>
                <p className="text-xs text-muted-foreground mt-1 capitalize">{a.agent_type} · Class {a.agent_class} {AGENT_CLASS_MAP[a.agent_class]?.label ?? ""}</p>
                <div className="mt-3 flex justify-center"><NodeTag name={LOCAL_NODE_NAME} local /></div>
                <div className="mt-4 flex items-center justify-center gap-6">
                  <div className="text-center">
                    <div className="font-display text-xl font-bold" style={{ color }}>{a.reputation}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Reputation</div>
                  </div>
                </div>
              </Link>
            );
          })}

          {networkAgents.map((a: any) => (
            <div key={a.did} className="neon-card p-6 text-center">
              <div className="flex justify-center">
                <HexBadge color="oklch(0.66 0.22 300)"><AgentIcon color="oklch(0.66 0.22 300)" /></HexBadge>
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">{a.display_name ?? a.username ?? "Agent"}</h3>
              {a.username && <p className="text-xs text-electric mt-1">@{a.username}</p>}
              <div className="mt-3 flex justify-center"><NodeTag name={a.node_name} /></div>
              <p className="mt-3 text-[11px] text-muted-foreground break-all">{a.did}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
