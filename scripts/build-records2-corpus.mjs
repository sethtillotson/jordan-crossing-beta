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
  title = title.replace(/^\d{2}-\d{2}(?:\s+(?:to|at)\s+\d{2}(?:[:_-]\d{2})?)?\s*[—-]?\s*/i, '').trim() || title;
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
// Cross-Reference Appendix parsing: Tablet Anchor + typed memo: links.
// ─────────────────────────────────────────────────────────────────────────

function parseTabletAnchor(content) {
  const idx = content.indexOf('### Tablet Anchor');
  if (idx === -1) return null;
  const after = content.slice(idx + '### Tablet Anchor'.length, idx + '### Tablet Anchor'.length + 400);
  const m = after.match(/\*\*(Stone Tablet[^*]+)\*\*\s*(?:—|--)?\s*([^\n.]*)/);
  if (!m) return null;
  return { label: m[1].trim(), window: (m[2] || '').trim().replace(/^[.\s]+|[.\s]+$/g, '') };
}

const TYPE_KEYWORDS = [
  { re: /doctrinal spine/i, type: 'doctrinal-spine' },
  { re: /thread joint/i, type: 'thread' },
  { re: /thread role/i, type: 'thread' },
  { re: /lexicon joint/i, type: 'lexicon' },
  { re: /chi[ar]stic mirror/i, type: 'chiastic-mirror' }, // covers the corpus's own "Chiratic" typo
  { re: /tablet anchor/i, type: 'tablet-anchor' },
];
function classifyHeading(line) {
  for (const kw of TYPE_KEYWORDS) if (kw.re.test(line)) return kw.type;
  return null;
}

function parseAppendixLinks(content) {
  const startMatch = /^## Cross-Reference/m.exec(content);
  if (!startMatch) return [];
  const tabletIdx = content.indexOf('### Tablet Anchor', startMatch.index);
  let endIdx = content.length;
  if (tabletIdx !== -1) {
    const nextHeading = content.slice(tabletIdx + 10).search(/^#{2,3}\s+/m);
    endIdx = nextHeading === -1 ? content.length : tabletIdx + 10 + nextHeading;
  }
  const appendix = content.slice(startMatch.index, endIdx);
  const lines = appendix.split(/\r?\n/);

  const links = [];
  let currentType = null;
  for (const rawLine of lines) {
    const line = rawLine.trim();
    const headingMatch = line.match(/^#{2,4}\s+(.+)$/) || line.match(/^\*\*([A-Z][^*]{2,60}):\*\*\s*$/);
    if (headingMatch) {
      const t = classifyHeading(headingMatch[1]);
      if (t) currentType = t;
      continue;
    }
    const linkRe = /\[([^\]]+)\]\(memo:([^)]+)\)/g;
    let m;
    while ((m = linkRe.exec(line))) {
      const displayText = m[1];
      let rawLink;
      try { rawLink = decodeURIComponent(m[2]); } catch { rawLink = m[2]; }
      links.push({ displayText, rawLink, basename: path.basename(rawLink), type: currentType || 'cross-reference' });
    }
  }
  return links;
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

      <section class="related-records" id="related-records-mount" aria-label="Related records"></section>

      <div class="doorway-themes-mount" id="doorway-themes-mount"></div>

      <div class="graph-nav" id="graph-nav-mount"></div>

      <div class="reviewed-threads" id="threads-mount"></div>

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
    const links = parseAppendixLinks(content);
    parsedByName.set(name, { ...parsed, tabletAnchor, links });
  }
  console.log(`Parsed as real meditation content: ${parsedByName.size}`);
  console.log(`Skipped (not meditation-shaped content): ${skippedNotMeditation}`);
  console.log(`Skipped (corrupted/binary source file): ${skippedCorrupted}`);

  function resolveTarget(basename) {
    if (parsedByName.has(basename)) return basename;
    const base = basename.replace(/\.md$/, '');
    const match = bestMatch(base, baseNames, 20);
    return match || null;
  }

  // 3. Assign a deterministic id + href to every parsed meditation, sorted
  //    chronologically for stable, readable ids and `order`.
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

  // 5. Build JC_RECORDS.
  const jcRecords = entries.map((e, i) => {
    const rec = {
      id: e.id, order: i + 1, title: e.title, dateLabel: e.dateLabel,
      classification: e.classification, seed: null, href: e.href,
      sourceStatus: 'original', summary: e.summary, reviewed: true,
    };
    if (e.tabletAnchor) rec.tabletAnchor = e.tabletAnchor;
    return rec;
  });

  // 6. Build JC_EDGES from every parsed appendix's typed links.
  const newEdges = [];
  const edgeKeys = new Set();
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
      const key = `${e.id}->${targetId}->${link.type}`;
      if (edgeKeys.has(key)) continue;
      edgeKeys.add(key);
      newEdges.push({
        from: e.id,
        to: targetId,
        type: 'continues',
        status: 'editorial',
        note: link.displayText.replace(/^\d{2}-\d{2}(?:\s+at\s+\d{2}[:_]\d{2})?\s*[·]?\s*/i, '').trim() || `${link.type} joint`,
        source: `Verified against the corpus's own cross-reference record — ${link.type} joint.`,
      });
    }
  }
  console.log(`Appendix links scanned: ${linksTotal}`);
  console.log(`  resolved to a real meditation-to-meditation edge: ${linksResolvedToRecord}`);
  console.log(`  skipped (Stone Tablet / non-meditation target): ${linksSkippedNonMeditation}`);
  console.log(`  unresolved (no matching local file): ${linksUnresolved}`);
  console.log(`New edges created: ${newEdges.length}`);

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
