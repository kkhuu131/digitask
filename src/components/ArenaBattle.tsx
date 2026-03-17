import React, { useRef, useState, useEffect, useLayoutEffect } from 'react';
import { animate, motion } from 'framer-motion';
import { Swords, Zap, Star, Wind, Skull } from 'lucide-react';
import { BattleDigimon } from '../types/battle';
import { initArenaDigimon, runFrame } from '../engine/arenaEngine';
import {
  ArenaDigimon, ArenaEvent, Strategy, SpriteState,
  WORLD_W, WORLD_H, VIEWPORT_W, VIEWPORT_H,
  STRATEGY_CONFIGS,
} from '../engine/arenaTypes';
import BattleDigimonSprite from './BattleDigimonSprite';
import { ATTRIBUTE_COLORS } from './ArenaDamageEffect';

// ─── Cinematic state ──────────────────────────────────────────────────────────
interface CinematicState {
  /** Remaining real-time milliseconds (counts down at normal speed regardless of timeScale). */
  realRemainingMs: number;
  /** Fraction of real deltaMs passed to runFrame — e.g. 0.2 = 5× slow-motion. */
  timeScale: number;
  /** World X to pan camera toward. */
  focusX: number;
  /** World Y to pan camera toward. */
  focusY: number;
}

// ─── Battle log entry ─────────────────────────────────────────────────────────
interface LogEntry {
  id: string;
  text: string;
  type: 'attack' | 'skill' | 'crit' | 'miss' | 'death';
}

// ─── Hit particle ─────────────────────────────────────────────────────────────
interface HitParticle {
  id: string;
  wx: number;         // world-space X of target center
  wy: number;         // world-space Y of target center
  angleDeg: number;   // outward direction
  dist: number;       // travel distance (px) — 0 for flash/ring
  color: string;
  size: number;       // diameter (px)
  durationMs: number;
  isRing: boolean;    // expanding shockwave ring
  delay?: number;     // animation-delay (ms) for staggered rings
}

// ─── Hit effect spawner ────────────────────────────────────────────────────────
function spawnHitEffect(
  wx: number,
  wy: number,
  type: 'normal' | 'crit' | 'skill',
  attrColor: string,
  batchId: string,
): HitParticle[] {
  const r = Math.random;
  const out: HitParticle[] = [];

  if (type === 'normal') {
    // Central impact flash — large glowing circle that just shrinks in place
    out.push({
      id: `${batchId}-flash`,
      wx, wy, angleDeg: 0, dist: 0,
      color: '#ffffff',
      size: 44,
      durationMs: 220,
      isRing: false,
    });
    // Spark burst
    const colors = ['#ffffff', '#ffe082', '#fff9c4', '#c8e6ff', '#e0e0e0'];
    for (let i = 0; i < 14; i++) {
      out.push({
        id: `${batchId}-${i}`,
        wx, wy,
        angleDeg: (360 / 14) * i + (r() - 0.5) * 18,
        dist: 38 + r() * 38,
        color: colors[Math.floor(r() * colors.length)],
        size: 5 + r() * 6,
        durationMs: 380 + r() * 80,
        isRing: false,
      });
    }
    // Single fast shockwave
    out.push({
      id: `${batchId}-ring0`,
      wx, wy, angleDeg: 0, dist: 0,
      color: 'rgba(255,255,255,0.7)',
      size: 80,
      durationMs: 350,
      isRing: true,
    });
  } else if (type === 'crit') {
    // Big gold impact flash
    out.push({
      id: `${batchId}-flash`,
      wx, wy, angleDeg: 0, dist: 0,
      color: '#fcd34d',
      size: 70,
      durationMs: 280,
      isRing: false,
    });
    // Gold/white spark burst
    const colors = ['#fbbf24', '#fcd34d', '#ffffff', '#f59e0b', '#fff9c4'];
    for (let i = 0; i < 20; i++) {
      out.push({
        id: `${batchId}-${i}`,
        wx, wy,
        angleDeg: (360 / 20) * i + (r() - 0.5) * 14,
        dist: 60 + r() * 55,
        color: colors[Math.floor(r() * colors.length)],
        size: 7 + r() * 8,
        durationMs: 500 + r() * 100,
        isRing: false,
      });
    }
    // Two staggered rings
    out.push({
      id: `${batchId}-ring0`,
      wx, wy, angleDeg: 0, dist: 0,
      color: '#fbbf24',
      size: 100,
      durationMs: 420,
      isRing: true,
      delay: 0,
    });
    out.push({
      id: `${batchId}-ring1`,
      wx, wy, angleDeg: 0, dist: 0,
      color: '#ffffff',
      size: 140,
      durationMs: 500,
      isRing: true,
      delay: 80,
    });
  } else {
    // Skill: massive attribute-colored explosion
    // Large attr-color flash
    out.push({
      id: `${batchId}-flash`,
      wx, wy, angleDeg: 0, dist: 0,
      color: attrColor,
      size: 100,
      durationMs: 320,
      isRing: false,
    });
    // Inner white hot flash
    out.push({
      id: `${batchId}-flash2`,
      wx, wy, angleDeg: 0, dist: 0,
      color: '#ffffff',
      size: 52,
      durationMs: 200,
      isRing: false,
    });
    // Massive spark burst
    const colors = [attrColor, '#ffffff', attrColor, '#ffffff', 'rgba(255,255,255,0.9)'];
    for (let i = 0; i < 24; i++) {
      out.push({
        id: `${batchId}-${i}`,
        wx, wy,
        angleDeg: (360 / 24) * i + (r() - 0.5) * 12,
        dist: 75 + r() * 65,
        color: colors[Math.floor(r() * colors.length)],
        size: 10 + r() * 12,
        durationMs: 620 + r() * 120,
        isRing: false,
      });
    }
    // Three staggered shockwave rings
    out.push({
      id: `${batchId}-ring0`,
      wx, wy, angleDeg: 0, dist: 0,
      color: attrColor,
      size: 110,
      durationMs: 480,
      isRing: true,
      delay: 0,
    });
    out.push({
      id: `${batchId}-ring1`,
      wx, wy, angleDeg: 0, dist: 0,
      color: '#ffffff',
      size: 160,
      durationMs: 560,
      isRing: true,
      delay: 60,
    });
    out.push({
      id: `${batchId}-ring2`,
      wx, wy, angleDeg: 0, dist: 0,
      color: attrColor,
      size: 210,
      durationMs: 650,
      isRing: true,
      delay: 120,
    });
  }

  return out;
}

