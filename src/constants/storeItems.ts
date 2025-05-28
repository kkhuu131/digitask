// Store item categories
export enum ItemCategory {
  STAT_BOOSTER = "Stat Booster",
  UTILITY = "Utility",
  SPECIAL = "Special",
}

// Item application types
export enum ItemApplyType {
  IMMEDIATE = "immediate", // Applied immediately on purchase
  INVENTORY = "inventory", // Goes to inventory for later use
}

// Add a new ItemEffect type
export enum ItemEffectType {
  STAT_BOOST = "stat_boost",
  PERSONALITY = "personality",
  DISCOVER = "discover_digimon",
  AVATAR = "avatar_variant",
  X_ANTIBODY = "x_antibody",
  STAT_RESET = "stat_reset", // New type for stat reset
}

// Personality types
export enum DigimonPersonality {
  DURABLE = "Durable", // HP focused
  LIVELY = "Lively", // SP focused
  FIGHTER = "Fighter", // ATK focused
  DEFENDER = "Defender", // DEF focused
  BRAINY = "Brainy", // INT focused
  NIMBLE = "Nimble", // SPD focused
}

// Define store item interface
export interface StoreItem {
  id: string;
  name: string;
  description: string;
  category: ItemCategory;
  price: number;
  currency: "bits" | "digicoins";
  imageUrl: string;
  applyType: ItemApplyType;
  effect?: {
    type: string;
    value: number | string;
  };
}

