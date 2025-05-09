import { DIGIMON_LOOKUP_TABLE } from "./digimonLookup";
import type { Digimon } from "../store/petStore";

interface CampaignTeamMember {
  id: string;
  name: string;
  user_id: string;
  current_level: number;
  experience_points: number;
  happiness: number;
  digimon: Digimon;
}

interface CampaignProfile {
  id: string;
  username: string;
  display_name: string;
}

interface CampaignOpponent {
  profile: CampaignProfile;
  team: CampaignTeamMember[];
  hint?: string; // optional hint to display if player loses the battle
}

// Simplified input interfaces
interface SimpleDigimon {
  digimon_id: number;
  level: number;
  name?: string;
  hp_bonus?: number;
  sp_bonus?: number;
  atk_bonus?: number;
  def_bonus?: number;
  spd_bonus?: number;
  int_bonus?: number;
}

interface SimpleOpponent {
  name: string;
  team: SimpleDigimon[];
  hint?: string; // optional hint to display if player loses the battle
}

function createOpponent(index: number, data: SimpleOpponent): CampaignOpponent {
  const id = `team_${String(index).padStart(3, "0")}`;

  return {
    profile: {
      id,
      username: data.name,
      display_name: data.name,
    },
    team: data.team.map((d, i) => ({
      user_id: "00000000-0000-0000-0000-000000000000",
      id: `campaign_stage_1_digimon_${i}`,
      name: d.name || "",
      current_level: d.level,
      experience_points: 0,
      happiness: 100,
      digimon: DIGIMON_LOOKUP_TABLE[d.digimon_id],
      hp_bonus: d.hp_bonus || 0,
      sp_bonus: d.sp_bonus || 0,
      atk_bonus: d.atk_bonus || 0,
      def_bonus: d.def_bonus || 0,
      spd_bonus: d.spd_bonus || 0,
      int_bonus: d.int_bonus || 0,
    })),
    hint: data.hint,
  };
}

interface CampaignStage {
  id: string; // "1", "2a", "2b", etc.
  name: string;
  team: SimpleDigimon[];
  hint?: string;
}

// Utility functions for stage relationships
export const getBaseStage = (id: string) => {
  const match = id.match(/^\d+/);
  if (!match) throw new Error(`Invalid stage ID: ${id}`);
  return parseInt(match[0]);
};

export const getBranchLetter = (id: string) => id.match(/[a-z]$/)?.[0] || null;

export const getPreviousStages = (id: string) => {
  const baseStage = getBaseStage(id);
  return baseStage === 1 ? [] : [`${baseStage - 1}`];
};

export const getNextStages = (stages: CampaignStage[], currentId: string) => {
  const currentBase = getBaseStage(currentId);
  return stages
    .filter((stage) => {
      const stageBase = getBaseStage(stage.id);
      return stageBase === currentBase + 1;
    })
    .map((stage) => stage.id);
};

export const isStageUnlocked = (
  stageId: string,
  highestStageCleared: number
) => {
  const baseStage = getBaseStage(stageId);
  return baseStage <= highestStageCleared + 1;
};

