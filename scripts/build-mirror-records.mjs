#!/usr/bin/env node
/**
 * scripts/build-mirror-records.mjs
 *
 * Phase 5 — "the digital threshold, complete": generates a local page for
 * every raw meditation in records/*.md that is NOT already one of the
 * reviewed/threaded records published by scripts/build-corpus-records.mjs,
 * so that no reader ever needs to follow a link out to the author's
 * private Genspark AI Drive to read a meditation that has already been
 * uploaded into this repository's records/ folder.
 *
 * Two tiers now coexist in JC_RECORDS:
 *   - reviewed: true  — passed through one of the Cross-Reference passes,
 *                       has labeled thread edges, appears in the Threads
 *                       constellation. Built by build-corpus-records.mjs.
 *   - reviewed: false — "mirrored" — the original text is fully present
 *                       and readable, with the same Discern/Carry/Return
 *                       page, but has no reviewed thread edges yet (none
 *                       would be honest to claim) and does not appear in
 *                       the main Threads constellation list. Built here.
 *
 * This script is ADDITIVE, not a full rebuild: it reads the current
 * assets/records-data.js, determines which raw files are not yet
 * represented (by title+date match against the existing JC_RECORDS), and
 * appends new entries + writes new HTML pages for the rest — the same
 * "splice, don't overwrite" approach used by tag-encounter-dimensions.mjs,
 * so JC_EDGES, JC_THREADS, and the helper functions below them are left
 * completely untouched.
 *
 * Run from the repository root:  node scripts/build-mirror-records.mjs
 * Then run:                      node scripts/tag-encounter-dimensions.mjs
 * (to compute Encounter Index dimensions for the newly mirrored records).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RECORDS_DIR = path.join(ROOT, 'records');
const DATA_PATH = path.join(ROOT, 'assets', 'records-data.js');

// ─────────────────────────────────────────────────────────────────────────
// Load current JC_RECORDS (splice target) without disturbing anything else
// in the file — same technique as tag-encounter-dimensions.mjs.
// ─────────────────────────────────────────────────────────────────────────

function loadRecordsData() {
  const src = fs.readFileSync(DATA_PATH, 'utf8');
  const startMarker = 'const JC_RECORDS = [';
  const startIdx = src.indexOf(startMarker);
  if (startIdx === -1) throw new Error('Could not find "const JC_RECORDS = [" in records-data.js');
  let depth = 0;
  let i = startIdx + startMarker.length - 1;
  let endIdx = -1;
  for (; i < src.length; i++) {
    if (src[i] === '[') depth++;
    else if (src[i] === ']') {
      depth--;
      if (depth === 0) { endIdx = i; break; }
    }
  }
  if (endIdx === -1) throw new Error('Could not find the closing "]" for JC_RECORDS');
  const arrayText = src.slice(startIdx + startMarker.length - 1, endIdx + 1);
  // eslint-disable-next-line no-eval
  const records = eval(arrayText);
  return { src, startIdx, endIdx, records };
}

function writeRecordsData(src, startIdx, endIdx, updatedRecords) {
  const newArrayText = 'const JC_RECORDS = ' + JSON.stringify(updatedRecords, null, 2);
  const before = src.slice(0, startIdx);
  const after = src.slice(endIdx + 1);
  const out = before + newArrayText + after;
  fs.writeFileSync(DATA_PATH, out, 'utf8');
}

// ─────────────────────────────────────────────────────────────────────────
// Markdown cleanup + raw-file parsing (same logic as build-corpus-records.mjs,
// duplicated here so this script has no import-time dependency on it).
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
  const slug = slugifyTitle(title);
  let candidate = `${datePart}-${slug}`;
  let n = 2;
  while (usedIds.has(candidate)) {
    candidate = `${datePart}-${slug}-${n}`;
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

// Reconstruct a sortable ISO timestamp from an existing JC_RECORDS
// dateLabel string (e.g. "Aug 30, 2026 · 08:01" or "Feb 25, 2026 · time
// not recorded"), so the merged set can be re-sorted chronologically.
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
// Normalized-title match: is this raw file already a published record?
// ─────────────────────────────────────────────────────────────────────────

function normalizeTitle(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

// ─────────────────────────────────────────────────────────────────────────
// Page template — identical to build-corpus-records.mjs's Tier-A template,
// parameterized by `reviewed` so mirrored pages are honest about their
// status without duplicating the whole interactive page structure.
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
  const { src, startIdx, endIdx, records: existingRecords } = loadRecordsData();

  const usedIds = new Set(existingRecords.map(r => r.id));
  const existingByNormTitle = new Map(); // normalizedTitle -> record (for skip-if-already-published)
  for (const r of existingRecords) {
    existingByNormTitle.set(normalizeTitle(r.title), r);
  }

  const pool = fs.readdirSync(RECORDS_DIR)
    .filter(name => name.endsWith('.md') && /^\d/.test(name));

  console.log(`Found ${pool.length} raw .md files in records/.`);

  const newRecords = [];
  let skippedAlreadyPublished = 0;
  let skippedNotAMeditation = 0;

  for (const filename of pool) {
    const parsed = parseRawRecord(path.join(RECORDS_DIR, filename));
    if (!parsed.isMeditation) {
      skippedNotAMeditation += 1;
      continue;
    }
    const title = titleFromParsed(parsed, filename);
    const normTitle = normalizeTitle(title);
    if (existingByNormTitle.has(normTitle)) {
      skippedAlreadyPublished += 1;
      continue;
    }

    const dateKey = parsed.recordedDate ? parsed.recordedDate.key : null;
    const id = makeId(dateKey, title, usedIds);

    const dateLabel = parsed.recordedDate
      ? (parsed.recordedDate.timeKnown ? formatDateLabel(parsed.recordedDate.iso) : formatDateOnlyLabel(parsed.recordedDate.iso))
      : 'Date not recorded';

    newRecords.push({
      id,
      title,
      dateLabel,
      classification: parsed.classification,
      href: `records/${id}-v2.html`,
      sourceStatus: 'original',
      summary: parsed.summary,
      recordedIso: parsed.recordedDate ? parsed.recordedDate.iso : null,
      body: parsed.body,
    });
  }

  console.log(`${skippedNotAMeditation} files rejected as not-a-meditation (no Opening Observation section).`);
  console.log(`${skippedAlreadyPublished} files already published as reviewed records (matched by title) — skipped.`);
  console.log(`Generating ${newRecords.length} new mirror record pages.`);

  // Write HTML pages.
  for (const rec of newRecords) {
    const html = renderPage({
      id: rec.id,
      title: rec.title,
      dateLabel: rec.dateLabel,
      classification: rec.classification,
      article: rec.body,
      summary: rec.summary,
      reviewed: false,
    });
    fs.writeFileSync(path.join(RECORDS_DIR, `${rec.id}-v2.html`), html, 'utf8');
  }

  // Merge, mark reviewed status, reassign chronological order across the
  // WHOLE set (existing reviewed + new mirrored).
  const mergedRecords = existingRecords.map(r => ({
    ...r,
    reviewed: r.reviewed !== undefined ? r.reviewed : true,
    recordedIsoForSort: dateLabelToIso(r.dateLabel),
  })).concat(
    newRecords.map(r => ({
      id: r.id,
      order: 0,
      title: r.title,
      dateLabel: r.dateLabel,
      classification: r.classification,
      seed: null,
      href: r.href,
      sourceStatus: r.sourceStatus,
      summary: r.summary,
      reviewed: false,
      recordedIsoForSort: r.recordedIso,
    }))
  );

  mergedRecords.sort((a, b) => {
    if (a.recordedIsoForSort && b.recordedIsoForSort) return a.recordedIsoForSort < b.recordedIsoForSort ? -1 : 1;
    if (a.recordedIsoForSort) return -1;
    if (b.recordedIsoForSort) return 1;
    return 0;
  });
  mergedRecords.forEach((r, i) => { r.order = i + 1; delete r.recordedIsoForSort; });

  writeRecordsData(src, startIdx, endIdx, mergedRecords);

  console.log('Done.');
  console.log(`Total records: ${mergedRecords.length} (${existingRecords.length} previously published + ${newRecords.length} new mirrored)`);
  console.log('Next: run `node scripts/tag-encounter-dimensions.mjs` to tag the new records with Encounter Index dimensions.');
}

main();
