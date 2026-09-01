#!/usr/bin/env node
/**
 * Jordan Crossing — Encounter Index & Human Doorways tagger
 * ═══════════════════════════════════════════════════════════════════════
 *
 * Adds two heuristically-derived, honestly-labeled fields to every entry
 * in JC_RECORDS (assets/records-data.js):
 *
 *   encounter: { temperature, length, voice, movement, posture, form, season }
 *     — answers "what kind of place am I entering?" (design doc §9, the
 *       Encounter Index). `length` and `season` are objective (word count,
 *       recorded date against the known Stone Tablet windows). The other
 *       five dimensions are derived from keyword patterns in the record's
 *       own title + summary — an approximation, not an editorial judgment
 *       or a spiritual diagnosis of the reader. Every value is either a
 *       real match or explicitly `null` ("not distinctly one of these"),
 *       never a forced guess.
 *
 *   doorwayThemes: string[]
 *     — the "human doorways" a record touches (design doc §7 "Several
 *       maps for one corpus"/record-page doorways): shame, waiting, fear,
 *       identity, surrender, obedience, grief, fellowship, work, marriage,
 *       money, discipline. Same keyword-derivation approach, capped at 4
 *       per record so the chips stay readable.
 *
 * This script is idempotent and safe to re-run after
 * scripts/build-corpus-records.mjs regenerates JC_RECORDS — it only
 * rewrites the JC_RECORDS array text; JC_EDGES, JC_THREADS, and the
 * helper functions below them are left untouched.
 *
 * Usage: node scripts/tag-encounter-dimensions.mjs
 * ═══════════════════════════════════════════════════════════════════════
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_PATH = path.join(ROOT, 'assets', 'records-data.js');

// ─── Load the current JC_RECORDS (and leave everything else alone) ───────

function loadRecordsData() {
  const src = fs.readFileSync(DATA_PATH, 'utf8');
  const startMarker = 'const JC_RECORDS = [';
  const startIdx = src.indexOf(startMarker);
  if (startIdx === -1) throw new Error('Could not find "const JC_RECORDS = [" in records-data.js');
  // Find the matching closing "];" for this array by bracket counting.
  let depth = 0;
  let i = startIdx + startMarker.length - 1; // position of the opening '['
  let endIdx = -1;
  for (; i < src.length; i++) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }
  if (endIdx === -1) throw new Error('Could not find the closing "]" for JC_RECORDS');
  const arrayText = src.slice(startIdx + startMarker.length - 1, endIdx + 1); // includes [ ... ]
  // eslint-disable-next-line no-eval
  const records = eval(arrayText);
  return { src, startIdx, endIdx, records };
}

// ─── Word count from the record's own published HTML page ────────────────

function wordCountForHref(href) {
  const filePath = path.join(ROOT, href);
  if (!fs.existsSync(filePath)) return null;
  const html = fs.readFileSync(filePath, 'utf8');
  const match = html.match(/<article class="record-source"[^>]*>([\s\S]*?)<\/article>/);
  if (!match) return null;
  const text = match[1]
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return null;
  return text.split(' ').filter(Boolean).length;
}

// ─── Dimension keyword sets ────────────────────────────────────────────────
// Order matters within each dimension: first regex that matches wins.

const TEMPERATURE_RULES = [
  ['urgent', /\burgent\b|\bcrisis\b|\bemergency\b|\bdanger\b|\balarm\b|\bwarfare\b|\battack(ed|s)?\b|\bwarning\b/i],
  ['confrontational', /\bconfront\w*|\baccusation\b|\brebuk\w*|\bconviction\b|\bexpos\w*|\bcounterfeit\b|\bidol\w*/i],
  ['contemplative', /\bmeditat\w*|\bstill\w*|\bsilence\b|\bsecret place\b|\bponder\w*|\breflect\w*|\bquiet\w*/i],
];
const TEMPERATURE_DEFAULT = 'quiet';

