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
const OUTPUT_PATH = path.join(
  __dirname,
  "../src/constants/digimonFormsLookup.ts"
);

async function generateDigimonFormsLookup() {
  const { data: formsData, error } = await supabase
    .from("digimon_forms")
    .select("*");

  if (error) {
    console.error("❌ Error fetching digimon forms data:", error.message);
    process.exit(1);
  }

  // Create lookup tables
  // 1. Base to forms mapping (one base can have multiple forms)
  const baseToFormsMap = formsData.reduce((acc, form) => {
    if (!acc[form.base_digimon_id]) {
      acc[form.base_digimon_id] = [];
    }
    acc[form.base_digimon_id].push({
      formDigimonId: form.form_digimon_id,
      formType: form.form_type,
      unlockCondition: form.unlock_condition,
    });
    return acc;
  }, {});

  // 2. Form to base mapping (for reverse lookup)
  const formToBaseMap = formsData.reduce((acc, form) => {
    acc[form.form_digimon_id] = {
      baseDigimonId: form.base_digimon_id,
      formType: form.form_type,
      unlockCondition: form.unlock_condition,
    };
    return acc;
  }, {});

  // TypeScript output
  const tsOutput = `// AUTO-GENERATED FILE. DO NOT EDIT DIRECTLY.
// Generated from Supabase digimon_forms table

export interface DigimonFormInfo {
  formDigimonId: number;
  formType: string;
  unlockCondition: string | null;
}

export interface BaseDigimonInfo {
  baseDigimonId: number;
  formType: string;
  unlockCondition: string | null;
}

// Maps base Digimon IDs to their available forms
export const BASE_TO_FORMS_MAP: Record<number, DigimonFormInfo[]> = ${JSON.stringify(
    baseToFormsMap,
    null,
    2
  )};

// Maps form Digimon IDs back to their base Digimon
export const FORM_TO_BASE_MAP: Record<number, BaseDigimonInfo> = ${JSON.stringify(
    formToBaseMap,
    null,
    2
  )};
`;

  // Write to file
  fs.writeFileSync(OUTPUT_PATH, tsOutput, "utf8");
  console.log(`✅ Digimon forms lookup table saved to: ${OUTPUT_PATH}`);
}

generateDigimonFormsLookup();
