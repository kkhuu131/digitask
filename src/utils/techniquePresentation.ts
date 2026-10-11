import { ArenaDigimon, ArenaEvent } from '../engine/arenaTypes';

export interface TechniqueEffect {
  id: string;
  techniqueId: string;
  attackerId: string;
  targetId: string;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  windupMs: number;
  startedAtMs: number;
  phase: 'windup' | 'hit';
}

type Actor = Pick<ArenaDigimon, 'id' | 'x' | 'y' | 'state'>;
export interface EffectPoint {
  x: number;
  y: number;
}

export function applyTechniqueEvents(effects: TechniqueEffect[], events: ArenaEvent[]) {
  let next = effects;
  for (const event of events) {
    if (event.type === 'technique_start' || event.type === 'technique_hit') {
      const previous = next.find((effect) => effect.id === event.effectInstanceId);
      next = [
        ...next.filter((effect) => effect.id !== event.effectInstanceId),
        {
          id: event.effectInstanceId,
          techniqueId: event.techniqueId,
          attackerId: event.attackerId,
          targetId: event.targetId,
          sourceX: event.sourceX,
          sourceY: event.sourceY,
          targetX: event.targetX,
          targetY: event.targetY,
          windupMs: event.windupMs,
          startedAtMs: previous?.startedAtMs ?? event.atMs,
          phase: event.type === 'technique_hit' ? 'hit' : 'windup',
        },
      ];
    } else if (event.type === 'technique_end') {
      next = next.filter(
        (effect) =>
          effect.id !== event.effectInstanceId ||
          (event.outcome !== 'cancelled' && effect.phase === 'hit')
      );
    } else if (event.type === 'death') {
      next = next.filter(
        (effect) =>
          effect.phase === 'hit' ||
          (effect.attackerId !== event.digimonId && effect.targetId !== event.digimonId)
      );
    } else if (event.type === 'battle_end') {
      next = next.filter((effect) => effect.phase === 'hit');
    }
  }
  return next;
}

export function techniqueAnchors(effect: TechniqueEffect, actors: Actor[]) {
  const source = actors.find((actor) => actor.id === effect.attackerId);
  const target = actors.find((actor) => actor.id === effect.targetId);
  return {
    source: source ?? { x: effect.sourceX, y: effect.sourceY },
    target: target ?? { x: effect.targetX, y: effect.targetY },
    cancelled: source?.state === 'dead' || target?.state === 'dead',
  };
}

export function sampleTechniqueWindup(
  effect: TechniqueEffect,
  elapsedMs: number,
  actors: Actor[],
  launchPoint: EffectPoint | null
) {
  const anchors = techniqueAnchors(effect, actors);
  const age = Math.max(0, elapsedMs - effect.startedAtMs);
  const progress = Math.min(1, age / Math.max(1, effect.windupMs));
  // Replay events are sampled every 64 ms; allow their hit/end event to arrive.
  const expired = anchors.cancelled || age > effect.windupMs + 128;
  if (effect.techniqueId !== 'ember-burst') {
    return { ...anchors.source, progress, launchPoint: null, expired };
  }
  const dx = anchors.target.x - anchors.source.x;
  const dy = anchors.target.y - anchors.source.y;
  const distance = Math.max(1, Math.hypot(dx, dy));
  const emitter = {
    x: anchors.source.x + (dx / distance) * 20,
    y: anchors.source.y + (dy / distance) * 20,
  };
  const launch = progress <= 0.22 || !launchPoint ? emitter : launchPoint;
  const travel = Math.max(0, (progress - 0.22) / 0.78) ** 2;
  return {
    x: launch.x + (anchors.target.x - launch.x) * travel,
    y: launch.y + (anchors.target.y - launch.y) * travel,
    progress,
    launchPoint: launch,
    expired,
  };
}
