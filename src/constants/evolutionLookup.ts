// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Generated from Supabase evolution_paths table

export type EvolutionPath = {
  id: number;
  from_digimon_id: number;
  to_digimon_id: number;
  level_required: number;
  stat_requirements: {
    hp?: number;
    sp?: number;
    atk?: number;
    def?: number;
    int?: number;
    spd?: number;
    abi?: number;
  };
  dna_requirement?: number | null;
};

export const EVOLUTION_LOOKUP_TABLE = {
  all: [
  {
    "id": 157,
    "from_digimon_id": 35,
    "to_digimon_id": 94,
    "level_required": 14,
    "stat_requirements": {
      "sp": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 161,
    "from_digimon_id": 37,
    "to_digimon_id": 95,
    "level_required": 12,
    "stat_requirements": {
      "hp": 130,
      "sp": 25,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 165,
    "from_digimon_id": 37,
    "to_digimon_id": 99,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 60
    },
    "dna_requirement": null
  },
  {
    "id": 173,
    "from_digimon_id": 40,
    "to_digimon_id": 102,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 9,
    "from_digimon_id": 4,
    "to_digimon_id": 7,
    "level_required": 3,
    "stat_requirements": {
      "atk": 15
    },
    "dna_requirement": null
  },
  {
    "id": 177,
    "from_digimon_id": 41,
    "to_digimon_id": 79,
    "level_required": 14,
    "stat_requirements": {
      "def": 55
    },
    "dna_requirement": null
  },
  {
    "id": 181,
    "from_digimon_id": 41,
    "to_digimon_id": 80,
    "level_required": 14,
    "stat_requirements": {
      "hp": 130,
      "def": 60
    },
    "dna_requirement": null
  },
  {
    "id": 185,
    "from_digimon_id": 44,
    "to_digimon_id": 140,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 912,
    "from_digimon_id": 342,
    "to_digimon_id": 344,
    "level_required": 60,
    "stat_requirements": {
      "abi": 50,
      "atk": 220,
      "int": 160,
      "spd": 135
    },
    "dna_requirement": 343
  },
  {
    "id": 938,
    "from_digimon_id": 364,
    "to_digimon_id": 207,
    "level_required": 26,
    "stat_requirements": {
      "hp": 600,
      "atk": 60
    },
    "dna_requirement": null
  },
  {
    "id": 13,
    "from_digimon_id": 7,
    "to_digimon_id": 18,
    "level_required": 9,
    "stat_requirements": {
      "atk": 30
    },
    "dna_requirement": null
  },
  {
    "id": 17,
    "from_digimon_id": 7,
    "to_digimon_id": 43,
    "level_required": 6,
    "stat_requirements": {
      "atk": 50,
      "def": 20
    },
    "dna_requirement": null
  },
  {
    "id": 21,
    "from_digimon_id": 8,
    "to_digimon_id": 62,
    "level_required": 7,
    "stat_requirements": {
      "atk": 20,
      "int": 20,
      "spd": 20
    },
    "dna_requirement": null
  },
  {
    "id": 25,
    "from_digimon_id": 9,
    "to_digimon_id": 33,
    "level_required": 7,
    "stat_requirements": {
      "atk": 40
    },
    "dna_requirement": null
  },
  {
    "id": 29,
    "from_digimon_id": 10,
    "to_digimon_id": 19,
    "level_required": 8,
    "stat_requirements": {
      "atk": 30
    },
    "dna_requirement": null
  },
  {
    "id": 34,
    "from_digimon_id": 11,
    "to_digimon_id": 51,
    "level_required": 9,
    "stat_requirements": {
      "spd": 30
    },
    "dna_requirement": null
  },
  {
    "id": 38,
    "from_digimon_id": 12,
    "to_digimon_id": 21,
    "level_required": 7,
    "stat_requirements": {
      "hp": 75,
      "def": 20
    },
    "dna_requirement": null
  },
  {
    "id": 42,
    "from_digimon_id": 13,
    "to_digimon_id": 22,
    "level_required": 7,
    "stat_requirements": {
      "sp": 20,
      "int": 30
    },
    "dna_requirement": null
  },
  {
    "id": 46,
    "from_digimon_id": 14,
    "to_digimon_id": 23,
    "level_required": 7,
    "stat_requirements": {
      "hp": 75,
      "sp": 20,
      "spd": 20
    },
    "dna_requirement": null
  },
  {
    "id": 50,
    "from_digimon_id": 15,
    "to_digimon_id": 24,
    "level_required": 7,
    "stat_requirements": {
      "int": 20
    },
    "dna_requirement": null
  },
  {
    "id": 54,
    "from_digimon_id": 16,
    "to_digimon_id": 32,
    "level_required": 8,
    "stat_requirements": {
      "def": 30
    },
    "dna_requirement": null
  },
  {
    "id": 58,
    "from_digimon_id": 17,
    "to_digimon_id": 25,
    "level_required": 9,
    "stat_requirements": {
      "atk": 20,
      "spd": 20
    },
    "dna_requirement": null
  },
  {
    "id": 62,
    "from_digimon_id": 18,
    "to_digimon_id": 90,
    "level_required": 16,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  {
    "id": 66,
    "from_digimon_id": 18,
    "to_digimon_id": 131,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40
    },
    "dna_requirement": null
  },
  {
    "id": 70,
    "from_digimon_id": 19,
    "to_digimon_id": 100,
    "level_required": 14,
    "stat_requirements": {
      "atk": 30,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 75,
    "from_digimon_id": 21,
    "to_digimon_id": 95,
    "level_required": 12,
    "stat_requirements": {
      "hp": 130,
      "sp": 25,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 79,
    "from_digimon_id": 21,
    "to_digimon_id": 99,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 60
    },
    "dna_requirement": null
  },
  {
    "id": 83,
    "from_digimon_id": 22,
    "to_digimon_id": 111,
    "level_required": 16,
    "stat_requirements": {
      "sp": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 87,
    "from_digimon_id": 23,
    "to_digimon_id": 86,
    "level_required": 15,
    "stat_requirements": {
      "atk": 35,
      "spd": 50
    },
    "dna_requirement": null
  },
  {
    "id": 91,
    "from_digimon_id": 23,
    "to_digimon_id": 137,
    "level_required": 16,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  {
    "id": 95,
    "from_digimon_id": 24,
    "to_digimon_id": 121,
    "level_required": 12,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 99,
    "from_digimon_id": 25,
    "to_digimon_id": 81,
    "level_required": 15,
    "stat_requirements": {
      "spd": 55
    },
    "dna_requirement": null
  },
  {
    "id": 103,
    "from_digimon_id": 25,
    "to_digimon_id": 101,
    "level_required": 15,
    "stat_requirements": {
      "atk": 50,
      "spd": 55
    },
    "dna_requirement": null
  },
  {
    "id": 107,
    "from_digimon_id": 26,
    "to_digimon_id": 119,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 111,
    "from_digimon_id": 27,
    "to_digimon_id": 119,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 116,
    "from_digimon_id": 28,
    "to_digimon_id": 86,
    "level_required": 15,
    "stat_requirements": {
      "atk": 35,
      "spd": 50
    },
    "dna_requirement": null
  },
  {
    "id": 120,
    "from_digimon_id": 28,
    "to_digimon_id": 136,
    "level_required": 12,
    "stat_requirements": {
      "hp": 500
    },
    "dna_requirement": null
  },
  {
    "id": 124,
    "from_digimon_id": 29,
    "to_digimon_id": 114,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "atk": 40
    },
    "dna_requirement": null
  },
  {
    "id": 128,
    "from_digimon_id": 30,
    "to_digimon_id": 98,
    "level_required": 18,
    "stat_requirements": {
      "abi": 5
    },
    "dna_requirement": null
  },
  {
    "id": 132,
    "from_digimon_id": 31,
    "to_digimon_id": 72,
    "level_required": 14,
    "stat_requirements": {
      "sp": 35,
      "int": 55
    },
    "dna_requirement": null
  },
  {
    "id": 136,
    "from_digimon_id": 31,
    "to_digimon_id": 69,
    "level_required": 16,
    "stat_requirements": {
      "atk": 50,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 140,
    "from_digimon_id": 32,
    "to_digimon_id": 112,
    "level_required": 14,
    "stat_requirements": {
      "def": 55
    },
    "dna_requirement": null
  },
  {
    "id": 144,
    "from_digimon_id": 33,
    "to_digimon_id": 81,
    "level_required": 15,
    "stat_requirements": {
      "spd": 55
    },
    "dna_requirement": null
  },
  {
    "id": 148,
    "from_digimon_id": 33,
    "to_digimon_id": 97,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "def": 25,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 152,
    "from_digimon_id": 34,
    "to_digimon_id": 133,
    "level_required": 14,
    "stat_requirements": {
      "hp": 250,
      "atk": 30
    },
    "dna_requirement": null
  },
  {
    "id": 325,
    "from_digimon_id": 83,
    "to_digimon_id": 200,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "sp": 70,
      "int": 70
    },
    "dna_requirement": null
  },
  {
    "id": 329,
    "from_digimon_id": 85,
    "to_digimon_id": 170,
    "level_required": 30,
    "stat_requirements": {
      "hp": 800,
      "atk": 75
    },
    "dna_requirement": null
  },
  {
    "id": 333,
    "from_digimon_id": 86,
    "to_digimon_id": 192,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 80,
      "int": 70
    },
    "dna_requirement": null
  },
  {
    "id": 337,
    "from_digimon_id": 87,
    "to_digimon_id": 172,
    "level_required": 30,
    "stat_requirements": {
      "sp": 60,
      "int": 75,
      "spd": 60
    },
    "dna_requirement": null
  },
  {
    "id": 194,
    "from_digimon_id": 46,
    "to_digimon_id": 115,
    "level_required": 16,
    "stat_requirements": {
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 342,
    "from_digimon_id": 88,
    "to_digimon_id": 203,
    "level_required": 30,
    "stat_requirements": {
      "hp": 350,
      "atk": 100
    },
    "dna_requirement": null
  },
  {
    "id": 346,
    "from_digimon_id": 89,
    "to_digimon_id": 163,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 350,
    "from_digimon_id": 90,
    "to_digimon_id": 201,
    "level_required": 26,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 354,
    "from_digimon_id": 91,
    "to_digimon_id": 182,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 358,
    "from_digimon_id": 92,
    "to_digimon_id": 182,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 362,
    "from_digimon_id": 93,
    "to_digimon_id": 158,
    "level_required": 28,
    "stat_requirements": {
      "def": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 366,
    "from_digimon_id": 94,
    "to_digimon_id": 200,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "sp": 70,
      "int": 70
    },
    "dna_requirement": null
  },
  {
    "id": 370,
    "from_digimon_id": 98,
    "to_digimon_id": 191,
    "level_required": 32,
    "stat_requirements": {},
    "dna_requirement": null
  },
  {
    "id": 913,
    "from_digimon_id": 343,
    "to_digimon_id": 344,
    "level_required": 60,
    "stat_requirements": {
      "abi": 50,
      "atk": 220,
      "int": 160,
      "spd": 135
    },
    "dna_requirement": 342
  },
  {
    "id": 939,
    "from_digimon_id": 365,
    "to_digimon_id": 366,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "def": 130,
      "spd": 120
    },
    "dna_requirement": null
  },
  {
    "id": 198,
    "from_digimon_id": 47,
    "to_digimon_id": 90,
    "level_required": 16,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  {
    "id": 202,
    "from_digimon_id": 47,
    "to_digimon_id": 123,
    "level_required": 16,
    "stat_requirements": {
      "atk": 55,
      "spd": 50
    },
    "dna_requirement": null
  },
  {
    "id": 206,
    "from_digimon_id": 48,
    "to_digimon_id": 102,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 210,
    "from_digimon_id": 49,
    "to_digimon_id": 65,
    "level_required": 15,
    "stat_requirements": {
      "atk": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 214,
    "from_digimon_id": 49,
    "to_digimon_id": 124,
    "level_required": 13,
    "stat_requirements": {
      "sp": 40,
      "int": 30
    },
    "dna_requirement": null
  },
  {
    "id": 219,
    "from_digimon_id": 50,
    "to_digimon_id": 75,
    "level_required": 14,
    "stat_requirements": {
      "atk": 35,
      "spd": 45
    },
    "dna_requirement": null
  },
  {
    "id": 223,
    "from_digimon_id": 51,
    "to_digimon_id": 130,
    "level_required": 14,
    "stat_requirements": {
      "spd": 50
    },
    "dna_requirement": null
  },
  {
    "id": 227,
    "from_digimon_id": 53,
    "to_digimon_id": 324,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 120,
      "def": 145
    },
    "dna_requirement": null
  },
  {
    "id": 231,
    "from_digimon_id": 54,
    "to_digimon_id": 115,
    "level_required": 16,
    "stat_requirements": {
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 235,
    "from_digimon_id": 54,
    "to_digimon_id": 123,
    "level_required": 16,
    "stat_requirements": {
      "atk": 55,
      "spd": 50
    },
    "dna_requirement": null
  },
  {
    "id": 239,
    "from_digimon_id": 55,
    "to_digimon_id": 121,
    "level_required": 12,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 247,
    "from_digimon_id": 59,
    "to_digimon_id": 74,
    "level_required": 14,
    "stat_requirements": {
      "hp": 500
    },
    "dna_requirement": null
  },
  {
    "id": 251,
    "from_digimon_id": 60,
    "to_digimon_id": 77,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 255,
    "from_digimon_id": 62,
    "to_digimon_id": 85,
    "level_required": 15,
    "stat_requirements": {
      "spd": 50
    },
    "dna_requirement": null
  },
  {
    "id": 260,
    "from_digimon_id": 63,
    "to_digimon_id": 72,
    "level_required": 14,
    "stat_requirements": {
      "sp": 35,
      "int": 55
    },
    "dna_requirement": null
  },
  {
    "id": 264,
    "from_digimon_id": 63,
    "to_digimon_id": 113,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 268,
    "from_digimon_id": 64,
    "to_digimon_id": 93,
    "level_required": 14,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  {
    "id": 272,
    "from_digimon_id": 65,
    "to_digimon_id": 147,
    "level_required": 30,
    "stat_requirements": {
      "abi": 10,
      "atk": 70,
      "int": 90
    },
    "dna_requirement": null
  },
  {
    "id": 276,
    "from_digimon_id": 65,
    "to_digimon_id": 173,
    "level_required": 28,
    "stat_requirements": {
      "sp": 70,
      "int": 85
    },
    "dna_requirement": null
  },
  {
    "id": 280,
    "from_digimon_id": 67,
    "to_digimon_id": 208,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "spd": 90
    },
    "dna_requirement": null
  },
  {
    "id": 284,
    "from_digimon_id": 70,
    "to_digimon_id": 168,
    "level_required": 28,
    "stat_requirements": {
      "atk": 120,
      "def": 85,
      "spd": 70
    },
    "dna_requirement": null
  },
  {
    "id": 288,
    "from_digimon_id": 71,
    "to_digimon_id": 194,
    "level_required": 28,
    "stat_requirements": {
      "hp": 850,
      "def": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  {
    "id": 292,
    "from_digimon_id": 72,
    "to_digimon_id": 177,
    "level_required": 28,
    "stat_requirements": {
      "hp": 500,
      "atk": 95
    },
    "dna_requirement": null
  },
  {
    "id": 296,
    "from_digimon_id": 74,
    "to_digimon_id": 172,
    "level_required": 30,
    "stat_requirements": {
      "sp": 60,
      "int": 75,
      "spd": 60
    },
    "dna_requirement": null
  },
  {
    "id": 301,
    "from_digimon_id": 76,
    "to_digimon_id": 148,
    "level_required": 30,
    "stat_requirements": {
      "abi": 10,
      "atk": 80,
      "spd": 95
    },
    "dna_requirement": null
  },
  {
    "id": 305,
    "from_digimon_id": 77,
    "to_digimon_id": 195,
    "level_required": 30,
    "stat_requirements": {
      "sp": 80,
      "abi": 10,
      "int": 80
    },
    "dna_requirement": null
  },
  {
    "id": 309,
    "from_digimon_id": 78,
    "to_digimon_id": 177,
    "level_required": 28,
    "stat_requirements": {
      "hp": 500,
      "atk": 95
    },
    "dna_requirement": null
  },
  {
    "id": 313,
    "from_digimon_id": 79,
    "to_digimon_id": 160,
    "level_required": 26,
    "stat_requirements": {
      "hp": 400,
      "atk": 95
    },
    "dna_requirement": null
  },
  {
    "id": 317,
    "from_digimon_id": 81,
    "to_digimon_id": 160,
    "level_required": 26,
    "stat_requirements": {
      "hp": 400,
      "atk": 95
    },
    "dna_requirement": null
  },
  {
    "id": 321,
    "from_digimon_id": 82,
    "to_digimon_id": 165,
    "level_required": 28,
    "stat_requirements": {
      "hp": 800,
      "def": 70
    },
    "dna_requirement": null
  },
  {
    "id": 473,
    "from_digimon_id": 137,
    "to_digimon_id": 145,
    "level_required": 26,
    "stat_requirements": {
      "def": 110
    },
    "dna_requirement": null
  },
  {
    "id": 477,
    "from_digimon_id": 137,
    "to_digimon_id": 161,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 80,
      "spd": 70
    },
    "dna_requirement": null
  },
  {
    "id": 481,
    "from_digimon_id": 140,
    "to_digimon_id": 141,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "def": 95
    },
    "dna_requirement": null
  },
  {
    "id": 499,
    "from_digimon_id": 146,
    "to_digimon_id": 260,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1100,
      "abi": 20,
      "atk": 180,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 379,
    "from_digimon_id": 103,
    "to_digimon_id": 179,
    "level_required": 26,
    "stat_requirements": {
      "hp": 900
    },
    "dna_requirement": null
  },
  {
    "id": 500,
    "from_digimon_id": 146,
    "to_digimon_id": 281,
    "level_required": 60,
    "stat_requirements": {
      "hp": 2000,
      "abi": 80,
      "atk": 250,
      "spd": 150
    },
    "dna_requirement": null
  },
  {
    "id": 501,
    "from_digimon_id": 146,
    "to_digimon_id": 218,
    "level_required": 60,
    "stat_requirements": {
      "sp": 130,
      "abi": 40,
      "atk": 200,
      "spd": 100
    },
    "dna_requirement": null
  },
  {
    "id": 502,
    "from_digimon_id": 147,
    "to_digimon_id": 227,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1200,
      "sp": 110,
      "abi": 40,
      "atk": 110,
      "int": 110
    },
    "dna_requirement": null
  },
  {
    "id": 503,
    "from_digimon_id": 147,
    "to_digimon_id": 271,
    "level_required": 60,
    "stat_requirements": {
      "sp": 160,
      "abi": 80,
      "def": 120,
      "int": 200
    },
    "dna_requirement": null
  },
  {
    "id": 506,
    "from_digimon_id": 147,
    "to_digimon_id": 238,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1300,
      "abi": 40,
      "atk": 110,
      "int": 110
    },
    "dna_requirement": null
  },
  {
    "id": 510,
    "from_digimon_id": 150,
    "to_digimon_id": 244,
    "level_required": 55,
    "stat_requirements": {
      "abi": 40,
      "atk": 130,
      "def": 120,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 518,
    "from_digimon_id": 152,
    "to_digimon_id": 289,
    "level_required": 60,
    "stat_requirements": {
      "sp": 120,
      "abi": 80,
      "atk": 120,
      "int": 120
    },
    "dna_requirement": 214
  },
  {
    "id": 522,
    "from_digimon_id": 153,
    "to_digimon_id": 280,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1100,
      "abi": 20,
      "def": 150,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 527,
    "from_digimon_id": 154,
    "to_digimon_id": 240,
    "level_required": 50,
    "stat_requirements": {
      "sp": 110,
      "abi": 20,
      "int": 140
    },
    "dna_requirement": null
  },
  {
    "id": 531,
    "from_digimon_id": 156,
    "to_digimon_id": 255,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 150,
      "def": 140
    },
    "dna_requirement": null
  },
  {
    "id": 535,
    "from_digimon_id": 158,
    "to_digimon_id": 254,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "def": 130,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 539,
    "from_digimon_id": 160,
    "to_digimon_id": 272,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 130
    },
    "dna_requirement": null
  },
  {
    "id": 543,
    "from_digimon_id": 163,
    "to_digimon_id": 257,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1400,
      "abi": 20,
      "atk": 150,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 914,
    "from_digimon_id": 204,
    "to_digimon_id": 342,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1800,
      "abi": 25,
      "atk": 180,
      "def": 150
    },
    "dna_requirement": null
  },
  {
    "id": 940,
    "from_digimon_id": 160,
    "to_digimon_id": 366,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "def": 130,
      "spd": 120
    },
    "dna_requirement": null
  },
  {
    "id": 383,
    "from_digimon_id": 105,
    "to_digimon_id": 156,
    "level_required": 26,
    "stat_requirements": {
      "hp": 800,
      "atk": 75,
      "def": 95
    },
    "dna_requirement": null
  },
  {
    "id": 387,
    "from_digimon_id": 106,
    "to_digimon_id": 151,
    "level_required": 26,
    "stat_requirements": {
      "sp": 75,
      "def": 75,
      "spd": 65
    },
    "dna_requirement": null
  },
  {
    "id": 391,
    "from_digimon_id": 107,
    "to_digimon_id": 199,
    "level_required": 26,
    "stat_requirements": {
      "atk": 75,
      "def": 80
    },
    "dna_requirement": null
  },
  {
    "id": 395,
    "from_digimon_id": 108,
    "to_digimon_id": 146,
    "level_required": 30,
    "stat_requirements": {
      "atk": 95,
      "spd": 80
    },
    "dna_requirement": null
  },
  {
    "id": 399,
    "from_digimon_id": 111,
    "to_digimon_id": 143,
    "level_required": 28,
    "stat_requirements": {
      "atk": 65,
      "int": 75,
      "spd": 85
    },
    "dna_requirement": null
  },
  {
    "id": 404,
    "from_digimon_id": 112,
    "to_digimon_id": 158,
    "level_required": 28,
    "stat_requirements": {
      "def": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 408,
    "from_digimon_id": 114,
    "to_digimon_id": 201,
    "level_required": 26,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 412,
    "from_digimon_id": 115,
    "to_digimon_id": 166,
    "level_required": 30,
    "stat_requirements": {
      "atk": 60,
      "int": 75,
      "spd": 75
    },
    "dna_requirement": 67
  },
  {
    "id": 416,
    "from_digimon_id": 116,
    "to_digimon_id": 147,
    "level_required": 30,
    "stat_requirements": {
      "abi": 10,
      "atk": 70,
      "int": 90
    },
    "dna_requirement": null
  },
  {
    "id": 420,
    "from_digimon_id": 118,
    "to_digimon_id": 187,
    "level_required": 26,
    "stat_requirements": {
      "hp": 850,
      "atk": 60,
      "int": 60
    },
    "dna_requirement": null
  },
  {
    "id": 424,
    "from_digimon_id": 119,
    "to_digimon_id": 181,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 551,
    "from_digimon_id": 166,
    "to_digimon_id": 263,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1200,
      "abi": 80,
      "atk": 140,
      "def": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 555,
    "from_digimon_id": 167,
    "to_digimon_id": 234,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1700,
      "abi": 80,
      "atk": 145,
      "def": 120
    },
    "dna_requirement": null
  },
  {
    "id": 428,
    "from_digimon_id": 120,
    "to_digimon_id": 167,
    "level_required": 28,
    "stat_requirements": {
      "sp": 70,
      "atk": 70,
      "def": 80
    },
    "dna_requirement": null
  },
  {
    "id": 432,
    "from_digimon_id": 121,
    "to_digimon_id": 207,
    "level_required": 26,
    "stat_requirements": {
      "hp": 600,
      "atk": 60
    },
    "dna_requirement": null
  },
  {
    "id": 436,
    "from_digimon_id": 122,
    "to_digimon_id": 208,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "spd": 90
    },
    "dna_requirement": null
  },
  {
    "id": 440,
    "from_digimon_id": 124,
    "to_digimon_id": 187,
    "level_required": 26,
    "stat_requirements": {
      "hp": 850,
      "atk": 60,
      "int": 60
    },
    "dna_requirement": null
  },
  {
    "id": 445,
    "from_digimon_id": 125,
    "to_digimon_id": 150,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "spd": 95
    },
    "dna_requirement": null
  },
  {
    "id": 449,
    "from_digimon_id": 127,
    "to_digimon_id": 151,
    "level_required": 26,
    "stat_requirements": {
      "sp": 75,
      "def": 75,
      "spd": 65
    },
    "dna_requirement": null
  },
  {
    "id": 453,
    "from_digimon_id": 128,
    "to_digimon_id": 163,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 457,
    "from_digimon_id": 129,
    "to_digimon_id": 141,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "def": 95
    },
    "dna_requirement": null
  },
  {
    "id": 461,
    "from_digimon_id": 130,
    "to_digimon_id": 188,
    "level_required": 26,
    "stat_requirements": {
      "sp": 75,
      "int": 80,
      "spd": 80
    },
    "dna_requirement": null
  },
  {
    "id": 465,
    "from_digimon_id": 131,
    "to_digimon_id": 192,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 80,
      "int": 70
    },
    "dna_requirement": null
  },
  {
    "id": 654,
    "from_digimon_id": 206,
    "to_digimon_id": 277,
    "level_required": 45,
    "stat_requirements": {
      "abi": 20,
      "def": 150
    },
    "dna_requirement": null
  },
  {
    "id": 658,
    "from_digimon_id": 208,
    "to_digimon_id": 236,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 135,
      "spd": 120
    },
    "dna_requirement": null
  },
  {
    "id": 662,
    "from_digimon_id": 208,
    "to_digimon_id": 331,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 180
    },
    "dna_requirement": null
  },
  {
    "id": 564,
    "from_digimon_id": 170,
    "to_digimon_id": 279,
    "level_required": 50,
    "stat_requirements": {
      "sp": 100,
      "abi": 20,
      "def": 120,
      "int": 145
    },
    "dna_requirement": null
  },
  {
    "id": 671,
    "from_digimon_id": 211,
    "to_digimon_id": 298,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "def": 135,
      "spd": 125
    },
    "dna_requirement": null
  },
  {
    "id": 675,
    "from_digimon_id": 213,
    "to_digimon_id": 322,
    "level_required": 70,
    "stat_requirements": {
      "hp": 1400,
      "sp": 160,
      "abi": 100,
      "atk": 130,
      "int": 250,
      "spd": 170
    },
    "dna_requirement": null
  },
  {
    "id": 679,
    "from_digimon_id": 215,
    "to_digimon_id": 292,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 683,
    "from_digimon_id": 216,
    "to_digimon_id": 291,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 150,
      "spd": 140
    },
    "dna_requirement": null
  },
  {
    "id": 687,
    "from_digimon_id": 217,
    "to_digimon_id": 273,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "int": 160,
      "spd": 110
    },
    "dna_requirement": null
  },
  {
    "id": 691,
    "from_digimon_id": 222,
    "to_digimon_id": 223,
    "level_required": 0,
    "stat_requirements": {},
    "dna_requirement": null
  },
  {
    "id": 695,
    "from_digimon_id": 260,
    "to_digimon_id": 310,
    "level_required": 70,
    "stat_requirements": {
      "hp": 2000,
      "sp": 140,
      "abi": 100,
      "atk": 290
    },
    "dna_requirement": null
  },
  {
    "id": 703,
    "from_digimon_id": 276,
    "to_digimon_id": 316,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1500,
      "abi": 40,
      "atk": 150,
      "def": 200
    },
    "dna_requirement": 298
  },
  {
    "id": 707,
    "from_digimon_id": 292,
    "to_digimon_id": 293,
    "level_required": 60,
    "stat_requirements": {
      "abi": 30,
      "atk": 200,
      "spd": 200
    },
    "dna_requirement": null
  },
  {
    "id": 568,
    "from_digimon_id": 174,
    "to_digimon_id": 251,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "def": 140,
      "int": 120,
      "spd": 150
    },
    "dna_requirement": null
  },
  {
    "id": 712,
    "from_digimon_id": 299,
    "to_digimon_id": 332,
    "level_required": 99,
    "stat_requirements": {
      "abi": 120
    },
    "dna_requirement": null
  },
  {
    "id": 716,
    "from_digimon_id": 255,
    "to_digimon_id": 317,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 255
    },
    "dna_requirement": 272
  },
  {
    "id": 720,
    "from_digimon_id": 20,
    "to_digimon_id": 137,
    "level_required": 16,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  {
    "id": 915,
    "from_digimon_id": 215,
    "to_digimon_id": 343,
    "level_required": 55,
    "stat_requirements": {
      "abi": 25,
      "atk": 190,
      "def": 130,
      "int": 100
    },
    "dna_requirement": null
  },
  {
    "id": 941,
    "from_digimon_id": 196,
    "to_digimon_id": 366,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "def": 130,
      "spd": 120
    },
    "dna_requirement": null
  },
  {
    "id": 576,
    "from_digimon_id": 177,
    "to_digimon_id": 286,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 145,
      "def": 100
    },
    "dna_requirement": null
  },
  {
    "id": 580,
    "from_digimon_id": 179,
    "to_digimon_id": 235,
    "level_required": 45,
    "stat_requirements": {
      "abi": 20,
      "atk": 110,
      "def": 130,
      "spd": 100
    },
    "dna_requirement": null
  },
  {
    "id": 584,
    "from_digimon_id": 182,
    "to_digimon_id": 241,
    "level_required": 60,
    "stat_requirements": {
      "sp": 110,
      "abi": 80,
      "def": 180,
      "int": 140
    },
    "dna_requirement": null
  },
  {
    "id": 589,
    "from_digimon_id": 183,
    "to_digimon_id": 294,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 130,
      "def": 130
    },
    "dna_requirement": null
  },
  {
    "id": 593,
    "from_digimon_id": 185,
    "to_digimon_id": 272,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 130
    },
    "dna_requirement": null
  },
  {
    "id": 597,
    "from_digimon_id": 187,
    "to_digimon_id": 307,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 605,
    "from_digimon_id": 192,
    "to_digimon_id": 271,
    "level_required": 60,
    "stat_requirements": {
      "sp": 160,
      "abi": 80,
      "def": 120,
      "int": 200
    },
    "dna_requirement": null
  },
  {
    "id": 609,
    "from_digimon_id": 193,
    "to_digimon_id": 269,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 100,
      "def": 130,
      "int": 100
    },
    "dna_requirement": null
  },
  {
    "id": 613,
    "from_digimon_id": 194,
    "to_digimon_id": 299,
    "level_required": 50,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "def": 120,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 617,
    "from_digimon_id": 195,
    "to_digimon_id": 306,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 120,
      "int": 135,
      "spd": 150
    },
    "dna_requirement": null
  },
  {
    "id": 621,
    "from_digimon_id": 198,
    "to_digimon_id": 272,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 130
    },
    "dna_requirement": null
  },
  {
    "id": 625,
    "from_digimon_id": 199,
    "to_digimon_id": 274,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "def": 130,
      "int": 130
    },
    "dna_requirement": null
  },
  {
    "id": 724,
    "from_digimon_id": 36,
    "to_digimon_id": 329,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 728,
    "from_digimon_id": 38,
    "to_digimon_id": 128,
    "level_required": 16,
    "stat_requirements": {
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 732,
    "from_digimon_id": 42,
    "to_digimon_id": 335,
    "level_required": 14,
    "stat_requirements": {
      "sp": 40,
      "spd": 50
    },
    "dna_requirement": null
  },
  {
    "id": 737,
    "from_digimon_id": 43,
    "to_digimon_id": 329,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 630,
    "from_digimon_id": 200,
    "to_digimon_id": 268,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1000,
      "sp": 100,
      "abi": 20,
      "int": 130
    },
    "dna_requirement": null
  },
  {
    "id": 638,
    "from_digimon_id": 202,
    "to_digimon_id": 301,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 180,
      "def": 150
    },
    "dna_requirement": null
  },
  {
    "id": 642,
    "from_digimon_id": 203,
    "to_digimon_id": 230,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 100,
      "spd": 100
    },
    "dna_requirement": null
  },
  {
    "id": 646,
    "from_digimon_id": 204,
    "to_digimon_id": 276,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1800,
      "abi": 20,
      "atk": 140,
      "def": 140
    },
    "dna_requirement": null
  },
  {
    "id": 650,
    "from_digimon_id": 205,
    "to_digimon_id": 301,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 180,
      "def": 150
    },
    "dna_requirement": null
  },
  {
    "id": 753,
    "from_digimon_id": 61,
    "to_digimon_id": 138,
    "level_required": 15,
    "stat_requirements": {
      "atk": 35,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 770,
    "from_digimon_id": 75,
    "to_digimon_id": 200,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "sp": 70,
      "int": 70
    },
    "dna_requirement": null
  },
  {
    "id": 774,
    "from_digimon_id": 80,
    "to_digimon_id": 178,
    "level_required": 40,
    "stat_requirements": {
      "hp": 800,
      "atk": 80,
      "def": 80
    },
    "dna_requirement": null
  },
  {
    "id": 860,
    "from_digimon_id": 173,
    "to_digimon_id": 221,
    "level_required": 45,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 864,
    "from_digimon_id": 178,
    "to_digimon_id": 264,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 140,
      "def": 120
    },
    "dna_requirement": null
  },
  {
    "id": 868,
    "from_digimon_id": 180,
    "to_digimon_id": 237,
    "level_required": 45,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 120,
      "def": 120
    },
    "dna_requirement": null
  },
  {
    "id": 876,
    "from_digimon_id": 190,
    "to_digimon_id": 227,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1200,
      "sp": 110,
      "abi": 40,
      "atk": 110,
      "int": 110
    },
    "dna_requirement": null
  },
  {
    "id": 880,
    "from_digimon_id": 196,
    "to_digimon_id": 234,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1700,
      "abi": 80,
      "atk": 145,
      "def": 120
    },
    "dna_requirement": null
  },
  {
    "id": 884,
    "from_digimon_id": 197,
    "to_digimon_id": 273,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "int": 160,
      "spd": 110
    },
    "dna_requirement": null
  },
  {
    "id": 888,
    "from_digimon_id": 252,
    "to_digimon_id": 314,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1650,
      "abi": 100,
      "atk": 150,
      "spd": 150
    },
    "dna_requirement": 278
  },
  {
    "id": 893,
    "from_digimon_id": 326,
    "to_digimon_id": 327,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 130,
      "def": 130,
      "spd": 120
    },
    "dna_requirement": null
  },
  {
    "id": 897,
    "from_digimon_id": 333,
    "to_digimon_id": 138,
    "level_required": 15,
    "stat_requirements": {
      "atk": 35,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 901,
    "from_digimon_id": 328,
    "to_digimon_id": 329,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 905,
    "from_digimon_id": 329,
    "to_digimon_id": 158,
    "level_required": 28,
    "stat_requirements": {
      "def": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 909,
    "from_digimon_id": 330,
    "to_digimon_id": 244,
    "level_required": 55,
    "stat_requirements": {
      "abi": 40,
      "atk": 130,
      "def": 120,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 916,
    "from_digimon_id": 345,
    "to_digimon_id": 346,
    "level_required": 16,
    "stat_requirements": {
      "atk": 60
    },
    "dna_requirement": null
  },
  {
    "id": 942,
    "from_digimon_id": 365,
    "to_digimon_id": 245,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 145,
      "spd": 120
    },
    "dna_requirement": null
  },
  {
    "id": 2,
    "from_digimon_id": 1,
    "to_digimon_id": 13,
    "level_required": 5,
    "stat_requirements": {},
    "dna_requirement": null
  },
  {
    "id": 3,
    "from_digimon_id": 1,
    "to_digimon_id": 6,
    "level_required": 8,
    "stat_requirements": {
      "abi": 5,
      "atk": 55
    },
    "dna_requirement": null
  },
  {
    "id": 742,
    "from_digimon_id": 52,
    "to_digimon_id": 118,
    "level_required": 16,
    "stat_requirements": {
      "hp": 300,
      "def": 30
    },
    "dna_requirement": null
  },
  {
    "id": 746,
    "from_digimon_id": 57,
    "to_digimon_id": 129,
    "level_required": 12,
    "stat_requirements": {
      "hp": 300
    },
    "dna_requirement": null
  },
  {
    "id": 750,
    "from_digimon_id": 58,
    "to_digimon_id": 89,
    "level_required": 16,
    "stat_requirements": {
      "hp": 150,
      "atk": 40
    },
    "dna_requirement": null
  },
  {
    "id": 754,
    "from_digimon_id": 61,
    "to_digimon_id": 335,
    "level_required": 14,
    "stat_requirements": {
      "sp": 40,
      "spd": 50
    },
    "dna_requirement": null
  },
  {
    "id": 758,
    "from_digimon_id": 66,
    "to_digimon_id": 170,
    "level_required": 30,
    "stat_requirements": {
      "hp": 800,
      "atk": 75
    },
    "dna_requirement": null
  },
  {
    "id": 762,
    "from_digimon_id": 68,
    "to_digimon_id": 209,
    "level_required": 30,
    "stat_requirements": {
      "hp": 350,
      "atk": 100,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 766,
    "from_digimon_id": 73,
    "to_digimon_id": 155,
    "level_required": 30,
    "stat_requirements": {
      "hp": 300,
      "atk": 100,
      "spd": 85
    },
    "dna_requirement": null
  },
  {
    "id": 778,
    "from_digimon_id": 96,
    "to_digimon_id": 148,
    "level_required": 30,
    "stat_requirements": {
      "abi": 10,
      "atk": 80,
      "spd": 95
    },
    "dna_requirement": null
  },
  {
    "id": 782,
    "from_digimon_id": 97,
    "to_digimon_id": 180,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 786,
    "from_digimon_id": 99,
    "to_digimon_id": 187,
    "level_required": 26,
    "stat_requirements": {
      "hp": 850,
      "atk": 60,
      "int": 60
    },
    "dna_requirement": null
  },
  {
    "id": 790,
    "from_digimon_id": 101,
    "to_digimon_id": 216,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 90,
      "spd": 70
    },
    "dna_requirement": null
  },
  {
    "id": 794,
    "from_digimon_id": 104,
    "to_digimon_id": 330,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 798,
    "from_digimon_id": 110,
    "to_digimon_id": 155,
    "level_required": 30,
    "stat_requirements": {
      "hp": 300,
      "atk": 100,
      "spd": 85
    },
    "dna_requirement": null
  },
  {
    "id": 802,
    "from_digimon_id": 113,
    "to_digimon_id": 145,
    "level_required": 26,
    "stat_requirements": {
      "def": 110
    },
    "dna_requirement": null
  },
  {
    "id": 806,
    "from_digimon_id": 117,
    "to_digimon_id": 207,
    "level_required": 26,
    "stat_requirements": {
      "hp": 600,
      "atk": 60
    },
    "dna_requirement": null
  },
  {
    "id": 811,
    "from_digimon_id": 126,
    "to_digimon_id": 158,
    "level_required": 28,
    "stat_requirements": {
      "def": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 815,
    "from_digimon_id": 132,
    "to_digimon_id": 205,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 95
    },
    "dna_requirement": null
  },
  {
    "id": 819,
    "from_digimon_id": 135,
    "to_digimon_id": 161,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 80,
      "spd": 70
    },
    "dna_requirement": null
  },
  {
    "id": 823,
    "from_digimon_id": 136,
    "to_digimon_id": 169,
    "level_required": 28,
    "stat_requirements": {
      "atk": 80,
      "int": 70
    },
    "dna_requirement": null
  },
  {
    "id": 827,
    "from_digimon_id": 136,
    "to_digimon_id": 204,
    "level_required": 30,
    "stat_requirements": {
      "hp": 450,
      "atk": 110
    },
    "dna_requirement": null
  },
  {
    "id": 831,
    "from_digimon_id": 142,
    "to_digimon_id": 218,
    "level_required": 60,
    "stat_requirements": {
      "sp": 130,
      "abi": 40,
      "atk": 200,
      "spd": 100
    },
    "dna_requirement": null
  },
  {
    "id": 835,
    "from_digimon_id": 148,
    "to_digimon_id": 220,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 120,
      "spd": 145
    },
    "dna_requirement": null
  },
  {
    "id": 839,
    "from_digimon_id": 157,
    "to_digimon_id": 250,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1000,
      "abi": 20,
      "atk": 130,
      "def": 110
    },
    "dna_requirement": null
  },
  {
    "id": 847,
    "from_digimon_id": 161,
    "to_digimon_id": 219,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 150,
      "def": 170,
      "int": 135
    },
    "dna_requirement": null
  },
  {
    "id": 852,
    "from_digimon_id": 162,
    "to_digimon_id": 259,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "def": 120,
      "int": 130,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 856,
    "from_digimon_id": 171,
    "to_digimon_id": 252,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 130,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 6,
    "from_digimon_id": 2,
    "to_digimon_id": 16,
    "level_required": 3,
    "stat_requirements": {
      "def": 15
    },
    "dna_requirement": null
  },
  {
    "id": 8,
    "from_digimon_id": 3,
    "to_digimon_id": 12,
    "level_required": 3,
    "stat_requirements": {
      "int": 10
    },
    "dna_requirement": null
  },
  {
    "id": 96,
    "from_digimon_id": 24,
    "to_digimon_id": 104,
    "level_required": 14,
    "stat_requirements": {
      "hp": 300,
      "spd": 30
    },
    "dna_requirement": null
  },
  {
    "id": 98,
    "from_digimon_id": 25,
    "to_digimon_id": 78,
    "level_required": 14,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  {
    "id": 100,
    "from_digimon_id": 25,
    "to_digimon_id": 84,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 102,
    "from_digimon_id": 25,
    "to_digimon_id": 137,
    "level_required": 16,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  {
    "id": 104,
    "from_digimon_id": 26,
    "to_digimon_id": 81,
    "level_required": 15,
    "stat_requirements": {
      "spd": 55
    },
    "dna_requirement": null
  },
  {
    "id": 106,
    "from_digimon_id": 26,
    "to_digimon_id": 89,
    "level_required": 16,
    "stat_requirements": {
      "hp": 150,
      "atk": 40
    },
    "dna_requirement": null
  },
  {
    "id": 108,
    "from_digimon_id": 26,
    "to_digimon_id": 120,
    "level_required": 12,
    "stat_requirements": {
      "atk": 40,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 110,
    "from_digimon_id": 27,
    "to_digimon_id": 85,
    "level_required": 15,
    "stat_requirements": {
      "spd": 50
    },
    "dna_requirement": null
  },
  {
    "id": 112,
    "from_digimon_id": 27,
    "to_digimon_id": 121,
    "level_required": 12,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 114,
    "from_digimon_id": 27,
    "to_digimon_id": 133,
    "level_required": 14,
    "stat_requirements": {
      "hp": 250,
      "atk": 30
    },
    "dna_requirement": null
  },
  {
    "id": 917,
    "from_digimon_id": 346,
    "to_digimon_id": 347,
    "level_required": 30,
    "stat_requirements": {
      "hp": 385,
      "atk": 110
    },
    "dna_requirement": null
  },
  {
    "id": 943,
    "from_digimon_id": 365,
    "to_digimon_id": 292,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 10,
    "from_digimon_id": 4,
    "to_digimon_id": 17,
    "level_required": 5,
    "stat_requirements": {},
    "dna_requirement": null
  },
  {
    "id": 11,
    "from_digimon_id": 5,
    "to_digimon_id": 11,
    "level_required": 5,
    "stat_requirements": {},
    "dna_requirement": null
  },
  {
    "id": 15,
    "from_digimon_id": 7,
    "to_digimon_id": 41,
    "level_required": 8,
    "stat_requirements": {
      "hp": 75,
      "def": 20
    },
    "dna_requirement": null
  },
  {
    "id": 19,
    "from_digimon_id": 8,
    "to_digimon_id": 59,
    "level_required": 9,
    "stat_requirements": {
      "hp": 75
    },
    "dna_requirement": null
  },
  {
    "id": 23,
    "from_digimon_id": 9,
    "to_digimon_id": 27,
    "level_required": 7,
    "stat_requirements": {
      "hp": 75,
      "atk": 20,
      "spd": 20
    },
    "dna_requirement": null
  },
  {
    "id": 27,
    "from_digimon_id": 9,
    "to_digimon_id": 36,
    "level_required": 10,
    "stat_requirements": {
      "atk": 20,
      "spd": 20
    },
    "dna_requirement": null
  },
  {
    "id": 31,
    "from_digimon_id": 10,
    "to_digimon_id": 49,
    "level_required": 8,
    "stat_requirements": {
      "spd": 30
    },
    "dna_requirement": null
  },
  {
    "id": 33,
    "from_digimon_id": 11,
    "to_digimon_id": 46,
    "level_required": 7,
    "stat_requirements": {
      "int": 20,
      "spd": 20
    },
    "dna_requirement": null
  },
  {
    "id": 35,
    "from_digimon_id": 11,
    "to_digimon_id": 56,
    "level_required": 7,
    "stat_requirements": {
      "spd": 30
    },
    "dna_requirement": null
  },
  {
    "id": 37,
    "from_digimon_id": 11,
    "to_digimon_id": 333,
    "level_required": 7,
    "stat_requirements": {
      "sp": 20,
      "int": 30
    },
    "dna_requirement": null
  },
  {
    "id": 39,
    "from_digimon_id": 12,
    "to_digimon_id": 39,
    "level_required": 8,
    "stat_requirements": {
      "spd": 30
    },
    "dna_requirement": null
  },
  {
    "id": 41,
    "from_digimon_id": 12,
    "to_digimon_id": 61,
    "level_required": 8,
    "stat_requirements": {
      "sp": 30,
      "int": 20
    },
    "dna_requirement": null
  },
  {
    "id": 43,
    "from_digimon_id": 13,
    "to_digimon_id": 26,
    "level_required": 9,
    "stat_requirements": {
      "atk": 15,
      "spd": 20
    },
    "dna_requirement": null
  },
  {
    "id": 45,
    "from_digimon_id": 13,
    "to_digimon_id": 38,
    "level_required": 6,
    "stat_requirements": {
      "spd": 30
    },
    "dna_requirement": null
  },
  {
    "id": 47,
    "from_digimon_id": 14,
    "to_digimon_id": 50,
    "level_required": 8,
    "stat_requirements": {
      "int": 20,
      "spd": 20
    },
    "dna_requirement": null
  },
  {
    "id": 49,
    "from_digimon_id": 14,
    "to_digimon_id": 57,
    "level_required": 8,
    "stat_requirements": {
      "hp": 75,
      "def": 10
    },
    "dna_requirement": null
  },
  {
    "id": 51,
    "from_digimon_id": 15,
    "to_digimon_id": 34,
    "level_required": 8,
    "stat_requirements": {
      "hp": 100
    },
    "dna_requirement": null
  },
  {
    "id": 53,
    "from_digimon_id": 15,
    "to_digimon_id": 55,
    "level_required": 8,
    "stat_requirements": {
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 55,
    "from_digimon_id": 16,
    "to_digimon_id": 37,
    "level_required": 6,
    "stat_requirements": {
      "hp": 75,
      "def": 25
    },
    "dna_requirement": null
  },
  {
    "id": 57,
    "from_digimon_id": 16,
    "to_digimon_id": 45,
    "level_required": 7,
    "stat_requirements": {
      "hp": 75,
      "def": 30
    },
    "dna_requirement": null
  },
  {
    "id": 59,
    "from_digimon_id": 17,
    "to_digimon_id": 30,
    "level_required": 8,
    "stat_requirements": {
      "sp": 20,
      "int": 20
    },
    "dna_requirement": null
  },
  {
    "id": 61,
    "from_digimon_id": 17,
    "to_digimon_id": 328,
    "level_required": 8,
    "stat_requirements": {
      "atk": 30,
      "def": 30
    },
    "dna_requirement": null
  },
  {
    "id": 63,
    "from_digimon_id": 18,
    "to_digimon_id": 105,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "atk": 50
    },
    "dna_requirement": null
  },
  {
    "id": 65,
    "from_digimon_id": 18,
    "to_digimon_id": 114,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "atk": 40
    },
    "dna_requirement": null
  },
  {
    "id": 67,
    "from_digimon_id": 18,
    "to_digimon_id": 68,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "atk": 50
    },
    "dna_requirement": null
  },
  {
    "id": 69,
    "from_digimon_id": 19,
    "to_digimon_id": 91,
    "level_required": 16,
    "stat_requirements": {
      "hp": 150,
      "atk": 50
    },
    "dna_requirement": null
  },
  {
    "id": 71,
    "from_digimon_id": 19,
    "to_digimon_id": 112,
    "level_required": 14,
    "stat_requirements": {
      "def": 55
    },
    "dna_requirement": null
  },
  {
    "id": 73,
    "from_digimon_id": 19,
    "to_digimon_id": 132,
    "level_required": 14,
    "stat_requirements": {
      "atk": 55,
      "def": 55
    },
    "dna_requirement": null
  },
  {
    "id": 77,
    "from_digimon_id": 21,
    "to_digimon_id": 100,
    "level_required": 14,
    "stat_requirements": {
      "atk": 30,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 81,
    "from_digimon_id": 22,
    "to_digimon_id": 72,
    "level_required": 14,
    "stat_requirements": {
      "sp": 35,
      "int": 55
    },
    "dna_requirement": null
  },
  {
    "id": 84,
    "from_digimon_id": 22,
    "to_digimon_id": 124,
    "level_required": 13,
    "stat_requirements": {
      "sp": 40,
      "int": 30
    },
    "dna_requirement": null
  },
  {
    "id": 88,
    "from_digimon_id": 23,
    "to_digimon_id": 95,
    "level_required": 12,
    "stat_requirements": {
      "hp": 130,
      "sp": 25,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 90,
    "from_digimon_id": 23,
    "to_digimon_id": 120,
    "level_required": 12,
    "stat_requirements": {
      "atk": 40,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 92,
    "from_digimon_id": 24,
    "to_digimon_id": 83,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 55
    },
    "dna_requirement": null
  },
  {
    "id": 94,
    "from_digimon_id": 24,
    "to_digimon_id": 103,
    "level_required": 14,
    "stat_requirements": {
      "def": 30,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 12,
    "from_digimon_id": 5,
    "to_digimon_id": 15,
    "level_required": 3,
    "stat_requirements": {
      "int": 15
    },
    "dna_requirement": null
  },
  {
    "id": 14,
    "from_digimon_id": 7,
    "to_digimon_id": 29,
    "level_required": 7,
    "stat_requirements": {
      "atk": 30,
      "spd": 20
    },
    "dna_requirement": null
  },
  {
    "id": 16,
    "from_digimon_id": 7,
    "to_digimon_id": 47,
    "level_required": 9,
    "stat_requirements": {
      "abi": 20,
      "atk": 20
    },
    "dna_requirement": null
  },
  {
    "id": 123,
    "from_digimon_id": 29,
    "to_digimon_id": 91,
    "level_required": 16,
    "stat_requirements": {
      "hp": 150,
      "atk": 50
    },
    "dna_requirement": null
  },
  {
    "id": 125,
    "from_digimon_id": 29,
    "to_digimon_id": 131,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40
    },
    "dna_requirement": null
  },
  {
    "id": 127,
    "from_digimon_id": 30,
    "to_digimon_id": 77,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 129,
    "from_digimon_id": 30,
    "to_digimon_id": 130,
    "level_required": 14,
    "stat_requirements": {
      "spd": 50
    },
    "dna_requirement": null
  },
  {
    "id": 131,
    "from_digimon_id": 30,
    "to_digimon_id": 73,
    "level_required": 15,
    "stat_requirements": {
      "hp": 45,
      "spd": 55
    },
    "dna_requirement": null
  },
  {
    "id": 133,
    "from_digimon_id": 31,
    "to_digimon_id": 89,
    "level_required": 16,
    "stat_requirements": {
      "hp": 150,
      "atk": 40
    },
    "dna_requirement": null
  },
  {
    "id": 137,
    "from_digimon_id": 32,
    "to_digimon_id": 70,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 139,
    "from_digimon_id": 32,
    "to_digimon_id": 107,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 35
    },
    "dna_requirement": null
  },
  {
    "id": 141,
    "from_digimon_id": 32,
    "to_digimon_id": 66,
    "level_required": 15,
    "stat_requirements": {
      "hp": 110,
      "def": 50
    },
    "dna_requirement": null
  },
  {
    "id": 918,
    "from_digimon_id": 347,
    "to_digimon_id": 348,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1870,
      "abi": 20,
      "atk": 175,
      "def": 140
    },
    "dna_requirement": null
  },
  {
    "id": 944,
    "from_digimon_id": 366,
    "to_digimon_id": 367,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 180,
      "int": 180,
      "spd": 170
    },
    "dna_requirement": 259
  },
  {
    "id": 18,
    "from_digimon_id": 7,
    "to_digimon_id": 326,
    "level_required": 8,
    "stat_requirements": {
      "atk": 30,
      "spd": 20
    },
    "dna_requirement": null
  },
  {
    "id": 20,
    "from_digimon_id": 8,
    "to_digimon_id": 48,
    "level_required": 8,
    "stat_requirements": {
      "hp": 100
    },
    "dna_requirement": null
  },
  {
    "id": 22,
    "from_digimon_id": 8,
    "to_digimon_id": 52,
    "level_required": 6,
    "stat_requirements": {
      "spd": 30
    },
    "dna_requirement": null
  },
  {
    "id": 24,
    "from_digimon_id": 9,
    "to_digimon_id": 28,
    "level_required": 6,
    "stat_requirements": {
      "hp": 80,
      "atk": 30
    },
    "dna_requirement": null
  },
  {
    "id": 26,
    "from_digimon_id": 9,
    "to_digimon_id": 53,
    "level_required": 6,
    "stat_requirements": {
      "atk": 20,
      "spd": 20
    },
    "dna_requirement": null
  },
  {
    "id": 28,
    "from_digimon_id": 9,
    "to_digimon_id": 58,
    "level_required": 8,
    "stat_requirements": {
      "atk": 35
    },
    "dna_requirement": null
  },
  {
    "id": 30,
    "from_digimon_id": 10,
    "to_digimon_id": 31,
    "level_required": 9,
    "stat_requirements": {
      "atk": 20,
      "spd": 20
    },
    "dna_requirement": null
  },
  {
    "id": 32,
    "from_digimon_id": 10,
    "to_digimon_id": 42,
    "level_required": 8,
    "stat_requirements": {
      "atk": 30,
      "spd": 20
    },
    "dna_requirement": null
  },
  {
    "id": 36,
    "from_digimon_id": 11,
    "to_digimon_id": 60,
    "level_required": 30,
    "stat_requirements": {
      "sp": 80,
      "abi": 80,
      "int": 130
    },
    "dna_requirement": null
  },
  {
    "id": 40,
    "from_digimon_id": 12,
    "to_digimon_id": 54,
    "level_required": 7,
    "stat_requirements": {
      "sp": 20,
      "int": 20
    },
    "dna_requirement": null
  },
  {
    "id": 44,
    "from_digimon_id": 13,
    "to_digimon_id": 63,
    "level_required": 8,
    "stat_requirements": {
      "atk": 15,
      "int": 20
    },
    "dna_requirement": null
  },
  {
    "id": 48,
    "from_digimon_id": 14,
    "to_digimon_id": 64,
    "level_required": 8,
    "stat_requirements": {
      "def": 20
    },
    "dna_requirement": null
  },
  {
    "id": 52,
    "from_digimon_id": 15,
    "to_digimon_id": 35,
    "level_required": 7,
    "stat_requirements": {
      "def": 15,
      "int": 20
    },
    "dna_requirement": null
  },
  {
    "id": 56,
    "from_digimon_id": 16,
    "to_digimon_id": 40,
    "level_required": 9,
    "stat_requirements": {
      "def": 20
    },
    "dna_requirement": null
  },
  {
    "id": 60,
    "from_digimon_id": 17,
    "to_digimon_id": 44,
    "level_required": 8,
    "stat_requirements": {
      "atk": 20,
      "spd": 30
    },
    "dna_requirement": null
  },
  {
    "id": 64,
    "from_digimon_id": 18,
    "to_digimon_id": 106,
    "level_required": 12,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 68,
    "from_digimon_id": 19,
    "to_digimon_id": 88,
    "level_required": 15,
    "stat_requirements": {
      "atk": 50,
      "spd": 20
    },
    "dna_requirement": null
  },
  {
    "id": 72,
    "from_digimon_id": 19,
    "to_digimon_id": 114,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "atk": 40
    },
    "dna_requirement": null
  },
  {
    "id": 76,
    "from_digimon_id": 21,
    "to_digimon_id": 98,
    "level_required": 18,
    "stat_requirements": {
      "abi": 5
    },
    "dna_requirement": null
  },
  {
    "id": 78,
    "from_digimon_id": 21,
    "to_digimon_id": 112,
    "level_required": 14,
    "stat_requirements": {
      "def": 55
    },
    "dna_requirement": null
  },
  {
    "id": 80,
    "from_digimon_id": 22,
    "to_digimon_id": 65,
    "level_required": 15,
    "stat_requirements": {
      "atk": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 82,
    "from_digimon_id": 22,
    "to_digimon_id": 78,
    "level_required": 14,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  {
    "id": 85,
    "from_digimon_id": 22,
    "to_digimon_id": 128,
    "level_required": 16,
    "stat_requirements": {
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 89,
    "from_digimon_id": 23,
    "to_digimon_id": 106,
    "level_required": 12,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 93,
    "from_digimon_id": 24,
    "to_digimon_id": 94,
    "level_required": 14,
    "stat_requirements": {
      "sp": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 97,
    "from_digimon_id": 24,
    "to_digimon_id": 136,
    "level_required": 12,
    "stat_requirements": {
      "hp": 500
    },
    "dna_requirement": null
  },
  {
    "id": 101,
    "from_digimon_id": 25,
    "to_digimon_id": 118,
    "level_required": 16,
    "stat_requirements": {
      "hp": 300,
      "def": 30
    },
    "dna_requirement": null
  },
  {
    "id": 105,
    "from_digimon_id": 26,
    "to_digimon_id": 86,
    "level_required": 15,
    "stat_requirements": {
      "atk": 35,
      "spd": 50
    },
    "dna_requirement": null
  },
  {
    "id": 109,
    "from_digimon_id": 26,
    "to_digimon_id": 137,
    "level_required": 16,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  {
    "id": 113,
    "from_digimon_id": 27,
    "to_digimon_id": 125,
    "level_required": 16,
    "stat_requirements": {
      "atk": 40,
      "spd": 35
    },
    "dna_requirement": null
  },
  {
    "id": 115,
    "from_digimon_id": 27,
    "to_digimon_id": 73,
    "level_required": 15,
    "stat_requirements": {
      "hp": 45,
      "spd": 55
    },
    "dna_requirement": null
  },
  {
    "id": 117,
    "from_digimon_id": 28,
    "to_digimon_id": 129,
    "level_required": 12,
    "stat_requirements": {
      "hp": 300
    },
    "dna_requirement": null
  },
  {
    "id": 119,
    "from_digimon_id": 28,
    "to_digimon_id": 139,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 121,
    "from_digimon_id": 29,
    "to_digimon_id": 105,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "atk": 50
    },
    "dna_requirement": null
  },
  {
    "id": 122,
    "from_digimon_id": 29,
    "to_digimon_id": 88,
    "level_required": 15,
    "stat_requirements": {
      "atk": 50,
      "spd": 20
    },
    "dna_requirement": null
  },
  {
    "id": 126,
    "from_digimon_id": 29,
    "to_digimon_id": 68,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "atk": 50
    },
    "dna_requirement": null
  },
  {
    "id": 130,
    "from_digimon_id": 30,
    "to_digimon_id": 139,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 134,
    "from_digimon_id": 31,
    "to_digimon_id": 124,
    "level_required": 13,
    "stat_requirements": {
      "sp": 40,
      "int": 30
    },
    "dna_requirement": null
  },
  {
    "id": 237,
    "from_digimon_id": 55,
    "to_digimon_id": 94,
    "level_required": 14,
    "stat_requirements": {
      "sp": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 238,
    "from_digimon_id": 55,
    "to_digimon_id": 103,
    "level_required": 14,
    "stat_requirements": {
      "def": 30,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 240,
    "from_digimon_id": 55,
    "to_digimon_id": 129,
    "level_required": 12,
    "stat_requirements": {
      "hp": 300
    },
    "dna_requirement": null
  },
  {
    "id": 246,
    "from_digimon_id": 56,
    "to_digimon_id": 75,
    "level_required": 14,
    "stat_requirements": {
      "atk": 35,
      "spd": 45
    },
    "dna_requirement": null
  },
  {
    "id": 248,
    "from_digimon_id": 59,
    "to_digimon_id": 102,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 250,
    "from_digimon_id": 59,
    "to_digimon_id": 129,
    "level_required": 12,
    "stat_requirements": {
      "hp": 300
    },
    "dna_requirement": null
  },
  {
    "id": 252,
    "from_digimon_id": 60,
    "to_digimon_id": 116,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "atk": 40
    },
    "dna_requirement": null
  },
  {
    "id": 254,
    "from_digimon_id": 62,
    "to_digimon_id": 74,
    "level_required": 14,
    "stat_requirements": {
      "hp": 500
    },
    "dna_requirement": null
  },
  {
    "id": 256,
    "from_digimon_id": 62,
    "to_digimon_id": 87,
    "level_required": 14,
    "stat_requirements": {
      "sp": 40,
      "int": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 919,
    "from_digimon_id": 350,
    "to_digimon_id": 351,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 165,
      "def": 130,
      "spd": 165
    },
    "dna_requirement": null
  },
  {
    "id": 945,
    "from_digimon_id": 259,
    "to_digimon_id": 367,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 180,
      "int": 180,
      "spd": 170
    },
    "dna_requirement": 366
  },
  {
    "id": 138,
    "from_digimon_id": 32,
    "to_digimon_id": 92,
    "level_required": 14,
    "stat_requirements": {
      "int": 35
    },
    "dna_requirement": null
  },
  {
    "id": 142,
    "from_digimon_id": 32,
    "to_digimon_id": 99,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 60
    },
    "dna_requirement": null
  },
  {
    "id": 146,
    "from_digimon_id": 33,
    "to_digimon_id": 91,
    "level_required": 16,
    "stat_requirements": {
      "hp": 150,
      "atk": 50
    },
    "dna_requirement": null
  },
  {
    "id": 150,
    "from_digimon_id": 34,
    "to_digimon_id": 71,
    "level_required": 15,
    "stat_requirements": {
      "hp": 300
    },
    "dna_requirement": null
  },
  {
    "id": 154,
    "from_digimon_id": 34,
    "to_digimon_id": 109,
    "level_required": 15,
    "stat_requirements": {
      "atk": 45,
      "spd": 50
    },
    "dna_requirement": null
  },
  {
    "id": 156,
    "from_digimon_id": 35,
    "to_digimon_id": 83,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 55
    },
    "dna_requirement": null
  },
  {
    "id": 158,
    "from_digimon_id": 35,
    "to_digimon_id": 103,
    "level_required": 14,
    "stat_requirements": {
      "def": 30,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 163,
    "from_digimon_id": 37,
    "to_digimon_id": 131,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40
    },
    "dna_requirement": null
  },
  {
    "id": 167,
    "from_digimon_id": 39,
    "to_digimon_id": 71,
    "level_required": 15,
    "stat_requirements": {
      "hp": 300
    },
    "dna_requirement": null
  },
  {
    "id": 171,
    "from_digimon_id": 40,
    "to_digimon_id": 82,
    "level_required": 14,
    "stat_requirements": {
      "def": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 175,
    "from_digimon_id": 40,
    "to_digimon_id": 140,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 179,
    "from_digimon_id": 41,
    "to_digimon_id": 106,
    "level_required": 12,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 183,
    "from_digimon_id": 44,
    "to_digimon_id": 100,
    "level_required": 14,
    "stat_requirements": {
      "atk": 30,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 187,
    "from_digimon_id": 45,
    "to_digimon_id": 79,
    "level_required": 14,
    "stat_requirements": {
      "def": 55
    },
    "dna_requirement": null
  },
  {
    "id": 189,
    "from_digimon_id": 45,
    "to_digimon_id": 98,
    "level_required": 18,
    "stat_requirements": {
      "abi": 5
    },
    "dna_requirement": null
  },
  {
    "id": 191,
    "from_digimon_id": 45,
    "to_digimon_id": 127,
    "level_required": 20,
    "stat_requirements": {},
    "dna_requirement": null
  },
  {
    "id": 195,
    "from_digimon_id": 46,
    "to_digimon_id": 122,
    "level_required": 14,
    "stat_requirements": {
      "hp": 40,
      "int": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 197,
    "from_digimon_id": 46,
    "to_digimon_id": 134,
    "level_required": 13,
    "stat_requirements": {
      "int": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 199,
    "from_digimon_id": 47,
    "to_digimon_id": 105,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "atk": 50
    },
    "dna_requirement": null
  },
  {
    "id": 201,
    "from_digimon_id": 47,
    "to_digimon_id": 110,
    "level_required": 20,
    "stat_requirements": {
      "atk": 50,
      "spd": 50
    },
    "dna_requirement": null
  },
  {
    "id": 203,
    "from_digimon_id": 47,
    "to_digimon_id": 132,
    "level_required": 14,
    "stat_requirements": {
      "atk": 55,
      "def": 55
    },
    "dna_requirement": null
  },
  {
    "id": 205,
    "from_digimon_id": 48,
    "to_digimon_id": 93,
    "level_required": 14,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  {
    "id": 207,
    "from_digimon_id": 48,
    "to_digimon_id": 118,
    "level_required": 16,
    "stat_requirements": {
      "hp": 300,
      "def": 30
    },
    "dna_requirement": null
  },
  {
    "id": 209,
    "from_digimon_id": 48,
    "to_digimon_id": 113,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 211,
    "from_digimon_id": 49,
    "to_digimon_id": 87,
    "level_required": 14,
    "stat_requirements": {
      "sp": 40,
      "int": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 213,
    "from_digimon_id": 49,
    "to_digimon_id": 116,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "atk": 40
    },
    "dna_requirement": null
  },
  {
    "id": 215,
    "from_digimon_id": 50,
    "to_digimon_id": 67,
    "level_required": 14,
    "stat_requirements": {
      "spd": 55
    },
    "dna_requirement": null
  },
  {
    "id": 217,
    "from_digimon_id": 50,
    "to_digimon_id": 87,
    "level_required": 14,
    "stat_requirements": {
      "sp": 40,
      "int": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 221,
    "from_digimon_id": 51,
    "to_digimon_id": 76,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 225,
    "from_digimon_id": 53,
    "to_digimon_id": 125,
    "level_required": 16,
    "stat_requirements": {
      "atk": 40,
      "spd": 35
    },
    "dna_requirement": null
  },
  {
    "id": 229,
    "from_digimon_id": 53,
    "to_digimon_id": 109,
    "level_required": 15,
    "stat_requirements": {
      "atk": 45,
      "spd": 50
    },
    "dna_requirement": null
  },
  {
    "id": 233,
    "from_digimon_id": 54,
    "to_digimon_id": 133,
    "level_required": 14,
    "stat_requirements": {
      "hp": 250,
      "atk": 30
    },
    "dna_requirement": null
  },
  {
    "id": 145,
    "from_digimon_id": 33,
    "to_digimon_id": 88,
    "level_required": 15,
    "stat_requirements": {
      "atk": 50,
      "spd": 20
    },
    "dna_requirement": null
  },
  {
    "id": 147,
    "from_digimon_id": 33,
    "to_digimon_id": 120,
    "level_required": 12,
    "stat_requirements": {
      "atk": 40,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 234,
    "from_digimon_id": 54,
    "to_digimon_id": 139,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 236,
    "from_digimon_id": 55,
    "to_digimon_id": 83,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 55
    },
    "dna_requirement": null
  },
  {
    "id": 241,
    "from_digimon_id": 55,
    "to_digimon_id": 75,
    "level_required": 14,
    "stat_requirements": {
      "atk": 35,
      "spd": 45
    },
    "dna_requirement": null
  },
  {
    "id": 245,
    "from_digimon_id": 56,
    "to_digimon_id": 131,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40
    },
    "dna_requirement": null
  },
  {
    "id": 249,
    "from_digimon_id": 59,
    "to_digimon_id": 118,
    "level_required": 16,
    "stat_requirements": {
      "hp": 300,
      "def": 30
    },
    "dna_requirement": null
  },
  {
    "id": 253,
    "from_digimon_id": 60,
    "to_digimon_id": 213,
    "level_required": 55,
    "stat_requirements": {
      "abi": 80,
      "atk": 180,
      "int": 240,
      "spd": 180
    },
    "dna_requirement": null
  },
  {
    "id": 257,
    "from_digimon_id": 62,
    "to_digimon_id": 128,
    "level_required": 16,
    "stat_requirements": {
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 259,
    "from_digimon_id": 62,
    "to_digimon_id": 138,
    "level_required": 15,
    "stat_requirements": {
      "atk": 35,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 261,
    "from_digimon_id": 63,
    "to_digimon_id": 84,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 263,
    "from_digimon_id": 63,
    "to_digimon_id": 128,
    "level_required": 16,
    "stat_requirements": {
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 265,
    "from_digimon_id": 63,
    "to_digimon_id": 117,
    "level_required": 14,
    "stat_requirements": {
      "atk": 45,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 920,
    "from_digimon_id": 348,
    "to_digimon_id": 352,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 220,
      "int": 165,
      "spd": 165
    },
    "dna_requirement": 351
  },
  {
    "id": 946,
    "from_digimon_id": 379,
    "to_digimon_id": 380,
    "level_required": 16,
    "stat_requirements": {
      "int": 45
    },
    "dna_requirement": null
  },
  {
    "id": 149,
    "from_digimon_id": 34,
    "to_digimon_id": 70,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 151,
    "from_digimon_id": 34,
    "to_digimon_id": 111,
    "level_required": 16,
    "stat_requirements": {
      "sp": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 153,
    "from_digimon_id": 34,
    "to_digimon_id": 66,
    "level_required": 15,
    "stat_requirements": {
      "hp": 110,
      "def": 50
    },
    "dna_requirement": null
  },
  {
    "id": 155,
    "from_digimon_id": 35,
    "to_digimon_id": 71,
    "level_required": 15,
    "stat_requirements": {
      "hp": 300
    },
    "dna_requirement": null
  },
  {
    "id": 159,
    "from_digimon_id": 35,
    "to_digimon_id": 104,
    "level_required": 14,
    "stat_requirements": {
      "hp": 300,
      "spd": 30
    },
    "dna_requirement": null
  },
  {
    "id": 160,
    "from_digimon_id": 37,
    "to_digimon_id": 92,
    "level_required": 14,
    "stat_requirements": {
      "int": 35
    },
    "dna_requirement": null
  },
  {
    "id": 162,
    "from_digimon_id": 37,
    "to_digimon_id": 107,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 35
    },
    "dna_requirement": null
  },
  {
    "id": 164,
    "from_digimon_id": 37,
    "to_digimon_id": 80,
    "level_required": 14,
    "stat_requirements": {
      "hp": 130,
      "def": 60
    },
    "dna_requirement": null
  },
  {
    "id": 166,
    "from_digimon_id": 39,
    "to_digimon_id": 84,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 168,
    "from_digimon_id": 39,
    "to_digimon_id": 115,
    "level_required": 16,
    "stat_requirements": {
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 170,
    "from_digimon_id": 39,
    "to_digimon_id": 134,
    "level_required": 13,
    "stat_requirements": {
      "int": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 172,
    "from_digimon_id": 40,
    "to_digimon_id": 93,
    "level_required": 14,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  {
    "id": 174,
    "from_digimon_id": 40,
    "to_digimon_id": 108,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 55
    },
    "dna_requirement": null
  },
  {
    "id": 176,
    "from_digimon_id": 41,
    "to_digimon_id": 92,
    "level_required": 14,
    "stat_requirements": {
      "int": 35
    },
    "dna_requirement": null
  },
  {
    "id": 178,
    "from_digimon_id": 41,
    "to_digimon_id": 90,
    "level_required": 16,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  {
    "id": 180,
    "from_digimon_id": 41,
    "to_digimon_id": 107,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 35
    },
    "dna_requirement": null
  },
  {
    "id": 182,
    "from_digimon_id": 44,
    "to_digimon_id": 79,
    "level_required": 14,
    "stat_requirements": {
      "def": 55
    },
    "dna_requirement": null
  },
  {
    "id": 184,
    "from_digimon_id": 44,
    "to_digimon_id": 119,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 186,
    "from_digimon_id": 44,
    "to_digimon_id": 135,
    "level_required": 15,
    "stat_requirements": {
      "hp": 130,
      "atk": 50
    },
    "dna_requirement": null
  },
  {
    "id": 188,
    "from_digimon_id": 45,
    "to_digimon_id": 92,
    "level_required": 14,
    "stat_requirements": {
      "int": 35
    },
    "dna_requirement": null
  },
  {
    "id": 192,
    "from_digimon_id": 46,
    "to_digimon_id": 76,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 196,
    "from_digimon_id": 46,
    "to_digimon_id": 139,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 200,
    "from_digimon_id": 47,
    "to_digimon_id": 127,
    "level_required": 20,
    "stat_requirements": {},
    "dna_requirement": null
  },
  {
    "id": 204,
    "from_digimon_id": 48,
    "to_digimon_id": 74,
    "level_required": 14,
    "stat_requirements": {
      "hp": 500
    },
    "dna_requirement": null
  },
  {
    "id": 208,
    "from_digimon_id": 48,
    "to_digimon_id": 129,
    "level_required": 12,
    "stat_requirements": {
      "hp": 300
    },
    "dna_requirement": null
  },
  {
    "id": 216,
    "from_digimon_id": 50,
    "to_digimon_id": 82,
    "level_required": 14,
    "stat_requirements": {
      "def": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 218,
    "from_digimon_id": 50,
    "to_digimon_id": 122,
    "level_required": 14,
    "stat_requirements": {
      "hp": 40,
      "int": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 220,
    "from_digimon_id": 51,
    "to_digimon_id": 67,
    "level_required": 14,
    "stat_requirements": {
      "spd": 55
    },
    "dna_requirement": null
  },
  {
    "id": 222,
    "from_digimon_id": 51,
    "to_digimon_id": 108,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 55
    },
    "dna_requirement": null
  },
  {
    "id": 224,
    "from_digimon_id": 53,
    "to_digimon_id": 76,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 226,
    "from_digimon_id": 53,
    "to_digimon_id": 323,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 228,
    "from_digimon_id": 53,
    "to_digimon_id": 73,
    "level_required": 15,
    "stat_requirements": {
      "hp": 45,
      "spd": 55
    },
    "dna_requirement": null
  },
  {
    "id": 230,
    "from_digimon_id": 54,
    "to_digimon_id": 111,
    "level_required": 16,
    "stat_requirements": {
      "sp": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 232,
    "from_digimon_id": 54,
    "to_digimon_id": 125,
    "level_required": 16,
    "stat_requirements": {
      "atk": 40,
      "spd": 35
    },
    "dna_requirement": null
  },
  {
    "id": 262,
    "from_digimon_id": 63,
    "to_digimon_id": 116,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "atk": 40
    },
    "dna_requirement": null
  },
  {
    "id": 266,
    "from_digimon_id": 64,
    "to_digimon_id": 65,
    "level_required": 15,
    "stat_requirements": {
      "atk": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 270,
    "from_digimon_id": 64,
    "to_digimon_id": 140,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 921,
    "from_digimon_id": 351,
    "to_digimon_id": 352,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 220,
      "int": 165,
      "spd": 165
    },
    "dna_requirement": 348
  },
  {
    "id": 356,
    "from_digimon_id": 91,
    "to_digimon_id": 180,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 360,
    "from_digimon_id": 92,
    "to_digimon_id": 217,
    "level_required": 28,
    "stat_requirements": {
      "sp": 75,
      "int": 100
    },
    "dna_requirement": null
  },
  {
    "id": 364,
    "from_digimon_id": 94,
    "to_digimon_id": 179,
    "level_required": 26,
    "stat_requirements": {
      "hp": 900
    },
    "dna_requirement": null
  },
  {
    "id": 368,
    "from_digimon_id": 95,
    "to_digimon_id": 167,
    "level_required": 28,
    "stat_requirements": {
      "sp": 70,
      "atk": 70,
      "def": 80
    },
    "dna_requirement": null
  },
  {
    "id": 372,
    "from_digimon_id": 98,
    "to_digimon_id": 275,
    "level_required": 65,
    "stat_requirements": {
      "abi": 10
    },
    "dna_requirement": null
  },
  {
    "id": 374,
    "from_digimon_id": 100,
    "to_digimon_id": 183,
    "level_required": 28,
    "stat_requirements": {
      "sp": 60,
      "int": 85
    },
    "dna_requirement": null
  },
  {
    "id": 378,
    "from_digimon_id": 102,
    "to_digimon_id": 212,
    "level_required": 30,
    "stat_requirements": {
      "int": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 380,
    "from_digimon_id": 103,
    "to_digimon_id": 194,
    "level_required": 28,
    "stat_requirements": {
      "hp": 850,
      "def": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  {
    "id": 382,
    "from_digimon_id": 103,
    "to_digimon_id": 330,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 384,
    "from_digimon_id": 105,
    "to_digimon_id": 168,
    "level_required": 28,
    "stat_requirements": {
      "atk": 120,
      "def": 85,
      "spd": 70
    },
    "dna_requirement": null
  },
  {
    "id": 386,
    "from_digimon_id": 105,
    "to_digimon_id": 159,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "abi": 10,
      "atk": 125
    },
    "dna_requirement": null
  },
  {
    "id": 388,
    "from_digimon_id": 106,
    "to_digimon_id": 167,
    "level_required": 28,
    "stat_requirements": {
      "sp": 70,
      "atk": 70,
      "def": 80
    },
    "dna_requirement": null
  },
  {
    "id": 390,
    "from_digimon_id": 107,
    "to_digimon_id": 167,
    "level_required": 28,
    "stat_requirements": {
      "sp": 70,
      "atk": 70,
      "def": 80
    },
    "dna_requirement": null
  },
  {
    "id": 392,
    "from_digimon_id": 107,
    "to_digimon_id": 206,
    "level_required": 26,
    "stat_requirements": {
      "def": 80,
      "int": 65
    },
    "dna_requirement": null
  },
  {
    "id": 394,
    "from_digimon_id": 107,
    "to_digimon_id": 162,
    "level_required": 30,
    "stat_requirements": {
      "sp": 60,
      "atk": 70
    },
    "dna_requirement": null
  },
  {
    "id": 396,
    "from_digimon_id": 108,
    "to_digimon_id": 153,
    "level_required": 26,
    "stat_requirements": {
      "atk": 95,
      "def": 90
    },
    "dna_requirement": null
  },
  {
    "id": 398,
    "from_digimon_id": 108,
    "to_digimon_id": 175,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 90,
      "spd": 75
    },
    "dna_requirement": 76
  },
  {
    "id": 947,
    "from_digimon_id": 380,
    "to_digimon_id": 368,
    "level_required": 30,
    "stat_requirements": {
      "sp": 85,
      "abi": 10,
      "int": 110
    },
    "dna_requirement": null
  },
  {
    "id": 948,
    "from_digimon_id": 380,
    "to_digimon_id": 385,
    "level_required": 30,
    "stat_requirements": {
      "int": 85,
      "spd": 85
    },
    "dna_requirement": null
  },
  {
    "id": 951,
    "from_digimon_id": 383,
    "to_digimon_id": 384,
    "level_required": 16,
    "stat_requirements": {
      "hp": 330,
      "def": 35
    },
    "dna_requirement": null
  },
  {
    "id": 952,
    "from_digimon_id": 384,
    "to_digimon_id": 385,
    "level_required": 30,
    "stat_requirements": {
      "int": 85,
      "spd": 85
    },
    "dna_requirement": null
  },
  {
    "id": 953,
    "from_digimon_id": 385,
    "to_digimon_id": 369,
    "level_required": 55,
    "stat_requirements": {
      "sp": 130,
      "abi": 20,
      "int": 130
    },
    "dna_requirement": null
  },
  {
    "id": 274,
    "from_digimon_id": 65,
    "to_digimon_id": 214,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "int": 95
    },
    "dna_requirement": null
  },
  {
    "id": 278,
    "from_digimon_id": 67,
    "to_digimon_id": 154,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 282,
    "from_digimon_id": 70,
    "to_digimon_id": 145,
    "level_required": 26,
    "stat_requirements": {
      "def": 110
    },
    "dna_requirement": null
  },
  {
    "id": 286,
    "from_digimon_id": 70,
    "to_digimon_id": 159,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "abi": 10,
      "atk": 125
    },
    "dna_requirement": null
  },
  {
    "id": 291,
    "from_digimon_id": 72,
    "to_digimon_id": 147,
    "level_required": 30,
    "stat_requirements": {
      "abi": 10,
      "atk": 70,
      "int": 90
    },
    "dna_requirement": null
  },
  {
    "id": 293,
    "from_digimon_id": 72,
    "to_digimon_id": 217,
    "level_required": 28,
    "stat_requirements": {
      "sp": 75,
      "int": 100
    },
    "dna_requirement": null
  },
  {
    "id": 297,
    "from_digimon_id": 74,
    "to_digimon_id": 187,
    "level_required": 26,
    "stat_requirements": {
      "hp": 850,
      "atk": 60,
      "int": 60
    },
    "dna_requirement": null
  },
  {
    "id": 299,
    "from_digimon_id": 76,
    "to_digimon_id": 195,
    "level_required": 30,
    "stat_requirements": {
      "sp": 80,
      "abi": 10,
      "int": 80
    },
    "dna_requirement": null
  },
  {
    "id": 303,
    "from_digimon_id": 77,
    "to_digimon_id": 154,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 307,
    "from_digimon_id": 77,
    "to_digimon_id": 189,
    "level_required": 26,
    "stat_requirements": {
      "sp": 65,
      "int": 65
    },
    "dna_requirement": null
  },
  {
    "id": 311,
    "from_digimon_id": 78,
    "to_digimon_id": 169,
    "level_required": 28,
    "stat_requirements": {
      "atk": 80,
      "int": 70
    },
    "dna_requirement": null
  },
  {
    "id": 315,
    "from_digimon_id": 79,
    "to_digimon_id": 206,
    "level_required": 26,
    "stat_requirements": {
      "def": 80,
      "int": 65
    },
    "dna_requirement": null
  },
  {
    "id": 319,
    "from_digimon_id": 81,
    "to_digimon_id": 215,
    "level_required": 28,
    "stat_requirements": {
      "atk": 90,
      "spd": 85
    },
    "dna_requirement": null
  },
  {
    "id": 322,
    "from_digimon_id": 82,
    "to_digimon_id": 210,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  {
    "id": 324,
    "from_digimon_id": 83,
    "to_digimon_id": 191,
    "level_required": 32,
    "stat_requirements": {},
    "dna_requirement": null
  },
  {
    "id": 326,
    "from_digimon_id": 84,
    "to_digimon_id": 143,
    "level_required": 28,
    "stat_requirements": {
      "atk": 65,
      "int": 75,
      "spd": 85
    },
    "dna_requirement": null
  },
  {
    "id": 328,
    "from_digimon_id": 84,
    "to_digimon_id": 211,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 330,
    "from_digimon_id": 85,
    "to_digimon_id": 181,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 332,
    "from_digimon_id": 85,
    "to_digimon_id": 215,
    "level_required": 28,
    "stat_requirements": {
      "atk": 90,
      "spd": 85
    },
    "dna_requirement": null
  },
  {
    "id": 334,
    "from_digimon_id": 86,
    "to_digimon_id": 198,
    "level_required": 26,
    "stat_requirements": {
      "atk": 75,
      "spd": 80
    },
    "dna_requirement": null
  },
  {
    "id": 336,
    "from_digimon_id": 86,
    "to_digimon_id": 186,
    "level_required": 26,
    "stat_requirements": {
      "atk": 65,
      "def": 65
    },
    "dna_requirement": null
  },
  {
    "id": 338,
    "from_digimon_id": 87,
    "to_digimon_id": 207,
    "level_required": 26,
    "stat_requirements": {
      "hp": 600,
      "atk": 60
    },
    "dna_requirement": null
  },
  {
    "id": 340,
    "from_digimon_id": 88,
    "to_digimon_id": 156,
    "level_required": 26,
    "stat_requirements": {
      "hp": 800,
      "atk": 75,
      "def": 95
    },
    "dna_requirement": null
  },
  {
    "id": 344,
    "from_digimon_id": 88,
    "to_digimon_id": 149,
    "level_required": 30,
    "stat_requirements": {
      "hp": 500,
      "atk": 120,
      "def": 60
    },
    "dna_requirement": null
  },
  {
    "id": 348,
    "from_digimon_id": 89,
    "to_digimon_id": 142,
    "level_required": 30,
    "stat_requirements": {
      "atk": 110,
      "int": 85
    },
    "dna_requirement": null
  },
  {
    "id": 352,
    "from_digimon_id": 90,
    "to_digimon_id": 204,
    "level_required": 30,
    "stat_requirements": {
      "hp": 450,
      "atk": 110
    },
    "dna_requirement": null
  },
  {
    "id": 269,
    "from_digimon_id": 64,
    "to_digimon_id": 108,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 55
    },
    "dna_requirement": null
  },
  {
    "id": 922,
    "from_digimon_id": 353,
    "to_digimon_id": 354,
    "level_required": 15,
    "stat_requirements": {
      "atk": 55,
      "spd": 20
    },
    "dna_requirement": null
  },
  {
    "id": 949,
    "from_digimon_id": 368,
    "to_digimon_id": 381,
    "level_required": 55,
    "stat_requirements": {
      "sp": 130,
      "abi": 40,
      "def": 130,
      "int": 160
    },
    "dna_requirement": null
  },
  {
    "id": 950,
    "from_digimon_id": 359,
    "to_digimon_id": 382,
    "level_required": 60,
    "stat_requirements": {
      "sp": 220,
      "abi": 80,
      "int": 275,
      "spd": 145
    },
    "dna_requirement": null
  },
  {
    "id": 271,
    "from_digimon_id": 64,
    "to_digimon_id": 126,
    "level_required": 15,
    "stat_requirements": {
      "sp": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 335,
    "from_digimon_id": 86,
    "to_digimon_id": 216,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 90,
      "spd": 70
    },
    "dna_requirement": null
  },
  {
    "id": 339,
    "from_digimon_id": 87,
    "to_digimon_id": 214,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "int": 95
    },
    "dna_requirement": null
  },
  {
    "id": 341,
    "from_digimon_id": 88,
    "to_digimon_id": 202,
    "level_required": 30,
    "stat_requirements": {
      "atk": 105,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 343,
    "from_digimon_id": 88,
    "to_digimon_id": 205,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 95
    },
    "dna_requirement": null
  },
  {
    "id": 345,
    "from_digimon_id": 89,
    "to_digimon_id": 146,
    "level_required": 30,
    "stat_requirements": {
      "atk": 95,
      "spd": 80
    },
    "dna_requirement": null
  },
  {
    "id": 347,
    "from_digimon_id": 89,
    "to_digimon_id": 172,
    "level_required": 30,
    "stat_requirements": {
      "sp": 60,
      "int": 75,
      "spd": 60
    },
    "dna_requirement": null
  },
  {
    "id": 349,
    "from_digimon_id": 90,
    "to_digimon_id": 168,
    "level_required": 28,
    "stat_requirements": {
      "atk": 120,
      "def": 85,
      "spd": 70
    },
    "dna_requirement": null
  },
  {
    "id": 351,
    "from_digimon_id": 90,
    "to_digimon_id": 203,
    "level_required": 30,
    "stat_requirements": {
      "hp": 350,
      "atk": 100
    },
    "dna_requirement": null
  },
  {
    "id": 353,
    "from_digimon_id": 91,
    "to_digimon_id": 181,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 355,
    "from_digimon_id": 91,
    "to_digimon_id": 204,
    "level_required": 30,
    "stat_requirements": {
      "hp": 450,
      "atk": 110
    },
    "dna_requirement": null
  },
  {
    "id": 357,
    "from_digimon_id": 92,
    "to_digimon_id": 144,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  {
    "id": 359,
    "from_digimon_id": 92,
    "to_digimon_id": 183,
    "level_required": 28,
    "stat_requirements": {
      "sp": 60,
      "int": 85
    },
    "dna_requirement": null
  },
  {
    "id": 361,
    "from_digimon_id": 93,
    "to_digimon_id": 153,
    "level_required": 26,
    "stat_requirements": {
      "atk": 95,
      "def": 90
    },
    "dna_requirement": null
  },
  {
    "id": 363,
    "from_digimon_id": 93,
    "to_digimon_id": 165,
    "level_required": 28,
    "stat_requirements": {
      "hp": 800,
      "def": 70
    },
    "dna_requirement": null
  },
  {
    "id": 365,
    "from_digimon_id": 94,
    "to_digimon_id": 194,
    "level_required": 28,
    "stat_requirements": {
      "hp": 850,
      "def": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  {
    "id": 367,
    "from_digimon_id": 95,
    "to_digimon_id": 151,
    "level_required": 26,
    "stat_requirements": {
      "sp": 75,
      "def": 75,
      "spd": 65
    },
    "dna_requirement": null
  },
  {
    "id": 369,
    "from_digimon_id": 95,
    "to_digimon_id": 206,
    "level_required": 26,
    "stat_requirements": {
      "def": 80,
      "int": 65
    },
    "dna_requirement": null
  },
  {
    "id": 371,
    "from_digimon_id": 98,
    "to_digimon_id": 193,
    "level_required": 26,
    "stat_requirements": {
      "sp": 85
    },
    "dna_requirement": null
  },
  {
    "id": 373,
    "from_digimon_id": 100,
    "to_digimon_id": 181,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 377,
    "from_digimon_id": 102,
    "to_digimon_id": 210,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  {
    "id": 273,
    "from_digimon_id": 65,
    "to_digimon_id": 165,
    "level_required": 28,
    "stat_requirements": {
      "hp": 800,
      "def": 70
    },
    "dna_requirement": null
  },
  {
    "id": 275,
    "from_digimon_id": 65,
    "to_digimon_id": 142,
    "level_required": 30,
    "stat_requirements": {
      "atk": 110,
      "int": 85
    },
    "dna_requirement": null
  },
  {
    "id": 277,
    "from_digimon_id": 67,
    "to_digimon_id": 150,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "spd": 95
    },
    "dna_requirement": null
  },
  {
    "id": 279,
    "from_digimon_id": 67,
    "to_digimon_id": 166,
    "level_required": 30,
    "stat_requirements": {
      "atk": 60,
      "int": 75,
      "spd": 75
    },
    "dna_requirement": 115
  },
  {
    "id": 281,
    "from_digimon_id": 67,
    "to_digimon_id": 189,
    "level_required": 26,
    "stat_requirements": {
      "sp": 65,
      "int": 65
    },
    "dna_requirement": null
  },
  {
    "id": 283,
    "from_digimon_id": 70,
    "to_digimon_id": 164,
    "level_required": 30,
    "stat_requirements": {
      "def": 75,
      "int": 65
    },
    "dna_requirement": 77
  },
  {
    "id": 285,
    "from_digimon_id": 70,
    "to_digimon_id": 195,
    "level_required": 30,
    "stat_requirements": {
      "sp": 80,
      "abi": 10,
      "int": 80
    },
    "dna_requirement": null
  },
  {
    "id": 287,
    "from_digimon_id": 71,
    "to_digimon_id": 170,
    "level_required": 30,
    "stat_requirements": {
      "hp": 800,
      "atk": 75
    },
    "dna_requirement": null
  },
  {
    "id": 289,
    "from_digimon_id": 71,
    "to_digimon_id": 198,
    "level_required": 26,
    "stat_requirements": {
      "atk": 75,
      "spd": 80
    },
    "dna_requirement": null
  },
  {
    "id": 290,
    "from_digimon_id": 71,
    "to_digimon_id": 180,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 294,
    "from_digimon_id": 72,
    "to_digimon_id": 190,
    "level_required": 28,
    "stat_requirements": {
      "sp": 80,
      "int": 80
    },
    "dna_requirement": null
  },
  {
    "id": 298,
    "from_digimon_id": 76,
    "to_digimon_id": 184,
    "level_required": 30,
    "stat_requirements": {
      "atk": 90,
      "def": 60,
      "spd": 75
    },
    "dna_requirement": 108
  },
  {
    "id": 300,
    "from_digimon_id": 76,
    "to_digimon_id": 209,
    "level_required": 30,
    "stat_requirements": {
      "hp": 350,
      "atk": 100,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 302,
    "from_digimon_id": 76,
    "to_digimon_id": 175,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 90,
      "spd": 75
    },
    "dna_requirement": 108
  },
  {
    "id": 304,
    "from_digimon_id": 77,
    "to_digimon_id": 164,
    "level_required": 30,
    "stat_requirements": {
      "def": 75,
      "int": 65
    },
    "dna_requirement": 70
  },
  {
    "id": 306,
    "from_digimon_id": 77,
    "to_digimon_id": 171,
    "level_required": 30,
    "stat_requirements": {
      "atk": 90,
      "spd": 80
    },
    "dna_requirement": null
  },
  {
    "id": 308,
    "from_digimon_id": 78,
    "to_digimon_id": 176,
    "level_required": 30,
    "stat_requirements": {
      "hp": 700,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 310,
    "from_digimon_id": 78,
    "to_digimon_id": 215,
    "level_required": 28,
    "stat_requirements": {
      "atk": 90,
      "spd": 85
    },
    "dna_requirement": null
  },
  {
    "id": 312,
    "from_digimon_id": 79,
    "to_digimon_id": 144,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  {
    "id": 314,
    "from_digimon_id": 79,
    "to_digimon_id": 183,
    "level_required": 28,
    "stat_requirements": {
      "sp": 60,
      "int": 85
    },
    "dna_requirement": null
  },
  {
    "id": 316,
    "from_digimon_id": 79,
    "to_digimon_id": 157,
    "level_required": 26,
    "stat_requirements": {
      "hp": 700,
      "def": 85
    },
    "dna_requirement": null
  },
  {
    "id": 318,
    "from_digimon_id": 81,
    "to_digimon_id": 198,
    "level_required": 26,
    "stat_requirements": {
      "atk": 75,
      "spd": 80
    },
    "dna_requirement": null
  },
  {
    "id": 320,
    "from_digimon_id": 82,
    "to_digimon_id": 141,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "def": 95
    },
    "dna_requirement": null
  },
  {
    "id": 323,
    "from_digimon_id": 83,
    "to_digimon_id": 179,
    "level_required": 26,
    "stat_requirements": {
      "hp": 900
    },
    "dna_requirement": null
  },
  {
    "id": 327,
    "from_digimon_id": 84,
    "to_digimon_id": 202,
    "level_required": 30,
    "stat_requirements": {
      "atk": 105,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 385,
    "from_digimon_id": 105,
    "to_digimon_id": 209,
    "level_required": 30,
    "stat_requirements": {
      "hp": 350,
      "atk": 100,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 923,
    "from_digimon_id": 354,
    "to_digimon_id": 355,
    "level_required": 30,
    "stat_requirements": {
      "atk": 115,
      "spd": 80
    },
    "dna_requirement": null
  },
  {
    "id": 389,
    "from_digimon_id": 106,
    "to_digimon_id": 193,
    "level_required": 26,
    "stat_requirements": {
      "sp": 85
    },
    "dna_requirement": null
  },
  {
    "id": 393,
    "from_digimon_id": 107,
    "to_digimon_id": 157,
    "level_required": 26,
    "stat_requirements": {
      "hp": 700,
      "def": 85
    },
    "dna_requirement": null
  },
  {
    "id": 397,
    "from_digimon_id": 108,
    "to_digimon_id": 184,
    "level_required": 30,
    "stat_requirements": {
      "atk": 90,
      "def": 60,
      "spd": 75
    },
    "dna_requirement": 76
  },
  {
    "id": 468,
    "from_digimon_id": 131,
    "to_digimon_id": 196,
    "level_required": 26,
    "stat_requirements": {
      "atk": 80,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 470,
    "from_digimon_id": 133,
    "to_digimon_id": 170,
    "level_required": 30,
    "stat_requirements": {
      "hp": 800,
      "atk": 75
    },
    "dna_requirement": null
  },
  {
    "id": 472,
    "from_digimon_id": 133,
    "to_digimon_id": 162,
    "level_required": 30,
    "stat_requirements": {
      "sp": 60,
      "atk": 70
    },
    "dna_requirement": null
  },
  {
    "id": 474,
    "from_digimon_id": 137,
    "to_digimon_id": 160,
    "level_required": 26,
    "stat_requirements": {
      "hp": 400,
      "atk": 95
    },
    "dna_requirement": null
  },
  {
    "id": 476,
    "from_digimon_id": 137,
    "to_digimon_id": 203,
    "level_required": 30,
    "stat_requirements": {
      "hp": 350,
      "atk": 100
    },
    "dna_requirement": null
  },
  {
    "id": 478,
    "from_digimon_id": 139,
    "to_digimon_id": 174,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "spd": 100
    },
    "dna_requirement": null
  },
  {
    "id": 480,
    "from_digimon_id": 139,
    "to_digimon_id": 211,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 482,
    "from_digimon_id": 140,
    "to_digimon_id": 153,
    "level_required": 26,
    "stat_requirements": {
      "atk": 95,
      "def": 90
    },
    "dna_requirement": null
  },
  {
    "id": 484,
    "from_digimon_id": 140,
    "to_digimon_id": 211,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 487,
    "from_digimon_id": 141,
    "to_digimon_id": 285,
    "level_required": 55,
    "stat_requirements": {
      "hp": 900,
      "sp": 120,
      "abi": 20,
      "int": 145
    },
    "dna_requirement": null
  },
  {
    "id": 489,
    "from_digimon_id": 143,
    "to_digimon_id": 259,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "def": 120,
      "int": 130,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 491,
    "from_digimon_id": 143,
    "to_digimon_id": 242,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1100,
      "sp": 100,
      "abi": 40,
      "int": 100
    },
    "dna_requirement": null
  },
  {
    "id": 495,
    "from_digimon_id": 145,
    "to_digimon_id": 221,
    "level_required": 45,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 496,
    "from_digimon_id": 145,
    "to_digimon_id": 259,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "def": 120,
      "int": 130,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 505,
    "from_digimon_id": 147,
    "to_digimon_id": 218,
    "level_required": 60,
    "stat_requirements": {
      "sp": 130,
      "abi": 40,
      "atk": 200,
      "spd": 100
    },
    "dna_requirement": null
  },
  {
    "id": 507,
    "from_digimon_id": 150,
    "to_digimon_id": 220,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 120,
      "spd": 145
    },
    "dna_requirement": null
  },
  {
    "id": 509,
    "from_digimon_id": 150,
    "to_digimon_id": 304,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "spd": 160
    },
    "dna_requirement": null
  },
  {
    "id": 511,
    "from_digimon_id": 151,
    "to_digimon_id": 273,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "int": 160,
      "spd": 110
    },
    "dna_requirement": null
  },
  {
    "id": 401,
    "from_digimon_id": 111,
    "to_digimon_id": 217,
    "level_required": 28,
    "stat_requirements": {
      "sp": 75,
      "int": 100
    },
    "dna_requirement": null
  },
  {
    "id": 403,
    "from_digimon_id": 112,
    "to_digimon_id": 156,
    "level_required": 26,
    "stat_requirements": {
      "hp": 800,
      "atk": 75,
      "def": 95
    },
    "dna_requirement": null
  },
  {
    "id": 406,
    "from_digimon_id": 112,
    "to_digimon_id": 196,
    "level_required": 26,
    "stat_requirements": {
      "atk": 80,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 410,
    "from_digimon_id": 114,
    "to_digimon_id": 205,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 95
    },
    "dna_requirement": null
  },
  {
    "id": 414,
    "from_digimon_id": 115,
    "to_digimon_id": 186,
    "level_required": 26,
    "stat_requirements": {
      "atk": 65,
      "def": 65
    },
    "dna_requirement": null
  },
  {
    "id": 418,
    "from_digimon_id": 116,
    "to_digimon_id": 204,
    "level_required": 30,
    "stat_requirements": {
      "hp": 450,
      "atk": 110
    },
    "dna_requirement": null
  },
  {
    "id": 422,
    "from_digimon_id": 118,
    "to_digimon_id": 212,
    "level_required": 30,
    "stat_requirements": {
      "int": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 426,
    "from_digimon_id": 119,
    "to_digimon_id": 161,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 80,
      "spd": 70
    },
    "dna_requirement": null
  },
  {
    "id": 430,
    "from_digimon_id": 121,
    "to_digimon_id": 151,
    "level_required": 26,
    "stat_requirements": {
      "sp": 75,
      "def": 75,
      "spd": 65
    },
    "dna_requirement": null
  },
  {
    "id": 434,
    "from_digimon_id": 122,
    "to_digimon_id": 154,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 438,
    "from_digimon_id": 122,
    "to_digimon_id": 189,
    "level_required": 26,
    "stat_requirements": {
      "sp": 65,
      "int": 65
    },
    "dna_requirement": null
  },
  {
    "id": 442,
    "from_digimon_id": 124,
    "to_digimon_id": 214,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "int": 95
    },
    "dna_requirement": null
  },
  {
    "id": 444,
    "from_digimon_id": 124,
    "to_digimon_id": 197,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "spd": 80
    },
    "dna_requirement": null
  },
  {
    "id": 446,
    "from_digimon_id": 125,
    "to_digimon_id": 163,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 448,
    "from_digimon_id": 125,
    "to_digimon_id": 205,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 95
    },
    "dna_requirement": null
  },
  {
    "id": 450,
    "from_digimon_id": 127,
    "to_digimon_id": 193,
    "level_required": 26,
    "stat_requirements": {
      "sp": 85
    },
    "dna_requirement": null
  },
  {
    "id": 452,
    "from_digimon_id": 127,
    "to_digimon_id": 157,
    "level_required": 26,
    "stat_requirements": {
      "hp": 700,
      "def": 85
    },
    "dna_requirement": null
  },
  {
    "id": 454,
    "from_digimon_id": 128,
    "to_digimon_id": 182,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 456,
    "from_digimon_id": 128,
    "to_digimon_id": 216,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 90,
      "spd": 70
    },
    "dna_requirement": null
  },
  {
    "id": 458,
    "from_digimon_id": 129,
    "to_digimon_id": 176,
    "level_required": 30,
    "stat_requirements": {
      "hp": 700,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 460,
    "from_digimon_id": 130,
    "to_digimon_id": 143,
    "level_required": 28,
    "stat_requirements": {
      "atk": 65,
      "int": 75,
      "spd": 85
    },
    "dna_requirement": null
  },
  {
    "id": 462,
    "from_digimon_id": 130,
    "to_digimon_id": 208,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "spd": 90
    },
    "dna_requirement": null
  },
  {
    "id": 464,
    "from_digimon_id": 131,
    "to_digimon_id": 185,
    "level_required": 28,
    "stat_requirements": {
      "hp": 350,
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 402,
    "from_digimon_id": 112,
    "to_digimon_id": 144,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  {
    "id": 405,
    "from_digimon_id": 112,
    "to_digimon_id": 182,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 407,
    "from_digimon_id": 114,
    "to_digimon_id": 199,
    "level_required": 26,
    "stat_requirements": {
      "atk": 75,
      "def": 80
    },
    "dna_requirement": null
  },
  {
    "id": 409,
    "from_digimon_id": 114,
    "to_digimon_id": 204,
    "level_required": 30,
    "stat_requirements": {
      "hp": 450,
      "atk": 110
    },
    "dna_requirement": null
  },
  {
    "id": 411,
    "from_digimon_id": 115,
    "to_digimon_id": 152,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "int": 100
    },
    "dna_requirement": null
  },
  {
    "id": 471,
    "from_digimon_id": 133,
    "to_digimon_id": 207,
    "level_required": 26,
    "stat_requirements": {
      "hp": 600,
      "atk": 60
    },
    "dna_requirement": null
  },
  {
    "id": 475,
    "from_digimon_id": 137,
    "to_digimon_id": 185,
    "level_required": 28,
    "stat_requirements": {
      "hp": 350,
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 479,
    "from_digimon_id": 139,
    "to_digimon_id": 188,
    "level_required": 26,
    "stat_requirements": {
      "sp": 75,
      "int": 80,
      "spd": 80
    },
    "dna_requirement": null
  },
  {
    "id": 483,
    "from_digimon_id": 140,
    "to_digimon_id": 158,
    "level_required": 28,
    "stat_requirements": {
      "def": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 485,
    "from_digimon_id": 141,
    "to_digimon_id": 237,
    "level_required": 45,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 120,
      "def": 120
    },
    "dna_requirement": null
  },
  {
    "id": 486,
    "from_digimon_id": 141,
    "to_digimon_id": 280,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1100,
      "abi": 20,
      "def": 150,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 490,
    "from_digimon_id": 143,
    "to_digimon_id": 260,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1100,
      "abi": 20,
      "atk": 180,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 492,
    "from_digimon_id": 144,
    "to_digimon_id": 241,
    "level_required": 60,
    "stat_requirements": {
      "sp": 110,
      "abi": 80,
      "def": 180,
      "int": 140
    },
    "dna_requirement": null
  },
  {
    "id": 494,
    "from_digimon_id": 144,
    "to_digimon_id": 269,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 100,
      "def": 130,
      "int": 100
    },
    "dna_requirement": null
  },
  {
    "id": 497,
    "from_digimon_id": 145,
    "to_digimon_id": 296,
    "level_required": 45,
    "stat_requirements": {
      "sp": 100,
      "abi": 20,
      "atk": 120,
      "def": 140
    },
    "dna_requirement": null
  },
  {
    "id": 498,
    "from_digimon_id": 146,
    "to_digimon_id": 227,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1200,
      "sp": 110,
      "abi": 40,
      "atk": 110,
      "int": 110
    },
    "dna_requirement": null
  },
  {
    "id": 504,
    "from_digimon_id": 147,
    "to_digimon_id": 273,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "int": 160,
      "spd": 110
    },
    "dna_requirement": null
  },
  {
    "id": 512,
    "from_digimon_id": 151,
    "to_digimon_id": 275,
    "level_required": 65,
    "stat_requirements": {
      "abi": 10
    },
    "dna_requirement": null
  },
  {
    "id": 516,
    "from_digimon_id": 152,
    "to_digimon_id": 229,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 40,
      "def": 120,
      "int": 145
    },
    "dna_requirement": null
  },
  {
    "id": 520,
    "from_digimon_id": 153,
    "to_digimon_id": 237,
    "level_required": 45,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 120,
      "def": 120
    },
    "dna_requirement": null
  },
  {
    "id": 524,
    "from_digimon_id": 154,
    "to_digimon_id": 284,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "int": 130,
      "spd": 150
    },
    "dna_requirement": null
  },
  {
    "id": 526,
    "from_digimon_id": 154,
    "to_digimon_id": 226,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 40,
      "int": 145,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 528,
    "from_digimon_id": 156,
    "to_digimon_id": 239,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "def": 160,
      "spd": 120
    },
    "dna_requirement": null
  },
  {
    "id": 924,
    "from_digimon_id": 355,
    "to_digimon_id": 356,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1870,
      "abi": 40,
      "atk": 200
    },
    "dna_requirement": null
  },
  {
    "id": 413,
    "from_digimon_id": 115,
    "to_digimon_id": 212,
    "level_required": 30,
    "stat_requirements": {
      "int": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 415,
    "from_digimon_id": 116,
    "to_digimon_id": 146,
    "level_required": 30,
    "stat_requirements": {
      "atk": 95,
      "spd": 80
    },
    "dna_requirement": null
  },
  {
    "id": 417,
    "from_digimon_id": 116,
    "to_digimon_id": 192,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 80,
      "int": 70
    },
    "dna_requirement": null
  },
  {
    "id": 419,
    "from_digimon_id": 116,
    "to_digimon_id": 169,
    "level_required": 28,
    "stat_requirements": {
      "atk": 80,
      "int": 70
    },
    "dna_requirement": null
  },
  {
    "id": 421,
    "from_digimon_id": 118,
    "to_digimon_id": 198,
    "level_required": 26,
    "stat_requirements": {
      "atk": 75,
      "spd": 80
    },
    "dna_requirement": null
  },
  {
    "id": 423,
    "from_digimon_id": 119,
    "to_digimon_id": 174,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "spd": 100
    },
    "dna_requirement": null
  },
  {
    "id": 425,
    "from_digimon_id": 119,
    "to_digimon_id": 209,
    "level_required": 30,
    "stat_requirements": {
      "hp": 350,
      "atk": 100,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 427,
    "from_digimon_id": 120,
    "to_digimon_id": 145,
    "level_required": 26,
    "stat_requirements": {
      "def": 110
    },
    "dna_requirement": null
  },
  {
    "id": 429,
    "from_digimon_id": 120,
    "to_digimon_id": 176,
    "level_required": 30,
    "stat_requirements": {
      "hp": 700,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 431,
    "from_digimon_id": 121,
    "to_digimon_id": 191,
    "level_required": 32,
    "stat_requirements": {},
    "dna_requirement": null
  },
  {
    "id": 433,
    "from_digimon_id": 122,
    "to_digimon_id": 150,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "spd": 95
    },
    "dna_requirement": null
  },
  {
    "id": 437,
    "from_digimon_id": 122,
    "to_digimon_id": 149,
    "level_required": 30,
    "stat_requirements": {
      "hp": 500,
      "atk": 120,
      "def": 60
    },
    "dna_requirement": null
  },
  {
    "id": 439,
    "from_digimon_id": 124,
    "to_digimon_id": 147,
    "level_required": 30,
    "stat_requirements": {
      "abi": 10,
      "atk": 70,
      "int": 90
    },
    "dna_requirement": null
  },
  {
    "id": 441,
    "from_digimon_id": 124,
    "to_digimon_id": 192,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 80,
      "int": 70
    },
    "dna_requirement": null
  },
  {
    "id": 443,
    "from_digimon_id": 124,
    "to_digimon_id": 190,
    "level_required": 28,
    "stat_requirements": {
      "sp": 80,
      "int": 80
    },
    "dna_requirement": null
  },
  {
    "id": 447,
    "from_digimon_id": 125,
    "to_digimon_id": 202,
    "level_required": 30,
    "stat_requirements": {
      "atk": 105,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 451,
    "from_digimon_id": 127,
    "to_digimon_id": 206,
    "level_required": 26,
    "stat_requirements": {
      "def": 80,
      "int": 65
    },
    "dna_requirement": null
  },
  {
    "id": 455,
    "from_digimon_id": 128,
    "to_digimon_id": 214,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "int": 95
    },
    "dna_requirement": null
  },
  {
    "id": 459,
    "from_digimon_id": 129,
    "to_digimon_id": 210,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  {
    "id": 463,
    "from_digimon_id": 131,
    "to_digimon_id": 177,
    "level_required": 28,
    "stat_requirements": {
      "hp": 500,
      "atk": 95
    },
    "dna_requirement": null
  },
  {
    "id": 467,
    "from_digimon_id": 131,
    "to_digimon_id": 149,
    "level_required": 30,
    "stat_requirements": {
      "hp": 500,
      "atk": 120,
      "def": 60
    },
    "dna_requirement": null
  },
  {
    "id": 517,
    "from_digimon_id": 152,
    "to_digimon_id": 285,
    "level_required": 55,
    "stat_requirements": {
      "hp": 900,
      "sp": 120,
      "abi": 20,
      "int": 145
    },
    "dna_requirement": null
  },
  {
    "id": 519,
    "from_digimon_id": 152,
    "to_digimon_id": 225,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "int": 130,
      "spd": 160
    },
    "dna_requirement": null
  },
  {
    "id": 521,
    "from_digimon_id": 153,
    "to_digimon_id": 260,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1100,
      "abi": 20,
      "atk": 180,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 523,
    "from_digimon_id": 154,
    "to_digimon_id": 250,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1000,
      "abi": 20,
      "atk": 130,
      "def": 110
    },
    "dna_requirement": null
  },
  {
    "id": 529,
    "from_digimon_id": 156,
    "to_digimon_id": 294,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 130,
      "def": 130
    },
    "dna_requirement": null
  },
  {
    "id": 533,
    "from_digimon_id": 156,
    "to_digimon_id": 295,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1700,
      "abi": 40,
      "atk": 180
    },
    "dna_requirement": null
  },
  {
    "id": 537,
    "from_digimon_id": 160,
    "to_digimon_id": 245,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 145,
      "spd": 120
    },
    "dna_requirement": null
  },
  {
    "id": 541,
    "from_digimon_id": 163,
    "to_digimon_id": 219,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 150,
      "def": 170,
      "int": 135
    },
    "dna_requirement": null
  },
  {
    "id": 578,
    "from_digimon_id": 179,
    "to_digimon_id": 279,
    "level_required": 50,
    "stat_requirements": {
      "sp": 100,
      "abi": 20,
      "def": 120,
      "int": 145
    },
    "dna_requirement": null
  },
  {
    "id": 582,
    "from_digimon_id": 181,
    "to_digimon_id": 251,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "def": 140,
      "int": 120,
      "spd": 150
    },
    "dna_requirement": null
  },
  {
    "id": 586,
    "from_digimon_id": 182,
    "to_digimon_id": 306,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 120,
      "int": 135,
      "spd": 150
    },
    "dna_requirement": null
  },
  {
    "id": 588,
    "from_digimon_id": 183,
    "to_digimon_id": 239,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "def": 160,
      "spd": 120
    },
    "dna_requirement": null
  },
  {
    "id": 592,
    "from_digimon_id": 185,
    "to_digimon_id": 245,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 145,
      "spd": 120
    },
    "dna_requirement": null
  },
  {
    "id": 594,
    "from_digimon_id": 185,
    "to_digimon_id": 292,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 596,
    "from_digimon_id": 187,
    "to_digimon_id": 286,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 145,
      "def": 100
    },
    "dna_requirement": null
  },
  {
    "id": 598,
    "from_digimon_id": 188,
    "to_digimon_id": 229,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 40,
      "def": 120,
      "int": 145
    },
    "dna_requirement": null
  },
  {
    "id": 600,
    "from_digimon_id": 188,
    "to_digimon_id": 290,
    "level_required": 50,
    "stat_requirements": {
      "sp": 110,
      "abi": 20,
      "int": 135
    },
    "dna_requirement": null
  },
  {
    "id": 602,
    "from_digimon_id": 191,
    "to_digimon_id": 277,
    "level_required": 45,
    "stat_requirements": {
      "abi": 20,
      "def": 150
    },
    "dna_requirement": null
  },
  {
    "id": 606,
    "from_digimon_id": 192,
    "to_digimon_id": 286,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 145,
      "def": 100
    },
    "dna_requirement": null
  },
  {
    "id": 608,
    "from_digimon_id": 193,
    "to_digimon_id": 221,
    "level_required": 45,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 610,
    "from_digimon_id": 193,
    "to_digimon_id": 280,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1100,
      "abi": 20,
      "def": 150,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 612,
    "from_digimon_id": 194,
    "to_digimon_id": 290,
    "level_required": 50,
    "stat_requirements": {
      "sp": 110,
      "abi": 20,
      "int": 135
    },
    "dna_requirement": null
  },
  {
    "id": 614,
    "from_digimon_id": 194,
    "to_digimon_id": 268,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1000,
      "sp": 100,
      "abi": 20,
      "int": 130
    },
    "dna_requirement": null
  },
  {
    "id": 624,
    "from_digimon_id": 199,
    "to_digimon_id": 228,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1700,
      "abi": 20,
      "atk": 160,
      "def": 130
    },
    "dna_requirement": null
  },
  {
    "id": 626,
    "from_digimon_id": 199,
    "to_digimon_id": 277,
    "level_required": 45,
    "stat_requirements": {
      "abi": 20,
      "def": 150
    },
    "dna_requirement": null
  },
  {
    "id": 628,
    "from_digimon_id": 200,
    "to_digimon_id": 299,
    "level_required": 50,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "def": 120,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 632,
    "from_digimon_id": 201,
    "to_digimon_id": 276,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1800,
      "abi": 20,
      "atk": 140,
      "def": 140
    },
    "dna_requirement": null
  },
  {
    "id": 640,
    "from_digimon_id": 202,
    "to_digimon_id": 295,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1700,
      "abi": 40,
      "atk": 180
    },
    "dna_requirement": null
  },
  {
    "id": 644,
    "from_digimon_id": 204,
    "to_digimon_id": 228,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1700,
      "abi": 20,
      "atk": 160,
      "def": 130
    },
    "dna_requirement": null
  },
  {
    "id": 925,
    "from_digimon_id": 355,
    "to_digimon_id": 357,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 155,
      "def": 155,
      "int": 155
    },
    "dna_requirement": null
  },
  {
    "id": 545,
    "from_digimon_id": 164,
    "to_digimon_id": 232,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 130,
      "def": 130,
      "int": 130
    },
    "dna_requirement": null
  },
  {
    "id": 549,
    "from_digimon_id": 165,
    "to_digimon_id": 274,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "def": 130,
      "int": 130
    },
    "dna_requirement": null
  },
  {
    "id": 557,
    "from_digimon_id": 167,
    "to_digimon_id": 275,
    "level_required": 65,
    "stat_requirements": {
      "abi": 10
    },
    "dna_requirement": null
  },
  {
    "id": 559,
    "from_digimon_id": 168,
    "to_digimon_id": 257,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1400,
      "abi": 20,
      "atk": 150,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 561,
    "from_digimon_id": 170,
    "to_digimon_id": 224,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1700,
      "abi": 20,
      "atk": 130,
      "def": 130,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 563,
    "from_digimon_id": 170,
    "to_digimon_id": 297,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "def": 120,
      "spd": 150
    },
    "dna_requirement": null
  },
  {
    "id": 565,
    "from_digimon_id": 172,
    "to_digimon_id": 236,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 135,
      "spd": 120
    },
    "dna_requirement": null
  },
  {
    "id": 567,
    "from_digimon_id": 172,
    "to_digimon_id": 259,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "def": 120,
      "int": 130,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 574,
    "from_digimon_id": 177,
    "to_digimon_id": 234,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1700,
      "abi": 80,
      "atk": 145,
      "def": 120
    },
    "dna_requirement": null
  },
  {
    "id": 616,
    "from_digimon_id": 195,
    "to_digimon_id": 253,
    "level_required": 55,
    "stat_requirements": {
      "sp": 130,
      "abi": 40,
      "def": 130,
      "int": 150
    },
    "dna_requirement": null
  },
  {
    "id": 620,
    "from_digimon_id": 198,
    "to_digimon_id": 254,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "def": 130,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 622,
    "from_digimon_id": 198,
    "to_digimon_id": 292,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 534,
    "from_digimon_id": 158,
    "to_digimon_id": 239,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "def": 160,
      "spd": 120
    },
    "dna_requirement": null
  },
  {
    "id": 536,
    "from_digimon_id": 158,
    "to_digimon_id": 256,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1000,
      "abi": 20,
      "atk": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 538,
    "from_digimon_id": 160,
    "to_digimon_id": 265,
    "level_required": 60,
    "stat_requirements": {
      "sp": 100,
      "abi": 80,
      "int": 120,
      "spd": 140
    },
    "dna_requirement": null
  },
  {
    "id": 540,
    "from_digimon_id": 160,
    "to_digimon_id": 270,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 135
    },
    "dna_requirement": null
  },
  {
    "id": 544,
    "from_digimon_id": 164,
    "to_digimon_id": 224,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1700,
      "abi": 20,
      "atk": 130,
      "def": 130,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 546,
    "from_digimon_id": 164,
    "to_digimon_id": 243,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 40,
      "int": 145,
      "spd": 100
    },
    "dna_requirement": null
  },
  {
    "id": 548,
    "from_digimon_id": 165,
    "to_digimon_id": 237,
    "level_required": 45,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 120,
      "def": 120
    },
    "dna_requirement": null
  },
  {
    "id": 550,
    "from_digimon_id": 166,
    "to_digimon_id": 246,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 120,
      "spd": 120
    },
    "dna_requirement": null
  },
  {
    "id": 577,
    "from_digimon_id": 179,
    "to_digimon_id": 224,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1700,
      "abi": 20,
      "atk": 130,
      "def": 130,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 579,
    "from_digimon_id": 179,
    "to_digimon_id": 302,
    "level_required": 60,
    "stat_requirements": {
      "hp": 2000,
      "sp": 140,
      "abi": 80,
      "atk": 140,
      "def": 140,
      "int": 140
    },
    "dna_requirement": null
  },
  {
    "id": 581,
    "from_digimon_id": 181,
    "to_digimon_id": 219,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 150,
      "def": 170,
      "int": 135
    },
    "dna_requirement": null
  },
  {
    "id": 583,
    "from_digimon_id": 181,
    "to_digimon_id": 267,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1600,
      "abi": 20,
      "atk": 160
    },
    "dna_requirement": null
  },
  {
    "id": 585,
    "from_digimon_id": 182,
    "to_digimon_id": 265,
    "level_required": 60,
    "stat_requirements": {
      "sp": 100,
      "abi": 80,
      "int": 120,
      "spd": 140
    },
    "dna_requirement": null
  },
  {
    "id": 591,
    "from_digimon_id": 184,
    "to_digimon_id": 222,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1600,
      "abi": 20,
      "def": 150,
      "spd": 150
    },
    "dna_requirement": null
  },
  {
    "id": 595,
    "from_digimon_id": 187,
    "to_digimon_id": 274,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "def": 130,
      "int": 130
    },
    "dna_requirement": null
  },
  {
    "id": 599,
    "from_digimon_id": 188,
    "to_digimon_id": 284,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "int": 130,
      "spd": 150
    },
    "dna_requirement": null
  },
  {
    "id": 603,
    "from_digimon_id": 191,
    "to_digimon_id": 296,
    "level_required": 45,
    "stat_requirements": {
      "sp": 100,
      "abi": 20,
      "atk": 120,
      "def": 140
    },
    "dna_requirement": null
  },
  {
    "id": 607,
    "from_digimon_id": 192,
    "to_digimon_id": 255,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 150,
      "def": 140
    },
    "dna_requirement": null
  },
  {
    "id": 611,
    "from_digimon_id": 194,
    "to_digimon_id": 279,
    "level_required": 50,
    "stat_requirements": {
      "sp": 100,
      "abi": 20,
      "def": 120,
      "int": 145
    },
    "dna_requirement": null
  },
  {
    "id": 619,
    "from_digimon_id": 195,
    "to_digimon_id": 244,
    "level_required": 55,
    "stat_requirements": {
      "abi": 40,
      "atk": 130,
      "def": 120,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 623,
    "from_digimon_id": 198,
    "to_digimon_id": 300,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "int": 110,
      "spd": 160
    },
    "dna_requirement": null
  },
  {
    "id": 631,
    "from_digimon_id": 201,
    "to_digimon_id": 220,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 120,
      "spd": 145
    },
    "dna_requirement": null
  },
  {
    "id": 633,
    "from_digimon_id": 201,
    "to_digimon_id": 294,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 130,
      "def": 130
    },
    "dna_requirement": null
  },
  {
    "id": 637,
    "from_digimon_id": 202,
    "to_digimon_id": 262,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 140,
      "def": 140,
      "int": 140
    },
    "dna_requirement": null
  },
  {
    "id": 639,
    "from_digimon_id": 202,
    "to_digimon_id": 255,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 150,
      "def": 140
    },
    "dna_requirement": null
  },
  {
    "id": 641,
    "from_digimon_id": 203,
    "to_digimon_id": 228,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1700,
      "abi": 20,
      "atk": 160,
      "def": 130
    },
    "dna_requirement": null
  },
  {
    "id": 643,
    "from_digimon_id": 203,
    "to_digimon_id": 301,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 180,
      "def": 150
    },
    "dna_requirement": null
  },
  {
    "id": 645,
    "from_digimon_id": 204,
    "to_digimon_id": 230,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 100,
      "spd": 100
    },
    "dna_requirement": null
  },
  {
    "id": 647,
    "from_digimon_id": 204,
    "to_digimon_id": 242,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1100,
      "sp": 100,
      "abi": 40,
      "int": 100
    },
    "dna_requirement": null
  },
  {
    "id": 652,
    "from_digimon_id": 206,
    "to_digimon_id": 221,
    "level_required": 45,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 656,
    "from_digimon_id": 207,
    "to_digimon_id": 246,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 120,
      "spd": 120
    },
    "dna_requirement": null
  },
  {
    "id": 926,
    "from_digimon_id": 214,
    "to_digimon_id": 360,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1900,
      "abi": 80,
      "int": 250,
      "spd": 140
    },
    "dna_requirement": null
  },
  {
    "id": 552,
    "from_digimon_id": 166,
    "to_digimon_id": 284,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "int": 130,
      "spd": 150
    },
    "dna_requirement": null
  },
  {
    "id": 554,
    "from_digimon_id": 166,
    "to_digimon_id": 240,
    "level_required": 50,
    "stat_requirements": {
      "sp": 110,
      "abi": 20,
      "int": 140
    },
    "dna_requirement": null
  },
  {
    "id": 558,
    "from_digimon_id": 168,
    "to_digimon_id": 248,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 140,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 562,
    "from_digimon_id": 170,
    "to_digimon_id": 290,
    "level_required": 50,
    "stat_requirements": {
      "sp": 110,
      "abi": 20,
      "int": 135
    },
    "dna_requirement": null
  },
  {
    "id": 566,
    "from_digimon_id": 172,
    "to_digimon_id": 246,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 120,
      "spd": 120
    },
    "dna_requirement": null
  },
  {
    "id": 569,
    "from_digimon_id": 174,
    "to_digimon_id": 253,
    "level_required": 55,
    "stat_requirements": {
      "sp": 130,
      "abi": 40,
      "def": 130,
      "int": 150
    },
    "dna_requirement": null
  },
  {
    "id": 571,
    "from_digimon_id": 176,
    "to_digimon_id": 257,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1400,
      "abi": 20,
      "atk": 150,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 573,
    "from_digimon_id": 176,
    "to_digimon_id": 291,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 150,
      "spd": 140
    },
    "dna_requirement": null
  },
  {
    "id": 627,
    "from_digimon_id": 200,
    "to_digimon_id": 279,
    "level_required": 50,
    "stat_requirements": {
      "sp": 100,
      "abi": 20,
      "def": 120,
      "int": 145
    },
    "dna_requirement": null
  },
  {
    "id": 629,
    "from_digimon_id": 200,
    "to_digimon_id": 302,
    "level_required": 60,
    "stat_requirements": {
      "hp": 2000,
      "sp": 140,
      "abi": 80,
      "atk": 140,
      "def": 140,
      "int": 140
    },
    "dna_requirement": null
  },
  {
    "id": 651,
    "from_digimon_id": 205,
    "to_digimon_id": 278,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 160,
      "def": 140
    },
    "dna_requirement": null
  },
  {
    "id": 653,
    "from_digimon_id": 206,
    "to_digimon_id": 269,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 100,
      "def": 130,
      "int": 100
    },
    "dna_requirement": null
  },
  {
    "id": 655,
    "from_digimon_id": 207,
    "to_digimon_id": 245,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 145,
      "spd": 120
    },
    "dna_requirement": null
  },
  {
    "id": 927,
    "from_digimon_id": 359,
    "to_digimon_id": 361,
    "level_required": 60,
    "stat_requirements": {
      "hp": 2090,
      "abi": 80,
      "int": 275,
      "spd": 150
    },
    "dna_requirement": null
  },
  {
    "id": 657,
    "from_digimon_id": 207,
    "to_digimon_id": 291,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 150,
      "spd": 140
    },
    "dna_requirement": null
  },
  {
    "id": 661,
    "from_digimon_id": 208,
    "to_digimon_id": 226,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 40,
      "int": 145,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 727,
    "from_digimon_id": 38,
    "to_digimon_id": 120,
    "level_required": 12,
    "stat_requirements": {
      "atk": 40,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 729,
    "from_digimon_id": 42,
    "to_digimon_id": 69,
    "level_required": 16,
    "stat_requirements": {
      "atk": 50,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 731,
    "from_digimon_id": 42,
    "to_digimon_id": 136,
    "level_required": 12,
    "stat_requirements": {
      "hp": 500
    },
    "dna_requirement": null
  },
  {
    "id": 733,
    "from_digimon_id": 42,
    "to_digimon_id": 116,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "atk": 40
    },
    "dna_requirement": null
  },
  {
    "id": 736,
    "from_digimon_id": 43,
    "to_digimon_id": 125,
    "level_required": 16,
    "stat_requirements": {
      "atk": 40,
      "spd": 35
    },
    "dna_requirement": null
  },
  {
    "id": 738,
    "from_digimon_id": 52,
    "to_digimon_id": 80,
    "level_required": 14,
    "stat_requirements": {
      "hp": 130,
      "def": 60
    },
    "dna_requirement": null
  },
  {
    "id": 740,
    "from_digimon_id": 52,
    "to_digimon_id": 108,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 55
    },
    "dna_requirement": null
  },
  {
    "id": 744,
    "from_digimon_id": 57,
    "to_digimon_id": 74,
    "level_required": 14,
    "stat_requirements": {
      "hp": 500
    },
    "dna_requirement": null
  },
  {
    "id": 752,
    "from_digimon_id": 61,
    "to_digimon_id": 101,
    "level_required": 15,
    "stat_requirements": {
      "atk": 50,
      "spd": 55
    },
    "dna_requirement": null
  },
  {
    "id": 755,
    "from_digimon_id": 61,
    "to_digimon_id": 115,
    "level_required": 16,
    "stat_requirements": {
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 757,
    "from_digimon_id": 66,
    "to_digimon_id": 185,
    "level_required": 28,
    "stat_requirements": {
      "hp": 350,
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 759,
    "from_digimon_id": 68,
    "to_digimon_id": 149,
    "level_required": 30,
    "stat_requirements": {
      "hp": 500,
      "atk": 120,
      "def": 60
    },
    "dna_requirement": null
  },
  {
    "id": 761,
    "from_digimon_id": 68,
    "to_digimon_id": 177,
    "level_required": 28,
    "stat_requirements": {
      "hp": 500,
      "atk": 95
    },
    "dna_requirement": null
  },
  {
    "id": 763,
    "from_digimon_id": 69,
    "to_digimon_id": 142,
    "level_required": 30,
    "stat_requirements": {
      "atk": 110,
      "int": 85
    },
    "dna_requirement": null
  },
  {
    "id": 765,
    "from_digimon_id": 69,
    "to_digimon_id": 146,
    "level_required": 30,
    "stat_requirements": {
      "atk": 95,
      "spd": 80
    },
    "dna_requirement": null
  },
  {
    "id": 767,
    "from_digimon_id": 73,
    "to_digimon_id": 182,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 769,
    "from_digimon_id": 75,
    "to_digimon_id": 148,
    "level_required": 30,
    "stat_requirements": {
      "abi": 10,
      "atk": 80,
      "spd": 95
    },
    "dna_requirement": null
  },
  {
    "id": 771,
    "from_digimon_id": 75,
    "to_digimon_id": 201,
    "level_required": 26,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 663,
    "from_digimon_id": 209,
    "to_digimon_id": 230,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 100,
      "spd": 100
    },
    "dna_requirement": null
  },
  {
    "id": 665,
    "from_digimon_id": 209,
    "to_digimon_id": 252,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 130,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 667,
    "from_digimon_id": 210,
    "to_digimon_id": 307,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 669,
    "from_digimon_id": 211,
    "to_digimon_id": 254,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "def": 130,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 673,
    "from_digimon_id": 212,
    "to_digimon_id": 307,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 681,
    "from_digimon_id": 215,
    "to_digimon_id": 298,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "def": 135,
      "spd": 125
    },
    "dna_requirement": null
  },
  {
    "id": 685,
    "from_digimon_id": 216,
    "to_digimon_id": 300,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "int": 110,
      "spd": 160
    },
    "dna_requirement": null
  },
  {
    "id": 689,
    "from_digimon_id": 219,
    "to_digimon_id": 312,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 180,
      "def": 170,
      "int": 150
    },
    "dna_requirement": 331
  },
  {
    "id": 693,
    "from_digimon_id": 228,
    "to_digimon_id": 315,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 200,
      "int": 150,
      "spd": 150
    },
    "dna_requirement": 297
  },
  {
    "id": 697,
    "from_digimon_id": 265,
    "to_digimon_id": 266,
    "level_required": 0,
    "stat_requirements": {},
    "dna_requirement": null
  },
  {
    "id": 701,
    "from_digimon_id": 273,
    "to_digimon_id": 332,
    "level_required": 99,
    "stat_requirements": {
      "abi": 120
    },
    "dna_requirement": null
  },
  {
    "id": 705,
    "from_digimon_id": 281,
    "to_digimon_id": 282,
    "level_required": 80,
    "stat_requirements": {
      "hp": 2100,
      "abi": 100,
      "atk": 300,
      "spd": 220
    },
    "dna_requirement": null
  },
  {
    "id": 711,
    "from_digimon_id": 298,
    "to_digimon_id": 316,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1500,
      "abi": 40,
      "atk": 150,
      "def": 200
    },
    "dna_requirement": 276
  },
  {
    "id": 713,
    "from_digimon_id": 304,
    "to_digimon_id": 305,
    "level_required": 60,
    "stat_requirements": {
      "sp": 160,
      "abi": 30,
      "spd": 250
    },
    "dna_requirement": null
  },
  {
    "id": 773,
    "from_digimon_id": 80,
    "to_digimon_id": 161,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 80,
      "spd": 70
    },
    "dna_requirement": null
  },
  {
    "id": 715,
    "from_digimon_id": 321,
    "to_digimon_id": 283,
    "level_required": 0,
    "stat_requirements": {},
    "dna_requirement": null
  },
  {
    "id": 717,
    "from_digimon_id": 6,
    "to_digimon_id": 20,
    "level_required": 6,
    "stat_requirements": {
      "atk": 90,
      "spd": 20
    },
    "dna_requirement": null
  },
  {
    "id": 719,
    "from_digimon_id": 20,
    "to_digimon_id": 89,
    "level_required": 16,
    "stat_requirements": {
      "hp": 150,
      "atk": 40
    },
    "dna_requirement": null
  },
  {
    "id": 721,
    "from_digimon_id": 36,
    "to_digimon_id": 110,
    "level_required": 20,
    "stat_requirements": {
      "atk": 50,
      "spd": 50
    },
    "dna_requirement": null
  },
  {
    "id": 723,
    "from_digimon_id": 36,
    "to_digimon_id": 98,
    "level_required": 18,
    "stat_requirements": {
      "abi": 5
    },
    "dna_requirement": null
  },
  {
    "id": 725,
    "from_digimon_id": 38,
    "to_digimon_id": 136,
    "level_required": 12,
    "stat_requirements": {
      "hp": 500
    },
    "dna_requirement": null
  },
  {
    "id": 664,
    "from_digimon_id": 209,
    "to_digimon_id": 248,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 140,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 668,
    "from_digimon_id": 210,
    "to_digimon_id": 309,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "int": 170,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 928,
    "from_digimon_id": 15,
    "to_digimon_id": 363,
    "level_required": 8,
    "stat_requirements": {
      "hp": 75,
      "atk": 20
    },
    "dna_requirement": null
  },
  {
    "id": 670,
    "from_digimon_id": 211,
    "to_digimon_id": 256,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1000,
      "abi": 20,
      "atk": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 672,
    "from_digimon_id": 212,
    "to_digimon_id": 285,
    "level_required": 55,
    "stat_requirements": {
      "hp": 900,
      "sp": 120,
      "abi": 20,
      "int": 145
    },
    "dna_requirement": null
  },
  {
    "id": 676,
    "from_digimon_id": 214,
    "to_digimon_id": 289,
    "level_required": 60,
    "stat_requirements": {
      "sp": 120,
      "abi": 80,
      "atk": 120,
      "int": 120
    },
    "dna_requirement": 152
  },
  {
    "id": 730,
    "from_digimon_id": 42,
    "to_digimon_id": 101,
    "level_required": 15,
    "stat_requirements": {
      "atk": 50,
      "spd": 55
    },
    "dna_requirement": null
  },
  {
    "id": 734,
    "from_digimon_id": 43,
    "to_digimon_id": 96,
    "level_required": 14,
    "stat_requirements": {
      "atk": 60,
      "spd": 25
    },
    "dna_requirement": null
  },
  {
    "id": 735,
    "from_digimon_id": 43,
    "to_digimon_id": 97,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "def": 25,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 739,
    "from_digimon_id": 52,
    "to_digimon_id": 135,
    "level_required": 15,
    "stat_requirements": {
      "hp": 130,
      "atk": 50
    },
    "dna_requirement": null
  },
  {
    "id": 741,
    "from_digimon_id": 52,
    "to_digimon_id": 140,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 743,
    "from_digimon_id": 57,
    "to_digimon_id": 113,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 745,
    "from_digimon_id": 57,
    "to_digimon_id": 102,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 747,
    "from_digimon_id": 58,
    "to_digimon_id": 96,
    "level_required": 14,
    "stat_requirements": {
      "atk": 60,
      "spd": 25
    },
    "dna_requirement": null
  },
  {
    "id": 749,
    "from_digimon_id": 58,
    "to_digimon_id": 135,
    "level_required": 15,
    "stat_requirements": {
      "hp": 130,
      "atk": 50
    },
    "dna_requirement": null
  },
  {
    "id": 751,
    "from_digimon_id": 58,
    "to_digimon_id": 119,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 756,
    "from_digimon_id": 66,
    "to_digimon_id": 145,
    "level_required": 26,
    "stat_requirements": {
      "def": 110
    },
    "dna_requirement": null
  },
  {
    "id": 760,
    "from_digimon_id": 68,
    "to_digimon_id": 197,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "spd": 80
    },
    "dna_requirement": null
  },
  {
    "id": 764,
    "from_digimon_id": 69,
    "to_digimon_id": 169,
    "level_required": 28,
    "stat_requirements": {
      "atk": 80,
      "int": 70
    },
    "dna_requirement": null
  },
  {
    "id": 768,
    "from_digimon_id": 73,
    "to_digimon_id": 215,
    "level_required": 28,
    "stat_requirements": {
      "atk": 90,
      "spd": 85
    },
    "dna_requirement": null
  },
  {
    "id": 772,
    "from_digimon_id": 75,
    "to_digimon_id": 203,
    "level_required": 30,
    "stat_requirements": {
      "hp": 350,
      "atk": 100
    },
    "dna_requirement": null
  },
  {
    "id": 775,
    "from_digimon_id": 80,
    "to_digimon_id": 144,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  {
    "id": 777,
    "from_digimon_id": 80,
    "to_digimon_id": 324,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 120,
      "def": 145
    },
    "dna_requirement": null
  },
  {
    "id": 678,
    "from_digimon_id": 214,
    "to_digimon_id": 309,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "int": 170,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 680,
    "from_digimon_id": 215,
    "to_digimon_id": 297,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "def": 120,
      "spd": 150
    },
    "dna_requirement": null
  },
  {
    "id": 682,
    "from_digimon_id": 216,
    "to_digimon_id": 272,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 130
    },
    "dna_requirement": null
  },
  {
    "id": 684,
    "from_digimon_id": 216,
    "to_digimon_id": 298,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "def": 135,
      "spd": 125
    },
    "dna_requirement": null
  },
  {
    "id": 686,
    "from_digimon_id": 217,
    "to_digimon_id": 227,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1200,
      "sp": 110,
      "abi": 40,
      "atk": 110,
      "int": 110
    },
    "dna_requirement": null
  },
  {
    "id": 690,
    "from_digimon_id": 222,
    "to_digimon_id": 313,
    "level_required": 70,
    "stat_requirements": {
      "abi": 100,
      "atk": 160,
      "def": 160,
      "int": 160,
      "spd": 160
    },
    "dna_requirement": null
  },
  {
    "id": 692,
    "from_digimon_id": 223,
    "to_digimon_id": 222,
    "level_required": 0,
    "stat_requirements": {},
    "dna_requirement": null
  },
  {
    "id": 694,
    "from_digimon_id": 248,
    "to_digimon_id": 249,
    "level_required": 60,
    "stat_requirements": {
      "hp": 2000,
      "abi": 30,
      "atk": 250
    },
    "dna_requirement": null
  },
  {
    "id": 696,
    "from_digimon_id": 262,
    "to_digimon_id": 320,
    "level_required": 80,
    "stat_requirements": {
      "abi": 80,
      "atk": 185,
      "def": 185,
      "int": 185
    },
    "dna_requirement": null
  },
  {
    "id": 698,
    "from_digimon_id": 266,
    "to_digimon_id": 265,
    "level_required": 0,
    "stat_requirements": {},
    "dna_requirement": null
  },
  {
    "id": 700,
    "from_digimon_id": 272,
    "to_digimon_id": 318,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 155,
      "int": 100
    },
    "dna_requirement": 226
  },
  {
    "id": 702,
    "from_digimon_id": 274,
    "to_digimon_id": 332,
    "level_required": 99,
    "stat_requirements": {
      "abi": 120
    },
    "dna_requirement": null
  },
  {
    "id": 706,
    "from_digimon_id": 283,
    "to_digimon_id": 321,
    "level_required": 0,
    "stat_requirements": {},
    "dna_requirement": null
  },
  {
    "id": 779,
    "from_digimon_id": 96,
    "to_digimon_id": 150,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "spd": 95
    },
    "dna_requirement": null
  },
  {
    "id": 780,
    "from_digimon_id": 96,
    "to_digimon_id": 192,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 80,
      "int": 70
    },
    "dna_requirement": null
  },
  {
    "id": 781,
    "from_digimon_id": 97,
    "to_digimon_id": 159,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "abi": 10,
      "atk": 125
    },
    "dna_requirement": null
  },
  {
    "id": 708,
    "from_digimon_id": 294,
    "to_digimon_id": 233,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 130,
      "def": 120
    },
    "dna_requirement": null
  },
  {
    "id": 710,
    "from_digimon_id": 297,
    "to_digimon_id": 315,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 200,
      "int": 150,
      "spd": 150
    },
    "dna_requirement": 228
  },
  {
    "id": 714,
    "from_digimon_id": 307,
    "to_digimon_id": 308,
    "level_required": 60,
    "stat_requirements": {
      "sp": 170,
      "abi": 30,
      "int": 180
    },
    "dna_requirement": null
  },
  {
    "id": 718,
    "from_digimon_id": 20,
    "to_digimon_id": 69,
    "level_required": 16,
    "stat_requirements": {
      "atk": 50,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 722,
    "from_digimon_id": 36,
    "to_digimon_id": 123,
    "level_required": 16,
    "stat_requirements": {
      "atk": 55,
      "spd": 50
    },
    "dna_requirement": null
  },
  {
    "id": 726,
    "from_digimon_id": 38,
    "to_digimon_id": 106,
    "level_required": 12,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 896,
    "from_digimon_id": 333,
    "to_digimon_id": 84,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 898,
    "from_digimon_id": 335,
    "to_digimon_id": 336,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1150,
      "abi": 50,
      "atk": 130,
      "spd": 150
    },
    "dna_requirement": null
  },
  {
    "id": 900,
    "from_digimon_id": 335,
    "to_digimon_id": 214,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "int": 95
    },
    "dna_requirement": null
  },
  {
    "id": 903,
    "from_digimon_id": 328,
    "to_digimon_id": 139,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 929,
    "from_digimon_id": 363,
    "to_digimon_id": 364,
    "level_required": 15,
    "stat_requirements": {
      "atk": 40,
      "spd": 35
    },
    "dna_requirement": null
  },
  {
    "id": 907,
    "from_digimon_id": 330,
    "to_digimon_id": 331,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 180
    },
    "dna_requirement": null
  },
  {
    "id": 824,
    "from_digimon_id": 136,
    "to_digimon_id": 173,
    "level_required": 28,
    "stat_requirements": {
      "sp": 70,
      "int": 85
    },
    "dna_requirement": null
  },
  {
    "id": 826,
    "from_digimon_id": 136,
    "to_digimon_id": 191,
    "level_required": 32,
    "stat_requirements": {},
    "dna_requirement": null
  },
  {
    "id": 828,
    "from_digimon_id": 138,
    "to_digimon_id": 162,
    "level_required": 30,
    "stat_requirements": {
      "sp": 60,
      "atk": 70
    },
    "dna_requirement": null
  },
  {
    "id": 830,
    "from_digimon_id": 138,
    "to_digimon_id": 198,
    "level_required": 26,
    "stat_requirements": {
      "atk": 75,
      "spd": 80
    },
    "dna_requirement": null
  },
  {
    "id": 834,
    "from_digimon_id": 148,
    "to_digimon_id": 252,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 130,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 836,
    "from_digimon_id": 148,
    "to_digimon_id": 263,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1200,
      "abi": 80,
      "atk": 140,
      "def": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 838,
    "from_digimon_id": 155,
    "to_digimon_id": 287,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "spd": 160
    },
    "dna_requirement": null
  },
  {
    "id": 840,
    "from_digimon_id": 157,
    "to_digimon_id": 274,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "def": 130,
      "int": 130
    },
    "dna_requirement": null
  },
  {
    "id": 842,
    "from_digimon_id": 159,
    "to_digimon_id": 278,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 160,
      "def": 140
    },
    "dna_requirement": null
  },
  {
    "id": 846,
    "from_digimon_id": 161,
    "to_digimon_id": 267,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1600,
      "abi": 20,
      "atk": 160
    },
    "dna_requirement": null
  },
  {
    "id": 848,
    "from_digimon_id": 161,
    "to_digimon_id": 256,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1000,
      "abi": 20,
      "atk": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 850,
    "from_digimon_id": 162,
    "to_digimon_id": 243,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 40,
      "int": 145,
      "spd": 100
    },
    "dna_requirement": null
  },
  {
    "id": 854,
    "from_digimon_id": 169,
    "to_digimon_id": 260,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1100,
      "abi": 20,
      "atk": 180,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 858,
    "from_digimon_id": 171,
    "to_digimon_id": 247,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 180,
      "spd": 180
    },
    "dna_requirement": null
  },
  {
    "id": 785,
    "from_digimon_id": 99,
    "to_digimon_id": 145,
    "level_required": 26,
    "stat_requirements": {
      "def": 110
    },
    "dna_requirement": null
  },
  {
    "id": 787,
    "from_digimon_id": 101,
    "to_digimon_id": 155,
    "level_required": 30,
    "stat_requirements": {
      "hp": 300,
      "atk": 100,
      "spd": 85
    },
    "dna_requirement": null
  },
  {
    "id": 789,
    "from_digimon_id": 101,
    "to_digimon_id": 147,
    "level_required": 30,
    "stat_requirements": {
      "abi": 10,
      "atk": 70,
      "int": 90
    },
    "dna_requirement": null
  },
  {
    "id": 791,
    "from_digimon_id": 104,
    "to_digimon_id": 173,
    "level_required": 28,
    "stat_requirements": {
      "sp": 70,
      "int": 85
    },
    "dna_requirement": null
  },
  {
    "id": 793,
    "from_digimon_id": 104,
    "to_digimon_id": 200,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "sp": 70,
      "int": 70
    },
    "dna_requirement": null
  },
  {
    "id": 795,
    "from_digimon_id": 109,
    "to_digimon_id": 171,
    "level_required": 30,
    "stat_requirements": {
      "atk": 90,
      "spd": 80
    },
    "dna_requirement": null
  },
  {
    "id": 797,
    "from_digimon_id": 109,
    "to_digimon_id": 215,
    "level_required": 28,
    "stat_requirements": {
      "atk": 90,
      "spd": 85
    },
    "dna_requirement": null
  },
  {
    "id": 799,
    "from_digimon_id": 110,
    "to_digimon_id": 178,
    "level_required": 40,
    "stat_requirements": {
      "hp": 800,
      "atk": 80,
      "def": 80
    },
    "dna_requirement": null
  },
  {
    "id": 862,
    "from_digimon_id": 175,
    "to_digimon_id": 222,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1600,
      "abi": 20,
      "def": 150,
      "spd": 150
    },
    "dna_requirement": null
  },
  {
    "id": 870,
    "from_digimon_id": 186,
    "to_digimon_id": 235,
    "level_required": 45,
    "stat_requirements": {
      "abi": 20,
      "atk": 110,
      "def": 130,
      "spd": 100
    },
    "dna_requirement": null
  },
  {
    "id": 874,
    "from_digimon_id": 189,
    "to_digimon_id": 240,
    "level_required": 50,
    "stat_requirements": {
      "sp": 110,
      "abi": 20,
      "int": 140
    },
    "dna_requirement": null
  },
  {
    "id": 878,
    "from_digimon_id": 190,
    "to_digimon_id": 271,
    "level_required": 60,
    "stat_requirements": {
      "sp": 160,
      "abi": 80,
      "def": 120,
      "int": 200
    },
    "dna_requirement": null
  },
  {
    "id": 882,
    "from_digimon_id": 197,
    "to_digimon_id": 238,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1300,
      "abi": 40,
      "atk": 110,
      "int": 110
    },
    "dna_requirement": null
  },
  {
    "id": 886,
    "from_digimon_id": 226,
    "to_digimon_id": 318,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 155,
      "int": 100
    },
    "dna_requirement": 272
  },
  {
    "id": 890,
    "from_digimon_id": 287,
    "to_digimon_id": 288,
    "level_required": 0,
    "stat_requirements": {},
    "dna_requirement": null
  },
  {
    "id": 801,
    "from_digimon_id": 113,
    "to_digimon_id": 186,
    "level_required": 26,
    "stat_requirements": {
      "atk": 65,
      "def": 65
    },
    "dna_requirement": null
  },
  {
    "id": 803,
    "from_digimon_id": 113,
    "to_digimon_id": 187,
    "level_required": 26,
    "stat_requirements": {
      "hp": 850,
      "atk": 60,
      "int": 60
    },
    "dna_requirement": null
  },
  {
    "id": 805,
    "from_digimon_id": 117,
    "to_digimon_id": 163,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 807,
    "from_digimon_id": 123,
    "to_digimon_id": 155,
    "level_required": 30,
    "stat_requirements": {
      "hp": 300,
      "atk": 100,
      "spd": 85
    },
    "dna_requirement": null
  },
  {
    "id": 809,
    "from_digimon_id": 123,
    "to_digimon_id": 209,
    "level_required": 30,
    "stat_requirements": {
      "hp": 350,
      "atk": 100,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 813,
    "from_digimon_id": 132,
    "to_digimon_id": 180,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 818,
    "from_digimon_id": 134,
    "to_digimon_id": 195,
    "level_required": 30,
    "stat_requirements": {
      "sp": 80,
      "abi": 10,
      "int": 80
    },
    "dna_requirement": null
  },
  {
    "id": 820,
    "from_digimon_id": 135,
    "to_digimon_id": 178,
    "level_required": 40,
    "stat_requirements": {
      "hp": 800,
      "atk": 80,
      "def": 80
    },
    "dna_requirement": null
  },
  {
    "id": 822,
    "from_digimon_id": 135,
    "to_digimon_id": 181,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 892,
    "from_digimon_id": 288,
    "to_digimon_id": 287,
    "level_required": 0,
    "stat_requirements": {},
    "dna_requirement": null
  },
  {
    "id": 881,
    "from_digimon_id": 196,
    "to_digimon_id": 296,
    "level_required": 45,
    "stat_requirements": {
      "sp": 100,
      "abi": 20,
      "atk": 120,
      "def": 140
    },
    "dna_requirement": null
  },
  {
    "id": 883,
    "from_digimon_id": 197,
    "to_digimon_id": 227,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1200,
      "sp": 110,
      "abi": 40,
      "atk": 110,
      "int": 110
    },
    "dna_requirement": null
  },
  {
    "id": 887,
    "from_digimon_id": 231,
    "to_digimon_id": 319,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1000,
      "abi": 100,
      "atk": 150,
      "int": 150
    },
    "dna_requirement": 287
  },
  {
    "id": 889,
    "from_digimon_id": 278,
    "to_digimon_id": 314,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1650,
      "abi": 100,
      "atk": 150,
      "spd": 150
    },
    "dna_requirement": 252
  },
  {
    "id": 930,
    "from_digimon_id": 25,
    "to_digimon_id": 364,
    "level_required": 15,
    "stat_requirements": {
      "atk": 40,
      "spd": 35
    },
    "dna_requirement": null
  },
  {
    "id": 837,
    "from_digimon_id": 149,
    "to_digimon_id": 231,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 150,
      "def": 120
    },
    "dna_requirement": null
  },
  {
    "id": 845,
    "from_digimon_id": 161,
    "to_digimon_id": 264,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 140,
      "def": 120
    },
    "dna_requirement": null
  },
  {
    "id": 849,
    "from_digimon_id": 161,
    "to_digimon_id": 331,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 180
    },
    "dna_requirement": null
  },
  {
    "id": 851,
    "from_digimon_id": 162,
    "to_digimon_id": 251,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "def": 140,
      "int": 120,
      "spd": 150
    },
    "dna_requirement": null
  },
  {
    "id": 853,
    "from_digimon_id": 169,
    "to_digimon_id": 238,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1300,
      "abi": 40,
      "atk": 110,
      "int": 110
    },
    "dna_requirement": null
  },
  {
    "id": 855,
    "from_digimon_id": 169,
    "to_digimon_id": 261,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1600,
      "abi": 80,
      "atk": 230,
      "int": 160
    },
    "dna_requirement": null
  },
  {
    "id": 857,
    "from_digimon_id": 171,
    "to_digimon_id": 225,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "int": 130,
      "spd": 160
    },
    "dna_requirement": null
  },
  {
    "id": 861,
    "from_digimon_id": 173,
    "to_digimon_id": 302,
    "level_required": 60,
    "stat_requirements": {
      "hp": 2000,
      "sp": 140,
      "abi": 80,
      "atk": 140,
      "def": 140,
      "int": 140
    },
    "dna_requirement": null
  },
  {
    "id": 863,
    "from_digimon_id": 175,
    "to_digimon_id": 237,
    "level_required": 45,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 120,
      "def": 120
    },
    "dna_requirement": null
  },
  {
    "id": 865,
    "from_digimon_id": 178,
    "to_digimon_id": 256,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1000,
      "abi": 20,
      "atk": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 867,
    "from_digimon_id": 180,
    "to_digimon_id": 278,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 160,
      "def": 140
    },
    "dna_requirement": null
  },
  {
    "id": 869,
    "from_digimon_id": 180,
    "to_digimon_id": 245,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 145,
      "spd": 120
    },
    "dna_requirement": null
  },
  {
    "id": 871,
    "from_digimon_id": 186,
    "to_digimon_id": 250,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1000,
      "abi": 20,
      "atk": 130,
      "def": 110
    },
    "dna_requirement": null
  },
  {
    "id": 875,
    "from_digimon_id": 189,
    "to_digimon_id": 253,
    "level_required": 55,
    "stat_requirements": {
      "sp": 130,
      "abi": 40,
      "def": 130,
      "int": 150
    },
    "dna_requirement": null
  },
  {
    "id": 891,
    "from_digimon_id": 287,
    "to_digimon_id": 319,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1000,
      "abi": 100,
      "atk": 150,
      "int": 150
    },
    "dna_requirement": 231
  },
  {
    "id": 895,
    "from_digimon_id": 333,
    "to_digimon_id": 335,
    "level_required": 14,
    "stat_requirements": {
      "sp": 40,
      "spd": 50
    },
    "dna_requirement": null
  },
  {
    "id": 899,
    "from_digimon_id": 335,
    "to_digimon_id": 186,
    "level_required": 26,
    "stat_requirements": {
      "atk": 65,
      "def": 65
    },
    "dna_requirement": null
  },
  {
    "id": 902,
    "from_digimon_id": 328,
    "to_digimon_id": 135,
    "level_required": 15,
    "stat_requirements": {
      "hp": 130,
      "atk": 50
    },
    "dna_requirement": null
  },
  {
    "id": 904,
    "from_digimon_id": 329,
    "to_digimon_id": 330,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 906,
    "from_digimon_id": 329,
    "to_digimon_id": 200,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "sp": 70,
      "int": 70
    },
    "dna_requirement": null
  },
  {
    "id": 908,
    "from_digimon_id": 330,
    "to_digimon_id": 230,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 100,
      "spd": 100
    },
    "dna_requirement": null
  },
  {
    "id": 910,
    "from_digimon_id": 330,
    "to_digimon_id": 291,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 150,
      "spd": 140
    },
    "dna_requirement": null
  },
  {
    "id": 784,
    "from_digimon_id": 99,
    "to_digimon_id": 196,
    "level_required": 26,
    "stat_requirements": {
      "atk": 80,
      "def": 75
    },
    "dna_requirement": null
  },
  {
    "id": 788,
    "from_digimon_id": 101,
    "to_digimon_id": 197,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "spd": 80
    },
    "dna_requirement": null
  },
  {
    "id": 792,
    "from_digimon_id": 104,
    "to_digimon_id": 144,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  {
    "id": 796,
    "from_digimon_id": 109,
    "to_digimon_id": 163,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 800,
    "from_digimon_id": 110,
    "to_digimon_id": 190,
    "level_required": 28,
    "stat_requirements": {
      "sp": 80,
      "int": 80
    },
    "dna_requirement": null
  },
  {
    "id": 804,
    "from_digimon_id": 117,
    "to_digimon_id": 143,
    "level_required": 28,
    "stat_requirements": {
      "atk": 65,
      "int": 75,
      "spd": 85
    },
    "dna_requirement": null
  },
  {
    "id": 808,
    "from_digimon_id": 123,
    "to_digimon_id": 171,
    "level_required": 30,
    "stat_requirements": {
      "atk": 90,
      "spd": 80
    },
    "dna_requirement": null
  },
  {
    "id": 810,
    "from_digimon_id": 126,
    "to_digimon_id": 212,
    "level_required": 30,
    "stat_requirements": {
      "int": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 812,
    "from_digimon_id": 126,
    "to_digimon_id": 210,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  {
    "id": 877,
    "from_digimon_id": 190,
    "to_digimon_id": 257,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1400,
      "abi": 20,
      "atk": 150,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 879,
    "from_digimon_id": 196,
    "to_digimon_id": 270,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 135
    },
    "dna_requirement": null
  },
  {
    "id": 814,
    "from_digimon_id": 132,
    "to_digimon_id": 168,
    "level_required": 28,
    "stat_requirements": {
      "atk": 120,
      "def": 85,
      "spd": 70
    },
    "dna_requirement": null
  },
  {
    "id": 816,
    "from_digimon_id": 134,
    "to_digimon_id": 189,
    "level_required": 26,
    "stat_requirements": {
      "sp": 65,
      "int": 65
    },
    "dna_requirement": null
  },
  {
    "id": 817,
    "from_digimon_id": 134,
    "to_digimon_id": 188,
    "level_required": 26,
    "stat_requirements": {
      "sp": 75,
      "int": 80,
      "spd": 80
    },
    "dna_requirement": null
  },
  {
    "id": 821,
    "from_digimon_id": 135,
    "to_digimon_id": 156,
    "level_required": 26,
    "stat_requirements": {
      "hp": 800,
      "atk": 75,
      "def": 95
    },
    "dna_requirement": null
  },
  {
    "id": 825,
    "from_digimon_id": 136,
    "to_digimon_id": 190,
    "level_required": 28,
    "stat_requirements": {
      "sp": 80,
      "int": 80
    },
    "dna_requirement": null
  },
  {
    "id": 829,
    "from_digimon_id": 138,
    "to_digimon_id": 143,
    "level_required": 28,
    "stat_requirements": {
      "atk": 65,
      "int": 75,
      "spd": 85
    },
    "dna_requirement": null
  },
  {
    "id": 833,
    "from_digimon_id": 142,
    "to_digimon_id": 261,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1600,
      "abi": 80,
      "atk": 230,
      "int": 160
    },
    "dna_requirement": null
  },
  {
    "id": 1,
    "from_digimon_id": 1,
    "to_digimon_id": 10,
    "level_required": 5,
    "stat_requirements": {},
    "dna_requirement": null
  },
  {
    "id": 493,
    "from_digimon_id": 144,
    "to_digimon_id": 256,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1000,
      "abi": 20,
      "atk": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 508,
    "from_digimon_id": 150,
    "to_digimon_id": 263,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1200,
      "abi": 80,
      "atk": 140,
      "def": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 513,
    "from_digimon_id": 151,
    "to_digimon_id": 296,
    "level_required": 45,
    "stat_requirements": {
      "sp": 100,
      "abi": 20,
      "atk": 120,
      "def": 140
    },
    "dna_requirement": null
  },
  {
    "id": 514,
    "from_digimon_id": 151,
    "to_digimon_id": 235,
    "level_required": 45,
    "stat_requirements": {
      "abi": 20,
      "atk": 110,
      "def": 130,
      "spd": 100
    },
    "dna_requirement": null
  },
  {
    "id": 515,
    "from_digimon_id": 151,
    "to_digimon_id": 270,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 135
    },
    "dna_requirement": null
  },
  {
    "id": 525,
    "from_digimon_id": 154,
    "to_digimon_id": 304,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "spd": 160
    },
    "dna_requirement": null
  },
  {
    "id": 530,
    "from_digimon_id": 156,
    "to_digimon_id": 299,
    "level_required": 50,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "def": 120,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 532,
    "from_digimon_id": 156,
    "to_digimon_id": 267,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1600,
      "abi": 20,
      "atk": 160
    },
    "dna_requirement": null
  },
  {
    "id": 542,
    "from_digimon_id": 163,
    "to_digimon_id": 250,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1000,
      "abi": 20,
      "atk": 130,
      "def": 110
    },
    "dna_requirement": null
  },
  {
    "id": 547,
    "from_digimon_id": 165,
    "to_digimon_id": 236,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 135,
      "spd": 120
    },
    "dna_requirement": null
  },
  {
    "id": 553,
    "from_digimon_id": 166,
    "to_digimon_id": 225,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "int": 130,
      "spd": 160
    },
    "dna_requirement": null
  },
  {
    "id": 556,
    "from_digimon_id": 167,
    "to_digimon_id": 250,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1000,
      "abi": 20,
      "atk": 130,
      "def": 110
    },
    "dna_requirement": null
  },
  {
    "id": 560,
    "from_digimon_id": 168,
    "to_digimon_id": 261,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1600,
      "abi": 80,
      "atk": 230,
      "int": 160
    },
    "dna_requirement": null
  },
  {
    "id": 570,
    "from_digimon_id": 174,
    "to_digimon_id": 297,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "def": 120,
      "spd": 150
    },
    "dna_requirement": null
  },
  {
    "id": 572,
    "from_digimon_id": 176,
    "to_digimon_id": 283,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1700,
      "sp": 140,
      "abi": 80,
      "int": 180
    },
    "dna_requirement": null
  },
  {
    "id": 575,
    "from_digimon_id": 177,
    "to_digimon_id": 281,
    "level_required": 60,
    "stat_requirements": {
      "hp": 2000,
      "abi": 80,
      "atk": 250,
      "spd": 150
    },
    "dna_requirement": null
  },
  {
    "id": 587,
    "from_digimon_id": 182,
    "to_digimon_id": 264,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 140,
      "def": 120
    },
    "dna_requirement": null
  },
  {
    "id": 931,
    "from_digimon_id": 37,
    "to_digimon_id": 364,
    "level_required": 15,
    "stat_requirements": {
      "atk": 40,
      "spd": 35
    },
    "dna_requirement": null
  },
  {
    "id": 4,
    "from_digimon_id": 2,
    "to_digimon_id": 8,
    "level_required": 5,
    "stat_requirements": {},
    "dna_requirement": null
  },
  {
    "id": 5,
    "from_digimon_id": 2,
    "to_digimon_id": 14,
    "level_required": 3,
    "stat_requirements": {
      "hp": 50
    },
    "dna_requirement": null
  },
  {
    "id": 7,
    "from_digimon_id": 3,
    "to_digimon_id": 9,
    "level_required": 5,
    "stat_requirements": {},
    "dna_requirement": null
  },
  {
    "id": 74,
    "from_digimon_id": 21,
    "to_digimon_id": 70,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  {
    "id": 86,
    "from_digimon_id": 23,
    "to_digimon_id": 85,
    "level_required": 15,
    "stat_requirements": {
      "spd": 50
    },
    "dna_requirement": null
  },
  {
    "id": 118,
    "from_digimon_id": 28,
    "to_digimon_id": 133,
    "level_required": 14,
    "stat_requirements": {
      "hp": 250,
      "atk": 30
    },
    "dna_requirement": null
  },
  {
    "id": 135,
    "from_digimon_id": 31,
    "to_digimon_id": 127,
    "level_required": 20,
    "stat_requirements": {},
    "dna_requirement": null
  },
  {
    "id": 143,
    "from_digimon_id": 33,
    "to_digimon_id": 78,
    "level_required": 14,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  {
    "id": 169,
    "from_digimon_id": 39,
    "to_digimon_id": 325,
    "level_required": 50,
    "stat_requirements": {
      "abi": 40,
      "atk": 100,
      "def": 120,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 190,
    "from_digimon_id": 45,
    "to_digimon_id": 107,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 35
    },
    "dna_requirement": null
  },
  {
    "id": 193,
    "from_digimon_id": 46,
    "to_digimon_id": 77,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 212,
    "from_digimon_id": 49,
    "to_digimon_id": 89,
    "level_required": 16,
    "stat_requirements": {
      "hp": 150,
      "atk": 40
    },
    "dna_requirement": null
  },
  {
    "id": 242,
    "from_digimon_id": 56,
    "to_digimon_id": 67,
    "level_required": 14,
    "stat_requirements": {
      "spd": 55
    },
    "dna_requirement": null
  },
  {
    "id": 243,
    "from_digimon_id": 56,
    "to_digimon_id": 122,
    "level_required": 14,
    "stat_requirements": {
      "hp": 40,
      "int": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 244,
    "from_digimon_id": 56,
    "to_digimon_id": 130,
    "level_required": 14,
    "stat_requirements": {
      "spd": 50
    },
    "dna_requirement": null
  },
  {
    "id": 258,
    "from_digimon_id": 62,
    "to_digimon_id": 117,
    "level_required": 14,
    "stat_requirements": {
      "atk": 45,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 267,
    "from_digimon_id": 64,
    "to_digimon_id": 82,
    "level_required": 14,
    "stat_requirements": {
      "def": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  {
    "id": 295,
    "from_digimon_id": 74,
    "to_digimon_id": 165,
    "level_required": 28,
    "stat_requirements": {
      "hp": 800,
      "def": 70
    },
    "dna_requirement": null
  },
  {
    "id": 331,
    "from_digimon_id": 85,
    "to_digimon_id": 185,
    "level_required": 28,
    "stat_requirements": {
      "hp": 350,
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 375,
    "from_digimon_id": 100,
    "to_digimon_id": 201,
    "level_required": 26,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 376,
    "from_digimon_id": 102,
    "to_digimon_id": 152,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "int": 100
    },
    "dna_requirement": null
  },
  {
    "id": 381,
    "from_digimon_id": 103,
    "to_digimon_id": 200,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "sp": 70,
      "int": 70
    },
    "dna_requirement": null
  },
  {
    "id": 400,
    "from_digimon_id": 111,
    "to_digimon_id": 188,
    "level_required": 26,
    "stat_requirements": {
      "sp": 75,
      "int": 80,
      "spd": 80
    },
    "dna_requirement": null
  },
  {
    "id": 435,
    "from_digimon_id": 122,
    "to_digimon_id": 174,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "spd": 100
    },
    "dna_requirement": null
  },
  {
    "id": 466,
    "from_digimon_id": 131,
    "to_digimon_id": 199,
    "level_required": 26,
    "stat_requirements": {
      "atk": 75,
      "def": 80
    },
    "dna_requirement": null
  },
  {
    "id": 469,
    "from_digimon_id": 133,
    "to_digimon_id": 152,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "int": 100
    },
    "dna_requirement": null
  },
  {
    "id": 488,
    "from_digimon_id": 143,
    "to_digimon_id": 243,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 40,
      "int": 145,
      "spd": 100
    },
    "dna_requirement": null
  },
  {
    "id": 932,
    "from_digimon_id": 364,
    "to_digimon_id": 365,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "spd": 55
    },
    "dna_requirement": null
  },
  {
    "id": 590,
    "from_digimon_id": 183,
    "to_digimon_id": 298,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "def": 135,
      "spd": 125
    },
    "dna_requirement": null
  },
  {
    "id": 618,
    "from_digimon_id": 195,
    "to_digimon_id": 225,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "int": 130,
      "spd": 160
    },
    "dna_requirement": null
  },
  {
    "id": 636,
    "from_digimon_id": 202,
    "to_digimon_id": 232,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 130,
      "def": 130,
      "int": 130
    },
    "dna_requirement": null
  },
  {
    "id": 648,
    "from_digimon_id": 205,
    "to_digimon_id": 276,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1800,
      "abi": 20,
      "atk": 140,
      "def": 140
    },
    "dna_requirement": null
  },
  {
    "id": 660,
    "from_digimon_id": 208,
    "to_digimon_id": 304,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "spd": 160
    },
    "dna_requirement": null
  },
  {
    "id": 666,
    "from_digimon_id": 210,
    "to_digimon_id": 303,
    "level_required": 60,
    "stat_requirements": {
      "sp": 200,
      "abi": 80,
      "int": 250,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 688,
    "from_digimon_id": 217,
    "to_digimon_id": 283,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1700,
      "sp": 140,
      "abi": 80,
      "int": 180
    },
    "dna_requirement": null
  },
  {
    "id": 933,
    "from_digimon_id": 109,
    "to_digimon_id": 365,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "spd": 55
    },
    "dna_requirement": null
  },
  {
    "id": 601,
    "from_digimon_id": 191,
    "to_digimon_id": 275,
    "level_required": 65,
    "stat_requirements": {
      "abi": 10
    },
    "dna_requirement": null
  },
  {
    "id": 635,
    "from_digimon_id": 201,
    "to_digimon_id": 295,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1700,
      "abi": 40,
      "atk": 180
    },
    "dna_requirement": null
  },
  {
    "id": 659,
    "from_digimon_id": 208,
    "to_digimon_id": 291,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 150,
      "spd": 140
    },
    "dna_requirement": null
  },
  {
    "id": 677,
    "from_digimon_id": 214,
    "to_digimon_id": 303,
    "level_required": 60,
    "stat_requirements": {
      "sp": 200,
      "abi": 80,
      "int": 250,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 699,
    "from_digimon_id": 272,
    "to_digimon_id": 317,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 255
    },
    "dna_requirement": 255
  },
  {
    "id": 934,
    "from_digimon_id": 105,
    "to_digimon_id": 365,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "spd": 55
    },
    "dna_requirement": null
  },
  {
    "id": 604,
    "from_digimon_id": 192,
    "to_digimon_id": 261,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1600,
      "abi": 80,
      "atk": 230,
      "int": 160
    },
    "dna_requirement": null
  },
  {
    "id": 615,
    "from_digimon_id": 195,
    "to_digimon_id": 248,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 140,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 704,
    "from_digimon_id": 280,
    "to_digimon_id": 258,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1600,
      "abi": 40,
      "atk": 140,
      "def": 130
    },
    "dna_requirement": null
  },
  {
    "id": 935,
    "from_digimon_id": 363,
    "to_digimon_id": 97,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "def": 25,
      "spd": 40
    },
    "dna_requirement": null
  },
  {
    "id": 634,
    "from_digimon_id": 201,
    "to_digimon_id": 244,
    "level_required": 55,
    "stat_requirements": {
      "abi": 40,
      "atk": 130,
      "def": 120,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 709,
    "from_digimon_id": 294,
    "to_digimon_id": 332,
    "level_required": 99,
    "stat_requirements": {
      "abi": 120
    },
    "dna_requirement": null
  },
  {
    "id": 936,
    "from_digimon_id": 363,
    "to_digimon_id": 81,
    "level_required": 15,
    "stat_requirements": {
      "spd": 55
    },
    "dna_requirement": null
  },
  {
    "id": 649,
    "from_digimon_id": 205,
    "to_digimon_id": 262,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 140,
      "def": 140,
      "int": 140
    },
    "dna_requirement": null
  },
  {
    "id": 937,
    "from_digimon_id": 364,
    "to_digimon_id": 160,
    "level_required": 26,
    "stat_requirements": {
      "hp": 400,
      "atk": 95
    },
    "dna_requirement": null
  },
  {
    "id": 674,
    "from_digimon_id": 212,
    "to_digimon_id": 309,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "int": 170,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 748,
    "from_digimon_id": 58,
    "to_digimon_id": 109,
    "level_required": 15,
    "stat_requirements": {
      "atk": 45,
      "spd": 50
    },
    "dna_requirement": null
  },
  {
    "id": 776,
    "from_digimon_id": 80,
    "to_digimon_id": 325,
    "level_required": 50,
    "stat_requirements": {
      "abi": 40,
      "atk": 100,
      "def": 120,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 783,
    "from_digimon_id": 97,
    "to_digimon_id": 202,
    "level_required": 30,
    "stat_requirements": {
      "atk": 105,
      "spd": 75
    },
    "dna_requirement": null
  },
  {
    "id": 832,
    "from_digimon_id": 142,
    "to_digimon_id": 260,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1100,
      "abi": 20,
      "atk": 180,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 841,
    "from_digimon_id": 157,
    "to_digimon_id": 277,
    "level_required": 45,
    "stat_requirements": {
      "abi": 20,
      "def": 150
    },
    "dna_requirement": null
  },
  {
    "id": 843,
    "from_digimon_id": 159,
    "to_digimon_id": 295,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1700,
      "abi": 40,
      "atk": 180
    },
    "dna_requirement": null
  },
  {
    "id": 844,
    "from_digimon_id": 159,
    "to_digimon_id": 224,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1700,
      "abi": 20,
      "atk": 130,
      "def": 130,
      "int": 120
    },
    "dna_requirement": null
  },
  {
    "id": 859,
    "from_digimon_id": 173,
    "to_digimon_id": 268,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1000,
      "sp": 100,
      "abi": 20,
      "int": 130
    },
    "dna_requirement": null
  },
  {
    "id": 866,
    "from_digimon_id": 178,
    "to_digimon_id": 247,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 180,
      "spd": 180
    },
    "dna_requirement": null
  },
  {
    "id": 872,
    "from_digimon_id": 186,
    "to_digimon_id": 272,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 130
    },
    "dna_requirement": null
  },
  {
    "id": 873,
    "from_digimon_id": 189,
    "to_digimon_id": 226,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 40,
      "int": 145,
      "spd": 130
    },
    "dna_requirement": null
  },
  {
    "id": 885,
    "from_digimon_id": 218,
    "to_digimon_id": 311,
    "level_required": 70,
    "stat_requirements": {
      "sp": 150,
      "abi": 60,
      "atk": 250,
      "int": 150,
      "spd": 160
    },
    "dna_requirement": null
  },
  {
    "id": 894,
    "from_digimon_id": 333,
    "to_digimon_id": 334,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1150,
      "sp": 130,
      "abi": 50,
      "int": 150
    },
    "dna_requirement": null
  },
  {
    "id": 911,
    "from_digimon_id": 331,
    "to_digimon_id": 312,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 180,
      "def": 170,
      "int": 150
    },
    "dna_requirement": 219
  }
],
  byFrom: {
  "1": [
    {
      "id": 2,
      "from_digimon_id": 1,
      "to_digimon_id": 13,
      "level_required": 5,
      "stat_requirements": {},
      "dna_requirement": null
    },
    {
      "id": 3,
      "from_digimon_id": 1,
      "to_digimon_id": 6,
      "level_required": 8,
      "stat_requirements": {
        "abi": 5,
        "atk": 55
      },
      "dna_requirement": null
    },
    {
      "id": 1,
      "from_digimon_id": 1,
      "to_digimon_id": 10,
      "level_required": 5,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "2": [
    {
      "id": 6,
      "from_digimon_id": 2,
      "to_digimon_id": 16,
      "level_required": 3,
      "stat_requirements": {
        "def": 15
      },
      "dna_requirement": null
    },
    {
      "id": 4,
      "from_digimon_id": 2,
      "to_digimon_id": 8,
      "level_required": 5,
      "stat_requirements": {},
      "dna_requirement": null
    },
    {
      "id": 5,
      "from_digimon_id": 2,
      "to_digimon_id": 14,
      "level_required": 3,
      "stat_requirements": {
        "hp": 50
      },
      "dna_requirement": null
    }
  ],
  "3": [
    {
      "id": 8,
      "from_digimon_id": 3,
      "to_digimon_id": 12,
      "level_required": 3,
      "stat_requirements": {
        "int": 10
      },
      "dna_requirement": null
    },
    {
      "id": 7,
      "from_digimon_id": 3,
      "to_digimon_id": 9,
      "level_required": 5,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "4": [
    {
      "id": 9,
      "from_digimon_id": 4,
      "to_digimon_id": 7,
      "level_required": 3,
      "stat_requirements": {
        "atk": 15
      },
      "dna_requirement": null
    },
    {
      "id": 10,
      "from_digimon_id": 4,
      "to_digimon_id": 17,
      "level_required": 5,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "5": [
    {
      "id": 11,
      "from_digimon_id": 5,
      "to_digimon_id": 11,
      "level_required": 5,
      "stat_requirements": {},
      "dna_requirement": null
    },
    {
      "id": 12,
      "from_digimon_id": 5,
      "to_digimon_id": 15,
      "level_required": 3,
      "stat_requirements": {
        "int": 15
      },
      "dna_requirement": null
    }
  ],
  "6": [
    {
      "id": 717,
      "from_digimon_id": 6,
      "to_digimon_id": 20,
      "level_required": 6,
      "stat_requirements": {
        "atk": 90,
        "spd": 20
      },
      "dna_requirement": null
    }
  ],
  "7": [
    {
      "id": 13,
      "from_digimon_id": 7,
      "to_digimon_id": 18,
      "level_required": 9,
      "stat_requirements": {
        "atk": 30
      },
      "dna_requirement": null
    },
    {
      "id": 17,
      "from_digimon_id": 7,
      "to_digimon_id": 43,
      "level_required": 6,
      "stat_requirements": {
        "atk": 50,
        "def": 20
      },
      "dna_requirement": null
    },
    {
      "id": 15,
      "from_digimon_id": 7,
      "to_digimon_id": 41,
      "level_required": 8,
      "stat_requirements": {
        "hp": 75,
        "def": 20
      },
      "dna_requirement": null
    },
    {
      "id": 14,
      "from_digimon_id": 7,
      "to_digimon_id": 29,
      "level_required": 7,
      "stat_requirements": {
        "atk": 30,
        "spd": 20
      },
      "dna_requirement": null
    },
    {
      "id": 16,
      "from_digimon_id": 7,
      "to_digimon_id": 47,
      "level_required": 9,
      "stat_requirements": {
        "abi": 20,
        "atk": 20
      },
      "dna_requirement": null
    },
    {
      "id": 18,
      "from_digimon_id": 7,
      "to_digimon_id": 326,
      "level_required": 8,
      "stat_requirements": {
        "atk": 30,
        "spd": 20
      },
      "dna_requirement": null
    }
  ],
  "8": [
    {
      "id": 21,
      "from_digimon_id": 8,
      "to_digimon_id": 62,
      "level_required": 7,
      "stat_requirements": {
        "atk": 20,
        "int": 20,
        "spd": 20
      },
      "dna_requirement": null
    },
    {
      "id": 19,
      "from_digimon_id": 8,
      "to_digimon_id": 59,
      "level_required": 9,
      "stat_requirements": {
        "hp": 75
      },
      "dna_requirement": null
    },
    {
      "id": 20,
      "from_digimon_id": 8,
      "to_digimon_id": 48,
      "level_required": 8,
      "stat_requirements": {
        "hp": 100
      },
      "dna_requirement": null
    },
    {
      "id": 22,
      "from_digimon_id": 8,
      "to_digimon_id": 52,
      "level_required": 6,
      "stat_requirements": {
        "spd": 30
      },
      "dna_requirement": null
    }
  ],
  "9": [
    {
      "id": 25,
      "from_digimon_id": 9,
      "to_digimon_id": 33,
      "level_required": 7,
      "stat_requirements": {
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 23,
      "from_digimon_id": 9,
      "to_digimon_id": 27,
      "level_required": 7,
      "stat_requirements": {
        "hp": 75,
        "atk": 20,
        "spd": 20
      },
      "dna_requirement": null
    },
    {
      "id": 27,
      "from_digimon_id": 9,
      "to_digimon_id": 36,
      "level_required": 10,
      "stat_requirements": {
        "atk": 20,
        "spd": 20
      },
      "dna_requirement": null
    },
    {
      "id": 24,
      "from_digimon_id": 9,
      "to_digimon_id": 28,
      "level_required": 6,
      "stat_requirements": {
        "hp": 80,
        "atk": 30
      },
      "dna_requirement": null
    },
    {
      "id": 26,
      "from_digimon_id": 9,
      "to_digimon_id": 53,
      "level_required": 6,
      "stat_requirements": {
        "atk": 20,
        "spd": 20
      },
      "dna_requirement": null
    },
    {
      "id": 28,
      "from_digimon_id": 9,
      "to_digimon_id": 58,
      "level_required": 8,
      "stat_requirements": {
        "atk": 35
      },
      "dna_requirement": null
    }
  ],
  "10": [
    {
      "id": 29,
      "from_digimon_id": 10,
      "to_digimon_id": 19,
      "level_required": 8,
      "stat_requirements": {
        "atk": 30
      },
      "dna_requirement": null
    },
    {
      "id": 31,
      "from_digimon_id": 10,
      "to_digimon_id": 49,
      "level_required": 8,
      "stat_requirements": {
        "spd": 30
      },
      "dna_requirement": null
    },
    {
      "id": 30,
      "from_digimon_id": 10,
      "to_digimon_id": 31,
      "level_required": 9,
      "stat_requirements": {
        "atk": 20,
        "spd": 20
      },
      "dna_requirement": null
    },
    {
      "id": 32,
      "from_digimon_id": 10,
      "to_digimon_id": 42,
      "level_required": 8,
      "stat_requirements": {
        "atk": 30,
        "spd": 20
      },
      "dna_requirement": null
    }
  ],
  "11": [
    {
      "id": 34,
      "from_digimon_id": 11,
      "to_digimon_id": 51,
      "level_required": 9,
      "stat_requirements": {
        "spd": 30
      },
      "dna_requirement": null
    },
    {
      "id": 33,
      "from_digimon_id": 11,
      "to_digimon_id": 46,
      "level_required": 7,
      "stat_requirements": {
        "int": 20,
        "spd": 20
      },
      "dna_requirement": null
    },
    {
      "id": 35,
      "from_digimon_id": 11,
      "to_digimon_id": 56,
      "level_required": 7,
      "stat_requirements": {
        "spd": 30
      },
      "dna_requirement": null
    },
    {
      "id": 37,
      "from_digimon_id": 11,
      "to_digimon_id": 333,
      "level_required": 7,
      "stat_requirements": {
        "sp": 20,
        "int": 30
      },
      "dna_requirement": null
    },
    {
      "id": 36,
      "from_digimon_id": 11,
      "to_digimon_id": 60,
      "level_required": 30,
      "stat_requirements": {
        "sp": 80,
        "abi": 80,
        "int": 130
      },
      "dna_requirement": null
    }
  ],
  "12": [
    {
      "id": 38,
      "from_digimon_id": 12,
      "to_digimon_id": 21,
      "level_required": 7,
      "stat_requirements": {
        "hp": 75,
        "def": 20
      },
      "dna_requirement": null
    },
    {
      "id": 39,
      "from_digimon_id": 12,
      "to_digimon_id": 39,
      "level_required": 8,
      "stat_requirements": {
        "spd": 30
      },
      "dna_requirement": null
    },
    {
      "id": 41,
      "from_digimon_id": 12,
      "to_digimon_id": 61,
      "level_required": 8,
      "stat_requirements": {
        "sp": 30,
        "int": 20
      },
      "dna_requirement": null
    },
    {
      "id": 40,
      "from_digimon_id": 12,
      "to_digimon_id": 54,
      "level_required": 7,
      "stat_requirements": {
        "sp": 20,
        "int": 20
      },
      "dna_requirement": null
    }
  ],
  "13": [
    {
      "id": 42,
      "from_digimon_id": 13,
      "to_digimon_id": 22,
      "level_required": 7,
      "stat_requirements": {
        "sp": 20,
        "int": 30
      },
      "dna_requirement": null
    },
    {
      "id": 43,
      "from_digimon_id": 13,
      "to_digimon_id": 26,
      "level_required": 9,
      "stat_requirements": {
        "atk": 15,
        "spd": 20
      },
      "dna_requirement": null
    },
    {
      "id": 45,
      "from_digimon_id": 13,
      "to_digimon_id": 38,
      "level_required": 6,
      "stat_requirements": {
        "spd": 30
      },
      "dna_requirement": null
    },
    {
      "id": 44,
      "from_digimon_id": 13,
      "to_digimon_id": 63,
      "level_required": 8,
      "stat_requirements": {
        "atk": 15,
        "int": 20
      },
      "dna_requirement": null
    }
  ],
  "14": [
    {
      "id": 46,
      "from_digimon_id": 14,
      "to_digimon_id": 23,
      "level_required": 7,
      "stat_requirements": {
        "hp": 75,
        "sp": 20,
        "spd": 20
      },
      "dna_requirement": null
    },
    {
      "id": 47,
      "from_digimon_id": 14,
      "to_digimon_id": 50,
      "level_required": 8,
      "stat_requirements": {
        "int": 20,
        "spd": 20
      },
      "dna_requirement": null
    },
    {
      "id": 49,
      "from_digimon_id": 14,
      "to_digimon_id": 57,
      "level_required": 8,
      "stat_requirements": {
        "hp": 75,
        "def": 10
      },
      "dna_requirement": null
    },
    {
      "id": 48,
      "from_digimon_id": 14,
      "to_digimon_id": 64,
      "level_required": 8,
      "stat_requirements": {
        "def": 20
      },
      "dna_requirement": null
    }
  ],
  "15": [
    {
      "id": 50,
      "from_digimon_id": 15,
      "to_digimon_id": 24,
      "level_required": 7,
      "stat_requirements": {
        "int": 20
      },
      "dna_requirement": null
    },
    {
      "id": 51,
      "from_digimon_id": 15,
      "to_digimon_id": 34,
      "level_required": 8,
      "stat_requirements": {
        "hp": 100
      },
      "dna_requirement": null
    },
    {
      "id": 53,
      "from_digimon_id": 15,
      "to_digimon_id": 55,
      "level_required": 8,
      "stat_requirements": {
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 52,
      "from_digimon_id": 15,
      "to_digimon_id": 35,
      "level_required": 7,
      "stat_requirements": {
        "def": 15,
        "int": 20
      },
      "dna_requirement": null
    },
    {
      "id": 928,
      "from_digimon_id": 15,
      "to_digimon_id": 363,
      "level_required": 8,
      "stat_requirements": {
        "hp": 75,
        "atk": 20
      },
      "dna_requirement": null
    }
  ],
  "16": [
    {
      "id": 54,
      "from_digimon_id": 16,
      "to_digimon_id": 32,
      "level_required": 8,
      "stat_requirements": {
        "def": 30
      },
      "dna_requirement": null
    },
    {
      "id": 55,
      "from_digimon_id": 16,
      "to_digimon_id": 37,
      "level_required": 6,
      "stat_requirements": {
        "hp": 75,
        "def": 25
      },
      "dna_requirement": null
    },
    {
      "id": 57,
      "from_digimon_id": 16,
      "to_digimon_id": 45,
      "level_required": 7,
      "stat_requirements": {
        "hp": 75,
        "def": 30
      },
      "dna_requirement": null
    },
    {
      "id": 56,
      "from_digimon_id": 16,
      "to_digimon_id": 40,
      "level_required": 9,
      "stat_requirements": {
        "def": 20
      },
      "dna_requirement": null
    }
  ],
  "17": [
    {
      "id": 58,
      "from_digimon_id": 17,
      "to_digimon_id": 25,
      "level_required": 9,
      "stat_requirements": {
        "atk": 20,
        "spd": 20
      },
      "dna_requirement": null
    },
    {
      "id": 59,
      "from_digimon_id": 17,
      "to_digimon_id": 30,
      "level_required": 8,
      "stat_requirements": {
        "sp": 20,
        "int": 20
      },
      "dna_requirement": null
    },
    {
      "id": 61,
      "from_digimon_id": 17,
      "to_digimon_id": 328,
      "level_required": 8,
      "stat_requirements": {
        "atk": 30,
        "def": 30
      },
      "dna_requirement": null
    },
    {
      "id": 60,
      "from_digimon_id": 17,
      "to_digimon_id": 44,
      "level_required": 8,
      "stat_requirements": {
        "atk": 20,
        "spd": 30
      },
      "dna_requirement": null
    }
  ],
  "18": [
    {
      "id": 62,
      "from_digimon_id": 18,
      "to_digimon_id": 90,
      "level_required": 16,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    },
    {
      "id": 66,
      "from_digimon_id": 18,
      "to_digimon_id": 131,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 63,
      "from_digimon_id": 18,
      "to_digimon_id": 105,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "atk": 50
      },
      "dna_requirement": null
    },
    {
      "id": 65,
      "from_digimon_id": 18,
      "to_digimon_id": 114,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 67,
      "from_digimon_id": 18,
      "to_digimon_id": 68,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "atk": 50
      },
      "dna_requirement": null
    },
    {
      "id": 64,
      "from_digimon_id": 18,
      "to_digimon_id": 106,
      "level_required": 12,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    }
  ],
  "19": [
    {
      "id": 70,
      "from_digimon_id": 19,
      "to_digimon_id": 100,
      "level_required": 14,
      "stat_requirements": {
        "atk": 30,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 69,
      "from_digimon_id": 19,
      "to_digimon_id": 91,
      "level_required": 16,
      "stat_requirements": {
        "hp": 150,
        "atk": 50
      },
      "dna_requirement": null
    },
    {
      "id": 71,
      "from_digimon_id": 19,
      "to_digimon_id": 112,
      "level_required": 14,
      "stat_requirements": {
        "def": 55
      },
      "dna_requirement": null
    },
    {
      "id": 73,
      "from_digimon_id": 19,
      "to_digimon_id": 132,
      "level_required": 14,
      "stat_requirements": {
        "atk": 55,
        "def": 55
      },
      "dna_requirement": null
    },
    {
      "id": 68,
      "from_digimon_id": 19,
      "to_digimon_id": 88,
      "level_required": 15,
      "stat_requirements": {
        "atk": 50,
        "spd": 20
      },
      "dna_requirement": null
    },
    {
      "id": 72,
      "from_digimon_id": 19,
      "to_digimon_id": 114,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "atk": 40
      },
      "dna_requirement": null
    }
  ],
  "20": [
    {
      "id": 720,
      "from_digimon_id": 20,
      "to_digimon_id": 137,
      "level_required": 16,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    },
    {
      "id": 719,
      "from_digimon_id": 20,
      "to_digimon_id": 89,
      "level_required": 16,
      "stat_requirements": {
        "hp": 150,
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 718,
      "from_digimon_id": 20,
      "to_digimon_id": 69,
      "level_required": 16,
      "stat_requirements": {
        "atk": 50,
        "int": 40
      },
      "dna_requirement": null
    }
  ],
  "21": [
    {
      "id": 75,
      "from_digimon_id": 21,
      "to_digimon_id": 95,
      "level_required": 12,
      "stat_requirements": {
        "hp": 130,
        "sp": 25,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 79,
      "from_digimon_id": 21,
      "to_digimon_id": 99,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 60
      },
      "dna_requirement": null
    },
    {
      "id": 77,
      "from_digimon_id": 21,
      "to_digimon_id": 100,
      "level_required": 14,
      "stat_requirements": {
        "atk": 30,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 76,
      "from_digimon_id": 21,
      "to_digimon_id": 98,
      "level_required": 18,
      "stat_requirements": {
        "abi": 5
      },
      "dna_requirement": null
    },
    {
      "id": 78,
      "from_digimon_id": 21,
      "to_digimon_id": 112,
      "level_required": 14,
      "stat_requirements": {
        "def": 55
      },
      "dna_requirement": null
    },
    {
      "id": 74,
      "from_digimon_id": 21,
      "to_digimon_id": 70,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    }
  ],
  "22": [
    {
      "id": 83,
      "from_digimon_id": 22,
      "to_digimon_id": 111,
      "level_required": 16,
      "stat_requirements": {
        "sp": 40,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 81,
      "from_digimon_id": 22,
      "to_digimon_id": 72,
      "level_required": 14,
      "stat_requirements": {
        "sp": 35,
        "int": 55
      },
      "dna_requirement": null
    },
    {
      "id": 84,
      "from_digimon_id": 22,
      "to_digimon_id": 124,
      "level_required": 13,
      "stat_requirements": {
        "sp": 40,
        "int": 30
      },
      "dna_requirement": null
    },
    {
      "id": 80,
      "from_digimon_id": 22,
      "to_digimon_id": 65,
      "level_required": 15,
      "stat_requirements": {
        "atk": 40,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 82,
      "from_digimon_id": 22,
      "to_digimon_id": 78,
      "level_required": 14,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    },
    {
      "id": 85,
      "from_digimon_id": 22,
      "to_digimon_id": 128,
      "level_required": 16,
      "stat_requirements": {
        "int": 40
      },
      "dna_requirement": null
    }
  ],
  "23": [
    {
      "id": 87,
      "from_digimon_id": 23,
      "to_digimon_id": 86,
      "level_required": 15,
      "stat_requirements": {
        "atk": 35,
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 91,
      "from_digimon_id": 23,
      "to_digimon_id": 137,
      "level_required": 16,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    },
    {
      "id": 88,
      "from_digimon_id": 23,
      "to_digimon_id": 95,
      "level_required": 12,
      "stat_requirements": {
        "hp": 130,
        "sp": 25,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 90,
      "from_digimon_id": 23,
      "to_digimon_id": 120,
      "level_required": 12,
      "stat_requirements": {
        "atk": 40,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 89,
      "from_digimon_id": 23,
      "to_digimon_id": 106,
      "level_required": 12,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 86,
      "from_digimon_id": 23,
      "to_digimon_id": 85,
      "level_required": 15,
      "stat_requirements": {
        "spd": 50
      },
      "dna_requirement": null
    }
  ],
  "24": [
    {
      "id": 95,
      "from_digimon_id": 24,
      "to_digimon_id": 121,
      "level_required": 12,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 96,
      "from_digimon_id": 24,
      "to_digimon_id": 104,
      "level_required": 14,
      "stat_requirements": {
        "hp": 300,
        "spd": 30
      },
      "dna_requirement": null
    },
    {
      "id": 92,
      "from_digimon_id": 24,
      "to_digimon_id": 83,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 55
      },
      "dna_requirement": null
    },
    {
      "id": 94,
      "from_digimon_id": 24,
      "to_digimon_id": 103,
      "level_required": 14,
      "stat_requirements": {
        "def": 30,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 93,
      "from_digimon_id": 24,
      "to_digimon_id": 94,
      "level_required": 14,
      "stat_requirements": {
        "sp": 40,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 97,
      "from_digimon_id": 24,
      "to_digimon_id": 136,
      "level_required": 12,
      "stat_requirements": {
        "hp": 500
      },
      "dna_requirement": null
    }
  ],
  "25": [
    {
      "id": 99,
      "from_digimon_id": 25,
      "to_digimon_id": 81,
      "level_required": 15,
      "stat_requirements": {
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 103,
      "from_digimon_id": 25,
      "to_digimon_id": 101,
      "level_required": 15,
      "stat_requirements": {
        "atk": 50,
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 98,
      "from_digimon_id": 25,
      "to_digimon_id": 78,
      "level_required": 14,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    },
    {
      "id": 100,
      "from_digimon_id": 25,
      "to_digimon_id": 84,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 102,
      "from_digimon_id": 25,
      "to_digimon_id": 137,
      "level_required": 16,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    },
    {
      "id": 101,
      "from_digimon_id": 25,
      "to_digimon_id": 118,
      "level_required": 16,
      "stat_requirements": {
        "hp": 300,
        "def": 30
      },
      "dna_requirement": null
    },
    {
      "id": 930,
      "from_digimon_id": 25,
      "to_digimon_id": 364,
      "level_required": 15,
      "stat_requirements": {
        "atk": 40,
        "spd": 35
      },
      "dna_requirement": null
    }
  ],
  "26": [
    {
      "id": 107,
      "from_digimon_id": 26,
      "to_digimon_id": 119,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 104,
      "from_digimon_id": 26,
      "to_digimon_id": 81,
      "level_required": 15,
      "stat_requirements": {
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 106,
      "from_digimon_id": 26,
      "to_digimon_id": 89,
      "level_required": 16,
      "stat_requirements": {
        "hp": 150,
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 108,
      "from_digimon_id": 26,
      "to_digimon_id": 120,
      "level_required": 12,
      "stat_requirements": {
        "atk": 40,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 105,
      "from_digimon_id": 26,
      "to_digimon_id": 86,
      "level_required": 15,
      "stat_requirements": {
        "atk": 35,
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 109,
      "from_digimon_id": 26,
      "to_digimon_id": 137,
      "level_required": 16,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    }
  ],
  "27": [
    {
      "id": 111,
      "from_digimon_id": 27,
      "to_digimon_id": 119,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 110,
      "from_digimon_id": 27,
      "to_digimon_id": 85,
      "level_required": 15,
      "stat_requirements": {
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 112,
      "from_digimon_id": 27,
      "to_digimon_id": 121,
      "level_required": 12,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 114,
      "from_digimon_id": 27,
      "to_digimon_id": 133,
      "level_required": 14,
      "stat_requirements": {
        "hp": 250,
        "atk": 30
      },
      "dna_requirement": null
    },
    {
      "id": 113,
      "from_digimon_id": 27,
      "to_digimon_id": 125,
      "level_required": 16,
      "stat_requirements": {
        "atk": 40,
        "spd": 35
      },
      "dna_requirement": null
    },
    {
      "id": 115,
      "from_digimon_id": 27,
      "to_digimon_id": 73,
      "level_required": 15,
      "stat_requirements": {
        "hp": 45,
        "spd": 55
      },
      "dna_requirement": null
    }
  ],
  "28": [
    {
      "id": 116,
      "from_digimon_id": 28,
      "to_digimon_id": 86,
      "level_required": 15,
      "stat_requirements": {
        "atk": 35,
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 120,
      "from_digimon_id": 28,
      "to_digimon_id": 136,
      "level_required": 12,
      "stat_requirements": {
        "hp": 500
      },
      "dna_requirement": null
    },
    {
      "id": 117,
      "from_digimon_id": 28,
      "to_digimon_id": 129,
      "level_required": 12,
      "stat_requirements": {
        "hp": 300
      },
      "dna_requirement": null
    },
    {
      "id": 119,
      "from_digimon_id": 28,
      "to_digimon_id": 139,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 118,
      "from_digimon_id": 28,
      "to_digimon_id": 133,
      "level_required": 14,
      "stat_requirements": {
        "hp": 250,
        "atk": 30
      },
      "dna_requirement": null
    }
  ],
  "29": [
    {
      "id": 124,
      "from_digimon_id": 29,
      "to_digimon_id": 114,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 123,
      "from_digimon_id": 29,
      "to_digimon_id": 91,
      "level_required": 16,
      "stat_requirements": {
        "hp": 150,
        "atk": 50
      },
      "dna_requirement": null
    },
    {
      "id": 125,
      "from_digimon_id": 29,
      "to_digimon_id": 131,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 121,
      "from_digimon_id": 29,
      "to_digimon_id": 105,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "atk": 50
      },
      "dna_requirement": null
    },
    {
      "id": 122,
      "from_digimon_id": 29,
      "to_digimon_id": 88,
      "level_required": 15,
      "stat_requirements": {
        "atk": 50,
        "spd": 20
      },
      "dna_requirement": null
    },
    {
      "id": 126,
      "from_digimon_id": 29,
      "to_digimon_id": 68,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "atk": 50
      },
      "dna_requirement": null
    }
  ],
  "30": [
    {
      "id": 128,
      "from_digimon_id": 30,
      "to_digimon_id": 98,
      "level_required": 18,
      "stat_requirements": {
        "abi": 5
      },
      "dna_requirement": null
    },
    {
      "id": 127,
      "from_digimon_id": 30,
      "to_digimon_id": 77,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 129,
      "from_digimon_id": 30,
      "to_digimon_id": 130,
      "level_required": 14,
      "stat_requirements": {
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 131,
      "from_digimon_id": 30,
      "to_digimon_id": 73,
      "level_required": 15,
      "stat_requirements": {
        "hp": 45,
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 130,
      "from_digimon_id": 30,
      "to_digimon_id": 139,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "spd": 40
      },
      "dna_requirement": null
    }
  ],
  "31": [
    {
      "id": 132,
      "from_digimon_id": 31,
      "to_digimon_id": 72,
      "level_required": 14,
      "stat_requirements": {
        "sp": 35,
        "int": 55
      },
      "dna_requirement": null
    },
    {
      "id": 136,
      "from_digimon_id": 31,
      "to_digimon_id": 69,
      "level_required": 16,
      "stat_requirements": {
        "atk": 50,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 133,
      "from_digimon_id": 31,
      "to_digimon_id": 89,
      "level_required": 16,
      "stat_requirements": {
        "hp": 150,
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 134,
      "from_digimon_id": 31,
      "to_digimon_id": 124,
      "level_required": 13,
      "stat_requirements": {
        "sp": 40,
        "int": 30
      },
      "dna_requirement": null
    },
    {
      "id": 135,
      "from_digimon_id": 31,
      "to_digimon_id": 127,
      "level_required": 20,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "32": [
    {
      "id": 140,
      "from_digimon_id": 32,
      "to_digimon_id": 112,
      "level_required": 14,
      "stat_requirements": {
        "def": 55
      },
      "dna_requirement": null
    },
    {
      "id": 137,
      "from_digimon_id": 32,
      "to_digimon_id": 70,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 139,
      "from_digimon_id": 32,
      "to_digimon_id": 107,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 35
      },
      "dna_requirement": null
    },
    {
      "id": 141,
      "from_digimon_id": 32,
      "to_digimon_id": 66,
      "level_required": 15,
      "stat_requirements": {
        "hp": 110,
        "def": 50
      },
      "dna_requirement": null
    },
    {
      "id": 138,
      "from_digimon_id": 32,
      "to_digimon_id": 92,
      "level_required": 14,
      "stat_requirements": {
        "int": 35
      },
      "dna_requirement": null
    },
    {
      "id": 142,
      "from_digimon_id": 32,
      "to_digimon_id": 99,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 60
      },
      "dna_requirement": null
    }
  ],
  "33": [
    {
      "id": 144,
      "from_digimon_id": 33,
      "to_digimon_id": 81,
      "level_required": 15,
      "stat_requirements": {
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 148,
      "from_digimon_id": 33,
      "to_digimon_id": 97,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "def": 25,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 146,
      "from_digimon_id": 33,
      "to_digimon_id": 91,
      "level_required": 16,
      "stat_requirements": {
        "hp": 150,
        "atk": 50
      },
      "dna_requirement": null
    },
    {
      "id": 145,
      "from_digimon_id": 33,
      "to_digimon_id": 88,
      "level_required": 15,
      "stat_requirements": {
        "atk": 50,
        "spd": 20
      },
      "dna_requirement": null
    },
    {
      "id": 147,
      "from_digimon_id": 33,
      "to_digimon_id": 120,
      "level_required": 12,
      "stat_requirements": {
        "atk": 40,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 143,
      "from_digimon_id": 33,
      "to_digimon_id": 78,
      "level_required": 14,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    }
  ],
  "34": [
    {
      "id": 152,
      "from_digimon_id": 34,
      "to_digimon_id": 133,
      "level_required": 14,
      "stat_requirements": {
        "hp": 250,
        "atk": 30
      },
      "dna_requirement": null
    },
    {
      "id": 150,
      "from_digimon_id": 34,
      "to_digimon_id": 71,
      "level_required": 15,
      "stat_requirements": {
        "hp": 300
      },
      "dna_requirement": null
    },
    {
      "id": 154,
      "from_digimon_id": 34,
      "to_digimon_id": 109,
      "level_required": 15,
      "stat_requirements": {
        "atk": 45,
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 149,
      "from_digimon_id": 34,
      "to_digimon_id": 70,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 151,
      "from_digimon_id": 34,
      "to_digimon_id": 111,
      "level_required": 16,
      "stat_requirements": {
        "sp": 40,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 153,
      "from_digimon_id": 34,
      "to_digimon_id": 66,
      "level_required": 15,
      "stat_requirements": {
        "hp": 110,
        "def": 50
      },
      "dna_requirement": null
    }
  ],
  "35": [
    {
      "id": 157,
      "from_digimon_id": 35,
      "to_digimon_id": 94,
      "level_required": 14,
      "stat_requirements": {
        "sp": 40,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 156,
      "from_digimon_id": 35,
      "to_digimon_id": 83,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 55
      },
      "dna_requirement": null
    },
    {
      "id": 158,
      "from_digimon_id": 35,
      "to_digimon_id": 103,
      "level_required": 14,
      "stat_requirements": {
        "def": 30,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 155,
      "from_digimon_id": 35,
      "to_digimon_id": 71,
      "level_required": 15,
      "stat_requirements": {
        "hp": 300
      },
      "dna_requirement": null
    },
    {
      "id": 159,
      "from_digimon_id": 35,
      "to_digimon_id": 104,
      "level_required": 14,
      "stat_requirements": {
        "hp": 300,
        "spd": 30
      },
      "dna_requirement": null
    }
  ],
  "36": [
    {
      "id": 724,
      "from_digimon_id": 36,
      "to_digimon_id": 329,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 721,
      "from_digimon_id": 36,
      "to_digimon_id": 110,
      "level_required": 20,
      "stat_requirements": {
        "atk": 50,
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 723,
      "from_digimon_id": 36,
      "to_digimon_id": 98,
      "level_required": 18,
      "stat_requirements": {
        "abi": 5
      },
      "dna_requirement": null
    },
    {
      "id": 722,
      "from_digimon_id": 36,
      "to_digimon_id": 123,
      "level_required": 16,
      "stat_requirements": {
        "atk": 55,
        "spd": 50
      },
      "dna_requirement": null
    }
  ],
  "37": [
    {
      "id": 161,
      "from_digimon_id": 37,
      "to_digimon_id": 95,
      "level_required": 12,
      "stat_requirements": {
        "hp": 130,
        "sp": 25,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 165,
      "from_digimon_id": 37,
      "to_digimon_id": 99,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 60
      },
      "dna_requirement": null
    },
    {
      "id": 163,
      "from_digimon_id": 37,
      "to_digimon_id": 131,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 160,
      "from_digimon_id": 37,
      "to_digimon_id": 92,
      "level_required": 14,
      "stat_requirements": {
        "int": 35
      },
      "dna_requirement": null
    },
    {
      "id": 162,
      "from_digimon_id": 37,
      "to_digimon_id": 107,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 35
      },
      "dna_requirement": null
    },
    {
      "id": 164,
      "from_digimon_id": 37,
      "to_digimon_id": 80,
      "level_required": 14,
      "stat_requirements": {
        "hp": 130,
        "def": 60
      },
      "dna_requirement": null
    },
    {
      "id": 931,
      "from_digimon_id": 37,
      "to_digimon_id": 364,
      "level_required": 15,
      "stat_requirements": {
        "atk": 40,
        "spd": 35
      },
      "dna_requirement": null
    }
  ],
  "38": [
    {
      "id": 728,
      "from_digimon_id": 38,
      "to_digimon_id": 128,
      "level_required": 16,
      "stat_requirements": {
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 727,
      "from_digimon_id": 38,
      "to_digimon_id": 120,
      "level_required": 12,
      "stat_requirements": {
        "atk": 40,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 725,
      "from_digimon_id": 38,
      "to_digimon_id": 136,
      "level_required": 12,
      "stat_requirements": {
        "hp": 500
      },
      "dna_requirement": null
    },
    {
      "id": 726,
      "from_digimon_id": 38,
      "to_digimon_id": 106,
      "level_required": 12,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    }
  ],
  "39": [
    {
      "id": 167,
      "from_digimon_id": 39,
      "to_digimon_id": 71,
      "level_required": 15,
      "stat_requirements": {
        "hp": 300
      },
      "dna_requirement": null
    },
    {
      "id": 166,
      "from_digimon_id": 39,
      "to_digimon_id": 84,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 168,
      "from_digimon_id": 39,
      "to_digimon_id": 115,
      "level_required": 16,
      "stat_requirements": {
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 170,
      "from_digimon_id": 39,
      "to_digimon_id": 134,
      "level_required": 13,
      "stat_requirements": {
        "int": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 169,
      "from_digimon_id": 39,
      "to_digimon_id": 325,
      "level_required": 50,
      "stat_requirements": {
        "abi": 40,
        "atk": 100,
        "def": 120,
        "int": 120
      },
      "dna_requirement": null
    }
  ],
  "40": [
    {
      "id": 173,
      "from_digimon_id": 40,
      "to_digimon_id": 102,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 171,
      "from_digimon_id": 40,
      "to_digimon_id": 82,
      "level_required": 14,
      "stat_requirements": {
        "def": 40,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 175,
      "from_digimon_id": 40,
      "to_digimon_id": 140,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 172,
      "from_digimon_id": 40,
      "to_digimon_id": 93,
      "level_required": 14,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    },
    {
      "id": 174,
      "from_digimon_id": 40,
      "to_digimon_id": 108,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 55
      },
      "dna_requirement": null
    }
  ],
  "41": [
    {
      "id": 177,
      "from_digimon_id": 41,
      "to_digimon_id": 79,
      "level_required": 14,
      "stat_requirements": {
        "def": 55
      },
      "dna_requirement": null
    },
    {
      "id": 181,
      "from_digimon_id": 41,
      "to_digimon_id": 80,
      "level_required": 14,
      "stat_requirements": {
        "hp": 130,
        "def": 60
      },
      "dna_requirement": null
    },
    {
      "id": 179,
      "from_digimon_id": 41,
      "to_digimon_id": 106,
      "level_required": 12,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 176,
      "from_digimon_id": 41,
      "to_digimon_id": 92,
      "level_required": 14,
      "stat_requirements": {
        "int": 35
      },
      "dna_requirement": null
    },
    {
      "id": 178,
      "from_digimon_id": 41,
      "to_digimon_id": 90,
      "level_required": 16,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    },
    {
      "id": 180,
      "from_digimon_id": 41,
      "to_digimon_id": 107,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 35
      },
      "dna_requirement": null
    }
  ],
  "42": [
    {
      "id": 732,
      "from_digimon_id": 42,
      "to_digimon_id": 335,
      "level_required": 14,
      "stat_requirements": {
        "sp": 40,
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 729,
      "from_digimon_id": 42,
      "to_digimon_id": 69,
      "level_required": 16,
      "stat_requirements": {
        "atk": 50,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 731,
      "from_digimon_id": 42,
      "to_digimon_id": 136,
      "level_required": 12,
      "stat_requirements": {
        "hp": 500
      },
      "dna_requirement": null
    },
    {
      "id": 733,
      "from_digimon_id": 42,
      "to_digimon_id": 116,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 730,
      "from_digimon_id": 42,
      "to_digimon_id": 101,
      "level_required": 15,
      "stat_requirements": {
        "atk": 50,
        "spd": 55
      },
      "dna_requirement": null
    }
  ],
  "43": [
    {
      "id": 737,
      "from_digimon_id": 43,
      "to_digimon_id": 329,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 736,
      "from_digimon_id": 43,
      "to_digimon_id": 125,
      "level_required": 16,
      "stat_requirements": {
        "atk": 40,
        "spd": 35
      },
      "dna_requirement": null
    },
    {
      "id": 734,
      "from_digimon_id": 43,
      "to_digimon_id": 96,
      "level_required": 14,
      "stat_requirements": {
        "atk": 60,
        "spd": 25
      },
      "dna_requirement": null
    },
    {
      "id": 735,
      "from_digimon_id": 43,
      "to_digimon_id": 97,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "def": 25,
        "spd": 40
      },
      "dna_requirement": null
    }
  ],
  "44": [
    {
      "id": 185,
      "from_digimon_id": 44,
      "to_digimon_id": 140,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 183,
      "from_digimon_id": 44,
      "to_digimon_id": 100,
      "level_required": 14,
      "stat_requirements": {
        "atk": 30,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 182,
      "from_digimon_id": 44,
      "to_digimon_id": 79,
      "level_required": 14,
      "stat_requirements": {
        "def": 55
      },
      "dna_requirement": null
    },
    {
      "id": 184,
      "from_digimon_id": 44,
      "to_digimon_id": 119,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 186,
      "from_digimon_id": 44,
      "to_digimon_id": 135,
      "level_required": 15,
      "stat_requirements": {
        "hp": 130,
        "atk": 50
      },
      "dna_requirement": null
    }
  ],
  "45": [
    {
      "id": 187,
      "from_digimon_id": 45,
      "to_digimon_id": 79,
      "level_required": 14,
      "stat_requirements": {
        "def": 55
      },
      "dna_requirement": null
    },
    {
      "id": 189,
      "from_digimon_id": 45,
      "to_digimon_id": 98,
      "level_required": 18,
      "stat_requirements": {
        "abi": 5
      },
      "dna_requirement": null
    },
    {
      "id": 191,
      "from_digimon_id": 45,
      "to_digimon_id": 127,
      "level_required": 20,
      "stat_requirements": {},
      "dna_requirement": null
    },
    {
      "id": 188,
      "from_digimon_id": 45,
      "to_digimon_id": 92,
      "level_required": 14,
      "stat_requirements": {
        "int": 35
      },
      "dna_requirement": null
    },
    {
      "id": 190,
      "from_digimon_id": 45,
      "to_digimon_id": 107,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 35
      },
      "dna_requirement": null
    }
  ],
  "46": [
    {
      "id": 194,
      "from_digimon_id": 46,
      "to_digimon_id": 115,
      "level_required": 16,
      "stat_requirements": {
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 195,
      "from_digimon_id": 46,
      "to_digimon_id": 122,
      "level_required": 14,
      "stat_requirements": {
        "hp": 40,
        "int": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 197,
      "from_digimon_id": 46,
      "to_digimon_id": 134,
      "level_required": 13,
      "stat_requirements": {
        "int": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 192,
      "from_digimon_id": 46,
      "to_digimon_id": 76,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 196,
      "from_digimon_id": 46,
      "to_digimon_id": 139,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 193,
      "from_digimon_id": 46,
      "to_digimon_id": 77,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "int": 40
      },
      "dna_requirement": null
    }
  ],
  "47": [
    {
      "id": 198,
      "from_digimon_id": 47,
      "to_digimon_id": 90,
      "level_required": 16,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    },
    {
      "id": 202,
      "from_digimon_id": 47,
      "to_digimon_id": 123,
      "level_required": 16,
      "stat_requirements": {
        "atk": 55,
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 199,
      "from_digimon_id": 47,
      "to_digimon_id": 105,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "atk": 50
      },
      "dna_requirement": null
    },
    {
      "id": 201,
      "from_digimon_id": 47,
      "to_digimon_id": 110,
      "level_required": 20,
      "stat_requirements": {
        "atk": 50,
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 203,
      "from_digimon_id": 47,
      "to_digimon_id": 132,
      "level_required": 14,
      "stat_requirements": {
        "atk": 55,
        "def": 55
      },
      "dna_requirement": null
    },
    {
      "id": 200,
      "from_digimon_id": 47,
      "to_digimon_id": 127,
      "level_required": 20,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "48": [
    {
      "id": 206,
      "from_digimon_id": 48,
      "to_digimon_id": 102,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 205,
      "from_digimon_id": 48,
      "to_digimon_id": 93,
      "level_required": 14,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    },
    {
      "id": 207,
      "from_digimon_id": 48,
      "to_digimon_id": 118,
      "level_required": 16,
      "stat_requirements": {
        "hp": 300,
        "def": 30
      },
      "dna_requirement": null
    },
    {
      "id": 209,
      "from_digimon_id": 48,
      "to_digimon_id": 113,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 204,
      "from_digimon_id": 48,
      "to_digimon_id": 74,
      "level_required": 14,
      "stat_requirements": {
        "hp": 500
      },
      "dna_requirement": null
    },
    {
      "id": 208,
      "from_digimon_id": 48,
      "to_digimon_id": 129,
      "level_required": 12,
      "stat_requirements": {
        "hp": 300
      },
      "dna_requirement": null
    }
  ],
  "49": [
    {
      "id": 210,
      "from_digimon_id": 49,
      "to_digimon_id": 65,
      "level_required": 15,
      "stat_requirements": {
        "atk": 40,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 214,
      "from_digimon_id": 49,
      "to_digimon_id": 124,
      "level_required": 13,
      "stat_requirements": {
        "sp": 40,
        "int": 30
      },
      "dna_requirement": null
    },
    {
      "id": 211,
      "from_digimon_id": 49,
      "to_digimon_id": 87,
      "level_required": 14,
      "stat_requirements": {
        "sp": 40,
        "int": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 213,
      "from_digimon_id": 49,
      "to_digimon_id": 116,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 212,
      "from_digimon_id": 49,
      "to_digimon_id": 89,
      "level_required": 16,
      "stat_requirements": {
        "hp": 150,
        "atk": 40
      },
      "dna_requirement": null
    }
  ],
  "50": [
    {
      "id": 219,
      "from_digimon_id": 50,
      "to_digimon_id": 75,
      "level_required": 14,
      "stat_requirements": {
        "atk": 35,
        "spd": 45
      },
      "dna_requirement": null
    },
    {
      "id": 215,
      "from_digimon_id": 50,
      "to_digimon_id": 67,
      "level_required": 14,
      "stat_requirements": {
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 217,
      "from_digimon_id": 50,
      "to_digimon_id": 87,
      "level_required": 14,
      "stat_requirements": {
        "sp": 40,
        "int": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 216,
      "from_digimon_id": 50,
      "to_digimon_id": 82,
      "level_required": 14,
      "stat_requirements": {
        "def": 40,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 218,
      "from_digimon_id": 50,
      "to_digimon_id": 122,
      "level_required": 14,
      "stat_requirements": {
        "hp": 40,
        "int": 40,
        "spd": 40
      },
      "dna_requirement": null
    }
  ],
  "51": [
    {
      "id": 223,
      "from_digimon_id": 51,
      "to_digimon_id": 130,
      "level_required": 14,
      "stat_requirements": {
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 221,
      "from_digimon_id": 51,
      "to_digimon_id": 76,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 220,
      "from_digimon_id": 51,
      "to_digimon_id": 67,
      "level_required": 14,
      "stat_requirements": {
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 222,
      "from_digimon_id": 51,
      "to_digimon_id": 108,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 55
      },
      "dna_requirement": null
    }
  ],
  "52": [
    {
      "id": 742,
      "from_digimon_id": 52,
      "to_digimon_id": 118,
      "level_required": 16,
      "stat_requirements": {
        "hp": 300,
        "def": 30
      },
      "dna_requirement": null
    },
    {
      "id": 738,
      "from_digimon_id": 52,
      "to_digimon_id": 80,
      "level_required": 14,
      "stat_requirements": {
        "hp": 130,
        "def": 60
      },
      "dna_requirement": null
    },
    {
      "id": 740,
      "from_digimon_id": 52,
      "to_digimon_id": 108,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 739,
      "from_digimon_id": 52,
      "to_digimon_id": 135,
      "level_required": 15,
      "stat_requirements": {
        "hp": 130,
        "atk": 50
      },
      "dna_requirement": null
    },
    {
      "id": 741,
      "from_digimon_id": 52,
      "to_digimon_id": 140,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    }
  ],
  "53": [
    {
      "id": 227,
      "from_digimon_id": 53,
      "to_digimon_id": 324,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 120,
        "def": 145
      },
      "dna_requirement": null
    },
    {
      "id": 225,
      "from_digimon_id": 53,
      "to_digimon_id": 125,
      "level_required": 16,
      "stat_requirements": {
        "atk": 40,
        "spd": 35
      },
      "dna_requirement": null
    },
    {
      "id": 229,
      "from_digimon_id": 53,
      "to_digimon_id": 109,
      "level_required": 15,
      "stat_requirements": {
        "atk": 45,
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 224,
      "from_digimon_id": 53,
      "to_digimon_id": 76,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 226,
      "from_digimon_id": 53,
      "to_digimon_id": 323,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 228,
      "from_digimon_id": 53,
      "to_digimon_id": 73,
      "level_required": 15,
      "stat_requirements": {
        "hp": 45,
        "spd": 55
      },
      "dna_requirement": null
    }
  ],
  "54": [
    {
      "id": 231,
      "from_digimon_id": 54,
      "to_digimon_id": 115,
      "level_required": 16,
      "stat_requirements": {
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 235,
      "from_digimon_id": 54,
      "to_digimon_id": 123,
      "level_required": 16,
      "stat_requirements": {
        "atk": 55,
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 233,
      "from_digimon_id": 54,
      "to_digimon_id": 133,
      "level_required": 14,
      "stat_requirements": {
        "hp": 250,
        "atk": 30
      },
      "dna_requirement": null
    },
    {
      "id": 234,
      "from_digimon_id": 54,
      "to_digimon_id": 139,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 230,
      "from_digimon_id": 54,
      "to_digimon_id": 111,
      "level_required": 16,
      "stat_requirements": {
        "sp": 40,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 232,
      "from_digimon_id": 54,
      "to_digimon_id": 125,
      "level_required": 16,
      "stat_requirements": {
        "atk": 40,
        "spd": 35
      },
      "dna_requirement": null
    }
  ],
  "55": [
    {
      "id": 239,
      "from_digimon_id": 55,
      "to_digimon_id": 121,
      "level_required": 12,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 237,
      "from_digimon_id": 55,
      "to_digimon_id": 94,
      "level_required": 14,
      "stat_requirements": {
        "sp": 40,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 238,
      "from_digimon_id": 55,
      "to_digimon_id": 103,
      "level_required": 14,
      "stat_requirements": {
        "def": 30,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 240,
      "from_digimon_id": 55,
      "to_digimon_id": 129,
      "level_required": 12,
      "stat_requirements": {
        "hp": 300
      },
      "dna_requirement": null
    },
    {
      "id": 236,
      "from_digimon_id": 55,
      "to_digimon_id": 83,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 55
      },
      "dna_requirement": null
    },
    {
      "id": 241,
      "from_digimon_id": 55,
      "to_digimon_id": 75,
      "level_required": 14,
      "stat_requirements": {
        "atk": 35,
        "spd": 45
      },
      "dna_requirement": null
    }
  ],
  "56": [
    {
      "id": 246,
      "from_digimon_id": 56,
      "to_digimon_id": 75,
      "level_required": 14,
      "stat_requirements": {
        "atk": 35,
        "spd": 45
      },
      "dna_requirement": null
    },
    {
      "id": 245,
      "from_digimon_id": 56,
      "to_digimon_id": 131,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 242,
      "from_digimon_id": 56,
      "to_digimon_id": 67,
      "level_required": 14,
      "stat_requirements": {
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 243,
      "from_digimon_id": 56,
      "to_digimon_id": 122,
      "level_required": 14,
      "stat_requirements": {
        "hp": 40,
        "int": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 244,
      "from_digimon_id": 56,
      "to_digimon_id": 130,
      "level_required": 14,
      "stat_requirements": {
        "spd": 50
      },
      "dna_requirement": null
    }
  ],
  "57": [
    {
      "id": 746,
      "from_digimon_id": 57,
      "to_digimon_id": 129,
      "level_required": 12,
      "stat_requirements": {
        "hp": 300
      },
      "dna_requirement": null
    },
    {
      "id": 744,
      "from_digimon_id": 57,
      "to_digimon_id": 74,
      "level_required": 14,
      "stat_requirements": {
        "hp": 500
      },
      "dna_requirement": null
    },
    {
      "id": 743,
      "from_digimon_id": 57,
      "to_digimon_id": 113,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 745,
      "from_digimon_id": 57,
      "to_digimon_id": 102,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "int": 40
      },
      "dna_requirement": null
    }
  ],
  "58": [
    {
      "id": 750,
      "from_digimon_id": 58,
      "to_digimon_id": 89,
      "level_required": 16,
      "stat_requirements": {
        "hp": 150,
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 747,
      "from_digimon_id": 58,
      "to_digimon_id": 96,
      "level_required": 14,
      "stat_requirements": {
        "atk": 60,
        "spd": 25
      },
      "dna_requirement": null
    },
    {
      "id": 749,
      "from_digimon_id": 58,
      "to_digimon_id": 135,
      "level_required": 15,
      "stat_requirements": {
        "hp": 130,
        "atk": 50
      },
      "dna_requirement": null
    },
    {
      "id": 751,
      "from_digimon_id": 58,
      "to_digimon_id": 119,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 748,
      "from_digimon_id": 58,
      "to_digimon_id": 109,
      "level_required": 15,
      "stat_requirements": {
        "atk": 45,
        "spd": 50
      },
      "dna_requirement": null
    }
  ],
  "59": [
    {
      "id": 247,
      "from_digimon_id": 59,
      "to_digimon_id": 74,
      "level_required": 14,
      "stat_requirements": {
        "hp": 500
      },
      "dna_requirement": null
    },
    {
      "id": 248,
      "from_digimon_id": 59,
      "to_digimon_id": 102,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 250,
      "from_digimon_id": 59,
      "to_digimon_id": 129,
      "level_required": 12,
      "stat_requirements": {
        "hp": 300
      },
      "dna_requirement": null
    },
    {
      "id": 249,
      "from_digimon_id": 59,
      "to_digimon_id": 118,
      "level_required": 16,
      "stat_requirements": {
        "hp": 300,
        "def": 30
      },
      "dna_requirement": null
    }
  ],
  "60": [
    {
      "id": 251,
      "from_digimon_id": 60,
      "to_digimon_id": 77,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 252,
      "from_digimon_id": 60,
      "to_digimon_id": 116,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 253,
      "from_digimon_id": 60,
      "to_digimon_id": 213,
      "level_required": 55,
      "stat_requirements": {
        "abi": 80,
        "atk": 180,
        "int": 240,
        "spd": 180
      },
      "dna_requirement": null
    }
  ],
  "61": [
    {
      "id": 753,
      "from_digimon_id": 61,
      "to_digimon_id": 138,
      "level_required": 15,
      "stat_requirements": {
        "atk": 35,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 754,
      "from_digimon_id": 61,
      "to_digimon_id": 335,
      "level_required": 14,
      "stat_requirements": {
        "sp": 40,
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 752,
      "from_digimon_id": 61,
      "to_digimon_id": 101,
      "level_required": 15,
      "stat_requirements": {
        "atk": 50,
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 755,
      "from_digimon_id": 61,
      "to_digimon_id": 115,
      "level_required": 16,
      "stat_requirements": {
        "int": 40
      },
      "dna_requirement": null
    }
  ],
  "62": [
    {
      "id": 255,
      "from_digimon_id": 62,
      "to_digimon_id": 85,
      "level_required": 15,
      "stat_requirements": {
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 254,
      "from_digimon_id": 62,
      "to_digimon_id": 74,
      "level_required": 14,
      "stat_requirements": {
        "hp": 500
      },
      "dna_requirement": null
    },
    {
      "id": 256,
      "from_digimon_id": 62,
      "to_digimon_id": 87,
      "level_required": 14,
      "stat_requirements": {
        "sp": 40,
        "int": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 257,
      "from_digimon_id": 62,
      "to_digimon_id": 128,
      "level_required": 16,
      "stat_requirements": {
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 259,
      "from_digimon_id": 62,
      "to_digimon_id": 138,
      "level_required": 15,
      "stat_requirements": {
        "atk": 35,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 258,
      "from_digimon_id": 62,
      "to_digimon_id": 117,
      "level_required": 14,
      "stat_requirements": {
        "atk": 45,
        "spd": 40
      },
      "dna_requirement": null
    }
  ],
  "63": [
    {
      "id": 260,
      "from_digimon_id": 63,
      "to_digimon_id": 72,
      "level_required": 14,
      "stat_requirements": {
        "sp": 35,
        "int": 55
      },
      "dna_requirement": null
    },
    {
      "id": 264,
      "from_digimon_id": 63,
      "to_digimon_id": 113,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 261,
      "from_digimon_id": 63,
      "to_digimon_id": 84,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 263,
      "from_digimon_id": 63,
      "to_digimon_id": 128,
      "level_required": 16,
      "stat_requirements": {
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 265,
      "from_digimon_id": 63,
      "to_digimon_id": 117,
      "level_required": 14,
      "stat_requirements": {
        "atk": 45,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 262,
      "from_digimon_id": 63,
      "to_digimon_id": 116,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "atk": 40
      },
      "dna_requirement": null
    }
  ],
  "64": [
    {
      "id": 268,
      "from_digimon_id": 64,
      "to_digimon_id": 93,
      "level_required": 14,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    },
    {
      "id": 266,
      "from_digimon_id": 64,
      "to_digimon_id": 65,
      "level_required": 15,
      "stat_requirements": {
        "atk": 40,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 270,
      "from_digimon_id": 64,
      "to_digimon_id": 140,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 269,
      "from_digimon_id": 64,
      "to_digimon_id": 108,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 271,
      "from_digimon_id": 64,
      "to_digimon_id": 126,
      "level_required": 15,
      "stat_requirements": {
        "sp": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 267,
      "from_digimon_id": 64,
      "to_digimon_id": 82,
      "level_required": 14,
      "stat_requirements": {
        "def": 40,
        "int": 40
      },
      "dna_requirement": null
    }
  ],
  "65": [
    {
      "id": 272,
      "from_digimon_id": 65,
      "to_digimon_id": 147,
      "level_required": 30,
      "stat_requirements": {
        "abi": 10,
        "atk": 70,
        "int": 90
      },
      "dna_requirement": null
    },
    {
      "id": 276,
      "from_digimon_id": 65,
      "to_digimon_id": 173,
      "level_required": 28,
      "stat_requirements": {
        "sp": 70,
        "int": 85
      },
      "dna_requirement": null
    },
    {
      "id": 274,
      "from_digimon_id": 65,
      "to_digimon_id": 214,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "int": 95
      },
      "dna_requirement": null
    },
    {
      "id": 273,
      "from_digimon_id": 65,
      "to_digimon_id": 165,
      "level_required": 28,
      "stat_requirements": {
        "hp": 800,
        "def": 70
      },
      "dna_requirement": null
    },
    {
      "id": 275,
      "from_digimon_id": 65,
      "to_digimon_id": 142,
      "level_required": 30,
      "stat_requirements": {
        "atk": 110,
        "int": 85
      },
      "dna_requirement": null
    }
  ],
  "66": [
    {
      "id": 758,
      "from_digimon_id": 66,
      "to_digimon_id": 170,
      "level_required": 30,
      "stat_requirements": {
        "hp": 800,
        "atk": 75
      },
      "dna_requirement": null
    },
    {
      "id": 757,
      "from_digimon_id": 66,
      "to_digimon_id": 185,
      "level_required": 28,
      "stat_requirements": {
        "hp": 350,
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 756,
      "from_digimon_id": 66,
      "to_digimon_id": 145,
      "level_required": 26,
      "stat_requirements": {
        "def": 110
      },
      "dna_requirement": null
    }
  ],
  "67": [
    {
      "id": 280,
      "from_digimon_id": 67,
      "to_digimon_id": 208,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "spd": 90
      },
      "dna_requirement": null
    },
    {
      "id": 278,
      "from_digimon_id": 67,
      "to_digimon_id": 154,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 277,
      "from_digimon_id": 67,
      "to_digimon_id": 150,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "spd": 95
      },
      "dna_requirement": null
    },
    {
      "id": 279,
      "from_digimon_id": 67,
      "to_digimon_id": 166,
      "level_required": 30,
      "stat_requirements": {
        "atk": 60,
        "int": 75,
        "spd": 75
      },
      "dna_requirement": 115
    },
    {
      "id": 281,
      "from_digimon_id": 67,
      "to_digimon_id": 189,
      "level_required": 26,
      "stat_requirements": {
        "sp": 65,
        "int": 65
      },
      "dna_requirement": null
    }
  ],
  "68": [
    {
      "id": 762,
      "from_digimon_id": 68,
      "to_digimon_id": 209,
      "level_required": 30,
      "stat_requirements": {
        "hp": 350,
        "atk": 100,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 759,
      "from_digimon_id": 68,
      "to_digimon_id": 149,
      "level_required": 30,
      "stat_requirements": {
        "hp": 500,
        "atk": 120,
        "def": 60
      },
      "dna_requirement": null
    },
    {
      "id": 761,
      "from_digimon_id": 68,
      "to_digimon_id": 177,
      "level_required": 28,
      "stat_requirements": {
        "hp": 500,
        "atk": 95
      },
      "dna_requirement": null
    },
    {
      "id": 760,
      "from_digimon_id": 68,
      "to_digimon_id": 197,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "spd": 80
      },
      "dna_requirement": null
    }
  ],
  "69": [
    {
      "id": 763,
      "from_digimon_id": 69,
      "to_digimon_id": 142,
      "level_required": 30,
      "stat_requirements": {
        "atk": 110,
        "int": 85
      },
      "dna_requirement": null
    },
    {
      "id": 765,
      "from_digimon_id": 69,
      "to_digimon_id": 146,
      "level_required": 30,
      "stat_requirements": {
        "atk": 95,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 764,
      "from_digimon_id": 69,
      "to_digimon_id": 169,
      "level_required": 28,
      "stat_requirements": {
        "atk": 80,
        "int": 70
      },
      "dna_requirement": null
    }
  ],
  "70": [
    {
      "id": 284,
      "from_digimon_id": 70,
      "to_digimon_id": 168,
      "level_required": 28,
      "stat_requirements": {
        "atk": 120,
        "def": 85,
        "spd": 70
      },
      "dna_requirement": null
    },
    {
      "id": 282,
      "from_digimon_id": 70,
      "to_digimon_id": 145,
      "level_required": 26,
      "stat_requirements": {
        "def": 110
      },
      "dna_requirement": null
    },
    {
      "id": 286,
      "from_digimon_id": 70,
      "to_digimon_id": 159,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "abi": 10,
        "atk": 125
      },
      "dna_requirement": null
    },
    {
      "id": 283,
      "from_digimon_id": 70,
      "to_digimon_id": 164,
      "level_required": 30,
      "stat_requirements": {
        "def": 75,
        "int": 65
      },
      "dna_requirement": 77
    },
    {
      "id": 285,
      "from_digimon_id": 70,
      "to_digimon_id": 195,
      "level_required": 30,
      "stat_requirements": {
        "sp": 80,
        "abi": 10,
        "int": 80
      },
      "dna_requirement": null
    }
  ],
  "71": [
    {
      "id": 288,
      "from_digimon_id": 71,
      "to_digimon_id": 194,
      "level_required": 28,
      "stat_requirements": {
        "hp": 850,
        "def": 75,
        "int": 75
      },
      "dna_requirement": null
    },
    {
      "id": 287,
      "from_digimon_id": 71,
      "to_digimon_id": 170,
      "level_required": 30,
      "stat_requirements": {
        "hp": 800,
        "atk": 75
      },
      "dna_requirement": null
    },
    {
      "id": 289,
      "from_digimon_id": 71,
      "to_digimon_id": 198,
      "level_required": 26,
      "stat_requirements": {
        "atk": 75,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 290,
      "from_digimon_id": 71,
      "to_digimon_id": 180,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 75
      },
      "dna_requirement": null
    }
  ],
  "72": [
    {
      "id": 292,
      "from_digimon_id": 72,
      "to_digimon_id": 177,
      "level_required": 28,
      "stat_requirements": {
        "hp": 500,
        "atk": 95
      },
      "dna_requirement": null
    },
    {
      "id": 291,
      "from_digimon_id": 72,
      "to_digimon_id": 147,
      "level_required": 30,
      "stat_requirements": {
        "abi": 10,
        "atk": 70,
        "int": 90
      },
      "dna_requirement": null
    },
    {
      "id": 293,
      "from_digimon_id": 72,
      "to_digimon_id": 217,
      "level_required": 28,
      "stat_requirements": {
        "sp": 75,
        "int": 100
      },
      "dna_requirement": null
    },
    {
      "id": 294,
      "from_digimon_id": 72,
      "to_digimon_id": 190,
      "level_required": 28,
      "stat_requirements": {
        "sp": 80,
        "int": 80
      },
      "dna_requirement": null
    }
  ],
  "73": [
    {
      "id": 766,
      "from_digimon_id": 73,
      "to_digimon_id": 155,
      "level_required": 30,
      "stat_requirements": {
        "hp": 300,
        "atk": 100,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 767,
      "from_digimon_id": 73,
      "to_digimon_id": 182,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 768,
      "from_digimon_id": 73,
      "to_digimon_id": 215,
      "level_required": 28,
      "stat_requirements": {
        "atk": 90,
        "spd": 85
      },
      "dna_requirement": null
    }
  ],
  "74": [
    {
      "id": 296,
      "from_digimon_id": 74,
      "to_digimon_id": 172,
      "level_required": 30,
      "stat_requirements": {
        "sp": 60,
        "int": 75,
        "spd": 60
      },
      "dna_requirement": null
    },
    {
      "id": 297,
      "from_digimon_id": 74,
      "to_digimon_id": 187,
      "level_required": 26,
      "stat_requirements": {
        "hp": 850,
        "atk": 60,
        "int": 60
      },
      "dna_requirement": null
    },
    {
      "id": 295,
      "from_digimon_id": 74,
      "to_digimon_id": 165,
      "level_required": 28,
      "stat_requirements": {
        "hp": 800,
        "def": 70
      },
      "dna_requirement": null
    }
  ],
  "75": [
    {
      "id": 770,
      "from_digimon_id": 75,
      "to_digimon_id": 200,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "sp": 70,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 769,
      "from_digimon_id": 75,
      "to_digimon_id": 148,
      "level_required": 30,
      "stat_requirements": {
        "abi": 10,
        "atk": 80,
        "spd": 95
      },
      "dna_requirement": null
    },
    {
      "id": 771,
      "from_digimon_id": 75,
      "to_digimon_id": 201,
      "level_required": 26,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 772,
      "from_digimon_id": 75,
      "to_digimon_id": 203,
      "level_required": 30,
      "stat_requirements": {
        "hp": 350,
        "atk": 100
      },
      "dna_requirement": null
    }
  ],
  "76": [
    {
      "id": 301,
      "from_digimon_id": 76,
      "to_digimon_id": 148,
      "level_required": 30,
      "stat_requirements": {
        "abi": 10,
        "atk": 80,
        "spd": 95
      },
      "dna_requirement": null
    },
    {
      "id": 299,
      "from_digimon_id": 76,
      "to_digimon_id": 195,
      "level_required": 30,
      "stat_requirements": {
        "sp": 80,
        "abi": 10,
        "int": 80
      },
      "dna_requirement": null
    },
    {
      "id": 298,
      "from_digimon_id": 76,
      "to_digimon_id": 184,
      "level_required": 30,
      "stat_requirements": {
        "atk": 90,
        "def": 60,
        "spd": 75
      },
      "dna_requirement": 108
    },
    {
      "id": 300,
      "from_digimon_id": 76,
      "to_digimon_id": 209,
      "level_required": 30,
      "stat_requirements": {
        "hp": 350,
        "atk": 100,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 302,
      "from_digimon_id": 76,
      "to_digimon_id": 175,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 90,
        "spd": 75
      },
      "dna_requirement": 108
    }
  ],
  "77": [
    {
      "id": 305,
      "from_digimon_id": 77,
      "to_digimon_id": 195,
      "level_required": 30,
      "stat_requirements": {
        "sp": 80,
        "abi": 10,
        "int": 80
      },
      "dna_requirement": null
    },
    {
      "id": 303,
      "from_digimon_id": 77,
      "to_digimon_id": 154,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 307,
      "from_digimon_id": 77,
      "to_digimon_id": 189,
      "level_required": 26,
      "stat_requirements": {
        "sp": 65,
        "int": 65
      },
      "dna_requirement": null
    },
    {
      "id": 304,
      "from_digimon_id": 77,
      "to_digimon_id": 164,
      "level_required": 30,
      "stat_requirements": {
        "def": 75,
        "int": 65
      },
      "dna_requirement": 70
    },
    {
      "id": 306,
      "from_digimon_id": 77,
      "to_digimon_id": 171,
      "level_required": 30,
      "stat_requirements": {
        "atk": 90,
        "spd": 80
      },
      "dna_requirement": null
    }
  ],
  "78": [
    {
      "id": 309,
      "from_digimon_id": 78,
      "to_digimon_id": 177,
      "level_required": 28,
      "stat_requirements": {
        "hp": 500,
        "atk": 95
      },
      "dna_requirement": null
    },
    {
      "id": 311,
      "from_digimon_id": 78,
      "to_digimon_id": 169,
      "level_required": 28,
      "stat_requirements": {
        "atk": 80,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 308,
      "from_digimon_id": 78,
      "to_digimon_id": 176,
      "level_required": 30,
      "stat_requirements": {
        "hp": 700,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 310,
      "from_digimon_id": 78,
      "to_digimon_id": 215,
      "level_required": 28,
      "stat_requirements": {
        "atk": 90,
        "spd": 85
      },
      "dna_requirement": null
    }
  ],
  "79": [
    {
      "id": 313,
      "from_digimon_id": 79,
      "to_digimon_id": 160,
      "level_required": 26,
      "stat_requirements": {
        "hp": 400,
        "atk": 95
      },
      "dna_requirement": null
    },
    {
      "id": 315,
      "from_digimon_id": 79,
      "to_digimon_id": 206,
      "level_required": 26,
      "stat_requirements": {
        "def": 80,
        "int": 65
      },
      "dna_requirement": null
    },
    {
      "id": 312,
      "from_digimon_id": 79,
      "to_digimon_id": 144,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 75,
        "int": 75
      },
      "dna_requirement": null
    },
    {
      "id": 314,
      "from_digimon_id": 79,
      "to_digimon_id": 183,
      "level_required": 28,
      "stat_requirements": {
        "sp": 60,
        "int": 85
      },
      "dna_requirement": null
    },
    {
      "id": 316,
      "from_digimon_id": 79,
      "to_digimon_id": 157,
      "level_required": 26,
      "stat_requirements": {
        "hp": 700,
        "def": 85
      },
      "dna_requirement": null
    }
  ],
  "80": [
    {
      "id": 774,
      "from_digimon_id": 80,
      "to_digimon_id": 178,
      "level_required": 40,
      "stat_requirements": {
        "hp": 800,
        "atk": 80,
        "def": 80
      },
      "dna_requirement": null
    },
    {
      "id": 773,
      "from_digimon_id": 80,
      "to_digimon_id": 161,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 80,
        "spd": 70
      },
      "dna_requirement": null
    },
    {
      "id": 775,
      "from_digimon_id": 80,
      "to_digimon_id": 144,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 75,
        "int": 75
      },
      "dna_requirement": null
    },
    {
      "id": 777,
      "from_digimon_id": 80,
      "to_digimon_id": 324,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 120,
        "def": 145
      },
      "dna_requirement": null
    },
    {
      "id": 776,
      "from_digimon_id": 80,
      "to_digimon_id": 325,
      "level_required": 50,
      "stat_requirements": {
        "abi": 40,
        "atk": 100,
        "def": 120,
        "int": 120
      },
      "dna_requirement": null
    }
  ],
  "81": [
    {
      "id": 317,
      "from_digimon_id": 81,
      "to_digimon_id": 160,
      "level_required": 26,
      "stat_requirements": {
        "hp": 400,
        "atk": 95
      },
      "dna_requirement": null
    },
    {
      "id": 319,
      "from_digimon_id": 81,
      "to_digimon_id": 215,
      "level_required": 28,
      "stat_requirements": {
        "atk": 90,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 318,
      "from_digimon_id": 81,
      "to_digimon_id": 198,
      "level_required": 26,
      "stat_requirements": {
        "atk": 75,
        "spd": 80
      },
      "dna_requirement": null
    }
  ],
  "82": [
    {
      "id": 321,
      "from_digimon_id": 82,
      "to_digimon_id": 165,
      "level_required": 28,
      "stat_requirements": {
        "hp": 800,
        "def": 70
      },
      "dna_requirement": null
    },
    {
      "id": 322,
      "from_digimon_id": 82,
      "to_digimon_id": 210,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "int": 75
      },
      "dna_requirement": null
    },
    {
      "id": 320,
      "from_digimon_id": 82,
      "to_digimon_id": 141,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "def": 95
      },
      "dna_requirement": null
    }
  ],
  "83": [
    {
      "id": 325,
      "from_digimon_id": 83,
      "to_digimon_id": 200,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "sp": 70,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 324,
      "from_digimon_id": 83,
      "to_digimon_id": 191,
      "level_required": 32,
      "stat_requirements": {},
      "dna_requirement": null
    },
    {
      "id": 323,
      "from_digimon_id": 83,
      "to_digimon_id": 179,
      "level_required": 26,
      "stat_requirements": {
        "hp": 900
      },
      "dna_requirement": null
    }
  ],
  "84": [
    {
      "id": 326,
      "from_digimon_id": 84,
      "to_digimon_id": 143,
      "level_required": 28,
      "stat_requirements": {
        "atk": 65,
        "int": 75,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 328,
      "from_digimon_id": 84,
      "to_digimon_id": 211,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 327,
      "from_digimon_id": 84,
      "to_digimon_id": 202,
      "level_required": 30,
      "stat_requirements": {
        "atk": 105,
        "spd": 75
      },
      "dna_requirement": null
    }
  ],
  "85": [
    {
      "id": 329,
      "from_digimon_id": 85,
      "to_digimon_id": 170,
      "level_required": 30,
      "stat_requirements": {
        "hp": 800,
        "atk": 75
      },
      "dna_requirement": null
    },
    {
      "id": 330,
      "from_digimon_id": 85,
      "to_digimon_id": 181,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 332,
      "from_digimon_id": 85,
      "to_digimon_id": 215,
      "level_required": 28,
      "stat_requirements": {
        "atk": 90,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 331,
      "from_digimon_id": 85,
      "to_digimon_id": 185,
      "level_required": 28,
      "stat_requirements": {
        "hp": 350,
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    }
  ],
  "86": [
    {
      "id": 333,
      "from_digimon_id": 86,
      "to_digimon_id": 192,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 80,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 334,
      "from_digimon_id": 86,
      "to_digimon_id": 198,
      "level_required": 26,
      "stat_requirements": {
        "atk": 75,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 336,
      "from_digimon_id": 86,
      "to_digimon_id": 186,
      "level_required": 26,
      "stat_requirements": {
        "atk": 65,
        "def": 65
      },
      "dna_requirement": null
    },
    {
      "id": 335,
      "from_digimon_id": 86,
      "to_digimon_id": 216,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 90,
        "spd": 70
      },
      "dna_requirement": null
    }
  ],
  "87": [
    {
      "id": 337,
      "from_digimon_id": 87,
      "to_digimon_id": 172,
      "level_required": 30,
      "stat_requirements": {
        "sp": 60,
        "int": 75,
        "spd": 60
      },
      "dna_requirement": null
    },
    {
      "id": 338,
      "from_digimon_id": 87,
      "to_digimon_id": 207,
      "level_required": 26,
      "stat_requirements": {
        "hp": 600,
        "atk": 60
      },
      "dna_requirement": null
    },
    {
      "id": 339,
      "from_digimon_id": 87,
      "to_digimon_id": 214,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "int": 95
      },
      "dna_requirement": null
    }
  ],
  "88": [
    {
      "id": 342,
      "from_digimon_id": 88,
      "to_digimon_id": 203,
      "level_required": 30,
      "stat_requirements": {
        "hp": 350,
        "atk": 100
      },
      "dna_requirement": null
    },
    {
      "id": 340,
      "from_digimon_id": 88,
      "to_digimon_id": 156,
      "level_required": 26,
      "stat_requirements": {
        "hp": 800,
        "atk": 75,
        "def": 95
      },
      "dna_requirement": null
    },
    {
      "id": 344,
      "from_digimon_id": 88,
      "to_digimon_id": 149,
      "level_required": 30,
      "stat_requirements": {
        "hp": 500,
        "atk": 120,
        "def": 60
      },
      "dna_requirement": null
    },
    {
      "id": 341,
      "from_digimon_id": 88,
      "to_digimon_id": 202,
      "level_required": 30,
      "stat_requirements": {
        "atk": 105,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 343,
      "from_digimon_id": 88,
      "to_digimon_id": 205,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 95
      },
      "dna_requirement": null
    }
  ],
  "89": [
    {
      "id": 346,
      "from_digimon_id": 89,
      "to_digimon_id": 163,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 348,
      "from_digimon_id": 89,
      "to_digimon_id": 142,
      "level_required": 30,
      "stat_requirements": {
        "atk": 110,
        "int": 85
      },
      "dna_requirement": null
    },
    {
      "id": 345,
      "from_digimon_id": 89,
      "to_digimon_id": 146,
      "level_required": 30,
      "stat_requirements": {
        "atk": 95,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 347,
      "from_digimon_id": 89,
      "to_digimon_id": 172,
      "level_required": 30,
      "stat_requirements": {
        "sp": 60,
        "int": 75,
        "spd": 60
      },
      "dna_requirement": null
    }
  ],
  "90": [
    {
      "id": 350,
      "from_digimon_id": 90,
      "to_digimon_id": 201,
      "level_required": 26,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 352,
      "from_digimon_id": 90,
      "to_digimon_id": 204,
      "level_required": 30,
      "stat_requirements": {
        "hp": 450,
        "atk": 110
      },
      "dna_requirement": null
    },
    {
      "id": 349,
      "from_digimon_id": 90,
      "to_digimon_id": 168,
      "level_required": 28,
      "stat_requirements": {
        "atk": 120,
        "def": 85,
        "spd": 70
      },
      "dna_requirement": null
    },
    {
      "id": 351,
      "from_digimon_id": 90,
      "to_digimon_id": 203,
      "level_required": 30,
      "stat_requirements": {
        "hp": 350,
        "atk": 100
      },
      "dna_requirement": null
    }
  ],
  "91": [
    {
      "id": 354,
      "from_digimon_id": 91,
      "to_digimon_id": 182,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 356,
      "from_digimon_id": 91,
      "to_digimon_id": 180,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 353,
      "from_digimon_id": 91,
      "to_digimon_id": 181,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 355,
      "from_digimon_id": 91,
      "to_digimon_id": 204,
      "level_required": 30,
      "stat_requirements": {
        "hp": 450,
        "atk": 110
      },
      "dna_requirement": null
    }
  ],
  "92": [
    {
      "id": 358,
      "from_digimon_id": 92,
      "to_digimon_id": 182,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 360,
      "from_digimon_id": 92,
      "to_digimon_id": 217,
      "level_required": 28,
      "stat_requirements": {
        "sp": 75,
        "int": 100
      },
      "dna_requirement": null
    },
    {
      "id": 357,
      "from_digimon_id": 92,
      "to_digimon_id": 144,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 75,
        "int": 75
      },
      "dna_requirement": null
    },
    {
      "id": 359,
      "from_digimon_id": 92,
      "to_digimon_id": 183,
      "level_required": 28,
      "stat_requirements": {
        "sp": 60,
        "int": 85
      },
      "dna_requirement": null
    }
  ],
  "93": [
    {
      "id": 362,
      "from_digimon_id": 93,
      "to_digimon_id": 158,
      "level_required": 28,
      "stat_requirements": {
        "def": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 361,
      "from_digimon_id": 93,
      "to_digimon_id": 153,
      "level_required": 26,
      "stat_requirements": {
        "atk": 95,
        "def": 90
      },
      "dna_requirement": null
    },
    {
      "id": 363,
      "from_digimon_id": 93,
      "to_digimon_id": 165,
      "level_required": 28,
      "stat_requirements": {
        "hp": 800,
        "def": 70
      },
      "dna_requirement": null
    }
  ],
  "94": [
    {
      "id": 366,
      "from_digimon_id": 94,
      "to_digimon_id": 200,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "sp": 70,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 364,
      "from_digimon_id": 94,
      "to_digimon_id": 179,
      "level_required": 26,
      "stat_requirements": {
        "hp": 900
      },
      "dna_requirement": null
    },
    {
      "id": 365,
      "from_digimon_id": 94,
      "to_digimon_id": 194,
      "level_required": 28,
      "stat_requirements": {
        "hp": 850,
        "def": 75,
        "int": 75
      },
      "dna_requirement": null
    }
  ],
  "95": [
    {
      "id": 368,
      "from_digimon_id": 95,
      "to_digimon_id": 167,
      "level_required": 28,
      "stat_requirements": {
        "sp": 70,
        "atk": 70,
        "def": 80
      },
      "dna_requirement": null
    },
    {
      "id": 367,
      "from_digimon_id": 95,
      "to_digimon_id": 151,
      "level_required": 26,
      "stat_requirements": {
        "sp": 75,
        "def": 75,
        "spd": 65
      },
      "dna_requirement": null
    },
    {
      "id": 369,
      "from_digimon_id": 95,
      "to_digimon_id": 206,
      "level_required": 26,
      "stat_requirements": {
        "def": 80,
        "int": 65
      },
      "dna_requirement": null
    }
  ],
  "96": [
    {
      "id": 778,
      "from_digimon_id": 96,
      "to_digimon_id": 148,
      "level_required": 30,
      "stat_requirements": {
        "abi": 10,
        "atk": 80,
        "spd": 95
      },
      "dna_requirement": null
    },
    {
      "id": 779,
      "from_digimon_id": 96,
      "to_digimon_id": 150,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "spd": 95
      },
      "dna_requirement": null
    },
    {
      "id": 780,
      "from_digimon_id": 96,
      "to_digimon_id": 192,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 80,
        "int": 70
      },
      "dna_requirement": null
    }
  ],
  "97": [
    {
      "id": 782,
      "from_digimon_id": 97,
      "to_digimon_id": 180,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 781,
      "from_digimon_id": 97,
      "to_digimon_id": 159,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "abi": 10,
        "atk": 125
      },
      "dna_requirement": null
    },
    {
      "id": 783,
      "from_digimon_id": 97,
      "to_digimon_id": 202,
      "level_required": 30,
      "stat_requirements": {
        "atk": 105,
        "spd": 75
      },
      "dna_requirement": null
    }
  ],
  "98": [
    {
      "id": 370,
      "from_digimon_id": 98,
      "to_digimon_id": 191,
      "level_required": 32,
      "stat_requirements": {},
      "dna_requirement": null
    },
    {
      "id": 372,
      "from_digimon_id": 98,
      "to_digimon_id": 275,
      "level_required": 65,
      "stat_requirements": {
        "abi": 10
      },
      "dna_requirement": null
    },
    {
      "id": 371,
      "from_digimon_id": 98,
      "to_digimon_id": 193,
      "level_required": 26,
      "stat_requirements": {
        "sp": 85
      },
      "dna_requirement": null
    }
  ],
  "99": [
    {
      "id": 786,
      "from_digimon_id": 99,
      "to_digimon_id": 187,
      "level_required": 26,
      "stat_requirements": {
        "hp": 850,
        "atk": 60,
        "int": 60
      },
      "dna_requirement": null
    },
    {
      "id": 785,
      "from_digimon_id": 99,
      "to_digimon_id": 145,
      "level_required": 26,
      "stat_requirements": {
        "def": 110
      },
      "dna_requirement": null
    },
    {
      "id": 784,
      "from_digimon_id": 99,
      "to_digimon_id": 196,
      "level_required": 26,
      "stat_requirements": {
        "atk": 80,
        "def": 75
      },
      "dna_requirement": null
    }
  ],
  "100": [
    {
      "id": 374,
      "from_digimon_id": 100,
      "to_digimon_id": 183,
      "level_required": 28,
      "stat_requirements": {
        "sp": 60,
        "int": 85
      },
      "dna_requirement": null
    },
    {
      "id": 373,
      "from_digimon_id": 100,
      "to_digimon_id": 181,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 375,
      "from_digimon_id": 100,
      "to_digimon_id": 201,
      "level_required": 26,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "spd": 75
      },
      "dna_requirement": null
    }
  ],
  "101": [
    {
      "id": 790,
      "from_digimon_id": 101,
      "to_digimon_id": 216,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 90,
        "spd": 70
      },
      "dna_requirement": null
    },
    {
      "id": 787,
      "from_digimon_id": 101,
      "to_digimon_id": 155,
      "level_required": 30,
      "stat_requirements": {
        "hp": 300,
        "atk": 100,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 789,
      "from_digimon_id": 101,
      "to_digimon_id": 147,
      "level_required": 30,
      "stat_requirements": {
        "abi": 10,
        "atk": 70,
        "int": 90
      },
      "dna_requirement": null
    },
    {
      "id": 788,
      "from_digimon_id": 101,
      "to_digimon_id": 197,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "spd": 80
      },
      "dna_requirement": null
    }
  ],
  "102": [
    {
      "id": 378,
      "from_digimon_id": 102,
      "to_digimon_id": 212,
      "level_required": 30,
      "stat_requirements": {
        "int": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 377,
      "from_digimon_id": 102,
      "to_digimon_id": 210,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "int": 75
      },
      "dna_requirement": null
    },
    {
      "id": 376,
      "from_digimon_id": 102,
      "to_digimon_id": 152,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "int": 100
      },
      "dna_requirement": null
    }
  ],
  "103": [
    {
      "id": 379,
      "from_digimon_id": 103,
      "to_digimon_id": 179,
      "level_required": 26,
      "stat_requirements": {
        "hp": 900
      },
      "dna_requirement": null
    },
    {
      "id": 380,
      "from_digimon_id": 103,
      "to_digimon_id": 194,
      "level_required": 28,
      "stat_requirements": {
        "hp": 850,
        "def": 75,
        "int": 75
      },
      "dna_requirement": null
    },
    {
      "id": 382,
      "from_digimon_id": 103,
      "to_digimon_id": 330,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 381,
      "from_digimon_id": 103,
      "to_digimon_id": 200,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "sp": 70,
        "int": 70
      },
      "dna_requirement": null
    }
  ],
  "104": [
    {
      "id": 794,
      "from_digimon_id": 104,
      "to_digimon_id": 330,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 791,
      "from_digimon_id": 104,
      "to_digimon_id": 173,
      "level_required": 28,
      "stat_requirements": {
        "sp": 70,
        "int": 85
      },
      "dna_requirement": null
    },
    {
      "id": 793,
      "from_digimon_id": 104,
      "to_digimon_id": 200,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "sp": 70,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 792,
      "from_digimon_id": 104,
      "to_digimon_id": 144,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 75,
        "int": 75
      },
      "dna_requirement": null
    }
  ],
  "105": [
    {
      "id": 383,
      "from_digimon_id": 105,
      "to_digimon_id": 156,
      "level_required": 26,
      "stat_requirements": {
        "hp": 800,
        "atk": 75,
        "def": 95
      },
      "dna_requirement": null
    },
    {
      "id": 384,
      "from_digimon_id": 105,
      "to_digimon_id": 168,
      "level_required": 28,
      "stat_requirements": {
        "atk": 120,
        "def": 85,
        "spd": 70
      },
      "dna_requirement": null
    },
    {
      "id": 386,
      "from_digimon_id": 105,
      "to_digimon_id": 159,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "abi": 10,
        "atk": 125
      },
      "dna_requirement": null
    },
    {
      "id": 385,
      "from_digimon_id": 105,
      "to_digimon_id": 209,
      "level_required": 30,
      "stat_requirements": {
        "hp": 350,
        "atk": 100,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 934,
      "from_digimon_id": 105,
      "to_digimon_id": 365,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "spd": 55
      },
      "dna_requirement": null
    }
  ],
  "106": [
    {
      "id": 387,
      "from_digimon_id": 106,
      "to_digimon_id": 151,
      "level_required": 26,
      "stat_requirements": {
        "sp": 75,
        "def": 75,
        "spd": 65
      },
      "dna_requirement": null
    },
    {
      "id": 388,
      "from_digimon_id": 106,
      "to_digimon_id": 167,
      "level_required": 28,
      "stat_requirements": {
        "sp": 70,
        "atk": 70,
        "def": 80
      },
      "dna_requirement": null
    },
    {
      "id": 389,
      "from_digimon_id": 106,
      "to_digimon_id": 193,
      "level_required": 26,
      "stat_requirements": {
        "sp": 85
      },
      "dna_requirement": null
    }
  ],
  "107": [
    {
      "id": 391,
      "from_digimon_id": 107,
      "to_digimon_id": 199,
      "level_required": 26,
      "stat_requirements": {
        "atk": 75,
        "def": 80
      },
      "dna_requirement": null
    },
    {
      "id": 390,
      "from_digimon_id": 107,
      "to_digimon_id": 167,
      "level_required": 28,
      "stat_requirements": {
        "sp": 70,
        "atk": 70,
        "def": 80
      },
      "dna_requirement": null
    },
    {
      "id": 392,
      "from_digimon_id": 107,
      "to_digimon_id": 206,
      "level_required": 26,
      "stat_requirements": {
        "def": 80,
        "int": 65
      },
      "dna_requirement": null
    },
    {
      "id": 394,
      "from_digimon_id": 107,
      "to_digimon_id": 162,
      "level_required": 30,
      "stat_requirements": {
        "sp": 60,
        "atk": 70
      },
      "dna_requirement": null
    },
    {
      "id": 393,
      "from_digimon_id": 107,
      "to_digimon_id": 157,
      "level_required": 26,
      "stat_requirements": {
        "hp": 700,
        "def": 85
      },
      "dna_requirement": null
    }
  ],
  "108": [
    {
      "id": 395,
      "from_digimon_id": 108,
      "to_digimon_id": 146,
      "level_required": 30,
      "stat_requirements": {
        "atk": 95,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 396,
      "from_digimon_id": 108,
      "to_digimon_id": 153,
      "level_required": 26,
      "stat_requirements": {
        "atk": 95,
        "def": 90
      },
      "dna_requirement": null
    },
    {
      "id": 398,
      "from_digimon_id": 108,
      "to_digimon_id": 175,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 90,
        "spd": 75
      },
      "dna_requirement": 76
    },
    {
      "id": 397,
      "from_digimon_id": 108,
      "to_digimon_id": 184,
      "level_required": 30,
      "stat_requirements": {
        "atk": 90,
        "def": 60,
        "spd": 75
      },
      "dna_requirement": 76
    }
  ],
  "109": [
    {
      "id": 795,
      "from_digimon_id": 109,
      "to_digimon_id": 171,
      "level_required": 30,
      "stat_requirements": {
        "atk": 90,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 797,
      "from_digimon_id": 109,
      "to_digimon_id": 215,
      "level_required": 28,
      "stat_requirements": {
        "atk": 90,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 796,
      "from_digimon_id": 109,
      "to_digimon_id": 163,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 933,
      "from_digimon_id": 109,
      "to_digimon_id": 365,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "spd": 55
      },
      "dna_requirement": null
    }
  ],
  "110": [
    {
      "id": 798,
      "from_digimon_id": 110,
      "to_digimon_id": 155,
      "level_required": 30,
      "stat_requirements": {
        "hp": 300,
        "atk": 100,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 799,
      "from_digimon_id": 110,
      "to_digimon_id": 178,
      "level_required": 40,
      "stat_requirements": {
        "hp": 800,
        "atk": 80,
        "def": 80
      },
      "dna_requirement": null
    },
    {
      "id": 800,
      "from_digimon_id": 110,
      "to_digimon_id": 190,
      "level_required": 28,
      "stat_requirements": {
        "sp": 80,
        "int": 80
      },
      "dna_requirement": null
    }
  ],
  "111": [
    {
      "id": 399,
      "from_digimon_id": 111,
      "to_digimon_id": 143,
      "level_required": 28,
      "stat_requirements": {
        "atk": 65,
        "int": 75,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 401,
      "from_digimon_id": 111,
      "to_digimon_id": 217,
      "level_required": 28,
      "stat_requirements": {
        "sp": 75,
        "int": 100
      },
      "dna_requirement": null
    },
    {
      "id": 400,
      "from_digimon_id": 111,
      "to_digimon_id": 188,
      "level_required": 26,
      "stat_requirements": {
        "sp": 75,
        "int": 80,
        "spd": 80
      },
      "dna_requirement": null
    }
  ],
  "112": [
    {
      "id": 404,
      "from_digimon_id": 112,
      "to_digimon_id": 158,
      "level_required": 28,
      "stat_requirements": {
        "def": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 403,
      "from_digimon_id": 112,
      "to_digimon_id": 156,
      "level_required": 26,
      "stat_requirements": {
        "hp": 800,
        "atk": 75,
        "def": 95
      },
      "dna_requirement": null
    },
    {
      "id": 406,
      "from_digimon_id": 112,
      "to_digimon_id": 196,
      "level_required": 26,
      "stat_requirements": {
        "atk": 80,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 402,
      "from_digimon_id": 112,
      "to_digimon_id": 144,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 75,
        "int": 75
      },
      "dna_requirement": null
    },
    {
      "id": 405,
      "from_digimon_id": 112,
      "to_digimon_id": 182,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "def": 75
      },
      "dna_requirement": null
    }
  ],
  "113": [
    {
      "id": 802,
      "from_digimon_id": 113,
      "to_digimon_id": 145,
      "level_required": 26,
      "stat_requirements": {
        "def": 110
      },
      "dna_requirement": null
    },
    {
      "id": 801,
      "from_digimon_id": 113,
      "to_digimon_id": 186,
      "level_required": 26,
      "stat_requirements": {
        "atk": 65,
        "def": 65
      },
      "dna_requirement": null
    },
    {
      "id": 803,
      "from_digimon_id": 113,
      "to_digimon_id": 187,
      "level_required": 26,
      "stat_requirements": {
        "hp": 850,
        "atk": 60,
        "int": 60
      },
      "dna_requirement": null
    }
  ],
  "114": [
    {
      "id": 408,
      "from_digimon_id": 114,
      "to_digimon_id": 201,
      "level_required": 26,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 410,
      "from_digimon_id": 114,
      "to_digimon_id": 205,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 95
      },
      "dna_requirement": null
    },
    {
      "id": 407,
      "from_digimon_id": 114,
      "to_digimon_id": 199,
      "level_required": 26,
      "stat_requirements": {
        "atk": 75,
        "def": 80
      },
      "dna_requirement": null
    },
    {
      "id": 409,
      "from_digimon_id": 114,
      "to_digimon_id": 204,
      "level_required": 30,
      "stat_requirements": {
        "hp": 450,
        "atk": 110
      },
      "dna_requirement": null
    }
  ],
  "115": [
    {
      "id": 412,
      "from_digimon_id": 115,
      "to_digimon_id": 166,
      "level_required": 30,
      "stat_requirements": {
        "atk": 60,
        "int": 75,
        "spd": 75
      },
      "dna_requirement": 67
    },
    {
      "id": 414,
      "from_digimon_id": 115,
      "to_digimon_id": 186,
      "level_required": 26,
      "stat_requirements": {
        "atk": 65,
        "def": 65
      },
      "dna_requirement": null
    },
    {
      "id": 411,
      "from_digimon_id": 115,
      "to_digimon_id": 152,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "int": 100
      },
      "dna_requirement": null
    },
    {
      "id": 413,
      "from_digimon_id": 115,
      "to_digimon_id": 212,
      "level_required": 30,
      "stat_requirements": {
        "int": 75,
        "spd": 75
      },
      "dna_requirement": null
    }
  ],
  "116": [
    {
      "id": 416,
      "from_digimon_id": 116,
      "to_digimon_id": 147,
      "level_required": 30,
      "stat_requirements": {
        "abi": 10,
        "atk": 70,
        "int": 90
      },
      "dna_requirement": null
    },
    {
      "id": 418,
      "from_digimon_id": 116,
      "to_digimon_id": 204,
      "level_required": 30,
      "stat_requirements": {
        "hp": 450,
        "atk": 110
      },
      "dna_requirement": null
    },
    {
      "id": 415,
      "from_digimon_id": 116,
      "to_digimon_id": 146,
      "level_required": 30,
      "stat_requirements": {
        "atk": 95,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 417,
      "from_digimon_id": 116,
      "to_digimon_id": 192,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 80,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 419,
      "from_digimon_id": 116,
      "to_digimon_id": 169,
      "level_required": 28,
      "stat_requirements": {
        "atk": 80,
        "int": 70
      },
      "dna_requirement": null
    }
  ],
  "117": [
    {
      "id": 806,
      "from_digimon_id": 117,
      "to_digimon_id": 207,
      "level_required": 26,
      "stat_requirements": {
        "hp": 600,
        "atk": 60
      },
      "dna_requirement": null
    },
    {
      "id": 805,
      "from_digimon_id": 117,
      "to_digimon_id": 163,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 804,
      "from_digimon_id": 117,
      "to_digimon_id": 143,
      "level_required": 28,
      "stat_requirements": {
        "atk": 65,
        "int": 75,
        "spd": 85
      },
      "dna_requirement": null
    }
  ],
  "118": [
    {
      "id": 420,
      "from_digimon_id": 118,
      "to_digimon_id": 187,
      "level_required": 26,
      "stat_requirements": {
        "hp": 850,
        "atk": 60,
        "int": 60
      },
      "dna_requirement": null
    },
    {
      "id": 422,
      "from_digimon_id": 118,
      "to_digimon_id": 212,
      "level_required": 30,
      "stat_requirements": {
        "int": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 421,
      "from_digimon_id": 118,
      "to_digimon_id": 198,
      "level_required": 26,
      "stat_requirements": {
        "atk": 75,
        "spd": 80
      },
      "dna_requirement": null
    }
  ],
  "119": [
    {
      "id": 424,
      "from_digimon_id": 119,
      "to_digimon_id": 181,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 426,
      "from_digimon_id": 119,
      "to_digimon_id": 161,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 80,
        "spd": 70
      },
      "dna_requirement": null
    },
    {
      "id": 423,
      "from_digimon_id": 119,
      "to_digimon_id": 174,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 425,
      "from_digimon_id": 119,
      "to_digimon_id": 209,
      "level_required": 30,
      "stat_requirements": {
        "hp": 350,
        "atk": 100,
        "spd": 75
      },
      "dna_requirement": null
    }
  ],
  "120": [
    {
      "id": 428,
      "from_digimon_id": 120,
      "to_digimon_id": 167,
      "level_required": 28,
      "stat_requirements": {
        "sp": 70,
        "atk": 70,
        "def": 80
      },
      "dna_requirement": null
    },
    {
      "id": 427,
      "from_digimon_id": 120,
      "to_digimon_id": 145,
      "level_required": 26,
      "stat_requirements": {
        "def": 110
      },
      "dna_requirement": null
    },
    {
      "id": 429,
      "from_digimon_id": 120,
      "to_digimon_id": 176,
      "level_required": 30,
      "stat_requirements": {
        "hp": 700,
        "def": 75
      },
      "dna_requirement": null
    }
  ],
  "121": [
    {
      "id": 432,
      "from_digimon_id": 121,
      "to_digimon_id": 207,
      "level_required": 26,
      "stat_requirements": {
        "hp": 600,
        "atk": 60
      },
      "dna_requirement": null
    },
    {
      "id": 430,
      "from_digimon_id": 121,
      "to_digimon_id": 151,
      "level_required": 26,
      "stat_requirements": {
        "sp": 75,
        "def": 75,
        "spd": 65
      },
      "dna_requirement": null
    },
    {
      "id": 431,
      "from_digimon_id": 121,
      "to_digimon_id": 191,
      "level_required": 32,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "122": [
    {
      "id": 436,
      "from_digimon_id": 122,
      "to_digimon_id": 208,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "spd": 90
      },
      "dna_requirement": null
    },
    {
      "id": 434,
      "from_digimon_id": 122,
      "to_digimon_id": 154,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 438,
      "from_digimon_id": 122,
      "to_digimon_id": 189,
      "level_required": 26,
      "stat_requirements": {
        "sp": 65,
        "int": 65
      },
      "dna_requirement": null
    },
    {
      "id": 433,
      "from_digimon_id": 122,
      "to_digimon_id": 150,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "spd": 95
      },
      "dna_requirement": null
    },
    {
      "id": 437,
      "from_digimon_id": 122,
      "to_digimon_id": 149,
      "level_required": 30,
      "stat_requirements": {
        "hp": 500,
        "atk": 120,
        "def": 60
      },
      "dna_requirement": null
    },
    {
      "id": 435,
      "from_digimon_id": 122,
      "to_digimon_id": 174,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "spd": 100
      },
      "dna_requirement": null
    }
  ],
  "123": [
    {
      "id": 807,
      "from_digimon_id": 123,
      "to_digimon_id": 155,
      "level_required": 30,
      "stat_requirements": {
        "hp": 300,
        "atk": 100,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 809,
      "from_digimon_id": 123,
      "to_digimon_id": 209,
      "level_required": 30,
      "stat_requirements": {
        "hp": 350,
        "atk": 100,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 808,
      "from_digimon_id": 123,
      "to_digimon_id": 171,
      "level_required": 30,
      "stat_requirements": {
        "atk": 90,
        "spd": 80
      },
      "dna_requirement": null
    }
  ],
  "124": [
    {
      "id": 440,
      "from_digimon_id": 124,
      "to_digimon_id": 187,
      "level_required": 26,
      "stat_requirements": {
        "hp": 850,
        "atk": 60,
        "int": 60
      },
      "dna_requirement": null
    },
    {
      "id": 442,
      "from_digimon_id": 124,
      "to_digimon_id": 214,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "int": 95
      },
      "dna_requirement": null
    },
    {
      "id": 444,
      "from_digimon_id": 124,
      "to_digimon_id": 197,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 439,
      "from_digimon_id": 124,
      "to_digimon_id": 147,
      "level_required": 30,
      "stat_requirements": {
        "abi": 10,
        "atk": 70,
        "int": 90
      },
      "dna_requirement": null
    },
    {
      "id": 441,
      "from_digimon_id": 124,
      "to_digimon_id": 192,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 80,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 443,
      "from_digimon_id": 124,
      "to_digimon_id": 190,
      "level_required": 28,
      "stat_requirements": {
        "sp": 80,
        "int": 80
      },
      "dna_requirement": null
    }
  ],
  "125": [
    {
      "id": 445,
      "from_digimon_id": 125,
      "to_digimon_id": 150,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "spd": 95
      },
      "dna_requirement": null
    },
    {
      "id": 446,
      "from_digimon_id": 125,
      "to_digimon_id": 163,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 448,
      "from_digimon_id": 125,
      "to_digimon_id": 205,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 95
      },
      "dna_requirement": null
    },
    {
      "id": 447,
      "from_digimon_id": 125,
      "to_digimon_id": 202,
      "level_required": 30,
      "stat_requirements": {
        "atk": 105,
        "spd": 75
      },
      "dna_requirement": null
    }
  ],
  "126": [
    {
      "id": 811,
      "from_digimon_id": 126,
      "to_digimon_id": 158,
      "level_required": 28,
      "stat_requirements": {
        "def": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 810,
      "from_digimon_id": 126,
      "to_digimon_id": 212,
      "level_required": 30,
      "stat_requirements": {
        "int": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 812,
      "from_digimon_id": 126,
      "to_digimon_id": 210,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "int": 75
      },
      "dna_requirement": null
    }
  ],
  "127": [
    {
      "id": 449,
      "from_digimon_id": 127,
      "to_digimon_id": 151,
      "level_required": 26,
      "stat_requirements": {
        "sp": 75,
        "def": 75,
        "spd": 65
      },
      "dna_requirement": null
    },
    {
      "id": 450,
      "from_digimon_id": 127,
      "to_digimon_id": 193,
      "level_required": 26,
      "stat_requirements": {
        "sp": 85
      },
      "dna_requirement": null
    },
    {
      "id": 452,
      "from_digimon_id": 127,
      "to_digimon_id": 157,
      "level_required": 26,
      "stat_requirements": {
        "hp": 700,
        "def": 85
      },
      "dna_requirement": null
    },
    {
      "id": 451,
      "from_digimon_id": 127,
      "to_digimon_id": 206,
      "level_required": 26,
      "stat_requirements": {
        "def": 80,
        "int": 65
      },
      "dna_requirement": null
    }
  ],
  "128": [
    {
      "id": 453,
      "from_digimon_id": 128,
      "to_digimon_id": 163,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 454,
      "from_digimon_id": 128,
      "to_digimon_id": 182,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 456,
      "from_digimon_id": 128,
      "to_digimon_id": 216,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 90,
        "spd": 70
      },
      "dna_requirement": null
    },
    {
      "id": 455,
      "from_digimon_id": 128,
      "to_digimon_id": 214,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "int": 95
      },
      "dna_requirement": null
    }
  ],
  "129": [
    {
      "id": 457,
      "from_digimon_id": 129,
      "to_digimon_id": 141,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "def": 95
      },
      "dna_requirement": null
    },
    {
      "id": 458,
      "from_digimon_id": 129,
      "to_digimon_id": 176,
      "level_required": 30,
      "stat_requirements": {
        "hp": 700,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 459,
      "from_digimon_id": 129,
      "to_digimon_id": 210,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "int": 75
      },
      "dna_requirement": null
    }
  ],
  "130": [
    {
      "id": 461,
      "from_digimon_id": 130,
      "to_digimon_id": 188,
      "level_required": 26,
      "stat_requirements": {
        "sp": 75,
        "int": 80,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 460,
      "from_digimon_id": 130,
      "to_digimon_id": 143,
      "level_required": 28,
      "stat_requirements": {
        "atk": 65,
        "int": 75,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 462,
      "from_digimon_id": 130,
      "to_digimon_id": 208,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "spd": 90
      },
      "dna_requirement": null
    }
  ],
  "131": [
    {
      "id": 465,
      "from_digimon_id": 131,
      "to_digimon_id": 192,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 80,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 468,
      "from_digimon_id": 131,
      "to_digimon_id": 196,
      "level_required": 26,
      "stat_requirements": {
        "atk": 80,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 464,
      "from_digimon_id": 131,
      "to_digimon_id": 185,
      "level_required": 28,
      "stat_requirements": {
        "hp": 350,
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 463,
      "from_digimon_id": 131,
      "to_digimon_id": 177,
      "level_required": 28,
      "stat_requirements": {
        "hp": 500,
        "atk": 95
      },
      "dna_requirement": null
    },
    {
      "id": 467,
      "from_digimon_id": 131,
      "to_digimon_id": 149,
      "level_required": 30,
      "stat_requirements": {
        "hp": 500,
        "atk": 120,
        "def": 60
      },
      "dna_requirement": null
    },
    {
      "id": 466,
      "from_digimon_id": 131,
      "to_digimon_id": 199,
      "level_required": 26,
      "stat_requirements": {
        "atk": 75,
        "def": 80
      },
      "dna_requirement": null
    }
  ],
  "132": [
    {
      "id": 815,
      "from_digimon_id": 132,
      "to_digimon_id": 205,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 95
      },
      "dna_requirement": null
    },
    {
      "id": 813,
      "from_digimon_id": 132,
      "to_digimon_id": 180,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 814,
      "from_digimon_id": 132,
      "to_digimon_id": 168,
      "level_required": 28,
      "stat_requirements": {
        "atk": 120,
        "def": 85,
        "spd": 70
      },
      "dna_requirement": null
    }
  ],
  "133": [
    {
      "id": 470,
      "from_digimon_id": 133,
      "to_digimon_id": 170,
      "level_required": 30,
      "stat_requirements": {
        "hp": 800,
        "atk": 75
      },
      "dna_requirement": null
    },
    {
      "id": 472,
      "from_digimon_id": 133,
      "to_digimon_id": 162,
      "level_required": 30,
      "stat_requirements": {
        "sp": 60,
        "atk": 70
      },
      "dna_requirement": null
    },
    {
      "id": 471,
      "from_digimon_id": 133,
      "to_digimon_id": 207,
      "level_required": 26,
      "stat_requirements": {
        "hp": 600,
        "atk": 60
      },
      "dna_requirement": null
    },
    {
      "id": 469,
      "from_digimon_id": 133,
      "to_digimon_id": 152,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "int": 100
      },
      "dna_requirement": null
    }
  ],
  "134": [
    {
      "id": 818,
      "from_digimon_id": 134,
      "to_digimon_id": 195,
      "level_required": 30,
      "stat_requirements": {
        "sp": 80,
        "abi": 10,
        "int": 80
      },
      "dna_requirement": null
    },
    {
      "id": 816,
      "from_digimon_id": 134,
      "to_digimon_id": 189,
      "level_required": 26,
      "stat_requirements": {
        "sp": 65,
        "int": 65
      },
      "dna_requirement": null
    },
    {
      "id": 817,
      "from_digimon_id": 134,
      "to_digimon_id": 188,
      "level_required": 26,
      "stat_requirements": {
        "sp": 75,
        "int": 80,
        "spd": 80
      },
      "dna_requirement": null
    }
  ],
  "135": [
    {
      "id": 819,
      "from_digimon_id": 135,
      "to_digimon_id": 161,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 80,
        "spd": 70
      },
      "dna_requirement": null
    },
    {
      "id": 820,
      "from_digimon_id": 135,
      "to_digimon_id": 178,
      "level_required": 40,
      "stat_requirements": {
        "hp": 800,
        "atk": 80,
        "def": 80
      },
      "dna_requirement": null
    },
    {
      "id": 822,
      "from_digimon_id": 135,
      "to_digimon_id": 181,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 821,
      "from_digimon_id": 135,
      "to_digimon_id": 156,
      "level_required": 26,
      "stat_requirements": {
        "hp": 800,
        "atk": 75,
        "def": 95
      },
      "dna_requirement": null
    }
  ],
  "136": [
    {
      "id": 823,
      "from_digimon_id": 136,
      "to_digimon_id": 169,
      "level_required": 28,
      "stat_requirements": {
        "atk": 80,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 827,
      "from_digimon_id": 136,
      "to_digimon_id": 204,
      "level_required": 30,
      "stat_requirements": {
        "hp": 450,
        "atk": 110
      },
      "dna_requirement": null
    },
    {
      "id": 824,
      "from_digimon_id": 136,
      "to_digimon_id": 173,
      "level_required": 28,
      "stat_requirements": {
        "sp": 70,
        "int": 85
      },
      "dna_requirement": null
    },
    {
      "id": 826,
      "from_digimon_id": 136,
      "to_digimon_id": 191,
      "level_required": 32,
      "stat_requirements": {},
      "dna_requirement": null
    },
    {
      "id": 825,
      "from_digimon_id": 136,
      "to_digimon_id": 190,
      "level_required": 28,
      "stat_requirements": {
        "sp": 80,
        "int": 80
      },
      "dna_requirement": null
    }
  ],
  "137": [
    {
      "id": 473,
      "from_digimon_id": 137,
      "to_digimon_id": 145,
      "level_required": 26,
      "stat_requirements": {
        "def": 110
      },
      "dna_requirement": null
    },
    {
      "id": 477,
      "from_digimon_id": 137,
      "to_digimon_id": 161,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 80,
        "spd": 70
      },
      "dna_requirement": null
    },
    {
      "id": 474,
      "from_digimon_id": 137,
      "to_digimon_id": 160,
      "level_required": 26,
      "stat_requirements": {
        "hp": 400,
        "atk": 95
      },
      "dna_requirement": null
    },
    {
      "id": 476,
      "from_digimon_id": 137,
      "to_digimon_id": 203,
      "level_required": 30,
      "stat_requirements": {
        "hp": 350,
        "atk": 100
      },
      "dna_requirement": null
    },
    {
      "id": 475,
      "from_digimon_id": 137,
      "to_digimon_id": 185,
      "level_required": 28,
      "stat_requirements": {
        "hp": 350,
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    }
  ],
  "138": [
    {
      "id": 828,
      "from_digimon_id": 138,
      "to_digimon_id": 162,
      "level_required": 30,
      "stat_requirements": {
        "sp": 60,
        "atk": 70
      },
      "dna_requirement": null
    },
    {
      "id": 830,
      "from_digimon_id": 138,
      "to_digimon_id": 198,
      "level_required": 26,
      "stat_requirements": {
        "atk": 75,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 829,
      "from_digimon_id": 138,
      "to_digimon_id": 143,
      "level_required": 28,
      "stat_requirements": {
        "atk": 65,
        "int": 75,
        "spd": 85
      },
      "dna_requirement": null
    }
  ],
  "139": [
    {
      "id": 478,
      "from_digimon_id": 139,
      "to_digimon_id": 174,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 480,
      "from_digimon_id": 139,
      "to_digimon_id": 211,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 479,
      "from_digimon_id": 139,
      "to_digimon_id": 188,
      "level_required": 26,
      "stat_requirements": {
        "sp": 75,
        "int": 80,
        "spd": 80
      },
      "dna_requirement": null
    }
  ],
  "140": [
    {
      "id": 481,
      "from_digimon_id": 140,
      "to_digimon_id": 141,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "def": 95
      },
      "dna_requirement": null
    },
    {
      "id": 482,
      "from_digimon_id": 140,
      "to_digimon_id": 153,
      "level_required": 26,
      "stat_requirements": {
        "atk": 95,
        "def": 90
      },
      "dna_requirement": null
    },
    {
      "id": 484,
      "from_digimon_id": 140,
      "to_digimon_id": 211,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 483,
      "from_digimon_id": 140,
      "to_digimon_id": 158,
      "level_required": 28,
      "stat_requirements": {
        "def": 75,
        "spd": 75
      },
      "dna_requirement": null
    }
  ],
  "141": [
    {
      "id": 487,
      "from_digimon_id": 141,
      "to_digimon_id": 285,
      "level_required": 55,
      "stat_requirements": {
        "hp": 900,
        "sp": 120,
        "abi": 20,
        "int": 145
      },
      "dna_requirement": null
    },
    {
      "id": 485,
      "from_digimon_id": 141,
      "to_digimon_id": 237,
      "level_required": 45,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 120,
        "def": 120
      },
      "dna_requirement": null
    },
    {
      "id": 486,
      "from_digimon_id": 141,
      "to_digimon_id": 280,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1100,
        "abi": 20,
        "def": 150,
        "int": 120
      },
      "dna_requirement": null
    }
  ],
  "142": [
    {
      "id": 831,
      "from_digimon_id": 142,
      "to_digimon_id": 218,
      "level_required": 60,
      "stat_requirements": {
        "sp": 130,
        "abi": 40,
        "atk": 200,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 833,
      "from_digimon_id": 142,
      "to_digimon_id": 261,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1600,
        "abi": 80,
        "atk": 230,
        "int": 160
      },
      "dna_requirement": null
    },
    {
      "id": 832,
      "from_digimon_id": 142,
      "to_digimon_id": 260,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1100,
        "abi": 20,
        "atk": 180,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "143": [
    {
      "id": 489,
      "from_digimon_id": 143,
      "to_digimon_id": 259,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "def": 120,
        "int": 130,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 491,
      "from_digimon_id": 143,
      "to_digimon_id": 242,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1100,
        "sp": 100,
        "abi": 40,
        "int": 100
      },
      "dna_requirement": null
    },
    {
      "id": 490,
      "from_digimon_id": 143,
      "to_digimon_id": 260,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1100,
        "abi": 20,
        "atk": 180,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 488,
      "from_digimon_id": 143,
      "to_digimon_id": 243,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 40,
        "int": 145,
        "spd": 100
      },
      "dna_requirement": null
    }
  ],
  "144": [
    {
      "id": 492,
      "from_digimon_id": 144,
      "to_digimon_id": 241,
      "level_required": 60,
      "stat_requirements": {
        "sp": 110,
        "abi": 80,
        "def": 180,
        "int": 140
      },
      "dna_requirement": null
    },
    {
      "id": 494,
      "from_digimon_id": 144,
      "to_digimon_id": 269,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 100,
        "def": 130,
        "int": 100
      },
      "dna_requirement": null
    },
    {
      "id": 493,
      "from_digimon_id": 144,
      "to_digimon_id": 256,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1000,
        "abi": 20,
        "atk": 120,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "145": [
    {
      "id": 495,
      "from_digimon_id": 145,
      "to_digimon_id": 221,
      "level_required": 45,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 496,
      "from_digimon_id": 145,
      "to_digimon_id": 259,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "def": 120,
        "int": 130,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 497,
      "from_digimon_id": 145,
      "to_digimon_id": 296,
      "level_required": 45,
      "stat_requirements": {
        "sp": 100,
        "abi": 20,
        "atk": 120,
        "def": 140
      },
      "dna_requirement": null
    }
  ],
  "146": [
    {
      "id": 499,
      "from_digimon_id": 146,
      "to_digimon_id": 260,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1100,
        "abi": 20,
        "atk": 180,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 500,
      "from_digimon_id": 146,
      "to_digimon_id": 281,
      "level_required": 60,
      "stat_requirements": {
        "hp": 2000,
        "abi": 80,
        "atk": 250,
        "spd": 150
      },
      "dna_requirement": null
    },
    {
      "id": 501,
      "from_digimon_id": 146,
      "to_digimon_id": 218,
      "level_required": 60,
      "stat_requirements": {
        "sp": 130,
        "abi": 40,
        "atk": 200,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 498,
      "from_digimon_id": 146,
      "to_digimon_id": 227,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1200,
        "sp": 110,
        "abi": 40,
        "atk": 110,
        "int": 110
      },
      "dna_requirement": null
    }
  ],
  "147": [
    {
      "id": 502,
      "from_digimon_id": 147,
      "to_digimon_id": 227,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1200,
        "sp": 110,
        "abi": 40,
        "atk": 110,
        "int": 110
      },
      "dna_requirement": null
    },
    {
      "id": 503,
      "from_digimon_id": 147,
      "to_digimon_id": 271,
      "level_required": 60,
      "stat_requirements": {
        "sp": 160,
        "abi": 80,
        "def": 120,
        "int": 200
      },
      "dna_requirement": null
    },
    {
      "id": 506,
      "from_digimon_id": 147,
      "to_digimon_id": 238,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1300,
        "abi": 40,
        "atk": 110,
        "int": 110
      },
      "dna_requirement": null
    },
    {
      "id": 505,
      "from_digimon_id": 147,
      "to_digimon_id": 218,
      "level_required": 60,
      "stat_requirements": {
        "sp": 130,
        "abi": 40,
        "atk": 200,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 504,
      "from_digimon_id": 147,
      "to_digimon_id": 273,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "int": 160,
        "spd": 110
      },
      "dna_requirement": null
    }
  ],
  "148": [
    {
      "id": 835,
      "from_digimon_id": 148,
      "to_digimon_id": 220,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 120,
        "spd": 145
      },
      "dna_requirement": null
    },
    {
      "id": 834,
      "from_digimon_id": 148,
      "to_digimon_id": 252,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 130,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 836,
      "from_digimon_id": 148,
      "to_digimon_id": 263,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1200,
        "abi": 80,
        "atk": 140,
        "def": 120,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "149": [
    {
      "id": 837,
      "from_digimon_id": 149,
      "to_digimon_id": 231,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 150,
        "def": 120
      },
      "dna_requirement": null
    }
  ],
  "150": [
    {
      "id": 510,
      "from_digimon_id": 150,
      "to_digimon_id": 244,
      "level_required": 55,
      "stat_requirements": {
        "abi": 40,
        "atk": 130,
        "def": 120,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 507,
      "from_digimon_id": 150,
      "to_digimon_id": 220,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 120,
        "spd": 145
      },
      "dna_requirement": null
    },
    {
      "id": 509,
      "from_digimon_id": 150,
      "to_digimon_id": 304,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "spd": 160
      },
      "dna_requirement": null
    },
    {
      "id": 508,
      "from_digimon_id": 150,
      "to_digimon_id": 263,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1200,
        "abi": 80,
        "atk": 140,
        "def": 120,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "151": [
    {
      "id": 511,
      "from_digimon_id": 151,
      "to_digimon_id": 273,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "int": 160,
        "spd": 110
      },
      "dna_requirement": null
    },
    {
      "id": 512,
      "from_digimon_id": 151,
      "to_digimon_id": 275,
      "level_required": 65,
      "stat_requirements": {
        "abi": 10
      },
      "dna_requirement": null
    },
    {
      "id": 513,
      "from_digimon_id": 151,
      "to_digimon_id": 296,
      "level_required": 45,
      "stat_requirements": {
        "sp": 100,
        "abi": 20,
        "atk": 120,
        "def": 140
      },
      "dna_requirement": null
    },
    {
      "id": 514,
      "from_digimon_id": 151,
      "to_digimon_id": 235,
      "level_required": 45,
      "stat_requirements": {
        "abi": 20,
        "atk": 110,
        "def": 130,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 515,
      "from_digimon_id": 151,
      "to_digimon_id": 270,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 135
      },
      "dna_requirement": null
    }
  ],
  "152": [
    {
      "id": 518,
      "from_digimon_id": 152,
      "to_digimon_id": 289,
      "level_required": 60,
      "stat_requirements": {
        "sp": 120,
        "abi": 80,
        "atk": 120,
        "int": 120
      },
      "dna_requirement": 214
    },
    {
      "id": 516,
      "from_digimon_id": 152,
      "to_digimon_id": 229,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 40,
        "def": 120,
        "int": 145
      },
      "dna_requirement": null
    },
    {
      "id": 517,
      "from_digimon_id": 152,
      "to_digimon_id": 285,
      "level_required": 55,
      "stat_requirements": {
        "hp": 900,
        "sp": 120,
        "abi": 20,
        "int": 145
      },
      "dna_requirement": null
    },
    {
      "id": 519,
      "from_digimon_id": 152,
      "to_digimon_id": 225,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "int": 130,
        "spd": 160
      },
      "dna_requirement": null
    }
  ],
  "153": [
    {
      "id": 522,
      "from_digimon_id": 153,
      "to_digimon_id": 280,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1100,
        "abi": 20,
        "def": 150,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 520,
      "from_digimon_id": 153,
      "to_digimon_id": 237,
      "level_required": 45,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 120,
        "def": 120
      },
      "dna_requirement": null
    },
    {
      "id": 521,
      "from_digimon_id": 153,
      "to_digimon_id": 260,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1100,
        "abi": 20,
        "atk": 180,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "154": [
    {
      "id": 527,
      "from_digimon_id": 154,
      "to_digimon_id": 240,
      "level_required": 50,
      "stat_requirements": {
        "sp": 110,
        "abi": 20,
        "int": 140
      },
      "dna_requirement": null
    },
    {
      "id": 524,
      "from_digimon_id": 154,
      "to_digimon_id": 284,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "int": 130,
        "spd": 150
      },
      "dna_requirement": null
    },
    {
      "id": 526,
      "from_digimon_id": 154,
      "to_digimon_id": 226,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 40,
        "int": 145,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 523,
      "from_digimon_id": 154,
      "to_digimon_id": 250,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1000,
        "abi": 20,
        "atk": 130,
        "def": 110
      },
      "dna_requirement": null
    },
    {
      "id": 525,
      "from_digimon_id": 154,
      "to_digimon_id": 304,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "spd": 160
      },
      "dna_requirement": null
    }
  ],
  "155": [
    {
      "id": 838,
      "from_digimon_id": 155,
      "to_digimon_id": 287,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "spd": 160
      },
      "dna_requirement": null
    }
  ],
  "156": [
    {
      "id": 531,
      "from_digimon_id": 156,
      "to_digimon_id": 255,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 150,
        "def": 140
      },
      "dna_requirement": null
    },
    {
      "id": 528,
      "from_digimon_id": 156,
      "to_digimon_id": 239,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "def": 160,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 529,
      "from_digimon_id": 156,
      "to_digimon_id": 294,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 130,
        "def": 130
      },
      "dna_requirement": null
    },
    {
      "id": 533,
      "from_digimon_id": 156,
      "to_digimon_id": 295,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1700,
        "abi": 40,
        "atk": 180
      },
      "dna_requirement": null
    },
    {
      "id": 530,
      "from_digimon_id": 156,
      "to_digimon_id": 299,
      "level_required": 50,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "def": 120,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 532,
      "from_digimon_id": 156,
      "to_digimon_id": 267,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1600,
        "abi": 20,
        "atk": 160
      },
      "dna_requirement": null
    }
  ],
  "157": [
    {
      "id": 839,
      "from_digimon_id": 157,
      "to_digimon_id": 250,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1000,
        "abi": 20,
        "atk": 130,
        "def": 110
      },
      "dna_requirement": null
    },
    {
      "id": 840,
      "from_digimon_id": 157,
      "to_digimon_id": 274,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "def": 130,
        "int": 130
      },
      "dna_requirement": null
    },
    {
      "id": 841,
      "from_digimon_id": 157,
      "to_digimon_id": 277,
      "level_required": 45,
      "stat_requirements": {
        "abi": 20,
        "def": 150
      },
      "dna_requirement": null
    }
  ],
  "158": [
    {
      "id": 535,
      "from_digimon_id": 158,
      "to_digimon_id": 254,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "def": 130,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 534,
      "from_digimon_id": 158,
      "to_digimon_id": 239,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "def": 160,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 536,
      "from_digimon_id": 158,
      "to_digimon_id": 256,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1000,
        "abi": 20,
        "atk": 120,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "159": [
    {
      "id": 842,
      "from_digimon_id": 159,
      "to_digimon_id": 278,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 160,
        "def": 140
      },
      "dna_requirement": null
    },
    {
      "id": 843,
      "from_digimon_id": 159,
      "to_digimon_id": 295,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1700,
        "abi": 40,
        "atk": 180
      },
      "dna_requirement": null
    },
    {
      "id": 844,
      "from_digimon_id": 159,
      "to_digimon_id": 224,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1700,
        "abi": 20,
        "atk": 130,
        "def": 130,
        "int": 120
      },
      "dna_requirement": null
    }
  ],
  "160": [
    {
      "id": 539,
      "from_digimon_id": 160,
      "to_digimon_id": 272,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 130
      },
      "dna_requirement": null
    },
    {
      "id": 940,
      "from_digimon_id": 160,
      "to_digimon_id": 366,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "def": 130,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 537,
      "from_digimon_id": 160,
      "to_digimon_id": 245,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 145,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 538,
      "from_digimon_id": 160,
      "to_digimon_id": 265,
      "level_required": 60,
      "stat_requirements": {
        "sp": 100,
        "abi": 80,
        "int": 120,
        "spd": 140
      },
      "dna_requirement": null
    },
    {
      "id": 540,
      "from_digimon_id": 160,
      "to_digimon_id": 270,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 135
      },
      "dna_requirement": null
    }
  ],
  "161": [
    {
      "id": 847,
      "from_digimon_id": 161,
      "to_digimon_id": 219,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 150,
        "def": 170,
        "int": 135
      },
      "dna_requirement": null
    },
    {
      "id": 846,
      "from_digimon_id": 161,
      "to_digimon_id": 267,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1600,
        "abi": 20,
        "atk": 160
      },
      "dna_requirement": null
    },
    {
      "id": 848,
      "from_digimon_id": 161,
      "to_digimon_id": 256,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1000,
        "abi": 20,
        "atk": 120,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 845,
      "from_digimon_id": 161,
      "to_digimon_id": 264,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 140,
        "def": 120
      },
      "dna_requirement": null
    },
    {
      "id": 849,
      "from_digimon_id": 161,
      "to_digimon_id": 331,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 180
      },
      "dna_requirement": null
    }
  ],
  "162": [
    {
      "id": 852,
      "from_digimon_id": 162,
      "to_digimon_id": 259,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "def": 120,
        "int": 130,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 850,
      "from_digimon_id": 162,
      "to_digimon_id": 243,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 40,
        "int": 145,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 851,
      "from_digimon_id": 162,
      "to_digimon_id": 251,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "def": 140,
        "int": 120,
        "spd": 150
      },
      "dna_requirement": null
    }
  ],
  "163": [
    {
      "id": 543,
      "from_digimon_id": 163,
      "to_digimon_id": 257,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1400,
        "abi": 20,
        "atk": 150,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 541,
      "from_digimon_id": 163,
      "to_digimon_id": 219,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 150,
        "def": 170,
        "int": 135
      },
      "dna_requirement": null
    },
    {
      "id": 542,
      "from_digimon_id": 163,
      "to_digimon_id": 250,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1000,
        "abi": 20,
        "atk": 130,
        "def": 110
      },
      "dna_requirement": null
    }
  ],
  "164": [
    {
      "id": 545,
      "from_digimon_id": 164,
      "to_digimon_id": 232,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 130,
        "def": 130,
        "int": 130
      },
      "dna_requirement": null
    },
    {
      "id": 544,
      "from_digimon_id": 164,
      "to_digimon_id": 224,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1700,
        "abi": 20,
        "atk": 130,
        "def": 130,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 546,
      "from_digimon_id": 164,
      "to_digimon_id": 243,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 40,
        "int": 145,
        "spd": 100
      },
      "dna_requirement": null
    }
  ],
  "165": [
    {
      "id": 549,
      "from_digimon_id": 165,
      "to_digimon_id": 274,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "def": 130,
        "int": 130
      },
      "dna_requirement": null
    },
    {
      "id": 548,
      "from_digimon_id": 165,
      "to_digimon_id": 237,
      "level_required": 45,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 120,
        "def": 120
      },
      "dna_requirement": null
    },
    {
      "id": 547,
      "from_digimon_id": 165,
      "to_digimon_id": 236,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 135,
        "spd": 120
      },
      "dna_requirement": null
    }
  ],
  "166": [
    {
      "id": 551,
      "from_digimon_id": 166,
      "to_digimon_id": 263,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1200,
        "abi": 80,
        "atk": 140,
        "def": 120,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 550,
      "from_digimon_id": 166,
      "to_digimon_id": 246,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 120,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 552,
      "from_digimon_id": 166,
      "to_digimon_id": 284,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "int": 130,
        "spd": 150
      },
      "dna_requirement": null
    },
    {
      "id": 554,
      "from_digimon_id": 166,
      "to_digimon_id": 240,
      "level_required": 50,
      "stat_requirements": {
        "sp": 110,
        "abi": 20,
        "int": 140
      },
      "dna_requirement": null
    },
    {
      "id": 553,
      "from_digimon_id": 166,
      "to_digimon_id": 225,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "int": 130,
        "spd": 160
      },
      "dna_requirement": null
    }
  ],
  "167": [
    {
      "id": 555,
      "from_digimon_id": 167,
      "to_digimon_id": 234,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1700,
        "abi": 80,
        "atk": 145,
        "def": 120
      },
      "dna_requirement": null
    },
    {
      "id": 557,
      "from_digimon_id": 167,
      "to_digimon_id": 275,
      "level_required": 65,
      "stat_requirements": {
        "abi": 10
      },
      "dna_requirement": null
    },
    {
      "id": 556,
      "from_digimon_id": 167,
      "to_digimon_id": 250,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1000,
        "abi": 20,
        "atk": 130,
        "def": 110
      },
      "dna_requirement": null
    }
  ],
  "168": [
    {
      "id": 559,
      "from_digimon_id": 168,
      "to_digimon_id": 257,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1400,
        "abi": 20,
        "atk": 150,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 558,
      "from_digimon_id": 168,
      "to_digimon_id": 248,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 140,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 560,
      "from_digimon_id": 168,
      "to_digimon_id": 261,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1600,
        "abi": 80,
        "atk": 230,
        "int": 160
      },
      "dna_requirement": null
    }
  ],
  "169": [
    {
      "id": 854,
      "from_digimon_id": 169,
      "to_digimon_id": 260,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1100,
        "abi": 20,
        "atk": 180,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 853,
      "from_digimon_id": 169,
      "to_digimon_id": 238,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1300,
        "abi": 40,
        "atk": 110,
        "int": 110
      },
      "dna_requirement": null
    },
    {
      "id": 855,
      "from_digimon_id": 169,
      "to_digimon_id": 261,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1600,
        "abi": 80,
        "atk": 230,
        "int": 160
      },
      "dna_requirement": null
    }
  ],
  "170": [
    {
      "id": 564,
      "from_digimon_id": 170,
      "to_digimon_id": 279,
      "level_required": 50,
      "stat_requirements": {
        "sp": 100,
        "abi": 20,
        "def": 120,
        "int": 145
      },
      "dna_requirement": null
    },
    {
      "id": 561,
      "from_digimon_id": 170,
      "to_digimon_id": 224,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1700,
        "abi": 20,
        "atk": 130,
        "def": 130,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 563,
      "from_digimon_id": 170,
      "to_digimon_id": 297,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "def": 120,
        "spd": 150
      },
      "dna_requirement": null
    },
    {
      "id": 562,
      "from_digimon_id": 170,
      "to_digimon_id": 290,
      "level_required": 50,
      "stat_requirements": {
        "sp": 110,
        "abi": 20,
        "int": 135
      },
      "dna_requirement": null
    }
  ],
  "171": [
    {
      "id": 856,
      "from_digimon_id": 171,
      "to_digimon_id": 252,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 130,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 858,
      "from_digimon_id": 171,
      "to_digimon_id": 247,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 180,
        "spd": 180
      },
      "dna_requirement": null
    },
    {
      "id": 857,
      "from_digimon_id": 171,
      "to_digimon_id": 225,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "int": 130,
        "spd": 160
      },
      "dna_requirement": null
    }
  ],
  "172": [
    {
      "id": 565,
      "from_digimon_id": 172,
      "to_digimon_id": 236,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 135,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 567,
      "from_digimon_id": 172,
      "to_digimon_id": 259,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "def": 120,
        "int": 130,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 566,
      "from_digimon_id": 172,
      "to_digimon_id": 246,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 120,
        "spd": 120
      },
      "dna_requirement": null
    }
  ],
  "173": [
    {
      "id": 860,
      "from_digimon_id": 173,
      "to_digimon_id": 221,
      "level_required": 45,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 861,
      "from_digimon_id": 173,
      "to_digimon_id": 302,
      "level_required": 60,
      "stat_requirements": {
        "hp": 2000,
        "sp": 140,
        "abi": 80,
        "atk": 140,
        "def": 140,
        "int": 140
      },
      "dna_requirement": null
    },
    {
      "id": 859,
      "from_digimon_id": 173,
      "to_digimon_id": 268,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1000,
        "sp": 100,
        "abi": 20,
        "int": 130
      },
      "dna_requirement": null
    }
  ],
  "174": [
    {
      "id": 568,
      "from_digimon_id": 174,
      "to_digimon_id": 251,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "def": 140,
        "int": 120,
        "spd": 150
      },
      "dna_requirement": null
    },
    {
      "id": 569,
      "from_digimon_id": 174,
      "to_digimon_id": 253,
      "level_required": 55,
      "stat_requirements": {
        "sp": 130,
        "abi": 40,
        "def": 130,
        "int": 150
      },
      "dna_requirement": null
    },
    {
      "id": 570,
      "from_digimon_id": 174,
      "to_digimon_id": 297,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "def": 120,
        "spd": 150
      },
      "dna_requirement": null
    }
  ],
  "175": [
    {
      "id": 862,
      "from_digimon_id": 175,
      "to_digimon_id": 222,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1600,
        "abi": 20,
        "def": 150,
        "spd": 150
      },
      "dna_requirement": null
    },
    {
      "id": 863,
      "from_digimon_id": 175,
      "to_digimon_id": 237,
      "level_required": 45,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 120,
        "def": 120
      },
      "dna_requirement": null
    }
  ],
  "176": [
    {
      "id": 571,
      "from_digimon_id": 176,
      "to_digimon_id": 257,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1400,
        "abi": 20,
        "atk": 150,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 573,
      "from_digimon_id": 176,
      "to_digimon_id": 291,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 150,
        "spd": 140
      },
      "dna_requirement": null
    },
    {
      "id": 572,
      "from_digimon_id": 176,
      "to_digimon_id": 283,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1700,
        "sp": 140,
        "abi": 80,
        "int": 180
      },
      "dna_requirement": null
    }
  ],
  "177": [
    {
      "id": 576,
      "from_digimon_id": 177,
      "to_digimon_id": 286,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 145,
        "def": 100
      },
      "dna_requirement": null
    },
    {
      "id": 574,
      "from_digimon_id": 177,
      "to_digimon_id": 234,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1700,
        "abi": 80,
        "atk": 145,
        "def": 120
      },
      "dna_requirement": null
    },
    {
      "id": 575,
      "from_digimon_id": 177,
      "to_digimon_id": 281,
      "level_required": 60,
      "stat_requirements": {
        "hp": 2000,
        "abi": 80,
        "atk": 250,
        "spd": 150
      },
      "dna_requirement": null
    }
  ],
  "178": [
    {
      "id": 864,
      "from_digimon_id": 178,
      "to_digimon_id": 264,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 140,
        "def": 120
      },
      "dna_requirement": null
    },
    {
      "id": 865,
      "from_digimon_id": 178,
      "to_digimon_id": 256,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1000,
        "abi": 20,
        "atk": 120,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 866,
      "from_digimon_id": 178,
      "to_digimon_id": 247,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 180,
        "spd": 180
      },
      "dna_requirement": null
    }
  ],
  "179": [
    {
      "id": 580,
      "from_digimon_id": 179,
      "to_digimon_id": 235,
      "level_required": 45,
      "stat_requirements": {
        "abi": 20,
        "atk": 110,
        "def": 130,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 578,
      "from_digimon_id": 179,
      "to_digimon_id": 279,
      "level_required": 50,
      "stat_requirements": {
        "sp": 100,
        "abi": 20,
        "def": 120,
        "int": 145
      },
      "dna_requirement": null
    },
    {
      "id": 577,
      "from_digimon_id": 179,
      "to_digimon_id": 224,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1700,
        "abi": 20,
        "atk": 130,
        "def": 130,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 579,
      "from_digimon_id": 179,
      "to_digimon_id": 302,
      "level_required": 60,
      "stat_requirements": {
        "hp": 2000,
        "sp": 140,
        "abi": 80,
        "atk": 140,
        "def": 140,
        "int": 140
      },
      "dna_requirement": null
    }
  ],
  "180": [
    {
      "id": 868,
      "from_digimon_id": 180,
      "to_digimon_id": 237,
      "level_required": 45,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 120,
        "def": 120
      },
      "dna_requirement": null
    },
    {
      "id": 867,
      "from_digimon_id": 180,
      "to_digimon_id": 278,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 160,
        "def": 140
      },
      "dna_requirement": null
    },
    {
      "id": 869,
      "from_digimon_id": 180,
      "to_digimon_id": 245,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 145,
        "spd": 120
      },
      "dna_requirement": null
    }
  ],
  "181": [
    {
      "id": 582,
      "from_digimon_id": 181,
      "to_digimon_id": 251,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "def": 140,
        "int": 120,
        "spd": 150
      },
      "dna_requirement": null
    },
    {
      "id": 581,
      "from_digimon_id": 181,
      "to_digimon_id": 219,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 150,
        "def": 170,
        "int": 135
      },
      "dna_requirement": null
    },
    {
      "id": 583,
      "from_digimon_id": 181,
      "to_digimon_id": 267,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1600,
        "abi": 20,
        "atk": 160
      },
      "dna_requirement": null
    }
  ],
  "182": [
    {
      "id": 584,
      "from_digimon_id": 182,
      "to_digimon_id": 241,
      "level_required": 60,
      "stat_requirements": {
        "sp": 110,
        "abi": 80,
        "def": 180,
        "int": 140
      },
      "dna_requirement": null
    },
    {
      "id": 586,
      "from_digimon_id": 182,
      "to_digimon_id": 306,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 120,
        "int": 135,
        "spd": 150
      },
      "dna_requirement": null
    },
    {
      "id": 585,
      "from_digimon_id": 182,
      "to_digimon_id": 265,
      "level_required": 60,
      "stat_requirements": {
        "sp": 100,
        "abi": 80,
        "int": 120,
        "spd": 140
      },
      "dna_requirement": null
    },
    {
      "id": 587,
      "from_digimon_id": 182,
      "to_digimon_id": 264,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 140,
        "def": 120
      },
      "dna_requirement": null
    }
  ],
  "183": [
    {
      "id": 589,
      "from_digimon_id": 183,
      "to_digimon_id": 294,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 130,
        "def": 130
      },
      "dna_requirement": null
    },
    {
      "id": 588,
      "from_digimon_id": 183,
      "to_digimon_id": 239,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "def": 160,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 590,
      "from_digimon_id": 183,
      "to_digimon_id": 298,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "def": 135,
        "spd": 125
      },
      "dna_requirement": null
    }
  ],
  "184": [
    {
      "id": 591,
      "from_digimon_id": 184,
      "to_digimon_id": 222,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1600,
        "abi": 20,
        "def": 150,
        "spd": 150
      },
      "dna_requirement": null
    }
  ],
  "185": [
    {
      "id": 593,
      "from_digimon_id": 185,
      "to_digimon_id": 272,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 130
      },
      "dna_requirement": null
    },
    {
      "id": 592,
      "from_digimon_id": 185,
      "to_digimon_id": 245,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 145,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 594,
      "from_digimon_id": 185,
      "to_digimon_id": 292,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "186": [
    {
      "id": 870,
      "from_digimon_id": 186,
      "to_digimon_id": 235,
      "level_required": 45,
      "stat_requirements": {
        "abi": 20,
        "atk": 110,
        "def": 130,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 871,
      "from_digimon_id": 186,
      "to_digimon_id": 250,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1000,
        "abi": 20,
        "atk": 130,
        "def": 110
      },
      "dna_requirement": null
    },
    {
      "id": 872,
      "from_digimon_id": 186,
      "to_digimon_id": 272,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 130
      },
      "dna_requirement": null
    }
  ],
  "187": [
    {
      "id": 597,
      "from_digimon_id": 187,
      "to_digimon_id": 307,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 596,
      "from_digimon_id": 187,
      "to_digimon_id": 286,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 145,
        "def": 100
      },
      "dna_requirement": null
    },
    {
      "id": 595,
      "from_digimon_id": 187,
      "to_digimon_id": 274,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "def": 130,
        "int": 130
      },
      "dna_requirement": null
    }
  ],
  "188": [
    {
      "id": 598,
      "from_digimon_id": 188,
      "to_digimon_id": 229,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 40,
        "def": 120,
        "int": 145
      },
      "dna_requirement": null
    },
    {
      "id": 600,
      "from_digimon_id": 188,
      "to_digimon_id": 290,
      "level_required": 50,
      "stat_requirements": {
        "sp": 110,
        "abi": 20,
        "int": 135
      },
      "dna_requirement": null
    },
    {
      "id": 599,
      "from_digimon_id": 188,
      "to_digimon_id": 284,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "int": 130,
        "spd": 150
      },
      "dna_requirement": null
    }
  ],
  "189": [
    {
      "id": 874,
      "from_digimon_id": 189,
      "to_digimon_id": 240,
      "level_required": 50,
      "stat_requirements": {
        "sp": 110,
        "abi": 20,
        "int": 140
      },
      "dna_requirement": null
    },
    {
      "id": 875,
      "from_digimon_id": 189,
      "to_digimon_id": 253,
      "level_required": 55,
      "stat_requirements": {
        "sp": 130,
        "abi": 40,
        "def": 130,
        "int": 150
      },
      "dna_requirement": null
    },
    {
      "id": 873,
      "from_digimon_id": 189,
      "to_digimon_id": 226,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 40,
        "int": 145,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "190": [
    {
      "id": 876,
      "from_digimon_id": 190,
      "to_digimon_id": 227,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1200,
        "sp": 110,
        "abi": 40,
        "atk": 110,
        "int": 110
      },
      "dna_requirement": null
    },
    {
      "id": 878,
      "from_digimon_id": 190,
      "to_digimon_id": 271,
      "level_required": 60,
      "stat_requirements": {
        "sp": 160,
        "abi": 80,
        "def": 120,
        "int": 200
      },
      "dna_requirement": null
    },
    {
      "id": 877,
      "from_digimon_id": 190,
      "to_digimon_id": 257,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1400,
        "abi": 20,
        "atk": 150,
        "int": 120
      },
      "dna_requirement": null
    }
  ],
  "191": [
    {
      "id": 602,
      "from_digimon_id": 191,
      "to_digimon_id": 277,
      "level_required": 45,
      "stat_requirements": {
        "abi": 20,
        "def": 150
      },
      "dna_requirement": null
    },
    {
      "id": 603,
      "from_digimon_id": 191,
      "to_digimon_id": 296,
      "level_required": 45,
      "stat_requirements": {
        "sp": 100,
        "abi": 20,
        "atk": 120,
        "def": 140
      },
      "dna_requirement": null
    },
    {
      "id": 601,
      "from_digimon_id": 191,
      "to_digimon_id": 275,
      "level_required": 65,
      "stat_requirements": {
        "abi": 10
      },
      "dna_requirement": null
    }
  ],
  "192": [
    {
      "id": 605,
      "from_digimon_id": 192,
      "to_digimon_id": 271,
      "level_required": 60,
      "stat_requirements": {
        "sp": 160,
        "abi": 80,
        "def": 120,
        "int": 200
      },
      "dna_requirement": null
    },
    {
      "id": 606,
      "from_digimon_id": 192,
      "to_digimon_id": 286,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 145,
        "def": 100
      },
      "dna_requirement": null
    },
    {
      "id": 607,
      "from_digimon_id": 192,
      "to_digimon_id": 255,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 150,
        "def": 140
      },
      "dna_requirement": null
    },
    {
      "id": 604,
      "from_digimon_id": 192,
      "to_digimon_id": 261,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1600,
        "abi": 80,
        "atk": 230,
        "int": 160
      },
      "dna_requirement": null
    }
  ],
  "193": [
    {
      "id": 609,
      "from_digimon_id": 193,
      "to_digimon_id": 269,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 100,
        "def": 130,
        "int": 100
      },
      "dna_requirement": null
    },
    {
      "id": 608,
      "from_digimon_id": 193,
      "to_digimon_id": 221,
      "level_required": 45,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 610,
      "from_digimon_id": 193,
      "to_digimon_id": 280,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1100,
        "abi": 20,
        "def": 150,
        "int": 120
      },
      "dna_requirement": null
    }
  ],
  "194": [
    {
      "id": 613,
      "from_digimon_id": 194,
      "to_digimon_id": 299,
      "level_required": 50,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "def": 120,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 612,
      "from_digimon_id": 194,
      "to_digimon_id": 290,
      "level_required": 50,
      "stat_requirements": {
        "sp": 110,
        "abi": 20,
        "int": 135
      },
      "dna_requirement": null
    },
    {
      "id": 614,
      "from_digimon_id": 194,
      "to_digimon_id": 268,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1000,
        "sp": 100,
        "abi": 20,
        "int": 130
      },
      "dna_requirement": null
    },
    {
      "id": 611,
      "from_digimon_id": 194,
      "to_digimon_id": 279,
      "level_required": 50,
      "stat_requirements": {
        "sp": 100,
        "abi": 20,
        "def": 120,
        "int": 145
      },
      "dna_requirement": null
    }
  ],
  "195": [
    {
      "id": 617,
      "from_digimon_id": 195,
      "to_digimon_id": 306,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 120,
        "int": 135,
        "spd": 150
      },
      "dna_requirement": null
    },
    {
      "id": 616,
      "from_digimon_id": 195,
      "to_digimon_id": 253,
      "level_required": 55,
      "stat_requirements": {
        "sp": 130,
        "abi": 40,
        "def": 130,
        "int": 150
      },
      "dna_requirement": null
    },
    {
      "id": 619,
      "from_digimon_id": 195,
      "to_digimon_id": 244,
      "level_required": 55,
      "stat_requirements": {
        "abi": 40,
        "atk": 130,
        "def": 120,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 618,
      "from_digimon_id": 195,
      "to_digimon_id": 225,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "int": 130,
        "spd": 160
      },
      "dna_requirement": null
    },
    {
      "id": 615,
      "from_digimon_id": 195,
      "to_digimon_id": 248,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 140,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "196": [
    {
      "id": 941,
      "from_digimon_id": 196,
      "to_digimon_id": 366,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "def": 130,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 880,
      "from_digimon_id": 196,
      "to_digimon_id": 234,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1700,
        "abi": 80,
        "atk": 145,
        "def": 120
      },
      "dna_requirement": null
    },
    {
      "id": 881,
      "from_digimon_id": 196,
      "to_digimon_id": 296,
      "level_required": 45,
      "stat_requirements": {
        "sp": 100,
        "abi": 20,
        "atk": 120,
        "def": 140
      },
      "dna_requirement": null
    },
    {
      "id": 879,
      "from_digimon_id": 196,
      "to_digimon_id": 270,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 135
      },
      "dna_requirement": null
    }
  ],
  "197": [
    {
      "id": 884,
      "from_digimon_id": 197,
      "to_digimon_id": 273,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "int": 160,
        "spd": 110
      },
      "dna_requirement": null
    },
    {
      "id": 882,
      "from_digimon_id": 197,
      "to_digimon_id": 238,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1300,
        "abi": 40,
        "atk": 110,
        "int": 110
      },
      "dna_requirement": null
    },
    {
      "id": 883,
      "from_digimon_id": 197,
      "to_digimon_id": 227,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1200,
        "sp": 110,
        "abi": 40,
        "atk": 110,
        "int": 110
      },
      "dna_requirement": null
    }
  ],
  "198": [
    {
      "id": 621,
      "from_digimon_id": 198,
      "to_digimon_id": 272,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 130
      },
      "dna_requirement": null
    },
    {
      "id": 620,
      "from_digimon_id": 198,
      "to_digimon_id": 254,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "def": 130,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 622,
      "from_digimon_id": 198,
      "to_digimon_id": 292,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 623,
      "from_digimon_id": 198,
      "to_digimon_id": 300,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "int": 110,
        "spd": 160
      },
      "dna_requirement": null
    }
  ],
  "199": [
    {
      "id": 625,
      "from_digimon_id": 199,
      "to_digimon_id": 274,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "def": 130,
        "int": 130
      },
      "dna_requirement": null
    },
    {
      "id": 624,
      "from_digimon_id": 199,
      "to_digimon_id": 228,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1700,
        "abi": 20,
        "atk": 160,
        "def": 130
      },
      "dna_requirement": null
    },
    {
      "id": 626,
      "from_digimon_id": 199,
      "to_digimon_id": 277,
      "level_required": 45,
      "stat_requirements": {
        "abi": 20,
        "def": 150
      },
      "dna_requirement": null
    }
  ],
  "200": [
    {
      "id": 630,
      "from_digimon_id": 200,
      "to_digimon_id": 268,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1000,
        "sp": 100,
        "abi": 20,
        "int": 130
      },
      "dna_requirement": null
    },
    {
      "id": 628,
      "from_digimon_id": 200,
      "to_digimon_id": 299,
      "level_required": 50,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "def": 120,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 627,
      "from_digimon_id": 200,
      "to_digimon_id": 279,
      "level_required": 50,
      "stat_requirements": {
        "sp": 100,
        "abi": 20,
        "def": 120,
        "int": 145
      },
      "dna_requirement": null
    },
    {
      "id": 629,
      "from_digimon_id": 200,
      "to_digimon_id": 302,
      "level_required": 60,
      "stat_requirements": {
        "hp": 2000,
        "sp": 140,
        "abi": 80,
        "atk": 140,
        "def": 140,
        "int": 140
      },
      "dna_requirement": null
    }
  ],
  "201": [
    {
      "id": 632,
      "from_digimon_id": 201,
      "to_digimon_id": 276,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1800,
        "abi": 20,
        "atk": 140,
        "def": 140
      },
      "dna_requirement": null
    },
    {
      "id": 631,
      "from_digimon_id": 201,
      "to_digimon_id": 220,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 120,
        "spd": 145
      },
      "dna_requirement": null
    },
    {
      "id": 633,
      "from_digimon_id": 201,
      "to_digimon_id": 294,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 130,
        "def": 130
      },
      "dna_requirement": null
    },
    {
      "id": 635,
      "from_digimon_id": 201,
      "to_digimon_id": 295,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1700,
        "abi": 40,
        "atk": 180
      },
      "dna_requirement": null
    },
    {
      "id": 634,
      "from_digimon_id": 201,
      "to_digimon_id": 244,
      "level_required": 55,
      "stat_requirements": {
        "abi": 40,
        "atk": 130,
        "def": 120,
        "int": 120
      },
      "dna_requirement": null
    }
  ],
  "202": [
    {
      "id": 638,
      "from_digimon_id": 202,
      "to_digimon_id": 301,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 180,
        "def": 150
      },
      "dna_requirement": null
    },
    {
      "id": 640,
      "from_digimon_id": 202,
      "to_digimon_id": 295,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1700,
        "abi": 40,
        "atk": 180
      },
      "dna_requirement": null
    },
    {
      "id": 637,
      "from_digimon_id": 202,
      "to_digimon_id": 262,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 140,
        "def": 140,
        "int": 140
      },
      "dna_requirement": null
    },
    {
      "id": 639,
      "from_digimon_id": 202,
      "to_digimon_id": 255,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 150,
        "def": 140
      },
      "dna_requirement": null
    },
    {
      "id": 636,
      "from_digimon_id": 202,
      "to_digimon_id": 232,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 130,
        "def": 130,
        "int": 130
      },
      "dna_requirement": null
    }
  ],
  "203": [
    {
      "id": 642,
      "from_digimon_id": 203,
      "to_digimon_id": 230,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 100,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 641,
      "from_digimon_id": 203,
      "to_digimon_id": 228,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1700,
        "abi": 20,
        "atk": 160,
        "def": 130
      },
      "dna_requirement": null
    },
    {
      "id": 643,
      "from_digimon_id": 203,
      "to_digimon_id": 301,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 180,
        "def": 150
      },
      "dna_requirement": null
    }
  ],
  "204": [
    {
      "id": 914,
      "from_digimon_id": 204,
      "to_digimon_id": 342,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1800,
        "abi": 25,
        "atk": 180,
        "def": 150
      },
      "dna_requirement": null
    },
    {
      "id": 646,
      "from_digimon_id": 204,
      "to_digimon_id": 276,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1800,
        "abi": 20,
        "atk": 140,
        "def": 140
      },
      "dna_requirement": null
    },
    {
      "id": 644,
      "from_digimon_id": 204,
      "to_digimon_id": 228,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1700,
        "abi": 20,
        "atk": 160,
        "def": 130
      },
      "dna_requirement": null
    },
    {
      "id": 645,
      "from_digimon_id": 204,
      "to_digimon_id": 230,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 100,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 647,
      "from_digimon_id": 204,
      "to_digimon_id": 242,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1100,
        "sp": 100,
        "abi": 40,
        "int": 100
      },
      "dna_requirement": null
    }
  ],
  "205": [
    {
      "id": 650,
      "from_digimon_id": 205,
      "to_digimon_id": 301,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 180,
        "def": 150
      },
      "dna_requirement": null
    },
    {
      "id": 651,
      "from_digimon_id": 205,
      "to_digimon_id": 278,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 160,
        "def": 140
      },
      "dna_requirement": null
    },
    {
      "id": 648,
      "from_digimon_id": 205,
      "to_digimon_id": 276,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1800,
        "abi": 20,
        "atk": 140,
        "def": 140
      },
      "dna_requirement": null
    },
    {
      "id": 649,
      "from_digimon_id": 205,
      "to_digimon_id": 262,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 140,
        "def": 140,
        "int": 140
      },
      "dna_requirement": null
    }
  ],
  "206": [
    {
      "id": 654,
      "from_digimon_id": 206,
      "to_digimon_id": 277,
      "level_required": 45,
      "stat_requirements": {
        "abi": 20,
        "def": 150
      },
      "dna_requirement": null
    },
    {
      "id": 652,
      "from_digimon_id": 206,
      "to_digimon_id": 221,
      "level_required": 45,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 653,
      "from_digimon_id": 206,
      "to_digimon_id": 269,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 100,
        "def": 130,
        "int": 100
      },
      "dna_requirement": null
    }
  ],
  "207": [
    {
      "id": 656,
      "from_digimon_id": 207,
      "to_digimon_id": 246,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 120,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 655,
      "from_digimon_id": 207,
      "to_digimon_id": 245,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 145,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 657,
      "from_digimon_id": 207,
      "to_digimon_id": 291,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 150,
        "spd": 140
      },
      "dna_requirement": null
    }
  ],
  "208": [
    {
      "id": 658,
      "from_digimon_id": 208,
      "to_digimon_id": 236,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 135,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 662,
      "from_digimon_id": 208,
      "to_digimon_id": 331,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 180
      },
      "dna_requirement": null
    },
    {
      "id": 661,
      "from_digimon_id": 208,
      "to_digimon_id": 226,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 40,
        "int": 145,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 660,
      "from_digimon_id": 208,
      "to_digimon_id": 304,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "spd": 160
      },
      "dna_requirement": null
    },
    {
      "id": 659,
      "from_digimon_id": 208,
      "to_digimon_id": 291,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 150,
        "spd": 140
      },
      "dna_requirement": null
    }
  ],
  "209": [
    {
      "id": 663,
      "from_digimon_id": 209,
      "to_digimon_id": 230,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 100,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 665,
      "from_digimon_id": 209,
      "to_digimon_id": 252,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 130,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 664,
      "from_digimon_id": 209,
      "to_digimon_id": 248,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 140,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "210": [
    {
      "id": 667,
      "from_digimon_id": 210,
      "to_digimon_id": 307,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 668,
      "from_digimon_id": 210,
      "to_digimon_id": 309,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "int": 170,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 666,
      "from_digimon_id": 210,
      "to_digimon_id": 303,
      "level_required": 60,
      "stat_requirements": {
        "sp": 200,
        "abi": 80,
        "int": 250,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "211": [
    {
      "id": 671,
      "from_digimon_id": 211,
      "to_digimon_id": 298,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "def": 135,
        "spd": 125
      },
      "dna_requirement": null
    },
    {
      "id": 669,
      "from_digimon_id": 211,
      "to_digimon_id": 254,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "def": 130,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 670,
      "from_digimon_id": 211,
      "to_digimon_id": 256,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1000,
        "abi": 20,
        "atk": 120,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "212": [
    {
      "id": 673,
      "from_digimon_id": 212,
      "to_digimon_id": 307,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 672,
      "from_digimon_id": 212,
      "to_digimon_id": 285,
      "level_required": 55,
      "stat_requirements": {
        "hp": 900,
        "sp": 120,
        "abi": 20,
        "int": 145
      },
      "dna_requirement": null
    },
    {
      "id": 674,
      "from_digimon_id": 212,
      "to_digimon_id": 309,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "int": 170,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "213": [
    {
      "id": 675,
      "from_digimon_id": 213,
      "to_digimon_id": 322,
      "level_required": 70,
      "stat_requirements": {
        "hp": 1400,
        "sp": 160,
        "abi": 100,
        "atk": 130,
        "int": 250,
        "spd": 170
      },
      "dna_requirement": null
    }
  ],
  "214": [
    {
      "id": 926,
      "from_digimon_id": 214,
      "to_digimon_id": 360,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1900,
        "abi": 80,
        "int": 250,
        "spd": 140
      },
      "dna_requirement": null
    },
    {
      "id": 676,
      "from_digimon_id": 214,
      "to_digimon_id": 289,
      "level_required": 60,
      "stat_requirements": {
        "sp": 120,
        "abi": 80,
        "atk": 120,
        "int": 120
      },
      "dna_requirement": 152
    },
    {
      "id": 678,
      "from_digimon_id": 214,
      "to_digimon_id": 309,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "int": 170,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 677,
      "from_digimon_id": 214,
      "to_digimon_id": 303,
      "level_required": 60,
      "stat_requirements": {
        "sp": 200,
        "abi": 80,
        "int": 250,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "215": [
    {
      "id": 679,
      "from_digimon_id": 215,
      "to_digimon_id": 292,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 915,
      "from_digimon_id": 215,
      "to_digimon_id": 343,
      "level_required": 55,
      "stat_requirements": {
        "abi": 25,
        "atk": 190,
        "def": 130,
        "int": 100
      },
      "dna_requirement": null
    },
    {
      "id": 681,
      "from_digimon_id": 215,
      "to_digimon_id": 298,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "def": 135,
        "spd": 125
      },
      "dna_requirement": null
    },
    {
      "id": 680,
      "from_digimon_id": 215,
      "to_digimon_id": 297,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "def": 120,
        "spd": 150
      },
      "dna_requirement": null
    }
  ],
  "216": [
    {
      "id": 683,
      "from_digimon_id": 216,
      "to_digimon_id": 291,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 150,
        "spd": 140
      },
      "dna_requirement": null
    },
    {
      "id": 685,
      "from_digimon_id": 216,
      "to_digimon_id": 300,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "int": 110,
        "spd": 160
      },
      "dna_requirement": null
    },
    {
      "id": 682,
      "from_digimon_id": 216,
      "to_digimon_id": 272,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 130
      },
      "dna_requirement": null
    },
    {
      "id": 684,
      "from_digimon_id": 216,
      "to_digimon_id": 298,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "def": 135,
        "spd": 125
      },
      "dna_requirement": null
    }
  ],
  "217": [
    {
      "id": 687,
      "from_digimon_id": 217,
      "to_digimon_id": 273,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "int": 160,
        "spd": 110
      },
      "dna_requirement": null
    },
    {
      "id": 686,
      "from_digimon_id": 217,
      "to_digimon_id": 227,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1200,
        "sp": 110,
        "abi": 40,
        "atk": 110,
        "int": 110
      },
      "dna_requirement": null
    },
    {
      "id": 688,
      "from_digimon_id": 217,
      "to_digimon_id": 283,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1700,
        "sp": 140,
        "abi": 80,
        "int": 180
      },
      "dna_requirement": null
    }
  ],
  "218": [
    {
      "id": 885,
      "from_digimon_id": 218,
      "to_digimon_id": 311,
      "level_required": 70,
      "stat_requirements": {
        "sp": 150,
        "abi": 60,
        "atk": 250,
        "int": 150,
        "spd": 160
      },
      "dna_requirement": null
    }
  ],
  "219": [
    {
      "id": 689,
      "from_digimon_id": 219,
      "to_digimon_id": 312,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 180,
        "def": 170,
        "int": 150
      },
      "dna_requirement": 331
    }
  ],
  "222": [
    {
      "id": 691,
      "from_digimon_id": 222,
      "to_digimon_id": 223,
      "level_required": 0,
      "stat_requirements": {},
      "dna_requirement": null
    },
    {
      "id": 690,
      "from_digimon_id": 222,
      "to_digimon_id": 313,
      "level_required": 70,
      "stat_requirements": {
        "abi": 100,
        "atk": 160,
        "def": 160,
        "int": 160,
        "spd": 160
      },
      "dna_requirement": null
    }
  ],
  "223": [
    {
      "id": 692,
      "from_digimon_id": 223,
      "to_digimon_id": 222,
      "level_required": 0,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "226": [
    {
      "id": 886,
      "from_digimon_id": 226,
      "to_digimon_id": 318,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 155,
        "int": 100
      },
      "dna_requirement": 272
    }
  ],
  "228": [
    {
      "id": 693,
      "from_digimon_id": 228,
      "to_digimon_id": 315,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 200,
        "int": 150,
        "spd": 150
      },
      "dna_requirement": 297
    }
  ],
  "231": [
    {
      "id": 887,
      "from_digimon_id": 231,
      "to_digimon_id": 319,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1000,
        "abi": 100,
        "atk": 150,
        "int": 150
      },
      "dna_requirement": 287
    }
  ],
  "248": [
    {
      "id": 694,
      "from_digimon_id": 248,
      "to_digimon_id": 249,
      "level_required": 60,
      "stat_requirements": {
        "hp": 2000,
        "abi": 30,
        "atk": 250
      },
      "dna_requirement": null
    }
  ],
  "252": [
    {
      "id": 888,
      "from_digimon_id": 252,
      "to_digimon_id": 314,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1650,
        "abi": 100,
        "atk": 150,
        "spd": 150
      },
      "dna_requirement": 278
    }
  ],
  "255": [
    {
      "id": 716,
      "from_digimon_id": 255,
      "to_digimon_id": 317,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 255
      },
      "dna_requirement": 272
    }
  ],
  "259": [
    {
      "id": 945,
      "from_digimon_id": 259,
      "to_digimon_id": 367,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 180,
        "int": 180,
        "spd": 170
      },
      "dna_requirement": 366
    }
  ],
  "260": [
    {
      "id": 695,
      "from_digimon_id": 260,
      "to_digimon_id": 310,
      "level_required": 70,
      "stat_requirements": {
        "hp": 2000,
        "sp": 140,
        "abi": 100,
        "atk": 290
      },
      "dna_requirement": null
    }
  ],
  "262": [
    {
      "id": 696,
      "from_digimon_id": 262,
      "to_digimon_id": 320,
      "level_required": 80,
      "stat_requirements": {
        "abi": 80,
        "atk": 185,
        "def": 185,
        "int": 185
      },
      "dna_requirement": null
    }
  ],
  "265": [
    {
      "id": 697,
      "from_digimon_id": 265,
      "to_digimon_id": 266,
      "level_required": 0,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "266": [
    {
      "id": 698,
      "from_digimon_id": 266,
      "to_digimon_id": 265,
      "level_required": 0,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "272": [
    {
      "id": 700,
      "from_digimon_id": 272,
      "to_digimon_id": 318,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 155,
        "int": 100
      },
      "dna_requirement": 226
    },
    {
      "id": 699,
      "from_digimon_id": 272,
      "to_digimon_id": 317,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 255
      },
      "dna_requirement": 255
    }
  ],
  "273": [
    {
      "id": 701,
      "from_digimon_id": 273,
      "to_digimon_id": 332,
      "level_required": 99,
      "stat_requirements": {
        "abi": 120
      },
      "dna_requirement": null
    }
  ],
  "274": [
    {
      "id": 702,
      "from_digimon_id": 274,
      "to_digimon_id": 332,
      "level_required": 99,
      "stat_requirements": {
        "abi": 120
      },
      "dna_requirement": null
    }
  ],
  "276": [
    {
      "id": 703,
      "from_digimon_id": 276,
      "to_digimon_id": 316,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1500,
        "abi": 40,
        "atk": 150,
        "def": 200
      },
      "dna_requirement": 298
    }
  ],
  "278": [
    {
      "id": 889,
      "from_digimon_id": 278,
      "to_digimon_id": 314,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1650,
        "abi": 100,
        "atk": 150,
        "spd": 150
      },
      "dna_requirement": 252
    }
  ],
  "280": [
    {
      "id": 704,
      "from_digimon_id": 280,
      "to_digimon_id": 258,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1600,
        "abi": 40,
        "atk": 140,
        "def": 130
      },
      "dna_requirement": null
    }
  ],
  "281": [
    {
      "id": 705,
      "from_digimon_id": 281,
      "to_digimon_id": 282,
      "level_required": 80,
      "stat_requirements": {
        "hp": 2100,
        "abi": 100,
        "atk": 300,
        "spd": 220
      },
      "dna_requirement": null
    }
  ],
  "283": [
    {
      "id": 706,
      "from_digimon_id": 283,
      "to_digimon_id": 321,
      "level_required": 0,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "287": [
    {
      "id": 890,
      "from_digimon_id": 287,
      "to_digimon_id": 288,
      "level_required": 0,
      "stat_requirements": {},
      "dna_requirement": null
    },
    {
      "id": 891,
      "from_digimon_id": 287,
      "to_digimon_id": 319,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1000,
        "abi": 100,
        "atk": 150,
        "int": 150
      },
      "dna_requirement": 231
    }
  ],
  "288": [
    {
      "id": 892,
      "from_digimon_id": 288,
      "to_digimon_id": 287,
      "level_required": 0,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "292": [
    {
      "id": 707,
      "from_digimon_id": 292,
      "to_digimon_id": 293,
      "level_required": 60,
      "stat_requirements": {
        "abi": 30,
        "atk": 200,
        "spd": 200
      },
      "dna_requirement": null
    }
  ],
  "294": [
    {
      "id": 708,
      "from_digimon_id": 294,
      "to_digimon_id": 233,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 130,
        "def": 120
      },
      "dna_requirement": null
    },
    {
      "id": 709,
      "from_digimon_id": 294,
      "to_digimon_id": 332,
      "level_required": 99,
      "stat_requirements": {
        "abi": 120
      },
      "dna_requirement": null
    }
  ],
  "297": [
    {
      "id": 710,
      "from_digimon_id": 297,
      "to_digimon_id": 315,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 200,
        "int": 150,
        "spd": 150
      },
      "dna_requirement": 228
    }
  ],
  "298": [
    {
      "id": 711,
      "from_digimon_id": 298,
      "to_digimon_id": 316,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1500,
        "abi": 40,
        "atk": 150,
        "def": 200
      },
      "dna_requirement": 276
    }
  ],
  "299": [
    {
      "id": 712,
      "from_digimon_id": 299,
      "to_digimon_id": 332,
      "level_required": 99,
      "stat_requirements": {
        "abi": 120
      },
      "dna_requirement": null
    }
  ],
  "304": [
    {
      "id": 713,
      "from_digimon_id": 304,
      "to_digimon_id": 305,
      "level_required": 60,
      "stat_requirements": {
        "sp": 160,
        "abi": 30,
        "spd": 250
      },
      "dna_requirement": null
    }
  ],
  "307": [
    {
      "id": 714,
      "from_digimon_id": 307,
      "to_digimon_id": 308,
      "level_required": 60,
      "stat_requirements": {
        "sp": 170,
        "abi": 30,
        "int": 180
      },
      "dna_requirement": null
    }
  ],
  "321": [
    {
      "id": 715,
      "from_digimon_id": 321,
      "to_digimon_id": 283,
      "level_required": 0,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "326": [
    {
      "id": 893,
      "from_digimon_id": 326,
      "to_digimon_id": 327,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 130,
        "def": 130,
        "spd": 120
      },
      "dna_requirement": null
    }
  ],
  "328": [
    {
      "id": 901,
      "from_digimon_id": 328,
      "to_digimon_id": 329,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 903,
      "from_digimon_id": 328,
      "to_digimon_id": 139,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 902,
      "from_digimon_id": 328,
      "to_digimon_id": 135,
      "level_required": 15,
      "stat_requirements": {
        "hp": 130,
        "atk": 50
      },
      "dna_requirement": null
    }
  ],
  "329": [
    {
      "id": 905,
      "from_digimon_id": 329,
      "to_digimon_id": 158,
      "level_required": 28,
      "stat_requirements": {
        "def": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 904,
      "from_digimon_id": 329,
      "to_digimon_id": 330,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 906,
      "from_digimon_id": 329,
      "to_digimon_id": 200,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "sp": 70,
        "int": 70
      },
      "dna_requirement": null
    }
  ],
  "330": [
    {
      "id": 909,
      "from_digimon_id": 330,
      "to_digimon_id": 244,
      "level_required": 55,
      "stat_requirements": {
        "abi": 40,
        "atk": 130,
        "def": 120,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 907,
      "from_digimon_id": 330,
      "to_digimon_id": 331,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 180
      },
      "dna_requirement": null
    },
    {
      "id": 908,
      "from_digimon_id": 330,
      "to_digimon_id": 230,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 100,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 910,
      "from_digimon_id": 330,
      "to_digimon_id": 291,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 150,
        "spd": 140
      },
      "dna_requirement": null
    }
  ],
  "331": [
    {
      "id": 911,
      "from_digimon_id": 331,
      "to_digimon_id": 312,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 180,
        "def": 170,
        "int": 150
      },
      "dna_requirement": 219
    }
  ],
  "333": [
    {
      "id": 897,
      "from_digimon_id": 333,
      "to_digimon_id": 138,
      "level_required": 15,
      "stat_requirements": {
        "atk": 35,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 896,
      "from_digimon_id": 333,
      "to_digimon_id": 84,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 895,
      "from_digimon_id": 333,
      "to_digimon_id": 335,
      "level_required": 14,
      "stat_requirements": {
        "sp": 40,
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 894,
      "from_digimon_id": 333,
      "to_digimon_id": 334,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1150,
        "sp": 130,
        "abi": 50,
        "int": 150
      },
      "dna_requirement": null
    }
  ],
  "335": [
    {
      "id": 898,
      "from_digimon_id": 335,
      "to_digimon_id": 336,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1150,
        "abi": 50,
        "atk": 130,
        "spd": 150
      },
      "dna_requirement": null
    },
    {
      "id": 900,
      "from_digimon_id": 335,
      "to_digimon_id": 214,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "int": 95
      },
      "dna_requirement": null
    },
    {
      "id": 899,
      "from_digimon_id": 335,
      "to_digimon_id": 186,
      "level_required": 26,
      "stat_requirements": {
        "atk": 65,
        "def": 65
      },
      "dna_requirement": null
    }
  ],
  "342": [
    {
      "id": 912,
      "from_digimon_id": 342,
      "to_digimon_id": 344,
      "level_required": 60,
      "stat_requirements": {
        "abi": 50,
        "atk": 220,
        "int": 160,
        "spd": 135
      },
      "dna_requirement": 343
    }
  ],
  "343": [
    {
      "id": 913,
      "from_digimon_id": 343,
      "to_digimon_id": 344,
      "level_required": 60,
      "stat_requirements": {
        "abi": 50,
        "atk": 220,
        "int": 160,
        "spd": 135
      },
      "dna_requirement": 342
    }
  ],
  "345": [
    {
      "id": 916,
      "from_digimon_id": 345,
      "to_digimon_id": 346,
      "level_required": 16,
      "stat_requirements": {
        "atk": 60
      },
      "dna_requirement": null
    }
  ],
  "346": [
    {
      "id": 917,
      "from_digimon_id": 346,
      "to_digimon_id": 347,
      "level_required": 30,
      "stat_requirements": {
        "hp": 385,
        "atk": 110
      },
      "dna_requirement": null
    }
  ],
  "347": [
    {
      "id": 918,
      "from_digimon_id": 347,
      "to_digimon_id": 348,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1870,
        "abi": 20,
        "atk": 175,
        "def": 140
      },
      "dna_requirement": null
    }
  ],
  "348": [
    {
      "id": 920,
      "from_digimon_id": 348,
      "to_digimon_id": 352,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 220,
        "int": 165,
        "spd": 165
      },
      "dna_requirement": 351
    }
  ],
  "350": [
    {
      "id": 919,
      "from_digimon_id": 350,
      "to_digimon_id": 351,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 165,
        "def": 130,
        "spd": 165
      },
      "dna_requirement": null
    }
  ],
  "351": [
    {
      "id": 921,
      "from_digimon_id": 351,
      "to_digimon_id": 352,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 220,
        "int": 165,
        "spd": 165
      },
      "dna_requirement": 348
    }
  ],
  "353": [
    {
      "id": 922,
      "from_digimon_id": 353,
      "to_digimon_id": 354,
      "level_required": 15,
      "stat_requirements": {
        "atk": 55,
        "spd": 20
      },
      "dna_requirement": null
    }
  ],
  "354": [
    {
      "id": 923,
      "from_digimon_id": 354,
      "to_digimon_id": 355,
      "level_required": 30,
      "stat_requirements": {
        "atk": 115,
        "spd": 80
      },
      "dna_requirement": null
    }
  ],
  "355": [
    {
      "id": 924,
      "from_digimon_id": 355,
      "to_digimon_id": 356,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1870,
        "abi": 40,
        "atk": 200
      },
      "dna_requirement": null
    },
    {
      "id": 925,
      "from_digimon_id": 355,
      "to_digimon_id": 357,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 155,
        "def": 155,
        "int": 155
      },
      "dna_requirement": null
    }
  ],
  "359": [
    {
      "id": 950,
      "from_digimon_id": 359,
      "to_digimon_id": 382,
      "level_required": 60,
      "stat_requirements": {
        "sp": 220,
        "abi": 80,
        "int": 275,
        "spd": 145
      },
      "dna_requirement": null
    },
    {
      "id": 927,
      "from_digimon_id": 359,
      "to_digimon_id": 361,
      "level_required": 60,
      "stat_requirements": {
        "hp": 2090,
        "abi": 80,
        "int": 275,
        "spd": 150
      },
      "dna_requirement": null
    }
  ],
  "363": [
    {
      "id": 929,
      "from_digimon_id": 363,
      "to_digimon_id": 364,
      "level_required": 15,
      "stat_requirements": {
        "atk": 40,
        "spd": 35
      },
      "dna_requirement": null
    },
    {
      "id": 935,
      "from_digimon_id": 363,
      "to_digimon_id": 97,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "def": 25,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 936,
      "from_digimon_id": 363,
      "to_digimon_id": 81,
      "level_required": 15,
      "stat_requirements": {
        "spd": 55
      },
      "dna_requirement": null
    }
  ],
  "364": [
    {
      "id": 938,
      "from_digimon_id": 364,
      "to_digimon_id": 207,
      "level_required": 26,
      "stat_requirements": {
        "hp": 600,
        "atk": 60
      },
      "dna_requirement": null
    },
    {
      "id": 932,
      "from_digimon_id": 364,
      "to_digimon_id": 365,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 937,
      "from_digimon_id": 364,
      "to_digimon_id": 160,
      "level_required": 26,
      "stat_requirements": {
        "hp": 400,
        "atk": 95
      },
      "dna_requirement": null
    }
  ],
  "365": [
    {
      "id": 939,
      "from_digimon_id": 365,
      "to_digimon_id": 366,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "def": 130,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 942,
      "from_digimon_id": 365,
      "to_digimon_id": 245,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 145,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 943,
      "from_digimon_id": 365,
      "to_digimon_id": 292,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "366": [
    {
      "id": 944,
      "from_digimon_id": 366,
      "to_digimon_id": 367,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 180,
        "int": 180,
        "spd": 170
      },
      "dna_requirement": 259
    }
  ],
  "368": [
    {
      "id": 949,
      "from_digimon_id": 368,
      "to_digimon_id": 381,
      "level_required": 55,
      "stat_requirements": {
        "sp": 130,
        "abi": 40,
        "def": 130,
        "int": 160
      },
      "dna_requirement": null
    }
  ],
  "379": [
    {
      "id": 946,
      "from_digimon_id": 379,
      "to_digimon_id": 380,
      "level_required": 16,
      "stat_requirements": {
        "int": 45
      },
      "dna_requirement": null
    }
  ],
  "380": [
    {
      "id": 947,
      "from_digimon_id": 380,
      "to_digimon_id": 368,
      "level_required": 30,
      "stat_requirements": {
        "sp": 85,
        "abi": 10,
        "int": 110
      },
      "dna_requirement": null
    },
    {
      "id": 948,
      "from_digimon_id": 380,
      "to_digimon_id": 385,
      "level_required": 30,
      "stat_requirements": {
        "int": 85,
        "spd": 85
      },
      "dna_requirement": null
    }
  ],
  "383": [
    {
      "id": 951,
      "from_digimon_id": 383,
      "to_digimon_id": 384,
      "level_required": 16,
      "stat_requirements": {
        "hp": 330,
        "def": 35
      },
      "dna_requirement": null
    }
  ],
  "384": [
    {
      "id": 952,
      "from_digimon_id": 384,
      "to_digimon_id": 385,
      "level_required": 30,
      "stat_requirements": {
        "int": 85,
        "spd": 85
      },
      "dna_requirement": null
    }
  ],
  "385": [
    {
      "id": 953,
      "from_digimon_id": 385,
      "to_digimon_id": 369,
      "level_required": 55,
      "stat_requirements": {
        "sp": 130,
        "abi": 20,
        "int": 130
      },
      "dna_requirement": null
    }
  ]
},
  byTo: {
  "6": [
    {
      "id": 3,
      "from_digimon_id": 1,
      "to_digimon_id": 6,
      "level_required": 8,
      "stat_requirements": {
        "abi": 5,
        "atk": 55
      },
      "dna_requirement": null
    }
  ],
  "7": [
    {
      "id": 9,
      "from_digimon_id": 4,
      "to_digimon_id": 7,
      "level_required": 3,
      "stat_requirements": {
        "atk": 15
      },
      "dna_requirement": null
    }
  ],
  "8": [
    {
      "id": 4,
      "from_digimon_id": 2,
      "to_digimon_id": 8,
      "level_required": 5,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "9": [
    {
      "id": 7,
      "from_digimon_id": 3,
      "to_digimon_id": 9,
      "level_required": 5,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "10": [
    {
      "id": 1,
      "from_digimon_id": 1,
      "to_digimon_id": 10,
      "level_required": 5,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "11": [
    {
      "id": 11,
      "from_digimon_id": 5,
      "to_digimon_id": 11,
      "level_required": 5,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "12": [
    {
      "id": 8,
      "from_digimon_id": 3,
      "to_digimon_id": 12,
      "level_required": 3,
      "stat_requirements": {
        "int": 10
      },
      "dna_requirement": null
    }
  ],
  "13": [
    {
      "id": 2,
      "from_digimon_id": 1,
      "to_digimon_id": 13,
      "level_required": 5,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "14": [
    {
      "id": 5,
      "from_digimon_id": 2,
      "to_digimon_id": 14,
      "level_required": 3,
      "stat_requirements": {
        "hp": 50
      },
      "dna_requirement": null
    }
  ],
  "15": [
    {
      "id": 12,
      "from_digimon_id": 5,
      "to_digimon_id": 15,
      "level_required": 3,
      "stat_requirements": {
        "int": 15
      },
      "dna_requirement": null
    }
  ],
  "16": [
    {
      "id": 6,
      "from_digimon_id": 2,
      "to_digimon_id": 16,
      "level_required": 3,
      "stat_requirements": {
        "def": 15
      },
      "dna_requirement": null
    }
  ],
  "17": [
    {
      "id": 10,
      "from_digimon_id": 4,
      "to_digimon_id": 17,
      "level_required": 5,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "18": [
    {
      "id": 13,
      "from_digimon_id": 7,
      "to_digimon_id": 18,
      "level_required": 9,
      "stat_requirements": {
        "atk": 30
      },
      "dna_requirement": null
    }
  ],
  "19": [
    {
      "id": 29,
      "from_digimon_id": 10,
      "to_digimon_id": 19,
      "level_required": 8,
      "stat_requirements": {
        "atk": 30
      },
      "dna_requirement": null
    }
  ],
  "20": [
    {
      "id": 717,
      "from_digimon_id": 6,
      "to_digimon_id": 20,
      "level_required": 6,
      "stat_requirements": {
        "atk": 90,
        "spd": 20
      },
      "dna_requirement": null
    }
  ],
  "21": [
    {
      "id": 38,
      "from_digimon_id": 12,
      "to_digimon_id": 21,
      "level_required": 7,
      "stat_requirements": {
        "hp": 75,
        "def": 20
      },
      "dna_requirement": null
    }
  ],
  "22": [
    {
      "id": 42,
      "from_digimon_id": 13,
      "to_digimon_id": 22,
      "level_required": 7,
      "stat_requirements": {
        "sp": 20,
        "int": 30
      },
      "dna_requirement": null
    }
  ],
  "23": [
    {
      "id": 46,
      "from_digimon_id": 14,
      "to_digimon_id": 23,
      "level_required": 7,
      "stat_requirements": {
        "hp": 75,
        "sp": 20,
        "spd": 20
      },
      "dna_requirement": null
    }
  ],
  "24": [
    {
      "id": 50,
      "from_digimon_id": 15,
      "to_digimon_id": 24,
      "level_required": 7,
      "stat_requirements": {
        "int": 20
      },
      "dna_requirement": null
    }
  ],
  "25": [
    {
      "id": 58,
      "from_digimon_id": 17,
      "to_digimon_id": 25,
      "level_required": 9,
      "stat_requirements": {
        "atk": 20,
        "spd": 20
      },
      "dna_requirement": null
    }
  ],
  "26": [
    {
      "id": 43,
      "from_digimon_id": 13,
      "to_digimon_id": 26,
      "level_required": 9,
      "stat_requirements": {
        "atk": 15,
        "spd": 20
      },
      "dna_requirement": null
    }
  ],
  "27": [
    {
      "id": 23,
      "from_digimon_id": 9,
      "to_digimon_id": 27,
      "level_required": 7,
      "stat_requirements": {
        "hp": 75,
        "atk": 20,
        "spd": 20
      },
      "dna_requirement": null
    }
  ],
  "28": [
    {
      "id": 24,
      "from_digimon_id": 9,
      "to_digimon_id": 28,
      "level_required": 6,
      "stat_requirements": {
        "hp": 80,
        "atk": 30
      },
      "dna_requirement": null
    }
  ],
  "29": [
    {
      "id": 14,
      "from_digimon_id": 7,
      "to_digimon_id": 29,
      "level_required": 7,
      "stat_requirements": {
        "atk": 30,
        "spd": 20
      },
      "dna_requirement": null
    }
  ],
  "30": [
    {
      "id": 59,
      "from_digimon_id": 17,
      "to_digimon_id": 30,
      "level_required": 8,
      "stat_requirements": {
        "sp": 20,
        "int": 20
      },
      "dna_requirement": null
    }
  ],
  "31": [
    {
      "id": 30,
      "from_digimon_id": 10,
      "to_digimon_id": 31,
      "level_required": 9,
      "stat_requirements": {
        "atk": 20,
        "spd": 20
      },
      "dna_requirement": null
    }
  ],
  "32": [
    {
      "id": 54,
      "from_digimon_id": 16,
      "to_digimon_id": 32,
      "level_required": 8,
      "stat_requirements": {
        "def": 30
      },
      "dna_requirement": null
    }
  ],
  "33": [
    {
      "id": 25,
      "from_digimon_id": 9,
      "to_digimon_id": 33,
      "level_required": 7,
      "stat_requirements": {
        "atk": 40
      },
      "dna_requirement": null
    }
  ],
  "34": [
    {
      "id": 51,
      "from_digimon_id": 15,
      "to_digimon_id": 34,
      "level_required": 8,
      "stat_requirements": {
        "hp": 100
      },
      "dna_requirement": null
    }
  ],
  "35": [
    {
      "id": 52,
      "from_digimon_id": 15,
      "to_digimon_id": 35,
      "level_required": 7,
      "stat_requirements": {
        "def": 15,
        "int": 20
      },
      "dna_requirement": null
    }
  ],
  "36": [
    {
      "id": 27,
      "from_digimon_id": 9,
      "to_digimon_id": 36,
      "level_required": 10,
      "stat_requirements": {
        "atk": 20,
        "spd": 20
      },
      "dna_requirement": null
    }
  ],
  "37": [
    {
      "id": 55,
      "from_digimon_id": 16,
      "to_digimon_id": 37,
      "level_required": 6,
      "stat_requirements": {
        "hp": 75,
        "def": 25
      },
      "dna_requirement": null
    }
  ],
  "38": [
    {
      "id": 45,
      "from_digimon_id": 13,
      "to_digimon_id": 38,
      "level_required": 6,
      "stat_requirements": {
        "spd": 30
      },
      "dna_requirement": null
    }
  ],
  "39": [
    {
      "id": 39,
      "from_digimon_id": 12,
      "to_digimon_id": 39,
      "level_required": 8,
      "stat_requirements": {
        "spd": 30
      },
      "dna_requirement": null
    }
  ],
  "40": [
    {
      "id": 56,
      "from_digimon_id": 16,
      "to_digimon_id": 40,
      "level_required": 9,
      "stat_requirements": {
        "def": 20
      },
      "dna_requirement": null
    }
  ],
  "41": [
    {
      "id": 15,
      "from_digimon_id": 7,
      "to_digimon_id": 41,
      "level_required": 8,
      "stat_requirements": {
        "hp": 75,
        "def": 20
      },
      "dna_requirement": null
    }
  ],
  "42": [
    {
      "id": 32,
      "from_digimon_id": 10,
      "to_digimon_id": 42,
      "level_required": 8,
      "stat_requirements": {
        "atk": 30,
        "spd": 20
      },
      "dna_requirement": null
    }
  ],
  "43": [
    {
      "id": 17,
      "from_digimon_id": 7,
      "to_digimon_id": 43,
      "level_required": 6,
      "stat_requirements": {
        "atk": 50,
        "def": 20
      },
      "dna_requirement": null
    }
  ],
  "44": [
    {
      "id": 60,
      "from_digimon_id": 17,
      "to_digimon_id": 44,
      "level_required": 8,
      "stat_requirements": {
        "atk": 20,
        "spd": 30
      },
      "dna_requirement": null
    }
  ],
  "45": [
    {
      "id": 57,
      "from_digimon_id": 16,
      "to_digimon_id": 45,
      "level_required": 7,
      "stat_requirements": {
        "hp": 75,
        "def": 30
      },
      "dna_requirement": null
    }
  ],
  "46": [
    {
      "id": 33,
      "from_digimon_id": 11,
      "to_digimon_id": 46,
      "level_required": 7,
      "stat_requirements": {
        "int": 20,
        "spd": 20
      },
      "dna_requirement": null
    }
  ],
  "47": [
    {
      "id": 16,
      "from_digimon_id": 7,
      "to_digimon_id": 47,
      "level_required": 9,
      "stat_requirements": {
        "abi": 20,
        "atk": 20
      },
      "dna_requirement": null
    }
  ],
  "48": [
    {
      "id": 20,
      "from_digimon_id": 8,
      "to_digimon_id": 48,
      "level_required": 8,
      "stat_requirements": {
        "hp": 100
      },
      "dna_requirement": null
    }
  ],
  "49": [
    {
      "id": 31,
      "from_digimon_id": 10,
      "to_digimon_id": 49,
      "level_required": 8,
      "stat_requirements": {
        "spd": 30
      },
      "dna_requirement": null
    }
  ],
  "50": [
    {
      "id": 47,
      "from_digimon_id": 14,
      "to_digimon_id": 50,
      "level_required": 8,
      "stat_requirements": {
        "int": 20,
        "spd": 20
      },
      "dna_requirement": null
    }
  ],
  "51": [
    {
      "id": 34,
      "from_digimon_id": 11,
      "to_digimon_id": 51,
      "level_required": 9,
      "stat_requirements": {
        "spd": 30
      },
      "dna_requirement": null
    }
  ],
  "52": [
    {
      "id": 22,
      "from_digimon_id": 8,
      "to_digimon_id": 52,
      "level_required": 6,
      "stat_requirements": {
        "spd": 30
      },
      "dna_requirement": null
    }
  ],
  "53": [
    {
      "id": 26,
      "from_digimon_id": 9,
      "to_digimon_id": 53,
      "level_required": 6,
      "stat_requirements": {
        "atk": 20,
        "spd": 20
      },
      "dna_requirement": null
    }
  ],
  "54": [
    {
      "id": 40,
      "from_digimon_id": 12,
      "to_digimon_id": 54,
      "level_required": 7,
      "stat_requirements": {
        "sp": 20,
        "int": 20
      },
      "dna_requirement": null
    }
  ],
  "55": [
    {
      "id": 53,
      "from_digimon_id": 15,
      "to_digimon_id": 55,
      "level_required": 8,
      "stat_requirements": {
        "int": 40
      },
      "dna_requirement": null
    }
  ],
  "56": [
    {
      "id": 35,
      "from_digimon_id": 11,
      "to_digimon_id": 56,
      "level_required": 7,
      "stat_requirements": {
        "spd": 30
      },
      "dna_requirement": null
    }
  ],
  "57": [
    {
      "id": 49,
      "from_digimon_id": 14,
      "to_digimon_id": 57,
      "level_required": 8,
      "stat_requirements": {
        "hp": 75,
        "def": 10
      },
      "dna_requirement": null
    }
  ],
  "58": [
    {
      "id": 28,
      "from_digimon_id": 9,
      "to_digimon_id": 58,
      "level_required": 8,
      "stat_requirements": {
        "atk": 35
      },
      "dna_requirement": null
    }
  ],
  "59": [
    {
      "id": 19,
      "from_digimon_id": 8,
      "to_digimon_id": 59,
      "level_required": 9,
      "stat_requirements": {
        "hp": 75
      },
      "dna_requirement": null
    }
  ],
  "60": [
    {
      "id": 36,
      "from_digimon_id": 11,
      "to_digimon_id": 60,
      "level_required": 30,
      "stat_requirements": {
        "sp": 80,
        "abi": 80,
        "int": 130
      },
      "dna_requirement": null
    }
  ],
  "61": [
    {
      "id": 41,
      "from_digimon_id": 12,
      "to_digimon_id": 61,
      "level_required": 8,
      "stat_requirements": {
        "sp": 30,
        "int": 20
      },
      "dna_requirement": null
    }
  ],
  "62": [
    {
      "id": 21,
      "from_digimon_id": 8,
      "to_digimon_id": 62,
      "level_required": 7,
      "stat_requirements": {
        "atk": 20,
        "int": 20,
        "spd": 20
      },
      "dna_requirement": null
    }
  ],
  "63": [
    {
      "id": 44,
      "from_digimon_id": 13,
      "to_digimon_id": 63,
      "level_required": 8,
      "stat_requirements": {
        "atk": 15,
        "int": 20
      },
      "dna_requirement": null
    }
  ],
  "64": [
    {
      "id": 48,
      "from_digimon_id": 14,
      "to_digimon_id": 64,
      "level_required": 8,
      "stat_requirements": {
        "def": 20
      },
      "dna_requirement": null
    }
  ],
  "65": [
    {
      "id": 210,
      "from_digimon_id": 49,
      "to_digimon_id": 65,
      "level_required": 15,
      "stat_requirements": {
        "atk": 40,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 80,
      "from_digimon_id": 22,
      "to_digimon_id": 65,
      "level_required": 15,
      "stat_requirements": {
        "atk": 40,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 266,
      "from_digimon_id": 64,
      "to_digimon_id": 65,
      "level_required": 15,
      "stat_requirements": {
        "atk": 40,
        "int": 40
      },
      "dna_requirement": null
    }
  ],
  "66": [
    {
      "id": 141,
      "from_digimon_id": 32,
      "to_digimon_id": 66,
      "level_required": 15,
      "stat_requirements": {
        "hp": 110,
        "def": 50
      },
      "dna_requirement": null
    },
    {
      "id": 153,
      "from_digimon_id": 34,
      "to_digimon_id": 66,
      "level_required": 15,
      "stat_requirements": {
        "hp": 110,
        "def": 50
      },
      "dna_requirement": null
    }
  ],
  "67": [
    {
      "id": 215,
      "from_digimon_id": 50,
      "to_digimon_id": 67,
      "level_required": 14,
      "stat_requirements": {
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 220,
      "from_digimon_id": 51,
      "to_digimon_id": 67,
      "level_required": 14,
      "stat_requirements": {
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 242,
      "from_digimon_id": 56,
      "to_digimon_id": 67,
      "level_required": 14,
      "stat_requirements": {
        "spd": 55
      },
      "dna_requirement": null
    }
  ],
  "68": [
    {
      "id": 67,
      "from_digimon_id": 18,
      "to_digimon_id": 68,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "atk": 50
      },
      "dna_requirement": null
    },
    {
      "id": 126,
      "from_digimon_id": 29,
      "to_digimon_id": 68,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "atk": 50
      },
      "dna_requirement": null
    }
  ],
  "69": [
    {
      "id": 136,
      "from_digimon_id": 31,
      "to_digimon_id": 69,
      "level_required": 16,
      "stat_requirements": {
        "atk": 50,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 729,
      "from_digimon_id": 42,
      "to_digimon_id": 69,
      "level_required": 16,
      "stat_requirements": {
        "atk": 50,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 718,
      "from_digimon_id": 20,
      "to_digimon_id": 69,
      "level_required": 16,
      "stat_requirements": {
        "atk": 50,
        "int": 40
      },
      "dna_requirement": null
    }
  ],
  "70": [
    {
      "id": 137,
      "from_digimon_id": 32,
      "to_digimon_id": 70,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 149,
      "from_digimon_id": 34,
      "to_digimon_id": 70,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 74,
      "from_digimon_id": 21,
      "to_digimon_id": 70,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    }
  ],
  "71": [
    {
      "id": 150,
      "from_digimon_id": 34,
      "to_digimon_id": 71,
      "level_required": 15,
      "stat_requirements": {
        "hp": 300
      },
      "dna_requirement": null
    },
    {
      "id": 167,
      "from_digimon_id": 39,
      "to_digimon_id": 71,
      "level_required": 15,
      "stat_requirements": {
        "hp": 300
      },
      "dna_requirement": null
    },
    {
      "id": 155,
      "from_digimon_id": 35,
      "to_digimon_id": 71,
      "level_required": 15,
      "stat_requirements": {
        "hp": 300
      },
      "dna_requirement": null
    }
  ],
  "72": [
    {
      "id": 132,
      "from_digimon_id": 31,
      "to_digimon_id": 72,
      "level_required": 14,
      "stat_requirements": {
        "sp": 35,
        "int": 55
      },
      "dna_requirement": null
    },
    {
      "id": 260,
      "from_digimon_id": 63,
      "to_digimon_id": 72,
      "level_required": 14,
      "stat_requirements": {
        "sp": 35,
        "int": 55
      },
      "dna_requirement": null
    },
    {
      "id": 81,
      "from_digimon_id": 22,
      "to_digimon_id": 72,
      "level_required": 14,
      "stat_requirements": {
        "sp": 35,
        "int": 55
      },
      "dna_requirement": null
    }
  ],
  "73": [
    {
      "id": 131,
      "from_digimon_id": 30,
      "to_digimon_id": 73,
      "level_required": 15,
      "stat_requirements": {
        "hp": 45,
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 115,
      "from_digimon_id": 27,
      "to_digimon_id": 73,
      "level_required": 15,
      "stat_requirements": {
        "hp": 45,
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 228,
      "from_digimon_id": 53,
      "to_digimon_id": 73,
      "level_required": 15,
      "stat_requirements": {
        "hp": 45,
        "spd": 55
      },
      "dna_requirement": null
    }
  ],
  "74": [
    {
      "id": 247,
      "from_digimon_id": 59,
      "to_digimon_id": 74,
      "level_required": 14,
      "stat_requirements": {
        "hp": 500
      },
      "dna_requirement": null
    },
    {
      "id": 254,
      "from_digimon_id": 62,
      "to_digimon_id": 74,
      "level_required": 14,
      "stat_requirements": {
        "hp": 500
      },
      "dna_requirement": null
    },
    {
      "id": 204,
      "from_digimon_id": 48,
      "to_digimon_id": 74,
      "level_required": 14,
      "stat_requirements": {
        "hp": 500
      },
      "dna_requirement": null
    },
    {
      "id": 744,
      "from_digimon_id": 57,
      "to_digimon_id": 74,
      "level_required": 14,
      "stat_requirements": {
        "hp": 500
      },
      "dna_requirement": null
    }
  ],
  "75": [
    {
      "id": 219,
      "from_digimon_id": 50,
      "to_digimon_id": 75,
      "level_required": 14,
      "stat_requirements": {
        "atk": 35,
        "spd": 45
      },
      "dna_requirement": null
    },
    {
      "id": 246,
      "from_digimon_id": 56,
      "to_digimon_id": 75,
      "level_required": 14,
      "stat_requirements": {
        "atk": 35,
        "spd": 45
      },
      "dna_requirement": null
    },
    {
      "id": 241,
      "from_digimon_id": 55,
      "to_digimon_id": 75,
      "level_required": 14,
      "stat_requirements": {
        "atk": 35,
        "spd": 45
      },
      "dna_requirement": null
    }
  ],
  "76": [
    {
      "id": 221,
      "from_digimon_id": 51,
      "to_digimon_id": 76,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 192,
      "from_digimon_id": 46,
      "to_digimon_id": 76,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 224,
      "from_digimon_id": 53,
      "to_digimon_id": 76,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    }
  ],
  "77": [
    {
      "id": 251,
      "from_digimon_id": 60,
      "to_digimon_id": 77,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 127,
      "from_digimon_id": 30,
      "to_digimon_id": 77,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 193,
      "from_digimon_id": 46,
      "to_digimon_id": 77,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "int": 40
      },
      "dna_requirement": null
    }
  ],
  "78": [
    {
      "id": 98,
      "from_digimon_id": 25,
      "to_digimon_id": 78,
      "level_required": 14,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    },
    {
      "id": 82,
      "from_digimon_id": 22,
      "to_digimon_id": 78,
      "level_required": 14,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    },
    {
      "id": 143,
      "from_digimon_id": 33,
      "to_digimon_id": 78,
      "level_required": 14,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    }
  ],
  "79": [
    {
      "id": 177,
      "from_digimon_id": 41,
      "to_digimon_id": 79,
      "level_required": 14,
      "stat_requirements": {
        "def": 55
      },
      "dna_requirement": null
    },
    {
      "id": 187,
      "from_digimon_id": 45,
      "to_digimon_id": 79,
      "level_required": 14,
      "stat_requirements": {
        "def": 55
      },
      "dna_requirement": null
    },
    {
      "id": 182,
      "from_digimon_id": 44,
      "to_digimon_id": 79,
      "level_required": 14,
      "stat_requirements": {
        "def": 55
      },
      "dna_requirement": null
    }
  ],
  "80": [
    {
      "id": 181,
      "from_digimon_id": 41,
      "to_digimon_id": 80,
      "level_required": 14,
      "stat_requirements": {
        "hp": 130,
        "def": 60
      },
      "dna_requirement": null
    },
    {
      "id": 164,
      "from_digimon_id": 37,
      "to_digimon_id": 80,
      "level_required": 14,
      "stat_requirements": {
        "hp": 130,
        "def": 60
      },
      "dna_requirement": null
    },
    {
      "id": 738,
      "from_digimon_id": 52,
      "to_digimon_id": 80,
      "level_required": 14,
      "stat_requirements": {
        "hp": 130,
        "def": 60
      },
      "dna_requirement": null
    }
  ],
  "81": [
    {
      "id": 99,
      "from_digimon_id": 25,
      "to_digimon_id": 81,
      "level_required": 15,
      "stat_requirements": {
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 144,
      "from_digimon_id": 33,
      "to_digimon_id": 81,
      "level_required": 15,
      "stat_requirements": {
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 104,
      "from_digimon_id": 26,
      "to_digimon_id": 81,
      "level_required": 15,
      "stat_requirements": {
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 936,
      "from_digimon_id": 363,
      "to_digimon_id": 81,
      "level_required": 15,
      "stat_requirements": {
        "spd": 55
      },
      "dna_requirement": null
    }
  ],
  "82": [
    {
      "id": 171,
      "from_digimon_id": 40,
      "to_digimon_id": 82,
      "level_required": 14,
      "stat_requirements": {
        "def": 40,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 216,
      "from_digimon_id": 50,
      "to_digimon_id": 82,
      "level_required": 14,
      "stat_requirements": {
        "def": 40,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 267,
      "from_digimon_id": 64,
      "to_digimon_id": 82,
      "level_required": 14,
      "stat_requirements": {
        "def": 40,
        "int": 40
      },
      "dna_requirement": null
    }
  ],
  "83": [
    {
      "id": 92,
      "from_digimon_id": 24,
      "to_digimon_id": 83,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 55
      },
      "dna_requirement": null
    },
    {
      "id": 156,
      "from_digimon_id": 35,
      "to_digimon_id": 83,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 55
      },
      "dna_requirement": null
    },
    {
      "id": 236,
      "from_digimon_id": 55,
      "to_digimon_id": 83,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 55
      },
      "dna_requirement": null
    }
  ],
  "84": [
    {
      "id": 100,
      "from_digimon_id": 25,
      "to_digimon_id": 84,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 261,
      "from_digimon_id": 63,
      "to_digimon_id": 84,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 166,
      "from_digimon_id": 39,
      "to_digimon_id": 84,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 896,
      "from_digimon_id": 333,
      "to_digimon_id": 84,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "spd": 40
      },
      "dna_requirement": null
    }
  ],
  "85": [
    {
      "id": 255,
      "from_digimon_id": 62,
      "to_digimon_id": 85,
      "level_required": 15,
      "stat_requirements": {
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 110,
      "from_digimon_id": 27,
      "to_digimon_id": 85,
      "level_required": 15,
      "stat_requirements": {
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 86,
      "from_digimon_id": 23,
      "to_digimon_id": 85,
      "level_required": 15,
      "stat_requirements": {
        "spd": 50
      },
      "dna_requirement": null
    }
  ],
  "86": [
    {
      "id": 87,
      "from_digimon_id": 23,
      "to_digimon_id": 86,
      "level_required": 15,
      "stat_requirements": {
        "atk": 35,
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 116,
      "from_digimon_id": 28,
      "to_digimon_id": 86,
      "level_required": 15,
      "stat_requirements": {
        "atk": 35,
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 105,
      "from_digimon_id": 26,
      "to_digimon_id": 86,
      "level_required": 15,
      "stat_requirements": {
        "atk": 35,
        "spd": 50
      },
      "dna_requirement": null
    }
  ],
  "87": [
    {
      "id": 256,
      "from_digimon_id": 62,
      "to_digimon_id": 87,
      "level_required": 14,
      "stat_requirements": {
        "sp": 40,
        "int": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 211,
      "from_digimon_id": 49,
      "to_digimon_id": 87,
      "level_required": 14,
      "stat_requirements": {
        "sp": 40,
        "int": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 217,
      "from_digimon_id": 50,
      "to_digimon_id": 87,
      "level_required": 14,
      "stat_requirements": {
        "sp": 40,
        "int": 40,
        "spd": 40
      },
      "dna_requirement": null
    }
  ],
  "88": [
    {
      "id": 68,
      "from_digimon_id": 19,
      "to_digimon_id": 88,
      "level_required": 15,
      "stat_requirements": {
        "atk": 50,
        "spd": 20
      },
      "dna_requirement": null
    },
    {
      "id": 122,
      "from_digimon_id": 29,
      "to_digimon_id": 88,
      "level_required": 15,
      "stat_requirements": {
        "atk": 50,
        "spd": 20
      },
      "dna_requirement": null
    },
    {
      "id": 145,
      "from_digimon_id": 33,
      "to_digimon_id": 88,
      "level_required": 15,
      "stat_requirements": {
        "atk": 50,
        "spd": 20
      },
      "dna_requirement": null
    }
  ],
  "89": [
    {
      "id": 750,
      "from_digimon_id": 58,
      "to_digimon_id": 89,
      "level_required": 16,
      "stat_requirements": {
        "hp": 150,
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 106,
      "from_digimon_id": 26,
      "to_digimon_id": 89,
      "level_required": 16,
      "stat_requirements": {
        "hp": 150,
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 133,
      "from_digimon_id": 31,
      "to_digimon_id": 89,
      "level_required": 16,
      "stat_requirements": {
        "hp": 150,
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 719,
      "from_digimon_id": 20,
      "to_digimon_id": 89,
      "level_required": 16,
      "stat_requirements": {
        "hp": 150,
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 212,
      "from_digimon_id": 49,
      "to_digimon_id": 89,
      "level_required": 16,
      "stat_requirements": {
        "hp": 150,
        "atk": 40
      },
      "dna_requirement": null
    }
  ],
  "90": [
    {
      "id": 62,
      "from_digimon_id": 18,
      "to_digimon_id": 90,
      "level_required": 16,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    },
    {
      "id": 198,
      "from_digimon_id": 47,
      "to_digimon_id": 90,
      "level_required": 16,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    },
    {
      "id": 178,
      "from_digimon_id": 41,
      "to_digimon_id": 90,
      "level_required": 16,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    }
  ],
  "91": [
    {
      "id": 69,
      "from_digimon_id": 19,
      "to_digimon_id": 91,
      "level_required": 16,
      "stat_requirements": {
        "hp": 150,
        "atk": 50
      },
      "dna_requirement": null
    },
    {
      "id": 123,
      "from_digimon_id": 29,
      "to_digimon_id": 91,
      "level_required": 16,
      "stat_requirements": {
        "hp": 150,
        "atk": 50
      },
      "dna_requirement": null
    },
    {
      "id": 146,
      "from_digimon_id": 33,
      "to_digimon_id": 91,
      "level_required": 16,
      "stat_requirements": {
        "hp": 150,
        "atk": 50
      },
      "dna_requirement": null
    }
  ],
  "92": [
    {
      "id": 138,
      "from_digimon_id": 32,
      "to_digimon_id": 92,
      "level_required": 14,
      "stat_requirements": {
        "int": 35
      },
      "dna_requirement": null
    },
    {
      "id": 160,
      "from_digimon_id": 37,
      "to_digimon_id": 92,
      "level_required": 14,
      "stat_requirements": {
        "int": 35
      },
      "dna_requirement": null
    },
    {
      "id": 176,
      "from_digimon_id": 41,
      "to_digimon_id": 92,
      "level_required": 14,
      "stat_requirements": {
        "int": 35
      },
      "dna_requirement": null
    },
    {
      "id": 188,
      "from_digimon_id": 45,
      "to_digimon_id": 92,
      "level_required": 14,
      "stat_requirements": {
        "int": 35
      },
      "dna_requirement": null
    }
  ],
  "93": [
    {
      "id": 268,
      "from_digimon_id": 64,
      "to_digimon_id": 93,
      "level_required": 14,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    },
    {
      "id": 205,
      "from_digimon_id": 48,
      "to_digimon_id": 93,
      "level_required": 14,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    },
    {
      "id": 172,
      "from_digimon_id": 40,
      "to_digimon_id": 93,
      "level_required": 14,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    }
  ],
  "94": [
    {
      "id": 157,
      "from_digimon_id": 35,
      "to_digimon_id": 94,
      "level_required": 14,
      "stat_requirements": {
        "sp": 40,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 93,
      "from_digimon_id": 24,
      "to_digimon_id": 94,
      "level_required": 14,
      "stat_requirements": {
        "sp": 40,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 237,
      "from_digimon_id": 55,
      "to_digimon_id": 94,
      "level_required": 14,
      "stat_requirements": {
        "sp": 40,
        "int": 40
      },
      "dna_requirement": null
    }
  ],
  "95": [
    {
      "id": 161,
      "from_digimon_id": 37,
      "to_digimon_id": 95,
      "level_required": 12,
      "stat_requirements": {
        "hp": 130,
        "sp": 25,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 75,
      "from_digimon_id": 21,
      "to_digimon_id": 95,
      "level_required": 12,
      "stat_requirements": {
        "hp": 130,
        "sp": 25,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 88,
      "from_digimon_id": 23,
      "to_digimon_id": 95,
      "level_required": 12,
      "stat_requirements": {
        "hp": 130,
        "sp": 25,
        "def": 40
      },
      "dna_requirement": null
    }
  ],
  "96": [
    {
      "id": 734,
      "from_digimon_id": 43,
      "to_digimon_id": 96,
      "level_required": 14,
      "stat_requirements": {
        "atk": 60,
        "spd": 25
      },
      "dna_requirement": null
    },
    {
      "id": 747,
      "from_digimon_id": 58,
      "to_digimon_id": 96,
      "level_required": 14,
      "stat_requirements": {
        "atk": 60,
        "spd": 25
      },
      "dna_requirement": null
    }
  ],
  "97": [
    {
      "id": 148,
      "from_digimon_id": 33,
      "to_digimon_id": 97,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "def": 25,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 735,
      "from_digimon_id": 43,
      "to_digimon_id": 97,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "def": 25,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 935,
      "from_digimon_id": 363,
      "to_digimon_id": 97,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "def": 25,
        "spd": 40
      },
      "dna_requirement": null
    }
  ],
  "98": [
    {
      "id": 128,
      "from_digimon_id": 30,
      "to_digimon_id": 98,
      "level_required": 18,
      "stat_requirements": {
        "abi": 5
      },
      "dna_requirement": null
    },
    {
      "id": 76,
      "from_digimon_id": 21,
      "to_digimon_id": 98,
      "level_required": 18,
      "stat_requirements": {
        "abi": 5
      },
      "dna_requirement": null
    },
    {
      "id": 189,
      "from_digimon_id": 45,
      "to_digimon_id": 98,
      "level_required": 18,
      "stat_requirements": {
        "abi": 5
      },
      "dna_requirement": null
    },
    {
      "id": 723,
      "from_digimon_id": 36,
      "to_digimon_id": 98,
      "level_required": 18,
      "stat_requirements": {
        "abi": 5
      },
      "dna_requirement": null
    }
  ],
  "99": [
    {
      "id": 165,
      "from_digimon_id": 37,
      "to_digimon_id": 99,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 60
      },
      "dna_requirement": null
    },
    {
      "id": 79,
      "from_digimon_id": 21,
      "to_digimon_id": 99,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 60
      },
      "dna_requirement": null
    },
    {
      "id": 142,
      "from_digimon_id": 32,
      "to_digimon_id": 99,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 60
      },
      "dna_requirement": null
    }
  ],
  "100": [
    {
      "id": 70,
      "from_digimon_id": 19,
      "to_digimon_id": 100,
      "level_required": 14,
      "stat_requirements": {
        "atk": 30,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 77,
      "from_digimon_id": 21,
      "to_digimon_id": 100,
      "level_required": 14,
      "stat_requirements": {
        "atk": 30,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 183,
      "from_digimon_id": 44,
      "to_digimon_id": 100,
      "level_required": 14,
      "stat_requirements": {
        "atk": 30,
        "def": 40
      },
      "dna_requirement": null
    }
  ],
  "101": [
    {
      "id": 103,
      "from_digimon_id": 25,
      "to_digimon_id": 101,
      "level_required": 15,
      "stat_requirements": {
        "atk": 50,
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 752,
      "from_digimon_id": 61,
      "to_digimon_id": 101,
      "level_required": 15,
      "stat_requirements": {
        "atk": 50,
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 730,
      "from_digimon_id": 42,
      "to_digimon_id": 101,
      "level_required": 15,
      "stat_requirements": {
        "atk": 50,
        "spd": 55
      },
      "dna_requirement": null
    }
  ],
  "102": [
    {
      "id": 173,
      "from_digimon_id": 40,
      "to_digimon_id": 102,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 206,
      "from_digimon_id": 48,
      "to_digimon_id": 102,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 248,
      "from_digimon_id": 59,
      "to_digimon_id": 102,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 745,
      "from_digimon_id": 57,
      "to_digimon_id": 102,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "int": 40
      },
      "dna_requirement": null
    }
  ],
  "103": [
    {
      "id": 94,
      "from_digimon_id": 24,
      "to_digimon_id": 103,
      "level_required": 14,
      "stat_requirements": {
        "def": 30,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 238,
      "from_digimon_id": 55,
      "to_digimon_id": 103,
      "level_required": 14,
      "stat_requirements": {
        "def": 30,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 158,
      "from_digimon_id": 35,
      "to_digimon_id": 103,
      "level_required": 14,
      "stat_requirements": {
        "def": 30,
        "int": 40
      },
      "dna_requirement": null
    }
  ],
  "104": [
    {
      "id": 96,
      "from_digimon_id": 24,
      "to_digimon_id": 104,
      "level_required": 14,
      "stat_requirements": {
        "hp": 300,
        "spd": 30
      },
      "dna_requirement": null
    },
    {
      "id": 159,
      "from_digimon_id": 35,
      "to_digimon_id": 104,
      "level_required": 14,
      "stat_requirements": {
        "hp": 300,
        "spd": 30
      },
      "dna_requirement": null
    }
  ],
  "105": [
    {
      "id": 63,
      "from_digimon_id": 18,
      "to_digimon_id": 105,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "atk": 50
      },
      "dna_requirement": null
    },
    {
      "id": 121,
      "from_digimon_id": 29,
      "to_digimon_id": 105,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "atk": 50
      },
      "dna_requirement": null
    },
    {
      "id": 199,
      "from_digimon_id": 47,
      "to_digimon_id": 105,
      "level_required": 15,
      "stat_requirements": {
        "hp": 150,
        "atk": 50
      },
      "dna_requirement": null
    }
  ],
  "106": [
    {
      "id": 64,
      "from_digimon_id": 18,
      "to_digimon_id": 106,
      "level_required": 12,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 89,
      "from_digimon_id": 23,
      "to_digimon_id": 106,
      "level_required": 12,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 179,
      "from_digimon_id": 41,
      "to_digimon_id": 106,
      "level_required": 12,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 726,
      "from_digimon_id": 38,
      "to_digimon_id": 106,
      "level_required": 12,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    }
  ],
  "107": [
    {
      "id": 139,
      "from_digimon_id": 32,
      "to_digimon_id": 107,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 35
      },
      "dna_requirement": null
    },
    {
      "id": 162,
      "from_digimon_id": 37,
      "to_digimon_id": 107,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 35
      },
      "dna_requirement": null
    },
    {
      "id": 180,
      "from_digimon_id": 41,
      "to_digimon_id": 107,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 35
      },
      "dna_requirement": null
    },
    {
      "id": 190,
      "from_digimon_id": 45,
      "to_digimon_id": 107,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 35
      },
      "dna_requirement": null
    }
  ],
  "108": [
    {
      "id": 174,
      "from_digimon_id": 40,
      "to_digimon_id": 108,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 222,
      "from_digimon_id": 51,
      "to_digimon_id": 108,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 269,
      "from_digimon_id": 64,
      "to_digimon_id": 108,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 740,
      "from_digimon_id": 52,
      "to_digimon_id": 108,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 55
      },
      "dna_requirement": null
    }
  ],
  "109": [
    {
      "id": 154,
      "from_digimon_id": 34,
      "to_digimon_id": 109,
      "level_required": 15,
      "stat_requirements": {
        "atk": 45,
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 229,
      "from_digimon_id": 53,
      "to_digimon_id": 109,
      "level_required": 15,
      "stat_requirements": {
        "atk": 45,
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 748,
      "from_digimon_id": 58,
      "to_digimon_id": 109,
      "level_required": 15,
      "stat_requirements": {
        "atk": 45,
        "spd": 50
      },
      "dna_requirement": null
    }
  ],
  "110": [
    {
      "id": 201,
      "from_digimon_id": 47,
      "to_digimon_id": 110,
      "level_required": 20,
      "stat_requirements": {
        "atk": 50,
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 721,
      "from_digimon_id": 36,
      "to_digimon_id": 110,
      "level_required": 20,
      "stat_requirements": {
        "atk": 50,
        "spd": 50
      },
      "dna_requirement": null
    }
  ],
  "111": [
    {
      "id": 83,
      "from_digimon_id": 22,
      "to_digimon_id": 111,
      "level_required": 16,
      "stat_requirements": {
        "sp": 40,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 151,
      "from_digimon_id": 34,
      "to_digimon_id": 111,
      "level_required": 16,
      "stat_requirements": {
        "sp": 40,
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 230,
      "from_digimon_id": 54,
      "to_digimon_id": 111,
      "level_required": 16,
      "stat_requirements": {
        "sp": 40,
        "int": 40
      },
      "dna_requirement": null
    }
  ],
  "112": [
    {
      "id": 140,
      "from_digimon_id": 32,
      "to_digimon_id": 112,
      "level_required": 14,
      "stat_requirements": {
        "def": 55
      },
      "dna_requirement": null
    },
    {
      "id": 71,
      "from_digimon_id": 19,
      "to_digimon_id": 112,
      "level_required": 14,
      "stat_requirements": {
        "def": 55
      },
      "dna_requirement": null
    },
    {
      "id": 78,
      "from_digimon_id": 21,
      "to_digimon_id": 112,
      "level_required": 14,
      "stat_requirements": {
        "def": 55
      },
      "dna_requirement": null
    }
  ],
  "113": [
    {
      "id": 264,
      "from_digimon_id": 63,
      "to_digimon_id": 113,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 209,
      "from_digimon_id": 48,
      "to_digimon_id": 113,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 743,
      "from_digimon_id": 57,
      "to_digimon_id": 113,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    }
  ],
  "114": [
    {
      "id": 124,
      "from_digimon_id": 29,
      "to_digimon_id": 114,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 65,
      "from_digimon_id": 18,
      "to_digimon_id": 114,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 72,
      "from_digimon_id": 19,
      "to_digimon_id": 114,
      "level_required": 14,
      "stat_requirements": {
        "hp": 150,
        "atk": 40
      },
      "dna_requirement": null
    }
  ],
  "115": [
    {
      "id": 194,
      "from_digimon_id": 46,
      "to_digimon_id": 115,
      "level_required": 16,
      "stat_requirements": {
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 231,
      "from_digimon_id": 54,
      "to_digimon_id": 115,
      "level_required": 16,
      "stat_requirements": {
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 168,
      "from_digimon_id": 39,
      "to_digimon_id": 115,
      "level_required": 16,
      "stat_requirements": {
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 755,
      "from_digimon_id": 61,
      "to_digimon_id": 115,
      "level_required": 16,
      "stat_requirements": {
        "int": 40
      },
      "dna_requirement": null
    }
  ],
  "116": [
    {
      "id": 252,
      "from_digimon_id": 60,
      "to_digimon_id": 116,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 213,
      "from_digimon_id": 49,
      "to_digimon_id": 116,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 262,
      "from_digimon_id": 63,
      "to_digimon_id": 116,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 733,
      "from_digimon_id": 42,
      "to_digimon_id": 116,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "atk": 40
      },
      "dna_requirement": null
    }
  ],
  "117": [
    {
      "id": 265,
      "from_digimon_id": 63,
      "to_digimon_id": 117,
      "level_required": 14,
      "stat_requirements": {
        "atk": 45,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 258,
      "from_digimon_id": 62,
      "to_digimon_id": 117,
      "level_required": 14,
      "stat_requirements": {
        "atk": 45,
        "spd": 40
      },
      "dna_requirement": null
    }
  ],
  "118": [
    {
      "id": 742,
      "from_digimon_id": 52,
      "to_digimon_id": 118,
      "level_required": 16,
      "stat_requirements": {
        "hp": 300,
        "def": 30
      },
      "dna_requirement": null
    },
    {
      "id": 101,
      "from_digimon_id": 25,
      "to_digimon_id": 118,
      "level_required": 16,
      "stat_requirements": {
        "hp": 300,
        "def": 30
      },
      "dna_requirement": null
    },
    {
      "id": 207,
      "from_digimon_id": 48,
      "to_digimon_id": 118,
      "level_required": 16,
      "stat_requirements": {
        "hp": 300,
        "def": 30
      },
      "dna_requirement": null
    },
    {
      "id": 249,
      "from_digimon_id": 59,
      "to_digimon_id": 118,
      "level_required": 16,
      "stat_requirements": {
        "hp": 300,
        "def": 30
      },
      "dna_requirement": null
    }
  ],
  "119": [
    {
      "id": 107,
      "from_digimon_id": 26,
      "to_digimon_id": 119,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 111,
      "from_digimon_id": 27,
      "to_digimon_id": 119,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 184,
      "from_digimon_id": 44,
      "to_digimon_id": 119,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 751,
      "from_digimon_id": 58,
      "to_digimon_id": 119,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    }
  ],
  "120": [
    {
      "id": 108,
      "from_digimon_id": 26,
      "to_digimon_id": 120,
      "level_required": 12,
      "stat_requirements": {
        "atk": 40,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 90,
      "from_digimon_id": 23,
      "to_digimon_id": 120,
      "level_required": 12,
      "stat_requirements": {
        "atk": 40,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 147,
      "from_digimon_id": 33,
      "to_digimon_id": 120,
      "level_required": 12,
      "stat_requirements": {
        "atk": 40,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 727,
      "from_digimon_id": 38,
      "to_digimon_id": 120,
      "level_required": 12,
      "stat_requirements": {
        "atk": 40,
        "def": 40
      },
      "dna_requirement": null
    }
  ],
  "121": [
    {
      "id": 95,
      "from_digimon_id": 24,
      "to_digimon_id": 121,
      "level_required": 12,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 239,
      "from_digimon_id": 55,
      "to_digimon_id": 121,
      "level_required": 12,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 112,
      "from_digimon_id": 27,
      "to_digimon_id": 121,
      "level_required": 12,
      "stat_requirements": {
        "hp": 150,
        "def": 40
      },
      "dna_requirement": null
    }
  ],
  "122": [
    {
      "id": 195,
      "from_digimon_id": 46,
      "to_digimon_id": 122,
      "level_required": 14,
      "stat_requirements": {
        "hp": 40,
        "int": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 218,
      "from_digimon_id": 50,
      "to_digimon_id": 122,
      "level_required": 14,
      "stat_requirements": {
        "hp": 40,
        "int": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 243,
      "from_digimon_id": 56,
      "to_digimon_id": 122,
      "level_required": 14,
      "stat_requirements": {
        "hp": 40,
        "int": 40,
        "spd": 40
      },
      "dna_requirement": null
    }
  ],
  "123": [
    {
      "id": 202,
      "from_digimon_id": 47,
      "to_digimon_id": 123,
      "level_required": 16,
      "stat_requirements": {
        "atk": 55,
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 235,
      "from_digimon_id": 54,
      "to_digimon_id": 123,
      "level_required": 16,
      "stat_requirements": {
        "atk": 55,
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 722,
      "from_digimon_id": 36,
      "to_digimon_id": 123,
      "level_required": 16,
      "stat_requirements": {
        "atk": 55,
        "spd": 50
      },
      "dna_requirement": null
    }
  ],
  "124": [
    {
      "id": 214,
      "from_digimon_id": 49,
      "to_digimon_id": 124,
      "level_required": 13,
      "stat_requirements": {
        "sp": 40,
        "int": 30
      },
      "dna_requirement": null
    },
    {
      "id": 84,
      "from_digimon_id": 22,
      "to_digimon_id": 124,
      "level_required": 13,
      "stat_requirements": {
        "sp": 40,
        "int": 30
      },
      "dna_requirement": null
    },
    {
      "id": 134,
      "from_digimon_id": 31,
      "to_digimon_id": 124,
      "level_required": 13,
      "stat_requirements": {
        "sp": 40,
        "int": 30
      },
      "dna_requirement": null
    }
  ],
  "125": [
    {
      "id": 113,
      "from_digimon_id": 27,
      "to_digimon_id": 125,
      "level_required": 16,
      "stat_requirements": {
        "atk": 40,
        "spd": 35
      },
      "dna_requirement": null
    },
    {
      "id": 225,
      "from_digimon_id": 53,
      "to_digimon_id": 125,
      "level_required": 16,
      "stat_requirements": {
        "atk": 40,
        "spd": 35
      },
      "dna_requirement": null
    },
    {
      "id": 232,
      "from_digimon_id": 54,
      "to_digimon_id": 125,
      "level_required": 16,
      "stat_requirements": {
        "atk": 40,
        "spd": 35
      },
      "dna_requirement": null
    },
    {
      "id": 736,
      "from_digimon_id": 43,
      "to_digimon_id": 125,
      "level_required": 16,
      "stat_requirements": {
        "atk": 40,
        "spd": 35
      },
      "dna_requirement": null
    }
  ],
  "126": [
    {
      "id": 271,
      "from_digimon_id": 64,
      "to_digimon_id": 126,
      "level_required": 15,
      "stat_requirements": {
        "sp": 40,
        "spd": 40
      },
      "dna_requirement": null
    }
  ],
  "127": [
    {
      "id": 191,
      "from_digimon_id": 45,
      "to_digimon_id": 127,
      "level_required": 20,
      "stat_requirements": {},
      "dna_requirement": null
    },
    {
      "id": 200,
      "from_digimon_id": 47,
      "to_digimon_id": 127,
      "level_required": 20,
      "stat_requirements": {},
      "dna_requirement": null
    },
    {
      "id": 135,
      "from_digimon_id": 31,
      "to_digimon_id": 127,
      "level_required": 20,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "128": [
    {
      "id": 728,
      "from_digimon_id": 38,
      "to_digimon_id": 128,
      "level_required": 16,
      "stat_requirements": {
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 85,
      "from_digimon_id": 22,
      "to_digimon_id": 128,
      "level_required": 16,
      "stat_requirements": {
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 257,
      "from_digimon_id": 62,
      "to_digimon_id": 128,
      "level_required": 16,
      "stat_requirements": {
        "int": 40
      },
      "dna_requirement": null
    },
    {
      "id": 263,
      "from_digimon_id": 63,
      "to_digimon_id": 128,
      "level_required": 16,
      "stat_requirements": {
        "int": 40
      },
      "dna_requirement": null
    }
  ],
  "129": [
    {
      "id": 746,
      "from_digimon_id": 57,
      "to_digimon_id": 129,
      "level_required": 12,
      "stat_requirements": {
        "hp": 300
      },
      "dna_requirement": null
    },
    {
      "id": 117,
      "from_digimon_id": 28,
      "to_digimon_id": 129,
      "level_required": 12,
      "stat_requirements": {
        "hp": 300
      },
      "dna_requirement": null
    },
    {
      "id": 240,
      "from_digimon_id": 55,
      "to_digimon_id": 129,
      "level_required": 12,
      "stat_requirements": {
        "hp": 300
      },
      "dna_requirement": null
    },
    {
      "id": 250,
      "from_digimon_id": 59,
      "to_digimon_id": 129,
      "level_required": 12,
      "stat_requirements": {
        "hp": 300
      },
      "dna_requirement": null
    },
    {
      "id": 208,
      "from_digimon_id": 48,
      "to_digimon_id": 129,
      "level_required": 12,
      "stat_requirements": {
        "hp": 300
      },
      "dna_requirement": null
    }
  ],
  "130": [
    {
      "id": 223,
      "from_digimon_id": 51,
      "to_digimon_id": 130,
      "level_required": 14,
      "stat_requirements": {
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 129,
      "from_digimon_id": 30,
      "to_digimon_id": 130,
      "level_required": 14,
      "stat_requirements": {
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 244,
      "from_digimon_id": 56,
      "to_digimon_id": 130,
      "level_required": 14,
      "stat_requirements": {
        "spd": 50
      },
      "dna_requirement": null
    }
  ],
  "131": [
    {
      "id": 66,
      "from_digimon_id": 18,
      "to_digimon_id": 131,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 125,
      "from_digimon_id": 29,
      "to_digimon_id": 131,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 163,
      "from_digimon_id": 37,
      "to_digimon_id": 131,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40
      },
      "dna_requirement": null
    },
    {
      "id": 245,
      "from_digimon_id": 56,
      "to_digimon_id": 131,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40
      },
      "dna_requirement": null
    }
  ],
  "132": [
    {
      "id": 73,
      "from_digimon_id": 19,
      "to_digimon_id": 132,
      "level_required": 14,
      "stat_requirements": {
        "atk": 55,
        "def": 55
      },
      "dna_requirement": null
    },
    {
      "id": 203,
      "from_digimon_id": 47,
      "to_digimon_id": 132,
      "level_required": 14,
      "stat_requirements": {
        "atk": 55,
        "def": 55
      },
      "dna_requirement": null
    }
  ],
  "133": [
    {
      "id": 152,
      "from_digimon_id": 34,
      "to_digimon_id": 133,
      "level_required": 14,
      "stat_requirements": {
        "hp": 250,
        "atk": 30
      },
      "dna_requirement": null
    },
    {
      "id": 114,
      "from_digimon_id": 27,
      "to_digimon_id": 133,
      "level_required": 14,
      "stat_requirements": {
        "hp": 250,
        "atk": 30
      },
      "dna_requirement": null
    },
    {
      "id": 233,
      "from_digimon_id": 54,
      "to_digimon_id": 133,
      "level_required": 14,
      "stat_requirements": {
        "hp": 250,
        "atk": 30
      },
      "dna_requirement": null
    },
    {
      "id": 118,
      "from_digimon_id": 28,
      "to_digimon_id": 133,
      "level_required": 14,
      "stat_requirements": {
        "hp": 250,
        "atk": 30
      },
      "dna_requirement": null
    }
  ],
  "134": [
    {
      "id": 197,
      "from_digimon_id": 46,
      "to_digimon_id": 134,
      "level_required": 13,
      "stat_requirements": {
        "int": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 170,
      "from_digimon_id": 39,
      "to_digimon_id": 134,
      "level_required": 13,
      "stat_requirements": {
        "int": 40,
        "spd": 40
      },
      "dna_requirement": null
    }
  ],
  "135": [
    {
      "id": 186,
      "from_digimon_id": 44,
      "to_digimon_id": 135,
      "level_required": 15,
      "stat_requirements": {
        "hp": 130,
        "atk": 50
      },
      "dna_requirement": null
    },
    {
      "id": 739,
      "from_digimon_id": 52,
      "to_digimon_id": 135,
      "level_required": 15,
      "stat_requirements": {
        "hp": 130,
        "atk": 50
      },
      "dna_requirement": null
    },
    {
      "id": 749,
      "from_digimon_id": 58,
      "to_digimon_id": 135,
      "level_required": 15,
      "stat_requirements": {
        "hp": 130,
        "atk": 50
      },
      "dna_requirement": null
    },
    {
      "id": 902,
      "from_digimon_id": 328,
      "to_digimon_id": 135,
      "level_required": 15,
      "stat_requirements": {
        "hp": 130,
        "atk": 50
      },
      "dna_requirement": null
    }
  ],
  "136": [
    {
      "id": 120,
      "from_digimon_id": 28,
      "to_digimon_id": 136,
      "level_required": 12,
      "stat_requirements": {
        "hp": 500
      },
      "dna_requirement": null
    },
    {
      "id": 97,
      "from_digimon_id": 24,
      "to_digimon_id": 136,
      "level_required": 12,
      "stat_requirements": {
        "hp": 500
      },
      "dna_requirement": null
    },
    {
      "id": 731,
      "from_digimon_id": 42,
      "to_digimon_id": 136,
      "level_required": 12,
      "stat_requirements": {
        "hp": 500
      },
      "dna_requirement": null
    },
    {
      "id": 725,
      "from_digimon_id": 38,
      "to_digimon_id": 136,
      "level_required": 12,
      "stat_requirements": {
        "hp": 500
      },
      "dna_requirement": null
    }
  ],
  "137": [
    {
      "id": 91,
      "from_digimon_id": 23,
      "to_digimon_id": 137,
      "level_required": 16,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    },
    {
      "id": 720,
      "from_digimon_id": 20,
      "to_digimon_id": 137,
      "level_required": 16,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    },
    {
      "id": 102,
      "from_digimon_id": 25,
      "to_digimon_id": 137,
      "level_required": 16,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    },
    {
      "id": 109,
      "from_digimon_id": 26,
      "to_digimon_id": 137,
      "level_required": 16,
      "stat_requirements": {
        "atk": 55
      },
      "dna_requirement": null
    }
  ],
  "138": [
    {
      "id": 753,
      "from_digimon_id": 61,
      "to_digimon_id": 138,
      "level_required": 15,
      "stat_requirements": {
        "atk": 35,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 897,
      "from_digimon_id": 333,
      "to_digimon_id": 138,
      "level_required": 15,
      "stat_requirements": {
        "atk": 35,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 259,
      "from_digimon_id": 62,
      "to_digimon_id": 138,
      "level_required": 15,
      "stat_requirements": {
        "atk": 35,
        "spd": 40
      },
      "dna_requirement": null
    }
  ],
  "139": [
    {
      "id": 119,
      "from_digimon_id": 28,
      "to_digimon_id": 139,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 130,
      "from_digimon_id": 30,
      "to_digimon_id": 139,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 234,
      "from_digimon_id": 54,
      "to_digimon_id": 139,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 196,
      "from_digimon_id": 46,
      "to_digimon_id": 139,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 903,
      "from_digimon_id": 328,
      "to_digimon_id": 139,
      "level_required": 16,
      "stat_requirements": {
        "abi": 5,
        "spd": 40
      },
      "dna_requirement": null
    }
  ],
  "140": [
    {
      "id": 185,
      "from_digimon_id": 44,
      "to_digimon_id": 140,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 175,
      "from_digimon_id": 40,
      "to_digimon_id": 140,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 270,
      "from_digimon_id": 64,
      "to_digimon_id": 140,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    },
    {
      "id": 741,
      "from_digimon_id": 52,
      "to_digimon_id": 140,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    }
  ],
  "141": [
    {
      "id": 481,
      "from_digimon_id": 140,
      "to_digimon_id": 141,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "def": 95
      },
      "dna_requirement": null
    },
    {
      "id": 457,
      "from_digimon_id": 129,
      "to_digimon_id": 141,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "def": 95
      },
      "dna_requirement": null
    },
    {
      "id": 320,
      "from_digimon_id": 82,
      "to_digimon_id": 141,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "def": 95
      },
      "dna_requirement": null
    }
  ],
  "142": [
    {
      "id": 348,
      "from_digimon_id": 89,
      "to_digimon_id": 142,
      "level_required": 30,
      "stat_requirements": {
        "atk": 110,
        "int": 85
      },
      "dna_requirement": null
    },
    {
      "id": 275,
      "from_digimon_id": 65,
      "to_digimon_id": 142,
      "level_required": 30,
      "stat_requirements": {
        "atk": 110,
        "int": 85
      },
      "dna_requirement": null
    },
    {
      "id": 763,
      "from_digimon_id": 69,
      "to_digimon_id": 142,
      "level_required": 30,
      "stat_requirements": {
        "atk": 110,
        "int": 85
      },
      "dna_requirement": null
    }
  ],
  "143": [
    {
      "id": 399,
      "from_digimon_id": 111,
      "to_digimon_id": 143,
      "level_required": 28,
      "stat_requirements": {
        "atk": 65,
        "int": 75,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 326,
      "from_digimon_id": 84,
      "to_digimon_id": 143,
      "level_required": 28,
      "stat_requirements": {
        "atk": 65,
        "int": 75,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 460,
      "from_digimon_id": 130,
      "to_digimon_id": 143,
      "level_required": 28,
      "stat_requirements": {
        "atk": 65,
        "int": 75,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 804,
      "from_digimon_id": 117,
      "to_digimon_id": 143,
      "level_required": 28,
      "stat_requirements": {
        "atk": 65,
        "int": 75,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 829,
      "from_digimon_id": 138,
      "to_digimon_id": 143,
      "level_required": 28,
      "stat_requirements": {
        "atk": 65,
        "int": 75,
        "spd": 85
      },
      "dna_requirement": null
    }
  ],
  "144": [
    {
      "id": 357,
      "from_digimon_id": 92,
      "to_digimon_id": 144,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 75,
        "int": 75
      },
      "dna_requirement": null
    },
    {
      "id": 312,
      "from_digimon_id": 79,
      "to_digimon_id": 144,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 75,
        "int": 75
      },
      "dna_requirement": null
    },
    {
      "id": 402,
      "from_digimon_id": 112,
      "to_digimon_id": 144,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 75,
        "int": 75
      },
      "dna_requirement": null
    },
    {
      "id": 775,
      "from_digimon_id": 80,
      "to_digimon_id": 144,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 75,
        "int": 75
      },
      "dna_requirement": null
    },
    {
      "id": 792,
      "from_digimon_id": 104,
      "to_digimon_id": 144,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 75,
        "int": 75
      },
      "dna_requirement": null
    }
  ],
  "145": [
    {
      "id": 473,
      "from_digimon_id": 137,
      "to_digimon_id": 145,
      "level_required": 26,
      "stat_requirements": {
        "def": 110
      },
      "dna_requirement": null
    },
    {
      "id": 802,
      "from_digimon_id": 113,
      "to_digimon_id": 145,
      "level_required": 26,
      "stat_requirements": {
        "def": 110
      },
      "dna_requirement": null
    },
    {
      "id": 282,
      "from_digimon_id": 70,
      "to_digimon_id": 145,
      "level_required": 26,
      "stat_requirements": {
        "def": 110
      },
      "dna_requirement": null
    },
    {
      "id": 427,
      "from_digimon_id": 120,
      "to_digimon_id": 145,
      "level_required": 26,
      "stat_requirements": {
        "def": 110
      },
      "dna_requirement": null
    },
    {
      "id": 756,
      "from_digimon_id": 66,
      "to_digimon_id": 145,
      "level_required": 26,
      "stat_requirements": {
        "def": 110
      },
      "dna_requirement": null
    },
    {
      "id": 785,
      "from_digimon_id": 99,
      "to_digimon_id": 145,
      "level_required": 26,
      "stat_requirements": {
        "def": 110
      },
      "dna_requirement": null
    }
  ],
  "146": [
    {
      "id": 395,
      "from_digimon_id": 108,
      "to_digimon_id": 146,
      "level_required": 30,
      "stat_requirements": {
        "atk": 95,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 345,
      "from_digimon_id": 89,
      "to_digimon_id": 146,
      "level_required": 30,
      "stat_requirements": {
        "atk": 95,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 415,
      "from_digimon_id": 116,
      "to_digimon_id": 146,
      "level_required": 30,
      "stat_requirements": {
        "atk": 95,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 765,
      "from_digimon_id": 69,
      "to_digimon_id": 146,
      "level_required": 30,
      "stat_requirements": {
        "atk": 95,
        "spd": 80
      },
      "dna_requirement": null
    }
  ],
  "147": [
    {
      "id": 272,
      "from_digimon_id": 65,
      "to_digimon_id": 147,
      "level_required": 30,
      "stat_requirements": {
        "abi": 10,
        "atk": 70,
        "int": 90
      },
      "dna_requirement": null
    },
    {
      "id": 416,
      "from_digimon_id": 116,
      "to_digimon_id": 147,
      "level_required": 30,
      "stat_requirements": {
        "abi": 10,
        "atk": 70,
        "int": 90
      },
      "dna_requirement": null
    },
    {
      "id": 291,
      "from_digimon_id": 72,
      "to_digimon_id": 147,
      "level_required": 30,
      "stat_requirements": {
        "abi": 10,
        "atk": 70,
        "int": 90
      },
      "dna_requirement": null
    },
    {
      "id": 439,
      "from_digimon_id": 124,
      "to_digimon_id": 147,
      "level_required": 30,
      "stat_requirements": {
        "abi": 10,
        "atk": 70,
        "int": 90
      },
      "dna_requirement": null
    },
    {
      "id": 789,
      "from_digimon_id": 101,
      "to_digimon_id": 147,
      "level_required": 30,
      "stat_requirements": {
        "abi": 10,
        "atk": 70,
        "int": 90
      },
      "dna_requirement": null
    }
  ],
  "148": [
    {
      "id": 301,
      "from_digimon_id": 76,
      "to_digimon_id": 148,
      "level_required": 30,
      "stat_requirements": {
        "abi": 10,
        "atk": 80,
        "spd": 95
      },
      "dna_requirement": null
    },
    {
      "id": 778,
      "from_digimon_id": 96,
      "to_digimon_id": 148,
      "level_required": 30,
      "stat_requirements": {
        "abi": 10,
        "atk": 80,
        "spd": 95
      },
      "dna_requirement": null
    },
    {
      "id": 769,
      "from_digimon_id": 75,
      "to_digimon_id": 148,
      "level_required": 30,
      "stat_requirements": {
        "abi": 10,
        "atk": 80,
        "spd": 95
      },
      "dna_requirement": null
    }
  ],
  "149": [
    {
      "id": 344,
      "from_digimon_id": 88,
      "to_digimon_id": 149,
      "level_required": 30,
      "stat_requirements": {
        "hp": 500,
        "atk": 120,
        "def": 60
      },
      "dna_requirement": null
    },
    {
      "id": 437,
      "from_digimon_id": 122,
      "to_digimon_id": 149,
      "level_required": 30,
      "stat_requirements": {
        "hp": 500,
        "atk": 120,
        "def": 60
      },
      "dna_requirement": null
    },
    {
      "id": 467,
      "from_digimon_id": 131,
      "to_digimon_id": 149,
      "level_required": 30,
      "stat_requirements": {
        "hp": 500,
        "atk": 120,
        "def": 60
      },
      "dna_requirement": null
    },
    {
      "id": 759,
      "from_digimon_id": 68,
      "to_digimon_id": 149,
      "level_required": 30,
      "stat_requirements": {
        "hp": 500,
        "atk": 120,
        "def": 60
      },
      "dna_requirement": null
    }
  ],
  "150": [
    {
      "id": 445,
      "from_digimon_id": 125,
      "to_digimon_id": 150,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "spd": 95
      },
      "dna_requirement": null
    },
    {
      "id": 277,
      "from_digimon_id": 67,
      "to_digimon_id": 150,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "spd": 95
      },
      "dna_requirement": null
    },
    {
      "id": 433,
      "from_digimon_id": 122,
      "to_digimon_id": 150,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "spd": 95
      },
      "dna_requirement": null
    },
    {
      "id": 779,
      "from_digimon_id": 96,
      "to_digimon_id": 150,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "spd": 95
      },
      "dna_requirement": null
    }
  ],
  "151": [
    {
      "id": 387,
      "from_digimon_id": 106,
      "to_digimon_id": 151,
      "level_required": 26,
      "stat_requirements": {
        "sp": 75,
        "def": 75,
        "spd": 65
      },
      "dna_requirement": null
    },
    {
      "id": 449,
      "from_digimon_id": 127,
      "to_digimon_id": 151,
      "level_required": 26,
      "stat_requirements": {
        "sp": 75,
        "def": 75,
        "spd": 65
      },
      "dna_requirement": null
    },
    {
      "id": 367,
      "from_digimon_id": 95,
      "to_digimon_id": 151,
      "level_required": 26,
      "stat_requirements": {
        "sp": 75,
        "def": 75,
        "spd": 65
      },
      "dna_requirement": null
    },
    {
      "id": 430,
      "from_digimon_id": 121,
      "to_digimon_id": 151,
      "level_required": 26,
      "stat_requirements": {
        "sp": 75,
        "def": 75,
        "spd": 65
      },
      "dna_requirement": null
    }
  ],
  "152": [
    {
      "id": 411,
      "from_digimon_id": 115,
      "to_digimon_id": 152,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "int": 100
      },
      "dna_requirement": null
    },
    {
      "id": 376,
      "from_digimon_id": 102,
      "to_digimon_id": 152,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "int": 100
      },
      "dna_requirement": null
    },
    {
      "id": 469,
      "from_digimon_id": 133,
      "to_digimon_id": 152,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "int": 100
      },
      "dna_requirement": null
    }
  ],
  "153": [
    {
      "id": 396,
      "from_digimon_id": 108,
      "to_digimon_id": 153,
      "level_required": 26,
      "stat_requirements": {
        "atk": 95,
        "def": 90
      },
      "dna_requirement": null
    },
    {
      "id": 361,
      "from_digimon_id": 93,
      "to_digimon_id": 153,
      "level_required": 26,
      "stat_requirements": {
        "atk": 95,
        "def": 90
      },
      "dna_requirement": null
    },
    {
      "id": 482,
      "from_digimon_id": 140,
      "to_digimon_id": 153,
      "level_required": 26,
      "stat_requirements": {
        "atk": 95,
        "def": 90
      },
      "dna_requirement": null
    }
  ],
  "154": [
    {
      "id": 278,
      "from_digimon_id": 67,
      "to_digimon_id": 154,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 303,
      "from_digimon_id": 77,
      "to_digimon_id": 154,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 434,
      "from_digimon_id": 122,
      "to_digimon_id": 154,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    }
  ],
  "155": [
    {
      "id": 766,
      "from_digimon_id": 73,
      "to_digimon_id": 155,
      "level_required": 30,
      "stat_requirements": {
        "hp": 300,
        "atk": 100,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 798,
      "from_digimon_id": 110,
      "to_digimon_id": 155,
      "level_required": 30,
      "stat_requirements": {
        "hp": 300,
        "atk": 100,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 787,
      "from_digimon_id": 101,
      "to_digimon_id": 155,
      "level_required": 30,
      "stat_requirements": {
        "hp": 300,
        "atk": 100,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 807,
      "from_digimon_id": 123,
      "to_digimon_id": 155,
      "level_required": 30,
      "stat_requirements": {
        "hp": 300,
        "atk": 100,
        "spd": 85
      },
      "dna_requirement": null
    }
  ],
  "156": [
    {
      "id": 383,
      "from_digimon_id": 105,
      "to_digimon_id": 156,
      "level_required": 26,
      "stat_requirements": {
        "hp": 800,
        "atk": 75,
        "def": 95
      },
      "dna_requirement": null
    },
    {
      "id": 340,
      "from_digimon_id": 88,
      "to_digimon_id": 156,
      "level_required": 26,
      "stat_requirements": {
        "hp": 800,
        "atk": 75,
        "def": 95
      },
      "dna_requirement": null
    },
    {
      "id": 403,
      "from_digimon_id": 112,
      "to_digimon_id": 156,
      "level_required": 26,
      "stat_requirements": {
        "hp": 800,
        "atk": 75,
        "def": 95
      },
      "dna_requirement": null
    },
    {
      "id": 821,
      "from_digimon_id": 135,
      "to_digimon_id": 156,
      "level_required": 26,
      "stat_requirements": {
        "hp": 800,
        "atk": 75,
        "def": 95
      },
      "dna_requirement": null
    }
  ],
  "157": [
    {
      "id": 316,
      "from_digimon_id": 79,
      "to_digimon_id": 157,
      "level_required": 26,
      "stat_requirements": {
        "hp": 700,
        "def": 85
      },
      "dna_requirement": null
    },
    {
      "id": 393,
      "from_digimon_id": 107,
      "to_digimon_id": 157,
      "level_required": 26,
      "stat_requirements": {
        "hp": 700,
        "def": 85
      },
      "dna_requirement": null
    },
    {
      "id": 452,
      "from_digimon_id": 127,
      "to_digimon_id": 157,
      "level_required": 26,
      "stat_requirements": {
        "hp": 700,
        "def": 85
      },
      "dna_requirement": null
    }
  ],
  "158": [
    {
      "id": 362,
      "from_digimon_id": 93,
      "to_digimon_id": 158,
      "level_required": 28,
      "stat_requirements": {
        "def": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 404,
      "from_digimon_id": 112,
      "to_digimon_id": 158,
      "level_required": 28,
      "stat_requirements": {
        "def": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 905,
      "from_digimon_id": 329,
      "to_digimon_id": 158,
      "level_required": 28,
      "stat_requirements": {
        "def": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 811,
      "from_digimon_id": 126,
      "to_digimon_id": 158,
      "level_required": 28,
      "stat_requirements": {
        "def": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 483,
      "from_digimon_id": 140,
      "to_digimon_id": 158,
      "level_required": 28,
      "stat_requirements": {
        "def": 75,
        "spd": 75
      },
      "dna_requirement": null
    }
  ],
  "159": [
    {
      "id": 386,
      "from_digimon_id": 105,
      "to_digimon_id": 159,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "abi": 10,
        "atk": 125
      },
      "dna_requirement": null
    },
    {
      "id": 286,
      "from_digimon_id": 70,
      "to_digimon_id": 159,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "abi": 10,
        "atk": 125
      },
      "dna_requirement": null
    },
    {
      "id": 781,
      "from_digimon_id": 97,
      "to_digimon_id": 159,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "abi": 10,
        "atk": 125
      },
      "dna_requirement": null
    }
  ],
  "160": [
    {
      "id": 313,
      "from_digimon_id": 79,
      "to_digimon_id": 160,
      "level_required": 26,
      "stat_requirements": {
        "hp": 400,
        "atk": 95
      },
      "dna_requirement": null
    },
    {
      "id": 317,
      "from_digimon_id": 81,
      "to_digimon_id": 160,
      "level_required": 26,
      "stat_requirements": {
        "hp": 400,
        "atk": 95
      },
      "dna_requirement": null
    },
    {
      "id": 474,
      "from_digimon_id": 137,
      "to_digimon_id": 160,
      "level_required": 26,
      "stat_requirements": {
        "hp": 400,
        "atk": 95
      },
      "dna_requirement": null
    },
    {
      "id": 937,
      "from_digimon_id": 364,
      "to_digimon_id": 160,
      "level_required": 26,
      "stat_requirements": {
        "hp": 400,
        "atk": 95
      },
      "dna_requirement": null
    }
  ],
  "161": [
    {
      "id": 477,
      "from_digimon_id": 137,
      "to_digimon_id": 161,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 80,
        "spd": 70
      },
      "dna_requirement": null
    },
    {
      "id": 819,
      "from_digimon_id": 135,
      "to_digimon_id": 161,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 80,
        "spd": 70
      },
      "dna_requirement": null
    },
    {
      "id": 426,
      "from_digimon_id": 119,
      "to_digimon_id": 161,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 80,
        "spd": 70
      },
      "dna_requirement": null
    },
    {
      "id": 773,
      "from_digimon_id": 80,
      "to_digimon_id": 161,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 80,
        "spd": 70
      },
      "dna_requirement": null
    }
  ],
  "162": [
    {
      "id": 394,
      "from_digimon_id": 107,
      "to_digimon_id": 162,
      "level_required": 30,
      "stat_requirements": {
        "sp": 60,
        "atk": 70
      },
      "dna_requirement": null
    },
    {
      "id": 472,
      "from_digimon_id": 133,
      "to_digimon_id": 162,
      "level_required": 30,
      "stat_requirements": {
        "sp": 60,
        "atk": 70
      },
      "dna_requirement": null
    },
    {
      "id": 828,
      "from_digimon_id": 138,
      "to_digimon_id": 162,
      "level_required": 30,
      "stat_requirements": {
        "sp": 60,
        "atk": 70
      },
      "dna_requirement": null
    }
  ],
  "163": [
    {
      "id": 346,
      "from_digimon_id": 89,
      "to_digimon_id": 163,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 453,
      "from_digimon_id": 128,
      "to_digimon_id": 163,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 446,
      "from_digimon_id": 125,
      "to_digimon_id": 163,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 805,
      "from_digimon_id": 117,
      "to_digimon_id": 163,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 796,
      "from_digimon_id": 109,
      "to_digimon_id": 163,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    }
  ],
  "164": [
    {
      "id": 283,
      "from_digimon_id": 70,
      "to_digimon_id": 164,
      "level_required": 30,
      "stat_requirements": {
        "def": 75,
        "int": 65
      },
      "dna_requirement": 77
    },
    {
      "id": 304,
      "from_digimon_id": 77,
      "to_digimon_id": 164,
      "level_required": 30,
      "stat_requirements": {
        "def": 75,
        "int": 65
      },
      "dna_requirement": 70
    }
  ],
  "165": [
    {
      "id": 321,
      "from_digimon_id": 82,
      "to_digimon_id": 165,
      "level_required": 28,
      "stat_requirements": {
        "hp": 800,
        "def": 70
      },
      "dna_requirement": null
    },
    {
      "id": 363,
      "from_digimon_id": 93,
      "to_digimon_id": 165,
      "level_required": 28,
      "stat_requirements": {
        "hp": 800,
        "def": 70
      },
      "dna_requirement": null
    },
    {
      "id": 273,
      "from_digimon_id": 65,
      "to_digimon_id": 165,
      "level_required": 28,
      "stat_requirements": {
        "hp": 800,
        "def": 70
      },
      "dna_requirement": null
    },
    {
      "id": 295,
      "from_digimon_id": 74,
      "to_digimon_id": 165,
      "level_required": 28,
      "stat_requirements": {
        "hp": 800,
        "def": 70
      },
      "dna_requirement": null
    }
  ],
  "166": [
    {
      "id": 412,
      "from_digimon_id": 115,
      "to_digimon_id": 166,
      "level_required": 30,
      "stat_requirements": {
        "atk": 60,
        "int": 75,
        "spd": 75
      },
      "dna_requirement": 67
    },
    {
      "id": 279,
      "from_digimon_id": 67,
      "to_digimon_id": 166,
      "level_required": 30,
      "stat_requirements": {
        "atk": 60,
        "int": 75,
        "spd": 75
      },
      "dna_requirement": 115
    }
  ],
  "167": [
    {
      "id": 428,
      "from_digimon_id": 120,
      "to_digimon_id": 167,
      "level_required": 28,
      "stat_requirements": {
        "sp": 70,
        "atk": 70,
        "def": 80
      },
      "dna_requirement": null
    },
    {
      "id": 368,
      "from_digimon_id": 95,
      "to_digimon_id": 167,
      "level_required": 28,
      "stat_requirements": {
        "sp": 70,
        "atk": 70,
        "def": 80
      },
      "dna_requirement": null
    },
    {
      "id": 388,
      "from_digimon_id": 106,
      "to_digimon_id": 167,
      "level_required": 28,
      "stat_requirements": {
        "sp": 70,
        "atk": 70,
        "def": 80
      },
      "dna_requirement": null
    },
    {
      "id": 390,
      "from_digimon_id": 107,
      "to_digimon_id": 167,
      "level_required": 28,
      "stat_requirements": {
        "sp": 70,
        "atk": 70,
        "def": 80
      },
      "dna_requirement": null
    }
  ],
  "168": [
    {
      "id": 284,
      "from_digimon_id": 70,
      "to_digimon_id": 168,
      "level_required": 28,
      "stat_requirements": {
        "atk": 120,
        "def": 85,
        "spd": 70
      },
      "dna_requirement": null
    },
    {
      "id": 384,
      "from_digimon_id": 105,
      "to_digimon_id": 168,
      "level_required": 28,
      "stat_requirements": {
        "atk": 120,
        "def": 85,
        "spd": 70
      },
      "dna_requirement": null
    },
    {
      "id": 349,
      "from_digimon_id": 90,
      "to_digimon_id": 168,
      "level_required": 28,
      "stat_requirements": {
        "atk": 120,
        "def": 85,
        "spd": 70
      },
      "dna_requirement": null
    },
    {
      "id": 814,
      "from_digimon_id": 132,
      "to_digimon_id": 168,
      "level_required": 28,
      "stat_requirements": {
        "atk": 120,
        "def": 85,
        "spd": 70
      },
      "dna_requirement": null
    }
  ],
  "169": [
    {
      "id": 823,
      "from_digimon_id": 136,
      "to_digimon_id": 169,
      "level_required": 28,
      "stat_requirements": {
        "atk": 80,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 311,
      "from_digimon_id": 78,
      "to_digimon_id": 169,
      "level_required": 28,
      "stat_requirements": {
        "atk": 80,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 419,
      "from_digimon_id": 116,
      "to_digimon_id": 169,
      "level_required": 28,
      "stat_requirements": {
        "atk": 80,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 764,
      "from_digimon_id": 69,
      "to_digimon_id": 169,
      "level_required": 28,
      "stat_requirements": {
        "atk": 80,
        "int": 70
      },
      "dna_requirement": null
    }
  ],
  "170": [
    {
      "id": 329,
      "from_digimon_id": 85,
      "to_digimon_id": 170,
      "level_required": 30,
      "stat_requirements": {
        "hp": 800,
        "atk": 75
      },
      "dna_requirement": null
    },
    {
      "id": 758,
      "from_digimon_id": 66,
      "to_digimon_id": 170,
      "level_required": 30,
      "stat_requirements": {
        "hp": 800,
        "atk": 75
      },
      "dna_requirement": null
    },
    {
      "id": 287,
      "from_digimon_id": 71,
      "to_digimon_id": 170,
      "level_required": 30,
      "stat_requirements": {
        "hp": 800,
        "atk": 75
      },
      "dna_requirement": null
    },
    {
      "id": 470,
      "from_digimon_id": 133,
      "to_digimon_id": 170,
      "level_required": 30,
      "stat_requirements": {
        "hp": 800,
        "atk": 75
      },
      "dna_requirement": null
    }
  ],
  "171": [
    {
      "id": 306,
      "from_digimon_id": 77,
      "to_digimon_id": 171,
      "level_required": 30,
      "stat_requirements": {
        "atk": 90,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 795,
      "from_digimon_id": 109,
      "to_digimon_id": 171,
      "level_required": 30,
      "stat_requirements": {
        "atk": 90,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 808,
      "from_digimon_id": 123,
      "to_digimon_id": 171,
      "level_required": 30,
      "stat_requirements": {
        "atk": 90,
        "spd": 80
      },
      "dna_requirement": null
    }
  ],
  "172": [
    {
      "id": 337,
      "from_digimon_id": 87,
      "to_digimon_id": 172,
      "level_required": 30,
      "stat_requirements": {
        "sp": 60,
        "int": 75,
        "spd": 60
      },
      "dna_requirement": null
    },
    {
      "id": 296,
      "from_digimon_id": 74,
      "to_digimon_id": 172,
      "level_required": 30,
      "stat_requirements": {
        "sp": 60,
        "int": 75,
        "spd": 60
      },
      "dna_requirement": null
    },
    {
      "id": 347,
      "from_digimon_id": 89,
      "to_digimon_id": 172,
      "level_required": 30,
      "stat_requirements": {
        "sp": 60,
        "int": 75,
        "spd": 60
      },
      "dna_requirement": null
    }
  ],
  "173": [
    {
      "id": 276,
      "from_digimon_id": 65,
      "to_digimon_id": 173,
      "level_required": 28,
      "stat_requirements": {
        "sp": 70,
        "int": 85
      },
      "dna_requirement": null
    },
    {
      "id": 824,
      "from_digimon_id": 136,
      "to_digimon_id": 173,
      "level_required": 28,
      "stat_requirements": {
        "sp": 70,
        "int": 85
      },
      "dna_requirement": null
    },
    {
      "id": 791,
      "from_digimon_id": 104,
      "to_digimon_id": 173,
      "level_required": 28,
      "stat_requirements": {
        "sp": 70,
        "int": 85
      },
      "dna_requirement": null
    }
  ],
  "174": [
    {
      "id": 478,
      "from_digimon_id": 139,
      "to_digimon_id": 174,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 423,
      "from_digimon_id": 119,
      "to_digimon_id": 174,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 435,
      "from_digimon_id": 122,
      "to_digimon_id": 174,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "spd": 100
      },
      "dna_requirement": null
    }
  ],
  "175": [
    {
      "id": 398,
      "from_digimon_id": 108,
      "to_digimon_id": 175,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 90,
        "spd": 75
      },
      "dna_requirement": 76
    },
    {
      "id": 302,
      "from_digimon_id": 76,
      "to_digimon_id": 175,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 90,
        "spd": 75
      },
      "dna_requirement": 108
    }
  ],
  "176": [
    {
      "id": 308,
      "from_digimon_id": 78,
      "to_digimon_id": 176,
      "level_required": 30,
      "stat_requirements": {
        "hp": 700,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 458,
      "from_digimon_id": 129,
      "to_digimon_id": 176,
      "level_required": 30,
      "stat_requirements": {
        "hp": 700,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 429,
      "from_digimon_id": 120,
      "to_digimon_id": 176,
      "level_required": 30,
      "stat_requirements": {
        "hp": 700,
        "def": 75
      },
      "dna_requirement": null
    }
  ],
  "177": [
    {
      "id": 292,
      "from_digimon_id": 72,
      "to_digimon_id": 177,
      "level_required": 28,
      "stat_requirements": {
        "hp": 500,
        "atk": 95
      },
      "dna_requirement": null
    },
    {
      "id": 309,
      "from_digimon_id": 78,
      "to_digimon_id": 177,
      "level_required": 28,
      "stat_requirements": {
        "hp": 500,
        "atk": 95
      },
      "dna_requirement": null
    },
    {
      "id": 463,
      "from_digimon_id": 131,
      "to_digimon_id": 177,
      "level_required": 28,
      "stat_requirements": {
        "hp": 500,
        "atk": 95
      },
      "dna_requirement": null
    },
    {
      "id": 761,
      "from_digimon_id": 68,
      "to_digimon_id": 177,
      "level_required": 28,
      "stat_requirements": {
        "hp": 500,
        "atk": 95
      },
      "dna_requirement": null
    }
  ],
  "178": [
    {
      "id": 774,
      "from_digimon_id": 80,
      "to_digimon_id": 178,
      "level_required": 40,
      "stat_requirements": {
        "hp": 800,
        "atk": 80,
        "def": 80
      },
      "dna_requirement": null
    },
    {
      "id": 799,
      "from_digimon_id": 110,
      "to_digimon_id": 178,
      "level_required": 40,
      "stat_requirements": {
        "hp": 800,
        "atk": 80,
        "def": 80
      },
      "dna_requirement": null
    },
    {
      "id": 820,
      "from_digimon_id": 135,
      "to_digimon_id": 178,
      "level_required": 40,
      "stat_requirements": {
        "hp": 800,
        "atk": 80,
        "def": 80
      },
      "dna_requirement": null
    }
  ],
  "179": [
    {
      "id": 379,
      "from_digimon_id": 103,
      "to_digimon_id": 179,
      "level_required": 26,
      "stat_requirements": {
        "hp": 900
      },
      "dna_requirement": null
    },
    {
      "id": 364,
      "from_digimon_id": 94,
      "to_digimon_id": 179,
      "level_required": 26,
      "stat_requirements": {
        "hp": 900
      },
      "dna_requirement": null
    },
    {
      "id": 323,
      "from_digimon_id": 83,
      "to_digimon_id": 179,
      "level_required": 26,
      "stat_requirements": {
        "hp": 900
      },
      "dna_requirement": null
    }
  ],
  "180": [
    {
      "id": 782,
      "from_digimon_id": 97,
      "to_digimon_id": 180,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 356,
      "from_digimon_id": 91,
      "to_digimon_id": 180,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 290,
      "from_digimon_id": 71,
      "to_digimon_id": 180,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 813,
      "from_digimon_id": 132,
      "to_digimon_id": 180,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 75
      },
      "dna_requirement": null
    }
  ],
  "181": [
    {
      "id": 424,
      "from_digimon_id": 119,
      "to_digimon_id": 181,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 330,
      "from_digimon_id": 85,
      "to_digimon_id": 181,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 353,
      "from_digimon_id": 91,
      "to_digimon_id": 181,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 373,
      "from_digimon_id": 100,
      "to_digimon_id": 181,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 822,
      "from_digimon_id": 135,
      "to_digimon_id": 181,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "def": 75
      },
      "dna_requirement": null
    }
  ],
  "182": [
    {
      "id": 354,
      "from_digimon_id": 91,
      "to_digimon_id": 182,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 358,
      "from_digimon_id": 92,
      "to_digimon_id": 182,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 454,
      "from_digimon_id": 128,
      "to_digimon_id": 182,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 405,
      "from_digimon_id": 112,
      "to_digimon_id": 182,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 767,
      "from_digimon_id": 73,
      "to_digimon_id": 182,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "def": 75
      },
      "dna_requirement": null
    }
  ],
  "183": [
    {
      "id": 374,
      "from_digimon_id": 100,
      "to_digimon_id": 183,
      "level_required": 28,
      "stat_requirements": {
        "sp": 60,
        "int": 85
      },
      "dna_requirement": null
    },
    {
      "id": 359,
      "from_digimon_id": 92,
      "to_digimon_id": 183,
      "level_required": 28,
      "stat_requirements": {
        "sp": 60,
        "int": 85
      },
      "dna_requirement": null
    },
    {
      "id": 314,
      "from_digimon_id": 79,
      "to_digimon_id": 183,
      "level_required": 28,
      "stat_requirements": {
        "sp": 60,
        "int": 85
      },
      "dna_requirement": null
    }
  ],
  "184": [
    {
      "id": 298,
      "from_digimon_id": 76,
      "to_digimon_id": 184,
      "level_required": 30,
      "stat_requirements": {
        "atk": 90,
        "def": 60,
        "spd": 75
      },
      "dna_requirement": 108
    },
    {
      "id": 397,
      "from_digimon_id": 108,
      "to_digimon_id": 184,
      "level_required": 30,
      "stat_requirements": {
        "atk": 90,
        "def": 60,
        "spd": 75
      },
      "dna_requirement": 76
    }
  ],
  "185": [
    {
      "id": 464,
      "from_digimon_id": 131,
      "to_digimon_id": 185,
      "level_required": 28,
      "stat_requirements": {
        "hp": 350,
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 475,
      "from_digimon_id": 137,
      "to_digimon_id": 185,
      "level_required": 28,
      "stat_requirements": {
        "hp": 350,
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 757,
      "from_digimon_id": 66,
      "to_digimon_id": 185,
      "level_required": 28,
      "stat_requirements": {
        "hp": 350,
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 331,
      "from_digimon_id": 85,
      "to_digimon_id": 185,
      "level_required": 28,
      "stat_requirements": {
        "hp": 350,
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    }
  ],
  "186": [
    {
      "id": 336,
      "from_digimon_id": 86,
      "to_digimon_id": 186,
      "level_required": 26,
      "stat_requirements": {
        "atk": 65,
        "def": 65
      },
      "dna_requirement": null
    },
    {
      "id": 414,
      "from_digimon_id": 115,
      "to_digimon_id": 186,
      "level_required": 26,
      "stat_requirements": {
        "atk": 65,
        "def": 65
      },
      "dna_requirement": null
    },
    {
      "id": 801,
      "from_digimon_id": 113,
      "to_digimon_id": 186,
      "level_required": 26,
      "stat_requirements": {
        "atk": 65,
        "def": 65
      },
      "dna_requirement": null
    },
    {
      "id": 899,
      "from_digimon_id": 335,
      "to_digimon_id": 186,
      "level_required": 26,
      "stat_requirements": {
        "atk": 65,
        "def": 65
      },
      "dna_requirement": null
    }
  ],
  "187": [
    {
      "id": 420,
      "from_digimon_id": 118,
      "to_digimon_id": 187,
      "level_required": 26,
      "stat_requirements": {
        "hp": 850,
        "atk": 60,
        "int": 60
      },
      "dna_requirement": null
    },
    {
      "id": 440,
      "from_digimon_id": 124,
      "to_digimon_id": 187,
      "level_required": 26,
      "stat_requirements": {
        "hp": 850,
        "atk": 60,
        "int": 60
      },
      "dna_requirement": null
    },
    {
      "id": 786,
      "from_digimon_id": 99,
      "to_digimon_id": 187,
      "level_required": 26,
      "stat_requirements": {
        "hp": 850,
        "atk": 60,
        "int": 60
      },
      "dna_requirement": null
    },
    {
      "id": 297,
      "from_digimon_id": 74,
      "to_digimon_id": 187,
      "level_required": 26,
      "stat_requirements": {
        "hp": 850,
        "atk": 60,
        "int": 60
      },
      "dna_requirement": null
    },
    {
      "id": 803,
      "from_digimon_id": 113,
      "to_digimon_id": 187,
      "level_required": 26,
      "stat_requirements": {
        "hp": 850,
        "atk": 60,
        "int": 60
      },
      "dna_requirement": null
    }
  ],
  "188": [
    {
      "id": 461,
      "from_digimon_id": 130,
      "to_digimon_id": 188,
      "level_required": 26,
      "stat_requirements": {
        "sp": 75,
        "int": 80,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 479,
      "from_digimon_id": 139,
      "to_digimon_id": 188,
      "level_required": 26,
      "stat_requirements": {
        "sp": 75,
        "int": 80,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 817,
      "from_digimon_id": 134,
      "to_digimon_id": 188,
      "level_required": 26,
      "stat_requirements": {
        "sp": 75,
        "int": 80,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 400,
      "from_digimon_id": 111,
      "to_digimon_id": 188,
      "level_required": 26,
      "stat_requirements": {
        "sp": 75,
        "int": 80,
        "spd": 80
      },
      "dna_requirement": null
    }
  ],
  "189": [
    {
      "id": 307,
      "from_digimon_id": 77,
      "to_digimon_id": 189,
      "level_required": 26,
      "stat_requirements": {
        "sp": 65,
        "int": 65
      },
      "dna_requirement": null
    },
    {
      "id": 281,
      "from_digimon_id": 67,
      "to_digimon_id": 189,
      "level_required": 26,
      "stat_requirements": {
        "sp": 65,
        "int": 65
      },
      "dna_requirement": null
    },
    {
      "id": 438,
      "from_digimon_id": 122,
      "to_digimon_id": 189,
      "level_required": 26,
      "stat_requirements": {
        "sp": 65,
        "int": 65
      },
      "dna_requirement": null
    },
    {
      "id": 816,
      "from_digimon_id": 134,
      "to_digimon_id": 189,
      "level_required": 26,
      "stat_requirements": {
        "sp": 65,
        "int": 65
      },
      "dna_requirement": null
    }
  ],
  "190": [
    {
      "id": 294,
      "from_digimon_id": 72,
      "to_digimon_id": 190,
      "level_required": 28,
      "stat_requirements": {
        "sp": 80,
        "int": 80
      },
      "dna_requirement": null
    },
    {
      "id": 443,
      "from_digimon_id": 124,
      "to_digimon_id": 190,
      "level_required": 28,
      "stat_requirements": {
        "sp": 80,
        "int": 80
      },
      "dna_requirement": null
    },
    {
      "id": 800,
      "from_digimon_id": 110,
      "to_digimon_id": 190,
      "level_required": 28,
      "stat_requirements": {
        "sp": 80,
        "int": 80
      },
      "dna_requirement": null
    },
    {
      "id": 825,
      "from_digimon_id": 136,
      "to_digimon_id": 190,
      "level_required": 28,
      "stat_requirements": {
        "sp": 80,
        "int": 80
      },
      "dna_requirement": null
    }
  ],
  "191": [
    {
      "id": 370,
      "from_digimon_id": 98,
      "to_digimon_id": 191,
      "level_required": 32,
      "stat_requirements": {},
      "dna_requirement": null
    },
    {
      "id": 324,
      "from_digimon_id": 83,
      "to_digimon_id": 191,
      "level_required": 32,
      "stat_requirements": {},
      "dna_requirement": null
    },
    {
      "id": 431,
      "from_digimon_id": 121,
      "to_digimon_id": 191,
      "level_required": 32,
      "stat_requirements": {},
      "dna_requirement": null
    },
    {
      "id": 826,
      "from_digimon_id": 136,
      "to_digimon_id": 191,
      "level_required": 32,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "192": [
    {
      "id": 333,
      "from_digimon_id": 86,
      "to_digimon_id": 192,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 80,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 465,
      "from_digimon_id": 131,
      "to_digimon_id": 192,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 80,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 417,
      "from_digimon_id": 116,
      "to_digimon_id": 192,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 80,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 441,
      "from_digimon_id": 124,
      "to_digimon_id": 192,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 80,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 780,
      "from_digimon_id": 96,
      "to_digimon_id": 192,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 80,
        "int": 70
      },
      "dna_requirement": null
    }
  ],
  "193": [
    {
      "id": 371,
      "from_digimon_id": 98,
      "to_digimon_id": 193,
      "level_required": 26,
      "stat_requirements": {
        "sp": 85
      },
      "dna_requirement": null
    },
    {
      "id": 389,
      "from_digimon_id": 106,
      "to_digimon_id": 193,
      "level_required": 26,
      "stat_requirements": {
        "sp": 85
      },
      "dna_requirement": null
    },
    {
      "id": 450,
      "from_digimon_id": 127,
      "to_digimon_id": 193,
      "level_required": 26,
      "stat_requirements": {
        "sp": 85
      },
      "dna_requirement": null
    }
  ],
  "194": [
    {
      "id": 288,
      "from_digimon_id": 71,
      "to_digimon_id": 194,
      "level_required": 28,
      "stat_requirements": {
        "hp": 850,
        "def": 75,
        "int": 75
      },
      "dna_requirement": null
    },
    {
      "id": 380,
      "from_digimon_id": 103,
      "to_digimon_id": 194,
      "level_required": 28,
      "stat_requirements": {
        "hp": 850,
        "def": 75,
        "int": 75
      },
      "dna_requirement": null
    },
    {
      "id": 365,
      "from_digimon_id": 94,
      "to_digimon_id": 194,
      "level_required": 28,
      "stat_requirements": {
        "hp": 850,
        "def": 75,
        "int": 75
      },
      "dna_requirement": null
    }
  ],
  "195": [
    {
      "id": 305,
      "from_digimon_id": 77,
      "to_digimon_id": 195,
      "level_required": 30,
      "stat_requirements": {
        "sp": 80,
        "abi": 10,
        "int": 80
      },
      "dna_requirement": null
    },
    {
      "id": 299,
      "from_digimon_id": 76,
      "to_digimon_id": 195,
      "level_required": 30,
      "stat_requirements": {
        "sp": 80,
        "abi": 10,
        "int": 80
      },
      "dna_requirement": null
    },
    {
      "id": 285,
      "from_digimon_id": 70,
      "to_digimon_id": 195,
      "level_required": 30,
      "stat_requirements": {
        "sp": 80,
        "abi": 10,
        "int": 80
      },
      "dna_requirement": null
    },
    {
      "id": 818,
      "from_digimon_id": 134,
      "to_digimon_id": 195,
      "level_required": 30,
      "stat_requirements": {
        "sp": 80,
        "abi": 10,
        "int": 80
      },
      "dna_requirement": null
    }
  ],
  "196": [
    {
      "id": 468,
      "from_digimon_id": 131,
      "to_digimon_id": 196,
      "level_required": 26,
      "stat_requirements": {
        "atk": 80,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 406,
      "from_digimon_id": 112,
      "to_digimon_id": 196,
      "level_required": 26,
      "stat_requirements": {
        "atk": 80,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 784,
      "from_digimon_id": 99,
      "to_digimon_id": 196,
      "level_required": 26,
      "stat_requirements": {
        "atk": 80,
        "def": 75
      },
      "dna_requirement": null
    }
  ],
  "197": [
    {
      "id": 444,
      "from_digimon_id": 124,
      "to_digimon_id": 197,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 760,
      "from_digimon_id": 68,
      "to_digimon_id": 197,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 788,
      "from_digimon_id": 101,
      "to_digimon_id": 197,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "spd": 80
      },
      "dna_requirement": null
    }
  ],
  "198": [
    {
      "id": 334,
      "from_digimon_id": 86,
      "to_digimon_id": 198,
      "level_required": 26,
      "stat_requirements": {
        "atk": 75,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 289,
      "from_digimon_id": 71,
      "to_digimon_id": 198,
      "level_required": 26,
      "stat_requirements": {
        "atk": 75,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 318,
      "from_digimon_id": 81,
      "to_digimon_id": 198,
      "level_required": 26,
      "stat_requirements": {
        "atk": 75,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 421,
      "from_digimon_id": 118,
      "to_digimon_id": 198,
      "level_required": 26,
      "stat_requirements": {
        "atk": 75,
        "spd": 80
      },
      "dna_requirement": null
    },
    {
      "id": 830,
      "from_digimon_id": 138,
      "to_digimon_id": 198,
      "level_required": 26,
      "stat_requirements": {
        "atk": 75,
        "spd": 80
      },
      "dna_requirement": null
    }
  ],
  "199": [
    {
      "id": 391,
      "from_digimon_id": 107,
      "to_digimon_id": 199,
      "level_required": 26,
      "stat_requirements": {
        "atk": 75,
        "def": 80
      },
      "dna_requirement": null
    },
    {
      "id": 407,
      "from_digimon_id": 114,
      "to_digimon_id": 199,
      "level_required": 26,
      "stat_requirements": {
        "atk": 75,
        "def": 80
      },
      "dna_requirement": null
    },
    {
      "id": 466,
      "from_digimon_id": 131,
      "to_digimon_id": 199,
      "level_required": 26,
      "stat_requirements": {
        "atk": 75,
        "def": 80
      },
      "dna_requirement": null
    }
  ],
  "200": [
    {
      "id": 325,
      "from_digimon_id": 83,
      "to_digimon_id": 200,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "sp": 70,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 366,
      "from_digimon_id": 94,
      "to_digimon_id": 200,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "sp": 70,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 770,
      "from_digimon_id": 75,
      "to_digimon_id": 200,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "sp": 70,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 793,
      "from_digimon_id": 104,
      "to_digimon_id": 200,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "sp": 70,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 906,
      "from_digimon_id": 329,
      "to_digimon_id": 200,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "sp": 70,
        "int": 70
      },
      "dna_requirement": null
    },
    {
      "id": 381,
      "from_digimon_id": 103,
      "to_digimon_id": 200,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "sp": 70,
        "int": 70
      },
      "dna_requirement": null
    }
  ],
  "201": [
    {
      "id": 350,
      "from_digimon_id": 90,
      "to_digimon_id": 201,
      "level_required": 26,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 408,
      "from_digimon_id": 114,
      "to_digimon_id": 201,
      "level_required": 26,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 771,
      "from_digimon_id": 75,
      "to_digimon_id": 201,
      "level_required": 26,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 375,
      "from_digimon_id": 100,
      "to_digimon_id": 201,
      "level_required": 26,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "spd": 75
      },
      "dna_requirement": null
    }
  ],
  "202": [
    {
      "id": 341,
      "from_digimon_id": 88,
      "to_digimon_id": 202,
      "level_required": 30,
      "stat_requirements": {
        "atk": 105,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 327,
      "from_digimon_id": 84,
      "to_digimon_id": 202,
      "level_required": 30,
      "stat_requirements": {
        "atk": 105,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 447,
      "from_digimon_id": 125,
      "to_digimon_id": 202,
      "level_required": 30,
      "stat_requirements": {
        "atk": 105,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 783,
      "from_digimon_id": 97,
      "to_digimon_id": 202,
      "level_required": 30,
      "stat_requirements": {
        "atk": 105,
        "spd": 75
      },
      "dna_requirement": null
    }
  ],
  "203": [
    {
      "id": 342,
      "from_digimon_id": 88,
      "to_digimon_id": 203,
      "level_required": 30,
      "stat_requirements": {
        "hp": 350,
        "atk": 100
      },
      "dna_requirement": null
    },
    {
      "id": 351,
      "from_digimon_id": 90,
      "to_digimon_id": 203,
      "level_required": 30,
      "stat_requirements": {
        "hp": 350,
        "atk": 100
      },
      "dna_requirement": null
    },
    {
      "id": 476,
      "from_digimon_id": 137,
      "to_digimon_id": 203,
      "level_required": 30,
      "stat_requirements": {
        "hp": 350,
        "atk": 100
      },
      "dna_requirement": null
    },
    {
      "id": 772,
      "from_digimon_id": 75,
      "to_digimon_id": 203,
      "level_required": 30,
      "stat_requirements": {
        "hp": 350,
        "atk": 100
      },
      "dna_requirement": null
    }
  ],
  "204": [
    {
      "id": 827,
      "from_digimon_id": 136,
      "to_digimon_id": 204,
      "level_required": 30,
      "stat_requirements": {
        "hp": 450,
        "atk": 110
      },
      "dna_requirement": null
    },
    {
      "id": 352,
      "from_digimon_id": 90,
      "to_digimon_id": 204,
      "level_required": 30,
      "stat_requirements": {
        "hp": 450,
        "atk": 110
      },
      "dna_requirement": null
    },
    {
      "id": 355,
      "from_digimon_id": 91,
      "to_digimon_id": 204,
      "level_required": 30,
      "stat_requirements": {
        "hp": 450,
        "atk": 110
      },
      "dna_requirement": null
    },
    {
      "id": 418,
      "from_digimon_id": 116,
      "to_digimon_id": 204,
      "level_required": 30,
      "stat_requirements": {
        "hp": 450,
        "atk": 110
      },
      "dna_requirement": null
    },
    {
      "id": 409,
      "from_digimon_id": 114,
      "to_digimon_id": 204,
      "level_required": 30,
      "stat_requirements": {
        "hp": 450,
        "atk": 110
      },
      "dna_requirement": null
    }
  ],
  "205": [
    {
      "id": 815,
      "from_digimon_id": 132,
      "to_digimon_id": 205,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 95
      },
      "dna_requirement": null
    },
    {
      "id": 343,
      "from_digimon_id": 88,
      "to_digimon_id": 205,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 95
      },
      "dna_requirement": null
    },
    {
      "id": 410,
      "from_digimon_id": 114,
      "to_digimon_id": 205,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 95
      },
      "dna_requirement": null
    },
    {
      "id": 448,
      "from_digimon_id": 125,
      "to_digimon_id": 205,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "def": 95
      },
      "dna_requirement": null
    }
  ],
  "206": [
    {
      "id": 392,
      "from_digimon_id": 107,
      "to_digimon_id": 206,
      "level_required": 26,
      "stat_requirements": {
        "def": 80,
        "int": 65
      },
      "dna_requirement": null
    },
    {
      "id": 315,
      "from_digimon_id": 79,
      "to_digimon_id": 206,
      "level_required": 26,
      "stat_requirements": {
        "def": 80,
        "int": 65
      },
      "dna_requirement": null
    },
    {
      "id": 369,
      "from_digimon_id": 95,
      "to_digimon_id": 206,
      "level_required": 26,
      "stat_requirements": {
        "def": 80,
        "int": 65
      },
      "dna_requirement": null
    },
    {
      "id": 451,
      "from_digimon_id": 127,
      "to_digimon_id": 206,
      "level_required": 26,
      "stat_requirements": {
        "def": 80,
        "int": 65
      },
      "dna_requirement": null
    }
  ],
  "207": [
    {
      "id": 938,
      "from_digimon_id": 364,
      "to_digimon_id": 207,
      "level_required": 26,
      "stat_requirements": {
        "hp": 600,
        "atk": 60
      },
      "dna_requirement": null
    },
    {
      "id": 432,
      "from_digimon_id": 121,
      "to_digimon_id": 207,
      "level_required": 26,
      "stat_requirements": {
        "hp": 600,
        "atk": 60
      },
      "dna_requirement": null
    },
    {
      "id": 806,
      "from_digimon_id": 117,
      "to_digimon_id": 207,
      "level_required": 26,
      "stat_requirements": {
        "hp": 600,
        "atk": 60
      },
      "dna_requirement": null
    },
    {
      "id": 338,
      "from_digimon_id": 87,
      "to_digimon_id": 207,
      "level_required": 26,
      "stat_requirements": {
        "hp": 600,
        "atk": 60
      },
      "dna_requirement": null
    },
    {
      "id": 471,
      "from_digimon_id": 133,
      "to_digimon_id": 207,
      "level_required": 26,
      "stat_requirements": {
        "hp": 600,
        "atk": 60
      },
      "dna_requirement": null
    }
  ],
  "208": [
    {
      "id": 280,
      "from_digimon_id": 67,
      "to_digimon_id": 208,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "spd": 90
      },
      "dna_requirement": null
    },
    {
      "id": 436,
      "from_digimon_id": 122,
      "to_digimon_id": 208,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "spd": 90
      },
      "dna_requirement": null
    },
    {
      "id": 462,
      "from_digimon_id": 130,
      "to_digimon_id": 208,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "spd": 90
      },
      "dna_requirement": null
    }
  ],
  "209": [
    {
      "id": 762,
      "from_digimon_id": 68,
      "to_digimon_id": 209,
      "level_required": 30,
      "stat_requirements": {
        "hp": 350,
        "atk": 100,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 300,
      "from_digimon_id": 76,
      "to_digimon_id": 209,
      "level_required": 30,
      "stat_requirements": {
        "hp": 350,
        "atk": 100,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 385,
      "from_digimon_id": 105,
      "to_digimon_id": 209,
      "level_required": 30,
      "stat_requirements": {
        "hp": 350,
        "atk": 100,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 425,
      "from_digimon_id": 119,
      "to_digimon_id": 209,
      "level_required": 30,
      "stat_requirements": {
        "hp": 350,
        "atk": 100,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 809,
      "from_digimon_id": 123,
      "to_digimon_id": 209,
      "level_required": 30,
      "stat_requirements": {
        "hp": 350,
        "atk": 100,
        "spd": 75
      },
      "dna_requirement": null
    }
  ],
  "210": [
    {
      "id": 322,
      "from_digimon_id": 82,
      "to_digimon_id": 210,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "int": 75
      },
      "dna_requirement": null
    },
    {
      "id": 377,
      "from_digimon_id": 102,
      "to_digimon_id": 210,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "int": 75
      },
      "dna_requirement": null
    },
    {
      "id": 459,
      "from_digimon_id": 129,
      "to_digimon_id": 210,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "int": 75
      },
      "dna_requirement": null
    },
    {
      "id": 812,
      "from_digimon_id": 126,
      "to_digimon_id": 210,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "int": 75
      },
      "dna_requirement": null
    }
  ],
  "211": [
    {
      "id": 328,
      "from_digimon_id": 84,
      "to_digimon_id": 211,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 480,
      "from_digimon_id": 139,
      "to_digimon_id": 211,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 484,
      "from_digimon_id": 140,
      "to_digimon_id": 211,
      "level_required": 28,
      "stat_requirements": {
        "atk": 75,
        "spd": 75
      },
      "dna_requirement": null
    }
  ],
  "212": [
    {
      "id": 378,
      "from_digimon_id": 102,
      "to_digimon_id": 212,
      "level_required": 30,
      "stat_requirements": {
        "int": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 422,
      "from_digimon_id": 118,
      "to_digimon_id": 212,
      "level_required": 30,
      "stat_requirements": {
        "int": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 413,
      "from_digimon_id": 115,
      "to_digimon_id": 212,
      "level_required": 30,
      "stat_requirements": {
        "int": 75,
        "spd": 75
      },
      "dna_requirement": null
    },
    {
      "id": 810,
      "from_digimon_id": 126,
      "to_digimon_id": 212,
      "level_required": 30,
      "stat_requirements": {
        "int": 75,
        "spd": 75
      },
      "dna_requirement": null
    }
  ],
  "213": [
    {
      "id": 253,
      "from_digimon_id": 60,
      "to_digimon_id": 213,
      "level_required": 55,
      "stat_requirements": {
        "abi": 80,
        "atk": 180,
        "int": 240,
        "spd": 180
      },
      "dna_requirement": null
    }
  ],
  "214": [
    {
      "id": 274,
      "from_digimon_id": 65,
      "to_digimon_id": 214,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "int": 95
      },
      "dna_requirement": null
    },
    {
      "id": 339,
      "from_digimon_id": 87,
      "to_digimon_id": 214,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "int": 95
      },
      "dna_requirement": null
    },
    {
      "id": 442,
      "from_digimon_id": 124,
      "to_digimon_id": 214,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "int": 95
      },
      "dna_requirement": null
    },
    {
      "id": 455,
      "from_digimon_id": 128,
      "to_digimon_id": 214,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "int": 95
      },
      "dna_requirement": null
    },
    {
      "id": 900,
      "from_digimon_id": 335,
      "to_digimon_id": 214,
      "level_required": 30,
      "stat_requirements": {
        "sp": 75,
        "abi": 10,
        "int": 95
      },
      "dna_requirement": null
    }
  ],
  "215": [
    {
      "id": 319,
      "from_digimon_id": 81,
      "to_digimon_id": 215,
      "level_required": 28,
      "stat_requirements": {
        "atk": 90,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 332,
      "from_digimon_id": 85,
      "to_digimon_id": 215,
      "level_required": 28,
      "stat_requirements": {
        "atk": 90,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 310,
      "from_digimon_id": 78,
      "to_digimon_id": 215,
      "level_required": 28,
      "stat_requirements": {
        "atk": 90,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 768,
      "from_digimon_id": 73,
      "to_digimon_id": 215,
      "level_required": 28,
      "stat_requirements": {
        "atk": 90,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 797,
      "from_digimon_id": 109,
      "to_digimon_id": 215,
      "level_required": 28,
      "stat_requirements": {
        "atk": 90,
        "spd": 85
      },
      "dna_requirement": null
    }
  ],
  "216": [
    {
      "id": 790,
      "from_digimon_id": 101,
      "to_digimon_id": 216,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 90,
        "spd": 70
      },
      "dna_requirement": null
    },
    {
      "id": 335,
      "from_digimon_id": 86,
      "to_digimon_id": 216,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 90,
        "spd": 70
      },
      "dna_requirement": null
    },
    {
      "id": 456,
      "from_digimon_id": 128,
      "to_digimon_id": 216,
      "level_required": 28,
      "stat_requirements": {
        "hp": 400,
        "atk": 90,
        "spd": 70
      },
      "dna_requirement": null
    }
  ],
  "217": [
    {
      "id": 360,
      "from_digimon_id": 92,
      "to_digimon_id": 217,
      "level_required": 28,
      "stat_requirements": {
        "sp": 75,
        "int": 100
      },
      "dna_requirement": null
    },
    {
      "id": 293,
      "from_digimon_id": 72,
      "to_digimon_id": 217,
      "level_required": 28,
      "stat_requirements": {
        "sp": 75,
        "int": 100
      },
      "dna_requirement": null
    },
    {
      "id": 401,
      "from_digimon_id": 111,
      "to_digimon_id": 217,
      "level_required": 28,
      "stat_requirements": {
        "sp": 75,
        "int": 100
      },
      "dna_requirement": null
    }
  ],
  "218": [
    {
      "id": 501,
      "from_digimon_id": 146,
      "to_digimon_id": 218,
      "level_required": 60,
      "stat_requirements": {
        "sp": 130,
        "abi": 40,
        "atk": 200,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 831,
      "from_digimon_id": 142,
      "to_digimon_id": 218,
      "level_required": 60,
      "stat_requirements": {
        "sp": 130,
        "abi": 40,
        "atk": 200,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 505,
      "from_digimon_id": 147,
      "to_digimon_id": 218,
      "level_required": 60,
      "stat_requirements": {
        "sp": 130,
        "abi": 40,
        "atk": 200,
        "spd": 100
      },
      "dna_requirement": null
    }
  ],
  "219": [
    {
      "id": 847,
      "from_digimon_id": 161,
      "to_digimon_id": 219,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 150,
        "def": 170,
        "int": 135
      },
      "dna_requirement": null
    },
    {
      "id": 541,
      "from_digimon_id": 163,
      "to_digimon_id": 219,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 150,
        "def": 170,
        "int": 135
      },
      "dna_requirement": null
    },
    {
      "id": 581,
      "from_digimon_id": 181,
      "to_digimon_id": 219,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 150,
        "def": 170,
        "int": 135
      },
      "dna_requirement": null
    }
  ],
  "220": [
    {
      "id": 835,
      "from_digimon_id": 148,
      "to_digimon_id": 220,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 120,
        "spd": 145
      },
      "dna_requirement": null
    },
    {
      "id": 507,
      "from_digimon_id": 150,
      "to_digimon_id": 220,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 120,
        "spd": 145
      },
      "dna_requirement": null
    },
    {
      "id": 631,
      "from_digimon_id": 201,
      "to_digimon_id": 220,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 120,
        "spd": 145
      },
      "dna_requirement": null
    }
  ],
  "221": [
    {
      "id": 860,
      "from_digimon_id": 173,
      "to_digimon_id": 221,
      "level_required": 45,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 495,
      "from_digimon_id": 145,
      "to_digimon_id": 221,
      "level_required": 45,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 608,
      "from_digimon_id": 193,
      "to_digimon_id": 221,
      "level_required": 45,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 652,
      "from_digimon_id": 206,
      "to_digimon_id": 221,
      "level_required": 45,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 120
      },
      "dna_requirement": null
    }
  ],
  "222": [
    {
      "id": 591,
      "from_digimon_id": 184,
      "to_digimon_id": 222,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1600,
        "abi": 20,
        "def": 150,
        "spd": 150
      },
      "dna_requirement": null
    },
    {
      "id": 692,
      "from_digimon_id": 223,
      "to_digimon_id": 222,
      "level_required": 0,
      "stat_requirements": {},
      "dna_requirement": null
    },
    {
      "id": 862,
      "from_digimon_id": 175,
      "to_digimon_id": 222,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1600,
        "abi": 20,
        "def": 150,
        "spd": 150
      },
      "dna_requirement": null
    }
  ],
  "223": [
    {
      "id": 691,
      "from_digimon_id": 222,
      "to_digimon_id": 223,
      "level_required": 0,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "224": [
    {
      "id": 561,
      "from_digimon_id": 170,
      "to_digimon_id": 224,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1700,
        "abi": 20,
        "atk": 130,
        "def": 130,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 544,
      "from_digimon_id": 164,
      "to_digimon_id": 224,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1700,
        "abi": 20,
        "atk": 130,
        "def": 130,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 577,
      "from_digimon_id": 179,
      "to_digimon_id": 224,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1700,
        "abi": 20,
        "atk": 130,
        "def": 130,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 844,
      "from_digimon_id": 159,
      "to_digimon_id": 224,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1700,
        "abi": 20,
        "atk": 130,
        "def": 130,
        "int": 120
      },
      "dna_requirement": null
    }
  ],
  "225": [
    {
      "id": 519,
      "from_digimon_id": 152,
      "to_digimon_id": 225,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "int": 130,
        "spd": 160
      },
      "dna_requirement": null
    },
    {
      "id": 857,
      "from_digimon_id": 171,
      "to_digimon_id": 225,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "int": 130,
        "spd": 160
      },
      "dna_requirement": null
    },
    {
      "id": 553,
      "from_digimon_id": 166,
      "to_digimon_id": 225,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "int": 130,
        "spd": 160
      },
      "dna_requirement": null
    },
    {
      "id": 618,
      "from_digimon_id": 195,
      "to_digimon_id": 225,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "int": 130,
        "spd": 160
      },
      "dna_requirement": null
    }
  ],
  "226": [
    {
      "id": 526,
      "from_digimon_id": 154,
      "to_digimon_id": 226,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 40,
        "int": 145,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 661,
      "from_digimon_id": 208,
      "to_digimon_id": 226,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 40,
        "int": 145,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 873,
      "from_digimon_id": 189,
      "to_digimon_id": 226,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 40,
        "int": 145,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "227": [
    {
      "id": 502,
      "from_digimon_id": 147,
      "to_digimon_id": 227,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1200,
        "sp": 110,
        "abi": 40,
        "atk": 110,
        "int": 110
      },
      "dna_requirement": null
    },
    {
      "id": 876,
      "from_digimon_id": 190,
      "to_digimon_id": 227,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1200,
        "sp": 110,
        "abi": 40,
        "atk": 110,
        "int": 110
      },
      "dna_requirement": null
    },
    {
      "id": 498,
      "from_digimon_id": 146,
      "to_digimon_id": 227,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1200,
        "sp": 110,
        "abi": 40,
        "atk": 110,
        "int": 110
      },
      "dna_requirement": null
    },
    {
      "id": 686,
      "from_digimon_id": 217,
      "to_digimon_id": 227,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1200,
        "sp": 110,
        "abi": 40,
        "atk": 110,
        "int": 110
      },
      "dna_requirement": null
    },
    {
      "id": 883,
      "from_digimon_id": 197,
      "to_digimon_id": 227,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1200,
        "sp": 110,
        "abi": 40,
        "atk": 110,
        "int": 110
      },
      "dna_requirement": null
    }
  ],
  "228": [
    {
      "id": 624,
      "from_digimon_id": 199,
      "to_digimon_id": 228,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1700,
        "abi": 20,
        "atk": 160,
        "def": 130
      },
      "dna_requirement": null
    },
    {
      "id": 644,
      "from_digimon_id": 204,
      "to_digimon_id": 228,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1700,
        "abi": 20,
        "atk": 160,
        "def": 130
      },
      "dna_requirement": null
    },
    {
      "id": 641,
      "from_digimon_id": 203,
      "to_digimon_id": 228,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1700,
        "abi": 20,
        "atk": 160,
        "def": 130
      },
      "dna_requirement": null
    }
  ],
  "229": [
    {
      "id": 516,
      "from_digimon_id": 152,
      "to_digimon_id": 229,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 40,
        "def": 120,
        "int": 145
      },
      "dna_requirement": null
    },
    {
      "id": 598,
      "from_digimon_id": 188,
      "to_digimon_id": 229,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 40,
        "def": 120,
        "int": 145
      },
      "dna_requirement": null
    }
  ],
  "230": [
    {
      "id": 642,
      "from_digimon_id": 203,
      "to_digimon_id": 230,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 100,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 645,
      "from_digimon_id": 204,
      "to_digimon_id": 230,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 100,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 663,
      "from_digimon_id": 209,
      "to_digimon_id": 230,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 100,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 908,
      "from_digimon_id": 330,
      "to_digimon_id": 230,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 100,
        "spd": 100
      },
      "dna_requirement": null
    }
  ],
  "231": [
    {
      "id": 837,
      "from_digimon_id": 149,
      "to_digimon_id": 231,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 150,
        "def": 120
      },
      "dna_requirement": null
    }
  ],
  "232": [
    {
      "id": 545,
      "from_digimon_id": 164,
      "to_digimon_id": 232,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 130,
        "def": 130,
        "int": 130
      },
      "dna_requirement": null
    },
    {
      "id": 636,
      "from_digimon_id": 202,
      "to_digimon_id": 232,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 130,
        "def": 130,
        "int": 130
      },
      "dna_requirement": null
    }
  ],
  "233": [
    {
      "id": 708,
      "from_digimon_id": 294,
      "to_digimon_id": 233,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 130,
        "def": 120
      },
      "dna_requirement": null
    }
  ],
  "234": [
    {
      "id": 555,
      "from_digimon_id": 167,
      "to_digimon_id": 234,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1700,
        "abi": 80,
        "atk": 145,
        "def": 120
      },
      "dna_requirement": null
    },
    {
      "id": 880,
      "from_digimon_id": 196,
      "to_digimon_id": 234,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1700,
        "abi": 80,
        "atk": 145,
        "def": 120
      },
      "dna_requirement": null
    },
    {
      "id": 574,
      "from_digimon_id": 177,
      "to_digimon_id": 234,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1700,
        "abi": 80,
        "atk": 145,
        "def": 120
      },
      "dna_requirement": null
    }
  ],
  "235": [
    {
      "id": 580,
      "from_digimon_id": 179,
      "to_digimon_id": 235,
      "level_required": 45,
      "stat_requirements": {
        "abi": 20,
        "atk": 110,
        "def": 130,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 870,
      "from_digimon_id": 186,
      "to_digimon_id": 235,
      "level_required": 45,
      "stat_requirements": {
        "abi": 20,
        "atk": 110,
        "def": 130,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 514,
      "from_digimon_id": 151,
      "to_digimon_id": 235,
      "level_required": 45,
      "stat_requirements": {
        "abi": 20,
        "atk": 110,
        "def": 130,
        "spd": 100
      },
      "dna_requirement": null
    }
  ],
  "236": [
    {
      "id": 658,
      "from_digimon_id": 208,
      "to_digimon_id": 236,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 135,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 565,
      "from_digimon_id": 172,
      "to_digimon_id": 236,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 135,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 547,
      "from_digimon_id": 165,
      "to_digimon_id": 236,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 135,
        "spd": 120
      },
      "dna_requirement": null
    }
  ],
  "237": [
    {
      "id": 868,
      "from_digimon_id": 180,
      "to_digimon_id": 237,
      "level_required": 45,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 120,
        "def": 120
      },
      "dna_requirement": null
    },
    {
      "id": 485,
      "from_digimon_id": 141,
      "to_digimon_id": 237,
      "level_required": 45,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 120,
        "def": 120
      },
      "dna_requirement": null
    },
    {
      "id": 520,
      "from_digimon_id": 153,
      "to_digimon_id": 237,
      "level_required": 45,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 120,
        "def": 120
      },
      "dna_requirement": null
    },
    {
      "id": 548,
      "from_digimon_id": 165,
      "to_digimon_id": 237,
      "level_required": 45,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 120,
        "def": 120
      },
      "dna_requirement": null
    },
    {
      "id": 863,
      "from_digimon_id": 175,
      "to_digimon_id": 237,
      "level_required": 45,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 120,
        "def": 120
      },
      "dna_requirement": null
    }
  ],
  "238": [
    {
      "id": 506,
      "from_digimon_id": 147,
      "to_digimon_id": 238,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1300,
        "abi": 40,
        "atk": 110,
        "int": 110
      },
      "dna_requirement": null
    },
    {
      "id": 882,
      "from_digimon_id": 197,
      "to_digimon_id": 238,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1300,
        "abi": 40,
        "atk": 110,
        "int": 110
      },
      "dna_requirement": null
    },
    {
      "id": 853,
      "from_digimon_id": 169,
      "to_digimon_id": 238,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1300,
        "abi": 40,
        "atk": 110,
        "int": 110
      },
      "dna_requirement": null
    }
  ],
  "239": [
    {
      "id": 528,
      "from_digimon_id": 156,
      "to_digimon_id": 239,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "def": 160,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 588,
      "from_digimon_id": 183,
      "to_digimon_id": 239,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "def": 160,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 534,
      "from_digimon_id": 158,
      "to_digimon_id": 239,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "def": 160,
        "spd": 120
      },
      "dna_requirement": null
    }
  ],
  "240": [
    {
      "id": 527,
      "from_digimon_id": 154,
      "to_digimon_id": 240,
      "level_required": 50,
      "stat_requirements": {
        "sp": 110,
        "abi": 20,
        "int": 140
      },
      "dna_requirement": null
    },
    {
      "id": 554,
      "from_digimon_id": 166,
      "to_digimon_id": 240,
      "level_required": 50,
      "stat_requirements": {
        "sp": 110,
        "abi": 20,
        "int": 140
      },
      "dna_requirement": null
    },
    {
      "id": 874,
      "from_digimon_id": 189,
      "to_digimon_id": 240,
      "level_required": 50,
      "stat_requirements": {
        "sp": 110,
        "abi": 20,
        "int": 140
      },
      "dna_requirement": null
    }
  ],
  "241": [
    {
      "id": 584,
      "from_digimon_id": 182,
      "to_digimon_id": 241,
      "level_required": 60,
      "stat_requirements": {
        "sp": 110,
        "abi": 80,
        "def": 180,
        "int": 140
      },
      "dna_requirement": null
    },
    {
      "id": 492,
      "from_digimon_id": 144,
      "to_digimon_id": 241,
      "level_required": 60,
      "stat_requirements": {
        "sp": 110,
        "abi": 80,
        "def": 180,
        "int": 140
      },
      "dna_requirement": null
    }
  ],
  "242": [
    {
      "id": 491,
      "from_digimon_id": 143,
      "to_digimon_id": 242,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1100,
        "sp": 100,
        "abi": 40,
        "int": 100
      },
      "dna_requirement": null
    },
    {
      "id": 647,
      "from_digimon_id": 204,
      "to_digimon_id": 242,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1100,
        "sp": 100,
        "abi": 40,
        "int": 100
      },
      "dna_requirement": null
    }
  ],
  "243": [
    {
      "id": 546,
      "from_digimon_id": 164,
      "to_digimon_id": 243,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 40,
        "int": 145,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 850,
      "from_digimon_id": 162,
      "to_digimon_id": 243,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 40,
        "int": 145,
        "spd": 100
      },
      "dna_requirement": null
    },
    {
      "id": 488,
      "from_digimon_id": 143,
      "to_digimon_id": 243,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 40,
        "int": 145,
        "spd": 100
      },
      "dna_requirement": null
    }
  ],
  "244": [
    {
      "id": 510,
      "from_digimon_id": 150,
      "to_digimon_id": 244,
      "level_required": 55,
      "stat_requirements": {
        "abi": 40,
        "atk": 130,
        "def": 120,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 909,
      "from_digimon_id": 330,
      "to_digimon_id": 244,
      "level_required": 55,
      "stat_requirements": {
        "abi": 40,
        "atk": 130,
        "def": 120,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 619,
      "from_digimon_id": 195,
      "to_digimon_id": 244,
      "level_required": 55,
      "stat_requirements": {
        "abi": 40,
        "atk": 130,
        "def": 120,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 634,
      "from_digimon_id": 201,
      "to_digimon_id": 244,
      "level_required": 55,
      "stat_requirements": {
        "abi": 40,
        "atk": 130,
        "def": 120,
        "int": 120
      },
      "dna_requirement": null
    }
  ],
  "245": [
    {
      "id": 942,
      "from_digimon_id": 365,
      "to_digimon_id": 245,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 145,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 537,
      "from_digimon_id": 160,
      "to_digimon_id": 245,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 145,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 592,
      "from_digimon_id": 185,
      "to_digimon_id": 245,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 145,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 655,
      "from_digimon_id": 207,
      "to_digimon_id": 245,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 145,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 869,
      "from_digimon_id": 180,
      "to_digimon_id": 245,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 145,
        "spd": 120
      },
      "dna_requirement": null
    }
  ],
  "246": [
    {
      "id": 550,
      "from_digimon_id": 166,
      "to_digimon_id": 246,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 120,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 656,
      "from_digimon_id": 207,
      "to_digimon_id": 246,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 120,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 566,
      "from_digimon_id": 172,
      "to_digimon_id": 246,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 120,
        "spd": 120
      },
      "dna_requirement": null
    }
  ],
  "247": [
    {
      "id": 858,
      "from_digimon_id": 171,
      "to_digimon_id": 247,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 180,
        "spd": 180
      },
      "dna_requirement": null
    },
    {
      "id": 866,
      "from_digimon_id": 178,
      "to_digimon_id": 247,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 180,
        "spd": 180
      },
      "dna_requirement": null
    }
  ],
  "248": [
    {
      "id": 558,
      "from_digimon_id": 168,
      "to_digimon_id": 248,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 140,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 664,
      "from_digimon_id": 209,
      "to_digimon_id": 248,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 140,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 615,
      "from_digimon_id": 195,
      "to_digimon_id": 248,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 140,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "249": [
    {
      "id": 694,
      "from_digimon_id": 248,
      "to_digimon_id": 249,
      "level_required": 60,
      "stat_requirements": {
        "hp": 2000,
        "abi": 30,
        "atk": 250
      },
      "dna_requirement": null
    }
  ],
  "250": [
    {
      "id": 839,
      "from_digimon_id": 157,
      "to_digimon_id": 250,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1000,
        "abi": 20,
        "atk": 130,
        "def": 110
      },
      "dna_requirement": null
    },
    {
      "id": 523,
      "from_digimon_id": 154,
      "to_digimon_id": 250,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1000,
        "abi": 20,
        "atk": 130,
        "def": 110
      },
      "dna_requirement": null
    },
    {
      "id": 871,
      "from_digimon_id": 186,
      "to_digimon_id": 250,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1000,
        "abi": 20,
        "atk": 130,
        "def": 110
      },
      "dna_requirement": null
    },
    {
      "id": 542,
      "from_digimon_id": 163,
      "to_digimon_id": 250,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1000,
        "abi": 20,
        "atk": 130,
        "def": 110
      },
      "dna_requirement": null
    },
    {
      "id": 556,
      "from_digimon_id": 167,
      "to_digimon_id": 250,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1000,
        "abi": 20,
        "atk": 130,
        "def": 110
      },
      "dna_requirement": null
    }
  ],
  "251": [
    {
      "id": 568,
      "from_digimon_id": 174,
      "to_digimon_id": 251,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "def": 140,
        "int": 120,
        "spd": 150
      },
      "dna_requirement": null
    },
    {
      "id": 582,
      "from_digimon_id": 181,
      "to_digimon_id": 251,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "def": 140,
        "int": 120,
        "spd": 150
      },
      "dna_requirement": null
    },
    {
      "id": 851,
      "from_digimon_id": 162,
      "to_digimon_id": 251,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "def": 140,
        "int": 120,
        "spd": 150
      },
      "dna_requirement": null
    }
  ],
  "252": [
    {
      "id": 856,
      "from_digimon_id": 171,
      "to_digimon_id": 252,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 130,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 665,
      "from_digimon_id": 209,
      "to_digimon_id": 252,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 130,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 834,
      "from_digimon_id": 148,
      "to_digimon_id": 252,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 130,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "253": [
    {
      "id": 616,
      "from_digimon_id": 195,
      "to_digimon_id": 253,
      "level_required": 55,
      "stat_requirements": {
        "sp": 130,
        "abi": 40,
        "def": 130,
        "int": 150
      },
      "dna_requirement": null
    },
    {
      "id": 569,
      "from_digimon_id": 174,
      "to_digimon_id": 253,
      "level_required": 55,
      "stat_requirements": {
        "sp": 130,
        "abi": 40,
        "def": 130,
        "int": 150
      },
      "dna_requirement": null
    },
    {
      "id": 875,
      "from_digimon_id": 189,
      "to_digimon_id": 253,
      "level_required": 55,
      "stat_requirements": {
        "sp": 130,
        "abi": 40,
        "def": 130,
        "int": 150
      },
      "dna_requirement": null
    }
  ],
  "254": [
    {
      "id": 535,
      "from_digimon_id": 158,
      "to_digimon_id": 254,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "def": 130,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 620,
      "from_digimon_id": 198,
      "to_digimon_id": 254,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "def": 130,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 669,
      "from_digimon_id": 211,
      "to_digimon_id": 254,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "def": 130,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "255": [
    {
      "id": 531,
      "from_digimon_id": 156,
      "to_digimon_id": 255,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 150,
        "def": 140
      },
      "dna_requirement": null
    },
    {
      "id": 607,
      "from_digimon_id": 192,
      "to_digimon_id": 255,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 150,
        "def": 140
      },
      "dna_requirement": null
    },
    {
      "id": 639,
      "from_digimon_id": 202,
      "to_digimon_id": 255,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 150,
        "def": 140
      },
      "dna_requirement": null
    }
  ],
  "256": [
    {
      "id": 536,
      "from_digimon_id": 158,
      "to_digimon_id": 256,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1000,
        "abi": 20,
        "atk": 120,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 670,
      "from_digimon_id": 211,
      "to_digimon_id": 256,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1000,
        "abi": 20,
        "atk": 120,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 848,
      "from_digimon_id": 161,
      "to_digimon_id": 256,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1000,
        "abi": 20,
        "atk": 120,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 865,
      "from_digimon_id": 178,
      "to_digimon_id": 256,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1000,
        "abi": 20,
        "atk": 120,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 493,
      "from_digimon_id": 144,
      "to_digimon_id": 256,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1000,
        "abi": 20,
        "atk": 120,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "257": [
    {
      "id": 543,
      "from_digimon_id": 163,
      "to_digimon_id": 257,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1400,
        "abi": 20,
        "atk": 150,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 559,
      "from_digimon_id": 168,
      "to_digimon_id": 257,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1400,
        "abi": 20,
        "atk": 150,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 571,
      "from_digimon_id": 176,
      "to_digimon_id": 257,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1400,
        "abi": 20,
        "atk": 150,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 877,
      "from_digimon_id": 190,
      "to_digimon_id": 257,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1400,
        "abi": 20,
        "atk": 150,
        "int": 120
      },
      "dna_requirement": null
    }
  ],
  "258": [
    {
      "id": 704,
      "from_digimon_id": 280,
      "to_digimon_id": 258,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1600,
        "abi": 40,
        "atk": 140,
        "def": 130
      },
      "dna_requirement": null
    }
  ],
  "259": [
    {
      "id": 852,
      "from_digimon_id": 162,
      "to_digimon_id": 259,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "def": 120,
        "int": 130,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 489,
      "from_digimon_id": 143,
      "to_digimon_id": 259,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "def": 120,
        "int": 130,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 496,
      "from_digimon_id": 145,
      "to_digimon_id": 259,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "def": 120,
        "int": 130,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 567,
      "from_digimon_id": 172,
      "to_digimon_id": 259,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "def": 120,
        "int": 130,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "260": [
    {
      "id": 499,
      "from_digimon_id": 146,
      "to_digimon_id": 260,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1100,
        "abi": 20,
        "atk": 180,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 490,
      "from_digimon_id": 143,
      "to_digimon_id": 260,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1100,
        "abi": 20,
        "atk": 180,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 521,
      "from_digimon_id": 153,
      "to_digimon_id": 260,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1100,
        "abi": 20,
        "atk": 180,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 854,
      "from_digimon_id": 169,
      "to_digimon_id": 260,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1100,
        "abi": 20,
        "atk": 180,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 832,
      "from_digimon_id": 142,
      "to_digimon_id": 260,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1100,
        "abi": 20,
        "atk": 180,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "261": [
    {
      "id": 855,
      "from_digimon_id": 169,
      "to_digimon_id": 261,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1600,
        "abi": 80,
        "atk": 230,
        "int": 160
      },
      "dna_requirement": null
    },
    {
      "id": 833,
      "from_digimon_id": 142,
      "to_digimon_id": 261,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1600,
        "abi": 80,
        "atk": 230,
        "int": 160
      },
      "dna_requirement": null
    },
    {
      "id": 560,
      "from_digimon_id": 168,
      "to_digimon_id": 261,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1600,
        "abi": 80,
        "atk": 230,
        "int": 160
      },
      "dna_requirement": null
    },
    {
      "id": 604,
      "from_digimon_id": 192,
      "to_digimon_id": 261,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1600,
        "abi": 80,
        "atk": 230,
        "int": 160
      },
      "dna_requirement": null
    }
  ],
  "262": [
    {
      "id": 637,
      "from_digimon_id": 202,
      "to_digimon_id": 262,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 140,
        "def": 140,
        "int": 140
      },
      "dna_requirement": null
    },
    {
      "id": 649,
      "from_digimon_id": 205,
      "to_digimon_id": 262,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 140,
        "def": 140,
        "int": 140
      },
      "dna_requirement": null
    }
  ],
  "263": [
    {
      "id": 551,
      "from_digimon_id": 166,
      "to_digimon_id": 263,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1200,
        "abi": 80,
        "atk": 140,
        "def": 120,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 836,
      "from_digimon_id": 148,
      "to_digimon_id": 263,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1200,
        "abi": 80,
        "atk": 140,
        "def": 120,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 508,
      "from_digimon_id": 150,
      "to_digimon_id": 263,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1200,
        "abi": 80,
        "atk": 140,
        "def": 120,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "264": [
    {
      "id": 864,
      "from_digimon_id": 178,
      "to_digimon_id": 264,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 140,
        "def": 120
      },
      "dna_requirement": null
    },
    {
      "id": 845,
      "from_digimon_id": 161,
      "to_digimon_id": 264,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 140,
        "def": 120
      },
      "dna_requirement": null
    },
    {
      "id": 587,
      "from_digimon_id": 182,
      "to_digimon_id": 264,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 140,
        "def": 120
      },
      "dna_requirement": null
    }
  ],
  "265": [
    {
      "id": 538,
      "from_digimon_id": 160,
      "to_digimon_id": 265,
      "level_required": 60,
      "stat_requirements": {
        "sp": 100,
        "abi": 80,
        "int": 120,
        "spd": 140
      },
      "dna_requirement": null
    },
    {
      "id": 585,
      "from_digimon_id": 182,
      "to_digimon_id": 265,
      "level_required": 60,
      "stat_requirements": {
        "sp": 100,
        "abi": 80,
        "int": 120,
        "spd": 140
      },
      "dna_requirement": null
    },
    {
      "id": 698,
      "from_digimon_id": 266,
      "to_digimon_id": 265,
      "level_required": 0,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "266": [
    {
      "id": 697,
      "from_digimon_id": 265,
      "to_digimon_id": 266,
      "level_required": 0,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "267": [
    {
      "id": 583,
      "from_digimon_id": 181,
      "to_digimon_id": 267,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1600,
        "abi": 20,
        "atk": 160
      },
      "dna_requirement": null
    },
    {
      "id": 846,
      "from_digimon_id": 161,
      "to_digimon_id": 267,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1600,
        "abi": 20,
        "atk": 160
      },
      "dna_requirement": null
    },
    {
      "id": 532,
      "from_digimon_id": 156,
      "to_digimon_id": 267,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1600,
        "abi": 20,
        "atk": 160
      },
      "dna_requirement": null
    }
  ],
  "268": [
    {
      "id": 630,
      "from_digimon_id": 200,
      "to_digimon_id": 268,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1000,
        "sp": 100,
        "abi": 20,
        "int": 130
      },
      "dna_requirement": null
    },
    {
      "id": 614,
      "from_digimon_id": 194,
      "to_digimon_id": 268,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1000,
        "sp": 100,
        "abi": 20,
        "int": 130
      },
      "dna_requirement": null
    },
    {
      "id": 859,
      "from_digimon_id": 173,
      "to_digimon_id": 268,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1000,
        "sp": 100,
        "abi": 20,
        "int": 130
      },
      "dna_requirement": null
    }
  ],
  "269": [
    {
      "id": 609,
      "from_digimon_id": 193,
      "to_digimon_id": 269,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 100,
        "def": 130,
        "int": 100
      },
      "dna_requirement": null
    },
    {
      "id": 494,
      "from_digimon_id": 144,
      "to_digimon_id": 269,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 100,
        "def": 130,
        "int": 100
      },
      "dna_requirement": null
    },
    {
      "id": 653,
      "from_digimon_id": 206,
      "to_digimon_id": 269,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 100,
        "def": 130,
        "int": 100
      },
      "dna_requirement": null
    }
  ],
  "270": [
    {
      "id": 540,
      "from_digimon_id": 160,
      "to_digimon_id": 270,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 135
      },
      "dna_requirement": null
    },
    {
      "id": 879,
      "from_digimon_id": 196,
      "to_digimon_id": 270,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 135
      },
      "dna_requirement": null
    },
    {
      "id": 515,
      "from_digimon_id": 151,
      "to_digimon_id": 270,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 135
      },
      "dna_requirement": null
    }
  ],
  "271": [
    {
      "id": 503,
      "from_digimon_id": 147,
      "to_digimon_id": 271,
      "level_required": 60,
      "stat_requirements": {
        "sp": 160,
        "abi": 80,
        "def": 120,
        "int": 200
      },
      "dna_requirement": null
    },
    {
      "id": 605,
      "from_digimon_id": 192,
      "to_digimon_id": 271,
      "level_required": 60,
      "stat_requirements": {
        "sp": 160,
        "abi": 80,
        "def": 120,
        "int": 200
      },
      "dna_requirement": null
    },
    {
      "id": 878,
      "from_digimon_id": 190,
      "to_digimon_id": 271,
      "level_required": 60,
      "stat_requirements": {
        "sp": 160,
        "abi": 80,
        "def": 120,
        "int": 200
      },
      "dna_requirement": null
    }
  ],
  "272": [
    {
      "id": 539,
      "from_digimon_id": 160,
      "to_digimon_id": 272,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 130
      },
      "dna_requirement": null
    },
    {
      "id": 593,
      "from_digimon_id": 185,
      "to_digimon_id": 272,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 130
      },
      "dna_requirement": null
    },
    {
      "id": 621,
      "from_digimon_id": 198,
      "to_digimon_id": 272,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 130
      },
      "dna_requirement": null
    },
    {
      "id": 682,
      "from_digimon_id": 216,
      "to_digimon_id": 272,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 130
      },
      "dna_requirement": null
    },
    {
      "id": 872,
      "from_digimon_id": 186,
      "to_digimon_id": 272,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "def": 130
      },
      "dna_requirement": null
    }
  ],
  "273": [
    {
      "id": 687,
      "from_digimon_id": 217,
      "to_digimon_id": 273,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "int": 160,
        "spd": 110
      },
      "dna_requirement": null
    },
    {
      "id": 884,
      "from_digimon_id": 197,
      "to_digimon_id": 273,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "int": 160,
        "spd": 110
      },
      "dna_requirement": null
    },
    {
      "id": 511,
      "from_digimon_id": 151,
      "to_digimon_id": 273,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "int": 160,
        "spd": 110
      },
      "dna_requirement": null
    },
    {
      "id": 504,
      "from_digimon_id": 147,
      "to_digimon_id": 273,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "int": 160,
        "spd": 110
      },
      "dna_requirement": null
    }
  ],
  "274": [
    {
      "id": 625,
      "from_digimon_id": 199,
      "to_digimon_id": 274,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "def": 130,
        "int": 130
      },
      "dna_requirement": null
    },
    {
      "id": 549,
      "from_digimon_id": 165,
      "to_digimon_id": 274,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "def": 130,
        "int": 130
      },
      "dna_requirement": null
    },
    {
      "id": 595,
      "from_digimon_id": 187,
      "to_digimon_id": 274,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "def": 130,
        "int": 130
      },
      "dna_requirement": null
    },
    {
      "id": 840,
      "from_digimon_id": 157,
      "to_digimon_id": 274,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "def": 130,
        "int": 130
      },
      "dna_requirement": null
    }
  ],
  "275": [
    {
      "id": 372,
      "from_digimon_id": 98,
      "to_digimon_id": 275,
      "level_required": 65,
      "stat_requirements": {
        "abi": 10
      },
      "dna_requirement": null
    },
    {
      "id": 512,
      "from_digimon_id": 151,
      "to_digimon_id": 275,
      "level_required": 65,
      "stat_requirements": {
        "abi": 10
      },
      "dna_requirement": null
    },
    {
      "id": 557,
      "from_digimon_id": 167,
      "to_digimon_id": 275,
      "level_required": 65,
      "stat_requirements": {
        "abi": 10
      },
      "dna_requirement": null
    },
    {
      "id": 601,
      "from_digimon_id": 191,
      "to_digimon_id": 275,
      "level_required": 65,
      "stat_requirements": {
        "abi": 10
      },
      "dna_requirement": null
    }
  ],
  "276": [
    {
      "id": 646,
      "from_digimon_id": 204,
      "to_digimon_id": 276,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1800,
        "abi": 20,
        "atk": 140,
        "def": 140
      },
      "dna_requirement": null
    },
    {
      "id": 632,
      "from_digimon_id": 201,
      "to_digimon_id": 276,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1800,
        "abi": 20,
        "atk": 140,
        "def": 140
      },
      "dna_requirement": null
    },
    {
      "id": 648,
      "from_digimon_id": 205,
      "to_digimon_id": 276,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1800,
        "abi": 20,
        "atk": 140,
        "def": 140
      },
      "dna_requirement": null
    }
  ],
  "277": [
    {
      "id": 654,
      "from_digimon_id": 206,
      "to_digimon_id": 277,
      "level_required": 45,
      "stat_requirements": {
        "abi": 20,
        "def": 150
      },
      "dna_requirement": null
    },
    {
      "id": 602,
      "from_digimon_id": 191,
      "to_digimon_id": 277,
      "level_required": 45,
      "stat_requirements": {
        "abi": 20,
        "def": 150
      },
      "dna_requirement": null
    },
    {
      "id": 626,
      "from_digimon_id": 199,
      "to_digimon_id": 277,
      "level_required": 45,
      "stat_requirements": {
        "abi": 20,
        "def": 150
      },
      "dna_requirement": null
    },
    {
      "id": 841,
      "from_digimon_id": 157,
      "to_digimon_id": 277,
      "level_required": 45,
      "stat_requirements": {
        "abi": 20,
        "def": 150
      },
      "dna_requirement": null
    }
  ],
  "278": [
    {
      "id": 651,
      "from_digimon_id": 205,
      "to_digimon_id": 278,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 160,
        "def": 140
      },
      "dna_requirement": null
    },
    {
      "id": 842,
      "from_digimon_id": 159,
      "to_digimon_id": 278,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 160,
        "def": 140
      },
      "dna_requirement": null
    },
    {
      "id": 867,
      "from_digimon_id": 180,
      "to_digimon_id": 278,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1500,
        "abi": 20,
        "atk": 160,
        "def": 140
      },
      "dna_requirement": null
    }
  ],
  "279": [
    {
      "id": 564,
      "from_digimon_id": 170,
      "to_digimon_id": 279,
      "level_required": 50,
      "stat_requirements": {
        "sp": 100,
        "abi": 20,
        "def": 120,
        "int": 145
      },
      "dna_requirement": null
    },
    {
      "id": 578,
      "from_digimon_id": 179,
      "to_digimon_id": 279,
      "level_required": 50,
      "stat_requirements": {
        "sp": 100,
        "abi": 20,
        "def": 120,
        "int": 145
      },
      "dna_requirement": null
    },
    {
      "id": 611,
      "from_digimon_id": 194,
      "to_digimon_id": 279,
      "level_required": 50,
      "stat_requirements": {
        "sp": 100,
        "abi": 20,
        "def": 120,
        "int": 145
      },
      "dna_requirement": null
    },
    {
      "id": 627,
      "from_digimon_id": 200,
      "to_digimon_id": 279,
      "level_required": 50,
      "stat_requirements": {
        "sp": 100,
        "abi": 20,
        "def": 120,
        "int": 145
      },
      "dna_requirement": null
    }
  ],
  "280": [
    {
      "id": 522,
      "from_digimon_id": 153,
      "to_digimon_id": 280,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1100,
        "abi": 20,
        "def": 150,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 486,
      "from_digimon_id": 141,
      "to_digimon_id": 280,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1100,
        "abi": 20,
        "def": 150,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 610,
      "from_digimon_id": 193,
      "to_digimon_id": 280,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1100,
        "abi": 20,
        "def": 150,
        "int": 120
      },
      "dna_requirement": null
    }
  ],
  "281": [
    {
      "id": 500,
      "from_digimon_id": 146,
      "to_digimon_id": 281,
      "level_required": 60,
      "stat_requirements": {
        "hp": 2000,
        "abi": 80,
        "atk": 250,
        "spd": 150
      },
      "dna_requirement": null
    },
    {
      "id": 575,
      "from_digimon_id": 177,
      "to_digimon_id": 281,
      "level_required": 60,
      "stat_requirements": {
        "hp": 2000,
        "abi": 80,
        "atk": 250,
        "spd": 150
      },
      "dna_requirement": null
    }
  ],
  "282": [
    {
      "id": 705,
      "from_digimon_id": 281,
      "to_digimon_id": 282,
      "level_required": 80,
      "stat_requirements": {
        "hp": 2100,
        "abi": 100,
        "atk": 300,
        "spd": 220
      },
      "dna_requirement": null
    }
  ],
  "283": [
    {
      "id": 715,
      "from_digimon_id": 321,
      "to_digimon_id": 283,
      "level_required": 0,
      "stat_requirements": {},
      "dna_requirement": null
    },
    {
      "id": 572,
      "from_digimon_id": 176,
      "to_digimon_id": 283,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1700,
        "sp": 140,
        "abi": 80,
        "int": 180
      },
      "dna_requirement": null
    },
    {
      "id": 688,
      "from_digimon_id": 217,
      "to_digimon_id": 283,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1700,
        "sp": 140,
        "abi": 80,
        "int": 180
      },
      "dna_requirement": null
    }
  ],
  "284": [
    {
      "id": 524,
      "from_digimon_id": 154,
      "to_digimon_id": 284,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "int": 130,
        "spd": 150
      },
      "dna_requirement": null
    },
    {
      "id": 599,
      "from_digimon_id": 188,
      "to_digimon_id": 284,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "int": 130,
        "spd": 150
      },
      "dna_requirement": null
    },
    {
      "id": 552,
      "from_digimon_id": 166,
      "to_digimon_id": 284,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "int": 130,
        "spd": 150
      },
      "dna_requirement": null
    }
  ],
  "285": [
    {
      "id": 487,
      "from_digimon_id": 141,
      "to_digimon_id": 285,
      "level_required": 55,
      "stat_requirements": {
        "hp": 900,
        "sp": 120,
        "abi": 20,
        "int": 145
      },
      "dna_requirement": null
    },
    {
      "id": 517,
      "from_digimon_id": 152,
      "to_digimon_id": 285,
      "level_required": 55,
      "stat_requirements": {
        "hp": 900,
        "sp": 120,
        "abi": 20,
        "int": 145
      },
      "dna_requirement": null
    },
    {
      "id": 672,
      "from_digimon_id": 212,
      "to_digimon_id": 285,
      "level_required": 55,
      "stat_requirements": {
        "hp": 900,
        "sp": 120,
        "abi": 20,
        "int": 145
      },
      "dna_requirement": null
    }
  ],
  "286": [
    {
      "id": 576,
      "from_digimon_id": 177,
      "to_digimon_id": 286,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 145,
        "def": 100
      },
      "dna_requirement": null
    },
    {
      "id": 596,
      "from_digimon_id": 187,
      "to_digimon_id": 286,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 145,
        "def": 100
      },
      "dna_requirement": null
    },
    {
      "id": 606,
      "from_digimon_id": 192,
      "to_digimon_id": 286,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 145,
        "def": 100
      },
      "dna_requirement": null
    }
  ],
  "287": [
    {
      "id": 838,
      "from_digimon_id": 155,
      "to_digimon_id": 287,
      "level_required": 50,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "spd": 160
      },
      "dna_requirement": null
    },
    {
      "id": 892,
      "from_digimon_id": 288,
      "to_digimon_id": 287,
      "level_required": 0,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "288": [
    {
      "id": 890,
      "from_digimon_id": 287,
      "to_digimon_id": 288,
      "level_required": 0,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "289": [
    {
      "id": 518,
      "from_digimon_id": 152,
      "to_digimon_id": 289,
      "level_required": 60,
      "stat_requirements": {
        "sp": 120,
        "abi": 80,
        "atk": 120,
        "int": 120
      },
      "dna_requirement": 214
    },
    {
      "id": 676,
      "from_digimon_id": 214,
      "to_digimon_id": 289,
      "level_required": 60,
      "stat_requirements": {
        "sp": 120,
        "abi": 80,
        "atk": 120,
        "int": 120
      },
      "dna_requirement": 152
    }
  ],
  "290": [
    {
      "id": 600,
      "from_digimon_id": 188,
      "to_digimon_id": 290,
      "level_required": 50,
      "stat_requirements": {
        "sp": 110,
        "abi": 20,
        "int": 135
      },
      "dna_requirement": null
    },
    {
      "id": 612,
      "from_digimon_id": 194,
      "to_digimon_id": 290,
      "level_required": 50,
      "stat_requirements": {
        "sp": 110,
        "abi": 20,
        "int": 135
      },
      "dna_requirement": null
    },
    {
      "id": 562,
      "from_digimon_id": 170,
      "to_digimon_id": 290,
      "level_required": 50,
      "stat_requirements": {
        "sp": 110,
        "abi": 20,
        "int": 135
      },
      "dna_requirement": null
    }
  ],
  "291": [
    {
      "id": 683,
      "from_digimon_id": 216,
      "to_digimon_id": 291,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 150,
        "spd": 140
      },
      "dna_requirement": null
    },
    {
      "id": 573,
      "from_digimon_id": 176,
      "to_digimon_id": 291,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 150,
        "spd": 140
      },
      "dna_requirement": null
    },
    {
      "id": 657,
      "from_digimon_id": 207,
      "to_digimon_id": 291,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 150,
        "spd": 140
      },
      "dna_requirement": null
    },
    {
      "id": 910,
      "from_digimon_id": 330,
      "to_digimon_id": 291,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 150,
        "spd": 140
      },
      "dna_requirement": null
    },
    {
      "id": 659,
      "from_digimon_id": 208,
      "to_digimon_id": 291,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 150,
        "spd": 140
      },
      "dna_requirement": null
    }
  ],
  "292": [
    {
      "id": 679,
      "from_digimon_id": 215,
      "to_digimon_id": 292,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 943,
      "from_digimon_id": 365,
      "to_digimon_id": 292,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 594,
      "from_digimon_id": 185,
      "to_digimon_id": 292,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 622,
      "from_digimon_id": 198,
      "to_digimon_id": 292,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 120,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "293": [
    {
      "id": 707,
      "from_digimon_id": 292,
      "to_digimon_id": 293,
      "level_required": 60,
      "stat_requirements": {
        "abi": 30,
        "atk": 200,
        "spd": 200
      },
      "dna_requirement": null
    }
  ],
  "294": [
    {
      "id": 589,
      "from_digimon_id": 183,
      "to_digimon_id": 294,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 130,
        "def": 130
      },
      "dna_requirement": null
    },
    {
      "id": 529,
      "from_digimon_id": 156,
      "to_digimon_id": 294,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 130,
        "def": 130
      },
      "dna_requirement": null
    },
    {
      "id": 633,
      "from_digimon_id": 201,
      "to_digimon_id": 294,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 130,
        "def": 130
      },
      "dna_requirement": null
    }
  ],
  "295": [
    {
      "id": 533,
      "from_digimon_id": 156,
      "to_digimon_id": 295,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1700,
        "abi": 40,
        "atk": 180
      },
      "dna_requirement": null
    },
    {
      "id": 640,
      "from_digimon_id": 202,
      "to_digimon_id": 295,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1700,
        "abi": 40,
        "atk": 180
      },
      "dna_requirement": null
    },
    {
      "id": 635,
      "from_digimon_id": 201,
      "to_digimon_id": 295,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1700,
        "abi": 40,
        "atk": 180
      },
      "dna_requirement": null
    },
    {
      "id": 843,
      "from_digimon_id": 159,
      "to_digimon_id": 295,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1700,
        "abi": 40,
        "atk": 180
      },
      "dna_requirement": null
    }
  ],
  "296": [
    {
      "id": 497,
      "from_digimon_id": 145,
      "to_digimon_id": 296,
      "level_required": 45,
      "stat_requirements": {
        "sp": 100,
        "abi": 20,
        "atk": 120,
        "def": 140
      },
      "dna_requirement": null
    },
    {
      "id": 603,
      "from_digimon_id": 191,
      "to_digimon_id": 296,
      "level_required": 45,
      "stat_requirements": {
        "sp": 100,
        "abi": 20,
        "atk": 120,
        "def": 140
      },
      "dna_requirement": null
    },
    {
      "id": 881,
      "from_digimon_id": 196,
      "to_digimon_id": 296,
      "level_required": 45,
      "stat_requirements": {
        "sp": 100,
        "abi": 20,
        "atk": 120,
        "def": 140
      },
      "dna_requirement": null
    },
    {
      "id": 513,
      "from_digimon_id": 151,
      "to_digimon_id": 296,
      "level_required": 45,
      "stat_requirements": {
        "sp": 100,
        "abi": 20,
        "atk": 120,
        "def": 140
      },
      "dna_requirement": null
    }
  ],
  "297": [
    {
      "id": 563,
      "from_digimon_id": 170,
      "to_digimon_id": 297,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "def": 120,
        "spd": 150
      },
      "dna_requirement": null
    },
    {
      "id": 680,
      "from_digimon_id": 215,
      "to_digimon_id": 297,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "def": 120,
        "spd": 150
      },
      "dna_requirement": null
    },
    {
      "id": 570,
      "from_digimon_id": 174,
      "to_digimon_id": 297,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "def": 120,
        "spd": 150
      },
      "dna_requirement": null
    }
  ],
  "298": [
    {
      "id": 671,
      "from_digimon_id": 211,
      "to_digimon_id": 298,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "def": 135,
        "spd": 125
      },
      "dna_requirement": null
    },
    {
      "id": 681,
      "from_digimon_id": 215,
      "to_digimon_id": 298,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "def": 135,
        "spd": 125
      },
      "dna_requirement": null
    },
    {
      "id": 684,
      "from_digimon_id": 216,
      "to_digimon_id": 298,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "def": 135,
        "spd": 125
      },
      "dna_requirement": null
    },
    {
      "id": 590,
      "from_digimon_id": 183,
      "to_digimon_id": 298,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "def": 135,
        "spd": 125
      },
      "dna_requirement": null
    }
  ],
  "299": [
    {
      "id": 613,
      "from_digimon_id": 194,
      "to_digimon_id": 299,
      "level_required": 50,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "def": 120,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 628,
      "from_digimon_id": 200,
      "to_digimon_id": 299,
      "level_required": 50,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "def": 120,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 530,
      "from_digimon_id": 156,
      "to_digimon_id": 299,
      "level_required": 50,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "def": 120,
        "int": 120
      },
      "dna_requirement": null
    }
  ],
  "300": [
    {
      "id": 623,
      "from_digimon_id": 198,
      "to_digimon_id": 300,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "int": 110,
        "spd": 160
      },
      "dna_requirement": null
    },
    {
      "id": 685,
      "from_digimon_id": 216,
      "to_digimon_id": 300,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "int": 110,
        "spd": 160
      },
      "dna_requirement": null
    }
  ],
  "301": [
    {
      "id": 638,
      "from_digimon_id": 202,
      "to_digimon_id": 301,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 180,
        "def": 150
      },
      "dna_requirement": null
    },
    {
      "id": 650,
      "from_digimon_id": 205,
      "to_digimon_id": 301,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 180,
        "def": 150
      },
      "dna_requirement": null
    },
    {
      "id": 643,
      "from_digimon_id": 203,
      "to_digimon_id": 301,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 180,
        "def": 150
      },
      "dna_requirement": null
    }
  ],
  "302": [
    {
      "id": 579,
      "from_digimon_id": 179,
      "to_digimon_id": 302,
      "level_required": 60,
      "stat_requirements": {
        "hp": 2000,
        "sp": 140,
        "abi": 80,
        "atk": 140,
        "def": 140,
        "int": 140
      },
      "dna_requirement": null
    },
    {
      "id": 629,
      "from_digimon_id": 200,
      "to_digimon_id": 302,
      "level_required": 60,
      "stat_requirements": {
        "hp": 2000,
        "sp": 140,
        "abi": 80,
        "atk": 140,
        "def": 140,
        "int": 140
      },
      "dna_requirement": null
    },
    {
      "id": 861,
      "from_digimon_id": 173,
      "to_digimon_id": 302,
      "level_required": 60,
      "stat_requirements": {
        "hp": 2000,
        "sp": 140,
        "abi": 80,
        "atk": 140,
        "def": 140,
        "int": 140
      },
      "dna_requirement": null
    }
  ],
  "303": [
    {
      "id": 666,
      "from_digimon_id": 210,
      "to_digimon_id": 303,
      "level_required": 60,
      "stat_requirements": {
        "sp": 200,
        "abi": 80,
        "int": 250,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 677,
      "from_digimon_id": 214,
      "to_digimon_id": 303,
      "level_required": 60,
      "stat_requirements": {
        "sp": 200,
        "abi": 80,
        "int": 250,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "304": [
    {
      "id": 509,
      "from_digimon_id": 150,
      "to_digimon_id": 304,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "spd": 160
      },
      "dna_requirement": null
    },
    {
      "id": 525,
      "from_digimon_id": 154,
      "to_digimon_id": 304,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "spd": 160
      },
      "dna_requirement": null
    },
    {
      "id": 660,
      "from_digimon_id": 208,
      "to_digimon_id": 304,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "spd": 160
      },
      "dna_requirement": null
    }
  ],
  "305": [
    {
      "id": 713,
      "from_digimon_id": 304,
      "to_digimon_id": 305,
      "level_required": 60,
      "stat_requirements": {
        "sp": 160,
        "abi": 30,
        "spd": 250
      },
      "dna_requirement": null
    }
  ],
  "306": [
    {
      "id": 617,
      "from_digimon_id": 195,
      "to_digimon_id": 306,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 120,
        "int": 135,
        "spd": 150
      },
      "dna_requirement": null
    },
    {
      "id": 586,
      "from_digimon_id": 182,
      "to_digimon_id": 306,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 120,
        "int": 135,
        "spd": 150
      },
      "dna_requirement": null
    }
  ],
  "307": [
    {
      "id": 597,
      "from_digimon_id": 187,
      "to_digimon_id": 307,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 667,
      "from_digimon_id": 210,
      "to_digimon_id": 307,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 673,
      "from_digimon_id": 212,
      "to_digimon_id": 307,
      "level_required": 55,
      "stat_requirements": {
        "sp": 120,
        "abi": 20,
        "int": 120
      },
      "dna_requirement": null
    }
  ],
  "308": [
    {
      "id": 714,
      "from_digimon_id": 307,
      "to_digimon_id": 308,
      "level_required": 60,
      "stat_requirements": {
        "sp": 170,
        "abi": 30,
        "int": 180
      },
      "dna_requirement": null
    }
  ],
  "309": [
    {
      "id": 668,
      "from_digimon_id": 210,
      "to_digimon_id": 309,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "int": 170,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 678,
      "from_digimon_id": 214,
      "to_digimon_id": 309,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "int": 170,
        "spd": 130
      },
      "dna_requirement": null
    },
    {
      "id": 674,
      "from_digimon_id": 212,
      "to_digimon_id": 309,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "int": 170,
        "spd": 130
      },
      "dna_requirement": null
    }
  ],
  "310": [
    {
      "id": 695,
      "from_digimon_id": 260,
      "to_digimon_id": 310,
      "level_required": 70,
      "stat_requirements": {
        "hp": 2000,
        "sp": 140,
        "abi": 100,
        "atk": 290
      },
      "dna_requirement": null
    }
  ],
  "311": [
    {
      "id": 885,
      "from_digimon_id": 218,
      "to_digimon_id": 311,
      "level_required": 70,
      "stat_requirements": {
        "sp": 150,
        "abi": 60,
        "atk": 250,
        "int": 150,
        "spd": 160
      },
      "dna_requirement": null
    }
  ],
  "312": [
    {
      "id": 689,
      "from_digimon_id": 219,
      "to_digimon_id": 312,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 180,
        "def": 170,
        "int": 150
      },
      "dna_requirement": 331
    },
    {
      "id": 911,
      "from_digimon_id": 331,
      "to_digimon_id": 312,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 180,
        "def": 170,
        "int": 150
      },
      "dna_requirement": 219
    }
  ],
  "313": [
    {
      "id": 690,
      "from_digimon_id": 222,
      "to_digimon_id": 313,
      "level_required": 70,
      "stat_requirements": {
        "abi": 100,
        "atk": 160,
        "def": 160,
        "int": 160,
        "spd": 160
      },
      "dna_requirement": null
    }
  ],
  "314": [
    {
      "id": 888,
      "from_digimon_id": 252,
      "to_digimon_id": 314,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1650,
        "abi": 100,
        "atk": 150,
        "spd": 150
      },
      "dna_requirement": 278
    },
    {
      "id": 889,
      "from_digimon_id": 278,
      "to_digimon_id": 314,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1650,
        "abi": 100,
        "atk": 150,
        "spd": 150
      },
      "dna_requirement": 252
    }
  ],
  "315": [
    {
      "id": 693,
      "from_digimon_id": 228,
      "to_digimon_id": 315,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 200,
        "int": 150,
        "spd": 150
      },
      "dna_requirement": 297
    },
    {
      "id": 710,
      "from_digimon_id": 297,
      "to_digimon_id": 315,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 200,
        "int": 150,
        "spd": 150
      },
      "dna_requirement": 228
    }
  ],
  "316": [
    {
      "id": 703,
      "from_digimon_id": 276,
      "to_digimon_id": 316,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1500,
        "abi": 40,
        "atk": 150,
        "def": 200
      },
      "dna_requirement": 298
    },
    {
      "id": 711,
      "from_digimon_id": 298,
      "to_digimon_id": 316,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1500,
        "abi": 40,
        "atk": 150,
        "def": 200
      },
      "dna_requirement": 276
    }
  ],
  "317": [
    {
      "id": 716,
      "from_digimon_id": 255,
      "to_digimon_id": 317,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 255
      },
      "dna_requirement": 272
    },
    {
      "id": 699,
      "from_digimon_id": 272,
      "to_digimon_id": 317,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 255
      },
      "dna_requirement": 255
    }
  ],
  "318": [
    {
      "id": 700,
      "from_digimon_id": 272,
      "to_digimon_id": 318,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 155,
        "int": 100
      },
      "dna_requirement": 226
    },
    {
      "id": 886,
      "from_digimon_id": 226,
      "to_digimon_id": 318,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 155,
        "int": 100
      },
      "dna_requirement": 272
    }
  ],
  "319": [
    {
      "id": 887,
      "from_digimon_id": 231,
      "to_digimon_id": 319,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1000,
        "abi": 100,
        "atk": 150,
        "int": 150
      },
      "dna_requirement": 287
    },
    {
      "id": 891,
      "from_digimon_id": 287,
      "to_digimon_id": 319,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1000,
        "abi": 100,
        "atk": 150,
        "int": 150
      },
      "dna_requirement": 231
    }
  ],
  "320": [
    {
      "id": 696,
      "from_digimon_id": 262,
      "to_digimon_id": 320,
      "level_required": 80,
      "stat_requirements": {
        "abi": 80,
        "atk": 185,
        "def": 185,
        "int": 185
      },
      "dna_requirement": null
    }
  ],
  "321": [
    {
      "id": 706,
      "from_digimon_id": 283,
      "to_digimon_id": 321,
      "level_required": 0,
      "stat_requirements": {},
      "dna_requirement": null
    }
  ],
  "322": [
    {
      "id": 675,
      "from_digimon_id": 213,
      "to_digimon_id": 322,
      "level_required": 70,
      "stat_requirements": {
        "hp": 1400,
        "sp": 160,
        "abi": 100,
        "atk": 130,
        "int": 250,
        "spd": 170
      },
      "dna_requirement": null
    }
  ],
  "323": [
    {
      "id": 226,
      "from_digimon_id": 53,
      "to_digimon_id": 323,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "spd": 40
      },
      "dna_requirement": null
    }
  ],
  "324": [
    {
      "id": 227,
      "from_digimon_id": 53,
      "to_digimon_id": 324,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 120,
        "def": 145
      },
      "dna_requirement": null
    },
    {
      "id": 777,
      "from_digimon_id": 80,
      "to_digimon_id": 324,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 120,
        "def": 145
      },
      "dna_requirement": null
    }
  ],
  "325": [
    {
      "id": 169,
      "from_digimon_id": 39,
      "to_digimon_id": 325,
      "level_required": 50,
      "stat_requirements": {
        "abi": 40,
        "atk": 100,
        "def": 120,
        "int": 120
      },
      "dna_requirement": null
    },
    {
      "id": 776,
      "from_digimon_id": 80,
      "to_digimon_id": 325,
      "level_required": 50,
      "stat_requirements": {
        "abi": 40,
        "atk": 100,
        "def": 120,
        "int": 120
      },
      "dna_requirement": null
    }
  ],
  "326": [
    {
      "id": 18,
      "from_digimon_id": 7,
      "to_digimon_id": 326,
      "level_required": 8,
      "stat_requirements": {
        "atk": 30,
        "spd": 20
      },
      "dna_requirement": null
    }
  ],
  "327": [
    {
      "id": 893,
      "from_digimon_id": 326,
      "to_digimon_id": 327,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 130,
        "def": 130,
        "spd": 120
      },
      "dna_requirement": null
    }
  ],
  "328": [
    {
      "id": 61,
      "from_digimon_id": 17,
      "to_digimon_id": 328,
      "level_required": 8,
      "stat_requirements": {
        "atk": 30,
        "def": 30
      },
      "dna_requirement": null
    }
  ],
  "329": [
    {
      "id": 724,
      "from_digimon_id": 36,
      "to_digimon_id": 329,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 737,
      "from_digimon_id": 43,
      "to_digimon_id": 329,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "def": 40
      },
      "dna_requirement": null
    },
    {
      "id": 901,
      "from_digimon_id": 328,
      "to_digimon_id": 329,
      "level_required": 14,
      "stat_requirements": {
        "atk": 40,
        "def": 40
      },
      "dna_requirement": null
    }
  ],
  "330": [
    {
      "id": 794,
      "from_digimon_id": 104,
      "to_digimon_id": 330,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 382,
      "from_digimon_id": 103,
      "to_digimon_id": 330,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "def": 75
      },
      "dna_requirement": null
    },
    {
      "id": 904,
      "from_digimon_id": 329,
      "to_digimon_id": 330,
      "level_required": 30,
      "stat_requirements": {
        "hp": 400,
        "atk": 95,
        "def": 75
      },
      "dna_requirement": null
    }
  ],
  "331": [
    {
      "id": 662,
      "from_digimon_id": 208,
      "to_digimon_id": 331,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 180
      },
      "dna_requirement": null
    },
    {
      "id": 907,
      "from_digimon_id": 330,
      "to_digimon_id": 331,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 180
      },
      "dna_requirement": null
    },
    {
      "id": 849,
      "from_digimon_id": 161,
      "to_digimon_id": 331,
      "level_required": 50,
      "stat_requirements": {
        "hp": 1300,
        "abi": 20,
        "atk": 180
      },
      "dna_requirement": null
    }
  ],
  "332": [
    {
      "id": 712,
      "from_digimon_id": 299,
      "to_digimon_id": 332,
      "level_required": 99,
      "stat_requirements": {
        "abi": 120
      },
      "dna_requirement": null
    },
    {
      "id": 701,
      "from_digimon_id": 273,
      "to_digimon_id": 332,
      "level_required": 99,
      "stat_requirements": {
        "abi": 120
      },
      "dna_requirement": null
    },
    {
      "id": 702,
      "from_digimon_id": 274,
      "to_digimon_id": 332,
      "level_required": 99,
      "stat_requirements": {
        "abi": 120
      },
      "dna_requirement": null
    },
    {
      "id": 709,
      "from_digimon_id": 294,
      "to_digimon_id": 332,
      "level_required": 99,
      "stat_requirements": {
        "abi": 120
      },
      "dna_requirement": null
    }
  ],
  "333": [
    {
      "id": 37,
      "from_digimon_id": 11,
      "to_digimon_id": 333,
      "level_required": 7,
      "stat_requirements": {
        "sp": 20,
        "int": 30
      },
      "dna_requirement": null
    }
  ],
  "334": [
    {
      "id": 894,
      "from_digimon_id": 333,
      "to_digimon_id": 334,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1150,
        "sp": 130,
        "abi": 50,
        "int": 150
      },
      "dna_requirement": null
    }
  ],
  "335": [
    {
      "id": 732,
      "from_digimon_id": 42,
      "to_digimon_id": 335,
      "level_required": 14,
      "stat_requirements": {
        "sp": 40,
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 754,
      "from_digimon_id": 61,
      "to_digimon_id": 335,
      "level_required": 14,
      "stat_requirements": {
        "sp": 40,
        "spd": 50
      },
      "dna_requirement": null
    },
    {
      "id": 895,
      "from_digimon_id": 333,
      "to_digimon_id": 335,
      "level_required": 14,
      "stat_requirements": {
        "sp": 40,
        "spd": 50
      },
      "dna_requirement": null
    }
  ],
  "336": [
    {
      "id": 898,
      "from_digimon_id": 335,
      "to_digimon_id": 336,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1150,
        "abi": 50,
        "atk": 130,
        "spd": 150
      },
      "dna_requirement": null
    }
  ],
  "342": [
    {
      "id": 914,
      "from_digimon_id": 204,
      "to_digimon_id": 342,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1800,
        "abi": 25,
        "atk": 180,
        "def": 150
      },
      "dna_requirement": null
    }
  ],
  "343": [
    {
      "id": 915,
      "from_digimon_id": 215,
      "to_digimon_id": 343,
      "level_required": 55,
      "stat_requirements": {
        "abi": 25,
        "atk": 190,
        "def": 130,
        "int": 100
      },
      "dna_requirement": null
    }
  ],
  "344": [
    {
      "id": 912,
      "from_digimon_id": 342,
      "to_digimon_id": 344,
      "level_required": 60,
      "stat_requirements": {
        "abi": 50,
        "atk": 220,
        "int": 160,
        "spd": 135
      },
      "dna_requirement": 343
    },
    {
      "id": 913,
      "from_digimon_id": 343,
      "to_digimon_id": 344,
      "level_required": 60,
      "stat_requirements": {
        "abi": 50,
        "atk": 220,
        "int": 160,
        "spd": 135
      },
      "dna_requirement": 342
    }
  ],
  "346": [
    {
      "id": 916,
      "from_digimon_id": 345,
      "to_digimon_id": 346,
      "level_required": 16,
      "stat_requirements": {
        "atk": 60
      },
      "dna_requirement": null
    }
  ],
  "347": [
    {
      "id": 917,
      "from_digimon_id": 346,
      "to_digimon_id": 347,
      "level_required": 30,
      "stat_requirements": {
        "hp": 385,
        "atk": 110
      },
      "dna_requirement": null
    }
  ],
  "348": [
    {
      "id": 918,
      "from_digimon_id": 347,
      "to_digimon_id": 348,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1870,
        "abi": 20,
        "atk": 175,
        "def": 140
      },
      "dna_requirement": null
    }
  ],
  "351": [
    {
      "id": 919,
      "from_digimon_id": 350,
      "to_digimon_id": 351,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 165,
        "def": 130,
        "spd": 165
      },
      "dna_requirement": null
    }
  ],
  "352": [
    {
      "id": 920,
      "from_digimon_id": 348,
      "to_digimon_id": 352,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 220,
        "int": 165,
        "spd": 165
      },
      "dna_requirement": 351
    },
    {
      "id": 921,
      "from_digimon_id": 351,
      "to_digimon_id": 352,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 220,
        "int": 165,
        "spd": 165
      },
      "dna_requirement": 348
    }
  ],
  "354": [
    {
      "id": 922,
      "from_digimon_id": 353,
      "to_digimon_id": 354,
      "level_required": 15,
      "stat_requirements": {
        "atk": 55,
        "spd": 20
      },
      "dna_requirement": null
    }
  ],
  "355": [
    {
      "id": 923,
      "from_digimon_id": 354,
      "to_digimon_id": 355,
      "level_required": 30,
      "stat_requirements": {
        "atk": 115,
        "spd": 80
      },
      "dna_requirement": null
    }
  ],
  "356": [
    {
      "id": 924,
      "from_digimon_id": 355,
      "to_digimon_id": 356,
      "level_required": 55,
      "stat_requirements": {
        "hp": 1870,
        "abi": 40,
        "atk": 200
      },
      "dna_requirement": null
    }
  ],
  "357": [
    {
      "id": 925,
      "from_digimon_id": 355,
      "to_digimon_id": 357,
      "level_required": 60,
      "stat_requirements": {
        "abi": 80,
        "atk": 155,
        "def": 155,
        "int": 155
      },
      "dna_requirement": null
    }
  ],
  "360": [
    {
      "id": 926,
      "from_digimon_id": 214,
      "to_digimon_id": 360,
      "level_required": 60,
      "stat_requirements": {
        "hp": 1900,
        "abi": 80,
        "int": 250,
        "spd": 140
      },
      "dna_requirement": null
    }
  ],
  "361": [
    {
      "id": 927,
      "from_digimon_id": 359,
      "to_digimon_id": 361,
      "level_required": 60,
      "stat_requirements": {
        "hp": 2090,
        "abi": 80,
        "int": 275,
        "spd": 150
      },
      "dna_requirement": null
    }
  ],
  "363": [
    {
      "id": 928,
      "from_digimon_id": 15,
      "to_digimon_id": 363,
      "level_required": 8,
      "stat_requirements": {
        "hp": 75,
        "atk": 20
      },
      "dna_requirement": null
    }
  ],
  "364": [
    {
      "id": 929,
      "from_digimon_id": 363,
      "to_digimon_id": 364,
      "level_required": 15,
      "stat_requirements": {
        "atk": 40,
        "spd": 35
      },
      "dna_requirement": null
    },
    {
      "id": 930,
      "from_digimon_id": 25,
      "to_digimon_id": 364,
      "level_required": 15,
      "stat_requirements": {
        "atk": 40,
        "spd": 35
      },
      "dna_requirement": null
    },
    {
      "id": 931,
      "from_digimon_id": 37,
      "to_digimon_id": 364,
      "level_required": 15,
      "stat_requirements": {
        "atk": 40,
        "spd": 35
      },
      "dna_requirement": null
    }
  ],
  "365": [
    {
      "id": 932,
      "from_digimon_id": 364,
      "to_digimon_id": 365,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 933,
      "from_digimon_id": 109,
      "to_digimon_id": 365,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "spd": 55
      },
      "dna_requirement": null
    },
    {
      "id": 934,
      "from_digimon_id": 105,
      "to_digimon_id": 365,
      "level_required": 30,
      "stat_requirements": {
        "atk": 75,
        "spd": 55
      },
      "dna_requirement": null
    }
  ],
  "366": [
    {
      "id": 939,
      "from_digimon_id": 365,
      "to_digimon_id": 366,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "def": 130,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 940,
      "from_digimon_id": 160,
      "to_digimon_id": 366,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "def": 130,
        "spd": 120
      },
      "dna_requirement": null
    },
    {
      "id": 941,
      "from_digimon_id": 196,
      "to_digimon_id": 366,
      "level_required": 55,
      "stat_requirements": {
        "abi": 20,
        "atk": 130,
        "def": 130,
        "spd": 120
      },
      "dna_requirement": null
    }
  ],
  "367": [
    {
      "id": 944,
      "from_digimon_id": 366,
      "to_digimon_id": 367,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 180,
        "int": 180,
        "spd": 170
      },
      "dna_requirement": 259
    },
    {
      "id": 945,
      "from_digimon_id": 259,
      "to_digimon_id": 367,
      "level_required": 60,
      "stat_requirements": {
        "abi": 40,
        "atk": 180,
        "int": 180,
        "spd": 170
      },
      "dna_requirement": 366
    }
  ],
  "368": [
    {
      "id": 947,
      "from_digimon_id": 380,
      "to_digimon_id": 368,
      "level_required": 30,
      "stat_requirements": {
        "sp": 85,
        "abi": 10,
        "int": 110
      },
      "dna_requirement": null
    }
  ],
  "369": [
    {
      "id": 953,
      "from_digimon_id": 385,
      "to_digimon_id": 369,
      "level_required": 55,
      "stat_requirements": {
        "sp": 130,
        "abi": 20,
        "int": 130
      },
      "dna_requirement": null
    }
  ],
  "380": [
    {
      "id": 946,
      "from_digimon_id": 379,
      "to_digimon_id": 380,
      "level_required": 16,
      "stat_requirements": {
        "int": 45
      },
      "dna_requirement": null
    }
  ],
  "381": [
    {
      "id": 949,
      "from_digimon_id": 368,
      "to_digimon_id": 381,
      "level_required": 55,
      "stat_requirements": {
        "sp": 130,
        "abi": 40,
        "def": 130,
        "int": 160
      },
      "dna_requirement": null
    }
  ],
  "382": [
    {
      "id": 950,
      "from_digimon_id": 359,
      "to_digimon_id": 382,
      "level_required": 60,
      "stat_requirements": {
        "sp": 220,
        "abi": 80,
        "int": 275,
        "spd": 145
      },
      "dna_requirement": null
    }
  ],
  "384": [
    {
      "id": 951,
      "from_digimon_id": 383,
      "to_digimon_id": 384,
      "level_required": 16,
      "stat_requirements": {
        "hp": 330,
        "def": 35
      },
      "dna_requirement": null
    }
  ],
  "385": [
    {
      "id": 948,
      "from_digimon_id": 380,
      "to_digimon_id": 385,
      "level_required": 30,
      "stat_requirements": {
        "int": 85,
        "spd": 85
      },
      "dna_requirement": null
    },
    {
      "id": 952,
      "from_digimon_id": 384,
      "to_digimon_id": 385,
      "level_required": 30,
      "stat_requirements": {
        "int": 85,
        "spd": 85
      },
      "dna_requirement": null
    }
  ]
},
  byPair: {
  "35-94": {
    "id": 157,
    "from_digimon_id": 35,
    "to_digimon_id": 94,
    "level_required": 14,
    "stat_requirements": {
      "sp": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  "37-95": {
    "id": 161,
    "from_digimon_id": 37,
    "to_digimon_id": 95,
    "level_required": 12,
    "stat_requirements": {
      "hp": 130,
      "sp": 25,
      "def": 40
    },
    "dna_requirement": null
  },
  "37-99": {
    "id": 165,
    "from_digimon_id": 37,
    "to_digimon_id": 99,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 60
    },
    "dna_requirement": null
  },
  "40-102": {
    "id": 173,
    "from_digimon_id": 40,
    "to_digimon_id": 102,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "int": 40
    },
    "dna_requirement": null
  },
  "4-7": {
    "id": 9,
    "from_digimon_id": 4,
    "to_digimon_id": 7,
    "level_required": 3,
    "stat_requirements": {
      "atk": 15
    },
    "dna_requirement": null
  },
  "41-79": {
    "id": 177,
    "from_digimon_id": 41,
    "to_digimon_id": 79,
    "level_required": 14,
    "stat_requirements": {
      "def": 55
    },
    "dna_requirement": null
  },
  "41-80": {
    "id": 181,
    "from_digimon_id": 41,
    "to_digimon_id": 80,
    "level_required": 14,
    "stat_requirements": {
      "hp": 130,
      "def": 60
    },
    "dna_requirement": null
  },
  "44-140": {
    "id": 185,
    "from_digimon_id": 44,
    "to_digimon_id": 140,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  "342-344": {
    "id": 912,
    "from_digimon_id": 342,
    "to_digimon_id": 344,
    "level_required": 60,
    "stat_requirements": {
      "abi": 50,
      "atk": 220,
      "int": 160,
      "spd": 135
    },
    "dna_requirement": 343
  },
  "364-207": {
    "id": 938,
    "from_digimon_id": 364,
    "to_digimon_id": 207,
    "level_required": 26,
    "stat_requirements": {
      "hp": 600,
      "atk": 60
    },
    "dna_requirement": null
  },
  "7-18": {
    "id": 13,
    "from_digimon_id": 7,
    "to_digimon_id": 18,
    "level_required": 9,
    "stat_requirements": {
      "atk": 30
    },
    "dna_requirement": null
  },
  "7-43": {
    "id": 17,
    "from_digimon_id": 7,
    "to_digimon_id": 43,
    "level_required": 6,
    "stat_requirements": {
      "atk": 50,
      "def": 20
    },
    "dna_requirement": null
  },
  "8-62": {
    "id": 21,
    "from_digimon_id": 8,
    "to_digimon_id": 62,
    "level_required": 7,
    "stat_requirements": {
      "atk": 20,
      "int": 20,
      "spd": 20
    },
    "dna_requirement": null
  },
  "9-33": {
    "id": 25,
    "from_digimon_id": 9,
    "to_digimon_id": 33,
    "level_required": 7,
    "stat_requirements": {
      "atk": 40
    },
    "dna_requirement": null
  },
  "10-19": {
    "id": 29,
    "from_digimon_id": 10,
    "to_digimon_id": 19,
    "level_required": 8,
    "stat_requirements": {
      "atk": 30
    },
    "dna_requirement": null
  },
  "11-51": {
    "id": 34,
    "from_digimon_id": 11,
    "to_digimon_id": 51,
    "level_required": 9,
    "stat_requirements": {
      "spd": 30
    },
    "dna_requirement": null
  },
  "12-21": {
    "id": 38,
    "from_digimon_id": 12,
    "to_digimon_id": 21,
    "level_required": 7,
    "stat_requirements": {
      "hp": 75,
      "def": 20
    },
    "dna_requirement": null
  },
  "13-22": {
    "id": 42,
    "from_digimon_id": 13,
    "to_digimon_id": 22,
    "level_required": 7,
    "stat_requirements": {
      "sp": 20,
      "int": 30
    },
    "dna_requirement": null
  },
  "14-23": {
    "id": 46,
    "from_digimon_id": 14,
    "to_digimon_id": 23,
    "level_required": 7,
    "stat_requirements": {
      "hp": 75,
      "sp": 20,
      "spd": 20
    },
    "dna_requirement": null
  },
  "15-24": {
    "id": 50,
    "from_digimon_id": 15,
    "to_digimon_id": 24,
    "level_required": 7,
    "stat_requirements": {
      "int": 20
    },
    "dna_requirement": null
  },
  "16-32": {
    "id": 54,
    "from_digimon_id": 16,
    "to_digimon_id": 32,
    "level_required": 8,
    "stat_requirements": {
      "def": 30
    },
    "dna_requirement": null
  },
  "17-25": {
    "id": 58,
    "from_digimon_id": 17,
    "to_digimon_id": 25,
    "level_required": 9,
    "stat_requirements": {
      "atk": 20,
      "spd": 20
    },
    "dna_requirement": null
  },
  "18-90": {
    "id": 62,
    "from_digimon_id": 18,
    "to_digimon_id": 90,
    "level_required": 16,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  "18-131": {
    "id": 66,
    "from_digimon_id": 18,
    "to_digimon_id": 131,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40
    },
    "dna_requirement": null
  },
  "19-100": {
    "id": 70,
    "from_digimon_id": 19,
    "to_digimon_id": 100,
    "level_required": 14,
    "stat_requirements": {
      "atk": 30,
      "def": 40
    },
    "dna_requirement": null
  },
  "21-95": {
    "id": 75,
    "from_digimon_id": 21,
    "to_digimon_id": 95,
    "level_required": 12,
    "stat_requirements": {
      "hp": 130,
      "sp": 25,
      "def": 40
    },
    "dna_requirement": null
  },
  "21-99": {
    "id": 79,
    "from_digimon_id": 21,
    "to_digimon_id": 99,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 60
    },
    "dna_requirement": null
  },
  "22-111": {
    "id": 83,
    "from_digimon_id": 22,
    "to_digimon_id": 111,
    "level_required": 16,
    "stat_requirements": {
      "sp": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  "23-86": {
    "id": 87,
    "from_digimon_id": 23,
    "to_digimon_id": 86,
    "level_required": 15,
    "stat_requirements": {
      "atk": 35,
      "spd": 50
    },
    "dna_requirement": null
  },
  "23-137": {
    "id": 91,
    "from_digimon_id": 23,
    "to_digimon_id": 137,
    "level_required": 16,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  "24-121": {
    "id": 95,
    "from_digimon_id": 24,
    "to_digimon_id": 121,
    "level_required": 12,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  "25-81": {
    "id": 99,
    "from_digimon_id": 25,
    "to_digimon_id": 81,
    "level_required": 15,
    "stat_requirements": {
      "spd": 55
    },
    "dna_requirement": null
  },
  "25-101": {
    "id": 103,
    "from_digimon_id": 25,
    "to_digimon_id": 101,
    "level_required": 15,
    "stat_requirements": {
      "atk": 50,
      "spd": 55
    },
    "dna_requirement": null
  },
  "26-119": {
    "id": 107,
    "from_digimon_id": 26,
    "to_digimon_id": 119,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  "27-119": {
    "id": 111,
    "from_digimon_id": 27,
    "to_digimon_id": 119,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  "28-86": {
    "id": 116,
    "from_digimon_id": 28,
    "to_digimon_id": 86,
    "level_required": 15,
    "stat_requirements": {
      "atk": 35,
      "spd": 50
    },
    "dna_requirement": null
  },
  "28-136": {
    "id": 120,
    "from_digimon_id": 28,
    "to_digimon_id": 136,
    "level_required": 12,
    "stat_requirements": {
      "hp": 500
    },
    "dna_requirement": null
  },
  "29-114": {
    "id": 124,
    "from_digimon_id": 29,
    "to_digimon_id": 114,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "atk": 40
    },
    "dna_requirement": null
  },
  "30-98": {
    "id": 128,
    "from_digimon_id": 30,
    "to_digimon_id": 98,
    "level_required": 18,
    "stat_requirements": {
      "abi": 5
    },
    "dna_requirement": null
  },
  "31-72": {
    "id": 132,
    "from_digimon_id": 31,
    "to_digimon_id": 72,
    "level_required": 14,
    "stat_requirements": {
      "sp": 35,
      "int": 55
    },
    "dna_requirement": null
  },
  "31-69": {
    "id": 136,
    "from_digimon_id": 31,
    "to_digimon_id": 69,
    "level_required": 16,
    "stat_requirements": {
      "atk": 50,
      "int": 40
    },
    "dna_requirement": null
  },
  "32-112": {
    "id": 140,
    "from_digimon_id": 32,
    "to_digimon_id": 112,
    "level_required": 14,
    "stat_requirements": {
      "def": 55
    },
    "dna_requirement": null
  },
  "33-81": {
    "id": 144,
    "from_digimon_id": 33,
    "to_digimon_id": 81,
    "level_required": 15,
    "stat_requirements": {
      "spd": 55
    },
    "dna_requirement": null
  },
  "33-97": {
    "id": 148,
    "from_digimon_id": 33,
    "to_digimon_id": 97,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "def": 25,
      "spd": 40
    },
    "dna_requirement": null
  },
  "34-133": {
    "id": 152,
    "from_digimon_id": 34,
    "to_digimon_id": 133,
    "level_required": 14,
    "stat_requirements": {
      "hp": 250,
      "atk": 30
    },
    "dna_requirement": null
  },
  "83-200": {
    "id": 325,
    "from_digimon_id": 83,
    "to_digimon_id": 200,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "sp": 70,
      "int": 70
    },
    "dna_requirement": null
  },
  "85-170": {
    "id": 329,
    "from_digimon_id": 85,
    "to_digimon_id": 170,
    "level_required": 30,
    "stat_requirements": {
      "hp": 800,
      "atk": 75
    },
    "dna_requirement": null
  },
  "86-192": {
    "id": 333,
    "from_digimon_id": 86,
    "to_digimon_id": 192,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 80,
      "int": 70
    },
    "dna_requirement": null
  },
  "87-172": {
    "id": 337,
    "from_digimon_id": 87,
    "to_digimon_id": 172,
    "level_required": 30,
    "stat_requirements": {
      "sp": 60,
      "int": 75,
      "spd": 60
    },
    "dna_requirement": null
  },
  "46-115": {
    "id": 194,
    "from_digimon_id": 46,
    "to_digimon_id": 115,
    "level_required": 16,
    "stat_requirements": {
      "int": 40
    },
    "dna_requirement": null
  },
  "88-203": {
    "id": 342,
    "from_digimon_id": 88,
    "to_digimon_id": 203,
    "level_required": 30,
    "stat_requirements": {
      "hp": 350,
      "atk": 100
    },
    "dna_requirement": null
  },
  "89-163": {
    "id": 346,
    "from_digimon_id": 89,
    "to_digimon_id": 163,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "90-201": {
    "id": 350,
    "from_digimon_id": 90,
    "to_digimon_id": 201,
    "level_required": 26,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "spd": 75
    },
    "dna_requirement": null
  },
  "91-182": {
    "id": 354,
    "from_digimon_id": 91,
    "to_digimon_id": 182,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "def": 75
    },
    "dna_requirement": null
  },
  "92-182": {
    "id": 358,
    "from_digimon_id": 92,
    "to_digimon_id": 182,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "def": 75
    },
    "dna_requirement": null
  },
  "93-158": {
    "id": 362,
    "from_digimon_id": 93,
    "to_digimon_id": 158,
    "level_required": 28,
    "stat_requirements": {
      "def": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "94-200": {
    "id": 366,
    "from_digimon_id": 94,
    "to_digimon_id": 200,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "sp": 70,
      "int": 70
    },
    "dna_requirement": null
  },
  "98-191": {
    "id": 370,
    "from_digimon_id": 98,
    "to_digimon_id": 191,
    "level_required": 32,
    "stat_requirements": {},
    "dna_requirement": null
  },
  "343-344": {
    "id": 913,
    "from_digimon_id": 343,
    "to_digimon_id": 344,
    "level_required": 60,
    "stat_requirements": {
      "abi": 50,
      "atk": 220,
      "int": 160,
      "spd": 135
    },
    "dna_requirement": 342
  },
  "365-366": {
    "id": 939,
    "from_digimon_id": 365,
    "to_digimon_id": 366,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "def": 130,
      "spd": 120
    },
    "dna_requirement": null
  },
  "47-90": {
    "id": 198,
    "from_digimon_id": 47,
    "to_digimon_id": 90,
    "level_required": 16,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  "47-123": {
    "id": 202,
    "from_digimon_id": 47,
    "to_digimon_id": 123,
    "level_required": 16,
    "stat_requirements": {
      "atk": 55,
      "spd": 50
    },
    "dna_requirement": null
  },
  "48-102": {
    "id": 206,
    "from_digimon_id": 48,
    "to_digimon_id": 102,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "int": 40
    },
    "dna_requirement": null
  },
  "49-65": {
    "id": 210,
    "from_digimon_id": 49,
    "to_digimon_id": 65,
    "level_required": 15,
    "stat_requirements": {
      "atk": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  "49-124": {
    "id": 214,
    "from_digimon_id": 49,
    "to_digimon_id": 124,
    "level_required": 13,
    "stat_requirements": {
      "sp": 40,
      "int": 30
    },
    "dna_requirement": null
  },
  "50-75": {
    "id": 219,
    "from_digimon_id": 50,
    "to_digimon_id": 75,
    "level_required": 14,
    "stat_requirements": {
      "atk": 35,
      "spd": 45
    },
    "dna_requirement": null
  },
  "51-130": {
    "id": 223,
    "from_digimon_id": 51,
    "to_digimon_id": 130,
    "level_required": 14,
    "stat_requirements": {
      "spd": 50
    },
    "dna_requirement": null
  },
  "53-324": {
    "id": 227,
    "from_digimon_id": 53,
    "to_digimon_id": 324,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 120,
      "def": 145
    },
    "dna_requirement": null
  },
  "54-115": {
    "id": 231,
    "from_digimon_id": 54,
    "to_digimon_id": 115,
    "level_required": 16,
    "stat_requirements": {
      "int": 40
    },
    "dna_requirement": null
  },
  "54-123": {
    "id": 235,
    "from_digimon_id": 54,
    "to_digimon_id": 123,
    "level_required": 16,
    "stat_requirements": {
      "atk": 55,
      "spd": 50
    },
    "dna_requirement": null
  },
  "55-121": {
    "id": 239,
    "from_digimon_id": 55,
    "to_digimon_id": 121,
    "level_required": 12,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  "59-74": {
    "id": 247,
    "from_digimon_id": 59,
    "to_digimon_id": 74,
    "level_required": 14,
    "stat_requirements": {
      "hp": 500
    },
    "dna_requirement": null
  },
  "60-77": {
    "id": 251,
    "from_digimon_id": 60,
    "to_digimon_id": 77,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "int": 40
    },
    "dna_requirement": null
  },
  "62-85": {
    "id": 255,
    "from_digimon_id": 62,
    "to_digimon_id": 85,
    "level_required": 15,
    "stat_requirements": {
      "spd": 50
    },
    "dna_requirement": null
  },
  "63-72": {
    "id": 260,
    "from_digimon_id": 63,
    "to_digimon_id": 72,
    "level_required": 14,
    "stat_requirements": {
      "sp": 35,
      "int": 55
    },
    "dna_requirement": null
  },
  "63-113": {
    "id": 264,
    "from_digimon_id": 63,
    "to_digimon_id": 113,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  "64-93": {
    "id": 268,
    "from_digimon_id": 64,
    "to_digimon_id": 93,
    "level_required": 14,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  "65-147": {
    "id": 272,
    "from_digimon_id": 65,
    "to_digimon_id": 147,
    "level_required": 30,
    "stat_requirements": {
      "abi": 10,
      "atk": 70,
      "int": 90
    },
    "dna_requirement": null
  },
  "65-173": {
    "id": 276,
    "from_digimon_id": 65,
    "to_digimon_id": 173,
    "level_required": 28,
    "stat_requirements": {
      "sp": 70,
      "int": 85
    },
    "dna_requirement": null
  },
  "67-208": {
    "id": 280,
    "from_digimon_id": 67,
    "to_digimon_id": 208,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "spd": 90
    },
    "dna_requirement": null
  },
  "70-168": {
    "id": 284,
    "from_digimon_id": 70,
    "to_digimon_id": 168,
    "level_required": 28,
    "stat_requirements": {
      "atk": 120,
      "def": 85,
      "spd": 70
    },
    "dna_requirement": null
  },
  "71-194": {
    "id": 288,
    "from_digimon_id": 71,
    "to_digimon_id": 194,
    "level_required": 28,
    "stat_requirements": {
      "hp": 850,
      "def": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  "72-177": {
    "id": 292,
    "from_digimon_id": 72,
    "to_digimon_id": 177,
    "level_required": 28,
    "stat_requirements": {
      "hp": 500,
      "atk": 95
    },
    "dna_requirement": null
  },
  "74-172": {
    "id": 296,
    "from_digimon_id": 74,
    "to_digimon_id": 172,
    "level_required": 30,
    "stat_requirements": {
      "sp": 60,
      "int": 75,
      "spd": 60
    },
    "dna_requirement": null
  },
  "76-148": {
    "id": 301,
    "from_digimon_id": 76,
    "to_digimon_id": 148,
    "level_required": 30,
    "stat_requirements": {
      "abi": 10,
      "atk": 80,
      "spd": 95
    },
    "dna_requirement": null
  },
  "77-195": {
    "id": 305,
    "from_digimon_id": 77,
    "to_digimon_id": 195,
    "level_required": 30,
    "stat_requirements": {
      "sp": 80,
      "abi": 10,
      "int": 80
    },
    "dna_requirement": null
  },
  "78-177": {
    "id": 309,
    "from_digimon_id": 78,
    "to_digimon_id": 177,
    "level_required": 28,
    "stat_requirements": {
      "hp": 500,
      "atk": 95
    },
    "dna_requirement": null
  },
  "79-160": {
    "id": 313,
    "from_digimon_id": 79,
    "to_digimon_id": 160,
    "level_required": 26,
    "stat_requirements": {
      "hp": 400,
      "atk": 95
    },
    "dna_requirement": null
  },
  "81-160": {
    "id": 317,
    "from_digimon_id": 81,
    "to_digimon_id": 160,
    "level_required": 26,
    "stat_requirements": {
      "hp": 400,
      "atk": 95
    },
    "dna_requirement": null
  },
  "82-165": {
    "id": 321,
    "from_digimon_id": 82,
    "to_digimon_id": 165,
    "level_required": 28,
    "stat_requirements": {
      "hp": 800,
      "def": 70
    },
    "dna_requirement": null
  },
  "137-145": {
    "id": 473,
    "from_digimon_id": 137,
    "to_digimon_id": 145,
    "level_required": 26,
    "stat_requirements": {
      "def": 110
    },
    "dna_requirement": null
  },
  "137-161": {
    "id": 477,
    "from_digimon_id": 137,
    "to_digimon_id": 161,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 80,
      "spd": 70
    },
    "dna_requirement": null
  },
  "140-141": {
    "id": 481,
    "from_digimon_id": 140,
    "to_digimon_id": 141,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "def": 95
    },
    "dna_requirement": null
  },
  "146-260": {
    "id": 499,
    "from_digimon_id": 146,
    "to_digimon_id": 260,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1100,
      "abi": 20,
      "atk": 180,
      "spd": 130
    },
    "dna_requirement": null
  },
  "103-179": {
    "id": 379,
    "from_digimon_id": 103,
    "to_digimon_id": 179,
    "level_required": 26,
    "stat_requirements": {
      "hp": 900
    },
    "dna_requirement": null
  },
  "146-281": {
    "id": 500,
    "from_digimon_id": 146,
    "to_digimon_id": 281,
    "level_required": 60,
    "stat_requirements": {
      "hp": 2000,
      "abi": 80,
      "atk": 250,
      "spd": 150
    },
    "dna_requirement": null
  },
  "146-218": {
    "id": 501,
    "from_digimon_id": 146,
    "to_digimon_id": 218,
    "level_required": 60,
    "stat_requirements": {
      "sp": 130,
      "abi": 40,
      "atk": 200,
      "spd": 100
    },
    "dna_requirement": null
  },
  "147-227": {
    "id": 502,
    "from_digimon_id": 147,
    "to_digimon_id": 227,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1200,
      "sp": 110,
      "abi": 40,
      "atk": 110,
      "int": 110
    },
    "dna_requirement": null
  },
  "147-271": {
    "id": 503,
    "from_digimon_id": 147,
    "to_digimon_id": 271,
    "level_required": 60,
    "stat_requirements": {
      "sp": 160,
      "abi": 80,
      "def": 120,
      "int": 200
    },
    "dna_requirement": null
  },
  "147-238": {
    "id": 506,
    "from_digimon_id": 147,
    "to_digimon_id": 238,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1300,
      "abi": 40,
      "atk": 110,
      "int": 110
    },
    "dna_requirement": null
  },
  "150-244": {
    "id": 510,
    "from_digimon_id": 150,
    "to_digimon_id": 244,
    "level_required": 55,
    "stat_requirements": {
      "abi": 40,
      "atk": 130,
      "def": 120,
      "int": 120
    },
    "dna_requirement": null
  },
  "152-289": {
    "id": 518,
    "from_digimon_id": 152,
    "to_digimon_id": 289,
    "level_required": 60,
    "stat_requirements": {
      "sp": 120,
      "abi": 80,
      "atk": 120,
      "int": 120
    },
    "dna_requirement": 214
  },
  "153-280": {
    "id": 522,
    "from_digimon_id": 153,
    "to_digimon_id": 280,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1100,
      "abi": 20,
      "def": 150,
      "int": 120
    },
    "dna_requirement": null
  },
  "154-240": {
    "id": 527,
    "from_digimon_id": 154,
    "to_digimon_id": 240,
    "level_required": 50,
    "stat_requirements": {
      "sp": 110,
      "abi": 20,
      "int": 140
    },
    "dna_requirement": null
  },
  "156-255": {
    "id": 531,
    "from_digimon_id": 156,
    "to_digimon_id": 255,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 150,
      "def": 140
    },
    "dna_requirement": null
  },
  "158-254": {
    "id": 535,
    "from_digimon_id": 158,
    "to_digimon_id": 254,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "def": 130,
      "spd": 130
    },
    "dna_requirement": null
  },
  "160-272": {
    "id": 539,
    "from_digimon_id": 160,
    "to_digimon_id": 272,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 130
    },
    "dna_requirement": null
  },
  "163-257": {
    "id": 543,
    "from_digimon_id": 163,
    "to_digimon_id": 257,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1400,
      "abi": 20,
      "atk": 150,
      "int": 120
    },
    "dna_requirement": null
  },
  "204-342": {
    "id": 914,
    "from_digimon_id": 204,
    "to_digimon_id": 342,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1800,
      "abi": 25,
      "atk": 180,
      "def": 150
    },
    "dna_requirement": null
  },
  "160-366": {
    "id": 940,
    "from_digimon_id": 160,
    "to_digimon_id": 366,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "def": 130,
      "spd": 120
    },
    "dna_requirement": null
  },
  "105-156": {
    "id": 383,
    "from_digimon_id": 105,
    "to_digimon_id": 156,
    "level_required": 26,
    "stat_requirements": {
      "hp": 800,
      "atk": 75,
      "def": 95
    },
    "dna_requirement": null
  },
  "106-151": {
    "id": 387,
    "from_digimon_id": 106,
    "to_digimon_id": 151,
    "level_required": 26,
    "stat_requirements": {
      "sp": 75,
      "def": 75,
      "spd": 65
    },
    "dna_requirement": null
  },
  "107-199": {
    "id": 391,
    "from_digimon_id": 107,
    "to_digimon_id": 199,
    "level_required": 26,
    "stat_requirements": {
      "atk": 75,
      "def": 80
    },
    "dna_requirement": null
  },
  "108-146": {
    "id": 395,
    "from_digimon_id": 108,
    "to_digimon_id": 146,
    "level_required": 30,
    "stat_requirements": {
      "atk": 95,
      "spd": 80
    },
    "dna_requirement": null
  },
  "111-143": {
    "id": 399,
    "from_digimon_id": 111,
    "to_digimon_id": 143,
    "level_required": 28,
    "stat_requirements": {
      "atk": 65,
      "int": 75,
      "spd": 85
    },
    "dna_requirement": null
  },
  "112-158": {
    "id": 404,
    "from_digimon_id": 112,
    "to_digimon_id": 158,
    "level_required": 28,
    "stat_requirements": {
      "def": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "114-201": {
    "id": 408,
    "from_digimon_id": 114,
    "to_digimon_id": 201,
    "level_required": 26,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "spd": 75
    },
    "dna_requirement": null
  },
  "115-166": {
    "id": 412,
    "from_digimon_id": 115,
    "to_digimon_id": 166,
    "level_required": 30,
    "stat_requirements": {
      "atk": 60,
      "int": 75,
      "spd": 75
    },
    "dna_requirement": 67
  },
  "116-147": {
    "id": 416,
    "from_digimon_id": 116,
    "to_digimon_id": 147,
    "level_required": 30,
    "stat_requirements": {
      "abi": 10,
      "atk": 70,
      "int": 90
    },
    "dna_requirement": null
  },
  "118-187": {
    "id": 420,
    "from_digimon_id": 118,
    "to_digimon_id": 187,
    "level_required": 26,
    "stat_requirements": {
      "hp": 850,
      "atk": 60,
      "int": 60
    },
    "dna_requirement": null
  },
  "119-181": {
    "id": 424,
    "from_digimon_id": 119,
    "to_digimon_id": 181,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "def": 75
    },
    "dna_requirement": null
  },
  "166-263": {
    "id": 551,
    "from_digimon_id": 166,
    "to_digimon_id": 263,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1200,
      "abi": 80,
      "atk": 140,
      "def": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  "167-234": {
    "id": 555,
    "from_digimon_id": 167,
    "to_digimon_id": 234,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1700,
      "abi": 80,
      "atk": 145,
      "def": 120
    },
    "dna_requirement": null
  },
  "120-167": {
    "id": 428,
    "from_digimon_id": 120,
    "to_digimon_id": 167,
    "level_required": 28,
    "stat_requirements": {
      "sp": 70,
      "atk": 70,
      "def": 80
    },
    "dna_requirement": null
  },
  "121-207": {
    "id": 432,
    "from_digimon_id": 121,
    "to_digimon_id": 207,
    "level_required": 26,
    "stat_requirements": {
      "hp": 600,
      "atk": 60
    },
    "dna_requirement": null
  },
  "122-208": {
    "id": 436,
    "from_digimon_id": 122,
    "to_digimon_id": 208,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "spd": 90
    },
    "dna_requirement": null
  },
  "124-187": {
    "id": 440,
    "from_digimon_id": 124,
    "to_digimon_id": 187,
    "level_required": 26,
    "stat_requirements": {
      "hp": 850,
      "atk": 60,
      "int": 60
    },
    "dna_requirement": null
  },
  "125-150": {
    "id": 445,
    "from_digimon_id": 125,
    "to_digimon_id": 150,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "spd": 95
    },
    "dna_requirement": null
  },
  "127-151": {
    "id": 449,
    "from_digimon_id": 127,
    "to_digimon_id": 151,
    "level_required": 26,
    "stat_requirements": {
      "sp": 75,
      "def": 75,
      "spd": 65
    },
    "dna_requirement": null
  },
  "128-163": {
    "id": 453,
    "from_digimon_id": 128,
    "to_digimon_id": 163,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "129-141": {
    "id": 457,
    "from_digimon_id": 129,
    "to_digimon_id": 141,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "def": 95
    },
    "dna_requirement": null
  },
  "130-188": {
    "id": 461,
    "from_digimon_id": 130,
    "to_digimon_id": 188,
    "level_required": 26,
    "stat_requirements": {
      "sp": 75,
      "int": 80,
      "spd": 80
    },
    "dna_requirement": null
  },
  "131-192": {
    "id": 465,
    "from_digimon_id": 131,
    "to_digimon_id": 192,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 80,
      "int": 70
    },
    "dna_requirement": null
  },
  "206-277": {
    "id": 654,
    "from_digimon_id": 206,
    "to_digimon_id": 277,
    "level_required": 45,
    "stat_requirements": {
      "abi": 20,
      "def": 150
    },
    "dna_requirement": null
  },
  "208-236": {
    "id": 658,
    "from_digimon_id": 208,
    "to_digimon_id": 236,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 135,
      "spd": 120
    },
    "dna_requirement": null
  },
  "208-331": {
    "id": 662,
    "from_digimon_id": 208,
    "to_digimon_id": 331,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 180
    },
    "dna_requirement": null
  },
  "170-279": {
    "id": 564,
    "from_digimon_id": 170,
    "to_digimon_id": 279,
    "level_required": 50,
    "stat_requirements": {
      "sp": 100,
      "abi": 20,
      "def": 120,
      "int": 145
    },
    "dna_requirement": null
  },
  "211-298": {
    "id": 671,
    "from_digimon_id": 211,
    "to_digimon_id": 298,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "def": 135,
      "spd": 125
    },
    "dna_requirement": null
  },
  "213-322": {
    "id": 675,
    "from_digimon_id": 213,
    "to_digimon_id": 322,
    "level_required": 70,
    "stat_requirements": {
      "hp": 1400,
      "sp": 160,
      "abi": 100,
      "atk": 130,
      "int": 250,
      "spd": 170
    },
    "dna_requirement": null
  },
  "215-292": {
    "id": 679,
    "from_digimon_id": 215,
    "to_digimon_id": 292,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  "216-291": {
    "id": 683,
    "from_digimon_id": 216,
    "to_digimon_id": 291,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 150,
      "spd": 140
    },
    "dna_requirement": null
  },
  "217-273": {
    "id": 687,
    "from_digimon_id": 217,
    "to_digimon_id": 273,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "int": 160,
      "spd": 110
    },
    "dna_requirement": null
  },
  "222-223": {
    "id": 691,
    "from_digimon_id": 222,
    "to_digimon_id": 223,
    "level_required": 0,
    "stat_requirements": {},
    "dna_requirement": null
  },
  "260-310": {
    "id": 695,
    "from_digimon_id": 260,
    "to_digimon_id": 310,
    "level_required": 70,
    "stat_requirements": {
      "hp": 2000,
      "sp": 140,
      "abi": 100,
      "atk": 290
    },
    "dna_requirement": null
  },
  "276-316": {
    "id": 703,
    "from_digimon_id": 276,
    "to_digimon_id": 316,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1500,
      "abi": 40,
      "atk": 150,
      "def": 200
    },
    "dna_requirement": 298
  },
  "292-293": {
    "id": 707,
    "from_digimon_id": 292,
    "to_digimon_id": 293,
    "level_required": 60,
    "stat_requirements": {
      "abi": 30,
      "atk": 200,
      "spd": 200
    },
    "dna_requirement": null
  },
  "174-251": {
    "id": 568,
    "from_digimon_id": 174,
    "to_digimon_id": 251,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "def": 140,
      "int": 120,
      "spd": 150
    },
    "dna_requirement": null
  },
  "299-332": {
    "id": 712,
    "from_digimon_id": 299,
    "to_digimon_id": 332,
    "level_required": 99,
    "stat_requirements": {
      "abi": 120
    },
    "dna_requirement": null
  },
  "255-317": {
    "id": 716,
    "from_digimon_id": 255,
    "to_digimon_id": 317,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 255
    },
    "dna_requirement": 272
  },
  "20-137": {
    "id": 720,
    "from_digimon_id": 20,
    "to_digimon_id": 137,
    "level_required": 16,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  "215-343": {
    "id": 915,
    "from_digimon_id": 215,
    "to_digimon_id": 343,
    "level_required": 55,
    "stat_requirements": {
      "abi": 25,
      "atk": 190,
      "def": 130,
      "int": 100
    },
    "dna_requirement": null
  },
  "196-366": {
    "id": 941,
    "from_digimon_id": 196,
    "to_digimon_id": 366,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "def": 130,
      "spd": 120
    },
    "dna_requirement": null
  },
  "177-286": {
    "id": 576,
    "from_digimon_id": 177,
    "to_digimon_id": 286,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 145,
      "def": 100
    },
    "dna_requirement": null
  },
  "179-235": {
    "id": 580,
    "from_digimon_id": 179,
    "to_digimon_id": 235,
    "level_required": 45,
    "stat_requirements": {
      "abi": 20,
      "atk": 110,
      "def": 130,
      "spd": 100
    },
    "dna_requirement": null
  },
  "182-241": {
    "id": 584,
    "from_digimon_id": 182,
    "to_digimon_id": 241,
    "level_required": 60,
    "stat_requirements": {
      "sp": 110,
      "abi": 80,
      "def": 180,
      "int": 140
    },
    "dna_requirement": null
  },
  "183-294": {
    "id": 589,
    "from_digimon_id": 183,
    "to_digimon_id": 294,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 130,
      "def": 130
    },
    "dna_requirement": null
  },
  "185-272": {
    "id": 593,
    "from_digimon_id": 185,
    "to_digimon_id": 272,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 130
    },
    "dna_requirement": null
  },
  "187-307": {
    "id": 597,
    "from_digimon_id": 187,
    "to_digimon_id": 307,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 120
    },
    "dna_requirement": null
  },
  "192-271": {
    "id": 605,
    "from_digimon_id": 192,
    "to_digimon_id": 271,
    "level_required": 60,
    "stat_requirements": {
      "sp": 160,
      "abi": 80,
      "def": 120,
      "int": 200
    },
    "dna_requirement": null
  },
  "193-269": {
    "id": 609,
    "from_digimon_id": 193,
    "to_digimon_id": 269,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 100,
      "def": 130,
      "int": 100
    },
    "dna_requirement": null
  },
  "194-299": {
    "id": 613,
    "from_digimon_id": 194,
    "to_digimon_id": 299,
    "level_required": 50,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "def": 120,
      "int": 120
    },
    "dna_requirement": null
  },
  "195-306": {
    "id": 617,
    "from_digimon_id": 195,
    "to_digimon_id": 306,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 120,
      "int": 135,
      "spd": 150
    },
    "dna_requirement": null
  },
  "198-272": {
    "id": 621,
    "from_digimon_id": 198,
    "to_digimon_id": 272,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 130
    },
    "dna_requirement": null
  },
  "199-274": {
    "id": 625,
    "from_digimon_id": 199,
    "to_digimon_id": 274,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "def": 130,
      "int": 130
    },
    "dna_requirement": null
  },
  "36-329": {
    "id": 724,
    "from_digimon_id": 36,
    "to_digimon_id": 329,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "def": 40
    },
    "dna_requirement": null
  },
  "38-128": {
    "id": 728,
    "from_digimon_id": 38,
    "to_digimon_id": 128,
    "level_required": 16,
    "stat_requirements": {
      "int": 40
    },
    "dna_requirement": null
  },
  "42-335": {
    "id": 732,
    "from_digimon_id": 42,
    "to_digimon_id": 335,
    "level_required": 14,
    "stat_requirements": {
      "sp": 40,
      "spd": 50
    },
    "dna_requirement": null
  },
  "43-329": {
    "id": 737,
    "from_digimon_id": 43,
    "to_digimon_id": 329,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "def": 40
    },
    "dna_requirement": null
  },
  "200-268": {
    "id": 630,
    "from_digimon_id": 200,
    "to_digimon_id": 268,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1000,
      "sp": 100,
      "abi": 20,
      "int": 130
    },
    "dna_requirement": null
  },
  "202-301": {
    "id": 638,
    "from_digimon_id": 202,
    "to_digimon_id": 301,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 180,
      "def": 150
    },
    "dna_requirement": null
  },
  "203-230": {
    "id": 642,
    "from_digimon_id": 203,
    "to_digimon_id": 230,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 100,
      "spd": 100
    },
    "dna_requirement": null
  },
  "204-276": {
    "id": 646,
    "from_digimon_id": 204,
    "to_digimon_id": 276,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1800,
      "abi": 20,
      "atk": 140,
      "def": 140
    },
    "dna_requirement": null
  },
  "205-301": {
    "id": 650,
    "from_digimon_id": 205,
    "to_digimon_id": 301,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 180,
      "def": 150
    },
    "dna_requirement": null
  },
  "61-138": {
    "id": 753,
    "from_digimon_id": 61,
    "to_digimon_id": 138,
    "level_required": 15,
    "stat_requirements": {
      "atk": 35,
      "spd": 40
    },
    "dna_requirement": null
  },
  "75-200": {
    "id": 770,
    "from_digimon_id": 75,
    "to_digimon_id": 200,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "sp": 70,
      "int": 70
    },
    "dna_requirement": null
  },
  "80-178": {
    "id": 774,
    "from_digimon_id": 80,
    "to_digimon_id": 178,
    "level_required": 40,
    "stat_requirements": {
      "hp": 800,
      "atk": 80,
      "def": 80
    },
    "dna_requirement": null
  },
  "173-221": {
    "id": 860,
    "from_digimon_id": 173,
    "to_digimon_id": 221,
    "level_required": 45,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 120
    },
    "dna_requirement": null
  },
  "178-264": {
    "id": 864,
    "from_digimon_id": 178,
    "to_digimon_id": 264,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 140,
      "def": 120
    },
    "dna_requirement": null
  },
  "180-237": {
    "id": 868,
    "from_digimon_id": 180,
    "to_digimon_id": 237,
    "level_required": 45,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 120,
      "def": 120
    },
    "dna_requirement": null
  },
  "190-227": {
    "id": 876,
    "from_digimon_id": 190,
    "to_digimon_id": 227,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1200,
      "sp": 110,
      "abi": 40,
      "atk": 110,
      "int": 110
    },
    "dna_requirement": null
  },
  "196-234": {
    "id": 880,
    "from_digimon_id": 196,
    "to_digimon_id": 234,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1700,
      "abi": 80,
      "atk": 145,
      "def": 120
    },
    "dna_requirement": null
  },
  "197-273": {
    "id": 884,
    "from_digimon_id": 197,
    "to_digimon_id": 273,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "int": 160,
      "spd": 110
    },
    "dna_requirement": null
  },
  "252-314": {
    "id": 888,
    "from_digimon_id": 252,
    "to_digimon_id": 314,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1650,
      "abi": 100,
      "atk": 150,
      "spd": 150
    },
    "dna_requirement": 278
  },
  "326-327": {
    "id": 893,
    "from_digimon_id": 326,
    "to_digimon_id": 327,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 130,
      "def": 130,
      "spd": 120
    },
    "dna_requirement": null
  },
  "333-138": {
    "id": 897,
    "from_digimon_id": 333,
    "to_digimon_id": 138,
    "level_required": 15,
    "stat_requirements": {
      "atk": 35,
      "spd": 40
    },
    "dna_requirement": null
  },
  "328-329": {
    "id": 901,
    "from_digimon_id": 328,
    "to_digimon_id": 329,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "def": 40
    },
    "dna_requirement": null
  },
  "329-158": {
    "id": 905,
    "from_digimon_id": 329,
    "to_digimon_id": 158,
    "level_required": 28,
    "stat_requirements": {
      "def": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "330-244": {
    "id": 909,
    "from_digimon_id": 330,
    "to_digimon_id": 244,
    "level_required": 55,
    "stat_requirements": {
      "abi": 40,
      "atk": 130,
      "def": 120,
      "int": 120
    },
    "dna_requirement": null
  },
  "345-346": {
    "id": 916,
    "from_digimon_id": 345,
    "to_digimon_id": 346,
    "level_required": 16,
    "stat_requirements": {
      "atk": 60
    },
    "dna_requirement": null
  },
  "365-245": {
    "id": 942,
    "from_digimon_id": 365,
    "to_digimon_id": 245,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 145,
      "spd": 120
    },
    "dna_requirement": null
  },
  "1-13": {
    "id": 2,
    "from_digimon_id": 1,
    "to_digimon_id": 13,
    "level_required": 5,
    "stat_requirements": {},
    "dna_requirement": null
  },
  "1-6": {
    "id": 3,
    "from_digimon_id": 1,
    "to_digimon_id": 6,
    "level_required": 8,
    "stat_requirements": {
      "abi": 5,
      "atk": 55
    },
    "dna_requirement": null
  },
  "52-118": {
    "id": 742,
    "from_digimon_id": 52,
    "to_digimon_id": 118,
    "level_required": 16,
    "stat_requirements": {
      "hp": 300,
      "def": 30
    },
    "dna_requirement": null
  },
  "57-129": {
    "id": 746,
    "from_digimon_id": 57,
    "to_digimon_id": 129,
    "level_required": 12,
    "stat_requirements": {
      "hp": 300
    },
    "dna_requirement": null
  },
  "58-89": {
    "id": 750,
    "from_digimon_id": 58,
    "to_digimon_id": 89,
    "level_required": 16,
    "stat_requirements": {
      "hp": 150,
      "atk": 40
    },
    "dna_requirement": null
  },
  "61-335": {
    "id": 754,
    "from_digimon_id": 61,
    "to_digimon_id": 335,
    "level_required": 14,
    "stat_requirements": {
      "sp": 40,
      "spd": 50
    },
    "dna_requirement": null
  },
  "66-170": {
    "id": 758,
    "from_digimon_id": 66,
    "to_digimon_id": 170,
    "level_required": 30,
    "stat_requirements": {
      "hp": 800,
      "atk": 75
    },
    "dna_requirement": null
  },
  "68-209": {
    "id": 762,
    "from_digimon_id": 68,
    "to_digimon_id": 209,
    "level_required": 30,
    "stat_requirements": {
      "hp": 350,
      "atk": 100,
      "spd": 75
    },
    "dna_requirement": null
  },
  "73-155": {
    "id": 766,
    "from_digimon_id": 73,
    "to_digimon_id": 155,
    "level_required": 30,
    "stat_requirements": {
      "hp": 300,
      "atk": 100,
      "spd": 85
    },
    "dna_requirement": null
  },
  "96-148": {
    "id": 778,
    "from_digimon_id": 96,
    "to_digimon_id": 148,
    "level_required": 30,
    "stat_requirements": {
      "abi": 10,
      "atk": 80,
      "spd": 95
    },
    "dna_requirement": null
  },
  "97-180": {
    "id": 782,
    "from_digimon_id": 97,
    "to_digimon_id": 180,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 75
    },
    "dna_requirement": null
  },
  "99-187": {
    "id": 786,
    "from_digimon_id": 99,
    "to_digimon_id": 187,
    "level_required": 26,
    "stat_requirements": {
      "hp": 850,
      "atk": 60,
      "int": 60
    },
    "dna_requirement": null
  },
  "101-216": {
    "id": 790,
    "from_digimon_id": 101,
    "to_digimon_id": 216,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 90,
      "spd": 70
    },
    "dna_requirement": null
  },
  "104-330": {
    "id": 794,
    "from_digimon_id": 104,
    "to_digimon_id": 330,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "def": 75
    },
    "dna_requirement": null
  },
  "110-155": {
    "id": 798,
    "from_digimon_id": 110,
    "to_digimon_id": 155,
    "level_required": 30,
    "stat_requirements": {
      "hp": 300,
      "atk": 100,
      "spd": 85
    },
    "dna_requirement": null
  },
  "113-145": {
    "id": 802,
    "from_digimon_id": 113,
    "to_digimon_id": 145,
    "level_required": 26,
    "stat_requirements": {
      "def": 110
    },
    "dna_requirement": null
  },
  "117-207": {
    "id": 806,
    "from_digimon_id": 117,
    "to_digimon_id": 207,
    "level_required": 26,
    "stat_requirements": {
      "hp": 600,
      "atk": 60
    },
    "dna_requirement": null
  },
  "126-158": {
    "id": 811,
    "from_digimon_id": 126,
    "to_digimon_id": 158,
    "level_required": 28,
    "stat_requirements": {
      "def": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "132-205": {
    "id": 815,
    "from_digimon_id": 132,
    "to_digimon_id": 205,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 95
    },
    "dna_requirement": null
  },
  "135-161": {
    "id": 819,
    "from_digimon_id": 135,
    "to_digimon_id": 161,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 80,
      "spd": 70
    },
    "dna_requirement": null
  },
  "136-169": {
    "id": 823,
    "from_digimon_id": 136,
    "to_digimon_id": 169,
    "level_required": 28,
    "stat_requirements": {
      "atk": 80,
      "int": 70
    },
    "dna_requirement": null
  },
  "136-204": {
    "id": 827,
    "from_digimon_id": 136,
    "to_digimon_id": 204,
    "level_required": 30,
    "stat_requirements": {
      "hp": 450,
      "atk": 110
    },
    "dna_requirement": null
  },
  "142-218": {
    "id": 831,
    "from_digimon_id": 142,
    "to_digimon_id": 218,
    "level_required": 60,
    "stat_requirements": {
      "sp": 130,
      "abi": 40,
      "atk": 200,
      "spd": 100
    },
    "dna_requirement": null
  },
  "148-220": {
    "id": 835,
    "from_digimon_id": 148,
    "to_digimon_id": 220,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 120,
      "spd": 145
    },
    "dna_requirement": null
  },
  "157-250": {
    "id": 839,
    "from_digimon_id": 157,
    "to_digimon_id": 250,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1000,
      "abi": 20,
      "atk": 130,
      "def": 110
    },
    "dna_requirement": null
  },
  "161-219": {
    "id": 847,
    "from_digimon_id": 161,
    "to_digimon_id": 219,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 150,
      "def": 170,
      "int": 135
    },
    "dna_requirement": null
  },
  "162-259": {
    "id": 852,
    "from_digimon_id": 162,
    "to_digimon_id": 259,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "def": 120,
      "int": 130,
      "spd": 130
    },
    "dna_requirement": null
  },
  "171-252": {
    "id": 856,
    "from_digimon_id": 171,
    "to_digimon_id": 252,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 130,
      "spd": 130
    },
    "dna_requirement": null
  },
  "2-16": {
    "id": 6,
    "from_digimon_id": 2,
    "to_digimon_id": 16,
    "level_required": 3,
    "stat_requirements": {
      "def": 15
    },
    "dna_requirement": null
  },
  "3-12": {
    "id": 8,
    "from_digimon_id": 3,
    "to_digimon_id": 12,
    "level_required": 3,
    "stat_requirements": {
      "int": 10
    },
    "dna_requirement": null
  },
  "24-104": {
    "id": 96,
    "from_digimon_id": 24,
    "to_digimon_id": 104,
    "level_required": 14,
    "stat_requirements": {
      "hp": 300,
      "spd": 30
    },
    "dna_requirement": null
  },
  "25-78": {
    "id": 98,
    "from_digimon_id": 25,
    "to_digimon_id": 78,
    "level_required": 14,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  "25-84": {
    "id": 100,
    "from_digimon_id": 25,
    "to_digimon_id": 84,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "spd": 40
    },
    "dna_requirement": null
  },
  "25-137": {
    "id": 102,
    "from_digimon_id": 25,
    "to_digimon_id": 137,
    "level_required": 16,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  "26-81": {
    "id": 104,
    "from_digimon_id": 26,
    "to_digimon_id": 81,
    "level_required": 15,
    "stat_requirements": {
      "spd": 55
    },
    "dna_requirement": null
  },
  "26-89": {
    "id": 106,
    "from_digimon_id": 26,
    "to_digimon_id": 89,
    "level_required": 16,
    "stat_requirements": {
      "hp": 150,
      "atk": 40
    },
    "dna_requirement": null
  },
  "26-120": {
    "id": 108,
    "from_digimon_id": 26,
    "to_digimon_id": 120,
    "level_required": 12,
    "stat_requirements": {
      "atk": 40,
      "def": 40
    },
    "dna_requirement": null
  },
  "27-85": {
    "id": 110,
    "from_digimon_id": 27,
    "to_digimon_id": 85,
    "level_required": 15,
    "stat_requirements": {
      "spd": 50
    },
    "dna_requirement": null
  },
  "27-121": {
    "id": 112,
    "from_digimon_id": 27,
    "to_digimon_id": 121,
    "level_required": 12,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  "27-133": {
    "id": 114,
    "from_digimon_id": 27,
    "to_digimon_id": 133,
    "level_required": 14,
    "stat_requirements": {
      "hp": 250,
      "atk": 30
    },
    "dna_requirement": null
  },
  "346-347": {
    "id": 917,
    "from_digimon_id": 346,
    "to_digimon_id": 347,
    "level_required": 30,
    "stat_requirements": {
      "hp": 385,
      "atk": 110
    },
    "dna_requirement": null
  },
  "365-292": {
    "id": 943,
    "from_digimon_id": 365,
    "to_digimon_id": 292,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  "4-17": {
    "id": 10,
    "from_digimon_id": 4,
    "to_digimon_id": 17,
    "level_required": 5,
    "stat_requirements": {},
    "dna_requirement": null
  },
  "5-11": {
    "id": 11,
    "from_digimon_id": 5,
    "to_digimon_id": 11,
    "level_required": 5,
    "stat_requirements": {},
    "dna_requirement": null
  },
  "7-41": {
    "id": 15,
    "from_digimon_id": 7,
    "to_digimon_id": 41,
    "level_required": 8,
    "stat_requirements": {
      "hp": 75,
      "def": 20
    },
    "dna_requirement": null
  },
  "8-59": {
    "id": 19,
    "from_digimon_id": 8,
    "to_digimon_id": 59,
    "level_required": 9,
    "stat_requirements": {
      "hp": 75
    },
    "dna_requirement": null
  },
  "9-27": {
    "id": 23,
    "from_digimon_id": 9,
    "to_digimon_id": 27,
    "level_required": 7,
    "stat_requirements": {
      "hp": 75,
      "atk": 20,
      "spd": 20
    },
    "dna_requirement": null
  },
  "9-36": {
    "id": 27,
    "from_digimon_id": 9,
    "to_digimon_id": 36,
    "level_required": 10,
    "stat_requirements": {
      "atk": 20,
      "spd": 20
    },
    "dna_requirement": null
  },
  "10-49": {
    "id": 31,
    "from_digimon_id": 10,
    "to_digimon_id": 49,
    "level_required": 8,
    "stat_requirements": {
      "spd": 30
    },
    "dna_requirement": null
  },
  "11-46": {
    "id": 33,
    "from_digimon_id": 11,
    "to_digimon_id": 46,
    "level_required": 7,
    "stat_requirements": {
      "int": 20,
      "spd": 20
    },
    "dna_requirement": null
  },
  "11-56": {
    "id": 35,
    "from_digimon_id": 11,
    "to_digimon_id": 56,
    "level_required": 7,
    "stat_requirements": {
      "spd": 30
    },
    "dna_requirement": null
  },
  "11-333": {
    "id": 37,
    "from_digimon_id": 11,
    "to_digimon_id": 333,
    "level_required": 7,
    "stat_requirements": {
      "sp": 20,
      "int": 30
    },
    "dna_requirement": null
  },
  "12-39": {
    "id": 39,
    "from_digimon_id": 12,
    "to_digimon_id": 39,
    "level_required": 8,
    "stat_requirements": {
      "spd": 30
    },
    "dna_requirement": null
  },
  "12-61": {
    "id": 41,
    "from_digimon_id": 12,
    "to_digimon_id": 61,
    "level_required": 8,
    "stat_requirements": {
      "sp": 30,
      "int": 20
    },
    "dna_requirement": null
  },
  "13-26": {
    "id": 43,
    "from_digimon_id": 13,
    "to_digimon_id": 26,
    "level_required": 9,
    "stat_requirements": {
      "atk": 15,
      "spd": 20
    },
    "dna_requirement": null
  },
  "13-38": {
    "id": 45,
    "from_digimon_id": 13,
    "to_digimon_id": 38,
    "level_required": 6,
    "stat_requirements": {
      "spd": 30
    },
    "dna_requirement": null
  },
  "14-50": {
    "id": 47,
    "from_digimon_id": 14,
    "to_digimon_id": 50,
    "level_required": 8,
    "stat_requirements": {
      "int": 20,
      "spd": 20
    },
    "dna_requirement": null
  },
  "14-57": {
    "id": 49,
    "from_digimon_id": 14,
    "to_digimon_id": 57,
    "level_required": 8,
    "stat_requirements": {
      "hp": 75,
      "def": 10
    },
    "dna_requirement": null
  },
  "15-34": {
    "id": 51,
    "from_digimon_id": 15,
    "to_digimon_id": 34,
    "level_required": 8,
    "stat_requirements": {
      "hp": 100
    },
    "dna_requirement": null
  },
  "15-55": {
    "id": 53,
    "from_digimon_id": 15,
    "to_digimon_id": 55,
    "level_required": 8,
    "stat_requirements": {
      "int": 40
    },
    "dna_requirement": null
  },
  "16-37": {
    "id": 55,
    "from_digimon_id": 16,
    "to_digimon_id": 37,
    "level_required": 6,
    "stat_requirements": {
      "hp": 75,
      "def": 25
    },
    "dna_requirement": null
  },
  "16-45": {
    "id": 57,
    "from_digimon_id": 16,
    "to_digimon_id": 45,
    "level_required": 7,
    "stat_requirements": {
      "hp": 75,
      "def": 30
    },
    "dna_requirement": null
  },
  "17-30": {
    "id": 59,
    "from_digimon_id": 17,
    "to_digimon_id": 30,
    "level_required": 8,
    "stat_requirements": {
      "sp": 20,
      "int": 20
    },
    "dna_requirement": null
  },
  "17-328": {
    "id": 61,
    "from_digimon_id": 17,
    "to_digimon_id": 328,
    "level_required": 8,
    "stat_requirements": {
      "atk": 30,
      "def": 30
    },
    "dna_requirement": null
  },
  "18-105": {
    "id": 63,
    "from_digimon_id": 18,
    "to_digimon_id": 105,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "atk": 50
    },
    "dna_requirement": null
  },
  "18-114": {
    "id": 65,
    "from_digimon_id": 18,
    "to_digimon_id": 114,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "atk": 40
    },
    "dna_requirement": null
  },
  "18-68": {
    "id": 67,
    "from_digimon_id": 18,
    "to_digimon_id": 68,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "atk": 50
    },
    "dna_requirement": null
  },
  "19-91": {
    "id": 69,
    "from_digimon_id": 19,
    "to_digimon_id": 91,
    "level_required": 16,
    "stat_requirements": {
      "hp": 150,
      "atk": 50
    },
    "dna_requirement": null
  },
  "19-112": {
    "id": 71,
    "from_digimon_id": 19,
    "to_digimon_id": 112,
    "level_required": 14,
    "stat_requirements": {
      "def": 55
    },
    "dna_requirement": null
  },
  "19-132": {
    "id": 73,
    "from_digimon_id": 19,
    "to_digimon_id": 132,
    "level_required": 14,
    "stat_requirements": {
      "atk": 55,
      "def": 55
    },
    "dna_requirement": null
  },
  "21-100": {
    "id": 77,
    "from_digimon_id": 21,
    "to_digimon_id": 100,
    "level_required": 14,
    "stat_requirements": {
      "atk": 30,
      "def": 40
    },
    "dna_requirement": null
  },
  "22-72": {
    "id": 81,
    "from_digimon_id": 22,
    "to_digimon_id": 72,
    "level_required": 14,
    "stat_requirements": {
      "sp": 35,
      "int": 55
    },
    "dna_requirement": null
  },
  "22-124": {
    "id": 84,
    "from_digimon_id": 22,
    "to_digimon_id": 124,
    "level_required": 13,
    "stat_requirements": {
      "sp": 40,
      "int": 30
    },
    "dna_requirement": null
  },
  "23-95": {
    "id": 88,
    "from_digimon_id": 23,
    "to_digimon_id": 95,
    "level_required": 12,
    "stat_requirements": {
      "hp": 130,
      "sp": 25,
      "def": 40
    },
    "dna_requirement": null
  },
  "23-120": {
    "id": 90,
    "from_digimon_id": 23,
    "to_digimon_id": 120,
    "level_required": 12,
    "stat_requirements": {
      "atk": 40,
      "def": 40
    },
    "dna_requirement": null
  },
  "24-83": {
    "id": 92,
    "from_digimon_id": 24,
    "to_digimon_id": 83,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 55
    },
    "dna_requirement": null
  },
  "24-103": {
    "id": 94,
    "from_digimon_id": 24,
    "to_digimon_id": 103,
    "level_required": 14,
    "stat_requirements": {
      "def": 30,
      "int": 40
    },
    "dna_requirement": null
  },
  "5-15": {
    "id": 12,
    "from_digimon_id": 5,
    "to_digimon_id": 15,
    "level_required": 3,
    "stat_requirements": {
      "int": 15
    },
    "dna_requirement": null
  },
  "7-29": {
    "id": 14,
    "from_digimon_id": 7,
    "to_digimon_id": 29,
    "level_required": 7,
    "stat_requirements": {
      "atk": 30,
      "spd": 20
    },
    "dna_requirement": null
  },
  "7-47": {
    "id": 16,
    "from_digimon_id": 7,
    "to_digimon_id": 47,
    "level_required": 9,
    "stat_requirements": {
      "abi": 20,
      "atk": 20
    },
    "dna_requirement": null
  },
  "29-91": {
    "id": 123,
    "from_digimon_id": 29,
    "to_digimon_id": 91,
    "level_required": 16,
    "stat_requirements": {
      "hp": 150,
      "atk": 50
    },
    "dna_requirement": null
  },
  "29-131": {
    "id": 125,
    "from_digimon_id": 29,
    "to_digimon_id": 131,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40
    },
    "dna_requirement": null
  },
  "30-77": {
    "id": 127,
    "from_digimon_id": 30,
    "to_digimon_id": 77,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "int": 40
    },
    "dna_requirement": null
  },
  "30-130": {
    "id": 129,
    "from_digimon_id": 30,
    "to_digimon_id": 130,
    "level_required": 14,
    "stat_requirements": {
      "spd": 50
    },
    "dna_requirement": null
  },
  "30-73": {
    "id": 131,
    "from_digimon_id": 30,
    "to_digimon_id": 73,
    "level_required": 15,
    "stat_requirements": {
      "hp": 45,
      "spd": 55
    },
    "dna_requirement": null
  },
  "31-89": {
    "id": 133,
    "from_digimon_id": 31,
    "to_digimon_id": 89,
    "level_required": 16,
    "stat_requirements": {
      "hp": 150,
      "atk": 40
    },
    "dna_requirement": null
  },
  "32-70": {
    "id": 137,
    "from_digimon_id": 32,
    "to_digimon_id": 70,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  "32-107": {
    "id": 139,
    "from_digimon_id": 32,
    "to_digimon_id": 107,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 35
    },
    "dna_requirement": null
  },
  "32-66": {
    "id": 141,
    "from_digimon_id": 32,
    "to_digimon_id": 66,
    "level_required": 15,
    "stat_requirements": {
      "hp": 110,
      "def": 50
    },
    "dna_requirement": null
  },
  "347-348": {
    "id": 918,
    "from_digimon_id": 347,
    "to_digimon_id": 348,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1870,
      "abi": 20,
      "atk": 175,
      "def": 140
    },
    "dna_requirement": null
  },
  "366-367": {
    "id": 944,
    "from_digimon_id": 366,
    "to_digimon_id": 367,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 180,
      "int": 180,
      "spd": 170
    },
    "dna_requirement": 259
  },
  "7-326": {
    "id": 18,
    "from_digimon_id": 7,
    "to_digimon_id": 326,
    "level_required": 8,
    "stat_requirements": {
      "atk": 30,
      "spd": 20
    },
    "dna_requirement": null
  },
  "8-48": {
    "id": 20,
    "from_digimon_id": 8,
    "to_digimon_id": 48,
    "level_required": 8,
    "stat_requirements": {
      "hp": 100
    },
    "dna_requirement": null
  },
  "8-52": {
    "id": 22,
    "from_digimon_id": 8,
    "to_digimon_id": 52,
    "level_required": 6,
    "stat_requirements": {
      "spd": 30
    },
    "dna_requirement": null
  },
  "9-28": {
    "id": 24,
    "from_digimon_id": 9,
    "to_digimon_id": 28,
    "level_required": 6,
    "stat_requirements": {
      "hp": 80,
      "atk": 30
    },
    "dna_requirement": null
  },
  "9-53": {
    "id": 26,
    "from_digimon_id": 9,
    "to_digimon_id": 53,
    "level_required": 6,
    "stat_requirements": {
      "atk": 20,
      "spd": 20
    },
    "dna_requirement": null
  },
  "9-58": {
    "id": 28,
    "from_digimon_id": 9,
    "to_digimon_id": 58,
    "level_required": 8,
    "stat_requirements": {
      "atk": 35
    },
    "dna_requirement": null
  },
  "10-31": {
    "id": 30,
    "from_digimon_id": 10,
    "to_digimon_id": 31,
    "level_required": 9,
    "stat_requirements": {
      "atk": 20,
      "spd": 20
    },
    "dna_requirement": null
  },
  "10-42": {
    "id": 32,
    "from_digimon_id": 10,
    "to_digimon_id": 42,
    "level_required": 8,
    "stat_requirements": {
      "atk": 30,
      "spd": 20
    },
    "dna_requirement": null
  },
  "11-60": {
    "id": 36,
    "from_digimon_id": 11,
    "to_digimon_id": 60,
    "level_required": 30,
    "stat_requirements": {
      "sp": 80,
      "abi": 80,
      "int": 130
    },
    "dna_requirement": null
  },
  "12-54": {
    "id": 40,
    "from_digimon_id": 12,
    "to_digimon_id": 54,
    "level_required": 7,
    "stat_requirements": {
      "sp": 20,
      "int": 20
    },
    "dna_requirement": null
  },
  "13-63": {
    "id": 44,
    "from_digimon_id": 13,
    "to_digimon_id": 63,
    "level_required": 8,
    "stat_requirements": {
      "atk": 15,
      "int": 20
    },
    "dna_requirement": null
  },
  "14-64": {
    "id": 48,
    "from_digimon_id": 14,
    "to_digimon_id": 64,
    "level_required": 8,
    "stat_requirements": {
      "def": 20
    },
    "dna_requirement": null
  },
  "15-35": {
    "id": 52,
    "from_digimon_id": 15,
    "to_digimon_id": 35,
    "level_required": 7,
    "stat_requirements": {
      "def": 15,
      "int": 20
    },
    "dna_requirement": null
  },
  "16-40": {
    "id": 56,
    "from_digimon_id": 16,
    "to_digimon_id": 40,
    "level_required": 9,
    "stat_requirements": {
      "def": 20
    },
    "dna_requirement": null
  },
  "17-44": {
    "id": 60,
    "from_digimon_id": 17,
    "to_digimon_id": 44,
    "level_required": 8,
    "stat_requirements": {
      "atk": 20,
      "spd": 30
    },
    "dna_requirement": null
  },
  "18-106": {
    "id": 64,
    "from_digimon_id": 18,
    "to_digimon_id": 106,
    "level_required": 12,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  "19-88": {
    "id": 68,
    "from_digimon_id": 19,
    "to_digimon_id": 88,
    "level_required": 15,
    "stat_requirements": {
      "atk": 50,
      "spd": 20
    },
    "dna_requirement": null
  },
  "19-114": {
    "id": 72,
    "from_digimon_id": 19,
    "to_digimon_id": 114,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "atk": 40
    },
    "dna_requirement": null
  },
  "21-98": {
    "id": 76,
    "from_digimon_id": 21,
    "to_digimon_id": 98,
    "level_required": 18,
    "stat_requirements": {
      "abi": 5
    },
    "dna_requirement": null
  },
  "21-112": {
    "id": 78,
    "from_digimon_id": 21,
    "to_digimon_id": 112,
    "level_required": 14,
    "stat_requirements": {
      "def": 55
    },
    "dna_requirement": null
  },
  "22-65": {
    "id": 80,
    "from_digimon_id": 22,
    "to_digimon_id": 65,
    "level_required": 15,
    "stat_requirements": {
      "atk": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  "22-78": {
    "id": 82,
    "from_digimon_id": 22,
    "to_digimon_id": 78,
    "level_required": 14,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  "22-128": {
    "id": 85,
    "from_digimon_id": 22,
    "to_digimon_id": 128,
    "level_required": 16,
    "stat_requirements": {
      "int": 40
    },
    "dna_requirement": null
  },
  "23-106": {
    "id": 89,
    "from_digimon_id": 23,
    "to_digimon_id": 106,
    "level_required": 12,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  "24-94": {
    "id": 93,
    "from_digimon_id": 24,
    "to_digimon_id": 94,
    "level_required": 14,
    "stat_requirements": {
      "sp": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  "24-136": {
    "id": 97,
    "from_digimon_id": 24,
    "to_digimon_id": 136,
    "level_required": 12,
    "stat_requirements": {
      "hp": 500
    },
    "dna_requirement": null
  },
  "25-118": {
    "id": 101,
    "from_digimon_id": 25,
    "to_digimon_id": 118,
    "level_required": 16,
    "stat_requirements": {
      "hp": 300,
      "def": 30
    },
    "dna_requirement": null
  },
  "26-86": {
    "id": 105,
    "from_digimon_id": 26,
    "to_digimon_id": 86,
    "level_required": 15,
    "stat_requirements": {
      "atk": 35,
      "spd": 50
    },
    "dna_requirement": null
  },
  "26-137": {
    "id": 109,
    "from_digimon_id": 26,
    "to_digimon_id": 137,
    "level_required": 16,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  "27-125": {
    "id": 113,
    "from_digimon_id": 27,
    "to_digimon_id": 125,
    "level_required": 16,
    "stat_requirements": {
      "atk": 40,
      "spd": 35
    },
    "dna_requirement": null
  },
  "27-73": {
    "id": 115,
    "from_digimon_id": 27,
    "to_digimon_id": 73,
    "level_required": 15,
    "stat_requirements": {
      "hp": 45,
      "spd": 55
    },
    "dna_requirement": null
  },
  "28-129": {
    "id": 117,
    "from_digimon_id": 28,
    "to_digimon_id": 129,
    "level_required": 12,
    "stat_requirements": {
      "hp": 300
    },
    "dna_requirement": null
  },
  "28-139": {
    "id": 119,
    "from_digimon_id": 28,
    "to_digimon_id": 139,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "spd": 40
    },
    "dna_requirement": null
  },
  "29-105": {
    "id": 121,
    "from_digimon_id": 29,
    "to_digimon_id": 105,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "atk": 50
    },
    "dna_requirement": null
  },
  "29-88": {
    "id": 122,
    "from_digimon_id": 29,
    "to_digimon_id": 88,
    "level_required": 15,
    "stat_requirements": {
      "atk": 50,
      "spd": 20
    },
    "dna_requirement": null
  },
  "29-68": {
    "id": 126,
    "from_digimon_id": 29,
    "to_digimon_id": 68,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "atk": 50
    },
    "dna_requirement": null
  },
  "30-139": {
    "id": 130,
    "from_digimon_id": 30,
    "to_digimon_id": 139,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "spd": 40
    },
    "dna_requirement": null
  },
  "31-124": {
    "id": 134,
    "from_digimon_id": 31,
    "to_digimon_id": 124,
    "level_required": 13,
    "stat_requirements": {
      "sp": 40,
      "int": 30
    },
    "dna_requirement": null
  },
  "55-94": {
    "id": 237,
    "from_digimon_id": 55,
    "to_digimon_id": 94,
    "level_required": 14,
    "stat_requirements": {
      "sp": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  "55-103": {
    "id": 238,
    "from_digimon_id": 55,
    "to_digimon_id": 103,
    "level_required": 14,
    "stat_requirements": {
      "def": 30,
      "int": 40
    },
    "dna_requirement": null
  },
  "55-129": {
    "id": 240,
    "from_digimon_id": 55,
    "to_digimon_id": 129,
    "level_required": 12,
    "stat_requirements": {
      "hp": 300
    },
    "dna_requirement": null
  },
  "56-75": {
    "id": 246,
    "from_digimon_id": 56,
    "to_digimon_id": 75,
    "level_required": 14,
    "stat_requirements": {
      "atk": 35,
      "spd": 45
    },
    "dna_requirement": null
  },
  "59-102": {
    "id": 248,
    "from_digimon_id": 59,
    "to_digimon_id": 102,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "int": 40
    },
    "dna_requirement": null
  },
  "59-129": {
    "id": 250,
    "from_digimon_id": 59,
    "to_digimon_id": 129,
    "level_required": 12,
    "stat_requirements": {
      "hp": 300
    },
    "dna_requirement": null
  },
  "60-116": {
    "id": 252,
    "from_digimon_id": 60,
    "to_digimon_id": 116,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "atk": 40
    },
    "dna_requirement": null
  },
  "62-74": {
    "id": 254,
    "from_digimon_id": 62,
    "to_digimon_id": 74,
    "level_required": 14,
    "stat_requirements": {
      "hp": 500
    },
    "dna_requirement": null
  },
  "62-87": {
    "id": 256,
    "from_digimon_id": 62,
    "to_digimon_id": 87,
    "level_required": 14,
    "stat_requirements": {
      "sp": 40,
      "int": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  "350-351": {
    "id": 919,
    "from_digimon_id": 350,
    "to_digimon_id": 351,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 165,
      "def": 130,
      "spd": 165
    },
    "dna_requirement": null
  },
  "259-367": {
    "id": 945,
    "from_digimon_id": 259,
    "to_digimon_id": 367,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 180,
      "int": 180,
      "spd": 170
    },
    "dna_requirement": 366
  },
  "32-92": {
    "id": 138,
    "from_digimon_id": 32,
    "to_digimon_id": 92,
    "level_required": 14,
    "stat_requirements": {
      "int": 35
    },
    "dna_requirement": null
  },
  "32-99": {
    "id": 142,
    "from_digimon_id": 32,
    "to_digimon_id": 99,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 60
    },
    "dna_requirement": null
  },
  "33-91": {
    "id": 146,
    "from_digimon_id": 33,
    "to_digimon_id": 91,
    "level_required": 16,
    "stat_requirements": {
      "hp": 150,
      "atk": 50
    },
    "dna_requirement": null
  },
  "34-71": {
    "id": 150,
    "from_digimon_id": 34,
    "to_digimon_id": 71,
    "level_required": 15,
    "stat_requirements": {
      "hp": 300
    },
    "dna_requirement": null
  },
  "34-109": {
    "id": 154,
    "from_digimon_id": 34,
    "to_digimon_id": 109,
    "level_required": 15,
    "stat_requirements": {
      "atk": 45,
      "spd": 50
    },
    "dna_requirement": null
  },
  "35-83": {
    "id": 156,
    "from_digimon_id": 35,
    "to_digimon_id": 83,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 55
    },
    "dna_requirement": null
  },
  "35-103": {
    "id": 158,
    "from_digimon_id": 35,
    "to_digimon_id": 103,
    "level_required": 14,
    "stat_requirements": {
      "def": 30,
      "int": 40
    },
    "dna_requirement": null
  },
  "37-131": {
    "id": 163,
    "from_digimon_id": 37,
    "to_digimon_id": 131,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40
    },
    "dna_requirement": null
  },
  "39-71": {
    "id": 167,
    "from_digimon_id": 39,
    "to_digimon_id": 71,
    "level_required": 15,
    "stat_requirements": {
      "hp": 300
    },
    "dna_requirement": null
  },
  "40-82": {
    "id": 171,
    "from_digimon_id": 40,
    "to_digimon_id": 82,
    "level_required": 14,
    "stat_requirements": {
      "def": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  "40-140": {
    "id": 175,
    "from_digimon_id": 40,
    "to_digimon_id": 140,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  "41-106": {
    "id": 179,
    "from_digimon_id": 41,
    "to_digimon_id": 106,
    "level_required": 12,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  "44-100": {
    "id": 183,
    "from_digimon_id": 44,
    "to_digimon_id": 100,
    "level_required": 14,
    "stat_requirements": {
      "atk": 30,
      "def": 40
    },
    "dna_requirement": null
  },
  "45-79": {
    "id": 187,
    "from_digimon_id": 45,
    "to_digimon_id": 79,
    "level_required": 14,
    "stat_requirements": {
      "def": 55
    },
    "dna_requirement": null
  },
  "45-98": {
    "id": 189,
    "from_digimon_id": 45,
    "to_digimon_id": 98,
    "level_required": 18,
    "stat_requirements": {
      "abi": 5
    },
    "dna_requirement": null
  },
  "45-127": {
    "id": 191,
    "from_digimon_id": 45,
    "to_digimon_id": 127,
    "level_required": 20,
    "stat_requirements": {},
    "dna_requirement": null
  },
  "46-122": {
    "id": 195,
    "from_digimon_id": 46,
    "to_digimon_id": 122,
    "level_required": 14,
    "stat_requirements": {
      "hp": 40,
      "int": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  "46-134": {
    "id": 197,
    "from_digimon_id": 46,
    "to_digimon_id": 134,
    "level_required": 13,
    "stat_requirements": {
      "int": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  "47-105": {
    "id": 199,
    "from_digimon_id": 47,
    "to_digimon_id": 105,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "atk": 50
    },
    "dna_requirement": null
  },
  "47-110": {
    "id": 201,
    "from_digimon_id": 47,
    "to_digimon_id": 110,
    "level_required": 20,
    "stat_requirements": {
      "atk": 50,
      "spd": 50
    },
    "dna_requirement": null
  },
  "47-132": {
    "id": 203,
    "from_digimon_id": 47,
    "to_digimon_id": 132,
    "level_required": 14,
    "stat_requirements": {
      "atk": 55,
      "def": 55
    },
    "dna_requirement": null
  },
  "48-93": {
    "id": 205,
    "from_digimon_id": 48,
    "to_digimon_id": 93,
    "level_required": 14,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  "48-118": {
    "id": 207,
    "from_digimon_id": 48,
    "to_digimon_id": 118,
    "level_required": 16,
    "stat_requirements": {
      "hp": 300,
      "def": 30
    },
    "dna_requirement": null
  },
  "48-113": {
    "id": 209,
    "from_digimon_id": 48,
    "to_digimon_id": 113,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  "49-87": {
    "id": 211,
    "from_digimon_id": 49,
    "to_digimon_id": 87,
    "level_required": 14,
    "stat_requirements": {
      "sp": 40,
      "int": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  "49-116": {
    "id": 213,
    "from_digimon_id": 49,
    "to_digimon_id": 116,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "atk": 40
    },
    "dna_requirement": null
  },
  "50-67": {
    "id": 215,
    "from_digimon_id": 50,
    "to_digimon_id": 67,
    "level_required": 14,
    "stat_requirements": {
      "spd": 55
    },
    "dna_requirement": null
  },
  "50-87": {
    "id": 217,
    "from_digimon_id": 50,
    "to_digimon_id": 87,
    "level_required": 14,
    "stat_requirements": {
      "sp": 40,
      "int": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  "51-76": {
    "id": 221,
    "from_digimon_id": 51,
    "to_digimon_id": 76,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  "53-125": {
    "id": 225,
    "from_digimon_id": 53,
    "to_digimon_id": 125,
    "level_required": 16,
    "stat_requirements": {
      "atk": 40,
      "spd": 35
    },
    "dna_requirement": null
  },
  "53-109": {
    "id": 229,
    "from_digimon_id": 53,
    "to_digimon_id": 109,
    "level_required": 15,
    "stat_requirements": {
      "atk": 45,
      "spd": 50
    },
    "dna_requirement": null
  },
  "54-133": {
    "id": 233,
    "from_digimon_id": 54,
    "to_digimon_id": 133,
    "level_required": 14,
    "stat_requirements": {
      "hp": 250,
      "atk": 30
    },
    "dna_requirement": null
  },
  "33-88": {
    "id": 145,
    "from_digimon_id": 33,
    "to_digimon_id": 88,
    "level_required": 15,
    "stat_requirements": {
      "atk": 50,
      "spd": 20
    },
    "dna_requirement": null
  },
  "33-120": {
    "id": 147,
    "from_digimon_id": 33,
    "to_digimon_id": 120,
    "level_required": 12,
    "stat_requirements": {
      "atk": 40,
      "def": 40
    },
    "dna_requirement": null
  },
  "54-139": {
    "id": 234,
    "from_digimon_id": 54,
    "to_digimon_id": 139,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "spd": 40
    },
    "dna_requirement": null
  },
  "55-83": {
    "id": 236,
    "from_digimon_id": 55,
    "to_digimon_id": 83,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 55
    },
    "dna_requirement": null
  },
  "55-75": {
    "id": 241,
    "from_digimon_id": 55,
    "to_digimon_id": 75,
    "level_required": 14,
    "stat_requirements": {
      "atk": 35,
      "spd": 45
    },
    "dna_requirement": null
  },
  "56-131": {
    "id": 245,
    "from_digimon_id": 56,
    "to_digimon_id": 131,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40
    },
    "dna_requirement": null
  },
  "59-118": {
    "id": 249,
    "from_digimon_id": 59,
    "to_digimon_id": 118,
    "level_required": 16,
    "stat_requirements": {
      "hp": 300,
      "def": 30
    },
    "dna_requirement": null
  },
  "60-213": {
    "id": 253,
    "from_digimon_id": 60,
    "to_digimon_id": 213,
    "level_required": 55,
    "stat_requirements": {
      "abi": 80,
      "atk": 180,
      "int": 240,
      "spd": 180
    },
    "dna_requirement": null
  },
  "62-128": {
    "id": 257,
    "from_digimon_id": 62,
    "to_digimon_id": 128,
    "level_required": 16,
    "stat_requirements": {
      "int": 40
    },
    "dna_requirement": null
  },
  "62-138": {
    "id": 259,
    "from_digimon_id": 62,
    "to_digimon_id": 138,
    "level_required": 15,
    "stat_requirements": {
      "atk": 35,
      "spd": 40
    },
    "dna_requirement": null
  },
  "63-84": {
    "id": 261,
    "from_digimon_id": 63,
    "to_digimon_id": 84,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "spd": 40
    },
    "dna_requirement": null
  },
  "63-128": {
    "id": 263,
    "from_digimon_id": 63,
    "to_digimon_id": 128,
    "level_required": 16,
    "stat_requirements": {
      "int": 40
    },
    "dna_requirement": null
  },
  "63-117": {
    "id": 265,
    "from_digimon_id": 63,
    "to_digimon_id": 117,
    "level_required": 14,
    "stat_requirements": {
      "atk": 45,
      "spd": 40
    },
    "dna_requirement": null
  },
  "348-352": {
    "id": 920,
    "from_digimon_id": 348,
    "to_digimon_id": 352,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 220,
      "int": 165,
      "spd": 165
    },
    "dna_requirement": 351
  },
  "379-380": {
    "id": 946,
    "from_digimon_id": 379,
    "to_digimon_id": 380,
    "level_required": 16,
    "stat_requirements": {
      "int": 45
    },
    "dna_requirement": null
  },
  "34-70": {
    "id": 149,
    "from_digimon_id": 34,
    "to_digimon_id": 70,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  "34-111": {
    "id": 151,
    "from_digimon_id": 34,
    "to_digimon_id": 111,
    "level_required": 16,
    "stat_requirements": {
      "sp": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  "34-66": {
    "id": 153,
    "from_digimon_id": 34,
    "to_digimon_id": 66,
    "level_required": 15,
    "stat_requirements": {
      "hp": 110,
      "def": 50
    },
    "dna_requirement": null
  },
  "35-71": {
    "id": 155,
    "from_digimon_id": 35,
    "to_digimon_id": 71,
    "level_required": 15,
    "stat_requirements": {
      "hp": 300
    },
    "dna_requirement": null
  },
  "35-104": {
    "id": 159,
    "from_digimon_id": 35,
    "to_digimon_id": 104,
    "level_required": 14,
    "stat_requirements": {
      "hp": 300,
      "spd": 30
    },
    "dna_requirement": null
  },
  "37-92": {
    "id": 160,
    "from_digimon_id": 37,
    "to_digimon_id": 92,
    "level_required": 14,
    "stat_requirements": {
      "int": 35
    },
    "dna_requirement": null
  },
  "37-107": {
    "id": 162,
    "from_digimon_id": 37,
    "to_digimon_id": 107,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 35
    },
    "dna_requirement": null
  },
  "37-80": {
    "id": 164,
    "from_digimon_id": 37,
    "to_digimon_id": 80,
    "level_required": 14,
    "stat_requirements": {
      "hp": 130,
      "def": 60
    },
    "dna_requirement": null
  },
  "39-84": {
    "id": 166,
    "from_digimon_id": 39,
    "to_digimon_id": 84,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "spd": 40
    },
    "dna_requirement": null
  },
  "39-115": {
    "id": 168,
    "from_digimon_id": 39,
    "to_digimon_id": 115,
    "level_required": 16,
    "stat_requirements": {
      "int": 40
    },
    "dna_requirement": null
  },
  "39-134": {
    "id": 170,
    "from_digimon_id": 39,
    "to_digimon_id": 134,
    "level_required": 13,
    "stat_requirements": {
      "int": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  "40-93": {
    "id": 172,
    "from_digimon_id": 40,
    "to_digimon_id": 93,
    "level_required": 14,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  "40-108": {
    "id": 174,
    "from_digimon_id": 40,
    "to_digimon_id": 108,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 55
    },
    "dna_requirement": null
  },
  "41-92": {
    "id": 176,
    "from_digimon_id": 41,
    "to_digimon_id": 92,
    "level_required": 14,
    "stat_requirements": {
      "int": 35
    },
    "dna_requirement": null
  },
  "41-90": {
    "id": 178,
    "from_digimon_id": 41,
    "to_digimon_id": 90,
    "level_required": 16,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  "41-107": {
    "id": 180,
    "from_digimon_id": 41,
    "to_digimon_id": 107,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 35
    },
    "dna_requirement": null
  },
  "44-79": {
    "id": 182,
    "from_digimon_id": 44,
    "to_digimon_id": 79,
    "level_required": 14,
    "stat_requirements": {
      "def": 55
    },
    "dna_requirement": null
  },
  "44-119": {
    "id": 184,
    "from_digimon_id": 44,
    "to_digimon_id": 119,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  "44-135": {
    "id": 186,
    "from_digimon_id": 44,
    "to_digimon_id": 135,
    "level_required": 15,
    "stat_requirements": {
      "hp": 130,
      "atk": 50
    },
    "dna_requirement": null
  },
  "45-92": {
    "id": 188,
    "from_digimon_id": 45,
    "to_digimon_id": 92,
    "level_required": 14,
    "stat_requirements": {
      "int": 35
    },
    "dna_requirement": null
  },
  "46-76": {
    "id": 192,
    "from_digimon_id": 46,
    "to_digimon_id": 76,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  "46-139": {
    "id": 196,
    "from_digimon_id": 46,
    "to_digimon_id": 139,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "spd": 40
    },
    "dna_requirement": null
  },
  "47-127": {
    "id": 200,
    "from_digimon_id": 47,
    "to_digimon_id": 127,
    "level_required": 20,
    "stat_requirements": {},
    "dna_requirement": null
  },
  "48-74": {
    "id": 204,
    "from_digimon_id": 48,
    "to_digimon_id": 74,
    "level_required": 14,
    "stat_requirements": {
      "hp": 500
    },
    "dna_requirement": null
  },
  "48-129": {
    "id": 208,
    "from_digimon_id": 48,
    "to_digimon_id": 129,
    "level_required": 12,
    "stat_requirements": {
      "hp": 300
    },
    "dna_requirement": null
  },
  "50-82": {
    "id": 216,
    "from_digimon_id": 50,
    "to_digimon_id": 82,
    "level_required": 14,
    "stat_requirements": {
      "def": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  "50-122": {
    "id": 218,
    "from_digimon_id": 50,
    "to_digimon_id": 122,
    "level_required": 14,
    "stat_requirements": {
      "hp": 40,
      "int": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  "51-67": {
    "id": 220,
    "from_digimon_id": 51,
    "to_digimon_id": 67,
    "level_required": 14,
    "stat_requirements": {
      "spd": 55
    },
    "dna_requirement": null
  },
  "51-108": {
    "id": 222,
    "from_digimon_id": 51,
    "to_digimon_id": 108,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 55
    },
    "dna_requirement": null
  },
  "53-76": {
    "id": 224,
    "from_digimon_id": 53,
    "to_digimon_id": 76,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  "53-323": {
    "id": 226,
    "from_digimon_id": 53,
    "to_digimon_id": 323,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  "53-73": {
    "id": 228,
    "from_digimon_id": 53,
    "to_digimon_id": 73,
    "level_required": 15,
    "stat_requirements": {
      "hp": 45,
      "spd": 55
    },
    "dna_requirement": null
  },
  "54-111": {
    "id": 230,
    "from_digimon_id": 54,
    "to_digimon_id": 111,
    "level_required": 16,
    "stat_requirements": {
      "sp": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  "54-125": {
    "id": 232,
    "from_digimon_id": 54,
    "to_digimon_id": 125,
    "level_required": 16,
    "stat_requirements": {
      "atk": 40,
      "spd": 35
    },
    "dna_requirement": null
  },
  "63-116": {
    "id": 262,
    "from_digimon_id": 63,
    "to_digimon_id": 116,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "atk": 40
    },
    "dna_requirement": null
  },
  "64-65": {
    "id": 266,
    "from_digimon_id": 64,
    "to_digimon_id": 65,
    "level_required": 15,
    "stat_requirements": {
      "atk": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  "64-140": {
    "id": 270,
    "from_digimon_id": 64,
    "to_digimon_id": 140,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  "351-352": {
    "id": 921,
    "from_digimon_id": 351,
    "to_digimon_id": 352,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 220,
      "int": 165,
      "spd": 165
    },
    "dna_requirement": 348
  },
  "91-180": {
    "id": 356,
    "from_digimon_id": 91,
    "to_digimon_id": 180,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 75
    },
    "dna_requirement": null
  },
  "92-217": {
    "id": 360,
    "from_digimon_id": 92,
    "to_digimon_id": 217,
    "level_required": 28,
    "stat_requirements": {
      "sp": 75,
      "int": 100
    },
    "dna_requirement": null
  },
  "94-179": {
    "id": 364,
    "from_digimon_id": 94,
    "to_digimon_id": 179,
    "level_required": 26,
    "stat_requirements": {
      "hp": 900
    },
    "dna_requirement": null
  },
  "95-167": {
    "id": 368,
    "from_digimon_id": 95,
    "to_digimon_id": 167,
    "level_required": 28,
    "stat_requirements": {
      "sp": 70,
      "atk": 70,
      "def": 80
    },
    "dna_requirement": null
  },
  "98-275": {
    "id": 372,
    "from_digimon_id": 98,
    "to_digimon_id": 275,
    "level_required": 65,
    "stat_requirements": {
      "abi": 10
    },
    "dna_requirement": null
  },
  "100-183": {
    "id": 374,
    "from_digimon_id": 100,
    "to_digimon_id": 183,
    "level_required": 28,
    "stat_requirements": {
      "sp": 60,
      "int": 85
    },
    "dna_requirement": null
  },
  "102-212": {
    "id": 378,
    "from_digimon_id": 102,
    "to_digimon_id": 212,
    "level_required": 30,
    "stat_requirements": {
      "int": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "103-194": {
    "id": 380,
    "from_digimon_id": 103,
    "to_digimon_id": 194,
    "level_required": 28,
    "stat_requirements": {
      "hp": 850,
      "def": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  "103-330": {
    "id": 382,
    "from_digimon_id": 103,
    "to_digimon_id": 330,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "def": 75
    },
    "dna_requirement": null
  },
  "105-168": {
    "id": 384,
    "from_digimon_id": 105,
    "to_digimon_id": 168,
    "level_required": 28,
    "stat_requirements": {
      "atk": 120,
      "def": 85,
      "spd": 70
    },
    "dna_requirement": null
  },
  "105-159": {
    "id": 386,
    "from_digimon_id": 105,
    "to_digimon_id": 159,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "abi": 10,
      "atk": 125
    },
    "dna_requirement": null
  },
  "106-167": {
    "id": 388,
    "from_digimon_id": 106,
    "to_digimon_id": 167,
    "level_required": 28,
    "stat_requirements": {
      "sp": 70,
      "atk": 70,
      "def": 80
    },
    "dna_requirement": null
  },
  "107-167": {
    "id": 390,
    "from_digimon_id": 107,
    "to_digimon_id": 167,
    "level_required": 28,
    "stat_requirements": {
      "sp": 70,
      "atk": 70,
      "def": 80
    },
    "dna_requirement": null
  },
  "107-206": {
    "id": 392,
    "from_digimon_id": 107,
    "to_digimon_id": 206,
    "level_required": 26,
    "stat_requirements": {
      "def": 80,
      "int": 65
    },
    "dna_requirement": null
  },
  "107-162": {
    "id": 394,
    "from_digimon_id": 107,
    "to_digimon_id": 162,
    "level_required": 30,
    "stat_requirements": {
      "sp": 60,
      "atk": 70
    },
    "dna_requirement": null
  },
  "108-153": {
    "id": 396,
    "from_digimon_id": 108,
    "to_digimon_id": 153,
    "level_required": 26,
    "stat_requirements": {
      "atk": 95,
      "def": 90
    },
    "dna_requirement": null
  },
  "108-175": {
    "id": 398,
    "from_digimon_id": 108,
    "to_digimon_id": 175,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 90,
      "spd": 75
    },
    "dna_requirement": 76
  },
  "380-368": {
    "id": 947,
    "from_digimon_id": 380,
    "to_digimon_id": 368,
    "level_required": 30,
    "stat_requirements": {
      "sp": 85,
      "abi": 10,
      "int": 110
    },
    "dna_requirement": null
  },
  "380-385": {
    "id": 948,
    "from_digimon_id": 380,
    "to_digimon_id": 385,
    "level_required": 30,
    "stat_requirements": {
      "int": 85,
      "spd": 85
    },
    "dna_requirement": null
  },
  "383-384": {
    "id": 951,
    "from_digimon_id": 383,
    "to_digimon_id": 384,
    "level_required": 16,
    "stat_requirements": {
      "hp": 330,
      "def": 35
    },
    "dna_requirement": null
  },
  "384-385": {
    "id": 952,
    "from_digimon_id": 384,
    "to_digimon_id": 385,
    "level_required": 30,
    "stat_requirements": {
      "int": 85,
      "spd": 85
    },
    "dna_requirement": null
  },
  "385-369": {
    "id": 953,
    "from_digimon_id": 385,
    "to_digimon_id": 369,
    "level_required": 55,
    "stat_requirements": {
      "sp": 130,
      "abi": 20,
      "int": 130
    },
    "dna_requirement": null
  },
  "65-214": {
    "id": 274,
    "from_digimon_id": 65,
    "to_digimon_id": 214,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "int": 95
    },
    "dna_requirement": null
  },
  "67-154": {
    "id": 278,
    "from_digimon_id": 67,
    "to_digimon_id": 154,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "70-145": {
    "id": 282,
    "from_digimon_id": 70,
    "to_digimon_id": 145,
    "level_required": 26,
    "stat_requirements": {
      "def": 110
    },
    "dna_requirement": null
  },
  "70-159": {
    "id": 286,
    "from_digimon_id": 70,
    "to_digimon_id": 159,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "abi": 10,
      "atk": 125
    },
    "dna_requirement": null
  },
  "72-147": {
    "id": 291,
    "from_digimon_id": 72,
    "to_digimon_id": 147,
    "level_required": 30,
    "stat_requirements": {
      "abi": 10,
      "atk": 70,
      "int": 90
    },
    "dna_requirement": null
  },
  "72-217": {
    "id": 293,
    "from_digimon_id": 72,
    "to_digimon_id": 217,
    "level_required": 28,
    "stat_requirements": {
      "sp": 75,
      "int": 100
    },
    "dna_requirement": null
  },
  "74-187": {
    "id": 297,
    "from_digimon_id": 74,
    "to_digimon_id": 187,
    "level_required": 26,
    "stat_requirements": {
      "hp": 850,
      "atk": 60,
      "int": 60
    },
    "dna_requirement": null
  },
  "76-195": {
    "id": 299,
    "from_digimon_id": 76,
    "to_digimon_id": 195,
    "level_required": 30,
    "stat_requirements": {
      "sp": 80,
      "abi": 10,
      "int": 80
    },
    "dna_requirement": null
  },
  "77-154": {
    "id": 303,
    "from_digimon_id": 77,
    "to_digimon_id": 154,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "77-189": {
    "id": 307,
    "from_digimon_id": 77,
    "to_digimon_id": 189,
    "level_required": 26,
    "stat_requirements": {
      "sp": 65,
      "int": 65
    },
    "dna_requirement": null
  },
  "78-169": {
    "id": 311,
    "from_digimon_id": 78,
    "to_digimon_id": 169,
    "level_required": 28,
    "stat_requirements": {
      "atk": 80,
      "int": 70
    },
    "dna_requirement": null
  },
  "79-206": {
    "id": 315,
    "from_digimon_id": 79,
    "to_digimon_id": 206,
    "level_required": 26,
    "stat_requirements": {
      "def": 80,
      "int": 65
    },
    "dna_requirement": null
  },
  "81-215": {
    "id": 319,
    "from_digimon_id": 81,
    "to_digimon_id": 215,
    "level_required": 28,
    "stat_requirements": {
      "atk": 90,
      "spd": 85
    },
    "dna_requirement": null
  },
  "82-210": {
    "id": 322,
    "from_digimon_id": 82,
    "to_digimon_id": 210,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  "83-191": {
    "id": 324,
    "from_digimon_id": 83,
    "to_digimon_id": 191,
    "level_required": 32,
    "stat_requirements": {},
    "dna_requirement": null
  },
  "84-143": {
    "id": 326,
    "from_digimon_id": 84,
    "to_digimon_id": 143,
    "level_required": 28,
    "stat_requirements": {
      "atk": 65,
      "int": 75,
      "spd": 85
    },
    "dna_requirement": null
  },
  "84-211": {
    "id": 328,
    "from_digimon_id": 84,
    "to_digimon_id": 211,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "85-181": {
    "id": 330,
    "from_digimon_id": 85,
    "to_digimon_id": 181,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "def": 75
    },
    "dna_requirement": null
  },
  "85-215": {
    "id": 332,
    "from_digimon_id": 85,
    "to_digimon_id": 215,
    "level_required": 28,
    "stat_requirements": {
      "atk": 90,
      "spd": 85
    },
    "dna_requirement": null
  },
  "86-198": {
    "id": 334,
    "from_digimon_id": 86,
    "to_digimon_id": 198,
    "level_required": 26,
    "stat_requirements": {
      "atk": 75,
      "spd": 80
    },
    "dna_requirement": null
  },
  "86-186": {
    "id": 336,
    "from_digimon_id": 86,
    "to_digimon_id": 186,
    "level_required": 26,
    "stat_requirements": {
      "atk": 65,
      "def": 65
    },
    "dna_requirement": null
  },
  "87-207": {
    "id": 338,
    "from_digimon_id": 87,
    "to_digimon_id": 207,
    "level_required": 26,
    "stat_requirements": {
      "hp": 600,
      "atk": 60
    },
    "dna_requirement": null
  },
  "88-156": {
    "id": 340,
    "from_digimon_id": 88,
    "to_digimon_id": 156,
    "level_required": 26,
    "stat_requirements": {
      "hp": 800,
      "atk": 75,
      "def": 95
    },
    "dna_requirement": null
  },
  "88-149": {
    "id": 344,
    "from_digimon_id": 88,
    "to_digimon_id": 149,
    "level_required": 30,
    "stat_requirements": {
      "hp": 500,
      "atk": 120,
      "def": 60
    },
    "dna_requirement": null
  },
  "89-142": {
    "id": 348,
    "from_digimon_id": 89,
    "to_digimon_id": 142,
    "level_required": 30,
    "stat_requirements": {
      "atk": 110,
      "int": 85
    },
    "dna_requirement": null
  },
  "90-204": {
    "id": 352,
    "from_digimon_id": 90,
    "to_digimon_id": 204,
    "level_required": 30,
    "stat_requirements": {
      "hp": 450,
      "atk": 110
    },
    "dna_requirement": null
  },
  "64-108": {
    "id": 269,
    "from_digimon_id": 64,
    "to_digimon_id": 108,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 55
    },
    "dna_requirement": null
  },
  "353-354": {
    "id": 922,
    "from_digimon_id": 353,
    "to_digimon_id": 354,
    "level_required": 15,
    "stat_requirements": {
      "atk": 55,
      "spd": 20
    },
    "dna_requirement": null
  },
  "368-381": {
    "id": 949,
    "from_digimon_id": 368,
    "to_digimon_id": 381,
    "level_required": 55,
    "stat_requirements": {
      "sp": 130,
      "abi": 40,
      "def": 130,
      "int": 160
    },
    "dna_requirement": null
  },
  "359-382": {
    "id": 950,
    "from_digimon_id": 359,
    "to_digimon_id": 382,
    "level_required": 60,
    "stat_requirements": {
      "sp": 220,
      "abi": 80,
      "int": 275,
      "spd": 145
    },
    "dna_requirement": null
  },
  "64-126": {
    "id": 271,
    "from_digimon_id": 64,
    "to_digimon_id": 126,
    "level_required": 15,
    "stat_requirements": {
      "sp": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  "86-216": {
    "id": 335,
    "from_digimon_id": 86,
    "to_digimon_id": 216,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 90,
      "spd": 70
    },
    "dna_requirement": null
  },
  "87-214": {
    "id": 339,
    "from_digimon_id": 87,
    "to_digimon_id": 214,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "int": 95
    },
    "dna_requirement": null
  },
  "88-202": {
    "id": 341,
    "from_digimon_id": 88,
    "to_digimon_id": 202,
    "level_required": 30,
    "stat_requirements": {
      "atk": 105,
      "spd": 75
    },
    "dna_requirement": null
  },
  "88-205": {
    "id": 343,
    "from_digimon_id": 88,
    "to_digimon_id": 205,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 95
    },
    "dna_requirement": null
  },
  "89-146": {
    "id": 345,
    "from_digimon_id": 89,
    "to_digimon_id": 146,
    "level_required": 30,
    "stat_requirements": {
      "atk": 95,
      "spd": 80
    },
    "dna_requirement": null
  },
  "89-172": {
    "id": 347,
    "from_digimon_id": 89,
    "to_digimon_id": 172,
    "level_required": 30,
    "stat_requirements": {
      "sp": 60,
      "int": 75,
      "spd": 60
    },
    "dna_requirement": null
  },
  "90-168": {
    "id": 349,
    "from_digimon_id": 90,
    "to_digimon_id": 168,
    "level_required": 28,
    "stat_requirements": {
      "atk": 120,
      "def": 85,
      "spd": 70
    },
    "dna_requirement": null
  },
  "90-203": {
    "id": 351,
    "from_digimon_id": 90,
    "to_digimon_id": 203,
    "level_required": 30,
    "stat_requirements": {
      "hp": 350,
      "atk": 100
    },
    "dna_requirement": null
  },
  "91-181": {
    "id": 353,
    "from_digimon_id": 91,
    "to_digimon_id": 181,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "def": 75
    },
    "dna_requirement": null
  },
  "91-204": {
    "id": 355,
    "from_digimon_id": 91,
    "to_digimon_id": 204,
    "level_required": 30,
    "stat_requirements": {
      "hp": 450,
      "atk": 110
    },
    "dna_requirement": null
  },
  "92-144": {
    "id": 357,
    "from_digimon_id": 92,
    "to_digimon_id": 144,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  "92-183": {
    "id": 359,
    "from_digimon_id": 92,
    "to_digimon_id": 183,
    "level_required": 28,
    "stat_requirements": {
      "sp": 60,
      "int": 85
    },
    "dna_requirement": null
  },
  "93-153": {
    "id": 361,
    "from_digimon_id": 93,
    "to_digimon_id": 153,
    "level_required": 26,
    "stat_requirements": {
      "atk": 95,
      "def": 90
    },
    "dna_requirement": null
  },
  "93-165": {
    "id": 363,
    "from_digimon_id": 93,
    "to_digimon_id": 165,
    "level_required": 28,
    "stat_requirements": {
      "hp": 800,
      "def": 70
    },
    "dna_requirement": null
  },
  "94-194": {
    "id": 365,
    "from_digimon_id": 94,
    "to_digimon_id": 194,
    "level_required": 28,
    "stat_requirements": {
      "hp": 850,
      "def": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  "95-151": {
    "id": 367,
    "from_digimon_id": 95,
    "to_digimon_id": 151,
    "level_required": 26,
    "stat_requirements": {
      "sp": 75,
      "def": 75,
      "spd": 65
    },
    "dna_requirement": null
  },
  "95-206": {
    "id": 369,
    "from_digimon_id": 95,
    "to_digimon_id": 206,
    "level_required": 26,
    "stat_requirements": {
      "def": 80,
      "int": 65
    },
    "dna_requirement": null
  },
  "98-193": {
    "id": 371,
    "from_digimon_id": 98,
    "to_digimon_id": 193,
    "level_required": 26,
    "stat_requirements": {
      "sp": 85
    },
    "dna_requirement": null
  },
  "100-181": {
    "id": 373,
    "from_digimon_id": 100,
    "to_digimon_id": 181,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "def": 75
    },
    "dna_requirement": null
  },
  "102-210": {
    "id": 377,
    "from_digimon_id": 102,
    "to_digimon_id": 210,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  "65-165": {
    "id": 273,
    "from_digimon_id": 65,
    "to_digimon_id": 165,
    "level_required": 28,
    "stat_requirements": {
      "hp": 800,
      "def": 70
    },
    "dna_requirement": null
  },
  "65-142": {
    "id": 275,
    "from_digimon_id": 65,
    "to_digimon_id": 142,
    "level_required": 30,
    "stat_requirements": {
      "atk": 110,
      "int": 85
    },
    "dna_requirement": null
  },
  "67-150": {
    "id": 277,
    "from_digimon_id": 67,
    "to_digimon_id": 150,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "spd": 95
    },
    "dna_requirement": null
  },
  "67-166": {
    "id": 279,
    "from_digimon_id": 67,
    "to_digimon_id": 166,
    "level_required": 30,
    "stat_requirements": {
      "atk": 60,
      "int": 75,
      "spd": 75
    },
    "dna_requirement": 115
  },
  "67-189": {
    "id": 281,
    "from_digimon_id": 67,
    "to_digimon_id": 189,
    "level_required": 26,
    "stat_requirements": {
      "sp": 65,
      "int": 65
    },
    "dna_requirement": null
  },
  "70-164": {
    "id": 283,
    "from_digimon_id": 70,
    "to_digimon_id": 164,
    "level_required": 30,
    "stat_requirements": {
      "def": 75,
      "int": 65
    },
    "dna_requirement": 77
  },
  "70-195": {
    "id": 285,
    "from_digimon_id": 70,
    "to_digimon_id": 195,
    "level_required": 30,
    "stat_requirements": {
      "sp": 80,
      "abi": 10,
      "int": 80
    },
    "dna_requirement": null
  },
  "71-170": {
    "id": 287,
    "from_digimon_id": 71,
    "to_digimon_id": 170,
    "level_required": 30,
    "stat_requirements": {
      "hp": 800,
      "atk": 75
    },
    "dna_requirement": null
  },
  "71-198": {
    "id": 289,
    "from_digimon_id": 71,
    "to_digimon_id": 198,
    "level_required": 26,
    "stat_requirements": {
      "atk": 75,
      "spd": 80
    },
    "dna_requirement": null
  },
  "71-180": {
    "id": 290,
    "from_digimon_id": 71,
    "to_digimon_id": 180,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 75
    },
    "dna_requirement": null
  },
  "72-190": {
    "id": 294,
    "from_digimon_id": 72,
    "to_digimon_id": 190,
    "level_required": 28,
    "stat_requirements": {
      "sp": 80,
      "int": 80
    },
    "dna_requirement": null
  },
  "76-184": {
    "id": 298,
    "from_digimon_id": 76,
    "to_digimon_id": 184,
    "level_required": 30,
    "stat_requirements": {
      "atk": 90,
      "def": 60,
      "spd": 75
    },
    "dna_requirement": 108
  },
  "76-209": {
    "id": 300,
    "from_digimon_id": 76,
    "to_digimon_id": 209,
    "level_required": 30,
    "stat_requirements": {
      "hp": 350,
      "atk": 100,
      "spd": 75
    },
    "dna_requirement": null
  },
  "76-175": {
    "id": 302,
    "from_digimon_id": 76,
    "to_digimon_id": 175,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 90,
      "spd": 75
    },
    "dna_requirement": 108
  },
  "77-164": {
    "id": 304,
    "from_digimon_id": 77,
    "to_digimon_id": 164,
    "level_required": 30,
    "stat_requirements": {
      "def": 75,
      "int": 65
    },
    "dna_requirement": 70
  },
  "77-171": {
    "id": 306,
    "from_digimon_id": 77,
    "to_digimon_id": 171,
    "level_required": 30,
    "stat_requirements": {
      "atk": 90,
      "spd": 80
    },
    "dna_requirement": null
  },
  "78-176": {
    "id": 308,
    "from_digimon_id": 78,
    "to_digimon_id": 176,
    "level_required": 30,
    "stat_requirements": {
      "hp": 700,
      "def": 75
    },
    "dna_requirement": null
  },
  "78-215": {
    "id": 310,
    "from_digimon_id": 78,
    "to_digimon_id": 215,
    "level_required": 28,
    "stat_requirements": {
      "atk": 90,
      "spd": 85
    },
    "dna_requirement": null
  },
  "79-144": {
    "id": 312,
    "from_digimon_id": 79,
    "to_digimon_id": 144,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  "79-183": {
    "id": 314,
    "from_digimon_id": 79,
    "to_digimon_id": 183,
    "level_required": 28,
    "stat_requirements": {
      "sp": 60,
      "int": 85
    },
    "dna_requirement": null
  },
  "79-157": {
    "id": 316,
    "from_digimon_id": 79,
    "to_digimon_id": 157,
    "level_required": 26,
    "stat_requirements": {
      "hp": 700,
      "def": 85
    },
    "dna_requirement": null
  },
  "81-198": {
    "id": 318,
    "from_digimon_id": 81,
    "to_digimon_id": 198,
    "level_required": 26,
    "stat_requirements": {
      "atk": 75,
      "spd": 80
    },
    "dna_requirement": null
  },
  "82-141": {
    "id": 320,
    "from_digimon_id": 82,
    "to_digimon_id": 141,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "def": 95
    },
    "dna_requirement": null
  },
  "83-179": {
    "id": 323,
    "from_digimon_id": 83,
    "to_digimon_id": 179,
    "level_required": 26,
    "stat_requirements": {
      "hp": 900
    },
    "dna_requirement": null
  },
  "84-202": {
    "id": 327,
    "from_digimon_id": 84,
    "to_digimon_id": 202,
    "level_required": 30,
    "stat_requirements": {
      "atk": 105,
      "spd": 75
    },
    "dna_requirement": null
  },
  "105-209": {
    "id": 385,
    "from_digimon_id": 105,
    "to_digimon_id": 209,
    "level_required": 30,
    "stat_requirements": {
      "hp": 350,
      "atk": 100,
      "spd": 75
    },
    "dna_requirement": null
  },
  "354-355": {
    "id": 923,
    "from_digimon_id": 354,
    "to_digimon_id": 355,
    "level_required": 30,
    "stat_requirements": {
      "atk": 115,
      "spd": 80
    },
    "dna_requirement": null
  },
  "106-193": {
    "id": 389,
    "from_digimon_id": 106,
    "to_digimon_id": 193,
    "level_required": 26,
    "stat_requirements": {
      "sp": 85
    },
    "dna_requirement": null
  },
  "107-157": {
    "id": 393,
    "from_digimon_id": 107,
    "to_digimon_id": 157,
    "level_required": 26,
    "stat_requirements": {
      "hp": 700,
      "def": 85
    },
    "dna_requirement": null
  },
  "108-184": {
    "id": 397,
    "from_digimon_id": 108,
    "to_digimon_id": 184,
    "level_required": 30,
    "stat_requirements": {
      "atk": 90,
      "def": 60,
      "spd": 75
    },
    "dna_requirement": 76
  },
  "131-196": {
    "id": 468,
    "from_digimon_id": 131,
    "to_digimon_id": 196,
    "level_required": 26,
    "stat_requirements": {
      "atk": 80,
      "def": 75
    },
    "dna_requirement": null
  },
  "133-170": {
    "id": 470,
    "from_digimon_id": 133,
    "to_digimon_id": 170,
    "level_required": 30,
    "stat_requirements": {
      "hp": 800,
      "atk": 75
    },
    "dna_requirement": null
  },
  "133-162": {
    "id": 472,
    "from_digimon_id": 133,
    "to_digimon_id": 162,
    "level_required": 30,
    "stat_requirements": {
      "sp": 60,
      "atk": 70
    },
    "dna_requirement": null
  },
  "137-160": {
    "id": 474,
    "from_digimon_id": 137,
    "to_digimon_id": 160,
    "level_required": 26,
    "stat_requirements": {
      "hp": 400,
      "atk": 95
    },
    "dna_requirement": null
  },
  "137-203": {
    "id": 476,
    "from_digimon_id": 137,
    "to_digimon_id": 203,
    "level_required": 30,
    "stat_requirements": {
      "hp": 350,
      "atk": 100
    },
    "dna_requirement": null
  },
  "139-174": {
    "id": 478,
    "from_digimon_id": 139,
    "to_digimon_id": 174,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "spd": 100
    },
    "dna_requirement": null
  },
  "139-211": {
    "id": 480,
    "from_digimon_id": 139,
    "to_digimon_id": 211,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "140-153": {
    "id": 482,
    "from_digimon_id": 140,
    "to_digimon_id": 153,
    "level_required": 26,
    "stat_requirements": {
      "atk": 95,
      "def": 90
    },
    "dna_requirement": null
  },
  "140-211": {
    "id": 484,
    "from_digimon_id": 140,
    "to_digimon_id": 211,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "141-285": {
    "id": 487,
    "from_digimon_id": 141,
    "to_digimon_id": 285,
    "level_required": 55,
    "stat_requirements": {
      "hp": 900,
      "sp": 120,
      "abi": 20,
      "int": 145
    },
    "dna_requirement": null
  },
  "143-259": {
    "id": 489,
    "from_digimon_id": 143,
    "to_digimon_id": 259,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "def": 120,
      "int": 130,
      "spd": 130
    },
    "dna_requirement": null
  },
  "143-242": {
    "id": 491,
    "from_digimon_id": 143,
    "to_digimon_id": 242,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1100,
      "sp": 100,
      "abi": 40,
      "int": 100
    },
    "dna_requirement": null
  },
  "145-221": {
    "id": 495,
    "from_digimon_id": 145,
    "to_digimon_id": 221,
    "level_required": 45,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 120
    },
    "dna_requirement": null
  },
  "145-259": {
    "id": 496,
    "from_digimon_id": 145,
    "to_digimon_id": 259,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "def": 120,
      "int": 130,
      "spd": 130
    },
    "dna_requirement": null
  },
  "147-218": {
    "id": 505,
    "from_digimon_id": 147,
    "to_digimon_id": 218,
    "level_required": 60,
    "stat_requirements": {
      "sp": 130,
      "abi": 40,
      "atk": 200,
      "spd": 100
    },
    "dna_requirement": null
  },
  "150-220": {
    "id": 507,
    "from_digimon_id": 150,
    "to_digimon_id": 220,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 120,
      "spd": 145
    },
    "dna_requirement": null
  },
  "150-304": {
    "id": 509,
    "from_digimon_id": 150,
    "to_digimon_id": 304,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "spd": 160
    },
    "dna_requirement": null
  },
  "151-273": {
    "id": 511,
    "from_digimon_id": 151,
    "to_digimon_id": 273,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "int": 160,
      "spd": 110
    },
    "dna_requirement": null
  },
  "111-217": {
    "id": 401,
    "from_digimon_id": 111,
    "to_digimon_id": 217,
    "level_required": 28,
    "stat_requirements": {
      "sp": 75,
      "int": 100
    },
    "dna_requirement": null
  },
  "112-156": {
    "id": 403,
    "from_digimon_id": 112,
    "to_digimon_id": 156,
    "level_required": 26,
    "stat_requirements": {
      "hp": 800,
      "atk": 75,
      "def": 95
    },
    "dna_requirement": null
  },
  "112-196": {
    "id": 406,
    "from_digimon_id": 112,
    "to_digimon_id": 196,
    "level_required": 26,
    "stat_requirements": {
      "atk": 80,
      "def": 75
    },
    "dna_requirement": null
  },
  "114-205": {
    "id": 410,
    "from_digimon_id": 114,
    "to_digimon_id": 205,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 95
    },
    "dna_requirement": null
  },
  "115-186": {
    "id": 414,
    "from_digimon_id": 115,
    "to_digimon_id": 186,
    "level_required": 26,
    "stat_requirements": {
      "atk": 65,
      "def": 65
    },
    "dna_requirement": null
  },
  "116-204": {
    "id": 418,
    "from_digimon_id": 116,
    "to_digimon_id": 204,
    "level_required": 30,
    "stat_requirements": {
      "hp": 450,
      "atk": 110
    },
    "dna_requirement": null
  },
  "118-212": {
    "id": 422,
    "from_digimon_id": 118,
    "to_digimon_id": 212,
    "level_required": 30,
    "stat_requirements": {
      "int": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "119-161": {
    "id": 426,
    "from_digimon_id": 119,
    "to_digimon_id": 161,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 80,
      "spd": 70
    },
    "dna_requirement": null
  },
  "121-151": {
    "id": 430,
    "from_digimon_id": 121,
    "to_digimon_id": 151,
    "level_required": 26,
    "stat_requirements": {
      "sp": 75,
      "def": 75,
      "spd": 65
    },
    "dna_requirement": null
  },
  "122-154": {
    "id": 434,
    "from_digimon_id": 122,
    "to_digimon_id": 154,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "122-189": {
    "id": 438,
    "from_digimon_id": 122,
    "to_digimon_id": 189,
    "level_required": 26,
    "stat_requirements": {
      "sp": 65,
      "int": 65
    },
    "dna_requirement": null
  },
  "124-214": {
    "id": 442,
    "from_digimon_id": 124,
    "to_digimon_id": 214,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "int": 95
    },
    "dna_requirement": null
  },
  "124-197": {
    "id": 444,
    "from_digimon_id": 124,
    "to_digimon_id": 197,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "spd": 80
    },
    "dna_requirement": null
  },
  "125-163": {
    "id": 446,
    "from_digimon_id": 125,
    "to_digimon_id": 163,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "125-205": {
    "id": 448,
    "from_digimon_id": 125,
    "to_digimon_id": 205,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 95
    },
    "dna_requirement": null
  },
  "127-193": {
    "id": 450,
    "from_digimon_id": 127,
    "to_digimon_id": 193,
    "level_required": 26,
    "stat_requirements": {
      "sp": 85
    },
    "dna_requirement": null
  },
  "127-157": {
    "id": 452,
    "from_digimon_id": 127,
    "to_digimon_id": 157,
    "level_required": 26,
    "stat_requirements": {
      "hp": 700,
      "def": 85
    },
    "dna_requirement": null
  },
  "128-182": {
    "id": 454,
    "from_digimon_id": 128,
    "to_digimon_id": 182,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "def": 75
    },
    "dna_requirement": null
  },
  "128-216": {
    "id": 456,
    "from_digimon_id": 128,
    "to_digimon_id": 216,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 90,
      "spd": 70
    },
    "dna_requirement": null
  },
  "129-176": {
    "id": 458,
    "from_digimon_id": 129,
    "to_digimon_id": 176,
    "level_required": 30,
    "stat_requirements": {
      "hp": 700,
      "def": 75
    },
    "dna_requirement": null
  },
  "130-143": {
    "id": 460,
    "from_digimon_id": 130,
    "to_digimon_id": 143,
    "level_required": 28,
    "stat_requirements": {
      "atk": 65,
      "int": 75,
      "spd": 85
    },
    "dna_requirement": null
  },
  "130-208": {
    "id": 462,
    "from_digimon_id": 130,
    "to_digimon_id": 208,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "spd": 90
    },
    "dna_requirement": null
  },
  "131-185": {
    "id": 464,
    "from_digimon_id": 131,
    "to_digimon_id": 185,
    "level_required": 28,
    "stat_requirements": {
      "hp": 350,
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "112-144": {
    "id": 402,
    "from_digimon_id": 112,
    "to_digimon_id": 144,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  "112-182": {
    "id": 405,
    "from_digimon_id": 112,
    "to_digimon_id": 182,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "def": 75
    },
    "dna_requirement": null
  },
  "114-199": {
    "id": 407,
    "from_digimon_id": 114,
    "to_digimon_id": 199,
    "level_required": 26,
    "stat_requirements": {
      "atk": 75,
      "def": 80
    },
    "dna_requirement": null
  },
  "114-204": {
    "id": 409,
    "from_digimon_id": 114,
    "to_digimon_id": 204,
    "level_required": 30,
    "stat_requirements": {
      "hp": 450,
      "atk": 110
    },
    "dna_requirement": null
  },
  "115-152": {
    "id": 411,
    "from_digimon_id": 115,
    "to_digimon_id": 152,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "int": 100
    },
    "dna_requirement": null
  },
  "133-207": {
    "id": 471,
    "from_digimon_id": 133,
    "to_digimon_id": 207,
    "level_required": 26,
    "stat_requirements": {
      "hp": 600,
      "atk": 60
    },
    "dna_requirement": null
  },
  "137-185": {
    "id": 475,
    "from_digimon_id": 137,
    "to_digimon_id": 185,
    "level_required": 28,
    "stat_requirements": {
      "hp": 350,
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "139-188": {
    "id": 479,
    "from_digimon_id": 139,
    "to_digimon_id": 188,
    "level_required": 26,
    "stat_requirements": {
      "sp": 75,
      "int": 80,
      "spd": 80
    },
    "dna_requirement": null
  },
  "140-158": {
    "id": 483,
    "from_digimon_id": 140,
    "to_digimon_id": 158,
    "level_required": 28,
    "stat_requirements": {
      "def": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "141-237": {
    "id": 485,
    "from_digimon_id": 141,
    "to_digimon_id": 237,
    "level_required": 45,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 120,
      "def": 120
    },
    "dna_requirement": null
  },
  "141-280": {
    "id": 486,
    "from_digimon_id": 141,
    "to_digimon_id": 280,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1100,
      "abi": 20,
      "def": 150,
      "int": 120
    },
    "dna_requirement": null
  },
  "143-260": {
    "id": 490,
    "from_digimon_id": 143,
    "to_digimon_id": 260,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1100,
      "abi": 20,
      "atk": 180,
      "spd": 130
    },
    "dna_requirement": null
  },
  "144-241": {
    "id": 492,
    "from_digimon_id": 144,
    "to_digimon_id": 241,
    "level_required": 60,
    "stat_requirements": {
      "sp": 110,
      "abi": 80,
      "def": 180,
      "int": 140
    },
    "dna_requirement": null
  },
  "144-269": {
    "id": 494,
    "from_digimon_id": 144,
    "to_digimon_id": 269,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 100,
      "def": 130,
      "int": 100
    },
    "dna_requirement": null
  },
  "145-296": {
    "id": 497,
    "from_digimon_id": 145,
    "to_digimon_id": 296,
    "level_required": 45,
    "stat_requirements": {
      "sp": 100,
      "abi": 20,
      "atk": 120,
      "def": 140
    },
    "dna_requirement": null
  },
  "146-227": {
    "id": 498,
    "from_digimon_id": 146,
    "to_digimon_id": 227,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1200,
      "sp": 110,
      "abi": 40,
      "atk": 110,
      "int": 110
    },
    "dna_requirement": null
  },
  "147-273": {
    "id": 504,
    "from_digimon_id": 147,
    "to_digimon_id": 273,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "int": 160,
      "spd": 110
    },
    "dna_requirement": null
  },
  "151-275": {
    "id": 512,
    "from_digimon_id": 151,
    "to_digimon_id": 275,
    "level_required": 65,
    "stat_requirements": {
      "abi": 10
    },
    "dna_requirement": null
  },
  "152-229": {
    "id": 516,
    "from_digimon_id": 152,
    "to_digimon_id": 229,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 40,
      "def": 120,
      "int": 145
    },
    "dna_requirement": null
  },
  "153-237": {
    "id": 520,
    "from_digimon_id": 153,
    "to_digimon_id": 237,
    "level_required": 45,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 120,
      "def": 120
    },
    "dna_requirement": null
  },
  "154-284": {
    "id": 524,
    "from_digimon_id": 154,
    "to_digimon_id": 284,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "int": 130,
      "spd": 150
    },
    "dna_requirement": null
  },
  "154-226": {
    "id": 526,
    "from_digimon_id": 154,
    "to_digimon_id": 226,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 40,
      "int": 145,
      "spd": 130
    },
    "dna_requirement": null
  },
  "156-239": {
    "id": 528,
    "from_digimon_id": 156,
    "to_digimon_id": 239,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "def": 160,
      "spd": 120
    },
    "dna_requirement": null
  },
  "355-356": {
    "id": 924,
    "from_digimon_id": 355,
    "to_digimon_id": 356,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1870,
      "abi": 40,
      "atk": 200
    },
    "dna_requirement": null
  },
  "115-212": {
    "id": 413,
    "from_digimon_id": 115,
    "to_digimon_id": 212,
    "level_required": 30,
    "stat_requirements": {
      "int": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "116-146": {
    "id": 415,
    "from_digimon_id": 116,
    "to_digimon_id": 146,
    "level_required": 30,
    "stat_requirements": {
      "atk": 95,
      "spd": 80
    },
    "dna_requirement": null
  },
  "116-192": {
    "id": 417,
    "from_digimon_id": 116,
    "to_digimon_id": 192,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 80,
      "int": 70
    },
    "dna_requirement": null
  },
  "116-169": {
    "id": 419,
    "from_digimon_id": 116,
    "to_digimon_id": 169,
    "level_required": 28,
    "stat_requirements": {
      "atk": 80,
      "int": 70
    },
    "dna_requirement": null
  },
  "118-198": {
    "id": 421,
    "from_digimon_id": 118,
    "to_digimon_id": 198,
    "level_required": 26,
    "stat_requirements": {
      "atk": 75,
      "spd": 80
    },
    "dna_requirement": null
  },
  "119-174": {
    "id": 423,
    "from_digimon_id": 119,
    "to_digimon_id": 174,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "spd": 100
    },
    "dna_requirement": null
  },
  "119-209": {
    "id": 425,
    "from_digimon_id": 119,
    "to_digimon_id": 209,
    "level_required": 30,
    "stat_requirements": {
      "hp": 350,
      "atk": 100,
      "spd": 75
    },
    "dna_requirement": null
  },
  "120-145": {
    "id": 427,
    "from_digimon_id": 120,
    "to_digimon_id": 145,
    "level_required": 26,
    "stat_requirements": {
      "def": 110
    },
    "dna_requirement": null
  },
  "120-176": {
    "id": 429,
    "from_digimon_id": 120,
    "to_digimon_id": 176,
    "level_required": 30,
    "stat_requirements": {
      "hp": 700,
      "def": 75
    },
    "dna_requirement": null
  },
  "121-191": {
    "id": 431,
    "from_digimon_id": 121,
    "to_digimon_id": 191,
    "level_required": 32,
    "stat_requirements": {},
    "dna_requirement": null
  },
  "122-150": {
    "id": 433,
    "from_digimon_id": 122,
    "to_digimon_id": 150,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "spd": 95
    },
    "dna_requirement": null
  },
  "122-149": {
    "id": 437,
    "from_digimon_id": 122,
    "to_digimon_id": 149,
    "level_required": 30,
    "stat_requirements": {
      "hp": 500,
      "atk": 120,
      "def": 60
    },
    "dna_requirement": null
  },
  "124-147": {
    "id": 439,
    "from_digimon_id": 124,
    "to_digimon_id": 147,
    "level_required": 30,
    "stat_requirements": {
      "abi": 10,
      "atk": 70,
      "int": 90
    },
    "dna_requirement": null
  },
  "124-192": {
    "id": 441,
    "from_digimon_id": 124,
    "to_digimon_id": 192,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 80,
      "int": 70
    },
    "dna_requirement": null
  },
  "124-190": {
    "id": 443,
    "from_digimon_id": 124,
    "to_digimon_id": 190,
    "level_required": 28,
    "stat_requirements": {
      "sp": 80,
      "int": 80
    },
    "dna_requirement": null
  },
  "125-202": {
    "id": 447,
    "from_digimon_id": 125,
    "to_digimon_id": 202,
    "level_required": 30,
    "stat_requirements": {
      "atk": 105,
      "spd": 75
    },
    "dna_requirement": null
  },
  "127-206": {
    "id": 451,
    "from_digimon_id": 127,
    "to_digimon_id": 206,
    "level_required": 26,
    "stat_requirements": {
      "def": 80,
      "int": 65
    },
    "dna_requirement": null
  },
  "128-214": {
    "id": 455,
    "from_digimon_id": 128,
    "to_digimon_id": 214,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "int": 95
    },
    "dna_requirement": null
  },
  "129-210": {
    "id": 459,
    "from_digimon_id": 129,
    "to_digimon_id": 210,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  "131-177": {
    "id": 463,
    "from_digimon_id": 131,
    "to_digimon_id": 177,
    "level_required": 28,
    "stat_requirements": {
      "hp": 500,
      "atk": 95
    },
    "dna_requirement": null
  },
  "131-149": {
    "id": 467,
    "from_digimon_id": 131,
    "to_digimon_id": 149,
    "level_required": 30,
    "stat_requirements": {
      "hp": 500,
      "atk": 120,
      "def": 60
    },
    "dna_requirement": null
  },
  "152-285": {
    "id": 517,
    "from_digimon_id": 152,
    "to_digimon_id": 285,
    "level_required": 55,
    "stat_requirements": {
      "hp": 900,
      "sp": 120,
      "abi": 20,
      "int": 145
    },
    "dna_requirement": null
  },
  "152-225": {
    "id": 519,
    "from_digimon_id": 152,
    "to_digimon_id": 225,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "int": 130,
      "spd": 160
    },
    "dna_requirement": null
  },
  "153-260": {
    "id": 521,
    "from_digimon_id": 153,
    "to_digimon_id": 260,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1100,
      "abi": 20,
      "atk": 180,
      "spd": 130
    },
    "dna_requirement": null
  },
  "154-250": {
    "id": 523,
    "from_digimon_id": 154,
    "to_digimon_id": 250,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1000,
      "abi": 20,
      "atk": 130,
      "def": 110
    },
    "dna_requirement": null
  },
  "156-294": {
    "id": 529,
    "from_digimon_id": 156,
    "to_digimon_id": 294,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 130,
      "def": 130
    },
    "dna_requirement": null
  },
  "156-295": {
    "id": 533,
    "from_digimon_id": 156,
    "to_digimon_id": 295,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1700,
      "abi": 40,
      "atk": 180
    },
    "dna_requirement": null
  },
  "160-245": {
    "id": 537,
    "from_digimon_id": 160,
    "to_digimon_id": 245,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 145,
      "spd": 120
    },
    "dna_requirement": null
  },
  "163-219": {
    "id": 541,
    "from_digimon_id": 163,
    "to_digimon_id": 219,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 150,
      "def": 170,
      "int": 135
    },
    "dna_requirement": null
  },
  "179-279": {
    "id": 578,
    "from_digimon_id": 179,
    "to_digimon_id": 279,
    "level_required": 50,
    "stat_requirements": {
      "sp": 100,
      "abi": 20,
      "def": 120,
      "int": 145
    },
    "dna_requirement": null
  },
  "181-251": {
    "id": 582,
    "from_digimon_id": 181,
    "to_digimon_id": 251,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "def": 140,
      "int": 120,
      "spd": 150
    },
    "dna_requirement": null
  },
  "182-306": {
    "id": 586,
    "from_digimon_id": 182,
    "to_digimon_id": 306,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 120,
      "int": 135,
      "spd": 150
    },
    "dna_requirement": null
  },
  "183-239": {
    "id": 588,
    "from_digimon_id": 183,
    "to_digimon_id": 239,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "def": 160,
      "spd": 120
    },
    "dna_requirement": null
  },
  "185-245": {
    "id": 592,
    "from_digimon_id": 185,
    "to_digimon_id": 245,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 145,
      "spd": 120
    },
    "dna_requirement": null
  },
  "185-292": {
    "id": 594,
    "from_digimon_id": 185,
    "to_digimon_id": 292,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  "187-286": {
    "id": 596,
    "from_digimon_id": 187,
    "to_digimon_id": 286,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 145,
      "def": 100
    },
    "dna_requirement": null
  },
  "188-229": {
    "id": 598,
    "from_digimon_id": 188,
    "to_digimon_id": 229,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 40,
      "def": 120,
      "int": 145
    },
    "dna_requirement": null
  },
  "188-290": {
    "id": 600,
    "from_digimon_id": 188,
    "to_digimon_id": 290,
    "level_required": 50,
    "stat_requirements": {
      "sp": 110,
      "abi": 20,
      "int": 135
    },
    "dna_requirement": null
  },
  "191-277": {
    "id": 602,
    "from_digimon_id": 191,
    "to_digimon_id": 277,
    "level_required": 45,
    "stat_requirements": {
      "abi": 20,
      "def": 150
    },
    "dna_requirement": null
  },
  "192-286": {
    "id": 606,
    "from_digimon_id": 192,
    "to_digimon_id": 286,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 145,
      "def": 100
    },
    "dna_requirement": null
  },
  "193-221": {
    "id": 608,
    "from_digimon_id": 193,
    "to_digimon_id": 221,
    "level_required": 45,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 120
    },
    "dna_requirement": null
  },
  "193-280": {
    "id": 610,
    "from_digimon_id": 193,
    "to_digimon_id": 280,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1100,
      "abi": 20,
      "def": 150,
      "int": 120
    },
    "dna_requirement": null
  },
  "194-290": {
    "id": 612,
    "from_digimon_id": 194,
    "to_digimon_id": 290,
    "level_required": 50,
    "stat_requirements": {
      "sp": 110,
      "abi": 20,
      "int": 135
    },
    "dna_requirement": null
  },
  "194-268": {
    "id": 614,
    "from_digimon_id": 194,
    "to_digimon_id": 268,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1000,
      "sp": 100,
      "abi": 20,
      "int": 130
    },
    "dna_requirement": null
  },
  "199-228": {
    "id": 624,
    "from_digimon_id": 199,
    "to_digimon_id": 228,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1700,
      "abi": 20,
      "atk": 160,
      "def": 130
    },
    "dna_requirement": null
  },
  "199-277": {
    "id": 626,
    "from_digimon_id": 199,
    "to_digimon_id": 277,
    "level_required": 45,
    "stat_requirements": {
      "abi": 20,
      "def": 150
    },
    "dna_requirement": null
  },
  "200-299": {
    "id": 628,
    "from_digimon_id": 200,
    "to_digimon_id": 299,
    "level_required": 50,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "def": 120,
      "int": 120
    },
    "dna_requirement": null
  },
  "201-276": {
    "id": 632,
    "from_digimon_id": 201,
    "to_digimon_id": 276,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1800,
      "abi": 20,
      "atk": 140,
      "def": 140
    },
    "dna_requirement": null
  },
  "202-295": {
    "id": 640,
    "from_digimon_id": 202,
    "to_digimon_id": 295,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1700,
      "abi": 40,
      "atk": 180
    },
    "dna_requirement": null
  },
  "204-228": {
    "id": 644,
    "from_digimon_id": 204,
    "to_digimon_id": 228,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1700,
      "abi": 20,
      "atk": 160,
      "def": 130
    },
    "dna_requirement": null
  },
  "355-357": {
    "id": 925,
    "from_digimon_id": 355,
    "to_digimon_id": 357,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 155,
      "def": 155,
      "int": 155
    },
    "dna_requirement": null
  },
  "164-232": {
    "id": 545,
    "from_digimon_id": 164,
    "to_digimon_id": 232,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 130,
      "def": 130,
      "int": 130
    },
    "dna_requirement": null
  },
  "165-274": {
    "id": 549,
    "from_digimon_id": 165,
    "to_digimon_id": 274,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "def": 130,
      "int": 130
    },
    "dna_requirement": null
  },
  "167-275": {
    "id": 557,
    "from_digimon_id": 167,
    "to_digimon_id": 275,
    "level_required": 65,
    "stat_requirements": {
      "abi": 10
    },
    "dna_requirement": null
  },
  "168-257": {
    "id": 559,
    "from_digimon_id": 168,
    "to_digimon_id": 257,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1400,
      "abi": 20,
      "atk": 150,
      "int": 120
    },
    "dna_requirement": null
  },
  "170-224": {
    "id": 561,
    "from_digimon_id": 170,
    "to_digimon_id": 224,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1700,
      "abi": 20,
      "atk": 130,
      "def": 130,
      "int": 120
    },
    "dna_requirement": null
  },
  "170-297": {
    "id": 563,
    "from_digimon_id": 170,
    "to_digimon_id": 297,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "def": 120,
      "spd": 150
    },
    "dna_requirement": null
  },
  "172-236": {
    "id": 565,
    "from_digimon_id": 172,
    "to_digimon_id": 236,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 135,
      "spd": 120
    },
    "dna_requirement": null
  },
  "172-259": {
    "id": 567,
    "from_digimon_id": 172,
    "to_digimon_id": 259,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "def": 120,
      "int": 130,
      "spd": 130
    },
    "dna_requirement": null
  },
  "177-234": {
    "id": 574,
    "from_digimon_id": 177,
    "to_digimon_id": 234,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1700,
      "abi": 80,
      "atk": 145,
      "def": 120
    },
    "dna_requirement": null
  },
  "195-253": {
    "id": 616,
    "from_digimon_id": 195,
    "to_digimon_id": 253,
    "level_required": 55,
    "stat_requirements": {
      "sp": 130,
      "abi": 40,
      "def": 130,
      "int": 150
    },
    "dna_requirement": null
  },
  "198-254": {
    "id": 620,
    "from_digimon_id": 198,
    "to_digimon_id": 254,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "def": 130,
      "spd": 130
    },
    "dna_requirement": null
  },
  "198-292": {
    "id": 622,
    "from_digimon_id": 198,
    "to_digimon_id": 292,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  "158-239": {
    "id": 534,
    "from_digimon_id": 158,
    "to_digimon_id": 239,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "def": 160,
      "spd": 120
    },
    "dna_requirement": null
  },
  "158-256": {
    "id": 536,
    "from_digimon_id": 158,
    "to_digimon_id": 256,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1000,
      "abi": 20,
      "atk": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  "160-265": {
    "id": 538,
    "from_digimon_id": 160,
    "to_digimon_id": 265,
    "level_required": 60,
    "stat_requirements": {
      "sp": 100,
      "abi": 80,
      "int": 120,
      "spd": 140
    },
    "dna_requirement": null
  },
  "160-270": {
    "id": 540,
    "from_digimon_id": 160,
    "to_digimon_id": 270,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 135
    },
    "dna_requirement": null
  },
  "164-224": {
    "id": 544,
    "from_digimon_id": 164,
    "to_digimon_id": 224,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1700,
      "abi": 20,
      "atk": 130,
      "def": 130,
      "int": 120
    },
    "dna_requirement": null
  },
  "164-243": {
    "id": 546,
    "from_digimon_id": 164,
    "to_digimon_id": 243,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 40,
      "int": 145,
      "spd": 100
    },
    "dna_requirement": null
  },
  "165-237": {
    "id": 548,
    "from_digimon_id": 165,
    "to_digimon_id": 237,
    "level_required": 45,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 120,
      "def": 120
    },
    "dna_requirement": null
  },
  "166-246": {
    "id": 550,
    "from_digimon_id": 166,
    "to_digimon_id": 246,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 120,
      "spd": 120
    },
    "dna_requirement": null
  },
  "179-224": {
    "id": 577,
    "from_digimon_id": 179,
    "to_digimon_id": 224,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1700,
      "abi": 20,
      "atk": 130,
      "def": 130,
      "int": 120
    },
    "dna_requirement": null
  },
  "179-302": {
    "id": 579,
    "from_digimon_id": 179,
    "to_digimon_id": 302,
    "level_required": 60,
    "stat_requirements": {
      "hp": 2000,
      "sp": 140,
      "abi": 80,
      "atk": 140,
      "def": 140,
      "int": 140
    },
    "dna_requirement": null
  },
  "181-219": {
    "id": 581,
    "from_digimon_id": 181,
    "to_digimon_id": 219,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 150,
      "def": 170,
      "int": 135
    },
    "dna_requirement": null
  },
  "181-267": {
    "id": 583,
    "from_digimon_id": 181,
    "to_digimon_id": 267,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1600,
      "abi": 20,
      "atk": 160
    },
    "dna_requirement": null
  },
  "182-265": {
    "id": 585,
    "from_digimon_id": 182,
    "to_digimon_id": 265,
    "level_required": 60,
    "stat_requirements": {
      "sp": 100,
      "abi": 80,
      "int": 120,
      "spd": 140
    },
    "dna_requirement": null
  },
  "184-222": {
    "id": 591,
    "from_digimon_id": 184,
    "to_digimon_id": 222,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1600,
      "abi": 20,
      "def": 150,
      "spd": 150
    },
    "dna_requirement": null
  },
  "187-274": {
    "id": 595,
    "from_digimon_id": 187,
    "to_digimon_id": 274,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "def": 130,
      "int": 130
    },
    "dna_requirement": null
  },
  "188-284": {
    "id": 599,
    "from_digimon_id": 188,
    "to_digimon_id": 284,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "int": 130,
      "spd": 150
    },
    "dna_requirement": null
  },
  "191-296": {
    "id": 603,
    "from_digimon_id": 191,
    "to_digimon_id": 296,
    "level_required": 45,
    "stat_requirements": {
      "sp": 100,
      "abi": 20,
      "atk": 120,
      "def": 140
    },
    "dna_requirement": null
  },
  "192-255": {
    "id": 607,
    "from_digimon_id": 192,
    "to_digimon_id": 255,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 150,
      "def": 140
    },
    "dna_requirement": null
  },
  "194-279": {
    "id": 611,
    "from_digimon_id": 194,
    "to_digimon_id": 279,
    "level_required": 50,
    "stat_requirements": {
      "sp": 100,
      "abi": 20,
      "def": 120,
      "int": 145
    },
    "dna_requirement": null
  },
  "195-244": {
    "id": 619,
    "from_digimon_id": 195,
    "to_digimon_id": 244,
    "level_required": 55,
    "stat_requirements": {
      "abi": 40,
      "atk": 130,
      "def": 120,
      "int": 120
    },
    "dna_requirement": null
  },
  "198-300": {
    "id": 623,
    "from_digimon_id": 198,
    "to_digimon_id": 300,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "int": 110,
      "spd": 160
    },
    "dna_requirement": null
  },
  "201-220": {
    "id": 631,
    "from_digimon_id": 201,
    "to_digimon_id": 220,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 120,
      "spd": 145
    },
    "dna_requirement": null
  },
  "201-294": {
    "id": 633,
    "from_digimon_id": 201,
    "to_digimon_id": 294,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 130,
      "def": 130
    },
    "dna_requirement": null
  },
  "202-262": {
    "id": 637,
    "from_digimon_id": 202,
    "to_digimon_id": 262,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 140,
      "def": 140,
      "int": 140
    },
    "dna_requirement": null
  },
  "202-255": {
    "id": 639,
    "from_digimon_id": 202,
    "to_digimon_id": 255,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 150,
      "def": 140
    },
    "dna_requirement": null
  },
  "203-228": {
    "id": 641,
    "from_digimon_id": 203,
    "to_digimon_id": 228,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1700,
      "abi": 20,
      "atk": 160,
      "def": 130
    },
    "dna_requirement": null
  },
  "203-301": {
    "id": 643,
    "from_digimon_id": 203,
    "to_digimon_id": 301,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 180,
      "def": 150
    },
    "dna_requirement": null
  },
  "204-230": {
    "id": 645,
    "from_digimon_id": 204,
    "to_digimon_id": 230,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 100,
      "spd": 100
    },
    "dna_requirement": null
  },
  "204-242": {
    "id": 647,
    "from_digimon_id": 204,
    "to_digimon_id": 242,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1100,
      "sp": 100,
      "abi": 40,
      "int": 100
    },
    "dna_requirement": null
  },
  "206-221": {
    "id": 652,
    "from_digimon_id": 206,
    "to_digimon_id": 221,
    "level_required": 45,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 120
    },
    "dna_requirement": null
  },
  "207-246": {
    "id": 656,
    "from_digimon_id": 207,
    "to_digimon_id": 246,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 120,
      "spd": 120
    },
    "dna_requirement": null
  },
  "214-360": {
    "id": 926,
    "from_digimon_id": 214,
    "to_digimon_id": 360,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1900,
      "abi": 80,
      "int": 250,
      "spd": 140
    },
    "dna_requirement": null
  },
  "166-284": {
    "id": 552,
    "from_digimon_id": 166,
    "to_digimon_id": 284,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "int": 130,
      "spd": 150
    },
    "dna_requirement": null
  },
  "166-240": {
    "id": 554,
    "from_digimon_id": 166,
    "to_digimon_id": 240,
    "level_required": 50,
    "stat_requirements": {
      "sp": 110,
      "abi": 20,
      "int": 140
    },
    "dna_requirement": null
  },
  "168-248": {
    "id": 558,
    "from_digimon_id": 168,
    "to_digimon_id": 248,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 140,
      "spd": 130
    },
    "dna_requirement": null
  },
  "170-290": {
    "id": 562,
    "from_digimon_id": 170,
    "to_digimon_id": 290,
    "level_required": 50,
    "stat_requirements": {
      "sp": 110,
      "abi": 20,
      "int": 135
    },
    "dna_requirement": null
  },
  "172-246": {
    "id": 566,
    "from_digimon_id": 172,
    "to_digimon_id": 246,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 120,
      "spd": 120
    },
    "dna_requirement": null
  },
  "174-253": {
    "id": 569,
    "from_digimon_id": 174,
    "to_digimon_id": 253,
    "level_required": 55,
    "stat_requirements": {
      "sp": 130,
      "abi": 40,
      "def": 130,
      "int": 150
    },
    "dna_requirement": null
  },
  "176-257": {
    "id": 571,
    "from_digimon_id": 176,
    "to_digimon_id": 257,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1400,
      "abi": 20,
      "atk": 150,
      "int": 120
    },
    "dna_requirement": null
  },
  "176-291": {
    "id": 573,
    "from_digimon_id": 176,
    "to_digimon_id": 291,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 150,
      "spd": 140
    },
    "dna_requirement": null
  },
  "200-279": {
    "id": 627,
    "from_digimon_id": 200,
    "to_digimon_id": 279,
    "level_required": 50,
    "stat_requirements": {
      "sp": 100,
      "abi": 20,
      "def": 120,
      "int": 145
    },
    "dna_requirement": null
  },
  "200-302": {
    "id": 629,
    "from_digimon_id": 200,
    "to_digimon_id": 302,
    "level_required": 60,
    "stat_requirements": {
      "hp": 2000,
      "sp": 140,
      "abi": 80,
      "atk": 140,
      "def": 140,
      "int": 140
    },
    "dna_requirement": null
  },
  "205-278": {
    "id": 651,
    "from_digimon_id": 205,
    "to_digimon_id": 278,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 160,
      "def": 140
    },
    "dna_requirement": null
  },
  "206-269": {
    "id": 653,
    "from_digimon_id": 206,
    "to_digimon_id": 269,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 100,
      "def": 130,
      "int": 100
    },
    "dna_requirement": null
  },
  "207-245": {
    "id": 655,
    "from_digimon_id": 207,
    "to_digimon_id": 245,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 145,
      "spd": 120
    },
    "dna_requirement": null
  },
  "359-361": {
    "id": 927,
    "from_digimon_id": 359,
    "to_digimon_id": 361,
    "level_required": 60,
    "stat_requirements": {
      "hp": 2090,
      "abi": 80,
      "int": 275,
      "spd": 150
    },
    "dna_requirement": null
  },
  "207-291": {
    "id": 657,
    "from_digimon_id": 207,
    "to_digimon_id": 291,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 150,
      "spd": 140
    },
    "dna_requirement": null
  },
  "208-226": {
    "id": 661,
    "from_digimon_id": 208,
    "to_digimon_id": 226,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 40,
      "int": 145,
      "spd": 130
    },
    "dna_requirement": null
  },
  "38-120": {
    "id": 727,
    "from_digimon_id": 38,
    "to_digimon_id": 120,
    "level_required": 12,
    "stat_requirements": {
      "atk": 40,
      "def": 40
    },
    "dna_requirement": null
  },
  "42-69": {
    "id": 729,
    "from_digimon_id": 42,
    "to_digimon_id": 69,
    "level_required": 16,
    "stat_requirements": {
      "atk": 50,
      "int": 40
    },
    "dna_requirement": null
  },
  "42-136": {
    "id": 731,
    "from_digimon_id": 42,
    "to_digimon_id": 136,
    "level_required": 12,
    "stat_requirements": {
      "hp": 500
    },
    "dna_requirement": null
  },
  "42-116": {
    "id": 733,
    "from_digimon_id": 42,
    "to_digimon_id": 116,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "atk": 40
    },
    "dna_requirement": null
  },
  "43-125": {
    "id": 736,
    "from_digimon_id": 43,
    "to_digimon_id": 125,
    "level_required": 16,
    "stat_requirements": {
      "atk": 40,
      "spd": 35
    },
    "dna_requirement": null
  },
  "52-80": {
    "id": 738,
    "from_digimon_id": 52,
    "to_digimon_id": 80,
    "level_required": 14,
    "stat_requirements": {
      "hp": 130,
      "def": 60
    },
    "dna_requirement": null
  },
  "52-108": {
    "id": 740,
    "from_digimon_id": 52,
    "to_digimon_id": 108,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 55
    },
    "dna_requirement": null
  },
  "57-74": {
    "id": 744,
    "from_digimon_id": 57,
    "to_digimon_id": 74,
    "level_required": 14,
    "stat_requirements": {
      "hp": 500
    },
    "dna_requirement": null
  },
  "61-101": {
    "id": 752,
    "from_digimon_id": 61,
    "to_digimon_id": 101,
    "level_required": 15,
    "stat_requirements": {
      "atk": 50,
      "spd": 55
    },
    "dna_requirement": null
  },
  "61-115": {
    "id": 755,
    "from_digimon_id": 61,
    "to_digimon_id": 115,
    "level_required": 16,
    "stat_requirements": {
      "int": 40
    },
    "dna_requirement": null
  },
  "66-185": {
    "id": 757,
    "from_digimon_id": 66,
    "to_digimon_id": 185,
    "level_required": 28,
    "stat_requirements": {
      "hp": 350,
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "68-149": {
    "id": 759,
    "from_digimon_id": 68,
    "to_digimon_id": 149,
    "level_required": 30,
    "stat_requirements": {
      "hp": 500,
      "atk": 120,
      "def": 60
    },
    "dna_requirement": null
  },
  "68-177": {
    "id": 761,
    "from_digimon_id": 68,
    "to_digimon_id": 177,
    "level_required": 28,
    "stat_requirements": {
      "hp": 500,
      "atk": 95
    },
    "dna_requirement": null
  },
  "69-142": {
    "id": 763,
    "from_digimon_id": 69,
    "to_digimon_id": 142,
    "level_required": 30,
    "stat_requirements": {
      "atk": 110,
      "int": 85
    },
    "dna_requirement": null
  },
  "69-146": {
    "id": 765,
    "from_digimon_id": 69,
    "to_digimon_id": 146,
    "level_required": 30,
    "stat_requirements": {
      "atk": 95,
      "spd": 80
    },
    "dna_requirement": null
  },
  "73-182": {
    "id": 767,
    "from_digimon_id": 73,
    "to_digimon_id": 182,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "def": 75
    },
    "dna_requirement": null
  },
  "75-148": {
    "id": 769,
    "from_digimon_id": 75,
    "to_digimon_id": 148,
    "level_required": 30,
    "stat_requirements": {
      "abi": 10,
      "atk": 80,
      "spd": 95
    },
    "dna_requirement": null
  },
  "75-201": {
    "id": 771,
    "from_digimon_id": 75,
    "to_digimon_id": 201,
    "level_required": 26,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "spd": 75
    },
    "dna_requirement": null
  },
  "209-230": {
    "id": 663,
    "from_digimon_id": 209,
    "to_digimon_id": 230,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 100,
      "spd": 100
    },
    "dna_requirement": null
  },
  "209-252": {
    "id": 665,
    "from_digimon_id": 209,
    "to_digimon_id": 252,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 130,
      "spd": 130
    },
    "dna_requirement": null
  },
  "210-307": {
    "id": 667,
    "from_digimon_id": 210,
    "to_digimon_id": 307,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 120
    },
    "dna_requirement": null
  },
  "211-254": {
    "id": 669,
    "from_digimon_id": 211,
    "to_digimon_id": 254,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "def": 130,
      "spd": 130
    },
    "dna_requirement": null
  },
  "212-307": {
    "id": 673,
    "from_digimon_id": 212,
    "to_digimon_id": 307,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 120
    },
    "dna_requirement": null
  },
  "215-298": {
    "id": 681,
    "from_digimon_id": 215,
    "to_digimon_id": 298,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "def": 135,
      "spd": 125
    },
    "dna_requirement": null
  },
  "216-300": {
    "id": 685,
    "from_digimon_id": 216,
    "to_digimon_id": 300,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "int": 110,
      "spd": 160
    },
    "dna_requirement": null
  },
  "219-312": {
    "id": 689,
    "from_digimon_id": 219,
    "to_digimon_id": 312,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 180,
      "def": 170,
      "int": 150
    },
    "dna_requirement": 331
  },
  "228-315": {
    "id": 693,
    "from_digimon_id": 228,
    "to_digimon_id": 315,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 200,
      "int": 150,
      "spd": 150
    },
    "dna_requirement": 297
  },
  "265-266": {
    "id": 697,
    "from_digimon_id": 265,
    "to_digimon_id": 266,
    "level_required": 0,
    "stat_requirements": {},
    "dna_requirement": null
  },
  "273-332": {
    "id": 701,
    "from_digimon_id": 273,
    "to_digimon_id": 332,
    "level_required": 99,
    "stat_requirements": {
      "abi": 120
    },
    "dna_requirement": null
  },
  "281-282": {
    "id": 705,
    "from_digimon_id": 281,
    "to_digimon_id": 282,
    "level_required": 80,
    "stat_requirements": {
      "hp": 2100,
      "abi": 100,
      "atk": 300,
      "spd": 220
    },
    "dna_requirement": null
  },
  "298-316": {
    "id": 711,
    "from_digimon_id": 298,
    "to_digimon_id": 316,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1500,
      "abi": 40,
      "atk": 150,
      "def": 200
    },
    "dna_requirement": 276
  },
  "304-305": {
    "id": 713,
    "from_digimon_id": 304,
    "to_digimon_id": 305,
    "level_required": 60,
    "stat_requirements": {
      "sp": 160,
      "abi": 30,
      "spd": 250
    },
    "dna_requirement": null
  },
  "80-161": {
    "id": 773,
    "from_digimon_id": 80,
    "to_digimon_id": 161,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 80,
      "spd": 70
    },
    "dna_requirement": null
  },
  "321-283": {
    "id": 715,
    "from_digimon_id": 321,
    "to_digimon_id": 283,
    "level_required": 0,
    "stat_requirements": {},
    "dna_requirement": null
  },
  "6-20": {
    "id": 717,
    "from_digimon_id": 6,
    "to_digimon_id": 20,
    "level_required": 6,
    "stat_requirements": {
      "atk": 90,
      "spd": 20
    },
    "dna_requirement": null
  },
  "20-89": {
    "id": 719,
    "from_digimon_id": 20,
    "to_digimon_id": 89,
    "level_required": 16,
    "stat_requirements": {
      "hp": 150,
      "atk": 40
    },
    "dna_requirement": null
  },
  "36-110": {
    "id": 721,
    "from_digimon_id": 36,
    "to_digimon_id": 110,
    "level_required": 20,
    "stat_requirements": {
      "atk": 50,
      "spd": 50
    },
    "dna_requirement": null
  },
  "36-98": {
    "id": 723,
    "from_digimon_id": 36,
    "to_digimon_id": 98,
    "level_required": 18,
    "stat_requirements": {
      "abi": 5
    },
    "dna_requirement": null
  },
  "38-136": {
    "id": 725,
    "from_digimon_id": 38,
    "to_digimon_id": 136,
    "level_required": 12,
    "stat_requirements": {
      "hp": 500
    },
    "dna_requirement": null
  },
  "209-248": {
    "id": 664,
    "from_digimon_id": 209,
    "to_digimon_id": 248,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 140,
      "spd": 130
    },
    "dna_requirement": null
  },
  "210-309": {
    "id": 668,
    "from_digimon_id": 210,
    "to_digimon_id": 309,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "int": 170,
      "spd": 130
    },
    "dna_requirement": null
  },
  "15-363": {
    "id": 928,
    "from_digimon_id": 15,
    "to_digimon_id": 363,
    "level_required": 8,
    "stat_requirements": {
      "hp": 75,
      "atk": 20
    },
    "dna_requirement": null
  },
  "211-256": {
    "id": 670,
    "from_digimon_id": 211,
    "to_digimon_id": 256,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1000,
      "abi": 20,
      "atk": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  "212-285": {
    "id": 672,
    "from_digimon_id": 212,
    "to_digimon_id": 285,
    "level_required": 55,
    "stat_requirements": {
      "hp": 900,
      "sp": 120,
      "abi": 20,
      "int": 145
    },
    "dna_requirement": null
  },
  "214-289": {
    "id": 676,
    "from_digimon_id": 214,
    "to_digimon_id": 289,
    "level_required": 60,
    "stat_requirements": {
      "sp": 120,
      "abi": 80,
      "atk": 120,
      "int": 120
    },
    "dna_requirement": 152
  },
  "42-101": {
    "id": 730,
    "from_digimon_id": 42,
    "to_digimon_id": 101,
    "level_required": 15,
    "stat_requirements": {
      "atk": 50,
      "spd": 55
    },
    "dna_requirement": null
  },
  "43-96": {
    "id": 734,
    "from_digimon_id": 43,
    "to_digimon_id": 96,
    "level_required": 14,
    "stat_requirements": {
      "atk": 60,
      "spd": 25
    },
    "dna_requirement": null
  },
  "43-97": {
    "id": 735,
    "from_digimon_id": 43,
    "to_digimon_id": 97,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "def": 25,
      "spd": 40
    },
    "dna_requirement": null
  },
  "52-135": {
    "id": 739,
    "from_digimon_id": 52,
    "to_digimon_id": 135,
    "level_required": 15,
    "stat_requirements": {
      "hp": 130,
      "atk": 50
    },
    "dna_requirement": null
  },
  "52-140": {
    "id": 741,
    "from_digimon_id": 52,
    "to_digimon_id": 140,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  "57-113": {
    "id": 743,
    "from_digimon_id": 57,
    "to_digimon_id": 113,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  "57-102": {
    "id": 745,
    "from_digimon_id": 57,
    "to_digimon_id": 102,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "int": 40
    },
    "dna_requirement": null
  },
  "58-96": {
    "id": 747,
    "from_digimon_id": 58,
    "to_digimon_id": 96,
    "level_required": 14,
    "stat_requirements": {
      "atk": 60,
      "spd": 25
    },
    "dna_requirement": null
  },
  "58-135": {
    "id": 749,
    "from_digimon_id": 58,
    "to_digimon_id": 135,
    "level_required": 15,
    "stat_requirements": {
      "hp": 130,
      "atk": 50
    },
    "dna_requirement": null
  },
  "58-119": {
    "id": 751,
    "from_digimon_id": 58,
    "to_digimon_id": 119,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  "66-145": {
    "id": 756,
    "from_digimon_id": 66,
    "to_digimon_id": 145,
    "level_required": 26,
    "stat_requirements": {
      "def": 110
    },
    "dna_requirement": null
  },
  "68-197": {
    "id": 760,
    "from_digimon_id": 68,
    "to_digimon_id": 197,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "spd": 80
    },
    "dna_requirement": null
  },
  "69-169": {
    "id": 764,
    "from_digimon_id": 69,
    "to_digimon_id": 169,
    "level_required": 28,
    "stat_requirements": {
      "atk": 80,
      "int": 70
    },
    "dna_requirement": null
  },
  "73-215": {
    "id": 768,
    "from_digimon_id": 73,
    "to_digimon_id": 215,
    "level_required": 28,
    "stat_requirements": {
      "atk": 90,
      "spd": 85
    },
    "dna_requirement": null
  },
  "75-203": {
    "id": 772,
    "from_digimon_id": 75,
    "to_digimon_id": 203,
    "level_required": 30,
    "stat_requirements": {
      "hp": 350,
      "atk": 100
    },
    "dna_requirement": null
  },
  "80-144": {
    "id": 775,
    "from_digimon_id": 80,
    "to_digimon_id": 144,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  "80-324": {
    "id": 777,
    "from_digimon_id": 80,
    "to_digimon_id": 324,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 120,
      "def": 145
    },
    "dna_requirement": null
  },
  "214-309": {
    "id": 678,
    "from_digimon_id": 214,
    "to_digimon_id": 309,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "int": 170,
      "spd": 130
    },
    "dna_requirement": null
  },
  "215-297": {
    "id": 680,
    "from_digimon_id": 215,
    "to_digimon_id": 297,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "def": 120,
      "spd": 150
    },
    "dna_requirement": null
  },
  "216-272": {
    "id": 682,
    "from_digimon_id": 216,
    "to_digimon_id": 272,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 130
    },
    "dna_requirement": null
  },
  "216-298": {
    "id": 684,
    "from_digimon_id": 216,
    "to_digimon_id": 298,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "def": 135,
      "spd": 125
    },
    "dna_requirement": null
  },
  "217-227": {
    "id": 686,
    "from_digimon_id": 217,
    "to_digimon_id": 227,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1200,
      "sp": 110,
      "abi": 40,
      "atk": 110,
      "int": 110
    },
    "dna_requirement": null
  },
  "222-313": {
    "id": 690,
    "from_digimon_id": 222,
    "to_digimon_id": 313,
    "level_required": 70,
    "stat_requirements": {
      "abi": 100,
      "atk": 160,
      "def": 160,
      "int": 160,
      "spd": 160
    },
    "dna_requirement": null
  },
  "223-222": {
    "id": 692,
    "from_digimon_id": 223,
    "to_digimon_id": 222,
    "level_required": 0,
    "stat_requirements": {},
    "dna_requirement": null
  },
  "248-249": {
    "id": 694,
    "from_digimon_id": 248,
    "to_digimon_id": 249,
    "level_required": 60,
    "stat_requirements": {
      "hp": 2000,
      "abi": 30,
      "atk": 250
    },
    "dna_requirement": null
  },
  "262-320": {
    "id": 696,
    "from_digimon_id": 262,
    "to_digimon_id": 320,
    "level_required": 80,
    "stat_requirements": {
      "abi": 80,
      "atk": 185,
      "def": 185,
      "int": 185
    },
    "dna_requirement": null
  },
  "266-265": {
    "id": 698,
    "from_digimon_id": 266,
    "to_digimon_id": 265,
    "level_required": 0,
    "stat_requirements": {},
    "dna_requirement": null
  },
  "272-318": {
    "id": 700,
    "from_digimon_id": 272,
    "to_digimon_id": 318,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 155,
      "int": 100
    },
    "dna_requirement": 226
  },
  "274-332": {
    "id": 702,
    "from_digimon_id": 274,
    "to_digimon_id": 332,
    "level_required": 99,
    "stat_requirements": {
      "abi": 120
    },
    "dna_requirement": null
  },
  "283-321": {
    "id": 706,
    "from_digimon_id": 283,
    "to_digimon_id": 321,
    "level_required": 0,
    "stat_requirements": {},
    "dna_requirement": null
  },
  "96-150": {
    "id": 779,
    "from_digimon_id": 96,
    "to_digimon_id": 150,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "spd": 95
    },
    "dna_requirement": null
  },
  "96-192": {
    "id": 780,
    "from_digimon_id": 96,
    "to_digimon_id": 192,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 80,
      "int": 70
    },
    "dna_requirement": null
  },
  "97-159": {
    "id": 781,
    "from_digimon_id": 97,
    "to_digimon_id": 159,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "abi": 10,
      "atk": 125
    },
    "dna_requirement": null
  },
  "294-233": {
    "id": 708,
    "from_digimon_id": 294,
    "to_digimon_id": 233,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 130,
      "def": 120
    },
    "dna_requirement": null
  },
  "297-315": {
    "id": 710,
    "from_digimon_id": 297,
    "to_digimon_id": 315,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 200,
      "int": 150,
      "spd": 150
    },
    "dna_requirement": 228
  },
  "307-308": {
    "id": 714,
    "from_digimon_id": 307,
    "to_digimon_id": 308,
    "level_required": 60,
    "stat_requirements": {
      "sp": 170,
      "abi": 30,
      "int": 180
    },
    "dna_requirement": null
  },
  "20-69": {
    "id": 718,
    "from_digimon_id": 20,
    "to_digimon_id": 69,
    "level_required": 16,
    "stat_requirements": {
      "atk": 50,
      "int": 40
    },
    "dna_requirement": null
  },
  "36-123": {
    "id": 722,
    "from_digimon_id": 36,
    "to_digimon_id": 123,
    "level_required": 16,
    "stat_requirements": {
      "atk": 55,
      "spd": 50
    },
    "dna_requirement": null
  },
  "38-106": {
    "id": 726,
    "from_digimon_id": 38,
    "to_digimon_id": 106,
    "level_required": 12,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  "333-84": {
    "id": 896,
    "from_digimon_id": 333,
    "to_digimon_id": 84,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "spd": 40
    },
    "dna_requirement": null
  },
  "335-336": {
    "id": 898,
    "from_digimon_id": 335,
    "to_digimon_id": 336,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1150,
      "abi": 50,
      "atk": 130,
      "spd": 150
    },
    "dna_requirement": null
  },
  "335-214": {
    "id": 900,
    "from_digimon_id": 335,
    "to_digimon_id": 214,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "int": 95
    },
    "dna_requirement": null
  },
  "328-139": {
    "id": 903,
    "from_digimon_id": 328,
    "to_digimon_id": 139,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "spd": 40
    },
    "dna_requirement": null
  },
  "363-364": {
    "id": 929,
    "from_digimon_id": 363,
    "to_digimon_id": 364,
    "level_required": 15,
    "stat_requirements": {
      "atk": 40,
      "spd": 35
    },
    "dna_requirement": null
  },
  "330-331": {
    "id": 907,
    "from_digimon_id": 330,
    "to_digimon_id": 331,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 180
    },
    "dna_requirement": null
  },
  "136-173": {
    "id": 824,
    "from_digimon_id": 136,
    "to_digimon_id": 173,
    "level_required": 28,
    "stat_requirements": {
      "sp": 70,
      "int": 85
    },
    "dna_requirement": null
  },
  "136-191": {
    "id": 826,
    "from_digimon_id": 136,
    "to_digimon_id": 191,
    "level_required": 32,
    "stat_requirements": {},
    "dna_requirement": null
  },
  "138-162": {
    "id": 828,
    "from_digimon_id": 138,
    "to_digimon_id": 162,
    "level_required": 30,
    "stat_requirements": {
      "sp": 60,
      "atk": 70
    },
    "dna_requirement": null
  },
  "138-198": {
    "id": 830,
    "from_digimon_id": 138,
    "to_digimon_id": 198,
    "level_required": 26,
    "stat_requirements": {
      "atk": 75,
      "spd": 80
    },
    "dna_requirement": null
  },
  "148-252": {
    "id": 834,
    "from_digimon_id": 148,
    "to_digimon_id": 252,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 130,
      "spd": 130
    },
    "dna_requirement": null
  },
  "148-263": {
    "id": 836,
    "from_digimon_id": 148,
    "to_digimon_id": 263,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1200,
      "abi": 80,
      "atk": 140,
      "def": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  "155-287": {
    "id": 838,
    "from_digimon_id": 155,
    "to_digimon_id": 287,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "spd": 160
    },
    "dna_requirement": null
  },
  "157-274": {
    "id": 840,
    "from_digimon_id": 157,
    "to_digimon_id": 274,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "def": 130,
      "int": 130
    },
    "dna_requirement": null
  },
  "159-278": {
    "id": 842,
    "from_digimon_id": 159,
    "to_digimon_id": 278,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 160,
      "def": 140
    },
    "dna_requirement": null
  },
  "161-267": {
    "id": 846,
    "from_digimon_id": 161,
    "to_digimon_id": 267,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1600,
      "abi": 20,
      "atk": 160
    },
    "dna_requirement": null
  },
  "161-256": {
    "id": 848,
    "from_digimon_id": 161,
    "to_digimon_id": 256,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1000,
      "abi": 20,
      "atk": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  "162-243": {
    "id": 850,
    "from_digimon_id": 162,
    "to_digimon_id": 243,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 40,
      "int": 145,
      "spd": 100
    },
    "dna_requirement": null
  },
  "169-260": {
    "id": 854,
    "from_digimon_id": 169,
    "to_digimon_id": 260,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1100,
      "abi": 20,
      "atk": 180,
      "spd": 130
    },
    "dna_requirement": null
  },
  "171-247": {
    "id": 858,
    "from_digimon_id": 171,
    "to_digimon_id": 247,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 180,
      "spd": 180
    },
    "dna_requirement": null
  },
  "99-145": {
    "id": 785,
    "from_digimon_id": 99,
    "to_digimon_id": 145,
    "level_required": 26,
    "stat_requirements": {
      "def": 110
    },
    "dna_requirement": null
  },
  "101-155": {
    "id": 787,
    "from_digimon_id": 101,
    "to_digimon_id": 155,
    "level_required": 30,
    "stat_requirements": {
      "hp": 300,
      "atk": 100,
      "spd": 85
    },
    "dna_requirement": null
  },
  "101-147": {
    "id": 789,
    "from_digimon_id": 101,
    "to_digimon_id": 147,
    "level_required": 30,
    "stat_requirements": {
      "abi": 10,
      "atk": 70,
      "int": 90
    },
    "dna_requirement": null
  },
  "104-173": {
    "id": 791,
    "from_digimon_id": 104,
    "to_digimon_id": 173,
    "level_required": 28,
    "stat_requirements": {
      "sp": 70,
      "int": 85
    },
    "dna_requirement": null
  },
  "104-200": {
    "id": 793,
    "from_digimon_id": 104,
    "to_digimon_id": 200,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "sp": 70,
      "int": 70
    },
    "dna_requirement": null
  },
  "109-171": {
    "id": 795,
    "from_digimon_id": 109,
    "to_digimon_id": 171,
    "level_required": 30,
    "stat_requirements": {
      "atk": 90,
      "spd": 80
    },
    "dna_requirement": null
  },
  "109-215": {
    "id": 797,
    "from_digimon_id": 109,
    "to_digimon_id": 215,
    "level_required": 28,
    "stat_requirements": {
      "atk": 90,
      "spd": 85
    },
    "dna_requirement": null
  },
  "110-178": {
    "id": 799,
    "from_digimon_id": 110,
    "to_digimon_id": 178,
    "level_required": 40,
    "stat_requirements": {
      "hp": 800,
      "atk": 80,
      "def": 80
    },
    "dna_requirement": null
  },
  "175-222": {
    "id": 862,
    "from_digimon_id": 175,
    "to_digimon_id": 222,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1600,
      "abi": 20,
      "def": 150,
      "spd": 150
    },
    "dna_requirement": null
  },
  "186-235": {
    "id": 870,
    "from_digimon_id": 186,
    "to_digimon_id": 235,
    "level_required": 45,
    "stat_requirements": {
      "abi": 20,
      "atk": 110,
      "def": 130,
      "spd": 100
    },
    "dna_requirement": null
  },
  "189-240": {
    "id": 874,
    "from_digimon_id": 189,
    "to_digimon_id": 240,
    "level_required": 50,
    "stat_requirements": {
      "sp": 110,
      "abi": 20,
      "int": 140
    },
    "dna_requirement": null
  },
  "190-271": {
    "id": 878,
    "from_digimon_id": 190,
    "to_digimon_id": 271,
    "level_required": 60,
    "stat_requirements": {
      "sp": 160,
      "abi": 80,
      "def": 120,
      "int": 200
    },
    "dna_requirement": null
  },
  "197-238": {
    "id": 882,
    "from_digimon_id": 197,
    "to_digimon_id": 238,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1300,
      "abi": 40,
      "atk": 110,
      "int": 110
    },
    "dna_requirement": null
  },
  "226-318": {
    "id": 886,
    "from_digimon_id": 226,
    "to_digimon_id": 318,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 155,
      "int": 100
    },
    "dna_requirement": 272
  },
  "287-288": {
    "id": 890,
    "from_digimon_id": 287,
    "to_digimon_id": 288,
    "level_required": 0,
    "stat_requirements": {},
    "dna_requirement": null
  },
  "113-186": {
    "id": 801,
    "from_digimon_id": 113,
    "to_digimon_id": 186,
    "level_required": 26,
    "stat_requirements": {
      "atk": 65,
      "def": 65
    },
    "dna_requirement": null
  },
  "113-187": {
    "id": 803,
    "from_digimon_id": 113,
    "to_digimon_id": 187,
    "level_required": 26,
    "stat_requirements": {
      "hp": 850,
      "atk": 60,
      "int": 60
    },
    "dna_requirement": null
  },
  "117-163": {
    "id": 805,
    "from_digimon_id": 117,
    "to_digimon_id": 163,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "123-155": {
    "id": 807,
    "from_digimon_id": 123,
    "to_digimon_id": 155,
    "level_required": 30,
    "stat_requirements": {
      "hp": 300,
      "atk": 100,
      "spd": 85
    },
    "dna_requirement": null
  },
  "123-209": {
    "id": 809,
    "from_digimon_id": 123,
    "to_digimon_id": 209,
    "level_required": 30,
    "stat_requirements": {
      "hp": 350,
      "atk": 100,
      "spd": 75
    },
    "dna_requirement": null
  },
  "132-180": {
    "id": 813,
    "from_digimon_id": 132,
    "to_digimon_id": 180,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 75
    },
    "dna_requirement": null
  },
  "134-195": {
    "id": 818,
    "from_digimon_id": 134,
    "to_digimon_id": 195,
    "level_required": 30,
    "stat_requirements": {
      "sp": 80,
      "abi": 10,
      "int": 80
    },
    "dna_requirement": null
  },
  "135-178": {
    "id": 820,
    "from_digimon_id": 135,
    "to_digimon_id": 178,
    "level_required": 40,
    "stat_requirements": {
      "hp": 800,
      "atk": 80,
      "def": 80
    },
    "dna_requirement": null
  },
  "135-181": {
    "id": 822,
    "from_digimon_id": 135,
    "to_digimon_id": 181,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "def": 75
    },
    "dna_requirement": null
  },
  "288-287": {
    "id": 892,
    "from_digimon_id": 288,
    "to_digimon_id": 287,
    "level_required": 0,
    "stat_requirements": {},
    "dna_requirement": null
  },
  "196-296": {
    "id": 881,
    "from_digimon_id": 196,
    "to_digimon_id": 296,
    "level_required": 45,
    "stat_requirements": {
      "sp": 100,
      "abi": 20,
      "atk": 120,
      "def": 140
    },
    "dna_requirement": null
  },
  "197-227": {
    "id": 883,
    "from_digimon_id": 197,
    "to_digimon_id": 227,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1200,
      "sp": 110,
      "abi": 40,
      "atk": 110,
      "int": 110
    },
    "dna_requirement": null
  },
  "231-319": {
    "id": 887,
    "from_digimon_id": 231,
    "to_digimon_id": 319,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1000,
      "abi": 100,
      "atk": 150,
      "int": 150
    },
    "dna_requirement": 287
  },
  "278-314": {
    "id": 889,
    "from_digimon_id": 278,
    "to_digimon_id": 314,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1650,
      "abi": 100,
      "atk": 150,
      "spd": 150
    },
    "dna_requirement": 252
  },
  "25-364": {
    "id": 930,
    "from_digimon_id": 25,
    "to_digimon_id": 364,
    "level_required": 15,
    "stat_requirements": {
      "atk": 40,
      "spd": 35
    },
    "dna_requirement": null
  },
  "149-231": {
    "id": 837,
    "from_digimon_id": 149,
    "to_digimon_id": 231,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 150,
      "def": 120
    },
    "dna_requirement": null
  },
  "161-264": {
    "id": 845,
    "from_digimon_id": 161,
    "to_digimon_id": 264,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 140,
      "def": 120
    },
    "dna_requirement": null
  },
  "161-331": {
    "id": 849,
    "from_digimon_id": 161,
    "to_digimon_id": 331,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1300,
      "abi": 20,
      "atk": 180
    },
    "dna_requirement": null
  },
  "162-251": {
    "id": 851,
    "from_digimon_id": 162,
    "to_digimon_id": 251,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "def": 140,
      "int": 120,
      "spd": 150
    },
    "dna_requirement": null
  },
  "169-238": {
    "id": 853,
    "from_digimon_id": 169,
    "to_digimon_id": 238,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1300,
      "abi": 40,
      "atk": 110,
      "int": 110
    },
    "dna_requirement": null
  },
  "169-261": {
    "id": 855,
    "from_digimon_id": 169,
    "to_digimon_id": 261,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1600,
      "abi": 80,
      "atk": 230,
      "int": 160
    },
    "dna_requirement": null
  },
  "171-225": {
    "id": 857,
    "from_digimon_id": 171,
    "to_digimon_id": 225,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "int": 130,
      "spd": 160
    },
    "dna_requirement": null
  },
  "173-302": {
    "id": 861,
    "from_digimon_id": 173,
    "to_digimon_id": 302,
    "level_required": 60,
    "stat_requirements": {
      "hp": 2000,
      "sp": 140,
      "abi": 80,
      "atk": 140,
      "def": 140,
      "int": 140
    },
    "dna_requirement": null
  },
  "175-237": {
    "id": 863,
    "from_digimon_id": 175,
    "to_digimon_id": 237,
    "level_required": 45,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 120,
      "def": 120
    },
    "dna_requirement": null
  },
  "178-256": {
    "id": 865,
    "from_digimon_id": 178,
    "to_digimon_id": 256,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1000,
      "abi": 20,
      "atk": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  "180-278": {
    "id": 867,
    "from_digimon_id": 180,
    "to_digimon_id": 278,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 160,
      "def": 140
    },
    "dna_requirement": null
  },
  "180-245": {
    "id": 869,
    "from_digimon_id": 180,
    "to_digimon_id": 245,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 145,
      "spd": 120
    },
    "dna_requirement": null
  },
  "186-250": {
    "id": 871,
    "from_digimon_id": 186,
    "to_digimon_id": 250,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1000,
      "abi": 20,
      "atk": 130,
      "def": 110
    },
    "dna_requirement": null
  },
  "189-253": {
    "id": 875,
    "from_digimon_id": 189,
    "to_digimon_id": 253,
    "level_required": 55,
    "stat_requirements": {
      "sp": 130,
      "abi": 40,
      "def": 130,
      "int": 150
    },
    "dna_requirement": null
  },
  "287-319": {
    "id": 891,
    "from_digimon_id": 287,
    "to_digimon_id": 319,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1000,
      "abi": 100,
      "atk": 150,
      "int": 150
    },
    "dna_requirement": 231
  },
  "333-335": {
    "id": 895,
    "from_digimon_id": 333,
    "to_digimon_id": 335,
    "level_required": 14,
    "stat_requirements": {
      "sp": 40,
      "spd": 50
    },
    "dna_requirement": null
  },
  "335-186": {
    "id": 899,
    "from_digimon_id": 335,
    "to_digimon_id": 186,
    "level_required": 26,
    "stat_requirements": {
      "atk": 65,
      "def": 65
    },
    "dna_requirement": null
  },
  "328-135": {
    "id": 902,
    "from_digimon_id": 328,
    "to_digimon_id": 135,
    "level_required": 15,
    "stat_requirements": {
      "hp": 130,
      "atk": 50
    },
    "dna_requirement": null
  },
  "329-330": {
    "id": 904,
    "from_digimon_id": 329,
    "to_digimon_id": 330,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "def": 75
    },
    "dna_requirement": null
  },
  "329-200": {
    "id": 906,
    "from_digimon_id": 329,
    "to_digimon_id": 200,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "sp": 70,
      "int": 70
    },
    "dna_requirement": null
  },
  "330-230": {
    "id": 908,
    "from_digimon_id": 330,
    "to_digimon_id": 230,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 100,
      "spd": 100
    },
    "dna_requirement": null
  },
  "330-291": {
    "id": 910,
    "from_digimon_id": 330,
    "to_digimon_id": 291,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 150,
      "spd": 140
    },
    "dna_requirement": null
  },
  "99-196": {
    "id": 784,
    "from_digimon_id": 99,
    "to_digimon_id": 196,
    "level_required": 26,
    "stat_requirements": {
      "atk": 80,
      "def": 75
    },
    "dna_requirement": null
  },
  "101-197": {
    "id": 788,
    "from_digimon_id": 101,
    "to_digimon_id": 197,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "spd": 80
    },
    "dna_requirement": null
  },
  "104-144": {
    "id": 792,
    "from_digimon_id": 104,
    "to_digimon_id": 144,
    "level_required": 28,
    "stat_requirements": {
      "atk": 75,
      "def": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  "109-163": {
    "id": 796,
    "from_digimon_id": 109,
    "to_digimon_id": 163,
    "level_required": 28,
    "stat_requirements": {
      "hp": 400,
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "110-190": {
    "id": 800,
    "from_digimon_id": 110,
    "to_digimon_id": 190,
    "level_required": 28,
    "stat_requirements": {
      "sp": 80,
      "int": 80
    },
    "dna_requirement": null
  },
  "117-143": {
    "id": 804,
    "from_digimon_id": 117,
    "to_digimon_id": 143,
    "level_required": 28,
    "stat_requirements": {
      "atk": 65,
      "int": 75,
      "spd": 85
    },
    "dna_requirement": null
  },
  "123-171": {
    "id": 808,
    "from_digimon_id": 123,
    "to_digimon_id": 171,
    "level_required": 30,
    "stat_requirements": {
      "atk": 90,
      "spd": 80
    },
    "dna_requirement": null
  },
  "126-212": {
    "id": 810,
    "from_digimon_id": 126,
    "to_digimon_id": 212,
    "level_required": 30,
    "stat_requirements": {
      "int": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "126-210": {
    "id": 812,
    "from_digimon_id": 126,
    "to_digimon_id": 210,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "int": 75
    },
    "dna_requirement": null
  },
  "190-257": {
    "id": 877,
    "from_digimon_id": 190,
    "to_digimon_id": 257,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1400,
      "abi": 20,
      "atk": 150,
      "int": 120
    },
    "dna_requirement": null
  },
  "196-270": {
    "id": 879,
    "from_digimon_id": 196,
    "to_digimon_id": 270,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 135
    },
    "dna_requirement": null
  },
  "132-168": {
    "id": 814,
    "from_digimon_id": 132,
    "to_digimon_id": 168,
    "level_required": 28,
    "stat_requirements": {
      "atk": 120,
      "def": 85,
      "spd": 70
    },
    "dna_requirement": null
  },
  "134-189": {
    "id": 816,
    "from_digimon_id": 134,
    "to_digimon_id": 189,
    "level_required": 26,
    "stat_requirements": {
      "sp": 65,
      "int": 65
    },
    "dna_requirement": null
  },
  "134-188": {
    "id": 817,
    "from_digimon_id": 134,
    "to_digimon_id": 188,
    "level_required": 26,
    "stat_requirements": {
      "sp": 75,
      "int": 80,
      "spd": 80
    },
    "dna_requirement": null
  },
  "135-156": {
    "id": 821,
    "from_digimon_id": 135,
    "to_digimon_id": 156,
    "level_required": 26,
    "stat_requirements": {
      "hp": 800,
      "atk": 75,
      "def": 95
    },
    "dna_requirement": null
  },
  "136-190": {
    "id": 825,
    "from_digimon_id": 136,
    "to_digimon_id": 190,
    "level_required": 28,
    "stat_requirements": {
      "sp": 80,
      "int": 80
    },
    "dna_requirement": null
  },
  "138-143": {
    "id": 829,
    "from_digimon_id": 138,
    "to_digimon_id": 143,
    "level_required": 28,
    "stat_requirements": {
      "atk": 65,
      "int": 75,
      "spd": 85
    },
    "dna_requirement": null
  },
  "142-261": {
    "id": 833,
    "from_digimon_id": 142,
    "to_digimon_id": 261,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1600,
      "abi": 80,
      "atk": 230,
      "int": 160
    },
    "dna_requirement": null
  },
  "1-10": {
    "id": 1,
    "from_digimon_id": 1,
    "to_digimon_id": 10,
    "level_required": 5,
    "stat_requirements": {},
    "dna_requirement": null
  },
  "144-256": {
    "id": 493,
    "from_digimon_id": 144,
    "to_digimon_id": 256,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1000,
      "abi": 20,
      "atk": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  "150-263": {
    "id": 508,
    "from_digimon_id": 150,
    "to_digimon_id": 263,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1200,
      "abi": 80,
      "atk": 140,
      "def": 120,
      "spd": 130
    },
    "dna_requirement": null
  },
  "151-296": {
    "id": 513,
    "from_digimon_id": 151,
    "to_digimon_id": 296,
    "level_required": 45,
    "stat_requirements": {
      "sp": 100,
      "abi": 20,
      "atk": 120,
      "def": 140
    },
    "dna_requirement": null
  },
  "151-235": {
    "id": 514,
    "from_digimon_id": 151,
    "to_digimon_id": 235,
    "level_required": 45,
    "stat_requirements": {
      "abi": 20,
      "atk": 110,
      "def": 130,
      "spd": 100
    },
    "dna_requirement": null
  },
  "151-270": {
    "id": 515,
    "from_digimon_id": 151,
    "to_digimon_id": 270,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 135
    },
    "dna_requirement": null
  },
  "154-304": {
    "id": 525,
    "from_digimon_id": 154,
    "to_digimon_id": 304,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "spd": 160
    },
    "dna_requirement": null
  },
  "156-299": {
    "id": 530,
    "from_digimon_id": 156,
    "to_digimon_id": 299,
    "level_required": 50,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "def": 120,
      "int": 120
    },
    "dna_requirement": null
  },
  "156-267": {
    "id": 532,
    "from_digimon_id": 156,
    "to_digimon_id": 267,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1600,
      "abi": 20,
      "atk": 160
    },
    "dna_requirement": null
  },
  "163-250": {
    "id": 542,
    "from_digimon_id": 163,
    "to_digimon_id": 250,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1000,
      "abi": 20,
      "atk": 130,
      "def": 110
    },
    "dna_requirement": null
  },
  "165-236": {
    "id": 547,
    "from_digimon_id": 165,
    "to_digimon_id": 236,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 20,
      "int": 135,
      "spd": 120
    },
    "dna_requirement": null
  },
  "166-225": {
    "id": 553,
    "from_digimon_id": 166,
    "to_digimon_id": 225,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "int": 130,
      "spd": 160
    },
    "dna_requirement": null
  },
  "167-250": {
    "id": 556,
    "from_digimon_id": 167,
    "to_digimon_id": 250,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1000,
      "abi": 20,
      "atk": 130,
      "def": 110
    },
    "dna_requirement": null
  },
  "168-261": {
    "id": 560,
    "from_digimon_id": 168,
    "to_digimon_id": 261,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1600,
      "abi": 80,
      "atk": 230,
      "int": 160
    },
    "dna_requirement": null
  },
  "174-297": {
    "id": 570,
    "from_digimon_id": 174,
    "to_digimon_id": 297,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "def": 120,
      "spd": 150
    },
    "dna_requirement": null
  },
  "176-283": {
    "id": 572,
    "from_digimon_id": 176,
    "to_digimon_id": 283,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1700,
      "sp": 140,
      "abi": 80,
      "int": 180
    },
    "dna_requirement": null
  },
  "177-281": {
    "id": 575,
    "from_digimon_id": 177,
    "to_digimon_id": 281,
    "level_required": 60,
    "stat_requirements": {
      "hp": 2000,
      "abi": 80,
      "atk": 250,
      "spd": 150
    },
    "dna_requirement": null
  },
  "182-264": {
    "id": 587,
    "from_digimon_id": 182,
    "to_digimon_id": 264,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1500,
      "abi": 20,
      "atk": 140,
      "def": 120
    },
    "dna_requirement": null
  },
  "37-364": {
    "id": 931,
    "from_digimon_id": 37,
    "to_digimon_id": 364,
    "level_required": 15,
    "stat_requirements": {
      "atk": 40,
      "spd": 35
    },
    "dna_requirement": null
  },
  "2-8": {
    "id": 4,
    "from_digimon_id": 2,
    "to_digimon_id": 8,
    "level_required": 5,
    "stat_requirements": {},
    "dna_requirement": null
  },
  "2-14": {
    "id": 5,
    "from_digimon_id": 2,
    "to_digimon_id": 14,
    "level_required": 3,
    "stat_requirements": {
      "hp": 50
    },
    "dna_requirement": null
  },
  "3-9": {
    "id": 7,
    "from_digimon_id": 3,
    "to_digimon_id": 9,
    "level_required": 5,
    "stat_requirements": {},
    "dna_requirement": null
  },
  "21-70": {
    "id": 74,
    "from_digimon_id": 21,
    "to_digimon_id": 70,
    "level_required": 15,
    "stat_requirements": {
      "hp": 150,
      "def": 40
    },
    "dna_requirement": null
  },
  "23-85": {
    "id": 86,
    "from_digimon_id": 23,
    "to_digimon_id": 85,
    "level_required": 15,
    "stat_requirements": {
      "spd": 50
    },
    "dna_requirement": null
  },
  "28-133": {
    "id": 118,
    "from_digimon_id": 28,
    "to_digimon_id": 133,
    "level_required": 14,
    "stat_requirements": {
      "hp": 250,
      "atk": 30
    },
    "dna_requirement": null
  },
  "31-127": {
    "id": 135,
    "from_digimon_id": 31,
    "to_digimon_id": 127,
    "level_required": 20,
    "stat_requirements": {},
    "dna_requirement": null
  },
  "33-78": {
    "id": 143,
    "from_digimon_id": 33,
    "to_digimon_id": 78,
    "level_required": 14,
    "stat_requirements": {
      "atk": 55
    },
    "dna_requirement": null
  },
  "39-325": {
    "id": 169,
    "from_digimon_id": 39,
    "to_digimon_id": 325,
    "level_required": 50,
    "stat_requirements": {
      "abi": 40,
      "atk": 100,
      "def": 120,
      "int": 120
    },
    "dna_requirement": null
  },
  "45-107": {
    "id": 190,
    "from_digimon_id": 45,
    "to_digimon_id": 107,
    "level_required": 14,
    "stat_requirements": {
      "hp": 150,
      "def": 35
    },
    "dna_requirement": null
  },
  "46-77": {
    "id": 193,
    "from_digimon_id": 46,
    "to_digimon_id": 77,
    "level_required": 16,
    "stat_requirements": {
      "abi": 5,
      "int": 40
    },
    "dna_requirement": null
  },
  "49-89": {
    "id": 212,
    "from_digimon_id": 49,
    "to_digimon_id": 89,
    "level_required": 16,
    "stat_requirements": {
      "hp": 150,
      "atk": 40
    },
    "dna_requirement": null
  },
  "56-67": {
    "id": 242,
    "from_digimon_id": 56,
    "to_digimon_id": 67,
    "level_required": 14,
    "stat_requirements": {
      "spd": 55
    },
    "dna_requirement": null
  },
  "56-122": {
    "id": 243,
    "from_digimon_id": 56,
    "to_digimon_id": 122,
    "level_required": 14,
    "stat_requirements": {
      "hp": 40,
      "int": 40,
      "spd": 40
    },
    "dna_requirement": null
  },
  "56-130": {
    "id": 244,
    "from_digimon_id": 56,
    "to_digimon_id": 130,
    "level_required": 14,
    "stat_requirements": {
      "spd": 50
    },
    "dna_requirement": null
  },
  "62-117": {
    "id": 258,
    "from_digimon_id": 62,
    "to_digimon_id": 117,
    "level_required": 14,
    "stat_requirements": {
      "atk": 45,
      "spd": 40
    },
    "dna_requirement": null
  },
  "64-82": {
    "id": 267,
    "from_digimon_id": 64,
    "to_digimon_id": 82,
    "level_required": 14,
    "stat_requirements": {
      "def": 40,
      "int": 40
    },
    "dna_requirement": null
  },
  "74-165": {
    "id": 295,
    "from_digimon_id": 74,
    "to_digimon_id": 165,
    "level_required": 28,
    "stat_requirements": {
      "hp": 800,
      "def": 70
    },
    "dna_requirement": null
  },
  "85-185": {
    "id": 331,
    "from_digimon_id": 85,
    "to_digimon_id": 185,
    "level_required": 28,
    "stat_requirements": {
      "hp": 350,
      "atk": 75,
      "spd": 75
    },
    "dna_requirement": null
  },
  "100-201": {
    "id": 375,
    "from_digimon_id": 100,
    "to_digimon_id": 201,
    "level_required": 26,
    "stat_requirements": {
      "hp": 400,
      "atk": 95,
      "spd": 75
    },
    "dna_requirement": null
  },
  "102-152": {
    "id": 376,
    "from_digimon_id": 102,
    "to_digimon_id": 152,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "int": 100
    },
    "dna_requirement": null
  },
  "103-200": {
    "id": 381,
    "from_digimon_id": 103,
    "to_digimon_id": 200,
    "level_required": 30,
    "stat_requirements": {
      "hp": 400,
      "sp": 70,
      "int": 70
    },
    "dna_requirement": null
  },
  "111-188": {
    "id": 400,
    "from_digimon_id": 111,
    "to_digimon_id": 188,
    "level_required": 26,
    "stat_requirements": {
      "sp": 75,
      "int": 80,
      "spd": 80
    },
    "dna_requirement": null
  },
  "122-174": {
    "id": 435,
    "from_digimon_id": 122,
    "to_digimon_id": 174,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "spd": 100
    },
    "dna_requirement": null
  },
  "131-199": {
    "id": 466,
    "from_digimon_id": 131,
    "to_digimon_id": 199,
    "level_required": 26,
    "stat_requirements": {
      "atk": 75,
      "def": 80
    },
    "dna_requirement": null
  },
  "133-152": {
    "id": 469,
    "from_digimon_id": 133,
    "to_digimon_id": 152,
    "level_required": 30,
    "stat_requirements": {
      "sp": 75,
      "abi": 10,
      "int": 100
    },
    "dna_requirement": null
  },
  "143-243": {
    "id": 488,
    "from_digimon_id": 143,
    "to_digimon_id": 243,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 40,
      "int": 145,
      "spd": 100
    },
    "dna_requirement": null
  },
  "364-365": {
    "id": 932,
    "from_digimon_id": 364,
    "to_digimon_id": 365,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "spd": 55
    },
    "dna_requirement": null
  },
  "183-298": {
    "id": 590,
    "from_digimon_id": 183,
    "to_digimon_id": 298,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "def": 135,
      "spd": 125
    },
    "dna_requirement": null
  },
  "195-225": {
    "id": 618,
    "from_digimon_id": 195,
    "to_digimon_id": 225,
    "level_required": 50,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "int": 130,
      "spd": 160
    },
    "dna_requirement": null
  },
  "202-232": {
    "id": 636,
    "from_digimon_id": 202,
    "to_digimon_id": 232,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 130,
      "def": 130,
      "int": 130
    },
    "dna_requirement": null
  },
  "205-276": {
    "id": 648,
    "from_digimon_id": 205,
    "to_digimon_id": 276,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1800,
      "abi": 20,
      "atk": 140,
      "def": 140
    },
    "dna_requirement": null
  },
  "208-304": {
    "id": 660,
    "from_digimon_id": 208,
    "to_digimon_id": 304,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 130,
      "spd": 160
    },
    "dna_requirement": null
  },
  "210-303": {
    "id": 666,
    "from_digimon_id": 210,
    "to_digimon_id": 303,
    "level_required": 60,
    "stat_requirements": {
      "sp": 200,
      "abi": 80,
      "int": 250,
      "spd": 130
    },
    "dna_requirement": null
  },
  "217-283": {
    "id": 688,
    "from_digimon_id": 217,
    "to_digimon_id": 283,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1700,
      "sp": 140,
      "abi": 80,
      "int": 180
    },
    "dna_requirement": null
  },
  "109-365": {
    "id": 933,
    "from_digimon_id": 109,
    "to_digimon_id": 365,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "spd": 55
    },
    "dna_requirement": null
  },
  "191-275": {
    "id": 601,
    "from_digimon_id": 191,
    "to_digimon_id": 275,
    "level_required": 65,
    "stat_requirements": {
      "abi": 10
    },
    "dna_requirement": null
  },
  "201-295": {
    "id": 635,
    "from_digimon_id": 201,
    "to_digimon_id": 295,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1700,
      "abi": 40,
      "atk": 180
    },
    "dna_requirement": null
  },
  "208-291": {
    "id": 659,
    "from_digimon_id": 208,
    "to_digimon_id": 291,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 150,
      "spd": 140
    },
    "dna_requirement": null
  },
  "214-303": {
    "id": 677,
    "from_digimon_id": 214,
    "to_digimon_id": 303,
    "level_required": 60,
    "stat_requirements": {
      "sp": 200,
      "abi": 80,
      "int": 250,
      "spd": 130
    },
    "dna_requirement": null
  },
  "272-317": {
    "id": 699,
    "from_digimon_id": 272,
    "to_digimon_id": 317,
    "level_required": 60,
    "stat_requirements": {
      "abi": 40,
      "atk": 255
    },
    "dna_requirement": 255
  },
  "105-365": {
    "id": 934,
    "from_digimon_id": 105,
    "to_digimon_id": 365,
    "level_required": 30,
    "stat_requirements": {
      "atk": 75,
      "spd": 55
    },
    "dna_requirement": null
  },
  "192-261": {
    "id": 604,
    "from_digimon_id": 192,
    "to_digimon_id": 261,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1600,
      "abi": 80,
      "atk": 230,
      "int": 160
    },
    "dna_requirement": null
  },
  "195-248": {
    "id": 615,
    "from_digimon_id": 195,
    "to_digimon_id": 248,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 140,
      "spd": 130
    },
    "dna_requirement": null
  },
  "280-258": {
    "id": 704,
    "from_digimon_id": 280,
    "to_digimon_id": 258,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1600,
      "abi": 40,
      "atk": 140,
      "def": 130
    },
    "dna_requirement": null
  },
  "363-97": {
    "id": 935,
    "from_digimon_id": 363,
    "to_digimon_id": 97,
    "level_required": 14,
    "stat_requirements": {
      "atk": 40,
      "def": 25,
      "spd": 40
    },
    "dna_requirement": null
  },
  "201-244": {
    "id": 634,
    "from_digimon_id": 201,
    "to_digimon_id": 244,
    "level_required": 55,
    "stat_requirements": {
      "abi": 40,
      "atk": 130,
      "def": 120,
      "int": 120
    },
    "dna_requirement": null
  },
  "294-332": {
    "id": 709,
    "from_digimon_id": 294,
    "to_digimon_id": 332,
    "level_required": 99,
    "stat_requirements": {
      "abi": 120
    },
    "dna_requirement": null
  },
  "363-81": {
    "id": 936,
    "from_digimon_id": 363,
    "to_digimon_id": 81,
    "level_required": 15,
    "stat_requirements": {
      "spd": 55
    },
    "dna_requirement": null
  },
  "205-262": {
    "id": 649,
    "from_digimon_id": 205,
    "to_digimon_id": 262,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 140,
      "def": 140,
      "int": 140
    },
    "dna_requirement": null
  },
  "364-160": {
    "id": 937,
    "from_digimon_id": 364,
    "to_digimon_id": 160,
    "level_required": 26,
    "stat_requirements": {
      "hp": 400,
      "atk": 95
    },
    "dna_requirement": null
  },
  "212-309": {
    "id": 674,
    "from_digimon_id": 212,
    "to_digimon_id": 309,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "int": 170,
      "spd": 130
    },
    "dna_requirement": null
  },
  "58-109": {
    "id": 748,
    "from_digimon_id": 58,
    "to_digimon_id": 109,
    "level_required": 15,
    "stat_requirements": {
      "atk": 45,
      "spd": 50
    },
    "dna_requirement": null
  },
  "80-325": {
    "id": 776,
    "from_digimon_id": 80,
    "to_digimon_id": 325,
    "level_required": 50,
    "stat_requirements": {
      "abi": 40,
      "atk": 100,
      "def": 120,
      "int": 120
    },
    "dna_requirement": null
  },
  "97-202": {
    "id": 783,
    "from_digimon_id": 97,
    "to_digimon_id": 202,
    "level_required": 30,
    "stat_requirements": {
      "atk": 105,
      "spd": 75
    },
    "dna_requirement": null
  },
  "142-260": {
    "id": 832,
    "from_digimon_id": 142,
    "to_digimon_id": 260,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1100,
      "abi": 20,
      "atk": 180,
      "spd": 130
    },
    "dna_requirement": null
  },
  "157-277": {
    "id": 841,
    "from_digimon_id": 157,
    "to_digimon_id": 277,
    "level_required": 45,
    "stat_requirements": {
      "abi": 20,
      "def": 150
    },
    "dna_requirement": null
  },
  "159-295": {
    "id": 843,
    "from_digimon_id": 159,
    "to_digimon_id": 295,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1700,
      "abi": 40,
      "atk": 180
    },
    "dna_requirement": null
  },
  "159-224": {
    "id": 844,
    "from_digimon_id": 159,
    "to_digimon_id": 224,
    "level_required": 50,
    "stat_requirements": {
      "hp": 1700,
      "abi": 20,
      "atk": 130,
      "def": 130,
      "int": 120
    },
    "dna_requirement": null
  },
  "173-268": {
    "id": 859,
    "from_digimon_id": 173,
    "to_digimon_id": 268,
    "level_required": 55,
    "stat_requirements": {
      "hp": 1000,
      "sp": 100,
      "abi": 20,
      "int": 130
    },
    "dna_requirement": null
  },
  "178-247": {
    "id": 866,
    "from_digimon_id": 178,
    "to_digimon_id": 247,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 180,
      "spd": 180
    },
    "dna_requirement": null
  },
  "186-272": {
    "id": 872,
    "from_digimon_id": 186,
    "to_digimon_id": 272,
    "level_required": 55,
    "stat_requirements": {
      "abi": 20,
      "atk": 120,
      "def": 130
    },
    "dna_requirement": null
  },
  "189-226": {
    "id": 873,
    "from_digimon_id": 189,
    "to_digimon_id": 226,
    "level_required": 55,
    "stat_requirements": {
      "sp": 120,
      "abi": 40,
      "int": 145,
      "spd": 130
    },
    "dna_requirement": null
  },
  "218-311": {
    "id": 885,
    "from_digimon_id": 218,
    "to_digimon_id": 311,
    "level_required": 70,
    "stat_requirements": {
      "sp": 150,
      "abi": 60,
      "atk": 250,
      "int": 150,
      "spd": 160
    },
    "dna_requirement": null
  },
  "333-334": {
    "id": 894,
    "from_digimon_id": 333,
    "to_digimon_id": 334,
    "level_required": 60,
    "stat_requirements": {
      "hp": 1150,
      "sp": 130,
      "abi": 50,
      "int": 150
    },
    "dna_requirement": null
  },
  "331-312": {
    "id": 911,
    "from_digimon_id": 331,
    "to_digimon_id": 312,
    "level_required": 60,
    "stat_requirements": {
      "abi": 80,
      "atk": 180,
      "def": 170,
      "int": 150
    },
    "dna_requirement": 219
  }
},
} as const;
