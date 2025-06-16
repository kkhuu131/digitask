import { DIGIMON_LOOKUP_TABLE } from "../constants/digimonLookup";
import type { Digimon } from "../store/petStore";

export type DigimonData = Digimon;

// Use the auto-generated lookup table
export const digimonLookup = DIGIMON_LOOKUP_TABLE;

export function searchDigimonData(name: string): DigimonData[] {
  const searchTerm = name.toLowerCase();
  return Object.values(digimonLookup).filter((digimon) =>
    digimon.name.toLowerCase().includes(searchTerm)
  );
}
