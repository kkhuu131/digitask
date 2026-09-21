import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { createPortal } from 'react-dom';
import { getSpriteUrl } from '../utils/spriteManager';

interface EvolutionAnimationProps {
  oldSpriteUrl: string;
  newSpriteUrl: string;
  oldSpeciesName: string;
  newSpeciesName: string;
  onComplete: () => void;
  isDevolution?: boolean;
  isDNAFusion?: boolean;
  isFormTransformation?: boolean;
  formType?: string;
  dnaPartnerSpriteUrl?: string;
  dnaPartnerSpeciesName?: string;
}

type AnimationStage = 'charge' | 'deconstruct' | 'data' | 'reconstruct' | 'finale';

const DATA_PIXEL_COUNT = 48;

interface PixelMotion {
  dx: number;
  dy: number;
  rotate: number;
  delay: number;
}

const buildPixelMotion = (index: number): PixelMotion => {
  const angle = (index / DATA_PIXEL_COUNT) * Math.PI * 2;
  const jitterX = ((index * 37) % 29) - 14;
  const jitterY = ((index * 53) % 31) - 15;
  const distance = 72 + ((index * 17) % 68);

  return {
    dx: Math.cos(angle) * distance + jitterX,
    dy: Math.sin(angle) * distance + jitterY,
    rotate: ((index * 47) % 180) - 90,
    delay: (index % 8) * 0.035,
  };
};

const PersistentDataField = ({
  motions,
  phase,
  scatterDelay = 0.5,
}: {
  motions: PixelMotion[];
  phase: 'out' | 'orbit' | 'in';
  scatterDelay?: number;
}) => (
  <div aria-hidden="true" className="absolute inset-0">
    {motions.map((particle, index) => {
      const size = 5 + (index % 4) * 2;
      const orbit = index % 2 === 0 ? 1 : -1;
      const animate =
        phase === 'out'
          ? {
              x: particle.dx,
              y: particle.dy,
              rotate: particle.rotate,
              opacity: 1,
              scale: 1,
            }
          : phase === 'orbit'
            ? {
                x: [
                  particle.dx,
                  -particle.dy * orbit,
                  -particle.dx,
                  particle.dy * orbit,
                  particle.dx,
                ],
                y: [
                  particle.dy,
                  particle.dx * orbit,
                  -particle.dy,
                  -particle.dx * orbit,
                  particle.dy,
                ],
                rotate: [
                  particle.rotate,
                  particle.rotate + 120 * orbit,
                  particle.rotate + 240 * orbit,
                  particle.rotate + 360 * orbit,
                ],
                opacity: 1,
                scale: [1, 0.75, 1, 0.8, 1],
              }
            : { x: 0, y: 0, rotate: 0, opacity: 0, scale: 0.25 };

      const transition =
        phase === 'orbit'
          ? { duration: 3.2, ease: 'linear' as const }
          : {
              duration: 1.2,
              delay: phase === 'out' ? scatterDelay + particle.delay : particle.delay,
              ease: 'easeInOut' as const,
            };

      return (
        <motion.span
          key={index}
          className="absolute left-1/2 top-1/2 block bg-white"
          initial={{ x: 0, y: 0, rotate: 0, opacity: 0, scale: 0.25 }}
          animate={animate}
          transition={transition}
          style={{
            width: size,
            height: size,
            marginLeft: -size / 2,
            marginTop: -size / 2,
            boxShadow: '0 0 7px rgba(255,255,255,0.9)',
          }}
        />
      );
    })}
  </div>
);

