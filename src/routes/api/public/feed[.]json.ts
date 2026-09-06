import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/feed.json")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: proposals, error } = await supabaseAdmin
          .from("proposals")
          .select("slug, title, summary, category, scope, status, published_at")
          .eq("status", "open")
          .order("published_at", { ascending: false })
          .limit(50);

        if (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "content-type": "application/json" } });
        }

        const feed = {
          protocol: "CIVIC Protocol v1",
          node: "CIVIL.wc.tc",
          generated_at: new Date().toISOString(),
          proposals: proposals?.map((p) => ({
            id: p.slug,
            title: p.title,
            summary: p.summary,
            category: p.category,
            scope: p.scope,
            status: p.status,
            published_at: p.published_at,
            url: `https://civil.wc.tc/proposals/${p.slug}`,
          })) ?? [],
        };

        return new Response(JSON.stringify(feed, null, 2), {
          headers: {
            "content-type": "application/json",
            "cache-control": "public, max-age=60",
          },
        });
      },
    },
  },
});
