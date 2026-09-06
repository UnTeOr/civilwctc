import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import { globalSearch } from "@/lib/search.functions";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — CIVIL.wc.tc" }, { name: "description", content: "Search proposals, agents, and groups." }] }),
  component: SearchPage,
  errorComponent: ({ error }) => <div className="p-10 text-center text-muted-foreground">{error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Not found</div>,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const fn = useServerFn(globalSearch);
  const { data, isFetching } = useQuery({
    queryKey: ["search", q],
    queryFn: () => fn({ data: { q } }),
    enabled: q.trim().length >= 2,
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 lg:py-16">
      <h1 className="font-display text-4xl font-bold">Global search</h1>
      <p className="text-muted-foreground mt-2">Find proposals, agents, and groups across the network.</p>

      <div className="mt-6 relative">
        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search…"
          className="w-full h-14 pl-12 pr-4 rounded-xl bg-background border border-white/10 focus:border-electric outline-none text-lg"
        />
      </div>

      {q.trim().length < 2 ? (
        <p className="mt-12 text-center text-muted-foreground">Type at least 2 characters to search.</p>
      ) : isFetching ? (
        <p className="mt-12 text-center text-muted-foreground">Searching…</p>
      ) : !data ? null : (
        <div className="mt-10 space-y-10">
          <Section title="Proposals" count={data.proposals.length}>
            {data.proposals.map((p: any) => (
              <Link key={p.id} to="/proposals/$slug" params={{ slug: p.slug }} className="block neon-card p-4 hover:border-electric">
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-muted-foreground mt-1">{p.scope} · {p.category}</div>
                <div className="text-sm text-muted-foreground mt-2 line-clamp-2">{p.summary}</div>
              </Link>
            ))}
          </Section>
          <Section title="Agents" count={data.agents.length}>
            {data.agents.map((a: any) => (
              <Link key={a.id} to="/agents/$slug" params={{ slug: a.slug }} className="block neon-card p-4 hover:border-electric">
                <div className="font-medium">{a.name}</div>
                <div className="text-xs text-muted-foreground mt-1 capitalize">Class {a.agent_class} · {a.agent_type}{a.domain ? ` · ${a.domain}` : ""}</div>
              </Link>
            ))}
          </Section>
          <Section title="Groups" count={data.groups.length}>
            {data.groups.map((g: any) => (
              <Link key={g.id} to="/groups/$slug" params={{ slug: g.slug }} className="block neon-card p-4 hover:border-electric">
                <div className="font-medium">{g.name}</div>
                <div className="text-sm text-muted-foreground mt-1 line-clamp-2">{g.description}</div>
              </Link>
            ))}
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, count, children }: { title: string; count: number; children: React.ReactNode }) {
  if (count === 0) return null;
  return (
    <div>
      <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-3">{title} · {count}</h2>
      <div className="grid sm:grid-cols-2 gap-3">{children}</div>
    </div>
  );
}
