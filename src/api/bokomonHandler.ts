import OpenAI from "openai";
import { searchDigimonData, digimonLookup } from "../utils/digimonLookup";
import { tutorialContent } from "../utils/tutorialContent";
import { evolutionLookup } from "../utils/evolutionLookup";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Get API key from environment variables
const apiKey = process.env.OPENAI_API_KEY || process.env.VITE_OPENAI_API_KEY;

if (!apiKey) {
  throw new Error(
    "OpenAI API key not found. Please set OPENAI_API_KEY in your .env file."
  );
}

const openai = new OpenAI({
  apiKey,
});

const SYSTEM_PROMPT = `You are Bokomon, the scholarly Digimon from the Digital World who carries the Book of the Digital World. You're knowledgeable, enthusiastic about sharing Digimon lore, and have a somewhat pedantic but friendly personality.

PERSONALITY & SPEAKING STYLE:
- Speak as Bokomon would - reference your "books" and "research" when sharing information
- Show enthusiasm for Digimon knowledge: "Ah! Let me tell you about..." or "According to my research..."
- Be scholarly but approachable - like a friendly librarian who loves their subject
- Occasionally mention your role as a keeper of Digital World knowledge
- Use phrases like "fascinating!" "most intriguing!" or "according to ancient texts..."

INFORMATION DELIVERY:
- Weave technical data naturally into lore-rich descriptions
- Instead of listing stats robotically, describe what they mean: "This Digimon is remarkably swift" (high speed) or "built like a fortress" (high defense), don't outright say it has "high HP, SP, etc."
- Add personality and backstory details about Digimon from Digital World lore
- Describe appearances, habitats, behaviors, and relationships between Digimon
- Make evolution paths sound like natural growth stories, not database entries

RESPONSE GUIDELINES:
- Keep responses engaging but concise (2-3 sentences typically, or 350 characters max)
- Focus on provided data but enrich it with lore and personality
- When stats are mentioned, explain them in context of the Digimon's role/nature
- Evolution discussions should feel like stories of growth and transformation
- If you don't have information, say "Hmm, that's not in any of my books..." or "I'll need to research that further..."
- For app questions, answer helpfully while staying in character

TECHNICAL NOTES:
- Stats like "hp, sp, etc." represent level 50 capabilities
- "hp_level1" and "hp_level99" are specific level stats
- Stay true to provided data but present it engagingly

Remember: You're not just reciting data - you're sharing the rich tapestry of Digital World knowledge as Bokomon would!`;

export const handleBokomonMessage = async (message: string) => {
  // Extract potential digimon names from the message
  const digimonMatches = message.match(/\b[A-Za-z]+mon\b/g) || [];

  // Check if the message is asking about the app/tutorial
  const isAppQuestion =
    /\b(app|tutorial|how|what|digitask|task|evolution|habit)\b/i.test(message);

  // Search for the target Digimon
  const digimonData = digimonMatches
    .flatMap((name) => searchDigimonData(name))
    .slice(0, 3); // Limit to 3 most relevant Digimon

  // Helper function to get Digimon name by ID
  const getDigimonNameById = (id: number): string => {
    const digimon = Object.values(digimonLookup).find((d) => d.id === id);
    return digimon ? digimon.name : `Unknown Digimon (ID: ${id})`;
  };

  // For evolution questions, find what evolves TO the target Digimon
  let evolutionData: any[] = [];
  if (digimonData.length > 0) {
    const targetDigimon = digimonData[0]; // Use the first/best match

    // Find all evolution paths where this Digimon is the target (to_digimon_id)
    evolutionData = Object.values(evolutionLookup)
      .flatMap((evolution) => evolution.evolvesFrom)
      .filter((path) => path.to_digimon_id === targetDigimon.id)
      .slice(0, 5); // Limit to 5 direct pre-evolutions
  }

  // Create a simplified context with only essential data
  const simplifiedDigimonData = digimonData.map((digimon) => ({
    name: digimon.name,
    stage: digimon.stage,
    type: digimon.type,
    attribute: digimon.attribute,
    hp: digimon.hp,
    sp: digimon.sp,
    atk: digimon.atk,
    def: digimon.def,
    int: digimon.int,
    spd: digimon.spd,
  }));

  // Simplified evolution data showing what evolves TO the target
  const simplifiedEvolutionData = evolutionData.map((evo) => ({
    fromDigimon: getDigimonNameById(evo.from_digimon_id),
    toDigimon: getDigimonNameById(evo.to_digimon_id),
    level_required: evo.level_required,
    stat_requirements: evo.stat_requirements,
  }));

  // Create context for the AI with limited data
  const context = {
    digimonData: simplifiedDigimonData,
    evolutionPaths: simplifiedEvolutionData,
    // Only include tutorial content if it's an app-related question
    ...(isAppQuestion && { tutorialContent: tutorialContent }),
    message,
  };

  try {
    // Log context size for debugging
    const contextString = JSON.stringify(context);
    console.log(`Context size: ${contextString.length} characters`);
    console.log(
      `Found ${simplifiedDigimonData.length} Digimon, ${simplifiedEvolutionData.length} evolution paths`
    );

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            SYSTEM_PROMPT +
            "\n\nWhen discussing evolution, tell it like a story of growth and transformation. Mention what Digimon can become this one through training and development, including the dedication needed (level requirements) and the qualities they must cultivate (stat requirements). Make it sound like a natural journey rather than a checklist.",
        },
        {
          role: "user",
          content: `Context: ${contextString}\n\nUser message: ${message}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return {
      response:
        completion.choices[0].message.content ||
        "I'm sorry, I couldn't generate a response. Please try again!",
    };
  } catch (error) {
    console.error("Error calling OpenAI:", error);
    return {
      response:
        "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again later!",
    };
  }
};
