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
  description?: string; // optional description to display before battle
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
  description?: string; // optional description to display before battle
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
    description: data.description,
  };
}

interface CampaignStage {
  id: string; // "1", "2a", "2b", etc.
  name: string;
  team: SimpleDigimon[];
  hint?: string;
  description?: string;
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

const CAMPAIGN_STAGES: CampaignStage[] = [
  {
    id: "1",
    name: "Beginnings",
    team: [{ digimon_id: 2, level: 2 }],
    hint: "Complete some tasks to level up your Digimon!",
    description:
      "Welcome to the Digital World! You will encounter various enemies on your journey in this mysterious world!",
  },
  {
    id: "2",
    name: "Evolution",
    team: [{ digimon_id: 11, level: 4 }],
    hint: "Complete some tasks to level up and evolve your Digimon!",
    description:
      "This Digimon is a bit more powerful than the first one. You'll need to level up and evolve your Digimon to defeat it!",
  },
  {
    id: "3A",
    name: "Fire",
    team: [{ digimon_id: 7, level: 5 }],
    hint: "Fire attributes are weak to Water, but strong against Plant!",
    description:
      "This Fire Digimon is weak to Water, but strong against Plant! Attribute advantages deal 1.5x damage.",
  },
  {
    id: "3B",
    name: "Water",
    team: [{ digimon_id: 15, level: 5 }],
    hint: "Water attributes are weak to Plant, but strong against Fire!",
    description:
      "This Water Digimon is weak to Plant, but strong against Fire! Attribute advantages deal 1.5x damage.",
  },
  {
    id: "3C",
    name: "Plant",
    team: [{ digimon_id: 8, level: 5 }],
    hint: "Plant attributes are weak to Fire, but strong against Water!",
    description:
      "This Plant Digimon is weak to Fire, but strong against Water! Attribute advantages deal 1.5x damage.",
  },
  {
    id: "4A",
    name: "Wind",
    team: [{ digimon_id: 17, level: 5 }],
    hint: "Wind attributes are weak to Electric, but strong against Earth!",
    description:
      "This Wind Digimon is weak to Electric, but strong against Earth!",
  },
  {
    id: "4B",
    name: "Electric",
    team: [{ digimon_id: 23, level: 5 }],
    hint: "Electric attributes are weak to Earth, but strong against Wind!",
    description:
      "This Electric Digimon is weak to Earth, but strong against Wind!",
  },
  {
    id: "4C",
    name: "Earth",
    team: [{ digimon_id: 9, level: 5 }],
    hint: "Earth attributes are weak to Wind, but strong against Electric!",
    description:
      "This Earth Digimon is weak to Wind, but strong against Electric!",
  },
  {
    id: "5A",
    name: "Light",
    team: [{ digimon_id: 12, level: 5 }],
    hint: "Light and Dark attributes are strong against each other!",
    description: "Light and Dark attributes are strong against each other!",
  },
  {
    id: "5B",
    name: "Dark",
    team: [{ digimon_id: 13, level: 5 }],
    hint: "Light and Dark attributes are strong against each other!",
    description: "Light and Dark attributes are strong against each other!",
  },
  {
    id: "6A",
    name: "Data",
    team: [{ digimon_id: 25, level: 7 }],
    hint: "Data types are weak to Virus, but strong against Vaccine!",
    description:
      "The symbol represents the type of the Digimon! Data types are weak to Virus, but strong against Vaccine! Advantages increase damage by 2.0x or 0.5x.",
  },
  {
    id: "6B",
    name: "Virus",
    team: [{ digimon_id: 22, level: 7 }],
    hint: "Virus types are weak to Vaccine, but strong against Data!",
    description:
      "The symbol represents the type of the Digimon! Virus types are weak to Vaccine, but strong against Data! Advantages increase damage by 2.0x or 0.5x.",
  },
  {
    id: "6C",
    name: "Vaccine",
    team: [{ digimon_id: 41, level: 7 }],
    hint: "Vaccine types are weak to Data, but strong against Virus!",
    description:
      "The symbol represents the type of the Digimon! Vaccine types are weak to Data, but strong against Virus! Advantages increase damage by 2.0x or 0.5x.",
  },
  {
    id: "7A",
    name: "Jungle",
    team: [
      { digimon_id: 57, level: 9 },
      { digimon_id: 57, level: 9 },
    ],
    hint: "Evolve and devolve your Digimon to increase ABI and unlock another Digimon!",
    description: "These Digimon are blocking your path!",
  },
  {
    id: "7B",
    name: "Village",
    team: [
      { digimon_id: 33, level: 9 },
      { digimon_id: 33, level: 9 },
    ],
    hint: "Evolve and devolve your Digimon to increase ABI and unlock another Digimon!",
    description: "These Digimon are blocking your path!",
  },
  {
    id: "7C",
    name: "Cave",
    team: [
      { digimon_id: 49, level: 9 },
      { digimon_id: 49, level: 9 },
    ],
    hint: "Evolve and devolve your Digimon to increase ABI and unlock another Digimon!",
    description: "These Digimon are blocking your path!",
  },
  {
    id: "8A",
    name: "DigiDestined",
    team: [
      { digimon_id: 46, level: 10 },
      { digimon_id: 34, level: 10 },
    ],
    description: "Some familiar faces challenge you to a duel!",
  },
  {
    id: "8B",
    name: "DigiDestined",
    team: [
      { digimon_id: 50, level: 10 },
      { digimon_id: 48, level: 10 },
    ],
    description: "Some familiar faces challenge you to a duel!",
  },
  {
    id: "9",
    name: "DigiDestined",
    team: [
      { digimon_id: 27, level: 12 },
      { digimon_id: 18, level: 13 },
      { digimon_id: 40, level: 12 },
    ],
    description: "Some familiar faces challenge you to a duel!",
  },
  {
    id: "10",
    name: "Kuwagamon",
    team: [{ digimon_id: 93, level: 15 }],
    description: "A wild Kuwagamon suddenly appears and attacks you!",
  },
  {
    id: "11",
    name: "Defense",
    team: [
      { digimon_id: 127, level: 20 },
      { digimon_id: 127, level: 20 },
    ],
    hint: "Sukamon have incredible DEF, use Digimon with higher INT than ATK. DEF blocks ATK, and INT blocks INT.",
    description:
      "These Digimon have incredible defenses, physical attacks will probably not work well...",
  },
  {
    id: "12",
    name: "Jungle Patrol",
    team: [
      { digimon_id: 74, level: 12 },
      { digimon_id: 64, level: 13 },
    ],
    description: "The Jungle Patrol spotted you!",
  },
  {
    id: "13",
    name: "Cold Ocean",
    team: [
      { digimon_id: 71, level: 14 },
      { digimon_id: 66, level: 14 },
    ],
    description: "These Digimon smell some food on you!.",
  },
  {
    id: "14A",
    name: "Town Hall",
    team: [
      { digimon_id: 33, level: 10 },
      { digimon_id: 78, level: 16 },
      { digimon_id: 83, level: 15 },
    ],
    description: "The villagers seem to be blocking the path to a temple...",
  },
  {
    id: "14B",
    name: "Mountain",
    team: [
      { digimon_id: 75, level: 15 },
      { digimon_id: 81, level: 16 },
      { digimon_id: 45, level: 10 },
    ],
    description: "These Digimon seem to be blocking the path to a temple...",
  },
  {
    id: "15",
    name: "Spirit Temple",
    team: [
      { digimon_id: 68, level: 20 },
      { digimon_id: 73, level: 20 },
    ],
    description: "These Digimon seem to be testing your strength...",
  },
  {
    id: "16A",
    name: "Volcano",
    team: [
      { digimon_id: 131, level: 16 },
      { digimon_id: 114, level: 18 },
      { digimon_id: 32, level: 14 },
    ],
    description: "These Digimon seem to be enraged and out of control!",
  },
  {
    id: "16B",
    name: "Cave",
    team: [
      { digimon_id: 121, level: 16 },
      { digimon_id: 124, level: 18 },
      { digimon_id: 55, level: 14 },
    ],
    description: "These Digimon seem to be enraged and out of control!",
  },
  {
    id: "17",
    name: "DigiDestined 2",
    team: [
      { digimon_id: 70, level: 21 },
      { digimon_id: 100, level: 21 },
    ],
    description: "Some familiar faces challenge you to a duel!",
  },
  {
    id: "18",
    name: "DigiDestined 2",
    team: [
      { digimon_id: 76, level: 22 },
      { digimon_id: 67, level: 22 },
    ],
    description: "Some familiar faces challenge you to a duel!",
  },
  {
    id: "19A",
    name: "Factory",
    team: [
      { digimon_id: 80, level: 18 },
      { digimon_id: 79, level: 19 },
      { digimon_id: 92, level: 18 },
    ],
    description:
      "These Digimon seem to have been put into a frenzy! You need to calm them down.",
  },
  {
    id: "19B",
    name: "Lake",
    team: [
      { digimon_id: 94, level: 18 },
      { digimon_id: 103, level: 19 },
      { digimon_id: 104, level: 18 },
    ],
    description:
      "These Digimon seem to have been put into a frenzy! You need to calm them down.",
  },
  {
    id: "20",
    name: "Devimon",
    team: [
      {
        digimon_id: 116,
        level: 25,
        hp_bonus: 126,
        atk_bonus: 30,
        spd_bonus: 50,
      },
    ],
    description:
      "The Digital World trembles as a shadowy virus known as Devimon splits the lands, twisting Digimon against each other. This is the first sign that something darker lurks beneath.",
  },
  {
    id: "21",
    name: "Ambush",
    team: [
      { digimon_id: 106, level: 21 },
      { digimon_id: 120, level: 21 },
      { digimon_id: 129, level: 21 },
    ],
    hint: "They're all Virus types, maybe bring some Vaccine types to counter them.",
    description:
      "After Devimon was successfuly subdued, you continue your journey to the Server Continent, and realize you were being followed by an interesting trio.",
  },
  // {
  //   id: "22A",
  //   name: "Wizard Tower",
  //   team: [
  //     { digimon_id: 72, level: 22 },
  //     { digimon_id: 111, level: 23 },
  //     { digimon_id: 72, level: 22 },
  //   ],
  //   hint: "They're all Data types, maybe bring some Virus types to counter them.",
  // },
  {
    id: "22",
    name: "Forest",
    team: [
      { digimon_id: 108, level: 22 },
      { digimon_id: 140, level: 23 },
      { digimon_id: 102, level: 22 },
    ],
    hint: "They're all Data types, maybe bring some Virus types to counter them.",
  },
  // {
  //   id: "23",
  //   name: "Apex Duo",
  //   team: [
  //     { digimon_id: 90, level: 25, hp_bonus: 200 },
  //     { digimon_id: 85, level: 25, hp_bonus: 200 },
  //   ],
  // },
  {
    id: "23",
    name: "Ruined City",
    team: [
      { digimon_id: 137, level: 23 },
      { digimon_id: 160, level: 24 },
      { digimon_id: 137, level: 23 },
    ],
    description: "You stumble upon the territory of a pack of Leomon.",
  },
  {
    id: "24",
    name: "Etemon",
    team: [
      { digimon_id: 26, level: 22 },
      { digimon_id: 151, level: 26 },
      { digimon_id: 26, level: 22 },
    ],
    description:
      "You find Etemon, a tyrant fueled by sound and egoism, with strange tech increasing its power!",
  },
  {
    id: "25",
    name: "Etemon",
    team: [
      { digimon_id: 151, level: 30 },
      { digimon_id: 183, level: 30 },
    ],
    description:
      "Looks like Etemon is attempting to absorb the Datamon to achieve a new form!",
  },
  // {
  //   id: "25B",
  //   name: "Dinosaur",
  //   team: [
  //     { digimon_id: 132, level: 25 },
  //     { digimon_id: 176, level: 27 },
  //     { digimon_id: 114, level: 25 },
  //   ],
  // },
  // {
  //   id: "27A",
  //   name: "Fairy Garden",
  //   team: [
  //     { digimon_id: 212, level: 28 },
  //     { digimon_id: 188, level: 26 },
  //     { digimon_id: 210, level: 27 },
  //   ],
  // },
  // {
  //   id: "27B",
  //   name: "Robot",
  //   team: [
  //     { digimon_id: 157, level: 28 },
  //     { digimon_id: 158, level: 26 },
  //     { digimon_id: 183, level: 27 },
  //   ],
  // },
  {
    id: "26",
    name: "A New Threat",
    team: [{ digimon_id: 49, level: 20 }],
    description:
      "You find a DemiDevimon hiding in the trees, it confesses to spying on you for its master, a powerful Digimon known as Myotismon.",
  },
  {
    id: "27",
    name: "Gatomon",
    team: [
      { digimon_id: 72, level: 28 },
      { digimon_id: 115, level: 28 },
    ],
    description: "These Digimon claim to be sent by Myotismon to stop you.",
  },
  {
    id: "28",
    name: "Executioner",
    team: [
      { digimon_id: 124, level: 28 },
      { digimon_id: 190, level: 28 },
      { digimon_id: 124, level: 28 },
    ],
    description:
      "A Phantomon leads the Bakemon army in an attempt to stop you.",
  },
  {
    id: "29",
    name: "Myotismon",
    team: [{ digimon_id: 147, level: 45, hp_bonus: 50, spd_bonus: 50 }],
    description:
      "Myotismon claims to have been made by the same being that created Devimon and Etemon. He plans to enter the Real World and wreak havoc.",
  },
  {
    id: "30",
    name: "Vampiric Revival",
    team: [
      {
        digimon_id: 227,
        level: 50,
        hp_bonus: 96,
        spd_bonus: 50,
      },
    ],
    description:
      "After his apparent death, Myotismon consumes the data of his remaining minions and is reborn.",
  },
  {
    id: "31",
    name: "Data Collapse",
    team: [
      { digimon_id: 112, level: 31 },
      { digimon_id: 118, level: 31 },
      { digimon_id: 107, level: 31 },
    ],
    description:
      "While fighting Myotismon, another threat took control of the Digital World. Digimon all over seemed to have been put into a frenzy.",
  },
  {
    id: "33",
    name: "Laboratory",
    team: [
      { digimon_id: 157, level: 33 },
      { digimon_id: 158, level: 30 },
      { digimon_id: 183, level: 30 },
    ],
    description:
      "You find a broken lab, full of broken machines and a group of Digimon that suddently attack you.",
  },
  {
    id: "34",
    name: "Dinosaur",
    team: [
      { digimon_id: 132, level: 34 },
      { digimon_id: 176, level: 34 },
      { digimon_id: 114, level: 34 },
    ],
    description:
      "You find a group of Digimon that seem to be hurt and attack you out of instinct.",
  },
  {
    id: "32",
    name: "Path to Spiral Mountain",
    team: [
      { digimon_id: 130, level: 32 },
      { digimon_id: 139, level: 32 },
      { digimon_id: 122, level: 32 },
    ],
    description:
      "You make your way to Spiral Mountain, to find the source of the chaos.",
  },
  {
    id: "35",
    name: "Net Ocean",
    team: [
      { digimon_id: 71, level: 32 },
      { digimon_id: 200, level: 35 },
      { digimon_id: 194, level: 34 },
    ],
    description:
      "The oceans are now filled with a strange corruption, and the Digimon seem to be under control of a certain Digimon.",
  },
  {
    id: "36",
    name: "Deep Savers",
    team: [
      { digimon_id: 104, level: 36 },
      { digimon_id: 173, level: 36 },
      { digimon_id: 170, level: 36 },
    ],
    description: "As digital realms fracture, the sea itself falls to tyranny.",
  },
  {
    id: "37",
    name: "Dark Masters I",
    team: [
      {
        digimon_id: 299,
        level: 60,
        hp_bonus: 146,
        int_bonus: 110,
        spd_bonus: 75,
      },
    ],
    description:
      "MetalSeadramon emerges as the first of the Dark Masters, four Digimon created by Apocalymon who plan to take over the Digital World.",
  },
  {
    id: "38",
    name: "Forest",
    team: [
      { digimon_id: 57, level: 38 },
      { digimon_id: 102, level: 38 },
      { digimon_id: 129, level: 38 },
    ],
    description:
      "The forest becomes a twisted playground where a certain Digimon enacts cruel games. Digimon vanish mysteriously as manipulation takes center stage.",
  },
  {
    id: "39",
    name: "Wind Guardians",
    team: [
      { digimon_id: 165, level: 38 },
      { digimon_id: 296, level: 40 },
      { digimon_id: 153, level: 38 },
    ],
    description:
      "The army of the second Dark Masters, appears to stop you, comprised of a certain rock star you once defeated.",
  },
  {
    id: "40",
    name: "Dark Masters II",
    team: [
      {
        digimon_id: 274,
        level: 60,
        hp_bonus: 276,
        atk_bonus: 70,
        int_bonus: 20,
      },
    ],
    description:
      "Puppetmon, reveals itself as the second Dark Master, using its puppet strings to control the forest from the shadows.",
  },
  {
    id: "41",
    name: "City",
    team: [
      { digimon_id: 45, level: 43 },
      { digimon_id: 144, level: 43 },
      { digimon_id: 183, level: 43 },
    ],
    description:
      "These Digimon seem to be under the control of a certain Digimon.",
  },
  {
    id: "42",
    name: "Metal Empire",
    team: [
      { digimon_id: 112, level: 44 },
      { digimon_id: 201, level: 46 },
      { digimon_id: 156, level: 44 },
    ],
    description:
      "Megadramon, the supposed commander of this empire, blocks your path.",
  },
  {
    id: "43",
    name: "Dark Masters III",
    team: [
      {
        digimon_id: 294,
        level: 70,
        hp_bonus: 300,
        sp_bonus: 100,
        atk_bonus: 70,
        def_bonus: 50,
      },
    ],
    description:
      "The Third Dark Master, reveals itself as Machinedramon, a Digimon created by combining the parts of many Cyborg Digmion.",
  },
  {
    id: "44",
    name: "Wastelands",
    team: [
      { digimon_id: 124, level: 48 },
      { digimon_id: 79, level: 48 },
      { digimon_id: 136, level: 48 },
    ],
  },
  {
    id: "45",
    name: "Nightmare Soldiers",
    team: [
      { digimon_id: 124, level: 45 },
      {
        digimon_id: 214,
        level: 55,
        hp_bonus: 300,
        sp_bonus: 100,
        atk_bonus: 100,
        int_bonus: 50,
        def_bonus: 50,
      },
      { digimon_id: 169, level: 45 },
    ],
  },
  {
    id: "46",
    name: "Dark Masters IV",
    team: [
      {
        digimon_id: 273,
        level: 75,
        hp_bonus: 460,
        sp_bonus: 150,
        int_bonus: 100,
        def_bonus: 100,
        spd_bonus: 100,
      },
    ],
    description:
      "The strongest of the Dark Masters awaits. Piedmon, a trickster and tyrant, teams up with LadyDevimon, to take you down.",
  },
  {
    id: "47",
    name: "Monkey King",
    team: [
      {
        digimon_id: 151,
        level: 45,
      },
      {
        digimon_id: 235,
        level: 50,
      },
      {
        digimon_id: 151,
        level: 45,
      },
    ],
    description:
      "It seems in this timeline, Etemon managed to rule the Digital World.",
  },
  {
    id: "48",
    name: "City",
    team: [
      {
        digimon_id: 205,
        level: 55,
        hp_bonus: 150,
        atk_bonus: 50,
      },
      {
        digimon_id: 114,
        level: 55,
        hp_bonus: 150,
        atk_bonus: 50,
      },
    ],
    description:
      "You were brought to an alternate city, where two Digimon are fighting over control.",
  },
  {
    id: "50",
    name: "Chaos Dimension",
    team: [
      {
        digimon_id: 232,
        level: 60,
        hp_bonus: 150,
        atk_bonus: 50,
      },
      {
        digimon_id: 233,
        level: 60,
        hp_bonus: 150,
        atk_bonus: 50,
      },
    ],
    description:
      "You were sent to a dimension consumed by chaos and Digimon have been completely tainted by the Dark Side.",
  },
  {
    id: "49",
    name: "Digital Shogunate",
    team: [
      {
        digimon_id: 330,
        level: 50,
      },
      {
        digimon_id: 272,
        level: 50,
      },
      {
        digimon_id: 179,
        level: 50,
      },
    ],
    description:
      "A world where Digimon follow clans, samurai honor codes, and spiritual traditions.",
  },
  {
    id: "51",
    name: "Keepers of Time",
    team: [
      {
        digimon_id: 92,
        level: 50,
      },
      {
        digimon_id: 217,
        level: 50,
      },
      {
        digimon_id: 193,
        level: 50,
      },
    ],
    description:
      "Some strange Digimon sense you are not from this timeline and attack you.",
  },
  {
    id: "53",
    name: "The Lone Guardian",
    team: [
      {
        digimon_id: 276,
        level: 80,
        hp_bonus: 240,
        sp_bonus: 100,
        int_bonus: 120,
        def_bonus: 100,
        spd_bonus: 100,
      },
    ],
    description:
      "From another timeline, a warrior with no master, tests if you're a worthy opponent.",
  },
  {
    id: "52",
    name: "Fusion Crossfire",
    team: [
      {
        digimon_id: 327,
        level: 75,
        hp_bonus: 200,
        sp_bonus: 100,
        int_bonus: 120,
        def_bonus: 100,
        spd_bonus: 100,
      },
    ],
    description:
      "A Digimon blessed by the power of Omnimon challenges you to a duel.",
  },
  {
    id: "54",
    name: "Alternate Reality",
    team: [
      {
        digimon_id: 248,
        level: 62,
        hp_bonus: 75,
        sp_bonus: 50,
        atk_bonus: 50,
        int_bonus: 50,
        def_bonus: 50,
        spd_bonus: 50,
      },
      {
        digimon_id: 292,
        level: 62,
        hp_bonus: 75,
        sp_bonus: 50,
        atk_bonus: 50,
        int_bonus: 50,
        def_bonus: 50,
        spd_bonus: 50,
      },
    ],
    description:
      "Two powerful Digimon mistake you for a threat to their world and team up to take you down.",
  },
  {
    id: "55",
    name: "Ultimate War God",
    team: [
      {
        digimon_id: 231,
        level: 1,
      },
      {
        digimon_id: 319,
        level: 60,
        hp_bonus: 100,
        sp_bonus: 75,
        atk_bonus: 75,
        int_bonus: 75,
        def_bonus: 75,
      },
      {
        digimon_id: 287,
        level: 1,
      },
    ],
    description:
      "You meet a friendly Spirit, who challenges you to an all out duel.",
  },
  {
    id: "56",
    name: "Armageddon",
    team: [
      {
        digimon_id: 310,
        level: 80,
        hp_bonus: 200,
        sp_bonus: 100,
        atk_bonus: 100,
        int_bonus: 100,
        def_bonus: 100,
      },
    ],
    description:
      "You interrupted a hibernating god, who was in the process of merging with the Digital World.",
  },
  {
    id: "57",
    name: "Corrupted",
    team: [
      { digimon_id: 116, level: 55, name: "Darkness Hand" },
      { digimon_id: 147, level: 60, hp_bonus: 100, name: "Nightmare Claw" },
      { digimon_id: 151, level: 55, name: "Dark Network" },
    ],
    description:
      "You find yourself back to your world, but with all four Dark Masters conquered, a shadowy chaos summons familiar foes to take you down.",
  },
  {
    id: "58",
    name: "Shadows",
    team: [
      { digimon_id: 299, level: 60, hp_bonus: 100, atk_bonus: 100 },
      { digimon_id: 274, level: 60, hp_bonus: 100, atk_bonus: 100 },
    ],
    description:
      "Using the data of the defeated Dark Masters, shadow versions of the Dark Masters appear to take you down.",
  },
  {
    id: "59",
    name: "Shadows",
    team: [
      { digimon_id: 294, level: 60 },
      { digimon_id: 273, level: 60 },
      { digimon_id: 214, level: 60 },
    ],
    description:
      "Using the data of the defeated Dark Masters, shadow versions of the Dark Masters appear to take you down.",
  },
  {
    id: "60",
    name: "Apocalymon",
    team: [
      {
        digimon_id: 332,
        level: 99,
        hp_bonus: 449,
        sp_bonus: 120,
        atk_bonus: 120,
        int_bonus: 50,
        def_bonus: 50,
        spd_bonus: 50,
      },
    ],
    description:
      "The true force behind the chaos reveals itself -- Apocalymon. It's origins are unknown, but it's clear that it plans to reduce the Digital World to nothing.",
  },
  {
    id: "61",
    name: "Dynasmon/Crusadermon",
    team: [
      { digimon_id: 182, level: 60 },
      { digimon_id: 263, level: 65 },
      { digimon_id: 306, level: 65 },
    ],
    description:
      "A holy knight and its dragon partner, stop your path. Though they say nothing, Alphamon's gaze is conflicted. You sense hesitation against its orders.",
  },
  {
    id: "62",
    name: "Ray of Victory",
    team: [
      { digimon_id: 150, level: 60 },
      { digimon_id: 220, level: 65 },
      { digimon_id: 161, level: 60 },
    ],
    description:
      "A holy knight and its dragon partner, stop your path. Though they say nothing, Alphamon's gaze is conflicted. You sense hesitation against its orders.",
  },
  {
    id: "63",
    name: "Magnamon",
    team: [
      { digimon_id: 98, level: 60 },
      { digimon_id: 324, level: 65 },
      { digimon_id: 325, level: 63 },
    ],
    description:
      "A holy knight and its dragon partner, stop your path. Though they say nothing, Alphamon's gaze is conflicted. You sense hesitation against its orders.",
  },
  {
    id: "64",
    name: "Leopardmon",
    team: [
      { digimon_id: 195, level: 60 },
      { digimon_id: 265, level: 65 },
      { digimon_id: 160, level: 60 },
    ],
    description:
      "A holy knight and its dragon partner, stop your path. Though they say nothing, Alphamon's gaze is conflicted. You sense hesitation against its orders.",
  },
  {
    id: "65",
    name: "Kentaurosmon/Craniamon",
    team: [
      { digimon_id: 182, level: 60 },
      { digimon_id: 251, level: 65 },
      { digimon_id: 241, level: 65 },
    ],
    description:
      "A holy knight and its dragon partner, stop your path. Though they say nothing, Alphamon's gaze is conflicted. You sense hesitation against its orders.",
  },
  {
    id: "66",
    name: "Examon",
    team: [
      { digimon_id: 252, level: 60 },
      { digimon_id: 314, level: 65 },
      { digimon_id: 278, level: 60 },
    ],
    description:
      "A holy knight and its dragon partner, stop your path. Though they say nothing, Alphamon's gaze is conflicted. You sense hesitation against its orders.",
  },
  {
    id: "67",
    name: "Gankoomon/Jesmon",
    team: [
      { digimon_id: 182, level: 60 },
      { digimon_id: 234, level: 65 },
      { digimon_id: 247, level: 60 },
    ],
    description:
      "A holy knight and its dragon partner, stop your path. Though they say nothing, Alphamon's gaze is conflicted. You sense hesitation against its orders.",
  },
  {
    id: "68",
    name: "Gallantmon",
    team: [
      { digimon_id: 202, level: 65 },
      { digimon_id: 262, level: 70 },
      { digimon_id: 79, level: 65 },
    ],
    description:
      "A holy knight and its dragon partner, stop your path. Though they say nothing, Alphamon's gaze is conflicted. You sense hesitation against its orders.",
  },
  {
    id: "69",
    name: "Omnimon",
    team: [
      { digimon_id: 228, level: 65 },
      { digimon_id: 315, level: 75 },
      { digimon_id: 297, level: 65 },
    ],
    description:
      "A holy knight and its dragon partner, stop your path. Though they say nothing, Alphamon's gaze is conflicted. You sense hesitation against its orders.",
  },
  {
    id: "70",
    name: "Finale",
    team: [
      { digimon_id: 161, level: 65 },
      { digimon_id: 219, level: 75 },
      { digimon_id: 181, level: 65 },
    ],
    description:
      "A holy knight and its dragon partner, stop your path. Though they say nothing, Alphamon's gaze is conflicted. You sense hesitation against its orders.",
  },
  {
    id: "71",
    name: "Seven Great What??",
    team: [{ digimon_id: 26, level: 50 }],
    description:
      "Though Apocalymon was destroyed, his data was not. Gazimon warns about thereturn of the Seven Great Demon Lords.",
  },
  {
    id: "72",
    name: "Envy",
    team: [
      {
        digimon_id: 302,
        level: 99,
        hp_bonus: 550,
        sp_bonus: 120,
        atk_bonus: 120,
        int_bonus: 120,
        def_bonus: 120,
        spd_bonus: 120,
      },
    ],
    description:
      "The seas churn again as Leviamon emerges, embodying the sin of envy — consuming all in his path with primal hunger.",
  },
  {
    id: "73",
    name: "Glutonny",
    team: [
      {
        digimon_id: 281,
        level: 99,
        hp_bonus: 350,
        sp_bonus: 200,
        atk_bonus: 200,
        int_bonus: 50,
        def_bonus: 50,
        spd_bonus: 120,
      },
    ],
    description:
      "Beelzemon, once a lone avenger, now devours anything in his path. His bike roars with vengeance and unchecked hunger.",
  },
  {
    id: "74",
    name: "Lust",
    team: [
      {
        digimon_id: 303,
        level: 99,
        hp_bonus: 500,
        sp_bonus: 120,
        int_bonus: 250,
        def_bonus: 120,
      },
    ],
    description:
      "Seductive and cruel, Lilithmon sows confusion and despair. Her digital sorcery enslaves minds and corrupts hearts.",
  },
  {
    id: "75",
    name: "Greed",
    team: [
      {
        digimon_id: 271,
        level: 99,
        hp_bonus: 300,
        sp_bonus: 10,
        int_bonus: 300,
        def_bonus: 100,
        spd_bonus: 100,
      },
    ],
    description:
      "Barbamon builds an empire of wealth and corruption, turning Digimon into pawns and resources in his endless schemes.",
  },
  {
    id: "76",
    name: "Wrath",
    team: [
      {
        digimon_id: 261,
        level: 99,
        hp_bonus: 450,
        sp_bonus: 150,
        atk_bonus: 200,
        int_bonus: 130,
        def_bonus: 100,
      },
    ],
    description:
      "Daemon escapes the Dark Area, blazing across dimensions. His fury is boundless, his hatred eternal.",
  },
  {
    id: "77",
    name: "Sloth",
    team: [
      {
        digimon_id: 283,
        level: 99,
        hp_bonus: 500,
        int_bonus: 200,
      },
    ],
    description:
      "Time slows. Reality bends. Belphemon slumbers, and in doing so, nearly stops the world's flow of data entirely.",
  },
  {
    id: "78",
    name: "Sloth's Awakening",
    team: [
      {
        digimon_id: 321,
        level: 99,
        hp_bonus: 300,
        sp_bonus: 50,
        atk_bonus: 300,
        def_bonus: 100,
        spd_bonus: 150,
      },
    ],
    description:
      "Belphemon awakens from its slumber, enraged by the one who awakened it.",
  },
  {
    id: "79",
    name: "Pride",
    team: [
      {
        digimon_id: 49,
        level: 50,
      },
      {
        digimon_id: 213,
        level: 99,
      },

      {
        digimon_id: 49,
        level: 50,
      },
    ],
    description:
      "At the peak of darkness, Lucemon rises — beautiful, divine, and terrifying. His fall was ancient, but his pride never died.",
  },
  {
    id: "80",
    name: "True Super Demon Lord",
    team: [
      {
        digimon_id: 77,
        level: 70,
      },
      {
        digimon_id: 322,
        level: 99,
      },
      {
        digimon_id: 116,
        level: 70,
      },
    ],
    description:
      "Lucemon's final form — a Satanic avatar of judgment. The data around him degrades as he attempts to rewrite the world in his twisted image.",
  },
  // {
  //   id: "100",
  //   name: "Core Protocol",
  //   team: [{ digimon_id: 999, level: 999 }],
  //   description:
  //     "To Yggdrasill, emotion is deviation. You, and the Digimon who fight beside you, are anomalies in its perfect code.",
  // },

  // {
  //   id: "81",
  //   name: "Fusion Override",
  //   team: [
  //     { digimon_id: 289, level: 60, hp_bonus: 10000 },
  //     { digimon_id: 317, level: 60, hp_bonus: 10000 },
  //     { digimon_id: 250, level: 60, hp_bonus: 10000 },
  //   ],
  // },
  // {
  //   id: "82",
  //   name: "Radiant Burst",
  //   team: [
  //     { digimon_id: 249, level: 60, hp_bonus: 10000 },
  //     { digimon_id: 293, level: 60, hp_bonus: 10000 },
  //     { digimon_id: 305, level: 60, hp_bonus: 10000 },
  //   ],
  // },
  // {
  //   id: "83",
  //   name: "Chaos Protocol",
  //   team: [
  //     { digimon_id: 232, level: 60, hp_bonus: 10000 },
  //     { digimon_id: 318, level: 60, hp_bonus: 10000 },
  //     { digimon_id: 233, level: 60, hp_bonus: 10000 },
  //   ],
  // },
  // {
  //   id: "84",
  //   name: "Heaven's Gate",
  //   team: [
  //     { digimon_id: 253, level: 60, hp_bonus: 10000 },
  //     { digimon_id: 229, level: 60, hp_bonus: 10000 },
  //     { digimon_id: 285, level: 60, hp_bonus: 10000 },
  //   ],
  // },
  // {
  //   id: "85",
  //   name: "Hell Protocol",
  //   team: [
  //     { digimon_id: 276, level: 60, hp_bonus: 10000 },
  //     { digimon_id: 298, level: 60, hp_bonus: 10000 },
  //     { digimon_id: 283, level: 60, hp_bonus: 10000 },
  //   ],
  // },
  // {
  //   id: "86",
  //   name: "Omnipotence",
  //   team: [
  //     { digimon_id: 316, level: 60, hp_bonus: 10000 },
  //     { digimon_id: 315, level: 60, hp_bonus: 10000 },
  //     { digimon_id: 312, level: 60, hp_bonus: 10000 },
  //   ],
  // },
  // {
  //   id: "87",
  //   name: "Legendary Spirits",
  //   team: [
  //     { digimon_id: 231, level: 60, hp_bonus: 10000 },
  //     { digimon_id: 319, level: 60, hp_bonus: 10000 },
  //     { digimon_id: 287, level: 60, hp_bonus: 10000 },
  //   ],
  // },
  // {
  //   id: "88",
  //   name: "Upgraded Knights",
  //   team: [
  //     { digimon_id: 320, level: 60, hp_bonus: 10000 },
  //     { digimon_id: 313, level: 60, hp_bonus: 10000 },
  //   ],
  // },
  // {
  //   id: "89",
  //   name: "Armored Up",
  //   team: [
  //     { digimon_id: 324, level: 60, hp_bonus: 10000 },
  //     { digimon_id: 327, level: 60, hp_bonus: 10000 },
  //     { digimon_id: 323, level: 60, hp_bonus: 10000 },
  //   ],
  // },
  // {
  //   id: "90",
  //   name: "The End",
  //   team: [
  //     { digimon_id: 322, level: 99 },
  //     { digimon_id: 332, level: 99 },
  //     { digimon_id: 310, level: 99 },
  //   ],
  //   hint: "You're cooked.",
  // },
];

// Generate the full opponent data
export const CAMPAIGN_OPPONENTS = CAMPAIGN_STAGES.map((stage, index) => ({
  ...createOpponent(index + 1, stage),
  id: stage.id,
}));

// Add this near the top of the file, after your existing interfaces
export interface CampaignArc {
  title: string;
  startStage: number; // The first stage in this arc
  endStage: number; // The last stage in this arc
  description?: string; // Optional description of the arc
}

// Add this after your CAMPAIGN_STAGES array
export const CAMPAIGN_ARCS: CampaignArc[] = [
  {
    title: "Tutorial",
    startStage: 1,
    endStage: 10,
    description: "Begin your journey in the Digital World",
  },
  {
    title: "File Island",
    startStage: 11,
    endStage: 20,
    description: "Explore the mysteries of File Island",
  },
  {
    title: "Server Continent",
    startStage: 21,
    endStage: 25,
    description: "Journey across the vast Server Continent",
  },
  {
    title: "Myotismon",
    startStage: 26,
    endStage: 30,
    description: "A shadowy vampire Digimon threatens to invade the Real World",
  },
  {
    title: "Dark Masters",
    startStage: 31,
    endStage: 46,
    description:
      "Four Mega Digimon combine forces to take control of the Digital World",
  },
  {
    title: "Side Story: Multiversal Conflict",
    startStage: 47,
    endStage: 56,
    description:
      "The clash of energies created a wormhole, and you and your were sucked into alternate Digital Worlds",
  },
  {
    title: "Apocalypse",
    startStage: 57,
    endStage: 60,
    description: "The creator of the Dark Masters reveals itself",
  },
  {
    title: "Royal Knights",
    startStage: 61,
    endStage: 70,
    description:
      "A group sworn to protect the Digital World is ordered to purge its errors",
  },
  {
    title: "Seven Great Demon Lords",
    startStage: 71,
    endStage: 80,
    description: "An ancient group of demons threatens the Digital World",
  },
  {
    title: "X-Antibody",
    startStage: 81,
    endStage: 90,
    description: "An ancient group of demons threatens the Digital World",
  },
  {
    title: "???",
    startStage: 100,
    endStage: 100,
    description: "???",
  },
];

// Helper function to get the arc for a given stage
export function getArcForStage(
  stageId: string | number
): CampaignArc | undefined {
  const stageNum =
    typeof stageId === "string"
      ? parseInt(stageId.split("a")[0].split("b")[0])
      : stageId;
  return CAMPAIGN_ARCS.find(
    (arc) => stageNum >= arc.startStage && stageNum <= arc.endStage
  );
}
