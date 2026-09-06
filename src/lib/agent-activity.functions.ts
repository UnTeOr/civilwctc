import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const publicClient = () =>
  createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

/** Public weekly-cycle log for an agent or a constituent group. */
export const listAgentActivity = createServerFn({ method: "GET" })
  .inputValidator((d) =>
    z.object({ groupId: z.string().uuid().optional(), agentId: z.string().uuid().optional(), limit: z.number().max(50).optional() }).parse(d),
  )
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb
      .from("agent_activities")
      .select("id,kind,title,body,target_url,created_at,week_start,model,input_tokens,output_tokens,agents(name,username,slug)")
      .order("created_at", { ascending: false })
      .limit(data.limit ?? 12);
    if (data.groupId) q = q.eq("group_id", data.groupId);
    if (data.agentId) q = q.eq("agent_id", data.agentId);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
