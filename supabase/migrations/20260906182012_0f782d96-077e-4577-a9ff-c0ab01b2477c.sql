CREATE TABLE public.network_nodes (
  slug TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT,
  status TEXT NOT NULL DEFAULT 'unknown',
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.network_nodes TO anon, authenticated;
GRANT ALL ON public.network_nodes TO service_role;
ALTER TABLE public.network_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Network nodes are public" ON public.network_nodes FOR SELECT USING (true);

CREATE TABLE public.network_identities (
  did TEXT PRIMARY KEY,
  username TEXT,
  type TEXT,
  display_name TEXT,
  home_node TEXT NOT NULL,
  also_on TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX network_identities_home_node_idx ON public.network_identities (home_node);
GRANT SELECT ON public.network_identities TO anon, authenticated;
GRANT ALL ON public.network_identities TO service_role;
ALTER TABLE public.network_identities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Network identities are public" ON public.network_identities FOR SELECT USING (true);

CREATE TABLE public.network_actions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  summary TEXT,
  status TEXT,
  closes_at TIMESTAMPTZ,
  origin_node TEXT NOT NULL,
  updated_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX network_actions_origin_node_idx ON public.network_actions (origin_node);
GRANT SELECT ON public.network_actions TO anon, authenticated;
GRANT ALL ON public.network_actions TO service_role;
ALTER TABLE public.network_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Network actions are public" ON public.network_actions FOR SELECT USING (true);

CREATE TABLE public.network_action_totals (
  action_id TEXT NOT NULL,
  node_slug TEXT NOT NULL,
  votes_for INTEGER NOT NULL DEFAULT 0,
  votes_against INTEGER NOT NULL DEFAULT 0,
  approval NUMERIC,
  updated_at TIMESTAMPTZ,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (action_id, node_slug)
);
GRANT SELECT ON public.network_action_totals TO anon, authenticated;
GRANT ALL ON public.network_action_totals TO service_role;
ALTER TABLE public.network_action_totals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Network totals are public" ON public.network_action_totals FOR SELECT USING (true);

CREATE TABLE public.protocol_sync_state (
  id TEXT PRIMARY KEY,
  last_synced_at TIMESTAMPTZ,
  last_pushed_at TIMESTAMPTZ,
  last_run_at TIMESTAMPTZ,
  last_error TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.protocol_sync_state TO anon, authenticated;
GRANT ALL ON public.protocol_sync_state TO service_role;
ALTER TABLE public.protocol_sync_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sync state is public" ON public.protocol_sync_state FOR SELECT USING (true);

INSERT INTO public.protocol_sync_state (id) VALUES ('civic');