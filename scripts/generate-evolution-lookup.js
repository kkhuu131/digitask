import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_PATH = path.join(__dirname, "../src/constants/evolutionLookup.ts");

async function generateEvolutionLookup() {
  const { data: evolutionData, error } = await supabase
    .from("evolution_paths")
    .select("*");

  if (error) {
    console.error("❌ Error fetching evolution paths:", error.message);
    process.exit(1);
  }

  const byFrom = {};
  const byTo = {};
  const byPair = {};

  for (const entry of evolutionData) {
    const from = entry.from_digimon_id;
    const to = entry.to_digimon_id;
    const key = `${from}-${to}`;

    if (!byFrom[from]) byFrom[from] = [];
    if (!byTo[to]) byTo[to] = [];

    byFrom[from].push(entry);
    byTo[to].push(entry);
    byPair[key] = entry;
  }

  const tsOutput = `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
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
  all: ${JSON.stringify(evolutionData, null, 2)},
  byFrom: ${JSON.stringify(byFrom, null, 2)},
  byTo: ${JSON.stringify(byTo, null, 2)},
  byPair: ${JSON.stringify(byPair, null, 2)},
} as const;
`;

  fs.writeFileSync(OUTPUT_PATH, tsOutput, "utf8");
  console.log(`✅ Evolution lookup table saved to: ${OUTPUT_PATH}`);
}

generateEvolutionLookup();
