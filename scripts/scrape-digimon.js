import axios from "axios";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get proper __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Initialize Supabase client with service role key (not anon key)
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // You'll need to add this to your .env file
);

// Base URL for the Digimon database website
const baseUrl = "https://digidb.io"; // No trailing slash

// Create directory for sprite images
const spritesDir = path.join(process.cwd(), "public", "assets", "digimon");
if (!fs.existsSync(spritesDir)) {
  fs.mkdirSync(spritesDir, { recursive: true });
}

// Helper function to ensure URLs are properly formatted
function formatUrl(url) {
  if (url.startsWith("http")) {
    return url; // Already a full URL
  }

  // Remove leading slash if present to avoid double slashes
  const cleanPath = url.startsWith("/") ? url.substring(1) : url;
  return `${baseUrl}/${cleanPath}`;
}

async function downloadImage(url, filename) {
  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    const writer = fs.createWriteStream(path.join(spritesDir, filename));
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
  } catch (error) {
    console.error(`Error downloading image from ${url}:`, error);
    return null;
  }
}

async function scrapeDigimonList() {
  try {
    console.log("Starting to scrape Digimon list...");
    const { data } = await axios.get(`${baseUrl}/digimon-list`);
    const $ = cheerio.load(data);
    const digimonList = [];

    // Select the table rows - adjust selector based on actual website structure
    $("table tr").each((i, element) => {
      if (i === 0) return; // Skip header row

      const tds = $(element).find("td");
      if (tds.length < 7) return; // Skip rows without enough cells

      // Get link to detail page
      const detailUrl = $(tds[1]).find("a").attr("href");
      // Extract request_id from URL
      const requestId = detailUrl
        ? parseInt(detailUrl.match(/request=(\d+)/)?.[1])
        : null;

      if (!requestId) return; // Skip if no request ID found

      const digimonId = parseInt($(tds[0]).text().trim().replace("#", ""));
      const name = $(tds[1]).find("a").text().trim();
      const stage = $(tds[2]).text().trim();
      const type = $(tds[3]).text().trim();
      const attribute = $(tds[4]).text().trim();

      // Get stats - handle potential NaN values
      const hp = parseInt($(tds[7]).text().trim()) || 0;
      const sp = parseInt($(tds[8]).text().trim()) || 0;
      const atk = parseInt($(tds[9]).text().trim()) || 0;
      const def = parseInt($(tds[10]).text().trim()) || 0;
      const int = parseInt($(tds[11]).text().trim()) || 0;
      const spd = parseInt($(tds[12]).text().trim()) || 0;

      // Get sprite image URL
      const spriteImg = $(tds[1]).find("img");
      const sprite_url = spriteImg.attr("src");

      digimonList.push({
        digimon_id: digimonId,
        request_id: requestId,
        name,
        stage,
        type,
        attribute,
        sprite_url,
        detail_url: detailUrl,
        hp,
        sp,
        atk,
        def,
        int,
        spd,
      });
    });

    console.log(`Found ${digimonList.length} Digimon`);
    return digimonList;
  } catch (error) {
    console.error("Error scraping Digimon list:", error);
    return [];
  }
}

async function scrapeEvolutionData(detailUrl, digimonId) {
  try {
    const fullUrl = formatUrl(detailUrl);
    console.log(`Fetching data from ${fullUrl}`);
    const { data } = await axios.get(fullUrl);
    const $ = cheerio.load(data);

    const evolvesFrom = [];
    const evolvesTo = [];

    // Digivolves From (first table)
    $("table[style='width: 100%']")
      .first()
      .find("td a")
      .each((_, element) => {
        const name = $(element).text().trim();
        if (name !== "Evolution Chart") {
          // Ignore the table label
          evolvesFrom.push({ name });
        }
      });

    // Digivolves Into (second table)
    $("table[style='width: 100%']")
      .eq(1)
      .find("tr:not(.digiheader)")
      .each((_, row) => {
        const name = $(row).find("td[width='30%'] a").text().trim();
        const levelText = $(row)
          .find("td[width='15%']")
          .text()
          .trim()
          .replace("Level: ", "");
        const level = parseInt(levelText);

        if (name && !isNaN(level)) {
          evolvesTo.push({ name, level_required: level });
        }
      });

    console.log(
      `Digimon #${digimonId} - Evolves From: ${evolvesFrom.length}, Evolves To: ${evolvesTo.length}`
    );
    return { evolvesFrom, evolvesTo };
  } catch (error) {
    console.error(
      `Error scraping evolution data for Digimon #${digimonId}:`,
      error
    );
    return { evolvesFrom: [], evolvesTo: [] };
  }
}

