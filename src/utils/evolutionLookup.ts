import {
  EVOLUTION_LOOKUP_TABLE,
  type EvolutionPath,
} from "../constants/evolutionLookup";

export interface EvolutionData {
  evolvesFrom: EvolutionPath[];
  evolvesTo: EvolutionPath[];
}

// Use the auto-generated lookup table
export const evolutionLookup: Record<number, EvolutionData> = {};

// Initialize the lookup table from the constants
Object.values(EVOLUTION_LOOKUP_TABLE.all).forEach((path: EvolutionPath) => {
  // For evolvesFrom (what this Digimon evolves from)
  if (!evolutionLookup[path.to_digimon_id]) {
    evolutionLookup[path.to_digimon_id] = { evolvesFrom: [], evolvesTo: [] };
  }
  evolutionLookup[path.to_digimon_id].evolvesFrom.push(path);

  // For evolvesTo (what this Digimon evolves to)
  if (!evolutionLookup[path.from_digimon_id]) {
    evolutionLookup[path.from_digimon_id] = { evolvesFrom: [], evolvesTo: [] };
  }
  evolutionLookup[path.from_digimon_id].evolvesTo.push(path);
});

export function searchEvolutionData(name: string): EvolutionData[] {
  // This would need to be updated to search by Digimon ID rather than name
  // since the evolution data uses IDs, not names
  return Object.values(evolutionLookup);
}
