/* ═══════════════════════════════════════════════════════════════════
   The Jordan Crossing — Design v2 Logic
   Interactive behaviors for the four movements
   ═════════════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  const RECORD_ID = document.body.dataset.recordId || 'unknown';

  function escapeHtml(value) {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function renderInlineMarkdown(value) {
    let html = escapeHtml(value);
    const code = [];

    html = html.replace(/`([^`]+)`/g, (_, content) => {
      code.push(`<code>${content}</code>`);
      return `\u0000${code.length - 1}\u0000`;
    });
    html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, '<a href="$2" rel="noreferrer">$1</a>');
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    html = html.replace(/(?<!\w)\*([^*]+)\*(?!\w)/g, '<em>$1</em>');
    html = html.replace(/(?<!\w)_([^_]+)_(?!\w)/g, '<em>$1</em>');

    return html.replace(/\u0000(\d+)\u0000/g, (_, index) => code[Number(index)]);
  }

  function slugifyHeading(text) {
    return text
      .toLowerCase()
      .replace(/[\u{1F300}-\u{1FAFF}\u2600-\u27BF]/gu, '') // strip emoji (headings use them decoratively, e.g. "⚡ Opening Observation")
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  function renderRecordMarkdown() {
    const article = document.querySelector('.record-source');
    if (!article || article.dataset.markdownRendered === 'true') return;

    const lines = article.textContent.replace(/\r\n?/g, '\n').split('\n');
    const output = [];
    let paragraph = [];
    let list = null;
    let quote = [];

    const flushParagraph = () => {
      if (paragraph.length) {
        output.push(`<p>${renderInlineMarkdown(paragraph.join(' '))}</p>`);
        paragraph = [];
      }
    };
    const flushList = () => {
      if (list) {
        output.push(`<${list.type}>${list.items.map(item => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</${list.type}>`);
        list = null;
      }
    };
    const flushQuote = () => {
      if (quote.length) {
        output.push(`<blockquote><p>${quote.map(renderInlineMarkdown).join('<br>')}</p></blockquote>`);
        quote = [];
      }
    };

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index].trim();
      const nextLine = lines[index + 1] ? lines[index + 1].trim() : '';

      if (!line) {
        flushParagraph();
        flushList();
        flushQuote();
        continue;
      }

      const heading = line.match(/^(#{1,6})\s+(.+)$/);
      if (heading) {
        flushParagraph();
        flushList();
        flushQuote();
        // Slug id lets in-page navigation (the "What did you actually
        // encounter?" response links) jump directly to a real section of
        // THIS record's own source text — e.g. its Scripture References —
        // rather than only revealing static commentary text.
        const slug = slugifyHeading(heading[2]);
        const idAttr = slug ? ` id="h-${slug}"` : '';
        output.push(`<h${heading[1].length}${idAttr}>${renderInlineMarkdown(heading[2])}</h${heading[1].length}>`);
        continue;
      }

      if (/^([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
        flushParagraph();
        flushList();
        flushQuote();
        output.push('<hr>');
        continue;
      }

      if (line.startsWith('|') && nextLine.startsWith('|') && /^\|?[\s:|-]+\|[\s:|-]*\|?$/.test(nextLine)) {
        flushParagraph();
        flushList();
        flushQuote();
        const headers = line.split('|').slice(1, -1).map(cell => `<th>${renderInlineMarkdown(cell.trim())}</th>`).join('');
        const rows = [];
        index += 2;
        while (index < lines.length && lines[index].trim().startsWith('|')) {
          const cells = lines[index].trim().split('|').slice(1, -1)
            .map(cell => `<td>${renderInlineMarkdown(cell.trim())}</td>`).join('');
          rows.push(`<tr>${cells}</tr>`);
          index += 1;
        }
        index -= 1;
        output.push(`<table><thead><tr>${headers}</tr></thead><tbody>${rows.join('')}</tbody></table>`);
        continue;
      }

      const unordered = line.match(/^[-*+]\s+(.+)$/);
      const ordered = line.match(/^\d+\.\s+(.+)$/);
      if (unordered || ordered) {
        flushParagraph();
        flushQuote();
        const type = unordered ? 'ul' : 'ol';
        if (!list || list.type !== type) {
          flushList();
          list = { type, items: [] };
        }
        list.items.push((unordered || ordered)[1]);
        continue;
      }

      if (line.startsWith('>')) {
        flushParagraph();
        flushList();
        quote.push(line.replace(/^>\s?/, ''));
        continue;
      }

      flushList();
      flushQuote();
      paragraph.push(line);
      flushParagraph();
    }

    flushParagraph();
    flushList();
    flushQuote();
    article.innerHTML = output.join('');
    article.dataset.markdownRendered = 'true';
  }

  // ═══════════════════════════════════════════════════════════════════
  // MOVEMENT 1: DISCERN — Response panel toggling
  //
  // Per the original design (JORDAN_CROSSING_MYSTERY_MODE_AND_PUBLIC_
  // WITNESS_DESIGN.md §"Discern"): these three responses are meant to
  // function as NAVIGATION, not just static reveal text — e.g. choosing
  // "I'm not sure yet" (this build's version of the design doc's "I did
  // not understand") should be able to actually offer definitions/
  // Scripture, the surrounding sequence, and the source transcript; "I
  // want to resist this" ("I disagree") should offer a way to inspect the
  // record more closely. Below, each reveal panel gets real navigation
  // links built from content ALREADY present on this exact page (a
  // Scripture References heading inside the article, if this record has
  // one; the Record Sequence / Related Records / Reviewed Thread
  // Connections mounts; the ?mode=original no-interpretation view) —
  // never a fabricated link to something not actually on the page.
  // ═════════════════════════════════════════════════════════════════════

  function findHeadingId(keywords) {
    const headings = document.querySelectorAll('.record-source h1, .record-source h2, .record-source h3');
    for (const h of headings) {
      const text = h.textContent.toLowerCase();
      if (keywords.some(k => text.includes(k))) return h.id || null;
    }
    return null;
  }

  function discernNavLink(href, label) {
    return `<a class="discern-nav-link" href="${href}">${label}</a>`;
  }

  function buildDiscernNavLinks(kind) {
    const links = [];
    const scriptureId = findHeadingId(['scripture']);
    // Check for actual populated content, not just the (always-present)
    // mount element itself — several of these mounts are legitimately
    // left empty for records with nothing to show (e.g. zero Related
    // Records), and linking to an empty section would be a dead end.
    const hasRelated = !!document.querySelector('#related-records-mount')?.textContent.trim();
    const hasThreads = !!document.querySelector('#threads-mount')?.textContent.trim();
    const hasSequence = !!document.querySelector('#graph-nav-mount')?.textContent.trim();
    // window.location.pathname never contains "?" — any existing query
    // string lives in window.location.search — so this record page's own
    // URL plus "?mode=original" (or "&mode=original" if it already has a
    // query string) always lands on its own no-interpretation route.
    const existingQuery = window.location.search.replace(/^\?/, '');
    const originalHref = `${window.location.pathname}?${existingQuery ? existingQuery + '&' : ''}mode=original`;

    if (kind === 'recognized') {
      // Recognized something real — offer to go deeper, following the
      // corpus's own labeled connections rather than staying put.
      if (hasThreads) links.push(discernNavLink('#threads-mount', 'Follow the thread →'));
      if (hasRelated) links.push(discernNavLink('#related-records-mount', 'See related records →'));
    } else if (kind === 'uncertain') {
      // "I did not understand," in the design doc's language — offer
      // definitions/Scripture, the surrounding sequence, and the source.
      if (scriptureId) links.push(discernNavLink(`#${scriptureId}`, 'Read the Scripture referenced →'));
      if (hasSequence) links.push(discernNavLink('#graph-nav-mount', 'See the surrounding sequence →'));
      links.push(discernNavLink(originalHref, 'Read the source transcript →'));
    } else if (kind === 'resisted') {
      // "I disagree" — the site permits refusal, but offers a way to
      // inspect the record more closely rather than just being dismissed.
      links.push(discernNavLink(originalHref, 'Inspect the source transcript →'));
      if (scriptureId) links.push(discernNavLink(`#${scriptureId}`, 'Read the Scripture referenced →'));
    }
    return links.length ? `<div class="discern-nav-links">${links.join('')}</div>` : '';
  }

  function initDiscernChoices() {
    const choices = document.querySelectorAll('.discern-choice');
    const revealKindMap = {
      'discern-recognized': 'recognized',
      'discern-uncertain': 'uncertain',
      'discern-resisted': 'resisted',
    };

    // Build each reveal panel's real navigation links once, up front —
    // not deferred to first click — so they're available immediately.
    Object.keys(revealKindMap).forEach(revealId => {
      const reveal = document.getElementById(revealId);
      if (!reveal || reveal.dataset.navBuilt === 'true') return;
      const navHtml = buildDiscernNavLinks(revealKindMap[revealId]);
      if (navHtml) reveal.insertAdjacentHTML('beforeend', navHtml);
      reveal.dataset.navBuilt = 'true';
    });

    choices.forEach(btn => {
      btn.addEventListener('click', () => {
        const revealed = btn.dataset.reveals;
        const allChoices = document.querySelectorAll('.discern-choice');
        // A real bug: the record-page template (build-records2-corpus.mjs)
        // emits each reveal panel as `<div class="discern-reveal" hidden>`
        // — this code was querying the wrong class (`.discern-response`,
        // toggling a CSS `.active` class that had no matching element to
        // ever apply to) and so silently did nothing when clicked on every
        // one of the 456 record pages.
        const allReveals = document.querySelectorAll('.discern-reveal');

        // Deselect all
        allChoices.forEach(c => c.setAttribute('aria-pressed', 'false'));
        allReveals.forEach(r => { r.hidden = true; });

        // Select this one
        btn.setAttribute('aria-pressed', 'true');
        const reveal = document.getElementById(revealed);
        if (reveal) {
          reveal.hidden = false;
          // Scroll to response
          reveal.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // MOVEMENT 3: RETURN — Button actions and page navigation
  // ═════════════════════════════════════════════════════════════════════

  function initReturnChoices() {
    // Remain here
    const remainBtn = document.querySelector('[data-release-action="remain"]');
    if (remainBtn) {
      remainBtn.addEventListener('click', () => {
        document.querySelector('.record-header').scrollIntoView({ behavior: 'smooth' });
      });
    }

    // Leave and return later
    const leaveBtn = document.querySelector('[data-release-action="leave"]');
    if (leaveBtn) {
      leaveBtn.addEventListener('click', () => {
        // Optional: close the tab or go to a landing page
        // For now, just scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // AUDIO PLAYER — Phase 3. Renders only if the record's JC_RECORDS entry
  // carries an audioUrl. As of this writing no record has one — the six
  // Cross-Reference passes and the raw meditation corpus are text-only —
  // so this mounts nothing on any current page. Wired ahead of time so a
  // future audioUrl is a one-line data change, not new engineering.
  // ═════════════════════════════════════════════════════════════════════

  function initAudioPlayer() {
    const mount = document.getElementById('audio-player-mount');
    if (!mount || typeof JC_RECORDS === 'undefined' || typeof window.JordanCrossingAudio === 'undefined') return;

    const shortId = (typeof jcShortId === 'function') ? jcShortId(RECORD_ID) : RECORD_ID;
    const record = JC_RECORDS.find(r => r.id === shortId);
    if (!record || !record.audioUrl) return;

    window.JordanCrossingAudio.mountAudioPlayer(mount, {
      audioUrl: record.audioUrl,
      captionsUrl: record.captionsUrl || null,
      title: record.title,
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // MOVEMENT 4: GRAPH NAV — Chronological nav (if records-data available)
  // ═════════════════════════════════════════════════════════════════════

  function initGraphNav() {
    const mount = document.getElementById('graph-nav-mount');
    if (!mount || typeof JC_RECORDS === 'undefined') return;

    const shortId = (typeof jcShortId === 'function') ? jcShortId(RECORD_ID) : RECORD_ID;
    const { prev, next } = jcGetPrevNext(shortId);
    if (!prev && !next) return;

    let html = '<h3 class="graph-nav-heading">Record Sequence</h3>';
    html += '<div class="graph-nav-links">';

    if (prev) {
      const href = jcHrefFromRecord(prev.id);
      html += `
        <a href="${href}" class="nav-link">
          <span class="nav-link-label">← Previous</span>
          <span class="nav-link-title">${prev.title}</span>
          <span class="nav-link-meta">${prev.dateLabel}</span>
        </a>
      `;
    } else {
      html += '<div style="flex-grow:1;"></div>';
    }

    if (next) {
      const href = jcHrefFromRecord(next.id);
      html += `
        <a href="${href}" class="nav-link">
          <span class="nav-link-label">Next →</span>
          <span class="nav-link-title">${next.title}</span>
          <span class="nav-link-meta">${next.dateLabel}</span>
        </a>
      `;
    }

    html += '</div>';
    mount.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════════════════════
  // THREAD CONNECTIONS — labeled bridges from assets/records-data.js
  // ═════════════════════════════════════════════════════════════════════

  function initThreadConnections() {
    const mount = document.getElementById('threads-mount');
    if (!mount || typeof JC_EDGES === 'undefined') return;

    const shortId = (typeof jcShortId === 'function') ? jcShortId(RECORD_ID) : RECORD_ID;
    const { outgoing, incoming } = jcGetEdgesFor(shortId);
    const edges = [
      ...outgoing.map(e => ({ ...e, direction: 'out' })),
      ...incoming.map(e => ({ ...e, direction: 'in' })),
    ];
    if (!edges.length) return;

    // The mount element itself already carries the .reviewed-threads class
    // (spacing/border styling) in every record page's static template —
    // do NOT wrap this injected content in another element with the same
    // class, or the margin/padding/border-top apply twice (a real,
    // previously-unnoticed double-spacing bug fixed alongside the
    // Corpus Lattice edge rebuild).
    let html = '<h2 class="reviewed-threads-heading">Reviewed thread connections</h2>';
    html += '<ul class="thread-list">';

    edges.forEach(edge => {
      const otherId = edge.direction === 'out' ? edge.to : edge.from;
      const label = edge.direction === 'out'
        ? (EDGE_LABELS[edge.type] || edge.type)
        : (EDGE_LABELS_INCOMING[edge.type] || `is ${edge.type} by`);
      const targetHref = jcHrefFromRecord(otherId);
      const targetTitle = jcTitleFor(otherId);
      // Phase 14: the real structural classification (Doctrinal Spine /
      // Thread Joint / Lexicon Joint / Chiastic Mirror), extracted from the
      // meditation's own Cross-Reference Appendix — replaces the old flat
      // "verified" badge shown on every single edge regardless of kind.
      const jointType = edge.jointType || 'cross-reference';
      const jointLabel = (typeof JOINT_TYPE_LABELS !== 'undefined' && JOINT_TYPE_LABELS[jointType]) || jointType;
      const badgeClass = jointType.startsWith('doctrinal-spine') ? 'thread-status--spine'
        : jointType === 'lexicon-joint' ? 'thread-status--lexicon'
        : jointType === 'chiastic-mirror' ? 'thread-status--mirror'
        : 'thread-status--confirmed';

      html += `
        <li class="thread-item">
          <div class="thread-edge">
            <span class="thread-status ${badgeClass}">${jointLabel}</span>
            <span>${label}</span>
            <a href="${targetHref}">${targetTitle}</a>
          </div>
          ${edge.note ? `<p class="thread-note">${edge.note}</p>` : ''}
        </li>
      `;
    });

    html += '</ul>';
    mount.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════════════════════
  // DOCTRINAL SPINE — Seed → Growth → Tablet arc (Phase 14). Rendered only
  // when the record's own Cross-Reference Appendix names one; a record
  // without this section in its source appendix (roughly half the corpus
  // — see build-records2-corpus.mjs's parseAppendixLinks header note)
  // simply shows nothing here, never a fabricated arc.
  // ═════════════════════════════════════════════════════════════════════

  function initDoctrinalSpine() {
    const mount = document.getElementById('doctrinal-spine-mount');
    if (!mount || typeof JC_RECORDS === 'undefined') return;

    const shortId = (typeof jcShortId === 'function') ? jcShortId(RECORD_ID) : RECORD_ID;
    const rec = JC_RECORDS.find(r => r.id === shortId);
    if (!rec || !rec.doctrinalSpine) return;
    const { seed, growth, tablet } = rec.doctrinalSpine;
    if (!seed && !growth && !tablet) return;

    const step = (data, stepLabel) => {
      if (!data) return '';
      const title = data.recordId ? jcTitleFor(data.recordId) : (data.label || stepLabel);
      const inner = data.recordId
        ? `<a href="${jcHrefFromRecord(data.recordId)}">${title}</a>`
        : `<span>${title}</span>`;
      return `
        <div class="spine-step">
          <span class="spine-step-label">${stepLabel}</span>
          ${inner}
          ${data.gloss ? `<p class="spine-step-gloss">${data.gloss}</p>` : ''}
        </div>
      `;
    };

    mount.innerHTML = `
      <h3 class="doctrinal-spine-heading">Doctrinal Spine</h3>
      <div class="doctrinal-spine-arc">
        ${step(seed, 'Seed')}
        ${step(growth, 'Growth')}
        ${step(tablet, 'Tablet')}
      </div>
    `;
  }

  // ═══════════════════════════════════════════════════════════════════
  // LEXICON JOINTS + CHIASTIC MIRROR — small supplementary displays
  // (Phase 14), rendered only when the record's own appendix names them.
  // ═════════════════════════════════════════════════════════════════════

  function initLexiconChiasticMirror() {
    const mount = document.getElementById('lexicon-chiastic-mount');
    if (!mount || typeof JC_RECORDS === 'undefined') return;

    const shortId = (typeof jcShortId === 'function') ? jcShortId(RECORD_ID) : RECORD_ID;
    const rec = JC_RECORDS.find(r => r.id === shortId);
    if (!rec) return;
    const hasLexicon = rec.lexiconJoints && rec.lexiconJoints.length;
    const hasMirror = rec.chiasticMirror && rec.chiasticMirror.length;
    if (!hasLexicon && !hasMirror) return;

    let html = '';
    if (hasLexicon) {
      html += '<div class="lexicon-joints"><h3 class="lexicon-joints-heading">Lexicon Joints</h3><ul class="lexicon-joints-list">';
      rec.lexiconJoints.forEach(lj => {
        html += `<li><strong>${lj.term}</strong>${lj.gloss ? ` — ${lj.gloss}` : ''}</li>`;
      });
      html += '</ul></div>';
    }
    if (hasMirror) {
      html += '<div class="chiastic-mirror"><h3 class="chiastic-mirror-heading">Expanded Chiastic Mirror</h3><ul class="chiastic-mirror-list">';
      rec.chiasticMirror.forEach(cm => {
        html += `<li><span class="chiastic-position">${cm.position}</span>${cm.label ? ` <strong>${cm.label}</strong>` : ''}${cm.gloss ? ` — ${cm.gloss}` : ''}</li>`;
      });
      html += '</ul></div>';
    }
    mount.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════════════════════
  // HUMAN DOORWAYS — theme chips (design doc §7 "the human doorways"):
  // shame, waiting, fear, identity, surrender, obedience, grief,
  // fellowship, work, marriage, money, discipline. Chips link to Threads
  // filtered to that theme, so a reader can leave this record by the
  // life-question it touched rather than only by its reviewed edges.
  // ═════════════════════════════════════════════════════════════════════

  function initDoorwayThemes() {
    const mount = document.getElementById('doorway-themes-mount');
    if (!mount || typeof JC_RECORDS === 'undefined') return;

    const shortId = (typeof jcShortId === 'function') ? jcShortId(RECORD_ID) : RECORD_ID;
    const rec = JC_RECORDS.find(r => r.id === shortId);
    if (!rec || !rec.doorwayThemes || !rec.doorwayThemes.length) return;

    const chips = rec.doorwayThemes.map(theme =>
      `<a class="doorway-theme-chip" href="../threads.html?q=${encodeURIComponent(theme)}">${theme}</a>`
    ).join('');

    mount.innerHTML = `
      <h3 class="doorway-themes-heading">This record touches</h3>
      <div class="doorway-themes-list">${chips}</div>
    `;
  }

  // ═══════════════════════════════════════════════════════════════════
  // RELATED RECORDS — Thematically connected meditations
  // ═════════════════════════════════════════════════════════════════════

  function initRelatedRecords() {
    const mount = document.getElementById('related-records-mount');
    if (!mount || typeof jcGetRelatedRecords === 'undefined') return;

    const related = jcGetRelatedRecords(RECORD_ID, 3);
    if (!related.length) return;

    let html = '<div class="related-records-header">';
    html += '<h3>Related records</h3>';
    html += '</div>';
    html += '<div class="related-records-grid">';

    related.forEach(record => {
      // Use jcHrefFromRecord since we're on a record page
      const href = record.href.replace(/^records\//, '');
      html += `
        <a href="${href}" class="related-record-card">
          <div class="related-record-title">${record.title}</div>
          <div class="related-record-date">${record.dateLabel}</div>
        </a>
      `;
    });

    html += '</div>';
    mount.innerHTML = html;
  }

  // ═══════════════════════════════════════════════════════════════════
  // NO-INTERPRETATION ROUTE — ?mode=original
  // Removes recommendations, discernment prompts, and thread bridges,
  // leaving title, date, source status, and the original record content
  // itself. Per design doc §6.2.
  // ═════════════════════════════════════════════════════════════════════

  function applyNoInterpretationMode() {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') !== 'original') return;

    document.body.classList.add('no-interpretation-mode');

    const toHide = [
      '.discern-section',
      '#doctrinal-spine-mount',
      '#related-records-mount',
      '#threads-mount',
      '#doorway-themes-mount',
      '#lexicon-chiastic-mount',
      '.return-panel',
    ];
    toHide.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => { el.style.display = 'none'; });
    });
    // Hide the movement dividers that separated the now-hidden sections so
    // the original record reads as one continuous, uninterrupted page.
    document.querySelectorAll('.movement-divider').forEach(el => { el.style.display = 'none'; });

    const article = document.querySelector('.record-source');
    if (article) {
      const banner = document.createElement('div');
      banner.className = 'no-interpretation-banner';
      banner.innerHTML = `
        <p><strong>No-interpretation route.</strong> Recommendations, discernment prompts, and thread
        bridges are hidden. What remains is the title, date, source status, and the original record.</p>
        <a href="${window.location.pathname}">Show the full experience →</a>
      `;
      article.parentNode.insertBefore(banner, article);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // RETURNING READER — last-record continuity (design doc §11, "The
  // returning reader": last place read, no account, no surveillance).
  // Records only the current record's id + a timestamp, locally.
  // ═════════════════════════════════════════════════════════════════════

  const LAST_RECORD_KEY = 'jc_last_record';

  function trackLastRecord() {
    if (!RECORD_ID || RECORD_ID === 'unknown') return;
    try {
      localStorage.setItem(LAST_RECORD_KEY, JSON.stringify({ id: RECORD_ID, at: Date.now() }));
    } catch (e) { /* localStorage unavailable — fail silently, no functionality depends on it */ }
  }

  document.addEventListener('DOMContentLoaded', applyNoInterpretationMode);

  // ═══════════════════════════════════════════════════════════════════
  // INIT — Run on DOMContentLoaded
  // ═════════════════════════════════════════════════════════════════════

  document.addEventListener('DOMContentLoaded', () => {
    renderRecordMarkdown();
    initReturnChoices();
    initAudioPlayer();
    initGraphNav();
    initDoctrinalSpine();
    initRelatedRecords();
    initDoorwayThemes();
    initThreadConnections();
    initLexiconChiasticMirror();
    // Runs last: builds real navigation links for the "What did you
    // actually encounter?" responses (e.g. "Follow the thread", "See
    // related records"), which depend on the mounts above already being
    // populated so an empty section is never linked to.
    initDiscernChoices();
    trackLastRecord();
  });

})();
