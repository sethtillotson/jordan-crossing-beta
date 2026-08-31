#!/usr/bin/env node
/**
 * scripts/build-corpus-records.mjs
 *
 * One-time generator: reads the six "Pass N Cross-References" documents,
 * resolves each referenced meditation to its raw source file under
 * records/, and emits:
 *   1. One records/<id>-v2.html page per newly-resolved meditation
 *      (skipping any that overlap the 7 already-published seed records).
 *   2. A rebuilt assets/records-data.js containing the original 7 seed
 *      records plus every newly generated record, with `order` reassigned
 *      chronologically across the *whole* set, plus new JC_EDGES built
 *      from same-thread adjacency within each pass's numbered groups.
 *
 * Run from the repository root:  node scripts/build-corpus-records.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RECORDS_DIR = path.join(ROOT, 'records');

const PASS_FILES = [
  { file: 'Pass 1 Spine Cross-References.md', passNum: 1 },
  { file: 'Pass 2 Threaded Cross-References.md', passNum: 2 },
  { file: 'Pass 3 Cluster Cross-References.md', passNum: 3 },
  { file: 'Pass-4-Cross-References.md', passNum: 4 },
  { file: 'Pass-5-Cross-References.md', passNum: 5 },
  { file: 'Pass-6-Cross-References.md', passNum: 6 },
];

// ─────────────────────────────────────────────────────────────────────────
// Known NBSP-filename placeholders in the pass docs (no parseable markdown
// link because the source filename contains a non-breaking space). Keyed
// by a distinctive substring of the pass doc's plain-text line.
// ─────────────────────────────────────────────────────────────────────────
// Each alias is resolved by finding a pool filename containing the given
// date prefix AND all of the given keywords (case-insensitive), rather
// than a hardcoded exact filename, since manual transcription of these
// exotic (NBSP-containing) filenames is error-prone.
const NBSP_ALIASES = [
  { match: /Mar 29/i, datePrefix: '03-29', keywords: ['Alleyway'] },
  { match: /Apr 3.*11:20|Apr 3.*Table Being Set/i, datePrefix: '04-03', keywords: ['Table Being Set'] },
  { match: /Apr 4.*13:33|Backward Glance/i, datePrefix: '04-04', keywords: ['Backward Glance'] },
  { match: /Apr 4.*23:52|Torn Veil/i, datePrefix: '04-04', keywords: ['Torn Veil'] },
  { match: /Apr 6.*16:48|Roses With Thorns/i, datePrefix: '04-06', keywords: ['Roses With Thorns'] },
  // Jun 8 · 14:28 "Surely I am coming quickly" is NOT present in the local
  // mirror (checked) — intentionally not aliased; will be skipped.
];

// Existing 7 seed records: recorded date+hour+minute -> short id. Any pass
// entry whose resolved raw file's own Recorded: timestamp matches one of
// these is an overlap with an already-published, hand-curated page and is
// skipped (never overwritten), though it still contributes to edges.
const EXISTING_SEED_BY_DATETIME = {
  '2026-08-29 20:23': 'signpost',
  '2026-08-30 08:01': 'man-of-flesh',
  '2026-08-30 08:38': 'mirror',
  '2026-08-30 09:09': 'mirror-gospel',
  '2026-08-30 13:39': 'filthy-garments',
  '2026-08-30 20:04': 'compass',
  '2026-08-30 23:58': 'wisdom',
};

const EXISTING_RECORDS = [
  { id: 'signpost', order: 1, title: "The Signpost, the Secret Place, and the Cup of the Father's Will", dateLabel: 'Aug 29, 2026 · 20:23', classification: 'Call Reflection', seed: 1, href: 'records/08-29-signpost-v2.html', sourceStatus: 'original', summary: "The Samuel Loop answered — the repeated question given to Christ alone, then the secret place. Horizon 2's fruit verified." },
  { id: 'man-of-flesh', order: 2, title: 'The Man of the Flesh Held Me Hostage', dateLabel: 'Aug 30, 2026 · 08:01', classification: 'Call Reflection', seed: 2, href: 'records/08-30-man-of-flesh-v2.html', sourceStatus: 'original', summary: 'Samuel asks for "a proper Bible study." Identity in Christ; the confession of being hard on oneself in the wrong ways.' },
  { id: 'mirror', order: 3, title: 'The Man in the Mirror and the Christ Who Stands Between', dateLabel: 'Aug 30, 2026 · 08:38', classification: 'Call Reflection', seed: 3, href: 'records/08-30-mirror-v2.html', sourceStatus: 'original', summary: 'The five weights named, the one root exposed. The study is arranged and set to be recorded.' },
  { id: 'mirror-gospel', order: 4, title: 'The Mirror-Gospel and Christ the Teacher Within', dateLabel: 'Aug 30, 2026 · 09:09', classification: 'Theological Meditation', seed: 4, href: 'records/08-30-mirror-gospel-v2.html', sourceStatus: 'original', summary: 'The worship song given to open the coming study, discerned against Isaiah 30:20: the Teacher within is Christ, not the self.' },
  { id: 'filthy-garments', order: 5, title: 'The Faced Image, the Filthy Garments, and the Finished Work', dateLabel: 'Aug 30, 2026 · 13:39', classification: 'Call Reflection', seed: 5, href: 'records/08-30-filthy-garments-v2.html', sourceStatus: 'original', summary: 'The first gathering of the circle: three brothers, three countries, planned 75–90 minutes, ran roughly 3.5 hours. Root first, symptoms last.' },
  { id: 'compass', order: 6, title: 'The Compass in the Locked Room', dateLabel: 'Aug 30, 2026 · 20:04', classification: 'Call Reflection', seed: 6, href: 'records/08-30-compass-v2.html', sourceStatus: 'original', summary: "Within half an hour of the study's end, the gaze slides back to the storm. Christ, not the counselor, is the compass; the secret place and mutual sight in the Body address blind spots." },
  { id: 'wisdom', order: 7, title: 'When Wisdom Ushers Power: The Loved Heir, the Renewed Mind, and the Word That Gives Witness to Itself', dateLabel: 'Aug 30, 2026 · 23:58', classification: 'Teaching Reflection', seed: 7, href: 'records/08-30-wisdom-v2.html', sourceStatus: 'original', summary: 'Illumination rather than mere endurance; wisdom before power, love before receiving. Bartimaeus receives sight and follows Jesus in the way.' },
];

const EXISTING_EDGES = [
  { from: 'mirror', to: 'man-of-flesh', type: 'continues', status: 'editorial', note: 'Same Aug 30 morning call sequence. Record 3 follows directly from the Bible-study request named in record 2.', source: 'Stone Tablet VIII Seed Register, seeds 2–3.' },
  { from: 'mirror-gospel', to: 'mirror', type: 'continues', status: 'editorial', note: 'The worship song and Teacher-within discernment prepare the study that record 3 arranged.', source: 'Stone Tablet VIII Seed Register, seeds 3–4.' },
  { from: 'filthy-garments', to: 'mirror-gospel', type: 'continues', status: 'editorial', note: 'The study itself — the gathering that seeds 2–4 were preparing toward.', source: 'Stone Tablet VIII Seed Register, seeds 4–5.' },
  { from: 'compass', to: 'filthy-garments', type: 'continues', status: 'author-confirmed', note: 'Explicitly recorded as the first aftermath of the circle: within half an hour of the study, the gaze returns to the storm.', source: "Stone Tablet VIII Seed Register, seed 6: 'the first aftermath of the circle.'" },
  { from: 'compass', to: 'signpost', type: 'answers', status: 'editorial', note: 'The record completes the Aug 29 signpost by showing continuance under pressure, extending Horizon 3\'s paideia into ordinary, late-night obedience.', source: "memory/2026-08-31.md — keeper's daily log: 'It answers the Aug 29 signpost and extends Horizon 3's paideia into ordinary, late-night obedience.'" },
  { from: 'wisdom', to: 'compass', type: 'continues', status: 'editorial', note: "Widens Horizon 3 from mutual correction (Compass) into corporate maturity — the same evening's teaching deepens rather than closes the question.", source: "Stone Tablet VIII Seed Register, seed 7: 'widens Horizon 3 from mutual correction into corporate maturity.'" },
  { from: 'signpost', to: 'man-of-flesh', type: 'continues', status: 'editorial', note: 'The Samuel Loop\'s answer (Aug 29 evening) flows into the first light of understanding (Aug 30 morning). The secret place revealed leads to identity in Christ.', source: 'Stone Tablet VIII Seed Register, seeds 1–2: sequential arc of the crossing.' },
  { from: 'man-of-flesh', to: 'mirror-gospel', type: 'continues', status: 'editorial', note: 'The request for "a proper Bible study" (record 2) is met by the worship song and Teacher-within discernment that frame record 4.', source: 'Stone Tablet VIII Seed Register, seeds 2–4: the study preparation.' },
  { from: 'jordan-crossing', to: 'signpost', type: 'open', status: 'open', note: 'What does the crossing complete? The beta declines to force a conclusion before the corpus completes its own movement.', source: 'Editorial framing only — carried as an open question, not settled.' },
];

// ─────────────────────────────────────────────────────────────────────────
// Step 1 — Parse the six pass docs into structured entries.
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

function resolveNbspAlias(entry, pool) {
  for (const alias of NBSP_ALIASES) {
    if (!alias.match.test(entry.displayTitle)) continue;
    const found = pool.find(name =>
      name.startsWith(alias.datePrefix) &&
      alias.keywords.every(kw => name.toLowerCase().includes(kw.toLowerCase()))
    );
    if (found) return found;
  }
  return null;
}

// ─────────────────────────────────────────────────────────────────────────
// Step 2 — Resolve each entry to an actual file in records/.
// ─────────────────────────────────────────────────────────────────────────

function loadRecordFilePool() {
  return fs.readdirSync(RECORDS_DIR)
    .filter(name => name.endsWith('.md') && /^\d/.test(name));
}

function resolveFile(entry, pool) {
  if (!entry.hasLink) {
    return resolveNbspAlias(entry, pool);
  }
  const target = entry.basename;
  const n = Math.min(target.length, 60);
  if (n <= 20) return null;
  let bestMatch = null;
  for (const candidate of pool) {
    const n2 = Math.min(n, candidate.length);
    if (n2 > 20 && target.slice(0, n2) === candidate.slice(0, n2)) {
      bestMatch = candidate;
      break;
    }
  }
  return bestMatch;
}

// ─────────────────────────────────────────────────────────────────────────
// Step 3 — Parse a resolved raw meditation file: metadata + cleaned body.
// ─────────────────────────────────────────────────────────────────────────

function cleanMarkdownArtifacts(text) {
  let out = text;
  // Unwrap RTL Hebrew spans, keeping the inner text (the client-side
  // markdown renderer reads article.textContent, which would otherwise
  // silently discard the wrapping element and its dir="rtl" attribute).
  out = out.replace(/<span[^>]*dir=["']rtl["'][^>]*>([^<]*)<\/span>/gi, '$1');
  // Drop docx-conversion artifacts: broken local image references and
  // empty HTML comments left behind by pandoc-style exports.
  out = out.replace(/<img[^>]*>/gi, '');
  out = out.replace(/<!--[\s\S]*?-->/g, '');
  // Mop up any other stray HTML tags we haven't anticipated.
  out = out.replace(/<[^>]+>/g, '');
  // De-escape backslash-escaped Markdown punctuation left by the export
  // tool (\# \* \| \_ \[ \] \( \)).
  out = out.replace(/\\([#*|_\[\]()])/g, '$1');
  // Some older-format files insert a blank line after every single line,
  // including inside Markdown tables. The client-side renderer detects a
  // table by checking that a "|" row is immediately followed by another
  // "|" row, so collapse blank lines that sit between two table rows.
  out = out.replace(/(^\|[^\n]*\|[ \t]*)\n\n+(?=\|)/gm, '$1\n');
  // Escape bare ampersands (not already part of a named/numeric entity)
  // so the text is valid to embed directly inside an HTML <article>.
  out = out.replace(/&(?!(?:amp|lt|gt|quot|#39|#\d+);)/g, '&amp;');
  return out;
}

function stripMarkdownDecoration(s) {
  return s
    .replace(/^\*\*[^*]+:\*\*\s*/, '') // leading "**Label:**" prefix (e.g. "**Personal Meditation:**")
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
  const discernmentMatch = cleaned.match(/\*\*Source Discernment:\*\*\s*(.+)$/m);
  const classificationMatch = cleaned.match(/\*\*Classification:\*\*\s*(.+)$/m);

  // First substantial paragraph after "Opening Observation" for a summary.
  // (Older-format files prefix the heading with an emoji, e.g. "## ⚡ Opening
  // Observation" — match the phrase anywhere on the heading line.)
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
    // Fallback for older-format files with no **Recorded:** metadata line:
    // derive the date from the filename's own MM-DD prefix (the corpus
    // spans a single year, 2026). Exact time of day is not recoverable,
    // so it is left unknown (not displayed, not claimed).
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
    recordedRaw: recordedMatch ? recordedMatch[1].trim() : 'Not provided',
    recordedDate,
    discernment: discernmentMatch ? discernmentMatch[1].trim() : null,
    classification: classificationMatch ? classificationMatch[1].trim() : 'Meditation',
    body: cleaned,
    summary,
  };
}

