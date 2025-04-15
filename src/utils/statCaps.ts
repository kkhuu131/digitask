export function getDailyStatCap(stage: string): number {
  switch (stage.toLowerCase()) {
    case "baby":
    case "in-training":
      return 5;
    case "rookie":
      return 8;
    case "champion":
      return 12;
    case "ultimate":
      return 15;
    case "mega":
      return 20;
    default:
      return 8; // Default to rookie cap if stage is unknown
  }
}
