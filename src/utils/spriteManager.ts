import { ANIMATED_DIGIMON } from "../constants/animatedDigimonList";

// Sprite types available
export type SpriteType =
  | "idle1"
  | "idle2"
  | "angry"
  | "attack"
  | "cheer"
  | "happy"
  | "idle_mouth_open"
  | "intimidate"
  | "sad1"
  | "sad2"
  | "sleeping1"
  | "sleeping2";

// Get the appropriate sprite URL based on Digimon name and desired sprite type
export function getSpriteUrl(
  digimonName: string,
  spriteType: SpriteType = "idle1",
  fallbackUrl: string
): string {
  // Check if this Digimon has animated sprites
  if (ANIMATED_DIGIMON.includes(digimonName)) {
    return `/assets/animated_digimon/${digimonName}/${spriteType}.png`;
  }

  // Return the fallback URL for Digimon without animated sprites
  return fallbackUrl;
}

// Add a state tracker for alternating sprites
let spriteToggle = false;

// Determine which sprite to show based on Digimon state
export function determineSpriteType(
  happiness: number,
  isAnimating: boolean = false
): SpriteType {
  if (isAnimating) return "happy"; // For animations like completing tasks

  // Toggle the state for alternating sprites
  spriteToggle = !spriteToggle;

  if (happiness > 80) {
    // Happy Digimon alternates between idle1 and idle2
    return spriteToggle ? "idle1" : "idle2";
  } else if (happiness > 50) {
    return "idle1";
  } else if (happiness > 30) {
    return "idle_mouth_open";
  } else {
    // Sad Digimon alternates between sad1 and sad2
    return spriteToggle ? "sad1" : "sad2";
  }
}
