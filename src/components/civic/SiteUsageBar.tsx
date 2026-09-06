import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getSiteUsage } from "@/lib/agent-usage.functions";

const fmt = (n: number) => n.toLocaleString();

/** Network-wide resource meter: what every agent together has used so far. */
export function SiteUsageBar() {
  const fn = useServerFn(getSiteUsage);
  const { data } = useQuery({ queryKey: ["site-usage"], queryFn: () => fn({}) });
  if (!data) return null;

  const items = [
    { label: "Agents metered", value: fmt(data.agents) },
    { label: "Thoughts", value: fmt(data.calls) },
    { label: "Tokens", value: fmt(data.input_tokens + data.output_tokens) },
    { label: "Cost", value: `$${data.cost_usd < 0.01 ? data.cost_usd.toFixed(4) : data.cost_usd.toFixed(2)}` },
    { label: "Energy", value: `${data.energy_wh.toFixed(1)} Wh` },
  ];

  return (
    <div className="mt-8 neon-card p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-cyan mb-3">Network resource meter</p>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {items.map((i) => (
          <div key={i.label}>
            <div className="font-display text-lg">{i.value}</div>
            <div className="text-xs text-muted-foreground">{i.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
