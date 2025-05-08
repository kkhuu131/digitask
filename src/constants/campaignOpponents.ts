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
}

// Simplified input interfaces
interface SimpleDigimon {
  digimon_id: number;
  level: number;
  name?: string;
}

interface SimpleOpponent {
  name: string;
  team: SimpleDigimon[];
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
    })),
  };
}

const SIMPLE_OPPONENTS: SimpleOpponent[] = [
  {
    name: "Baby",
    team: [{ digimon_id: 1, level: 1 }],
  },
  {
    name: "Timmy",
    team: [{ digimon_id: 2, level: 3 }],
  },
  {
    name: "DigiDestined",
    team: [
      { digimon_id: 46, level: 10 },
      { digimon_id: 115, level: 12 },
    ],
  },
  {
    name: "DigiDestined",
    team: [
      { digimon_id: 50, level: 11 },
      { digimon_id: 48, level: 12 },
      { digimon_id: 34, level: 10 },
    ],
  },
  {
    name: "DigiDestined",
    team: [
      { digimon_id: 27, level: 11 },
      { digimon_id: 18, level: 12 },
      { digimon_id: 40, level: 10 },
    ],
  },
  {
    name: "DigiDestined Gen. 2",
    team: [
      { digimon_id: 70, level: 20 },
      { digimon_id: 108, level: 20 },
    ],
  },
  {
    name: "DigiDestined Gen. 2",
    team: [
      { digimon_id: 76, level: 22 },
      { digimon_id: 67, level: 22 },
    ],
  },
  {
    name: "Tamers",
    team: [
      { digimon_id: 88, level: 26 },
      { digimon_id: 84, level: 25 },
      { digimon_id: 87, level: 25 },
    ],
  },
  {
    name: "Frontier",
    team: [
      { digimon_id: 68, level: 29 },
      { digimon_id: 73, level: 28 },
    ],
  },

  {
    name: "Frontier",
    team: [
      { digimon_id: 149, level: 35 },
      { digimon_id: 155, level: 35 },
    ],
  },
];

// Generate the full opponent data
export const CAMPAIGN_OPPONENTS: CampaignOpponent[] = SIMPLE_OPPONENTS.map(
  (opponent, index) => createOpponent(index + 1, opponent)
);
