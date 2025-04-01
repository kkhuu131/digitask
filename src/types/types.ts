export interface Digimon {
  id: string;
  name: string;
  stage: string;
  sprite_url: string;
  type?: string;
  attribute?: string;
  // Add other properties as needed
}

export interface EvolutionPaths {
  evolvesFrom: any[];
  evolvesTo: any[];
  // Add other properties as needed
}
