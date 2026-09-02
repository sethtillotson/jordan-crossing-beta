#!/usr/bin/env node
/**
 * scripts/integrate-passes-7-8.mjs
 *
 * Phase 6 — integrates Pass 7 and Pass 8 Cross-References (70 more entries,
 * archive coverage 171→241) into the REVIEWED layer, growing JC_RECORDS'
 * `reviewed: true` count before any further mirroring is needed.
 *
 * This is ADDITIVE, like tag-encounter-dimensions.mjs / build-mirror-
 * records.mjs / relink-corpus-paths.mjs — it reads the current
 * assets/records-data.js, and only touches JC_RECORDS and JC_EDGES:
 *
 *   - For a pass-7/8 entry that resolves to a file already published as a
 *     REVIEWED record (reviewed: true or the original 7 seeds): nothing
 *     changes for that record; it still contributes to the new edges.
 *   - For a pass-7/8 entry that resolves to a file already published as a
 *     MIRRORED record (reviewed: false, from build-mirror-records.mjs):
 *     that record is PROMOTED — its `reviewed` flag flips to `true` and
 *     its page is regenerated in place (same id, same URL, so nothing
 *     that already links to it breaks) using the reviewed copy instead
 *     of the "Not Yet Reviewed" mirrored copy.
 *   - For a pass-7/8 entry that resolves to a file with NO existing
 *     JC_RECORDS entry at all (never mirrored, never reviewed — e.g. it
 *     was uploaded after the last build-mirror-records.mjs run): a brand
 *     new reviewed record + page is generated, same as
 *     build-corpus-records.mjs would have done.
 *   - Same-cluster ("continues") edges are built from Pass 7/8's own
 *     numbered groups, exactly like build-corpus-records.mjs does for
 *     Pass 1–6, and appended to JC_EDGES (nothing existing is removed).
 *   - `order` is recomputed for the WHOLE merged record set so
 *     chronology stays correct.
 *
 * Does NOT touch: JC_THREADS, the hand-authored cross-month "echoes"
 * edges, or any record's `encounter`/`doorwayThemes` fields — run
 * `node scripts/tag-encounter-dimensions.mjs` afterward to tag any
 * brand-new records (safe to re-run over the whole set; it recomputes
 * every record's encounter/doorwayThemes, not just missing ones).
 *
 * Run from the repository root:  node scripts/integrate-passes-7-8.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RECORDS_DIR = path.join(ROOT, 'records');
const DATA_PATH = path.join(ROOT, 'assets', 'records-data.js');

const PASS_FILES = [
  { file: 'Pass-7-Cross-References.md', passNum: 7 },
  { file: 'Pass-8-Cross-References.md', passNum: 8 },
];

// ─────────────────────────────────────────────────────────────────────────
// Generic "splice one const array out of records-data.js" helpers — same
// bracket-counting technique as tag-encounter-dimensions.mjs, generalized
// so it can be applied to JC_RECORDS and then, on the updated string,
// JC_EDGES.
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
// Pass-doc parsing (identical structure to build-corpus-records.mjs; Pass
// 7 and 8 have no NBSP-filename entries, so no alias table is needed here).
// ─────────────────────────────────────────────────────────────────────────

function parsePassFile(filePath, passNum) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const entries = [];
  let currentGroup = null;
  let groupSeqCounter = 0;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const groupMatch = line.match(/^###\s+(.+)$/);
    if (groupMatch) {
      currentGroup = groupMatch[1].trim();
      groupSeqCounter = 0;
      continue;
    }
    const itemMatch = line.match(/^(\d+)\.\s+(.*)$/);
    if (itemMatch && currentGroup) {
      groupSeqCounter += 1;
      const rest = itemMatch[2];
      const linkMatch = rest.match(/^\[([^\]]+)\]\(memo:([^)]+)\)\s*(.*)$/);
      const entry = {
        passNum,
        group: currentGroup,
        seqInGroup: groupSeqCounter,
        globalSeq: Number(itemMatch[1]),
      };
      if (linkMatch) {
        entry.displayTitle = linkMatch[1];
        entry.rawLink = decodeURIComponent(linkMatch[2]);
        entry.basename = path.basename(entry.rawLink);
        entry.annotation = linkMatch[3].replace(/^[—-]\s*/, '').trim();
        entry.hasLink = true;
      } else {
        entry.displayTitle = rest;
        entry.hasLink = false;
        entry.basename = null;
        entry.annotation = '';
      }
      entries.push(entry);
    }
  }
  return entries;
}

