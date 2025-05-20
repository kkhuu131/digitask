import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to your animated Digimon folders
const ANIMATED_DIGIMON_PATH = path.join(
  __dirname,
  "../public/assets/animated_digimon"
);

// Function to generate the list
function generateAnimatedDigimonList() {
  try {
    // Check if the directory exists
    if (!fs.existsSync(ANIMATED_DIGIMON_PATH)) {
      console.error(`Directory not found: ${ANIMATED_DIGIMON_PATH}`);
      return [];
    }

    // Read all directories in the animated_digimon folder
    const digimonFolders = fs
      .readdirSync(ANIMATED_DIGIMON_PATH, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);

    console.log(`Found ${digimonFolders.length} Digimon with animated sprites`);

    // Generate the TypeScript file content
    const tsContent = `// Auto-generated file - DO NOT EDIT MANUALLY
// Generated on ${new Date().toISOString()}

export const ANIMATED_DIGIMON = ${JSON.stringify(digimonFolders, null, 2)};
`;

    // Write to the output file
    const outputPath = path.join(
      __dirname,
      "../src/constants/animatedDigimonList.ts"
    );
    fs.writeFileSync(outputPath, tsContent);

    console.log(`Successfully wrote animated Digimon list to ${outputPath}`);
    return digimonFolders;
  } catch (error) {
    console.error("Error generating animated Digimon list:", error);
    return [];
  }
}

// Run the function
generateAnimatedDigimonList();
