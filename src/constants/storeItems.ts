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
    value: number;
  };
}

// Store items data
export const STORE_ITEMS: StoreItem[] = [
  // Stat Boosters
  {
    id: "hp_chip",
    name: "HP Chip",
    description: "Gain 4 health bonus stats",
    category: ItemCategory.STAT_BOOSTER,
    price: 1000,
    currency: "bits",
    imageUrl: "/assets/items/chip.png",
    applyType: ItemApplyType.IMMEDIATE,
    effect: {
      type: "hp_bonus",
      value: 4,
    },
  },
  {
    id: "sp_chip",
    name: "SP Chip",
    description: "Gain 4 sp bonus stats",
    category: ItemCategory.STAT_BOOSTER,
    price: 1000,
    currency: "bits",
    imageUrl: "/assets/items/chip.png",
    applyType: ItemApplyType.IMMEDIATE,
    effect: {
      type: "sp_bonus",
      value: 4,
    },
  },
  {
    id: "meat_apple",
    name: "Meat Apple",
    description: "Gain 4 attack bonus stats",
    category: ItemCategory.STAT_BOOSTER,
    price: 1000,
    currency: "bits",
    imageUrl: "/assets/items/meat_apple.png",
    applyType: ItemApplyType.IMMEDIATE,
    effect: {
      type: "atk_bonus",
      value: 4,
    },
  },
  {
    id: "iron",
    name: "Iron",
    description: "Gain 4 defense bonus stats",
    category: ItemCategory.STAT_BOOSTER,
    price: 1000,
    currency: "bits",
    imageUrl: "/assets/items/pill.png",
    applyType: ItemApplyType.IMMEDIATE,
    effect: {
      type: "def_bonus",
      value: 4,
    },
  },
  {
    id: "brain_food",
    name: "Brain Food",
    description: "Gain 4 intelligence bonus stats",
    category: ItemCategory.STAT_BOOSTER,
    price: 1000,
    currency: "bits",
    imageUrl: "/assets/items/pill.png",
    applyType: ItemApplyType.IMMEDIATE,
    effect: {
      type: "int_bonus",
      value: 4,
    },
  },
  {
    id: "energy_drink",
    name: "Energy Drink",
    description: "Gain 4 speed bonus stats",
    category: ItemCategory.STAT_BOOSTER,
    price: 1000,
    currency: "bits",
    imageUrl: "/assets/items/can.png",
    applyType: ItemApplyType.IMMEDIATE,
    effect: {
      type: "spd_bonus",
      value: 4,
    },
  },
  {
    id: "abi_enhancer",
    name: "ABI Enhancer",
    description: "Increases Active Digimon's ABI by 2 points",
    category: ItemCategory.STAT_BOOSTER,
    price: 1000,
    currency: "bits",
    imageUrl: "/assets/items/chip.png",
    applyType: ItemApplyType.IMMEDIATE,
    effect: {
      type: "abi",
      value: 2,
    },
  },

  // Utility Items
  {
    id: "random_data",
    name: "Random Data",
    description: "Discovers an undiscovered Digimon",
    category: ItemCategory.UTILITY,
    price: 2000,
    currency: "bits",
    imageUrl: "/assets/items/floppy_disc.png",
    applyType: ItemApplyType.INVENTORY,
    effect: {
      type: "discover_digimon",
      value: 1,
    },
  },

  // Special Items
  {
    id: "avatar_chip",
    name: "Avatar Chip",
    description: "Unlock a random, rare Digimon profile picture",
    category: ItemCategory.SPECIAL,
    price: 600,
    currency: "bits",
    imageUrl: "/assets/items/chip.png",
    applyType: ItemApplyType.INVENTORY,
    effect: {
      type: "avatar_variant",
      value: 1,
    },
  },
  {
    id: "x_antibody",
    name: "X-Antibody",
    description: "Gain a vaccine allowing select Digimon to transform",
    category: ItemCategory.SPECIAL,
    price: 8000,
    currency: "bits",
    imageUrl: "/assets/items/x-antibody.png",
    applyType: ItemApplyType.INVENTORY,
    effect: {
      type: "x_antibody",
      value: 1,
    },
  },
];
