/**
 * CIVIC Protocol node sync (server-only).
 *
 * CIVIL.wc.tc is node `civilwctc` on the protocol. This module:
 *  - pulls the network snapshot into the local read-only mirror tables
 *    (network_nodes / network_identities / network_actions / network_action_totals)
 *  - pushes this node's own records (profiles, proposals, votes, totals)
 *    to the protocol ingest endpoint, authenticated with the node key.
 *
 * Mirror rows are never pushed back; only local records ever leave this node.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export const NODE_SLUG = "civilwctc";
export const PROTOCOL_BASE = "https://civic.wc.tc";

const SYNC_ID = "civic";

// ---------------------------------------------------------------------------
// Types matching the protocol guide
// ---------------------------------------------------------------------------
interface Snapshot {
  generated_at?: string;
  nodes?: Array<{ slug: string; name?: string; url?: string; status?: string }>;
  identities?: Array<{
    did: string;
    username?: string | null;
    type?: string | null;
    display_name?: string | null;
    home_node?: string;
    node_slug?: string;
    also_on?: string[];
    updated_at?: string | null;
  }>;
  actions?: Array<{
    id: string;
    title: string;
    summary?: string | null;
    status?: string | null;
    closes_at?: string | null;
    origin_node?: string;
    node_slug?: string;
    updated_at?: string | null;
  }>;
  action_node_totals?: Array<{
    action_id: string;
    node_slug: string;
    votes_for?: number;
    votes_against?: number;
    approval?: number | null;
    updated_at?: string | null;
  }>;
}

interface IngestPayload {
  identities: Array<Record<string, unknown>>;
  actions: Array<Record<string, unknown>>;
  totals: Array<Record<string, unknown>>;
  votes: Array<Record<string, unknown>>;
}

// ---------------------------------------------------------------------------
// Pull: protocol -> local mirror
// ---------------------------------------------------------------------------
export async function pullNetworkSnapshot(admin: SupabaseClient): Promise<{ ok: boolean; counts: Record<string, number>; generatedAt?: string }> {
  const { data: state } = await admin
    .from("protocol_sync_state")
    .select("last_synced_at")
    .eq("id", SYNC_ID)
    .maybeSingle();

  const params = new URLSearchParams({ exclude_node: NODE_SLUG });
  if (state?.last_synced_at) params.set("since", state.last_synced_at);

  const res = await fetch(`${PROTOCOL_BASE}/api/public/snapshot?${params}`, {
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error(`snapshot fetch failed: ${res.status}`);
  const snap = (await res.json()) as Snapshot;

  const counts = { nodes: 0, identities: 0, actions: 0, totals: 0 };

  if (snap.nodes?.length) {
    const rows = snap.nodes
      .filter((n) => n.slug && n.slug !== NODE_SLUG)
      .map((n) => ({ slug: n.slug, name: n.name ?? n.slug, url: n.url ?? null, status: n.status ?? "unknown", synced_at: new Date().toISOString() }));
    if (rows.length) {
      const { error } = await admin.from("network_nodes").upsert(rows);
      if (error) throw new Error(`network_nodes upsert: ${error.message}`);
      counts.nodes = rows.length;
    }
  }

  if (snap.identities?.length) {
    const rows = snap.identities
      .filter((i) => i.did && (i.home_node ?? i.node_slug) !== NODE_SLUG)
      .map((i) => ({
        did: i.did,
        username: i.username ?? null,
        type: i.type ?? null,
        display_name: i.display_name ?? null,
        home_node: i.home_node ?? i.node_slug ?? "unknown",
        also_on: i.also_on ?? [],
        updated_at: i.updated_at ?? null,
        synced_at: new Date().toISOString(),
      }));
    if (rows.length) {
      const { error } = await admin.from("network_identities").upsert(rows);
      if (error) throw new Error(`network_identities upsert: ${error.message}`);
      counts.identities = rows.length;
    }
  }

  if (snap.actions?.length) {
    const rows = snap.actions
      .filter((a) => a.id && (a.origin_node ?? a.node_slug) !== NODE_SLUG)
      .map((a) => ({
        id: a.id,
        title: a.title,
        summary: a.summary ?? null,
        status: a.status ?? null,
        closes_at: a.closes_at ?? null,
        origin_node: a.origin_node ?? a.node_slug ?? "unknown",
        updated_at: a.updated_at ?? null,
        synced_at: new Date().toISOString(),
      }));
    if (rows.length) {
      const { error } = await admin.from("network_actions").upsert(rows);
      if (error) throw new Error(`network_actions upsert: ${error.message}`);
      counts.actions = rows.length;
    }
  }

  if (snap.action_node_totals?.length) {
    const rows = snap.action_node_totals
      .filter((t) => t.action_id && t.node_slug && t.node_slug !== NODE_SLUG)
      .map((t) => ({
        action_id: t.action_id,
        node_slug: t.node_slug,
        votes_for: t.votes_for ?? 0,
        votes_against: t.votes_against ?? 0,
        approval: t.approval ?? null,
        updated_at: t.updated_at ?? null,
        synced_at: new Date().toISOString(),
      }));
    if (rows.length) {
      const { error } = await admin.from("network_action_totals").upsert(rows);
      if (error) throw new Error(`network_action_totals upsert: ${error.message}`);
      counts.totals = rows.length;
    }
  }

  await admin
    .from("protocol_sync_state")
    .update({ last_synced_at: snap.generated_at ?? new Date().toISOString(), last_run_at: new Date().toISOString(), last_error: null })
    .eq("id", SYNC_ID);

  return { ok: true, counts, generatedAt: snap.generated_at };
}

// ---------------------------------------------------------------------------
// Push: local records -> protocol ingest
// ---------------------------------------------------------------------------
function mapVoteChoice(score: number): "for" | "against" | "abstain" {
  if (score >= 60) return "for";
  if (score <= 40) return "against";
  return "abstain";
}

export async function pushLocalChanges(admin: SupabaseClient): Promise<{ ok: boolean; pushed: Record<string, number>; skipped?: string }> {
  const nodeKey = process.env["CIVIC_NODE_KEY"];
  if (!nodeKey) return { ok: true, pushed: {}, skipped: "CIVIC_NODE_KEY not configured" };

  const { data: state } = await admin
    .from("protocol_sync_state")
    .select("last_pushed_at")
    .eq("id", SYNC_ID)
    .maybeSingle();
  const since = state?.last_pushed_at ?? "1970-01-01T00:00:00Z";
  const now = new Date().toISOString();

  const payload: IngestPayload = { identities: [], actions: [], totals: [], votes: [] };

  // Identities: profiles with a username, changed since last push.
  const { data: profiles, error: pErr } = await admin
    .from("profiles")
    .select("id, username, display_name, account_type, did, updated_at")
    .not("username", "is", null)
    .gt("updated_at", since)
    .limit(500);
  if (pErr) throw new Error(`profiles read: ${pErr.message}`);
  const didByUser = new Map<string, string>();
  for (const p of profiles ?? []) {
    const did = p.did ?? `did:civic:${NODE_SLUG}:${p.id}`;
    didByUser.set(p.id, did);
    payload.identities.push({
      did,
      username: p.username,
      type: p.account_type === "agent" ? "agent" : p.account_type === "organization" ? "organization" : "human",
      display_name: p.display_name ?? p.username,
    });
  }

  // Actions: published proposals changed since last push.
  const { data: proposals, error: prErr } = await admin
    .from("proposals")
    .select("id, public_id, title, summary, status, target_date, updated_at")
    .eq("moderation_status", "approved")
    .gt("updated_at", since)
    .limit(200);
  if (prErr) throw new Error(`proposals read: ${prErr.message}`);
  const publicIdByProposal = new Map<string, string>();
  for (const pr of proposals ?? []) {
    publicIdByProposal.set(pr.id, pr.public_id);
    payload.actions.push({
      id: pr.public_id,
      title: pr.title,
      summary: pr.summary,
      status: pr.status,
      closes_at: pr.target_date,
    });
  }

  // Votes changed since last push (with voter DID + proposal public id).
  const { data: votes, error: vErr } = await admin
    .from("proposal_votes")
    .select("proposal_id, user_id, score, updated_at")
    .gt("updated_at", since)
    .limit(500);
  if (vErr) throw new Error(`votes read: ${vErr.message}`);

  const changedProposalIds = new Set<string>();
  const missingUserIds = new Set<string>();
  const missingProposalIds = new Set<string>();
  for (const v of votes ?? []) {
    changedProposalIds.add(v.proposal_id);
    if (!didByUser.has(v.user_id)) missingUserIds.add(v.user_id);
    if (!publicIdByProposal.has(v.proposal_id)) missingProposalIds.add(v.proposal_id);
  }
  if (missingUserIds.size) {
    const { data: extraProfiles } = await admin
      .from("profiles")
      .select("id, username, did")
      .in("id", [...missingUserIds]);
    for (const p of extraProfiles ?? []) {
      if (p.username) didByUser.set(p.id, p.did ?? `did:civic:${NODE_SLUG}:${p.id}`);
    }
  }
  if (missingProposalIds.size) {
    const { data: extraProps } = await admin
      .from("proposals")
      .select("id, public_id")
      .in("id", [...missingProposalIds]);
    for (const pr of extraProps ?? []) publicIdByProposal.set(pr.id, pr.public_id);
  }

  const usernameByDid = new Map<string, string>();
  for (const [uid, did] of didByUser) {
    const prof = (profiles ?? []).find((p) => p.id === uid);
    if (prof?.username) usernameByDid.set(did, prof.username);
  }
  // Fill usernames for extra profiles too.
  if (missingUserIds.size) {
    const { data: extraProfiles } = await admin
      .from("profiles")
      .select("id, username")
      .in("id", [...missingUserIds]);
    for (const p of extraProfiles ?? []) {
      const did = didByUser.get(p.id);
      if (did && p.username) usernameByDid.set(did, p.username);
    }
  }

  for (const v of votes ?? []) {
    const actionId = publicIdByProposal.get(v.proposal_id);
    const did = didByUser.get(v.user_id);
    if (!actionId || !did) continue;
    payload.votes.push({
      action_id: actionId,
      did,
      username: usernameByDid.get(did) ?? null,
      choice: mapVoteChoice(v.score),
      weight: 1,
      cast_at: v.updated_at,
    });
  }

  // Totals: full current tally for every proposal with changed votes.
  for (const proposalId of changedProposalIds) {
    const actionId = publicIdByProposal.get(proposalId);
    if (!actionId) continue;
    const { data: allVotes } = await admin
      .from("proposal_votes")
      .select("score")
      .eq("proposal_id", proposalId);
    const scores = (allVotes ?? []).map((r) => r.score);
    const votesFor = scores.filter((s) => s >= 60).length;
    const votesAgainst = scores.filter((s) => s <= 40).length;
    const approval = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    payload.totals.push({ action_id: actionId, votes_for: votesFor, votes_against: votesAgainst, approval });
  }

  if (!payload.identities.length && !payload.actions.length && !payload.totals.length && !payload.votes.length) {
    return { ok: true, pushed: { identities: 0, actions: 0, totals: 0, votes: 0 } };
  }

  const res = await fetch(`${PROTOCOL_BASE}/api/public/ingest`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-node-key": nodeKey },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`ingest failed: ${res.status} ${body.slice(0, 200)}`);
  }

  await admin
    .from("protocol_sync_state")
    .update({ last_pushed_at: now, last_run_at: now, last_error: null })
    .eq("id", SYNC_ID);

  return {
    ok: true,
    pushed: {
      identities: payload.identities.length,
      actions: payload.actions.length,
      totals: payload.totals.length,
      votes: payload.votes.length,
    },
  };
}

// ---------------------------------------------------------------------------
export async function runProtocolSync(): Promise<Record<string, unknown>> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const result: Record<string, unknown> = { ok: true, node: NODE_SLUG };
  try {
    result.pull = await pullNetworkSnapshot(supabaseAdmin);
  } catch (e) {
    result.ok = false;
    result.pullError = e instanceof Error ? e.message : String(e);
  }
  try {
    result.push = await pushLocalChanges(supabaseAdmin);
  } catch (e) {
    result.ok = false;
    result.pushError = e instanceof Error ? e.message : String(e);
  }
  if (!result.ok) {
    await supabaseAdmin
      .from("protocol_sync_state")
      .update({ last_error: String(result.pullError ?? result.pushError ?? "unknown"), last_run_at: new Date().toISOString() })
      .eq("id", SYNC_ID);
  }
  return result;
}
