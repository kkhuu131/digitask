export interface Title {
  id: number;
  name: string;
  description: string;
  category: "campaign" | "collection" | "evolution" | "battle" | "streak" | "tasks";
  requirement_type:
    | "campaign_stage"
    | "digimon_count"
    | "digimon_level"
    | "digimon_stage"
    | "battle_wins"
    | "longest_streak"
    | "tasks_completed";
  requirement_value: number | string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  rewards?: {
    bits?: number;
    // Curated pool of digimon IDs — 3 are randomly sampled and presented to the user
    digiEggPool?: number[];
  };
}

// Digimon ID pools used for DigiEgg rewards
// Baby stage: IDs 1–5
const BABY_POOL = [1, 2, 3, 4, 5];
// In-Training stage: IDs 7–12 (skipping 6 = Arcadiamon In-Tr.)
const IN_TRAINING_POOL = [7, 8, 9, 10, 11, 12];
// Rookie stage pool A (iconic starters)
const ROOKIE_POOL_A = [18, 19, 23, 24, 26];
// Rookie stage pool B (alternate roster)
const ROOKIE_POOL_B = [19, 23, 24, 26, 30, 32, 33, 36, 41, 44, 45, 47, 49, 51, 55];
// Rookie pool C (mix)
const ROOKIE_POOL_C = [18, 21, 27, 29, 34, 39, 46, 50, 23, 24, 32, 47, 48, 53, 54];
// Champion stage pool
const CHAMPION_POOL = [66, 68, 70, 71, 72, 75, 76, 77, 78, 79, 80, 81, 82, 83];

