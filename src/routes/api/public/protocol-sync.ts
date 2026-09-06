import { createFileRoute } from "@tanstack/react-router";

/**
 * CIVIC Protocol sync trigger.
 * Schedule every 5 minutes: pulls the network snapshot into the local mirror
 * and pushes this node's changed records to the protocol.
 * Requires the shared cron secret in the x-cron-key header.
 */
export const Route = createFileRoute("/api/public/protocol-sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const provided = request.headers.get("x-cron-key");
        if (!provided) return new Response("Unauthorized", { status: 401 });
        let ok = provided === process.env["AGENT_CRON_SECRET"];
        if (!ok) {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data } = await supabaseAdmin.from("app_cron_keys").select("key").eq("name", "protocol-sync").maybeSingle();
          ok = !!data?.key && data.key === provided;
        }
        if (!ok) return new Response("Unauthorized", { status: 401 });

        try {
          const { runProtocolSync } = await import("@/lib/civic-sync.server");
          const result = await runProtocolSync();
          return Response.json(result, { status: result.ok ? 200 : 500 });
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          return Response.json({ ok: false, error: message }, { status: 500 });
        }
      },
    },
  },
});
