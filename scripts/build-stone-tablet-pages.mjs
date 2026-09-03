#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const RECORDS2_DIR = path.join(ROOT, 'records-2');
const RECORDS_DIR = path.join(ROOT, 'records');
const STONE_TABLETS_INDEX_PATH = path.join(ROOT, 'stone-tablets.html');

const TABLETS = [
  {
    ordinal: 'I',
    id: 'stone-tablet-i',
    output: 'stone-tablet-i-v2.html',
    source: 'Stone Tablet I -- A Living Topology of Transformation -- Volume I -- Complete.md',
    parseMode: 'series-volume',
  },
  {
    ordinal: 'II',
    id: 'stone-tablet-ii',
    output: 'stone-tablet-ii-v2.html',
    source: 'Stone Tablet II -- A Living Topology of Transformation -- Volume II -- Complete.md',
    parseMode: 'series-volume',
  },
  {
    ordinal: 'III',
    id: 'stone-tablet-iii',
    output: 'stone-tablet-iii-v2.html',
    source: 'Stone Tablet III -- The Starling Convergence -- Complete.md',
    parseMode: 'standalone-title',
  },
  {
    ordinal: 'IV',
    id: 'stone-tablet-iv',
    output: 'stone-tablet-iv-v2.html',
    source: 'Stone Tablet IV -- Volume I Witness Companion -- Complete.md',
    parseMode: 'series-volume',
  },
  {
    ordinal: 'V',
    id: 'stone-tablet-v',
    output: 'stone-tablet-v-v2.html',
    source: 'Stone Tablet V -- Come Out of Her, My Children -- A Watchman\'s Testimony from the Sleeping Bride\'s Hour.md',
    parseMode: 'tablet-heading',
  },
  {
    ordinal: 'VI',
    id: 'stone-tablet-vi',
    output: 'stone-tablet-vi-v2.html',
    source: 'Stone Tablet VI - The Night the Silence Should Have Come Sooner.md',
    parseMode: 'tablet-heading',
  },
  {
    ordinal: 'VII',
    id: 'stone-tablet-vii',
    output: 'stone-tablet-vii-v2.html',
    source: 'Stone Tablet VII -- A Living Topology of Transformation -- Volume IV -- Complete.md',
    parseMode: 'plain-lines',
    auditHref: 'stone-tablet-vii-audit-v2.html',
  },
  {
    ordinal: 'VIII',
    id: 'stone-tablet-viii',
    output: 'stone-tablet-viii-v2.html',
    source: 'Stone Tablet VIII -- Seed Register.md',
    parseMode: 'simple-title',
  },
];

const AUDIT = {
  ordinal: 'VII Audit',
  id: 'stone-tablet-vii-audit',
  output: 'stone-tablet-vii-audit-v2.html',
  source: 'Stone Tablet VII -- Factual and Consistency Audit.md',
  parseMode: 'simple-title',
  isAudit: true,
};

