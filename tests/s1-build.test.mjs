// S1: Given a clean checkout, when npm install and npm run build run, then
// dist/ is assembled, the build prints the dist size in bytes, and
// node tools/verify.mjs exits 0.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  readRoot, makeSandbox, removeSandbox, buildIn, verifyIn, verifyAfter, edit,
  dirBytes, ATTRIBUTION_HREF, ATTRIBUTION_TEXT,
} from './helpers.mjs';

test('S1: package.json is ascii-aurora, private, module, build "node build.mjs", only devDependency playwright-core', () => {
  const pkg = JSON.parse(readRoot('package.json'));
  assert.equal(pkg.name, 'ascii-aurora');
  assert.equal(pkg.private, true);
  assert.equal(pkg.type, 'module');
  assert.equal(pkg.scripts && pkg.scripts.build, 'node build.mjs');
  assert.deepEqual(Object.keys(pkg.devDependencies || {}), ['playwright-core']);
  assert.equal(Object.keys(pkg.dependencies || {}).length, 0, 'no runtime dependencies');
});

test('S1: build.mjs assembles dist/ with index.html and the assets, and prints the dist size in bytes', () => {
  const dir = makeSandbox();
  try {
    const b = buildIn(dir);
    assert.equal(b.code, 0, `build exited ${b.code}: ${b.stderr}`);
    for (const rel of ['index.html', 'assets/styles.css', 'assets/aurora.js', 'assets/audio.js']) {
      const p = path.join(dir, 'dist', rel);
      assert.ok(fs.existsSync(p), `dist/${rel} missing`);
      assert.ok(fs.statSync(p).size > 0, `dist/${rel} is empty`);
    }
    const size = dirBytes(path.join(dir, 'dist'));
    assert.match(b.stdout, /bytes/i, 'build output names bytes');
    const numbers = (b.stdout.match(/\d[\d,_]*/g) || []).map((n) => Number(n.replace(/[,_]/g, '')));
    assert.ok(numbers.includes(size), `build output ${JSON.stringify(b.stdout.trim())} does not report the dist size ${size}`);
  } finally {
    removeSandbox(dir);
  }
});

test('S1: build is repeatable (second run over an existing dist/ also succeeds)', () => {
  const dir = makeSandbox();
  try {
    assert.equal(buildIn(dir).code, 0);
    const b2 = buildIn(dir);
    assert.equal(b2.code, 0, b2.stderr);
    assert.ok(fs.existsSync(path.join(dir, 'dist', 'index.html')));
  } finally {
    removeSandbox(dir);
  }
});

test('S1: node tools/verify.mjs exits 0 on the built real sources', () => {
  const r = verifyAfter(() => {});
  assert.equal(r.code, 0, `verify exited ${r.code}\n${r.stdout}\n${r.stderr}`);
});

// verify.mjs must actually check each R9 item: one rejected input per rule.
const rejections = [
  ['item 5: an .mp3 reference under assets/', (d) => edit(d, 'assets/audio.js', (s) => s + '\n// track.mp3\n')],
  ['item 5: a .wav reference under assets/', (d) => edit(d, 'assets/aurora.js', (s) => s + '\n// tone.wav\n')],
  ['item 5: audio.js without createOscillator', (d) => edit(d, 'assets/audio.js', (s) => s.replace(/createOscillator/g, 'createOsc'))],
  ['item 5: audio.js without AudioContext', (d) => edit(d, 'assets/audio.js', (s) => s.replace(/AudioContext/g, 'AudioCtx'))],
  ['item 6: attribution text missing', (d) => edit(d, 'index.html', (s) => s.split(ATTRIBUTION_TEXT).join('Made with ANVIL.'))],
  ['item 6: attribution href not exact', (d) => edit(d, 'index.html', (s) => s.split(`"${ATTRIBUTION_HREF}"`).join(`"${ATTRIBUTION_HREF}/x"`))],
  ['item 7: hud-letters id missing', (d) => edit(d, 'index.html', (s) => s.replace(/hud-letters/g, 'hud-letterz'))],
  ['item 7: pause-toggle id missing', (d) => edit(d, 'index.html', (s) => s.replace(/pause-toggle/g, 'pause-togglz'))],
  ['item 8: window.__asciiAurora missing', (d) => edit(d, 'assets/aurora.js', (s) => s.replace(/window\.__asciiAurora/g, 'window.__other'))],
  ['item 9: dist/assets/audio.js missing after build', (d) => fs.rmSync(path.join(d, 'dist', 'assets', 'audio.js'))],
  ['item 9: dist/index.html missing after build', (d) => fs.rmSync(path.join(d, 'dist', 'index.html'))],
];

for (const [name, mutate] of rejections) {
  test(`S1: verify.mjs exits non zero when ${name}`, () => {
    const r = verifyAfter(mutate);
    assert.notEqual(r.code, 0, `verify should fail for ${name}\n${r.stdout}`);
  });
}

test('S1: verify.mjs exits non zero when dist/ was never built', () => {
  const dir = makeSandbox();
  try {
    const r = verifyIn(dir);
    assert.notEqual(r.code, 0, 'verify should fail without dist/');
  } finally {
    removeSandbox(dir);
  }
});
