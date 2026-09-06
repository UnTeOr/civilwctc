import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { createHash } from "crypto";

const publicClient = () =>
  createClient<Database>(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
  });

const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

export const listRecords = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ kind: z.string().optional(), limit: z.number().min(1).max(200).optional() }).optional().parse(d ?? {}))
  .handler(async ({ data }) => {
    const sb = publicClient();
    let q = sb.from("immutable_records").select("*").order("created_at", { ascending: false }).limit(data?.limit ?? 50);
    if (data?.kind) q = q.eq("kind", data.kind);
    const { data: rows, error } = await q;
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const appendRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({
    kind: z.string().min(2).max(40),
    ref_id: z.string().uuid().optional(),
    payload: z.record(z.string(), z.unknown()),
    wallet_address: z.string().optional(),
    signature: z.string().optional(),
  }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: prev } = await supabase
      .from("immutable_records")
      .select("content_hash")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const canonical = JSON.stringify({ kind: data.kind, ref_id: data.ref_id, payload: data.payload, signer: userId, prev: prev?.content_hash ?? null });
    const content_hash = sha256(canonical);

    const { data: row, error } = await supabase.from("immutable_records").insert({
      kind: data.kind,
      ref_id: data.ref_id ?? null,
      payload: data.payload as any,
      content_hash,
      previous_hash: prev?.content_hash ?? null,
      wallet_address: data.wallet_address ?? null,
      signature: data.signature ?? null,
      signer_user_id: userId,
    }).select("id, content_hash, previous_hash, created_at").single();

    if (error) throw new Error(error.message);
    return row;
  });
