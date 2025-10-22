import { create } from "zustand";
import { BattleState, BattleDigimon, BattleTurn, TargetSelection } from "../types/battle";
import { calculateFinalStats } from "../utils/digimonStatCalculation";
import { DIGIMON_LOOKUP_TABLE } from "../constants/digimonLookup";

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

// Helper function to convert UserDigimon to BattleDigimon
const convertToBattleDigimon = (userDigimon: any, isUserTeam: boolean): BattleDigimon => {
  // Debug logging first to understand the data structure
  console.log('Converting digimon - Full data:', userDigimon);
  
  // Try to get digimon data from various possible sources
  let digimonData = userDigimon.digimon;
  
  // If no nested digimon property, try lookup table
  if (!digimonData && userDigimon.digimon_id) {
    digimonData = DIGIMON_LOOKUP_TABLE[String(userDigimon.digimon_id) as unknown as keyof typeof DIGIMON_LOOKUP_TABLE];
  }
  
  // If still no data, try to find it by name (fallback)
  if (!digimonData && userDigimon.name) {
    const foundDigimon = Object.values(DIGIMON_LOOKUP_TABLE).find(d => d.name === userDigimon.name);
    if (foundDigimon) {
      digimonData = foundDigimon;
    }
  }
  
  // Debug logging
  console.log('Converting digimon:', {
    id: userDigimon.id,
    name: userDigimon.name,
    digimon_id: userDigimon.digimon_id,
    hasDigimonProperty: !!userDigimon.digimon,
    digimonData: digimonData ? 'exists' : 'missing',
    lookupKey: String(userDigimon.digimon_id),
    foundByName: !!Object.values(DIGIMON_LOOKUP_TABLE).find(d => d.name === userDigimon.name)
  });
  
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

  console.log('type', digimonData.type, 'attribute', digimonData.attribute);
  console.log('digimonData.name:', digimonData.name, 'userDigimon.name:', userDigimon.name);
  
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

// Helper function to get turn order based on speed
const getTurnOrder = (userTeam: BattleDigimon[], opponentTeam: BattleDigimon[]): BattleDigimon[] => {
  const allDigimon = [...userTeam, ...opponentTeam];
  return allDigimon.sort((a, b) => b.stats.spd - a.stats.spd);
};

// Helper function to calculate damage
const calculateDamage = (attacker: BattleDigimon, target: BattleDigimon): { damage: number; isCritical: boolean; isMiss: boolean } => {
  const missChance = 0.05; // 5% miss chance
  const criticalChance = 0.125; // 12.5% critical chance
  
  const isMiss = Math.random() < missChance;
  if (isMiss) return { damage: 0, isCritical: false, isMiss: true };
  
  const isCritical = Math.random() < criticalChance;
  const critMultiplier = isCritical ? 1.5 : 1;
  
  // Use higher of ATK or INT for damage calculation
  const attackPower = Math.max(attacker.stats.atk, attacker.stats.int);
  const defense = target.stats.def;
  
  const baseDamage = Math.max(1, (attackPower - defense)*10);
  const damageMultiplier = 0.8 + Math.random() * 0.4; // 0.8 to 1.2x variance
  
  const damage = Math.floor(baseDamage * damageMultiplier * critMultiplier);
  
  return { damage, isCritical, isMiss };
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

      // If opponent goes first, automatically process AI turn after a short delay
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
      // Enforce turn ownership and current attacker
      const isAttackerUsers = !!currentBattle.userTeam.find(d => d.id === selection.attackerId);
      if ((currentBattle.isPlayerTurn !== isAttackerUsers) || currentBattle.currentAttacker !== selection.attackerId) {
        // Not the correct turn/attacker; ignore
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
        // Move to next attacker based on consistent initiative order cycling
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
      
      // If it's now opponent's turn, process it automatically
      if (!updatedBattle.isPlayerTurn && !updatedBattle.isBattleComplete) {
        setTimeout(() => {
          get().processOpponentTurn();
        }, 1000); // 1 second delay for better UX
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

      // AI target selection strategy (pluggable)
      const strategies = {
        lowestHp: (c: BattleState) => c.userTeam.filter(d => d.isAlive)
          .reduce((lowest, cur) => (cur.stats.hp < lowest.stats.hp ? cur : lowest)),
        random: (c: BattleState) => {
          const alive = c.userTeam.filter(d => d.isAlive);
          return alive[Math.floor(Math.random() * alive.length)];
        },
      } as const;

      // Choose primary strategy; fallback to random if needed
      let target: BattleDigimon | undefined;
      const aliveUserDigimon = currentBattle.userTeam.filter(d => d.isAlive);
      if (aliveUserDigimon.length === 0) return;
      try {
        target = strategies.lowestHp(currentBattle);
      } catch {
        target = strategies.random(currentBattle);
      }
      if (!target) target = strategies.random(currentBattle);
      
      // Process the turn
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

  endBattle: () => {
    set({
      currentBattle: null,
      isBattleActive: false,
      loading: false,
      error: null,
    });
  },

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
