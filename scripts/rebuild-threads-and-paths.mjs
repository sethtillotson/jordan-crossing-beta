#!/usr/bin/env node
/**
 * scripts/rebuild-threads-and-paths.mjs
 *
 * Phase 13 — replaces the stale, pre-records-2 `JC_THREADS` (4 hand-picked
 * threads) and `assets/corpus-paths-data.js` (6 hand-picked reading paths,
 * several with external "genspark.ai/second-brain" links) with data
 * transcribed directly from the owner's own corpus map documents:
 *   - "Corpus Map — How These Documents Read Each Other.md" (§8)
 *   - "PLAUD Meditations Corpus Map — How the Meditations Read Each Other.md" (§10, §13)
 *
 * SCOPE (owner-approved): only Threads 1-10 from the corpus map (each has an
 * explicit tablet-section anchor and named hinge meditations). Threads 11-13
 * (Kingdom-Business Arc, Marketplace as Priestly Altar, Consecration of AI)
 * are large density-pattern threads described only by example anchors, not a
 * full membership list — deferred rather than algorithmically expanded, to
 * avoid repeating the earlier hallucinated-cross-reference mistake.
 *
 * METHOD — no guessing, deterministic filename chain:
 *   1. Every THREAD_SPECS/PATH_SPECS member below carries a `memoBasename`
 *      — the exact filename transcribed verbatim from that member's own
 *      `memo:/Personal Space/memo/...` link in the corpus map text. Members
 *      described only in prose with NO linked filename (e.g. Thread 4's "May
 *      16 · 21:52" movement-doctrine note, Thread 5's "May 10 · through
 *      Apostle Orokpo" vocational counterpart) are NOT included — a thread
 *      or path only uses members the corpus map itself hyperlinks.
 *   2. `memoBasename` -> Corpus Lattice node, matched by exact basename of
 *      the node's own `path` field (schema v1.2). The Corpus Lattice's
 *      `path` field is independently confirmed (Phase 12) to preserve each
 *      meditation's ORIGINAL vault filename verbatim — the same filename
 *      format the corpus map's own memo links use — so this match is exact,
 *      not fuzzy.
 *   3. Corpus Lattice node -> local records-2 record, via the node's own
 *      `archive_filename` field matched against the same records-2
 *      filename -> id mapping `rebuild-edges-from-lattice.mjs` re-derives
 *      (imported from build-records2-corpus.mjs, not re-implemented).
 *   4. Any memoBasename that fails to resolve at either step is reported
 *      and the member is DROPPED (never guessed via date or title fuzz).
 *   A thread/path that ends up with fewer than 2 resolved steps is dropped
 *   entirely (a "thread" of 1 has nothing to connect) and reported.
 *
 * Two reading paths ("Mar 28 sermon-day sextet", "Jul 10 exousia cascade")
 * are resolved by DATE-FILTERING JC_RECORDS wholesale (every record on that
 * date, sorted by time) rather than by naming individual files — the corpus
 * map explicitly names these as "the whole day" via a folder link, not an
 * itemized list of files.
 *
 * Run from the repository root: node scripts/rebuild-threads-and-paths.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { RECORDS2_DIR, parseRawRecord, makeId, looksLikeBinaryGarbage } from './build-records2-corpus.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RECORDS_DATA_PATH = path.join(ROOT, 'assets', 'records-data.js');
const PATHS_DATA_PATH = path.join(ROOT, 'assets', 'corpus-paths-data.js');
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

/**
 * Re-derive the records-2 filename -> JC_RECORDS id mapping exactly as
 * build-records2-corpus.mjs / rebuild-edges-from-lattice.mjs do (read-only,
 * no writes), then hard-verify it matches the currently-committed
 * JC_RECORDS id set before trusting it for resolution.
 */
function deriveFilenameToId(committedIds) {
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
  return filenameToId;
}

