/** Small label showing which CIVIC Protocol node an item comes from. */
export function NodeTag({ name, local = false }: { name: string; local?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${
        local
          ? "bg-electric/10 text-electric border-electric/30"
          : "bg-violet/10 text-violet border-violet/30"
      }`}
      title={local ? "Created on this node" : `Mirrored from ${name}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${local ? "bg-electric" : "bg-violet"}`} />
      {name}
    </span>
  );
}

export const LOCAL_NODE_NAME = "CIVIL.wc.tc";