// ─── Sprite container dimensions ──────────────────────────────────────────────
// HP bars are now in the status panel above the arena, not in-world.
// Container is sprite-only: 64×64px.
// (d.x, d.y) is the center of the sprite, top-left is (d.x - 32, d.y - 32).
const SPRITE_W = 64;
const SPRITE_H = 64;

// ─── Initial camera position ──────────────────────────────────────────────────
const INITIAL_CAMERA_X = WORLD_W / 2 - VIEWPORT_W / 2; // 250
const INITIAL_CAMERA_Y = WORLD_H / 2 - VIEWPORT_H / 2; // 70

// ─── HP bar color helper ───────────────────────────────────────────────────────
const hpBarColor = (pct: number) =>
  pct > 0.5 ? '#4ade80' : pct > 0.25 ? '#facc15' : '#f87171';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface ArenaBattleProps {
  userTeam: BattleDigimon[];
  opponentTeam: BattleDigimon[];
  userStrategies: Strategy[];
  opponentStrategies?: Strategy[];
  onBattleComplete: (result: { winner: 'user' | 'opponent'; turns: any[] }) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const ArenaBattle: React.FC<ArenaBattleProps> = ({
  userTeam,
  opponentTeam,
  userStrategies,
  opponentStrategies,
  onBattleComplete,
}) => {
  // ── Game-state refs (never trigger re-renders) ──────────────────────────────

  const digimonRef = useRef<ArenaDigimon[]>(null!);
  if (!digimonRef.current) {
    digimonRef.current = initArenaDigimon(
      userTeam,
      opponentTeam,
      userStrategies,
      opponentStrategies ?? opponentTeam.map(() => 'balanced' as Strategy),
    );
  }

  const lastTsRef       = useRef<number>(0);
  const battleEndedRef  = useRef(false);
  const cameraRef       = useRef({ x: INITIAL_CAMERA_X, y: INITIAL_CAMERA_Y });
  const worldDivRef     = useRef<HTMLDivElement>(null);
  const scaleWrapperRef = useRef<HTMLDivElement>(null);
  // Viewport div for cinematic zoom (CSS transform applied directly, no React state).
  const viewportDivRef  = useRef<HTMLDivElement>(null);
  // Active cinematic — null = no cinematic, mutated directly in RAF + event handler.
  const cinematicRef    = useRef<CinematicState | null>(null);

  // Sprite container DOM elements — position mutated directly each frame.
  const spriteContainerRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Sprite facing wrapper DOM elements — scaleX mutated based on velocity direction.
  const facingRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Last facing direction — true = facing right (scaleX(-1)). Only update DOM on change.
  const lastFacingRef = useRef<Map<string, boolean>>(new Map());

  // Skill bar fill DOM elements — width% mutated directly each frame.
  const skillBarFillRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // HP bar fill DOM elements in the status panel — mutated on damage events.
  const hpBarFillRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Last-pushed sprite states — only call setSpriteStates when something changes.
  const lastSpriteStatesRef = useRef<Record<string, SpriteState>>(
    Object.fromEntries(digimonRef.current.map(d => [d.id, 'idle' as SpriteState])),
  );

  // Last windup IDs — only call setWindupIds when the set changes.
  const lastWindupIdsRef = useRef<Set<string>>(new Set());

  // ── React state (updated only on discrete events) ───────────────────────────

  const [hpSnapshot, setHpSnapshot] = useState<Record<string, { hp: number; maxHp: number }>>(() =>
    Object.fromEntries(digimonRef.current.map(d => [d.id, { hp: d.hp, maxHp: d.maxHp }])),
  );
  const [deadIds, setDeadIds]           = useState<Set<string>>(new Set());
  const [spriteStates, setSpriteStates] = useState<Record<string, SpriteState>>(() =>
    Object.fromEntries(digimonRef.current.map(d => [d.id, 'idle' as SpriteState])),
  );
  const [spriteToggle, setSpriteToggle] = useState(false);
  const [battlePhase, setBattlePhase]   = useState<'fighting' | 'complete'>('fighting');
  const [winner, setWinner]             = useState<'user' | 'opponent' | null>(null);
  const [battleLog, setBattleLog]       = useState<LogEntry[]>([]);
  const [scale, setScale]               = useState(1);
  const [windupIds, setWindupIds]       = useState<Set<string>>(new Set());
  const [hitEffects, setHitEffects]     = useState<HitParticle[]>([]);
  const particleTimeoutsRef             = useRef<ReturnType<typeof setTimeout>[]>([]);

  // ── Idle-animation toggle ────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setSpriteToggle(t => !t), 600);
    return () => clearInterval(id);
  }, []);

  // ── Auto-advance to results screen after battle ends ──────────────────────────
  useEffect(() => {
    if (battlePhase === 'complete' && winner) {
      const id = setTimeout(() => onBattleComplete({ winner, turns: [] }), 2500);
      return () => clearTimeout(id);
    }
  }, [battlePhase, winner]);

  // ── Responsive scaling — fills full container width ──────────────────────────
  // No upper cap — allows upscaling so the arena fills the parent div on wide screens.
  useEffect(() => {
    const update = () => {
      const w = scaleWrapperRef.current?.clientWidth ?? VIEWPORT_W;
      setScale(w / VIEWPORT_W);
    };
    update();
    const ro = new ResizeObserver(update);
    if (scaleWrapperRef.current) ro.observe(scaleWrapperRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Set initial DOM positions + facing before first paint ────────────────────
  useLayoutEffect(() => {
    if (worldDivRef.current) {
      worldDivRef.current.style.transform =
        `translate(-${INITIAL_CAMERA_X}px, -${INITIAL_CAMERA_Y}px)`;
    }
    for (const d of digimonRef.current) {
      const el = spriteContainerRefs.current.get(d.id);
      if (el) {
        el.style.transform = `translate(${d.x - SPRITE_W / 2}px, ${d.y - SPRITE_H / 2}px)`;
      }
      // User team spawns left → initially faces right (scaleX -1).
      // Opponent team spawns right → initially faces left (no flip).
      const facingEl = facingRefs.current.get(d.id);
      if (facingEl) {
        const facingRight = d.isUserTeam;
        lastFacingRef.current.set(d.id, facingRight);
        facingEl.style.transform = facingRight ? 'scaleX(-1)' : '';
      }
    }
  }, []);

  // ── Camera helper ─────────────────────────────────────────────────────────────
  const updateCamera = () => {
    if (!worldDivRef.current) return;

    let tx: number, ty: number, lerp: number;

    if (cinematicRef.current) {
      // During a cinematic: snap quickly to the focal point
      tx = Math.max(0, Math.min(WORLD_W - VIEWPORT_W, cinematicRef.current.focusX - VIEWPORT_W / 2));
      ty = Math.max(0, Math.min(WORLD_H - VIEWPORT_H, cinematicRef.current.focusY - VIEWPORT_H / 2));
      lerp = 0.1;
    } else {
      const alive = digimonRef.current.filter(d => d.state !== 'dead');
      if (alive.length === 0) return;
      const cx = alive.reduce((s, d) => s + d.x, 0) / alive.length;
      const cy = alive.reduce((s, d) => s + d.y, 0) / alive.length;
      tx = Math.max(0, Math.min(WORLD_W - VIEWPORT_W, cx - VIEWPORT_W / 2));
      ty = Math.max(0, Math.min(WORLD_H - VIEWPORT_H, cy - VIEWPORT_H / 2));
      lerp = 0.04;
    }

    cameraRef.current.x += (tx - cameraRef.current.x) * lerp;
    cameraRef.current.y += (ty - cameraRef.current.y) * lerp;

    worldDivRef.current.style.transform =
      `translate(-${cameraRef.current.x}px, -${cameraRef.current.y}px)`;
  };

  // ── Cinematic helpers ─────────────────────────────────────────────────────────
  const startCinematic = (focusX: number, focusY: number, durationMs: number, timeScale: number, zoomScale: number) => {
    if (cinematicRef.current) return; // don't interrupt an existing cinematic
    cinematicRef.current = { realRemainingMs: durationMs, timeScale, focusX, focusY };
    if (viewportDivRef.current) {
      // Compute where focusX/Y will actually appear in the viewport after camera clamping.
      // The camera can only pan within [0, WORLD_W - VIEWPORT_W] × [0, WORLD_H - VIEWPORT_H].
      // If the Digimon is near an edge the camera clamps, so the focus point lands off-center.
      // Setting transform-origin to that exact viewport position makes the zoom expand
      // toward the Digimon regardless of where it sits on the map.
      const clampedCamX = Math.max(0, Math.min(WORLD_W - VIEWPORT_W, focusX - VIEWPORT_W / 2));
      const clampedCamY = Math.max(0, Math.min(WORLD_H - VIEWPORT_H, focusY - VIEWPORT_H / 2));
      const vpX = Math.max(0, Math.min(VIEWPORT_W, focusX - clampedCamX));
      const vpY = Math.max(0, Math.min(VIEWPORT_H, focusY - clampedCamY));
      const originX = ((vpX / VIEWPORT_W) * 100).toFixed(1);
      const originY = ((vpY / VIEWPORT_H) * 100).toFixed(1);

      viewportDivRef.current.style.transformOrigin = `${originX}% ${originY}%`;
      viewportDivRef.current.style.transition = 'transform 220ms ease-out';
      viewportDivRef.current.style.transform = `scale(${zoomScale})`;
    }
  };

  const endCinematic = () => {
    cinematicRef.current = null;
    if (viewportDivRef.current) {
      viewportDivRef.current.style.transition = 'transform 550ms ease-in-out';
      viewportDivRef.current.style.transform = 'scale(1)';
      // Reset transform-origin after the transition completes so the next cinematic starts clean
      setTimeout(() => {
        if (viewportDivRef.current) {
          viewportDivRef.current.style.transformOrigin = 'center center';
        }
      }, 580);
    }
  };

  // ── Update HP bar fills in the status panel (called on damage events) ────────
  const syncHpBarFills = (updates: Record<string, { hp: number; maxHp: number }>) => {
    for (const [id, { hp, maxHp }] of Object.entries(updates)) {
      const el = hpBarFillRefs.current.get(id);
      if (el) {
        const pct = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 0;
        el.style.width = `${pct * 100}%`;
        el.style.background = hpBarColor(pct);
      }
    }
  };

  // ── Event handler ─────────────────────────────────────────────────────────────
  const handleEvents = (events: ArenaEvent[]) => {
    const hpUpdates: Record<string, { hp: number; maxHp: number }> = {};
    const newDeadIds: string[] = [];
    const newLogEntries: LogEntry[] = [];
    let endWinner: 'user' | 'opponent' | null = null;

    for (const ev of events) {
      if (ev.type === 'damage') {
        const tgt = digimonRef.current.find(d => d.id === ev.targetId);
        if (tgt) hpUpdates[tgt.id] = { hp: tgt.hp, maxHp: tgt.maxHp };

        // Spawn particle hit effect
        if (!ev.isMiss && tgt) {
          const hitType = ev.isSkill ? 'skill' : ev.isCritical ? 'crit' : 'normal';
          const attrColor = ATTRIBUTE_COLORS[tgt.attribute] ?? '#ffffff';
          const batchId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
          const particles = spawnHitEffect(ev.targetX, ev.targetY, hitType, attrColor, batchId);
          const maxDur = Math.max(...particles.map(p => p.durationMs));
          setHitEffects(prev => [...prev, ...particles]);
          const t = setTimeout(() => {
            setHitEffects(prev => prev.filter(p => !p.id.startsWith(batchId)));
          }, maxDur + 80);
          particleTimeoutsRef.current.push(t);
        }

        const atk = digimonRef.current.find(d => d.id === ev.attackerId);
        const id = `${Date.now()}-${Math.random()}`;

        if (ev.isMiss) {
          if (atk) newLogEntries.push({ id, text: `${atk.name} missed!`, type: 'miss' });
        } else if (atk && tgt) {
          if (ev.isSkill) {
            newLogEntries.push({
              id: `${id}-skill`,
              text: `${atk.name}'s special attack!`,
              type: 'skill',
            });
          }
          const crit = ev.isCritical ? ' Critical hit!' : '';
          newLogEntries.push({
            id,
            text: `${tgt.name} took ${ev.damage} damage from ${atk.name}!${crit}`,
            type: ev.isCritical ? 'crit' : 'attack',
          });
        }
      } else if (ev.type === 'death') {
        newDeadIds.push(ev.digimonId);
        const dead = digimonRef.current.find(d => d.id === ev.digimonId);
        if (dead) {
          newLogEntries.push({
            id: `${Date.now()}-${Math.random()}`,
            text: `${dead.name} fainted!`,
            type: 'death',
          });
          // Flash effect on sprite container
          const el = spriteContainerRefs.current.get(ev.digimonId);
          if (el) animate(el, { opacity: [0.1, 1, 0.15, 1, 0.3] }, { duration: 0.5 });
          // Zero out HP and skill bars
          const hpEl = hpBarFillRefs.current.get(ev.digimonId);
          if (hpEl) { hpEl.style.width = '0%'; hpEl.style.background = '#f87171'; }
          const skillEl = skillBarFillRefs.current.get(ev.digimonId);
          if (skillEl) skillEl.style.width = '0%';

          // ── Death cinematic: zoom in + slow motion ──────────────────────────
          startCinematic(dead.x, dead.y, 2200, 0.2, 1.5);
        }
      } else if (ev.type === 'battle_end') {
        endWinner = ev.winner;
      }
    }

    if (Object.keys(hpUpdates).length > 0) {
      syncHpBarFills(hpUpdates);
      setHpSnapshot(prev => ({ ...prev, ...hpUpdates }));
    }
    if (newDeadIds.length > 0)
      setDeadIds(prev => new Set([...prev, ...newDeadIds]));
    if (newLogEntries.length > 0)
      setBattleLog(prev => [...prev, ...newLogEntries].slice(-8));
    if (endWinner) {
      battleEndedRef.current = true;
      setBattlePhase('complete');
      setWinner(endWinner);
    }
  };

  // ── RAF game loop ─────────────────────────────────────────────────────────────
  useEffect(() => {
    let rafId: number;

    const loop = (ts: number) => {
      const realDelta = lastTsRef.current ? Math.min(ts - lastTsRef.current, 50) : 16;
      lastTsRef.current = ts;

      // ── Cinematic time scaling ────────────────────────────────────────────────
      let gameDelta = realDelta;
      if (cinematicRef.current) {
        gameDelta = realDelta * cinematicRef.current.timeScale;
        cinematicRef.current.realRemainingMs -= realDelta;
        if (cinematicRef.current.realRemainingMs <= 0) {
          endCinematic();
        }
      }

      const events = runFrame(digimonRef.current, gameDelta);

      // Direct DOM: sprite positions + facing direction
      for (const d of digimonRef.current) {
        const el = spriteContainerRefs.current.get(d.id);
        if (el) {
          el.style.transform = `translate(${d.x - SPRITE_W / 2}px, ${d.y - SPRITE_H / 2}px)`;
        }

        // Dynamic facing: use combined steering + knockback velocity.
        // Sprites default to facing LEFT; scaleX(-1) flips to face RIGHT.
        // Only update DOM when direction actually changes to avoid layout thrash.
        const facingEl = facingRefs.current.get(d.id);
        if (facingEl && d.state !== 'dead') {
          const combinedVx = d.vx + d.knockbackVx;
          if (Math.abs(combinedVx) > 0.01) {
            const facingRight = combinedVx > 0;
            if (lastFacingRef.current.get(d.id) !== facingRight) {
              lastFacingRef.current.set(d.id, facingRight);
              facingEl.style.transform = facingRight ? 'scaleX(-1)' : '';
            }
          }
        }

        // Direct DOM: skill bar fill in status panel
        const skillEl = skillBarFillRefs.current.get(d.id);
        if (skillEl && d.state !== 'dead') {
          const config = STRATEGY_CONFIGS[d.strategy];
          // SP now affects drain rate, not base value — use raw skillCooldownBase here
          const skillBase = Math.max(6000, config.skillCooldownBase);
          const fillPct = d.state === 'skill_windup'
            ? 100
            : Math.max(0, Math.min(100, (1 - d.skillCooldownMs / skillBase) * 100));
          skillEl.style.width = `${fillPct}%`;
        }
      }

      updateCamera();

      // Sprite state diff
      const spriteChanges: Record<string, SpriteState> = {};
      for (const d of digimonRef.current) {
        if (lastSpriteStatesRef.current[d.id] !== d.spriteState) {
          spriteChanges[d.id] = d.spriteState;
          lastSpriteStatesRef.current[d.id] = d.spriteState;
        }
      }
      if (Object.keys(spriteChanges).length > 0)
        setSpriteStates(prev => ({ ...prev, ...spriteChanges }));

      // Windup diff + skill cinematic trigger
      const currentWindups = new Set(
        digimonRef.current.filter(d => d.state === 'skill_windup').map(d => d.id),
      );
      const prevWindups = lastWindupIdsRef.current;
      const windupChanged =
        currentWindups.size !== prevWindups.size ||
        [...currentWindups].some(id => !prevWindups.has(id));
      if (windupChanged) {
        // Trigger cinematic for newly-entering skill_windup Digimon
        for (const id of currentWindups) {
          if (!prevWindups.has(id)) {
            const d = digimonRef.current.find(f => f.id === id);
            if (d) startCinematic(d.x, d.y, 1600, 0.25, 1.4);
            break; // one cinematic at a time
          }
        }
        lastWindupIdsRef.current = currentWindups;
        setWindupIds(new Set(currentWindups));
      }

      if (events.length > 0) handleEvents(events);
      if (!battleEndedRef.current) rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(rafId);
      particleTimeoutsRef.current.forEach(clearTimeout);
    };
  }, []);

  // ── Derived counts ────────────────────────────────────────────────────────────
  const userTeamList     = digimonRef.current.filter(d =>  d.isUserTeam);
  const opponentTeamList = digimonRef.current.filter(d => !d.isUserTeam);

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div style={{ width: '100%' }}>
      <style>{`
        @keyframes arenaWindupPulse {
          from { opacity: 0.5; transform: scale(0.92); }
          to   { opacity: 1;   transform: scale(1.08); }
        }
        @keyframes particleBurst {
          0%   { transform: translate(0, 0) scale(1.2); opacity: 1; }
          20%  { transform: translate(calc(var(--px)*0.25), calc(var(--py)*0.25)) scale(1); opacity: 1; }
          100% { transform: translate(var(--px), var(--py)) scale(0.05); opacity: 0; }
        }
        @keyframes particleRing {
          0%   { transform: scale(0.05); opacity: 0.95; }
          55%  { opacity: 0.65; }
          100% { transform: scale(1);    opacity: 0; }
        }
      `}</style>

      {/* ── Status panel — above arena, not scaled ── */}
      <StatusPanel
        userTeam={userTeamList}
        opponentTeam={opponentTeamList}
        hpSnapshot={hpSnapshot}
        deadIds={deadIds}
        hpBarFillRefs={hpBarFillRefs}
        skillBarFillRefs={skillBarFillRefs}
      />

      {/* ── Arena — scaled to fill container width ── */}
      <div
        ref={scaleWrapperRef}
        style={{ width: '100%', height: VIEWPORT_H * scale, overflow: 'hidden' }}
      >

        {/* Scale container */}
        <div
          style={{
            width: VIEWPORT_W,
            height: VIEWPORT_H,
            transformOrigin: 'top left',
            transform: `scale(${scale})`,
          }}
        >
          {/* Viewport — clips world, holds overlay. ref used for cinematic zoom. */}
          <div
            ref={viewportDivRef}
            style={{
              position: 'relative',
              width: VIEWPORT_W,
              height: VIEWPORT_H,
              overflow: 'hidden',
              transformOrigin: 'center center',
              background: 'radial-gradient(ellipse at 50% 35%, #1a1635 0%, #0b0a18 100%)',
            }}
          >
            {/* World div — panned by camera via direct DOM mutation */}
            <div
              ref={worldDivRef}
              style={{ position: 'absolute', width: WORLD_W, height: WORLD_H, top: 0, left: 0 }}
            >
              {/* Floor */}
              <div
                style={{
                  position: 'absolute',
                  left: 55, top: 45,
                  width: WORLD_W - 110, height: WORLD_H - 90,
                  borderRadius: 52,
                  background: 'radial-gradient(ellipse at 50% 35%, #d4ad72 0%, #b8894e 25%, #8a6238 55%, #4a3220 80%, #2a1c0e 100%)',
                  boxShadow: 'inset 0 0 160px rgba(0,0,0,0.55), inset 0 -20px 60px rgba(0,0,0,0.35)',
                }}
              />
              {/* Grid lines */}
              <div
                style={{
                  position: 'absolute',
                  left: 55, top: 45,
                  width: WORLD_W - 110, height: WORLD_H - 90,
                  borderRadius: 52, overflow: 'hidden',
                  backgroundImage: [
                    'linear-gradient(rgba(255,255,255,0.055) 1px, transparent 1px)',
                    'linear-gradient(90deg, rgba(255,255,255,0.055) 1px, transparent 1px)',
                  ].join(','),
                  backgroundSize: '70px 70px',
                }}
              />
              {/* Center divider */}
              <div
                style={{
                  position: 'absolute',
                  left: WORLD_W / 2 - 1, top: 45, width: 2, height: WORLD_H - 90,
                  background: 'linear-gradient(to bottom, transparent 0%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.08) 70%, transparent 100%)',
                  pointerEvents: 'none',
                }}
              />
              {/* User-side left glow */}
              <div
                style={{
                  position: 'absolute', left: 0, top: 0, width: 14, height: WORLD_H,
                  background: 'linear-gradient(to right, rgba(99,102,241,0.6) 0%, rgba(99,102,241,0.25) 60%, transparent 100%)',
                }}
              />
              {/* Opponent-side right glow */}
              <div
                style={{
                  position: 'absolute', right: 0, top: 0, width: 14, height: WORLD_H,
                  background: 'linear-gradient(to left, rgba(239,68,68,0.6) 0%, rgba(239,68,68,0.25) 60%, transparent 100%)',
                }}
              />

              {/* Digimon sprite containers — positioned via direct DOM in RAF loop */}
              {digimonRef.current.map(d => (
                <div
                  key={d.id}
                  ref={el => {
                    if (el) spriteContainerRefs.current.set(d.id, el);
                    else spriteContainerRefs.current.delete(d.id);
                  }}
                  style={{
                    position: 'absolute', top: 0, left: 0,
                    width: SPRITE_W, height: SPRITE_H,
                    willChange: 'transform',
                    pointerEvents: 'none',
                  }}
                >
                  {/* Team color oval shadow below sprite */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: -4,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      width: 44,
                      height: 10,
                      borderRadius: '50%',
                      background: d.isUserTeam
                        ? 'rgba(99,102,241,0.55)'
                        : 'rgba(239,68,68,0.55)',
                      boxShadow: d.isUserTeam
                        ? '0 0 12px 4px rgba(99,102,241,0.7)'
                        : '0 0 12px 4px rgba(239,68,68,0.7)',
                      filter: 'blur(2px)',
                    }}
                  />

                  {/* Sprite — facing direction updated by RAF loop via facingRefs */}
                  <div
                    ref={el => {
                      if (el) facingRefs.current.set(d.id, el);
                      else facingRefs.current.delete(d.id);
                    }}
                    style={{ position: 'relative', width: SPRITE_W, height: SPRITE_H }}
                  >
                    <BattleDigimonSprite
                      digimonName={d.digimon_name}
                      fallbackSpriteUrl={d.sprite_url}
                      size="md"
                      animationState={spriteStates[d.id] ?? 'idle'}
                      spriteToggle={spriteToggle}
                    />

                    {/* Skill windup pulsing ring */}
                    {windupIds.has(d.id) && (
                      <div
                        style={{
                          position: 'absolute', inset: -6,
                          borderRadius: '50%',
                          border: `3px solid ${ATTRIBUTE_COLORS[d.attribute] ?? '#fff'}`,
                          boxShadow: `0 0 12px 4px ${ATTRIBUTE_COLORS[d.attribute] ?? '#fff'}`,
                          animation: 'arenaWindupPulse 0.5s ease-in-out infinite alternate',
                          pointerEvents: 'none',
                        }}
                      />
                    )}
                  </div>
                </div>
              ))}
              {/* Hit particle effects — rendered in world-space, panned by camera */}
              {hitEffects.map(p => {
                if (p.isRing) {
                  return (
                    <div
                      key={p.id}
                      style={{
                        position: 'absolute',
                        left: p.wx - p.size / 2,
                        top: p.wy - p.size / 2,
                        width: p.size,
                        height: p.size,
                        borderRadius: '50%',
                        border: `4px solid ${p.color}`,
                        boxShadow: `0 0 18px 6px ${p.color}, inset 0 0 12px ${p.color}`,
                        pointerEvents: 'none',
                        transformOrigin: 'center center',
                        animation: `particleRing ${p.durationMs}ms ease-out both`,
                        animationDelay: `${p.delay ?? 0}ms`,
                      }}
                    />
                  );
                }
                const rad = (p.angleDeg * Math.PI) / 180;
                const px = +(Math.cos(rad) * p.dist).toFixed(1);
                const py = +(Math.sin(rad) * p.dist).toFixed(1);
                return (
                  <div
                    key={p.id}
                    style={{
                      position: 'absolute',
                      left: p.wx - p.size / 2,
                      top: p.wy - p.size / 2,
                      width: p.size,
                      height: p.size,
                      borderRadius: '50%',
                      background: p.color,
                      boxShadow: `0 0 ${p.size * 1.5}px ${p.size * 0.6}px ${p.color}`,
                      ['--px' as any]: `${px}px`,
                      ['--py' as any]: `${py}px`,
                      pointerEvents: 'none',
                      animation: `particleBurst ${p.durationMs}ms ease-out forwards`,
                    }}
                  />
                );
              })}
            </div>

            {/* Viewport overlay — winner splash only (no damage numbers, no log) */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
              {/* Winner overlay — auto-advances via useEffect after 2.5 s */}
              {battlePhase === 'complete' && winner && (
                <div style={{ pointerEvents: 'auto' }}>
                  <WinnerOverlay winner={winner} />
                </div>
              )}
            </div>

            {/* Vignette */}
            <div
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                boxShadow: 'inset 0 0 80px rgba(0,0,0,0.7), inset 0 0 30px rgba(0,0,0,0.5)',
                borderRadius: 6,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Battle log — below arena ── */}
      <div className="card mt-2 !p-3" style={{ minHeight: 76 }}>
        <p className="text-[9px] font-extrabold tracking-widest uppercase font-heading text-gray-400 dark:text-gray-500 mb-2">
          Battle Log
        </p>
        <div className="flex flex-col gap-1">
          {battleLog.length === 0 ? (
            <p className="text-sm font-body text-gray-400 dark:text-gray-500 italic">
              Waiting for action…
            </p>
          ) : (
            [...battleLog].reverse().map((entry, i) => {
              const iconClass = `w-3.5 h-3.5 shrink-0 ${
                entry.type === 'death'  ? 'text-red-500 dark:text-red-400' :
                entry.type === 'skill'  ? 'text-violet-500 dark:text-violet-400' :
                entry.type === 'crit'   ? 'text-amber-500 dark:text-amber-400' :
                entry.type === 'miss'   ? 'text-gray-400 dark:text-gray-500' :
                                          'text-gray-500 dark:text-gray-400'
              }`;
              const textClass = `text-sm font-body leading-snug transition-opacity duration-300 ${
                i === 0 ? 'font-semibold' : 'font-normal'
              } ${
                entry.type === 'death'  ? 'text-red-500 dark:text-red-400' :
                entry.type === 'skill'  ? 'text-violet-500 dark:text-violet-400' :
                entry.type === 'crit'   ? 'text-amber-500 dark:text-amber-400' :
                entry.type === 'miss'   ? 'text-gray-400 dark:text-gray-500' :
                                          'text-gray-700 dark:text-gray-300'
              }`;
              const Icon =
                entry.type === 'death'  ? Skull  :
                entry.type === 'skill'  ? Zap    :
                entry.type === 'crit'   ? Star   :
                entry.type === 'miss'   ? Wind   :
                                          Swords;
              return (
                <div
                  key={entry.id}
                  className="flex items-center gap-2"
                  style={{ opacity: Math.max(0.2, 1 - i * 0.18) }}
                >
                  <Icon className={iconClass} />
                  <p className={textClass}>{entry.text}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

// ─── StatusPanel ──────────────────────────────────────────────────────────────
// Renders HP and skill bars for both teams above the arena.
// HP bar fills are driven by React state (hpSnapshot) but also have refs for
// direct DOM sync on damage events. Skill bar fills are updated via direct DOM
// from the RAF loop — no React re-renders needed.

interface StatusPanelProps {
  userTeam: ArenaDigimon[];
  opponentTeam: ArenaDigimon[];
  hpSnapshot: Record<string, { hp: number; maxHp: number }>;
  deadIds: Set<string>;
  hpBarFillRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
  skillBarFillRefs: React.MutableRefObject<Map<string, HTMLDivElement>>;
}

const StatusPanel: React.FC<StatusPanelProps> = ({
  userTeam, opponentTeam, hpSnapshot, deadIds, hpBarFillRefs, skillBarFillRefs,
}) => {
  const renderBar = (d: ArenaDigimon, isUser: boolean) => {
    const snap = hpSnapshot[d.id];
    const hp = snap?.hp ?? d.hp;
    const maxHp = snap?.maxHp ?? d.maxHp;
    const pct = maxHp > 0 ? Math.max(0, Math.min(1, hp / maxHp)) : 0;
    const isDead = deadIds.has(d.id);

    return (
      <div
        key={d.id}
        className={`flex-1 min-w-0 transition-opacity duration-500 ${isDead ? 'opacity-40' : 'opacity-100'}`}
      >
        {/* Name */}
        <p className="text-xs font-heading font-semibold text-gray-800 dark:text-gray-100 truncate mb-1">
          {isDead ? <s className="text-gray-400 dark:text-gray-500">{d.name}</s> : d.name}
        </p>

        {/* HP bar */}
        <div className="mb-1.5">
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-[9px] font-extrabold tracking-widest uppercase text-gray-400 dark:text-gray-500 font-heading">HP</span>
            <span className="text-[9px] text-gray-400 dark:text-gray-500 tabular-nums">
              {isDead ? 'Fainted' : `${Math.max(0, hp)} / ${maxHp}`}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-200 dark:bg-dark-100 overflow-hidden">
            <div
              ref={el => {
                if (el) hpBarFillRefs.current.set(d.id, el);
                else hpBarFillRefs.current.delete(d.id);
              }}
              style={{
                height: '100%',
                width: `${pct * 100}%`,
                background: hpBarColor(pct),
                borderRadius: 999,
                transition: 'width 200ms ease-out, background 300ms ease-out',
              }}
            />
          </div>
        </div>

        {/* Skill bar */}
        <div>
          <span className="text-[9px] font-extrabold tracking-widest uppercase text-gray-400 dark:text-gray-500 font-heading">Skill</span>
          <div className="h-1 rounded-full bg-gray-200 dark:bg-dark-100 overflow-hidden mt-0.5">
            <div
              ref={el => {
                if (el) skillBarFillRefs.current.set(d.id, el);
                else skillBarFillRefs.current.delete(d.id);
              }}
              style={{
                height: '100%',
                width: '0%',
                background: isUser ? '#6366f1' : '#ef4444',
                borderRadius: 999,
                transition: 'background 200ms',
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="card mb-2 !p-3">
      <div className="flex items-start gap-3">
        {/* User team — left */}
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-extrabold tracking-widest uppercase font-heading text-indigo-600 dark:text-indigo-400 mb-2">
            Your Team
          </p>
          <div className="flex gap-3">
            {userTeam.map(d => renderBar(d, true))}
          </div>
        </div>

        {/* VS divider */}
        <div className="flex-shrink-0 pt-3">
          <span className="text-xs font-extrabold tracking-widest text-gray-300 dark:text-gray-600">VS</span>
        </div>

        {/* Opponent team — right */}
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-extrabold tracking-widest uppercase font-heading text-red-500 dark:text-red-400 mb-2 text-right">
            Opponent
          </p>
          <div className="flex gap-3 justify-end">
            {opponentTeam.map(d => renderBar(d, false))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── WinnerOverlay ────────────────────────────────────────────────────────────
const WinnerOverlay: React.FC<{ winner: 'user' | 'opponent' }> = ({ winner }) => {
  const won = winner === 'user';
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      style={{
        position: 'absolute', inset: 0,
        background: won
          ? 'radial-gradient(ellipse at center, rgba(99,102,241,0.55) 0%, rgba(0,0,0,0.88) 65%)'
          : 'radial-gradient(ellipse at center, rgba(239,68,68,0.45) 0%, rgba(0,0,0,0.88) 65%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8,
      }}
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0, y: -16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ delay: 0.1, type: 'spring', damping: 14, stiffness: 220 }}
        className="font-heading"
        style={{
          fontSize: 42, fontWeight: 600, color: '#fff', letterSpacing: 1,
          textShadow: won
            ? '0 0 40px rgba(99,102,241,0.9), 0 2px 12px rgba(0,0,0,0.8)'
            : '0 0 40px rgba(239,68,68,0.9), 0 2px 12px rgba(0,0,0,0.8)',
        }}
      >
        {won ? 'Victory!' : 'Defeated'}
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.3 }}
        style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', letterSpacing: 0.3 }}
        className="font-body"
      >
        {won ? 'Your team won the battle!' : 'Your team fought bravely.'}
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}
        className="font-body"
      >
        Loading results…
      </motion.p>
    </motion.div>
  );
};

export default ArenaBattle;