function cleanMarkdownArtifacts(text) {
  let out = text;
  out = out.replace(/<img[^>]*>/gi, '');
  out = out.replace(/<!--[\s\S]*?-->/g, '');
  out = out.replace(/\\([#*|_\[\]()])/g, '$1');
  return out;
}

function stripMarkdownDecoration(value) {
  return String(value)
    .replace(/^#+\s*/, '')
    .replace(/^\*\*([^*]+):\*\*\s*/, '$1: ')
    .replace(/^\*([^*]+)\*$/, '$1')
    .replace(/\*\*/g, '')
    .trim();
}

function normalizeTitleCase(value) {
  if (!value) return value;
  if (!/^[A-Z0-9\s'&:;,.!?()/-]+$/.test(value)) return value;
  return value
    .toLowerCase()
    .replace(/\b([a-z])/g, (_, ch) => ch.toUpperCase());
}

function normalizeDashSpacing(value) {
  return String(value)
    .replace(/\s+--\s+/g, ' — ')
    .replace(/\s+-\s+/g, ' — ')
    .replace(/\s+–\s+/g, ' – ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, '&quot;');
}

function splitLines(text) {
  return text.replace(/\r\n?/g, '\n').split('\n');
}

function getMetaField(cleaned, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = cleaned.match(new RegExp(`^\\*\\*${escaped}:\\*\\*\\s*(.+)$`, 'im'));
  return match ? match[1].trim() : '';
}

function firstParagraphAfterHeading(cleaned, headingPattern) {
  const lines = splitLines(cleaned);
  let inTarget = false;
  let paragraph = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!inTarget) {
      if (headingPattern.test(line)) inTarget = true;
      continue;
    }
    if (!line) {
      if (paragraph.length) break;
      continue;
    }
    if (/^#{1,6}\s+/.test(line) && paragraph.length) break;
    paragraph.push(stripMarkdownDecoration(line));
  }

  return paragraph.join(' ').replace(/\s+/g, ' ').trim();
}

function firstSubstantialParagraph(cleaned) {
  const paras = cleaned
    .split(/\r?\n\s*\r?\n/)
    .map(p => stripMarkdownDecoration(p.replace(/\n+/g, ' ')).replace(/\s+/g, ' ').trim())
    .filter(p => p.length > 80 && !/^Author:|^Generated:|^Recorded:|^Source Corpus:|^Source Material:|^Document Classification:|^Status:/i.test(p));
  return paras[0] || '';
}

function truncate(value, max = 220) {
  const compact = String(value).replace(/\s+/g, ' ').trim();
  if (compact.length <= max) return compact;
  return compact.slice(0, max).replace(/\s+\S*$/, '') + '…';
}

function cleanedFilenameTitle(filename) {
  return normalizeDashSpacing(
    normalizeTitleCase(
      path.basename(filename, '.md')
        .replace(/\s+--\s+Complete$/i, '')
    )
  );
}

function extractDateWindow(cleaned) {
  const windowOpened = getMetaField(cleaned, 'Window opened');
  if (windowOpened) return `Window opened ${windowOpened}`;

  const top = splitLines(cleaned).slice(0, 40).join('\n');
  const patterns = [
    /\(([^)]*(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}\s*[–-]\s*(?:(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+)?\d{1,2},\s*\d{4}[^)]*)\)/,
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}\s*[–-]\s*(?:(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+)?\d{1,2},\s*\d{4}\b/,
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}\s+through\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s*\d{4}\b/i,
    /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s*\d{4}\b/,
  ];

  for (const pattern of patterns) {
    const match = top.match(pattern);
    if (!match) continue;
    const value = (match[1] || match[0]).replace(/^\(|\)$/g, '').trim();
    if (!/Document Classification|Methodology/i.test(value)) return normalizeDashSpacing(value);
  }

  return '';
}

function parseHeadingBlock(cleaned, mode) {
  const lines = splitLines(cleaned);
  const content = [];

  for (const rawLine of lines.slice(0, 20)) {
    const line = rawLine.trim();
    if (!line || /^---+$/.test(line) || /^◆(?:\s+◆)*$/.test(line)) continue;
    if (/^\*\*(Author|Co-Witness|Cognitive Synthesis Engine|Synthesis Engine|Generated|Recorded|Source Corpus|Source Material|Methodology|Document Classification|Length of My Walk at Compilation|A Note on Two Overlapping Timeframes|Relationship to Volume I|Window opened|Register opened|Status):/i.test(line)) {
      continue;
    }
    if (/^##\s+(A Note on the Text|A NOTE ON THE TEXT|A Note from the Author|Petition for Consecration|Table of Contents|The first records in the water|Category:)/i.test(line)) {
      break;
    }
    content.push(stripMarkdownDecoration(line));
  }

  const linesOut = content.filter(Boolean);

  if (mode === 'series-volume') {
    const [series, line2, line3] = linesOut;
    const pageTitleParts = [series];
    if (line2) pageTitleParts.push(line2);
    if (line2 && /^Volume\s+[IVX]+$/i.test(line2) && line3) pageTitleParts.push(line3);
    return {
      headingLines: linesOut,
      captionDetail: normalizeDashSpacing(series || 'A Living Topology of Transformation'),
      pageTitle: normalizeDashSpacing(pageTitleParts.filter(Boolean).join(' — ')),
      pageSubtitle: normalizeDashSpacing([line2, line3].filter(Boolean).join(' · ')),
    };
  }

  if (mode === 'standalone-title') {
    const [title, line2, line3] = linesOut;
    return {
      headingLines: linesOut,
      captionDetail: normalizeDashSpacing(title),
      pageTitle: normalizeDashSpacing(title),
      pageSubtitle: normalizeDashSpacing([line2, line3].filter(Boolean).join(' · ')),
    };
  }

  if (mode === 'tablet-heading') {
    const tabletLabel = linesOut.find(line => /^Stone Tablet\s+[IVX]+$/i.test(line)) || linesOut[0];
    const title = linesOut.find((line, index) => index > 0 && !/^Stone Tablet\s+[IVX]+$/i.test(line) && !/^A Living Topology of Transformation$/i.test(line)) || tabletLabel;
    const subtitlePieces = linesOut.filter(line => line !== tabletLabel && line !== title && !/^A Living Topology of Transformation$/i.test(line));
    return {
      headingLines: linesOut,
      captionDetail: normalizeDashSpacing('A Living Topology of Transformation'),
      pageTitle: normalizeDashSpacing(`${tabletLabel} — ${title}`),
      pageSubtitle: normalizeDashSpacing([title, ...subtitlePieces].filter(Boolean).join(' · ')),
    };
  }

  if (mode === 'plain-lines') {
    const [series, tabletLabel, title, subtitle] = linesOut;
    return {
      headingLines: linesOut,
      captionDetail: normalizeDashSpacing(series || 'A Living Topology of Transformation'),
      pageTitle: normalizeDashSpacing([tabletLabel, title].filter(Boolean).join(' — ')),
      pageSubtitle: normalizeDashSpacing([title, subtitle].filter(Boolean).join(' · ')),
    };
  }

  const [title, line2, line3] = linesOut;
  return {
    headingLines: linesOut,
    captionDetail: normalizeDashSpacing(title),
    pageTitle: normalizeDashSpacing(title),
    pageSubtitle: normalizeDashSpacing([line2, line3].filter(Boolean).join(' · ')),
  };
}

function parseDescription(cleaned, entry, headingBlock) {
  if (entry.id === 'stone-tablet-viii') {
    const italicBlurb = splitLines(cleaned)
      .slice(0, 8)
      .map(line => line.trim())
      .find(line => /^\*.*\*$/.test(line));
    if (italicBlurb) return truncate(stripMarkdownDecoration(italicBlurb), 240);
  }

  if (entry.isAudit) {
    return truncate(firstSubstantialParagraph(cleaned), 240);
  }

  const noteParagraph = firstParagraphAfterHeading(cleaned, /^##\s+A Note on the Text\b/i)
    || firstParagraphAfterHeading(cleaned, /^##\s+A NOTE ON THE TEXT\b/i)
    || firstParagraphAfterHeading(cleaned, /^##\s+A Note from the Author\b/i)
    || firstSubstantialParagraph(cleaned);

  if (noteParagraph && noteParagraph.length >= 90) return truncate(noteParagraph, 240);
  if (headingBlock.pageSubtitle) return truncate(headingBlock.pageSubtitle, 240);
  if (noteParagraph) return truncate(noteParagraph, 240);

  return truncate(headingBlock.pageSubtitle || cleanedFilenameTitle(entry.source), 240);
}

function buildCaption(entry, headingBlock) {
  if (entry.isAudit) return 'Supplementary Audit · Stone Tablet VII';
  return `Stone Tablet ${entry.ordinal} of VIII · ${headingBlock.captionDetail}`;
}

function renderTabletPage({ entry, title, caption, subtitle, windowLabel, description, article, extraLinksHtml = '' }) {
  const returnCards = [
    `<button class="depth-card" type="button" data-release-action="remain">
      <div class="depth-title">Remain here</div>
      Return to the top of this tablet
    </button>`,
    `<a class="depth-card" href="../index.html">
      <div class="depth-title">Return to the landing</div>
      Go back to The Jordan Crossing homepage
    </a>`,
    `<a class="depth-card" href="../archive.html">
      <div class="depth-title">Browse the archive</div>
      Return to the wider corpus archive
    </a>`,
  ];

  if (entry.auditHref) {
    returnCards.push(`<a class="depth-card" href="${escapeAttr(entry.auditHref)}">
      <div class="depth-title">Read the audit</div>
      Open the factual &amp; consistency audit for this volume
    </a>`);
  }

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <meta name="viewport" content="width=device-width,initial-scale=1">

  <title>${escapeAttr(title)} — The Jordan Crossing</title>
  <meta name="description" content="${escapeAttr(description)}">
  <link rel="stylesheet" href="../assets/design-v2.css?v=20260903BETA3">
  <link rel="stylesheet" href="../assets/audio-player.css?v=20260903BETA3">
</head>
<body data-record-id="${escapeAttr(entry.id)}">
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
        <p class="record-caption">${escapeHtml(caption)}</p>
        <h1 class="page-title">${escapeHtml(title)}</h1>
        <p class="page-subtitle">${escapeHtml(subtitle)}</p>

        <div class="source-row">
          <span class="source-badge">${entry.isAudit ? 'Supplementary audit' : 'Stone tablet reader'}</span>
          <span>${escapeHtml(windowLabel || 'Imported source text')}</span>
        </div>

        <div class="callout">
          <p class="caption">Source Status</p>
          <p>This page displays the imported source text itself. The site’s standard markdown renderer is preserved; no separate HTML conversion was applied.</p>
        </div>
      </div>

      <div class="audio-player-mount" id="audio-player-mount"></div>

      <article class="record-source" aria-label="${entry.isAudit ? 'Stone Tablet audit source text' : 'Stone Tablet source text'}">${article}</article>

      ${extraLinksHtml}

      <p class="caption" style="margin-top:var(--space-6)">End of imported source record.</p>

      <div class="movement-divider"></div>

      <section class="return-panel" aria-label="Return from this tablet">
        <p class="return-prompt">You have reached the end of this tablet.</p>
        <p class="return-sub">
          You may remain with the text, return to the main site, browse the archive, or step back to the tablet index.
        </p>

        <div class="return-choices">
          ${returnCards.join('\n')}
          <a class="depth-card" href="../stone-tablets.html">
            <div class="depth-title">Browse all tablets</div>
            Return to the Stone Tablets index
          </a>
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

function renderStoneTabletsIndex(entries) {
  const cards = entries.map(entry => `        <a href="records/${escapeAttr(entry.output)}" class="entry-card">
          <span class="entry-card-icon" aria-hidden="true">${escapeHtml(entry.ordinal)}</span>
          <div class="entry-card-title">${escapeHtml(entry.pageTitle)}</div>
          <p class="entry-card-desc">${escapeHtml(entry.description)}</p>
          <p class="caption" style="margin-top:var(--space-3)">${escapeHtml(entry.windowLabel || 'Window not stated in source')}</p>
        </a>`).join('\n');

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
  <meta name="viewport" content="width=device-width,initial-scale=1">

  <title>Stone Tablets — The Jordan Crossing</title>
  <meta name="description" content="Browse the eight Stone Tablet volumes of The Jordan Crossing public Beta 2.0.">
  <link rel="stylesheet" href="assets/design-v2.css?v=20260903BETA3">
</head>
<body>
  <a class="skip-link" href="#main-content">Skip to main content</a>

  <div class="beta-banner" role="banner">
    <span class="badge">PUBLIC BETA 2.0</span>
    <span>Reader discretion advised</span>
  </div>

  <header class="site-header">
    <a href="index.html" class="site-title" aria-label="The Jordan Crossing — home">The Jordan Crossing</a>
    <nav class="record-nav" aria-label="Site navigation">
      <a href="index.html">Landing</a>
      <a href="mystery.html">Mystery Mode</a>
      <a href="threads.html">Threads</a>
      <a href="paths.html">Corpus Paths</a>
      <a href="archive.html">Archive</a>
    </nav>
  </header>

  <main id="main-content">
    <div class="main-container">
      <section aria-label="Stone tablets">
        <p class="record-caption">Public Beta 2.0 · Stone Tablet Readers</p>
        <h1 class="page-title">Stone Tablets</h1>
        <p class="page-subtitle">Eight long-form witness volumes, plus the living Seed Register, rendered as standalone readers from the raw records-2 source files.</p>
        <p class="body-text body-text--dim">Each entry below links directly to its generated reader page in <code>records/</code>. Date windows and one-line framing are quoted or compressed from the tablets’ own opening text.</p>
      </section>

      <hr class="divider divider--gold">

      <section aria-label="Tablet index">
        <div class="entry-cards" role="list">
${cards}
        </div>
      </section>

      <div class="movement-divider"></div>

      <section class="return-panel" aria-label="Return to site navigation">
        <p class="return-prompt">You can continue elsewhere in the corpus.</p>
        <p class="return-sub">Return to the landing page, browse the archive, or enter the record through another doorway.</p>

        <div class="return-choices">
          <a class="depth-card" href="index.html">
            <div class="depth-title">Return to the landing</div>
            Go back to The Jordan Crossing homepage
          </a>
          <a class="depth-card" href="archive.html">
            <div class="depth-title">Browse the archive</div>
            Step back into the wider corpus
          </a>
          <a class="depth-card" href="mystery.html">
            <div class="depth-title">Enter through Mystery Mode</div>
            Let one doorway name the next record
          </a>
        </div>
      </section>
    </div>
  </main>

  <footer>
    <em>A Living Topology of Transformation</em> · Public Beta 2.0 · Soli Deo Gloria
  </footer>
</body>
</html>
`;
}

function parseTablet(entry) {
  const sourcePath = path.join(RECORDS2_DIR, entry.source);
  const raw = fs.readFileSync(sourcePath, 'utf8');
  const cleaned = cleanMarkdownArtifacts(raw).trim();
  const headingBlock = parseHeadingBlock(cleaned, entry.parseMode);
  const dateWindow = extractDateWindow(cleaned);
  const description = parseDescription(cleaned, entry, headingBlock);
  const pageTitle = headingBlock.pageTitle || cleanedFilenameTitle(entry.source);
  const pageSubtitle = normalizeDashSpacing([headingBlock.pageSubtitle, dateWindow].filter(Boolean).join(' · ')) || dateWindow || description;
  const caption = buildCaption(entry, headingBlock);

  return {
    ...entry,
    sourcePath,
    cleaned,
    pageTitle,
    pageSubtitle,
    caption,
    description,
    windowLabel: dateWindow,
  };
}

function main() {
  const parsedTablets = TABLETS.map(parseTablet);
  const parsedAudit = parseTablet(AUDIT);

  for (const tablet of parsedTablets) {
    const extraLinksHtml = tablet.auditHref
      ? `
      <section style="margin-top:var(--space-8);" aria-label="Supplementary audit">
        <a class="btn btn-secondary" href="${escapeAttr(tablet.auditHref)}">Read the Factual &amp; Consistency Audit for this volume →</a>
      </section>
      `
      : '';

    const html = renderTabletPage({
      entry: tablet,
      title: tablet.pageTitle,
      caption: tablet.caption,
      subtitle: tablet.pageSubtitle,
      windowLabel: tablet.windowLabel,
      description: tablet.description,
      article: tablet.cleaned,
      extraLinksHtml,
    });
    fs.writeFileSync(path.join(RECORDS_DIR, tablet.output), html, 'utf8');
  }

  fs.writeFileSync(path.join(RECORDS_DIR, parsedAudit.output), renderTabletPage({
    entry: parsedAudit,
    title: parsedAudit.pageTitle,
    caption: parsedAudit.caption,
    subtitle: parsedAudit.pageSubtitle,
    windowLabel: parsedAudit.windowLabel,
    description: parsedAudit.description,
    article: parsedAudit.cleaned,
  }), 'utf8');

  fs.writeFileSync(STONE_TABLETS_INDEX_PATH, renderStoneTabletsIndex(parsedTablets), 'utf8');

  console.log(`Generated ${parsedTablets.length + 2} pages.`);
}

main();