// const SIMPLE_OPPONENTS: SimpleOpponent[] = [
//   {
//     name: "Beginnings",
//     team: [{ digimon_id: 2, level: 1 }],
//     hint: "Complete some tasks to level up your Digimon!",
//   },
//   {
//     name: "Team Battle",
//     team: [
//       { digimon_id: 1, level: 2 },
//       { digimon_id: 4, level: 3 },
//     ],
//     hint: "Increase your ABI through evolving and devolving to get more Digimon!",
//   },
//   {
//     name: "Evolution",
//     team: [
//       { digimon_id: 11, level: 5 },
//       { digimon_id: 11, level: 5 },
//     ],
//     hint: "Level up and evolve your Digimon through tasks or Arena battles!",
//   },
//   {
//     name: "Fire > Plant > Water > Fire",
//     team: [{ digimon_id: 8, level: 7 }],
//     hint: "Attributes can increase your damage by 1.5x! Plant attributes are weak to Fire, but strong against Water!",
//   },
//   {
//     name: "Wind > Electric > Earth > Wind",
//     team: [{ digimon_id: 39, level: 7 }],
//     hint: "Attributes can increase your damage by 1.5x! Wind attributes are weak to Electric, but strong against Earth!",
//   },
//   {
//     name: "Light and Dark",
//     team: [{ digimon_id: 37, level: 7 }],
//     hint: "Attributes can increase your damage by 1.5x! Light and Dark attributes are weak to each other!",
//   },
//   {
//     name: "Light and Dark",
//     team: [{ digimon_id: 49, level: 7 }],
//     hint: "Attributes can increase your damage by 1.5x! Light and Dark attributes are weak to each other!",
//   },
//   {
//     name: "Virus < Vaccine",
//     team: [{ digimon_id: 22, level: 7 }],
//     hint: "Types can increase your damage by 2x or 0.5x! Virus type Digimon are weak to Vaccine and strong against Data!",
//   },
//   {
//     name: "Vaccine < Data",
//     team: [{ digimon_id: 41, level: 7 }],
//     hint: "Types can increase your damage by 2x or 0.5x! Vaccine type Digimon are weak to Data and strong against Virus!",
//   },
//   {
//     name: "Data < Virus",
//     team: [{ digimon_id: 25, level: 7 }],
//     hint: "Types can increase your damage by 2x or 0.5x! Data type Digimon are weak to Virus and strong against Vaccine!",
//   },
//   {
//     name: "Jungle",
//     team: [
//       { digimon_id: 52, level: 11 },
//       { digimon_id: 57, level: 11 },
//       { digimon_id: 59, level: 11 },
//     ],
//     hint: "Use attributes to your advantage.  Plant type Digimon are weak to Fire type Digimon!",
//   },
//   {
//     name: "DigiDestined",
//     team: [
//       { digimon_id: 46, level: 10 },
//       { digimon_id: 115, level: 12 },
//     ],
//   },
//   {
//     name: "DigiDestined",
//     team: [
//       { digimon_id: 50, level: 12 },
//       { digimon_id: 48, level: 12 },
//       { digimon_id: 34, level: 12 },
//     ],
//   },
//   {
//     name: "DigiDestined",
//     team: [
//       { digimon_id: 27, level: 15 },
//       { digimon_id: 18, level: 15 },
//       { digimon_id: 40, level: 14 },
//     ],
//   },
//   {
//     name: "DigiDestined Gen. 2",
//     team: [
//       { digimon_id: 70, level: 20 },
//       { digimon_id: 108, level: 20 },
//     ],
//   },
//   {
//     name: "DigiDestined Gen. 2",
//     team: [
//       { digimon_id: 76, level: 22 },
//       { digimon_id: 67, level: 22 },
//     ],
//   },
//   {
//     name: "Tamers",
//     team: [
//       { digimon_id: 88, level: 26 },
//       { digimon_id: 84, level: 25 },
//       { digimon_id: 87, level: 25 },
//     ],
//   },
//   {
//     name: "Frontier",
//     team: [
//       { digimon_id: 68, level: 29 },
//       { digimon_id: 73, level: 28 },
//     ],
//   },

