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
