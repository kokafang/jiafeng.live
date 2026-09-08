import {
  WebGLRenderer, Scene, OrthographicCamera, PlaneGeometry, ShaderMaterial,
  Mesh, CanvasTexture, LinearFilter, NoColorSpace
} from 'three';
import { stampMistMask, fadeMistMask, recoveryAlpha, MIST_RECOVERY_END } from './project-mist-brush.js';
import {
  createAsciiDrops, releaseAsciiDrops, advanceAsciiDrops, createAsciiDropAtlas, drawAsciiDrops
} from './project-mist-drops.js';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uWipe;
  uniform sampler2D uDrops;
  uniform float uTime;
  uniform float uSeed;
  uniform float uAspect;
  uniform float uFocus;
  varying vec2 vUv;

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float cloud(vec2 p) {
    return noise(p) * 0.57 + noise(p * 2.03 + 8.4) * 0.28 + noise(p * 4.07 + 17.8) * 0.15;
  }
  void main() {
    vec2 p = vec2(vUv.x * uAspect, vUv.y);
    float t = uTime * 0.065;
    vec2 drift = vec2(t * 0.42, -t * 0.28);
    float fold = cloud(p * 2.3 + drift + uSeed);
    float fog = cloud(p * 3.1 + vec2(fold * 0.8, fold * 0.5) - drift + uSeed);
    float veil = smoothstep(0.3, 0.8, fog);
    float grain = hash(floor(vUv * vec2(340.0, 255.0)) + uSeed) - 0.5;
    float edge = smoothstep(0.15, 0.72, length(vUv - 0.5));
    vec2 wipeDrift = vec2(noise(p * 16.0 + uSeed), noise(p * 19.0 + uSeed + 31.0)) - 0.5;
    vec2 wipeUv = clamp(vUv + wipeDrift * vec2(0.008 / uAspect, 0.008), 0.0, 1.0);
    float erased = texture2D(uWipe, wipeUv).a;
    float residue = erased * (1.0 - erased) * (0.03 + noise(p * vec2(6.0, 25.0) + uSeed) * 0.10);
    float wet = min(1.0, 1.0 - erased + residue) * (1.0 - uFocus);
    vec3 water = mix(vec3(0.028, 0.105, 0.13), vec3(0.29, 0.47, 0.49), veil * 0.24);
    float fogAlpha = (0.66 + edge * 0.15 + veil * 0.075 + grain * 0.016) * wet;
    // Flat monospace ink falls independently, so it stays visible across the wiped path.
    float inkAlpha = texture2D(uDrops, vUv).a * (1.0 - uFocus);
    float alpha = inkAlpha + fogAlpha * (1.0 - inkAlpha);
    vec3 color = (vec3(0.59, 0.80, 0.82) * inkAlpha + water * fogAlpha * (1.0 - inkAlpha))
      / max(alpha, 0.0001);
    gl_FragColor = vec4(color, alpha);
  }
