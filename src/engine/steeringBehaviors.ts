import { Force } from './arenaTypes';

// ─── Internal helpers ──────────────────────────────────────────────────────────

/** Euclidean distance between two points. */
export const dist = (ax: number, ay: number, bx: number, by: number): number =>
  Math.sqrt((bx - ax) ** 2 + (by - ay) ** 2);

/**
 * Returns a unit vector in the direction (dx, dy).
 * Returns { x: 0, y: 0 } if the magnitude is too small to normalise safely.
 */
const normalize = (dx: number, dy: number): { x: number; y: number } => {
  const mag = Math.sqrt(dx * dx + dy * dy);
  if (mag < 0.0001) return { x: 0, y: 0 };
  return { x: dx / mag, y: dy / mag };
};

// ─── Steering behaviours ───────────────────────────────────────────────────────

/**
 * SEEK — accelerate directly toward a target position.
 *
 * @param posX / posY  Current Digimon position (world units)
 * @param targetX / targetY  Position to move toward
 * @param strength  Force magnitude (world units / ms²)
 */
export const seek = (
  posX: number,
  posY: number,
  targetX: number,
  targetY: number,
  strength: number,
): Force => {
  const dir = normalize(targetX - posX, targetY - posY);
  return { fx: dir.x * strength, fy: dir.y * strength };
};

/**
 * WANDER — project a circle ahead of the Digimon, pick a point on its edge
 * using a slowly-drifting angle. Creates organic, curved movement even when
 * heading directly at an enemy.
 *
 * Returns both the steering force and the updated wander angle for next frame.
 *
 * @param posX / posY   Current position
 * @param velX / velY   Current velocity (used for forward direction)
 * @param wanderAngle   Current accumulated wander angle (radians)
 * @param strength      Force magnitude
 */
export const wander = (
  posX: number,
  posY: number,
  velX: number,
  velY: number,
  wanderAngle: number,
  strength: number,
): { force: Force; newWanderAngle: number } => {
  const CIRCLE_DIST = 60;    // how far ahead to project the wander circle
  const CIRCLE_RADIUS = 35;  // radius of the wander circle
  const JITTER = 0.15;       // max radians the wander angle drifts per frame

  const newWanderAngle = wanderAngle + (Math.random() - 0.5) * JITTER * 2;

  // Forward direction based on current velocity; fall back to rightward if stationary
  const speed = Math.sqrt(velX * velX + velY * velY);
  const fwd =
    speed > 0.0001
      ? { x: velX / speed, y: velY / speed }
      : { x: 1, y: 0 };

  const circleCenterX = posX + fwd.x * CIRCLE_DIST;
  const circleCenterY = posY + fwd.y * CIRCLE_DIST;

  // Point on the circle edge at the current wander angle
  const wanderTargetX = circleCenterX + Math.cos(newWanderAngle) * CIRCLE_RADIUS;
  const wanderTargetY = circleCenterY + Math.sin(newWanderAngle) * CIRCLE_RADIUS;

  const dir = normalize(wanderTargetX - posX, wanderTargetY - posY);
  return {
    force: { fx: dir.x * strength, fy: dir.y * strength },
    newWanderAngle,
  };
};

/**
 * SEPARATION — push away from allied Digimon that are too close.
 * Prevents multiple allies from stacking into a single blob.
 * Force is stronger the closer the ally is.
 *
 * @param posX / posY  Current Digimon position
 * @param allies       Positions of other allied Digimon (excludes self)
 * @param radius       Minimum comfortable distance (world units)
 * @param strength     Base force magnitude
 */
export const separation = (
  posX: number,
  posY: number,
  allies: ReadonlyArray<{ x: number; y: number }>,
  radius: number,
  strength: number,
): Force => {
  let fx = 0;
  let fy = 0;

  for (const ally of allies) {
    const d = dist(posX, posY, ally.x, ally.y);
    if (d > 0 && d < radius) {
      const dir = normalize(posX - ally.x, posY - ally.y);
      const weight = 1 - d / radius; // linearly stronger as allies get closer
      fx += dir.x * weight * strength;
      fy += dir.y * weight * strength;
    }
  }

  return { fx, fy };
};

/**
 * ORBIT — adds a perpendicular force when within a set radius of the target.
 * This causes Digimon to circle around their target before closing in,
 * rather than colliding head-on. The orbit force fades naturally as the
 * Digimon closes the distance (seek takes over in the final approach).
 *
 * @param posX / posY       Current Digimon position
 * @param targetX / targetY Enemy position to orbit around
 * @param orbitRadius       Distance at which full orbit force is applied
 * @param strength          Force magnitude at max orbit distance
 */
export const orbit = (
  posX: number,
  posY: number,
  targetX: number,
  targetY: number,
  orbitRadius: number,
  strength: number,
): Force => {
  const dx = targetX - posX;
  const dy = targetY - posY;
  const d = Math.sqrt(dx * dx + dy * dy);

  if (d < 0.0001) return { fx: 0, fy: 0 };

  // Perpendicular to seek direction (rotate 90° counter-clockwise)
  const perpX = -dy / d;
  const perpY = dx / d;

  // Orbit force fades to 0 as the Digimon closes to the target
  const orbitFactor = Math.max(0, 1 - d / orbitRadius);

  return {
    fx: perpX * orbitFactor * strength,
    fy: perpY * orbitFactor * strength,
  };
};

/**
 * FLEE — accelerate directly away from a source position.
 * Used during the retreat state after landing a hit or taking damage.
 *
 * @param posX / posY   Current Digimon position
 * @param fromX / fromY The position to flee from (e.g. opposing team centroid)
 * @param strength      Force magnitude
 */
export const flee = (
  posX: number,
  posY: number,
  fromX: number,
  fromY: number,
  strength: number,
): Force => {
  const dir = normalize(posX - fromX, posY - fromY);
  return { fx: dir.x * strength, fy: dir.y * strength };
};