// ─────────────────────────────────────────────────────────────────────────
// Step 4 — Slug / id generation.
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

function makeId(dateKey, title, usedIds) {
  const datePart = dateKey ? dateKey.slice(5, 10) : '00-00'; // MM-DD
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

// ─────────────────────────────────────────────────────────────────────────
// Step 5 — HTML page template.
// ─────────────────────────────────────────────────────────────────────────

function renderPage({ id, title, dateLabel, classification, article, summary }) {
  const escAttr = (s) => String(s).replace(/"/g, '&quot;');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <meta name="viewport" content="width=device-width,initial-scale=1">

  <title>${escAttr(title)} — Interior Beta</title>
  <meta name="description" content="${escAttr(summary)}">
  <link rel="stylesheet" href="../assets/design-v2.css?v=20260831V14">
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
        <p class="record-caption">Original Record · Local Corpus Bundle</p>
        <h1 class="page-title">${title}</h1>
        <p class="page-subtitle">${dateLabel}</p>

        <div class="source-row">
          <span class="source-badge">Original record</span>
          <span>Imported from AI Drive Markdown source · ${classification}</span>
        </div>

        <div class="callout">
          <p class="caption">Source Status</p>
          <p>This page displays the imported source text itself. Editorial thread links are outside this record and are labeled separately.</p>
        </div>
      </div>

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

      <div class="movement-divider"></div>

      <!-- RELATED RECORDS -->
      <section class="related-records" id="related-records-mount" aria-label="Related records"></section>

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

          <a class="depth-card" href="../paths.html">
            <div class="depth-title">Read the paths</div>
            Five curated reading sequences through the larger corpus
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

  <script src="../assets/records-data.js?v=20260831V14"></script>
  <script src="../assets/design-v2-logic.js?v=20260831V14"></script>
</body>
</html>
`;
}

// ─────────────────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────────────────

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

function main() {
  const pool = loadRecordFilePool();
  const usedIds = new Set(EXISTING_RECORDS.map(r => r.id));

  // 1. Parse all pass entries.
  let allEntries = [];
  for (const { file, passNum } of PASS_FILES) {
    const entries = parsePassFile(path.join(ROOT, file), passNum);
    allEntries = allEntries.concat(entries);
  }
  console.log(`Parsed ${allEntries.length} pass entries across ${PASS_FILES.length} files.`);
  if (process.env.JC_DEBUG) {
    fs.writeFileSync(path.join(ROOT, 'scripts', '_debug-entries.json'),
      JSON.stringify(allEntries.map(e => ({ pass: e.passNum, group: e.group, seq: e.seqInGroup, title: e.displayTitle, basename: e.basename, hasLink: e.hasLink })), null, 2));
  }

  // 2. Resolve each to a file, dedupe by resolved filename, track overlap
  //    with existing seeds and unresolvable entries.
  const byFile = new Map(); // filename -> { entries: [...] }
  let skippedNoFile = 0;
  let skippedIsSeed = 0;

  for (const entry of allEntries) {
    const resolved = resolveFile(entry, pool);
    if (!resolved) {
      skippedNoFile += 1;
      continue;
    }
    entry.resolvedFile = resolved;
    if (!byFile.has(resolved)) byFile.set(resolved, []);
    byFile.get(resolved).push(entry);
  }

  console.log(`Resolved to ${byFile.size} unique files (${skippedNoFile} entries unresolved).`);
  if (process.env.JC_DEBUG) {
    const dump = {};
    for (const [filename, entries] of byFile) {
      dump[filename] = entries.map(e => e.displayTitle);
    }
    fs.writeFileSync(path.join(ROOT, 'scripts', '_debug-byfile.json'), JSON.stringify(dump, null, 2));
  }

  // 3. Parse each resolved file; detect seed overlaps.
  const parsedByFile = new Map();
  const fileToShortId = new Map(); // resolvedFile -> short id (existing seed OR newly generated)
  for (const [filename, entries] of byFile) {
    const parsed = parseRawRecord(path.join(RECORDS_DIR, filename));
    parsedByFile.set(filename, parsed);
    if (parsed.recordedDate && EXISTING_SEED_BY_DATETIME[parsed.recordedDate.key]) {
      const seedId = EXISTING_SEED_BY_DATETIME[parsed.recordedDate.key];
      fileToShortId.set(filename, seedId);
      skippedIsSeed += entries.length;
    }
  }
  console.log(`${skippedIsSeed} pass-entry references overlap the 7 existing seed records (not regenerated).`);

  // 4. Generate new records for every non-seed resolved file that looks
  //    like an actual meditation (has the standard "Opening Observation"
  //    section). A handful of pass-doc references resolve, via prefix
  //    matching, to files that are actually mislabeled/corrupted in the
  //    source corpus (e.g. a Prophetic Word transcript or a template
  //    guidance doc saved under an unrelated meditation's filename) —
  //    these are skipped rather than published as broken record pages.
  const newRecords = [];
  let skippedNotAMeditation = 0;
  for (const [filename, parsed] of parsedByFile) {
    if (fileToShortId.has(filename)) continue; // seed overlap, skip generation
    if (!/##[^\n]*Opening Observation/i.test(parsed.body)) {
      skippedNotAMeditation += 1;
      continue;
    }
    const title = (parsed.metaTitle || parsed.displayHeading || filename.replace(/\.md$/, ''))
      .replace(/^\d{2}-\d{2}(?:\s+at\s+\d{2}[:_]\d{2})?\s*[—-]?\s*/i, '')
      .trim() || parsed.displayHeading || filename;
    const dateKey = parsed.recordedDate ? parsed.recordedDate.key : null;
    const id = makeId(dateKey, title, usedIds);
    fileToShortId.set(filename, id);

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
  console.log(`Generating ${newRecords.length} new record pages (${skippedNotAMeditation} resolved files rejected as not-a-meditation).`);

  // 5. Write HTML pages.
  fs.mkdirSync(RECORDS_DIR, { recursive: true });
  for (const rec of newRecords) {
    const html = renderPage({
      id: rec.id,
      title: rec.title,
      dateLabel: rec.dateLabel,
      classification: rec.classification,
      article: rec.body,
      summary: rec.summary,
    });
    fs.writeFileSync(path.join(RECORDS_DIR, `${rec.id}-v2.html`), html, 'utf8');
  }

  // 6. Build edges from same-group adjacency within each pass.
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

  const newEdges = [];
  const edgeSeen = new Set();
  for (const [key, items] of groups) {
    items.sort((a, b) => a.seqInGroup - b.seqInGroup);
    for (let i = 1; i < items.length; i += 1) {
      const prev = items[i - 1];
      const cur = items[i];
      if (prev.shortId === cur.shortId) continue; // same record referenced twice
      const edgeKey = `${cur.shortId}->${prev.shortId}`;
      if (edgeSeen.has(edgeKey)) continue;
      edgeSeen.add(edgeKey);
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
  console.log(`Built ${newEdges.length} new same-cluster thread edges.`);

  // 7. Merge records, reassign chronological order across the whole set.
  const mergedRecords = EXISTING_RECORDS.map(r => ({ ...r })).concat(
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
      recordedIso: r.recordedIso,
    }))
  );

  // For chronological sort we need an ISO datetime for the existing 7 too.
  const existingIso = {
    signpost: '2026-08-29T20:23:03',
    'man-of-flesh': '2026-08-30T08:01:54',
    mirror: '2026-08-30T08:38:00',
    'mirror-gospel': '2026-08-30T09:09:00',
    'filthy-garments': '2026-08-30T13:39:00',
    compass: '2026-08-30T20:04:00',
    wisdom: '2026-08-30T23:58:00',
  };
  for (const r of mergedRecords) {
    if (!r.recordedIso) r.recordedIso = existingIso[r.id] || null;
  }
  mergedRecords.sort((a, b) => {
    if (a.recordedIso && b.recordedIso) return a.recordedIso < b.recordedIso ? -1 : 1;
    if (a.recordedIso) return -1;
    if (b.recordedIso) return 1;
    return 0;
  });
  mergedRecords.forEach((r, i) => { r.order = i + 1; delete r.recordedIso; });

  const mergedEdges = EXISTING_EDGES.concat(newEdges);

  writeRecordsDataJs(mergedRecords, mergedEdges);

  console.log('Done.');
  console.log(`Total records: ${mergedRecords.length} (7 existing + ${newRecords.length} new)`);
  console.log(`Total edges: ${mergedEdges.length} (9 existing + ${newEdges.length} new)`);
}

function writeRecordsDataJs(records, edges) {
  const recordsJson = JSON.stringify(records.map(r => ({
    id: r.id, order: r.order, title: r.title, dateLabel: r.dateLabel,
    classification: r.classification, seed: r.seed ?? null, href: r.href,
    sourceStatus: r.sourceStatus, summary: r.summary,
  })), null, 2);
  const edgesJson = JSON.stringify(edges, null, 2);

  const out = `/**
 * Jordan Crossing Beta — Record Metadata & Reviewed Thread Edges
 * Single source of truth for prev/next chronology and labeled bridges.
 *
 * Last updated: ${new Date().toISOString()} (regenerated by scripts/build-corpus-records.mjs)
 *
 * IMPORTANT — governance:
 * - \`order\` is pure chronological fact (recorded date/time). Always safe to show.
 * - \`edges\` are labeled thread bridges. Every edge carries a \`status\`:
 *     'author-confirmed' — Seth's own stated words say the connection exists.
 *     'editorial'         — a human-reviewed (Barak, the keeper) synthesis,
 *                            dated, offered for consideration, not revelation.
 *     'open'              — a genuine open question, not yet settled.
 *   No edge here claims more confidence than its source documents support.
 * - Records generated from the six Pass Cross-Reference documents carry
 *   edges whose \`source\` cites the specific pass + cluster section that
 *   justifies the connection. Do not add an edge without a source.
 */

'use strict';

const JC_RECORDS = ${recordsJson};

/**
 * Labeled thread edges. \`from\` and \`to\` are record ids from JC_RECORDS,
 * or the special id 'jordan-crossing' for the preserved interior record.
 */
const JC_EDGES = ${edgesJson};

const EDGE_LABELS = {
  continues: 'continues',
  answers: 'answers',
  reopens: 'reopens',
  open: 'open question',
};

const STATUS_LABELS = {
  'author-confirmed': 'author-confirmed',
  'editorial': 'editorial connection',
  'open': 'open',
};

function jcGetRecord(id) {
  return JC_RECORDS.find(r => r.id === id) || null;
}

function jcGetPrevNext(id) {
  const rec = jcGetRecord(id);
  if (!rec) return { prev: null, next: null };
  const prev = JC_RECORDS.find(r => r.order === rec.order - 1) || null;
  const next = JC_RECORDS.find(r => r.order === rec.order + 1) || null;
  return { prev, next };
}

function jcGetEdgesFor(id) {
  const outgoing = JC_EDGES.filter(e => e.from === id);
  const incoming = JC_EDGES.filter(e => e.to === id);
  return { outgoing, incoming };
}

// Href for use from within a page at the beta root (index.html, mystery.html, threads.html).
function jcHrefFor(id) {
  if (id === 'jordan-crossing') return 'jordan-crossing-interior.html';
  const r = jcGetRecord(id);
  return r ? r.href : '#';
}

// Href for use from within a page inside records/ (i.e. another record page).
function jcHrefFromRecord(id) {
  if (id === 'jordan-crossing') return '../jordan-crossing-interior.html';
  const r = jcGetRecord(id);
  if (!r) return '#';
  return r.href.replace(/^records\\//, '');
}

function jcTitleFor(id) {
  if (id === 'jordan-crossing') return 'The Jordan Crossing (interior record)';
  const r = jcGetRecord(id);
  return r ? r.title : id;
}

// Map full record ID (e.g., '08-29-signpost') to short ID (e.g., 'signpost')
function jcShortId(id) {
  // If already a short ID, return as-is
  if (JC_RECORDS.some(r => r.id === id)) return id;

  // Map full date-prefixed IDs to short IDs
  // E.g., '08-29-signpost' → 'signpost', '08-30-compass' → 'compass'
  const match = id.match(/^\\d{2}-\\d{2}-(.+)$/);
  return match ? match[1] : id;
}

// Get 2-3 thematically related records based on thread edges
function jcGetRelatedRecords(id, limit = 3) {
  // Normalize the ID from full format (e.g., '08-29-signpost') to short format (e.g., 'signpost')
  const shortId = jcShortId(id);

  const edges = jcGetEdgesFor(shortId);
  const relatedIds = new Set();

  // Add outgoing connections (what this record continues to, answers, etc.)
  edges.outgoing.forEach(edge => {
    if (edge.to && edge.to !== 'jordan-crossing') {
      relatedIds.add(edge.to);
    }
  });

  // Add incoming connections (what leads to this record)
  edges.incoming.forEach(edge => {
    if (edge.from && edge.from !== 'jordan-crossing') {
      relatedIds.add(edge.from);
    }
  });

  const related = Array.from(relatedIds)
    .map(rid => jcGetRecord(rid))
    .filter(Boolean)
    .slice(0, limit);

  return related;
}
`;

  fs.writeFileSync(path.join(ROOT, 'assets', 'records-data.js'), out, 'utf8');
}

main();
