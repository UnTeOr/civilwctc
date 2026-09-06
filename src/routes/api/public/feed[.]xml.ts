import { createFileRoute } from "@tanstack/react-router";

const esc = (s: string) =>
  s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));

export const Route = createFileRoute("/api/public/feed.xml")({
  server: {
    handlers: {
      GET: async () => {
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: proposals, error } = await supabaseAdmin
          .from("proposals")
          .select("slug, title, summary, category, scope, status, published_at, author_name")
          .in("status", ["open", "deliberating", "consensus"])
          .order("published_at", { ascending: false })
          .limit(50);

        if (error) {
          return new Response(`<?xml version="1.0"?><error>${esc(error.message)}</error>`, {
            status: 500,
            headers: { "content-type": "application/xml" },
          });
        }

        const items = (proposals ?? []).map((p) => `
    <item>
      <title>${esc(p.title)}</title>
      <link>https://civil.wc.tc/proposals/${esc(p.slug)}</link>
      <guid isPermaLink="true">https://civil.wc.tc/proposals/${esc(p.slug)}</guid>
      <description>${esc(p.summary)}</description>
      <category>${esc(p.category)}</category>
      <category>${esc(p.scope)}</category>
      ${p.author_name ? `<author>${esc(p.author_name)}</author>` : ""}
      ${p.published_at ? `<pubDate>${new Date(p.published_at).toUTCString()}</pubDate>` : ""}
    </item>`).join("");

        const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>CIVIL.wc.tc — Live Proposals</title>
    <link>https://civil.wc.tc/proposals</link>
    <description>Live civic proposals from the CIVIC Protocol network.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

        return new Response(xml, {
          headers: {
            "content-type": "application/rss+xml; charset=utf-8",
            "cache-control": "public, max-age=120",
          },
        });
      },
    },
  },
});
