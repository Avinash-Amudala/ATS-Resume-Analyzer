/**
 * Post-build script: Fix standalone build for pdfjs-dist
 *
 * Next.js standalone output traces only statically imported files.
 * pdfjs-dist uses dynamic import() to load its worker module (pdf.worker.mjs),
 * which gets missed during tracing. This script copies the missing files
 * into the standalone build so the app works correctly on the VPS.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const STANDALONE = path.join(ROOT, '.next', 'standalone');
const SRC_DIR = path.join(ROOT, 'node_modules', 'pdfjs-dist', 'legacy', 'build');
const DST_DIR = path.join(STANDALONE, 'node_modules', 'pdfjs-dist', 'legacy', 'build');

const FILES_TO_COPY = [
  'pdf.worker.mjs',
  'pdf.worker.mjs.map',
  'pdf.worker.min.mjs',
  'pdf.sandbox.mjs',
  'pdf.sandbox.mjs.map',
  'pdf.sandbox.min.mjs',
];

console.log('[fix-standalone] Copying missing pdfjs-dist files to standalone build...');

// Ensure destination directory exists
if (!fs.existsSync(DST_DIR)) {
  fs.mkdirSync(DST_DIR, { recursive: true });
  console.log(`[fix-standalone] Created directory: ${DST_DIR}`);
}

let copied = 0;
for (const file of FILES_TO_COPY) {
  const src = path.join(SRC_DIR, file);
  const dst = path.join(DST_DIR, file);

  if (!fs.existsSync(src)) {
    console.log(`[fix-standalone] Skipping ${file} (not found in node_modules)`);
    continue;
  }

  if (fs.existsSync(dst)) {
    console.log(`[fix-standalone] ${file} already exists, skipping`);
    continue;
  }

  fs.copyFileSync(src, dst);
  const sizeMB = (fs.statSync(dst).size / 1024 / 1024).toFixed(2);
  console.log(`[fix-standalone] Copied ${file} (${sizeMB} MB)`);
  copied++;
}

// Also copy start.js into standalone directory
const startSrc = path.join(ROOT, 'start.js');
const startDst = path.join(STANDALONE, 'start.js');
if (fs.existsSync(startSrc)) {
  fs.copyFileSync(startSrc, startDst);
  console.log('[fix-standalone] Copied start.js to standalone');
}

console.log(`[fix-standalone] Done! Copied ${copied} file(s).`);
