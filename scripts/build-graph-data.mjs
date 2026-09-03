#!/usr/bin/env node
/**
 * scripts/build-graph-data.mjs
 *
 * Phase 16b — resolves each graph_data.json node to a real local page on
 * this site (a records-2-derived meditation record, or a Stone Tablet
 * reader page) so the fractal graph page can link "Open this record"
 * instead of the source design doc's memo:/ vault URL, which has no
 * meaning outside the owner's personal Obsidian vault.
 *
 * This script does NOT recompute or alter any of the pre-baked graph
 * metrics (bc, degree, diversivity, community, radius, weight, width,
 * opacity, ebc, bridge) — every field from graph-data/graph_data.json is
 * copied through verbatim. It only adds two new per-node fields:
 *
 *   localId   — this site's own record/tablet id, when resolvable
 *   localHref — a relative href into records/ or the Stone Tablet pages,
 *               when resolvable
 *
 * Both are simply omitted (never fabricated or guessed) when a node
 * can't be confidently resolved — e.g. every "external" node (the
 * owner's private tracker/index files, meaningless on a public site) and
 * any meditation that isn't part of the 456 currently-published records.
 *
 * Resolution paths:
 *   - type: "meditation" — graph node's own `filename` (the ORIGINAL,
 *     un-shortened vault filename) is looked up in Corpus Lattice.json by
 *     its own `filename` field (schema v1.2+, paired with
 *     `archive_filename`), then archive_filename is matched against
 *     records-2/'s own filenames (records-2/ was extracted from the same
 *     shortened-name zip bundle) using the exact same parseRawRecord/
 *     makeId logic that produced the currently-committed
 *     assets/records-data.js (imported, not re-implemented).
 *   - type: "stone_tablet" — graph node's own `filename` is matched
 *     directly against the `source` field of build-stone-tablet-pages.mjs's
 *     exported TABLETS/AUDIT constants (both already-verified against
 *     records-2/ and Corpus Lattice by that script).
 *   - type: "external" — never resolved (not part of the public site).
 *
 * Run from the repository root: node scripts/build-graph-data.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RECORDS2_DIR, parseRawRecord, makeId, looksLikeBinaryGarbage } from './build-records2-corpus.mjs';
import { TABLETS, AUDIT } from './build-stone-tablet-pages.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const GRAPH_DATA_PATH = path.join(ROOT, 'graph-data', 'graph_data.json');
const LATTICE_PATH = path.join(ROOT, 'Corpus Lattice.json');
const OUT_PATH = path.join(ROOT, 'assets', 'graph-data.js');

function main() {
  const graphData = JSON.parse(fs.readFileSync(GRAPH_DATA_PATH, 'utf8'));
  console.log(`graph_data.json: ${graphData.nodes.length} nodes, ${graphData.edges.length} edges, ${graphData.communities.length} communities, schema v${graphData.stats.schema_version}.`);
  if (graphData.stats.n_nodes !== graphData.nodes.length || graphData.stats.n_edges !== graphData.edges.length || graphData.stats.n_communities !== graphData.communities.length) {
    console.error('SAFETY CHECK FAILED: graph_data.json stats block does not match its own nodes/edges/communities arrays — refusing to proceed against a possibly-corrupted file.');
    process.exit(1);
  }

  // 1. Re-derive records-2 filename -> local record id, exactly as
  //    build-records2-corpus.mjs does (read-only, no writes) — same
  //    technique used by rebuild-edges-from-lattice.mjs.
  const allMd = fs.readdirSync(RECORDS2_DIR).filter(f => f.endsWith('.md'));
  const stoneTabletNames = allMd.filter(f => /^Stone Tablet/i.test(f));
  const nonMeditationNames = new Set([
    ...stoneTabletNames,
    ...allMd.filter(f => /master-index/i.test(f)),
  ]);
  const meditationFileNames = allMd.filter(f => !nonMeditationNames.has(f));
  const parsedByName = new Map();
  for (const name of meditationFileNames) {
    const fullPath = path.join(RECORDS2_DIR, name);
    const buf = fs.readFileSync(fullPath);
    if (looksLikeBinaryGarbage(buf)) continue;
    const parsed = parseRawRecord(fullPath);
    if (!parsed.isMeditation) continue;
    parsedByName.set(name, parsed);
  }
  const usedIds = new Set();
  const entries = [...parsedByName.entries()].map(([name, p]) => ({ name, ...p }));
  entries.sort((a, b) => {
    const ak = a.recordedDate ? a.recordedDate.iso : '9999';
    const bk = b.recordedDate ? b.recordedDate.iso : '9999';
    return ak < bk ? -1 : ak > bk ? 1 : 0;
  });
  for (const e of entries) {
    const dateKey = e.recordedDate ? e.recordedDate.key : null;
    e.id = makeId(dateKey, e.title, usedIds);
  }
  const archiveFilenameToLocal = new Map(entries.map(e => [e.name, { id: e.id, href: `records/${e.id}-v2.html` }]));

  // 2. Corpus Lattice: original `filename` -> archive_filename, so we can
  //    join graph_data.json's own `filename` (also the ORIGINAL, per the
  //    Lattice's filename_note) to a local record.
  const lattice = JSON.parse(fs.readFileSync(LATTICE_PATH, 'utf8'));
  const filenameToArchiveFilename = new Map();
  for (const node of Object.values(lattice.nodes || {})) {
    if (node.filename && node.archive_filename) filenameToArchiveFilename.set(node.filename, node.archive_filename);
  }

  // 3. Stone Tablets: build-stone-tablet-pages.mjs's own source-filename ->
  //    id/href map (already verified against records-2/ by that script).
  const stoneTabletFilenameToLocal = new Map();
  for (const t of [...TABLETS, AUDIT]) {
    // build-stone-tablet-pages.mjs writes every tablet page into records/
    // (its own RECORDS_DIR, not exported) — its own `output` field is a bare
    // filename, so the href here must be built the same way this site's
    // record pages are: relative to the repo root, i.e. records/<output>.
    stoneTabletFilenameToLocal.set(t.source, { id: t.id, href: `records/${t.output}` });
  }

  // 4. Resolve every node.
  let resolvedMeditations = 0, unresolvedMeditations = 0, resolvedTablets = 0, unresolvedTablets = 0;
  const unresolvedSamples = [];
  const resolvedNodes = graphData.nodes.map(node => {
    let local = null;
    if (node.type === 'meditation') {
      const archiveFilename = filenameToArchiveFilename.get(node.filename);
      local = archiveFilename ? archiveFilenameToLocal.get(archiveFilename) : null;
      if (local) resolvedMeditations += 1;
      else { unresolvedMeditations += 1; if (unresolvedSamples.length < 10) unresolvedSamples.push(node.filename); }
    } else if (node.type === 'stone_tablet') {
      local = stoneTabletFilenameToLocal.get(node.filename) || null;
      if (local) resolvedTablets += 1; else unresolvedTablets += 1;
    }
    if (!local) return node;
    return { ...node, localId: local.id, localHref: local.href };
  });

  console.log(`Meditations resolved to a local record page: ${resolvedMeditations} / ${resolvedMeditations + unresolvedMeditations} (${unresolvedMeditations} not part of the published 456 — omitted, not fabricated).`);
  if (unresolvedSamples.length) console.log('  unresolved samples:', unresolvedSamples);
  console.log(`Stone Tablets resolved to a local reader page: ${resolvedTablets} / ${resolvedTablets + unresolvedTablets}.`);

  const out = { ...graphData, nodes: resolvedNodes };
  const banner = `/**\n * Jordan Crossing — Fractal Corpus Map data\n *\n * Generated ${new Date().toISOString()} by scripts/build-graph-data.mjs\n * (Phase 16b) from graph-data/graph_data.json (${graphData.generator || 'build_graph_data.py'}, schema v${graphData.stats.schema_version}).\n * Every metric field (bc, degree, diversivity, community, radius, weight,\n * width, opacity, ebc, bridge) is copied through verbatim, never\n * recomputed here or in the browser. Only \`localId\`/\`localHref\` are added,\n * and only when a node could be confidently resolved to a real page on\n * this site — see this script's own header comment for the resolution\n * paths. Do not hand-edit; re-run the generator instead.\n */\n`;
  // Assigned as an explicit window property (not `const GRAPH_DATA = …`)
  // so it's reliably readable from graph-logic.js, which loads as an ES
  // module (`<script type="module">`) — a top-level `const` in a classic
  // script does not become a `window` property, only a same-realm lexical
  // binding, which is a subtler guarantee than an explicit global.
  fs.writeFileSync(OUT_PATH, `${banner}window.GRAPH_DATA = ${JSON.stringify(out, null, 2)};\n`, 'utf8');
  console.log(`Wrote ${OUT_PATH}`);
}

if (process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1])) {
  main();
}
