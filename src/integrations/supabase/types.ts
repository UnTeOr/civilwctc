export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      agent_activities: {
        Row: {
          agent_id: string
          body: string | null
          created_at: string
          group_id: string | null
          id: string
          input_tokens: number
          kind: string
          model: string | null
          output_tokens: number
          target_id: string | null
          target_kind: string | null
          target_url: string | null
          title: string
          week_start: string
        }
        Insert: {
          agent_id: string
          body?: string | null
          created_at?: string
          group_id?: string | null
          id?: string
          input_tokens?: number
          kind: string
          model?: string | null
          output_tokens?: number
          target_id?: string | null
          target_kind?: string | null
          target_url?: string | null
          title: string
          week_start: string
        }
        Update: {
          agent_id?: string
          body?: string | null
          created_at?: string
          group_id?: string | null
          id?: string
          input_tokens?: number
          kind?: string
          model?: string | null
          output_tokens?: number
          target_id?: string | null
          target_kind?: string | null
          target_url?: string | null
          title?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_activities_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_activities_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_agenda: {
        Row: {
          agent_id: string
          created_at: string
          done_at: string | null
          focus: string | null
          id: string
          keywords: string[]
          kind: string
          priority: number
          status: string
          title: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          done_at?: string | null
          focus?: string | null
          id?: string
          keywords?: string[]
          kind?: string
          priority?: number
          status?: string
          title: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          done_at?: string | null
          focus?: string | null
          id?: string
          keywords?: string[]
          kind?: string
          priority?: number
          status?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_agenda_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_job_state: {
        Row: {
          id: string
          last_run_at: string | null
          lease_until: string | null
          paused_reason: string | null
          status: string
          updated_at: string
        }
        Insert: {
          id: string
          last_run_at?: string | null
          lease_until?: string | null
          paused_reason?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          id?: string
          last_run_at?: string | null
          lease_until?: string | null
          paused_reason?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      agent_memories: {
        Row: {
          agent_id: string
          content: string
          created_at: string
          id: string
          importance: number
          keywords: string[]
          kind: string
          source_id: string | null
          source_kind: string | null
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          content?: string
          created_at?: string
          id?: string
          importance?: number
          keywords?: string[]
          kind?: string
          source_id?: string | null
          source_kind?: string | null
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          content?: string
          created_at?: string
          id?: string
          importance?: number
          keywords?: string[]
          kind?: string
          source_id?: string | null
          source_kind?: string | null
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_memories_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_topics: {
        Row: {
          agent_id: string
          hits: number
          id: string
          keyword: string
          last_seen_at: string
          summary: string | null
        }
        Insert: {
          agent_id: string
          hits?: number
          id?: string
          keyword: string
          last_seen_at?: string
          summary?: string | null
        }
        Update: {
          agent_id?: string
          hits?: number
          id?: string
          keyword?: string
          last_seen_at?: string
          summary?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_topics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_votes: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          issue_id: string
          rationale: string | null
          score: number
          updated_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          issue_id: string
          rationale?: string | null
          score: number
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          issue_id?: string
          rationale?: string | null
          score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_votes_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_votes_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          activated_at: string | null
          agent_class: string
          agent_type: string
          ai_model: string | null
          avatar_url: string | null
          bio: string | null
          charter: string | null
          created_at: string
          external_url: string | null
          id: string
          is_public: boolean
          last_cycle_at: string | null
          metadata: Json
          name: string
          owner_id: string | null
          principles: string | null
          protocol: string | null
          reputation: number
          schedule_day: number
          schedule_hour: number
          self_directed: boolean
          slug: string
          system_prompt: string | null
          updated_at: string
          username: string
          values_list: string[] | null
          voting_instructions: string | null
        }
        Insert: {
          activated_at?: string | null
          agent_class: string
          agent_type?: string
          ai_model?: string | null
          avatar_url?: string | null
          bio?: string | null
          charter?: string | null
          created_at?: string
          external_url?: string | null
          id?: string
          is_public?: boolean
          last_cycle_at?: string | null
          metadata?: Json
          name: string
          owner_id?: string | null
          principles?: string | null
          protocol?: string | null
          reputation?: number
          schedule_day?: number
          schedule_hour?: number
          self_directed?: boolean
          slug: string
          system_prompt?: string | null
          updated_at?: string
          username: string
          values_list?: string[] | null
          voting_instructions?: string | null
        }
        Update: {
          activated_at?: string | null
          agent_class?: string
          agent_type?: string
          ai_model?: string | null
          avatar_url?: string | null
          bio?: string | null
          charter?: string | null
          created_at?: string
          external_url?: string | null
          id?: string
          is_public?: boolean
          last_cycle_at?: string | null
          metadata?: Json
          name?: string
          owner_id?: string | null
          principles?: string | null
          protocol?: string | null
          reputation?: number
          schedule_day?: number
          schedule_hour?: number
          self_directed?: boolean
          slug?: string
          system_prompt?: string | null
          updated_at?: string
          username?: string
          values_list?: string[] | null
          voting_instructions?: string | null
        }
        Relationships: []
      }
      ai_usage: {
        Row: {
          agent_id: string | null
          cost_usd: number
          created_at: string
          energy_wh: number
          id: string
          input_tokens: number
          model: string
          output_tokens: number
          purpose: string
          user_id: string | null
        }
        Insert: {
          agent_id?: string | null
          cost_usd?: number
          created_at?: string
          energy_wh?: number
          id?: string
          input_tokens?: number
          model: string
          output_tokens?: number
          purpose: string
          user_id?: string | null
        }
        Update: {
          agent_id?: string | null
          cost_usd?: number
          created_at?: string
          energy_wh?: number
          id?: string
          input_tokens?: number
          model?: string
          output_tokens?: number
          purpose?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      app_cron_keys: {
        Row: {
          created_at: string
          key: string
          name: string
        }
        Insert: {
          created_at?: string
          key?: string
          name: string
        }
        Update: {
          created_at?: string
          key?: string
          name?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          id: string
          target_id: string | null
          target_kind: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
          target_kind?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          id?: string
          target_id?: string | null
          target_kind?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          created_at: string
          description: string
          icon_url: string | null
          id: string
          name: string
          rarity: string
          requirement_count: number
          requirement_type: string
          slug: string
        }
        Insert: {
          created_at?: string
          description: string
          icon_url?: string | null
          id?: string
          name: string
          rarity?: string
          requirement_count?: number
          requirement_type: string
          slug: string
        }
        Update: {
          created_at?: string
          description?: string
          icon_url?: string | null
          id?: string
          name?: string
          rarity?: string
          requirement_count?: number
          requirement_type?: string
          slug?: string
        }
        Relationships: []
      }
      consensus_snapshots: {
        Row: {
          id: string
          issue_id: string | null
          mean_score: number | null
          median_score: number | null
          proposal_id: string
          snapshot_at: string
          std_dev: number | null
          vote_count: number
        }
        Insert: {
          id?: string
          issue_id?: string | null
          mean_score?: number | null
          median_score?: number | null
          proposal_id: string
          snapshot_at?: string
          std_dev?: number | null
          vote_count?: number
        }
        Update: {
          id?: string
          issue_id?: string | null
          mean_score?: number | null
          median_score?: number | null
          proposal_id?: string
          snapshot_at?: string
          std_dev?: number | null
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "consensus_snapshots_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "consensus_snapshots_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      constituent_catalog: {
        Row: {
          created_at: string
          description: string | null
          examples: string[]
          group_type: string | null
          id: string
          key: string
          master_category: string
          name: string
          scope: string
          sort: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          examples?: string[]
          group_type?: string | null
          id?: string
          key: string
          master_category: string
          name: string
          scope?: string
          sort?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          examples?: string[]
          group_type?: string | null
          id?: string
          key?: string
          master_category?: string
          name?: string
          scope?: string
          sort?: number
        }
        Relationships: []
      }
      group_agents: {
        Row: {
          agent_id: string
          created_at: string
          group_id: string
          id: string
          role: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          group_id: string
          id?: string
          role?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          group_id?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_agents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_agents_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_contributions: {
        Row: {
          body: string | null
          created_at: string
          group_id: string
          id: string
          kind: string
          title: string
          updated_at: string
          url: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          group_id: string
          id?: string
          kind?: string
          title: string
          updated_at?: string
          url?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          group_id?: string
          id?: string
          kind?: string
          title?: string
          updated_at?: string
          url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_contributions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_members: {
        Row: {
          created_at: string
          group_id: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          activated_at: string | null
          activated_by: string | null
          catalog_key: string | null
          created_at: string
          description: string | null
          focus_areas: string[] | null
          group_type: string | null
          id: string
          is_public: boolean
          is_tondo: boolean
          library: Json
          master_category: string | null
          name: string
          owner_id: string | null
          slug: string
          updated_at: string
          username: string | null
          website: string | null
        }
        Insert: {
          activated_at?: string | null
          activated_by?: string | null
          catalog_key?: string | null
          created_at?: string
          description?: string | null
          focus_areas?: string[] | null
          group_type?: string | null
          id?: string
          is_public?: boolean
          is_tondo?: boolean
          library?: Json
          master_category?: string | null
          name: string
          owner_id?: string | null
          slug: string
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Update: {
          activated_at?: string | null
          activated_by?: string | null
          catalog_key?: string | null
          created_at?: string
          description?: string | null
          focus_areas?: string[] | null
          group_type?: string | null
          id?: string
          is_public?: boolean
          is_tondo?: boolean
          library?: Json
          master_category?: string | null
          name?: string
          owner_id?: string | null
          slug?: string
          updated_at?: string
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      immutable_records: {
        Row: {
          content_hash: string
          created_at: string
          id: string
          kind: string
          payload: Json
          previous_hash: string | null
          ref_id: string | null
          signature: string | null
          signer_user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          content_hash: string
          created_at?: string
          id?: string
          kind: string
          payload: Json
          previous_hash?: string | null
          ref_id?: string | null
          signature?: string | null
          signer_user_id?: string | null
          wallet_address?: string | null
        }
        Update: {
          content_hash?: string
          created_at?: string
          id?: string
          kind?: string
          payload?: Json
          previous_hash?: string | null
          ref_id?: string | null
          signature?: string | null
          signer_user_id?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      issues: {
        Row: {
          created_at: string
          description: string | null
          id: string
          proposal_id: string
          sort_order: number
          title: string
          weight: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          proposal_id: string
          sort_order?: number
          title: string
          weight?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          proposal_id?: string
          sort_order?: number
          title?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "issues_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      missions: {
        Row: {
          active: boolean
          created_at: string
          description: string
          ends_at: string | null
          id: string
          mission_type: string
          pc_reward: number
          requirement_count: number
          requirement_type: string
          starts_at: string | null
          title: string
          xp_reward: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          description: string
          ends_at?: string | null
          id?: string
          mission_type?: string
          pc_reward?: number
          requirement_count?: number
          requirement_type: string
          starts_at?: string | null
          title: string
          xp_reward?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string
          ends_at?: string | null
          id?: string
          mission_type?: string
          pc_reward?: number
          requirement_count?: number
          requirement_type?: string
          starts_at?: string | null
          title?: string
          xp_reward?: number
        }
        Relationships: []
      }
      moderation_actions: {
        Row: {
          action: string
          created_at: string
          id: string
          moderator_id: string
          reason: string | null
          target_id: string
          target_kind: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          moderator_id: string
          reason?: string | null
          target_id: string
          target_kind: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          moderator_id?: string
          reason?: string | null
          target_id?: string
          target_kind?: string
        }
        Relationships: []
      }
      network_action_totals: {
        Row: {
          action_id: string
          approval: number | null
          node_slug: string
          synced_at: string
          updated_at: string | null
          votes_against: number
          votes_for: number
        }
        Insert: {
          action_id: string
          approval?: number | null
          node_slug: string
          synced_at?: string
          updated_at?: string | null
          votes_against?: number
          votes_for?: number
        }
        Update: {
          action_id?: string
          approval?: number | null
          node_slug?: string
          synced_at?: string
          updated_at?: string | null
          votes_against?: number
          votes_for?: number
        }
        Relationships: []
      }
      network_actions: {
        Row: {
          closes_at: string | null
          id: string
          origin_node: string
          status: string | null
          summary: string | null
          synced_at: string
          title: string
          updated_at: string | null
        }
        Insert: {
          closes_at?: string | null
          id: string
          origin_node: string
          status?: string | null
          summary?: string | null
          synced_at?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          closes_at?: string | null
          id?: string
          origin_node?: string
          status?: string | null
          summary?: string | null
          synced_at?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      network_identities: {
        Row: {
          also_on: string[]
          did: string
          display_name: string | null
          home_node: string
          synced_at: string
          type: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          also_on?: string[]
          did: string
          display_name?: string | null
          home_node: string
          synced_at?: string
          type?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          also_on?: string[]
          did?: string
          display_name?: string | null
          home_node?: string
          synced_at?: string
          type?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      network_nodes: {
        Row: {
          name: string
          slug: string
          status: string
          synced_at: string
          url: string | null
        }
        Insert: {
          name: string
          slug: string
          status?: string
          synced_at?: string
          url?: string | null
        }
        Update: {
          name?: string
          slug?: string
          status?: string
          synced_at?: string
          url?: string | null
        }
        Relationships: []
      }
      pc_ledger: {
        Row: {
          amount: number
          balance_after: number | null
          created_at: string
          id: string
          reason: string
          source_id: string | null
          source_type: string
          user_id: string
        }
        Insert: {
          amount: number
          balance_after?: number | null
          created_at?: string
          id?: string
          reason: string
          source_id?: string | null
          source_type?: string
          user_id: string
        }
        Update: {
          amount?: number
          balance_after?: number | null
          created_at?: string
          id?: string
          reason?: string
          source_id?: string | null
          source_type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string
          avatar_url: string | null
          bio: string | null
          city: string | null
          civic_points: number
          country: string | null
          created_at: string
          did: string | null
          display_name: string | null
          id: string
          last_active_at: string | null
          level: number
          protocol_synced_at: string | null
          protocol_version: number
          reputation: number
          streak_days: number
          updated_at: string
          username: string | null
          values_list: string[]
          verified: boolean
          wallet_address: string | null
          wallet_linked_at: string | null
          xp: number
        }
        Insert: {
          account_type?: string
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          civic_points?: number
          country?: string | null
          created_at?: string
          did?: string | null
          display_name?: string | null
          id: string
          last_active_at?: string | null
          level?: number
          protocol_synced_at?: string | null
          protocol_version?: number
          reputation?: number
          streak_days?: number
          updated_at?: string
          username?: string | null
          values_list?: string[]
          verified?: boolean
          wallet_address?: string | null
          wallet_linked_at?: string | null
          xp?: number
        }
        Update: {
          account_type?: string
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          civic_points?: number
          country?: string | null
          created_at?: string
          did?: string | null
          display_name?: string | null
          id?: string
          last_active_at?: string | null
          level?: number
          protocol_synced_at?: string | null
          protocol_version?: number
          reputation?: number
          streak_days?: number
          updated_at?: string
          username?: string | null
          values_list?: string[]
          verified?: boolean
          wallet_address?: string | null
          wallet_linked_at?: string | null
          xp?: number
        }
        Relationships: []
      }
      proposal_supporters: {
        Row: {
          created_at: string
          id: string
          proposal_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          proposal_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          proposal_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_supporters_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposal_votes: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          proposal_id: string
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          proposal_id: string
          score: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          proposal_id?: string
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposal_votes_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          author_id: string | null
          author_name: string | null
          author_support: number | null
          category: string
          created_at: string
          description: string | null
          feasibility_target: number | null
          featured: boolean
          id: string
          image_url: string | null
          moderation_status: string
          parent_id: string | null
          public_id: string
          published_at: string | null
          scope: string
          slug: string
          status: string
          summary: string
          tags: string[] | null
          target_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          author_support?: number | null
          category: string
          created_at?: string
          description?: string | null
          feasibility_target?: number | null
          featured?: boolean
          id?: string
          image_url?: string | null
          moderation_status?: string
          parent_id?: string | null
          public_id?: string
          published_at?: string | null
          scope?: string
          slug: string
          status?: string
          summary: string
          tags?: string[] | null
          target_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          author_support?: number | null
          category?: string
          created_at?: string
          description?: string | null
          feasibility_target?: number | null
          featured?: boolean
          id?: string
          image_url?: string | null
          moderation_status?: string
          parent_id?: string | null
          public_id?: string
          published_at?: string | null
          scope?: string
          slug?: string
          status?: string
          summary?: string
          tags?: string[] | null
          target_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      protocol_sync_state: {
        Row: {
          id: string
          last_error: string | null
          last_pushed_at: string | null
          last_run_at: string | null
          last_synced_at: string | null
          updated_at: string
        }
        Insert: {
          id: string
          last_error?: string | null
          last_pushed_at?: string | null
          last_run_at?: string | null
          last_synced_at?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          last_error?: string | null
          last_pushed_at?: string | null
          last_run_at?: string | null
          last_synced_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      score_votes: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          issue_id: string
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          issue_id: string
          score: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          issue_id?: string
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "score_votes_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "issues"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          id: string
          key: string
          locale: string
          updated_at: string
          value: string
        }
        Insert: {
          id?: string
          key: string
          locale: string
          updated_at?: string
          value: string
        }
        Update: {
          id?: string
          key?: string
          locale?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_missions: {
        Row: {
          completed: boolean
          completed_at: string | null
          created_at: string
          id: string
          mission_id: string
          progress: number
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_id: string
          progress?: number
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_id?: string
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_missions_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      agent_usage_totals: {
        Args: { _agent_id: string }
        Returns: {
          calls: number
          cost_usd: number
          energy_wh: number
          input_tokens: number
          output_tokens: number
        }[]
      }
      gen_action_public_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      site_usage_totals: {
        Args: never
        Returns: {
          agents: number
          calls: number
          cost_usd: number
          energy_wh: number
          input_tokens: number
          output_tokens: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "citizen"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "citizen"],
    },
  },
} as const