//   {
//     name: "Frontier",
//     team: [
//       { digimon_id: 149, level: 35 },
//       { digimon_id: 155, level: 35 },
//     ],
//   },
//   {
//     name: "Iron Wall",
//     team: [
//       { digimon_id: 127, level: 20 },
//       { digimon_id: 127, level: 20 },
//       { digimon_id: 127, level: 20 },
//     ],
//     hint: "Sukamon have incredible DEF, use Digimon with higher INT than ATK.",
//   },
//   {
//     name: "Monke",
//     team: [
//       { digimon_id: 106, level: 25 },
//       { digimon_id: 151, level: 30 },
//       { digimon_id: 106, level: 25 },
//     ],
//   },
//   {
//     name: "Monkey King",
//     team: [
//       { digimon_id: 296, level: 45 },
//       { digimon_id: 235, level: 45 },
//       { digimon_id: 296, level: 45 },
//     ],
//   },
//   {
//     name: "Royal Knights I",
//     team: [
//       { digimon_id: 228, level: 60 },
//       { digimon_id: 246, level: 60 },
//       { digimon_id: 141, level: 60 },
//     ],
//   },
//   {
//     name: "Royal Knights I",
//     team: [
//       { digimon_id: 262, level: 60 },
//       { digimon_id: 265, level: 60 },
//       { digimon_id: 306, level: 60 },
//     ],
//   },
//   {
//     name: "Royal Knights II",
//     team: [
//       { digimon_id: 220, level: 60 },
//       { digimon_id: 314, level: 60 },
//       { digimon_id: 263, level: 60 },
//     ],
//   },
//   {
//     name: "Royal Knights III",
//     team: [
//       { digimon_id: 251, level: 60 },
//       { digimon_id: 234, level: 60 },
//       { digimon_id: 324, level: 60 },
//     ],
//   },
//   {
//     name: "Royal Knights IV",
//     team: [{ digimon_id: 219, level: 60, hp_bonus: 2000 }],
//   },
//   {
//     name: "Angels",
//     team: [
//       { digimon_id: 253, level: 60 },
//       { digimon_id: 229, level: 60 },
//     ],
//   },
//   {
//     name: "Sovereigns",
//     team: [
//       { digimon_id: 231, level: 60 },
//       { digimon_id: 287, level: 60 },
//     ],
//   },
//   {
//     name: "Legendary Fusion",
//     team: [{ digimon_id: 319, level: 60 }],
//   },
//   {
//     name: "Knights vs Demons",
//     team: [
//       { digimon_id: 306, level: 60 },
//       { digimon_id: 262, level: 60 },
//       { digimon_id: 283, level: 60 },
//     ],
//   },
//   {
//     name: "Omnimon",
//     team: [{ digimon_id: 315, level: 65 }],
//   },
//   {
//     name: "The End",
//     team: [
//       { digimon_id: 322, level: 99 },
//       { digimon_id: 332, level: 99 },
//       { digimon_id: 310, level: 99 },
//     ],
//     hint: "Chat, this might not be possible..",
//   },
// ];

