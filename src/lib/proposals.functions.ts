import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listProposals = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("proposals")
      .select(`
        *,
        issues:issues(id, title, description, sort_order),
        latest_snapshot:consensus_snapshots(mean_score, median_score, vote_count)
      `)
      .in("status", ["open", "deliberating", "consensus"])
      .order("featured", { ascending: false })
      .order("published_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getProposal = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ slug: z.string() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: proposal, error } = await supabaseAdmin
      .from("proposals")
      .select(`
        *,
        issues:issues(id, title, description, sort_order, weight),
        snapshots:consensus_snapshots(mean_score, median_score, vote_count, snapshot_at)
      `)
      .eq("slug", data.slug)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!proposal) throw new Error("Proposal not found");
    return proposal;
  });

export const submitVote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({
      issue_id: z.string().uuid(),
      score: z.number().int().min(0).max(100),
      comment: z.string().max(1000).optional(),
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    const { error } = await supabase
      .from("score_votes")
      .upsert({
        issue_id: data.issue_id,
        user_id: userId,
        score: data.score,
        comment: data.comment ?? null,
      }, { onConflict: "issue_id,user_id" });

    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** The one overall vote a person casts on an action item. */
export const submitPrimaryVote = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({
      proposal_id: z.string().uuid(),
      score: z.number().int().min(0).max(100),
      comment: z.string().max(2000).optional(),
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    const { error } = await supabase
      .from("proposal_votes")
      .upsert(
        { proposal_id: data.proposal_id, user_id: userId, score: data.score, comment: data.comment ?? null },
        { onConflict: "proposal_id,user_id" },
      );
    if (error) throw new Error(error.message);
    return { ok: true };
  });

/** Public tally of overall votes on an action item. */
export const getPrimaryTally = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ proposal_id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("proposal_votes")
      .select("score")
      .eq("proposal_id", data.proposal_id);
    if (error) throw new Error(error.message);
    const scores = (rows ?? []).map((r) => r.score);
    const count = scores.length;
    const mean = count ? Math.round(scores.reduce((a, b) => a + b, 0) / count) : null;
    return { count, mean };
  });

/** Public list of overall votes on an action item, with comment and voter. */
export const listPrimaryVotes = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ proposal_id: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("proposal_votes")
      .select("score, comment, created_at, updated_at, profiles(username, display_name, avatar_url)")
      .eq("proposal_id", data.proposal_id)
      .order("updated_at", { ascending: false })
      .limit(100);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

/** The signed-in person's own votes on an action item. */
export const getMyVotes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) => z.object({ proposal_id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    const { data: primary } = await supabase
      .from("proposal_votes")
      .select("score, comment")
      .eq("proposal_id", data.proposal_id)
      .eq("user_id", userId)
      .maybeSingle();
    const { data: issues } = await supabase.from("issues").select("id").eq("proposal_id", data.proposal_id);
    const ids = (issues ?? []).map((i) => i.id);
    let subs: Record<string, number> = {};
    if (ids.length) {
      const { data: sv } = await supabase.from("score_votes").select("issue_id, score").in("issue_id", ids).eq("user_id", userId);
      subs = Object.fromEntries((sv ?? []).map((r) => [r.issue_id, r.score]));
    }
    return { primary: primary ?? null, subs };
  });


const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80) +
  "-" + Math.random().toString(36).slice(2, 7);