export const TITLES: Title[] = [
  // ── Campaign titles ──────────────────────────────────────────────────────
  {
    id: 1,
    name: "Digital Rookie",
    description: "Completed Stage 10 of the Campaign",
    category: "campaign",
    requirement_type: "campaign_stage",
    requirement_value: 10,
    tier: "bronze",
  },
  {
    id: 2,
    name: "Island Explorer",
    description: "Defeated Devimon and cleansed the File Island.",
    category: "campaign",
    requirement_type: "campaign_stage",
    requirement_value: 20,
    tier: "bronze",
    rewards: { bits: 200 },
  },
  {
    id: 3,
    name: "Vampire Hunter",
    description: "Defeated the resurrected Myotismon.",
    category: "campaign",
    requirement_type: "campaign_stage",
    requirement_value: 30,
    tier: "silver",
    rewards: { bits: 500, digiEggPool: ROOKIE_POOL_A },
  },
  {
    id: 4,
    name: "Master of the Spiral",
    description: "Conquered all four Dark Masters.",
    category: "campaign",
    requirement_type: "campaign_stage",
    requirement_value: 46,
    tier: "gold",
    rewards: { bits: 1000, digiEggPool: ROOKIE_POOL_B },
  },
  {
    id: 5,
    name: "DigiDestined",
    description: "Defeated the final boss, Apocalymon.",
    category: "campaign",
    requirement_type: "campaign_stage",
    requirement_value: 60,
    tier: "platinum",
    rewards: { bits: 2000, digiEggPool: ROOKIE_POOL_C },
  },
  {
    id: 6,
    name: "Seven Deadly Sins",
    description: "Defeated all Seven Great Demon Lords.",
    category: "campaign",
    requirement_type: "campaign_stage",
    requirement_value: 70,
    tier: "platinum",
    rewards: { bits: 2500, digiEggPool: CHAMPION_POOL },
  },
  {
    id: 7,
    name: "Royal Challenger",
    description: "Defeated and gained the trust of the Royal Knights.",
    category: "campaign",
    requirement_type: "campaign_stage",
    requirement_value: 80,
    tier: "platinum",
    rewards: { bits: 3000, digiEggPool: CHAMPION_POOL },
  },
  {
    id: 8,
    name: "Multiversal Tamer",
    description: "Survived the Space Time Distortion.",
    category: "campaign",
    requirement_type: "campaign_stage",
    requirement_value: 56,
    tier: "platinum",
    rewards: { bits: 2000, digiEggPool: CHAMPION_POOL },
  },

  // ── Collection titles ─────────────────────────────────────────────────────
  {
    id: 101,
    name: "Digimon Fan",
    description: "Discovered 50 different Digimon",
    category: "collection",
    requirement_type: "digimon_count",
    requirement_value: 50,
    tier: "bronze",
    rewards: { bits: 200 },
  },
  {
    id: 102,
    name: "Digimon Researcher",
    description: "Discovered 100 different Digimon",
    category: "collection",
    requirement_type: "digimon_count",
    requirement_value: 100,
    tier: "silver",
    rewards: { bits: 500 },
  },
  {
    id: 103,
    name: "Digimon Professor",
    description: "Discovered 200 different Digimon",
    category: "collection",
    requirement_type: "digimon_count",
    requirement_value: 200,
    tier: "gold",
    rewards: { bits: 1000 },
  },
  {
    id: 104,
    name: "Digimon Master",
    description: "Discovered 300 different Digimon",
    category: "collection",
    requirement_type: "digimon_count",
    requirement_value: 300,
    tier: "platinum",
    rewards: { bits: 2000 },
  },
  // {
  //   id: 105,
  //   name: "Digimon Legend",
  //   description: "Discovered every single Digimon",
  //   category: "collection",
  //   requirement_type: "digimon_count",
  //   requirement_value: 362,
  //   tier: "platinum",
  //   rewards: { bits: 5000 },
  // },

  // ── Evolution titles ──────────────────────────────────────────────────────
  {
    id: 201,
    name: "Ultimate Tamer",
    description: "Evolved a Digimon to Ultimate stage",
    category: "evolution",
    requirement_type: "digimon_stage",
    requirement_value: "Ultimate",
    tier: "silver",
    rewards: { bits: 300 },
  },
  {
    id: 202,
    name: "Mega Tamer",
    description: "Evolved a Digimon to Mega stage",
    category: "evolution",
    requirement_type: "digimon_stage",
    requirement_value: "Mega",
    tier: "gold",
    rewards: { bits: 500, digiEggPool: IN_TRAINING_POOL },
  },
  {
    id: 203,
    name: "Ultra Tamer",
    description: "Evolved a Digimon to Ultra stage",
    category: "evolution",
    requirement_type: "digimon_stage",
    requirement_value: "Ultra",
    tier: "platinum",
    rewards: { bits: 1000, digiEggPool: ROOKIE_POOL_A },
  },

  // ── Battle titles ─────────────────────────────────────────────────────────
  {
    id: 301,
    name: "Battle Novice",
    description: "Won 10 arena battles.",
    category: "battle",
    requirement_type: "battle_wins",
    requirement_value: 10,
    tier: "bronze",
    rewards: { digiEggPool: ROOKIE_POOL_A },
  },
  {
    id: 302,
    name: "Battle Expert",
    description: "Won 50 arena battles.",
    category: "battle",
    requirement_type: "battle_wins",
    requirement_value: 50,
    tier: "silver",
    rewards: { bits: 300, digiEggPool: ROOKIE_POOL_A },
  },
  {
    id: 303,
    name: "Battle Master",
    description: "Won 200 team battles.",
    category: "battle",
    requirement_type: "battle_wins",
    requirement_value: 200,
    tier: "gold",
    rewards: { bits: 750, digiEggPool: ROOKIE_POOL_B },
  },
  {
    id: 304,
    name: "Battle Champion",
    description: "Won 1000 arena battles.",
    category: "battle",
    requirement_type: "battle_wins",
    requirement_value: 1000,
    tier: "platinum",
    rewards: { bits: 2000, digiEggPool: CHAMPION_POOL },
  },

  // ── Streak titles ─────────────────────────────────────────────────────────
  {
    id: 400,
    name: "Getting Started",
    description: "Completed 1 Daily Quota.",
    category: "streak",
    requirement_type: "longest_streak",
    requirement_value: 1,
    tier: "bronze",
    rewards: { bits: 100 },
  },
  {
    id: 401,
    name: "In Training",
    description: "Maintained a 3 day streak.",
    category: "streak",
    requirement_type: "longest_streak",
    requirement_value: 3,
    tier: "bronze",
    rewards: { bits: 150 },
  },
  {
    id: 402,
    name: "Routine Rookie",
    description: "Maintained a 7 day streak.",
    category: "streak",
    requirement_type: "longest_streak",
    requirement_value: 7,
    tier: "silver",
    rewards: { bits: 200, digiEggPool: BABY_POOL },
  },
  {
    id: 403,
    name: "Champion Flow",
    description: "Maintained a 14 day streak.",
    category: "streak",
    requirement_type: "longest_streak",
    requirement_value: 14,
    tier: "silver",
    rewards: { bits: 300, digiEggPool: IN_TRAINING_POOL },
  },
  {
    id: 404,
    name: "Ultimate Bond",
    description: "Maintained a 31 day streak.",
    category: "streak",
    requirement_type: "longest_streak",
    requirement_value: 31,
    tier: "gold",
    rewards: { bits: 500, digiEggPool: IN_TRAINING_POOL },
  },
  {
    id: 405,
    name: "Crest Ignited",
    description: "Maintained a 50 day streak.",
    category: "streak",
    requirement_type: "longest_streak",
    requirement_value: 50,
    tier: "gold",
    rewards: { bits: 750, digiEggPool: ROOKIE_POOL_A },
  },
  {
    id: 406,
    name: "Digivolved",
    description: "Maintained a 75 day streak.",
    category: "streak",
    requirement_type: "longest_streak",
    requirement_value: 75,
    tier: "gold",
    rewards: { bits: 1000, digiEggPool: ROOKIE_POOL_B },
  },
  {
    id: 407,
    name: "Perfect Partner",
    description: "Maintained a 100 day streak.",
    category: "streak",
    requirement_type: "longest_streak",
    requirement_value: 100,
    tier: "platinum",
    rewards: { bits: 2000, digiEggPool: ROOKIE_POOL_C },
  },
  {
    id: 408,
    name: "Digitask Adventure",
    description: "Maintained a 365 day streak. One full year!",
    category: "streak",
    requirement_type: "longest_streak",
    requirement_value: 365,
    tier: "platinum",
    rewards: { bits: 5000, digiEggPool: CHAMPION_POOL },
  },

  // ── Task completion achievements (new) ────────────────────────────────────
  {
    id: 501,
    name: "First Steps",
    description: "Completed your very first task.",
    category: "tasks",
    requirement_type: "tasks_completed",
    requirement_value: 1,
    tier: "bronze",
    rewards: { bits: 100 },
  },
  {
    id: 502,
    name: "Getting the Hang of It",
    description: "Completed 10 tasks.",
    category: "tasks",
    requirement_type: "tasks_completed",
    requirement_value: 10,
    tier: "bronze",
    rewards: { bits: 200 },
  },
  {
    id: 503,
    name: "Committed",
    description: "Completed 25 tasks.",
    category: "tasks",
    requirement_type: "tasks_completed",
    requirement_value: 25,
    tier: "bronze",
    rewards: { bits: 300, digiEggPool: BABY_POOL },
  },
  {
    id: 504,
    name: "Task Apprentice",
    description: "Completed 50 tasks.",
    category: "tasks",
    requirement_type: "tasks_completed",
    requirement_value: 50,
    tier: "silver",
    rewards: { bits: 500, digiEggPool: IN_TRAINING_POOL },
  },
  {
    id: 505,
    name: "Task Adept",
    description: "Completed 100 tasks.",
    category: "tasks",
    requirement_type: "tasks_completed",
    requirement_value: 100,
    tier: "silver",
    rewards: { bits: 750, digiEggPool: ROOKIE_POOL_A },
  },
  {
    id: 506,
    name: "Task Master",
    description: "Completed 250 tasks.",
    category: "tasks",
    requirement_type: "tasks_completed",
    requirement_value: 250,
    tier: "gold",
    rewards: { bits: 1000, digiEggPool: ROOKIE_POOL_B },
  },
  {
    id: 507,
    name: "Digital Legend",
    description: "Completed 500 tasks.",
    category: "tasks",
    requirement_type: "tasks_completed",
    requirement_value: 500,
    tier: "gold",
    rewards: { bits: 1500, digiEggPool: ROOKIE_POOL_C },
  },
  {
    id: 508,
    name: "One Thousand Tasks",
    description: "Completed 1000 tasks. You are a true Tamer.",
    category: "tasks",
    requirement_type: "tasks_completed",
    requirement_value: 1000,
    tier: "platinum",
    rewards: { bits: 3000, digiEggPool: CHAMPION_POOL },
  },
];
