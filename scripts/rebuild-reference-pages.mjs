#!/usr/bin/env node
/**
 * scripts/rebuild-reference-pages.mjs
 *
 * Phase 11 — the owner uploaded 5 newly-updated verified reference documents
 * directly into records-2/ (Master Index, Tracker CSV, and three
 * self-contained infographic HTML pages). Each of the 5 files carries a
 * 2-line upload-mechanism wrapper ("path: ...\ncontent: ...") plus a
 * trailing "\nencoding: utf-8\nhead: <hash>\n" footer that must be stripped
 * before the real content is usable.
 *
 * This script unwraps the three infographic HTML files and republishes them
 * as top-level site pages, re-skinned for public Beta 2.0 (no private-
 * workspace banner; footer/back-links match the rest of the site):
 *   - six-doctrinal-spines.html   <- "...Six Doctrinal Spines Infographic"
 *   - spines-timeline.html        <- "...Timeline of Six Spines"
 *   - corpus-architecture.html    <- "...Corpus Architecture Infographic" (NEW page)
 *
 * The Master Index / Tracker CSV are NOT rendered into their own pages
 * (established project convention — they're reference/data documents used
 * for cross-checking, not user-facing pages) but this script exposes
 * `unwrap()` so other scripts (e.g. a Tracker cross-check pass) can reuse
 * the same unwrapping logic.
 *
 * Run from the repository root: node scripts/rebuild-reference-pages.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RECORDS2_DIR = path.join(ROOT, 'records-2');

export function unwrap(raw) {
  const startMarker = '\ncontent: ';
  const startIdx = raw.indexOf(startMarker);
  const start = startIdx === -1 ? 0 : startIdx + startMarker.length;
  const endMarker = /\n\nencoding: utf-8\nhead: [0-9a-f]+\n?$/;
  const m = endMarker.exec(raw);
  const end = m ? m.index : raw.length;
  return raw.slice(start, end);
}

function footer(backLinks) {
  return `<footer class="site-footer" style="font-family:'Trebuchet MS','Lucida Sans',sans-serif;text-align:center;padding:32px 24px;color:#6b625a;">
  <p>${backLinks}</p>
  <p><em>A Living Topology of Transformation</em> · Public Beta 2.0 · Soli Deo Gloria</p>
</footer>

<script src="assets/records-data.js?v=20260903BETA2"></script>
</body>
</html>
`;
}

/** Replace the source infographic's own closing `</body>\n</html>` with our
 * re-skinned footer (back-links + Beta 2.0 line), leaving everything above
 * (the full hero/stats/style/script) untouched. */
function reskin(html, backLinks) {
  const idx = html.search(/<\/body>\s*<\/html>\s*$/i);
  const head = idx === -1 ? html : html.slice(0, idx);
  return head.replace(/\s*$/, '\n\n') + footer(backLinks);
}

function main() {
  const sixSpines = unwrap(fs.readFileSync(path.join(RECORDS2_DIR, 'PLAUD-Meditations-Six-Doctrinal-Spines-Infographic (1).html'), 'utf8'));
  const timeline = unwrap(fs.readFileSync(path.join(RECORDS2_DIR, 'PLAUD-Meditations-Timeline-of-Six-Spines (1).html'), 'utf8'));
  const architecture = unwrap(fs.readFileSync(path.join(RECORDS2_DIR, 'PLAUD-Meditations-Corpus-Architecture-Infographic.html'), 'utf8'));

  const sixSpinesOut = reskin(sixSpines,
    '<a class="jc-back-link" href="archive.html">&larr; Back to the Archive</a> &nbsp;·&nbsp; ' +
    '<a class="jc-back-link" href="spines-timeline.html">See the Timeline of Eight Tablets</a> &nbsp;·&nbsp; ' +
    '<a class="jc-back-link" href="corpus-architecture.html">See the Corpus Architecture</a>');
  fs.writeFileSync(path.join(ROOT, 'six-doctrinal-spines.html'), sixSpinesOut, 'utf8');

  const timelineOut = reskin(timeline,
    '<a class="jc-back-link" href="archive.html">&larr; Back to the Archive</a> &nbsp;·&nbsp; ' +
    '<a class="jc-back-link" href="six-doctrinal-spines.html">See the Eight Stone Tablets</a> &nbsp;·&nbsp; ' +
    '<a class="jc-back-link" href="corpus-architecture.html">See the Corpus Architecture</a>');
  fs.writeFileSync(path.join(ROOT, 'spines-timeline.html'), timelineOut, 'utf8');

  const architectureOut = reskin(architecture,
    '<a class="jc-back-link" href="archive.html">&larr; Back to the Archive</a> &nbsp;·&nbsp; ' +
    '<a class="jc-back-link" href="six-doctrinal-spines.html">See the Eight Stone Tablets</a> &nbsp;·&nbsp; ' +
    '<a class="jc-back-link" href="spines-timeline.html">See the Timeline of Eight Tablets</a>');
  fs.writeFileSync(path.join(ROOT, 'corpus-architecture.html'), architectureOut, 'utf8');

  console.log('Wrote six-doctrinal-spines.html (', sixSpinesOut.length, 'chars )');
  console.log('Wrote spines-timeline.html (', timelineOut.length, 'chars )');
  console.log('Wrote corpus-architecture.html (', architectureOut.length, 'chars ) — NEW page');
}

// Only run when invoked directly (`node scripts/rebuild-reference-pages.mjs`),
// not when another script imports `unwrap()` from this module.
if (process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1])) {
  main();
}