const EvolutionAnimation: React.FC<EvolutionAnimationProps> = ({
  oldSpriteUrl,
  newSpriteUrl,
  oldSpeciesName,
  newSpeciesName,
  onComplete,
  isDevolution = false,
  isDNAFusion = false,
  isFormTransformation = false,
  formType,
  dnaPartnerSpriteUrl,
  dnaPartnerSpeciesName,
}) => {
  const [stage, setStage] = useState<AnimationStage>('charge');
  const [sourceFrame, setSourceFrame] = useState<'idle1' | 'idle2'>('idle1');
  const [celebrationFrame, setCelebrationFrame] = useState<'happy' | 'cheer'>('happy');
  const onCompleteRef = useRef(onComplete);
  const overlayRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const motions = useMemo(
    () => Array.from({ length: DATA_PIXEL_COUNT }, (_, index) => buildPixelMotion(index)),
    []
  );

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const previousActiveElement = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    overlayRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, []);

  useEffect(() => {
    if (stage !== 'charge' || reducedMotion) return;
    const interval = window.setInterval(
      () => setSourceFrame((frame) => (frame === 'idle1' ? 'idle2' : 'idle1')),
      700
    );
    return () => window.clearInterval(interval);
  }, [stage, reducedMotion]);

  useEffect(() => {
    if (stage !== 'finale' || reducedMotion) return;
    const interval = window.setInterval(
      () => setCelebrationFrame((frame) => (frame === 'happy' ? 'cheer' : 'happy')),
      650
    );
    return () => window.clearInterval(interval);
  }, [stage, reducedMotion]);

  useEffect(() => {
    if (reducedMotion) {
      const finaleTimer = window.setTimeout(() => setStage('finale'), 500);
      const completeTimer = window.setTimeout(() => onCompleteRef.current(), 3600);
      return () => {
        window.clearTimeout(finaleTimer);
        window.clearTimeout(completeTimer);
      };
    }

    const timers = [
      window.setTimeout(() => setStage('deconstruct'), 3800),
      window.setTimeout(() => setStage('data'), 5700),
      window.setTimeout(() => setStage('reconstruct'), 9000),
      window.setTimeout(() => setStage('finale'), 11700),
      window.setTimeout(() => onCompleteRef.current(), 14800),
    ];

    return () => timers.forEach(window.clearTimeout);
  }, [reducedMotion]);

  const title = isDevolution
    ? 'DE-DIGIVOLUTION'
    : isDNAFusion
      ? 'DNA DIGIVOLUTION'
      : isFormTransformation
        ? `${formType?.toUpperCase()} FORM`
        : 'DIGIVOLUTION';

  const resultText = isDevolution
    ? `${oldSpeciesName} has devolved to ${newSpeciesName}!`
    : isDNAFusion
      ? `${oldSpeciesName} has DNA Digivolved to ${newSpeciesName}!`
      : isFormTransformation
        ? `${oldSpeciesName} has transformed into ${newSpeciesName}!`
        : `${oldSpeciesName} has evolved to ${newSpeciesName}!`;

  const originalsVisible = stage === 'charge';
  const showDeconstruction = stage === 'deconstruct';
  const showDataCloud = stage === 'data';
  const showReconstruction = stage === 'reconstruct';
  const showFinale = stage === 'finale';
  const dataPhase = showDeconstruction
    ? 'out'
    : showDataCloud
      ? 'orbit'
      : showReconstruction
        ? 'in'
        : null;
  const sourceSpriteUrl = getSpriteUrl(oldSpeciesName, sourceFrame, oldSpriteUrl);
  const reconstructionSpriteUrl = getSpriteUrl(newSpeciesName, 'idle1', newSpriteUrl);
  const dnaPartnerAnimatedUrl = dnaPartnerSpeciesName
    ? getSpriteUrl(dnaPartnerSpeciesName, sourceFrame, dnaPartnerSpriteUrl || '')
    : dnaPartnerSpriteUrl;
  const celebrationSpriteUrl = getSpriteUrl(newSpeciesName, celebrationFrame, newSpriteUrl);

  return createPortal(
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${title}: ${oldSpeciesName} becoming ${newSpeciesName}`}
      tabIndex={-1}
      className="fixed inset-0 z-overlay flex h-[100dvh] w-screen touch-none overscroll-none items-center justify-center overflow-hidden bg-gray-950 outline-none"
      onWheel={(event) => event.preventDefault()}
      onTouchMove={(event) => event.preventDefault()}
    >
      <div className="relative grid h-full w-full max-w-2xl grid-rows-[auto_minmax(0,1fr)_auto] gap-4 px-4 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
        <motion.h2
          initial={reducedMotion ? false : { opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center font-heading text-2xl font-bold tracking-widest text-accent-300 sm:text-3xl"
        >
          {title}
        </motion.h2>

        <div
          className="relative min-h-0 w-full"
          aria-label={`${oldSpeciesName} becoming ${newSpeciesName}`}
        >
          {originalsVisible && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.img
                src={sourceSpriteUrl}
                alt={oldSpeciesName}
                className="absolute h-48 w-48 object-contain"
                initial={{ opacity: 1 }}
                animate={{ opacity: [1, 1, 0], x: isDNAFusion ? -72 : 0, scale: [1, 1.04, 1.08] }}
                transition={{ duration: 3.7, times: [0, 0.5, 1], ease: 'easeInOut' }}
                style={{ imageRendering: 'pixelated' }}
                onError={(event) => {
                  event.currentTarget.src = oldSpriteUrl;
                }}
              />
              <motion.img
                src={sourceSpriteUrl}
                alt=""
                className="absolute h-48 w-48 object-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0, 1], x: isDNAFusion ? -72 : 0, scale: [1, 1.04, 1.08] }}
                transition={{ duration: 3.7, times: [0, 0.5, 1], ease: 'easeInOut' }}
                style={{
                  imageRendering: 'pixelated',
                  filter: 'brightness(0) invert(1) drop-shadow(0 0 14px rgba(255,255,255,0.9))',
                }}
              />
              {isDNAFusion && dnaPartnerSpriteUrl && (
                <>
                  <motion.img
                    src={dnaPartnerAnimatedUrl}
                    alt="DNA Digivolution partner"
                    className="absolute h-48 w-48 object-contain"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: [1, 1, 0], x: 72, scale: [1, 1.04, 1.08] }}
                    transition={{ duration: 3.7, times: [0, 0.5, 1], ease: 'easeInOut' }}
                    style={{ imageRendering: 'pixelated' }}
                    onError={(event) => {
                      event.currentTarget.src = dnaPartnerSpriteUrl;
                    }}
                  />
                  <motion.img
                    src={dnaPartnerAnimatedUrl}
                    alt=""
                    className="absolute h-48 w-48 object-contain"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0, 1], x: 72, scale: [1, 1.04, 1.08] }}
                    transition={{ duration: 3.7, times: [0, 0.5, 1], ease: 'easeInOut' }}
                    style={{
                      imageRendering: 'pixelated',
                      filter: 'brightness(0) invert(1) drop-shadow(0 0 14px rgba(255,255,255,0.9))',
                    }}
                  />
                </>
              )}
            </div>
          )}

          {dataPhase && (
            <PersistentDataField
              motions={motions}
              phase={dataPhase}
              scatterDelay={isDNAFusion ? 0.65 : 0.5}
            />
          )}

          {showDeconstruction && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.img
                src={sourceSpriteUrl}
                alt=""
                className="absolute h-48 w-48 object-contain"
                initial={{ opacity: 1, scale: 1.08, x: isDNAFusion ? -72 : 0 }}
                animate={{
                  opacity: [1, 0.8, 0],
                  scale: [1.08, 0.72, 0.15],
                  x: isDNAFusion ? [-72, -35, 0] : 0,
                }}
                transition={{ duration: 1.1, ease: 'easeIn' }}
                style={{
                  imageRendering: 'pixelated',
                  filter: 'brightness(0) invert(1) drop-shadow(0 0 16px white)',
                }}
              />
              {isDNAFusion && dnaPartnerAnimatedUrl && (
                <motion.img
                  src={dnaPartnerAnimatedUrl}
                  alt=""
                  className="absolute h-48 w-48 object-contain"
                  initial={{ opacity: 1, scale: 1.08, x: 72 }}
                  animate={{ opacity: [1, 0.8, 0], scale: [1.08, 0.72, 0.15], x: [72, 35, 0] }}
                  transition={{ duration: 1.1, ease: 'easeIn' }}
                  style={{
                    imageRendering: 'pixelated',
                    filter: 'brightness(0) invert(1) drop-shadow(0 0 16px white)',
                  }}
                />
              )}
              {isDNAFusion ? (
                <>
                  {[-72, 72].map((startX) => (
                    <motion.div
                      key={startX}
                      className="absolute h-14 w-14 rounded-full bg-white"
                      initial={{ x: startX, opacity: 0, scale: 0.2 }}
                      animate={{
                        x: [startX, startX, 0, 0],
                        opacity: [0, 1, 1, 0],
                        scale: [0.2, 0.8, 0.9, 0.6],
                      }}
                      transition={{
                        duration: 1.15,
                        times: [0, 0.22, 0.72, 1],
                        ease: 'easeInOut',
                      }}
                      style={{ boxShadow: '0 0 28px 12px rgba(255,255,255,0.85)' }}
                    />
                  ))}
                  <motion.div
                    className="absolute h-24 w-24 rounded-full bg-white"
                    initial={{ opacity: 0, scale: 0.25 }}
                    animate={{ opacity: [0, 0, 1, 1, 0], scale: [0.25, 0.25, 0.85, 1, 0.45] }}
                    transition={{
                      duration: 1.75,
                      times: [0, 0.4, 0.58, 0.76, 1],
                      ease: 'easeInOut',
                    }}
                    style={{ boxShadow: '0 0 42px 20px rgba(255,255,255,0.9)' }}
                  />
                </>
              ) : (
                <motion.div
                  className="h-20 w-20 rounded-full bg-white"
                  initial={{ opacity: 0, scale: 0.2 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: [0.2, 1, 1, 0.45] }}
                  transition={{ duration: 1.8, times: [0, 0.35, 0.7, 1], ease: 'easeInOut' }}
                  style={{ boxShadow: '0 0 36px 18px rgba(255,255,255,0.85)' }}
                />
              )}
            </div>
          )}

          {showReconstruction && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                className="absolute h-20 w-20 rounded-full bg-white"
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1, 1, 0.2] }}
                transition={{ duration: 2.3, times: [0, 0.45, 0.72, 1], ease: 'easeInOut' }}
                style={{ boxShadow: '0 0 36px 18px rgba(255,255,255,0.85)' }}
              />
              <motion.img
                src={reconstructionSpriteUrl}
                alt=""
                className="absolute h-48 w-48 object-contain"
                initial={{ opacity: 0, scale: 0.15 }}
                animate={{ opacity: [0, 0, 1], scale: [0.15, 0.15, 1] }}
                transition={{ duration: 2.5, times: [0, 0.55, 1], ease: 'easeOut' }}
                style={{
                  imageRendering: 'pixelated',
                  filter: 'brightness(0) invert(1) drop-shadow(0 0 16px white)',
                }}
              />
            </div>
          )}

          {showFinale && (
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.img
                src={reconstructionSpriteUrl}
                alt=""
                className="absolute h-48 w-48 object-contain"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0, scale: reducedMotion ? 1 : 1.08 }}
                transition={{ duration: reducedMotion ? 0.1 : 1.2, ease: 'easeOut' }}
                style={{
                  imageRendering: 'pixelated',
                  filter: 'brightness(0) invert(1) drop-shadow(0 0 16px white)',
                }}
              />
              <motion.img
                src={celebrationSpriteUrl}
                alt={newSpeciesName}
                className="absolute h-48 w-48 object-contain"
                initial={{ opacity: 0, scale: reducedMotion ? 1 : 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: reducedMotion ? 0.15 : 1.2, ease: 'easeOut' }}
                style={{ imageRendering: 'pixelated' }}
                onError={(event) => {
                  event.currentTarget.src = newSpriteUrl;
                }}
              />
            </div>
          )}
        </div>

        {showFinale && (
          <motion.div
            role="status"
            initial={reducedMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reducedMotion ? 0 : 0.45 }}
            className="mx-auto min-h-20 w-full max-w-xl px-4 py-4 text-center"
          >
            <p className="font-heading text-base font-semibold leading-snug text-accent-200 sm:text-lg">
              {resultText}
            </p>
          </motion.div>
        )}
        {!showFinale && <div className="min-h-20" aria-hidden="true" />}
      </div>
    </div>,
    document.body
  );
};

export default EvolutionAnimation;
