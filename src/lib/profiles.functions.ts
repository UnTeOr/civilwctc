import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

const publicClient = () =>
  createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

/** Public citizen/organization profile plus the agents that profile controls. */
export const getPublicProfile = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ username: z.string().min(1) }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();
    const handle = data.username.replace(/^@/, "");
    const { data: profile, error } = await sb
      .from("profiles")
      .select("id, username, display_name, bio, avatar_url, city, country, account_type, civic_points, xp, level, streak_days, reputation, verified, values_list, did")
      .ilike("username", handle)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!profile) throw new Error("Profile not found");

    const { data: agents } = await sb
      .from("agents")
      .select("id, slug, name, username, avatar_url, agent_class, agent_type, reputation")
      .eq("owner_id", profile.id)
      .eq("is_public", true)
      .order("reputation", { ascending: false });

    return { profile, agents: agents ?? [] };
  });

/** Everything an agent profile is linked to: its owner and the constituencies it represents. */
export const getAgentLinks = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ agentId: z.string().uuid(), ownerId: z.string().uuid().nullable().optional() }).parse(d))
  .handler(async ({ data }) => {
    const sb = publicClient();

    let owner = null as
      | { id: string; username: string | null; display_name: string | null; avatar_url: string | null; account_type: string }
      | null;
    if (data.ownerId) {
      const { data: p } = await sb
        .from("profiles")
        .select("id, username, display_name, avatar_url, account_type")
        .eq("id", data.ownerId)
        .maybeSingle();
      owner = p ?? null;
    }

    const { data: links } = await sb
      .from("group_agents")
      .select("role, groups(slug, name, username, is_tondo)")
      .eq("agent_id", data.agentId);

    const groups = (links ?? [])
      .map((l) => ({ role: l.role, group: (l as { groups: { slug: string; name: string; username: string | null; is_tondo: boolean } | null }).groups }))
      .filter((l) => l.group);

    return { owner, groups };
  });
