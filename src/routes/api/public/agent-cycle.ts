import { createFileRoute } from "@tanstack/react-router";

/**
 * Weekly constituent-agent cycle trigger.
 * Called on a schedule (hourly is fine — agents are staggered across the week).
 * Requires the shared cron secret in the x-cron-key header.
 */
export const Route = createFileRoute("/api/public/agent-cycle")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const provided = request.headers.get("x-cron-key");
        if (!provided) return new Response("Unauthorized", { status: 401 });
        let ok = provided === process.env["AGENT_CRON_SECRET"];
        if (!ok) {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data } = await supabaseAdmin.from("app_cron_keys").select("key").eq("name", "agent-cycle").maybeSingle();
          ok = !!data?.key && data.key === provided;
        }
        if (!ok) return new Response("Unauthorized", { status: 401 });

        const url = new URL(request.url);
        const force = url.searchParams.get("force") === "1";
        try {
          const { runWeeklyAgentCycle } = await import("@/lib/agent-cycle.server");
          const result = await runWeeklyAgentCycle({ force });
          return Response.json(result);
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return Response.json({ ok: false, error: message }, { status: 500 });
        }
      },
    },
  },
});
