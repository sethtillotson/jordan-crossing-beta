#!/usr/bin/env node
/**
 * scripts/relink-corpus-paths.mjs
 *
 * Phase 5 — fixes assets/corpus-paths-data.js's remaining external links.
 * Every Corpus Path step whose `localId` is null currently renders a link
 * out to the author's private Genspark "Second Brain" drive, which no
 * other reader can open. Now that every meditation present in records/
 * has a local page (reviewed or mirrored — see build-mirror-records.mjs),
 * most of these steps can be safely relinked to a local `localId`.
 *
 * IMPORTANT — this does NOT resolve by filename. An earlier attempt (and
 * a first draft of this very script) resolved a step's memoPath basename
 * to a records/*.md file by filename-prefix matching, then trusted that
 * file's content. That approach is empirically broken: some raw source
 * files' actual content simply does not match their own filename (e.g.
 * the file literally named "...Resting in the Finished Work of Christ
 * and Covenant Identity.md" contains a different meditation entirely,
 * "My Grace Is Sufficient..."). Filename-prefix matching would silently
 * link a Corpus Path step to the wrong record's real content.
 *
 * Instead, this script searches every ALREADY-PUBLISHED JC_RECORDS title
 * (which was itself extracted from each file's own embedded metadata, not
 * its filename) for a candidate recorded on the EXACT same day as the
 * step's own dateLabel (this is what correctly separates cases like two
 * different "Kenosis"-titled meditations recorded on different dates),
 * then scores how much of the step's short label is covered by that
 * candidate's real title, and only relinks when both the date matches
 * and the coverage is strong. If no same-day record's title is a strong
 * match, the step is left external and printed in a report — the honest
 * conclusion in that case is usually that the meditation's real content
 * isn't in this repository under any filename yet, not that the link is
 * merely unlabeled.
 *
 * Run from the repository root:  node scripts/relink-corpus-paths.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PATHS_DATA_PATH = path.join(ROOT, 'assets', 'corpus-paths-data.js');
const RECORDS_DATA_PATH = path.join(ROOT, 'assets', 'records-data.js');

function loadJcRecords() {
  const src = fs.readFileSync(RECORDS_DATA_PATH, 'utf8');
  const startMarker = 'const JC_RECORDS = [';
  const startIdx = src.indexOf(startMarker);
  let depth = 0;
  let i = startIdx + startMarker.length - 1;
  let endIdx = -1;
  for (; i < src.length; i++) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') { depth--; if (depth === 0) { endIdx = i; break; } }
  }
  // eslint-disable-next-line no-eval
  return eval(src.slice(startIdx + startMarker.length - 1, endIdx + 1));
}

const STOPWORDS = new Set(['the','a','an','and','of','in','on','to','is','for','with','that','this','from','into','who','what','when','where','why','how','not','but','are','was','were','been','you','your','i']);

function wordSet(s) {
  const norm = String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  return new Set(norm.split(' ').filter(w => w.length > 2 && !STOPWORDS.has(w)));
}

// Month name -> number, plus day-of-month, so a candidate can be required
// to fall on the EXACT same recorded day as the step before it's even
// considered — see the header comment above.
const MONTHS = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
function monthDayOf(label) {
  const m = String(label).toLowerCase().match(/^([a-z]{3})[a-z]*\.?\s+(\d{1,2})/);
  if (!m) return null;
  const month = MONTHS.indexOf(m[1]);
  if (month === -1) return null;
  return { month, day: Number(m[2]) };
}

function main() {
  const jcRecords = loadJcRecords();
  const src = fs.readFileSync(PATHS_DATA_PATH, 'utf8');

  let totalExternal = 0;
  let relinked = 0;
  const unresolved = [];
  let out = src;

  const stepPattern = /\{ label: (.*?), dateLabel: (.*?), localId: null, memoPath: (['"])((?:\\.|(?!\3).)*)\3, note: (.*?) \}/g;

  out = out.replace(stepPattern, (whole, labelLit, dateLabelLit, quote, memoPathEscaped, noteLit) => {
    totalExternal += 1;
    // eslint-disable-next-line no-eval
    const label = eval(labelLit);
    // eslint-disable-next-line no-eval
    const dateLabel = eval(dateLabelLit);
    // eslint-disable-next-line no-eval
    const note = eval(noteLit);
    const stepDate = monthDayOf(dateLabel);

    if (!stepDate) {
      unresolved.push({ label, dateLabel, note, reason: `step's own dateLabel "${dateLabel}" could not be parsed to a month+day — cannot safely date-gate a match` });
      return whole;
    }

    const labelWords = wordSet(label);
    let best = null;
    let bestScore = 0;
    for (const rec of jcRecords) {
      const recDate = monthDayOf(rec.dateLabel);
      if (!recDate || recDate.month !== stepDate.month || recDate.day !== stepDate.day) continue;
      const recWords = wordSet(rec.title);
      if (!labelWords.size || !recWords.size) continue;
      let common = 0;
      labelWords.forEach(w => { if (recWords.has(w)) common++; });
      const coverage = common / labelWords.size;
      if (coverage > bestScore) { bestScore = coverage; best = rec; }
    }

    const THRESHOLD = 0.6;
    if (!best || bestScore < THRESHOLD) {
      unresolved.push({
        label, dateLabel, note,
        reason: best
          ? `same-day candidate "${best.title}" (id ${best.id}) covers only ${(bestScore * 100).toFixed(0)}% of this step's label words`
          : `no record is dated exactly ${dateLabel} with any matching title — this meditation's real content likely isn't in the local mirror under any filename yet (or was filed under a mismatched date)`,
      });
      return whole;
    }

    relinked += 1;
    return `{ label: ${labelLit}, dateLabel: ${dateLabelLit}, localId: '${best.id}', memoPath: null, note: ${noteLit} }`;
  });

  fs.writeFileSync(PATHS_DATA_PATH, out, 'utf8');

  console.log(`Total external steps found: ${totalExternal}`);
  console.log(`Relinked to local pages: ${relinked}`);
  console.log(`Left external (flagged for manual review): ${unresolved.length}`);
  unresolved.forEach(u => console.log(`  - "${u.label}" (${u.dateLabel}): ${u.reason}`));
}

main();