// Store items data
export const STORE_ITEMS: StoreItem[] = [
  // Stat Boosters
  {
    id: "hp_boost",
    name: "HP Boost",
    description: "Gain 4 health bonus stats",
    category: ItemCategory.STAT_BOOSTER,
    price: 1000,
    currency: "bits",
    imageUrl: "/assets/items/boost.png",
    applyType: ItemApplyType.IMMEDIATE,
    effect: {
      type: "hp_bonus",
      value: 4,
    },
  },
  {
    id: "sp_boost",
    name: "SP Boost",
    description: "Gain 4 sp bonus stats",
    category: ItemCategory.STAT_BOOSTER,
    price: 1000,
    currency: "bits",
    imageUrl: "/assets/items/boost.png",
    applyType: ItemApplyType.IMMEDIATE,
    effect: {
      type: "sp_bonus",
      value: 4,
    },
  },
  {
    id: "atk_boost",
    name: "ATK Boost",
    description: "Gain 4 attack bonus stats",
    category: ItemCategory.STAT_BOOSTER,
    price: 1000,
    currency: "bits",
    imageUrl: "/assets/items/boost.png",
    applyType: ItemApplyType.IMMEDIATE,
    effect: {
      type: "atk_bonus",
      value: 4,
    },
  },
  {
    id: "def_boost",
    name: "DEF Boost",
    description: "Gain 4 defense bonus stats",
    category: ItemCategory.STAT_BOOSTER,
    price: 1000,
    currency: "bits",
    imageUrl: "/assets/items/boost.png",
    applyType: ItemApplyType.IMMEDIATE,
    effect: {
      type: "def_bonus",
      value: 4,
    },
  },
  {
    id: "int_boost",
    name: "INT Boost",
    description: "Gain 4 intelligence bonus stats",
    category: ItemCategory.STAT_BOOSTER,
    price: 1000,
    currency: "bits",
    imageUrl: "/assets/items/boost.png",
    applyType: ItemApplyType.IMMEDIATE,
    effect: {
      type: "int_bonus",
      value: 4,
    },
  },
  {
    id: "speed_boost",
    name: "Speed Boost",
    description: "Gain 4 speed bonus stats",
    category: ItemCategory.STAT_BOOSTER,
    price: 1000,
    currency: "bits",
    imageUrl: "/assets/items/boost.png",
    applyType: ItemApplyType.IMMEDIATE,
    effect: {
      type: "spd_bonus",
      value: 4,
    },
  },
  // {
  //   id: "abi_boost",
  //   name: "ABI Boost",
  //   description: "Increases Active Digimon's ABI by 2 points",
  //   category: ItemCategory.STAT_BOOSTER,
  //   price: 1000,
  //   currency: "bits",
  //   imageUrl: "/assets/items/boost.png",
  //   applyType: ItemApplyType.IMMEDIATE,
  //   effect: {
  //     type: "abi",
  //     value: 2,
  //   },
  // },

  {
    id: "brave_point",
    name: "Brave Point",
    description: "+2000 EXP for Active Digimon",
    category: ItemCategory.UTILITY,
    price: 2500,
    currency: "bits",
    imageUrl: "/assets/items/brave_point.png",
    applyType: ItemApplyType.IMMEDIATE,
    effect: {
      type: "experience_points",
      value: 2000,
    },
  },

  // Utility Items
  {
    id: "stat_reset",
    name: "Restraint Chip",
    description: "Refunds the points spent on a chosen bonus stat of a Digimon",
    category: ItemCategory.UTILITY,
    price: 1500,
    currency: "bits",
    imageUrl: "/assets/items/restraint_chip.png",
    applyType: ItemApplyType.INVENTORY,
    effect: {
      type: ItemEffectType.STAT_RESET,
      value: 1,
    },
  },
  // Special Items
  // Personality Items
  {
    id: "durable_disc",
    name: "Durable Disc",
    description: "Changes a Digimon's personality to Durable (HP focused)",
    category: ItemCategory.UTILITY,
    price: 2500,
    currency: "bits",
    imageUrl: "/assets/items/disc.png",
    applyType: ItemApplyType.INVENTORY,
    effect: {
      type: ItemEffectType.PERSONALITY,
      value: DigimonPersonality.DURABLE,
    },
  },
  {
    id: "lively_disc",
    name: "Lively Disc",
    description: "Changes a Digimon's personality to Lively (SP focused)",
    category: ItemCategory.UTILITY,
    price: 2500,
    currency: "bits",
    imageUrl: "/assets/items/disc.png",
    applyType: ItemApplyType.INVENTORY,
    effect: {
      type: ItemEffectType.PERSONALITY,
      value: DigimonPersonality.LIVELY,
    },
  },
  {
    id: "fighter_disc",
    name: "Fighter Disc",
    description: "Changes a Digimon's personality to Fighter (ATK focused)",
    category: ItemCategory.UTILITY,
    price: 2500,
    currency: "bits",
    imageUrl: "/assets/items/disc.png",
    applyType: ItemApplyType.INVENTORY,
    effect: {
      type: ItemEffectType.PERSONALITY,
      value: DigimonPersonality.FIGHTER,
    },
  },
  {
    id: "defender_disc",
    name: "Defender Disc",
    description: "Changes a Digimon's personality to Defender (DEF focused)",
    category: ItemCategory.UTILITY,
    price: 2500,
    currency: "bits",
    imageUrl: "/assets/items/disc.png",
    applyType: ItemApplyType.INVENTORY,
    effect: {
      type: ItemEffectType.PERSONALITY,
      value: DigimonPersonality.DEFENDER,
    },
  },
  {
    id: "brainy_disc",
    name: "Brainy Disc",
    description: "Changes a Digimon's personality to Brainy (INT focused)",
    category: ItemCategory.UTILITY,
    price: 2500,
    currency: "bits",
    imageUrl: "/assets/items/disc.png",
    applyType: ItemApplyType.INVENTORY,
    effect: {
      type: ItemEffectType.PERSONALITY,
      value: DigimonPersonality.BRAINY,
    },
  },
  {
    id: "nimble_disc",
    name: "Nimble Disc",
    description: "Changes a Digimon's personality to Nimble (SPD focused)",
    category: ItemCategory.UTILITY,
    price: 2500,
    currency: "bits",
    imageUrl: "/assets/items/disc.png",
    applyType: ItemApplyType.INVENTORY,
    effect: {
      type: ItemEffectType.PERSONALITY,
      value: DigimonPersonality.NIMBLE,
    },
  },
  {
    id: "avatar_chip",
    name: "Avatar Chip",
    description: "Unlock a random, rare Digimon profile picture",
    category: ItemCategory.SPECIAL,
    price: 600,
    currency: "bits",
    imageUrl: "/assets/items/random_floppy_disc.png",
    applyType: ItemApplyType.INVENTORY,
    effect: {
      type: "avatar_variant",
      value: 1,
    },
  },
  {
    id: "random_data",
    name: "Random Digimon Data",
    description: "Discovers an undiscovered Digimon for the DigiDex",
    category: ItemCategory.UTILITY,
    price: 2000,
    currency: "bits",
    imageUrl: "/assets/items/data.png",
    applyType: ItemApplyType.INVENTORY,
    effect: {
      type: "discover_digimon",
      value: 1,
    },
  },
  {
    id: "x_antibody",
    name: "X-Antibody",
    description:
      "Grants a Digimon the ability to switch to its X-Antibody form at will",
    category: ItemCategory.SPECIAL,
    price: 3000,
    currency: "bits",
    imageUrl: "/assets/items/x-antibody.png",
    applyType: ItemApplyType.INVENTORY,
    effect: {
      type: "x_antibody",
      value: 1,
    },
  },
];
