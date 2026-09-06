import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ShieldCheck } from "lucide-react";
import { listRecords } from "@/lib/records.functions";

export const Route = createFileRoute("/records")({
  head: () => ({
    meta: [
      { title: "Immutable Records — CIVIL.wc.tc" },
      { name: "description", content: "Append-only, hash-chained ledger of civic actions, signed proposals, and votes." },
    ],
  }),
  component: RecordsPage,
  errorComponent: ({ error }) => <div className="p-10 text-center text-muted-foreground">{error.message}</div>,
  notFoundComponent: () => <div className="p-10 text-center">Not found</div>,
});

function RecordsPage() {
  const fn = useServerFn(listRecords);
  const { data } = useSuspenseQuery({ queryKey: ["records"], queryFn: () => fn({ data: { limit: 100 } }) });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 lg:py-16">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-emerald" />
        <div>
          <span className="text-xs uppercase tracking-[0.2em] text-emerald">Immutable</span>
          <h1 className="font-display text-4xl font-bold">Record chain</h1>
        </div>
      </div>
      <p className="mt-3 text-muted-foreground max-w-2xl">
        Every signed civic action appends a record. Each record's hash links to the previous, forming a verifiable chain. Wallet signatures, when present, prove the actor.
      </p>

      <div className="mt-10 space-y-3">
        {data.length === 0 && <div className="neon-card p-10 text-center text-muted-foreground">No records yet — sign a vote or proposal to seed the chain.</div>}
        {data.map((r) => (
          <article key={r.id} className="neon-card p-5">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="px-2 py-0.5 rounded-full bg-electric/10 text-electric uppercase tracking-wider">{r.kind}</span>
              <span className="text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
              {r.wallet_address && (
                <span className="font-mono text-emerald">{r.wallet_address.slice(0, 6)}…{r.wallet_address.slice(-4)}</span>
              )}
            </div>
            <div className="mt-3 grid sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <div className="text-muted-foreground uppercase tracking-wider">Hash</div>
                <div className="break-all text-foreground/90">{r.content_hash}</div>
              </div>
              {r.previous_hash && (
                <div>
                  <div className="text-muted-foreground uppercase tracking-wider">Previous</div>
                  <div className="break-all text-muted-foreground">{r.previous_hash}</div>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
