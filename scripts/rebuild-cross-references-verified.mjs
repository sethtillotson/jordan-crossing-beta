#!/usr/bin/env node
/**
 * scripts/rebuild-cross-references-verified.mjs
 *
 * Phase 10 — TRUTH CORRECTION. The owner discovered that the cross-reference
 * infrastructure built in Phases 6–9 (parsed from Pass-7 through Pass-17
 * summary ledger documents) was partly hallucinated: link targets and Tablet
 * labels did not always match the real content of the files they claimed to
 * connect. The owner has since hand-verified every meditation's Cross-
 * Reference appendix against the actual 8 Stone Tablet volumes themselves,
 * correcting mislabeled tablet anchors, removing wrong links, and adding
 * missing ones — and supplied the corrected corpus as a complete bundle
 * (`verified-source-docs/`) containing all 458 real meditation files (each
 * carrying its own embedded, corrected Cross-Reference Appendix), the 9
 * Stone Tablet volumes, and 18 corrected Pass Ledgers.
 *
 * This script REPLACES the entire JC_EDGES array (deleting every edge built
 * by the previous integrate-passes-*.mjs / integrate-pass-17.mjs scripts,
 * since their source data is now known-unreliable) and rebuilds it entirely
 * from the verified per-file appendices — the ground truth the owner
 * actually checked phrase-by-phrase against the Stone Tablets. It also:
 *   - Adds a `tabletAnchor` field per record (the corrected Stone Tablet
 *     window/volume the file truly belongs to — distinct from the four
 *     named JC_THREADS, which this pass does NOT touch; see the script's
 *     own final report for that scope boundary).
 *   - Promotes any currently-mirrored record that now has a verified
 *     appendix to `reviewed: true` (same established mechanic as prior
 *     integration scripts).
 *   - Mirrors any of the 458 verified files with NO existing local record
 *     at all (closing the historical "not yet uploaded" gap) as new
 *     reviewed records.
 *
 * Filename-matching note: the verified bundle's on-disk filenames are
 * shortened (README's own documented "309 filenames shortened for archive"
 * change) while this repository's records/*.md retain the original long
 * filenames the memo: links reference — AND this repository's own raw
 * filenames carry pre-existing incidental truncation (a Windows path-length
 * artifact from an earlier upload, unrelated to this correction). Both are
 * handled by matching on the LONGEST true common character-prefix between
 * a verified filename and a repo filename (with a length-difference
 * tiebreaker), not by naive suffix-stripping or naive equality — verified
 * against zero ambiguous ties across all 411 repo files before this script
 * was written (see scripts/_diag_verified_match.mjs, since removed).
 *
 * Run from the repository root: node scripts/rebuild-cross-references-verified.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RECORDS_DIR = path.join(ROOT, 'records');
const DATA_PATH = path.join(ROOT, 'assets', 'records-data.js');
const VERIFIED_ROOT = path.join(ROOT, 'verified-source-docs', 'PLAUD-Meditations-Corpus_2026-09-02', 'PLAUD-Meditations-Corpus', 'PLAUD Meditations');

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
// Filesystem walk + title/date parsing (same logic as prior generators).
// ─────────────────────────────────────────────────────────────────────────

function walk(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (name.endsWith('.md')) out.push(full);
  }
}

function cleanMarkdownArtifacts(text) {
  let out = text;
  out = out.replace(/<span[^>]*dir=["']rtl["'][^>]*>([^<]*)<\/span>/gi, '$1');
  out = out.replace(/<img[^>]*>/gi, '');
  out = out.replace(/<!--[\s\S]*?-->/g, '');
  out = out.replace(/<[^>]+>/g, '');
  out = out.replace(/\\([#*|_\[\]()])/g, '$1');
  return out;
}
function stripMarkdownDecoration(s) {
  return s.replace(/^\*\*[^*]+:\*\*\s*/, '').replace(/\*\*/g, '').replace(/^#+\s*/, '').trim();
}
function titleFromParsed(metaTitle, displayHeading, filename) {
  return (metaTitle || displayHeading || filename.replace(/\.md$/, ''))
    .replace(/^\d{2}-\d{2}(?:\s+at\s+\d{2}[:_]\d{2})?\s*[—-]?\s*/i, '')
    .trim() || displayHeading || filename;
}
function normalizeTitle(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function parseRawRecord(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const cleaned = cleanMarkdownArtifacts(raw);
  const titleMatch = cleaned.match(/^\s*#\s+(.+)$/m);
  const metaTitleMatch = cleaned.match(/\*\*Title:\*\*\s*(.+)$/m);
  const recordedMatch = cleaned.match(/\*\*Recorded:\*\*\s*(.+)$/m);
  const classificationMatch = cleaned.match(/\*\*Classification:\*\*\s*(.+)$/m);

  let summary = '';
  const openingIdx = cleaned.search(/##[^\n]*Opening Observation/i);
  if (openingIdx !== -1) {
    const afterOpening = cleaned.slice(openingIdx);
    const paraMatch = afterOpening.match(/##[^\n]*Opening Observation[^\n]*\n+([^\n]+(?:\n(?!\n)[^\n]+)*)/i);
    if (paraMatch) summary = paraMatch[1].trim();
  }
  if (!summary && metaTitleMatch) summary = metaTitleMatch[1].trim();
  summary = summary.replace(/\s+/g, ' ').slice(0, 260).trim();
  if (summary.length === 260) summary = summary.replace(/\s+\S*$/, '') + '…';

  let recordedDate = null;
  if (recordedMatch && !/not provided/i.test(recordedMatch[1])) {
    const dt = recordedMatch[1].trim();
    const m = dt.match(/(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2})/);
    if (m) recordedDate = { key: `${m[1]} ${m[2]}`, iso: `${m[1]}T${m[2]}:00`, timeKnown: true };
  }
  if (!recordedDate) {
    const base = path.basename(filePath);
    const fm = base.match(/^(\d{2})-(\d{2})/);
    if (fm) {
      const mm = fm[1]; const dd = fm[2];
      recordedDate = { key: `2026-${mm}-${dd} __:__`, iso: `2026-${mm}-${dd}T12:00:00`, timeKnown: false };
    }
  }

  const displayHeading = titleMatch ? stripMarkdownDecoration(titleMatch[1]) : null;
  const metaTitle = metaTitleMatch ? stripMarkdownDecoration(metaTitleMatch[1]) : null;
  const title = titleFromParsed(metaTitle, displayHeading, path.basename(filePath));

  return {
    filePath, title, recordedDate,
    classification: classificationMatch ? classificationMatch[1].trim() : 'Meditation',
    body: cleaned, summary,
    isMeditation: /##[^\n]*Opening Observation/i.test(cleaned),
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Verified-file appendix parsing: Tablet Anchor + typed cross-reference
// memo: links.
// ─────────────────────────────────────────────────────────────────────────

const TABLET_ROMAN_TO_ID = {
  'I': 'I', 'II': 'II', 'III': 'III', 'IV': 'IV', 'V': 'V',
  'VI': 'VI', 'VII': 'VII', 'VIII': 'VIII',
};

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
// length-difference tiebreaker (see script header comment).
// ─────────────────────────────────────────────────────────────────────────

function commonPrefixLen(a, b) {
  const n = Math.min(a.length, b.length);
  let i = 0;
  while (i < n && a[i] === b[i]) i++;
  return i;
}

function bestMatch(nameBase, candidateBases, minLen = 20) {
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
// MAIN
// ─────────────────────────────────────────────────────────────────────────

function main() {
  // 1. Index verified files.
  const verifiedFiles = [];
  walk(VERIFIED_ROOT, verifiedFiles);
  const verifiedByName = new Map(); // basename (with .md) -> fullpath
  for (const f of verifiedFiles) {
    const name = path.basename(f);
    if (name === 'PLAUD Meditations · Master Index.md') continue;
    verifiedByName.set(name, f);
  }
  console.log(`Verified meditation files: ${verifiedByName.size}`);

  const verifiedBaseNames = [...verifiedByName.keys()].map(n => n.slice(0, -3));

  // 2. Parse every verified file's Tablet Anchor + typed appendix links.
  const verifiedParsed = new Map(); // basename (with .md) -> { title, tabletAnchor, links, recordedDate, classification, body }
  let noTabletAnchor = 0;
  for (const [name, fullpath] of verifiedByName) {
    const content = fs.readFileSync(fullpath, 'utf8');
    const parsed = parseRawRecord(fullpath);
    const tabletAnchor = parseTabletAnchor(content);
    if (!tabletAnchor) noTabletAnchor++;
    const links = parseAppendixLinks(content);
    verifiedParsed.set(name, { ...parsed, tabletAnchor, links });
  }
  console.log(`Verified files without a parseable Tablet Anchor: ${noTabletAnchor}`);

  // 3. Match repo raw files -> verified files.
  const repoFileNames = fs.readdirSync(RECORDS_DIR).filter(n => n.endsWith('.md'));
  const repoToVerified = new Map(); // repoFileName -> verifiedFileName
  const unmatchedRepo = [];
  for (const repoName of repoFileNames) {
    const repoBase = repoName.slice(0, -3);
    const match = bestMatch(repoBase, verifiedBaseNames);
    if (match) repoToVerified.set(repoName, match + '.md');
    else unmatchedRepo.push(repoName);
  }
  console.log(`Repo raw files matched to a verified file: ${repoToVerified.size} / ${repoFileNames.length}`);
  console.log(`Repo raw files NOT matched (left untouched — not part of the verified 458): ${unmatchedRepo.length}`);

  const matchedVerifiedNames = new Set(repoToVerified.values());
  const verifiedNotInRepo = [...verifiedByName.keys()].filter(n => !matchedVerifiedNames.has(n));
  console.log(`Verified files with NO existing repo record (will be newly mirrored): ${verifiedNotInRepo.length}`);

  // 4. Resolve each verified file's link basenames to OTHER verified files
  //    (peer resolution within the verified corpus itself).
  function resolveVerifiedTarget(basename) {
    if (verifiedByName.has(basename)) return basename;
    const base = basename.replace(/\.md$/, '');
    const match = bestMatch(base, verifiedBaseNames, 20);
    return match ? match + '.md' : null;
  }

  // 5. Build repo raw filename -> JC_RECORDS id, via content-derived title
  //    (the project's established anti-filename-mismatch rule).
  const src0 = fs.readFileSync(DATA_PATH, 'utf8');
  const { value: jcRecords } = loadArray(src0, 'JC_RECORDS');
  const byNormTitle = new Map();
  jcRecords.forEach(r => byNormTitle.set(normalizeTitle(r.title), r));
  const usedIds = new Set(jcRecords.map(r => r.id));

  const repoParsedCache = new Map(); // repoFileName -> parseRawRecord() result
  const repoFileToRecordId = new Map(); // repoFileName -> JC_RECORDS id (only if matched)
  for (const repoName of repoFileNames) {
    const parsed = parseRawRecord(path.join(RECORDS_DIR, repoName));
    repoParsedCache.set(repoName, parsed);
    const rec = byNormTitle.get(normalizeTitle(parsed.title));
    if (rec) repoFileToRecordId.set(repoName, rec.id);
  }

  // Verified filename -> repo filename (reverse of repoToVerified), for
  // resolving appendix link targets back to a JC_RECORDS id.
  const verifiedToRepoFile = new Map();
  for (const [repoName, verifiedName] of repoToVerified) verifiedToRepoFile.set(verifiedName, repoName);

  function slugifyTitle(title) {
    return title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().split(/\s+/)
      .filter(w => w && !['the', 'a', 'an', 'and', 'of', 'in', 'on', 'to', 'is', 'for'].includes(w))
      .slice(0, 4).join('-') || 'meditation';
  }
  function makeId(dateKey, title) {
    const datePart = dateKey ? dateKey.slice(5, 10) : '00-00';
    const base = `${datePart}-${slugifyTitle(title)}`;
    let candidate = base; let n = 2;
    while (usedIds.has(candidate)) { candidate = `${base}-${n}`; n += 1; }
    usedIds.add(candidate);
    return candidate;
  }
  function formatDateLabel(iso) {
    const d = new Date(iso + 'Z');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()} · ${hh}:${mm}`;
  }
  function formatDateOnlyLabel(iso) {
    const d = new Date(iso + 'Z');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()} · time not recorded`;
  }
  const MONTH_NUM = { Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12' };
  function dateLabelToIso(dateLabel) {
    const m = dateLabel.match(/^(\w{3}) (\d{1,2}), (\d{4})(?:\s*·\s*(\d{2}:\d{2}))?/);
    if (!m) return null;
    const mm = MONTH_NUM[m[1]] || '01'; const dd = String(m[2]).padStart(2, '0');
    const yyyy = m[3]; const time = m[4] || '12:00';
    return `${yyyy}-${mm}-${dd}T${time}:00`;
  }

  function renderPage({ id, title, dateLabel, classification, article, summary, reviewed }) {
    const escAttr = (s) => String(s).replace(/"/g, '&quot;');
    const captionSuffix = reviewed ? '' : ' · Not Yet Reviewed';
    const sourceStatusBody = reviewed
      ? 'This page displays the imported source text itself. Editorial thread links are outside this record and are labeled separately.'
      : 'This record has been mirrored into the app from the author\u2019s own corpus but has not yet been reviewed against the Cross-Reference passes \u2014 so no thread connections are shown for it yet. The original text below is exactly as recorded.';
    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <meta name="viewport" content="width=device-width,initial-scale=1">

  <title>${escAttr(title)} — Interior Beta</title>
  <meta name="description" content="${escAttr(summary)}">
  <link rel="stylesheet" href="../assets/design-v2.css?v=20260901V2">
  <link rel="stylesheet" href="../assets/audio-player.css?v=20260901V2">
</head>
<body data-record-id="${escAttr(id)}">
  <a class="skip-link" href="#main-content">Skip to main content</a>

  <div class="beta-banner" role="banner">
    <span class="badge">INTERIOR BETA</span>
    <span>Private workspace · Not for public distribution</span>
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
        <p class="record-caption">Original Record · Local Corpus Bundle${captionSuffix}</p>
        <h1 class="page-title">${title}</h1>
        <p class="page-subtitle">${dateLabel}</p>

        <div class="source-row">
          <span class="source-badge">Original record</span>
          <span>Mirrored locally · ${classification}</span>
        </div>

        <div class="callout">
          <p class="caption">Source Status</p>
          <p>${sourceStatusBody}</p>
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

      <section class="carry-section" aria-label="Carry a question forward">
        <p class="carry-prompt">Is there a question this record leaves you with?</p>
        <p class="carry-sub">You may carry it forward, silently, to the next record — or write your own.</p>

        <div class="carry-panel">
          <div class="carry-button-group">
            <button class="btn btn-primary" type="button" id="carry-btn">
              Carry this question forward
            </button>
            <button class="btn btn-secondary" type="button" id="write-own-btn">
              Write my own question
            </button>
          </div>

          <div class="carry-textarea-wrapper" id="carry-write-panel">
            <textarea class="carry-textarea" id="carry-textarea" placeholder="Write your question here..."></textarea>
            <div style="display: flex; gap: var(--space-3);">
              <button class="btn btn-primary" type="button" id="carry-save-btn">
                Save question
              </button>
              <button class="btn btn-secondary" type="button" id="carry-cancel-btn">
                Cancel
              </button>
            </div>
          </div>

          <div class="carry-status" id="carry-status">
            <strong>Question saved:</strong> <span id="carry-status-text"></span>
            <button class="btn btn-secondary" type="button" id="carry-clear-btn" style="margin-top: var(--space-2);">
              Clear saved question
            </button>
          </div>
        </div>
      </section>

      <section class="related-records" id="related-records-mount" aria-label="Related records"></section>

      <div class="doorway-themes-mount" id="doorway-themes-mount"></div>

      <div class="movement-divider"></div>

      <section class="return-panel" aria-label="You have reached the end of this encounter">
        <p class="return-prompt">You have reached the end of this encounter.</p>
        <p class="return-sub">
          You do not need to force a conclusion. You may continue, return later, read the Scripture, or leave this page and carry the question honestly.
        </p>

        <div class="return-choices">
          <button class="depth-card" type="button" data-release-action="remain">
            <div class="depth-title">Remain here</div>
            Return to the top of this record
          </button>

          <a class="depth-card" href="../threads.html">
            <div class="depth-title">Follow the thread</div>
            See the constellation this record belongs to
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
            Close this page and carry the question honestly
          </button>
        </div>
      </section>

      <div class="graph-nav" id="graph-nav-mount"></div>

      <div class="reviewed-threads" id="threads-mount"></div>
    </div>
  </main>

  <footer>
    <em>A Living Topology of Transformation</em> · Interior beta · Soli Deo Gloria
  </footer>

  <script src="../assets/records-data.js?v=20260901V2"></script>
  <script src="../assets/audio-player.js?v=20260901V2"></script>
  <script src="../assets/design-v2-logic.js?v=20260901V2"></script>
</body>
</html>
`;
  }

  // 6. Mirror any verified files with no existing repo record.
  let created = 0;
  for (const verifiedName of verifiedNotInRepo) {
    const vp = verifiedParsed.get(verifiedName);
    if (!vp.isMeditation) continue; // not a real meditation body (e.g. legacy artifact)
    const normTitle = normalizeTitle(vp.title);
    if (byNormTitle.has(normTitle)) {
      // Already exists under a different raw filename our prefix-matcher
      // didn't pair (e.g. a duplicate raw file, or truncation beyond
      // recognition) — link it directly by the record it already resolves
      // to, so tabletAnchor/edges still attach correctly in steps 8-9.
      const rec = byNormTitle.get(normTitle);
      verifiedToRepoFile.set(verifiedName, verifiedName);
      repoFileToRecordId.set(verifiedName, rec.id);
      continue;
    }
    const dateKey = vp.recordedDate ? vp.recordedDate.key : null;
    const id = makeId(dateKey, vp.title);
    const dateLabel = vp.recordedDate
      ? (vp.recordedDate.timeKnown ? formatDateLabel(vp.recordedDate.iso) : formatDateOnlyLabel(vp.recordedDate.iso))
      : 'Date not recorded';
    // Write the raw source file into records/ under the verified (short) name.
    fs.writeFileSync(path.join(RECORDS_DIR, verifiedName), fs.readFileSync(verifiedByName.get(verifiedName)), 'utf8');
    const html = renderPage({ id, title: vp.title, dateLabel, classification: vp.classification, article: vp.body, summary: vp.summary, reviewed: true });
    fs.writeFileSync(path.join(RECORDS_DIR, `${id}-v2.html`), html, 'utf8');
    jcRecords.push({
      id, order: 0, title: vp.title, dateLabel, classification: vp.classification,
      seed: null, href: `records/${id}-v2.html`, sourceStatus: 'original',
      summary: vp.summary, reviewed: true,
    });
    byNormTitle.set(normTitle, jcRecords[jcRecords.length - 1]);
    repoFileToRecordId.set(verifiedName, id);
    verifiedToRepoFile.set(verifiedName, verifiedName);
    created += 1;
  }
  console.log(`New records mirrored from verified-only files: ${created}`);

  // 7. Promote any currently-mirrored record with a matched verified file.
  let promoted = 0;
  for (const [repoName, verifiedName] of repoToVerified) {
    const recId = repoFileToRecordId.get(repoName);
    if (!recId) continue;
    const rec = jcRecords.find(r => r.id === recId);
    if (!rec) continue;
    if (rec.reviewed === false) {
      const vp = verifiedParsed.get(verifiedName);
      const repoParsed = repoParsedCache.get(repoName);
      const html = renderPage({
        id: rec.id, title: rec.title, dateLabel: rec.dateLabel, classification: repoParsed.classification,
        article: repoParsed.body, summary: repoParsed.summary || rec.summary, reviewed: true,
      });
      fs.writeFileSync(path.join(RECORDS_DIR, `${rec.id}-v2.html`), html, 'utf8');
      rec.reviewed = true;
      promoted += 1;
    }
  }
  console.log(`Mirrored records promoted to reviewed (now have a verified appendix): ${promoted}`);

  // 8. Attach tabletAnchor to every record that has a verified match
  //    (includes both real-raw-file matches and title-only fallback links).
  let tabletAnchorsSet = 0;
  for (const [verifiedName, vp] of verifiedParsed) {
    const repoFileKey = verifiedToRepoFile.get(verifiedName);
    const recId = repoFileKey ? repoFileToRecordId.get(repoFileKey) : repoFileToRecordId.get(verifiedName);
    if (!recId) continue;
    const rec = jcRecords.find(r => r.id === recId);
    if (!rec) continue;
    if (vp.tabletAnchor) {
      rec.tabletAnchor = vp.tabletAnchor;
      tabletAnchorsSet += 1;
    }
  }
  console.log(`Records with a corrected tabletAnchor set: ${tabletAnchorsSet}`);

  // 9. Rebuild JC_EDGES wholesale from verified appendix links.
  const newEdges = [];
  const edgeKeys = new Set();
  let linksTotal = 0, linksResolvedToRecord = 0, linksSkippedNonMeditation = 0, linksUnresolved = 0;
  for (const [verifiedName, vp] of verifiedParsed) {
    const sourceRepoFile = verifiedToRepoFile.get(verifiedName);
    const sourceRecId = sourceRepoFile ? repoFileToRecordId.get(sourceRepoFile) : repoFileToRecordId.get(verifiedName);
    if (!sourceRecId) continue; // source itself has no local record (shouldn't happen post-step-6)
    for (const link of vp.links) {
      linksTotal += 1;
      if (link.type === 'tablet-anchor') { linksSkippedNonMeditation += 1; continue; } // points at Stone Tablets/refs, not a meditation
      const targetVerifiedName = resolveVerifiedTarget(link.basename);
      if (!targetVerifiedName) { linksUnresolved += 1; continue; }
      if (targetVerifiedName === verifiedName) continue; // self-link
      const targetRepoFile = verifiedToRepoFile.get(targetVerifiedName);
      const targetRecId = targetRepoFile ? repoFileToRecordId.get(targetRepoFile) : repoFileToRecordId.get(targetVerifiedName);
      if (!targetRecId) { linksSkippedNonMeditation += 1; continue; } // target not a mirrored meditation (e.g. Stone Tablet, or not-yet-created)
      if (targetRecId === sourceRecId) continue;
      linksResolvedToRecord += 1;
      const key = `${sourceRecId}->${targetRecId}->${link.type}`;
      if (edgeKeys.has(key)) continue;
      edgeKeys.add(key);
      newEdges.push({
        from: sourceRecId,
        to: targetRecId,
        type: 'continues',
        status: 'editorial',
        note: link.displayText.replace(/^\d{2}-\d{2}(?:\s+at\s+\d{2}[:_]\d{2})?\s*[·]?\s*/i, '').trim() || `${link.type} joint`,
        source: `Verified Cross-Reference Appendix (corrected, Pass 18 truth-correction) — ${link.type} joint.`,
      });
    }
  }
  console.log(`Appendix links scanned: ${linksTotal}`);
  console.log(`  resolved to a real meditation-to-meditation edge: ${linksResolvedToRecord}`);
  console.log(`  skipped (points to Stone Tablet / non-meditation doc): ${linksSkippedNonMeditation}`);
  console.log(`  unresolved (target not found anywhere in verified corpus): ${linksUnresolved}`);
  console.log(`New JC_EDGES built (deduped): ${newEdges.length}`);

  // 10. Recompute chronological order across the WHOLE merged record set.
  jcRecords.forEach(r => { r._sortIso = dateLabelToIso(r.dateLabel); });
  jcRecords.sort((a, b) => {
    if (a._sortIso && b._sortIso) return a._sortIso < b._sortIso ? -1 : 1;
    if (a._sortIso) return -1;
    if (b._sortIso) return 1;
    return 0;
  });
  jcRecords.forEach((r, i) => { r.order = i + 1; delete r._sortIso; });

  // 11. Write back: JC_RECORDS first, then JC_EDGES on the updated string.
  let out = replaceArray(src0, 'JC_RECORDS', jcRecords);
  out = replaceArray(out, 'JC_EDGES', newEdges);
  fs.writeFileSync(DATA_PATH, out, 'utf8');

  const reviewedCount = jcRecords.filter(r => r.reviewed !== false).length;
  const mirroredCount = jcRecords.filter(r => r.reviewed === false).length;
  console.log('\nDone.');
  console.log(`Total records: ${jcRecords.length} (${reviewedCount} reviewed, ${mirroredCount} mirrored)`);
  console.log(`Total edges: ${newEdges.length} (previous edge set fully replaced)`);
  console.log('Next: run `node scripts/tag-encounter-dimensions.mjs` to re-tag the full record set.');
}

main();
