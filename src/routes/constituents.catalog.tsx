import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listCatalog, activateConstituent } from "@/lib/constituents.functions";
import { useAuth } from "@/hooks/use-auth";
import { Search, Zap, Check, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/constituents/catalog")({
  head: () => ({
    meta: [
      { title: "Constituent Catalog — CIVIL.wc.tc" },
      { name: "description", content: "Browse every category, type and constituent group in the CIVIC Protocol and activate one as a TONDO with its own representative agent." },
      { property: "og:title", content: "Constituent Catalog" },
      { property: "og:description", content: "Activate a constituency as a TONDO — it gets its own @username, profile and representative agent." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CatalogPage,
  errorComponent: ({ error }) => <div className="p-10 text-center text-muted-foreground">{error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Not found</div>,
});

function CatalogPage() {
  const fn = useServerFn(listCatalog);
  const activateFn = useServerFn(activateConstituent);
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [openCat, setOpenCat] = useState<string | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ["catalog"], queryFn: () => fn() });

  const activate = useMutation({
    mutationFn: (key: string) => activateFn({ data: { key } }),
    onSuccess: (r) => {
      toast.success(r.alreadyActive ? "Already active" : "Constituent group activated — its agent is now researching it");
      qc.invalidateQueries({ queryKey: ["catalog"] });
      navigate({ to: "/groups/$slug", params: { slug: r.slug } });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not activate"),
  });

  const grouped = useMemo(() => {
    const entries = data?.entries ?? [];
    const search = q.toLowerCase().trim();
    const shown = search
      ? entries.filter((e: any) =>
          e.name.toLowerCase().includes(search) ||
          (e.description ?? "").toLowerCase().includes(search) ||
          e.master_category.toLowerCase().includes(search) ||
          (e.group_type ?? "").toLowerCase().includes(search))
      : entries;
    const map = new Map<string, any[]>();
    for (const e of shown) {
      if (!map.has(e.master_category)) map.set(e.master_category, []);
      map.get(e.master_category)!.push(e);
    }
    return Array.from(map.entries());
  }, [data, q]);

  const active = data?.active ?? {};

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 lg:py-16">
      <span className="text-xs uppercase tracking-[0.2em] text-emerald">Catalog</span>
      <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3">Every constituency, one click away.</h1>
      <p className="mt-3 text-muted-foreground max-w-3xl">
        Activate any constituency and it becomes a TONDO: an open representative body inside the CIVIC Protocol with its
        own @username and profile, and a Class T representative agent that names itself, researches the constituency and
        speaks for it over time. Anyone can join a TONDO and shape what it stands for.
      </p>

      <div className="mt-8 flex items-center gap-2 max-w-md px-3 rounded-lg border border-white/10 bg-white/[0.03]">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search constituencies…"
          className="w-full bg-transparent outline-none text-sm py-2.5"
        />
      </div>

      {isLoading && <p className="mt-10 text-sm text-muted-foreground">Loading the catalog…</p>}

      <div className="mt-10 space-y-4">
        {grouped.map(([cat, rows]) => {
          const header = rows.find((r: any) => r.scope === "category");
          const types = rows.filter((r: any) => r.scope === "type");
          const entries = rows.filter((r: any) => r.scope === "entry");
          const open = openCat === cat || !!q;
          return (
            <section key={cat} className="neon-card overflow-hidden">
              <button
                onClick={() => setOpenCat(open && !q ? null : cat)}
                className="w-full text-left p-6 flex items-start justify-between gap-4"
              >
                <div>
                  <h2 className="font-display text-2xl font-semibold">{cat}</h2>
                  {header?.description && <p className="text-sm text-muted-foreground mt-1">{header.description}</p>}
                  <p className="text-xs text-muted-foreground mt-2">{types.length} types · {entries.length} groups ready to activate</p>
                </div>
                <span className="text-electric text-sm shrink-0">{open ? "Hide" : "Explore"}</span>
              </button>

              {open && (
                <div className="px-6 pb-6 space-y-5">
                  {types.map((t: any) => {
                    const kids = entries.filter((e: any) => e.group_type === t.group_type);
                    return (
                      <div key={t.key}>
                        <div className="flex items-start justify-between gap-3 border-t border-white/5 pt-4">
                          <div>
                            <h3 className="font-medium">{t.name}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                          </div>
                          <ActivateButton entry={t} active={active} user={user} activate={activate} />
                        </div>
                        {kids.length > 0 && (
                          <ul className="mt-3 grid sm:grid-cols-2 gap-2">
                            {kids.map((e: any) => (
                              <li key={e.key} className="flex items-start justify-between gap-3 rounded-lg bg-white/[0.03] border border-white/5 p-3">
                                <div>
                                  <div className="text-sm font-medium">{e.name}</div>
                                  <div className="text-xs text-muted-foreground">{e.description}</div>
                                </div>
                                <ActivateButton entry={e} active={active} user={user} activate={activate} />
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ActivateButton({ entry, active, user, activate }: { entry: any; active: any; user: any; activate: any }) {
  const live = active[entry.key];
  if (live) {
    return (
      <Link to="/groups/$slug" params={{ slug: live.slug }} className="shrink-0 h-8 px-3 inline-flex items-center gap-1.5 rounded-md border border-emerald/40 bg-emerald/10 text-emerald text-xs">
        <Check className="h-3 w-3" /> Live
      </Link>
    );
  }
  if (!user) {
    return (
      <Link to="/auth" search={{ mode: "signin" }} className="shrink-0 h-8 px-3 inline-flex items-center gap-1.5 rounded-md border border-white/10 text-xs text-muted-foreground hover:text-foreground">
        <Users className="h-3 w-3" /> Sign in
      </Link>
    );
  }
  const pending = activate.isPending && activate.variables === entry.key;
  return (
    <button
      onClick={() => activate.mutate(entry.key)}
      disabled={activate.isPending}
      className="shrink-0 h-8 px-3 inline-flex items-center gap-1.5 rounded-md bg-aurora text-white text-xs font-medium disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Zap className="h-3 w-3" />}
      {pending ? "Activating…" : "Activate"}
    </button>
  );
}
