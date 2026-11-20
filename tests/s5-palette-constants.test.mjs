// S5: Given the palette and constants defined in assets/aurora.js, when
// verify.mjs reads them, then it finds exactly 7 AURORA_STOPS stops, the 0.78
// stop equal to (74,222,128), the exact ramp literal, and the meteor and
// reflection constants of R9.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readRoot, verifyAfter, edit, auroraStopsSpan, topLevelEntries } from './helpers.mjs';

const EXPECTED_STOPS = [
  [0.0, 3, 7, 17],
  [0.2, 4, 32, 38],
  [0.4, 13, 84, 74],
  [0.6, 20, 150, 110],
  [0.78, 74, 222, 128],
  [0.9, 45, 212, 191],
  [1.0, 187, 247, 208],
];
const RAMP = " .':;+*x%#@";

function numbers(text) {
  return (text.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '').match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
}

test('S5: aurora.js defines AURORA_STOPS exactly once', () => {
  const src = readRoot('assets/aurora.js');
  const defs = src.match(/AURORA_STOPS\s*=(?!=)/g) || [];
  assert.equal(defs.length, 1);
});

test('S5: AURORA_STOPS holds exactly 7 stops with the spec positions and colours, 0.78 = (74,222,128)', () => {
  const span = auroraStopsSpan(readRoot('assets/aurora.js'));
  assert.ok(span, 'AURORA_STOPS literal not found');
  const entries = topLevelEntries(span.text);
  assert.equal(entries.length, 7, `expected 7 stops, found ${entries.length}`);
  const got = entries.map(numbers);
  assert.deepEqual(got, EXPECTED_STOPS);
  const stop078 = got.find((s) => s[0] === 0.78);
  assert.deepEqual(stop078.slice(1), [74, 222, 128]);
});

test('S5: aurora.js defines RAMP as the exact 11 glyph literal " .\':;+*x%#@"', () => {
  const src = readRoot('assets/aurora.js');
  assert.equal(RAMP.length, 11);
  assert.ok(src.includes(`"${RAMP}"`), 'exact ramp literal missing');
  assert.match(src, /RAMP\s*=\s*" \.':;\+\*x%#@"/);
});

test('S5: aurora.js carries MIN_METEOR_MS = 6000, MAX_METEOR_MS = 14000, REFLECT_SCALE = 0.55', () => {
  const src = readRoot('assets/aurora.js');
  for (const lit of ['MIN_METEOR_MS = 6000', 'MAX_METEOR_MS = 14000', 'REFLECT_SCALE = 0.55']) {
    assert.ok(src.includes(lit), `missing literal ${lit}`);
  }
});

function editStops(d, fn) {
  edit(d, 'assets/aurora.js', (s) => {
    const span = auroraStopsSpan(s);
    if (!span) throw new Error('AURORA_STOPS literal not found');
    return s.slice(0, span.start) + fn(span.text) + s.slice(span.end);
  });
}

const rejections = [
  ['AURORA_STOPS is defined twice', (d) => edit(d, 'assets/aurora.js', (s) => s + '\nconst AURORA_STOPS = [[0, 3, 7, 17]];\n')],
  ['AURORA_STOPS has 8 stops', (d) => editStops(d, (t) => {
    const e = topLevelEntries(t);
    return t[0] + [...e, e[e.length - 1]].join(',') + t[t.length - 1];
  })],
  ['AURORA_STOPS has 6 stops', (d) => editStops(d, (t) => {
    const e = topLevelEntries(t);
    return t[0] + e.filter((_, i) => i !== 3).join(',') + t[t.length - 1];
  })],
  ['the 0.78 stop colour is (74,222,129)', (d) => editStops(d, (t) => t.replace(/74(\s*,\s*)222(\s*,\s*)128/, '74$1222$2129'))],
  ['the (74,222,128) stop sits at 0.77 instead of 0.78', (d) => editStops(d, (t) => t.replace('0.78', '0.77'))],
  ['the ramp literal is altered', (d) => edit(d, 'assets/aurora.js', (s) => s.split(RAMP).join(" .':;+*x%#&"))],
  ['MIN_METEOR_MS is 5000', (d) => edit(d, 'assets/aurora.js', (s) => s.replace('MIN_METEOR_MS = 6000', 'MIN_METEOR_MS = 5000'))],
  ['MAX_METEOR_MS is 15000', (d) => edit(d, 'assets/aurora.js', (s) => s.replace('MAX_METEOR_MS = 14000', 'MAX_METEOR_MS = 15000'))],
  ['REFLECT_SCALE is 0.5', (d) => edit(d, 'assets/aurora.js', (s) => s.replace('REFLECT_SCALE = 0.55', 'REFLECT_SCALE = 0.5'))],
];

for (const [name, mutate] of rejections) {
  test(`S5: verify.mjs exits non zero when ${name}`, () => {
    const r = verifyAfter(mutate);
    assert.notEqual(r.code, 0, `verify should fail when ${name}\n${r.stdout}`);
  });
}