async function downloadAllSprites(digimonList) {
  console.log("Downloading sprite images...");
  const result = [];

  for (const digimon of digimonList) {
    if (digimon.sprite_url) {
      try {
        // Extract filename from URL
        const filename = path.basename(digimon.sprite_url);

        // Download the image
        console.log(`Downloading sprite for ${digimon.name}...`);
        await downloadImage(digimon.sprite_url, filename);

        // Update the sprite URL to point to the local file
        result.push({
          ...digimon,
          sprite_url: `/assets/digimon/${filename}`,
        });
      } catch (error) {
        console.error(`Error downloading sprite for ${digimon.name}:`, error);
        result.push(digimon); // Keep the original URL
      }

      // Add a small delay to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 200));
    } else {
      result.push(digimon);
    }
  }

  return result;
}

async function saveToDatabase(digimonList, evolutionData) {
  console.log("Saving data to Supabase...");

  // First, clear existing data
  await supabase.from("evolution_paths").delete().neq("id", 0);
  await supabase.from("digimon").delete().neq("id", 0);

  // Insert all Digimon
  const { data: insertedDigimon, error: digimonError } = await supabase
    .from("digimon")
    .insert(digimonList)
    .select("id, digimon_id, request_id, name");

  if (digimonError) {
    console.error("Error inserting Digimon:", digimonError);
    return;
  }

  console.log(`Inserted ${insertedDigimon.length} Digimon`);

  // Create a map of request_id to database id
  const requestIdToDbId = {};
  const nameToDbId = {};

  insertedDigimon.forEach((digimon) => {
    requestIdToDbId[digimon.request_id] = digimon.id;
    nameToDbId[digimon.name.toLowerCase()] = digimon.id;
  });

  // Insert evolution paths
  const evolutionPaths = [];

  for (const requestId in evolutionData) {
    const fromDigimonDbId = requestIdToDbId[requestId];

    if (!fromDigimonDbId) {
      console.warn(
        `Could not find database ID for Digimon with request_id ${requestId}`
      );
      continue;
    }

    const { evolvesTo } = evolutionData[requestId];

    for (const evolution of evolvesTo) {
      const toDigimonName = evolution.name.toLowerCase();
      const toDigimonDbId = nameToDbId[toDigimonName];

      if (!toDigimonDbId) {
        console.warn(
          `Could not find database ID for Digimon named "${evolution.name}"`
        );
        continue;
      }

      evolutionPaths.push({
        from_digimon_id: fromDigimonDbId,
        to_digimon_id: toDigimonDbId,
        level_required: evolution.level_required,
      });
    }
  }

  // Insert evolution paths in batches to avoid hitting limits
  const batchSize = 100;
  for (let i = 0; i < evolutionPaths.length; i += batchSize) {
    const batch = evolutionPaths.slice(i, i + batchSize);
    const { error: evolutionError } = await supabase
      .from("evolution_paths")
      .insert(batch);

    if (evolutionError) {
      console.error(
        `Error inserting evolution paths batch ${i}:`,
        evolutionError
      );
    }
  }

  console.log(`Inserted ${evolutionPaths.length} evolution paths`);
}

async function main() {
  try {
    // Scrape basic Digimon data
    const digimonList = await scrapeDigimonList();

    // Save to a temporary file in case of errors
    fs.writeFileSync("digimon_list.json", JSON.stringify(digimonList, null, 2));

    // Download sprite images
    const digimonWithSprites = await downloadAllSprites(digimonList);

    // Scrape evolution data for each Digimon
    const evolutionData = {};
    for (const digimon of digimonWithSprites) {
      console.log(`Scraping evolution data for ${digimon.name}...`);

      evolutionData[digimon.request_id] = await scrapeEvolutionData(
        digimon.detail_url,
        digimon.digimon_id
      );

      // Add a small delay to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Save evolution data to a temporary file
    fs.writeFileSync(
      "evolution_data.json",
      JSON.stringify(evolutionData, null, 2)
    );

    // Save everything to the database
    await saveToDatabase(digimonWithSprites, evolutionData);

    console.log("Scraping and database import complete!");
  } catch (error) {
    console.error("Error in main process:", error);
  }
}

// Test the scraper with a specific Digimon
async function testScraper() {
  try {
    console.log("Testing scraper with WereGarurumon...");
    const result = await scrapeEvolutionData(
      "/digimon-search/?request=164",
      164
    );
    console.log("Evolves From:", JSON.stringify(result.evolvesFrom, null, 2));
    console.log("Evolves To:", JSON.stringify(result.evolvesTo, null, 2));
  } catch (error) {
    console.error("Error testing scraper:", error);
  }
}

// Comment out the test function
// testScraper();

// Run the main scraper
main();
