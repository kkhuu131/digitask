import { BattleDigimon } from '../types/battle';
import {
  TypeAdvantageMap,
  AttributeAdvantageMap,
  calculateCritMultiplier,
  baseDamage,
  missChance,
  criticalHitChance,
  DigimonType,
  DigimonAttribute,
} from '../store/battleStore';

export interface DamageResult {
  damage: number;
  isCritical: boolean;
  isMiss: boolean;
}

/**
 * Calculates damage from attacker to target.
 * Uses ATK/DEF or INT/INT (whichever ATK stat is higher), type matchup,
 * attribute matchup, random variance, and SP-based crit multiplier.
 */
export const calculateDamage = (attacker: BattleDigimon, target: BattleDigimon): DamageResult => {
  const isMiss = Math.random() < missChance;
  if (isMiss) return { damage: 0, isCritical: false, isMiss: true };

  const isCritical = Math.random() < criticalHitChance;
  const critMultiplier = isCritical ? calculateCritMultiplier(attacker.stats.sp) : 1;

  // Physical vs. magic: use whichever of ATK or INT is higher for the attacker
  let attackPower: number;
  let defense: number;
  if (attacker.stats.int > attacker.stats.atk) {
    attackPower = attacker.stats.int;
    defense = target.stats.int;
  } else {
    attackPower = attacker.stats.atk;
    defense = target.stats.def;
  }

  const typeMultiplier =
    TypeAdvantageMap[attacker.type as DigimonType]?.[target.type as DigimonType] ?? 1.0;
  const attributeMultiplier =
    AttributeAdvantageMap[attacker.attribute as DigimonAttribute]?.[target.attribute as DigimonAttribute] ?? 1.0;

  const damageVariance = 0.8 + Math.random() * 0.4;

  const damage = Math.max(
    1,
    Math.round(
      (attackPower / defense) *
        baseDamage *
        damageVariance *
        critMultiplier *
        typeMultiplier *
        attributeMultiplier
    )
  );

  return { damage, isCritical, isMiss };
};