function resolveFile(entry, pool) {
  if (!entry.hasLink) return null; // no NBSP aliasing needed for Pass 7/8
  const target = entry.basename;
  const n = Math.min(target.length, 60);
  if (n <= 20) return null;
  for (const candidate of pool) {
    const n2 = Math.min(n, candidate.length);
    if (n2 > 20 && target.slice(0, n2) === candidate.slice(0, n2)) return candidate;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────
// Markdown cleanup + raw-file parsing (same logic as the other generators).
// ─────────────────────────────────────────────────────────────────────────

function cleanMarkdownArtifacts(text) {
  let out = text;
  out = out.replace(/<span[^>]*dir=["']rtl["'][^>]*>([^<]*)<\/span>/gi, '$1');
  out = out.replace(/<img[^>]*>/gi, '');
  out = out.replace(/<!--[\s\S]*?-->/g, '');
  out = out.replace(/<[^>]+>/g, '');
  out = out.replace(/\\([#*|_\[\]()])/g, '$1');
  out = out.replace(/(^\|[^\n]*\|[ \t]*)\n\n+(?=\|)/gm, '$1\n');
  out = out.replace(/&(?!(?:amp|lt|gt|quot|#39|#\d+);)/g, '&amp;');
  return out;
}

function stripMarkdownDecoration(s) {
  return s
    .replace(/^\*\*[^*]+:\*\*\s*/, '')
    .replace(/\*\*/g, '')
    .replace(/^#+\s*/, '')
    .trim();
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
      const mm = fm[1];
      const dd = fm[2];
      recordedDate = { key: `2026-${mm}-${dd} __:__`, iso: `2026-${mm}-${dd}T12:00:00`, timeKnown: false };
    }
  }

  return {
    filePath,
    displayHeading: titleMatch ? stripMarkdownDecoration(titleMatch[1]) : null,
    metaTitle: metaTitleMatch ? stripMarkdownDecoration(metaTitleMatch[1]) : null,
    recordedDate,
    classification: classificationMatch ? classificationMatch[1].trim() : 'Meditation',
    body: cleaned,
    summary,
    isMeditation: /##[^\n]*Opening Observation/i.test(cleaned),
  };
}

function titleFromParsed(parsed, filename) {
  return (parsed.metaTitle || parsed.displayHeading || filename.replace(/\.md$/, ''))
    .replace(/^\d{2}-\d{2}(?:\s+at\s+\d{2}[:_]\d{2})?\s*[—-]?\s*/i, '')
    .trim() || parsed.displayHeading || filename;
}

function normalizeTitle(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

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

function makeId(dateKey, title, usedIds) {
  const datePart = dateKey ? dateKey.slice(5, 10) : '00-00';
  const base = `${datePart}-${slugifyTitle(title)}`;
  let candidate = base;
  let n = 2;
  while (usedIds.has(candidate)) {
    candidate = `${base}-${n}`;
    n += 1;
  }
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
  const mm = MONTH_NUM[m[1]] || '01';
  const dd = String(m[2]).padStart(2, '0');
  const yyyy = m[3];
  const time = m[4] || '12:00';
  return `${yyyy}-${mm}-${dd}T${time}:00`;
}

// ─────────────────────────────────────────────────────────────────────────
// Page template — identical to build-mirror-records.mjs's template, which
// already supports both reviewed and mirrored copy via the `reviewed` flag.
// ─────────────────────────────────────────────────────────────────────────

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
      <!-- RECORD HEADER -->
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

      <!-- AUDIO PLAYER (Phase 3 -- renders only if this record has an audioUrl) -->
      <div class="audio-player-mount" id="audio-player-mount"></div>

      <!-- THE MEDITATION (article) -->
      <article class="record-source" aria-label="Original meditation text">${article}</article>

      <p class="caption" style="margin-top:var(--space-6)">End of imported source record.</p>

      <div class="movement-divider"></div>

      <!-- MOVEMENT 1: DISCERN -->
      <section class="discern-section" aria-label="What did you actually encounter?">
        <p class="discern-prompt">What did you actually encounter?</p>
        <p class="discern-sub">
          The site does not announce its interpretation. It asks — and offers navigation, not a conclusion.
        </p>

        <div class="discern-choices" role="group" aria-label="Choose your response">
          <button class="discern-choice" type="button" aria-pressed="false" data-reveals="discern-recognized">
            <span class="discern-choice__icon" aria-hidden="true">◈</span>
            I recognized something.
          </button>

          <button class="discern-choice" type="button" aria-pressed="false" data-reveals="discern-challenged">
            <span class="discern-choice__icon" aria-hidden="true">△</span>
            I was challenged.
          </button>

          <button class="discern-choice" type="button" aria-pressed="false" data-reveals="discern-unclear">
            <span class="discern-choice__icon" aria-hidden="true">◌</span>
            I did not understand.
          </button>

          <button class="discern-choice" type="button" aria-pressed="false" data-reveals="discern-disagree">
            <span class="discern-choice__icon" aria-hidden="true">⊘</span>
            I disagree.
          </button>

          <button class="discern-choice" type="button" aria-pressed="false" data-reveals="discern-scripture">
            <span class="discern-choice__icon" aria-hidden="true">✦</span>
            I want to examine the Scripture.
          </button>

          <button class="discern-choice" type="button" aria-pressed="false" data-reveals="discern-sit">
            <span class="discern-choice__icon" aria-hidden="true">·</span>
            I need to sit with this.
          </button>

          <button class="discern-choice" type="button" aria-pressed="false" data-reveals="discern-question">
            <span class="discern-choice__icon" aria-hidden="true">◇</span>
            This brought another question.
          </button>
        </div>

        <div class="discern-response" id="discern-recognized">
          <p class="discern-response-text">
            <strong>You recognized something.</strong> That recognition is itself worth noting. What you encountered became visible—the pattern, the truth, the moment. Hold it gently. Return to the record if the recognition deepens or shifts.
          </p>
        </div>

        <div class="discern-response" id="discern-challenged">
          <p class="discern-response-text">
            <strong>You were challenged.</strong> The record pressed against something in you. That pressure can become formation if you do not resist it. What challenged you most? That may be the question worth sitting with.
          </p>
        </div>

        <div class="discern-response" id="discern-unclear">
          <p class="discern-response-text">
            <strong>You did not understand.</strong> That is honest. This record may be too dense, too personal, or too far ahead of where you are. You might read the surrounding records, or return to this one later when more context arrives. Not every record is for every reader at every moment.
          </p>
        </div>

        <div class="discern-response" id="discern-disagree">
          <p class="discern-response-text">
            <strong>You disagree.</strong> The site is confident enough to permit refusal. What specifically conflicts with what you know or believe? That disagreement may itself be instructive—and it is valid.
          </p>
        </div>

        <div class="discern-response" id="discern-scripture">
          <p class="discern-response-text">
            <strong>You want to examine the Scripture.</strong> The record cites many passages. Read them directly in your preferred translation. Compare with what the record says. The original word often speaks louder than commentary on it.
          </p>
        </div>

        <div class="discern-response" id="discern-sit">
          <p class="discern-response-text">
            <strong>You need to sit with this.</strong> That may be the most faithful response. You do not need to resolve this today. Hold the question. Let it work on you. The Spirit often moves more in silence than in clarity.
          </p>
        </div>

        <div class="discern-response" id="discern-question">
          <p class="discern-response-text">
            <strong>This brought another question.</strong> Questions often matter more than answers. If you can name the question, you have taken a step toward wisdom. The record may have opened a door you did not know existed.
          </p>
        </div>
      </section>

      <div class="movement-divider"></div>

      <!-- MOVEMENT 2: CARRY -->
      <section class="carry-question-section" aria-label="Carry a question forward">
        <h3 class="carry-heading">Carry a question forward</h3>
        <p class="carry-description">
          If something in this record opened a question you want to keep, you can save it here. It is stored only on your device — no account, no server, no data collected.
        </p>

        <div class="carry-controls">
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

      <!-- RELATED RECORDS -->
      <section class="related-records" id="related-records-mount" aria-label="Related records"></section>

      <!-- HUMAN DOORWAYS -- theme chips (design doc section 7) -->
      <div class="doorway-themes-mount" id="doorway-themes-mount"></div>

      <div class="movement-divider"></div>

      <!-- MOVEMENT 3: RETURN -->
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

      <!-- MOVEMENT 4: GRAPH NAV -->
      <div class="graph-nav" id="graph-nav-mount"></div>

      <!-- REVIEWED THREADS -->
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

// ─────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────

function main() {
  const src0 = fs.readFileSync(DATA_PATH, 'utf8');
  const { value: jcRecords } = loadArray(src0, 'JC_RECORDS');

  const byNormTitle = new Map();
  jcRecords.forEach(r => byNormTitle.set(normalizeTitle(r.title), r));
  const usedIds = new Set(jcRecords.map(r => r.id));

  const pool = fs.readdirSync(RECORDS_DIR).filter(name => name.endsWith('.md') && /^\d/.test(name));

  // 1. Parse Pass 7 + 8 entries.
  let allEntries = [];
  for (const { file, passNum } of PASS_FILES) {
    const entries = parsePassFile(path.join(ROOT, file), passNum);
    allEntries = allEntries.concat(entries);
  }
  console.log(`Parsed ${allEntries.length} entries across Pass 7 + Pass 8.`);

  // 2. Resolve each to a raw file.
  let skippedNoFile = 0;
  for (const entry of allEntries) {
    const resolved = resolveFile(entry, pool);
    if (!resolved) { skippedNoFile += 1; continue; }
    entry.resolvedFile = resolved;
  }
  console.log(`${skippedNoFile} entries could not be resolved to a local file.`);

  // 3. For each unique resolved file, determine its status and (if needed)
  //    parse it / promote it / create it. Track resolvedFile -> short id
  //    for edge-building, regardless of which of the three cases applied.
  const fileToShortId = new Map();
  const parsedCache = new Map();
  let promoted = 0;
  let created = 0;
  let alreadyReviewed = 0;
  let rejectedNotAMeditation = 0;

  const uniqueFiles = [...new Set(allEntries.filter(e => e.resolvedFile).map(e => e.resolvedFile))];
  for (const filename of uniqueFiles) {
    const parsed = parseRawRecord(path.join(RECORDS_DIR, filename));
    parsedCache.set(filename, parsed);
    const title = titleFromParsed(parsed, filename);
    const normTitle = normalizeTitle(title);
    const existing = byNormTitle.get(normTitle);

    if (existing && existing.reviewed !== false) {
      // Already reviewed (either an original seed or a Pass 1-6 record).
      fileToShortId.set(filename, existing.id);
      alreadyReviewed += 1;
      continue;
    }

    if (existing && existing.reviewed === false) {
      // Promote: same id/href, flip reviewed, regenerate page as reviewed.
      existing.reviewed = true;
      fileToShortId.set(filename, existing.id);
      const dateLabel = parsed.recordedDate
        ? (parsed.recordedDate.timeKnown ? formatDateLabel(parsed.recordedDate.iso) : formatDateOnlyLabel(parsed.recordedDate.iso))
        : existing.dateLabel;
      const html = renderPage({
        id: existing.id, title, dateLabel, classification: parsed.classification,
        article: parsed.body, summary: parsed.summary || existing.summary, reviewed: true,
      });
      fs.writeFileSync(path.join(RECORDS_DIR, `${existing.id}-v2.html`), html, 'utf8');
      promoted += 1;
      continue;
    }

    // No existing entry at all.
    if (!parsed.isMeditation) {
      rejectedNotAMeditation += 1;
      continue;
    }
    const dateKey = parsed.recordedDate ? parsed.recordedDate.key : null;
    const id = makeId(dateKey, title, usedIds);
    const dateLabel = parsed.recordedDate
      ? (parsed.recordedDate.timeKnown ? formatDateLabel(parsed.recordedDate.iso) : formatDateOnlyLabel(parsed.recordedDate.iso))
      : 'Date not recorded';
    const html = renderPage({
      id, title, dateLabel, classification: parsed.classification,
      article: parsed.body, summary: parsed.summary, reviewed: true,
    });
    fs.writeFileSync(path.join(RECORDS_DIR, `${id}-v2.html`), html, 'utf8');
    jcRecords.push({
      id, order: 0, title, dateLabel, classification: parsed.classification,
      seed: null, href: `records/${id}-v2.html`, sourceStatus: 'original',
      summary: parsed.summary, reviewed: true,
    });
    byNormTitle.set(normTitle, jcRecords[jcRecords.length - 1]);
    fileToShortId.set(filename, id);
    created += 1;
  }

  console.log(`${alreadyReviewed} files were already reviewed (no change needed).`);
  console.log(`${promoted} mirrored records promoted to reviewed.`);
  console.log(`${created} brand-new reviewed records created.`);
  console.log(`${rejectedNotAMeditation} resolved files rejected as not-a-meditation.`);

  // 4. Build same-cluster edges from Pass 7/8 groups.
  const groupKey = (e) => `${e.passNum}::${e.group}`;
  const groups = new Map();
  for (const entry of allEntries) {
    if (!entry.resolvedFile) continue;
    const shortId = fileToShortId.get(entry.resolvedFile);
    if (!shortId) continue;
    const key = groupKey(entry);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ ...entry, shortId });
  }

  const { value: jcEdges } = loadArray(src0, 'JC_EDGES');
  const existingEdgeKeys = new Set(jcEdges.map(e => `${e.from}->${e.to}`));
  const newEdges = [];
  for (const [key, items] of groups) {
    items.sort((a, b) => a.seqInGroup - b.seqInGroup);
    for (let i = 1; i < items.length; i += 1) {
      const prev = items[i - 1];
      const cur = items[i];
      if (prev.shortId === cur.shortId) continue;
      const edgeKey = `${cur.shortId}->${prev.shortId}`;
      if (existingEdgeKeys.has(edgeKey)) continue;
      existingEdgeKeys.add(edgeKey);
      const [passNumStr, groupName] = key.split('::');
      const annotationNote = cur.annotation ? ` (${cur.annotation})` : '';
      newEdges.push({
        from: cur.shortId,
        to: prev.shortId,
        type: 'continues',
        status: 'editorial',
        note: `Sequential entries in the "${groupName}" cluster${annotationNote}.`,
        source: `Pass ${passNumStr} Cross-References — "${groupName}" section.`,
      });
    }
  }
  console.log(`Built ${newEdges.length} new same-cluster thread edges from Pass 7/8.`);

  // 5. Recompute chronological order across the WHOLE merged record set.
  jcRecords.forEach(r => { r._sortIso = dateLabelToIso(r.dateLabel); });
  jcRecords.sort((a, b) => {
    if (a._sortIso && b._sortIso) return a._sortIso < b._sortIso ? -1 : 1;
    if (a._sortIso) return -1;
    if (b._sortIso) return 1;
    return 0;
  });
  jcRecords.forEach((r, i) => { r.order = i + 1; delete r._sortIso; });

  // 6. Write back: JC_RECORDS first, then re-locate JC_EDGES on the
  //    updated string (its position has shifted).
  let out = replaceArray(src0, 'JC_RECORDS', jcRecords);
  const mergedEdges = jcEdges.concat(newEdges);
  out = replaceArray(out, 'JC_EDGES', mergedEdges);
  fs.writeFileSync(DATA_PATH, out, 'utf8');

  const reviewedCount = jcRecords.filter(r => r.reviewed !== false).length;
  const mirroredCount = jcRecords.filter(r => r.reviewed === false).length;
  console.log('Done.');
  console.log(`Total records: ${jcRecords.length} (${reviewedCount} reviewed, ${mirroredCount} mirrored)`);
  console.log(`Total edges: ${mergedEdges.length}`);
  console.log('Next: run `node scripts/tag-encounter-dimensions.mjs` to tag any brand-new records.');
}

main();
