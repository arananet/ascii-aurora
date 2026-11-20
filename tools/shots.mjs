// ASCII Aurora evidence captures (spec R10).
// Serves dist/ on a local port and captures the built page with playwright-core
// and the system Chrome named by the CHROME environment variable.
// Usage: npm run build && CHROME=/usr/bin/google-chrome node tools/shots.mjs
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import zlib from 'node:zlib';
import { chromium } from 'playwright-core';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const STILLS = path.join(ROOT, 'evidence', 'stills');
const CAPTURES_JSON = path.join(ROOT, 'evidence', 'captures.json');
const WARM_UP_MS = 4500;
const AURORA_RULE = 'g >= 60 && g > r + 25 && b <= g + 20';
const NON_BLACK_RULE = 'max(r, g, b) > 30';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
};

function fatal(message) {
  console.error(`shots: ${message}`);
  process.exit(1);
}

const chromePath = process.env.CHROME;
if (!chromePath) fatal('set CHROME to the system Chrome executable, for example CHROME=/usr/bin/google-chrome');
if (!fs.existsSync(path.join(DIST, 'index.html'))) fatal('dist/index.html missing; run npm run build first');

// Static server for dist/ only; paths are resolved and kept under dist/.
function serve() {
  const server = http.createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const rel = urlPath === '/' ? 'index.html' : urlPath.replace(/^\/+/, '');
    const file = path.resolve(DIST, rel);
    if (!file.startsWith(DIST + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404, { 'content-type': 'text/plain' });
      res.end('not found');
      return;
    }
    res.writeHead(200, { 'content-type': MIME[path.extname(file)] || 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

// Minimal PNG decoder (8 bit RGB or RGBA, non interlaced, as Chrome writes).
function decodePng(buf) {
  const width = buf.readUInt32BE(16);
  const height = buf.readUInt32BE(20);
  const colorType = buf[25];
  const bpp = colorType === 6 ? 4 : 3;
  if (buf[24] !== 8 || buf[28] !== 0 || (colorType !== 2 && colorType !== 6)) throw new Error('unsupported PNG format');
  const idat = [];
  for (let off = 8; off < buf.length;) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString('ascii', off + 4, off + 8);
    if (type === 'IDAT') idat.push(buf.subarray(off + 8, off + 8 + len));
    if (type === 'IEND') break;
    off += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * bpp;
  const px = Buffer.alloc(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = y * (stride + 1) + 1;
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0;
      const b = y > 0 ? px[(y - 1) * stride + x] : 0;
      const c = x >= bpp && y > 0 ? px[(y - 1) * stride + x - bpp] : 0;
      let v = raw[line + x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
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

function fraction(img, y0, y1, test) {
  let hit = 0;
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < img.width; x++) {
      const i = (y * img.width + x) * img.bpp;
      if (test(img.px[i], img.px[i + 1], img.px[i + 2])) hit++;
    }
  }
  return hit / ((y1 - y0) * img.width);
}

const isAurora = (r, g, b) => g >= 60 && g > r + 25 && b <= g + 20;
const isNonBlack = (r, g, b) => Math.max(r, g, b) > 30;

function round4(n) {
  return Math.round(n * 10000) / 10000;
}

async function readQa(page) {
  return page.evaluate(() => {
    const s = window.__asciiAurora;
    return {
      fps: s.fps,
      letters: s.letters,
      activity: s.activity,
      audioState: s.audioState,
      elapsedSeconds: s.elapsedSeconds,
    };
  });
}

async function capture(browser, url, spec) {
  const context = await browser.newContext({
    viewport: spec.viewport,
    deviceScaleFactor: 1,
    isMobile: Boolean(spec.mobile),
    hasTouch: Boolean(spec.mobile),
  });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(String(err)));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__asciiAurora && window.__asciiAurora.letters > 0);
  await page.waitForTimeout(WARM_UP_MS);

  const record = { name: spec.name, file: `evidence/stills/${spec.still}`, viewport: spec.viewport };
  if (spec.clickSound) {
    record.qaBeforeClick = await readQa(page);
    await page.click('#sound-toggle');
    await page.waitForTimeout(1500);
    record.soundLabel = await page.textContent('#sound-toggle');
  }
  const qa = [await readQa(page)];
  if (spec.samples > 1) {
    await page.waitForTimeout(1000);
    qa.push(await readQa(page));
  }

  record.title = await page.title();
  record.horizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
      || document.body.scrollWidth > window.innerWidth,
  );
  const buf = await page.screenshot({ path: path.join(STILLS, spec.still), fullPage: true });
  const img = decodePng(buf);
  const half = img.height >> 1;
  record.screenshotSize = { width: img.width, height: img.height };
  record.auroraFractionTop = round4(fraction(img, 0, half, isAurora));
  record.nonBlackFractionBottom = round4(fraction(img, half, img.height, isNonBlack));
  record.qa = qa;
  record.consoleErrors = consoleErrors;
  await context.close();
  return record;
}

const SPECS = [
  { name: 'desktop', still: 'page-desktop.png', viewport: { width: 1280, height: 800 }, samples: 2 },
  { name: 'mobile', still: 'page-mobile.png', viewport: { width: 390, height: 844 }, mobile: true, samples: 1 },
  { name: 'sound', still: 'page-sound.png', viewport: { width: 1280, height: 800 }, clickSound: true, samples: 1 },
];

fs.mkdirSync(STILLS, { recursive: true });
const server = await serve();
const url = `http://127.0.0.1:${server.address().port}/`;
let browser;
try {
  browser = await chromium.launch({ executablePath: chromePath, headless: true, args: ['--no-sandbox'] });
  const captures = [];
  for (const spec of SPECS) {
    const record = await capture(browser, url, spec);
    captures.push(record);
    console.log(`shots: ${record.file} aurora top ${record.auroraFractionTop} non black bottom ${record.nonBlackFractionBottom} overflow ${record.horizontalOverflow}`);
  }
  const out = {
    tool: 'tools/shots.mjs',
    browser: `${chromePath} (${browser.version()})`,
    takenAt: new Date().toISOString(),
    warmUpMs: WARM_UP_MS,
    rules: { auroraColourFamily: AURORA_RULE, nonBlack: NON_BLACK_RULE },
    captures,
  };
  fs.writeFileSync(CAPTURES_JSON, `${JSON.stringify(out, null, 2)}\n`);
  console.log(`shots: wrote ${path.relative(ROOT, CAPTURES_JSON)}`);
} catch (err) {
  console.error(`shots: capture failed: ${err && err.message ? err.message : err}`);
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  server.close();
}
