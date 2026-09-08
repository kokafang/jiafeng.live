export function brushPoints(from, to, radius) {
  if (!from) return [to];
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const count = Math.min(100, Math.max(1, Math.ceil(distance / Math.max(1, radius * 0.3))));
  return Array.from({ length: count }, (_, index) => {
    const t = (index + 1) / count;
    return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
  });
}

export function mistBrushOpacity(distance, radius) {
  const t = Math.max(0, Math.min(1, distance / Math.max(1, radius)));
  const feather = 1 - t * t * (3 - 2 * t);
  return 0.995 * Math.pow(feather, 1.4);
}

export function stampMistMask(coverage, width, height, from, to, radius) {
  const start = from || to;
  const dx = to.x - start.x;
  const dy = to.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  const left = Math.max(0, Math.floor(Math.min(start.x, to.x) - radius));
  const right = Math.min(width - 1, Math.ceil(Math.max(start.x, to.x) + radius));
  const top = Math.max(0, Math.floor(Math.min(start.y, to.y) - radius));
  const bottom = Math.min(height - 1, Math.ceil(Math.max(start.y, to.y) + radius));
  // Distance to the whole stroke avoids scalloped stamps; max preserves the soft edge
  // instead of making it opaque when pointer events overlap.
  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      const along = lengthSquared
        ? Math.max(0, Math.min(1, ((x + 0.5 - start.x) * dx + (y + 0.5 - start.y) * dy) / lengthSquared))
        : 0;
      const distance = Math.hypot(x + 0.5 - start.x - along * dx, y + 0.5 - start.y - along * dy);
      const offset = y * width + x;
      coverage[offset] = Math.max(coverage[offset], mistBrushOpacity(distance, radius));
    }
  }
}

export function fadeMistMask(coverage, alpha) {
  const remaining = 1 - Math.min(1, Math.max(0, alpha));
  for (let i = 0; i < coverage.length; i++) coverage[i] *= remaining;
}

export const MIST_RETURN_DELAY = 3;
export const MIST_RECOVERY_END = MIST_RETURN_DELAY + 10;

export function recoveryAlpha(seconds, releasedFor = Infinity) {
  const recoveringSeconds = Math.min(Math.max(0, seconds), Math.max(0, releasedFor - MIST_RETURN_DELAY));
  return 1 - Math.exp(-recoveringSeconds / 1.6);
}