export const createProposal = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z.object({
      title: z.string().min(8).max(160),
      summary: z.string().min(20).max(500),
      description: z.string().min(40).max(8000),
      tags: z.array(z.string().min(1).max(40)).max(20).optional(),
      author_support: z.number().int().min(0).max(100).optional(),
      parent_public_id: z.string().max(40).optional(),
      issues: z.array(z.object({
        title: z.string().min(4).max(160),
        description: z.string().max(500).optional(),
      })).min(0).max(8).optional(),
    }).parse(data)
  )
  .handler(async ({ data, context }) => {
    const { userId, supabase } = context;
    const slug = slugify(data.title);

    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, username")
      .eq("id", userId)
      .maybeSingle();

    let parentId: string | null = null;
    if (data.parent_public_id) {
      const { data: parent } = await supabase
        .from("proposals")
        .select("id")
        .eq("public_id", data.parent_public_id.trim().toUpperCase())
        .maybeSingle();
      parentId = parent?.id ?? null;
    }

    const { data: created, error } = await supabase
      .from("proposals")
      .insert({
        slug,
        title: data.title,
        summary: data.summary,
        description: data.description,
        scope: "local",
        category: "General",
        tags: data.tags ?? [],
        author_support: data.author_support ?? null,
        parent_id: parentId,
        status: "open",
        author_id: userId,
        author_name: profile?.display_name ?? profile?.username ?? "Citizen",
        published_at: new Date().toISOString(),
      })
      .select("id, slug, public_id")
      .single();

    if (error) throw new Error(error.message);

    const issues = (data.issues ?? []).filter((i) => i.title.trim().length >= 4);
    if (issues.length > 0) {
      const issueRows = issues.map((iss, idx) => ({
        proposal_id: created.id,
        title: iss.title,
        description: iss.description ?? null,
        sort_order: idx,
      }));
      const { error: iErr } = await supabase.from("issues").insert(issueRows);
      if (iErr) throw new Error(iErr.message);
    }

    // Seal the action item into the local append-only record chain. This is the
    // same canonical document that will be dispatched to the CIVIC Protocol
    // node once the network endpoint is live (see civic-protocol.ts).
    let recordHash: string | null = null;
    try {
      const { createHash } = await import("crypto");
      const { data: prev } = await supabase
        .from("immutable_records")
        .select("content_hash")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const payload = {
        type: "ActionItem",
        action_id: created.public_id,
        slug: created.slug,
        title: data.title,
        summary: data.summary,
        tags: data.tags ?? [],
        author_support: data.author_support ?? null,
        parent_action_id: data.parent_public_id?.trim().toUpperCase() ?? null,
        sub_items: issues.map((i) => i.title),
        author_did: `did:civic:${userId}`,
        node: "civil.wc.tc",
        issued_at: new Date().toISOString(),
      };

      const content_hash = createHash("sha256")
        .update(JSON.stringify({ kind: "action_item", payload, prev: prev?.content_hash ?? null }))
        .digest("hex");

      await supabase.from("immutable_records").insert({
        kind: "action_item",
        ref_id: created.id,
        payload: payload as never,
        content_hash,
        previous_hash: prev?.content_hash ?? null,
        signer_user_id: userId,
      });
      recordHash = content_hash;
    } catch (e) {
      console.error("[CIVIC Protocol] action record failed", e);
    }

    return { slug: created.slug, public_id: created.public_id, record_hash: recordHash };
  });

export const listLeaderboard = createServerFn({ method: "GET" })
  .handler(async () => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, username, display_name, civic_points, level, streak_days, reputation, avatar_url")
      .order("civic_points", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const getMyCivicSummary = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, supabase } = context;

    const [{ data: profile }, { data: missions }, { data: badges }, { data: ledger }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("missions").select("*, user_missions!left(progress, completed, completed_at)").eq("user_missions.user_id", userId),
      supabase.from("user_badges").select("earned_at, badges(*)").eq("user_id", userId),
      supabase.from("pc_ledger").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(25),
    ]);

    return {
      profile,
      missions: missions ?? [],
      badges: badges ?? [],
      ledger: ledger ?? [],
    };
  });

export const listModerationQueue = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { userId, supabase } = context;
    const { data: isAdmin } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: proposals } = await supabaseAdmin
      .from("proposals")
      .select("id, slug, title, status, author_name, created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    const { count: voteCount } = await supabaseAdmin
      .from("score_votes")
      .select("*", { count: "exact", head: true });

    const { count: profileCount } = await supabaseAdmin
      .from("profiles")
      .select("*", { count: "exact", head: true });

    return {
      isAdmin: !!isAdmin,
      proposals: proposals ?? [],
      stats: {
        votes: voteCount ?? 0,
        citizens: profileCount ?? 0,
      },
    };
  });
