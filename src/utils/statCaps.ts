/**
 * Returns the maximum number of bonus stat points a Digimon can gain in a single day,
 * scaled by evolutionary stage. Higher stages can train harder and accumulate more each day.
 */
export function getDailyStatCap(stage: string): number {
  switch (stage.toLowerCase()) {
    case "baby":
    case "in-training":
      return 4;
    case "rookie":
      return 6;
    case "champion":
      return 8;
    case "ultimate":
      return 10;
    case "mega":
      return 12;
    default:
      return 6;
  }
}
