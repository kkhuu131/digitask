// New types for interactive battle system
export interface BattleState {
  id: string;
  userTeam: BattleDigimon[];
  opponentTeam: BattleDigimon[];
  currentTurn: number;
  currentAttacker: string | null; // ID of Digimon whose turn it is
  isPlayerTurn: boolean;
  isBattleComplete: boolean;
  winner: 'user' | 'opponent' | null;
  turnHistory: BattleTurn[];
}

export interface BattleDigimon {
  id: string;
  name: string;
  digimon_name: string;
  current_level: number;
  sprite_url: string;
  type: string;
  attribute: string;
  stats: {
    hp: number;
    max_hp: number;
    atk: number;
    def: number;
    int: number;
    spd: number;
    sp: number;
  };
  isAlive: boolean;
  isOnUserTeam: boolean;
}

export interface BattleTurn {
  turnNumber: number;
  attacker: {
    id: string;
    name: string;
    team: 'user' | 'opponent';
  };
  target: {
    id: string;
    name: string;
    team: 'user' | 'opponent';
  };
  action: 'attack' | 'defend' | 'special';
  damage: number;
  isCritical: boolean;
  isMiss: boolean;
  remainingHP: { [id: string]: number };
  turnComplete: boolean;
}

export interface BattleAction {
  type: 'attack' | 'defend' | 'special';
  targetId?: string; // Only for attack/special actions
}

export interface TargetSelection {
  attackerId: string;
  targetId: string;
  action: BattleAction;
}