const VOICE_RULES = [
  ['instructional', /teaching|sermon/i], // matched against classification
  ['prayerful', /\bprayer\b|\bintercession\b|\bpray(s|ed|ing)?\b|\bpetition\b/i],
  ['communal', /\bbrothers?\b|\bfellowship\b|\btogether\b|call reflection|conversation reflection/i],
];
const VOICE_DEFAULT = 'personal';

const MOVEMENT_RULES = [
  ['awakening', /\bwaking\b|\bawaken\w*|\brecogni[sz]\w*|\bwinnowing\b|\bemerg\w*/i],
  ['surrender', /\bsurrender\w*|\bkenosis\b|\byield\w*|\bemptied\b|\bbreaking point\b/i],
  ['confrontation', /\bconfront\w*|\bwarfare\b|\baccusation\b|\bidol\w*|\bwrong(ly)? occupied\b/i],
  ['waiting', /\bwait(ing|s)?\b|\bfourth watch\b|\brampart\b|\bpatien\w*/i],
  ['fellowship', /\bfellowship\b|\bkoinonia\b|\bbrothers?\b|\btogether\b/i],
  ['release', /\bgiven away\b|\brelease\w*|\bfinished work\b|\bfree\w*/i],
];

const POSTURE_RULES = [
  ['confessing', /\bconfession\b|\bconfess\w*|\brepent\w*/i],
  ['wrestling', /\bwrestl\w*|\bstruggl\w*|\bfear\b|\bafraid\b|\bdoubt\w*/i],
  ['discerning', /\bdiscern\w*|\bexamine\b|\btest(s|ed|ing)?\b/i],
  ['obeying', /\bobedien\w*|\bobey\w*/i],
];
const POSTURE_DEFAULT = 'receiving';

const FORM_RULES = [
  ['dialogue-shaped', /call reflection|conversation reflection|theological dialogue/i], // classification
  ['spoken', /teaching reflection|sermon reflection|public spoken word/i], // classification
  ['scripture-centered', /scripture reflection|bible study/i], // classification
];
const FORM_DEFAULT = 'written';

const SEASON_WINDOWS = [
  // [label, startMonthDay, endMonthDay] — 'MM-DD' inclusive, all within 2026
  ['Kairos Window (Tablet I)', '02-14', '04-14'],
  ['Post-Kairos (Tablet II)', '04-15', '05-24'],
  ['Middle Wilderness (Tablet V)', '05-25', '08-16'],
  ['The Seam (Tablets VI–VII)', '08-17', '08-28'],
  ['Tablet VIII — the open seed', '08-29', '08-30'],
];

const DOORWAY_THEME_RULES = [
  ['shame', /\bshame\b|\bguilt\w*|\bcondemnation\b/i],
  ['waiting', /\bwait(ing|s)?\b|\bpatien\w*/i],
  ['fear', /\bfear\b|\bafraid\b|\bterror\b|\banxiet\w*/i],
  ['identity', /\bidentity\b|\bflesh\b|\bego\b/i],
  ['surrender', /\bsurrender\w*|\bkenosis\b|\byield\w*/i],
  ['obedience', /\bobedien\w*|\bobey\w*/i],
  ['grief', /\bgrief\b|\bmourn\w*|\bmiscarriage\b/i],
  ['fellowship', /\bfellowship\b|\bkoinonia\b|\bbrothers?\b/i],
  ['work', /\bwork\b|\bbusiness\b|\bcareer\b|\blabor\b/i],
  ['marriage', /\bmarriage\b|\bwife\b|\bhusband\b|\bmarital\b/i],
  ['money', /\bmoney\b|\bfinanc\w*|\bdebt\b|\bmammon\b|\bwealth\b/i],
  ['discipline', /\bdisciplin\w*|\bchasten\w*|\bcorrection\b/i],
];

function firstMatch(rules, haystack, fallback) {
  for (const [label, re] of rules) {
    if (re.test(haystack)) return label;
  }
  return fallback;
}

