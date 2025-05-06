export type StatCategory = "HP" | "SP" | "ATK" | "DEF" | "INT" | "SPD";

// Define keywords for each category
const categoryKeywords: Record<StatCategory, string[]> = {
  HP: [
    "health",
    "sleep",
    "rest",
    "relax",
    "doctor",
    "medical",
    "wellness",
    "hydrate",
    "water",
    "break",
    "self-care",
    "selfcare",
    "nap",
    "recovery",
  ],
  SP: [
    "learn",
    "study",
    "journal",
    "meditate",
    "reflect",
    "mindful",
    "mindfulness",
    "energy",
    "mental",
    "focus",
    "concentration",
    "breathe",
    "breathing",
  ],
  ATK: [
    "gym",
    "workout",
    "exercise",
    "run",
    "jog",
    "lift",
    "physical",
    "strength",
    "train",
    "fitness",
    "sport",
    "swim",
    "bike",
    "hike",
    "push",
    "pull",
    "cardio",
  ],
  DEF: [
    "plan",
    "organize",
    "clean",
    "budget",
    "save",
    "money",
    "finance",
    "resilience",
    "protect",
    "secure",
    "backup",
    "insurance",
    "prepare",
    "meditation",
    "stress",
  ],
  INT: [
    "school",
    "homework",
    "read",
    "research",
    "write",
    "code",
    "project",
    "book",
    "article",
    "paper",
    "study",
    "learn",
    "class",
    "course",
    "problem",
    "solve",
    "puzzle",
    "think",
    "analyze",
    "intelligence",
    "smart",
    "brain",
    "knowledge",
  ],
  SPD: [
    "quick",
    "errand",
    "habit",
    "routine",
    "fast",
    "rapid",
    "speed",
    "swift",
    "agile",
    "nimble",
    "hurry",
    "dash",
    "sprint",
    "time",
    "manage",
    "schedule",
  ],
};

// Descriptions for each category
export const categoryDescriptions: Record<StatCategory, string> = {
  HP: "Health, self-care, sleep, breaks, relaxation",
  SP: "Learning, mindfulness, journaling, mental energy",
  ATK: "Physical activities, exercise, chores",
  DEF: "Planning, organization, stress management",
  INT: "Study, work projects, reading, mental challenges",
  SPD: "Quick tasks, errands, time management",
};

// Icons for each category (using emoji for simplicity)
export const categoryIcons: Record<StatCategory, string> = {
  HP: "❤️",
  SP: "✨",
  ATK: "💪",
  DEF: "🛡️",
  INT: "🧠",
  SPD: "⚡",
};

/**
 * Detect the most likely category for a task based on its description
 */
export function detectCategory(description: string): StatCategory | null {
  // Convert to lowercase for case-insensitive matching
  const lowerDescription = description.toLowerCase();

  // Check each category's keywords
  const matches: Record<StatCategory, number> = {
    HP: 0,
    SP: 0,
    ATK: 0,
    DEF: 0,
    INT: 0,
    SPD: 0,
  };

  // Count matches for each category
  Object.entries(categoryKeywords).forEach(([category, keywords]) => {
    keywords.forEach((keyword) => {
      // Check if the keyword is in the description
      // Use word boundary to avoid partial matches
      const regex = new RegExp(`\\b${keyword}\\b`, "i");
      if (regex.test(lowerDescription)) {
        matches[category as StatCategory]++;
      }
    });
  });

  // Find the category with the most matches
  let bestCategory: StatCategory | null = null;
  let maxMatches = 0;

  Object.entries(matches).forEach(([category, count]) => {
    if (count > maxMatches) {
      maxMatches = count;
      bestCategory = category as StatCategory;
    }
  });

  // Only return a category if we have at least one match
  return maxMatches > 0 ? bestCategory : null;
}

// Add this export to the file
export const categoryOptions = Object.entries(categoryDescriptions).map(
  ([value, description]) => ({
    value: value as StatCategory,
    label: `${categoryIcons[value as StatCategory]} ${value} - ${description}`,
  })
);
