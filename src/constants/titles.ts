export interface Title {
  id: number;
  name: string;
  description: string;
  category: "campaign" | "collection" | "evolution" | "battle";
  requirement_type:
    | "campaign_stage"
    | "digimon_count"
    | "digimon_level"
    | "digimon_stage"
    | "battle_wins";
  requirement_value: number | string;
}

export const TITLES: Title[] = [
  // Campaign titles
  {
    id: 1,
    name: "Digital Rookie",
    description: "Completed Stage 10 of the Campaign",
    category: "campaign",
    requirement_type: "campaign_stage",
    requirement_value: 10,
  },
  {
    id: 2,
    name: "Island Explorer",
    description: "Defeated Devimon and cleansed the File Island.",
    category: "campaign",
    requirement_type: "campaign_stage",
    requirement_value: 20,
  },
  // {
  //   id: 3,
  //   name: "Rockstar",
  //   description: "Defeated Etemon.",
  //   category: "campaign",
  //   requirement_type: "campaign_stage",
  //   requirement_value: 25,
  // },
  {
    id: 3,
    name: "Vampire Hunter",
    description: "Defeated the resurrected Myotismon.",
    category: "campaign",
    requirement_type: "campaign_stage",
    requirement_value: 30,
  },
  {
    id: 4,
    name: "Master of the Spiral",
    description: "Conquered all four Dark Masters.",
    category: "campaign",
    requirement_type: "campaign_stage",
    requirement_value: 46,
  },
  {
    id: 5,
    name: "DigiDestined",
    description: "Defeated the final boss, Apocalymon.",
    category: "campaign",
    requirement_type: "campaign_stage",
    requirement_value: 60,
  },
  {
    id: 6,
    name: "Seven Deadly Sins",
    description: "Defeated all Seven Great Demon Lords.",
    category: "campaign",
    requirement_type: "campaign_stage",
    requirement_value: 70,
  },
  {
    id: 7,
    name: "Royal Challenger",
    description: "Defeated and gained the trust of the Royal Knights.",
    category: "campaign",
    requirement_type: "campaign_stage",
    requirement_value: 80,
  },
  {
    id: 8,
    name: "Multiversal Tamer",
    description: "Survived the Space Time Distortion.",
    category: "campaign",
    requirement_type: "campaign_stage",
    requirement_value: 56,
  },
  // Collection titles
  {
    id: 101,
    name: "Digimon Fan",
    description: "Discovered 50 different Digimon",
    category: "collection",
    requirement_type: "digimon_count",
    requirement_value: 50,
  },
  {
    id: 102,
    name: "Digimon Researcher",
    description: "Discovered 100 different Digimon",
    category: "collection",
    requirement_type: "digimon_count",
    requirement_value: 100,
  },
  {
    id: 103,
    name: "Digimon Professor",
    description: "Discovered 200 different Digimon",
    category: "collection",
    requirement_type: "digimon_count",
    requirement_value: 200,
  },
  {
    id: 104,
    name: "Digimon Master",
    description: "Discovered 300 different Digimon",
    category: "collection",
    requirement_type: "digimon_count",
    requirement_value: 300,
  },
  {
    id: 105,
    name: "Digimon Legend",
    description: "Discovered every single Digimon",
    category: "collection",
    requirement_type: "digimon_count",
    requirement_value: 341,
  },
  // Evolution titles
  {
    id: 201,
    name: "Ultimate Tamer",
    description: "Evolved a Digimon to Ultimate stage",
    category: "evolution",
    requirement_type: "digimon_stage",
    requirement_value: "Ultimate",
  },
  {
    id: 202,
    name: "Mega Tamer",
    description: "Evolved a Digimon to Mega stage",
    category: "evolution",
    requirement_type: "digimon_stage",
    requirement_value: "Mega",
  },
  {
    id: 203,
    name: "Ultra Tamer",
    description: "Evolved a Digimon to Ultra stage",
    category: "evolution",
    requirement_type: "digimon_stage",
    requirement_value: "Ultra",
  },

  // Arena Battle titles
  {
    id: 301,
    name: "Battle Novice",
    description: "Won 10 arena battles.",
    category: "battle",
    requirement_type: "battle_wins",
    requirement_value: 10,
  },
  {
    id: 302,
    name: "Battle Expert",
    description: "Won 50 arena battles.",
    category: "battle",
    requirement_type: "battle_wins",
    requirement_value: 50,
  },
  {
    id: 303,
    name: "Battle Master",
    description: "Won 200 team battles.",
    category: "battle",
    requirement_type: "battle_wins",
    requirement_value: 200,
  },
  {
    id: 304,
    name: "Battle Champion",
    description: "Won 1000 arena battles.",
    category: "battle",
    requirement_type: "battle_wins",
    requirement_value: 1000,
  },
];
