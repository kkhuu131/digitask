import axios from "axios";
import * as cheerio from "cheerio";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Base URL for the Digimon database website
const baseUrl = "https://digidb.io";

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
    ``;
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

        // Extract stat requirements
        const requiresText = $(row).find("td[width='55%']").text().trim();
        const statRequirements = {};

        // Parse requirements text for stats
        if (requiresText) {
          // Look for HP: X
          const hpMatch = requiresText.match(/HP\s*:?\s*(\d+)/i);
          if (hpMatch) statRequirements.hp = parseInt(hpMatch[1]);

          // Look for SP: X
          const spMatch = requiresText.match(/SP\s*:?\s*(\d+)/i);
          if (spMatch) statRequirements.sp = parseInt(spMatch[1]);

          // Look for ATK: X
          const atkMatch = requiresText.match(/ATK\s*:?\s*(\d+)/i);
          if (atkMatch) statRequirements.atk = parseInt(atkMatch[1]);

          // Look for DEF: X
          const defMatch = requiresText.match(/DEF\s*:?\s*(\d+)/i);
          if (defMatch) statRequirements.def = parseInt(defMatch[1]);

          // Look for INT: X
          const intMatch = requiresText.match(/INT\s*:?\s*(\d+)/i);
          if (intMatch) statRequirements.int = parseInt(intMatch[1]);

          // Look for SPD: X
          const spdMatch = requiresText.match(/SPD\s*:?\s*(\d+)/i);
          if (spdMatch) statRequirements.spd = parseInt(spdMatch[1]);

          const abiMatch = requiresText.match(/ABI\s*:?\s*(\d+)/i);
          if (abiMatch) statRequirements.abi = parseInt(abiMatch[1]);
        }

        if (name && !isNaN(level)) {
          evolvesTo.push({
            name,
            level_required: level,
            stat_requirements: statRequirements,
          });
        }
      });

    console.log(
      `Digimon #${digimonId} - Evolves From: ${evolvesFrom.length}, Evolves To: ${evolvesTo.length}`
    );
    ``;
    return { evolvesFrom, evolvesTo };
  } catch (error) {
    console.error(
      `Error scraping evolution data for Digimon #${digimonId}:`,
      error
    );
    return { evolvesFrom: [], evolvesTo: [] };
  }
}

async function updateEvolutionRequirements(evolutionData) {
  console.log("Updating evolution requirements in Supabase...");

  // Get existing digimon data to map names/request_ids to database IDs
  const { data: existingDigimon, error: fetchError } = await supabase
    .from("digimon")
    .select("id, digimon_id, request_id, name");

  if (fetchError) {
    console.error("Error fetching existing Digimon:", fetchError);
    return;
  }

  // Create mapping dictionaries
  const requestIdToDbId = {};
  const nameToDbId = {};

  existingDigimon.forEach((digimon) => {
    requestIdToDbId[digimon.request_id] = digimon.id;
    nameToDbId[digimon.name.toLowerCase()] = digimon.id;
  });

  // Process each digimon's evolution data
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

      // Update the existing evolution path with stat requirements
      const { error: updateError } = await supabase
        .from("evolution_paths")
        .update({
          stat_requirements: evolution.stat_requirements || {},
        })
        .eq("from_digimon_id", fromDigimonDbId)
        .eq("to_digimon_id", toDigimonDbId);

      if (updateError) {
        console.error(
          `Error updating evolution path from ${fromDigimonDbId} to ${toDigimonDbId}:`,
          updateError
        );
      }
    }
  }

  console.log("Evolution requirements update complete!");
}

