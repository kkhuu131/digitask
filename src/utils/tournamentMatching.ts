import {
  TOURNAMENT_TEAM_POOL,
  type TournamentTeamTemplate,
} from '../constants/tournamentBossTeams';
import { DIGIMON_LOOKUP_TABLE } from '../constants/digimonLookup';
import { findLevelForPower } from '../engine/arenaOpponents';
import { calculateBaseDigimonPowerRating } from './digimonStatCalculation';
import type { RoundDifficulty, TournamentOpponentDigimon } from '../types/tournament';

export const TOURNAMENT_POWER_MULTIPLIERS = { easy: 0.85, medium: 1, hard: 1.2 };

const STAGES = ['Baby', 'In-Training', 'Rookie', 'Champion', 'Ultimate', 'Mega', 'Ultra'];
const signature = (ids: number[]) => [...ids].sort((a, b) => a - b).join('-');

// Add catalog-based attribute squads without modifying authored or generated constants.
const generated: TournamentTeamTemplate[] = [];
const known = new Set(
  TOURNAMENT_TEAM_POOL.map((template) =>
    signature(template.digimon.map((member) => member.digimon_id))
  )
);
for (const attribute of [
  ...new Set(Object.values(DIGIMON_LOOKUP_TABLE).map((species) => species.attribute)),
]) {
  const species = Object.values(DIGIMON_LOOKUP_TABLE)
    .filter((member) => member.attribute === attribute)
    .sort(
      (a, b) => calculateBaseDigimonPowerRating(a, 50) - calculateBaseDigimonPowerRating(b, 50)
    );
  for (let index = 0; index + 2 < species.length; index++) {
    const members = species.slice(index, index + 3);
    const key = signature(members.map((member) => member.id));
    if (known.has(key)) continue;
    known.add(key);
    generated.push({
      id: `catalog-${key}`,
      name: `${attribute} Squad`,
      digimon: members.map((member) => ({
        digimon_id: member.id,
      })) as TournamentTeamTemplate['digimon'],
    });
  }
}
export const TOURNAMENT_MATCHING_POOL = [...TOURNAMENT_TEAM_POOL, ...generated];

export interface TournamentDraw {
  names: Set<string>;
  compositions: Set<string>;
}
export const createTournamentDraw = (): TournamentDraw => ({
  names: new Set(),
  compositions: new Set(),
});

/** Match total combat power, keeping thematic teams whose actual stats fit the target. */
export function pickTournamentOpponent(
  userTeamPower: number,
  difficulty: RoundDifficulty,
  draw?: TournamentDraw,
  favorite = false
) {
  const target = userTeamPower * TOURNAMENT_POWER_MULTIPLIERS[difficulty];
  const candidates = TOURNAMENT_MATCHING_POOL.filter(
    (template) =>
      !draw?.names.has(template.name) &&
      !draw?.compositions.has(signature(template.digimon.map((member) => member.digimon_id)))
  )
    .map((template) => {
      let remaining = target;
      const team: TournamentOpponentDigimon[] = template.digimon.map((member, index) => {
        const species = DIGIMON_LOOKUP_TABLE[member.digimon_id];
        const level = findLevelForPower(species, remaining / (3 - index), 1, 99);
        remaining -= calculateBaseDigimonPowerRating(species, level);
        return {
          id: `${member.digimon_id}-${index}`,
          digimon_id: member.digimon_id,
          name: species.name,
          current_level: level,
          sprite_url: species.sprite_url,
          type: species.type,
          attribute: species.attribute,
        };
      });
      return {
        display_name: template.name,
        preset: TOURNAMENT_TEAM_POOL.includes(template),
        team,
        error: Math.abs(remaining),
        stage: team.reduce(
          (sum, member) => sum + STAGES.indexOf(DIGIMON_LOOKUP_TABLE[member.digimon_id].stage),
          0
        ),
      };
    })
    .sort((a, b) => a.error - b.error);
  // Retain variety within 5% of the target; outside the catalog's range use the closest fit.
  const best = candidates[0];
  let suitable = candidates.filter(
    (candidate) => candidate.error <= Math.max(target * 0.05, best.error)
  );
  // Authored teams stay the primary pool; generated squads fill missing unique matches.
  const presets = suitable.filter((candidate) => candidate.preset);
  if (presets.length) suitable = presets;
  if (favorite) {
    const highestStage = Math.max(...suitable.map((candidate) => candidate.stage));
    suitable = suitable.filter((candidate) => candidate.stage === highestStage);
  }
  const selected = suitable[Math.floor(Math.random() * suitable.length)];
  draw?.names.add(selected.display_name);
  draw?.compositions.add(signature(selected.team.map((member) => member.digimon_id)));
  return { display_name: selected.display_name, team: selected.team };
}
