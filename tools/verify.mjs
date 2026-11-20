// ASCII Aurora verification (spec R9). Plain node, no dependencies.
// Run from the project root after the build: node tools/verify.mjs
// Exits non zero at the first failing assertion.
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const ATTRIBUTION_TEXT = 'Made with ANVIL, an open source software factory.';
const ATTRIBUTION_HREF = 'https://anvil-landing-7x1.pages.dev';
const RAMP_LITERAL = '" .\':;+*x%#@"';
const HUD_IDS = ['hud-fps', 'hud-letters', 'hud-activity', 'hud-elapsed'];
const CONTROL_IDS = ['sound-toggle', 'activity-slider', 'pause-toggle'];
const AUDIO_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a'];
const DIST_FILES = ['index.html', 'assets/styles.css', 'assets/aurora.js', 'assets/audio.js'];
// Dash scan: explicit list only. README.md, runs/, .anvil-factory/,
// node_modules/, dist/, .git/, evidence/ and harness packets are never scanned.
const AUTHORED_FILES = [
  'index.html',
  'assets/styles.css',
  'assets/aurora.js',
  'assets/audio.js',
  'build.mjs',
  'tools/verify.mjs',
  'tools/shots.mjs',
];
const DASHES = [['em dash', '\u2014'], ['en dash', '\u2013']];
const URL_RE = /https?:\/\/[^\s"'<>)]*/g;

let step = 0;

function fail(message) {
  console.error(`verify: FAIL (${step}) ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`verify: ok (${step}) ${message}`);
}

function read(rel) {
  const p = path.join(ROOT, rel);
  if (!fs.existsSync(p) || !fs.statSync(p).isFile()) fail(`missing file ${rel}`);
  return fs.readFileSync(p, 'utf8');
}

function listFiles(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listFiles(p));
    else if (ent.isFile()) out.push(p);
  }
  return out;
}

function stripComments(text) {
  return text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
}

// Return the balanced [...] literal following "AURORA_STOPS =".
function stopsLiteral(src, from) {
  let i = src.indexOf('[', from);
  if (i < 0) return null;
  const start = i;
  let depth = 0;
  for (; i < src.length; i++) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') {
      depth--;
      if (depth === 0) return src.slice(start, i + 1);
    }
  }
  return null;
}

function topLevelEntries(literal) {
  const inner = stripComments(literal.slice(1, -1));
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of inner) {
    if (ch === '[' || ch === '{' || ch === '(') depth++;
    if (ch === ']' || ch === '}' || ch === ')') depth--;
    if (ch === ',' && depth === 0) {
      if (cur.trim()) out.push(cur);
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out;
}

const aurora = read('assets/aurora.js');
const audio = read('assets/audio.js');
const html = read('index.html');

// (1) exactly one AURORA_STOPS definition holding exactly 7 stops.
step = 1;
const defs = [...aurora.matchAll(/AURORA_STOPS\s*=(?!=)/g)];
if (defs.length !== 1) fail(`expected exactly one AURORA_STOPS definition, found ${defs.length}`);
const literal = stopsLiteral(aurora, defs[0].index);
if (!literal) fail('AURORA_STOPS literal is not a bracketed list');
const stops = topLevelEntries(literal).map((e) => (e.match(/-?\d+(?:\.\d+)?/g) || []).map(Number));
if (stops.length !== 7) fail(`AURORA_STOPS holds ${stops.length} stops, expected 7`);
for (const [i, s] of stops.entries()) {
  if (s.length !== 4) fail(`AURORA_STOPS stop ${i} is not [position, r, g, b]`);
}
pass('AURORA_STOPS defined once with 7 stops');

// (2) the stop at 0.78 equals (74,222,128).
step = 2;
const stop078 = stops.filter((s) => s[0] === 0.78);
if (stop078.length !== 1) fail(`expected one stop at 0.78, found ${stop078.length}`);
if (stop078[0].slice(1).join(',') !== '74,222,128') fail(`stop 0.78 is (${stop078[0].slice(1).join(',')}), expected (74,222,128)`);
pass('stop 0.78 = (74,222,128)');

// (3) the exact ramp literal.
step = 3;
if (!aurora.includes(RAMP_LITERAL)) fail(`assets/aurora.js lacks the ramp literal ${RAMP_LITERAL}`);
pass(`ramp literal ${RAMP_LITERAL}`);

// (4) meteor and reflection constants.
step = 4;
for (const lit of ['MIN_METEOR_MS = 6000', 'MAX_METEOR_MS = 14000', 'REFLECT_SCALE = 0.55']) {
  if (!aurora.includes(lit)) fail(`assets/aurora.js lacks ${lit}`);
}
pass('MIN_METEOR_MS = 6000, MAX_METEOR_MS = 14000, REFLECT_SCALE = 0.55');

// (5) WebAudio synthesis, no audio files under assets/.
step = 5;
for (const lit of ['AudioContext', 'createOscillator']) {
  if (!audio.includes(lit)) fail(`assets/audio.js lacks ${lit}`);
}
const assetFiles = listFiles(path.join(ROOT, 'assets'));
for (const p of assetFiles) {
  const text = fs.readFileSync(p, 'utf8');
  for (const ext of AUDIO_EXTENSIONS) {
    if (text.includes(ext)) fail(`${path.relative(ROOT, p)} references ${ext}`);
  }
}
pass('audio is synthesised, no audio file references');

// (6) the attribution exactly once, inside an anchor with the exact href.
step = 6;
const textCount = html.split(ATTRIBUTION_TEXT).length - 1;
if (textCount !== 1) fail(`attribution text appears ${textCount} times in index.html, expected 1`);
const anchors = [...html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)].filter((m) => m[2].includes(ATTRIBUTION_TEXT));
if (anchors.length !== 1) fail('attribution text is not inside an anchor');
const href = /\bhref\s*=\s*"([^"]*)"/i.exec(anchors[0][1]);
if (!href || href[1] !== ATTRIBUTION_HREF) fail(`attribution href is ${href ? href[1] : 'missing'}, expected ${ATTRIBUTION_HREF}`);
pass('attribution anchor present once');

// (7) HUD and control ids.
step = 7;
for (const id of [...HUD_IDS, ...CONTROL_IDS]) {
  if (!new RegExp(`\\bid\\s*=\\s*"${id}"`).test(html)) fail(`index.html lacks id="${id}"`);
}
pass('HUD and control ids present');

// (8) the QA state object.
step = 8;
if (!aurora.includes('window.__asciiAurora')) fail('assets/aurora.js lacks window.__asciiAurora');
pass('window.__asciiAurora exposed');

// (9) the built dist/ (checked as the build left it, not rebuilt here).
step = 9;
for (const rel of DIST_FILES) {
  const p = path.join(ROOT, 'dist', rel);
  if (!fs.existsSync(p) || !fs.statSync(p).isFile()) fail(`dist/${rel} missing; run npm run build first`);
}
pass('dist/ holds index.html and the assets');

// (10) no em dash or en dash in the authored files.
step = 10;
for (const rel of AUTHORED_FILES) {
  const text = read(rel);
  for (const [name, ch] of DASHES) {
    if (text.includes(ch)) fail(`${rel} contains an ${name}`);
  }
}
pass(`no em or en dash in ${AUTHORED_FILES.length} authored files`);

// (11) external references: only the attribution href in index.html, none under assets/.
step = 11;
const urls = html.match(URL_RE) || [];
if (urls.length !== 1 || urls[0] !== ATTRIBUTION_HREF) {
  fail(`index.html external references ${JSON.stringify(urls)}, expected only ${ATTRIBUTION_HREF}`);
}
for (const p of assetFiles) {
  const found = fs.readFileSync(p, 'utf8').match(URL_RE);
  if (found) fail(`${path.relative(ROOT, p)} has external reference ${found[0]}`);
}
pass('only external reference is the attribution href');

console.log('verify: all 11 checks passed');
