import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const publicClient = () =>
  createClient<Database>(process.env["SUPABASE_URL"]!, process.env["SUPABASE_PUBLISHABLE_KEY"]!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

export type UsageTotals = {
  calls: number;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  energy_wh: number;
};

/** Tokens, cost and energy used by one agent, plus its recent calls. */
export const getAgentUsage = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ agentId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const [{ data: totals }, { data: recent }] = await Promise.all([
      sb.rpc("agent_usage_totals", { _agent_id: data.agentId }),
      sb
        .from("ai_usage")
        .select("purpose,model,input_tokens,output_tokens,cost_usd,energy_wh,created_at")
        .eq("agent_id", data.agentId)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);
    const t = (Array.isArray(totals) ? totals[0] : totals) as UsageTotals | undefined;
    return {
      totals: {
        calls: Number(t?.calls ?? 0),
        input_tokens: Number(t?.input_tokens ?? 0),
        output_tokens: Number(t?.output_tokens ?? 0),
        cost_usd: Number(t?.cost_usd ?? 0),
        energy_wh: Number(t?.energy_wh ?? 0),
      },
      recent: recent ?? [],
    };
  });

/** Site-wide totals across every agent and conversation. */
export const getSiteUsage = createServerFn({ method: "GET" }).handler(async () => {
  const sb = publicClient();
  const { data } = await sb.rpc("site_usage_totals");
  const t = (Array.isArray(data) ? data[0] : data) as (UsageTotals & { agents: number }) | undefined;
  return {
    calls: Number(t?.calls ?? 0),
    input_tokens: Number(t?.input_tokens ?? 0),
    output_tokens: Number(t?.output_tokens ?? 0),
    cost_usd: Number(t?.cost_usd ?? 0),
    energy_wh: Number(t?.energy_wh ?? 0),
    agents: Number(t?.agents ?? 0),
  };
});

/** What the agent has told itself to work on next. */
export const listAgentAgenda = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ agentId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const { data: rows } = await sb
      .from("agent_agenda")
      .select("id,kind,title,focus,keywords,priority,status,created_at,done_at")
      .eq("agent_id", data.agentId)
      .order("status", { ascending: true })
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(20);
    return rows ?? [];
  });
