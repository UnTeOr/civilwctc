import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Brain, Search } from "lucide-react";
import { listAgentMemories, agentKeywordCloud } from "@/lib/agent-memory.functions";

const KIND_LABEL: Record<string, string> = {
  protocol: "Protocol",
  identity: "Identity",
  research: "Research",
  value: "Value",
  goal: "Goal",
  decision: "Decision",
  reflection: "Reflection",
  interaction: "Conversation",
  vote: "Vote",
};

export function AgentMemoryPanel({ agentId }: { agentId: string }) {
  const listFn = useServerFn(listAgentMemories);
  const cloudFn = useServerFn(agentKeywordCloud);
  const [keyword, setKeyword] = useState<string>("");

  const { data: memories = [] } = useQuery({
    queryKey: ["agent-memories", agentId, keyword],
    queryFn: () => listFn({ data: { agentId, keyword: keyword || undefined } }) as Promise<any[]>,
  });
  const { data: cloud = [] } = useQuery({
    queryKey: ["agent-keywords", agentId],
    queryFn: () => cloudFn({ data: { agentId } }) as Promise<{ keyword: string; count: number }[]>,
  });

  return (
    <div className="mt-8 neon-card p-6">
      <div className="flex items-center gap-2 mb-1">
        <Brain className="h-5 w-5 text-violet" />
        <h2 className="font-display text-xl font-semibold">Memory</h2>
      </div>
      <p className="text-sm text-muted-foreground mb-4">
        Research, values, goals and decisions this agent has recorded. Everything is keyword-indexed so it can recall what matters and build on it over time.
      </p>

      {cloud.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {cloud.map((k) => (
            <button
              key={k.keyword}
              onClick={() => setKeyword(keyword === k.keyword ? "" : k.keyword)}
              className={`text-xs px-2.5 py-1 rounded-full border transition ${
                keyword === k.keyword
                  ? "bg-aurora text-white border-transparent"
                  : "border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20"
              }`}
            >
              {k.keyword} <span className="opacity-60">{k.count}</span>
            </button>
          ))}
        </div>
      )}

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Recall by keyword…"
          className="w-full h-10 pl-9 pr-3 rounded-lg bg-white/5 border border-white/10 text-sm outline-none focus:border-electric"
        />
      </div>

      {memories.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {keyword ? "Nothing recalled for that keyword yet." : "No memories recorded yet — memories form at activation and in each weekly cycle."}
        </p>
      ) : (
        <ul className="space-y-4">
          {memories.map((m) => (
            <li key={m.id} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="text-violet uppercase tracking-wider">{KIND_LABEL[m.kind] ?? m.kind}</span>
                <span>· {new Date(m.created_at).toLocaleDateString()}</span>
                <span>· importance {m.importance}/5</span>
              </div>
              <div className="mt-1 font-medium">{m.title}</div>
              {m.content && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-wrap">{m.content}</p>}
              {(m.keywords ?? []).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {m.keywords.slice(0, 10).map((k: string) => (
                    <span key={k} className="text-[10px] px-2 py-0.5 rounded bg-violet/10 text-violet border border-violet/20">{k}</span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
