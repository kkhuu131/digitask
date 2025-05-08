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

// Support __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set your output path
const OUTPUT_PATH = path.join(__dirname, "../src/constants/digimonLookup.ts");

async function generateDigimonLookup() {
  const { data: digimonData, error } = await supabase
    .from("digimon")
    .select("*");

  if (error) {
    console.error("❌ Error fetching digimon data:", error.message);
    process.exit(1);
  }

  // Create lookup table keyed by Digimon ID
  const lookup = digimonData.reduce((acc, d) => {
    acc[d.id] = d;
    return acc;
  }, {});

  // TypeScript output
  const tsOutput = `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
  // Generated from Supabase digimon table
  
  import type { Digimon } from "../src/store/petStore";
  
  export const DIGIMON_LOOKUP_TABLE: Record<number, Digimon> = ${JSON.stringify(
    lookup,
    null,
    2
  )};
  `;

  // Write to file
  fs.writeFileSync(OUTPUT_PATH, tsOutput, "utf8");
  console.log(`✅ Digimon lookup table saved to: ${OUTPUT_PATH}`);
}

generateDigimonLookup();
