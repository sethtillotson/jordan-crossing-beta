#!/usr/bin/env node
/**
 * scripts/build-records2-corpus.mjs
 *
 * Phase 11 — full corpus rebuild from records-2/, the new canonical raw-
 * source folder. The owner copied the entire hand-verified PLAUD Meditations
 * corpus (456 meditation files + 1 standalone "Prophetic Word" + 9 Stone
 * Tablet volumes, Feb 15 – Sep 1, 2026) directly into records-2/, superseding
 * both the old (stale/mismatched) records/*.md raw files AND the prior
 * verified-source-docs-driven incremental-merge scripts.
 *
 * records/ is now pure GENERATED OUTPUT — every *-v2.html page in it is
 * regenerated fresh from records-2/ each time this script runs. Nothing in
 * records/ should be hand-edited; edit records-2/ (or, for governance/typo
 * fixes, ask the owner to correct the verified source) and re-run instead.
 *
 * This script:
 *   1. Reads every records-2/*.md meditation file (date-prefixed, 456 of
 *      them) plus the one non-date-prefixed "Prophetic Word" file (457
 *      total content records — see plan.md's disclosed 456-vs-458 count
 *      reconciliation note).
 *   2. Parses each file's own title/date/classification metadata, splits
 *      the visible article body from its own embedded Cross-Reference
 *      Appendix, and parses that appendix into typed links + a Tablet
 *      Anchor (same classification logic as Phase 10's
 *      rebuild-cross-references-verified.mjs).
 *   3. Assigns a deterministic id (date-prefix + slugified title) and
 *      renders records/<id>-v2.html using the public Beta 2.0 template (no
 *      private-workspace banner — see the Beta 2.0 debrand pass below).
 *   3b. Phase 16a: enriches recordedDate with a Corpus Lattice v1.3
 *      recovered time-of-day (join on records-2's own filename == the
 *      Lattice's archive_filename) for any record whose own source-file
 *      parsing above found no time, BEFORE the chronological sort — see
 *      loadLatticeArchiveTimeMap()'s header comment for detail.
 *   4. Rebuilds JC_RECORDS and JC_EDGES in assets/records-data.js wholesale.
 *   5. Remaps JC_THREADS' record-id references onto the new id set (titles
 *      are usually stable so ids usually regenerate identically, but a
 *      corrected title/date can shift one — this is detected and remapped
 *      by title+date match, not assumed). JC_THREADS itself, EDGE_LABELS,
 *      STATUS_LABELS, and every helper function below them in
 *      records-data.js are left completely untouched.
 *
 * Run from the repository root: node scripts/build-records2-corpus.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
export const RECORDS2_DIR = path.join(ROOT, 'records-2');
export const RECORDS_DIR = path.join(ROOT, 'records');
const DATA_PATH = path.join(ROOT, 'assets', 'records-data.js');

// ─────────────────────────────────────────────────────────────────────────
// Generic "splice one const array out of records-data.js" helpers (same
// bracket-counting technique used throughout this project's scripts).
// ─────────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────────
// Markdown cleanup + metadata parsing.
// ─────────────────────────────────────────────────────────────────────────

function cleanMarkdownArtifacts(text) {
  let out = text;
  out = out.replace(/<img[^>]*>/gi, '');
  out = out.replace(/<!--[\s\S]*?-->/g, '');
  out = out.replace(/\\([#*|_\[\]()])/g, '$1');
  return out;
}
function stripMarkdownDecoration(s) {
  return s.replace(/^\*\*[^*]+:\*\*\s*/, '').replace(/\*\*/g, '').replace(/^#+\s*/, '')
    .trim()
    .replace(/^\*([^*]+)\*$/, '$1') // wrapping single-asterisk italics, e.g. "*Title Here*"
    .trim();
}
function normalizeTitle(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

const MONTH_NUM = { Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12' };
const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const FULL_MONTH_TO_NUM = {
  january:'01', february:'02', march:'03', april:'04', may:'05', june:'06',
  july:'07', august:'08', september:'09', october:'10', november:'11', december:'12',
};

/** Everything before the meditation's own "## Cross-Reference..." heading
 * (its Encounter-Edition appendix) — this is what's shown as the article. */
function bodyOnly(cleaned) {
  const m = /^## Cross-Reference/m.exec(cleaned);
  return m ? cleaned.slice(0, m.index).trim() : cleaned.trim();
}

/** Detects a file whose ".md" content is actually a raw binary blob (e.g. a
 * docx/zip file saved/renamed without ever being converted to text) — a
 * genuine source-corpus data-quality bug found in one file during Phase 11,
 * not a formatting quirk. Such files must NOT be published as if they were
 * real meditation text. */
export function looksLikeBinaryGarbage(buf) {
  if (buf.length >= 4 && buf[0] === 0x50 && buf[1] === 0x4b && (buf[2] === 0x03 || buf[2] === 0x05 || buf[2] === 0x07)) {
    return true; // PK\x03\x04 etc. — a zip/docx/xlsx file signature
  }
  const sampleLen = Math.min(buf.length, 2000);
  let controlCount = 0;
  for (let i = 0; i < sampleLen; i++) {
    const b = buf[i];
    if (b < 9 || (b > 13 && b < 32)) controlCount += 1;
  }
  return sampleLen > 0 && (controlCount / sampleLen) > 0.05;
}

export function parseRawRecord(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const cleaned = cleanMarkdownArtifacts(raw);
  const body = bodyOnly(cleaned);

  // Bounded metadata-field capture: stops at an actual newline, the next
  // "**Label:**" field, a markdown heading, or 300 chars — whichever comes
  // first. A handful of source files (ambient/ untimed transcripts) lost
  // nearly all of their line breaks in export, so an unbounded "(.+)$"
  // would otherwise swallow the entire rest of the document into a single
  // field (found and fixed during Phase 11 QA on 04-08's "Glimpse into the
  // Daily Rhythm" record).
  function metaField(label) {
    const re = new RegExp(`\\*\\*${label}:\\*\\*\\s*([\\s\\S]{1,300}?)(?=\\n|\\*\\*[A-Z][A-Za-z ]{2,40}:\\*\\*|##\\s|$)`);
    return cleaned.match(re);
  }
  const titleMatch = cleaned.match(/^\s*#\s+([^\n]{1,300})$/m);
  const metaTitleMatch = metaField('Title');
  const recordedMatch = metaField('Recorded');
  const classificationMatch = metaField('Classification');

  const lines = cleaned.split(/\r?\n/);
  const firstNonEmpty = (lines.find(l => l.trim().length > 0) || '').trim();
  // A short, title-case-looking standalone label line (no H1, no **Title:**
  // meta) — a fallback for atypically-formatted files (e.g. "Prophetic
  // Word") that carry a plain genre label as their very first line instead
  // of the usual "# MM-DD Meditation: ..." heading.
  const looksLikeLabel = !titleMatch && !metaTitleMatch &&
    /^[A-Z][A-Za-z' -]{2,40}$/.test(firstNonEmpty);

  let summary = '';
  const openingIdx = cleaned.search(/##[^\n]*Opening Observation/i);
  if (openingIdx !== -1) {
    const afterOpening = cleaned.slice(openingIdx);
    const paraMatch = afterOpening.match(/##[^\n]*Opening Observation[^\n]*\n+([^\n]+(?:\n(?!\n)[^\n]+)*)/i);
    if (paraMatch && paraMatch[1].trim().length > 40) summary = paraMatch[1].trim();
  }
  if (!summary && metaTitleMatch && metaTitleMatch[1].trim().length > 10) summary = metaTitleMatch[1].trim();
  if (!summary) {
    // Fall back to the first substantial paragraph of the body itself.
    const paras = body.split(/\n\s*\n/).map(p => p.replace(/^#+\s*/, '').trim()).filter(p => p.length > 40);
    if (paras.length) summary = paras[0];
  }
  summary = summary.replace(/\s+/g, ' ').slice(0, 260).trim();
  if (summary.length === 260) summary = summary.replace(/\s+\S*$/, '') + '…';

  let recordedDate = null;
  if (recordedMatch && !/not provided/i.test(recordedMatch[1])) {
    const dt = recordedMatch[1].trim();
    const m = dt.match(/(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/);
    if (m) recordedDate = { key: `${m[1]} ${m[2]}`, iso: `${m[1]}T${m[2]}:00`, timeKnown: true };
  }
  function parseLooseDate(text) {
    // Handles "Thursday, August 13, 2026" + a separate "12:33 PM" (the
    // "Prophetic Word" file's own format) AND "August 1st 2026 at 10:28 PM"
    // (an ordinal-day prose format found in a handful of files) — but ONLY
    // ever applied to a narrow, already-trusted slice of text (the
    // **Recorded:** field itself, or the first few lines of a file with no
    // metadata block at all), never the whole document body, so an
    // unrelated date mentioned in the meditation's own text can never be
    // mistaken for its recording date.
    const looseDate = text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})(?:st|nd|rd|th)?,?\s+(\d{4})\b/i);
    if (!looseDate) return null;
    const looseTime = text.match(/\b(\d{1,2}):(\d{2})\s*(AM|PM)\b/i);
    const mm = FULL_MONTH_TO_NUM[looseDate[1].toLowerCase()];
    const dd = looseDate[2].padStart(2, '0');
    const yyyy = looseDate[3];
    let hh = '12', min = '00', timeKnown = false;
    if (looseTime) {
      let h = parseInt(looseTime[1], 10);
      const isPM = /pm/i.test(looseTime[3]);
      if (isPM && h < 12) h += 12;
      if (!isPM && h === 12) h = 0;
      hh = String(h).padStart(2, '0');
      min = looseTime[2];
      timeKnown = true;
    }
    return { key: `${yyyy}-${mm}-${dd} ${hh}:${min}`, iso: `${yyyy}-${mm}-${dd}T${hh}:${min}:00`, timeKnown };
  }
  if (!recordedDate && recordedMatch && !/not provided/i.test(recordedMatch[1])) {
    recordedDate = parseLooseDate(recordedMatch[1]);
  }
  if (!recordedDate && looksLikeLabel) {
    recordedDate = parseLooseDate(cleaned.slice(0, 400));
  }
  if (!recordedDate) {
    // Fallback: derive the date from the filename's own MM-DD prefix
    // (the corpus spans a single year, 2026). Exact time of day is not
    // recoverable, so it is left unknown (not displayed, not claimed).
    const base = path.basename(filePath);
    const fm = base.match(/^(\d{2})-(\d{2})/) || base.match(/(\d{2})-(\d{2})(?=[\s_]|$)/);
    if (fm) {
      const mm = fm[1]; const dd = fm[2];
      recordedDate = { key: `2026-${mm}-${dd} __:__`, iso: `2026-${mm}-${dd}T12:00:00`, timeKnown: false };
    }
  }

  const displayHeading = titleMatch ? stripMarkdownDecoration(titleMatch[1]) : null;
  const metaTitle = metaTitleMatch ? stripMarkdownDecoration(metaTitleMatch[1]) : null;
  let title = metaTitle || displayHeading;
  if (!title && looksLikeLabel) title = firstNonEmpty;
  if (!title) title = path.basename(filePath).replace(/\.md$/, '');
  // Strips a leading "MM-DD" date prefix, plus either a "to/at HH[:_-]MM"
  // range suffix (the "Apr 11 to Apr 14 MERGED" style) OR a bare "HH:MM"/
  // "HH_MM" directly after the date with no to/at word (found on 14 titles,
  // e.g. "04-01 09:43 Reflection: ..." — previously left "09:43 " stuck on
  // the front of the displayed title since the old regex only recognized
  // the to/at form).
  title = title.replace(/^\d{2}-\d{2}(?:\s+(?:to|at)\s+\d{2}(?:[:_-]\d{2})?|\s+\d{1,2}[:_]\d{2})?\s*[—-]?\s*/i, '').trim() || title;
  title = title.replace(/^\*([^*]+)\*$/, '$1').trim() || title; // wrapping single-asterisk italics left over after date-prefix removal

  let classification = classificationMatch ? classificationMatch[1].trim() : null;
  if (!classification && looksLikeLabel) classification = firstNonEmpty;
  if (!classification) classification = 'Meditation';
  // A dozen source files leave a stray trailing dash on this line (e.g.
  // "Theological Meditation —" with nothing after it) — cosmetic only.
  classification = classification.replace(/\s*[—–-]+\s*$/, '').trim() || classification;

  return {
    filePath,
    title,
    recordedDate,
    classification,
    body,
    summary,
    isMeditation: /##[^\n]*Opening Observation/i.test(cleaned) || body.length > 200,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Cross-Reference Appendix parsing: Tablet Anchor + richly-typed memo:
// links + structured Doctrinal Spine / Lexicon Joints / Chiastic Mirror
// fields (Phase 14 — see plan.md "Phase 14a").
//
// The corpus carries TWO appendix formats, roughly half the corpus each
// (verified: 236 rigid-only, 220 loose-only, 20 files carry BOTH — a loose
// block followed later by a rigid block):
//   - RIGID ("## Cross-Reference Appendix (Pass N · Encounter Edition)"):
//     fixed H3 sub-headings — Doctrinal Spine, Thread Joints, Lexicon
//     Joints, Expanded Chiastic Mirror, Tablet Anchor, occasionally a
//     trailing "Additional Thread Joints (Pass 14 Enrichment)" H3 AFTER
//     Tablet Anchor.
//   - LOOSE ("## Cross-References — How This Meditation Reads Others"):
//     bold inline labels instead of headings ("**Thread role** — ...",
//     "**Lexicon joints (...):**", "**Chiastic mirror:**", "**Tablet
//     anchor:**"), plus free-named grouping labels ("**Mantle arc...:**",
//     "**Jordan-crossing lineage:**") that don't map to a known type but
//     still carry genuine cross-references (kept as generic
//     'cross-reference' joints, never dropped).
//
// Verified: the appendix (whichever format, or both) is ALWAYS the final
// section of every file (0 exceptions across all 458 source files) — so
// once the first "## Cross-Reference" heading is found, everything from
// there to end-of-file is appendix content. This also fixes a real
// pre-Phase-14 bug: the old parser stopped at the first "### Tablet
// Anchor", silently discarding any content after it (e.g. "Additional
// Thread Joints" — 8 files affected).
// ─────────────────────────────────────────────────────────────────────────

function parseTabletAnchor(content) {
  // Prefer the rigid "### Tablet Anchor" H3 form — present in 456/458 files
  // and, unlike the loose "**Tablet anchor:**" form, never confuses a bold
  // run that sits INSIDE a markdown link (e.g. "[**Stone Tablet VII ·
  // Volume IV**](memo:...)" — a real pattern found in the loose format
  // that, if matched naively, captures the trailing "](memo:...)" as part
  // of the "window" text; a genuine bug caught by inspecting real output).
  const rigidIdx = content.indexOf('### Tablet Anchor');
  const looseIdx = content.search(/\*\*Tablet anchor:?\*\*/i);
  const candidates = [rigidIdx, looseIdx].filter(i => i !== -1).sort((a, b) => a - b);
  for (const idx of candidates) {
    const after = content.slice(idx, idx + 500);
    // Global search so a false match (immediately followed by "]" — bold
    // text nested inside a markdown link, not a real anchor description)
    // can be skipped in favor of the next real occurrence.
    const re = /\*\*(Stone Tablet[^*]+)\*\*(\s*(?:—|--)?\s*)([^\n.]*)/g;
    let m;
    while ((m = re.exec(after))) {
      if (m[3].startsWith(']')) continue; // bold-inside-link false match
      const window = m[3].trim().replace(/^[.\s]+|[.\s]+$/g, '');
      if (!window) continue; // no real description captured — keep looking
      return { label: m[1].trim(), window };
    }
  }
  return null;
}

// Every recognized joint type. 'doctrinal-spine-seed'/'-growth'/'-tablet'
// are assigned specifically (not just 'doctrinal-spine') so the record page
// can render the Seed → Growth → Tablet arc in its own correct order.
const TYPE_KEYWORDS = [
  { re: /doctrinal spine/i, type: 'doctrinal-spine' }, // refined to -seed/-growth/-tablet per-bullet below
  { re: /additional thread joint/i, type: 'thread-joint' },
  { re: /thread joint/i, type: 'thread-joint' },
  { re: /thread role/i, type: 'thread-joint' },
  { re: /^mantle arc|^jordan-crossing lineage|^sacred-ordinary lineage|arc \(across|lineage\s*[:(]/i, type: 'thread-joint' }, // loose format's free-named narrative-arc groupings
  { re: /lexicon joint/i, type: 'lexicon-joint' },
  { re: /chi[ar]stic mirror/i, type: 'chiastic-mirror' }, // covers the corpus's own "Chiratic" typo
  { re: /tablet anchor/i, type: 'tablet-anchor' },
];
function classifyHeading(line) {
  for (const kw of TYPE_KEYWORDS) if (kw.re.test(line)) return kw.type;
  return null;
}

/** A line is a "loose format" section label if it's ENTIRELY a bold run,
 * optionally followed by a colon and nothing else meaningful — e.g.
 * "**Lexicon joints (...):**" or "**Thread role** — some gloss text" (the
 * bold prefix sets the label even though gloss text follows on the same
 * line, unlike the strict heading-only match the old parser required).
 * Some real labels run long (e.g. "**Lexicon joints (Rom 8:26 + Ps 126:5-6
 * · Spirit intercedes through groans · sowing in tears):**" is ~90 chars) —
 * an earlier 80-char cap silently failed to match these, leaving
 * currentType stuck on whatever section preceded it (a real bug: caught by
 * inspecting real parsed output where lexicon-section links were mis-typed
 * as the prior section's type). 200 chars comfortably covers every label
 * length observed in the corpus without risking a match spanning multiple
 * unrelated bold runs on the same line. */
function looseFormatLabel(line) {
  const m = line.match(/^\*\*([^*]{3,200})\*\*\s*[:—-]?/);
  return m ? m[1].replace(/:$/, '').trim() : null;
}

/** Strips markdown link syntax down to its display text, for gloss/note
 * text shown directly in the UI (e.g. a chiastic-mirror pairing note like
 * "Pair with [May 27 · Mantles](memo:...)" reads as "Pair with May 27 ·
 * Mantles"). The underlying memo: link itself is still separately
 * extracted for edge-building — this only affects display text. */
function stripMarkdownLinks(text) {
  return (text || '').replace(/\[([^\]]+)\]\(memo:[^)]+\)/g, '$1').trim();
}

export function parseAppendixLinks(content) {
  const startMatch = /^## Cross-Reference/m.exec(content);
  if (!startMatch) return { links: [], doctrinalSpine: null, lexiconJoints: [], chiasticMirror: [], doctrinalThemesCarried: null };
  const appendix = content.slice(startMatch.index); // to end-of-file — see header note
  const lines = appendix.split(/\r?\n/);

  const links = [];
  const lexiconJoints = [];
  const chiasticMirror = [];
  const doctrinalSpine = { seed: null, growth: null, tablet: null };
  let doctrinalThemesCarried = null;
  let currentType = null;
  let chiasticIndex = 0;
  const CHIASTIC_POSITIONS = ['A', 'B', 'C', "B'", "A'", "C'", "D", "D'"];

  const linkRe = /\[([^\]]+)\]\(memo:([^)]+)\)/g;
  function extractLinks(line, type) {
    linkRe.lastIndex = 0;
    let m;
    while ((m = linkRe.exec(line))) {
      const displayText = m[1];
      let rawLink;
      try { rawLink = decodeURIComponent(m[2]); } catch { rawLink = m[2]; }
      links.push({ displayText, rawLink, basename: path.basename(rawLink), type: type || 'cross-reference' });
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Doctrinal themes carried — single free-text line, no links.
    const themeMatch = line.match(/Doctrinal themes carried:?\**\s*(.+)$/i);
    if (themeMatch) { doctrinalThemesCarried = themeMatch[1].replace(/\*+$/, '').trim() || null; continue; }

    // H2-H4 headings (rigid format).
    const headingMatch = line.match(/^#{2,4}\s+(.+)$/);
    if (headingMatch) {
      const t = classifyHeading(headingMatch[1]);
      if (t) currentType = t;
      continue;
    }

    // Loose-format bold inline label (may or may not carry gloss/links on
    // the same line) — only treat as a NEW section label if it plausibly
    // reads as one (title-case-ish, not a mid-sentence bold phrase).
    const label = looseFormatLabel(line);
    if (label && /^[A-Z]/.test(label)) {
      const t = classifyHeading(label);
      if (t) currentType = t;
      // fall through — the same line may still carry links/content.
    }

    // Doctrinal Spine seed/growth/tablet bullets:
    // "- **Seed · [title](memo:...)** — gloss."
    const spineMatch = line.match(/^-?\s*\*\*(Seed|Growth|Tablet)\s*[·:]?\s*(?:\[([^\]]+)\]\(memo:([^)]+)\))?[^*]*\*\*\s*(?:—|--)?\s*(.*)$/i);
    if (currentType === 'doctrinal-spine' && spineMatch) {
      const stepKey = spineMatch[1].toLowerCase();
      const stepLabel = spineMatch[2] || null;
      let stepRawLink = null;
      if (spineMatch[3]) { try { stepRawLink = decodeURIComponent(spineMatch[3]); } catch { stepRawLink = spineMatch[3]; } }
      const gloss = stripMarkdownLinks((spineMatch[4] || '').trim());
      if (stepKey === 'seed') doctrinalSpine.seed = { label: stepLabel, basename: stepRawLink ? path.basename(stepRawLink) : null, gloss };
      else if (stepKey === 'growth') doctrinalSpine.growth = { label: stepLabel, basename: stepRawLink ? path.basename(stepRawLink) : null, gloss };
      else if (stepKey === 'tablet') doctrinalSpine.tablet = { label: stepLabel, basename: stepRawLink ? path.basename(stepRawLink) : null, gloss };
      if (stepRawLink) extractLinks(line, `doctrinal-spine-${stepKey}`);
      continue;
    }

    // Lexicon Joints bullets: "- **term** — gloss." (rarely carries a link;
    // when it does, still register the joint AND the edge).
    if (currentType === 'lexicon-joint') {
      const lexMatch = line.match(/^-\s*\*\*([^*]+)\*\*\s*(?:—|--)?\s*(.*)$/);
      if (lexMatch) {
        lexiconJoints.push({ term: stripMarkdownLinks(lexMatch[1].trim()), gloss: stripMarkdownLinks(lexMatch[2].trim()) });
        extractLinks(line, 'lexicon-joint');
        continue;
      }
    }

    // Chiastic Mirror bullets: rigid "- **A · label** — gloss." or loose
    // "- Pair with [link] — gloss." (loose format doesn't use A/B/C labels;
    // assign positions positionally in the order encountered).
    if (currentType === 'chiastic-mirror') {
      const rigidMirror = line.match(/^-\s*\*\*([A-D]'?)\s*[·:]\s*([^*]+)\*\*\s*(?:—|--)?\s*(.*)$/);
      if (rigidMirror) {
        chiasticMirror.push({ position: rigidMirror[1], label: stripMarkdownLinks(rigidMirror[2].trim()), gloss: stripMarkdownLinks(rigidMirror[3].trim()) });
        extractLinks(line, 'chiastic-mirror');
        continue;
      }
      if (/^-\s/.test(line)) {
        const position = CHIASTIC_POSITIONS[chiasticIndex] || `#${chiasticIndex + 1}`;
        chiasticIndex += 1;
        chiasticMirror.push({ position, label: null, gloss: stripMarkdownLinks(line.replace(/^-\s*/, '').trim()) });
        extractLinks(line, 'chiastic-mirror');
        continue;
      }
    }

    // Everything else: extract any memo: links under the current type.
    extractLinks(line, currentType);
  }

  return { links, doctrinalSpine, lexiconJoints, chiasticMirror, doctrinalThemesCarried };
}

// ─────────────────────────────────────────────────────────────────────────
// Filename matching: longest true common character-prefix with a
// length-difference tiebreaker (proven in Phase 10 against zero ambiguous
// ties). records-2 filenames are the verified corpus's own filenames, so
// most appendix link basenames should match exactly; this fallback exists
// for the few that don't (older truncated exports, stray punctuation diffs).
// ─────────────────────────────────────────────────────────────────────────

function commonPrefixLen(a, b) {
  const n = Math.min(a.length, b.length);
  let i = 0;
  while (i < n && a[i] === b[i]) i++;
  return i;
}
export function bestMatch(nameBase, candidateBases, minLen = 20) {
  let best = null, bestLen = 0, bestDiff = Infinity;
  for (const cand of candidateBases) {
    const len = commonPrefixLen(nameBase, cand);
    if (len < minLen) continue;
    const diff = Math.abs(nameBase.length - cand.length);
    if (len > bestLen || (len === bestLen && diff < bestDiff)) {
      bestLen = len; bestDiff = diff; best = cand;
    }
  }
  return best;
}

// ─────────────────────────────────────────────────────────────────────────
// Slug / id generation.
// ─────────────────────────────────────────────────────────────────────────

function slugifyTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .split(/\s+/)
    .filter(w => w && !['the', 'a', 'an', 'and', 'of', 'in', 'on', 'to', 'is', 'for'].includes(w))
    .slice(0, 4)
    .join('-') || 'meditation';
}
export function makeId(dateKey, title, usedIds) {
  const datePart = dateKey ? dateKey.slice(5, 10) : '00-00';
  const base = `${datePart}-${slugifyTitle(title)}`;
  let candidate = base;
  let n = 2;
  while (usedIds.has(candidate)) { candidate = `${base}-${n}`; n += 1; }
  usedIds.add(candidate);
  return candidate;
}
function formatDateLabel(iso) {
  const d = new Date(iso + 'Z');
  const hh = String(d.getUTCHours()).padStart(2, '0');
  const mm = String(d.getUTCMinutes()).padStart(2, '0');
  return `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()} · ${hh}:${mm}`;
}
function formatDateOnlyLabel(iso) {
  const d = new Date(iso + 'Z');
  return `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()} · time not recorded`;
}

// ─────────────────────────────────────────────────────────────────────────
// Public Beta 2.0 record-page template (no private-workspace banner).
// ─────────────────────────────────────────────────────────────────────────

function renderPage({ id, title, dateLabel, classification, article, summary }) {
  const escAttr = (s) => String(s).replace(/"/g, '&quot;');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <meta name="viewport" content="width=device-width,initial-scale=1">

  <title>${escAttr(title)} — The Jordan Crossing</title>
  <meta name="description" content="${escAttr(summary)}">
  <link rel="stylesheet" href="../assets/design-v2.css?v=20260903BETA3">
  <link rel="stylesheet" href="../assets/audio-player.css?v=20260903BETA3">
</head>
<body data-record-id="${escAttr(id)}">
  <a class="skip-link" href="#main-content">Skip to main content</a>

  <div class="beta-banner" role="banner">
    <span class="badge">PUBLIC BETA 2.0</span>
    <span>Reader discretion advised</span>
  </div>

  <header class="site-header">
    <a href="../index.html" class="site-title">The Jordan Crossing</a>
    <nav class="record-nav" aria-label="Record navigation">
      <a href="../index.html">Landing</a>
      <a href="../mystery.html">Mystery Mode</a>
      <a href="../threads.html">Threads</a>
      <a href="../paths.html">Corpus Paths</a>
      <a href="../archive.html">Archive</a>
      <a href="../graph.html">Corpus Map</a>
    </nav>
  </header>

  <main id="main-content">
    <div class="main-container">
      <div class="record-header">
        <p class="record-caption">Original Record · Local Corpus Bundle</p>
        <h1 class="page-title">${title}</h1>
        <p class="page-subtitle">${dateLabel}</p>

        <div class="source-row">
          <span class="source-badge">Original record</span>
          <span>Mirrored locally · ${classification}</span>
        </div>

        <div class="callout">
          <p class="caption">Source Status</p>
          <p>This page displays the imported source text itself. Thread connections are shown separately, below.</p>
        </div>
      </div>

      <div class="audio-player-mount" id="audio-player-mount"></div>

      <article class="record-source" aria-label="Original meditation text">${article}</article>

      <p class="caption" style="margin-top:var(--space-6)">End of imported source record.</p>

      <div class="movement-divider"></div>

      <section class="discern-section" aria-label="What did you actually encounter?">
        <p class="discern-prompt">What did you actually encounter?</p>
        <p class="discern-sub">
          The site does not announce its interpretation. It asks — and offers navigation, not a conclusion.
        </p>

        <div class="discern-choices" role="group" aria-label="Choose your response">
          <button class="discern-choice" type="button" aria-pressed="false" data-reveals="discern-recognized">
            <span class="discern-choice__icon" aria-hidden="true">◈</span>
            I recognized something
          </button>
          <button class="discern-choice" type="button" aria-pressed="false" data-reveals="discern-uncertain">
            <span class="discern-choice__icon" aria-hidden="true">◇</span>
            I'm not sure yet
          </button>
          <button class="discern-choice" type="button" aria-pressed="false" data-reveals="discern-resisted">
            <span class="discern-choice__icon" aria-hidden="true">◆</span>
            I want to resist this
          </button>
        </div>

        <div class="discern-reveal" id="discern-recognized" hidden>
          <p>Good. Let it be named plainly, in your own words if you wish — not required, not tracked.</p>
        </div>
        <div class="discern-reveal" id="discern-uncertain" hidden>
          <p>That is an honest place to stand. Uncertainty is not a failure to discern — it may be its own discernment.</p>
        </div>
        <div class="discern-reveal" id="discern-resisted" hidden>
          <p>Resistance is worth noticing, not overriding. What about it resists you?</p>
        </div>
      </section>

      <div class="movement-divider"></div>

      <div class="doctrinal-spine-mount" id="doctrinal-spine-mount"></div>

      <section class="related-records" id="related-records-mount" aria-label="Related records"></section>

      <div class="doorway-themes-mount" id="doorway-themes-mount"></div>

      <div class="graph-nav" id="graph-nav-mount"></div>

      <div class="reviewed-threads" id="threads-mount"></div>

      <div class="lexicon-chiastic-mount" id="lexicon-chiastic-mount"></div>

      <div class="movement-divider"></div>

      <section class="return-panel" aria-label="You have reached the end of this encounter">
        <p class="return-prompt">You have reached the end of this encounter.</p>
        <p class="return-sub">
          You do not need to force a conclusion. You may continue, return later, or read the Scripture.
        </p>

        <div class="return-choices">
          <button class="depth-card" type="button" data-release-action="remain">
            <div class="depth-title">Remain here</div>
            Return to the top of this record
          </button>

          <a class="depth-card" href="../threads.html">
            <div class="depth-title">Follow the thread</div>
            Explore the thread constellation
          </a>

          <a class="depth-card" href="../archive.html">
            <div class="depth-title">Browse the archive</div>
            See the full corpus this record was mirrored from
          </a>

          <a class="depth-card" href="../mystery.html">
            <div class="depth-title">Enter again</div>
            Return to Mystery Mode and name a new doorway
          </a>

          <button class="depth-card" type="button" data-release-action="leave">
            <div class="depth-title">Leave and return later</div>
            Close this page and return when you're ready
          </button>
        </div>
      </section>
    </div>
  </main>

  <footer>
    <em>A Living Topology of Transformation</em> · Public Beta 2.0 · Soli Deo Gloria
  </footer>

  <script src="../assets/records-data.js?v=20260903BETA3"></script>
  <script src="../assets/audio-player.js?v=20260903BETA3"></script>
  <script src="../assets/design-v2-logic.js?v=20260903BETA3"></script>
</body>
</html>
`;
}

// ─────────────────────────────────────────────────────────────────────────
// Corpus Lattice v1.3 recovered-time enrichment (Phase 16a).
//
// Corpus Lattice v1.3 added a "time" field to meditation nodes — a real
// time-of-day recovered from that file's own **Recorded:** body metadata,
// **Title:**, or filename, independently of anything this script's own
// parseRawRecord() does (385/459 meditations recoverable, 24-hr Central).
// records-2/'s own filenames are already the Lattice's `archive_filename`
// (records-2/ was extracted from the same shortened-name zip bundle the
// Lattice documents), so the join is a plain exact filename match — no
// fuzzy matching needed.
// ─────────────────────────────────────────────────────────────────────────
function loadLatticeArchiveTimeMap() {
  const latticePath = path.join(ROOT, 'Corpus Lattice.json');
  if (!fs.existsSync(latticePath)) return new Map();
  const lattice = JSON.parse(fs.readFileSync(latticePath, 'utf8'));
  const map = new Map();
  for (const node of Object.values(lattice.nodes || {})) {
    if (node.type !== 'meditation') continue;
    if (!node.archive_filename || !node.time || !node.date) continue;
    map.set(node.archive_filename, { date: node.date, time: node.time });
  }
  return map;
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────

function main() {
  // 1. List meditation files: 456 date-prefixed + the 1 standalone
  //    "Prophetic Word" (identified generically — no H1/meta title, but a
  //    real Cross-Reference Appendix, i.e. genuine threaded content — not
  //    by hardcoding its filename).
  const allMd = fs.readdirSync(RECORDS2_DIR).filter(f => f.endsWith('.md'));
  const stoneTabletNames = allMd.filter(f => /^Stone Tablet/i.test(f));
  const nonMeditationNames = new Set([
    ...stoneTabletNames,
    ...allMd.filter(f => /master-index/i.test(f)),
  ]);
  const meditationFileNames = allMd.filter(f => !nonMeditationNames.has(f));
  console.log(`records-2 total .md files: ${allMd.length}`);
  console.log(`  Stone Tablet files (handled separately): ${stoneTabletNames.length}`);
  console.log(`  candidate meditation files: ${meditationFileNames.length}`);

  // 2. Parse every candidate meditation file.
  const parsedByName = new Map(); // basename -> parsed + tabletAnchor + links
  const baseNames = meditationFileNames.map(n => n.slice(0, -3));
  let skippedNotMeditation = 0;
  let skippedCorrupted = 0;
  for (const name of meditationFileNames) {
    const fullPath = path.join(RECORDS2_DIR, name);
    const buf = fs.readFileSync(fullPath);
    if (looksLikeBinaryGarbage(buf)) {
      skippedCorrupted += 1;
      console.log(`  SKIPPED (binary/corrupted source, not real text): ${name}`);
      continue;
    }
    const content = buf.toString('utf8');
    const parsed = parseRawRecord(fullPath);
    if (!parsed.isMeditation) { skippedNotMeditation += 1; continue; }
    const tabletAnchor = parseTabletAnchor(content);
    const { links, doctrinalSpine, lexiconJoints, chiasticMirror, doctrinalThemesCarried } = parseAppendixLinks(content);
    parsedByName.set(name, { ...parsed, tabletAnchor, links, doctrinalSpine, lexiconJoints, chiasticMirror, doctrinalThemesCarried });
  }
  console.log(`Parsed as real meditation content: ${parsedByName.size}`);
  console.log(`Skipped (not meditation-shaped content): ${skippedNotMeditation}`);
  console.log(`Skipped (corrupted/binary source file): ${skippedCorrupted}`);

  function resolveTarget(basename) {
    if (parsedByName.has(basename)) return basename;
    const base = basename.replace(/\.md$/, '');
    const match = bestMatch(base, baseNames, 20);
    // bestMatch operates on extension-less baseNames (see their construction
    // above) and so returns an extension-less string — but parsedByName/
    // nameToId are always keyed WITH the ".md" extension. A pre-existing
    // bug here (present before Phase 14) returned the bare match without
    // re-appending ".md", so every fuzzy-matched link (i.e. every case
    // where the appendix's stated filename differs from records-2's own,
    // independently-shortened filename — the same well-documented
    // filename-shortening quirk Corpus Lattice's archive_filename fields
    // solve for the authoritative edge rebuild) silently failed this
    // lookup and was miscounted as "skipped (non-meditation target)"
    // instead of being resolved. Caught by inspecting real Phase 14
    // extraction output where clearly-resolvable targets were missing.
    return match ? `${match}.md` : null;
  }

  // 3. Assign a deterministic id + href to every parsed meditation, sorted
  //    chronologically for stable, readable ids and `order`.
  const usedIds = new Set();
  const entries = [...parsedByName.entries()].map(([name, p]) => ({ name, ...p }));

  // 2b. Corpus Lattice v1.3 recovered-time enrichment — see the function's
  // own header comment. Applied BEFORE the chronological sort below so
  // records/order/sequence navigation reflect the real recovered time,
  // not a noon placeholder. IDs are unaffected (makeId only uses the
  // MM-DD date portion, never the time-of-day).
  const latticeTimeMap = loadLatticeArchiveTimeMap();
  let timeEnrichedCount = 0;
  for (const e of entries) {
    if (e.recordedDate && e.recordedDate.timeKnown) continue;
    const found = latticeTimeMap.get(e.name);
    if (!found) continue;
    e.recordedDate = {
      key: `${found.date} ${found.time}`,
      iso: `${found.date}T${found.time}:00`,
      timeKnown: true,
    };
    timeEnrichedCount += 1;
  }
  console.log(`Corpus Lattice v1.3 recovered-time enrichment: ${timeEnrichedCount} records gained a real time (previously date-only/unknown).`);

  entries.sort((a, b) => {
    const ak = a.recordedDate ? a.recordedDate.iso : '9999';
    const bk = b.recordedDate ? b.recordedDate.iso : '9999';
    return ak < bk ? -1 : ak > bk ? 1 : 0;
  });
  for (const e of entries) {
    const dateKey = e.recordedDate ? e.recordedDate.key : null;
    e.id = makeId(dateKey, e.title, usedIds);
    e.dateLabel = e.recordedDate
      ? (e.recordedDate.timeKnown ? formatDateLabel(e.recordedDate.iso) : formatDateOnlyLabel(e.recordedDate.iso))
      : 'Date not recorded';
    e.href = `records/${e.id}-v2.html`;
  }
  const nameToId = new Map(entries.map(e => [e.name, e.id]));

  // 4. Render every record page fresh into records/ (pure generated output
  //    — clear it first so no stale pages from the old corpus linger).
  for (const old of fs.readdirSync(RECORDS_DIR)) {
    const p = path.join(RECORDS_DIR, old);
    for (let attempt = 0; attempt < 5; attempt++) {
      try { fs.rmSync(p, { recursive: true, force: true }); break; }
      catch (err) {
        if (err.code !== 'EBUSY' || attempt === 4) throw err;
        const waitMs = 200 * (attempt + 1);
        const until = Date.now() + waitMs;
        while (Date.now() < until) { /* brief synchronous backoff for a transient AV/indexer file lock */ }
      }
    }
  }
  for (const e of entries) {
    const html = renderPage({
      id: e.id, title: e.title, dateLabel: e.dateLabel, classification: e.classification,
      article: e.body, summary: e.summary,
    });
    fs.writeFileSync(path.join(RECORDS_DIR, `${e.id}-v2.html`), html, 'utf8');
  }
  console.log(`Rendered ${entries.length} record pages into records/.`);

  // 5. Build JC_RECORDS, including Phase 14's richer appendix-derived
  //    fields where a record's appendix carries them (never fabricated —
  //    simply omitted when the source file's appendix doesn't have that
  //    section; see parseAppendixLinks' header comment on the two real
  //    appendix formats found across the corpus).
  const jcRecords = entries.map((e, i) => {
    const rec = {
      id: e.id, order: i + 1, title: e.title, dateLabel: e.dateLabel,
      classification: e.classification, seed: null, href: e.href,
      sourceStatus: 'original', summary: e.summary, reviewed: true,
    };
    if (e.tabletAnchor) rec.tabletAnchor = e.tabletAnchor;
    if (e.doctrinalThemesCarried) rec.doctrinalThemesCarried = e.doctrinalThemesCarried;
    if (e.lexiconJoints && e.lexiconJoints.length) rec.lexiconJoints = e.lexiconJoints;
    if (e.chiasticMirror && e.chiasticMirror.length) rec.chiasticMirror = e.chiasticMirror;
    if (e.doctrinalSpine && (e.doctrinalSpine.seed || e.doctrinalSpine.growth || e.doctrinalSpine.tablet)) {
      const resolveStep = (step) => {
        if (!step) return null;
        const out = { label: step.label, gloss: step.gloss };
        if (step.basename) {
          const targetName = resolveTarget(step.basename);
          const targetId = targetName ? nameToId.get(targetName) : null;
          if (targetId && targetId !== e.id) out.recordId = targetId;
        }
        return out;
      };
      rec.doctrinalSpine = {
        seed: resolveStep(e.doctrinalSpine.seed),
        growth: resolveStep(e.doctrinalSpine.growth),
        tablet: resolveStep(e.doctrinalSpine.tablet),
      };
    }
    return rec;
  });

  // 6. Build JC_EDGES from every parsed appendix's typed links (interim —
  //    immediately superseded by rebuild-edges-from-lattice.mjs, which is
  //    the authoritative Corpus-Lattice-verified edge source; see that
  //    script's own header). Each edge now also carries a `jointType`
  //    (Phase 14) so the record page / Threads page can render the real
  //    structural relationship — doctrinal-spine-seed/-growth/-tablet,
  //    thread-joint, lexicon-joint, chiastic-mirror, or the generic
  //    cross-reference fallback — instead of one flat label. This script
  //    ALSO writes assets/appendix-joints.json: a from->to->{jointType,
  //    note} lookup that rebuild-edges-from-lattice.mjs consults so a
  //    Corpus-Lattice-verified edge can be enriched with the real joint
  //    type WITHOUT ever trusting an appendix-only (unverified) edge.
  const newEdges = [];
  const edgeKeys = new Set();
  const jointHints = {}; // "fromId->toId" -> { jointType, note }
  let linksTotal = 0, linksResolvedToRecord = 0, linksSkippedNonMeditation = 0, linksUnresolved = 0;
  for (const e of entries) {
    for (const link of e.links) {
      linksTotal += 1;
      if (link.type === 'tablet-anchor') { linksSkippedNonMeditation += 1; continue; }
      const targetName = resolveTarget(link.basename);
      if (!targetName) { linksUnresolved += 1; continue; }
      const targetId = nameToId.get(targetName);
      if (!targetId) { linksSkippedNonMeditation += 1; continue; }
      if (targetId === e.id) continue; // self-link
      linksResolvedToRecord += 1;
      const jointType = link.type || 'cross-reference';
      const note = link.displayText.replace(/^\d{2}-\d{2}(?:\s+at\s+\d{2}[:_]\d{2})?\s*[·]?\s*/i, '').trim() || `${jointType} joint`;
      const key = `${e.id}->${targetId}->${jointType}`;
      if (!edgeKeys.has(key)) {
        edgeKeys.add(key);
        newEdges.push({
          from: e.id,
          to: targetId,
          type: 'continues',
          jointType,
          status: 'editorial',
          note,
          source: `Verified against the corpus's own cross-reference record — ${jointType} joint.`,
        });
      }
      // Record the richest hint per (from,to) pair — a non-generic
      // jointType always wins over 'cross-reference' if both appear.
      const hintKey = `${e.id}->${targetId}`;
      const existing = jointHints[hintKey];
      if (!existing || (existing.jointType === 'cross-reference' && jointType !== 'cross-reference')) {
        jointHints[hintKey] = { jointType, note };
      }
    }
  }
  console.log(`Appendix links scanned: ${linksTotal}`);
  console.log(`  resolved to a real meditation-to-meditation edge: ${linksResolvedToRecord}`);
  console.log(`  skipped (Stone Tablet / non-meditation target): ${linksSkippedNonMeditation}`);
  console.log(`  unresolved (no matching local file): ${linksUnresolved}`);
  console.log(`New edges created: ${newEdges.length}`);

  const jointHintsCount = Object.keys(jointHints).length;
  fs.writeFileSync(
    path.join(ROOT, 'assets', 'appendix-joints.json'),
    JSON.stringify(jointHints, null, 0),
    'utf8'
  );
  console.log(`Wrote assets/appendix-joints.json: ${jointHintsCount} (from->to) joint-type hints.`);

  // 7. Remap JC_THREADS onto the new id set (by title+date match against
  //    the OLD JC_RECORDS, since ids are only stable when titles are).
  const src0 = fs.readFileSync(DATA_PATH, 'utf8');
  const { value: oldJcRecords } = loadArray(src0, 'JC_RECORDS');
  const { value: oldJcThreads } = loadArray(src0, 'JC_THREADS');
  const oldById = new Map(oldJcRecords.map(r => [r.id, r]));
  const newByNormTitle = new Map(jcRecords.map(r => [normalizeTitle(r.title), r]));

  let remapped = 0, unresolvedThreadIds = [];
  const newThreads = oldJcThreads.map(t => {
    const newSequence = t.sequence.map(oldId => {
      // Already valid in the new set (unchanged id)?
      if (newByNormTitle.has(normalizeTitle(oldById.get(oldId)?.title || ''))) {
        const stillDirect = jcRecords.find(r => r.id === oldId);
        if (stillDirect) return oldId;
      }
      const oldRec = oldById.get(oldId);
      if (oldRec) {
        const match = newByNormTitle.get(normalizeTitle(oldRec.title));
        if (match) { remapped += 1; return match.id; }
      }
      unresolvedThreadIds.push(`${t.id}: ${oldId}`);
      return oldId; // leave as-is, flagged below
    });
    return { ...t, sequence: newSequence };
  });
  console.log(`JC_THREADS ids remapped (title match, id changed): ${remapped}`);
  if (unresolvedThreadIds.length) {
    console.log(`JC_THREADS ids NOT resolved in the new record set (needs manual review):`);
    for (const u of unresolvedThreadIds) console.log(`  - ${u}`);
  }

  // 8. Write everything back.
  let out = src0;
  out = replaceArray(out, 'JC_RECORDS', jcRecords);
  out = replaceArray(out, 'JC_EDGES', newEdges);
  out = replaceArray(out, 'JC_THREADS', newThreads);
  out = out.replace(/Last updated: [^\n]+/, `Last updated: ${new Date().toISOString()} (regenerated by scripts/build-records2-corpus.mjs — Phase 11 full rebuild from records-2/)`);
  fs.writeFileSync(DATA_PATH, out, 'utf8');
  console.log(`\nWrote assets/records-data.js: ${jcRecords.length} records, ${newEdges.length} edges, ${newThreads.length} threads (unchanged count).`);
}

// Only run when invoked directly (`node scripts/build-records2-corpus.mjs`),
// not when another script imports this module's helper functions (see
// scripts/rebuild-edges-from-lattice.mjs, which reuses parseRawRecord/makeId
// to independently re-derive the same filename->id mapping this script
// produces, without re-triggering a full page regeneration).
if (process.argv[1] && path.resolve(fileURLToPath(import.meta.url)) === path.resolve(process.argv[1])) {
  main();
}
