import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Metering for every model call.
 *
 * Agents are deliberately frugal: the platform's largest running expense is
 * tokens, so each call records what it cost and roughly how much energy it
 * used. Totals are aggregated per agent and for the whole site.
 */

/** USD per 1M tokens. Keep in sync with the Gemini price list. */
const PRICES: Record<string, { in: number; out: number }> = {
  "gemini-3.5-flash-lite": { in: 0.1, out: 0.4 },
  "gemini-3.7-flash": { in: 0.3, out: 2.5 },
};
const DEFAULT_PRICE = { in: 0.3, out: 2.5 };

/** Rough datacentre energy estimate: watt-hours per 1k tokens processed. */
const WH_PER_1K_TOKENS = 0.3;

export function estimateCost(model: string, input: number, output: number) {
  const p = PRICES[model] ?? DEFAULT_PRICE;
  const cost = (input / 1_000_000) * p.in + (output / 1_000_000) * p.out;
  const energy = ((input + output) / 1000) * WH_PER_1K_TOKENS;
  return { cost_usd: Number(cost.toFixed(6)), energy_wh: Number(energy.toFixed(4)) };
}

export async function recordUsage(input: {
  agentId?: string | null;
  userId?: string | null;
  purpose: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
}) {
  const { cost_usd, energy_wh } = estimateCost(input.model, input.inputTokens, input.outputTokens);
  const { error } = await supabaseAdmin.from("ai_usage").insert({
    agent_id: input.agentId ?? null,
    user_id: input.userId ?? null,
    purpose: input.purpose.slice(0, 60),
    model: input.model,
    input_tokens: input.inputTokens,
    output_tokens: input.outputTokens,
    cost_usd,
    energy_wh,
  });
  if (error) console.error("[ai usage] metering failed", error.message);
  return { cost_usd, energy_wh };
}