async function updateRequirementsOnly() {
  try {
    // Scrape basic Digimon data to get the request_ids
    const digimonList = await scrapeDigimonList();

    // Scrape evolution data for each Digimon
    const evolutionData = {};
    for (const digimon of digimonList) {
      console.log(`Scraping evolution data for ${digimon.name}...`);

      evolutionData[digimon.request_id] = await scrapeEvolutionData(
        digimon.detail_url,
        digimon.digimon_id
      );

      // Add a small delay to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Update just the evolution requirements
    await updateEvolutionRequirements(evolutionData);

    console.log("Requirements update complete!");
  } catch (error) {
    console.error("Error in requirements update process:", error);
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

async function scrapeDetailedStats(detailUrl) {
  try {
    const fullUrl = formatUrl(detailUrl);
    console.log(`Fetching detailed stats from ${fullUrl}`);
    const { data } = await axios.get(fullUrl);
    const $ = cheerio.load(data);

    // Initialize stats objects
    const level1Stats = {
      hp_level1: 0,
      sp_level1: 0,
      atk_level1: 0,
      def_level1: 0,
      int_level1: 0,
      spd_level1: 0,
    };

    const level99Stats = {
      hp_level99: 0,
      sp_level99: 0,
      atk_level99: 0,
      def_level99: 0,
      int_level99: 0,
      spd_level99: 0,
    };

    // Find the level 1 stats row
    $('b:contains("Lv. 01")').each((_, element) => {
      const row = $(element).closest("tr");
      const cells = row.find("td");

      if (cells.length >= 7) {
        // The cells are in order: Level, HP, SP, ATK, DEF, INT, SPD
        level1Stats.hp_level1 = parseInt($(cells[1]).text().trim()) || 0;
        level1Stats.sp_level1 = parseInt($(cells[2]).text().trim()) || 0;
        level1Stats.atk_level1 = parseInt($(cells[3]).text().trim()) || 0;
        level1Stats.def_level1 = parseInt($(cells[4]).text().trim()) || 0;
        level1Stats.int_level1 = parseInt($(cells[5]).text().trim()) || 0;
        level1Stats.spd_level1 = parseInt($(cells[6]).text().trim()) || 0;
      }
    });

    // Find the level 99 stats row
    $('b:contains("Lv. 99")').each((_, element) => {
      const row = $(element).closest("tr");
      const cells = row.find("td");

      if (cells.length >= 7) {
        // The cells are in order: Level, HP, SP, ATK, DEF, INT, SPD
        level99Stats.hp_level99 = parseInt($(cells[1]).text().trim()) || 0;
        level99Stats.sp_level99 = parseInt($(cells[2]).text().trim()) || 0;
        level99Stats.atk_level99 = parseInt($(cells[3]).text().trim()) || 0;
        level99Stats.def_level99 = parseInt($(cells[4]).text().trim()) || 0;
        level99Stats.int_level99 = parseInt($(cells[5]).text().trim()) || 0;
        level99Stats.spd_level99 = parseInt($(cells[6]).text().trim()) || 0;
      }
    });

    // Log what we found for debugging
    console.log(`Level 1 stats for ${detailUrl}:`, level1Stats);
    console.log(`Level 99 stats for ${detailUrl}:`, level99Stats);

    // Return combined stats
    return {
      ...level1Stats,
      ...level99Stats,
    };
  } catch (error) {
    console.error(`Error scraping detailed stats:`, error);
    return {
      hp_level1: 0,
      sp_level1: 0,
      atk_level1: 0,
      def_level1: 0,
      int_level1: 0,
      spd_level1: 0,
      hp_level99: 0,
      sp_level99: 0,
      atk_level99: 0,
      def_level99: 0,
      int_level99: 0,
      spd_level99: 0,
    };
  }
}
async function addDetailedStats(digimonList) {
  const enhancedDigimonList = [];

  for (const digimon of digimonList) {
    try {
      console.log(`Fetching detailed stats for ${digimon.name}...`);

      // Get level 1 and 99 stats from detail page
      const additionalStats = await scrapeDetailedStats(digimon.detail_url);

      // Update the database with just the new stats
      const { error: updateError } = await supabase
        .from("digimon")
        .update({
          ...additionalStats,
        })
        .eq("digimon_id", digimon.digimon_id);

      if (updateError) {
        console.error(`Error updating stats for ${digimon.name}:`, updateError);
      } else {
        console.log(`Updated stats for ${digimon.name}`);
      }

      enhancedDigimonList.push({
        ...digimon,
        ...additionalStats,
      });

      // Add a small delay to avoid overwhelming the server
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`Error processing ${digimon.name}:`, error);
      enhancedDigimonList.push(digimon); // Keep the original data
    }
  }

  return enhancedDigimonList;
}

// Add this function to update just the stats
async function updateStatsOnly() {
  try {
    console.log("Starting to update Digimon stats...");

    // Get existing Digimon data
    const { data: digimonList, error } = await supabase
      .from("digimon")
      .select("*");

    if (error) {
      console.error("Error fetching Digimon:", error);
      return;
    }

    console.log(`Found ${digimonList.length} Digimon to update`);

    // Update stats for all Digimon
    await addDetailedStats(digimonList);

    console.log("Stats update complete!");
  } catch (error) {
    console.error("Error in stats update process:", error);
  }
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

async function debugPageStructure(detailUrl) {
  try {
    const fullUrl = formatUrl(detailUrl);
    console.log(`Analyzing page structure of ${fullUrl}`);
    const { data } = await axios.get(fullUrl);
    const $ = cheerio.load(data);

    // Find all instances of Lv. 01 and Lv. 99
    console.log("=== Level 1 Sections ===");
    $('b:contains("Lv. 01")').each((i, el) => {
      console.log(`Found Lv. 01 instance ${i + 1}:`);
      console.log($(el).parent().parent().html());
    });

    console.log("\n=== Level 99 Sections ===");
    $('b:contains("Lv. 99")').each((i, el) => {
      console.log(`Found Lv. 99 instance ${i + 1}:`);
      console.log($(el).parent().parent().html());
    });
  } catch (error) {
    console.error("Error debugging page structure:", error);
  }
}

// Add this to your main function or create a test function
async function testDetailScraping() {
  // Test with a specific Digimon
  await debugPageStructure("/digimon-search/?request=164"); // WereGarurumon
  const stats = await scrapeDetailedStats("/digimon-search/?request=164");
  console.log("Extracted stats:", stats);
}

// Comment out the test function
// testScraper();

// Run the main scraper
// main();

// updateStatsOnly();

updateRequirementsOnly();
