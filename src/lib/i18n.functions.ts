import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const getTranslations = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ locale: z.string().min(2).max(5) }).parse(d))
  .handler(async ({ data }) => {
    const sb = createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
      auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
    });
    const [{ data: rows }, { data: enRows }] = await Promise.all([
      sb.from("translations").select("key, value").eq("locale", data.locale),
      sb.from("translations").select("key, value").eq("locale", "en"),
    ]);
    const map: Record<string, string> = {};
    for (const r of enRows ?? []) map[r.key] = r.value;
    for (const r of rows ?? []) map[r.key] = r.value;
    return map;
  });