/** basename of a Lattice node's `path` (original vault path). */
function basenameOf(p) {
  if (!p) return null;
  const parts = p.split('/');
  return parts[parts.length - 1];
}

/**
 * Resolve one memoBasename to a local record id via:
 *   memoBasename -> Corpus Lattice node (match on basename(node.path))
 *   -> node.archive_filename -> records-2 filename -> local id
 */
function resolveMemoBasename(memoBasename, basenameToNode, filenameToId, label) {
  const node = basenameToNode.get(memoBasename);
  if (!node) {
    console.log(`  UNRESOLVED (no Corpus Lattice node with this path basename): ${label} — "${memoBasename}"`);
    return null;
  }
  if (!node.archive_filename) {
    console.log(`  UNRESOLVED (Lattice node ${node.id} has no archive_filename): ${label} — "${memoBasename}"`);
    return null;
  }
  const localId = filenameToId.get(node.archive_filename);
  if (!localId) {
    console.log(`  UNRESOLVED (Lattice node ${node.id}'s archive_filename "${node.archive_filename}" not found in records-2): ${label} — "${memoBasename}"`);
    return null;
  }
  return localId;
}

// ═══════════════════════════════════════════════════════════════════════
// THREAD SPECS — every member is a `memoBasename` transcribed verbatim from
// the corpus map's own `memo:` link for that meditation (PLAUD Meditations
// Corpus Map §10). Members named only in prose, with no linked filename
// given, are omitted (not guessed at) — see header. Only Threads 1,2,4,7,8,
// 9,10 end up with >=2 linked members; Threads 3, 5, 6 do not and are
// skipped (reported below).
// ═══════════════════════════════════════════════════════════════════════
const THREAD_SPECS = [
  {
    id: 'zechariah-3-loop',
    name: 'The Zechariah 3 Loop — filthy garments removed, replaced, given away',
    description: 'The oldest load-bearing thread: received before the corpus began, measured through the Kairos Window, named explicitly in June, and finally given away at the three-brother table. Tablet anchor: Tablet V §III.6 "Filthy Garments Removed, Priestly Dignity Given."',
    members: [
      '03-31 Personal Meditation_ Standing Still While Heaven Clothes You-Summary.md',
      '04-12 at 09_26 — Call Reflection_ Intercession, Heavenly Courtroom, and False Identity Garments-Public Spoken Word — PLAUD Note Prompt.md',
      '08-17 at 19_05 — The Name the Darkness Could Not Speak, and the Servant Who Learned to Wait-Meditation.md',
      '08-30 Bible Study Reflection_ Filthy Garments and the Finished Work-Speakly_meditation.md',
    ],
  },
  {
    id: 'samuel-loop',
    name: 'The Samuel Loop — the carried, quietly learning to carry',
    description: "Opens with Holy Spirit compulsion and covenant prayer, moves through grief and the breaking point, gathers Samuel's own testimony, reaches the Aug 17 seam that gave Stone Tablet VI its origin, and is answered Sep 1. Tablet anchors: Tablet II Part III · Tablet V §IV.9.",
    members: [
      '04-25 03_47 Call Reflection_ Spiritual Weariness, Discouragement, and Renewal-Public Spoken Word — PLAUD Note Prompt.md',
      '05-15 Personal Reflection_ Intercession for Peter and Spiritual Discernment-Public Spoken Word — PLAUD Note Prompt.md',
      "06-29 Personal Meditation_ Intercessory Prayer, Prevenient Grace, and God's Sovereign Pursuit of a Prodigal-Public Spoken Word — PLAUD Note Prompt.md",
      '08-17 at 19_05 — The Name the Darkness Could Not Speak, and the Servant Who Learned to Wait-Meditation.md',
      '09-01 at 07_54 — The Blessing of the Cave_ Why God Keeps You Off the Celebration Table-Meditation.md',
    ],
  },
  {
    id: 'mantle-sequence',
    name: 'The Mantle Sequence — the calling itself',
    description: 'Named as season in April, formalized in May: "the mantle does not rest; it moves." Tablet anchors: Tablet II Part II · Tablet V §V.8 "The Mantle Descends in the Ordinary."',
    members: [
      '04-27 at 17_57 — Corpus Topology, Mantle-Throwing Season, and Covenantal Witness-Public Spoken Word — PLAUD Note Prompt.md',
      '05-15 Personal Reflection_ Intercession for Peter and Spiritual Discernment-Public Spoken Word — PLAUD Note Prompt.md',
    ],
  },
  {
    id: 'murmuration',
    name: 'The Murmuration — the maskîlîm are plural',
    description: 'The corpus discovers it was never a solo witness — named by Seth in his own voice and developed into vessel-doctrine. Tablet anchors: Tablet V §II.4 · Tablet III Part VI "The Maskîlîm Are Plural."',
    members: [
      "06-07 Corpus Reflection_ Sister Katie's Covenantal Co-Witness, Kenosis, and the Plural Prophetic Archive-Public Spoken Word — PLAUD Note Prompt.md",
      '08-31 at 11_23 — The Vessel Must Serve the Witness-Meditation.md',
    ],
  },
  {
    id: 'exousia-dunamis',
    name: 'The Exousia / Dunamis Distinction — legal right, not raw power',
    description: 'First canonical distinction, walked in deliverance, tested at the seam. Tablet anchor: Tablet V Part V title · Tablet V refrain "Legal right, not raw power."',
    members: [
      '07-09 Teaching Reflection_ Exousia vs. Dunamis — Authority, Spiritual Warfare, and the Covenant Verdict-Public Spoken Word — PLAUD Note Prompt.md',
      '07-10 at 21_30 — When the Heavens Moved_ Intercession, Demonic Deliverance, and the Legality of the Kingdom-Public Spoken Word — PLAUD Note Prompt.md',
      '08-17 at 19_05 — The Name the Darkness Could Not Speak, and the Servant Who Learned to Wait-Meditation.md',
    ],
  },
  {
    id: 'sacred-ordinary',
    name: 'The Sacred Ordinary — holiness in the kitchen, the phone call, the parking lot',
    description: 'Earliest canonical statement, developed, and finally sacramental. Tablet anchors: Tablet II Part V · Tablet V Part VI · refrain "the sacrament of small things."',
    members: [
      "03-27 Spiritual Reflection_ Recognizing God's Work in Unlikely Transformation-Summary.md",
      '06-22 at 20_30 — The Anatomy of a Commissioned Life_ Awareness, Burial, and the Sacred Ordinary-Public Spoken Word — PLAUD Note Prompt.md',
      // NOTE: the corpus map's own memo link names this file "...The Sacrament
      // of Small Things in Everyday Marriage-Public Spoken Word...", but the
      // real file (verified against both records-2/ and Corpus Lattice) is
      // "...The Sacrament of Small Things-Public Spoken Word..." (no "in
      // Everyday Marriage" suffix) — the corpus map's link text has drifted
      // from the actual filename. Using the Lattice/records-2-verified name.
      '07-28 at 22_31 — The Sacrament of Small Things-Public Spoken Word — PLAUD Note Prompt.md',
    ],
  },
  {
    id: 'descent-into-hiddenness',
    name: 'The Descent Into Hiddenness — the arc bends downward',
    description: 'Root, named, and walked in the Sep 1 "preservation over platform" answer. Tablet anchors: Tablet V Part III "Brought Low, Reclothed, Sent" · Tablet II Seven Things #5.',
    members: [
      '03-13 Personal Meditation_ Faithfulness in Obscurity and Divine Preparation-Summary.md',
      '05-18 Call Reflection_ Gifting, Identity, and the Architecture of a Redeemed Mind-Public Spoken Word — PLAUD Note Prompt.md',
      '09-01 at 07_54 — The Blessing of the Cave_ Why God Keeps You Off the Celebration Table-Meditation.md',
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════
// READING PATH SPECS — transcribed from PLAUD Meditations Corpus Map §13.
// Note: a "doctrinal spine in six meditations" path existed in the OLD
// (pre-records-2) corpus-paths-data.js, sourced from an EARLIER version of
// the corpus map that is not among the documents currently supplied — the
// current §13 has no such heading, so it is NOT reconstructed here (would
// be an invention, not a transcription). Only paths with an explicit §13
// heading and either named linked files or an explicit "read the whole day"
// folder reference are included.
// ═══════════════════════════════════════════════════════════════════════
const PATH_SPECS = [
  {
    id: 'samuel-loop-end-to-end',
    title: 'The Samuel Loop, start to close',
    depthLabel: 'A full passage',
    estimate: 'Six meditations · Apr 25 – Sep 1',
    description: "The carried, quietly learning to carry. Opens with spiritual weariness; closes when the loop is answered at the Blessing of the Cave.",
    source: 'PLAUD Meditations Corpus Map §13: "If you want to trace the Samuel Loop end-to-end."',
    tags: ['narrative', 'spiritual-journey', 'long'],
    kind: 'explicit',
    members: [
      { memoBasename: '04-25 03_47 Call Reflection_ Spiritual Weariness, Discouragement, and Renewal-Public Spoken Word — PLAUD Note Prompt.md', note: 'The Loop opens.' },
      { memoBasename: "05-01 Call Reflection_ Divine Encounter — Samuel's Breaking Point and Spiritual Transformation-Public Spoken Word — PLAUD Note Prompt.md", note: 'The breaking-point convergence.' },
      { memoBasename: '05-15 Personal Reflection_ Intercession for Peter and Spiritual Discernment-Public Spoken Word — PLAUD Note Prompt.md', note: 'The mantle-throwing season opens.' },
      { memoBasename: "06-29 Personal Meditation_ Intercessory Prayer, Prevenient Grace, and God's Sovereign Pursuit of a Prodigal-Public Spoken Word — PLAUD Note Prompt.md", note: 'Prevenient grace is named.' },
      { memoBasename: '08-17 at 19_05 — The Name the Darkness Could Not Speak, and the Servant Who Learned to Wait-Meditation.md', note: 'The 85-minute call — the seam Tablet VI is built from.' },
      { memoBasename: '09-01 at 07_54 — The Blessing of the Cave_ Why God Keeps You Off the Celebration Table-Meditation.md', note: 'The Loop is answered.' },
    ],
  },
  {
    id: 'zechariah-3-walk',
    title: 'Walk the Zechariah 3 thread',
    depthLabel: 'A single stone (start) or short crossing (whole thread)',
    estimate: 'Four meditations · Mar 31 – Aug 30',
    description: 'Filthy garments removed, replaced, given away — the oldest of the load-bearing threads.',
    source: 'PLAUD Meditations Corpus Map §13: "If you want to walk one thread."',
    tags: ['symbolic', 'transformational', 'medium'],
    kind: 'explicit',
    members: [
      { memoBasename: '03-31 Personal Meditation_ Standing Still While Heaven Clothes You-Summary.md', note: 'The loop opens.' },
      { memoBasename: '04-12 at 09_26 — Call Reflection_ Intercession, Heavenly Courtroom, and False Identity Garments-Public Spoken Word — PLAUD Note Prompt.md', note: 'Forensic language received.' },
      { memoBasename: '08-17 at 19_05 — The Name the Darkness Could Not Speak, and the Servant Who Learned to Wait-Meditation.md', note: 'Tested at the seam.' },
      { memoBasename: '08-30 Bible Study Reflection_ Filthy Garments and the Finished Work-Speakly_meditation.md', note: 'Given away at the three-brother table.' },
    ],
  },
  {
    id: 'apr-11-14-merged-week',
    title: 'Read one week — the closing week of the Kairos',
    depthLabel: 'A single stone',
    estimate: 'One document, fourfold',
    description: "The corpus's most-integrated single document — the closing week of the Kairos Window gathered into one fourfold witness: formation, vigilance, encounter, the gap.",
    source: 'PLAUD Meditations Corpus Map §13: "If you want to read one week."',
    tags: ['contemplative', 'short'],
    kind: 'explicit',
    members: [
      { memoBasename: '04-11 to 04-14 MERGED — The Road, the River, the Robbery, and the Recording_ A Fourfold Meditation on Formation, Vigilance, Encounter, and the Gap-Public Spoken Word — PLAUD Note Prompt.md', note: "The Kairos Window's closing week, gathered into one witness." },
    ],
  },
  {
    id: 'mar-28-sermon-day',
    title: 'Read one day — the Mar 28 sermon-day sextet',
    depthLabel: 'A single day',
    estimate: 'Six sermon-responses in twelve hours',
    description: "The corpus's richest single-day thread — six sermon-responses laying doctrinal foundation in twelve hours.",
    source: 'PLAUD Meditations Corpus Map §13: "If you want to read one day."',
    tags: ['doctrinal', 'short'],
    kind: 'date-filter',
    dateKey: '03-28',
  },
  {
    id: 'jul-10-exousia-cascade',
    title: 'Read one day — the Jul 10 exousia cascade',
    depthLabel: 'A single day',
    estimate: 'A six-file day walking authority-doctrine',
    description: 'The exousia/dunamis authority doctrine walked out in deliverance across a single day.',
    source: 'PLAUD Meditations Corpus Map §13: "If you want to read one day."',
    tags: ['doctrinal', 'narrative', 'short'],
    kind: 'date-filter',
    dateKey: '07-10',
  },
];

function main() {
  const recordsSrc = fs.readFileSync(RECORDS_DATA_PATH, 'utf8');
  const { value: jcRecords } = loadArray(recordsSrc, 'JC_RECORDS');
  console.log(`Loaded ${jcRecords.length} JC_RECORDS.`);

  const committedIds = new Set(jcRecords.map(r => r.id));
  const filenameToId = deriveFilenameToId(committedIds);

  // Corpus Lattice: node lookup by basename(node.path) — the original
  // vault filename, matching the corpus map's own memo-link filenames.
  const lattice = JSON.parse(fs.readFileSync(LATTICE_PATH, 'utf8'));
  if (!lattice.schema_version || parseFloat(lattice.schema_version) < 1.2) {
    console.error(`SAFETY CHECK FAILED: Corpus Lattice.json schema_version is "${lattice.schema_version}", expected >= 1.2.`);
    process.exit(1);
  }
  const basenameToNode = new Map();
  for (const node of Object.values(lattice.nodes)) {
    const bn = basenameOf(node.path);
    if (bn) basenameToNode.set(bn, node);
  }
  console.log(`Corpus Lattice: ${Object.keys(lattice.nodes).length} nodes indexed by path basename.`);

  const recordsById = new Map(jcRecords.map(r => [r.id, r]));
  const recordsByDate = new Map();
  for (const r of jcRecords) {
    const dateKey = r.id.slice(0, 5); // "MM-DD" prefix, per makeId()
    if (!/^\d{2}-\d{2}$/.test(dateKey)) continue;
    if (!recordsByDate.has(dateKey)) recordsByDate.set(dateKey, []);
    recordsByDate.get(dateKey).push(r);
  }

  // ─── Resolve threads ───────────────────────────────────────────────
  console.log('\n=== Resolving threads (1-10 scope; only threads with >=2 explicitly-linked members survive) ===');
  const newThreads = [];
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];
  for (const spec of THREAD_SPECS) {
    console.log(`\nThread "${spec.id}":`);
    const sequence = [];
    for (const memoBasename of spec.members) {
      const localId = resolveMemoBasename(memoBasename, basenameToNode, filenameToId, spec.id);
      if (localId) {
        if (!sequence.includes(localId)) sequence.push(localId);
        console.log(`  resolved -> ${localId} ("${recordsById.get(localId).title}")`);
      }
    }
    if (sequence.length < 2) {
      console.log(`  DROPPED — only ${sequence.length} resolved member(s), not enough to form a thread.`);
      continue;
    }
    newThreads.push({
      id: spec.id,
      symbol: ROMAN[newThreads.length] || String(newThreads.length + 1),
      name: spec.name,
      description: spec.description,
      sequence,
    });
  }
  console.log(`\nThreads built: ${newThreads.length} / ${THREAD_SPECS.length} candidates.`);

  // ─── Resolve reading paths ─────────────────────────────────────────
  console.log('\n=== Resolving reading paths ===');
  const newPaths = [];
  for (const spec of PATH_SPECS) {
    console.log(`\nPath "${spec.id}":`);
    let steps = [];
    if (spec.kind === 'date-filter') {
      const candidates = (recordsByDate.get(spec.dateKey) || []).slice();
      candidates.sort((a, b) => a.id.localeCompare(b.id));
      steps = candidates.map(rec => ({
        label: rec.title,
        dateLabel: rec.dateLabel,
        localId: rec.id,
        memoPath: null,
        note: '',
      }));
      console.log(`  date-filter ${spec.dateKey}: found ${steps.length} record(s).`);
    } else {
      for (const m of spec.members) {
        const localId = resolveMemoBasename(m.memoBasename, basenameToNode, filenameToId, spec.id);
        if (localId) {
          const rec = recordsById.get(localId);
          steps.push({ label: rec.title, dateLabel: rec.dateLabel, localId: rec.id, memoPath: null, note: m.note || '' });
          console.log(`  resolved -> ${localId} ("${rec.title}")`);
        }
      }
    }
    if (steps.length < 1) {
      console.log(`  DROPPED — 0 resolved steps.`);
      continue;
    }
    newPaths.push({
      id: spec.id,
      title: spec.title,
      depthLabel: spec.depthLabel,
      estimate: spec.estimate,
      description: spec.description,
      source: spec.source,
      tags: spec.tags,
      steps,
    });
  }
  console.log(`\nPaths built: ${newPaths.length} / ${PATH_SPECS.length} candidates.`);

  // ─── Write JC_THREADS back into records-data.js ────────────────────
  let out = recordsSrc;
  out = replaceArray(out, 'JC_THREADS', newThreads);
  out = out.replace(/Last updated: [^\n]+/, `Last updated: ${new Date().toISOString()} (JC_THREADS rebuilt by scripts/rebuild-threads-and-paths.mjs — Phase 13, sourced from the owner's corpus map documents via Corpus Lattice path matching, Threads 1-10 scope)`);
  fs.writeFileSync(RECORDS_DATA_PATH, out, 'utf8');
  console.log(`\nWrote assets/records-data.js: JC_THREADS replaced with ${newThreads.length} threads.`);

  // ─── Write assets/corpus-paths-data.js wholesale ───────────────────
  const header = `/**
 * Jordan Crossing — Corpus Reading Paths
 *
 * Rebuilt ${new Date().toISOString()} by scripts/rebuild-threads-and-paths.mjs
 * (Phase 13). Every path and step here is transcribed directly from the
 * owner's corpus map documents ("Corpus Map — How These Documents Read Each
 * Other.md" and "PLAUD Meditations Corpus Map — How the Meditations Read
 * Each Other.md") and resolved to a real local record via the verified
 * Corpus Lattice dataset (memo-path basename -> Lattice node ->
 * archive_filename -> records-2 id). There are no external links — any step
 * that could not be confidently resolved to a local record was dropped
 * rather than linked out.
 */

'use strict';

const JC_CORPUS_PATHS = ${JSON.stringify(newPaths, null, 2)};
`;
  fs.writeFileSync(PATHS_DATA_PATH, header, 'utf8');
  console.log(`Wrote assets/corpus-paths-data.js: ${newPaths.length} paths, all fully local.`);
}

main();
