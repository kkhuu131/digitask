import { describe, expect, it } from 'vitest';
import { ArenaEvent } from '../../engine/arenaTypes';
import {
  applyTechniqueEvents,
  sampleTechniqueWindup,
  techniqueAnchors,
} from '../../utils/techniquePresentation';

const start: Extract<ArenaEvent, { effectInstanceId: string }> = {
  type: 'technique_start',
  atMs: 100,
  effectInstanceId: 'attack-1',
  attackerId: 'a',
  targetId: 'b',
  techniqueId: 'impact-strike',
  techniqueName: 'Impact',
  element: 'neutral',
  visualId: 'impact',
  visualVersion: 1,
  sourceX: 10,
  sourceY: 20,
  targetX: 100,
  targetY: 200,
  windupMs: 480,
  presentationSeed: 1,
};
const effect = () => applyTechniqueEvents([], [start])[0];
const actors = [
  { id: 'a', x: 30, y: 40, state: 'approaching' as const },
  { id: 'b', x: 130, y: 140, state: 'approaching' as const },
];

describe('technique presentation lifecycle', () => {
  it('clears windups when either actor dies, even without a technique_end', () => {
    for (const digimonId of ['a', 'b']) {
      expect(applyTechniqueEvents([effect()], [{ type: 'death', digimonId }])).toEqual([]);
    }
  });
  it('removes cancelled attacks immediately and preserves unrelated attacks', () => {
    const other = { ...effect(), id: 'other' };
    expect(
      applyTechniqueEvents(
        [effect(), other],
        [{ ...start, type: 'technique_end', outcome: 'cancelled' }]
      )
    ).toEqual([other]);
  });
  it('keeps a completed hit for its fade but clears unfinished attacks at battle end', () => {
    const hit = applyTechniqueEvents(
      [],
      [
        start,
        { ...start, type: 'technique_hit', atMs: 580 },
        { ...start, type: 'technique_end', outcome: 'hit' },
      ]
    );
    expect(hit[0].phase).toBe('hit');
    expect(hit[0].startedAtMs).toBe(100);
    expect(
      applyTechniqueEvents(
        [...hit, { ...effect(), id: 'unfinished' }],
        [{ type: 'battle_end', winner: 'user' }]
      )
    ).toEqual(hit);
  });
});

describe('technique positioning and replay timing', () => {
  it('follows current actor positions instead of the attack-start snapshot', () => {
    expect(techniqueAnchors(effect(), actors).target).toMatchObject({ x: 130, y: 140 });
    expect(sampleTechniqueWindup(effect(), 340, actors, null)).toMatchObject({
      x: 30,
      y: 40,
      progress: 0.5,
    });
  });
  it('charges at the attacker, retains its launch point and reaches a moving target', () => {
    const ember = { ...effect(), techniqueId: 'ember-burst' };
    const charge = sampleTechniqueWindup(ember, 150, actors, null);
    expect(charge.x).toBeGreaterThan(30);
    expect(charge.x).toBeLessThan(50);
    const moved = [
      { ...actors[0], x: 70 },
      { ...actors[1], x: 180 },
    ];
    const arrival = sampleTechniqueWindup(ember, 580, moved, charge.launchPoint);
    expect(arrival.launchPoint).toEqual(charge.launchPoint);
    expect(arrival).toMatchObject({ x: 180, y: 140, progress: 1, expired: false });
  });
  it('uses playback time, tolerates replay sampling and expires missing end events', () => {
    expect(sampleTechniqueWindup(effect(), 340, actors, null).progress).toBe(0.5);
    expect(sampleTechniqueWindup(effect(), 460, actors, null).progress).toBe(0.75);
    expect(sampleTechniqueWindup(effect(), 644, actors, null).expired).toBe(false);
    expect(sampleTechniqueWindup(effect(), 709, actors, null).expired).toBe(true);
    expect(
      sampleTechniqueWindup(effect(), 340, [{ ...actors[0], state: 'dead' }, actors[1]], null)
        .expired
    ).toBe(true);
  });
});
