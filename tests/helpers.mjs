// Shared helpers for the wo-gh-1 scenario tests (node:test, no dependencies).
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export const AUTHORED_FILES = [
  'index.html',
  'assets/styles.css',
  'assets/aurora.js',
  'assets/audio.js',
  'build.mjs',
  'tools/verify.mjs',
  'tools/shots.mjs',
];

export const ATTRIBUTION_TEXT = 'Made with ANVIL, an open source software factory.';
export const ATTRIBUTION_HREF = 'https://anvil-landing-7x1.pages.dev';
export const EM_DASH = '\u2014';
export const EN_DASH = '\u2013';

export function rootPath(rel) {
  return path.join(ROOT, rel);
}

export function readRoot(rel) {
  const p = rootPath(rel);
  if (!fs.existsSync(p)) throw new Error(`missing artifact: ${rel}`);
  return fs.readFileSync(p, 'utf8');
}

export function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', timeout: 60000 });
  return { code: r.status, stdout: r.stdout || '', stderr: r.stderr || '', error: r.error };
}

// Copy the real authored sources (index.html, assets/, build.mjs, package.json,
// tools/verify.mjs, tools/shots.mjs) into a fresh temp dir. No node_modules.
export function makeSandbox() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ascii-aurora-'));
  const entries = ['index.html', 'assets', 'build.mjs', 'package.json', 'tools/verify.mjs', 'tools/shots.mjs'];
  for (const rel of entries) {
    const src = rootPath(rel);
    if (!fs.existsSync(src)) throw new Error(`missing artifact: ${rel}`);
    const dst = path.join(dir, rel);
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.cpSync(src, dst, { recursive: true });
  }
  return dir;
}

export function removeSandbox(dir) {
  fs.rmSync(dir, { recursive: true, force: true });
}

export function buildIn(dir) {
  return run(process.execPath, ['build.mjs'], dir);
}

export function verifyIn(dir) {
  return run(process.execPath, ['tools/verify.mjs'], dir);
}

export function edit(dir, rel, fn) {
  const p = path.join(dir, rel);
  const before = fs.readFileSync(p, 'utf8');
  const after = fn(before);
  if (after === before) throw new Error(`mutation of ${rel} changed nothing`);
  fs.writeFileSync(p, after);
}

export function writeIn(dir, rel, content) {
  const p = path.join(dir, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, content);
}

// Build a sandbox, apply a mutation, run verify.mjs there, clean up.
export function verifyAfter(mutate) {
  const dir = makeSandbox();
  try {
    const b = buildIn(dir);
    if (b.code !== 0) throw new Error(`build failed in sandbox: ${b.stderr || b.stdout}`);
    mutate(dir);
    return verifyIn(dir);
  } finally {
    removeSandbox(dir);
  }
}

export function dirBytes(dir) {
  let total = 0;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) total += dirBytes(p);
    else if (ent.isFile()) total += fs.statSync(p).size;
  }
  return total;
}

export function commentFor(rel, text) {
  if (rel.endsWith('.html')) return `\n<!-- ${text} -->\n`;
  if (rel.endsWith('.css')) return `\n/* ${text} */\n`;
  return `\n// ${text}\n`;
}

// Locate the AURORA_STOPS literal in source text: returns the balanced
// bracket span ([...] or {...}) that follows "AURORA_STOPS =".
export function auroraStopsSpan(src) {
  const m = /AURORA_STOPS\s*=(?!=)\s*/.exec(src);
  if (!m) return null;
  let i = m.index + m[0].length;
  while (i < src.length && !'[{'.includes(src[i])) i++;
  const start = i;
  let depth = 0;
  for (; i < src.length; i++) {
    const ch = src[i];
    if (ch === '[' || ch === '{') depth++;
    else if (ch === ']' || ch === '}') {
      depth--;
      if (depth === 0) return { start, end: i + 1, text: src.slice(start, i + 1) };
    }
  }
  return null;
}

// Split the top level entries of a bracket literal like "[a, b, c]".
export function topLevelEntries(spanText) {
  const inner = spanText.slice(1, -1);
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of inner) {
    if ('[{('.includes(ch)) depth++;
    if (']})'.includes(ch)) depth--;
    if (ch === ',' && depth === 0) {
      if (cur.trim()) out.push(cur);
      cur = '';
    } else cur += ch;
  }
  if (cur.replace(/\/\/.*$/gm, '').trim()) out.push(cur);
  return out;
}

// ---- PNG reading (8 bit RGB/RGBA, non interlaced, as Chrome writes) ----

export function pngSize(buf) {
  const sig = '89504e470d0a1a0a';
  if (buf.subarray(0, 8).toString('hex') !== sig) throw new Error('not a PNG file');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

export function decodePng(buf) {
  const { width, height } = pngSize(buf);
  let off = 8;
  let bitDepth;
  let colorType;
  let interlace;
  const idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  if (bitDepth !== 8 || interlace !== 0 || (colorType !== 2 && colorType !== 6)) {
    throw new Error(`unsupported PNG format: depth ${bitDepth} colour ${colorType} interlace ${interlace}`);
  }
  const bpp = colorType === 6 ? 4 : 3;
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const px = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0;
      const b = y > 0 ? px[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? px[(y - 1) * stride + x - bpp] : 0;
      let v = line[x];
      if (f === 1) v += a;
      else if (f === 2) v += b;
      else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      px[y * stride + x] = v & 255;
    }
  }
  return { width, height, bpp, px };
}

// Independent pixel rule used by the tests (not the capture tool's own rule):
// "aurora colour family" = green dominant pixels, i.e. the AURORA_STOPS hues
// (greens, teals, mint): g >= 60, g > r + 25, b <= g + 20.
export function isAuroraFamily(r, g, b) {
  return g >= 60 && g > r + 25 && b <= g + 20;
}

// "non black" = clearly brighter than the (3,7,17) night background.
export function isNonBlack(r, g, b) {
  return Math.max(r, g, b) > 30;
}

export function fractionIn(img, y0, y1, pred) {
  let hit = 0;
  let n = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < img.width; x++) {
      const i = (y * img.width + x) * img.bpp;
      if (pred(img.px[i], img.px[i + 1], img.px[i + 2])) hit++;
      n++;
    }
  }
  return n ? hit / n : 0;
}

export function loadCaptures() {
  const p = rootPath('evidence/captures.json');
  if (!fs.existsSync(p)) throw new Error('missing evidence/captures.json (run tools/shots.mjs with CHROME set)');
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  if (!data || !Array.isArray(data.captures)) throw new Error('captures.json has no "captures" array');
  return data;
}

export function capture(data, name) {
  const c = data.captures.find((x) => x && x.name === name);
  if (!c) throw new Error(`captures.json has no capture named "${name}"`);
  return c;
}
