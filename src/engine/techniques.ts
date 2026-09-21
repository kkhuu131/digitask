import {
  AttributeAdvantageMap,
  TypeAdvantageMap,
  baseDamage,
  criticalHitChance,
  missChance,
  type DigimonAttribute,
  type DigimonType,
} from './battleRules';
import type { ArenaDigimon } from './arenaTypes';

export type TechniqueId = 'impact-strike' | 'ember-burst';
export type TechniqueDamageKind = 'physical' | 'magic';

export interface TechniqueDefinition {
  id: TechniqueId;
  name: string;
  element: DigimonAttribute;
  damageKind: TechniqueDamageKind;
  delivery: 'melee' | 'projectile';
  spCost: number;
  range: number;
  windupMs: number;
  recoveryMs: number;
  power: number;
  visualId: string;
  visualVersion: 1;
}

export const TECHNIQUES: Record<TechniqueId, TechniqueDefinition> = {
  'impact-strike': {
    id: 'impact-strike',
    name: 'Impact Strike',
    element: 'Neutral',
    damageKind: 'physical',
    delivery: 'melee',
    spCost: 80,
    range: 72,
    windupMs: 480,
    recoveryMs: 900,
    power: 2.2,
    visualId: 'impact-strike-v1',
    visualVersion: 1,
  },
  'ember-burst': {
    id: 'ember-burst',
    name: 'Ember Burst',
    element: 'Fire',
    damageKind: 'magic',
    delivery: 'projectile',
    spCost: 80,
    range: 250,
    windupMs: 720,
    recoveryMs: 1100,
    power: 2.05,
    visualId: 'ember-burst-v1',
    visualVersion: 1,
  },
};

/** Temporary deterministic assignment for the vertical slice; species mapping follows in Phase 1B. */
export function selectInitialTechnique(digimon: Pick<ArenaDigimon, 'attribute' | 'atk' | 'int'>) {
  return digimon.attribute === 'Fire' || digimon.int > digimon.atk
    ? TECHNIQUES['ember-burst']
    : TECHNIQUES['impact-strike'];
}

export function getTechnique(id: string | null | undefined): TechniqueDefinition {
  return id && id in TECHNIQUES ? TECHNIQUES[id as TechniqueId] : TECHNIQUES['impact-strike'];
}

export interface TechniqueDamageResult {
  damage: number;
  isCritical: boolean;
  isMiss: boolean;
}

/** Battle SP never contributes to damage or critical multipliers. */
export function calculateTechniqueDamage(
  attacker: ArenaDigimon,
  target: ArenaDigimon,
  technique: TechniqueDefinition,
  random: () => number
): TechniqueDamageResult {
  if (random() < missChance) return { damage: 0, isCritical: false, isMiss: true };

  const isCritical = random() < criticalHitChance;
  const attackPower = technique.damageKind === 'magic' ? attacker.int : attacker.atk;
  const defense = Math.max(1, technique.damageKind === 'magic' ? target.int : target.def);
  const typeMultiplier =
    TypeAdvantageMap[attacker.type as DigimonType]?.[target.type as DigimonType] ?? 1;
  const attributeMultiplier =
    AttributeAdvantageMap[technique.element]?.[target.attribute as DigimonAttribute] ?? 1;
  const variance = 0.8 + random() * 0.4;
  const criticalMultiplier = isCritical ? 1.5 : 1;
  const damage = Math.max(
    1,
    Math.round(
      (attackPower / defense) *
        baseDamage *
        variance *
        criticalMultiplier *
        typeMultiplier *
        attributeMultiplier *
        technique.power
    )
  );
  return { damage, isCritical, isMiss: false };
}

export function calculateArenaBasicDamage(
  attacker: ArenaDigimon,
  target: ArenaDigimon,
  random: () => number
): TechniqueDamageResult {
  if (random() < missChance) return { damage: 0, isCritical: false, isMiss: true };
  const isCritical = random() < criticalHitChance;
  const useMagic = attacker.int > attacker.atk;
  const attackPower = useMagic ? attacker.int : attacker.atk;
  const defense = Math.max(1, useMagic ? target.int : target.def);
  const typeMultiplier =
    TypeAdvantageMap[attacker.type as DigimonType]?.[target.type as DigimonType] ?? 1;
  const attributeMultiplier =
    AttributeAdvantageMap[attacker.attribute as DigimonAttribute]?.[
      target.attribute as DigimonAttribute
    ] ?? 1;
  const variance = 0.8 + random() * 0.4;
  return {
    damage: Math.max(
      1,
      Math.round(
        (attackPower / defense) *
          baseDamage *
          variance *
          (isCritical ? 1.5 : 1) *
          typeMultiplier *
          attributeMultiplier
      )
    ),
    isCritical,
    isMiss: false,
  };
}
