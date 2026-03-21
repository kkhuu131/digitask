import { create } from "zustand";
import { BattleState, BattleDigimon, BattleTurn, TargetSelection } from "../types/battle";
import { calculateFinalStats } from "../utils/digimonStatCalculation";
import { DIGIMON_LOOKUP_TABLE } from "../constants/digimonLookup";
import { calculateDamage } from "../utils/battleCalculations";

interface InteractiveBattleState {
  // Battle state
  currentBattle: BattleState | null;
  isBattleActive: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  startInteractiveBattle: (userTeam: any[], opponentTeam: any[]) => Promise<void>;
  selectTarget: (selection: TargetSelection) => Promise<void>;
  processOpponentTurn: () => Promise<void>;
  endBattle: () => void;
  resetBattle: () => void;
  
  // Getters
  getCurrentAttacker: () => BattleDigimon | null;
  getAvailableTargets: () => BattleDigimon[];
  getBattleStatus: () => {
    userTeamAlive: number;
    opponentTeamAlive: number;
    isPlayerTurn: boolean;
    isBattleComplete: boolean;
  };
}

/**
 * Converts any Digimon-shaped object into a fully resolved BattleDigimon with final combat stats.
 *
 * Three-tier species data resolution — required because Digimon arrive in different shapes
 * depending on the caller (real user teams, CPU wild teams, tournament opponents):
 *   1. `userDigimon.digimon` — already-joined nested object (most user Digimon from petStore)
 *   2. `DIGIMON_LOOKUP_TABLE[digimon_id]` — species lookup by numeric ID (CPU/tournament teams)
 *   3. Name scan across the entire lookup table — last resort if only a name string is available
 */
export const convertToBattleDigimon = (userDigimon: any, isUserTeam: boolean): BattleDigimon => {
  let digimonData = userDigimon.digimon;

  if (!digimonData && userDigimon.digimon_id) {
    digimonData = DIGIMON_LOOKUP_TABLE[String(userDigimon.digimon_id) as unknown as keyof typeof DIGIMON_LOOKUP_TABLE];
  }

  if (!digimonData && userDigimon.name) {
    const foundDigimon = Object.values(DIGIMON_LOOKUP_TABLE).find(d => d.name === userDigimon.name);
    if (foundDigimon) {
      digimonData = foundDigimon;
    }
  }

  // Create a properly structured object for calculateFinalStats
  const structuredDigimon = {
    ...userDigimon,
    digimon: digimonData, // Ensure the nested digimon property exists
  };
  
  // Additional validation
  if (!structuredDigimon.digimon) {
    console.error('Missing digimon data for:', userDigimon);
    console.error('Available digimon_id:', userDigimon.digimon_id);
    console.error('Lookup table entry for key', String(userDigimon.digimon_id), ':', DIGIMON_LOOKUP_TABLE[String(userDigimon.digimon_id) as unknown as keyof typeof DIGIMON_LOOKUP_TABLE]);
    console.error('Available keys in lookup table:', Object.keys(DIGIMON_LOOKUP_TABLE).slice(0, 10));
    throw new Error(`Missing digimon data for ${userDigimon.name || userDigimon.id}`);
  }
  
  const stats = calculateFinalStats(structuredDigimon);

  return {
    id: userDigimon.id,
    name: userDigimon.name || digimonData.name,
    digimon_name: digimonData.name,
    current_level: userDigimon.current_level,
    sprite_url: digimonData.sprite_url,
    type: digimonData.type,
    attribute: digimonData.attribute,
    stats: {
      hp: stats.hp,
      max_hp: stats.hp,
      atk: stats.atk,
      def: stats.def,
      int: stats.int,
      spd: stats.spd,
      sp: stats.sp,
    },
    isAlive: true,
    isOnUserTeam: isUserTeam,
  };
};

// Determines initiative order for the opening turn: higher SPD acts first.
// All 6 Digimon (both teams) are ranked together — the fastest on either side goes first.
// This sorted array is also used as the cycling template in selectTarget.
const getTurnOrder = (userTeam: BattleDigimon[], opponentTeam: BattleDigimon[]): BattleDigimon[] => {
  const allDigimon = [...userTeam, ...opponentTeam];
  return allDigimon.sort((a, b) => b.stats.spd - a.stats.spd);
};