function seasonFor(dateLabel) {
  const m = dateLabel.match(/^(\w{3}) (\d{1,2}), 2026/);
  if (!m) return 'Undated';
  const monthNames = { Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12' };
  const mm = monthNames[m[1]];
  const dd = String(m[2]).padStart(2, '0');
  const key = `${mm}-${dd}`;
  for (const [label, start, end] of SEASON_WINDOWS) {
    if (key >= start && key <= end) return label;
  }
  return 'Undated';
}

function lengthFor(wordCount, cutoffs) {
  if (wordCount == null) return null;
  if (wordCount < cutoffs.brief) return 'brief';
  if (wordCount < cutoffs.deep) return 'moderate';
  return 'deep';
}

function computeEncounter(rec, wordCount, cutoffs) {
  const haystack = `${rec.title} ${rec.summary || ''}`;
  const classificationHaystack = rec.classification || '';
  return {
    temperature: firstMatch(TEMPERATURE_RULES, haystack, TEMPERATURE_DEFAULT),
    length: lengthFor(wordCount, cutoffs),
    voice: firstMatch(VOICE_RULES, `${classificationHaystack} ${haystack}`, VOICE_DEFAULT),
    movement: firstMatch(MOVEMENT_RULES, haystack, null),
    posture: firstMatch(POSTURE_RULES, haystack, POSTURE_DEFAULT),
    form: firstMatch(FORM_RULES, classificationHaystack, FORM_DEFAULT),
    season: seasonFor(rec.dateLabel),
  };
}

function computeDoorwayThemes(rec) {
  const haystack = `${rec.title} ${rec.summary || ''}`;
  const matched = [];
  for (const [label, re] of DOORWAY_THEME_RULES) {
    if (re.test(haystack)) matched.push(label);
    if (matched.length >= 4) break;
  }
  return matched;
}

// ─── Main ──────────────────────────────────────────────────────────────────

function main() {
  const { src, startIdx, endIdx, records } = loadRecordsData();

  // "Length" is relative to *this* corpus, not an absolute word-count
  // standard — every record here is already a substantial meditation
  // (min ~1,800 words), so fixed thresholds like "under 600 = brief"
  // would never fire. Instead, split into thirds by this corpus's own
  // actual distribution so "brief"/"moderate"/"deep" mean something.
  const wordCounts = records.map((rec) => wordCountForHref(rec.href)).filter((n) => n != null).sort((a, b) => a - b);
  const pct = (p) => wordCounts[Math.floor(wordCounts.length * p)];
  const cutoffs = { brief: pct(0.33), deep: pct(0.67) };

  let taggedCount = 0;
  let noWordCount = 0;
  const updated = records.map((rec) => {
    const wordCount = wordCountForHref(rec.href);
    if (wordCount == null) noWordCount++;
    const encounter = computeEncounter(rec, wordCount, cutoffs);
    const doorwayThemes = computeDoorwayThemes(rec);
    taggedCount++;
    return { ...rec, encounter, doorwayThemes };
  });

  const newArrayText = 'const JC_RECORDS = ' + JSON.stringify(updated, null, 2) + '\n';
  // JSON.stringify produced "const JC_RECORDS = [ ... ]" minus trailing ";" —
  // reconstruct with the same surrounding text style as the original file.
  const before = src.slice(0, startIdx);
  const after = src.slice(endIdx + 1); // ']' consumed; keep the trailing ';' etc.
  const finalArrayText = newArrayText.replace(/^const JC_RECORDS = /, 'const JC_RECORDS = ');

  const out = before + finalArrayText.replace(/\n$/, '') + after;
  fs.writeFileSync(DATA_PATH, out, 'utf8');

  console.log(`Tagged ${taggedCount} records with encounter dimensions + doorway themes.`);
  console.log(`Word count unavailable for ${noWordCount} records (length will be null for those).`);
}

main();
