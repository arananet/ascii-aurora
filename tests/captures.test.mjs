// S2, S3, S4, S7: capture evidence written by tools/shots.mjs (R10).
// These read the real evidence files (evidence/captures.json and the PNG
// stills) and re-measure the PNG pixels independently, so a fabricated or
// stale captures.json does not pass. See tests/README.md for the contract.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  rootPath, loadCaptures, capture, pngSize, decodePng, fractionIn,
  isAuroraFamily, isNonBlack,
} from './helpers.mjs';

const STILLS = {
  desktop: { file: 'evidence/stills/page-desktop.png', width: 1280, height: 800 },
  mobile: { file: 'evidence/stills/page-mobile.png', width: 390, height: 844 },
  sound: { file: 'evidence/stills/page-sound.png', width: 1280, height: 800 },
};

function readStill(name) {
  const p = rootPath(STILLS[name].file);
  assert.ok(fs.existsSync(p), `missing ${STILLS[name].file}`);
  return fs.readFileSync(p);
}

function assertQaShape(qa, label) {
  assert.ok(qa && typeof qa === 'object', `${label}: QA sample missing`);
  for (const k of ['fps', 'letters', 'activity', 'elapsedSeconds']) {
    assert.equal(typeof qa[k], 'number', `${label}: ${k} must be a number`);
    assert.ok(Number.isFinite(qa[k]), `${label}: ${k} must be finite`);
  }
  assert.ok(['off', 'on'].includes(qa.audioState), `${label}: audioState must be "off" or "on"`);
}

function assertCaptureRecord(c, name) {
  const s = STILLS[name];
  assert.equal(c.file, s.file);
  assert.deepEqual({ width: c.viewport.width, height: c.viewport.height }, { width: s.width, height: s.height });
  assert.equal(typeof c.title, 'string');
  assert.ok(c.title.length > 0, 'page title recorded');
  assert.equal(typeof c.horizontalOverflow, 'boolean');
  assert.equal(typeof c.auroraFractionTop, 'number');
  assert.equal(typeof c.nonBlackFractionBottom, 'number');
}

test('S2: desktop capture 1280x800 shows aurora in the top half (> 0.02), reflection in the bottom half (> 0.01), no horizontal overflow', () => {
  const data = loadCaptures();
  const c = capture(data, 'desktop');
  assertCaptureRecord(c, 'desktop');
  assert.equal(c.horizontalOverflow, false);
  assert.ok(c.auroraFractionTop > 0.02, `recorded auroraFractionTop ${c.auroraFractionTop}`);
  assert.ok(c.nonBlackFractionBottom > 0.01, `recorded nonBlackFractionBottom ${c.nonBlackFractionBottom}`);

  const buf = readStill('desktop');
  assert.deepEqual(pngSize(buf), { width: 1280, height: 800 }, 'full page still equals the viewport: page does not scroll');
  const img = decodePng(buf);
  const half = img.height >> 1;
  const top = fractionIn(img, 0, half, isAuroraFamily);
  const bottom = fractionIn(img, half, img.height, isNonBlack);
  assert.ok(top > 0.02, `measured aurora colour fraction in the top half of the PNG: ${top}`);
  assert.ok(bottom > 0.01, `measured non black fraction in the bottom half of the PNG: ${bottom}`);
});

test('S3: desktop QA state is live: letters >= 1500, fps >= 24, activity 1..100, two elapsedSeconds samples differ by >= 1', () => {
  const c = capture(loadCaptures(), 'desktop');
  assert.ok(Array.isArray(c.qa) && c.qa.length >= 2, 'desktop capture holds at least two QA samples');
  const [a, b] = c.qa;
  assertQaShape(a, 'sample 1');
  assertQaShape(b, 'sample 2');
  for (const [i, s] of [a, b].entries()) {
    assert.ok(s.letters >= 1500, `sample ${i + 1} letters ${s.letters}`);
    assert.ok(s.fps >= 24, `sample ${i + 1} fps ${s.fps}`);
    assert.ok(s.activity >= 1 && s.activity <= 100, `sample ${i + 1} activity ${s.activity}`);
  }
  assert.ok(b.elapsedSeconds - a.elapsedSeconds >= 1, `elapsedSeconds ${a.elapsedSeconds} then ${b.elapsedSeconds}`);
  assert.equal(a.audioState, 'off', 'no sound before a user gesture');
});

test('S4: sound capture: audioState "off" before the Sound toggle click and "on" after it', () => {
  const c = capture(loadCaptures(), 'sound');
  assertCaptureRecord(c, 'sound');
  assertQaShape(c.qaBeforeClick, 'before click');
  assert.equal(c.qaBeforeClick.audioState, 'off');
  assert.ok(Array.isArray(c.qa) && c.qa.length >= 1, 'sound capture holds a QA sample after the click');
  const after = c.qa[c.qa.length - 1];
  assertQaShape(after, 'after click');
  assert.equal(after.audioState, 'on');
  assert.deepEqual(pngSize(readStill('sound')), { width: 1280, height: 800 });
});

test('S7: mobile capture 390x844: no horizontal overflow, aurora colour fraction in the top half > 0.01', () => {
  const c = capture(loadCaptures(), 'mobile');
  assertCaptureRecord(c, 'mobile');
  assert.equal(c.horizontalOverflow, false);
  assert.ok(c.auroraFractionTop > 0.01, `recorded auroraFractionTop ${c.auroraFractionTop}`);

  const buf = readStill('mobile');
  assert.deepEqual(pngSize(buf), { width: 390, height: 844 }, 'full page still equals the viewport: no overflow or scroll');
  const img = decodePng(buf);
  const top = fractionIn(img, 0, img.height >> 1, isAuroraFamily);
  assert.ok(top > 0.01, `measured aurora colour fraction in the top half of the PNG: ${top}`);
});