export const useInteractiveBattleStore = create<InteractiveBattleState>((set, get) => ({
  currentBattle: null,
  isBattleActive: false,
  loading: false,
  error: null,

  startInteractiveBattle: async (userTeamData: any[], opponentTeamData: any[]) => {
    try {
      set({ loading: true, error: null });
      
      // Convert teams to BattleDigimon format
      const userTeam = userTeamData.map(d => convertToBattleDigimon(d, true));
      const opponentTeam = opponentTeamData.map(d => convertToBattleDigimon(d, false));
      
      // Get turn order
      const turnOrder = getTurnOrder(userTeam, opponentTeam);
      const firstAttacker = turnOrder[0];
      
      const battleState: BattleState = {
        id: `battle-${Date.now()}`,
        userTeam,
        opponentTeam,
        currentTurn: 1,
        currentAttacker: firstAttacker.id,
        isPlayerTurn: firstAttacker.isOnUserTeam,
        isBattleComplete: false,
        winner: null,
        turnHistory: [],
      };
      
      set({
        currentBattle: battleState,
        isBattleActive: true,
        loading: false,
      });

      // If the opponent has higher SPD and acts first, trigger the AI turn automatically.
      // The 600ms delay gives the UI time to render the initial battle state before
      // the AI attack animation fires — without it the first hit appears to come from nowhere.
      if (!firstAttacker.isOnUserTeam) {
        setTimeout(() => get().processOpponentTurn(), 600);
      }
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to start battle',
        loading: false,
      });
    }
  },

  selectTarget: async (selection: TargetSelection) => {
    const { currentBattle } = get();
    if (!currentBattle) return;
    
    try {
      set({ loading: true });
      
      const attacker = [...currentBattle.userTeam, ...currentBattle.opponentTeam]
        .find(d => d.id === selection.attackerId);
      const target = [...currentBattle.userTeam, ...currentBattle.opponentTeam]
        .find(d => d.id === selection.targetId);
      // Guard against stale UI interactions: if the player clicks a target after
      // the turn has already advanced (e.g. double-click, slow connection), both
      // conditions must be true — it's the player's turn AND this specific Digimon
      // is the current attacker. Failing either check silently discards the action.
      const isAttackerUsers = !!currentBattle.userTeam.find(d => d.id === selection.attackerId);
      if ((currentBattle.isPlayerTurn !== isAttackerUsers) || currentBattle.currentAttacker !== selection.attackerId) {
        set({ loading: false });
        return;
      }

      
      if (!attacker || !target || !attacker.isAlive || !target.isAlive) {
        throw new Error('Invalid attacker or target');
      }
      
      // Calculate damage
      const { damage, isCritical, isMiss } = calculateDamage(attacker, target);
      
      // Apply damage
      const newHp = Math.max(0, target.stats.hp - damage);
      target.stats.hp = newHp;
      target.isAlive = newHp > 0;
      
      // Create turn record
      const turn: BattleTurn = {
        turnNumber: currentBattle.currentTurn,
        attacker: {
          id: attacker.id,
          name: attacker.name,
          team: attacker.isOnUserTeam ? 'user' : 'opponent',
        },
        target: {
          id: target.id,
          name: target.name,
          team: target.isOnUserTeam ? 'user' : 'opponent',
        },
        action: selection.action.type,
        damage,
        isCritical,
        isMiss,
        remainingHP: {
          [target.id]: newHp,
        },
        turnComplete: true,
      };
      
      // Update battle state
      const updatedBattle: BattleState = {
        ...currentBattle,
        currentTurn: currentBattle.currentTurn + 1,
        turnHistory: [...currentBattle.turnHistory, turn],
      };
      
      // Check if battle is complete
      const userTeamAlive = currentBattle.userTeam.filter(d => d.isAlive).length;
      const opponentTeamAlive = currentBattle.opponentTeam.filter(d => d.isAlive).length;
      
      if (userTeamAlive === 0 || opponentTeamAlive === 0) {
        updatedBattle.isBattleComplete = true;
        updatedBattle.winner = userTeamAlive > 0 ? 'user' : 'opponent';
        updatedBattle.isPlayerTurn = false;
      } else {
        // Advance to the next attacker by re-sorting the still-alive Digimon by SPD
        // and wrapping around with modulo. Dead Digimon are excluded from the pool,
        // so the order contracts naturally as the battle progresses.
        const alive = [...currentBattle.userTeam, ...currentBattle.opponentTeam].filter(d => d.isAlive);
        const order = alive.sort((a, b) => b.stats.spd - a.stats.spd);
        const currentIndex = order.findIndex(d => d.id === selection.attackerId);
        const nextIndex = (currentIndex + 1) % order.length;
        const nextAttacker = order[nextIndex];
        updatedBattle.currentAttacker = nextAttacker.id;
        updatedBattle.isPlayerTurn = nextAttacker.isOnUserTeam;
      }
      
      set({
        currentBattle: updatedBattle,
        loading: false,
      });
      
      // After a player action, give 1 second before the AI responds.
      // Longer than the opening 600ms so the player can read the damage they just dealt
      // before the opponent fires back.
      if (!updatedBattle.isPlayerTurn && !updatedBattle.isBattleComplete) {
        setTimeout(() => get().processOpponentTurn(), 1000);
      }
      
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to process turn',
        loading: false,
      });
    }
  },

  processOpponentTurn: async () => {
    const { currentBattle } = get();
    if (!currentBattle || currentBattle.isPlayerTurn || currentBattle.isBattleComplete) return;
    
    try {
      set({ loading: true });
      
      const attacker = [...currentBattle.userTeam, ...currentBattle.opponentTeam]
        .find(d => d.id === currentBattle.currentAttacker);
      
      if (!attacker || !attacker.isAlive) return;

      // AI strategy: always focus the weakest user Digimon (lowest current HP).
      // `lowestHp` uses reduce(), which throws on an empty array — the try/catch
      // falls back to random selection rather than crashing the battle.
      // Structured as a strategy map to make it easy to add new AI behaviors later.
      const strategies = {
        lowestHp: (c: BattleState) => c.userTeam.filter(d => d.isAlive)
          .reduce((lowest, cur) => (cur.stats.hp < lowest.stats.hp ? cur : lowest)),
        random: (c: BattleState) => {
          const alive = c.userTeam.filter(d => d.isAlive);
          return alive[Math.floor(Math.random() * alive.length)];
        },
      } as const;

      let target: BattleDigimon | undefined;
      const aliveUserDigimon = currentBattle.userTeam.filter(d => d.isAlive);
      if (aliveUserDigimon.length === 0) return;
      try {
        target = strategies.lowestHp(currentBattle);
      } catch {
        target = strategies.random(currentBattle);
      }
      if (!target) target = strategies.random(currentBattle);

      // The AI reuses selectTarget rather than having its own damage pipeline.
      // This ensures both sides go through identical damage calculation and turn-advance logic.
      await get().selectTarget({
        attackerId: attacker.id,
        targetId: target.id,
        action: { type: 'attack' },
      });
      
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to process opponent turn',
        loading: false,
      });
    }
  },

  // endBattle: called after a battle concludes naturally (win/loss).
  // The InteractiveBattle component calls this after recording results upstream.
  endBattle: () => {
    set({
      currentBattle: null,
      isBattleActive: false,
      loading: false,
      error: null,
    });
  },

  // resetBattle: hard reset used when the player navigates away mid-battle or
  // an unrecoverable error occurs. Intentionally identical to endBattle so both
  // paths leave the store in a clean idle state.
  resetBattle: () => {
    set({
      currentBattle: null,
      isBattleActive: false,
      loading: false,
      error: null,
    });
  },

  getCurrentAttacker: () => {
    const { currentBattle } = get();
    if (!currentBattle || !currentBattle.currentAttacker) return null;
    
    return [...currentBattle.userTeam, ...currentBattle.opponentTeam]
      .find(d => d.id === currentBattle.currentAttacker) || null;
  },

  getAvailableTargets: () => {
    const { currentBattle } = get();
    if (!currentBattle) return [];
    
    const attacker = [...currentBattle.userTeam, ...currentBattle.opponentTeam]
      .find(d => d.id === currentBattle.currentAttacker);
    
    if (!attacker) return [];
    
    // Return alive Digimon from the opposite team
    const targetTeam = attacker.isOnUserTeam ? currentBattle.opponentTeam : currentBattle.userTeam;
    return targetTeam.filter(d => d.isAlive);
  },

  getBattleStatus: () => {
    const { currentBattle } = get();
    if (!currentBattle) {
      return {
        userTeamAlive: 0,
        opponentTeamAlive: 0,
        isPlayerTurn: false,
        isBattleComplete: false,
      };
    }
    
    const userTeamAlive = currentBattle.userTeam.filter(d => d.isAlive).length;
    const opponentTeamAlive = currentBattle.opponentTeam.filter(d => d.isAlive).length;
    
    return {
      userTeamAlive,
      opponentTeamAlive,
      isPlayerTurn: currentBattle.isPlayerTurn,
      isBattleComplete: currentBattle.isBattleComplete,
    };
  },
}));
