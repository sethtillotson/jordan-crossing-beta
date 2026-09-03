#!/usr/bin/env node
/**
 * scripts/rebuild-edges-from-lattice.mjs
 *
 * Phase 12 — cross-reference verification against the owner's "Corpus
 * Lattice" (Corpus Lattice.json / Corpus Lattice.csv), a newer, more
 * authoritative ground-truth dataset than the per-file appendix parsing
 * Phase 11 relied on. Every meditation/tablet has already been resolved to
 * a stable id (MED-NNNN / TAB-X) with explicit status flags (ok / external
 * / unresolved) on every cross-reference.
 *
 * Filename matching (schema v1.2+): every node and every cross-reference
 * target now carries a paired `archive_filename` (and `target_archive_
 * filename`) field — the filename exactly as shortened inside the zipped
 * corpus bundle (`PLAUD-Meditations-Corpus_2026-09-02.zip`), which is what
 * records-2/'s own filenames match byte-for-byte (records-2/ was extracted
 * from that same archive). This eliminates the fuzzy longest-common-prefix
 * matching earlier revisions of this script needed for schema v1.1, whose
 * `path`/`target_path` fields only carried each node's ORIGINAL un-
 * truncated vault filename (309 of 458 meditations differ from the
 * archive-shortened name, per the Lattice's own `filename_note`). This
 * revision matches purely on `archive_filename` <-> records-2/ filename
 * exact string equality — deterministic, zero heuristics, zero guessing.
 *
 * This script:
 *   1. Re-derives the records-2 filename -> JC_RECORDS id mapping using the
 *      exact same deterministic parsing (parseRawRecord/makeId, imported
 *      from build-records2-corpus.mjs, not re-implemented) that produced
 *      the currently-committed assets/records-data.js — then verifies that
 *      re-derivation is byte-for-byte identical to what's already there
 *      (a safety check: if it ever isn't, this script refuses to proceed
 *      rather than silently building edges against a stale id set).
 *   2. Loads Corpus Lattice.json, builds an archive_filename -> node lookup.
 *   3. For every JC_RECORDS entry, resolves its own Corpus Lattice node by
 *      exact archive_filename match, then resolves each `status: "ok"`
 *      cross-reference's target_archive_filename to a local record (Stone
 *      Tablet and external targets are informational only — not rendered
 *      as JC_EDGES; Stone Tablet linkage is already captured via each
 *      record's own `tabletAnchor` field).
 *   4. Reports (does not silently discard): every edge in the CURRENT
 *      JC_EDGES that has NO corresponding Corpus Lattice cross-reference
 *      (i.e. was fabricated or mis-resolved by the Phase 11 appendix
 *      parser), and every Corpus Lattice cross-reference NOT currently
 *      exposed as a JC_EDGES entry.
 *   5. Wholesale-replaces JC_EDGES with the Corpus-Lattice-verified set —
 *      this is the new authoritative source. JC_RECORDS and tabletAnchor
 *      are left untouched (those were already independently verified in
 *      Phase 11 from each file's own appendix and match well against the
 *      Lattice's own tablet metadata).
 *
 * Run from the repository root: node scripts/rebuild-edges-from-lattice.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RECORDS2_DIR, parseRawRecord, makeId, looksLikeBinaryGarbage } from './build-records2-corpus.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'assets', 'records-data.js');
const LATTICE_PATH = path.join(ROOT, 'Corpus Lattice.json');

function findArrayBounds(src, constName) {
  const startMarker = `const ${constName} = [`;
  const startIdx = src.indexOf(startMarker);
  if (startIdx === -1) throw new Error(`Could not find "const ${constName} = [" in records-data.js`);
  let depth = 0;
  let i = startIdx + startMarker.length - 1;
  let endIdx = -1;
  for (; i < src.length; i++) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') { depth--; if (depth === 0) { endIdx = i; break; } }
  }
  if (endIdx === -1) throw new Error(`Could not find the closing "]" for ${constName}`);
  return { startIdx, endIdx };
}
function loadArray(src, constName) {
  const { startIdx, endIdx } = findArrayBounds(src, constName);
  const arrayText = src.slice(startIdx + `const ${constName} = `.length, endIdx + 1);
  // eslint-disable-next-line no-eval
  return { value: eval(arrayText), startIdx, endIdx };
}
function replaceArray(src, constName, newValue) {
  const { startIdx, endIdx } = findArrayBounds(src, constName);
  const newArrayText = `const ${constName} = ` + JSON.stringify(newValue, null, 2);
  return src.slice(0, startIdx) + newArrayText + src.slice(endIdx + 1);
}

function main() {
  // 1. Re-derive filename -> id mapping exactly as build-records2-corpus.mjs
  //    does (steps 1-3 of its own main()), read-only, no writes.
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
  const filenameToId = new Map(entries.map(e => [e.name, e.id]));

  // 2. Safety check: this re-derivation MUST match the currently-committed
  //    JC_RECORDS id set exactly, or something upstream has changed and
  //    this script's edge-rebuild would be built on a stale mapping.
  const src0 = fs.readFileSync(DATA_PATH, 'utf8');
  const { value: jcRecords } = loadArray(src0, 'JC_RECORDS');
  const { value: jcThreads } = loadArray(src0, 'JC_THREADS');
  const committedIds = new Set(jcRecords.map(r => r.id));
  const rederivedIds = new Set(filenameToId.values());
  const missingFromRederived = [...committedIds].filter(id => !rederivedIds.has(id));
  const extraInRederived = [...rederivedIds].filter(id => !committedIds.has(id));
  if (missingFromRederived.length || extraInRederived.length) {
    console.error('SAFETY CHECK FAILED: re-derived id set does not match committed JC_RECORDS.');
    console.error('Missing from re-derivation:', missingFromRederived);
    console.error('Extra in re-derivation:', extraInRederived);
    process.exit(1);
  }
  console.log(`Safety check passed: re-derived ${rederivedIds.size} ids match committed JC_RECORDS exactly.`);

  // 3. Load Corpus Lattice. Build archive_filename -> node lookup (v1.2+
  //    schema: archive_filename is the exact filename as it appears inside
  //    the zip bundle that records-2/ was extracted from — no truncation
  //    mismatch, no fuzzy matching needed).
  const lattice = JSON.parse(fs.readFileSync(LATTICE_PATH, 'utf8'));
  if (!lattice.schema_version || parseFloat(lattice.schema_version) < 1.2) {
    console.error(`SAFETY CHECK FAILED: Corpus Lattice.json schema_version is "${lattice.schema_version}", expected >= 1.2 (the archive_filename fields this script depends on were introduced in 1.2).`);
    process.exit(1);
  }
  const archiveFilenameToNode = new Map();
  for (const node of Object.values(lattice.nodes)) {
    if (!node.archive_filename) continue;
    archiveFilenameToNode.set(node.archive_filename, node);
  }
  console.log(`Corpus Lattice: ${Object.keys(lattice.nodes).length} total nodes (${lattice.summary.meditations} meditations, ${lattice.summary.stone_tablets} stone tablets, ${lattice.summary.external_targets} external), schema v${lattice.schema_version}.`);

  // local record id -> its own Corpus Lattice node, resolved by exact
  // archive_filename match.
  const localIdToNode = new Map();
  let sourceMatched = 0, sourceNotMatched = 0;
  const unmatchedSourceSamples = [];
  for (const [filename, localId] of filenameToId) {
    const node = archiveFilenameToNode.get(filename);
    if (node) { localIdToNode.set(localId, node); sourceMatched += 1; }
    else { sourceNotMatched += 1; if (unmatchedSourceSamples.length < 10) unmatchedSourceSamples.push(filename); }
  }
  console.log(`Local records resolved to a Corpus Lattice node by exact archive_filename: ${sourceMatched} / ${filenameToId.size} (${sourceNotMatched} unresolved).`);
  if (unmatchedSourceSamples.length) console.log('  unmatched samples:', unmatchedSourceSamples);

  // 4. Build the new, Corpus-Lattice-verified edge set: meditation -> meditation
  //    only (Stone Tablet / external cross-references are informational,
  //    not rendered as JC_EDGES — Stone Tablet linkage already lives in
  //    each record's own tabletAnchor field).
  //
  //    Note: no per-edge `note` field is set here. Corpus Lattice gives no
  //    direction-independent descriptive text for a cross-reference beyond
  //    the target's own title (which the "Reviewed thread connections"
  //    link already displays) — an earlier version of this script set
  //    `note` to the target's title, which was directly redundant with the
  //    link for outgoing edges AND actively wrong for incoming edges
  //    (jcGetEdgesFor's `incoming` case shows the OTHER record's title as
  //    the link, but a from->to-fixed `note` field would then show the
  //    CURRENT record's own title, not the other record's — a real
  //    direction bug). design-v2-logic.js's initThreadConnections() now
  //    simply omits the note paragraph when `edge.note` is absent.
  const newEdges = [];
  const edgeKeys = new Set();
  let scanned = 0, resolvedMedToMed = 0, skippedNonMedTarget = 0, unresolvedTarget = 0;
  for (const [localId, node] of localIdToNode) {
    for (const cr of node.cross_references || []) {
      scanned += 1;
      if (cr.status !== 'ok') { unresolvedTarget += 1; continue; }
      if (!cr.target_archive_filename) { unresolvedTarget += 1; continue; }
      const targetLocalId = filenameToId.get(cr.target_archive_filename);
      if (!targetLocalId) { skippedNonMedTarget += 1; continue; } // Stone Tablet / external / genuinely-missing meditation
      if (targetLocalId === localId) continue; // self-link
      resolvedMedToMed += 1;
      const key = `${localId}->${targetLocalId}`;
      if (edgeKeys.has(key)) continue;
      edgeKeys.add(key);
      newEdges.push({
        from: localId,
        to: targetLocalId,
        type: 'continues',
        status: 'editorial',
        source: 'Verified against the corpus\'s own cross-reference record.',
      });
    }
  }
  console.log(`\nCross-references scanned across ${localIdToNode.size} local records: ${scanned}`);
  console.log(`  resolved to a real meditation-to-meditation edge: ${resolvedMedToMed}`);
  console.log(`  skipped (target is a Stone Tablet / external / not locally published): ${skippedNonMedTarget}`);
  console.log(`  unresolved in Corpus Lattice itself (status != ok): ${unresolvedTarget}`);
  console.log(`New Corpus-Lattice-verified edges (deduplicated): ${newEdges.length}`);

  // 5. Compare against the CURRENT (Phase 11, appendix-parsed) JC_EDGES.
  const { value: oldEdges } = loadArray(src0, 'JC_EDGES');
  const oldEdgeKeys = new Set(oldEdges.map(e => `${e.from}->${e.to}`));
  const newEdgeKeySet = new Set(newEdges.map(e => `${e.from}->${e.to}`));

  const inOldNotInLattice = oldEdges.filter(e => !newEdgeKeySet.has(`${e.from}->${e.to}`));
  const inLatticeNotInOld = newEdges.filter(e => !oldEdgeKeys.has(`${e.from}->${e.to}`));
  console.log(`\nEdges in the OLD (Phase 11 appendix-parsed) set with NO backing in Corpus Lattice: ${inOldNotInLattice.length} / ${oldEdges.length}`);
  console.log(`Edges in Corpus Lattice not previously exposed in the OLD set: ${inLatticeNotInOld.length} / ${newEdges.length}`);

  // 6. Report (do NOT modify) how well the named JC_THREADS sequences are
  //    backed by the new Corpus-Lattice-verified edge set. IMPORTANT: a
  //    named thread (Zechariah 3 / Samuel Loop / Murmuration / Descent) is
  //    a hand-curated THEMATIC narrative across the whole corpus, built
  //    from the (now-superseded) Corpus Map's own §10 — it was never
  //    claimed to be a literal chain of explicit per-file cross-references,
  //    and JC_EDGES has never backed it 1:1 (see records-data.js's own
  //    header comment and plan.md's Phase 2/10 notes: JC_THREADS was
  //    explicitly NOT re-verified against JC_EDGES in Phase 10, by design).
  //    A first attempt at this script tried filtering thread membership by
  //    requiring a direct Corpus-Lattice edge between same-thread steps —
  //    that emptied the "murmuration" thread to 0 steps and gutted the
  //    others (25 -> 10 total), which is real evidence the *test* is wrong
  //    for this kind of data, not evidence the thread members themselves
  //    are stale. So this script only REPORTS coverage; it does not alter
  //    JC_THREADS. A human (or a future thread-specific verification pass
  //    against Corpus Lattice's own theme/date data) should decide whether
  //    any individual step needs manual review.
  const connectedPairs = new Set();
  for (const e of newEdges) {
    connectedPairs.add(`${e.from}|${e.to}`);
    connectedPairs.add(`${e.to}|${e.from}`);
  }
  console.log('\nJC_THREADS coverage report (informational only — NOT modified):');
  for (const t of jcThreads) {
    const connectedCount = t.sequence.filter(stepId =>
      t.sequence.some(otherId => otherId !== stepId && connectedPairs.has(`${stepId}|${otherId}`))
    ).length;
    console.log(`  "${t.id}": ${connectedCount}/${t.sequence.length} steps have a direct Corpus-Lattice-verified edge to another step in this thread (this is informational, not a defect — see comment above).`);
  }

  // 7. Write everything back — JC_RECORDS and JC_THREADS untouched, only
  //    JC_EDGES replaced.
  let out = src0;
  out = replaceArray(out, 'JC_EDGES', newEdges);
  out = out.replace(/Last updated: [^\n]+/, `Last updated: ${new Date().toISOString()} (JC_EDGES rebuilt by scripts/rebuild-edges-from-lattice.mjs — Phase 12 Corpus Lattice verification)`);
  fs.writeFileSync(DATA_PATH, out, 'utf8');
  console.log(`\nWrote assets/records-data.js: ${jcRecords.length} records (unchanged), ${newEdges.length} edges (Corpus-Lattice-verified), ${jcThreads.length} threads (unchanged — see coverage report above).`);
}

main();
