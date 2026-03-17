export type TournamentStatus = 'active' | 'completed' | 'expired';
export type TournamentPlacement = 'qf_loss' | 'sf_loss' | 'gf_loss' | 'champion';
export type RoundDifficulty = 'easy' | 'medium' | 'hard';

export interface TournamentOpponentDigimon {
  id: string;
  digimon_id: number;
  name: string;
  current_level: number;
  sprite_url: string;
  type: string;
  attribute: string;
}

export interface TournamentRound {
  round_name: string;
  difficulty: RoundDifficulty;
  opponent: {
    display_name: string;
    boss_team_id?: string;
    team: TournamentOpponentDigimon[];
  };
}

export interface BracketSlot {
  slot: number;
  name: string;
  is_user?: boolean;
  is_boss?: boolean;
  team?: TournamentOpponentDigimon[];
}

export interface TournamentBracket {
  rounds: {
    '1': TournamentRound;
    '2': TournamentRound;
    '3': TournamentRound;
  };
  visual_bracket: { slots: BracketSlot[] };
}

export interface RoundResult {
  round: number;
  result: 'win' | 'loss';
  placement_bits: number;
}

export interface UserTournament {
  id: string;
  user_id: string;
  week_start: string;
  status: TournamentStatus;
  current_round: number;
  bracket: TournamentBracket;
  round_results: RoundResult[];
  final_placement: TournamentPlacement | null;
  created_at: string;
}
