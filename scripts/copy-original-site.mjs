// Copies the ORIGINAL island site into dist/ byte-for-byte after `vite build`:
// the map (index.html) and every original page/asset listed in original-site.txt.
// These files are never processed or rewritten by the build.
import { copyFileSync, readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const list = readFileSync(join(root, 'original-site.txt'), 'utf8').split('\n').map((s) => s.trim()).filter(Boolean);
let n = 0;
for (const f of list) {
  const src = join(root, f);
  if (!existsSync(src)) { console.warn(`missing original file: ${f}`); continue; }
  copyFileSync(src, join(root, 'dist', f));
  n++;
}
console.log(`copied ${n} original files into dist/`);
