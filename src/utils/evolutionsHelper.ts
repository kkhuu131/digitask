import {
  EVOLUTION_LOOKUP_TABLE,
  EvolutionPath,
} from "../constants/evolutionLookup";

export function getEvolutionsByDigimonIds(
  digimonIds: number[]
): EvolutionPath[] {
  const { byFrom } = EVOLUTION_LOOKUP_TABLE;
  const evolutions: EvolutionPath[] = [];

  for (const id of digimonIds) {
    const paths =
      (byFrom as unknown as Record<string, readonly EvolutionPath[]>)[
        id.toString()
      ] ?? [];
    evolutions.push(...Array.from(paths));
  }

  return evolutions;
}

export function getAllEvolutions(): EvolutionPath[] {
  return Array.from(EVOLUTION_LOOKUP_TABLE.all as readonly EvolutionPath[]);
}

export function getEvolutions(fromId: number) {
  if (!EVOLUTION_LOOKUP_TABLE.byFrom) {
    throw new Error("Evolution lookup table not found " + fromId);
  }

  return (
    (
      EVOLUTION_LOOKUP_TABLE.byFrom as unknown as Record<
        number,
        EvolutionPath[]
      >
    )[fromId] ?? []
  );
}

export function getDevolutions(toId: number) {
  if (!EVOLUTION_LOOKUP_TABLE.byTo) {
    throw new Error("Evolution lookup table not found " + toId);
  }

  return (
    (EVOLUTION_LOOKUP_TABLE.byTo as unknown as Record<number, EvolutionPath[]>)[
      toId
    ] ?? []
  );
}

export function getEvolutionPath(
  fromId: number,
  toId: number
): EvolutionPath | null {
  if (!fromId || !toId) {
    return null;
  }

  return (
    (EVOLUTION_LOOKUP_TABLE.byPair as Record<string, EvolutionPath>)[
      `${fromId}-${toId}`
    ] ?? null
  );
}
