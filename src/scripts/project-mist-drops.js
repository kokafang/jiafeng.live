import { MIST_RETURN_DELAY } from './project-mist-brush.js';

export const ASCII_DROP_GLYPHS = [
  ['.'], [','], [':'], ['o'], ['/\\', '\\/'], [' /\\ ', '(  )', ' \\/ ']
];
const TILE = 64;

export function createAsciiDrops(seed) {
  let state = (seed + 1) >>> 0;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  return Array.from({ length: 60 }, (_, index) => {
    const x = (index % 10 + 0.2 + random() * 0.6) / 10;
    const homeY = (Math.floor(index / 10) + 0.2 + random() * 0.6) / 6;
    const glyph = index % 14 === 0 ? 5 : index % 5 === 0 ? 4 : Math.floor(random() * 4);
    return {
      x, homeY, y: homeY, glyph, size: 0.8 + random() * 0.35,
      weight: 0.32 + random() * 0.22, speed: 0.20 + random() * 0.18,
      delay: random() * 0.12, opacity: 1, phase: 'rest',
      fallAt: 0, startY: homeY, startOpacity: 1, emptyAt: 0
    };
  });
}

export function releaseAsciiDrops(drops, time) {
  for (const drop of drops) {
    // Repeated pointer events must not restart a drop or make it jump upwards.
    if (drop.phase !== 'rest' && drop.phase !== 'condensing') continue;
    drop.phase = 'falling';
    drop.startY = drop.y;
    drop.startOpacity = drop.opacity;
    drop.fallAt = time + drop.delay;
  }
}

export function advanceAsciiDrops(drops, time, delta, hovering, releasedFor) {
  let changed = false;
  for (const drop of drops) {
    if (drop.phase === 'rest') continue;
    if (drop.phase === 'falling') {
      const elapsed = Math.max(0, time - drop.fallAt);
      drop.y = drop.startY + drop.speed * elapsed + 0.26 * elapsed * elapsed;
      drop.opacity = drop.startOpacity * Math.min(1, Math.max(0, (1.08 - drop.y) / 0.16));
      if (drop.y >= 1.08) {
        drop.y = 1.08;
        drop.phase = 'empty';
        drop.emptyAt = time;
        drop.opacity = 0;
      }
      changed = true;
    } else if (drop.phase === 'empty') {
      if (!hovering && releasedFor > MIST_RETURN_DELAY && time - drop.emptyAt > 1) {
        drop.phase = 'condensing';
        drop.y = drop.homeY;
      }
    } else if (!hovering) {
      drop.opacity += (1 - drop.opacity) * (1 - Math.exp(-Math.max(0, delta) / 1.8));
      if (drop.opacity > 0.995) {
        drop.opacity = 1;
        drop.phase = 'rest';
      }
      changed = true;
    }
  }
  return changed;
}

export function createAsciiDropAtlas() {
  const atlas = document.createElement('canvas');
  atlas.width = TILE * ASCII_DROP_GLYPHS.length;
  atlas.height = TILE;
  const ink = atlas.getContext('2d');
  ink.fillStyle = '#fff';
  ink.textAlign = 'center';
  ink.textBaseline = 'middle';
  ASCII_DROP_GLYPHS.forEach((lines, index) => {
    const lineHeight = lines.length > 1 ? 15 : 22;
    ink.font = (lines.length > 1 ? '16px' : '24px') + ' "Courier New", monospace';
    lines.forEach((line, row) => {
      ink.fillText(line, index * TILE + TILE / 2, TILE / 2 + (row - (lines.length - 1) / 2) * lineHeight);
    });
  });
  return atlas;
}

export function drawAsciiDrops(ink, drops, atlas) {
  const { width, height } = ink.canvas;
  ink.clearRect(0, 0, width, height);
  for (const drop of drops) {
    if (drop.opacity <= 0) continue;
    const size = 48 * drop.size;
    ink.globalAlpha = drop.opacity * drop.weight;
    ink.drawImage(atlas, drop.glyph * TILE, 0, TILE, TILE,
      drop.x * width - size / 2, drop.y * height - size / 2, size, size);
  }
  ink.globalAlpha = 1;
}
