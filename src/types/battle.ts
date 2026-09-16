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
