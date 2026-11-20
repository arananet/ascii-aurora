// Assemble dist/ from index.html and assets/, then print the dist size.
// Plain node, no dependencies. dist/ is a static site deployable as is.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const SOURCES = ['index.html', 'assets'];

function dirBytes(dir) {
  let total = 0;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) total += dirBytes(p);
    else if (ent.isFile()) total += fs.statSync(p).size;
  }
  return total;
}

for (const rel of SOURCES) {
  if (!fs.existsSync(path.join(ROOT, rel))) {
    console.error(`build: missing source ${rel}`);
    process.exit(1);
  }
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
for (const rel of SOURCES) {
  fs.cpSync(path.join(ROOT, rel), path.join(DIST, rel), { recursive: true });
}

console.log(`dist size: ${dirBytes(DIST)} bytes`);
