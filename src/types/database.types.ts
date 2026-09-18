export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string | null;
          id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      arena_battle_offers: {
        Row: {
          created_at: string;
          difficulty: string;
          expires_at: string;
          id: string;
          opponent_name: string;
          opponent_team: Json;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          difficulty: string;
          expires_at?: string;
          id?: string;
          opponent_name: string;
          opponent_team: Json;
          user_id: string;
        };
        Update: {
          created_at?: string;
          difficulty?: string;
          expires_at?: string;
          id?: string;
          opponent_name?: string;
          opponent_team?: Json;
          user_id?: string;
        };
        Relationships: [];
      };
      arena_battle_requests: {
        Row: {
          battle_id: string | null;
          bits_reward: number | null;
          created_at: string;
          engine_version: number;
          id: string;
          offer_id: string;
          replay: Json | null;
          seed: number;
          settled_at: string | null;
          snapshot: Json;
          status: string;
          user_id: string;
        };
        Insert: {
          battle_id?: string | null;
          bits_reward?: number | null;
          created_at?: string;
          engine_version?: number;
          id: string;
          offer_id: string;
          replay?: Json | null;
          seed: number;
          settled_at?: string | null;
          snapshot: Json;
          status?: string;
          user_id: string;
        };
        Update: {
          battle_id?: string | null;
          bits_reward?: number | null;
          created_at?: string;
          engine_version?: number;
          id?: string;
          offer_id?: string;
          replay?: Json | null;
          seed?: number;
          settled_at?: string | null;
          snapshot?: Json;
          status?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'arena_battle_requests_offer_fkey';
            columns: ['offer_id'];
            isOneToOne: false;
            referencedRelation: 'arena_battle_offers';
            referencedColumns: ['id'];
          },
        ];
      };
      battle_limits: {
        Row: {
          battles_used: number | null;
          boss_battles_used: number | null;
          created_at: string | null;
          id: string;
          last_reset_date: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          battles_used?: number | null;
          boss_battles_used?: number | null;
          created_at?: string | null;
          id?: string;
          last_reset_date: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          battles_used?: number | null;
          boss_battles_used?: number | null;
          created_at?: string | null;
          id?: string;
          last_reset_date?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      daily_quotas: {
        Row: {
          completed_today: number | null;
          consecutive_days_missed: number | null;
          created_at: string | null;
          current_streak: number;
          id: string;
          longest_streak: number | null;
          penalized_tasks: string[] | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          completed_today?: number | null;
          consecutive_days_missed?: number | null;
          created_at?: string | null;
          current_streak?: number;
          id?: string;
          longest_streak?: number | null;
          penalized_tasks?: string[] | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          completed_today?: number | null;
          consecutive_days_missed?: number | null;
          created_at?: string | null;
          current_streak?: number;
          id?: string;
          longest_streak?: number | null;
          penalized_tasks?: string[] | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'daily_quotas_user_id_fkey1';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      digimon: {
        Row: {
          atk: number | null;
          atk_level1: number | null;
          atk_level99: number | null;
          attribute: string | null;
          def: number | null;
          def_level1: number | null;
          def_level99: number | null;
          detail_url: string | null;
          digimon_id: number;
          hp: number | null;
          hp_level1: number | null;
          hp_level99: number | null;
          id: number;
          int: number | null;
          int_level1: number | null;
          int_level99: number | null;
          name: string;
          request_id: number;
          sp: number | null;
          sp_level1: number | null;
          sp_level99: number | null;
          spd: number | null;
          spd_level1: number | null;
          spd_level99: number | null;
          sprite_url: string | null;
          stage: string;
          type: string | null;
        };
        Insert: {
          atk?: number | null;
          atk_level1?: number | null;
          atk_level99?: number | null;
          attribute?: string | null;
          def?: number | null;
          def_level1?: number | null;
          def_level99?: number | null;
          detail_url?: string | null;
          digimon_id: number;
          hp?: number | null;
          hp_level1?: number | null;
          hp_level99?: number | null;
          id?: number;
          int?: number | null;
          int_level1?: number | null;
          int_level99?: number | null;
          name: string;
          request_id: number;
          sp?: number | null;
          sp_level1?: number | null;
          sp_level99?: number | null;
          spd?: number | null;
          spd_level1?: number | null;
          spd_level99?: number | null;
          sprite_url?: string | null;
          stage: string;
          type?: string | null;
        };
        Update: {
          atk?: number | null;
          atk_level1?: number | null;
          atk_level99?: number | null;
          attribute?: string | null;
          def?: number | null;
          def_level1?: number | null;
          def_level99?: number | null;
          detail_url?: string | null;
          digimon_id?: number;
          hp?: number | null;
          hp_level1?: number | null;
          hp_level99?: number | null;
          id?: number;
          int?: number | null;
          int_level1?: number | null;
          int_level99?: number | null;
          name?: string;
          request_id?: number;
          sp?: number | null;
          sp_level1?: number | null;
          sp_level99?: number | null;
          spd?: number | null;
          spd_level1?: number | null;
          spd_level99?: number | null;
          sprite_url?: string | null;
          stage?: string;
          type?: string | null;
        };
        Relationships: [];
      };
      digimon_forms: {
        Row: {
          base_digimon_id: number;
          form_digimon_id: number;
          form_type: string;
          id: number;
          unlock_condition: string | null;
        };
        Insert: {
          base_digimon_id: number;
          form_digimon_id: number;
          form_type: string;
          id?: number;
          unlock_condition?: string | null;
        };
        Update: {
          base_digimon_id?: number;
          form_digimon_id?: number;
          form_type?: string;
          id?: number;
          unlock_condition?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'digimon_forms_base_digimon_id_fkey';
            columns: ['base_digimon_id'];
            isOneToOne: false;
            referencedRelation: 'digimon';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'digimon_forms_form_digimon_id_fkey';
            columns: ['form_digimon_id'];
            isOneToOne: false;
            referencedRelation: 'digimon';
            referencedColumns: ['id'];
          },
        ];
      };
      evolution_paths: {
        Row: {
          dna_requirement: number | null;
          from_digimon_id: number | null;
          id: number;
          item_requirement: string | null;
          level_required: number;
          stat_requirements: Json | null;
          to_digimon_id: number | null;
        };
        Insert: {
          dna_requirement?: number | null;
          from_digimon_id?: number | null;
          id?: number;
          item_requirement?: string | null;
          level_required?: number;
          stat_requirements?: Json | null;
          to_digimon_id?: number | null;
        };
        Update: {
          dna_requirement?: number | null;
          from_digimon_id?: number | null;
          id?: number;
          item_requirement?: string | null;
          level_required?: number;
          stat_requirements?: Json | null;
          to_digimon_id?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'evolution_paths_dna_requirement_fkey';
            columns: ['dna_requirement'];
            isOneToOne: false;
            referencedRelation: 'digimon';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'evolution_paths_from_digimon_id_fkey';
            columns: ['from_digimon_id'];
            isOneToOne: false;
            referencedRelation: 'digimon';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'evolution_paths_to_digimon_id_fkey';
            columns: ['to_digimon_id'];
            isOneToOne: false;
            referencedRelation: 'digimon';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          battle_energy: number;
          battles_completed: number | null;
          battles_won: number | null;
          created_at: string;
          display_name: string | null;
          has_completed_onboarding: boolean | null;
          highest_stage_cleared: number | null;
          id: string;
          last_arena_first_win: string | null;
          max_battle_energy: number;
          saved_stats: Json | null;
          updated_at: string;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          battle_energy?: number;
          battles_completed?: number | null;
          battles_won?: number | null;
          created_at?: string;
          display_name?: string | null;
          has_completed_onboarding?: boolean | null;
          highest_stage_cleared?: number | null;
          id: string;
          last_arena_first_win?: string | null;
          max_battle_energy?: number;
          saved_stats?: Json | null;
          updated_at?: string;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          battle_energy?: number;
          battles_completed?: number | null;
          battles_won?: number | null;
          created_at?: string;
          display_name?: string | null;
          has_completed_onboarding?: boolean | null;
          highest_stage_cleared?: number | null;
          id?: string;
          last_arena_first_win?: string | null;
          max_battle_energy?: number;
          saved_stats?: Json | null;
          updated_at?: string;
          username?: string;
        };
        Relationships: [];
      };
      reports: {
        Row: {
          admin_notes: string | null;
          category: string;
          created_at: string | null;
          id: string;
          reason: string;
          reported_user_id: string;
          reporter_id: string;
          resolved_at: string | null;
          status: string;
          updated_at: string | null;
        };
        Insert: {
          admin_notes?: string | null;
          category: string;
          created_at?: string | null;
          id?: string;
          reason: string;
          reported_user_id: string;
          reporter_id: string;
          resolved_at?: string | null;
          status?: string;
          updated_at?: string | null;
        };
        Update: {
          admin_notes?: string | null;
          category?: string;
          created_at?: string | null;
          id?: string;
          reason?: string;
          reported_user_id?: string;
          reporter_id?: string;
          resolved_at?: string | null;
          status?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'reports_reported_user_id_fkey';
            columns: ['reported_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_reporter_id_fkey';
            columns: ['reporter_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      task_history: {
        Row: {
          created_at: string | null;
          date: string;
          id: string;
          tasks_completed: number;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          date: string;
          id?: string;
          tasks_completed?: number;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          date?: string;
          id?: string;
          tasks_completed?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          category: string | null;
          completed_at: string | null;
          created_at: string | null;
          description: string;
          difficulty: string | null;
          due_date: string | null;
          id: string;
          is_completed: boolean;
          is_daily: boolean;
          notes: string | null;
          priority: string | null;
          recurring_days: string[] | null;
          user_id: string;
        };
        Insert: {
          category?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          description: string;
          difficulty?: string | null;
          due_date?: string | null;
          id?: string;
          is_completed?: boolean;
          is_daily?: boolean;
          notes?: string | null;
          priority?: string | null;
          recurring_days?: string[] | null;
          user_id: string;
        };
        Update: {
          category?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          description?: string;
          difficulty?: string | null;
          due_date?: string | null;
          id?: string;
          is_completed?: boolean;
          is_daily?: boolean;
          notes?: string | null;
          priority?: string | null;
          recurring_days?: string[] | null;
          user_id?: string;
        };
        Relationships: [];
      };
      team_battles: {
        Row: {
          created_at: string;
          id: string;
          opponent_id: string | null;
          opponent_team: Json;
          turns: Json | null;
          user_id: string;
          user_team: Json;
          winner_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          opponent_id?: string | null;
          opponent_team: Json;
          turns?: Json | null;
          user_id: string;
          user_team: Json;
          winner_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          opponent_id?: string | null;
          opponent_team?: Json;
          turns?: Json | null;
          user_id?: string;
          user_team?: Json;
          winner_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'team_battles_opponent_id_fkey';
            columns: ['opponent_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'team_battles_user_id_fkey1';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      titles: {
        Row: {
          category: string;
          created_at: string | null;
          description: string;
          id: number;
          name: string;
          requirement_type: string;
          requirement_value: string;
          reward_bits: number;
          reward_digimon_ids: number[];
        };
        Insert: {
          category: string;
          created_at?: string | null;
          description: string;
          id?: number;
          name: string;
          requirement_type: string;
          requirement_value: string;
          reward_bits?: number;
          reward_digimon_ids?: number[];
        };
        Update: {
          category?: string;
          created_at?: string | null;
          description?: string;
          id?: number;
          name?: string;
          requirement_type?: string;
          requirement_value?: string;
          reward_bits?: number;
          reward_digimon_ids?: number[];
        };
        Relationships: [];
      };
      user_currency: {
        Row: {
          bits: number;
          created_at: string | null;
          digicoins: number;
          id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          bits?: number;
          created_at?: string | null;
          digicoins?: number;
          id?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          bits?: number;
          created_at?: string | null;
          digicoins?: number;
          id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      user_digimon: {
        Row: {
          abi: number | null;
          atk_bonus: number;
          created_at: string | null;
          current_level: number;
          def_bonus: number;
          digimon_id: number;
          experience_points: number;
          happiness: number;
          has_x_antibody: boolean | null;
          hp_bonus: number;
          id: string;
          int_bonus: number;
          is_active: boolean | null;
          is_in_storage: boolean | null;
          is_on_team: boolean;
          last_fed_tasks_at: string | null;
          last_updated_at: string | null;
          name: string;
          personality: string | null;
          sp_bonus: number;
          spd_bonus: number;
          user_id: string;
        };
        Insert: {
          abi?: number | null;
          atk_bonus?: number;
          created_at?: string | null;
          current_level?: number;
          def_bonus?: number;
          digimon_id: number;
          experience_points?: number;
          happiness?: number;
          has_x_antibody?: boolean | null;
          hp_bonus?: number;
          id?: string;
          int_bonus?: number;
          is_active?: boolean | null;
          is_in_storage?: boolean | null;
          is_on_team?: boolean;
          last_fed_tasks_at?: string | null;
          last_updated_at?: string | null;
          name: string;
          personality?: string | null;
          sp_bonus?: number;
          spd_bonus?: number;
          user_id: string;
        };
        Update: {
          abi?: number | null;
          atk_bonus?: number;
          created_at?: string | null;
          current_level?: number;
          def_bonus?: number;
          digimon_id?: number;
          experience_points?: number;
          happiness?: number;
          has_x_antibody?: boolean | null;
          hp_bonus?: number;
          id?: string;
          int_bonus?: number;
          is_active?: boolean | null;
          is_in_storage?: boolean | null;
          is_on_team?: boolean;
          last_fed_tasks_at?: string | null;
          last_updated_at?: string | null;
          name?: string;
          personality?: string | null;
          sp_bonus?: number;
          spd_bonus?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_digimon_digimon_id_fkey';
            columns: ['digimon_id'];
            isOneToOne: false;
            referencedRelation: 'digimon';
            referencedColumns: ['id'];
          },
        ];
      };
      user_digimon_history: {
        Row: {
          digimon_id: number;
          id: number;
          is_backfilled: boolean;
          is_starting_point: boolean;
          recorded_at: string;
          user_digimon_id: string;
        };
        Insert: {
          digimon_id: number;
          id?: never;
          is_backfilled?: boolean;
          is_starting_point?: boolean;
          recorded_at?: string;
          user_digimon_id: string;
        };
        Update: {
          digimon_id?: number;
          id?: never;
          is_backfilled?: boolean;
          is_starting_point?: boolean;
          recorded_at?: string;
          user_digimon_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_digimon_history_pet_fkey';
            columns: ['user_digimon_id'];
            isOneToOne: false;
            referencedRelation: 'user_digimon';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_digimon_history_pet_fkey';
            columns: ['user_digimon_id'];
            isOneToOne: false;
            referencedRelation: 'user_digimon_profiles';
            referencedColumns: ['user_digimon_id'];
          },
          {
            foreignKeyName: 'user_digimon_history_species_fkey';
            columns: ['digimon_id'];
            isOneToOne: false;
            referencedRelation: 'digimon';
            referencedColumns: ['id'];
          },
        ];
      };
      user_discovered_digimon: {
        Row: {
          digimon_id: number;
          discovered_at: string | null;
          id: string;
          user_id: string;
        };
        Insert: {
          digimon_id: number;
          discovered_at?: string | null;
          id?: string;
          user_id: string;
        };
        Update: {
          digimon_id?: number;
          discovered_at?: string | null;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_discovered_digimon_digimon_id_fkey';
            columns: ['digimon_id'];
            isOneToOne: false;
            referencedRelation: 'digimon';
            referencedColumns: ['id'];
          },
        ];
      };
      user_inventory: {
        Row: {
          created_at: string | null;
          id: string;
          item_id: string;
          item_type: string | null;
          quantity: number;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          id?: string;
          item_id: string;
          item_type?: string | null;
          quantity?: number;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          id?: string;
          item_id?: string;
          item_type?: string | null;
          quantity?: number;
          user_id?: string;
        };
        Relationships: [];
      };
      user_milestones: {
        Row: {
          created_at: string;
          daily_quota_streak: number;
          id: string;
          last_digimon_claimed_at: string | null;
          tasks_completed_count: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          daily_quota_streak?: number;
          id?: string;
          last_digimon_claimed_at?: string | null;
          tasks_completed_count?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          daily_quota_streak?: number;
          id?: string;
          last_digimon_claimed_at?: string | null;
          tasks_completed_count?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      user_titles: {
        Row: {
          claimed_at: string | null;
          earned_at: string | null;
          id: number;
          is_displayed: boolean | null;
          title_id: number | null;
          user_id: string | null;
        };
        Insert: {
          claimed_at?: string | null;
          earned_at?: string | null;
          id?: number;
          is_displayed?: boolean | null;
          title_id?: number | null;
          user_id?: string | null;
        };
        Update: {
          claimed_at?: string | null;
          earned_at?: string | null;
          id?: number;
          is_displayed?: boolean | null;
          title_id?: number | null;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_titles_title_id_fkey';
            columns: ['title_id'];
            isOneToOne: false;
            referencedRelation: 'titles';
            referencedColumns: ['id'];
          },
        ];
      };
      user_tournaments: {
        Row: {
          bracket: Json;
          created_at: string | null;
          current_round: number;
          final_placement: string | null;
          id: string;
          round_results: Json;
          status: string;
          user_id: string;
          week_start: string;
        };
        Insert: {
          bracket: Json;
          created_at?: string | null;
          current_round?: number;
          final_placement?: string | null;
          id?: string;
          round_results?: Json;
          status?: string;
          user_id: string;
          week_start: string;
        };
        Update: {
          bracket?: Json;
          created_at?: string | null;
          current_round?: number;
          final_placement?: string | null;
          id?: string;
          round_results?: Json;
          status?: string;
          user_id?: string;
          week_start?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_tournaments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      admin_reports: {
        Row: {
          admin_notes: string | null;
          category: string | null;
          created_at: string | null;
          id: string | null;
          reason: string | null;
          reported_user_id: string | null;
          reported_username: string | null;
          reporter_id: string | null;
          reporter_username: string | null;
          resolved_at: string | null;
          status: string | null;
          updated_at: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'reports_reported_user_id_fkey';
            columns: ['reported_user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reports_reporter_id_fkey';
            columns: ['reporter_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      user_digimon_profiles: {
        Row: {
          abi: number | null;
          attribute: string | null;
          created_at: string | null;
          current_level: number | null;
          digimon_id: number | null;
          digimon_nickname: string | null;
          digimon_species: string | null;
          experience_points: number | null;
          is_active: boolean | null;
          is_on_team: boolean | null;
          personality: string | null;
          sprite_url: string | null;
          stage: string | null;
          type: string | null;
          user_digimon_id: string | null;
          user_id: string | null;
          username: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_digimon_digimon_id_fkey';
            columns: ['digimon_id'];
            isOneToOne: false;
            referencedRelation: 'digimon';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      admin_rename_user: {
        Args: { new_username?: string; user_id: string };
        Returns: string;
      };
      allocate_stat: {
        Args: { p_digimon_id: string; p_stat_type: string; p_user_id: string };
        Returns: boolean;
      };
      arena_battle_context: { Args: { p_user_id: string }; Returns: Json };
      check_all_overdue_tasks: { Args: never; Returns: undefined };
      check_and_set_first_win_self: { Args: never; Returns: boolean };
      claim_achievement: {
        Args: { p_digimon_id?: number; p_user_title_id: number };
        Returns: Json;
      };
      cleanup_team_battles: { Args: never; Returns: undefined };
      complete_task_all_triggers: {
        Args: {
          p_auto_allocate?: boolean;
          p_task_id: string;
          p_user_id: string;
        };
        Returns: Json;
      };
      contribute_boss_progress: {
        Args: {
          p_is_daily_quota?: boolean;
          p_task_points?: number;
          p_user_id: string;
        };
        Returns: boolean;
      };
      create_add_dna_requirement_function: { Args: never; Returns: undefined };
      dna_evolve_digimon: {
        Args: {
          p_abi_gain: number;
          p_boost_points: number;
          p_digimon_id: string;
          p_dna_partner_digimon_id: string;
          p_to_digimon_id: number;
        };
        Returns: boolean;
      };
      grant_energy_self: { Args: { p_amount: number }; Returns: undefined };
      is_admin: { Args: never; Returns: boolean };
      prepare_arena_battle: {
        Args: {
          p_offer_id: string;
          p_request_id: string;
          p_strategies: string[];
          p_team_ids: string[];
          p_user_id: string;
        };
        Returns: Json;
      };
      process_daily_quotas: { Args: never; Returns: undefined };
      reset_all_battle_limits: { Args: never; Returns: undefined };
      reset_daily_tasks: { Args: never; Returns: undefined };
      settle_arena_battle: {
        Args: { p_replay: Json; p_request_id: string; p_user_id: string };
        Returns: Json;
      };
      spend_energy_self: { Args: { p_amount: number }; Returns: boolean };
      swap_team_members: {
        Args: {
          reserve_digimon_id: string;
          team_digimon_id: string;
          user_id_param: string;
        };
        Returns: undefined;
      };
      update_digimon_exp: {
        Args: {
          p_active_digimon_id: string;
          p_base_exp: number;
          p_non_active_multiplier?: number;
        };
        Returns: undefined;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
