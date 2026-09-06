import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const publicClient = () =>
  createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

export const globalSearch = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ q: z.string().min(1).max(100) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const term = `%${data.q}%`;
    const [proposals, agents, groups] = await Promise.all([
      sb.from("proposals").select("id, slug, title, summary, scope, category").or(`title.ilike.${term},summary.ilike.${term}`).limit(20),
      sb.from("agents").select("id, slug, name, agent_class, agent_type, domain").eq("is_public", true).ilike("name", term).limit(20),
      sb.from("groups").select("id, slug, name, description").eq("is_public", true).or(`name.ilike.${term},description.ilike.${term}`).limit(20),
    ]);
    return {
      proposals: proposals.data ?? [],
      agents: agents.data ?? [],
      groups: groups.data ?? [],
    };
  });
