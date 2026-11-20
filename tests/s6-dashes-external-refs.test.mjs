// S6: Given the authored files listed in R9, when verify.mjs scans them, then
// no em dash or en dash character is present and the only external reference
// is the single attribution href.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  readRoot, verifyAfter, edit, writeIn, commentFor, AUTHORED_FILES,
  ATTRIBUTION_HREF, ATTRIBUTION_TEXT, EM_DASH, EN_DASH, ROOT,
} from './helpers.mjs';

const URL_RE = /https?:\/\/[^\s"'<>)]+/g;

test('S6: no em dash or en dash in any R9 authored file', () => {
  for (const rel of AUTHORED_FILES) {
    const src = readRoot(rel);
    assert.ok(!src.includes(EM_DASH), `${rel} contains an em dash`);
    assert.ok(!src.includes(EN_DASH), `${rel} contains an en dash`);
  }
});

test('S6: index.html has exactly one http(s) reference, the attribution anchor href, around the attribution text', () => {
  const html = readRoot('index.html');
  const urls = html.match(URL_RE) || [];
  assert.deepEqual(urls, [ATTRIBUTION_HREF]);
  assert.equal(html.split(ATTRIBUTION_TEXT).length - 1, 1, 'attribution text appears exactly once');
  const anchor = /<a\b[^>]*\bhref\s*=\s*"([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  const hits = [...html.matchAll(anchor)].filter((m) => m[2].includes(ATTRIBUTION_TEXT));
  assert.equal(hits.length, 1, 'attribution text sits inside one anchor');
  assert.equal(hits[0][1], ATTRIBUTION_HREF);
  const anchors = [...html.matchAll(/<a\b/gi)];
  assert.equal(anchors.length, 1, 'no other links on the page');
});

test('S6: no file under assets/ contains an http:// or https:// reference', () => {
  const dir = path.join(ROOT, 'assets');
  assert.ok(fs.existsSync(dir), 'assets/ missing');
  for (const name of fs.readdirSync(dir, { recursive: true })) {
    const p = path.join(dir, name);
    if (!fs.statSync(p).isFile()) continue;
    const src = fs.readFileSync(p, 'utf8');
    assert.equal((src.match(/https?:\/\//g) || []).length, 0, `assets/${name} has an external reference`);
  }
});

// One rejected input per scanned file and dash kind.
for (const rel of AUTHORED_FILES) {
  test(`S6: verify.mjs exits non zero when ${rel} gains an em dash`, () => {
    const r = verifyAfter((d) => edit(d, rel, (s) => s + commentFor(rel, `x ${EM_DASH} y`)));
    assert.notEqual(r.code, 0, `verify missed an em dash in ${rel}\n${r.stdout}`);
  });
}

test('S6: verify.mjs exits non zero when assets/aurora.js gains an en dash', () => {
  const r = verifyAfter((d) => edit(d, 'assets/aurora.js', (s) => s + commentFor('a.js', `x ${EN_DASH} y`)));
  assert.notEqual(r.code, 0);
});

test('S6: verify.mjs still exits 0 when dashes exist only in excluded locations (runs/, .anvil-factory/, node_modules/, dist/, evidence/, README.md, packets)', () => {
  const r = verifyAfter((d) => {
    const t = `excluded ${EM_DASH} ${EN_DASH} text\n`;
    writeIn(d, 'runs/wo-gh-1/notes.md', t);
    writeIn(d, '.anvil-factory/x.md', t);
    writeIn(d, 'node_modules/pkg/index.js', `// ${t}`);
    writeIn(d, 'dist/extra.txt', t);
    writeIn(d, 'evidence/notes.txt', t);
    writeIn(d, 'README.md', t);
    writeIn(d, 'builder.packet.md', t);
    writeIn(d, 'tools/nested/review.packet.md', t);
  });
  assert.equal(r.code, 0, `verify must scan by explicit list only\n${r.stdout}\n${r.stderr}`);
});

const refRejections = [
  ['index.html gains a second https link', (d) => edit(d, 'index.html', (s) => s.replace('</body>', '<a href="https://example.com">x</a></body>'))],
  ['index.html gains an http:// reference in a comment', (d) => edit(d, 'index.html', (s) => s + commentFor('i.html', 'http://example.com'))],
  ['index.html loads a remote script', (d) => edit(d, 'index.html', (s) => s.replace('</head>', '<script src="https://cdn.example.com/x.js"></script></head>'))],
  ['assets/aurora.js gains an https reference', (d) => edit(d, 'assets/aurora.js', (s) => s + commentFor('a.js', 'see https://example.com'))],
  ['assets/styles.css gains a remote font url', (d) => edit(d, 'assets/styles.css', (s) => s + '\n@import url("https://fonts.example.com/f.css");\n')],
  ['assets/audio.js gains an http reference', (d) => edit(d, 'assets/audio.js', (s) => s + commentFor('a.js', 'http://example.com/x'))],
  ['the attribution footer appears twice', (d) => edit(d, 'index.html', (s) => s.replace('</body>', `<a href="${ATTRIBUTION_HREF}">${ATTRIBUTION_TEXT}</a></body>`))],
];

for (const [name, mutate] of refRejections) {
  test(`S6: verify.mjs exits non zero when ${name}`, () => {
    const r = verifyAfter(mutate);
    assert.notEqual(r.code, 0, `verify should fail when ${name}\n${r.stdout}`);
  });
}