`;

export function createProjectMist(section) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('webgl2', {
    alpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power'
  });
  if (!context) return null;
  const renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1));
  renderer.setClearColor(0x000000, 0);
  renderer.autoClear = false;
  canvas.className = 'project-mist-layer';
  canvas.setAttribute('aria-hidden', 'true');
  const scene = new Scene();
  const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geometry = new PlaneGeometry(2, 2);
  const material = new ShaderMaterial({
    uniforms: {
      uWipe: { value: null }, uDrops: { value: null }, uTime: { value: 0 }, uSeed: { value: 0 },
      uAspect: { value: 4 / 3 }, uFocus: { value: 0 }
    },
    vertexShader, fragmentShader, transparent: true, depthTest: false, depthWrite: false
  });
  scene.add(new Mesh(geometry, material));
  const events = new AbortController();
  const dropAtlas = createAsciiDropAtlas();
  const entries = [...section.querySelectorAll('.fill-block')].flatMap((card, index) => {
    const media = card.querySelector('.image-card-wrap, .video-placeholder');
    if (!media) return [];
    const mask = document.createElement('canvas');
    mask.width = 192;
    mask.height = 144;
    const ink = mask.getContext('2d');
    const coverage = new Float32Array(mask.width * mask.height);
    const maskPixels = ink.createImageData(mask.width, mask.height);
    for (let i = 0; i < maskPixels.data.length; i += 4) {
      maskPixels.data[i] = maskPixels.data[i + 1] = maskPixels.data[i + 2] = 255;
    }
    const texture = new CanvasTexture(mask);
    texture.minFilter = texture.magFilter = LinearFilter;
    texture.generateMipmaps = false;
    texture.colorSpace = NoColorSpace;
    const dropCanvas = document.createElement('canvas');
    dropCanvas.width = 384;
    dropCanvas.height = 288;
    const dropInk = dropCanvas.getContext('2d');
    const drops = createAsciiDrops(index * 971);
    drawAsciiDrops(dropInk, drops, dropAtlas);
    const dropTexture = new CanvasTexture(dropCanvas);
    dropTexture.minFilter = dropTexture.magFilter = LinearFilter;
    dropTexture.generateMipmaps = false;
    dropTexture.colorSpace = NoColorSpace;
    return [{ card, media, index, mask, ink, texture, coverage, maskPixels, maskDirty: false, rect: null, hovering: false,
      lastPoint: null, painted: false, releasedAt: 0, drops, dropInk, dropTexture }];
  });
  // One shared renderer is scissored to the thumbnails, never the text or controls.
  section.append(canvas);
  let running = false;
  let disposed = false;
  let frame = null;
  let time = 0;
  let lastFrame = 0;
  let dirty = true;
  let width = 0;
  let height = 0;

  function measure() {
    dirty = false;
    width = section.clientWidth;
    height = section.clientHeight;
    renderer.setSize(width, height, false);
    const origin = section.getBoundingClientRect();
    entries.forEach(entry => {
      if (!entry.media.isConnected || entry.card.hidden) { entry.rect = null; return; }
      const rect = entry.media.getBoundingClientRect();
      entry.rect = {
        x: rect.left - origin.left - section.clientLeft + 1,
        y: height - (rect.bottom - origin.top - section.clientTop) + 1,
        width: Math.max(0, rect.width - 2), height: Math.max(0, rect.height - 2)
      };
    });
  }

  function wipe(entry, event) {
    if (!running || event.pointerType === 'touch') return;
    const rect = entry.media.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
      release(entry);
      return;
    }
    entry.hovering = true;
    releaseAsciiDrops(entry.drops, time);
    const point = {
      x: (event.clientX - rect.left) / rect.width * entry.mask.width,
      y: (event.clientY - rect.top) / rect.height * entry.mask.height
    };
    const radius = Math.max(24, Math.min(58, 72 / rect.width * entry.mask.width));
    stampMistMask(entry.coverage, entry.mask.width, entry.mask.height, entry.lastPoint, point, radius);
    entry.lastPoint = point;
    entry.painted = true;
    entry.maskDirty = true;
  }

  function release(entry) {
    if (entry.hovering) entry.releasedAt = time;
    entry.hovering = false;
    entry.lastPoint = null;
  }

  entries.forEach(entry => {
    // The modal trigger overlays its image, so listen on the card and hit-test the thumbnail.
    entry.card.addEventListener('pointerenter', event => {
      entry.lastPoint = null;
      wipe(entry, event);
    }, { signal: events.signal });
    entry.card.addEventListener('pointermove', event => wipe(entry, event), { signal: events.signal, passive: true });
    entry.card.addEventListener('pointerleave', () => release(entry), { signal: events.signal });
  });

  function render(now) {
    frame = null;
    if (!running) return;
    if (now - lastFrame < 1000 / 30) { frame = requestAnimationFrame(render); return; }
    const delta = lastFrame ? Math.min((now - lastFrame) / 1000, 0.1) : 0;
    lastFrame = now;
    time += delta;
    if (dirty) measure();
    renderer.setScissorTest(false);
    renderer.clear();
    renderer.setScissorTest(true);
    entries.forEach(entry => {
      if (!entry.rect || !entry.media.isConnected || entry.card.hidden) return;
      const releasedFor = time - entry.releasedAt;
      if (advanceAsciiDrops(entry.drops, time, delta, entry.hovering, releasedFor)) {
        drawAsciiDrops(entry.dropInk, entry.drops, dropAtlas);
        entry.dropTexture.needsUpdate = true;
      }
      const recovery = recoveryAlpha(delta, releasedFor);
      if (entry.painted && !entry.hovering && recovery > 0) {
        fadeMistMask(entry.coverage, recovery);
        if (releasedFor > MIST_RECOVERY_END) {
          entry.coverage.fill(0);
          entry.painted = false;
        }
        entry.maskDirty = true;
      }
      if (entry.maskDirty) {
        for (let i = 0; i < entry.coverage.length; i++) {
          entry.maskPixels.data[i * 4 + 3] = Math.round(entry.coverage[i] * 255);
        }
        entry.ink.putImageData(entry.maskPixels, 0, 0);
        entry.texture.needsUpdate = true;
        entry.maskDirty = false;
      }
      const rect = entry.rect;
      if (rect.width <= 0 || rect.height <= 0) return;
      material.uniforms.uWipe.value = entry.texture;
      material.uniforms.uDrops.value = entry.dropTexture;
      material.uniforms.uTime.value = time;
      material.uniforms.uSeed.value = entry.index * 9.71;
      material.uniforms.uAspect.value = rect.width / rect.height;
      const focused = entry.card.contains(document.activeElement) && document.activeElement.matches(':focus-visible');
      material.uniforms.uFocus.value = focused ? 1 : 0;
      renderer.setViewport(rect.x, rect.y, rect.width, rect.height);
      renderer.setScissor(rect.x, rect.y, rect.width, rect.height);
      renderer.render(scene, camera);
    });
    canvas.style.visibility = 'visible';
    section.classList.add('has-project-mist');
    frame = requestAnimationFrame(render);
  }

  function scheduleMeasure() { dirty = true; }
  const resize = new ResizeObserver(scheduleMeasure);
  resize.observe(section);
  resize.observe(section.querySelector('.section-fill'));
  entries.forEach(entry => resize.observe(entry.media));
  document.addEventListener('projects:pagechange', scheduleMeasure, { signal: events.signal });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    pause();
  }, { signal: events.signal });
  // Keep the CSS fallback after a lost context rather than restarting a failing GPU.
  let contextLost = false;
  canvas.addEventListener('webglcontextlost', () => { contextLost = true; }, { signal: events.signal });

  function start() {
    if (running || disposed || contextLost) return;
    running = true;
    dirty = true;
    lastFrame = 0;
    entries.forEach(entry => {
      entry.hovering = entry.media.matches(':hover');
      entry.lastPoint = null;
      entry.releasedAt = time;
    });
    frame = requestAnimationFrame(render);
  }
  function pause() {
    running = false;
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    section.classList.remove('has-project-mist');
    canvas.style.visibility = 'hidden';
  }
  function dispose() {
    if (disposed) return;
    disposed = true;
    pause();
    events.abort();
    resize.disconnect();
    entries.forEach(entry => {
      entry.texture.dispose();
      entry.dropTexture.dispose();
    });
    geometry.dispose();
    material.dispose();
    renderer.dispose();
    canvas.remove();
  }
  return { start, pause, dispose };
}