const CAMPAIGN_STAGES: CampaignStage[] = [
  {
    id: "1",
    name: "Beginnings",
    team: [{ digimon_id: 2, level: 2 }],
    hint: "Complete some tasks to level up your Digimon!",
  },
  {
    id: "2",
    name: "Evolution",
    team: [{ digimon_id: 11, level: 4 }],
    hint: "Complete some tasks to level up and evolve your Digimon!",
  },
  {
    id: "3A",
    name: "Fire",
    team: [{ digimon_id: 7, level: 5 }],
    hint: "Fire attributes are weak to Water, but strong against Plant!",
  },
  {
    id: "3B",
    name: "Water",
    team: [{ digimon_id: 15, level: 5 }],
    hint: "Water attributes are weak to Plant, but strong against Fire!",
  },
  {
    id: "3C",
    name: "Plant",
    team: [{ digimon_id: 8, level: 5 }],
    hint: "Plant attributes are weak to Fire, but strong against Water!",
  },
  {
    id: "4A",
    name: "Wind",
    team: [{ digimon_id: 17, level: 5 }],
    hint: "Wind attributes are weak to Electric, but strong against Earth!",
  },
  {
    id: "4B",
    name: "Electric",
    team: [{ digimon_id: 23, level: 5 }],
    hint: "Electric attributes are weak to Earth, but strong against Wind!",
  },
  {
    id: "4C",
    name: "Earth",
    team: [{ digimon_id: 9, level: 5 }],
    hint: "Earth attributes are weak to Wind, but strong against Electric!",
  },
  {
    id: "5A",
    name: "Light",
    team: [{ digimon_id: 12, level: 5 }],
    hint: "Light and Dark attributes are strong against each other!",
  },
  {
    id: "5B",
    name: "Dark",
    team: [{ digimon_id: 13, level: 5 }],
    hint: "Light and Dark attributes are strong against each other!",
  },
  {
    id: "6A",
    name: "Data",
    team: [{ digimon_id: 25, level: 7 }],
    hint: "Data types are weak to Virus, but strong against Vaccine!",
  },
  {
    id: "6B",
    name: "Virus",
    team: [{ digimon_id: 22, level: 7 }],
    hint: "Virus types are weak to Vaccine, but strong against Data!",
  },
  {
    id: "6C",
    name: "Vaccine",
    team: [{ digimon_id: 41, level: 7 }],
    hint: "Vaccine types are weak to Data, but strong against Virus!",
  },
  {
    id: "7A",
    name: "Jungle",
    team: [
      { digimon_id: 57, level: 9 },
      { digimon_id: 57, level: 9 },
    ],
    hint: "Evolve and devolve your Digimon to increase ABI and unlock another Digimon!",
  },
  {
    id: "7B",
    name: "Village",
    team: [
      { digimon_id: 33, level: 9 },
      { digimon_id: 33, level: 9 },
    ],
    hint: "Evolve and devolve your Digimon to increase ABI and unlock another Digimon!",
  },
  {
    id: "7C",
    name: "Cave",
    team: [
      { digimon_id: 49, level: 9 },
      { digimon_id: 49, level: 9 },
    ],
    hint: "Evolve and devolve your Digimon to increase ABI and unlock another Digimon!",
  },
  {
    id: "8",
    name: "DigiDestined",
    team: [
      { digimon_id: 46, level: 10 },
      { digimon_id: 115, level: 11 },
    ],
  },
  {
    id: "9",
    name: "DigiDestined",
    team: [
      { digimon_id: 50, level: 10 },
      { digimon_id: 48, level: 10 },
      { digimon_id: 34, level: 10 },
    ],
  },
  {
    id: "10",
    name: "DigiDestined",
    team: [
      { digimon_id: 27, level: 12 },
      { digimon_id: 18, level: 13 },
      { digimon_id: 40, level: 12 },
    ],
  },
  {
    id: "11",
    name: "Defense",
    team: [
      { digimon_id: 127, level: 20 },
      { digimon_id: 127, level: 20 },
      { digimon_id: 127, level: 20 },
    ],
    hint: "Sukamon have incredible DEF, use Digimon with higher INT than ATK. DEF blocks ATK, and INT blocks INT.",
  },
  {
    id: "12",
    name: "Jungle Patrol",
    team: [
      { digimon_id: 74, level: 12 },
      { digimon_id: 64, level: 13 },
    ],
  },
  {
    id: "13",
    name: "Cold Ocean",
    team: [
      { digimon_id: 71, level: 14 },
      { digimon_id: 66, level: 14 },
    ],
  },
  {
    id: "14A",
    name: "Town Hall",
    team: [
      { digimon_id: 33, level: 10 },
      { digimon_id: 78, level: 16 },
      { digimon_id: 83, level: 15 },
    ],
  },
  {
    id: "14B",
    name: "Mountain",
    team: [
      { digimon_id: 75, level: 15 },
      { digimon_id: 81, level: 16 },
      { digimon_id: 45, level: 10 },
    ],
  },
  {
    id: "15",
    name: "Spirit",
    team: [
      { digimon_id: 68, level: 20 },
      { digimon_id: 73, level: 20 },
    ],
  },
  {
    id: "16A",
    name: "Volcano",
    team: [
      { digimon_id: 131, level: 16 },
      { digimon_id: 114, level: 18 },
      { digimon_id: 32, level: 14 },
    ],
  },
  {
    id: "16B",
    name: "Cave",
    team: [
      { digimon_id: 116, level: 16 },
      { digimon_id: 124, level: 18 },
      { digimon_id: 55, level: 14 },
    ],
  },
  {
    id: "17",
    name: "DigiDestined 2",
    team: [
      { digimon_id: 70, level: 21 },
      { digimon_id: 100, level: 21 },
    ],
  },
  {
    id: "18",
    name: "DigiDestined 2",
    team: [
      { digimon_id: 76, level: 22 },
      { digimon_id: 67, level: 22 },
    ],
  },
  {
    id: "19A",
    name: "Factory",
    team: [
      { digimon_id: 80, level: 18 },
      { digimon_id: 79, level: 19 },
      { digimon_id: 92, level: 18 },
    ],
  },
  {
    id: "19B",
    name: "Lake",
    team: [
      { digimon_id: 94, level: 18 },
      { digimon_id: 103, level: 19 },
      { digimon_id: 104, level: 18 },
    ],
  },
  {
    id: "20",
    name: "Tamers",
    team: [
      { digimon_id: 84, level: 22 },
      { digimon_id: 88, level: 24 },
      { digimon_id: 87, level: 22 },
    ],
  },
  {
    id: "100",
    name: "The End",
    team: [
      { digimon_id: 322, level: 99 },
      { digimon_id: 332, level: 99 },
      { digimon_id: 310, level: 99 },
    ],
    hint: "You're cooked.",
  },
];

// Generate the full opponent data
export const CAMPAIGN_OPPONENTS = CAMPAIGN_STAGES.map((stage, index) => ({
  ...createOpponent(index + 1, stage),
  id: stage.id,
}));
