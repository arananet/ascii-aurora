// ASCII Aurora: the scene renderer, HUD and controls.
// Every frame, each grid cell resolves to one glyph and one colour, and the
// frame is drawn as text on the canvas. One requestAnimationFrame loop.
(function () {
  'use strict';

  // ---- Data: palette, ramp and constants (defined once) ----

  // Brightness to glyph density, space first, @ last.
  const RAMP = " .':;+*x%#@";

  // Brightness to colour: [position, r, g, b].
  const AURORA_STOPS = [
    [0.00, 3, 7, 17],
    [0.20, 4, 32, 38],
    [0.40, 13, 84, 74],
    [0.60, 20, 150, 110],
    [0.78, 74, 222, 128],
    [0.90, 45, 212, 191],
    [1.00, 187, 247, 208],
  ];

  const NIGHT = [3, 7, 17];
  const VIOLET_FRINGE = [167, 139, 250];
  const STAR_COLOUR = [248, 250, 252];
  const TREE_COLOUR = [2, 10, 6];
  const STAR_GLYPHS = '.+*';

  const MIN_METEOR_MS = 6000;
  const MAX_METEOR_MS = 14000;
  const METEOR_LIFE_MS = 900;
  const METEOR_TRAIL = 8;
  const REFLECT_SCALE = 0.55;

  const HORIZON = 0.62; // fraction of grid height
  const LAKE_COMPRESS = 0.8; // lake row at distance d samples sky distance 0.8 d
  const FONT_PX = 12;
  const CELL_H = 14;
  const STAR_DENSITY = 0.018;
  const FPS_WINDOW = 30;
  const HUD_INTERVAL_MS = 250;
  const MAX_DPR = 2;

  // Colour keys: one fillStyle per key, so cells with the same key batch.
  const GRAD_LEVELS = 32;
  const FRINGE_LEVELS = 4;
  const STAR_LEVELS = 8;
  const METEOR_LEVELS = 8;
  const KEY_STAR = GRAD_LEVELS * FRINGE_LEVELS;
  const KEY_METEOR = KEY_STAR + STAR_LEVELS;
  const KEY_TREE = KEY_METEOR + METEOR_LEVELS;
  const KEY_COUNT = KEY_TREE + 1;

  // ---- Colour helpers ----

  function gradient(b) {
    if (b <= 0) return AURORA_STOPS[0].slice(1);
    for (let i = 1; i < AURORA_STOPS.length; i++) {
      const hi = AURORA_STOPS[i];
      if (b <= hi[0]) {
        const lo = AURORA_STOPS[i - 1];
        const f = (b - lo[0]) / (hi[0] - lo[0]);
        return [lo[1] + (hi[1] - lo[1]) * f, lo[2] + (hi[2] - lo[2]) * f, lo[3] + (hi[3] - lo[3]) * f];
      }
    }
    return AURORA_STOPS[AURORA_STOPS.length - 1].slice(1);
  }

  function mix(a, c, f) {
    return [a[0] + (c[0] - a[0]) * f, a[1] + (c[1] - a[1]) * f, a[2] + (c[2] - a[2]) * f];
  }

  function css(c) {
    return `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`;
  }

  function buildColourTable() {
    const table = new Array(KEY_COUNT);
    for (let f = 0; f < FRINGE_LEVELS; f++) {
      for (let g = 0; g < GRAD_LEVELS; g++) {
        const base = gradient((g + 0.5) / GRAD_LEVELS);
        const amount = (f / (FRINGE_LEVELS - 1)) * 0.7;
        // The fringe keeps the cell's own brightness, shifted toward violet.
        const lum = Math.max(base[0], base[1], base[2]) / 255;
        const violet = mix(NIGHT, VIOLET_FRINGE, Math.min(1, lum * 1.15));
        table[f * GRAD_LEVELS + g] = css(mix(base, violet, amount));
      }
    }
    for (let s = 0; s < STAR_LEVELS; s++) {
      table[KEY_STAR + s] = css(mix(NIGHT, STAR_COLOUR, 0.25 + 0.75 * (s / (STAR_LEVELS - 1))));
    }
    for (let m = 0; m < METEOR_LEVELS; m++) {
      const f = m / (METEOR_LEVELS - 1);
      table[KEY_METEOR + m] = css(mix(NIGHT, f > 0.9 ? STAR_COLOUR : AURORA_STOPS[6].slice(1), 0.2 + 0.8 * f));
    }
    table[KEY_TREE] = css(TREE_COLOUR);
    return table;
  }

  // Deterministic per cell noise in [0, 1).
  function hash(x, y, z) {
    let h = (x * 374761393 + y * 668265263 + z * 2147483647) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }

  function glyphFor(b) {
    const i = Math.min(RAMP.length - 1, Math.floor(b * RAMP.length));
    return RAMP[i];
  }

  // ---- DOM ----

  const canvas = document.getElementById('scene');
  const ctx = canvas.getContext('2d', { alpha: false });
  const hud = {
    fps: document.getElementById('hud-fps'),
    letters: document.getElementById('hud-letters'),
    activity: document.getElementById('hud-activity'),
    elapsed: document.getElementById('hud-elapsed'),
  };
  const soundButton = document.getElementById('sound-toggle');
  const activitySlider = document.getElementById('activity-slider');
  const pauseButton = document.getElementById('pause-toggle');

  const COLOURS = buildColourTable();
  const FONT = `600 ${FONT_PX}px ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, 'DejaVu Sans Mono', 'Liberation Mono', monospace`;

  // ---- Grid state (rebuilt on resize) ----

  let cols = 0;
  let rows = 0;
  let horizon = 0;
  let cellW = 7;
  let viewW = 0;
  let viewH = 0;
  let skyB = new Float32Array(0); // aurora brightness per sky cell
  let skyF = new Float32Array(0); // violet fringe amount per sky cell
  let stars = []; // { x, y, glyph, phase, speed, base }
  let starAt = new Int32Array(0); // sky cell -> star index + 1
  let treeTop = new Int8Array(0); // per column treeline height in cells
  let glyphs = [];
  let keys = new Int16Array(0);

  function seededRandom(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      let t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function buildTreeline(rand) {
    const tops = new Int8Array(cols).fill(2);
    let x = Math.floor(rand() * 3);
    while (x < cols) {
      const height = 2 + Math.floor(rand() * 3); // 2 to 4 cells
      for (let dx = -1; dx <= 1; dx++) {
        const c = x + dx;
        if (c < 0 || c >= cols) continue;
        tops[c] = Math.max(tops[c], height - Math.abs(dx));
      }
      x += 2 + Math.floor(rand() * 3);
    }
    return tops;
  }

  function buildStars(rand) {
    const list = [];
    const map = new Int32Array(cols * horizon);
    for (let y = 0; y < horizon - 4; y++) {
      for (let x = 0; x < cols; x++) {
        if (rand() >= STAR_DENSITY) continue;
        const pick = rand();
        list.push({
          x,
          y,
          glyph: pick < 0.7 ? STAR_GLYPHS[0] : pick < 0.92 ? STAR_GLYPHS[1] : STAR_GLYPHS[2],
          phase: rand() * Math.PI * 2,
          speed: 0.6 + rand() * 2.2,
          base: 0.35 + rand() * 0.45,
        });
        map[y * cols + x] = list.length;
      }
    }
    starAt = map;
    return list;
  }

  function resize() {
    const dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
    viewW = window.innerWidth;
    viewH = window.innerHeight;
    canvas.width = Math.round(viewW * dpr);
    canvas.height = Math.round(viewH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.font = FONT;
    ctx.textBaseline = 'top';
    cellW = ctx.measureText('M').width || FONT_PX * 0.6;
    cols = Math.ceil(viewW / cellW);
    rows = Math.ceil(viewH / CELL_H);
    horizon = Math.round(rows * HORIZON);
    skyB = new Float32Array(cols * horizon);
    skyF = new Float32Array(cols * horizon);
    glyphs = new Array(cols);
    keys = new Int16Array(cols);
    const rand = seededRandom(20251120 + cols * 131 + rows);
    treeTop = buildTreeline(rand);
    stars = buildStars(rand);
    if (paused) render(sceneMs); // keep a frozen frame on screen
  }

  // ---- Activity ----

  let baseActivity = Number(activitySlider.value) || 60;
  let activity = baseActivity; // effective, percent

  function effectiveActivity(t) {
    const env = 1
      + 0.32 * Math.sin((t / 41) * Math.PI * 2)
      + 0.16 * Math.sin((t / 17) * Math.PI * 2 + 1.3)
      + 0.08 * Math.sin((t / 7.3) * Math.PI * 2 + 2.1);
    return Math.max(1, Math.min(100, baseActivity * env));
  }

  // ---- Aurora field ----

  // Three curtain bands. Centreline = base row + sum of sines over column and time.
  const BANDS = [
    { base: 0.12, height: 0.26, ripples: [[3.4, 0.041, 0.21], [1.7, 0.12, -0.47], [0.6, 0.33, 0.9]], ray: 0.0, gain: 0.85 },
    { base: 0.40, height: 0.24, ripples: [[3.0, 0.029, -0.13], [1.5, 0.083, 0.31], [0.6, 0.29, -0.7]], ray: 4.1, gain: 0.9 },
    { base: 0.72, height: 0.2, ripples: [[2.4, 0.036, 0.17], [1.2, 0.101, -0.36], [0.5, 0.27, 0.8]], ray: 2.4, gain: 1.0 },
  ];

  function computeSky(t, act) {
    const a = act / 100;
    const gain = 0.5 + 0.55 * a; // brightness
    const contrast = 0.2 + 0.45 * a; // ray contrast
    const reach = 0.55 + 0.7 * a; // band height
    skyB.fill(0);
    skyF.fill(0);
    for (const band of BANDS) {
      const height = Math.max(2, band.height * horizon * reach);
      for (let x = 0; x < cols; x++) {
        let top = band.base * horizon;
        for (const w of band.ripples) top += w[0] * Math.sin(x * w[1] + t * w[2]);
        // Vertical rays: a higher frequency pattern over columns, drifting in time.
        const r1 = 0.5 + 0.5 * Math.sin(x * 0.53 + t * 0.9 + band.ray + 2.2 * Math.sin(x * 0.071 + t * 0.23));
        const r2 = 0.5 + 0.5 * Math.sin(x * 1.37 - t * 1.6 + band.ray);
        const r3 = 0.5 + 0.5 * Math.sin(x * 0.19 + t * 0.41 - band.ray);
        const ray = r1 * 0.45 + r2 * 0.25 + r3 * 0.3;
        const rayGain = 1 - contrast + contrast * ray;
        const rayLen = height * (0.7 + 0.6 * ray);
        const y0 = Math.max(0, Math.floor(top - 2));
        const y1 = Math.min(horizon, Math.ceil(top + rayLen * 3));
        for (let y = y0; y < y1; y++) {
          const d = y - top;
          let b;
          if (d < 0) b = Math.exp(d * 1.4) * 0.55; // soft glow above the edge
          else b = Math.min(1, 0.55 + d * 0.45) * Math.exp(-d / rayLen);
          b *= band.gain * gain * rayGain;
          const i = y * cols + x;
          const prev = skyB[i];
          skyB[i] = Math.min(1, prev + b - prev * b * 0.35);
          if (d > -1.5 && d < 1.5) skyF[i] = Math.max(skyF[i], (d < 0.5 ? 1 : 1.5 - d) * Math.min(1, b * 2));
        }
      }
    }
    // Faint airglow on the last sky rows, so the treeline reads as a silhouette.
    for (let y = Math.max(0, horizon - 12); y < horizon; y++) {
      const glow = 0.24 * gain * Math.exp(-Math.max(0, horizon - 4 - y) / 3);
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        skyB[i] = Math.min(1, skyB[i] + glow * (1 - skyB[i]));
      }
    }
  }

  // ---- Shooting stars ----

  let meteor = null;
  let nextMeteorAt = 0;

  function scheduleMeteor(now) {
    nextMeteorAt = now + MIN_METEOR_MS + Math.random() * (MAX_METEOR_MS - MIN_METEOR_MS);
  }

  function updateMeteor(now) {
    if (!meteor && now >= nextMeteorAt) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      meteor = {
        born: now,
        x: cols * (0.15 + Math.random() * 0.7),
        y: horizon * (0.04 + Math.random() * 0.25),
        dx: dir * (34 + Math.random() * 16), // cells per second
        dy: 14 + Math.random() * 8,
      };
      scheduleMeteor(now);
    }
    if (meteor && now - meteor.born > METEOR_LIFE_MS) meteor = null;
  }

  // ---- Drawing ----

  let letters = 0;

  // Draw one row from glyphs/keys, batching runs of equal colour into one fillText.
  function flushRow(py) {
    let runKey = -1;
    let runStart = 0;
    let run = '';
    for (let x = 0; x < cols; x++) {
      const g = glyphs[x];
      const k = keys[x];
      if (g === ' ') {
        if (runKey >= 0) run += ' ';
        continue;
      }
      letters++;
      if (k !== runKey) {
        if (runKey >= 0) {
          ctx.fillStyle = COLOURS[runKey];
          ctx.fillText(run, runStart * cellW, py);
        }
        runKey = k;
        runStart = x;
        run = g;
      } else run += g;
    }
    if (runKey >= 0) {
      ctx.fillStyle = COLOURS[runKey];
      ctx.fillText(run, runStart * cellW, py);
    }
  }

  function setAurora(x, b, fringe) {
    if (b < 1 / RAMP.length) {
      glyphs[x] = ' ';
      return;
    }
    glyphs[x] = glyphFor(b);
    const g = Math.min(GRAD_LEVELS - 1, Math.floor(b * GRAD_LEVELS));
    const f = Math.min(FRINGE_LEVELS - 1, Math.round(fringe * (FRINGE_LEVELS - 1)));
    keys[x] = f * GRAD_LEVELS + g;
  }

  function render(now) {
    const t = now / 1000;
    activity = effectiveActivity(t);
    computeSky(t, activity);

    ctx.fillStyle = css(NIGHT);
    ctx.fillRect(0, 0, viewW, viewH);
    ctx.font = FONT;
    ctx.textBaseline = 'top';
    letters = 0;

    // Meteor cells for this frame, keyed by cell index.
    const meteorCells = new Map();
    if (meteor) {
      const age = (now - meteor.born) / 1000;
      const life = age / (METEOR_LIFE_MS / 1000);
      const fade = life < 0.75 ? 1 : 1 - (life - 0.75) / 0.25;
      for (let k = 0; k <= METEOR_TRAIL; k++) {
        const s = age - k * 0.022;
        if (s < 0) break;
        const mx = Math.round(meteor.x + meteor.dx * s);
        const my = Math.round(meteor.y + meteor.dy * s);
        if (mx < 0 || mx >= cols || my < 0 || my >= horizon - 4) continue;
        const idx = my * cols + mx;
        if (meteorCells.has(idx)) continue;
        const level = Math.max(0, Math.round((1 - k / (METEOR_TRAIL + 1)) * fade * (METEOR_LEVELS - 1)));
        const glyph = k === 0 ? '@' : k < 3 ? '*' : k < 5 ? '+' : '.';
        meteorCells.set(idx, [glyph, KEY_METEOR + level]);
      }
    }

    // Sky.
    for (let y = 0; y < horizon; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        const fromGround = horizon - 1 - y;
        if (fromGround < treeTop[x]) {
          glyphs[x] = fromGround === treeTop[x] - 1 ? '^' : '#';
          keys[x] = KEY_TREE;
          continue;
        }
        const mc = meteorCells.get(i);
        if (mc) {
          glyphs[x] = mc[0];
          keys[x] = mc[1];
          continue;
        }
        const b = skyB[i];
        const si = starAt[i];
        if (si) {
          const star = stars[si - 1];
          const tw = 0.55 + 0.45 * Math.sin(t * star.speed + star.phase);
          const lum = star.base * tw * Math.max(0, 1 - b * 1.8); // aurora in front dims the star
          if (lum > b * 0.9 && lum > 0.12) {
            glyphs[x] = star.glyph;
            keys[x] = KEY_STAR + Math.min(STAR_LEVELS - 1, Math.floor(lum * STAR_LEVELS));
            continue;
          }
        }
        setAurora(x, b, skyF[i]);
      }
      flushRow(y * CELL_H);
    }

    // Lake: rows mirror the sky, squashed toward the horizon, wobbling and shimmering.
    const lakeRows = rows - horizon;
    const tick = Math.floor(t * 7);
    for (let y = horizon; y < rows; y++) {
      const d = y - horizon + 1;
      const sy = horizon - 1 - Math.floor(d * LAKE_COMPRESS);
      const wobble = Math.round(2 * Math.sin(d * 0.9 + t * 1.15) * Math.sin(t * 0.37 + d * 0.21));
      // The last rows fade out so the footer sits over the darkest water.
      const depthFade = 1 - 0.7 * Math.max(0, Math.min(1, (d - (lakeRows - 6)) / 6));
      for (let x = 0; x < cols; x++) {
        let sx = x + wobble;
        if (sx < 0) sx = 0;
        else if (sx >= cols) sx = cols - 1;
        const i = sy * cols + sx;
        const shimmer = hash(x, y, tick + ((x * 7 + y * 3) & 3)) < 0.22 ? 0.45 : 1;
        const b = skyB[i] * REFLECT_SCALE * shimmer * depthFade;
        const si = starAt[i];
        if (si && b < 0.12 && shimmer === 1) {
          const star = stars[si - 1];
          const lum = star.base * REFLECT_SCALE * depthFade * (0.55 + 0.45 * Math.sin(t * star.speed + star.phase + 1.1));
          if (lum > 0.12) {
            glyphs[x] = '.';
            keys[x] = KEY_STAR + Math.min(STAR_LEVELS - 1, Math.floor(lum * STAR_LEVELS));
            continue;
          }
        }
        setAurora(x, b, 0);
      }
      flushRow(y * CELL_H);
    }
  }

  // ---- HUD and QA state ----

  const qa = {
    fps: 0,
    letters: 0,
    activity: Math.round(activity),
    audioState: 'off',
    elapsedSeconds: 0,
    paused: false,
  };
  window.__asciiAurora = qa;

  function pad2(n) {
    return n < 10 ? `0${n}` : String(n);
  }

  function formatElapsed(seconds) {
    const s = Math.floor(seconds);
    return `${pad2(Math.floor(s / 60))}:${pad2(s % 60)}`;
  }

  function updateHud() {
    hud.fps.textContent = String(Math.round(qa.fps));
    hud.letters.textContent = String(qa.letters);
    hud.activity.textContent = `${qa.activity}%`;
    hud.elapsed.textContent = formatElapsed(qa.elapsedSeconds);
  }

  // ---- Main loop ----

  const frameTimes = new Float64Array(FPS_WINDOW);
  let frameCount = 0;
  let lastFrame = 0;
  let startedAt = 0;
  let sceneMs = 0; // scene clock, frozen while paused
  let lastHud = 0;
  let paused = false;

  function frame(now) {
    if (!startedAt) {
      startedAt = now;
      lastFrame = now;
      scheduleMeteor(0);
    }
    const dt = now - lastFrame;
    lastFrame = now;
    if (frameCount > 0) frameTimes[(frameCount - 1) % FPS_WINDOW] = dt;
    frameCount++;

    if (!paused) {
      sceneMs += Math.min(dt, 100);
      updateMeteor(sceneMs);
      render(sceneMs);
      qa.letters = letters;
      qa.activity = Math.round(activity);
    }

    const samples = Math.min(FPS_WINDOW, frameCount - 1);
    if (samples > 0) {
      let sum = 0;
      for (let i = 0; i < samples; i++) sum += frameTimes[i];
      qa.fps = Math.round((1000 * samples / sum) * 10) / 10;
    }
    qa.elapsedSeconds = Math.round((now - startedAt) / 100) / 10;

    if (now - lastHud >= HUD_INTERVAL_MS) {
      lastHud = now;
      updateHud();
    }
    requestAnimationFrame(frame);
  }

  // ---- Controls ----

  function setPaused(value) {
    paused = value;
    qa.paused = value;
    pauseButton.textContent = value ? 'Play' : 'Pause';
    pauseButton.setAttribute('aria-pressed', String(value));
  }

  pauseButton.addEventListener('click', () => setPaused(!paused));

  activitySlider.addEventListener('input', () => {
    const v = Number(activitySlider.value);
    if (!Number.isFinite(v)) return;
    baseActivity = Math.max(10, Math.min(100, v));
    activity = effectiveActivity(sceneMs / 1000);
    qa.activity = Math.round(activity);
    if (paused) {
      render(sceneMs);
      qa.letters = letters;
    }
    updateHud();
  });

  function setSoundLabel(on) {
    soundButton.textContent = on ? 'Sound: On' : 'Sound: Off';
    soundButton.setAttribute('aria-pressed', String(on));
    qa.audioState = on ? 'on' : 'off';
  }

  // The AudioContext is created inside this handler only (see audio.js).
  // Sound and animation are independent: neither starts or stops the other.
  soundButton.addEventListener('click', () => {
    const engine = window.AsciiAuroraAudio;
    if (!engine) return;
    if (qa.audioState === 'on') {
      engine.stop();
      setSoundLabel(false);
      return;
    }
    try {
      engine.start();
      setSoundLabel(true);
    } catch (err) {
      setSoundLabel(false);
      soundButton.disabled = true;
      soundButton.title = 'Sound is not available in this browser';
      console.warn('ASCII Aurora: sound unavailable:', err);
    }
  });

  window.addEventListener('resize', resize);
  resize();

  // Reduced motion: start resting on a still frame; Play starts the motion.
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setPaused(true);
    sceneMs = 12000;
    render(sceneMs);
    qa.letters = letters;
  }

  requestAnimationFrame(frame);
})();
