import React, { useLayoutEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArenaDigimon } from '../engine/arenaTypes';
import {
  EffectPoint,
  TechniqueEffect,
  sampleTechniqueWindup,
  techniqueAnchors,
} from '../utils/techniquePresentation';

export type { TechniqueEffect } from '../utils/techniquePresentation';

interface Props {
  effects: TechniqueEffect[];
  reducedMotion: boolean;
  actorsRef: React.MutableRefObject<ArenaDigimon[]>;
  playbackTimeRef: React.MutableRefObject<number>;
  frameUpdatesRef: React.MutableRefObject<Set<() => void>>;
  onEffectComplete: (id: string) => void;
}

const TechniqueVisual: React.FC<Omit<Props, 'effects'> & { effect: TechniqueEffect }> = ({
  effect,
  reducedMotion,
  actorsRef,
  playbackTimeRef,
  frameUpdatesRef,
  onEffectComplete,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const launchRef = useRef<EffectPoint | null>(null);
  const expiredRef = useRef(false);
  const projectile = effect.techniqueId === 'ember-burst';
  const isHit = effect.phase === 'hit';
  const size = projectile ? (isHit ? 96 : 24) : 88;
  const anchors = techniqueAnchors(effect, actorsRef.current);
  const initialPoint = isHit ? anchors.target : anchors.source;

  useLayoutEffect(() => {
    const update = () => {
      const element = elementRef.current;
      if (!element || expiredRef.current) return;
      let point: EffectPoint;
      if (isHit) {
        point = techniqueAnchors(effect, actorsRef.current).target;
      } else {
        const pose = sampleTechniqueWindup(
          effect,
          playbackTimeRef.current,
          actorsRef.current,
          launchRef.current
        );
        if (pose.expired) {
          expiredRef.current = true;
          element.style.opacity = '0';
          onEffectComplete(effect.id);
          return;
        }
        launchRef.current = pose.launchPoint;
        point = reducedMotion ? techniqueAnchors(effect, actorsRef.current).source : pose;
        const scale = reducedMotion
          ? 0.8
          : projectile
            ? 0.45 + Math.sin(Math.PI * pose.progress) * 0.55
            : 1.05 - Math.sin(Math.PI * pose.progress) * 0.35;
        element.style.transform = `scale(${scale})`;
        element.style.opacity = String(reducedMotion ? 0.65 : 0.4 + pose.progress * 0.5);
      }
      element.style.left = `${point.x - size / 2}px`;
      element.style.top = `${point.y - size / 2}px`;
      element.style.zIndex = String(Math.round(point.y) + 5);
    };
    const updates = frameUpdatesRef.current;
    updates.add(update);
    update();
    return () => {
      updates.delete(update);
    };
  }, [
    effect,
    actorsRef,
    playbackTimeRef,
    frameUpdatesRef,
    reducedMotion,
    onEffectComplete,
    isHit,
    projectile,
    size,
  ]);

  const style: React.CSSProperties = {
    // Position is owned by the battle frame loop, including in reduced-motion CSS.
    transitionProperty: 'none',
    left: initialPoint.x - size / 2,
    top: initialPoint.y - size / 2,
    width: size,
    height: size,
    zIndex: Math.round(initialPoint.y) + 5,
    ...(projectile
      ? {
          background: isHit
            ? 'radial-gradient(circle, rgba(255,250,218,.98) 0 8%, rgba(255,174,55,.9) 20%, rgba(239,68,35,.55) 42%, transparent 70%)'
            : 'radial-gradient(circle at 38% 35%, #fff7cf 0 12%, #ffd166 24%, #ff6b2c 55%, #bd2417 72%, transparent 74%)',
          boxShadow: isHit ? undefined : '0 0 10px 3px rgba(255,209,102,.9)',
        }
      : {
          border: '3px solid rgba(255,245,205,.9)',
          boxShadow: '0 0 14px rgba(255,196,74,.8), inset 0 0 18px rgba(255,255,255,.55)',
        }),
    mixBlendMode: 'screen',
  };

  if (isHit)
    return (
      <motion.div
        ref={elementRef}
        data-technique-effect={effect.techniqueId}
        data-effect-phase="hit"
        data-effect-target={effect.targetId}
        className="absolute rounded-full"
        style={style}
        initial={{ scale: 0.15, opacity: 1 }}
        animate={{ scale: reducedMotion ? 0.7 : 1.35, opacity: 0 }}
        transition={{ duration: reducedMotion ? 0.2 : 0.48, ease: 'easeOut' }}
        onAnimationComplete={() => onEffectComplete(effect.id)}
      />
    );
  return (
    <div
      ref={elementRef}
      data-technique-effect={effect.techniqueId}
      data-effect-phase="windup"
      data-effect-attacker={effect.attackerId}
      data-effect-target={effect.targetId}
      className="absolute rounded-full"
      style={{ ...style, opacity: 0 }}
    />
  );
};

const TechniqueEffects: React.FC<Props> = ({ effects, ...props }) => (
  <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
    {effects.map((effect) => (
      <TechniqueVisual key={`${effect.id}:${effect.phase}`} effect={effect} {...props} />
    ))}
  </div>
);

export default TechniqueEffects;
