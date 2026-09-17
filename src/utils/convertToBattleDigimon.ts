import type { BattleDigimon } from '../types/battle';
import { calculateFinalStats } from './digimonStatCalculation';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';

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
    digimonData =
      DIGIMON_LOOKUP_TABLE[
        String(userDigimon.digimon_id) as unknown as keyof typeof DIGIMON_LOOKUP_TABLE
      ];
  }

  if (!digimonData && userDigimon.name) {
    const foundDigimon = Object.values(DIGIMON_LOOKUP_TABLE).find(
      (d) => d.name === userDigimon.name
    );
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
    console.error(
      'Lookup table entry for key',
      String(userDigimon.digimon_id),
      ':',
      DIGIMON_LOOKUP_TABLE[
        String(userDigimon.digimon_id) as unknown as keyof typeof DIGIMON_LOOKUP_TABLE
      ]
    );
    console.error(
      'Available keys in lookup table:',
      Object.keys(DIGIMON_LOOKUP_TABLE).slice(0, 10)
    );
    throw new Error(`Missing digimon data for ${userDigimon.name || userDigimon.id}`);
  }

  const stats = calculateFinalStats(structuredDigimon);

  return {
    id: String(userDigimon.id),
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
