import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertMod(ctx: { supabase: any; userId: string }) {
  const { data: isAdmin } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  const { data: isMod } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "moderator" });
  if (!isAdmin && !isMod) throw new Error("Forbidden");
  return { isAdmin: !!isAdmin, isMod: !!isMod };
}

export const moderateProposal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    proposal_id: z.string().uuid(),
    action: z.enum(["approve", "reject", "feature", "unfeature", "flag"]),
    reason: z.string().max(500).optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertMod(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const patch: { moderation_status?: string; featured?: boolean } = {};
    if (data.action === "approve") patch.moderation_status = "approved";
    if (data.action === "reject") patch.moderation_status = "rejected";
    if (data.action === "feature") patch.featured = true;
    if (data.action === "unfeature") patch.featured = false;

    if (Object.keys(patch).length) {
      const { error } = await supabaseAdmin.from("proposals").update(patch as any).eq("id", data.proposal_id);
      if (error) throw new Error(error.message);
    }

    await supabaseAdmin.from("moderation_actions").insert({
      moderator_id: context.userId,
      target_kind: "proposal",
      target_id: data.proposal_id,
      action: data.action,
      reason: data.reason ?? null,
    });

    await supabaseAdmin.from("audit_log").insert({
      actor_id: context.userId,
      action: `moderation.${data.action}`,
      target_kind: "proposal",
      target_id: data.proposal_id,
      details: { reason: data.reason ?? null },
    });

    return { ok: true };
  });

export const listAuditLog = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertMod(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("audit_log").select("*").order("created_at", { ascending: false }).limit(100);
    if (error) throw new Error(error.message);
    return data ?? [];
  });
