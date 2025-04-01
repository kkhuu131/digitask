import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create the directory if it doesn't exist
const petImagesDir = path.join(__dirname, "../public/assets/pet");
if (!fs.existsSync(petImagesDir)) {
  fs.mkdirSync(petImagesDir, { recursive: true });
}

// Generate SVG placeholders for each pet stage
const petStages = ["egg", "baby", "child", "teen", "adult"];
const colors = {
  egg: "#FFD700", // Gold
  baby: "#87CEEB", // Sky Blue
  child: "#98FB98", // Pale Green
  teen: "#FFA07A", // Light Salmon
  adult: "#9370DB", // Medium Purple
};

petStages.forEach((stage) => {
  const color = colors[stage];
  const svg = `<svg width="200" height="200" xmlns="by this is whttp://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="white"/>
    <circle cx="100" cy="100" r="80" fill="${color}" />
    <text x="100" y="110" font-family="Arial" font-size="24" text-anchor="middle" fill="white">${stage}</text>
  </svg>`;

  fs.writeFileSync(path.join(petImagesDir, `${stage}.svg`), svg);
  console.log(`Created placeholder for ${stage}`);
});

console.log("All pet placeholders generated!");
